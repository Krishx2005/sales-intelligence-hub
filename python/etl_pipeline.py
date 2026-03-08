"""
ETL pipeline for the Sales Intelligence Hub.
Loads Superstore CSV → cleans → SQLite + KPIs + RFM segmentation + churn scores.
"""

import pandas as pd
import numpy as np
import sqlite3
import os
import json
from datetime import datetime

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_PATH = os.path.join(DATA_DIR, "superstore.db")
CSV_PATH = os.path.join(DATA_DIR, "superstore.csv")
EXPORT_DIR = os.path.join(BASE_DIR, "exports")
POWERBI_DIR = os.path.join(EXPORT_DIR, "powerbi")
TABLEAU_DIR = os.path.join(EXPORT_DIR, "tableau")

# ── 1. Load & Clean ──────────────────────────────────────────────────────────
print("▸ Loading CSV...")
df = pd.read_csv(CSV_PATH, encoding="latin-1")

# Standardize column names
df.columns = [c.strip().replace(" ", "_").replace("-", "_") for c in df.columns]

# Parse dates
df["Order_Date"] = pd.to_datetime(df["Order_Date"], format="mixed")
df["Ship_Date"] = pd.to_datetime(df["Ship_Date"], format="mixed")

# Derived columns
df["Year"] = df["Order_Date"].dt.year
df["Month"] = df["Order_Date"].dt.month
df["Quarter"] = df["Order_Date"].dt.quarter
df["Year_Quarter"] = df["Year"].astype(str) + "-Q" + df["Quarter"].astype(str)
df["Year_Month"] = df["Order_Date"].dt.to_period("M").astype(str)
df["Profit_Margin"] = np.where(df["Sales"] > 0, df["Profit"] / df["Sales"], 0)
df["Revenue"] = df["Sales"]  # alias for clarity
df["Shipping_Days"] = (df["Ship_Date"] - df["Order_Date"]).dt.days

print(f"  ✓ {len(df):,} rows loaded, {df.shape[1]} columns")

# ── 2. Build SQLite Database ─────────────────────────────────────────────────
print("▸ Building SQLite database...")

if os.path.exists(DB_PATH):
    os.remove(DB_PATH)
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Customers table
customers = df[["Customer_ID", "Customer_Name", "Segment"]].drop_duplicates("Customer_ID")
cursor.execute("""
    CREATE TABLE customers (
        customer_id TEXT PRIMARY KEY,
        customer_name TEXT NOT NULL,
        segment TEXT NOT NULL
    )
""")
customers.rename(columns={"Customer_ID": "customer_id", "Customer_Name": "customer_name",
                           "Segment": "segment"}).to_sql("customers", conn, if_exists="replace", index=False)

# Products table
products = df[["Product_ID", "Category", "Sub_Category", "Product_Name"]].drop_duplicates("Product_ID")
cursor.execute("""
    CREATE TABLE products (
        product_id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        sub_category TEXT NOT NULL,
        product_name TEXT NOT NULL
    )
""")
products.rename(columns={"Product_ID": "product_id", "Category": "category",
                          "Sub_Category": "sub_category", "Product_Name": "product_name"
                          }).to_sql("products", conn, if_exists="replace", index=False)

# Orders table (fact table)
orders = df[["Row_ID", "Order_ID", "Order_Date", "Ship_Date", "Ship_Mode",
             "Customer_ID", "Product_ID", "Country", "City", "State",
             "Postal_Code", "Region", "Sales", "Quantity", "Discount",
             "Profit", "Profit_Margin", "Shipping_Days", "Year", "Month",
             "Quarter", "Year_Quarter", "Year_Month"]].copy()
orders.rename(columns={c: c.lower() for c in orders.columns}, inplace=True)
cursor.execute("""
    CREATE TABLE orders (
        row_id INTEGER PRIMARY KEY,
        order_id TEXT,
        order_date TEXT,
        ship_date TEXT,
        ship_mode TEXT,
        customer_id TEXT,
        product_id TEXT,
        country TEXT,
        city TEXT,
        state TEXT,
        postal_code INTEGER,
        region TEXT,
        sales REAL,
        quantity INTEGER,
        discount REAL,
        profit REAL,
        profit_margin REAL,
        shipping_days INTEGER,
        year INTEGER,
        month INTEGER,
        quarter INTEGER,
        year_quarter TEXT,
        year_month TEXT,
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
        FOREIGN KEY (product_id) REFERENCES products(product_id)
    )
""")
orders["order_date"] = orders["order_date"].astype(str)
orders["ship_date"] = orders["ship_date"].astype(str)
orders.to_sql("orders", conn, if_exists="replace", index=False)

conn.commit()
print(f"  ✓ Database created at {DB_PATH}")

# ── 3. KPI Calculations ─────────────────────────────────────────────────────
print("▸ Computing KPIs...")

total_revenue = df["Sales"].sum()
total_profit = df["Profit"].sum()
overall_margin = total_profit / total_revenue if total_revenue else 0
total_orders = df["Order_ID"].nunique()
total_customers = df["Customer_ID"].nunique()
avg_order_value = total_revenue / total_orders if total_orders else 0
avg_discount = df["Discount"].mean()

# Year-over-year growth
yearly_rev = df.groupby("Year")["Sales"].sum().sort_index()
yoy_growth = {}
years_list = sorted(yearly_rev.index)
for i in range(1, len(years_list)):
    prev = yearly_rev[years_list[i - 1]]
    curr = yearly_rev[years_list[i]]
    yoy_growth[int(years_list[i])] = round((curr - prev) / prev * 100, 2) if prev else 0

# Quarterly growth
qtr_rev = df.groupby("Year_Quarter")["Sales"].sum().sort_index()

kpis = {
    "total_revenue": round(total_revenue, 2),
    "total_profit": round(total_profit, 2),
    "profit_margin": round(overall_margin * 100, 2),
    "total_orders": int(total_orders),
    "total_customers": int(total_customers),
    "avg_order_value": round(avg_order_value, 2),
    "avg_discount": round(avg_discount * 100, 2),
    "yoy_growth": yoy_growth,
    "latest_growth_rate": list(yoy_growth.values())[-1] if yoy_growth else 0,
}

# Save KPIs as JSON for the API
kpi_path = os.path.join(DATA_DIR, "kpis.json")
with open(kpi_path, "w") as f:
    json.dump(kpis, f, indent=2)
print(f"  ✓ KPIs saved → {kpi_path}")

# ── 4. Sales Trends ─────────────────────────────────────────────────────────
print("▸ Computing sales trends...")

# By region + time
region_monthly = df.groupby(["Year_Month", "Region"]).agg(
    revenue=("Sales", "sum"),
    profit=("Profit", "sum"),
    orders=("Order_ID", "nunique")
).reset_index()

# By category + time
category_monthly = df.groupby(["Year_Month", "Category"]).agg(
    revenue=("Sales", "sum"),
    profit=("Profit", "sum"),
    orders=("Order_ID", "nunique")
).reset_index()

# By quarter
quarterly = df.groupby("Year_Quarter").agg(
    revenue=("Sales", "sum"),
    profit=("Profit", "sum"),
    orders=("Order_ID", "nunique"),
    customers=("Customer_ID", "nunique")
).reset_index()

# Save to DB
region_monthly.to_sql("sales_by_region_month", conn, if_exists="replace", index=False)
category_monthly.to_sql("sales_by_category_month", conn, if_exists="replace", index=False)
quarterly.to_sql("sales_quarterly", conn, if_exists="replace", index=False)

print("  ✓ Sales trends computed")

# ── 5. RFM Analysis & Customer Segmentation ─────────────────────────────────
print("▸ Running RFM analysis...")

reference_date = df["Order_Date"].max() + pd.Timedelta(days=1)

rfm = df.groupby("Customer_ID").agg(
    recency=("Order_Date", lambda x: (reference_date - x.max()).days),
    frequency=("Order_ID", "nunique"),
    monetary=("Sales", "sum"),
    avg_order_value=("Sales", "mean"),
    total_profit=("Profit", "sum"),
    first_purchase=("Order_Date", "min"),
    last_purchase=("Order_Date", "max"),
    total_quantity=("Quantity", "sum"),
).reset_index()

# Score each dimension 1-5
rfm["r_score"] = pd.qcut(rfm["recency"], 5, labels=[5, 4, 3, 2, 1]).astype(int)
rfm["f_score"] = pd.qcut(rfm["frequency"].rank(method="first"), 5, labels=[1, 2, 3, 4, 5]).astype(int)
rfm["m_score"] = pd.qcut(rfm["monetary"].rank(method="first"), 5, labels=[1, 2, 3, 4, 5]).astype(int)
rfm["rfm_score"] = rfm["r_score"] + rfm["f_score"] + rfm["m_score"]

# Segment labels
def segment_label(row):
    r, f, m = row["r_score"], row["f_score"], row["m_score"]
    if r >= 4 and f >= 4 and m >= 4:
        return "Champions"
    elif r >= 3 and f >= 3 and m >= 3:
        return "Loyal Customers"
    elif r >= 4 and f <= 2:
        return "New Customers"
    elif r >= 3 and f >= 2 and m >= 2:
        return "Potential Loyalists"
    elif r <= 2 and f >= 3 and m >= 3:
        return "At Risk"
    elif r <= 2 and f >= 4:
        return "Can't Lose Them"
    elif r <= 2 and f <= 2:
        return "Lost"
    elif r == 3 and f <= 2:
        return "About to Sleep"
    else:
        return "Need Attention"

rfm["segment"] = rfm.apply(segment_label, axis=1)

# Churn risk score (0-100, higher = more likely to churn)
# Based on recency (50%), frequency inverse (30%), monetary inverse (20%)
rfm["churn_risk"] = (
    (1 - (rfm["r_score"] - 1) / 4) * 50 +
    (1 - (rfm["f_score"] - 1) / 4) * 30 +
    (1 - (rfm["m_score"] - 1) / 4) * 20
).round(1)

rfm["churn_category"] = pd.cut(rfm["churn_risk"], bins=[0, 30, 60, 100],
                                labels=["Low", "Medium", "High"])

# Merge customer names
rfm = rfm.merge(customers.rename(columns={"Customer_ID": "Customer_ID",
                                            "Customer_Name": "customer_name",
                                            "Segment": "business_segment"}),
                 on="Customer_ID")

rfm["first_purchase"] = rfm["first_purchase"].astype(str)
rfm["last_purchase"] = rfm["last_purchase"].astype(str)

rfm.to_sql("customer_rfm", conn, if_exists="replace", index=False)
print(f"  ✓ {len(rfm)} customers segmented")

# ── 6. Regional Performance ─────────────────────────────────────────────────
print("▸ Computing regional performance...")

region_perf = df.groupby("Region").agg(
    revenue=("Sales", "sum"),
    profit=("Profit", "sum"),
    orders=("Order_ID", "nunique"),
    customers=("Customer_ID", "nunique"),
    avg_discount=("Discount", "mean"),
    avg_profit_margin=("Profit_Margin", "mean"),
).reset_index()

state_perf = df.groupby(["Region", "State"]).agg(
    revenue=("Sales", "sum"),
    profit=("Profit", "sum"),
    orders=("Order_ID", "nunique"),
).reset_index()

region_perf.to_sql("region_performance", conn, if_exists="replace", index=False)
state_perf.to_sql("state_performance", conn, if_exists="replace", index=False)

# ── 7. Category Performance ─────────────────────────────────────────────────
print("▸ Computing category performance...")

cat_perf = df.groupby(["Category", "Sub_Category"]).agg(
    revenue=("Sales", "sum"),
    profit=("Profit", "sum"),
    orders=("Order_ID", "nunique"),
    avg_discount=("Discount", "mean"),
    profit_margin=("Profit_Margin", "mean"),
).reset_index()

cat_perf.to_sql("category_performance", conn, if_exists="replace", index=False)

# ── 8. Export CSVs for BI Tools ──────────────────────────────────────────────
print("▸ Exporting CSVs for Power BI and Tableau...")

# Power BI export — flat denormalized table with all measures
powerbi_df = df.merge(rfm[["Customer_ID", "segment", "churn_risk", "churn_category",
                            "rfm_score", "r_score", "f_score", "m_score"]],
                       on="Customer_ID", how="left")
powerbi_df.to_csv(os.path.join(POWERBI_DIR, "superstore_powerbi.csv"), index=False)

# Tableau export — separate dimension and fact tables
tableau_orders = df[["Row_ID", "Order_ID", "Order_Date", "Ship_Date", "Ship_Mode",
                      "Customer_ID", "Product_ID", "Region", "State", "City",
                      "Sales", "Quantity", "Discount", "Profit", "Profit_Margin",
                      "Year", "Quarter", "Year_Month"]].copy()
tableau_orders.to_csv(os.path.join(TABLEAU_DIR, "superstore_orders.csv"), index=False)

tableau_customers = rfm[["Customer_ID", "customer_name", "business_segment", "segment",
                          "recency", "frequency", "monetary", "rfm_score",
                          "churn_risk", "churn_category"]].copy()
tableau_customers.to_csv(os.path.join(TABLEAU_DIR, "superstore_customers.csv"), index=False)

tableau_products = products.copy()
tableau_products.to_csv(os.path.join(TABLEAU_DIR, "superstore_products.csv"), index=False)

print(f"  ✓ Power BI CSV → {POWERBI_DIR}")
print(f"  ✓ Tableau CSVs → {TABLEAU_DIR}")

# ── 9. Forecast prep — export quarterly data for R ───────────────────────────
print("▸ Preparing forecast data for R...")

forecast_data = quarterly.copy()
forecast_data.to_csv(os.path.join(DATA_DIR, "quarterly_sales.csv"), index=False)

conn.commit()
conn.close()

print("\n✅ ETL Pipeline complete!")
print(f"   Database: {DB_PATH}")
print(f"   KPIs:     {kpi_path}")
print(f"   Records:  {len(df):,} orders → {total_customers} customers → {total_orders} unique orders")
