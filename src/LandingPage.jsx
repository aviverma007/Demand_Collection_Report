import React, { useMemo, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { BarChart3, Activity, DollarSign, Calendar, Users, Building2, Filter } from 'lucide-react';
import './LandingPage.css';
import data from './data/advancedData.json';

const LandingPage = () => {
  const [selectedMilestones, setSelectedMilestones] = useState(6);

  const fmt = (n) => (n >= 1e8 ? (n / 1e7).toFixed(1) + 'Cr' : n >= 1e5 ? (n / 1e5).toFixed(1) + 'L' : (n / 1000).toFixed(0) + 'K');

  // Get top milestones based on filter
  const topMilestones = useMemo(() => {
    if (!data || !data.milestones) return [];
    
    let mileList = Object.entries(data.milestones)
      .map(([name, d]) => ({ 
        name: name.length > 18 ? name.substring(0, 18) + '..' : name, 
        fullName: name,
        ...d 
      }))
      .filter(m => m.total_demand && m.total_demand > 0)
      .sort((a, b) => b.total_demand - a.total_demand)
      .slice(0, selectedMilestones);
    
    return mileList;
  }, [selectedMilestones]);

  // Tower data
  const towerArray = useMemo(() => {
    if (!data || !data.towers) return [];
    return Object.entries(data.towers)
      .map(([tower, d]) => ({ tower, ...d }))
      .filter(t => t.total_demand && t.total_demand > 0);
  }, []);

  // Chart data for rate distribution
  const collectionRateData = useMemo(() => {
    if (topMilestones.length === 0) return [];
    return [
      { range: '0-25%', count: topMilestones.filter(m => m.collection_rate < 25).length, fill: '#ef4444' },
      { range: '25-50%', count: topMilestones.filter(m => m.collection_rate >= 25 && m.collection_rate < 50).length, fill: '#f59e0b' },
      { range: '50-75%', count: topMilestones.filter(m => m.collection_rate >= 50 && m.collection_rate < 75).length, fill: '#fbbf24' },
      { range: '75-100%', count: topMilestones.filter(m => m.collection_rate >= 75).length, fill: '#10b981' },
    ];
  }, [topMilestones]);

  if (!data || !data.summary) {
    return <div className="landing-page"><p style={{padding: '20px'}}>Loading data...</p></div>;
  }

  return (
    <div className="landing-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-card">
          <h1 className="animated-title">📊 Smartworld Sky Arc</h1>
          <h2 className="animated-subtitle">Analytics Dashboard</h2>
          <p className="animated-description">Real Estate Financial Intelligence</p>
        </div>
      </section>

      {/* Filters */}
      <section className="filters-section">
        <div className="filter-group">
          <Filter size={16} />
          <label>Show Milestones:</label>
          <select value={selectedMilestones} onChange={(e) => setSelectedMilestones(parseInt(e.target.value))}>
            <option value={3}>Top 3</option>
            <option value={5}>Top 5</option>
            <option value={6}>Top 6</option>
            <option value={8}>Top 8</option>
            <option value={10}>Top 10</option>
          </select>
          <span className="filter-result">({topMilestones.length} milestones)</span>
        </div>
      </section>

      {/* KPIs */}
      <section className="kpi-section">
        <h2 className="section-title">📊 Key Metrics</h2>
        <div className="kpi-container">
          <div className="kpi-card">
            <DollarSign size={18} />
            <p className="kpi-label">Demand</p>
            <h3 className="kpi-value">₹{fmt(data.summary.total_demand)}</h3>
          </div>
          <div className="kpi-card">
            <Activity size={18} />
            <p className="kpi-label">Collected</p>
            <h3 className="kpi-value">₹{fmt(data.summary.total_collected)}</h3>
          </div>
          <div className="kpi-card">
            <Calendar size={18} />
            <p className="kpi-label">Outstanding</p>
            <h3 className="kpi-value">₹{fmt(data.summary.total_outstanding)}</h3>
          </div>
          <div className="kpi-card">
            <BarChart3 size={18} />
            <p className="kpi-label">Rate</p>
            <h3 className="kpi-value">{((data.summary.total_collected / data.summary.total_demand) * 100).toFixed(1)}%</h3>
          </div>
          <div className="kpi-card">
            <Building2 size={18} />
            <p className="kpi-label">Units</p>
            <h3 className="kpi-value">{(data.summary.total_units / 1000).toFixed(1)}K</h3>
          </div>
          <div className="kpi-card">
            <Users size={18} />
            <p className="kpi-label">Customers</p>
            <h3 className="kpi-value">{data.summary.total_customers}</h3>
          </div>
        </div>
      </section>

      {/* Charts */}
      <section className="charts-section">
        <h2 className="section-title">📈 Visualizations</h2>
        
        <div className="charts-row">
          {/* Chart 1 */}
          <div className="chart-card">
            <h3>💰 Top Milestones</h3>
            {topMilestones.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={topMilestones} margin={{ top: 5, right: 5, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{fontSize: 7}} angle={-45} textAnchor="end" />
                  <YAxis tick={{fontSize: 7}} width={30} />
                  <Tooltip formatter={(v) => fmt(v)} contentStyle={{fontSize: '10px', backgroundColor: '#fff', border: '1px solid #ccc'}} />
                  <Bar dataKey="total_demand" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="total_collected" fill="#10b981" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p style={{padding: '10px', color: '#999'}}>No data available</p>}
          </div>

          {/* Chart 2 */}
          <div className="chart-card">
            <h3>🏢 Tower Performance</h3>
            {towerArray.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={towerArray} margin={{ top: 5, right: 5, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#e5e7eb" />
                  <XAxis dataKey="tower" tick={{fontSize: 7}} />
                  <YAxis tick={{fontSize: 7}} width={30} />
                  <Tooltip formatter={(v) => fmt(v)} contentStyle={{fontSize: '10px', backgroundColor: '#fff', border: '1px solid #ccc'}} />
                  <Bar dataKey="total_demand" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="total_collected" fill="#10b981" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="outstanding" fill="#ef4444" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p style={{padding: '10px', color: '#999'}}>No data available</p>}
          </div>

          {/* Chart 3 */}
          <div className="chart-card">
            <h3>📊 Rate Distribution</h3>
            {collectionRateData.length > 0 && collectionRateData.some(d => d.count > 0) ? (
              <ResponsiveContainer width="100%" height={160}>
                <PieChart margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <Pie data={collectionRateData} cx="45%" cy="50%" innerRadius={22} outerRadius={45} dataKey="count" paddingAngle={1}>
                    {collectionRateData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p style={{padding: '10px', color: '#999'}}>No data available</p>}
          </div>

          {/* Chart 4 */}
          <div className="chart-card">
            <h3>📈 Collection Trend</h3>
            {topMilestones.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={topMilestones} margin={{ top: 5, right: 5, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{fontSize: 7}} angle={-45} textAnchor="end" />
                  <YAxis tick={{fontSize: 7}} domain={[0, 105]} width={30} />
                  <Tooltip formatter={(v) => v.toFixed(1) + '%'} contentStyle={{fontSize: '10px', backgroundColor: '#fff', border: '1px solid #ccc'}} />
                  <Line type="monotone" dataKey="collection_rate" stroke="#8b5cf6" strokeWidth={2} dot={{r: 2}} />
                </LineChart>
              </ResponsiveContainer>
            ) : <p style={{padding: '10px', color: '#999'}}>No data available</p>}
          </div>

          {/* Chart 5 */}
          <div className="chart-card">
            <h3>💹 Demand vs Collected</h3>
            {topMilestones.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={topMilestones} margin={{ top: 5, right: 5, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{fontSize: 7}} angle={-45} textAnchor="end" />
                  <YAxis tick={{fontSize: 7}} width={30} />
                  <Tooltip formatter={(v) => fmt(v)} contentStyle={{fontSize: '10px', backgroundColor: '#fff', border: '1px solid #ccc'}} />
                  <Area type="monotone" dataKey="total_demand" fill="#3b82f6" fillOpacity={0.5} stroke="#3b82f6" />
                  <Area type="monotone" dataKey="total_collected" fill="#10b981" fillOpacity={0.5} stroke="#10b981" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <p style={{padding: '10px', color: '#999'}}>No data available</p>}
          </div>

          {/* Chart 6 */}
          <div className="chart-card">
            <h3>🎯 Tower Efficiency</h3>
            {towerArray.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <RadarChart data={towerArray} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="tower" tick={{fontSize: 7}} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{fontSize: 7}} />
                  <Radar dataKey="collection_rate" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            ) : <p style={{padding: '10px', color: '#999'}}>No data available</p>}
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="table-section">
        <h2 className="section-title">📋 Top Milestones Details</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Milestone</th>
                <th>Demand</th>
                <th>Collected</th>
                <th>Outstanding</th>
                <th>Rate %</th>
              </tr>
            </thead>
            <tbody>
              {topMilestones.slice(0, 5).map((m, idx) => (
                <tr key={idx}>
                  <td title={m.fullName} style={{maxWidth: '150px', overflow: 'hidden'}}>{m.name}</td>
                  <td>₹{fmt(m.total_demand)}</td>
                  <td>₹{fmt(m.total_collected)}</td>
                  <td>₹{fmt(m.outstanding)}</td>
                  <td className={`rate rate-${m.collection_rate >= 75 ? 'high' : m.collection_rate >= 50 ? 'mid' : 'low'}`}>
                    {m.collection_rate.toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 Smartworld Sky Arc | {data.summary.total_records ? data.summary.total_records.toLocaleString() : '12,078'} Records | {Object.keys(data.milestones).length} Milestones | {data.summary.total_towers} Towers</p>
      </footer>
    </div>
  );
};

export default LandingPage;
