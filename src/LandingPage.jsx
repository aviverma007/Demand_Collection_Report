import React, { useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { BarChart3, Activity, DollarSign, Calendar, Users, Building2 } from 'lucide-react';
import './LandingPage.css';
import data from './data/advancedData.json';

const LandingPage = () => {
  const fmt = (n) => (n >= 1e8 ? (n / 1e7).toFixed(1) + 'Cr' : n >= 1e5 ? (n / 1e5).toFixed(1) + 'L' : (n / 1000).toFixed(0) + 'K');
  const fmtFull = (n) => n.toLocaleString('en-IN', { maximumFractionDigits: 0 });

  // Get top milestones
  const topMilestones = useMemo(() => {
    return Object.entries(data.milestones)
      .map(([name, d]) => ({ name: name.substring(0, 25), ...d }))
      .filter(m => m.total_demand > 0)
      .sort((a, b) => b.total_demand - a.total_demand)
      .slice(0, 6);
  }, []);

  // Tower data
  const towerArray = useMemo(() => {
    return Object.entries(data.towers).map(([tower, d]) => ({ tower, ...d }));
  }, []);

  const collectionRateData = [
    { range: '0-25%', count: topMilestones.filter(m => m.collection_rate < 25).length, fill: '#ef4444' },
    { range: '25-50%', count: topMilestones.filter(m => m.collection_rate >= 25 && m.collection_rate < 50).length, fill: '#f59e0b' },
    { range: '50-75%', count: topMilestones.filter(m => m.collection_rate >= 50 && m.collection_rate < 75).length, fill: '#fbbf24' },
    { range: '75-100%', count: topMilestones.filter(m => m.collection_rate >= 75).length, fill: '#10b981' },
  ];

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

      {/* KPIs */}
      <section className="kpi-section">
        <h2 className="section-title">Key Metrics</h2>
        <div className="kpi-container">
          <div className="kpi-card">
            <DollarSign size={20} />
            <p className="kpi-label">Demand</p>
            <h3 className="kpi-value">₹{fmt(data.summary.total_demand)}</h3>
          </div>
          <div className="kpi-card">
            <Activity size={20} />
            <p className="kpi-label">Collected</p>
            <h3 className="kpi-value">₹{fmt(data.summary.total_collected)}</h3>
          </div>
          <div className="kpi-card">
            <Calendar size={20} />
            <p className="kpi-label">Outstanding</p>
            <h3 className="kpi-value">₹{fmt(data.summary.total_outstanding)}</h3>
          </div>
          <div className="kpi-card">
            <BarChart3 size={20} />
            <p className="kpi-label">Rate</p>
            <h3 className="kpi-value">{((data.summary.total_collected / data.summary.total_demand) * 100).toFixed(1)}%</h3>
          </div>
          <div className="kpi-card">
            <Building2 size={20} />
            <p className="kpi-label">Units</p>
            <h3 className="kpi-value">{(data.summary.total_units / 1000).toFixed(1)}K</h3>
          </div>
          <div className="kpi-card">
            <Users size={20} />
            <p className="kpi-label">Customers</p>
            <h3 className="kpi-value">{data.summary.total_customers}</h3>
          </div>
        </div>
      </section>

      {/* Charts */}
      <section className="charts-section">
        <h2 className="section-title">Visualizations</h2>
        
        <div className="charts-row">
          {/* Chart 1: Top Milestones */}
          <div className="chart-card">
            <h3>Top Milestones</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={topMilestones.slice(0, 5)}>
                <CartesianGrid strokeDasharray="2 2" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{fontSize: 8}} angle={-30} textAnchor="end" height={50} />
                <YAxis tick={{fontSize: 8}} width={35} />
                <Tooltip formatter={(v) => fmt(v)} />
                <Bar dataKey="total_demand" fill="#3b82f6" name="Demand" radius={[3, 3, 0, 0]} />
                <Bar dataKey="total_collected" fill="#10b981" name="Collected" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 2: Tower Performance */}
          <div className="chart-card">
            <h3>Tower Performance</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={towerArray}>
                <CartesianGrid strokeDasharray="2 2" stroke="#f0f0f0" />
                <XAxis dataKey="tower" tick={{fontSize: 8}} />
                <YAxis tick={{fontSize: 8}} width={35} />
                <Tooltip formatter={(v) => fmt(v)} />
                <Bar dataKey="total_demand" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="total_collected" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="outstanding" fill="#ef4444" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 3: Collection Distribution */}
          <div className="chart-card">
            <h3>Rate Distribution</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={collectionRateData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="count" paddingAngle={1}>
                  {collectionRateData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 4: Trend Line */}
          <div className="chart-card">
            <h3>Collection Trend</h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={topMilestones}>
                <CartesianGrid strokeDasharray="2 2" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{fontSize: 8}} angle={-30} textAnchor="end" height={50} />
                <YAxis tick={{fontSize: 8}} domain={[0, 105]} width={35} />
                <Tooltip formatter={(v) => v.toFixed(1) + '%'} />
                <Line type="monotone" dataKey="collection_rate" stroke="#8b5cf6" dot={{r: 2}} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 5: Demand vs Collection */}
          <div className="chart-card">
            <h3>Demand vs Collection</h3>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={topMilestones.slice(0, 5)}>
                <CartesianGrid strokeDasharray="2 2" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{fontSize: 8}} angle={-30} textAnchor="end" height={50} />
                <YAxis tick={{fontSize: 8}} width={35} />
                <Tooltip formatter={(v) => fmt(v)} />
                <Area type="monotone" dataKey="total_demand" fill="#3b82f6" stroke="#3b82f6" fillOpacity={0.5} />
                <Area type="monotone" dataKey="total_collected" fill="#10b981" stroke="#10b981" fillOpacity={0.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 6: Tower Radar */}
          <div className="chart-card">
            <h3>Tower Efficiency</h3>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={towerArray}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="tower" tick={{fontSize: 8}} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{fontSize: 8}} />
                <Radar dataKey="collection_rate" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="table-section">
        <h2 className="section-title">Top Milestones</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Milestone</th>
                <th>Demand</th>
                <th>Collected</th>
                <th>Outstanding</th>
                <th>Rate</th>
              </tr>
            </thead>
            <tbody>
              {topMilestones.slice(0, 5).map((m, idx) => (
                <tr key={idx}>
                  <td>{m.name}</td>
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
        <p>© 2025 Smartworld Sky Arc | {data.summary.total_records.toLocaleString()} Records | {Object.keys(data.milestones).length} Milestones</p>
      </footer>
    </div>
  );
};

export default LandingPage;
