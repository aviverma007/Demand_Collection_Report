import React, { useEffect, useRef } from 'react';
import './MilestoneModal.css';

export default function MilestoneModal({ type, rows, onClose }) {
  const tbodyRef = useRef(null);
  const isBilled = type === 'billed';

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const color     = isBilled ? '#1e3a5f' : '#c49a3c';
  const colorDark = isBilled ? '#0f1f3a' : '#8b6820';
  const colorBg   = isBilled ? 'rgba(30,58,95,0.07)' : 'rgba(196,154,60,0.08)';
  const label     = isBilled ? 'Billed' : 'Unbilled';
  const countKey  = isBilled ? 'billed_count'  : 'unbilled_count';
  const amtKey    = isBilled ? 'billed_amount'  : 'unbilled_amount';
  const totalCount = rows.reduce((s, r) => s + r[countKey], 0);
  const totalAmt   = rows.reduce((s, r) => s + r[amtKey], 0);

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ '--mc': color, '--mc-dark': colorDark, '--mc-bg': colorBg }}>
        {/* Header */}
        <div className="modal-header" style={{ background: `linear-gradient(135deg, ${colorDark} 0%, ${color} 100%)` }}>
          <div>
            <h2>{label} Milestones</h2>
            <p>{rows.length} milestones · {totalCount.toLocaleString()} installments · ₹{totalAmt.toFixed(2)} Crs total</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Summary chips */}
        <div className="modal-chips">
          <div className="chip" style={{ background: colorBg, borderColor: color + '30' }}>
            <span className="chip-val" style={{ color }}>{rows.length}</span>
            <span className="chip-lbl">Milestones</span>
          </div>
          <div className="chip" style={{ background: colorBg, borderColor: color + '30' }}>
            <span className="chip-val" style={{ color }}>{totalCount.toLocaleString()}</span>
            <span className="chip-lbl">Count</span>
          </div>
          <div className="chip" style={{ background: colorBg, borderColor: color + '30' }}>
            <span className="chip-val" style={{ color }}>₹{totalAmt.toFixed(1)}Cr</span>
            <span className="chip-lbl">Amount</span>
          </div>
        </div>

        {/* Scrollable table */}
        <div className="modal-table-wrap">
          <table className="modal-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Milestone</th>
                <th>Ageing Bucket</th>
                <th>{label} Count</th>
                <th>{label} Amount (Crs)</th>
              </tr>
            </thead>
            <tbody ref={tbodyRef}>
              {rows.map((m, i) => (
                <tr key={i} className={i % 2 === 0 ? 'even' : 'odd'}>
                  <td className="idx">{i + 1}</td>
                  <td className="ms-name" title={m.name}>
                    {m.name.length > 65 ? m.name.slice(0, 65) + '…' : m.name}
                  </td>
                  <td>
                    <span className="bkt-chip" style={{ background: ageBg(m.ageing_bucket), color: '#fff' }}>
                      {m.ageing_bucket}
                    </span>
                  </td>
                  <td className="num">{m[countKey].toLocaleString()}</td>
                  <td className="num amt">₹{m[amtKey].toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ageBg(b) {
  return { '1–30 Days':'#2d7a4f','31–90 Days':'#c49a3c','91–180 Days':'#b8443a','181+ Days':'#1e3a5f','Not Yet Due':'#3b82c4' }[b] ?? '#8b7355';
}
