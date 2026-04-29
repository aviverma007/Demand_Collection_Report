"""
excel_to_json.py
Converts dapp_final.xlsx → src/dashboardData.json
Matches the EXACT structure expected by SalesDashboard.jsx
"""

import pandas as pd
import numpy as np
import json
from pathlib import Path
from datetime import datetime

EXCEL_PATH = Path(__file__).parent.parent / "data" / "dapp_final.xlsx"
OUTPUT_PATH = Path(__file__).parent.parent / "src" / "dashboardData.json"
CR = 1_00_00_000  # 1 Crore = 10,000,000

def bucket_label(days):
    if pd.isna(days) or days < 0:
        return "Not Yet Due"
    if days <= 30:
        return "1\u201330 Days"
    if days <= 90:
        return "31\u201390 Days"
    if days <= 180:
        return "91\u2013180 Days"
    return "181+ Days"

def build(df):
    today = pd.Timestamp.today().normalize()

    # ── parse dates ──────────────────────────────────────────
    df["Bill creation date"]  = pd.to_datetime(df["Bill creation date"],  errors="coerce")
    df["SAP Booking date"]    = pd.to_datetime(df["SAP Booking date"],    errors="coerce")
    df["SAP Document date"]   = pd.to_datetime(df["SAP Document date"],   errors="coerce")

    # ── billed / unbilled flag ────────────────────────────────
    # Billed = Demand No is NOT null
    df["is_billed"] = df["Demand No"].notna()

    # ── ageing for billed rows only ───────────────────────────
    billed = df[df["is_billed"]].copy()
    billed["days_old"] = (today - billed["Bill creation date"]).dt.days
    billed["bucket"]   = billed["days_old"].apply(bucket_label)

    # ── ageing buckets ────────────────────────────────────────
    BUCKET_ORDER = ["1\u201330 Days", "31\u201390 Days", "91\u2013180 Days", "181+ Days", "Not Yet Due"]
    ageing = {}
    for b in BUCKET_ORDER:
        sub = billed[billed["bucket"] == b]
        ageing[b] = {
            "count":  int(len(sub)),
            "amount": round(float(sub["Outstanding Amount"].sum()) / CR, 2),
        }

    # ── summary ───────────────────────────────────────────────
    total_demand      = df["Total Demand With Tax"].sum()
    total_received    = df["Received Amt (in Bank)"].sum()
    total_outstanding = df["Outstanding Amount"].sum()
    collection_rate   = (total_received / total_demand * 100) if total_demand else 0

    summary = {
        "total_records":      int(len(df)),
        "total_units":        int(df["Unit Number"].nunique()),
        "total_sales_orders": int(df["Sale order No"].nunique()),
        "total_milestones":   int(df["Milestone"].nunique()),
        "total_towers":       int(df["Tower"].nunique()),
        "total_demand_cr":    round(float(total_demand) / CR, 2),
        "total_received_cr":  round(float(total_received) / CR, 2),
        "total_outstanding_cr": round(float(total_outstanding) / CR, 2),
        "collection_rate":    round(float(collection_rate), 2),
        "billed_count":       int(df["is_billed"].sum()),
        "unbilled_count":     int((~df["is_billed"]).sum()),
        "companies":          sorted(df["Company Name"].dropna().unique().tolist()),
        "projects":           sorted(df["Project Name"].dropna().unique().tolist()),
    }

    # ── milestone list (all milestones with billed+unbilled) ──
    def ms_ageing(grp):
        b = grp[grp["is_billed"]]
        if len(b) == 0:
            return "Not Yet Due"
        b2 = b.copy()
        b2["days_old"] = (today - b2["Bill creation date"]).dt.days
        b2["bucket"]   = b2["days_old"].apply(bucket_label)
        return b2["bucket"].mode().iloc[0] if len(b2) else "Not Yet Due"

    ms_rows = []
    for name, grp in df.groupby("Milestone", sort=False):
        b_grp  = grp[grp["is_billed"]]
        ub_grp = grp[~grp["is_billed"]]
        ms_rows.append({
            "name":            str(name),
            "billed_count":    int(len(b_grp)),
            "billed_amount":   round(float(b_grp["Total Demand With Tax"].sum()) / CR, 2),
            "unbilled_count":  int(len(ub_grp)),
            "unbilled_amount": round(float(ub_grp["Total Demand With Tax"].sum()) / CR, 2),
            "ageing_bucket":   ms_ageing(grp),
        })

    milestone_list = sorted(ms_rows, key=lambda x: x["billed_count"] + x["unbilled_count"], reverse=True)

    # ── top_unbilled_count ───────────────────────────────────
    top_unbilled_count = sorted(
        [m for m in milestone_list if m["unbilled_count"] > 0],
        key=lambda x: x["unbilled_count"], reverse=True
    )[:10]

    # ── top_unbilled_amount ──────────────────────────────────
    top_unbilled_amount = sorted(
        [m for m in milestone_list if m["unbilled_amount"] > 0],
        key=lambda x: x["unbilled_amount"], reverse=True
    )[:10]

    # ── top_billed ───────────────────────────────────────────
    top_billed = sorted(
        [m for m in milestone_list if m["billed_count"] > 0],
        key=lambda x: x["billed_count"], reverse=True
    )[:10]

    # ── tower_list ───────────────────────────────────────────
    tower_rows = []
    for tower, grp in df.groupby("Tower", sort=False):
        demand      = float(grp["Total Demand With Tax"].sum())
        received    = float(grp["Received Amt (in Bank)"].sum())
        outstanding = float(grp["Outstanding Amount"].sum())
        coll_rate   = (received / demand * 100) if demand else 0
        tower_rows.append({
            "tower":           str(tower),
            "demand":          round(demand / CR, 2),
            "received":        round(received / CR, 2),
            "outstanding":     round(outstanding / CR, 2),
            "collection_rate": round(coll_rate, 1),
        })
    tower_list = sorted(tower_rows, key=lambda x: x["demand"], reverse=True)

    # ── monthly ──────────────────────────────────────────────
    df["month_period"] = df["SAP Booking date"].dt.to_period("M")
    monthly_grp = (
        df.dropna(subset=["month_period"])
        .groupby("month_period")
        .agg(demand=("Total Demand With Tax","sum"),
             received=("Received Amt (in Bank)","sum"))
        .reset_index()
        .sort_values("month_period")
    )
    monthly = [
        {
            "month":    str(row.month_period.strftime("%b %Y")),
            "demand":   round(float(row.demand) / CR, 2),
            "received": round(float(row.received) / CR, 2),
        }
        for row in monthly_grp.itertuples()
    ]

    return {
        "summary":            summary,
        "ageing":             ageing,
        "top_unbilled_count": top_unbilled_count,
        "top_unbilled_amount":top_unbilled_amount,
        "top_billed":         top_billed,
        "milestone_list":     milestone_list,
        "tower_list":         tower_list,
        "monthly":            monthly,
    }


def main():
    if not EXCEL_PATH.exists():
        print(f"❌  Excel file not found at: {EXCEL_PATH}")
        print("    Place your Excel file at:  data/dapp_final.xlsx")
        raise SystemExit(1)

    print(f"📂  Reading: {EXCEL_PATH}")
    df = pd.read_excel(EXCEL_PATH)
    print(f"✅  Loaded {len(df):,} rows × {len(df.columns)} columns")

    data = build(df)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    s = data["summary"]
    print(f"\n📊  Dashboard data written to: {OUTPUT_PATH}")
    print(f"    Records      : {s['total_records']:,}")
    print(f"    Units        : {s['total_units']:,}")
    print(f"    Towers       : {s['total_towers']}")
    print(f"    Total Demand : ₹{s['total_demand_cr']:,.2f} Cr")
    print(f"    Received     : ₹{s['total_received_cr']:,.2f} Cr")
    print(f"    Outstanding  : ₹{s['total_outstanding_cr']:,.2f} Cr")
    print(f"    Collection % : {s['collection_rate']}%")
    print(f"    Billed       : {s['billed_count']:,}")
    print(f"    Unbilled     : {s['unbilled_count']:,}")
    print(f"\n✅  Done. Now run:  npm run build")

if __name__ == "__main__":
    main()
