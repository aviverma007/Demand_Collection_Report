# Smartworld Sky Arc — Demand & Collection Dashboard

## How it works

The dashboard **reads `public/data/dapp_final.xlsx` directly in the browser** — no JSON conversion, no build step needed for data updates.

## Folder Structure

```
Demand_Collection_Report/
├── public/
│   └── data/
│       └── dapp_final.xlsx   ← YOUR EXCEL FILE — replace this to update the dashboard
├── src/
│   ├── SalesDashboard.jsx    ← reads Excel directly via fetch + xlsx library
│   └── SalesDashboard.css
└── package.json
```

## To update dashboard data

1. Replace `public/data/dapp_final.xlsx` with your updated Excel file
2. Commit and push:
```bash
git add public/data/dapp_final.xlsx
git commit -m "Update Excel data"
git push
```

That's it — no scripts, no JSON, no build step. The browser fetches and parses the Excel file live.

## Run locally

```bash
npm install
npm run dev        # → http://localhost:5173
npm run build      # production build
```

## Filters

- **Project** dropdown — filters all charts and KPIs by project
- **Company** dropdown — filters all charts and KPIs by company
- **Reset** — clears all filters
- **Refresh Data** button — re-fetches the Excel file without reloading the page

## Tech Stack
React 19 · Vite · Recharts · SheetJS (xlsx) · Lucide Icons
