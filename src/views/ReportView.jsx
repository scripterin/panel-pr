import React from 'react';
import RankBadge  from '../components/RankBadge';
import StatusPill from '../components/StatusPill';
import { inDateRange } from '../utils/helpers';

// ── SVG Icons ──────────────────────────────────────────
const IcoCalendar = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcoWarning  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcoTrendUp  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const IcoUserOff  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" y1="11" x2="23" y2="17"/><line x1="23" y1="11" x2="17" y2="17"/></svg>;
const IcoChart    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IcoDownload = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IcoMedal    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>;
const IcoBeach    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FCD34D" strokeWidth="2"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/></svg>;
const IcoCircle   = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="10"/></svg>;
const IcoCheckAll = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>;

// ── Calculează perioada curentă din 2 în 2 săptămâni ──
function getCurrentPeriod() {
  const ANCHOR = new Date('2026-03-16T00:00:00');
  const CYCLE  = 14 * 24 * 60 * 60 * 1000;
  const now    = new Date();
  const diff   = now.getTime() - ANCHOR.getTime();
  const cycles = Math.floor(diff / CYCLE);
  const start  = new Date(ANCHOR.getTime() + cycles * CYCLE);
  const end    = new Date(start.getTime() + CYCLE);
  return { start, end, cycleIndex: cycles + 1 };
}

export default function ReportView({ members, activities, warnings, promotions, toast }) {
  const now                          = new Date();
  const { start: periodStart, end: periodEnd, cycleIndex } = getCurrentPeriod();

  const periodActs  = activities.filter(a => inDateRange(a.date, periodStart, periodEnd));
  const periodWarn  = warnings.filter(w   => inDateRange(w.date, periodStart, periodEnd));
  const periodPromo = promotions.filter(p  => inDateRange(p.date, periodStart, periodEnd));
  const inactive    = members.filter(m => m.status !== 'activ');
  const actByMember = members
    .map(m => ({ ...m, pActs: periodActs.filter(a => a.memberId === m.id).length }))
    .sort((a, b) => b.pActs - a.pActs);

  const days    = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sam', 'Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sam', 'Dum'];
  const dayActs = days.map((_, i) => {
    const d    = new Date(periodStart); d.setDate(periodStart.getDate() + i);
    const next = new Date(d);           next.setDate(d.getDate() + 1);
    return periodActs.filter(a => inDateRange(a.date, d, next)).length;
  });
  const maxDay = Math.max(1, ...dayActs);

  const fmt = (d) => d.toLocaleDateString('ro-RO');

  function downloadReport() {
    try {
      const lines = [];
      const sep   = '='.repeat(60);
      const dash  = '-'.repeat(60);

      // ── HEADER ──
      lines.push(sep);
      lines.push(`RAPORT #${cycleIndex} - DEPARTAMENT PR`);
      lines.push(`Perioada: ${fmt(periodStart)} -> ${fmt(periodEnd)}`);
      lines.push(`Generat: ${new Date().toLocaleString('ro-RO')}`);
      lines.push(sep);
      lines.push('');

      // ── STATISTICI ──
      lines.push('STATISTICI PERIOADA');
      lines.push(dash);
      lines.push(`Evenimente:    ${periodActs.length}`);
      lines.push(`Avertismente:  ${periodWarn.length}`);
      lines.push(`Promovari:     ${periodPromo.length}`);
      lines.push(`Inactivi:      ${inactive.length}`);
      lines.push('');

      // ── ACTIVITATE PE ZILE ──
      lines.push('ACTIVITATE PE ZILE (14 ZILE)');
      lines.push(dash);
      days.forEach((d, i) => {
        const date = new Date(periodStart);
        date.setDate(periodStart.getDate() + i);
        lines.push(`${d} ${date.getDate().toString().padStart(2, '0')}: ${dayActs[i]} evenimente`);
      });
      lines.push('');

      // ── TOP MEMBRI ──
      lines.push('TOP MEMBRI PERIOADA');
      lines.push(dash);
      const topActors = actByMember.filter(m => m.pActs > 0).slice(0, 6);
      if (!topActors.length) {
        lines.push('Nicio activitate in aceasta perioada.');
      } else {
        topActors.forEach((m, i) => {
          lines.push(`#${i + 1} ${m.name} (${m.rank}) - ${m.pActs} evenimente`);
        });
      }
      lines.push('');

      // ── PROMOVĂRI ──
      lines.push('PROMOVARI PERIOADA');
      lines.push(dash);
      if (!periodPromo.length) {
        lines.push('Nicio promovare in aceasta perioada.');
      } else {
        periodPromo.forEach(p => {
          lines.push(`${p.memberName}: ${p.fromRank} -> ${p.toRank} (${p.date})`);
        });
      }
      lines.push('');

      // ── INACTIVI ──
      lines.push('MEMBRI INACTIVI / CONCEDIU');
      lines.push(dash);
      if (!inactive.length) {
        lines.push('Toti membrii sunt activi!');
      } else {
        inactive.forEach(m => {
          const status = m.status === 'concediu' ? 'Concediu' : 'Inactiv';
          lines.push(`${m.name} (${m.rank}) - ${status}`);
        });
      }
      lines.push('');

      // ── TABEL MEMBRI ──
      lines.push('EVENIMENTE MEMBRI - PERIOADA CURENTA');
      lines.push(dash);
      lines.push(`${'#'.padEnd(4)}${'Nume'.padEnd(25)}${'Grad'.padEnd(20)}${'Status'.padEnd(12)}${'Perioada'.padEnd(10)}Total`);
      lines.push(dash);
      actByMember.forEach((m, i) => {
        lines.push(
          `${String(i + 1).padEnd(4)}${m.name.padEnd(25)}${m.rank.padEnd(20)}${m.status.padEnd(12)}${String(m.pActs).padEnd(10)}${m.activities}`
        );
      });
      lines.push('');

      // ── FOOTER ──
      lines.push(sep);
      lines.push('Document generat automat - Departamentul de Relatii Publice - Confidential');
      lines.push('PR SYSTEM');
      lines.push(sep);

      // ── DOWNLOAD ──
      const content = lines.join('\n');
      const blob    = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url     = URL.createObjectURL(blob);
      const a       = document.createElement('a');
      a.href        = url;
      a.download    = `raport_pr_${cycleIndex}_${fmt(periodStart).replace(/\./g, '-')}.txt`;
      a.click();
      URL.revokeObjectURL(url);

      toast?.success('Raportul TXT a fost descărcat!');
    } catch (err) {
      console.error(err);
      toast?.error('Eroare la generarea raportului.');
    }
  }

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div style={{ fontSize: 12, color: 'var(--t2)' }}>
          <span style={{ color: 'var(--t3)', marginRight: 6 }}>Raport #{cycleIndex} ·</span>
          <strong style={{ color: 'var(--p3)' }}>{fmt(periodStart)}</strong>
          <span style={{ color: 'var(--t3)', margin: '0 6px' }}>→</span>
          <strong style={{ color: 'var(--p3)' }}>{fmt(periodEnd)}</strong>
        </div>
        <button className="btn-p" onClick={downloadReport} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <IcoDownload /> Descarcă Raport TXT
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="stats-grid">
        <div className="stat-card sp">
          <div className="sc-ic ip" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IcoCalendar /></div>
          <div className="sc-label">Evenimente</div>
          <div className="sc-val">{periodActs.length}</div>
          <div className="sc-sub">Această perioadă</div>
        </div>
        <div className="stat-card sa">
          <div className="sc-ic ia" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IcoWarning /></div>
          <div className="sc-label">Avertismente</div>
          <div className="sc-val">{periodWarn.length}</div>
          <div className="sc-sub">Această perioadă</div>
        </div>
        <div className="stat-card sg">
          <div className="sc-ic ig" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IcoTrendUp /></div>
          <div className="sc-label">Promovări</div>
          <div className="sc-val">{periodPromo.length}</div>
          <div className="sc-sub">Modificări grad</div>
        </div>
        <div className="stat-card sb2">
          <div className="sc-ic ib" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IcoUserOff /></div>
          <div className="sc-label">Inactivi</div>
          <div className="sc-val">{inactive.length}</div>
          <div className="sc-sub">Status inactiv / concediu</div>
        </div>
      </div>

      {/* ── Two-col row ── */}
      <div className="two-eq" style={{ marginBottom: 18 }}>
        {/* Bar chart 14 zile */}
        <div className="card">
          <div className="card-header">
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--p3)', display: 'flex' }}><IcoChart /></span> Activitate pe Zile
            </span>
            <span style={{ fontSize: 10, color: 'var(--t3)' }}>{fmt(periodStart)} → {fmt(periodEnd)}</span>
          </div>
          <div style={{ padding: '16px 20px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 90, marginBottom: 8 }}>
              {dayActs.map((c, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{
                    fontSize: 9, fontWeight: 700,
                    color: c > 0 ? 'var(--p3)' : 'transparent',
                    minHeight: 12,
                  }}>{c > 0 ? c : ''}</span>
                  <div style={{
                    width: '100%',
                    background: c > 0
                      ? c === Math.max(...dayActs)
                        ? 'linear-gradient(180deg,#A78BFA,#7C3AED)'
                        : 'linear-gradient(180deg,var(--p2),var(--pd))'
                      : 'rgba(124,58,237,0.08)',
                    borderRadius: '4px 4px 2px 2px',
                    height: Math.max(4, Math.round(c / maxDay * 64)) + 'px',
                    transition: 'height .4s ease',
                    border: '1px solid rgba(124,58,237,0.2)',
                    boxShadow: c > 0 ? '0 0 10px rgba(124,58,237,0.3)' : 'none',
                    flexShrink: 0,
                  }} />
                </div>
              ))}
            </div>
            <div style={{ height: 1, background: 'rgba(124,58,237,0.1)', marginBottom: 8 }} />
            <div style={{ display: 'flex', gap: 6 }}>
              {days.map((d, i) => {
                const date = new Date(periodStart);
                date.setDate(periodStart.getDate() + i);
                const isToday = date.toDateString() === new Date().toDateString();
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <span style={{
                      fontSize: 8, fontWeight: isToday ? 700 : 500,
                      color: isToday ? 'var(--p3)' : 'var(--t3)',
                    }}>{d}</span>
                    <span style={{
                      fontSize: 7,
                      color: isToday ? 'var(--p3)' : 'rgba(124,58,237,0.3)',
                      fontWeight: isToday ? 700 : 400,
                    }}>{date.getDate()}</span>
                    {isToday && (
                      <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--p3)' }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Inactivi */}
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

      {/* ── Tabel membri ── */}
      <div className="card">
        <div className="card-header">
          <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: 'var(--p3)', display: 'flex' }}><IcoMedal /></span> Evenimente Membri — Perioadă Curentă
          </span>
        </div>
        <table>
          <thead>
            <tr><th>#</th><th>Nume</th><th>Grad</th><th>Status</th><th>Evenimente Perioadă</th><th>Total</th></tr>
          </thead>
          <tbody>
            {actByMember.map((m, i) => (
              <tr key={m.id} style={{ cursor: 'default' }}>
                <td style={{ color: 'var(--t3)', fontWeight: 700, fontSize: 12 }}>{i + 1}</td>
                <td className="nm" style={{ cursor: 'default' }}>{m.name}</td>
                <td><RankBadge rank={m.rank} /></td>
                <td><StatusPill s={m.status} /></td>
                <td style={{ color: m.pActs > 0 ? 'var(--p3)' : 'var(--t3)', fontWeight: 700 }}>{m.pActs}</td>
                <td style={{ color: 'var(--t2)' }}>{m.activities}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}