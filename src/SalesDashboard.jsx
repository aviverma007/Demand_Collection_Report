import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, AlertCircle, CheckCircle, Clock, Filter } from 'lucide-react';
import './SalesDashboard.css';
import data from './dashboardData.json';

const SalesDashboard = () => {
  const [filters, setFilters] = useState({ project: 'All', company: 'All' });

  const fmt = (n) => (n >= 1e8 ? (n / 1e7).toFixed(2) + 'Cr' : n >= 1e5 ? (n / 1e5).toFixed(2) + 'L' : (n / 1000).toFixed(1) + 'K');

  // Unbilled by milestone
  const unbilledByMilestone = useMemo(() => {
    return data.milestones
      .filter(m => m.unbilled_count > 0)
      .sort((a, b) => b.unbilled_count - a.unbilled_count)
      .slice(0, 8);
  }, []);

  // Unbilled amount by milestone
  const unbilledAmountByMilestone = useMemo(() => {
    return data.milestones
      .filter(m => m.unbilled_amount > 0)
      .sort((a, b) => b.unbilled_amount - a.unbilled_amount)
      .slice(0, 8);
  }, []);

  return (
    <div className="sales-dashboard">
      {/* HEADER */}
      <header className="dashboard-header">
        <div className="header-top">
          <div className="header-title">
            <h1>📊 Smartworld Sales Dashboard</h1>
            <p>Real Estate Sales & Milestones Report</p>
          </div>
          <div className="header-status">
            <span className="live-badge">● LIVE</span>
            <span className="record-count">{data.summary.total_records.toLocaleString()} records | {data.summary.total_units} units | {data.milestones.length} milestones</span>
          </div>
        </div>
      </header>

      {/* KPI CARDS */}
      <section className="kpi-section">
        <div className="kpi-card kpi-1">
          <DollarSign size={24} />
          <div>
            <p className="kpi-label">TOTAL UNITS</p>
            <h3 className="kpi-value">{data.summary.total_units}</h3>
            <p className="kpi-detail">Unique Units</p>
          </div>
        </div>

        <div className="kpi-card kpi-2">
          <CheckCircle size={24} />
          <div>
            <p className="kpi-label">BOOKED UNITS</p>
            <h3 className="kpi-value">{data.summary.booked_units}</h3>
            <p className="kpi-detail">Sales Orders</p>
          </div>
        </div>

        <div className="kpi-card kpi-3">
          <AlertCircle size={24} />
          <div>
            <p className="kpi-label">UNBILLED</p>
            <h3 className="kpi-value">{data.summary.unbilled_count}</h3>
            <p className="kpi-detail">{((data.summary.unbilled_count / data.summary.total_records) * 100).toFixed(1)}% Pending</p>
          </div>
        </div>

        <div className="kpi-card kpi-4">
          <TrendingUp size={24} />
          <div>
            <p className="kpi-label">DEMAND</p>
            <h3 className="kpi-value">₹{fmt(data.summary.total_demand)}</h3>
            <p className="kpi-detail">Total Amount</p>
          </div>
        </div>

        <div className="kpi-card kpi-5">
          <DollarSign size={24} />
          <div>
            <p className="kpi-label">RECEIVED</p>
            <h3 className="kpi-value">₹{fmt(data.summary.total_received)}</h3>
            <p className="kpi-detail">{data.summary.collection_rate.toFixed(1)}% Collected</p>
          </div>
        </div>

        <div className="kpi-card kpi-6">
          <Clock size={24} />
          <div>
            <p className="kpi-label">OUTSTANDING</p>
            <h3 className="kpi-value">₹{fmt(data.summary.total_outstanding)}</h3>
            <p className="kpi-detail">Pending</p>
          </div>
        </div>
      </section>

      {/* CHARTS SECTION */}
      <section className="charts-section">
        <h2 className="section-title">📈 Unbilled Milestones Analysis</h2>
        
        <div className="chart-grid">
          <div className="chart-card">
            <h3>Unbilled Milestone Count by Milestone</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={unbilledByMilestone}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{fontSize: 10}} angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(v) => v.toLocaleString()} contentStyle={{backgroundColor: '#fff', border: '2px solid #3b82f6'}} />
                <Bar dataKey="unbilled_count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Unbilled Installment Amount Crs by Milestone</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={unbilledAmountByMilestone}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{fontSize: 10}} angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(v) => `₹${(v / 1e7).toFixed(2)} Cr`} contentStyle={{backgroundColor: '#fff', border: '2px solid #8b5a3c'}} />
                <Bar dataKey="unbilled_amount" fill="#8b5a3c" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* MILESTONE TABLE */}
      <section className="table-section">
        <h2 className="section-title">📋 Milestone-wise Summary</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Milestone</th>
                <th>Ageing Bucket</th>
                <th>Billed Milestone Count</th>
                <th>Billed Installment Amount Crs</th>
              </tr>
            </thead>
            <tbody>
              {data.milestones.slice(0, 15).map((milestone, idx) => (
                <tr key={idx}>
                  <td className="milestone-cell">{milestone.name}</td>
                  <td className="ageing-badge">181+ Days</td>
                  <td>{milestone.billed_count}</td>
                  <td>₹{(milestone.billed_amount / 1e7).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="dashboard-footer">
        <p>Smartworld Sales Dashboard | {data.summary.total_records} Records | {data.summary.total_units} Units | {data.milestones.length} Milestones</p>
      </footer>
    </div>
  );
};

export default SalesDashboard;
