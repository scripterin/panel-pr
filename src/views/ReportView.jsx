import React from 'react';
import RankBadge  from '../components/RankBadge';
import StatusPill from '../components/StatusPill';
import { getWeekStart, inDateRange } from '../utils/helpers';

// ── SVG Icons ──────────────────────────────────────────
const IcoCalendar  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcoWarning   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcoTrendUp   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const IcoUserOff   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" y1="11" x2="23" y2="17"/><line x1="23" y1="11" x2="17" y2="17"/></svg>;
const IcoChart     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IcoUsers     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoDownload  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IcoMedal     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>;
const IcoBeach     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FCD34D" strokeWidth="2"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/></svg>;
const IcoCircle    = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="10"/></svg>;
const IcoCheckAll  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>;

export default function ReportView({ members, activities, warnings, promotions }) {
  const now       = new Date();
  const weekStart = getWeekStart();
  const weekEnd   = new Date(weekStart.getTime() + 7 * 86400000);
  const prevStart = new Date(weekStart.getTime() - 7 * 86400000);

  const weekActs  = activities.filter(a => inDateRange(a.date, weekStart, weekEnd));
  const prevActs  = activities.filter(a => inDateRange(a.date, prevStart, weekStart));
  const weekWarn  = warnings.filter(w   => inDateRange(w.date, weekStart, weekEnd));
  const weekPromo = promotions.filter(p  => inDateRange(p.date, weekStart, weekEnd));

  const actByMember = members
    .map(m => ({ ...m, wActs: weekActs.filter(a => a.memberId === m.id).length }))
    .sort((a, b) => b.wActs - a.wActs);

  const inactive = members.filter(m => m.status !== 'activ');

  const days    = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum'];
  const dayActs = days.map((_, i) => {
    const d    = new Date(weekStart); d.setDate(weekStart.getDate() + i + 1);
    const next = new Date(d);         next.setDate(d.getDate() + 1);
    return weekActs.filter(a => inDateRange(a.date, d, next)).length;
  });
  const maxDay = Math.max(1, ...dayActs);

  function downloadReport() {
    const lines = [
      '=== RAPORT SĂPTĂMÂNAL PR ===',
      `Perioada: ${weekStart.toLocaleDateString('ro-RO')} - ${now.toLocaleDateString('ro-RO')}`,
      '',
      '--- STATISTICI GENERALE ---',
      `Total membri: ${members.length}`,
      `Membri activi: ${members.filter(m => m.status === 'activ').length}`,
      `Evenimente PR această săptămână: ${weekActs.length}`,
      `Avertismente acordate: ${weekWarn.length}`,
      `Promovări/Modificări grad: ${weekPromo.length}`,
      '',
      '--- TOP EVENIMENTE SĂPTĂMÂNĂ ---',
      ...actByMember.filter(m => m.wActs > 0).map((m, i) => `${i + 1}. ${m.name} (${m.rank}): ${m.wActs} evenimente`),
      '',
      '--- MEMBRI INACTIVI/CONCEDIU ---',
      ...(inactive.length ? inactive.map(m => `- ${m.name} (${m.rank}) — ${m.status}`) : ['Toți membrii sunt activi']),
      '',
      '--- PROMOVĂRI SĂPTĂMÂNĂ ---',
      ...(weekPromo.length ? weekPromo.map(p => `- ${p.memberName}: ${p.fromRank} → ${p.toRank} (${p.date})`) : ['Nicio promovare']),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8;' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = 'raport_pr_' + weekStart.toISOString().split('T')[0] + '.txt';
    a.click();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div style={{ fontSize: 12, color: 'var(--t2)' }}>
          Săptămâna: <strong style={{ color: 'var(--p3)' }}>{weekStart.toLocaleDateString('ro-RO')}</strong>
          {' — '}
          <strong style={{ color: 'var(--p3)' }}>{now.toLocaleDateString('ro-RO')}</strong>
        </div>
        <button className="btn-p" onClick={downloadReport} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <IcoDownload /> Descarcă Raport .txt
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card sp">
          <div className="sc-ic ip" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IcoCalendar /></div>
          <div className="sc-label">Events Săpt.</div>
          <div className="sc-val">{weekActs.length}</div>
          <div className="sc-sub">{prevActs.length > 0 ? `vs ${prevActs.length} săpt. trec.` : 'Prima săptămână'}</div>
        </div>
        <div className="stat-card sa">
          <div className="sc-ic ia" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IcoWarning /></div>
          <div className="sc-label">Avertismente</div>
          <div className="sc-val">{weekWarn.length}</div>
          <div className="sc-sub">Această săptămână</div>
        </div>
        <div className="stat-card sg">
          <div className="sc-ic ig" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IcoTrendUp /></div>
          <div className="sc-label">Promovări</div>
          <div className="sc-val">{weekPromo.length}</div>
          <div className="sc-sub">Modificări grad</div>
        </div>
        <div className="stat-card sb2">
          <div className="sc-ic ib" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IcoUserOff /></div>
          <div className="sc-label">Inactivi</div>
          <div className="sc-val">{inactive.length}</div>
          <div className="sc-sub">Status inactiv / concediu</div>
        </div>
      </div>

      <div className="two-eq" style={{ marginBottom: 18 }}>
        {/* Bar chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--p3)', display: 'flex' }}><IcoChart /></span> Activitate pe Zile
            </span>
          </div>
          <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
            {dayActs.map((c, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: '100%', background: c > 0 ? 'linear-gradient(180deg,var(--p2),var(--pd))' : 'rgba(124,58,237,0.1)', borderRadius: 4, height: Math.round(c / maxDay * 70) + 'px', minHeight: 4, transition: 'height .4s', border: '1px solid var(--br)' }} />
                <span style={{ fontSize: 9, color: 'var(--t3)', fontWeight: 600 }}>{days[i]}</span>
                <span style={{ fontSize: 10, color: c > 0 ? 'var(--p3)' : 'var(--t3)', fontWeight: 700 }}>{c}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Inactive members */}
        <div className="card">
          <div className="card-header">
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--p3)', display: 'flex' }}><IcoUserOff /></span> Membri Inactivi / Concediu
            </span>
          </div>
          <div style={{ padding: '10px 20px' }}>
            {!inactive.length ? (
              <div className="empty-st" style={{ padding: '20px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8, color: '#10B981' }}><IcoCheckAll /></div>
                <p>Toți membrii sunt activi!</p>
              </div>
            ) : inactive.slice(0, 6).map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(124,58,237,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--t)', fontWeight: 600 }}>{m.name}</span>
                  <span style={{ fontSize: 10, display: 'flex', alignItems: 'center', gap: 4, color: m.status === 'concediu' ? '#FCD34D' : 'var(--t3)' }}>
                    {m.status === 'concediu' ? <><IcoBeach /> Concediu</> : <><span style={{ color: '#6B7280' }}><IcoCircle /></span> Inactiv</>}
                  </span>
                </div>
                <RankBadge rank={m.rank} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full member table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: 'var(--p3)', display: 'flex' }}><IcoMedal /></span> Evenimente Membrii Săptămâna Aceasta
          </span>
        </div>
        <table>
          <thead><tr><th>#</th><th>Nume</th><th>Grad</th><th>Status</th><th>Evenimente Săpt.</th><th>Total</th></tr></thead>
          <tbody>
            {actByMember.map((m, i) => (
              <tr key={m.id} style={{ cursor: 'default' }}>
                <td style={{ color: 'var(--t3)', fontWeight: 700, fontSize: 12 }}>{i + 1}</td>
                <td className="nm" style={{ cursor: 'default' }}>{m.name}</td>
                <td><RankBadge rank={m.rank} /></td>
                <td><StatusPill s={m.status} /></td>
                <td style={{ color: m.wActs > 0 ? 'var(--p3)' : 'var(--t3)', fontWeight: 700 }}>{m.wActs}</td>
                <td style={{ color: 'var(--t2)' }}>{m.activities}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}