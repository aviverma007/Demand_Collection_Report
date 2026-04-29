import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import * as XLSX from 'xlsx';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Line, LabelList
} from 'recharts';
import { Building2, IndianRupee, TrendingUp, RotateCcw, BarChart3,
  PieChart as PieIcon, Activity, Wallet, LayoutGrid, RefreshCw } from 'lucide-react';
import './SalesDashboard.css';
import MilestoneModal from './MilestoneModal.jsx';

const C = {
  blue:'#1e3a5f', blueLight:'#2c5282', blueAcc:'#3b82c4',
  brown:'#8b5e3c', brownLt:'#b07d56', brownDk:'#6b4226',
  gold:'#c49a3c', green:'#2d7a4f', rose:'#b8443a',
  text:'#1a1a1a', text2:'#5c4a3a', text3:'#8b7355',
};
const GRADIENTS = {
  blue:['#3a6fd8','#1e3a5f'], brown:['#d4955a','#6b4226'],
  rose:['#e86a5a','#8b2e26'], gold:['#e0b84a','#8b6820'],
  green:['#48b87a','#1a5c36'], teal:['#3bbccc','#1a6b7a'],
  purple:['#9b71d4','#4a2880'], demand:['#b07d56','#6b4226'],
  received:['#3a6fd8','#1e3a5f'], outstanding:['#e86a5a','#8b2e26'],
};
const TOWER_GRAD = ['blue','brown','teal','gold','green','rose','purple'];
const BUCKET_COLORS = {
  '1–30 Days':C.green,'31–90 Days':C.gold,'91–180 Days':C.rose,'181+ Days':C.blue,'Not Yet Due':C.blueAcc,
};
const BUCKET_GRAD = {
  '1–30 Days':['#48b87a','#1a5c36'],'31–90 Days':['#e0b84a','#8b6820'],
  '91–180 Days':['#e86a5a','#8b2e26'],'181+ Days':['#3a6fd8','#1e3a5f'],'Not Yet Due':['#4a9fe8','#1e5a9f'],
};
const CR = 1_00_00_000;
const BUCKET_ORDER = ['1–30 Days','31–90 Days','91–180 Days','181+ Days','Not Yet Due'];
const TT_STYLE = {
  background:'rgba(255,255,255,0.98)', border:'1px solid rgba(180,160,140,0.3)',
  borderRadius:14, fontSize:12, boxShadow:'0 10px 40px rgba(0,0,0,0.12)', padding:'10px 14px',
};

/* ── helpers ── */
function parseDate(v) {
  if (!v) return null;
  if (v instanceof Date) return isNaN(v) ? null : v;
  if (typeof v === 'number') return new Date(Math.round((v - 25569) * 86400000));
  const d = new Date(v); return isNaN(d) ? null : d;
}
function daysSince(d) { return d ? (Date.now() - d.getTime()) / 86400000 : null; }
function bucketLabel(days) {
  if (days === null || days < 0) return 'Not Yet Due';
  if (days <= 30)  return '1–30 Days';
  if (days <= 90)  return '31–90 Days';
  if (days <= 180) return '91–180 Days';
  return '181+ Days';
}
function round(n) { return Math.round(n * 100) / 100; }

function parseRows(raw) {
  return raw.map(r => {
    const dn = r['Demand No'];
    return {
      _billDate:    parseDate(r['Bill creation date']),
      _sapDate:     parseDate(r['SAP Booking date']),
      _demand:      Number(r['Total Demand With Tax'])  || 0,
      _received:    Number(r['Received Amt (in Bank)']) || 0,
      _outstanding: Number(r['Outstanding Amount'])      || 0,
      _isBilled:    dn !== null && dn !== undefined && dn !== '' && dn !== 0,
      _tower:       String(r['Tower']         || '').trim(),
      _milestone:   String(r['Milestone']     || '').trim(),
      _unit:        String(r['Unit Number']   || '').trim(),
      _project:     String(r['Project Name']  || '').trim(),
      _company:     String(r['Company Name']  || '').trim(),
      _salesOrder:  String(r['Sale order No'] || '').trim(),
    };
  });
}

function computeDash(parsed) {
  const totalDemand      = parsed.reduce((s,r) => s + r._demand, 0);
  const totalReceived    = parsed.reduce((s,r) => s + r._received, 0);
  const totalOutstanding = parsed.reduce((s,r) => s + r._outstanding, 0);
  const billed   = parsed.filter(r => r._isBilled);
  const unbilled = parsed.filter(r => !r._isBilled);

  /* ageing */
  const ageing = {};
  BUCKET_ORDER.forEach(b => { ageing[b] = { count:0, amount:0 }; });
  billed.forEach(r => {
    const b = bucketLabel(daysSince(r._billDate));
    ageing[b].count++; ageing[b].amount += r._outstanding;
  });
  BUCKET_ORDER.forEach(b => { ageing[b].amount = round(ageing[b].amount / CR); });

  /* milestones */
  const msMap = {};
  parsed.forEach(r => {
    const key = r._milestone || '(Unknown)';
    if (!msMap[key]) msMap[key] = { name:key, billed_count:0, billed_amount:0, unbilled_count:0, unbilled_amount:0, bucketCounts:{} };
    const m = msMap[key];
    if (r._isBilled) {
      m.billed_count++; m.billed_amount += r._demand;
      const b = bucketLabel(daysSince(r._billDate));
      m.bucketCounts[b] = (m.bucketCounts[b]||0) + 1;
    } else { m.unbilled_count++; m.unbilled_amount += r._demand; }
  });
  const milestone_list = Object.values(msMap).map(m => ({
    name: m.name,
    billed_count: m.billed_count, billed_amount: round(m.billed_amount/CR),
    unbilled_count: m.unbilled_count, unbilled_amount: round(m.unbilled_amount/CR),
    ageing_bucket: m.billed_count > 0
      ? Object.entries(m.bucketCounts).sort((a,b)=>b[1]-a[1])[0][0] : 'Not Yet Due',
  })).sort((a,b)=>(b.billed_count+b.unbilled_count)-(a.billed_count+a.unbilled_count));
  const top_unbilled_count  = [...milestone_list].filter(m=>m.unbilled_count>0).sort((a,b)=>b.unbilled_count-a.unbilled_count).slice(0,10);
  const top_unbilled_amount = [...milestone_list].filter(m=>m.unbilled_amount>0).sort((a,b)=>b.unbilled_amount-a.unbilled_amount).slice(0,10);
  const top_billed          = [...milestone_list].filter(m=>m.billed_count>0).sort((a,b)=>b.billed_count-a.billed_count).slice(0,10);

  /* towers — grouped by project */
  const twMap = {};
  parsed.forEach(r => {
    const key = `${r._project}|||${r._tower}`;
    if (!twMap[key]) twMap[key] = { tower:r._tower, project:r._project, demand:0, received:0, outstanding:0 };
    twMap[key].demand      += r._demand;
    twMap[key].received    += r._received;
    twMap[key].outstanding += r._outstanding;
  });
  const tower_list = Object.values(twMap).map(t => ({
    tower: t.tower, project: t.project,
    demand:          round(t.demand/CR),
    received:        round(t.received/CR),
    outstanding:     round(t.outstanding/CR),
    collection_rate: t.demand ? round(t.received/t.demand*100) : 0,
  })).sort((a,b)=>b.demand-a.demand);

  /* project summary */
  const projMap = {};
  parsed.forEach(r => {
    const k = r._project || 'Unknown';
    if (!projMap[k]) projMap[k] = { project:k, demand:0, received:0, outstanding:0, towers:new Set() };
    projMap[k].demand      += r._demand;
    projMap[k].received    += r._received;
    projMap[k].outstanding += r._outstanding;
    projMap[k].towers.add(r._tower);
  });
  const project_list = Object.values(projMap).map(p => ({
    project: p.project,
    demand:          round(p.demand/CR),
    received:        round(p.received/CR),
    outstanding:     round(p.outstanding/CR),
    collection_rate: p.demand ? round(p.received/p.demand*100) : 0,
    tower_count:     p.towers.size,
  })).sort((a,b)=>b.demand-a.demand);

  /* monthly */
  const monMap = {};
  parsed.forEach(r => {
    if (!r._sapDate) return;
    const k = `${r._sapDate.getFullYear()}-${String(r._sapDate.getMonth()+1).padStart(2,'0')}`;
    if (!monMap[k]) monMap[k] = { demand:0, received:0 };
    monMap[k].demand   += r._demand; monMap[k].received += r._received;
  });
  const monthly = Object.entries(monMap).sort(([a],[b])=>a.localeCompare(b)).map(([key,v]) => {
    const [yr,mo] = key.split('-');
    const d = new Date(Number(yr), Number(mo)-1, 1);
    return { month: d.toLocaleDateString('en-IN',{month:'short',year:'numeric'}), demand:round(v.demand/CR), received:round(v.received/CR) };
  });

  return {
    summary: {
      total_records: parsed.length, total_units: new Set(parsed.map(r=>r._unit)).size,
      total_sales_orders: new Set(parsed.map(r=>r._salesOrder)).size,
      total_milestones: new Set(parsed.map(r=>r._milestone)).size,
      total_towers: new Set(parsed.map(r=>r._tower)).size,
      total_demand_cr: round(totalDemand/CR), total_received_cr: round(totalReceived/CR),
      total_outstanding_cr: round(totalOutstanding/CR),
      collection_rate: totalDemand ? round(totalReceived/totalDemand*100) : 0,
      billed_count: billed.length, unbilled_count: unbilled.length,
    },
    ageing, milestone_list, top_unbilled_count, top_unbilled_amount, top_billed,
    tower_list, project_list, monthly,
  };
}

/* ── Custom Pie Label with numbers ── */
const RADIAN = Math.PI / 180;
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }) {
  const r  = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x  = cx + r * Math.cos(-midAngle * RADIAN);
  const y  = cy + r * Math.sin(-midAngle * RADIAN);
  if (percent < 0.04) return null;
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {value.toLocaleString()}
    </text>
  );
}

/* ── Scrollable chart wrapper ── */
function ScrollChart({ data, height=300, barWidth=52, children }) {
  const minWidth = Math.max(data.length * (barWidth + 20), 500);
  return (
    <div style={{ overflowX:'auto', overflowY:'visible', paddingBottom:4 }}>
      <div style={{ minWidth, width:minWidth }}>
        <ResponsiveContainer width="100%" height={height}>
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ── sub-components ── */
function ChartLegend({ items }) {
  return (
    <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'8px 18px', paddingTop:10 }}>
      {items.map((item,i) => (
        <span key={i} style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:C.text2, fontWeight:600 }}>
          <span style={{ width:12, height:12, borderRadius:3, background:item.color, flexShrink:0, display:'inline-block' }}/>
          {item.label}
        </span>
      ))}
    </div>
  );
}

function GradientDefs() {
  return (
    <svg width={0} height={0} style={{ position:'absolute', pointerEvents:'none' }}>
      <defs>
        {Object.entries(GRADIENTS).map(([id,[top,bot]]) => (
          <linearGradient key={id} id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={top} stopOpacity={0.95}/>
            <stop offset="100%" stopColor={bot} stopOpacity={0.75}/>
          </linearGradient>
        ))}
        {TOWER_GRAD.map((id,i) => (
          <linearGradient key={`tw-${i}`} id={`grad-tower-${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={GRADIENTS[id][0]} stopOpacity={0.95}/>
            <stop offset="100%" stopColor={GRADIENTS[id][1]} stopOpacity={0.75}/>
          </linearGradient>
        ))}
        {Object.entries(BUCKET_GRAD).map(([id,[top,bot]]) => (
          <linearGradient key={`bkt-${id}`} id={`grad-bkt-${id.replace(/[^a-z0-9]/gi,'')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={top} stopOpacity={0.95}/>
            <stop offset="100%" stopColor={bot} stopOpacity={0.75}/>
          </linearGradient>
        ))}
        {/* horizontal gradients for milestone bars */}
        <linearGradient id="gUnbilledCount" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor={GRADIENTS.blue[0]} stopOpacity={0.9}/>
          <stop offset="100%" stopColor={GRADIENTS.blue[1]} stopOpacity={0.7}/>
        </linearGradient>
        <linearGradient id="gUnbilledAmt" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor={GRADIENTS.demand[0]} stopOpacity={0.9}/>
          <stop offset="100%" stopColor={GRADIENTS.demand[1]} stopOpacity={0.7}/>
        </linearGradient>
        <linearGradient id="gDemandBar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={GRADIENTS.demand[0]} stopOpacity={0.9}/>
          <stop offset="100%" stopColor={GRADIENTS.demand[1]} stopOpacity={0.6}/>
        </linearGradient>
        <linearGradient id="gDemand2"      x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={GRADIENTS.blue[0]}   stopOpacity={0.9}/><stop offset="100%" stopColor={GRADIENTS.blue[1]}   stopOpacity={0.7}/></linearGradient>
        <linearGradient id="gReceived2"    x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={GRADIENTS.brown[0]}  stopOpacity={0.9}/><stop offset="100%" stopColor={GRADIENTS.brown[1]}  stopOpacity={0.7}/></linearGradient>
        <linearGradient id="gOutstanding2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={GRADIENTS.rose[0]}   stopOpacity={0.9}/><stop offset="100%" stopColor={GRADIENTS.rose[1]}   stopOpacity={0.7}/></linearGradient>
      </defs>
    </svg>
  );
}

function KPI3D({ icon, label, value, sub, color, delay=0, ring }) {
  const [hov, setHov] = useState(false);
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x:0, y:0 });
  const onMove = useCallback(e => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setTilt({ x:(e.clientY-r.top)/r.height-0.5, y:(e.clientX-r.left)/r.width-0.5 });
  },[]);
  return (
    <div ref={ref} className="kpi-card"
      style={{ '--accent':color,'--glow-color':`${color}18`,animationDelay:`${delay*0.08}s`,
        border:`1.5px solid ${hov?color+'40':'var(--border-glass)'}`,
        transform:`perspective(600px) rotateX(${tilt.x*-12}deg) rotateY(${tilt.y*12}deg) ${hov?'translateY(-6px) scale(1.02)':''}`,
        boxShadow:hov?`0 20px 50px ${color}25, inset 0 1px 0 rgba(255,255,255,0.6)`:`0 3px 12px ${color}10, inset 0 1px 0 rgba(255,255,255,0.6)`,
      }}
      onMouseEnter={()=>setHov(true)} onMouseMove={onMove} onMouseLeave={()=>{ setHov(false); setTilt({x:0,y:0}); }}>
      <div className="kpi-shimmer"/>
      <div className="kpi-corner" style={{background:`radial-gradient(circle,${color}20 0%,transparent 65%)`}}/>
      {ring && (
        <svg width="32" height="32" style={{position:'absolute',top:8,right:8}} viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="12" fill="none" stroke={`${color}18`} strokeWidth="3"/>
          <circle cx="16" cy="16" r="12" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"
            strokeDasharray={`${Math.min(ring/100,1)*75.4} 75.4`} transform="rotate(-90 16 16)"/>
          <text x="16" y="17" textAnchor="middle" dominantBaseline="central" fill={color} fontSize="7" fontWeight="700">{Math.round(ring)}</text>
        </svg>
      )}
      <div className="kpi-icon-wrap" style={{background:`linear-gradient(145deg,${color}15,${color}08)`,border:`1.5px solid ${color}20`,color}}>{icon}</div>
      <div>
        <div className="kpi-label">{label}</div>
        <div className="kpi-value" style={{animationDelay:`${0.3+delay*0.08}s`}}>{value}</div>
        {sub && <div className="kpi-sub">{sub}</div>}
      </div>
    </div>
  );
}

/* ── Billed/Unbilled card with FIXED z-index popup ── */
function BilledCard({ type, count, color, delay, onClick, previewRows }) {
  const [hov, setHov]         = useState(false);
  const [showPrev, setShowPrev] = useState(false);
  const [popupPos, setPopupPos] = useState({ top:0, left:0 });
  const timerRef  = useRef(null);
  const cardRef   = useRef(null);
  const isBilled  = type === 'billed';
  const label     = isBilled ? 'BILLED'   : 'UNBILLED';
  const sub       = isBilled ? 'Invoices raised' : 'Pending invoicing';
  const icon      = isBilled ? '🧾' : '🔔';
  const countKey  = isBilled ? 'billed_count'  : 'unbilled_count';
  const amtKey    = isBilled ? 'billed_amount' : 'unbilled_amount';

  const handleEnter = () => {
    setHov(true);
    timerRef.current = setTimeout(() => {
      if (cardRef.current) {
        const r = cardRef.current.getBoundingClientRect();
        // Position above the card; shift left to centre the 360px popup
        setPopupPos({
          top:  r.top - 8,          // will be translated up by popup itself
          left: r.left + r.width/2, // centred horizontally on card
        });
      }
      setShowPrev(true);
    }, 280);
  };
  const handleLeave = () => {
    setHov(false);
    clearTimeout(timerRef.current);
    setShowPrev(false);
  };

  return (
    <div ref={cardRef} style={{ animationDelay:`${delay*0.08}s` }}
      onMouseEnter={handleEnter} onMouseLeave={handleLeave}>

      <div onClick={onClick} style={{
        background:'var(--bg-glass)', backdropFilter:'blur(20px)',
        border:`1.5px solid ${hov?color+'60':'var(--border-glass)'}`,
        borderTop:`3px solid ${color}`, borderRadius:'var(--radius)',
        padding:'14px 14px 12px', position:'relative', overflow:'hidden', cursor:'pointer',
        display:'flex', alignItems:'flex-start', gap:10,
        transform:hov?'translateY(-4px)':'none',
        boxShadow:hov?`0 24px 50px ${color}30`:`0 3px 12px ${color}15`,
        transition:'all 0.2s ease', '--glow-color':`${color}18`,
        animation:'slide-up 0.6s ease-out backwards, glow-breathe 4s ease-in-out infinite',
      }}>
        <div style={{ width:32, height:32, borderRadius:9, background:`linear-gradient(145deg,${color}20,${color}10)`,
          border:`1.5px solid ${color}25`, color, display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:16, flexShrink:0 }}>{icon}</div>
        <div>
          <div style={{ fontSize:8, color:'var(--text3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.6px', marginBottom:2 }}>{label}</div>
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:'clamp(13px,1.4vw,17px)', fontWeight:700, color }}>{count.toLocaleString()}</div>
          <div style={{ fontSize:10, color:'var(--text2)', marginTop:3 }}>{sub}</div>
        </div>
      </div>

      {/* Portal: renders into document.body — escapes ALL overflow:hidden ancestors */}
      {showPrev && previewRows.length > 0 && ReactDOM.createPortal(
        <PopupTable rows={previewRows} color={color} label={label}
          countKey={countKey} amtKey={amtKey} pos={popupPos}/>,
        document.body
      )}
    </div>
  );
}

/* Fixed-position popup rendered via portal into document.body */
function PopupTable({ rows, color, label, countKey, amtKey, pos }) {
  return (
    <div style={{
      position:'fixed',
      top:  pos.top,
      left: pos.left,
      transform:'translate(-50%, -100%) translateY(-12px)', // above the card, centred
      width:360,
      background:'rgba(255,255,255,0.99)',
      border:`1.5px solid ${color}40`, borderRadius:14,
      boxShadow:`0 24px 60px rgba(0,0,0,0.28)`,
      zIndex:999999,
      overflow:'hidden', pointerEvents:'none',
    }}>
      <div style={{ padding:'10px 14px', background:`linear-gradient(135deg,${color},${color}bb)`, color:'#fff' }}>
        <div style={{ fontSize:11, fontWeight:700 }}>Top 5 {label} Milestones</div>
      </div>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
        <thead><tr style={{ background:'rgba(0,0,0,0.04)' }}>
          <th style={{ padding:'6px 10px', textAlign:'left', fontSize:9, fontWeight:700, color:'#8b7355', textTransform:'uppercase' }}>Milestone</th>
          <th style={{ padding:'6px 10px', textAlign:'right', fontSize:9, fontWeight:700, color:'#8b7355', textTransform:'uppercase' }}>Count</th>
          <th style={{ padding:'6px 10px', textAlign:'right', fontSize:9, fontWeight:700, color:'#8b7355', textTransform:'uppercase' }}>Amt (Cr)</th>
        </tr></thead>
        <tbody>
          {rows.slice(0,5).map((m,i) => (
            <tr key={i} style={{ borderTop:'1px solid rgba(180,160,140,0.12)', background:i%2===0?'#fff':'rgba(241,237,232,0.4)' }}>
              <td style={{ padding:'7px 10px', color:'#1e3a5f', fontWeight:600, maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} title={m.name}>
                {m.name.length>28?m.name.slice(0,28)+'…':m.name}
              </td>
              <td style={{ padding:'7px 10px', textAlign:'right', fontFamily:"'Space Mono',monospace", color, fontWeight:700 }}>{m[countKey].toLocaleString()}</td>
              <td style={{ padding:'7px 10px', textAlign:'right', fontFamily:"'Space Mono',monospace", color:'#8b5e3c', fontWeight:700 }}>₹{m[amtKey].toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GlassCard({ title, icon, color='var(--blue)', children, wide, delay=0 }) {
  const [hov, setHov] = useState(false);
  return (
    <div className={`chart-card${wide?' wide':''}`}
      style={{ '--cc':color, animationDelay:`${delay}s`, overflow:'visible',
        border:`1.5px solid ${hov?'rgba(30,58,95,0.2)':'var(--border-glass)'}`,
        boxShadow:hov?'0 16px 45px rgba(30,58,95,0.14)':'0 3px 14px rgba(30,58,95,0.06)',
        transform:hov?'translateY(-3px)':'none', transition:'all 0.2s' }}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      <div className="chart-header">
        <span className="chart-icon-wrap" style={{color,background:`${color}10`,borderColor:`${color}18`}}>{icon}</span>
        <span className="chart-title-text">{title}</span>
      </div>
      <div style={{flex:1,minHeight:0}}>{children}</div>
    </div>
  );
}

function MsTable({ rows }) {
  const [page, setPage] = useState(0);
  const PER=8, pages=Math.ceil(rows.length/PER), slice=rows.slice(page*PER,(page+1)*PER);
  useEffect(()=>{ setPage(0); },[rows]);
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

/* ── Project Tower Section (big cards per project) ── */
function ProjectTowerSection({ project, towers, colorIdx }) {
  const base = GRADIENTS[TOWER_GRAD[colorIdx % TOWER_GRAD.length]];
  const projTotals = towers.reduce((acc,t) => ({
    demand:      acc.demand      + t.demand,
    received:    acc.received    + t.received,
    outstanding: acc.outstanding + t.outstanding,
  }), { demand:0, received:0, outstanding:0 });
  const projRate = projTotals.demand ? round(projTotals.received/projTotals.demand*100) : 0;

  const finData = towers.map(t=>({ name:t.tower, Demand:t.demand, Received:t.received, Outstanding:t.outstanding }));
  const barW = 55;

  return (
    <div style={{
      background:'var(--bg-glass)', backdropFilter:'blur(20px)',
      border:`1.5px solid ${base[0]}30`, borderRadius:18,
      padding:24, marginBottom:28,
      boxShadow:`0 4px 20px ${base[0]}10`,
    }}>
      {/* Project header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:`linear-gradient(135deg,${base[0]},${base[1]})`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Building2 size={20} color="#fff"/>
          </div>
          <div>
            <div style={{ fontSize:16, fontWeight:800, color:C.blue }}>{project}</div>
            <div style={{ fontSize:11, color:C.text3 }}>{towers.length} towers · ₹{round(projTotals.demand)} Crs total demand</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:16 }}>
          {[
            { label:'Demand',      val:`₹${round(projTotals.demand)} Cr`,      col:C.blue },
            { label:'Received',    val:`₹${round(projTotals.received)} Cr`,    col:C.green },
            { label:'Outstanding', val:`₹${round(projTotals.outstanding)} Cr`, col:C.rose },
            { label:'Collection',  val:`${projRate}%`,                         col:C.gold },
          ].map((item,i)=>(
            <div key={i} style={{ textAlign:'center', padding:'8px 16px', background:`${item.col}10`, borderRadius:10, border:`1px solid ${item.col}20` }}>
              <div style={{ fontSize:13, fontWeight:800, color:item.col }}>{item.val}</div>
              <div style={{ fontSize:9, color:C.text3, fontWeight:600, textTransform:'uppercase', letterSpacing:0.5 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tower mini-cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))', gap:12, marginBottom:22 }}>
        {towers.map((t,i)=>{
          const g = GRADIENTS[TOWER_GRAD[i%TOWER_GRAD.length]];
          return (
            <div key={i} style={{
              background:'rgba(255,255,255,0.7)', borderRadius:12, padding:'12px 14px',
              border:`1px solid ${g[0]}25`, boxShadow:`0 2px 8px ${g[0]}10`,
            }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                <div style={{ fontSize:13, fontWeight:800, color:C.blue }}>{t.tower}</div>
                <div style={{ fontSize:10, fontWeight:700, color:'#fff', background:`linear-gradient(135deg,${g[0]},${g[1]})`, padding:'2px 8px', borderRadius:20 }}>
                  {t.collection_rate}%
                </div>
              </div>
              <div style={{ fontSize:11, color:C.text2, marginBottom:3 }}>
                <span style={{ color:C.text3 }}>Demand: </span>₹{t.demand} Cr
              </div>
              <div style={{ fontSize:11, color:C.text2, marginBottom:3 }}>
                <span style={{ color:C.text3 }}>Received: </span>₹{t.received} Cr
              </div>
              <div style={{ fontSize:11, color:C.rose, marginBottom:8 }}>
                <span style={{ color:C.text3 }}>Outstanding: </span>₹{t.outstanding} Cr
              </div>
              {/* progress bar */}
              <div style={{ height:5, background:'rgba(0,0,0,0.08)', borderRadius:4, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${Math.min(t.collection_rate,100)}%`, background:`linear-gradient(90deg,${g[0]},${g[1]})`, borderRadius:4 }}/>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tower financial chart — scrollable */}
      <div style={{ marginBottom:6 }}>
        <div style={{ fontSize:12, fontWeight:700, color:C.text2, marginBottom:10 }}>Financial Breakdown by Tower</div>
        <div style={{ overflowX:'auto', paddingBottom:6 }}>
          <div style={{ minWidth: Math.max(towers.length * 200, 500) }}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={finData} margin={{top:28,right:20,left:0,bottom:0}} barGap={4} barCategoryGap="28%">
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(30,58,95,0.07)" vertical={false}/>
                <XAxis dataKey="name" tick={{fill:C.text3,fontSize:12,fontWeight:700}} axisLine={false} tickLine={false}/>
                <YAxis unit=" Cr" tick={{fill:C.text3,fontSize:10}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={TT_STYLE} formatter={(v,n)=>[`₹${v} Cr`,n]}/>
                <Bar dataKey="Demand"      fill="url(#gDemand2)"      radius={[8,8,0,0]} barSize={barW} animationDuration={1200}>
                  <LabelList dataKey="Demand"      position="top" style={{fontSize:10,fontWeight:700,fill:C.blue}}    formatter={v=>`${v}`}/>
                </Bar>
                <Bar dataKey="Received"    fill="url(#gReceived2)"    radius={[8,8,0,0]} barSize={barW} animationDuration={1300}>
                  <LabelList dataKey="Received"    position="top" style={{fontSize:10,fontWeight:700,fill:C.brownDk}} formatter={v=>`${v}`}/>
                </Bar>
                <Bar dataKey="Outstanding" fill="url(#gOutstanding2)" radius={[8,8,0,0]} barSize={barW} animationDuration={1400}>
                  <LabelList dataKey="Outstanding" position="top" style={{fontSize:10,fontWeight:700,fill:C.rose}}    formatter={v=>`${v}`}/>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <ChartLegend items={[{label:'Demand',color:GRADIENTS.blue[0]},{label:'Received',color:GRADIENTS.brown[0]},{label:'Outstanding',color:GRADIENTS.rose[0]}]}/>
      </div>
    </div>
  );
}

/* ── Main Dashboard ── */
export default function Dashboard() {
  const [parsedRows, setParsedRows] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [tab, setTab]               = useState('overview');
  const [fp, setFp]                 = useState('All');
  const [fc, setFc]                 = useState('All');
  const [ft, setFt]                 = useState('All');
  const [modal, setModal]           = useState(null);

  const loadExcel = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/data/dapp_final.xlsx?t=' + Date.now());
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = await res.arrayBuffer();
      const wb  = XLSX.read(buf, { type:'array', cellDates:true });
      const ws  = wb.Sheets[wb.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json(ws, { defval:null });
      setParsedRows(parseRows(raw));
    } catch(e) { setError(e.message); }
    finally    { setLoading(false); }
  }, []);

  useEffect(() => { loadExcel(); }, [loadExcel]);

  const allProjects  = useMemo(() => parsedRows ? [...new Set(parsedRows.map(r=>r._project).filter(Boolean))].sort() : [], [parsedRows]);
  const allCompanies = useMemo(() => parsedRows ? [...new Set(parsedRows.map(r=>r._company).filter(Boolean))].sort() : [], [parsedRows]);
  const allTowers    = useMemo(() => parsedRows ? [...new Set(parsedRows.map(r=>r._tower).filter(Boolean))].sort() : [], [parsedRows]);

  const filtered = useMemo(() => {
    if (!parsedRows) return [];
    return parsedRows.filter(r => {
      if (fp !== 'All' && r._project !== fp) return false;
      if (fc !== 'All' && r._company !== fc) return false;
      if (ft !== 'All' && r._tower   !== ft) return false;
      return true;
    });
  }, [parsedRows, fp, fc, ft]);

  const dash = useMemo(() => filtered.length ? computeDash(filtered) : null, [filtered]);

  const resetFilters = () => { setFp('All'); setFc('All'); setFt('All'); };
  const isFiltered   = fp!=='All' || fc!=='All' || ft!=='All';

  /* ── States ── */
  if (loading) return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100vh',background:'linear-gradient(135deg,#f5f0e8,#e8ddd0)',gap:20}}>
      <div style={{width:48,height:48,border:`4px solid ${C.blue}20`,borderTop:`4px solid ${C.blue}`,borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
      <div style={{fontSize:16,color:C.blue,fontWeight:700}}>Loading Excel data…</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (error) return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100vh',background:'linear-gradient(135deg,#f5f0e8,#e8ddd0)',gap:16}}>
      <div style={{fontSize:40}}>⚠️</div>
      <div style={{fontSize:18,color:C.rose,fontWeight:700}}>Could not load Excel file</div>
      <div style={{fontSize:13,color:C.text2,maxWidth:400,textAlign:'center'}}>{error}</div>
      <button onClick={loadExcel} style={{padding:'10px 24px',background:C.blue,color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontWeight:700}}>Retry</button>
    </div>
  );
  if (!dash) return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100vh',background:'linear-gradient(135deg,#f5f0e8,#e8ddd0)',gap:16}}>
      <div style={{fontSize:40}}>🔍</div>
      <div style={{fontSize:18,color:C.brownDk,fontWeight:700}}>No data matches current filters</div>
      <button onClick={resetFilters} style={{padding:'10px 24px',background:C.blue,color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontWeight:700}}>Reset Filters</button>
    </div>
  );

  const s            = dash.summary;
  const billedRows   = dash.milestone_list.filter(m=>m.billed_count>0).sort((a,b)=>b.billed_count-a.billed_count);
  const unbilledRows = dash.milestone_list.filter(m=>m.unbilled_count>0).sort((a,b)=>b.unbilled_count-a.unbilled_count);

  const ageCountArr = BUCKET_ORDER.map(b=>({ name:b, count:dash.ageing[b]?.count??0, fill:`url(#grad-bkt-${b.replace(/[^a-z0-9]/gi,'')})`, solidColor:BUCKET_COLORS[b] }));
  const ageAmtArr   = BUCKET_ORDER.map(b=>({ name:b, amount:dash.ageing[b]?.amount??0, fill:`url(#grad-bkt-${b.replace(/[^a-z0-9]/gi,'')})`, solidColor:BUCKET_COLORS[b] }));

  const billedPie = [
    {name:'Billed',   value:s.billed_count,   color:C.blue},
    {name:'Unbilled', value:s.unbilled_count, color:C.brownLt},
  ];

  /* towers grouped by project */
  const towersByProject = {};
  dash.tower_list.forEach(t => {
    if (!towersByProject[t.project]) towersByProject[t.project] = [];
    towersByProject[t.project].push(t);
  });

  /* project-level collection rate chart */
  const projRateData = dash.project_list.map(p=>({ name:p.project.length>20?p.project.slice(0,18)+'…':p.project, rate:p.collection_rate, full:p.project }));

  return (
    <div className="dashboard">
      <GradientDefs/>
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
          <button onClick={loadExcel} style={{background:'transparent',border:`1px solid rgba(255,255,255,0.3)`,borderRadius:8,color:'#fff',padding:'4px 10px',cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontSize:12}}>
            <RefreshCw size={13}/> Refresh Data
          </button>
          <span className="live-indicator">● LIVE</span>
          <span className="header-meta">{s.total_units} units · {s.total_records.toLocaleString()} records</span>
        </div>
      </header>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-group">
          <span className="filter-lbl">Project</span>
          <select className="filter-select" value={fp} onChange={e=>{setFp(e.target.value);setFt('All');}}>
            <option value="All">All Projects</option>
            {allProjects.map(p=><option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <span className="filter-lbl">Company</span>
          <select className="filter-select" value={fc} onChange={e=>{setFc(e.target.value);setFt('All');}}>
            <option value="All">All Companies</option>
            {allCompanies.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <span className="filter-lbl">Tower</span>
          <select className="filter-select" value={ft} onChange={e=>setFt(e.target.value)}>
            <option value="All">All Towers</option>
            {allTowers.map(t=><option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <button className="reset-btn" onClick={resetFilters}><RotateCcw size={13}/> Reset</button>
        {isFiltered && (
          <span style={{fontSize:11,color:C.brownLt,fontWeight:700,padding:'0 8px',alignSelf:'center'}}>
            Showing {s.total_records.toLocaleString()} of {parsedRows.length.toLocaleString()} rows
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="tab-nav">
        {[['overview','Overview'],['ageing','Ageing Analysis'],['milestones','Milestones'],['towers','Towers']].map(([id,lbl])=>(
          <button key={id} className={`tab-btn${tab===id?' active':''}`} onClick={()=>setTab(id)}>{lbl}</button>
        ))}
      </div>

      {/* KPIs */}
      <section className="kpi-grid" style={{overflow:'visible'}}>
        <KPI3D icon={<LayoutGrid size={20}/>}  label="Booked Units"  value={s.total_sales_orders}              sub="Unique sales orders"              color={C.blue}    delay={0}/>
        <KPI3D icon={<IndianRupee size={20}/>} label="Total Demand"  value={`₹${s.total_demand_cr} Crs`}       sub={`${s.total_records.toLocaleString()} installments`} color={C.brownLt} delay={1}/>
        <KPI3D icon={<Wallet size={20}/>}      label="Received"      value={`₹${s.total_received_cr} Crs`}     sub={`${s.collection_rate}% collected`} color={C.green}   delay={2} ring={parseFloat(s.collection_rate)}/>
        <KPI3D icon={<TrendingUp size={20}/>}  label="Outstanding"   value={`₹${s.total_outstanding_cr} Crs`}  sub="Pending payment"                  color={C.rose}    delay={3}/>
        <BilledCard type="billed"   count={s.billed_count}   color={C.blue} delay={4} onClick={()=>setModal('billed')}   previewRows={billedRows}/>
        <BilledCard type="unbilled" count={s.unbilled_count} color={C.gold} delay={5} onClick={()=>setModal('unbilled')} previewRows={unbilledRows}/>
        <KPI3D icon={<Building2 size={20}/>}   label="Milestones"    value={s.total_milestones}                sub={`${s.total_towers} towers`}        color={C.brownDk} delay={6}/>
      </section>

      {/* ── OVERVIEW ── */}
      {tab==='overview' && (
        <div className="tab-content">
          <div className="charts-grid">

            {/* Monthly chart */}
            <GlassCard title="Monthly Demand vs Received" icon={<Activity size={15}/>} color={C.brownDk} delay={0.4} wide>
              <div style={{overflowX:'auto',paddingBottom:4}}>
                <div style={{minWidth:Math.max(dash.monthly.length*70,500)}}>
                  <ResponsiveContainer width="100%" height={280}>
                    <ComposedChart data={dash.monthly} margin={{top:18,right:22,left:5,bottom:20}}>
                      <CartesianGrid strokeDasharray="4 4" stroke="rgba(30,58,95,0.08)" vertical={false}/>
                      <XAxis dataKey="month" tick={{fill:C.text3,fontSize:10,fontWeight:600}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fill:C.text3,fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}Cr`}/>
                      <Tooltip contentStyle={TT_STYLE} formatter={(v,n)=>[`₹${v} Cr`,n]}/>
                      <Bar dataKey="demand" name="Demand" fill="url(#gDemandBar)" radius={[8,8,0,0]} barSize={28} animationDuration={1200}/>
                      <Line type="monotone" dataKey="received" name="Received" stroke={C.blue} strokeWidth={3}
                        dot={{r:4,fill:'#fff',stroke:C.blue,strokeWidth:2}}
                        activeDot={{r:7,fill:C.blue,stroke:'#fff',strokeWidth:2}} animationDuration={1600}/>
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <ChartLegend items={[{label:'Demand',color:GRADIENTS.demand[0]},{label:'Received',color:C.blue}]}/>
            </GlassCard>

            {/* Billed/Unbilled Pie — with numbers */}
            <GlassCard title="Booking Status" icon={<PieIcon size={15}/>} color={C.brown} delay={0.3}>
              <div style={{textAlign:'center',paddingTop:8}}>
                <div style={{display:'flex',justifyContent:'center',gap:24,marginBottom:10}}>
                  <div>
                    <div style={{fontFamily:"'Space Mono',monospace",fontSize:26,fontWeight:800,color:C.blue}}>{s.billed_count.toLocaleString()}</div>
                    <div style={{fontSize:10,color:C.text3,fontWeight:700,textTransform:'uppercase',letterSpacing:0.5}}>Billed</div>
                  </div>
                  <div style={{width:1,background:'rgba(0,0,0,0.1)'}}/>
                  <div>
                    <div style={{fontFamily:"'Space Mono',monospace",fontSize:26,fontWeight:800,color:C.gold}}>{s.unbilled_count.toLocaleString()}</div>
                    <div style={{fontSize:10,color:C.text3,fontWeight:700,textTransform:'uppercase',letterSpacing:0.5}}>Unbilled</div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={billedPie} cx="50%" cy="50%" innerRadius="40%" outerRadius="75%"
                      dataKey="value" nameKey="name" paddingAngle={4} stroke="#fff" strokeWidth={3}
                      animationDuration={1200} labelLine={false}
                      label={<PieLabel/>}>
                      {billedPie.map((e,i)=><Cell key={i} fill={e.color}/>)}
                    </Pie>
                    <Tooltip contentStyle={TT_STYLE} formatter={(v,n)=>[v.toLocaleString(),n]}/>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{fontSize:13,color:C.green,fontWeight:700,marginTop:4}}>{s.collection_rate}% Collected</div>
              </div>
              <ChartLegend items={[{label:'Billed',color:C.blue},{label:'Unbilled',color:C.brownLt}]}/>
            </GlassCard>

            {/* Tower collection rate — one color per project */}
            <GlassCard title="Tower Collection Rate" icon={<BarChart3 size={15}/>} color={C.blue} delay={0.2}>
              <div style={{display:'flex',flexDirection:'column',gap:14,paddingTop:2}}>
                {Object.entries(towersByProject).map(([proj, ptowers], pi) => {
                  // One solid color per project
                  const projColor = GRADIENTS[TOWER_GRAD[pi % TOWER_GRAD.length]][0];
                  const projColorFade = GRADIENTS[TOWER_GRAD[pi % TOWER_GRAD.length]][1];
                  const maxRate = Math.max(...ptowers.map(t=>t.collection_rate), 1);
                  return (
                    <div key={proj}>
                      {/* Project label */}
                      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:7}}>
                        <div style={{width:8,height:8,borderRadius:'50%',background:projColor,flexShrink:0}}/>
                        <span style={{fontSize:10,fontWeight:700,color:C.text,letterSpacing:0.2}}>{proj}</span>
                        <div style={{flex:1,height:1,background:'rgba(30,58,95,0.07)'}}/>
                        <span style={{fontSize:9,color:C.text3,fontWeight:600}}>{ptowers.length}T</span>
                      </div>
                      {/* Bars — all same color as project */}
                      <div style={{display:'flex',flexDirection:'column',gap:4}}>
                        {ptowers.map((t) => {
                          const pct = Math.min(t.collection_rate / maxRate * 100, 100);
                          const isHigh = t.collection_rate >= 100;
                          return (
                            <div key={t.tower} style={{display:'flex',alignItems:'center',gap:7}}>
                              <div style={{width:40,flexShrink:0,fontSize:9,fontWeight:700,color:C.text3,textAlign:'right'}}>{t.tower}</div>
                              <div style={{flex:1,height:14,background:`${projColor}12`,borderRadius:3,overflow:'hidden',position:'relative'}}>
                                <div style={{
                                  height:'100%',width:`${pct}%`,
                                  background:`linear-gradient(90deg,${projColor},${projColorFade})`,
                                  borderRadius:3,display:'flex',alignItems:'center',justifyContent:'flex-end',paddingRight:4,
                                }}>
                                  {pct > 20 && <span style={{fontSize:9,fontWeight:700,color:'rgba(255,255,255,0.9)'}}>{t.collection_rate}%</span>}
                                </div>
                                {pct <= 20 && (
                                  <span style={{position:'absolute',left:`${pct+2}%`,top:'50%',transform:'translateY(-50%)',fontSize:9,fontWeight:700,color:projColor}}>{t.collection_rate}%</span>
                                )}
                              </div>
                              <span style={{fontSize:8,color:isHigh?C.green:C.text3,fontWeight:700,width:14,textAlign:'center'}}>{isHigh?'✓':''}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
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
                <div className="age-count">{(dash.ageing[b]?.count??0).toLocaleString()}</div>
                <div className="age-amt">₹{(dash.ageing[b]?.amount??0).toFixed(2)} Crs</div>
              </div>
            ))}
          </div>
          <div className="charts-grid">
            <GlassCard title="Installment Count by Ageing" icon={<BarChart3 size={15}/>} color={C.blue} delay={0.1}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={ageCountArr} margin={{top:24,right:10,left:0,bottom:0}}>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(30,58,95,0.07)" vertical={false}/>
                  <XAxis dataKey="name" tick={{fill:C.text3,fontSize:10,fontWeight:600}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fill:C.text3,fontSize:10}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={TT_STYLE} formatter={(v,n)=>[v.toLocaleString(),n]}/>
                  <Bar dataKey="count" name="Count" radius={[8,8,0,0]} barSize={55} animationDuration={1400}>
                    {ageCountArr.map((e,i)=><Cell key={i} fill={e.fill}/>)}
                    <LabelList dataKey="count" position="top" formatter={v=>v.toLocaleString()} style={{fontSize:11,fontWeight:700,fill:C.text}}/>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <ChartLegend items={ageCountArr.filter(d=>d.count>0).map(d=>({label:d.name,color:BUCKET_COLORS[d.name]}))}/>
            </GlassCard>

            <GlassCard title="Outstanding Amount by Ageing" icon={<IndianRupee size={15}/>} color={C.rose} delay={0.2}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={ageAmtArr} margin={{top:24,right:10,left:0,bottom:0}}>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(30,58,95,0.07)" vertical={false}/>
                  <XAxis dataKey="name" tick={{fill:C.text3,fontSize:10,fontWeight:600}} axisLine={false} tickLine={false}/>
                  <YAxis unit=" Cr" tick={{fill:C.text3,fontSize:10}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={TT_STYLE} formatter={(v,n)=>[`₹${v} Crs`,n]}/>
                  <Bar dataKey="amount" name="Outstanding Crs" radius={[8,8,0,0]} barSize={55} animationDuration={1400}>
                    {ageAmtArr.map((e,i)=><Cell key={i} fill={e.fill}/>)}
                    <LabelList dataKey="amount" position="top" formatter={v=>`${v}Cr`} style={{fontSize:10,fontWeight:700,fill:C.text}}/>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <ChartLegend items={ageAmtArr.filter(d=>d.amount>0).map(d=>({label:d.name,color:BUCKET_COLORS[d.name]}))}/>
            </GlassCard>

            <GlassCard title="Ageing Distribution" icon={<PieIcon size={15}/>} color={C.gold} delay={0.3}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={ageAmtArr.filter(d=>d.amount>0)} cx="50%" cy="48%"
                    outerRadius={100} innerRadius={50} dataKey="amount" nameKey="name"
                    paddingAngle={4} stroke="#fff" strokeWidth={2} animationDuration={1200}
                    labelLine={false} label={<PieLabel/>}>
                    {ageAmtArr.map((e,i)=><Cell key={i} fill={e.solidColor}/>)}
                  </Pie>
                  <Tooltip contentStyle={TT_STYLE} formatter={(v,n)=>[`₹${v} Crs`,n]}/>
                </PieChart>
              </ResponsiveContainer>
              <ChartLegend items={ageAmtArr.filter(d=>d.amount>0).map(d=>({label:d.name,color:BUCKET_COLORS[d.name]}))}/>
            </GlassCard>
          </div>
        </div>
      )}

      {/* ── MILESTONES ── */}
      {tab==='milestones' && (
        <div className="tab-content">
          <div className="charts-grid">
            <GlassCard title="Top Unbilled by Count" icon={<BarChart3 size={15}/>} color={C.blue} delay={0.1} wide>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={dash.top_unbilled_count} layout="vertical" margin={{top:5,right:85,left:8,bottom:5}}>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(30,58,95,0.07)" horizontal={false}/>
                  <XAxis type="number" tick={{fill:C.text3,fontSize:10}} axisLine={false} tickLine={false}/>
                  <YAxis type="category" dataKey="name" width={190} tick={{fill:C.text,fontSize:9,fontWeight:600}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={TT_STYLE} formatter={(v,n)=>[v.toLocaleString(),n]}/>
                  <Bar dataKey="unbilled_count" name="Unbilled Count" fill="url(#gUnbilledCount)" radius={[0,8,8,0]} barSize={24} animationDuration={1400}>
                    <LabelList dataKey="unbilled_count" position="right" style={{fontSize:10,fontWeight:700,fill:C.text}} formatter={v=>v.toLocaleString()}/>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <ChartLegend items={[{label:'Unbilled Count',color:GRADIENTS.blue[0]}]}/>
            </GlassCard>

            <GlassCard title="Top Unbilled by Amount" icon={<IndianRupee size={15}/>} color={C.brownLt} delay={0.2} wide>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={dash.top_unbilled_amount} layout="vertical" margin={{top:5,right:95,left:8,bottom:5}}>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(30,58,95,0.07)" horizontal={false}/>
                  <XAxis type="number" unit=" Cr" tick={{fill:C.text3,fontSize:10}} axisLine={false} tickLine={false}/>
                  <YAxis type="category" dataKey="name" width={190} tick={{fill:C.text,fontSize:9,fontWeight:600}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={TT_STYLE} formatter={(v,n)=>[`₹${v} Crs`,n]}/>
                  <Bar dataKey="unbilled_amount" name="Unbilled Amount (Crs)" fill="url(#gUnbilledAmt)" radius={[0,8,8,0]} barSize={24} animationDuration={1400}>
                    <LabelList dataKey="unbilled_amount" position="right" style={{fontSize:10,fontWeight:700,fill:C.brownDk}} formatter={v=>`${v}Cr`}/>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <ChartLegend items={[{label:'Unbilled Amount (Crs)',color:GRADIENTS.demand[0]}]}/>
            </GlassCard>
          </div>
          <div className="section-hd">
            <h2>Milestone Summary Table</h2>
            <span className="badge">{dash.milestone_list.length} milestones · paginated</span>
          </div>
          <MsTable rows={dash.milestone_list}/>
        </div>
      )}

      {/* ── TOWERS ── */}
      {tab==='towers' && (
        <div className="tab-content">
          {Object.entries(towersByProject).map(([proj, towers], i) => (
            <ProjectTowerSection key={proj} project={proj} towers={towers} colorIdx={i}/>
          ))}
        </div>
      )}

      {modal==='billed'   && <MilestoneModal type="billed"   rows={billedRows}   onClose={()=>setModal(null)}/>}
      {modal==='unbilled' && <MilestoneModal type="unbilled" rows={unbilledRows} onClose={()=>setModal(null)}/>}

      <footer className="dash-footer">
        Smartworld Sky Arc · Demand &amp; Collection Dashboard · {new Date().toLocaleDateString('en-IN',{year:'numeric',month:'long',day:'numeric'})}
      </footer>
    </div>
  );
}
