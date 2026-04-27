import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, BarChart3, Activity, DollarSign, Calendar } from 'lucide-react';
import './App.css';
import demandData from './data/demandCollectionData.json';

const App = () => {
  const [selectedTower, setSelectedTower] = useState('ALL');
  const [selectedMilestoneGroup, setSelectedMilestoneGroup] = useState('TOP');

  // Format numbers
  const fmt = (n) => (n >= 1e8 ? (n / 1e7).toFixed(2) + ' Cr' : n >= 1e5 ? (n / 1e5).toFixed(2) + ' L' : (n / 1000).toFixed(1) + 'K');
  const fmtFull = (n) => n.toLocaleString('en-IN', { maximumFractionDigits: 0 });

  // Process data based on filters
  const processedData = useMemo(() => {
    let milestones = { ...demandData.milestones };
    
    // Get milestone array
    const milestoneSummary = Object.entries(milestones)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total_demand - a.total_demand);

    const topMilestones = milestoneSummary.slice(0, 10);
    const displayMilestones = selectedMilestoneGroup === 'TOP' ? topMilestones : milestoneSummary;

    return {
      milestones: displayMilestones,
      towers: Object.entries(demandData.towers).map(([tower, data]) => ({ tower, ...data })),
      summary: {
        total_demand: demandData.total_demand,
        total_collected: demandData.total_collected,
        total_outstanding: demandData.total_outstanding,
      }
    };
  }, [selectedMilestoneGroup]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalDemand = processedData.summary.total_demand;
    const totalCollected = processedData.summary.total_collected;
    const outstanding = processedData.summary.total_outstanding;
    const collectionRate = ((totalCollected / totalDemand) * 100).toFixed(2);

    return {
      totalDemand,
      totalCollected,
      outstanding,
      collectionRate
    };
  }, [processedData]);

  // Chart data - Milestone-wise Demand vs Collection
  const milestoneChartData = processedData.milestones.map(m => ({
    name: m.name.substring(0, 25) + (m.name.length > 25 ? '...' : ''),
    demand: m.total_demand,
    collected: m.total_collected,
    outstanding: m.outstanding,
    rate: m.collection_rate
  }));

  // Tower-wise summary
  const towerChartData = processedData.towers.map(t => ({
    tower: t.tower,
    demand: t.total_demand,
    collected: t.total_collected,
    outstanding: t.outstanding,
    rate: t.collection_rate
  }));

  // Collection rate distribution
  const rateDistribution = [
    { range: '0-25%', count: processedData.milestones.filter(m => m.collection_rate >= 0 && m.collection_rate < 25).length, value: 10 },
    { range: '25-50%', count: processedData.milestones.filter(m => m.collection_rate >= 25 && m.collection_rate < 50).length, value: 25 },
    { range: '50-75%', count: processedData.milestones.filter(m => m.collection_rate >= 50 && m.collection_rate < 75).length, value: 50 },
    { range: '75-100%', count: processedData.milestones.filter(m => m.collection_rate >= 75 && m.collection_rate <= 100).length, value: 75 },
  ];

  const COLORS = ['#1e40af', '#ea580c', '#059669', '#7c3aed', '#db2777', '#d97706'];

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <DollarSign size={28} />
            <h1>Demand & Collection Report</h1>
            <p>Smartworld Sky Arc - Milestone-wise Analysis</p>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="controls">
        <select value={selectedMilestoneGroup} onChange={(e) => setSelectedMilestoneGroup(e.target.value)} className="select">
          <option value="TOP">Top 10 Milestones</option>
          <option value="ALL">All Milestones</option>
        </select>
      </div>

      {/* KPI Cards */}
      <section className="kpi-section">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#3b82f6' }}>
            <BarChart3 size={24} color="#fff" />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Total Demand</p>
            <h3 className="kpi-value">₹ {fmt(kpis.totalDemand)}</h3>
            <span className="kpi-full">{fmtFull(kpis.totalDemand)}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#10b981' }}>
            <Activity size={24} color="#fff" />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Total Collected</p>
            <h3 className="kpi-value">₹ {fmt(kpis.totalCollected)}</h3>
            <span className="kpi-full">{fmtFull(kpis.totalCollected)}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#f59e0b' }}>
            <Calendar size={24} color="#fff" />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Outstanding</p>
            <h3 className="kpi-value">₹ {fmt(kpis.outstanding)}</h3>
            <span className="kpi-full">{fmtFull(kpis.outstanding)}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ backgroundColor: '#8b5cf6' }}>
            <TrendingUp size={24} color="#fff" />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Collection Rate</p>
            <h3 className="kpi-value">{kpis.collectionRate}%</h3>
            <span className="kpi-full">of total demand</span>
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section className="charts-section">
        
        {/* Milestone-wise Demand vs Collection */}
        <div className="chart-card">
          <h2 className="chart-title">Milestone-wise Demand vs Collection</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={milestoneChartData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} interval={0} tick={{ fontSize: 11 }} />
              <YAxis label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(v) => fmt(v)} />
              <Legend />
              <Bar dataKey="demand" fill="#3b82f6" name="Demand" />
              <Bar dataKey="collected" fill="#10b981" name="Collected" />
              <Bar dataKey="outstanding" fill="#ef4444" name="Outstanding" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tower-wise Summary */}
        <div className="chart-card">
          <h2 className="chart-title">Tower-wise Demand & Collection</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={towerChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tower" />
              <YAxis label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(v) => fmt(v)} />
              <Legend />
              <Bar dataKey="demand" fill="#3b82f6" name="Demand" />
              <Bar dataKey="collected" fill="#10b981" name="Collected" />
              <Bar dataKey="outstanding" fill="#ef4444" name="Outstanding" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Collection Rate Distribution */}
        <div className="chart-card">
          <h2 className="chart-title">Collection Rate Distribution</h2>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie data={rateDistribution} cx="50%" cy="50%" labelLine={false} label={({ range, count }) => `${range} (${count})`} outerRadius={100} fill="#8884d8" dataKey="count">
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Collection Rate Trend */}
        <div className="chart-card">
          <h2 className="chart-title">Top Milestones Collection Rate</h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={processedData.milestones.slice(0, 10)} margin={{ top: 5, right: 30, left: 0, bottom: 100 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} tick={{ fontSize: 10 }} />
              <YAxis label={{ value: 'Collection Rate (%)', angle: -90, position: 'insideLeft' }} domain={[0, 105]} />
              <Tooltip formatter={(v) => v.toFixed(2) + '%'} />
              <Line type="monotone" dataKey="collection_rate" stroke="#8b5cf6" dot={{ fill: '#8b5cf6', r: 5 }} activeDot={{ r: 8 }} name="Collection Rate" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Outstanding Amount Distribution */}
        <div className="chart-card">
          <h2 className="chart-title">Outstanding by Tower</h2>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie data={towerChartData} cx="50%" cy="50%" labelLine={false} label={({ tower }) => tower} outerRadius={100} fill="#8884d8" dataKey="outstanding">
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => fmt(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tower Collection Rate */}
        <div className="chart-card">
          <h2 className="chart-title">Tower-wise Collection Rate</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={towerChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tower" />
              <YAxis label={{ value: 'Rate (%)', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
              <Tooltip formatter={(v) => v.toFixed(2) + '%'} />
              <Bar dataKey="rate" fill="#7c3aed" name="Collection Rate (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Milestone-wise Table */}
      <section className="table-section">
        <h2 className="section-title">Milestone-wise Summary</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Milestone</th>
                <th>Total Demand</th>
                <th>Total Collected</th>
                <th>Outstanding</th>
                <th>Collection Rate</th>
                <th>Units</th>
                <th>Customers</th>
              </tr>
            </thead>
            <tbody>
              {processedData.milestones.map((milestone, idx) => (
                <tr key={idx}>
                  <td className="milestone-cell">{milestone.name}</td>
                  <td className="amount-cell">₹ {fmtFull(milestone.total_demand)}</td>
                  <td className="amount-cell">₹ {fmtFull(milestone.total_collected)}</td>
                  <td className="amount-cell">₹ {fmtFull(milestone.outstanding)}</td>
                  <td className={`rate-cell ${milestone.collection_rate >= 75 ? 'high' : milestone.collection_rate >= 50 ? 'medium' : 'low'}`}>
                    {milestone.collection_rate.toFixed(2)}%
                  </td>
                  <td>{milestone.unit_count}</td>
                  <td>{milestone.customer_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 Smartworld Sky Arc - Demand & Collection Report Dashboard</p>
      </footer>
    </div>
  );
};

export default App;
