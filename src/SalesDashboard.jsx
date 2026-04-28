import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart, Line, LabelList
} from 'recharts';
import data from './dashboardData.json';
import './SalesDashboard.css';

/* ── constants ─────────────────────────────────────────── */
const C = {
  navy:   '#0d1b3e', blue:  '#1a3a6b', blue2: '#2457a4',
  brown:  '#7a4f2e', gold:  '#c49a4a',
  green:  '#16a34a', red:   '#dc2626', amber: '#d97706', purple: '#7c3aed', teal: '#0891b2',
};
const TOWER_COLORS = [C.blue,'#7a4f2e','#0891b2','#15803d','#9333ea','#dc2626'];
const BUCKET_COLORS = {
  '1–30 Days': '#22c55e', '31–90 Days': '#f59e0b',
  '91–180 Days': '#ef4444', '181+ Days': '#7c3aed', 'Not Yet Due': '#06b6d4'
};

/* ── helpers ───────────────────────────────────────────── */
const crFmt  = (n) => `₹${Number(n).toFixed(2)} Crs`;
const numFmt = (n) => Number(n) >= 1000 ? `${(Number(n)/1000).toFixed(1)}K` : `${n}`;

/* ── Custom Tooltip ─────────────────────────────────────── */
const CT = ({ active, payload, label, isCr }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="tt">
      <div className="tt-label">{label}</div>
      {payload.map((p,i) => (
        <div key={i} className="tt-item">
          <span className="tt-dot" style={{ background: p.fill || p.color }} />
          <span style={{ color: C.navy }}>{p.name}:</span>
          <strong style={{ color: p.fill || p.color }}>
            {isCr ? crFmt(p.value) : Number(p.value).toLocaleString()}
          </strong>
        </div>
      ))}
    </div>
  );
};

/* ── KPI Card ───────────────────────────────────────────── */
const Kpi = ({ label, value, sub, accent, icon, delay }) => (
  <div className="kpi-card" style={{ '--accent': accent, animationDelay: `${delay}s` }}>
    <span className="kpi-icon">{icon}</span>
    <div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-sub">{sub}</div>
    </div>
  </div>
);

/* ── Chart Card ─────────────────────────────────────────── */
const CC = ({ title, sub, wide, children }) => (
  <div className={`chart-card${wide?' wide':''}`}>
    <div className="chart-title">{title}</div>
    {sub && <div className="chart-sub">{sub}</div>}
    {children}
  </div>
);

/* ── Paginated Milestone Table ──────────────────────────── */
const MsTable = ({ rows }) => {
  const [page, setPage] = useState(0);
  const PER = 8, pages = Math.ceil(rows.length / PER);
  const slice = rows.slice(page * PER, (page + 1) * PER);
  return (
    <div className="slide-wrap">
      <table className="ms-table">
        <thead><tr>
          <th>MILESTONE</th><th>AGEING BUCKET</th>
          <th>BILLED COUNT</th><th>BILLED AMT (Cr)</th>
          <th>UNBILLED COUNT</th><th>UNBILLED AMT (Cr)</th>
        </tr></thead>
        <tbody>
          {slice.map((m, i) => (
            <tr key={i} className={i%2===0?'even':'odd'}>
              <td className="ms-name" title={m.name}>
                {m.name.length > 58 ? m.name.slice(0,58)+'…' : m.name}
              </td>
              <td>
                <span className="bkt-tag" style={{ background: BUCKET_COLORS[m.ageing_bucket]??'#999' }}>
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
        <button className="pg-btn" disabled={page===0} onClick={()=>setPage(p=>p-1)}>← Prev</button>
        <span>Page {page+1} / {pages} · {rows.length} milestones</span>
        <button className="pg-btn" disabled={page>=pages-1} onClick={()=>setPage(p=>p+1)}>Next →</button>
      </div>
    </div>
  );
};

/* ── Main ───────────────────────────────────────────────── */
export default function Dashboard() {
  const [tab, setTab]               = useState('overview');
  const [filterCo, setFilterCo]     = useState('All');
  const [filterPj, setFilterPj]     = useState('All');
  const s = data.summary;

  /* ageing chart data */
  const ageCount = ['1–30 Days','31–90 Days','91–180 Days','181+ Days','Not Yet Due'].map(b => ({
    name: b, count: data.ageing[b]?.count ?? 0, fill: BUCKET_COLORS[b]
  }));
  const ageAmt = ['1–30 Days','31–90 Days','91–180 Days','181+ Days','Not Yet Due'].map(b => ({
    name: b, amount: data.ageing[b]?.amount ?? 0, fill: BUCKET_COLORS[b]
  }));

  /* billed pie */
  const billedPie = [
    { name: 'Billed',   value: s.billed_count,   fill: C.blue },
    { name: 'Unbilled', value: s.unbilled_count,  fill: '#c49a4a' },
  ];

  /* tower financial */
  const towerFin = data.tower_list.map(t => ({
    name: t.tower, Demand: t.demand, Received: t.received, Outstanding: t.outstanding
  }));

  /* sorted milestones */
  const sortedMs = useMemo(() =>
    [...data.milestone_list].sort((a,b) => b.billed_count - a.billed_count), []);

  return (
    <div className="dashboard">
      <div className="bg-mesh" />

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
          <div className="live-indicator">
            <span className="live-dot" />
            <span className="live-label">LIVE</span>
          </div>
          <span className="header-meta">{s.total_records.toLocaleString()} records</span>
        </div>
      </header>

      {/* FILTERS */}
      <div className="filters-bar">
        <span className="filter-label">⚙ Filters</span>
        <label className="filter-label">Project
          <select className="filter-select" value={filterPj} onChange={e=>setFilterPj(e.target.value)}>
            <option>All</option>
            {s.projects.map(p=><option key={p}>{p}</option>)}
          </select>
        </label>
        <label className="filter-label">Company
          <select className="filter-select" value={filterCo} onChange={e=>setFilterCo(e.target.value)}>
            <option>All</option>
            {s.companies.map(c=><option key={c}>{c}</option>)}
          </select>
        </label>
        <button className="reset-btn" onClick={()=>{setFilterPj('All');setFilterCo('All');}}>↺ Reset</button>
      </div>

      {/* TABS */}
      <div className="tab-nav">
        {[['overview','Overview'],['ageing','Ageing Analysis'],['milestones','Milestones'],['towers','Towers']].map(([id,lbl])=>(
          <button key={id} className={`tab-btn${tab===id?' active':''}`} onClick={()=>setTab(id)}>{lbl}</button>
        ))}
      </div>

      {/* KPI – no Total Units card per request */}
      <section className="kpi-grid">
        <Kpi label="BOOKED UNITS"     value={s.total_sales_orders}        sub="Unique sales orders"     accent={C.blue2}  icon="🏢" delay={0}    />
        <Kpi label="TOTAL DEMAND"     value={`₹${s.total_demand_cr} Crs`} sub={`${s.total_records.toLocaleString()} installments`} accent={C.purple} icon="💰" delay={0.05} />
        <Kpi label="RECEIVED"         value={`₹${s.total_received_cr} Crs`} sub={`${s.collection_rate}% collected`} accent={C.green} icon="✅" delay={0.1} />
        <Kpi label="OUTSTANDING"      value={`₹${s.total_outstanding_cr} Crs`} sub="Pending payment"   accent={C.red}    icon="⏳" delay={0.15} />
        <Kpi label="BILLED"           value={s.billed_count.toLocaleString()} sub="Invoices raised"    accent={C.teal}   icon="🧾" delay={0.2}  />
        <Kpi label="UNBILLED"         value={s.unbilled_count.toLocaleString()} sub="Pending invoicing" accent={C.amber}  icon="🔔" delay={0.25} />
        <Kpi label="MILESTONES"       value={s.total_milestones}          sub={`${s.total_towers} towers`} accent={C.brown} icon="📌" delay={0.3} />
      </section>

      {/* ─── OVERVIEW ─── */}
      {tab==='overview' && (
        <div className="tab-content">
          <div className="charts-grid">

            {/* Monthly Area */}
            <CC title="Monthly Demand vs Received" sub="Amount in Crores" wide>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.monthly} margin={{top:10,right:24,left:0,bottom:0}}>
                  <defs>
                    <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={C.blue}  stopOpacity={0.25}/>
                      <stop offset="95%" stopColor={C.blue}  stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={C.brown} stopOpacity={0.25}/>
                      <stop offset="95%" stopColor={C.brown} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.06)" />
                  <XAxis dataKey="month" tick={{fontSize:10}} />
                  <YAxis tick={{fontSize:10}} unit=" Cr" />
                  <Tooltip content={<CT isCr />} />
                  <Legend />
                  <Area type="monotone" dataKey="demand"   name="Demand"   stroke={C.blue}  fill="url(#gD)" strokeWidth={2.5} dot={{r:3,fill:C.blue}}  />
                  <Area type="monotone" dataKey="received" name="Received" stroke={C.brown} fill="url(#gR)" strokeWidth={2.5} dot={{r:3,fill:C.brown}} />
                </AreaChart>
              </ResponsiveContainer>
            </CC>

            {/* Billed vs Unbilled donut */}
            <CC title="Billed vs Unbilled" sub="Milestone count">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={billedPie} cx="50%" cy="48%" outerRadius={100} innerRadius={52}
                    dataKey="value" nameKey="name"
                    label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`}
                    labelLine paddingAngle={2}>
                    {billedPie.map((e,i)=><Cell key={i} fill={e.fill}/>)}
                  </Pie>
                  <Tooltip formatter={(v)=>v.toLocaleString()} />
                </PieChart>
              </ResponsiveContainer>
            </CC>

            {/* Tower Collection Rate */}
            <CC title="Tower Collection Rate" sub="% of demand received">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.tower_list} margin={{top:10,right:10,left:0,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.06)" />
                  <XAxis dataKey="tower" tick={{fontSize:12,fontWeight:600}} />
                  <YAxis domain={[0,100]} unit="%" tick={{fontSize:10}} />
                  <Tooltip formatter={(v)=>`${v}%`} />
                  <Bar dataKey="collection_rate" name="Rate" radius={[8,8,0,0]}>
                    {data.tower_list.map((_,i)=>(
                      <Cell key={i} fill={TOWER_COLORS[i%TOWER_COLORS.length]} />
                    ))}
                    <LabelList dataKey="collection_rate" position="top" formatter={v=>`${v}%`} style={{fontSize:11,fontWeight:700,fill:C.navy}} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CC>

            {/* Radar */}
            <CC title="Tower Efficiency Radar" sub="Collection rate comparison">
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart cx="50%" cy="50%" outerRadius="68%"
                  data={data.tower_list.map(t=>({subject:t.tower,rate:t.collection_rate}))}>
                  <PolarGrid stroke="rgba(0,0,0,.08)" />
                  <PolarAngleAxis dataKey="subject" tick={{fontSize:12,fontWeight:700,fill:C.navy}} />
                  <PolarRadiusAxis angle={30} domain={[60,80]} tick={{fontSize:9}} />
                  <Radar name="Rate %" dataKey="rate" stroke={C.blue} fill={C.blue} fillOpacity={0.2} strokeWidth={2} />
                  <Tooltip formatter={v=>`${v}%`} />
                </RadarChart>
              </ResponsiveContainer>
            </CC>

            {/* Tower Financial Breakdown – 3 bars with value labels */}
            <CC title="Tower Financial Breakdown" sub="Crores" wide>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={towerFin} margin={{top:18,right:20,left:0,bottom:0}} barGap={3} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.06)" />
                  <XAxis dataKey="name" tick={{fontSize:12,fontWeight:600}} />
                  <YAxis unit=" Cr" tick={{fontSize:10}} />
                  <Tooltip content={<CT isCr />} />
                  <Legend />
                  <Bar dataKey="Demand"      fill={C.blue}  radius={[6,6,0,0]}>
                    <LabelList dataKey="Demand"      position="top" formatter={v=>`${v}`} style={{fontSize:10,fontWeight:700,fill:C.blue}} />
                  </Bar>
                  <Bar dataKey="Received"    fill={C.brown} radius={[6,6,0,0]}>
                    <LabelList dataKey="Received"    position="top" formatter={v=>`${v}`} style={{fontSize:10,fontWeight:700,fill:C.brown}} />
                  </Bar>
                  <Bar dataKey="Outstanding" fill={C.red}   radius={[6,6,0,0]}>
                    <LabelList dataKey="Outstanding" position="top" formatter={v=>`${v}`} style={{fontSize:10,fontWeight:700,fill:C.red}} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CC>

          </div>
        </div>
      )}

      {/* ─── AGEING ─── */}
      {tab==='ageing' && (
        <div className="tab-content">
          <div className="ageing-row">
            {Object.entries(BUCKET_COLORS).map(([bkt,col])=>(
              <div key={bkt} className="age-card" style={{'--bc':col}}>
                <div className="age-bkt">{bkt}</div>
                <div className="age-count">{(data.ageing[bkt]?.count??0).toLocaleString()}</div>
                <div className="age-amt">₹{(data.ageing[bkt]?.amount??0).toFixed(2)} Crs</div>
              </div>
            ))}
          </div>

          <div className="charts-grid">
            {/* Count */}
            <CC title="Installment Count by Ageing" sub="Number of records per bucket">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ageCount} margin={{top:18,right:10,left:0,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.06)" />
                  <XAxis dataKey="name" tick={{fontSize:10}} />
                  <YAxis tick={{fontSize:10}} />
                  <Tooltip formatter={v=>v.toLocaleString()} />
                  <Bar dataKey="count" name="Count" radius={[8,8,0,0]}>
                    {ageCount.map((e,i)=><Cell key={i} fill={e.fill}/>)}
                    <LabelList dataKey="count" position="top" formatter={v=>v.toLocaleString()} style={{fontSize:11,fontWeight:700,fill:C.navy}} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CC>

            {/* Amount */}
            <CC title="Outstanding Amount by Ageing" sub="Crores">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ageAmt} margin={{top:18,right:10,left:0,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.06)" />
                  <XAxis dataKey="name" tick={{fontSize:10}} />
                  <YAxis unit=" Cr" tick={{fontSize:10}} />
                  <Tooltip formatter={v=>`₹${v} Crs`} />
                  <Bar dataKey="amount" name="Amount" radius={[8,8,0,0]}>
                    {ageAmt.map((e,i)=><Cell key={i} fill={e.fill}/>)}
                    <LabelList dataKey="amount" position="top" formatter={v=>`${v} Crs`} style={{fontSize:10,fontWeight:700,fill:C.navy}} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CC>

            {/* Ageing pie */}
            <CC title="Ageing Distribution" sub="Outstanding amount split">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={ageAmt.filter(d=>d.amount>0)} cx="50%" cy="50%"
                    outerRadius={105} innerRadius={50} dataKey="amount" nameKey="name"
                    label={({name,percent})=>`${name.split('–')[0].trim()} ${(percent*100).toFixed(0)}%`}
                    paddingAngle={2}>
                    {ageAmt.map((e,i)=><Cell key={i} fill={e.fill}/>)}
                  </Pie>
                  <Tooltip formatter={v=>`₹${v} Crs`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CC>

          </div>
        </div>
      )}

      {/* ─── MILESTONES ─── */}
      {tab==='milestones' && (
        <div className="tab-content">
          <div className="charts-grid">

            {/* Unbilled count – horizontal */}
            <CC title="Unbilled Milestone Count by Milestone" sub="Top 10 milestones with highest unbilled count" wide>
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={data.top_unbilled_count} layout="vertical" margin={{top:5,right:80,left:10,bottom:5}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.06)" />
                  <XAxis type="number" tick={{fontSize:10}} />
                  <YAxis type="category" dataKey="name" width={185} tick={{fontSize:9,fill:C.navy}} />
                  <Tooltip formatter={v=>v.toLocaleString()} />
                  <Bar dataKey="unbilled_count" name="Unbilled Count" fill={C.blue} radius={[0,8,8,0]}>
                    <LabelList dataKey="unbilled_count" position="right" style={{fontSize:10,fontWeight:700,fill:C.navy}} formatter={v=>v.toLocaleString()} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CC>

            {/* Unbilled amount – horizontal */}
            <CC title="Unbilled Installment Amount Crs by Milestone" sub="Top 10 milestones by unbilled amount" wide>
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={data.top_unbilled_amount} layout="vertical" margin={{top:5,right:100,left:10,bottom:5}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.06)" />
                  <XAxis type="number" unit=" Cr" tick={{fontSize:10}} />
                  <YAxis type="category" dataKey="name" width={185} tick={{fontSize:9,fill:C.navy}} />
                  <Tooltip formatter={v=>`₹${v} Crs`} />
                  <Bar dataKey="unbilled_amount" name="Unbilled Amount" fill={C.brown} radius={[0,8,8,0]}>
                    <LabelList dataKey="unbilled_amount" position="right" style={{fontSize:10,fontWeight:700,fill:C.brown}} formatter={v=>`${v} Crs`} />
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

      {/* ─── TOWERS ─── */}
      {tab==='towers' && (
        <div className="tab-content">
          <div className="tower-cards">
            {data.tower_list.map((t,i)=>(
              <div key={i} className="tc" style={{'--tc-color':TOWER_COLORS[i%TOWER_COLORS.length]}}>
                <div className="tc-name">{t.tower}</div>
                <div className="tc-row"><span>Demand</span>     <strong>₹{t.demand} Crs</strong></div>
                <div className="tc-row"><span>Received</span>   <strong>₹{t.received} Crs</strong></div>
                <div className="tc-row"><span>Outstanding</span><strong>₹{t.outstanding} Crs</strong></div>
                <div className="tc-bar-bg"><div className="tc-bar" style={{width:`${t.collection_rate}%`}}/></div>
                <div className="tc-rate">{t.collection_rate}% collected</div>
              </div>
            ))}
          </div>

          <div className="charts-grid">
            <CC title="Tower Financial Breakdown" sub="Crores — Demand · Received · Outstanding" wide>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={towerFin} margin={{top:20,right:20,left:0,bottom:0}} barGap={3} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.06)" />
                  <XAxis dataKey="name" tick={{fontSize:13,fontWeight:700}} />
                  <YAxis unit=" Cr" tick={{fontSize:10}} />
                  <Tooltip content={<CT isCr />} />
                  <Legend />
                  <Bar dataKey="Demand"      fill={C.blue}  radius={[6,6,0,0]}>
                    <LabelList dataKey="Demand"      position="top" style={{fontSize:10,fontWeight:700,fill:C.blue}}  formatter={v=>`${v}`} />
                  </Bar>
                  <Bar dataKey="Received"    fill={C.brown} radius={[6,6,0,0]}>
                    <LabelList dataKey="Received"    position="top" style={{fontSize:10,fontWeight:700,fill:C.brown}} formatter={v=>`${v}`} />
                  </Bar>
                  <Bar dataKey="Outstanding" fill={C.red}   radius={[6,6,0,0]}>
                    <LabelList dataKey="Outstanding" position="top" style={{fontSize:10,fontWeight:700,fill:C.red}}   formatter={v=>`${v}`} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CC>

            <CC title="Outstanding by Tower" sub="Amount in Crores">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={data.tower_list} cx="50%" cy="50%"
                    outerRadius={105} innerRadius={45}
                    dataKey="outstanding" nameKey="tower"
                    label={({tower,outstanding})=>`${tower}: ₹${outstanding}Crs`}
                    paddingAngle={2}>
                    {data.tower_list.map((_,i)=><Cell key={i} fill={TOWER_COLORS[i%TOWER_COLORS.length]}/>)}
                  </Pie>
                  <Tooltip formatter={v=>`₹${v} Crs`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CC>

            <CC title="Tower Collection Rate" sub="% collected per tower">
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart cx="50%" cy="50%" outerRadius="68%"
                  data={data.tower_list.map(t=>({subject:t.tower,rate:t.collection_rate}))}>
                  <PolarGrid stroke="rgba(0,0,0,.08)" />
                  <PolarAngleAxis dataKey="subject" tick={{fontSize:12,fontWeight:700,fill:C.navy}} />
                  <PolarRadiusAxis angle={30} domain={[60,80]} tick={{fontSize:9}} />
                  <Radar name="Collection %" dataKey="rate" stroke={C.blue} fill={C.blue} fillOpacity={0.2} strokeWidth={2}/>
                  <Tooltip formatter={v=>`${v}%`} />
                </RadarChart>
              </ResponsiveContainer>
            </CC>
          </div>
        </div>
      )}

      <footer className="dash-footer">
        Smartworld Sky Arc · Demand &amp; Collection Dashboard · {new Date().toLocaleDateString('en-IN',{year:'numeric',month:'long',day:'numeric'})}
      </footer>
    </div>
  );
}
