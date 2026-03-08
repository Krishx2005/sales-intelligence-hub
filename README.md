# Sales Intelligence Hub

Full-stack analytics dashboard built on the Superstore dataset (9,994 transactions, 2014–2017). Python handles the ETL and customer analytics, Node.js serves the API, and React renders everything in a dark-themed dashboard with glassmorphism UI.

**Live:** [Frontend](https://sales-intelligence-hub.vercel.app) · [API](https://sales-intelligence-hub-api.onrender.com)

## Tech Stack

- **Data pipeline:** Python (pandas, numpy) → SQLite
- **Forecasting:** Linear regression with 95% confidence intervals (R or Python fallback)
- **API:** Node.js + Express, 12 REST endpoints
- **Frontend:** React 19, Tailwind CSS 4, Recharts
- **BI exports:** Power BI (.pbit + flat CSV), Tableau (star-schema CSVs + .twbx)

## What it does

- KPI cards with animated counters (revenue, profit, margin, orders, customers, YoY growth)
- Sales trend breakdowns by region and category with date/filter controls
- RFM customer segmentation (9 segments based on recency, frequency, monetary scores)
- Churn risk heatmap scoring customers 0–100
- 4-quarter revenue forecast with confidence bands
- Collapsible sidebar with scroll-based section tracking

## Run locally

```bash
# 1. ETL pipeline
cd python
pip install pandas numpy
python etl_pipeline.py
python forecast_fallback.py

# 2. Backend
cd ../backend
npm install
npm start          # localhost:4000

# 3. Frontend
cd ../frontend
npm install
npm run dev        # localhost:5173
```

## Project structure

```
python/          ETL pipeline, RFM segmentation, churn scoring, forecast
r/               R-based forecasting (optional)
data/            SQLite DB, CSVs, KPI JSON
backend/         Express API serving analytics from SQLite
frontend/        React dashboard with Recharts visualizations
exports/         Power BI and Tableau export files
```
