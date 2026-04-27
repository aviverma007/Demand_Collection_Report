import React, { useMemo, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, BarChart3, Activity, DollarSign, Calendar, Users, Building2 } from 'lucide-react';
import './LandingPage.css';
import data from './data/advancedData.json';

const LandingPage = () => {
  const fmt = (n) => (n >= 1e8 ? (n / 1e7).toFixed(2) + ' Cr' : n >= 1e5 ? (n / 1e5).toFixed(2) + ' L' : (n / 1000).toFixed(1) + 'K');
  const fmtFull = (n) => n.toLocaleString('en-IN', { maximumFractionDigits: 0 });

  // Get top milestones
  const topMilestones = useMemo(() => {
    return Object.entries(data.milestones)
      .map(([name, d]) => ({ name: name.substring(0, 30), ...d }))
      .filter(m => m.total_demand > 0)
      .sort((a, b) => b.total_demand - a.total_demand)
      .slice(0, 10);
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
      <div className="animated-bg">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <section className="hero">
        <div className="hero-card">
          <div className="hero-content">
            <h1 className="animated-title">📊 Smartworld Sky Arc</h1>
            <h2 className="animated-subtitle">Analytics Dashboard</h2>
            <p className="animated-description">Real Estate Financial Intelligence</p>
          </div>
        </div>
      </section>

      <section className="kpi-section">
        <h2 className="section-title">Key Metrics</h2>
        <div className="kpi-container">
          <div className="kpi-card kpi-1">
            <DollarSign size={28} />
            <p className="kpi-label">Total Demand</p>
            <h3 className="kpi-value">₹ {fmt(data.summary.total_demand)}</h3>
            <p className="kpi-subtext">{fmtFull(data.summary.total_demand)}</p>
          </div>

          <div className="kpi-card kpi-2">
            <Activity size={28} />
            <p className="kpi-label">Collected</p>
            <h3 className="kpi-value">₹ {fmt(data.summary.total_collected)}</h3>
            <p className="kpi-subtext">{fmtFull(data.summary.total_collected)}</p>
          </div>

          <div className="kpi-card kpi-3">
            <Calendar size={28} />
            <p className="kpi-label">Outstanding</p>
            <h3 className="kpi-value">₹ {fmt(data.summary.total_outstanding)}</h3>
            <p className="kpi-subtext">{fmtFull(data.summary.total_outstanding)}</p>
          </div>

          <div className="kpi-card kpi-4">
            <TrendingUp size={28} />
            <p className="kpi-label">Collection Rate</p>
            <h3 className="kpi-value">{((data.summary.total_collected / data.summary.total_demand) * 100).toFixed(2)}%</h3>
            <p className="kpi-subtext">of total</p>
          </div>

          <div className="kpi-card kpi-5">
            <Building2 size={28} />
            <p className="kpi-label">Total Units</p>
            <h3 className="kpi-value">{data.summary.total_units.toLocaleString()}</h3>
            <p className="kpi-subtext">across towers</p>
          </div>

          <div className="kpi-card kpi-6">
            <Users size={28} />
            <p className="kpi-label">Customers</p>
            <h3 className="kpi-value">{data.summary.total_customers}</h3>
            <p className="kpi-subtext">registered</p>
          </div>

          <div className="kpi-card kpi-7">
            <BarChart3 size={28} />
            <p className="kpi-label">Towers</p>
            <h3 className="kpi-value">{data.summary.total_towers}</h3>
            <p className="kpi-subtext">active</p>
          </div>
        </div>
      </section>

      <section className="charts-section">
        <h2 className="section-title">Visualizations</h2>
        
        <div className="charts-row">
          <div className="chart-card">
            <h3>Top Milestones</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topMilestones.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{fontSize: 9}} angle={-35} textAnchor="end" height={70} />
                <YAxis tick={{fontSize: 9}} />
                <Tooltip formatter={(v) => fmt(v)} />
                <Bar dataKey="total_demand" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="total_collected" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Tower Performance</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={towerArray}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tower" tick={{fontSize: 9}} />
                <YAxis tick={{fontSize: 9}} />
                <Tooltip formatter={(v) => fmt(v)} />
                <Bar dataKey="total_demand" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="total_collected" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="outstanding" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Rate Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={collectionRateData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="count" paddingAngle={2}>
                  {collectionRateData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="charts-row">
          <div className="chart-card">
            <h3>Collection Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={topMilestones}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{fontSize: 9}} angle={-35} textAnchor="end" height={70} />
                <YAxis tick={{fontSize: 9}} domain={[0, 105]} />
                <Tooltip formatter={(v) => v.toFixed(2) + '%'} />
                <Line type="monotone" dataKey="collection_rate" stroke="#8b5cf6" dot={{fill: '#8b5cf6', r: 3}} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Demand vs Collection</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={topMilestones.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{fontSize: 9}} angle={-35} textAnchor="end" height={70} />
                <YAxis tick={{fontSize: 9}} />
                <Tooltip formatter={(v) => fmt(v)} />
                <Area type="monotone" dataKey="total_demand" fill="#3b82f6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="total_collected" fill="#10b981" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Tower Efficiency</h3>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={towerArray}>
                <PolarGrid />
                <PolarAngleAxis dataKey="tower" tick={{fontSize: 9}} />
                <PolarRadiusAxis domain={[0, 100]} />
                <Radar dataKey="collection_rate" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="table-section">
        <h2 className="section-title">Milestone Analysis</h2>
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
              {topMilestones.map((m, idx) => (
                <tr key={idx}>
                  <td>{m.name}</td>
                  <td>₹ {fmt(m.total_demand)}</td>
                  <td>₹ {fmt(m.total_collected)}</td>
                  <td>₹ {fmt(m.outstanding)}</td>
                  <td className={`rate rate-${m.collection_rate >= 75 ? 'high' : m.collection_rate >= 50 ? 'mid' : 'low'}`}>{m.collection_rate.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="footer">
        <p>© 2025 Smartworld Sky Arc | {data.summary.total_records.toLocaleString()} Records | {Object.keys(data.milestones).length} Milestones</p>
      </footer>
    </div>
  );
};

export default LandingPage;
