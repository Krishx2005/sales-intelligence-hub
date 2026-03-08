"""
Linear regression forecast using numpy (Python fallback for the R script).
"""

import pandas as pd
import numpy as np
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")

# Load quarterly data
quarterly = pd.read_csv(os.path.join(DATA_DIR, "quarterly_sales.csv"))
quarterly["time_index"] = range(1, len(quarterly) + 1)

print("▸ Fitting linear regression model...")

X = quarterly["time_index"].values.astype(float)
y = quarterly["revenue"].values.astype(float)
n = len(X)

# Ordinary least squares
x_mean = X.mean()
y_mean = y.mean()
slope = np.sum((X - x_mean) * (y - y_mean)) / np.sum((X - x_mean) ** 2)
intercept = y_mean - slope * x_mean

# R-squared
y_pred = intercept + slope * X
ss_res = np.sum((y - y_pred) ** 2)
ss_tot = np.sum((y - y_mean) ** 2)
r_squared = 1 - ss_res / ss_tot

print(f"  R²:        {r_squared:.4f}")
print(f"  Intercept: {intercept:.2f}")
print(f"  Slope:     {slope:.2f} per quarter")

# Predictions for historical
quarterly["predicted"] = y_pred
quarterly["residual"] = y - y_pred
quarterly["lower_ci"] = np.nan
quarterly["upper_ci"] = np.nan
quarterly["is_forecast"] = False

# Forecast next 4 quarters
last_idx = int(quarterly["time_index"].max())
last_yq = quarterly["Year_Quarter"].iloc[-1]
last_year = int(last_yq.split("-Q")[0])
last_q = int(last_yq.split("-Q")[1])

# Residual standard error
rse = np.sqrt(ss_res / (n - 2))
ss_xx = np.sum((X - x_mean) ** 2)

# t-critical for 95% CI with n-2 degrees of freedom
# For df=14 (16 quarters - 2), t_0.975 ≈ 2.145
df = n - 2
t_value = 2.145 if df >= 14 else 2.306  # conservative approximation

future_rows = []
for i in range(1, 5):
    q = (last_q + i - 1) % 4 + 1
    yr = last_year + ((last_q + i - 1) // 4)
    label = f"{yr}-Q{q}"
    idx = last_idx + i
    pred = intercept + slope * idx
    se = rse * np.sqrt(1 + 1/n + (idx - x_mean)**2 / ss_xx)
    future_rows.append({
        "Year_Quarter": label,
        "time_index": idx,
        "revenue": np.nan,
        "predicted": round(pred, 2),
        "lower_ci": round(pred - t_value * se, 2),
        "upper_ci": round(pred + t_value * se, 2),
        "residual": np.nan,
        "is_forecast": True,
    })

result = pd.concat([
    quarterly[["Year_Quarter", "time_index", "revenue", "predicted", "lower_ci", "upper_ci", "residual", "is_forecast"]],
    pd.DataFrame(future_rows)
], ignore_index=True)

output_path = os.path.join(DATA_DIR, "forecast_results.csv")
result.to_csv(output_path, index=False)

print(f"\n✅ Forecast complete → {output_path}")
for row in future_rows:
    print(f"   {row['Year_Quarter']}: ${row['predicted']:,.0f} (95% CI: ${row['lower_ci']:,.0f} – ${row['upper_ci']:,.0f})")
