import React from 'react';
import RankBadge  from '../components/RankBadge';
import StatusPill from '../components/StatusPill';
import { getWeekStart, inDateRange } from '../utils/helpers';

// ── SVG Icons ──────────────────────────────────────────
const Icons = {
  users:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  check:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
  star:      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  calendar:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  megaphone: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>,
  pin:       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17z"/></svg>,
  chart:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  trophy:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-2"/><rect x="6" y="18" width="12" height="4"/></svg>,
  crown:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 20h20M5 20V8l7-5 7 5v12"/></svg>,
  zap:       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  circle:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>,
  user:      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
};

export default function Dashboard({ members, activities, announcements, setView, setSelMember }) {
  const total  = members.length;
  const activ  = members.filter(m => m.status === 'activ').length;
  const sef    = members.filter(m => m.rank === 'Sef PR').length;
  const adj    = members.filter(m => m.rank === 'Adjunct PR').length;
  const mem    = members.filter(m => m.rank === 'Membru PR').length;
  const maxB   = Math.max(1, total);
  const top    = [...members].sort((a, b) => b.activities - a.activities).slice(0, 5);
  const medals = ['🥇', '🥈', '🥉', '4.', '5.'];
  const pinned = announcements.filter(a => a.pinned);

  const weekStart = getWeekStart();
  const weekEnd   = new Date(weekStart.getTime() + 7 * 86400000);
  const weekActs  = activities.filter(a => inDateRange(a.date, weekStart, weekEnd));

  return (
    <div>
      {pinned.length > 0 && (
        <div className="alert-banner">
          <span style={{ display: 'flex', color: 'var(--p3)' }}>{Icons.megaphone}</span>
          <div>
            <strong style={{ color: 'var(--p3)' }}>{pinned[0].title}</strong><br />
            <span style={{ color: 'var(--t2)', fontSize: 11 }}>{pinned[0].body}</span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card sp">
          <div className="sc-ic ip" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icons.users}</div>
          <div className="sc-label">Total Membri</div>
          <div className="sc-val">{total}</div>
          <div className="sc-sub">Departament PR</div>
        </div>
        <div className="stat-card sg">
          <div className="sc-ic ig" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icons.check}</div>
          <div className="sc-label">Membri Activi</div>
          <div className="sc-val">{activ}</div>
          <div className="sc-sub">Status activ</div>
        </div>
        <div className="stat-card sb2">
          <div className="sc-ic ib" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icons.star}</div>
          <div className="sc-label">Conducere PR</div>
          <div className="sc-val">{sef + adj}</div>
          <div className="sc-sub">Șef + Adjunct</div>
        </div>
        <div className="stat-card sa">
          <div className="sc-ic ia" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icons.calendar}</div>
          <div className="sc-label">Evenimente Săpt.</div>
          <div className="sc-val">{weekActs.length}</div>
          <div className="sc-sub">Săptămâna curentă</div>
        </div>
      </div>

      <div className="two-col">
        {/* Recent members */}
        <div className="card">
          <div className="card-header">
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--p3)', display: 'flex' }}>{Icons.users}</span> Membri Recenți
            </span>
            <span className="card-action" onClick={() => setView('members')}>Vezi toți →</span>
          </div>
          {!members.length ? (
            <div className="empty-st">
              <div className="empty-ico" style={{ display: 'flex', justifyContent: 'center', color: 'var(--t3)', opacity: 0.4 }}>{Icons.user}</div>
              <p>Niciun membru adăugat</p>
              <small>Apasă "+ Adaugă Membru" pentru a începe</small>
            </div>
          ) : (
            <table>
              <thead><tr><th>Nume</th><th>Grad</th><th>Status</th><th>Evenimente</th></tr></thead>
              <tbody>
                {members.slice(0, 6).map(m => (
                  <tr key={m.id} onClick={() => { setSelMember(m.id); setView('member-detail'); }}>
                    <td className="nm">{m.name}</td>
                    <td><RankBadge rank={m.rank} /></td>
                    <td><StatusPill s={m.status} /></td>
                    <td style={{ color: 'var(--p3)', fontWeight: 700 }}>{m.activities}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Announcements */}
        <div className="card">
          <div className="card-header">
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--p3)', display: 'flex' }}>{Icons.megaphone}</span> Anunțuri
            </span>
            <span className="card-action" onClick={() => setView('announcements')}>Toate →</span>
          </div>
          {!announcements.length ? (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--t3)', fontSize: 12 }}>Niciun anunț</div>
          ) : announcements.slice(0, 3).map((a, i) => (
            <div key={i} className="act-item">
              <div className="act-ico" style={{ display: 'flex', alignItems: 'center', color: 'var(--p3)' }}>
                {a.pinned ? Icons.pin : Icons.megaphone}
              </div>
              <div>
                <p style={{ fontSize: 12, color: 'var(--t)' }}><span className="act-name">{a.title}</span></p>
                <p style={{ fontSize: 11, color: 'var(--t2)', marginTop: 2 }}>{a.body.length > 50 ? a.body.slice(0, 50) + '...' : a.body}</p>
                <div className="act-time">{a.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="two-eq">
        {/* Grade distribution */}
        <div className="card">
          <div className="card-header">
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--p3)', display: 'flex' }}>{Icons.chart}</span> Distribuție Grade
            </span>
          </div>
          <div style={{ padding: '16px 20px' }}>
            <div className="prog-item">
              <div className="prog-hdr">
                <span className="prog-n" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ color: '#A78BFA', display: 'flex' }}>{Icons.crown}</span> Șef PR
                </span>
                <span className="prog-v">{sef}</span>
              </div>
              <div className="prog-track"><div className="prog-fill pf-p" style={{ width: Math.round(sef / maxB * 100) + '%' }} /></div>
            </div>
            <div className="prog-item">
              <div className="prog-hdr">
                <span className="prog-n" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ color: '#93C5FD', display: 'flex' }}>{Icons.zap}</span> Adjunct PR
                </span>
                <span className="prog-v">{adj}</span>
              </div>
              <div className="prog-track"><div className="prog-fill pf-b" style={{ width: Math.round(adj / maxB * 100) + '%' }} /></div>
            </div>
            <div className="prog-item">
              <div className="prog-hdr">
                <span className="prog-n" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ color: '#6EE7B7', display: 'flex' }}>{Icons.circle}</span> Membru PR
                </span>
                <span className="prog-v">{mem}</span>
              </div>
              <div className="prog-track"><div className="prog-fill pf-g" style={{ width: Math.round(mem / maxB * 100) + '%' }} /></div>
            </div>
          </div>
        </div>

        {/* Top activity */}
        <div className="card">
          <div className="card-header">
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--p3)', display: 'flex' }}>{Icons.trophy}</span> TOP EVENIMENTE
            </span>
          </div>
          <table>
            <thead><tr><th>#</th><th>Nume</th><th>Activități</th></tr></thead>
            <tbody>
              {!top.length ? (
                <tr><td colSpan="3" style={{ textAlign: 'center', padding: 24, color: 'var(--t3)' }}>Nicio activitate</td></tr>
              ) : top.map((m, i) => (
                <tr key={m.id} style={{ cursor: 'default' }}>
                  <td style={{ fontWeight: 700, fontSize: 13 }}>{medals[i]}</td>
                  <td className="nm" style={{ cursor: 'default' }}>{m.name}</td>
                  <td style={{ color: 'var(--p3)', fontWeight: 700 }}>{m.activities}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}