import React, { useMemo, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Filter, Download, TrendingUp, CheckCircle, Clock, DollarSign, FileText, Building2, Home } from 'lucide-react';
import './InstallmentReport.css';
import data from './data/installmentsData.json';

const InstallmentReport = () => {
  const [filters, setFilters] = useState({
    company: 'ALL',
    project: 'ALL',
    tower: 'ALL',
    monthYear: 'ALL',
    ageingDays: 'ALL',
    unitType: 'ALL'
  });

  const fmt = (n) => (n >= 1e8 ? (n / 1e7).toFixed(2) + 'Cr' : n >= 1e5 ? (n / 1e5).toFixed(2) + 'L' : (n / 1000).toFixed(1) + 'K');

  // Filter installments
  const filteredInstallments = useMemo(() => {
    return data.installments.filter(inst => {
      if (filters.company !== 'ALL' && inst.company !== filters.company) return false;
      if (filters.project !== 'ALL' && inst.project !== filters.project) return false;
      if (filters.tower !== 'ALL' && inst.tower !== filters.tower) return false;
      if (filters.monthYear !== 'ALL' && inst.month_year !== filters.monthYear) return false;
      if (filters.unitType !== 'ALL' && inst.unit_code !== filters.unitType) return false;
      
      if (filters.ageingDays !== 'ALL') {
        const ageing = inst.ageing_days;
        const range = filters.ageingDays.split('-');
        if (range.length === 2) {
          const min = parseInt(range[0]);
          const max = parseInt(range[1]);
          if (ageing < min || ageing > max) return false;
        }
      }
      return true;
    });
  }, [filters]);

  // Ageing bucket data
  const ageingCountData = useMemo(() => {
    const buckets = { '0-30': 0, '30-60': 0, '60-90': 0, '90-180': 0, '180+': 0 };
    filteredInstallments.forEach(inst => {
      buckets[inst.ageing_bucket]++;
    });
    return Object.entries(buckets).map(([name, count]) => ({ name, count }));
  }, [filteredInstallments]);

  // Ageing amount data
  const ageingAmountData = useMemo(() => {
    const buckets = { '0-30': 0, '30-60': 0, '60-90': 0, '90-180': 0, '180+': 0 };
    filteredInstallments.forEach(inst => {
      buckets[inst.ageing_bucket] += inst.outstanding_amount;
    });
    return Object.entries(buckets).map(([name, amount]) => ({ name, amount }));
  }, [filteredInstallments]);

  // Billed/Unbilled stats
  const billedStats = useMemo(() => {
    const billed = filteredInstallments.filter(i => i.is_billed).length;
    const unbilled = filteredInstallments.filter(i => !i.is_billed).length;
    return {
      billed,
      unbilled,
      total: filteredInstallments.length,
      billed_amount: filteredInstallments.filter(i => i.is_billed).reduce((s, i) => s + i.demand_amount, 0),
      unbilled_amount: filteredInstallments.filter(i => !i.is_billed).reduce((s, i) => s + i.demand_amount, 0)
    };
  }, [filteredInstallments]);

  // Summary stats
  const summaryStats = useMemo(() => {
    return {
      total_demand: filteredInstallments.reduce((s, i) => s + i.demand_amount, 0),
      total_received: filteredInstallments.reduce((s, i) => s + i.received_amount, 0),
      total_outstanding: filteredInstallments.reduce((s, i) => s + i.outstanding_amount, 0),
      total_installments: filteredInstallments.length,
      collection_rate: filteredInstallments.length > 0 
        ? ((filteredInstallments.reduce((s, i) => s + i.received_amount, 0) / filteredInstallments.reduce((s, i) => s + i.demand_amount, 0)) * 100)
        : 0
    };
  }, [filteredInstallments]);

  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4'];

  return (
    <div className="installment-report">
      {/* Header */}
      <header className="report-header">
        <div className="header-content">
          <h1>📊 Installment Payment Analysis</h1>
          <p>Smartworld Sky Arc - Payment Plans & Milestones Report</p>
        </div>
      </header>

      {/* Summary Cards */}
      <section className="summary-cards">
        <div className="card card-demand">
          <DollarSign size={24} />
          <p className="label">Total Demand</p>
          <h3 className="value">₹{fmt(summaryStats.total_demand)}</h3>
          <p className="detail">{filteredInstallments.length} installments</p>
        </div>
        <div className="card card-received">
          <CheckCircle size={24} />
          <p className="label">Total Received</p>
          <h3 className="value">₹{fmt(summaryStats.total_received)}</h3>
          <p className="detail">{billedStats.billed} billed</p>
        </div>
        <div className="card card-outstanding">
          <Clock size={24} />
          <p className="label">Total Outstanding</p>
          <h3 className="value">₹{fmt(summaryStats.total_outstanding)}</h3>
          <p className="detail">{billedStats.unbilled} unbilled</p>
        </div>
        <div className="card card-rate">
          <TrendingUp size={24} />
          <p className="label">Collection Rate</p>
          <h3 className="value">{summaryStats.collection_rate.toFixed(1)}%</h3>
          <p className="detail">Payment tracking</p>
        </div>
        <div className="card card-sales">
          <FileText size={24} />
          <p className="label">Total Sales Orders</p>
          <h3 className="value">{data.summary.total_sales_orders}</h3>
          <p className="detail">Orders on file</p>
        </div>
        <div className="card card-units">
          <Home size={24} />
          <p className="label">Total Units</p>
          <h3 className="value">{data.summary.total_units}</h3>
          <p className="detail">Project units</p>
        </div>
      </section>

      {/* Filters */}
      <section className="filters-panel">
        <h3><Filter size={18} /> Filters</h3>
        <div className="filter-grid">
          <div className="filter-group">
            <label>Company</label>
            <select value={filters.company} onChange={(e) => setFilters({...filters, company: e.target.value})}>
              <option value="ALL">All Companies</option>
              {data.filters.companies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Project</label>
            <select value={filters.project} onChange={(e) => setFilters({...filters, project: e.target.value})}>
              <option value="ALL">All Projects</option>
              {data.filters.projects.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Tower</label>
            <select value={filters.tower} onChange={(e) => setFilters({...filters, tower: e.target.value})}>
              <option value="ALL">All Towers</option>
              {data.filters.towers.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Ageing (Days)</label>
            <select value={filters.ageingDays} onChange={(e) => setFilters({...filters, ageingDays: e.target.value})}>
              <option value="ALL">All Ageing</option>
              <option value="0-30">0-30 Days</option>
              <option value="30-60">30-60 Days</option>
              <option value="60-90">60-90 Days</option>
              <option value="90-180">90-180 Days</option>
              <option value="180-999">180+ Days</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Payment Plan</label>
            <select value={filters.unitType} onChange={(e) => setFilters({...filters, unitType: e.target.value})}>
              <option value="ALL">All Plans</option>
              {data.filters.payment_plans.map(p => <option key={p} value={p}>{p.substring(0, 20)}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* Billed/Unbilled Cards */}
      <section className="billed-section">
        <div className="status-card billed">
          <CheckCircle size={32} />
          <h3>Billed Milestones</h3>
          <p className="big-number">{billedStats.billed}</p>
          <p className="amount">₹{fmt(billedStats.billed_amount)}</p>
        </div>
        <div className="status-card unbilled">
          <Clock size={32} />
          <h3>Unbilled Milestones</h3>
          <p className="big-number">{billedStats.unbilled}</p>
          <p className="amount">₹{fmt(billedStats.unbilled_amount)}</p>
        </div>
      </section>

      {/* Charts */}
      <section className="charts-section">
        <h2>📈 Analytics</h2>
        
        <div className="charts-grid">
          {/* Installment Count by Ageing */}
          <div className="chart-card">
            <h3>Installment Count by Ageing</h3>
            {ageingCountData.some(d => d.count > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ageingCountData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="no-data">No data available</p>}
          </div>

          {/* Installment Amount by Ageing */}
          <div className="chart-card">
            <h3>Outstanding Amount by Ageing</h3>
            {ageingAmountData.some(d => d.amount > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ageingAmountData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(v) => fmt(v)} />
                  <Bar dataKey="amount" fill="#ef4444" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="no-data">No data available</p>}
          </div>

          {/* Billed vs Unbilled Pie */}
          <div className="chart-card">
            <h3>Billed vs Unbilled (Count)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Billed', value: billedStats.billed, fill: '#10b981' },
                    { name: 'Unbilled', value: billedStats.unbilled, fill: '#ef4444' }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value})`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {[{ fill: '#10b981' }, { fill: '#ef4444' }].map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => v} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Data Table */}
      <section className="table-section">
        <h2>📋 Top Installments</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Sales Order</th>
                <th>Unit</th>
                <th>Tower</th>
                <th>Demand</th>
                <th>Received</th>
                <th>Outstanding</th>
                <th>Status</th>
                <th>Ageing</th>
              </tr>
            </thead>
            <tbody>
              {filteredInstallments.slice(0, 10).map((inst, idx) => (
                <tr key={idx}>
                  <td className="so">{inst.sales_order}</td>
                  <td>{inst.unit_number.substring(0, 10)}</td>
                  <td>{inst.tower}</td>
                  <td>₹{fmt(inst.demand_amount)}</td>
                  <td>₹{fmt(inst.received_amount)}</td>
                  <td>₹{fmt(inst.outstanding_amount)}</td>
                  <td><span className={`status ${inst.is_billed ? 'billed' : 'unbilled'}`}>{inst.is_billed ? 'Billed' : 'Unbilled'}</span></td>
                  <td className={`ageing ageing-${inst.ageing_bucket.replace('-', '')}`}>{inst.ageing_bucket} days</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer */}
      <footer className="report-footer">
        <p>Total Records: {filteredInstallments.length} | Companies: {data.summary.total_sales_orders} | Towers: {data.summary.total_towers}</p>
      </footer>
    </div>
  );
};

export default InstallmentReport;
