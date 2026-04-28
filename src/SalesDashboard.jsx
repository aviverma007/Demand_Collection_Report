import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart, Line, LabelList
} from 'recharts';
import data from './dashboardData.json';
import './SalesDashboard.css';

/* ── EXACT PALETTE FROM REFERENCE IMAGE ─── */
const P = {
  navy:     '#1e3a5f',  // tower bars
  navyDark: '#142d4e',
  tan:      '#b07a50',  // brown line / secondary
  tanDark:  '#8b5a32',
  tanLight: '#c9a882',
  green:    '#3d8c5a',
  red:      '#c0392b',
  amber:    '#c9a031',
  teal:     '#2a7a7e',
  purple:   '#5b4a8a',
  text:     '#2c3748',
  sub:      '#6c7a83',
};

const TOWER_COLORS  = [P.navy, P.tan, '#2a6a7c', '#3d6e3a', P.purple, P.red];
const BUCKET_COLORS = { '1–30 Days': P.green, '31–90 Days': P.amber, '91–180 Days': P.red, '181+ Days': P.purple, 'Not Yet Due': P.teal };
const KPI_ACCENTS   = [P.navy, P.purple, P.green, P.red, P.teal, P.amber, P.tanDark];

/* ── HELPERS ─── */
const crFmt = (n) => `₹${Number(n).toFixed(2)} Crs`;

/* ── ANIMATED BAR ─── */
function AnimatedBar(props) {
  const { x, y, width, height, fill } = props;
  const [h, setH] = useState(0);
  useEffect(() => { const t = setTimeout(() => setH(height), 80); return () => clearTimeout(t); }, [height]);
  return (
    <rect x={x} y={y + height - h} width={width} height={h} fill={fill} rx={6} ry={6}
      style={{ transition: 'height .7s cubic-bezier(.34,1.56,.64,1), y .7s cubic-bezier(.34,1.56,.64,1)' }} />
  );
}

/* ── CUSTOM TOOLTIP ─── */
const CT = ({ active, payload, label, isCr }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="tt">
      <div className="tt-label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="tt-item">
          <span className="tt-dot" style={{ background: p.fill || p.color }} />
          <span>{p.name}:</span>
          <strong style={{ color: p.fill || p.color }}>
            {isCr ? crFmt(p.value) : Number(p.value).toLocaleString()}
          </strong>
        </div>
      ))}
    </div>
  );
};

/* ── KPI CARD ─── */
const Kpi = ({ label, value, sub, accent, icon, delay = 0 }) => (
  <div className="kpi-card" style={{ '--accent': accent, animationDelay: `${delay}s` }}>
    <span className="kpi-icon">{icon}</span>
    <div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-sub">{sub}</div>
    </div>
  </div>
);

/* ── CHART CARD ─── */
const CC = ({ title, sub, wide, children }) => (
  <div className={`chart-card${wide ? ' wide' : ''}`}>
    <div className="chart-title">{title}</div>
    {sub && <div className="chart-sub">{sub}</div>}
    {children}
  </div>
);

/* ── MILESTONE TABLE ─── */
const MsTable = ({ rows }) => {
  const [page, setPage] = useState(0);
  const PER = 8, pages = Math.ceil(rows.length / PER);
  const slice = rows.slice(page * PER, (page + 1) * PER);
  return (
    <div className="slide-wrap">
      <table className="ms-table">
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
            <tr key={i} className={i % 2 === 0 ? 'even' : 'odd'}>
              <td className="ms-name" title={m.name}>
                {m.name.length > 60 ? m.name.slice(0, 60) + '…' : m.name}
              </td>
              <td>
                <span className="bkt-tag" style={{ background: BUCKET_COLORS[m.ageing_bucket] ?? '#999' }}>
                  {m.ageing_bucket}
                </span>
              </td>
              <td>{m.billed_count}</td>
              <td>₹{m.billed_amount} Crs</td>
              <td className="ub-cell">{m.unbilled_count}</td>
              <td>₹{m.unbilled_amount} Crs</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button className="pg-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
        <span>Page {page + 1} / {pages} · {rows.length} milestones</span>
        <button className="pg-btn" disabled={page >= pages - 1} onClick={() => setPage(p => p + 1)}>Next →</button>
      </div>
    </div>
  );
};

/* ── MAIN ─── */
export default function Dashboard() {
  const [tab, setTab] = useState('overview');
  const [fp, setFp] = useState('All');
  const [fc, setFc] = useState('All');
  const s = data.summary;

  const ageCountArr = ['1–30 Days', '31–90 Days', '91–180 Days', '181+ Days', 'Not Yet Due'].map(b => ({
    name: b, count: data.ageing[b]?.count ?? 0, fill: BUCKET_COLORS[b]
  }));
  const ageAmtArr = ['1–30 Days', '31–90 Days', '91–180 Days', '181+ Days', 'Not Yet Due'].map(b => ({
    name: b, amount: data.ageing[b]?.amount ?? 0, fill: BUCKET_COLORS[b]
  }));
  const billedPie = [
    { name: 'Billed',   value: s.billed_count,   fill: P.navy },
    { name: 'Unbilled', value: s.unbilled_count,  fill: P.tanLight },
  ];
  const towerFin = data.tower_list.map(t => ({
    name: t.tower, Demand: t.demand, Received: t.received, Outstanding: t.outstanding
  }));
  const sortedMs = useMemo(() =>
    [...data.milestone_list].sort((a, b) => b.billed_count - a.billed_count), []);

  const TABS = [['overview', 'Overview'], ['ageing', 'Ageing Analysis'], ['milestones', 'Milestones'], ['towers', 'Towers']];

  return (
    <div className="dashboard">

      {/* HEADER */}
      <header className="dash-header">
        <div className="header-left">
          <div className="brand">SW</div>
          <div>
            <div className="dash-title">Smartworld Sales Dashboard</div>
            <div className="dash-sub">Sky Arc · Demand &amp; Collection Analysis</div>
          </div>
        </div>
        <div className="header-right">
          <div className="live-indicator"><span className="live-dot" /><span className="live-label">LIVE</span></div>
          <span className="header-meta">{s.total_records.toLocaleString()} records · {s.total_units} units</span>
        </div>
      </header>

      {/* FILTERS */}
      <div className="filters-bar">
        <div className="filter-group">
          <span className="filter-lbl">Project</span>
          <select className="filter-select" value={fp} onChange={e => setFp(e.target.value)}>
            <option>All</option>
            {s.projects.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <span className="filter-lbl">Company</span>
          <select className="filter-select" value={fc} onChange={e => setFc(e.target.value)}>
            <option>All</option>
            {s.companies.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <button className="reset-btn" onClick={() => { setFp('All'); setFc('All'); }}>↺ Reset</button>
      </div>

      {/* TABS */}
      <div className="tab-nav">
        {TABS.map(([id, lbl]) => (
          <button key={id} className={`tab-btn${tab === id ? ' active' : ''}`} onClick={() => setTab(id)}>{lbl}</button>
        ))}
      </div>

      {/* KPI ROW */}
      <section className="kpi-grid">
        <Kpi label="Booked Units"    value={s.total_sales_orders}           sub="Unique sales orders"              accent={P.navy}    icon="🏢" delay={0}    />
        <Kpi label="Total Demand"    value={`₹${s.total_demand_cr} Crs`}    sub={`${s.total_records.toLocaleString()} installments`}   accent={P.purple}  icon="💰" delay={0.05} />
        <Kpi label="Received"        value={`₹${s.total_received_cr} Crs`}  sub={`${s.collection_rate}% collected`}                    accent={P.green}   icon="✅" delay={0.1}  />
        <Kpi label="Outstanding"     value={`₹${s.total_outstanding_cr} Crs`} sub="Pending payment"                                    accent={P.red}     icon="⏳" delay={0.15} />
        <Kpi label="Billed"          value={s.billed_count.toLocaleString()}  sub="Invoices raised"                                    accent={P.teal}    icon="🧾" delay={0.2}  />
        <Kpi label="Unbilled"        value={s.unbilled_count.toLocaleString()} sub="Pending invoicing"                                 accent={P.amber}   icon="🔔" delay={0.25} />
        <Kpi label="Milestones"      value={s.total_milestones}              sub={`${s.total_towers} towers`}                          accent={P.tanDark} icon="📌" delay={0.3}  />
      </section>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <div className="tab-content">
          <div className="charts-grid">

            {/* 1. Monthly area */}
            <CC title="Monthly Demand vs Received" sub="Amount in Crores" wide>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data.monthly} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={P.navy} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={P.navy} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={P.tan} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={P.tan} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} unit=" Cr" />
                  <Tooltip content={<CT isCr />} />
                  <Legend />
                  <Area type="monotone" dataKey="demand"   name="Demand"   stroke={P.navy} fill="url(#gD)" strokeWidth={2.5} dot={{ r: 3, fill: P.navy }} />
                  <Area type="monotone" dataKey="received" name="Received" stroke={P.tan}  fill="url(#gR)" strokeWidth={2.5} dot={{ r: 3, fill: P.tan  }} />
                </AreaChart>
              </ResponsiveContainer>
            </CC>

            {/* 2. Billed Pie */}
            <CC title="Billed vs Unbilled" sub="Milestone count">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={billedPie} cx="50%" cy="48%" outerRadius={105} innerRadius={55}
                    dataKey="value" nameKey="name" paddingAngle={2}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {billedPie.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip formatter={v => v.toLocaleString()} />
                </PieChart>
              </ResponsiveContainer>
            </CC>

            {/* 3. Tower collection rate */}
            <CC title="Tower Collection Rate" sub="% of demand received">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.tower_list} margin={{ top: 18, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tower" tick={{ fontSize: 12, fontWeight: 600 }} />
                  <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 10 }} />
                  <Tooltip formatter={v => `${v}%`} />
                  <Bar dataKey="collection_rate" name="Rate" shape={<AnimatedBar />} isAnimationActive={false}>
                    {data.tower_list.map((_, i) => <Cell key={i} fill={TOWER_COLORS[i % TOWER_COLORS.length]} />)}
                    <LabelList dataKey="collection_rate" position="top" formatter={v => `${v}%`}
                      style={{ fontSize: 11, fontWeight: 700, fill: P.text }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CC>

            {/* 4. Radar */}
            <CC title="Tower Efficiency Radar" sub="Collection rate comparison">
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart cx="50%" cy="50%" outerRadius="68%"
                  data={data.tower_list.map(t => ({ subject: t.tower, rate: t.collection_rate }))}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fontWeight: 700, fill: P.text }} />
                  <PolarRadiusAxis angle={30} domain={[60, 80]} tick={{ fontSize: 9 }} />
                  <Radar name="Rate %" dataKey="rate" stroke={P.navy} fill={P.navy} fillOpacity={0.18} strokeWidth={2} />
                  <Tooltip formatter={v => `${v}%`} />
                </RadarChart>
              </ResponsiveContainer>
            </CC>

            {/* 5. Tower breakdown */}
            <CC title="Tower Financial Breakdown" sub="Crores" wide>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={towerFin} margin={{ top: 20, right: 20, left: 0, bottom: 0 }} barGap={3} barCategoryGap="26%">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 700 }} />
                  <YAxis unit=" Cr" tick={{ fontSize: 10 }} />
                  <Tooltip content={<CT isCr />} />
                  <Legend />
                  <Bar dataKey="Demand"      fill={P.navy}      shape={<AnimatedBar />} isAnimationActive={false}>
                    <LabelList dataKey="Demand"      position="top" style={{ fontSize: 10, fontWeight: 700, fill: P.navy }}      formatter={v => `${v}`} />
                  </Bar>
                  <Bar dataKey="Received"    fill={P.tan}       shape={<AnimatedBar />} isAnimationActive={false}>
                    <LabelList dataKey="Received"    position="top" style={{ fontSize: 10, fontWeight: 700, fill: P.tanDark }}   formatter={v => `${v}`} />
                  </Bar>
                  <Bar dataKey="Outstanding" fill={P.red}       shape={<AnimatedBar />} isAnimationActive={false}>
                    <LabelList dataKey="Outstanding" position="top" style={{ fontSize: 10, fontWeight: 700, fill: P.red }}       formatter={v => `${v}`} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CC>

          </div>
        </div>
      )}

      {/* ── AGEING ── */}
      {tab === 'ageing' && (
        <div className="tab-content">
          <div className="ageing-row">
            {Object.entries(BUCKET_COLORS).map(([b, c]) => (
              <div key={b} className="age-card" style={{ '--bc': c }}>
                <div className="age-bkt">{b}</div>
                <div className="age-count">{(data.ageing[b]?.count ?? 0).toLocaleString()}</div>
                <div className="age-amt">₹{(data.ageing[b]?.amount ?? 0).toFixed(2)} Crs</div>
              </div>
            ))}
          </div>
          <div className="charts-grid">
            {/* Count */}
            <CC title="Installment Count by Ageing" sub="Number of records per bucket">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ageCountArr} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={v => v.toLocaleString()} />
                  <Bar dataKey="count" name="Count" shape={<AnimatedBar />} isAnimationActive={false}>
                    {ageCountArr.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    <LabelList dataKey="count" position="top" formatter={v => v.toLocaleString()} style={{ fontSize: 11, fontWeight: 700, fill: P.text }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CC>

            {/* Amount */}
            <CC title="Outstanding Amount by Ageing" sub="Crores">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ageAmtArr} margin={{ top: 22, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis unit=" Cr" tick={{ fontSize: 10 }} />
                  <Tooltip formatter={v => `₹${v} Crs`} />
                  <Bar dataKey="amount" name="Amount" shape={<AnimatedBar />} isAnimationActive={false}>
                    {ageAmtArr.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    <LabelList dataKey="amount" position="top" formatter={v => `${v} Crs`} style={{ fontSize: 10, fontWeight: 700, fill: P.text }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CC>

            {/* Pie */}
            <CC title="Ageing Distribution" sub="Outstanding amount split">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={ageAmtArr.filter(d => d.amount > 0)} cx="50%" cy="50%"
                    outerRadius={105} innerRadius={50} dataKey="amount" nameKey="name"
                    paddingAngle={2} label={({ name, percent }) => `${name.split('–')[0].trim()} ${(percent * 100).toFixed(0)}%`}>
                    {ageAmtArr.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip formatter={v => `₹${v} Crs`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CC>
          </div>
        </div>
      )}

      {/* ── MILESTONES ── */}
      {tab === 'milestones' && (
        <div className="tab-content">
          <div className="charts-grid">
            <CC title="Unbilled Milestone Count by Milestone" sub="Top 10 · highest unbilled count" wide>
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={data.top_unbilled_count} layout="vertical" margin={{ top: 5, right: 80, left: 8, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={190} tick={{ fontSize: 9, fill: P.text }} />
                  <Tooltip formatter={v => v.toLocaleString()} />
                  <Bar dataKey="unbilled_count" name="Unbilled Count" fill={P.navy} radius={[0, 7, 7, 0]}>
                    <LabelList dataKey="unbilled_count" position="right" style={{ fontSize: 10, fontWeight: 700, fill: P.text }} formatter={v => v.toLocaleString()} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CC>

            <CC title="Unbilled Installment Amount Crs by Milestone" sub="Top 10 · highest unbilled amount" wide>
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={data.top_unbilled_amount} layout="vertical" margin={{ top: 5, right: 90, left: 8, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" unit=" Cr" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={190} tick={{ fontSize: 9, fill: P.text }} />
                  <Tooltip formatter={v => `₹${v} Crs`} />
                  <Bar dataKey="unbilled_amount" name="Unbilled Amt" fill={P.tan} radius={[0, 7, 7, 0]}>
                    <LabelList dataKey="unbilled_amount" position="right" style={{ fontSize: 10, fontWeight: 700, fill: P.tanDark }} formatter={v => `${v} Crs`} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CC>
          </div>

          <div className="section-hd">
            <h2>Milestone Summary Table</h2>
            <span className="badge">{sortedMs.length} milestones · paginated</span>
          </div>
          <MsTable rows={sortedMs} />
        </div>
      )}

      {/* ── TOWERS ── */}
      {tab === 'towers' && (
        <div className="tab-content">
          <div className="tower-cards">
            {data.tower_list.map((t, i) => (
              <div key={i} className="tc" style={{ '--tc-color': TOWER_COLORS[i % TOWER_COLORS.length] }}>
                <div className="tc-name">{t.tower}</div>
                <div className="tc-row"><span>Demand</span>      <strong>₹{t.demand} Crs</strong></div>
                <div className="tc-row"><span>Received</span>    <strong>₹{t.received} Crs</strong></div>
                <div className="tc-row"><span>Outstanding</span> <strong>₹{t.outstanding} Crs</strong></div>
                <div className="tc-bar-bg"><div className="tc-bar" style={{ width: `${t.collection_rate}%` }} /></div>
                <div className="tc-rate">{t.collection_rate}% collected</div>
              </div>
            ))}
          </div>
          <div className="charts-grid">
            <CC title="Tower Financial Breakdown" sub="Crores" wide>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={towerFin} margin={{ top: 22, right: 20, left: 0, bottom: 0 }} barGap={3} barCategoryGap="26%">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 13, fontWeight: 700 }} />
                  <YAxis unit=" Cr" tick={{ fontSize: 10 }} />
                  <Tooltip content={<CT isCr />} />
                  <Legend />
                  <Bar dataKey="Demand"      fill={P.navy} shape={<AnimatedBar />} isAnimationActive={false}>
                    <LabelList dataKey="Demand"      position="top" style={{ fontSize: 10, fontWeight: 700, fill: P.navy }}    formatter={v => `${v}`} />
                  </Bar>
                  <Bar dataKey="Received"    fill={P.tan}  shape={<AnimatedBar />} isAnimationActive={false}>
                    <LabelList dataKey="Received"    position="top" style={{ fontSize: 10, fontWeight: 700, fill: P.tanDark }} formatter={v => `${v}`} />
                  </Bar>
                  <Bar dataKey="Outstanding" fill={P.red}  shape={<AnimatedBar />} isAnimationActive={false}>
                    <LabelList dataKey="Outstanding" position="top" style={{ fontSize: 10, fontWeight: 700, fill: P.red }}     formatter={v => `${v}`} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CC>
            <CC title="Outstanding by Tower" sub="Crores">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={data.tower_list} cx="50%" cy="50%" outerRadius={105} innerRadius={45}
                    dataKey="outstanding" nameKey="tower" paddingAngle={2}
                    label={({ tower, outstanding }) => `${tower}: ₹${outstanding}Crs`}>
                    {data.tower_list.map((_, i) => <Cell key={i} fill={TOWER_COLORS[i % TOWER_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => `₹${v} Crs`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CC>
            <CC title="Tower Efficiency Radar" sub="Collection rate">
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart cx="50%" cy="50%" outerRadius="68%"
                  data={data.tower_list.map(t => ({ subject: t.tower, rate: t.collection_rate }))}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fontWeight: 700, fill: P.text }} />
                  <PolarRadiusAxis angle={30} domain={[60, 80]} tick={{ fontSize: 9 }} />
                  <Radar name="Collection %" dataKey="rate" stroke={P.navy} fill={P.navy} fillOpacity={0.18} strokeWidth={2} />
                  <Tooltip formatter={v => `${v}%`} />
                </RadarChart>
              </ResponsiveContainer>
            </CC>
          </div>
        </div>
      )}

      <footer className="dash-footer">
        Smartworld Sky Arc · Demand &amp; Collection Dashboard · {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
      </footer>
    </div>
  );
}
