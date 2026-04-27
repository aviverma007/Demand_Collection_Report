import { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './App.css';

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/dapp_skyarc.XLSX')
      .then(res => res.arrayBuffer())
      .then(buffer => {
        const wb = XLSX.read(buffer, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(ws);
        setData(jsonData);
        setLoading(false);
      });
  }, []);

  // KPI CALCULATIONS
  const kpis = useMemo(() => {
    if (!data.length) return {};

    const totalDemand = data.reduce((sum, row) => sum + (row['Total Demand With Tax'] || 0), 0);
    const totalCollected = data.reduce((sum, row) => sum + (row['Received Amount'] || 0), 0);
    const totalOutstanding = totalDemand - totalCollected;
    const collectionRate = totalDemand ? ((totalCollected / totalDemand) * 100).toFixed(1) : 0;

    return {
      totalDemand,
      totalCollected,
      totalOutstanding,
      collectionRate,
      totalBookings: new Set(data.map(r => r['Sale order No'])).size,
      totalCustomers: new Set(data.map(r => r['Customer Code (Payer)'])).size,
    };
  }, [data]);

  // MILESTONE ANALYSIS
  const milestoneData = useMemo(() => {
    if (!data.length) return [];

    const grouped = {};
    data.forEach(row => {
      const milestone = row['Milestone'] || 'Unspecified';
      if (!grouped[milestone]) {
        grouped[milestone] = { milestone, demand: 0, collected: 0, outstanding: 0, count: 0 };
      }
      grouped[milestone].demand += row['Total Demand With Tax'] || 0;
      grouped[milestone].collected += row['Received Amount'] || 0;
      grouped[milestone].outstanding += (row['Outstanding Amount'] || 0);
      grouped[milestone].count += 1;
    });

    return Object.values(grouped)
      .sort((a, b) => b.demand - a.demand)
      .map(m => ({
        ...m,
        collectionRate: m.demand ? ((m.collected / m.demand) * 100).toFixed(1) : 0,
      }));
  }, [data]);

  // TOWER-WISE ANALYSIS
  const towerData = useMemo(() => {
    if (!data.length) return [];

    const grouped = {};
    data.forEach(row => {
      const tower = row['Tower'] || 'Unknown';
      if (!grouped[tower]) {
        grouped[tower] = { tower, demand: 0, collected: 0, units: 0 };
      }
      grouped[tower].demand += row['Total Demand With Tax'] || 0;
      grouped[tower].collected += row['Received Amount'] || 0;
      grouped[tower].units += 1;
    });

    return Object.values(grouped).sort((a, b) => b.demand - a.demand);
  }, [data]);

  // MONTHLY TREND
  const monthlyTrend = useMemo(() => {
    if (!data.length) return [];

    const monthMap = {};
    data.forEach(row => {
      const date = row['SAP Date'] || row['Bill creation date'];
      if (!date) return;

      let month;
      if (date instanceof Date) {
        month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else {
        return;
      }

      if (!monthMap[month]) {
        monthMap[month] = { month, demand: 0, collected: 0, bookings: 0 };
      }
      monthMap[month].demand += row['Total Demand With Tax'] || 0;
      monthMap[month].collected += row['Received Amount'] || 0;
      monthMap[month].bookings += 1;
    });

    return Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month));
  }, [data]);

  // PAYMENT PLAN ANALYSIS
  const paymentPlanData = useMemo(() => {
    if (!data.length) return [];

    const grouped = {};
    data.forEach(row => {
      const plan = row['Payment Plan Name'] || 'Unknown';
      if (!grouped[plan]) {
        grouped[plan] = { plan, demand: 0, collected: 0, units: 0 };
      }
      grouped[plan].demand += row['Total Demand With Tax'] || 0;
      grouped[plan].collected += row['Received Amount'] || 0;
      grouped[plan].units += 1;
    });

    return Object.values(grouped).sort((a, b) => b.demand - a.demand);
  }, [data]);

  // COLLECTION EFFICIENCY
  const collectionEfficiency = useMemo(() => {
    if (!data.length) return [];

    const buckets = {
      '0-30%': { range: '0-30%', count: 0, demand: 0 },
      '30-50%': { range: '30-50%', count: 0, demand: 0 },
      '50-70%': { range: '50-70%', count: 0, demand: 0 },
      '70-90%': { range: '70-90%', count: 0, demand: 0 },
      '90-100%': { range: '90-100%', count: 0, demand: 0 },
    };

    const grouped = {};
    data.forEach(row => {
      const key = row['Sale order No'];
      if (!grouped[key]) {
        grouped[key] = { totalDemand: 0, totalCollected: 0 };
      }
      grouped[key].totalDemand += row['Total Demand With Tax'] || 0;
      grouped[key].totalCollected += row['Received Amount'] || 0;
    });

    Object.values(grouped).forEach(item => {
      const rate = item.totalDemand ? (item.totalCollected / item.totalDemand) * 100 : 0;
      let bucket;
      if (rate < 30) bucket = '0-30%';
      else if (rate < 50) bucket = '30-50%';
      else if (rate < 70) bucket = '50-70%';
      else if (rate < 90) bucket = '70-90%';
      else bucket = '90-100%';

      buckets[bucket].count += 1;
      buckets[bucket].demand += item.totalDemand;
    });

    return Object.values(buckets);
  }, [data]);

  // TOP CUSTOMERS
  const topCustomers = useMemo(() => {
    if (!data.length) return [];

    const grouped = {};
    data.forEach(row => {
      const customer = row['Customer Name (Payer)'] || 'Unknown';
      if (!grouped[customer]) {
        grouped[customer] = { customer, demand: 0, collected: 0, units: 0 };
      }
      grouped[customer].demand += row['Total Demand With Tax'] || 0;
      grouped[customer].collected += row['Received Amount'] || 0;
      grouped[customer].units += 1;
    });

    return Object.values(grouped)
      .sort((a, b) => b.demand - a.demand)
      .slice(0, 10);
  }, [data]);

  const fmt = (num) => {
    if (num >= 1e7) return (num / 1e7).toFixed(1) + 'Cr';
    if (num >= 1e5) return (num / 1e5).toFixed(1) + 'L';
    if (num >= 1e3) return (num / 1e3).toFixed(0) + 'K';
    return num?.toFixed(0) || 0;
  };

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>Loading...</div>;
  }

  return (
    <div style={{ background: '#f5f7fa', minHeight: '100vh', padding: '20px' }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, color: '#1e3a5f', marginBottom: 10 }}>Demand & Collection Dashboard</h1>
      <p style={{ fontSize: 14, color: '#666', marginBottom: 30 }}>Smartworld Sky Arc - Real Estate Project</p>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16, marginBottom: 30 }}>
        {[
          { label: 'Total Demand', value: fmt(kpis.totalDemand), icon: '₹' },
          { label: 'Collected', value: fmt(kpis.totalCollected), icon: '✓' },
          { label: 'Outstanding', value: fmt(kpis.totalOutstanding), icon: '⏳' },
          { label: 'Collection %', value: `${kpis.collectionRate}%`, icon: '%' },
          { label: 'Bookings', value: kpis.totalBookings, icon: '📋' },
          { label: 'Customers', value: kpis.totalCustomers, icon: '👥' },
        ].map((kpi, idx) => (
          <div key={idx} style={{ background: '#fff', padding: '20px', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: 12, color: '#999', fontWeight: 600, marginBottom: 8 }}>{kpi.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1e3a5f' }}>{kpi.icon} {kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 30 }}>
        <div style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#1e3a5f' }}>Demand by Milestone</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={milestoneData.slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="milestone" angle={-45} textAnchor="end" height={80} fontSize={10} />
              <YAxis />
              <Tooltip formatter={(v) => fmt(v)} />
              <Bar dataKey="demand" fill="#1e3a5f" />
              <Bar dataKey="collected" fill="#4caf50" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#1e3a5f' }}>Collection Rate Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={collectionEfficiency}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#ff9800" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 30 }}>
        <div style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#1e3a5f' }}>Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(v) => fmt(v)} />
              <Line type="monotone" dataKey="demand" stroke="#1e3a5f" />
              <Line type="monotone" dataKey="collected" stroke="#4caf50" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#1e3a5f' }}>Demand by Tower</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={towerData.slice(0, 5)} cx="50%" cy="50%" outerRadius={100} fill="#1e3a5f" dataKey="demand"
                label={({ tower, percent }) => `${tower}: ${(percent * 100).toFixed(0)}%`}>
                {['#1e3a5f', '#4caf50', '#ff9800', '#f44336', '#2196f3'].map((color, idx) => <Cell key={idx} fill={color} />)}
              </Pie>
              <Tooltip formatter={(v) => fmt(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 30 }}>
        <div style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#1e3a5f' }}>Payment Plans</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={paymentPlanData.slice(0, 6)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="plan" type="category" width={120} fontSize={11} />
              <Tooltip formatter={(v) => fmt(v)} />
              <Bar dataKey="demand" fill="#2196f3" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#1e3a5f' }}>Top 10 Customers</h3>
          <div style={{ fontSize: 12 }}>
            {topCustomers.map((cust, idx) => (
              <div key={idx} style={{ padding: '10px 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#1e3a5f' }}>{idx + 1}. {cust.customer}</div>
                  <div style={{ fontSize: 11, color: '#999' }}>{cust.units} unit(s)</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600, color: '#4caf50' }}>₹{fmt(cust.collected)}</div>
                  <div style={{ fontSize: 11, color: '#999' }}>of ₹{fmt(cust.demand)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Milestone Table */}
      <div style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#1e3a5f' }}>Detailed Milestone Analysis</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: 10, textAlign: 'left', fontWeight: 700 }}>Milestone</th>
              <th style={{ padding: 10, textAlign: 'right', fontWeight: 700 }}>Demand</th>
              <th style={{ padding: 10, textAlign: 'right', fontWeight: 700 }}>Collected</th>
              <th style={{ padding: 10, textAlign: 'right', fontWeight: 700 }}>Outstanding</th>
              <th style={{ padding: 10, textAlign: 'right', fontWeight: 700 }}>%</th>
              <th style={{ padding: 10, textAlign: 'center', fontWeight: 700 }}>Units</th>
            </tr>
          </thead>
          <tbody>
            {milestoneData.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 10 }}>{row.milestone.substring(0, 40)}</td>
                <td style={{ padding: 10, textAlign: 'right', fontWeight: 600 }}>₹{fmt(row.demand)}</td>
                <td style={{ padding: 10, textAlign: 'right', color: '#4caf50', fontWeight: 600 }}>₹{fmt(row.collected)}</td>
                <td style={{ padding: 10, textAlign: 'right', color: '#f44336' }}>₹{fmt(row.outstanding)}</td>
                <td style={{ padding: 10, textAlign: 'right', fontWeight: 600 }}>{row.collectionRate}%</td>
                <td style={{ padding: 10, textAlign: 'center' }}>{row.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer style={{ textAlign: 'center', color: '#999', fontSize: 12, marginTop: 40, paddingBottom: 20 }}>
        <p>Data as of {new Date().toLocaleDateString()}</p>
      </footer>
    </div>
  );
}
