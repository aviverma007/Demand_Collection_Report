import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart, ComposedChart } from 'recharts';
import { Filter, TrendingUp, DollarSign, AlertCircle, CheckCircle, Clock, Download, Settings } from 'lucide-react';
import './SalesDashboard.css';
import data from './dashboardData.json';

const SalesDashboard = () => {
  const [filters, setFilters] = useState({
    project: 'All',
    company: 'All',
    unitType: 'All'
  });

  const fmt = (n) => (n >= 1e8 ? (n / 1e7).toFixed(2) + 'Cr' : n >= 1e5 ? (n / 1e5).toFixed(2) + 'L' : (n / 1000).toFixed(1) + 'K');

  // Filter data
  const filteredRecords = useMemo(() => {
    return data.records.filter(rec => {
      if (filters.project !== 'All' && rec.project !== filters.project) return false;
      if (filters.company !== 'All' && rec.company !== filters.company) return false;
      if (filters.unitType !== 'All' && rec.unit_description !== filters.unitType) return false;
      return true;
    });
  }, [filters]);

  // Calculate ageing buckets from filtered data
  const ageingData = useMemo(() => {
    const buckets = {};
    filteredRecords.forEach(rec => {
      if (rec.ageing_bucket) {
        if (!buckets[rec.ageing_bucket]) {
          buckets[rec.ageing_bucket] = { count: 0, amount: 0 };
        }
        buckets[rec.ageing_bucket].count++;
        buckets[rec.ageing_bucket].amount += rec.outstanding_amount;
      }
    });

    return [
      { name: '1–30 Days', count: buckets['1–30 Days']?.count || 0, amount: buckets['1–30 Days']?.amount || 0, fill: '#10b981' },
      { name: '31–90 Days', count: buckets['31–90 Days']?.count || 0, amount: buckets['31–90 Days']?.amount || 0, fill: '#f59e0b' },
      { name: '91–180 Days', count: buckets['91–180 Days']?.count || 0, amount: buckets['91–180 Days']?.amount || 0, fill: '#ef4444' },
      { name: '181+ Days', count: buckets['181+ Days']?.count || 0, amount: buckets['181+ Days']?.amount || 0, fill: '#7c3aed' }
    ];
  }, [filteredRecords]);

  // Summary stats
  const stats = useMemo(() => {
    const total_outstanding = filteredRecords.reduce((s, r) => s + r.outstanding_amount, 0);
    const unbilled = filteredRecords.filter(r => r.is_unbilled).length;
    const billed = filteredRecords.length - unbilled;
    const total_demand = filteredRecords.reduce((s, r) => s + r.demand_amount, 0);
    const total_received = filteredRecords.reduce((s, r) => s + r.received_amount, 0);

    return {
      total_records: filteredRecords.length,
      total_demand,
      total_received,
      total_outstanding,
      collection_rate: total_demand > 0 ? (total_received / total_demand * 100) : 0,
      unbilled,
      billed
    };
  }, [filteredRecords]);

  return (
    <div className="sales-dashboard">
      {/* HEADER */}
      <header className="dashboard-header">
        <div className="header-top">
          <div className="header-title">
            <h1>📊 Smartworld Sales Dashboard</h1>
            <p>Real Estate Sales & Ageing Report</p>
          </div>
          <div className="header-status">
            <span className="live-badge">● LIVE</span>
            <span className="record-count">{stats.total_records.toLocaleString()} records</span>
          </div>
        </div>

        {/* FILTERS */}
        <div className="filters-bar">
          <select value={filters.project} onChange={(e) => setFilters({...filters, project: e.target.value})} className="filter-select">
            <option value="All">All Projects</option>
            {data.filters.projects.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filters.company} onChange={(e) => setFilters({...filters, company: e.target.value})} className="filter-select">
            <option value="All">All Companies</option>
            {data.filters.companies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filters.unitType} onChange={(e) => setFilters({...filters, unitType: e.target.value})} className="filter-select">
            <option value="All">All Unit Types</option>
            {data.filters.unit_types.map(u => <option key={u} value={u}>{u.substring(0, 20)}</option>)}
          </select>
          <button className="reset-btn">Reset</button>
        </div>
      </header>

      {/* KPI CARDS */}
      <section className="kpi-section">
        <div className="kpi-card kpi-1">
          <div className="kpi-icon"><DollarSign size={24} /></div>
          <div className="kpi-info">
            <p className="kpi-label">TOTAL UNITS</p>
            <h3 className="kpi-value">{stats.total_records}</h3>
            <p className="kpi-detail">Sales Orders</p>
          </div>
        </div>

        <div className="kpi-card kpi-2">
          <div className="kpi-icon"><CheckCircle size={24} /></div>
          <div className="kpi-info">
            <p className="kpi-label">BOOKED UNITS</p>
            <h3 className="kpi-value">{stats.billed}</h3>
            <p className="kpi-detail">{stats.billed > 0 ? ((stats.billed / stats.total_records) * 100).toFixed(1) : '0'}% Booked</p>
          </div>
        </div>

        <div className="kpi-card kpi-3">
          <div className="kpi-icon"><AlertCircle size={24} /></div>
          <div className="kpi-info">
            <p className="kpi-label">UNBILLED UNITS</p>
            <h3 className="kpi-value">{stats.unbilled}</h3>
            <p className="kpi-detail">{stats.unbilled > 0 ? ((stats.unbilled / stats.total_records) * 100).toFixed(1) : '0'}% Pending</p>
          </div>
        </div>

        <div className="kpi-card kpi-4">
          <div className="kpi-icon"><TrendingUp size={24} /></div>
          <div className="kpi-info">
            <p className="kpi-label">DEMAND AMOUNT</p>
            <h3 className="kpi-value">₹{fmt(stats.total_demand)}</h3>
            <p className="kpi-detail">{stats.total_records} bookings</p>
          </div>
        </div>

        <div className="kpi-card kpi-5">
          <div className="kpi-icon"><DollarSign size={24} /></div>
          <div className="kpi-info">
            <p className="kpi-label">RECEIVED AMOUNT</p>
            <h3 className="kpi-value">₹{fmt(stats.total_received)}</h3>
            <p className="kpi-detail">{stats.collection_rate.toFixed(1)}% collected</p>
          </div>
        </div>

        <div className="kpi-card kpi-6">
          <div className="kpi-icon"><Clock size={24} /></div>
          <div className="kpi-info">
            <p className="kpi-label">OUTSTANDING</p>
            <h3 className="kpi-value">₹{fmt(stats.total_outstanding)}</h3>
            <p className="kpi-detail">Pending Payment</p>
          </div>
        </div>
      </section>

      {/* AGEING SECTION */}
      <section className="ageing-section">
        <h2 className="section-title">📊 Ageing Summary</h2>
        <div className="ageing-cards">
          {ageingData.map((item, idx) => (
            <div key={idx} className="ageing-card" style={{borderTop: `4px solid ${item.fill}`}}>
              <h4>{item.name}</h4>
              <div className="ageing-count">{item.count}</div>
              <div className="ageing-amount">₹{fmt(item.amount)}</div>
              <div className="ageing-bar" style={{backgroundColor: item.fill, width: item.count > 0 ? '100%' : '0%'}}></div>
            </div>
          ))}
        </div>
      </section>

      {/* CHARTS */}
      <section className="charts-section">
        <div className="chart-card">
          <h3>Installment Count by Ageing</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ageingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{fontSize: 12}} />
              <YAxis />
              <Tooltip formatter={(v) => v.toLocaleString()} contentStyle={{backgroundColor: '#fff', border: '1px solid #ddd'}} />
              <Bar dataKey="count" fill="#1e3a8a" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Outstanding Amount by Ageing</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ageingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{fontSize: 12}} />
              <YAxis />
              <Tooltip formatter={(v) => `₹${fmt(v)}`} contentStyle={{backgroundColor: '#fff', border: '1px solid #ddd'}} />
              <Bar dataKey="amount" fill="#8b5a3c" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Booking Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  {name: 'Booked', value: stats.billed, fill: '#1e3a8a'},
                  {name: 'Available', value: stats.unbilled, fill: '#d4a574'}
                ]}
                cx="50%" cy="50%" outerRadius={90} label
              >
                <Cell fill="#1e3a8a" />
                <Cell fill="#d4a574" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* DATA TABLE */}
      <section className="table-section">
        <h2 className="section-title">📋 Top Sales Orders</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>SO#</th>
                <th>Unit</th>
                <th>Tower</th>
                <th>Demand</th>
                <th>Received</th>
                <th>Outstanding</th>
                <th>Ageing</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.slice(0, 8).map((rec, idx) => (
                <tr key={idx}>
                  <td className="so-cell">{rec.sales_order}</td>
                  <td>{rec.unit_number.substring(0, 8)}</td>
                  <td>{rec.tower}</td>
                  <td>₹{fmt(rec.demand_amount)}</td>
                  <td>₹{fmt(rec.received_amount)}</td>
                  <td>₹{fmt(rec.outstanding_amount)}</td>
                  <td className={`ageing-badge ageing-${rec.ageing_bucket?.replace(/[^\w]/g, '')}`}>{rec.ageing_bucket || 'N/A'}</td>
                  <td className={`status-badge ${rec.is_unbilled ? 'unbilled' : 'billed'}`}>{rec.is_unbilled ? 'Unbilled' : 'Billed'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="dashboard-footer">
        <p>Smartworld Sales Dashboard | {stats.total_records} Records | {data.filters.projects.length} Projects</p>
      </footer>
    </div>
  );
};

export default SalesDashboard;
