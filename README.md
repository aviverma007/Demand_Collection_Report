# Smartworld Sky Arc — Demand & Collection Dashboard

## Folder Structure

```
Demand_Collection_Report/
├── data/
│   └── dapp_final.xlsx        ← YOUR EXCEL FILE — edit this to update the dashboard
├── scripts/
│   └── excel_to_json.py       ← run this after editing Excel
├── src/
│   ├── dashboardData.json     ← auto-generated from Excel (do not edit manually)
│   ├── SalesDashboard.jsx
│   └── SalesDashboard.css
└── package.json
```

---

## How to Update Dashboard Data

**Step 1 — Edit the Excel file**
Open `data/dapp_final.xlsx` in Excel, make your changes, save and close.

**Step 2 — Regenerate the JSON**
```bash
python scripts/excel_to_json.py
```

**Step 3 — Rebuild the app**
```bash
npm run build
```

**Step 4 — Commit and push**
```bash
git add data/dapp_final.xlsx src/dashboardData.json
git commit -m "Update data"
git push
```

That's it — the dashboard will reflect your latest Excel data.

---

## Run Locally

```bash
npm install
npm run dev
# open http://localhost:5173
```

## Tech Stack
React 19 · Vite · Recharts · Lucide Icons
