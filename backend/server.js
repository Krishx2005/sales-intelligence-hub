/**
 * Sales Intelligence Hub — REST API
 * Serves analytics data from SQLite via Express endpoints.
 */

const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 4000;

// ── Database connection ──────────────────────────────────────────────────────
const DB_PATH = path.join(__dirname, "..", "data", "superstore.db");
const KPI_PATH = path.join(__dirname, "..", "data", "kpis.json");
const FORECAST_PATH = path.join(__dirname, "..", "data", "forecast_results.csv");

let db;
try {
  db = new Database(DB_PATH, { readonly: true });
  console.log("✓ Connected to SQLite database");
} catch (err) {
  console.error("✗ Database connection failed:", err.message);
  process.exit(1);
}

app.use(cors());
app.use(express.json());

// ── Helper: parse CSV string into array of objects ───────────────────────────
function parseCSV(csvString) {
  const lines = csvString.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.replace(/"/g, "").trim());
    const obj = {};
    headers.forEach((h, i) => {
      const raw = values[i];
      if (raw === "NA" || raw === "") {
        obj[h] = null;
      } else if (raw === "True") {
        obj[h] = true;
      } else if (raw === "False") {
        obj[h] = false;
      } else {
        const num = Number(raw);
        obj[h] = isNaN(num) ? raw : num;
      }
    });
    return obj;
  });
}

// ── Middleware: request logging ───────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── KPIs ─────────────────────────────────────────────────────────────────────
app.get("/api/kpis", (_req, res) => {
  try {
    const kpis = JSON.parse(fs.readFileSync(KPI_PATH, "utf-8"));
    res.json(kpis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Sales Trends ─────────────────────────────────────────────────────────────
// GET /api/sales/trends?by=region|category&region=X&category=X&start=YYYY-MM&end=YYYY-MM
app.get("/api/sales/trends", (req, res) => {
  try {
    const { by = "region", region, category, start, end } = req.query;
    const table =
      by === "category" ? "sales_by_category_month" : "sales_by_region_month";
    const groupCol = by === "category" ? "Category" : "Region";

    let query = `SELECT * FROM ${table} WHERE 1=1`;
    const params = [];

    if (region) {
      query += ` AND Region = ?`;
      params.push(region);
    }
    if (category) {
      query += ` AND Category = ?`;
      params.push(category);
    }
    if (start) {
      query += ` AND Year_Month >= ?`;
      params.push(start);
    }
    if (end) {
      query += ` AND Year_Month <= ?`;
      params.push(end);
    }

    query += ` ORDER BY Year_Month`;
    const rows = db.prepare(query).all(...params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Quarterly Sales ──────────────────────────────────────────────────────────
app.get("/api/sales/quarterly", (_req, res) => {
  try {
    const rows = db
      .prepare("SELECT * FROM sales_quarterly ORDER BY Year_Quarter")
      .all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Customer Segmentation (RFM) ─────────────────────────────────────────────
// GET /api/customers/segments?segment=X&churn=Low|Medium|High
app.get("/api/customers/segments", (req, res) => {
  try {
    const { segment, churn } = req.query;
    let query = "SELECT * FROM customer_rfm WHERE 1=1";
    const params = [];

    if (segment) {
      query += " AND segment = ?";
      params.push(segment);
    }
    if (churn) {
      query += " AND churn_category = ?";
      params.push(churn);
    }

    query += " ORDER BY rfm_score DESC";
    const rows = db.prepare(query).all(...params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Segment Summary ──────────────────────────────────────────────────────────
app.get("/api/customers/segment-summary", (_req, res) => {
  try {
    const rows = db
      .prepare(
        `SELECT segment,
                COUNT(*) as count,
                ROUND(AVG(monetary), 2) as avg_revenue,
                ROUND(AVG(frequency), 1) as avg_frequency,
                ROUND(AVG(recency), 0) as avg_recency,
                ROUND(AVG(churn_risk), 1) as avg_churn_risk
         FROM customer_rfm
         GROUP BY segment
         ORDER BY count DESC`
      )
      .all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Churn Risk Distribution ──────────────────────────────────────────────────
app.get("/api/customers/churn-distribution", (_req, res) => {
  try {
    const rows = db
      .prepare(
        `SELECT churn_category, segment, business_segment,
                COUNT(*) as count,
                ROUND(AVG(monetary), 2) as avg_revenue,
                ROUND(SUM(monetary), 2) as total_revenue
         FROM customer_rfm
         GROUP BY churn_category, segment, business_segment
         ORDER BY churn_category, segment`
      )
      .all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Regional Performance ────────────────────────────────────────────────────
app.get("/api/regions", (_req, res) => {
  try {
    const rows = db
      .prepare("SELECT * FROM region_performance ORDER BY revenue DESC")
      .all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/regions/states", (_req, res) => {
  try {
    const rows = db
      .prepare("SELECT * FROM state_performance ORDER BY revenue DESC")
      .all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Category Performance ────────────────────────────────────────────────────
app.get("/api/categories", (_req, res) => {
  try {
    const rows = db
      .prepare(
        "SELECT * FROM category_performance ORDER BY revenue DESC"
      )
      .all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Forecast Data ───────────────────────────────────────────────────────────
app.get("/api/forecast", (_req, res) => {
  try {
    if (!fs.existsSync(FORECAST_PATH)) {
      return res.status(404).json({ error: "Forecast data not yet generated. Run R script first." });
    }
    const csv = fs.readFileSync(FORECAST_PATH, "utf-8");
    const data = parseCSV(csv);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Filter Options ──────────────────────────────────────────────────────────
app.get("/api/filters", (_req, res) => {
  try {
    const regions = db
      .prepare("SELECT DISTINCT region FROM orders ORDER BY region")
      .all()
      .map((r) => r.region);
    const categories = db
      .prepare("SELECT DISTINCT category FROM products ORDER BY category")
      .all()
      .map((r) => r.category);
    const subCategories = db
      .prepare(
        "SELECT DISTINCT sub_category FROM products ORDER BY sub_category"
      )
      .all()
      .map((r) => r.sub_category);
    const segments = db
      .prepare("SELECT DISTINCT segment FROM customers ORDER BY segment")
      .all()
      .map((r) => r.segment);
    const dateRange = db
      .prepare(
        "SELECT MIN(order_date) as min_date, MAX(order_date) as max_date FROM orders"
      )
      .get();

    res.json({ regions, categories, subCategories, segments, dateRange });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Orders with filtering ───────────────────────────────────────────────────
app.get("/api/orders", (req, res) => {
  try {
    const { region, category, start, end, limit = 100, offset = 0 } = req.query;
    let query = `
      SELECT o.*, p.category, p.sub_category, p.product_name,
             c.customer_name, c.segment as customer_segment
      FROM orders o
      JOIN products p ON o.product_id = p.product_id
      JOIN customers c ON o.customer_id = c.customer_id
      WHERE 1=1
    `;
    const params = [];

    if (region) { query += " AND o.region = ?"; params.push(region); }
    if (category) { query += " AND p.category = ?"; params.push(category); }
    if (start) { query += " AND o.order_date >= ?"; params.push(start); }
    if (end) { query += " AND o.order_date <= ?"; params.push(end); }

    query += " ORDER BY o.order_date DESC LIMIT ? OFFSET ?";
    params.push(Number(limit), Number(offset));

    const rows = db.prepare(query).all(...params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Sales Intelligence API running on http://localhost:${PORT}`);
  console.log(`   Endpoints:`);
  console.log(`     GET /api/health`);
  console.log(`     GET /api/kpis`);
  console.log(`     GET /api/sales/trends?by=region|category`);
  console.log(`     GET /api/sales/quarterly`);
  console.log(`     GET /api/customers/segments`);
  console.log(`     GET /api/customers/segment-summary`);
  console.log(`     GET /api/customers/churn-distribution`);
  console.log(`     GET /api/regions`);
  console.log(`     GET /api/categories`);
  console.log(`     GET /api/forecast`);
  console.log(`     GET /api/filters`);
  console.log(`     GET /api/orders`);
});
