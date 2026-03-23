import React, { useState, useEffect } from 'react';
import { db } from '../utils/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { todayRo, getInitials, daysSince } from '../utils/helpers';
import RankBadge      from '../components/RankBadge';
import StatusPill     from '../components/StatusPill';
import AddMemberModal from '../components/AddMemberModal';

const RANK_ORDER = ['Supervizor PR', 'Conducere Spital', 'Sef PR', 'Adjunct PR', 'Membru PR'];
function rankIndex(rank) { const idx = RANK_ORDER.indexOf(rank); return idx === -1 ? RANK_ORDER.length : idx; }

function MemberAvatar({ member, size = 32, radius = '50%' }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--br2)' }}>
      <img
        src={member.avatarUrl || '/logo_pr.png'}
        alt={member.name || ''}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={e => { e.target.src = '/logo_pr.png'; }}
      />
    </div>
  );
}

function ConfirmDeleteModal({ memberName, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--b2)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 20, padding: '32px 28px', width: 380, boxShadow: '0 30px 80px rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'modalIn .18s ease' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 18 }}>🗑️</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t)', marginBottom: 10, textAlign: 'center' }}>Ștergi membrul complet?</div>
        <div style={{ fontSize: 12, color: 'var(--t3)', textAlign: 'center', lineHeight: 1.7, marginBottom: 16 }}>
          Ești pe cale să ștergi <span style={{ color: 'var(--t2)', fontWeight: 600 }}>„{memberName}"</span>.<br />
          Această acțiune este <span style={{ color: '#FCA5A5', fontWeight: 600 }}>ireversibilă</span>.
        </div>
        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '11px', borderRadius: 11, background: 'var(--b3)', border: '1px solid var(--br)', color: 'var(--t2)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--br)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--b3)'}>Anulează</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '11px', borderRadius: 11, background: 'linear-gradient(135deg,#7f1d1d,#ef4444)', border: '1px solid rgba(239,68,68,0.4)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>🗑️ Șterge</button>
        </div>
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.93) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
    </div>
  );
}

const STATUS_CONFIG = {
  'Activă':    { color: '#10B981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)'  },
  'Expirată':  { color: '#6B7280', bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.3)' },
  'Plătită':   { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.3)'  },
  'Neplătită': { color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)'   },
};

function isActive(s) { return s.status !== 'Expirată' && s.status !== 'Plătită'; }

export default function MembersView({
  members, activities, warnings, promotions,
  setView, selMember, setSelMember, isAdj, isSef,
  onUpdateMember, onDeleteMember,
  onAddWarning, onAddPromotion,
  onViewProfile,
}) {
  const [search,       setSearch]       = useState('');
  const [editModal,    setEditModal]    = useState(null);
  const [lv,           setLv]           = useState(selMember ? 'detail' : 'list');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [sanctiuni,    setSanctiuni]    = useState([]);

  useEffect(() => { if (selMember) setLv('detail'); }, [selMember]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'sanctions'), snap => {
      setSanctiuni(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const filtered = members
    .filter(m => !search || (m.name + ' ' + m.rank + ' ' + (m.faction || '') + ' ' + (m.charId || '')).toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const diff = rankIndex(a.rank) - rankIndex(b.rank);
      if (diff !== 0) return diff;
      return (a.name || '').localeCompare(b.name || '', 'ro');
    });

  const member = members.find(m => m.id === selMember);

  async function confirmDelete() {
    if (!deleteTarget) return;
    await onDeleteMember(deleteTarget.id);
    setDeleteTarget(null);
    setLv('list');
    setSelMember(null);
  }

  async function saveEdit(f) {
    const old = members.find(m => m.id === editModal.id);
    if (old && old.rank !== f.rank) {
      await onAddPromotion({ memberId: editModal.id, memberName: old.name, fromRank: old.rank, toRank: f.rank, date: todayRo() });
    }
    await onUpdateMember(editModal.id, f);
    setEditModal(null);
  }

  function getWarnBadge(count) {
    if (count === 0) return null;
    if (count === 1) return 'wb-l';
    if (count === 2) return 'wb-m';
    return 'wb-h';
  }

  function getFwBadge(count) {
    if (count === 0) return null;
    return count >= 2 ? 'fw-h' : 'fw-l';
  }

  // ── DETAIL VIEW ──
  if (lv === 'detail' && member) {
    const ma   = activities.filter(a => String(a.memberId) === String(member.id));
    const mw   = warnings.filter(w   => String(w.memberId) === String(member.id));
    const mp   = promotions.filter(p  => String(p.memberId) === String(member.id));
    const ms   = sanctiuni.filter(s   => String(s.memberId) === String(member.id));

    const msFw       = ms.filter(s => s.sanctiune === 'FW');
    const msAv       = ms.filter(s => s.sanctiune === 'Avertisment');
    const msAm       = ms.filter(s => s.sanctiune === 'Amendă');
    const msFwActive = msFw.filter(isActive);
    const msAvActive = msAv.filter(isActive);
    const msAmActive = msAm.filter(isActive);

    const ini = getInitials(member.name);
    const wl  = getWarnBadge(mw.length);
    const fl  = getFwBadge(msFwActive.length);

    return (
      <div>
        {deleteTarget && <ConfirmDeleteModal memberName={deleteTarget.name} onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <button className="back-btn" onClick={() => { setLv('list'); setSelMember(null); }}>← Înapoi la Listă</button>
          {onViewProfile && (
            <button
              onClick={() => onViewProfile(member)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, background: 'rgba(147,197,253,0.1)', border: '1px solid rgba(147,197,253,0.25)', color: '#93C5FD', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', transition: 'all .2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(147,197,253,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(147,197,253,0.1)'}
            >
              👁 Vezi Profil
            </button>
          )}
        </div>

        <div className="mp-card">
          <div className="mp-top">
            <MemberAvatar member={member} size={52} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                <h3 style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-.3px' }}>{member.name}</h3>
                {wl && <span className={`warn-badge ${wl}`}>⚠️ {mw.length} avert.</span>}
                {msAvActive.length > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>⚠️ {msAvActive.length} sanc.</span>}
                {fl && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: fl === 'fw-h' ? 'rgba(124,58,237,0.2)' : 'rgba(124,58,237,0.1)', border: `1px solid ${fl === 'fw-h' ? 'rgba(124,58,237,0.6)' : 'rgba(124,58,237,0.3)'}`, color: '#A78BFA' }}>🚨 {msFwActive.length} FW</span>}
                {msAmActive.length > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#FCD34D' }}>💰 {msAmActive.length} amendă</span>}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                <RankBadge rank={member.rank} /><StatusPill s={member.status} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--t3)' }}>
                Discord id: {member.discord || '—'} · Angajat: {member.date}
                {member.charId  ? ' · ID: '       + member.charId  : ''}
                {member.faction ? ' · Callsign: ' + member.faction : ''}
              </div>
            </div>
          </div>

          <div className="mp-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="mp-stat"><div className="mp-sv">{member.activities}</div><div className="mp-sl">Evenimente</div></div>
            <div className="mp-stat"><div className="mp-sv">{daysSince(member.date)}</div><div className="mp-sl">Zile</div></div>
            <div className="mp-stat"><div className="mp-sv" style={{ color: msFwActive.length > 0 ? '#A78BFA' : 'var(--green)' }}>{msFwActive.length}</div><div className="mp-sl">FW-uri</div></div>
            <div className="mp-stat"><div className="mp-sv" style={{ color: mw.length > 2 ? 'var(--red)' : mw.length > 0 ? 'var(--amber)' : 'var(--green)' }}>{mw.length}</div><div className="mp-sl">Avertismente</div></div>
          </div>
        </div>

        {mw.length > 0 && (
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-header"><span className="card-title">⚠️ Avertismente</span><span style={{ fontSize: 10, color: 'var(--t3)' }}>{mw.length} total</span></div>
            <div style={{ padding: '10px 20px' }}>
              {mw.map((w, i) => (
                <div key={i} style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, padding: '10px 14px', marginBottom: 8, fontSize: 12, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ color: '#FCA5A5', fontWeight: 700, flexShrink: 0 }}>#{i + 1}</span>
                  <span style={{ color: 'var(--t2)', flex: 1 }}>{w.reason}</span>
                  <span style={{ color: 'var(--t3)', fontSize: 10, whiteSpace: 'nowrap' }}>{w.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {ms.length > 0 && (
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-header"><span className="card-title">⚖️ Sancțiuni</span><span style={{ fontSize: 10, color: 'var(--t3)' }}>{ms.length} total</span></div>
            <div style={{ padding: '10px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ms.map((s, i) => {
                const tipColor = s.sanctiune === 'FW' ? '#A78BFA' : s.sanctiune === 'Amendă' ? '#F59E0B' : '#EF4444';
                const tipIcon  = s.sanctiune === 'FW' ? '🚨' : s.sanctiune === 'Amendă' ? '💰' : '⚠️';
                const stCfg    = STATUS_CONFIG[s.status] || {};
                const expired  = !isActive(s);
                return (
                  <div key={i} style={{ background: expired ? 'rgba(107,114,128,0.04)' : 'rgba(124,58,237,0.04)', border: `1px solid ${expired ? 'rgba(107,114,128,0.1)' : 'rgba(124,58,237,0.1)'}`, borderRadius: 10, padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'flex-start', opacity: expired ? 0.6 : 1 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: tipColor + '18', border: `1px solid ${tipColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>{tipIcon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: expired ? '#6B7280' : tipColor }}>{s.sanctiune}</span>
                        {s.sumaAmenzii > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: expired ? '#6B7280' : '#F59E0B', fontFamily: 'JetBrains Mono, monospace' }}>${s.sumaAmenzii.toLocaleString()}</span>}
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 5, background: stCfg.bg, border: `1px solid ${stCfg.border}`, color: stCfg.color }}>{s.status}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--t2)', marginBottom: 4 }}>{s.motiv}</div>
                      <div style={{ fontSize: 10, color: 'var(--t3)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <span>📅 {s.dataSanctionare}</span>
                        {s.dataExpirare && s.dataExpirare !== '—' && <span>⏳ Expiră: {s.dataExpirare}</span>}
                        <span>👤 {s.responsabil}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {mp.length > 0 && (
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-header"><span className="card-title">📈 Istoric Promovări</span><span style={{ fontSize: 10, color: 'var(--t3)' }}>{mp.length} modificări</span></div>
            <div style={{ padding: '10px 20px' }}>
              {[...mp].reverse().map((p, i) => (
                <div key={i} className="promo-item">
                  <div className="promo-icon">📈</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: 'var(--t)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <RankBadge rank={p.fromRank} /><span className="promo-arrow">→</span><RankBadge rank={p.toRank} />
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 4 }}>{p.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {member.notes && (
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-header"><span className="card-title">📝 Notițe</span></div>
            <div style={{ padding: '14px 20px', fontSize: 12, color: 'var(--t2)', lineHeight: 1.8 }}>{member.notes}</div>
          </div>
        )}

        <div className="card">
          <div className="card-header"><span className="card-title">📋 Evenimente PR</span><span style={{ fontSize: 10, color: 'var(--t3)' }}>{ma.length} înregistrări</span></div>
          {!ma.length ? (
            <div className="empty-st"><div className="empty-ico">📋</div><p>Nicio activitate</p></div>
          ) : (
            <table>
              <thead><tr><th>Data</th><th>Detalii</th></tr></thead>
              <tbody>
                {[...ma].reverse().map((a, i) => (
                  <tr key={i}><td style={{ color: 'var(--t3)', fontSize: 10, whiteSpace: 'nowrap', width: 90 }}>{a.date}</td><td style={{ color: 'var(--t2)' }}>{a.desc}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {isAdj && (
          <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
            <button className="btn-p" onClick={() => setEditModal(member)}>✏️ Editează</button>
            {isSef && (
              <button className="btn-s" style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#FCA5A5', marginLeft: 'auto' }} onClick={() => setDeleteTarget({ id: member.id, name: member.name })}>🗑 Șterge cont</button>
            )}
          </div>
        )}

        {editModal && <AddMemberModal editData={editModal} onClose={() => setEditModal(null)} onSave={saveEdit} />}
      </div>
    );
  }

  // ── LIST VIEW ──
  return (
    <div>
      {deleteTarget && <ConfirmDeleteModal memberName={deleteTarget.name} onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />}

      <div style={{ display: 'flex', gap: 10, marginBottom: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        <input className="tb-search" style={{ flex: 1, minWidth: 150, width: 'auto' }} placeholder="Caută după nume, grad, callsign, ID..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">👥 Toți Membrii</span>
          <span style={{ fontSize: 10, color: 'var(--t3)' }}>{filtered.length} din {members.length}</span>
        </div>
        {!filtered.length ? (
          <div className="empty-st"><div className="empty-ico">👤</div><p>Lista este goală</p></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nume</th><th>Grad</th><th>Status</th><th>Callsign</th><th>ID</th><th>Discord ID</th><th>Angajat</th><th>Evenimente</th>
                {isAdj && <th>Acțiuni</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, idx) => {
                const mwc     = warnings.filter(w => String(w.memberId) === String(m.id)).length;
                const msc     = sanctiuni.filter(s => String(s.memberId) === String(m.id) && s.sanctiune === 'Avertisment' && isActive(s)).length;
                const fwc     = sanctiuni.filter(s => String(s.memberId) === String(m.id) && s.sanctiune === 'FW' && isActive(s)).length;
                const prevRank = idx > 0 ? filtered[idx - 1].rank : null;
                const showSep  = idx > 0 && m.rank !== prevRank;
                const wl      = getWarnBadge(mwc);
                const fl      = getFwBadge(fwc);

                return (
                  <React.Fragment key={m.id}>
                    {showSep && (
                      <tr><td colSpan={isAdj ? 9 : 8} style={{ padding: '2px 0', background: 'transparent' }}><div style={{ height: 1, background: 'rgba(124,58,237,0.12)', margin: '2px 0' }} /></td></tr>
                    )}
                    <tr>
                      <td className="nm">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <MemberAvatar member={m} size={28} radius={7} />
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                            <span
                              style={{ cursor: 'default' }}
                            >{m.name}</span>
                            {wl && <span className={`warn-badge ${wl}`} style={{ fontSize: 9 }}>⚠️{mwc}</span>}
                            {msc > 0 && <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 4, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>⚠️S {msc}</span>}
                            {fl && <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 4, background: fl === 'fw-h' ? 'rgba(124,58,237,0.2)' : 'rgba(124,58,237,0.1)', border: `1px solid ${fl === 'fw-h' ? 'rgba(124,58,237,0.5)' : 'rgba(124,58,237,0.3)'}`, color: '#A78BFA' }}>🚨FW {fwc}</span>}
                          </div>
                        </div>
                      </td>
                      <td><RankBadge rank={m.rank} /></td>
                      <td><StatusPill s={m.status} /></td>
                      <td style={{ color: 'var(--p3)', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap' }}>{m.faction || <span style={{ color: 'var(--t3)' }}>—</span>}</td>
                      <td style={{ color: 'var(--t2)', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap' }}>{m.charId || <span style={{ color: 'var(--t3)' }}>—</span>}</td>
                      <td style={{ color: 'var(--t3)', fontSize: 10, fontFamily: 'JetBrains Mono' }}>{m.discord || '—'}</td>
                      <td style={{ color: 'var(--t3)' }}>{m.date}</td>
                      <td style={{ color: 'var(--p3)', fontWeight: 700 }}>{m.activities}</td>
                      {isAdj && (
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <button onClick={() => onViewProfile && onViewProfile(m)} title="Vezi profil"
                            style={{ background: 'rgba(147,197,253,0.1)', border: '1px solid rgba(147,197,253,0.25)', color: '#93C5FD', borderRadius: 7, padding: '4px 8px', cursor: 'pointer', fontSize: 12, marginRight: 4, transition: 'all .2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(147,197,253,0.2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(147,197,253,0.1)'}>👁</button>
                          <button onClick={() => setEditModal(m)} title="Editează"
                            style={{ background: 'rgba(253,230,138,0.1)', border: '1px solid rgba(253,230,138,0.25)', color: '#FDE68A', borderRadius: 7, padding: '4px 8px', cursor: 'pointer', fontSize: 12, marginRight: 4, transition: 'all .2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(253,230,138,0.2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(253,230,138,0.1)'}>✏️</button>
                          {isSef && (
                            <button onClick={() => setDeleteTarget({ id: m.id, name: m.name })} title="Șterge"
                              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#FCA5A5', borderRadius: 7, padding: '4px 8px', cursor: 'pointer', fontSize: 12, transition: 'all .2s' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}>🗑</button>
                          )}
                        </td>
                      )}
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {editModal && <AddMemberModal editData={editModal} onClose={() => setEditModal(null)} onSave={saveEdit} />}
    </div>
  );
}