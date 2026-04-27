import React, { useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, BarChart3, Activity, DollarSign, Calendar, Users, Building2 } from 'lucide-react';
import './LandingPage.css';
import data from './data/landingPageData.json';

const LandingPage = () => {
  const fmt = (n) => (n >= 1e8 ? (n / 1e7).toFixed(2) + ' Cr' : n >= 1e5 ? (n / 1e5).toFixed(2) + ' L' : (n / 1000).toFixed(1) + 'K');
  const fmtFull = (n) => n.toLocaleString('en-IN', { maximumFractionDigits: 0 });

  const COLORS = ['#1e40af', '#ea580c', '#059669', '#7c3aed', '#db2777', '#d97706'];

  const rateDistribution = useMemo(() => {
    return [
      { name: '0-25%', value: data.milestones.filter(m => m.rate >= 0 && m.rate < 25).length },
      { name: '25-50%', value: data.milestones.filter(m => m.rate >= 25 && m.rate < 50).length },
      { name: '50-75%', value: data.milestones.filter(m => m.rate >= 50 && m.rate < 75).length },
      { name: '75-100%', value: data.milestones.filter(m => m.rate >= 75).length }
    ];
  }, []);

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>📊 Smartworld Sky Arc</h1>
          <h2>Demand & Collection Analytics</h2>
          <p>Real Estate Project Financial Performance Dashboard</p>
        </div>
      </section>

      {/* Summary KPI Section */}
      <section className="kpi-summary">
        <div className="kpi-grid">
          <div className="kpi">
            <DollarSign size={32} />
            <h3>Total Demand</h3>
            <p className="amount">₹ {fmt(data.summary.total_demand)}</p>
            <p className="small">{fmtFull(data.summary.total_demand)}</p>
          </div>

          <div className="kpi">
            <Activity size={32} />
            <h3>Total Collected</h3>
            <p className="amount">₹ {fmt(data.summary.total_collected)}</p>
            <p className="small">{fmtFull(data.summary.total_collected)}</p>
          </div>

          <div className="kpi">
            <Calendar size={32} />
            <h3>Outstanding</h3>
            <p className="amount">₹ {fmt(data.summary.total_outstanding)}</p>
            <p className="small">{fmtFull(data.summary.total_outstanding)}</p>
          </div>

          <div className="kpi">
            <TrendingUp size={32} />
            <h3>Collection Rate</h3>
            <p className="amount">{data.summary.collection_rate}%</p>
            <p className="small">of total demand</p>
          </div>

          <div className="kpi">
            <Building2 size={32} />
            <h3>Total Units</h3>
            <p className="amount">{data.summary.total_units.toLocaleString()}</p>
            <p className="small">across all towers</p>
          </div>

          <div className="kpi">
            <Users size={32} />
            <h3>Total Customers</h3>
            <p className="amount">{data.summary.total_customers}</p>
            <p className="small">registered customers</p>
          </div>

          <div className="kpi">
            <BarChart3 size={32} />
            <h3>Towers</h3>
            <p className="amount">{data.summary.total_towers}</p>
            <p className="small">active towers</p>
          </div>
        </div>
      </section>

      {/* Charts Grid - Row 1 */}
      <section className="charts-grid">
        {/* Top Milestones */}
        <div className="chart-box">
          <h3>Top Milestones by Demand</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data.milestones.slice(0, 8)} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 10 }} />
              <YAxis label={{ value: 'Amount', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(v) => fmt(v)} />
              <Legend />
              <Bar dataKey="demand" fill="#3b82f6" name="Demand" />
              <Bar dataKey="collected" fill="#10b981" name="Collected" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tower Comparison */}
        <div className="chart-box">
          <h3>Tower-wise Performance</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data.towers}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tower" />
              <YAxis label={{ value: 'Amount', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(v) => fmt(v)} />
              <Legend />
              <Bar dataKey="demand" fill="#3b82f6" name="Demand" />
              <Bar dataKey="collected" fill="#10b981" name="Collected" />
              <Bar dataKey="outstanding" fill="#ef4444" name="Outstanding" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Charts Grid - Row 2 */}
      <section className="charts-grid">
        {/* Collection Rate Pie */}
        <div className="chart-box">
          <h3>Collection Rate Distribution</h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie data={rateDistribution} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name} (${value})`} outerRadius={100} fill="#8884d8" dataKey="value">
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Collection Trend */}
        <div className="chart-box">
          <h3>Milestone Trend - Collection Rate</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data.milestones} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 105]} label={{ value: 'Rate %', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(v) => v.toFixed(2) + '%'} />
              <Line type="monotone" dataKey="rate" stroke="#8b5cf6" dot={{ r: 4 }} name="Collection Rate" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Charts Grid - Row 3 */}
      <section className="charts-grid">
        {/* Cumulative Area Chart */}
        <div className="chart-box">
          <h3>Demand vs Collection Analysis</h3>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={data.milestones.slice(0, 10)} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 9 }} />
              <YAxis label={{ value: 'Amount', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(v) => fmt(v)} />
              <Legend />
              <Area type="monotone" dataKey="demand" fill="#3b82f6" stroke="#3b82f6" fillOpacity={0.6} name="Demand" />
              <Area type="monotone" dataKey="collected" fill="#10b981" stroke="#10b981" fillOpacity={0.6} name="Collected" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Tower Efficiency Radar */}
        <div className="chart-box">
          <h3>Tower Collection Efficiency</h3>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={data.towers}>
              <PolarGrid />
              <PolarAngleAxis dataKey="tower" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Collection Rate %" dataKey="rate" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
              <Legend />
              <Tooltip formatter={(v) => v.toFixed(2) + '%'} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Detailed Table */}
      <section className="table-section">
        <h2>Milestone-wise Detailed Analysis</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Milestone Name</th>
                <th>Total Demand</th>
                <th>Collected</th>
                <th>Outstanding</th>
                <th>Collection Rate</th>
              </tr>
            </thead>
            <tbody>
              {data.milestones.map((m, idx) => (
                <tr key={idx}>
                  <td>{m.name}</td>
                  <td className="amount">₹ {fmtFull(m.demand)}</td>
                  <td className="amount">₹ {fmtFull(m.collected)}</td>
                  <td className="amount">₹ {fmtFull(m.outstanding)}</td>
                  <td className={`rate ${m.rate >= 75 ? 'high' : m.rate >= 50 ? 'medium' : 'low'}`}>{m.rate.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <h2>Quick Statistics</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <h4>Highest Demand Milestone</h4>
            <p>{data.milestones[0]?.name}</p>
            <span>₹ {fmt(data.milestones[0]?.demand)}</span>
          </div>
          <div className="stat-item">
            <h4>Best Collection Rate</h4>
            <p>{data.milestones.reduce((a, b) => a.rate > b.rate ? a : b).name}</p>
            <span>{data.milestones.reduce((a, b) => a.rate > b.rate ? a : b).rate.toFixed(2)}%</span>
          </div>
          <div className="stat-item">
            <h4>Tower with Most Demand</h4>
            <p>Tower {data.towers.reduce((a, b) => a.demand > b.demand ? a : b).tower}</p>
            <span>₹ {fmt(data.towers.reduce((a, b) => a.demand > b.demand ? a : b).demand)}</span>
          </div>
          <div className="stat-item">
            <h4>Best Tower Performance</h4>
            <p>Tower {data.towers.reduce((a, b) => a.rate > b.rate ? a : b).tower}</p>
            <span>{data.towers.reduce((a, b) => a.rate > b.rate ? a : b).rate.toFixed(2)}%</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 Smartworld Sky Arc - Demand & Collection Analytics Dashboard</p>
        <p>Complete Real Estate Financial Analysis Platform</p>
      </footer>
    </div>
  );
};

export default LandingPage;
