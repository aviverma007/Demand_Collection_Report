import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart
} from 'recharts';
import data from './dashboardData.json';
import './SalesDashboard.css';

// ─── helpers ────────────────────────────────────────────────────────────────
const cr = (n) => `₹${(+n).toFixed(2)} Cr`;
const fmt = (n) => n >= 1000 ? `${(n/1000).toFixed(1)}K` : `${n}`;

const BUCKET_COLORS = {
  '1–30 Days':   '#22c55e',
  '31–90 Days':  '#f59e0b',
  '91–180 Days': '#ef4444',
  '181+ Days':   '#7c3aed',
  'Not Yet Due': '#06b6d4',
};
const TOWER_COLORS = ['#1e3a8a','#8b5a3c','#0891b2','#15803d','#9333ea','#dc2626'];
const CHART_BLUE = '#1e3a8a';
const CHART_BROWN = '#8b5a3c';

// Ageing chart data
const ageingBuckets = ['1–30 Days','31–90 Days','91–180 Days','181+ Days','Not Yet Due'];
const ageingCountData = ageingBuckets.map(b => ({
  name: b,
  count: data.ageing[b]?.count ?? 0,
  fill: BUCKET_COLORS[b]
}));
const ageingAmountData = ageingBuckets.map(b => ({
  name: b,
  amount: data.ageing[b]?.amount ?? 0,
  fill: BUCKET_COLORS[b]
}));

// Billed vs Unbilled pie
const billedPie = [
  { name: 'Billed',   value: data.summary.billed_count,   fill: '#1e3a8a' },
  { name: 'Unbilled', value: data.summary.unbilled_count, fill: '#d4a574' },
];

// Tower comparison
const towerDemandReceived = data.tower_list.map(t => ({
  name: t.tower, demand: t.demand, received: t.received, outstanding: t.outstanding
}));

// Radar – tower collection rates
const towerRadar = data.tower_list.map(t => ({ subject: t.tower, rate: t.collection_rate }));

// Custom tooltip
const CustomTooltip = ({ active, payload, label, prefix='', suffix='' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p className="tt-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.fill || p.color }}>
          {p.name}: {prefix}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}{suffix}
        </p>
      ))}
    </div>
  );
};

// ─── KPI Card ────────────────────────────────────────────────────────────────
const KpiCard = ({ label, value, sub, accent, icon, delay=0 }) => (
  <div className="kpi-card" style={{ '--accent': accent, animationDelay: `${delay}s` }}>
    <div className="kpi-icon">{icon}</div>
    <div className="kpi-body">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-sub">{sub}</div>
    </div>
    <div className="kpi-glow" />
  </div>
);

// ─── Chart Card ─────────────────────────────────────────────────────────────
const ChartCard = ({ title, subtitle, children, wide }) => (
  <div className={`chart-card ${wide ? 'wide' : ''}`}>
    <div className="chart-header">
      <div className="chart-title">{title}</div>
      {subtitle && <div className="chart-sub">{subtitle}</div>}
    </div>
    {children}
  </div>
);

// ─── Sliding Milestone Table ─────────────────────────────────────────────────
const MilestoneTable = ({ rows }) => {
  const [page, setPage] = useState(0);
  const PER = 8;
  const total = rows.length;
  const pages = Math.ceil(total / PER);
  const slice = rows.slice(page * PER, (page+1) * PER);
  return (
    <div className="slide-table-wrap">
      <table className="slide-table">
        <thead>
          <tr>
            <th>MILESTONE</th>
            <th>AGEING BUCKET</th>
            <th>BILLED COUNT</th>
            <th>BILLED AMT (Cr)</th>
            <th>UNBILLED COUNT</th>
            <th>UNBILLED AMT (Cr)</th>
          </tr>
        </thead>
        <tbody>
          {slice.map((m, i) => (
            <tr key={i} className={i % 2 === 0 ? 'row-even' : 'row-odd'}>
              <td className="ms-name" title={m.name}>{m.name.length > 55 ? m.name.slice(0,55)+'…' : m.name}</td>
              <td>
                <span className="bucket-tag" style={{ background: BUCKET_COLORS[m.ageing_bucket] ?? '#999' }}>
                  {m.ageing_bucket}
                </span>
              </td>
              <td>{m.billed_count}</td>
              <td>₹{m.billed_amount}</td>
              <td className="unbilled-cell">{m.unbilled_count}</td>
              <td>₹{m.unbilled_amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button disabled={page === 0} onClick={() => setPage(p => p-1)}>← Prev</button>
        <span>Page {page+1} of {pages} · {total} milestones</span>
        <button disabled={page >= pages-1} onClick={() => setPage(p => p+1)}>Next →</button>
      </div>
    </div>
  );
};

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function SalesDashboard() {
  const [filterCompany, setFilterCompany] = useState('All');
  const [filterProject, setFilterProject] = useState('All');
  const [activeTab, setActiveTab] = useState('overview');

  const s = data.summary;

  const sortedMilestones = useMemo(() =>
    [...data.milestone_list].sort((a,b) => b.billed_count - a.billed_count), []);

  return (
    <div className="dashboard">
      {/* Animated BG */}
      <div className="bg-orbs">
        <div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" />
      </div>

      {/* ── HEADER ── */}
      <header className="dash-header">
        <div className="header-left">
          <div className="brand-badge">SW</div>
          <div>
            <h1 className="dash-title">Smartworld Sales Dashboard</h1>
            <p className="dash-sub">Real Estate Sales &amp; Payment Analysis · Sky Arc Project</p>
          </div>
        </div>
        <div className="header-right">
          <span className="live-dot" />
          <span className="live-label">LIVE</span>
          <span className="header-stat">{s.total_units} units · {s.total_records.toLocaleString()} records</span>
        </div>
      </header>

      {/* ── FILTERS ── */}
      <div className="filters-row">
        <span className="filter-icon">⚙</span>
        <label>Project
          <select value={filterProject} onChange={e => setFilterProject(e.target.value)}>
            <option>All</option>
            {s.projects.map(p => <option key={p}>{p}</option>)}
          </select>
        </label>
        <label>Company
          <select value={filterCompany} onChange={e => setFilterCompany(e.target.value)}>
            <option>All</option>
            {s.companies.map(c => <option key={c}>{c}</option>)}
          </select>
        </label>
        <button className="reset-btn" onClick={() => { setFilterProject('All'); setFilterCompany('All'); }}>
          ↺ Reset
        </button>
      </div>

      {/* ── NAV TABS ── */}
      <div className="tab-nav">
        {[['overview','Overview'],['ageing','Ageing Analysis'],['milestones','Milestones'],['towers','Towers']].map(([id,label]) => (
          <button key={id} className={`tab-btn ${activeTab===id?'active':''}`} onClick={() => setActiveTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {/* ── KPI CARDS ── */}
      <section className="kpi-grid">
        <KpiCard label="TOTAL UNITS" value={s.total_units} sub="Unique properties" accent="#3b82f6" icon="🏢" delay={0} />
        <KpiCard label="BOOKED UNITS" value={s.total_sales_orders} sub="Sales orders" accent="#8b5a3c" icon="📋" delay={0.05} />
        <KpiCard label="TOTAL DEMAND" value={cr(s.total_demand_cr)} sub={`${s.total_records.toLocaleString()} installments`} accent="#7c3aed" icon="💰" delay={0.1} />
        <KpiCard label="RECEIVED" value={cr(s.total_received_cr)} sub={`${s.collection_rate}% collected`} accent="#16a34a" icon="✅" delay={0.15} />
        <KpiCard label="OUTSTANDING" value={cr(s.total_outstanding_cr)} sub="Pending payment" accent="#dc2626" icon="⏳" delay={0.2} />
        <KpiCard label="BILLED" value={s.billed_count.toLocaleString()} sub="Invoices raised" accent="#0891b2" icon="🧾" delay={0.25} />
        <KpiCard label="UNBILLED" value={s.unbilled_count.toLocaleString()} sub="Pending invoicing" accent="#f59e0b" icon="🔔" delay={0.3} />
        <KpiCard label="MILESTONES" value={s.total_milestones} sub={`${s.total_towers} towers`} accent="#db2777" icon="📌" delay={0.35} />
      </section>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <div className="tab-content">
          <div className="charts-grid">
            {/* 1. Monthly Demand vs Received */}
            <ChartCard title="Monthly Demand vs Received" subtitle="Amount in Crores" wide>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data.monthly} margin={{top:10,right:20,left:0,bottom:0}}>
                  <defs>
                    <linearGradient id="gDemand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_BLUE} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={CHART_BLUE} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gReceived" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_BROWN} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={CHART_BROWN} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{fontSize:10}} />
                  <YAxis tick={{fontSize:10}} />
                  <Tooltip content={<CustomTooltip prefix="₹" suffix=" Cr" />} />
                  <Legend />
                  <Area type="monotone" dataKey="demand" name="Demand" stroke={CHART_BLUE} fill="url(#gDemand)" strokeWidth={2} />
                  <Area type="monotone" dataKey="received" name="Received" stroke={CHART_BROWN} fill="url(#gReceived)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* 2. Billed vs Unbilled Pie */}
            <ChartCard title="Billed vs Unbilled" subtitle="Milestone count">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={billedPie} cx="50%" cy="45%" outerRadius={90} innerRadius={45}
                    dataKey="value" nameKey="name" label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`}
                    labelLine={true}>
                    {billedPie.map((e,i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* 3. Tower Collection Rate */}
            <ChartCard title="Tower Collection Rate" subtitle="% of demand received">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.tower_list} margin={{top:10,right:10,left:0,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="tower" />
                  <YAxis domain={[0,100]} unit="%" />
                  <Tooltip formatter={(v)=>`${v}%`} />
                  <Bar dataKey="collection_rate" name="Collection Rate" fill={CHART_BLUE} radius={[8,8,0,0]}>
                    {data.tower_list.map((_, i) => <Cell key={i} fill={TOWER_COLORS[i % TOWER_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* 4. Tower Radar */}
            <ChartCard title="Tower Efficiency Radar" subtitle="Collection rate comparison">
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={towerRadar}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{fontSize:12,fontWeight:600}} />
                  <PolarRadiusAxis angle={30} domain={[60,80]} tick={{fontSize:9}} />
                  <Radar name="Collection Rate" dataKey="rate" stroke={CHART_BLUE} fill={CHART_BLUE} fillOpacity={0.25} strokeWidth={2} />
                  <Tooltip formatter={(v)=>`${v}%`} />
                </RadarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* 5. Tower Demand vs Received vs Outstanding */}
            <ChartCard title="Tower Financial Breakdown" subtitle="Crores" wide>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={towerDemandReceived} margin={{top:10,right:20,left:0,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" />
                  <YAxis unit=" Cr" tick={{fontSize:10}} />
                  <Tooltip formatter={(v)=>`₹${v} Cr`} />
                  <Legend />
                  <Bar dataKey="demand" name="Demand" fill={CHART_BLUE} radius={[4,4,0,0]} />
                  <Bar dataKey="received" name="Received" fill={CHART_BROWN} radius={[4,4,0,0]} />
                  <Bar dataKey="outstanding" name="Outstanding" fill="#ef4444" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      )}

      {/* ── AGEING TAB ── */}
      {activeTab === 'ageing' && (
        <div className="tab-content">
          {/* Ageing summary cards */}
          <div className="ageing-summary">
            {ageingBuckets.map(b => (
              <div key={b} className="age-card" style={{'--color': BUCKET_COLORS[b]}}>
                <div className="age-bucket">{b}</div>
                <div className="age-count">{(data.ageing[b]?.count ?? 0).toLocaleString()}</div>
                <div className="age-amount">₹{data.ageing[b]?.amount ?? 0} Cr</div>
              </div>
            ))}
          </div>

          <div className="charts-grid">
            {/* 6. Ageing Count */}
            <ChartCard title="Installment Count by Ageing" subtitle="Number of records in each bucket">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ageingCountData} margin={{top:10,right:10,left:0,bottom:10}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{fontSize:10}} />
                  <YAxis />
                  <Tooltip formatter={(v)=>v.toLocaleString()} />
                  <Bar dataKey="count" name="Count" label={{position:'top',fontSize:11,fontWeight:700}} radius={[8,8,0,0]}>
                    {ageingCountData.map((e,i) => <Cell key={i} fill={e.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* 7. Ageing Amount */}
            <ChartCard title="Outstanding Amount by Ageing" subtitle="Crores">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ageingAmountData} margin={{top:10,right:10,left:0,bottom:10}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{fontSize:10}} />
                  <YAxis unit=" Cr" />
                  <Tooltip formatter={(v)=>`₹${v} Cr`} />
                  <Bar dataKey="amount" name="Amount" label={{position:'top',fontSize:10,fontWeight:700,formatter:(v)=>`${v}Cr`}} radius={[8,8,0,0]}>
                    {ageingAmountData.map((e,i) => <Cell key={i} fill={e.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* 8. Ageing Pie */}
            <ChartCard title="Ageing Distribution" subtitle="Outstanding amount split">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={ageingAmountData.filter(d=>d.amount>0)} cx="50%" cy="50%"
                    outerRadius={100} innerRadius={50} dataKey="amount" nameKey="name"
                    label={({name,percent})=>`${name.split(' ')[0]} ${(percent*100).toFixed(0)}%`}>
                    {ageingAmountData.map((e,i)=> <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip formatter={(v)=>`₹${v} Cr`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      )}

      {/* ── MILESTONES TAB ── */}
      {activeTab === 'milestones' && (
        <div className="tab-content">
          <div className="charts-grid">
            {/* 9. Unbilled Count */}
            <ChartCard title="Unbilled Milestone Count by Milestone" subtitle="Top 10 milestones with highest unbilled count" wide>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data.top_unbilled_count} layout="vertical" margin={{top:5,right:30,left:5,bottom:5}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={200} tick={{fontSize:9}} />
                  <Tooltip formatter={(v)=>v.toLocaleString()} />
                  <Bar dataKey="unbilled_count" name="Unbilled Count" fill={CHART_BLUE} radius={[0,8,8,0]}
                    label={{position:'right',fontSize:10,fontWeight:700}} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* 10. Unbilled Amount */}
            <ChartCard title="Unbilled Installment Amount Crs by Milestone" subtitle="Top 10 milestones by unbilled amount" wide>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data.top_unbilled_amount} layout="vertical" margin={{top:5,right:40,left:5,bottom:5}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" unit=" Cr" />
                  <YAxis type="category" dataKey="name" width={200} tick={{fontSize:9}} />
                  <Tooltip formatter={(v)=>`₹${v} Cr`} />
                  <Bar dataKey="unbilled_amount" name="Unbilled Amount" fill={CHART_BROWN} radius={[0,8,8,0]}
                    label={{position:'right',fontSize:10,fontWeight:700,formatter:(v)=>`${v}Cr`}} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Milestone Table with pagination */}
          <section className="section-block">
            <div className="section-head">
              <h2>Milestone Summary Table</h2>
              <span className="section-badge">{sortedMilestones.length} milestones · scroll through all</span>
            </div>
            <MilestoneTable rows={sortedMilestones} />
          </section>
        </div>
      )}

      {/* ── TOWERS TAB ── */}
      {activeTab === 'towers' && (
        <div className="tab-content">
          {/* Tower KPIs */}
          <div className="tower-cards">
            {data.tower_list.map((t,i) => (
              <div key={i} className="tower-card" style={{'--tc': TOWER_COLORS[i % TOWER_COLORS.length]}}>
                <div className="tc-name">{t.tower}</div>
                <div className="tc-stat"><span>Demand</span><strong>₹{t.demand} Cr</strong></div>
                <div className="tc-stat"><span>Received</span><strong>₹{t.received} Cr</strong></div>
                <div className="tc-stat"><span>Outstanding</span><strong>₹{t.outstanding} Cr</strong></div>
                <div className="tc-bar-wrap">
                  <div className="tc-bar" style={{width:`${t.collection_rate}%`}} />
                </div>
                <div className="tc-rate">{t.collection_rate}% collected</div>
              </div>
            ))}
          </div>

          <div className="charts-grid">
            <ChartCard title="Tower Demand vs Received" subtitle="Crores" wide>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={data.tower_list} margin={{top:10,right:20,left:0,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="tower" />
                  <YAxis unit=" Cr" />
                  <Tooltip formatter={(v)=>`₹${v} Cr`} />
                  <Legend />
                  <Bar dataKey="demand" name="Demand" fill={CHART_BLUE} radius={[6,6,0,0]} />
                  <Bar dataKey="received" name="Received" fill={CHART_BROWN} radius={[6,6,0,0]} />
                  <Line type="monotone" dataKey="collection_rate" name="Rate %" stroke="#ef4444" strokeWidth={2} dot={{r:4}} yAxisId={1} />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Outstanding by Tower" subtitle="Amount Crores">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={data.tower_list} cx="50%" cy="50%" outerRadius={100} innerRadius={40}
                    dataKey="outstanding" nameKey="tower"
                    label={({tower,outstanding})=>`${tower}: ₹${outstanding}Cr`}>
                    {data.tower_list.map((_,i) => <Cell key={i} fill={TOWER_COLORS[i % TOWER_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v)=>`₹${v} Cr`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      )}

      <footer className="dash-footer">
        Smartworld Sky Arc · Demand & Collection Dashboard · {new Date().toLocaleDateString('en-IN', {year:'numeric',month:'long',day:'numeric'})}
      </footer>
    </div>
  );
}
