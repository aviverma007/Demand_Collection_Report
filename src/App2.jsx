import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, BarChart3, Activity, DollarSign, Calendar, Users, Building2, Filter } from 'lucide-react';
import './App2.css';
import advancedData from './data/advancedData.json';

const App2 = () => {
  const [viewMode, setViewMode] = useState('overview');
  const [selectedTower, setSelectedTower] = useState('ALL');
  const [sortBy, setSortBy] = useState('demand');

  // Format numbers
  const fmt = (n) => (n >= 1e8 ? (n / 1e7).toFixed(2) + ' Cr' : n >= 1e5 ? (n / 1e5).toFixed(2) + ' L' : (n / 1000).toFixed(1) + 'K');
  const fmtFull = (n) => n.toLocaleString('en-IN', { maximumFractionDigits: 0 });

  // Process milestone data
  const sortedMilestones = useMemo(() => {
    const milestonesArray = Object.entries(advancedData.milestones)
      .map(([name, data]) => ({ name, ...data }))
      .filter(m => m.total_demand > 0)
      .sort((a, b) => {
        if (sortBy === 'demand') return b.total_demand - a.total_demand;
        if (sortBy === 'collection') return b.total_collected - a.total_collected;
        if (sortBy === 'rate') return b.collection_rate - a.collection_rate;
        return b.outstanding - a.outstanding;
      });
    return milestonesArray;
  }, [sortBy]);

  // Tower data
  const towerData = useMemo(() => {
    return Object.entries(advancedData.towers).map(([tower, data]) => ({ tower, ...data }));
  }, []);

  // Top customers
  const topCustomers = useMemo(() => {
    return Object.entries(advancedData.customers)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total_demand - a.total_demand)
      .slice(0, 10);
  }, []);

  // Collection rate categories
  const categoryDistribution = useMemo(() => {
    return [
      { name: '0-25%', count: sortedMilestones.filter(m => m.collection_rate >= 0 && m.collection_rate < 25).length },
      { name: '25-50%', count: sortedMilestones.filter(m => m.collection_rate >= 25 && m.collection_rate < 50).length },
      { name: '50-75%', count: sortedMilestones.filter(m => m.collection_rate >= 50 && m.collection_rate < 75).length },
      { name: '75-100%', count: sortedMilestones.filter(m => m.collection_rate >= 75 && m.collection_rate <= 100).length },
    ];
  }, [sortedMilestones]);

  // Unit distribution
  const unitDistribution = useMemo(() => {
    return Object.entries(advancedData.milestones)
      .map(([name, data]) => ({ milestone: name.substring(0, 20), units: data.unit_count }))
      .sort((a, b) => b.units - a.units)
      .slice(0, 10);
  }, []);

  const COLORS = ['#1e40af', '#ea580c', '#059669', '#7c3aed', '#db2777', '#d97706', '#f97316', '#06b6d4'];

  return (
    <div className="app2">
      {/* Header */}
      <header className="header2">
        <div className="header-content2">
          <h1>📊 Advanced Analytics Dashboard</h1>
          <p>Smartworld Sky Arc - Comprehensive Demand & Collection Analysis</p>
        </div>
      </header>

      {/* View Mode Selector */}
      <div className="view-selector">
        <button className={`view-btn ${viewMode === 'overview' ? 'active' : ''}`} onClick={() => setViewMode('overview')}>Overview</button>
        <button className={`view-btn ${viewMode === 'milestones' ? 'active' : ''}`} onClick={() => setViewMode('milestones')}>Milestones</button>
        <button className={`view-btn ${viewMode === 'towers' ? 'active' : ''}`} onClick={() => setViewMode('towers')}>Towers</button>
        <button className={`view-btn ${viewMode === 'customers' ? 'active' : ''}`} onClick={() => setViewMode('customers')}>Customers</button>
        <button className={`view-btn ${viewMode === 'analytics' ? 'active' : ''}`} onClick={() => setViewMode('analytics')}>Analytics</button>
      </div>

      {/* Summary Cards */}
      <section className="summary-cards">
        <div className="card stat-card">
          <h3>₹ {fmt(advancedData.summary.total_demand)}</h3>
          <p>Total Demand</p>
        </div>
        <div className="card stat-card">
          <h3>₹ {fmt(advancedData.summary.total_collected)}</h3>
          <p>Total Collected</p>
        </div>
        <div className="card stat-card">
          <h3>₹ {fmt(advancedData.summary.total_outstanding)}</h3>
          <p>Outstanding</p>
        </div>
        <div className="card stat-card">
          <h3>{((advancedData.summary.total_collected / advancedData.summary.total_demand) * 100).toFixed(2)}%</h3>
          <p>Collection Rate</p>
        </div>
        <div className="card stat-card">
          <h3>{advancedData.summary.total_units.toLocaleString()}</h3>
          <p>Total Units</p>
        </div>
        <div className="card stat-card">
          <h3>{advancedData.summary.total_towers}</h3>
          <p>Towers</p>
        </div>
        <div className="card stat-card">
          <h3>{advancedData.summary.total_customers}</h3>
          <p>Customers</p>
        </div>
      </section>

      {/* Overview View */}
      {viewMode === 'overview' && (
        <section className="view-section">
          <div className="charts-grid">
            {/* Tower Comparison */}
            <div className="chart-card">
              <h2>Tower-wise Performance</h2>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={towerData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tower" />
                  <YAxis />
                  <Tooltip formatter={(v) => fmt(v)} />
                  <Legend />
                  <Bar dataKey="total_demand" fill="#3b82f6" name="Demand" />
                  <Bar dataKey="total_collected" fill="#10b981" name="Collected" />
                  <Bar dataKey="outstanding" fill="#ef4444" name="Outstanding" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Collection Rate Pie */}
            <div className="chart-card">
              <h2>Collection Rate Distribution</h2>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie data={categoryDistribution} cx="50%" cy="50%" labelLine={false} label={({ name, count }) => `${name} (${count})`} outerRadius={100} fill="#8884d8" dataKey="count">
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top 10 Milestones */}
            <div className="chart-card full-width">
              <h2>Top 10 Milestones by Demand</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sortedMilestones.slice(0, 10)} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 10 }} interval={0} />
                  <YAxis label={{ value: 'Amount', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(v) => fmt(v)} />
                  <Legend />
                  <Bar dataKey="total_demand" fill="#3b82f6" name="Demand" />
                  <Bar dataKey="total_collected" fill="#10b981" name="Collected" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Unit Distribution */}
            <div className="chart-card">
              <h2>Unit Distribution (Top 10 Milestones)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={unitDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="milestone" type="category" width={150} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="units" fill="#7c3aed" name="Units" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Collection Trend */}
            <div className="chart-card">
              <h2>Tower Collection Efficiency</h2>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={towerData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="tower" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Collection Rate %" dataKey="collection_rate" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Customers */}
            <div className="chart-card">
              <h2>Top 10 Customers by Demand</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topCustomers} layout="vertical" margin={{ left: 200 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={190} tick={{ fontSize: 9 }} />
                  <Tooltip formatter={(v) => fmt(v)} />
                  <Bar dataKey="total_demand" fill="#3b82f6" name="Demand" />
                  <Bar dataKey="total_collected" fill="#10b981" name="Collected" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      )}

      {/* Milestones View */}
      {viewMode === 'milestones' && (
        <section className="view-section">
          <div className="filter-bar">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
              <option value="demand">Sort by Demand</option>
              <option value="collection">Sort by Collection</option>
              <option value="rate">Sort by Collection Rate</option>
              <option value="outstanding">Sort by Outstanding</option>
            </select>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Milestone</th>
                  <th>Total Demand</th>
                  <th>Collected</th>
                  <th>Outstanding</th>
                  <th>Collection %</th>
                  <th>Units</th>
                  <th>Customers</th>
                  <th>Avg/Unit</th>
                </tr>
              </thead>
              <tbody>
                {sortedMilestones.map((m, idx) => (
                  <tr key={idx}>
                    <td>{m.name}</td>
                    <td className="amount">₹ {fmtFull(m.total_demand)}</td>
                    <td className="amount">₹ {fmtFull(m.total_collected)}</td>
                    <td className="amount">₹ {fmtFull(m.outstanding)}</td>
                    <td className={`rate ${m.collection_rate >= 75 ? 'high' : m.collection_rate >= 50 ? 'medium' : 'low'}`}>{m.collection_rate.toFixed(2)}%</td>
                    <td>{m.unit_count}</td>
                    <td>{m.customer_count}</td>
                    <td>₹ {fmtFull(m.avg_collection_per_unit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Towers View */}
      {viewMode === 'towers' && (
        <section className="view-section">
          <div className="grid-2">
            {towerData.map((tower, idx) => (
              <div key={idx} className="card tower-card">
                <h3>Tower {tower.tower}</h3>
                <div className="stat-row">
                  <span>Demand:</span>
                  <strong>₹ {fmt(tower.total_demand)}</strong>
                </div>
                <div className="stat-row">
                  <span>Collected:</span>
                  <strong className="green">₹ {fmt(tower.total_collected)}</strong>
                </div>
                <div className="stat-row">
                  <span>Outstanding:</span>
                  <strong className="red">₹ {fmt(tower.outstanding)}</strong>
                </div>
                <div className="stat-row">
                  <span>Collection Rate:</span>
                  <strong>{tower.collection_rate.toFixed(2)}%</strong>
                </div>
                <div className="stat-row">
                  <span>Units:</span>
                  <strong>{tower.unit_count}</strong>
                </div>
                <div className="stat-row">
                  <span>Avg/Unit:</span>
                  <strong>₹ {fmt(tower.avg_demand_per_unit)}</strong>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Customers View */}
      {viewMode === 'customers' && (
        <section className="view-section">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Total Demand</th>
                  <th>Collected</th>
                  <th>Outstanding</th>
                  <th>Collection %</th>
                  <th>Units</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(advancedData.customers)
                  .map(([name, data]) => ({ name, ...data }))
                  .sort((a, b) => b.total_demand - a.total_demand)
                  .map((customer, idx) => (
                    <tr key={idx}>
                      <td>{customer.name}</td>
                      <td className="amount">₹ {fmtFull(customer.total_demand)}</td>
                      <td className="amount">₹ {fmtFull(customer.total_collected)}</td>
                      <td className="amount">₹ {fmtFull(customer.outstanding)}</td>
                      <td className={`rate ${customer.collection_rate >= 75 ? 'high' : customer.collection_rate >= 50 ? 'medium' : 'low'}`}>
                        {customer.collection_rate.toFixed(2)}%
                      </td>
                      <td>{customer.unit_count}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Analytics View */}
      {viewMode === 'analytics' && (
        <section className="view-section">
          <div className="charts-grid">
            {/* Cumulative Collection */}
            <div className="chart-card full-width">
              <h2>Cumulative Demand vs Collection</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={sortedMilestones.slice(0, 15)} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 9 }} interval={0} />
                  <YAxis label={{ value: 'Amount', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(v) => fmt(v)} />
                  <Legend />
                  <Area type="monotone" dataKey="total_demand" fill="#3b82f6" stroke="#3b82f6" fillOpacity={0.6} name="Demand" />
                  <Area type="monotone" dataKey="total_collected" fill="#10b981" stroke="#10b981" fillOpacity={0.6} name="Collected" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Collection Rate Trend */}
            <div className="chart-card full-width">
              <h2>Collection Rate Trend (Top 20 Milestones)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={sortedMilestones.slice(0, 20)} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 9 }} interval={0} />
                  <YAxis domain={[0, 105]} label={{ value: 'Rate %', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(v) => v.toFixed(2) + '%'} />
                  <Line type="monotone" dataKey="collection_rate" stroke="#8b5cf6" dot={{ r: 3 }} name="Collection Rate" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Demand vs Units Scatter */}
            <div className="chart-card">
              <h2>Demand vs Units Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="unit_count" name="Units" />
                  <YAxis type="number" dataKey="total_demand" name="Demand" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(v) => fmt(v)} />
                  <Scatter name="Milestones" data={sortedMilestones} fill="#7c3aed" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Outstanding Analysis */}
            <div className="chart-card">
              <h2>Outstanding Amount by Tower</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={towerData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tower" />
                  <YAxis />
                  <Tooltip formatter={(v) => fmt(v)} />
                  <Bar dataKey="outstanding" fill="#ef4444" name="Outstanding" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Customer Distribution */}
            <div className="chart-card">
              <h2>Towers Share by Customers</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={towerData} cx="50%" cy="50%" labelLine={false} label={({ tower }) => tower} outerRadius={100} fill="#8884d8" dataKey="unit_count">
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="footer2">
        <p>© 2025 Smartworld Sky Arc - Advanced Analytics Dashboard | Total Records: {advancedData.summary.total_records.toLocaleString()}</p>
      </footer>
    </div>
  );
};

export default App2;
