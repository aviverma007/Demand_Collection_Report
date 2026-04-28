import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
  ComposedChart, Line, LabelList
} from 'recharts';
import { Building2, IndianRupee, TrendingUp, RotateCcw, BarChart3, PieChart as PieIcon, Activity, Wallet, LayoutGrid } from 'lucide-react';
import data from './dashboardData.json';
import './SalesDashboard.css';

/* ── exact palette from App.css / App.jsx ─── */
const C = {
  blue:'#1e3a5f', blueLight:'#2c5282', blueAcc:'#3b82c4',
  brown:'#8b5e3c', brownLt:'#b07d56', brownDk:'#6b4226',
  gold:'#c49a3c', green:'#2d7a4f', rose:'#b8443a',
  text:'#1a1a1a', text2:'#5c4a3a', text3:'#8b7355',
};

/* ── gradient definitions (fade top → bottom) ─── */
const GRADIENTS = {
  blue:    ['#3a6fd8','#1e3a5f'],
  brown:   ['#d4955a','#6b4226'],
  rose:    ['#e86a5a','#8b2e26'],
  gold:    ['#e0b84a','#8b6820'],
  green:   ['#48b87a','#1a5c36'],
  teal:    ['#3bbccc','#1a6b7a'],
  purple:  ['#9b71d4','#4a2880'],
  demand:  ['#b07d56','#6b4226'],
  received:['#3a6fd8','#1e3a5f'],
  outstanding:['#e86a5a','#8b2e26'],
  booking: ['#4a9fe8','#1e5a9f'],
};

const TOWER_GRAD = ['blue','brown','teal','gold','green','rose'];
const BUCKET_COLORS = {
  '1–30 Days':   C.green,
  '31–90 Days':  C.gold,
  '91–180 Days': C.rose,
  '181+ Days':   C.blue,
  'Not Yet Due': C.blueAcc,
};
const BUCKET_GRAD = {
  '1–30 Days':   ['#48b87a','#1a5c36'],
  '31–90 Days':  ['#e0b84a','#8b6820'],
  '91–180 Days': ['#e86a5a','#8b2e26'],
  '181+ Days':   ['#3a6fd8','#1e3a5f'],
  'Not Yet Due': ['#4a9fe8','#1e5a9f'],
};
const PIE_COLORS = [C.blue, C.brownLt, C.blueAcc, C.gold, C.green, C.rose];

const TT_STYLE = {
  background:'rgba(255,255,255,0.96)', backdropFilter:'blur(12px)',
  border:'1px solid rgba(180,160,140,0.3)', borderRadius:14, fontSize:12,
  boxShadow:'0 10px 40px rgba(0,0,0,0.12)', padding:'10px 14px'
};

/* ── Custom Legend renderer ─── */
/* ── Standalone Legend — full control, no Recharts color lookup ── */
function ChartLegend({ items }) {
  // items: [{ label, color }]
  return (
    <div style={{
      display:'flex', flexWrap:'wrap', justifyContent:'center',
      gap:'8px 18px', paddingTop:10, paddingBottom:2,
    }}>
      {items.map((item, i) => (
        <span key={i} style={{
          display:'flex', alignItems:'center', gap:6,
          fontSize:11, color:C.text2, fontWeight:600,
        }}>
          <span style={{
            width:12, height:12, borderRadius:3,
            background: item.color,
            flexShrink:0, display:'inline-block',
            boxShadow:`0 1px 4px ${item.color}55`,
          }}/>
          {item.label}
        </span>
      ))}
    </div>
  );
}

/* ── All gradient defs (rendered once in a hidden SVG) ─── */
function GradientDefs() {
  return (
    <svg width={0} height={0} style={{ position:'absolute', pointerEvents:'none' }}>
      <defs>
        {Object.entries(GRADIENTS).map(([id, [top, bot]]) => (
          <linearGradient key={id} id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={top} stopOpacity={0.95}/>
            <stop offset="100%" stopColor={bot} stopOpacity={0.75}/>
          </linearGradient>
        ))}
        {TOWER_GRAD.map((id, i) => (
          <linearGradient key={`tw-${i}`} id={`grad-tower-${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={GRADIENTS[id][0]} stopOpacity={0.95}/>
            <stop offset="100%" stopColor={GRADIENTS[id][1]} stopOpacity={0.75}/>
          </linearGradient>
        ))}
        {Object.entries(BUCKET_GRAD).map(([id, [top,bot]]) => (
          <linearGradient key={`bkt-${id}`} id={`grad-bkt-${id.replace(/[^a-z0-9]/gi,'')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={top} stopOpacity={0.95}/>
            <stop offset="100%" stopColor={bot} stopOpacity={0.75}/>
          </linearGradient>
        ))}
      </defs>
    </svg>
  );
}

/* ── 3D KPI Card ─── */
function KPI3D({ icon, label, value, sub, color, delay=0, ring }) {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x:0, y:0 });
  const handleMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setTilt({ x:(e.clientY-rect.top)/rect.height-0.5, y:(e.clientX-rect.left)/rect.width-0.5 });
  },[]);
  const handleLeave = useCallback(() => { setHovered(false); setTilt({x:0,y:0}); },[]);
  return (
    <div ref={cardRef} className="kpi-card"
      style={{
        '--accent':color,'--glow-color':`${color}18`,animationDelay:`${delay*0.08}s`,
        border:`1.5px solid ${hovered?color+'40':'var(--border-glass)'}`,
        transform:`perspective(600px) rotateX(${tilt.x*-12}deg) rotateY(${tilt.y*12}deg) ${hovered?'translateY(-6px) scale(1.02)':''}`,
        boxShadow:hovered?`0 20px 50px ${color}25, 0 0 0 1px ${color}15, inset 0 1px 0 rgba(255,255,255,0.6)`:`0 3px 12px ${color}10, inset 0 1px 0 rgba(255,255,255,0.6)`,
      }}
      onMouseEnter={()=>setHovered(true)} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      <div className="kpi-shimmer" style={{animationDelay:`${delay*0.15}s`}}/>
      <div className="kpi-corner" style={{background:`radial-gradient(circle, ${color}20 0%, transparent 65%)`}}/>
      {ring && (
        <svg width="32" height="32" style={{position:'absolute',top:8,right:8}} viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="12" fill="none" stroke={`${color}18`} strokeWidth="3"/>
          <circle cx="16" cy="16" r="12" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"
            strokeDasharray={`${(ring/100)*75.4} 75.4`} transform="rotate(-90 16 16)"
            style={{transition:'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)'}}/>
          <text x="16" y="17" textAnchor="middle" dominantBaseline="central" fill={color} fontSize="7" fontWeight="700" fontFamily="Space Mono">{Math.round(ring)}</text>
        </svg>
      )}
      <div className="kpi-icon-wrap" style={{background:`linear-gradient(145deg,${color}15,${color}08)`,border:`1.5px solid ${color}20`,color,boxShadow:hovered?`0 6px 20px ${color}25`:`0 2px 8px ${color}10`}}>{icon}</div>
      <div>
        <div className="kpi-label">{label}</div>
        <div className="kpi-value" style={{animationDelay:`${0.3+delay*0.08}s`}}>{value}</div>
        {sub && <div className="kpi-sub">{sub}</div>}
      </div>
    </div>
  );
}

/* ── Glass Chart Card ─── */
function GlassCard({ title, icon, color='var(--blue)', children, wide, delay=0, style:extra }) {
  const [hov, setHov] = useState(false);
  return (
    <div className={`chart-card${wide?' wide':''}`}
      style={{ '--cc':color, animationDelay:`${delay}s`,
        border:`1.5px solid ${hov?'rgba(30,58,95,0.2)':'var(--border-glass)'}`,
        boxShadow:hov?'0 16px 45px rgba(30,58,95,0.14), inset 0 1px 0 rgba(255,255,255,0.6)':'0 3px 14px rgba(30,58,95,0.06), inset 0 1px 0 rgba(255,255,255,0.6)',
        transform:hov?'perspective(800px) rotateX(-1.5deg) translateY(-4px)':'none', ...extra }}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      <div className="chart-header">
        <span className="chart-icon-wrap" style={{color,background:`${color}10`,borderColor:`${color}18`,transform:hov?'scale(1.1)':'scale(1)'}}>{icon}</span>
        <span className="chart-title-text">{title}</span>
      </div>
      <div style={{flex:1,minHeight:0}}>{children}</div>
    </div>
  );
}

/* ── Milestone Table ─── */
function MsTable({ rows }) {
  const [page, setPage] = useState(0);
  const PER=8, pages=Math.ceil(rows.length/PER), slice=rows.slice(page*PER,(page+1)*PER);
  return (
    <div className="slide-wrap">
      <table className="ms-table">
        <thead><tr>
          <th>Milestone</th><th>Ageing Bucket</th>
          <th>Billed Count</th><th>Billed Amt (Crs)</th>
          <th>Unbilled Count</th><th>Unbilled Amt (Crs)</th>
        </tr></thead>
        <tbody>
          {slice.map((m,i)=>(
            <tr key={i} className={i%2===0?'even':'odd'}>
              <td className="ms-name" title={m.name}>{m.name.length>60?m.name.slice(0,60)+'…':m.name}</td>
              <td><span className="bkt-tag" style={{background:BUCKET_COLORS[m.ageing_bucket]??'#999'}}>{m.ageing_bucket}</span></td>
              <td>{m.billed_count}</td><td>₹{m.billed_amount} Crs</td>
              <td className="ub-cell">{m.unbilled_count}</td><td>₹{m.unbilled_amount} Crs</td>
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
}

/* ── Main ─── */
export default function Dashboard() {
  const [tab, setTab] = useState('overview');
  const [fp, setFp]   = useState('All');
  const [fc, setFc]   = useState('All');
  const s = data.summary;

  const ageCountArr = ['1–30 Days','31–90 Days','91–180 Days','181+ Days','Not Yet Due'].map(b=>({
    name:b, count:data.ageing[b]?.count??0,
    fill:`url(#grad-bkt-${b.replace(/[^a-z0-9]/gi,'')})`,
    solidColor: BUCKET_COLORS[b],
  }));
  const ageAmtArr = ['1–30 Days','31–90 Days','91–180 Days','181+ Days','Not Yet Due'].map(b=>({
    name:b, amount:data.ageing[b]?.amount??0,
    fill:`url(#grad-bkt-${b.replace(/[^a-z0-9]/gi,'')})`,
    solidColor: BUCKET_COLORS[b],
  }));
  const billedPie=[
    {name:'Billed',  value:s.billed_count,  color:C.blue},
    {name:'Unbilled',value:s.unbilled_count, color:C.brownLt},
  ];
  const towerFin=data.tower_list.map(t=>({name:t.tower,Demand:t.demand,Received:t.received,Outstanding:t.outstanding}));
  const sortedMs=useMemo(()=>[...data.milestone_list].sort((a,b)=>b.billed_count-a.billed_count),[]);
  const collPct=((s.total_received_cr/s.total_demand_cr)*100).toFixed(1);

  return (
    <div className="dashboard">
      <GradientDefs/>
      {/* Orbs */}
      <div className="bg-orbs">
        <div className="orb orb1"/><div className="orb orb2"/><div className="orb orb3"/>
        <svg className="bg-grid" width="100%" height="100%">
          <defs><pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#1e3a5f" strokeWidth="0.5"/>
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
        </svg>
      </div>

      {/* Header */}
      <header className="dash-header">
        <div className="header-left">
          <div className="brand"><Building2 size={22} color="#fff"/></div>
          <div>
            <div className="dash-title">Smartworld Sales Dashboard</div>
            <div className="dash-sub">Real Estate · Demand &amp; Collection Analysis</div>
          </div>
        </div>
        <div className="header-right">
          <span className="live-indicator">● LIVE</span>
          <span className="header-meta">{s.total_units} units · {s.total_records.toLocaleString()} records</span>
        </div>
      </header>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-group">
          <span className="filter-lbl">Project</span>
          <select className="filter-select" value={fp} onChange={e=>setFp(e.target.value)}>
            <option value="">All</option>
            {s.projects.map(p=><option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <span className="filter-lbl">Company</span>
          <select className="filter-select" value={fc} onChange={e=>setFc(e.target.value)}>
            <option value="">All</option>
            {s.companies.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        <button className="reset-btn" onClick={()=>{setFp('All');setFc('All');}}>
          <RotateCcw size={13}/> Reset
        </button>
      </div>

      {/* Tabs */}
      <div className="tab-nav">
        {[['overview','Overview'],['ageing','Ageing Analysis'],['milestones','Milestones'],['towers','Towers']].map(([id,lbl])=>(
          <button key={id} className={`tab-btn${tab===id?' active':''}`} onClick={()=>setTab(id)}>{lbl}</button>
        ))}
      </div>

      {/* KPIs */}
      <section className="kpi-grid">
        <KPI3D icon={<LayoutGrid size={20}/>}  label="Booked Units"  value={s.total_sales_orders}           sub="Unique sales orders"              color={C.blue}    delay={0}/>
        <KPI3D icon={<IndianRupee size={20}/>} label="Total Demand"  value={`₹${s.total_demand_cr} Crs`}    sub={`${s.total_records.toLocaleString()} installments`} color={C.brownLt} delay={1}/>
        <KPI3D icon={<Wallet size={20}/>}      label="Received"      value={`₹${s.total_received_cr} Crs`}  sub={`${s.collection_rate}% collected`} color={C.green}   delay={2} ring={parseFloat(s.collection_rate)}/>
        <KPI3D icon={<TrendingUp size={20}/>}  label="Outstanding"   value={`₹${s.total_outstanding_cr} Crs`} sub="Pending payment"                color={C.rose}    delay={3}/>
        <KPI3D icon={<BarChart3 size={20}/>}   label="Billed"        value={s.billed_count.toLocaleString()} sub="Invoices raised"                  color={C.blueAcc} delay={4}/>
        <KPI3D icon={<Activity size={20}/>}    label="Unbilled"      value={s.unbilled_count.toLocaleString()} sub="Pending invoicing"              color={C.gold}    delay={5}/>
        <KPI3D icon={<Building2 size={20}/>}   label="Milestones"    value={s.total_milestones}             sub={`${s.total_towers} towers`}        color={C.brownDk} delay={6}/>
      </section>

      {/* ── OVERVIEW ── */}
      {tab==='overview' && (
        <div className="tab-content">
          <div className="charts-grid">

            {/* Monthly: gradient bars + line */}
            <GlassCard title="Monthly Demand vs Received" icon={<Activity size={15}/>} color={C.brownDk} delay={0.4} wide>
              <ResponsiveContainer width="100%" height={290}>
                <ComposedChart data={data.monthly} margin={{top:18,right:22,left:5,bottom:20}}>
                  <defs>
                    <linearGradient id="gDemandBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor={GRADIENTS.demand[0]} stopOpacity={0.9}/>
                      <stop offset="100%" stopColor={GRADIENTS.demand[1]} stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(30,58,95,0.08)" vertical={false}/>
                  <XAxis dataKey="month" tick={{fill:C.text3,fontSize:10,fontWeight:600}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fill:C.text3,fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}Cr`}/>
                  <Tooltip contentStyle={TT_STYLE} formatter={(v,n)=>[`₹${v} Cr`,n]}/>
                  <Bar dataKey="demand" name="Demand" fill="url(#gDemandBar)" radius={[8,8,0,0]} barSize={24} animationDuration={1200}/>
                  <Line type="monotone" dataKey="received" name="Received" stroke={C.blue} strokeWidth={3}
                    dot={{r:4,fill:'#fff',stroke:C.blue,strokeWidth:2}}
                    activeDot={{r:7,fill:C.blue,stroke:'#fff',strokeWidth:2}}
                    animationDuration={1600}/>
                </ComposedChart>
              </ResponsiveContainer>
                  <ChartLegend items={[
                    {label:'Demand',   color:GRADIENTS.demand[0]},
                    {label:'Received', color:C.blue},
                  ]}/>
            </GlassCard>

            {/* Booking Status donut */}
            <GlassCard title="Booking Status" icon={<PieIcon size={15}/>} color={C.brown} delay={0.3}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',alignItems:'center',height:250}}>
                <div style={{textAlign:'center'}}>
                  <div style={{fontFamily:"'Space Mono',monospace",fontSize:32,fontWeight:800,color:C.blue}}>{s.total_sales_orders}</div>
                  <div style={{fontSize:10,color:C.text3,fontWeight:700,textTransform:'uppercase',letterSpacing:1}}>Booked Units</div>
                  <div style={{marginTop:14,fontSize:12,color:C.green,fontWeight:700}}>{collPct}% Collected</div>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={billedPie} cx="50%" cy="50%" innerRadius="55%" outerRadius="82%"
                      dataKey="value" nameKey="name" paddingAngle={5} stroke="#fff" strokeWidth={3} animationDuration={1200}>
                      {billedPie.map((e,i)=><Cell key={i} fill={e.color}/>)}
                    </Pie>
                    <Tooltip contentStyle={TT_STYLE}/>
                  </PieChart>
                </ResponsiveContainer>
                  <ChartLegend items={[
                    {label:'Billed',   color:C.blue},
                    {label:'Unbilled', color:C.brownLt},
                  ]}/>
              </div>
            </GlassCard>

            {/* Tower Collection Rate */}
            <GlassCard title="Tower Collection Rate" icon={<BarChart3 size={15}/>} color={C.blue} delay={0.2}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.tower_list} margin={{top:22,right:10,left:0,bottom:0}}>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(30,58,95,0.07)" vertical={false}/>
                  <XAxis dataKey="tower" tick={{fill:C.text3,fontSize:12,fontWeight:700}} axisLine={false} tickLine={false}/>
                  <YAxis domain={[0,100]} unit="%" tick={{fill:C.text3,fontSize:10}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={TT_STYLE} formatter={v=>[`${v}%`,'Collection Rate']}/>
                  <Bar dataKey="collection_rate" name="Collection Rate %" radius={[8,8,0,0]} animationDuration={1400}>
                    {data.tower_list.map((_,i)=><Cell key={i} fill={`url(#grad-tower-${i%TOWER_GRAD.length})`}/>)}
                    <LabelList dataKey="collection_rate" position="top" formatter={v=>`${v}%`} style={{fontSize:11,fontWeight:700,fill:C.text}}/>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
                  <ChartLegend items={
                    data.tower_list.map((t,i)=>({label:t.tower, color:GRADIENTS[TOWER_GRAD[i%TOWER_GRAD.length]][0]}))
                  }/>
            </GlassCard>

            {/* Tower Financial Breakdown */}
            <GlassCard title="Tower Financial Breakdown" icon={<BarChart3 size={15}/>} color={C.blue} delay={0.5} wide>
              <ResponsiveContainer width="100%" height={290}>
                <BarChart data={towerFin} margin={{top:22,right:20,left:0,bottom:0}} barGap={3} barCategoryGap="26%">
                  <defs>
                    <linearGradient id="gDemand2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={GRADIENTS.blue[0]} stopOpacity={0.9}/><stop offset="100%" stopColor={GRADIENTS.blue[1]} stopOpacity={0.7}/>
                    </linearGradient>
                    <linearGradient id="gReceived2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={GRADIENTS.brown[0]} stopOpacity={0.9}/><stop offset="100%" stopColor={GRADIENTS.brown[1]} stopOpacity={0.7}/>
                    </linearGradient>
                    <linearGradient id="gOutstanding2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={GRADIENTS.rose[0]} stopOpacity={0.9}/><stop offset="100%" stopColor={GRADIENTS.rose[1]} stopOpacity={0.7}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(30,58,95,0.07)" vertical={false}/>
                  <XAxis dataKey="name" tick={{fill:C.text3,fontSize:13,fontWeight:700}} axisLine={false} tickLine={false}/>
                  <YAxis unit=" Cr" tick={{fill:C.text3,fontSize:10}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={TT_STYLE} formatter={(v,n)=>[`₹${v} Cr`,n]}/>
                  <Bar dataKey="Demand"      fill="url(#gDemand2)" radius={[6,6,0,0]} animationDuration={1200}>
                    <LabelList dataKey="Demand"      position="top" style={{fontSize:10,fontWeight:700,fill:C.blue}}    formatter={v=>`${v}`}/>
                  </Bar>
                  <Bar dataKey="Received"    fill="url(#gReceived2)" radius={[6,6,0,0]} animationDuration={1300}>
                    <LabelList dataKey="Received"    position="top" style={{fontSize:10,fontWeight:700,fill:C.brownDk}} formatter={v=>`${v}`}/>
                  </Bar>
                  <Bar dataKey="Outstanding" fill="url(#gOutstanding2)" radius={[6,6,0,0]} animationDuration={1400}>
                    <LabelList dataKey="Outstanding" position="top" style={{fontSize:10,fontWeight:700,fill:C.rose}}    formatter={v=>`${v}`}/>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
                  <ChartLegend items={[
                    {label:'Demand',      color:GRADIENTS.blue[0]},
                    {label:'Received',    color:GRADIENTS.brown[0]},
                    {label:'Outstanding', color:GRADIENTS.rose[0]},
                  ]}/>
            </GlassCard>

          </div>
        </div>
      )}

      {/* ── AGEING ── */}
      {tab==='ageing' && (
        <div className="tab-content">
          <div className="ageing-row">
            {Object.entries(BUCKET_COLORS).map(([b,c],i)=>(
              <div key={b} className="age-card" style={{'--bc':c,animationDelay:`${i*0.07}s`}}>
                <div className="age-bkt">{b}</div>
                <div className="age-count">{(data.ageing[b]?.count??0).toLocaleString()}</div>
                <div className="age-amt">₹{(data.ageing[b]?.amount??0).toFixed(2)} Crs</div>
              </div>
            ))}
          </div>
          <div className="charts-grid">

            <GlassCard title="Installment Count by Ageing" icon={<BarChart3 size={15}/>} color={C.blue} delay={0.1}>
              <ResponsiveContainer width="100%" height={290}>
                <BarChart data={ageCountArr} margin={{top:24,right:10,left:0,bottom:0}}>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(30,58,95,0.07)" vertical={false}/>
                  <XAxis dataKey="name" tick={{fill:C.text3,fontSize:10,fontWeight:600}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fill:C.text3,fontSize:10}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={TT_STYLE} formatter={(v,n)=>[v.toLocaleString(),n]}/>
                          {d.name}
                        </span>
                      ))}
                    </div>
                  )}/>
                  <Bar dataKey="count" name="Count" radius={[8,8,0,0]} animationDuration={1400}>
                    {ageCountArr.map((e,i)=><Cell key={i} fill={e.fill}/>)}
                    <LabelList dataKey="count" position="top" formatter={v=>v.toLocaleString()} style={{fontSize:11,fontWeight:700,fill:C.text}}/>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
                  <ChartLegend items={
                    ageCountArr.filter(d=>d.count>0).map(d=>({label:d.name, color:BUCKET_COLORS[d.name]}))
                  }/>
            </GlassCard>

            <GlassCard title="Outstanding Amount by Ageing" icon={<IndianRupee size={15}/>} color={C.rose} delay={0.2}>
              <ResponsiveContainer width="100%" height={290}>
                <BarChart data={ageAmtArr} margin={{top:24,right:10,left:0,bottom:0}}>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(30,58,95,0.07)" vertical={false}/>
                  <XAxis dataKey="name" tick={{fill:C.text3,fontSize:10,fontWeight:600}} axisLine={false} tickLine={false}/>
                  <YAxis unit=" Cr" tick={{fill:C.text3,fontSize:10}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={TT_STYLE} formatter={(v,n)=>[`₹${v} Crs`,n]}/>
                          {d.name}
                        </span>
                      ))}
                    </div>
                  )}/>
                  <Bar dataKey="amount" name="Outstanding Crs" radius={[8,8,0,0]} animationDuration={1400}>
                    {ageAmtArr.map((e,i)=><Cell key={i} fill={e.fill}/>)}
                    <LabelList dataKey="amount" position="top" formatter={v=>`${v}Cr`} style={{fontSize:10,fontWeight:700,fill:C.text}}/>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
                  <ChartLegend items={
                    ageAmtArr.filter(d=>d.amount>0).map(d=>({label:d.name, color:BUCKET_COLORS[d.name]}))
                  }/>
            </GlassCard>

            <GlassCard title="Ageing Distribution" icon={<PieIcon size={15}/>} color={C.gold} delay={0.3}>
              <ResponsiveContainer width="100%" height={290}>
                <PieChart>
                  <Pie data={ageAmtArr.filter(d=>d.amount>0)} cx="50%" cy="48%"
                    outerRadius={100} innerRadius={50} dataKey="amount" nameKey="name"
                    paddingAngle={4} stroke="#fff" strokeWidth={2} animationDuration={1200}
                    label={({name,percent})=>`${name.split('–')[0].trim()} ${(percent*100).toFixed(0)}%`}>
                    {ageAmtArr.map((e,i)=><Cell key={i} fill={e.solidColor}/>)}
                  </Pie>
                  <Tooltip contentStyle={TT_STYLE} formatter={(v,n)=>[`₹${v} Crs`,n]}/>
                          {e.value}
                        </span>
                      ))}
                    </div>
                  )}/>
                </PieChart>
              </ResponsiveContainer>
                  <ChartLegend items={
                    ageAmtArr.filter(d=>d.amount>0).map(d=>({label:d.name, color:BUCKET_COLORS[d.name]}))
                  }/>
            </GlassCard>

          </div>
        </div>
      )}

      {/* ── MILESTONES ── */}
      {tab==='milestones' && (
        <div className="tab-content">
          <div className="charts-grid">
            <GlassCard title="Unbilled Milestone Count by Milestone" icon={<BarChart3 size={15}/>} color={C.blue} delay={0.1} wide>
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={data.top_unbilled_count} layout="vertical" margin={{top:5,right:85,left:8,bottom:5}}>
                  <defs>
                    <linearGradient id="gUnbilledCount" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%"   stopColor={GRADIENTS.blue[0]} stopOpacity={0.9}/>
                      <stop offset="100%" stopColor={GRADIENTS.blue[1]} stopOpacity={0.7}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(30,58,95,0.07)" horizontal={false}/>
                  <XAxis type="number" tick={{fill:C.text3,fontSize:10}} axisLine={false} tickLine={false}/>
                  <YAxis type="category" dataKey="name" width={190} tick={{fill:C.text,fontSize:9,fontWeight:600}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={TT_STYLE} formatter={(v,n)=>[v.toLocaleString(),n]}/>
                  <Bar dataKey="unbilled_count" name="Unbilled Count" fill="url(#gUnbilledCount)" radius={[0,8,8,0]} animationDuration={1400}>
                    <LabelList dataKey="unbilled_count" position="right" style={{fontSize:10,fontWeight:700,fill:C.text}} formatter={v=>v.toLocaleString()}/>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
                  <ChartLegend items={[{label:'Unbilled Count', color:GRADIENTS.blue[0]}]}/>
            </GlassCard>

            <GlassCard title="Unbilled Amount by Milestone" icon={<IndianRupee size={15}/>} color={C.brownLt} delay={0.2} wide>
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={data.top_unbilled_amount} layout="vertical" margin={{top:5,right:95,left:8,bottom:5}}>
                  <defs>
                    <linearGradient id="gUnbilledAmt" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%"   stopColor={GRADIENTS.demand[0]} stopOpacity={0.9}/>
                      <stop offset="100%" stopColor={GRADIENTS.demand[1]} stopOpacity={0.7}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(30,58,95,0.07)" horizontal={false}/>
                  <XAxis type="number" unit=" Cr" tick={{fill:C.text3,fontSize:10}} axisLine={false} tickLine={false}/>
                  <YAxis type="category" dataKey="name" width={190} tick={{fill:C.text,fontSize:9,fontWeight:600}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={TT_STYLE} formatter={(v,n)=>[`₹${v} Crs`,n]}/>
                  <Bar dataKey="unbilled_amount" name="Unbilled Amount (Crs)" fill="url(#gUnbilledAmt)" radius={[0,8,8,0]} animationDuration={1400}>
                    <LabelList dataKey="unbilled_amount" position="right" style={{fontSize:10,fontWeight:700,fill:C.brownDk}} formatter={v=>`${v}Cr`}/>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
                  <ChartLegend items={[{label:'Unbilled Amount (Crs)', color:GRADIENTS.demand[0]}]}/>
            </GlassCard>
          </div>
          <div className="section-hd">
            <h2>Milestone Summary Table</h2>
            <span className="badge">{sortedMs.length} milestones · paginated</span>
          </div>
          <MsTable rows={sortedMs}/>
        </div>
      )}

      {/* ── TOWERS ── */}
      {tab==='towers' && (
        <div className="tab-content">
          <div className="tower-cards">
            {data.tower_list.map((t,i)=>{
              const colors=TOWER_GRAD; const base=GRADIENTS[colors[i%colors.length]];
              return (
                <div key={i} className="tc" style={{'--tc-color':base[0],animationDelay:`${i*0.07}s`}}>
                  <div className="tc-name">{t.tower}</div>
                  <div className="tc-row"><span>Demand</span>      <strong>₹{t.demand} Crs</strong></div>
                  <div className="tc-row"><span>Received</span>    <strong>₹{t.received} Crs</strong></div>
                  <div className="tc-row"><span>Outstanding</span> <strong>₹{t.outstanding} Crs</strong></div>
                  <div className="tc-bar-bg"><div className="tc-bar" style={{width:`${t.collection_rate}%`,background:`linear-gradient(90deg,${base[0]},${base[1]})`}}/></div>
                  <div className="tc-rate">{t.collection_rate}% collected</div>
                </div>
              );
            })}
          </div>
          <div className="charts-grid">
            <GlassCard title="Tower Financial Breakdown" icon={<BarChart3 size={15}/>} color={C.blue} delay={0.2} wide>
              <ResponsiveContainer width="100%" height={310}>
                <BarChart data={towerFin} margin={{top:24,right:20,left:0,bottom:0}} barGap={3} barCategoryGap="26%">
                  <defs>
                    <linearGradient id="gD3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={GRADIENTS.blue[0]} stopOpacity={0.9}/><stop offset="100%" stopColor={GRADIENTS.blue[1]} stopOpacity={0.7}/></linearGradient>
                    <linearGradient id="gR3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={GRADIENTS.brown[0]} stopOpacity={0.9}/><stop offset="100%" stopColor={GRADIENTS.brown[1]} stopOpacity={0.7}/></linearGradient>
                    <linearGradient id="gO3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={GRADIENTS.rose[0]} stopOpacity={0.9}/><stop offset="100%" stopColor={GRADIENTS.rose[1]} stopOpacity={0.7}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(30,58,95,0.07)" vertical={false}/>
                  <XAxis dataKey="name" tick={{fill:C.text3,fontSize:13,fontWeight:700}} axisLine={false} tickLine={false}/>
                  <YAxis unit=" Cr" tick={{fill:C.text3,fontSize:10}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={TT_STYLE} formatter={(v,n)=>[`₹${v} Cr`,n]}/>
                  <Bar dataKey="Demand"      fill="url(#gD3)" radius={[6,6,0,0]} animationDuration={1200}><LabelList dataKey="Demand"      position="top" style={{fontSize:10,fontWeight:700,fill:C.blue}}    formatter={v=>`${v}`}/></Bar>
                  <Bar dataKey="Received"    fill="url(#gR3)" radius={[6,6,0,0]} animationDuration={1300}><LabelList dataKey="Received"    position="top" style={{fontSize:10,fontWeight:700,fill:C.brownDk}} formatter={v=>`${v}`}/></Bar>
                  <Bar dataKey="Outstanding" fill="url(#gO3)" radius={[6,6,0,0]} animationDuration={1400}><LabelList dataKey="Outstanding" position="top" style={{fontSize:10,fontWeight:700,fill:C.rose}}    formatter={v=>`${v}`}/></Bar>
                </BarChart>
              </ResponsiveContainer>
                  <ChartLegend items={[
                    {label:'Demand',      color:GRADIENTS.blue[0]},
                    {label:'Received',    color:GRADIENTS.brown[0]},
                    {label:'Outstanding', color:GRADIENTS.rose[0]},
                  ]}/>
            </GlassCard>

            <GlassCard title="Outstanding by Tower" icon={<PieIcon size={15}/>} color={C.rose} delay={0.3}>
              <ResponsiveContainer width="100%" height={290}>
                <PieChart>
                  <Pie data={data.tower_list} cx="50%" cy="48%" outerRadius={100} innerRadius={45}
                    dataKey="outstanding" nameKey="tower" paddingAngle={4} stroke="#fff" strokeWidth={2} animationDuration={1200}
                    label={({tower,outstanding})=>`${tower}: ₹${outstanding}Crs`}>
                    {data.tower_list.map((_,i)=><Cell key={i} fill={GRADIENTS[TOWER_GRAD[i%TOWER_GRAD.length]][0]}/>)}
                  </Pie>
                  <Tooltip contentStyle={TT_STYLE} formatter={(v,n)=>[`₹${v} Crs`,n]}/>
                </PieChart>
              </ResponsiveContainer>
                  <ChartLegend items={
                    data.tower_list.map((t,i)=>({label:t.tower, color:GRADIENTS[TOWER_GRAD[i%TOWER_GRAD.length]][0]}))
                  }/>
            </GlassCard>
          </div>
        </div>
      )}

      <footer className="dash-footer">
        Smartworld Sky Arc · Demand &amp; Collection Dashboard · {new Date().toLocaleDateString('en-IN',{year:'numeric',month:'long',day:'numeric'})}
      </footer>
    </div>
  );
}
