import React, { useState, useEffect } from 'react';
import { todayRo, getInitials, exportMembersCSV, daysSince } from '../utils/helpers';
import RankBadge      from '../components/RankBadge';
import StatusPill     from '../components/StatusPill';
import AddMemberModal from '../components/AddMemberModal';
import LogModal       from '../components/LogModal';

// ── Modal confirmare ștergere ──────────────────────────
function ConfirmDeleteModal({ memberName, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--b2)', border: '1px solid rgba(239,68,68,0.25)',
        borderRadius: 20, padding: '32px 28px', width: 380,
        boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        animation: 'modalIn .18s ease',
      }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 18 }}>🗑️</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t)', marginBottom: 10, textAlign: 'center' }}>Ștergi membrul complet?</div>
        <div style={{ fontSize: 12, color: 'var(--t3)', textAlign: 'center', lineHeight: 1.7, marginBottom: 16 }}>
          Ești pe cale să ștergi <span style={{ color: 'var(--t2)', fontWeight: 600 }}>„{memberName}"</span>.<br />
          Această acțiune este <span style={{ color: '#FCA5A5', fontWeight: 600 }}>ireversibilă</span> și va elimina:
        </div>
        <div style={{ width: '100%', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 12, padding: '12px 16px', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {['Contul membrului', 'Toate activitățile', 'Toate avertismentele', 'Istoricul promovărilor'].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#FCA5A5' }}>
              <span style={{ fontSize: 10 }}>✕</span> {item}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <button onClick={onCancel}
            style={{ flex: 1, padding: '11px', borderRadius: 11, background: 'var(--b3)', border: '1px solid var(--br)', color: 'var(--t2)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', transition: 'all .2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--br)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--b3)'}>
            Anulează
          </button>
          <button onClick={onConfirm}
            style={{ flex: 1, padding: '11px', borderRadius: 11, background: 'linear-gradient(135deg,#7f1d1d,#ef4444)', border: '1px solid rgba(239,68,68,0.4)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 4px 20px rgba(239,68,68,0.3)', transition: 'opacity .2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            🗑️ Șterge complet
          </button>
        </div>
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.93) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
    </div>
  );
}

// ── Modal adaugă avertisment ───────────────────────────
function WarningModal({ memberName, onConfirm, onCancel }) {
  const [reason, setReason] = useState('');
  const [err,    setErr]    = useState('');

  function confirm() {
    if (!reason.trim()) { setErr('Motivul este obligatoriu!'); return; }
    onConfirm(reason.trim());
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--b2)', border: '1px solid rgba(245,158,11,0.25)',
        borderRadius: 20, padding: '32px 28px', width: 400,
        boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        animation: 'modalIn .18s ease',
      }}>
        {/* Icon */}
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 18 }}>⚠️</div>

        {/* Title */}
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t)', marginBottom: 6, textAlign: 'center' }}>
          Adaugă Avertisment
        </div>
        <div style={{ fontSize: 12, color: 'var(--t3)', textAlign: 'center', marginBottom: 20 }}>
          pentru <span style={{ color: '#FCD34D', fontWeight: 600 }}>„{memberName}"</span>
        </div>

        {/* Input */}
        <div style={{ width: '100%', marginBottom: 20 }}>
          <label style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 600, letterSpacing: '.5px', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
            Motivul avertismentului *
          </label>
          <textarea
            autoFocus
            rows={3}
            placeholder="Descrie motivul avertismentului..."
            value={reason}
            onChange={e => { setReason(e.target.value); setErr(''); }}
            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) confirm(); }}
            style={{
              width: '100%', background: 'var(--b3)', border: `1px solid ${err ? 'rgba(239,68,68,0.5)' : 'var(--br)'}`,
              borderRadius: 10, padding: '10px 14px', fontSize: 12, color: 'var(--t)',
              fontFamily: 'Space Grotesk, sans-serif', outline: 'none', resize: 'none',
              lineHeight: 1.6, transition: 'border-color .2s', boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'}
            onBlur={e => e.target.style.borderColor = err ? 'rgba(239,68,68,0.5)' : 'var(--br)'}
          />
          {err && <div style={{ fontSize: 10, color: '#FCA5A5', marginTop: 6 }}>⚠️ {err}</div>}
          <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 6 }}>Ctrl+Enter pentru a confirma rapid</div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <button onClick={onCancel}
            style={{ flex: 1, padding: '11px', borderRadius: 11, background: 'var(--b3)', border: '1px solid var(--br)', color: 'var(--t2)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', transition: 'all .2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--br)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--b3)'}>
            Anulează
          </button>
          <button onClick={confirm}
            style={{ flex: 1, padding: '11px', borderRadius: 11, background: 'linear-gradient(135deg,#78350f,#f59e0b)', border: '1px solid rgba(245,158,11,0.4)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 4px 20px rgba(245,158,11,0.25)', transition: 'opacity .2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            ⚠️ Adaugă
          </button>
        </div>
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.93) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
    </div>
  );
}

export default function MembersView({
  members, activities, warnings, promotions,
  setView, selMember, setSelMember, isAdj, isSef,
  onUpdateMember, onDeleteMember,
  onAddActivity, onAddWarning, onAddPromotion,
}) {
  const [search,       setSearch]       = useState('');
  const [editModal,    setEditModal]    = useState(null);
  const [logModal,     setLogModal]     = useState(false);
  const [lv,           setLv]           = useState(selMember ? 'detail' : 'list');
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }
  const [warningTarget,setWarningTarget]= useState(null); // { id, name }

  useEffect(() => { if (selMember) setLv('detail'); }, [selMember]);

  const filtered = members.filter(m =>
    !search || (m.name + ' ' + m.rank).toLowerCase().includes(search.toLowerCase())
  );
  const member = members.find(m => m.id === selMember);

  // ── Șterge membrul ────────────────────────────────────
  async function confirmDelete() {
    if (!deleteTarget) return;
    await onDeleteMember(deleteTarget.id);
    setDeleteTarget(null);
    setLv('list');
    setSelMember(null);
  }

  // ── Salvează editare ──────────────────────────────────
  async function saveEdit(f) {
    const old = members.find(m => m.id === editModal.id);
    if (old && old.rank !== f.rank) {
      await onAddPromotion({
        memberId:   editModal.id,
        memberName: old.name,
        fromRank:   old.rank,
        toRank:     f.rank,
        date:       todayRo(),
      });
    }
    await onUpdateMember(editModal.id, f);
  }

  // ── Adaugă eveniment PR ───────────────────────────────
  async function saveLog(f) {
    const mid = String(f.memberId);
    const m   = members.find(x => x.id === mid || x.id === parseInt(mid));
    if (!m) return;
    await onAddActivity({
      memberId: m.id,
      member:   m.name,
      desc:     f.desc,
      date:     todayRo(),
    });
  }

  // ── Confirmare avertisment ────────────────────────────
  async function confirmWarning(reason) {
    if (!warningTarget) return;
    await onAddWarning({
      memberId: warningTarget.id,
      reason,
      date:     todayRo(),
    });
    setWarningTarget(null);
  }

  // ── DETAIL VIEW ────────────────────────────────────────
  if (lv === 'detail' && member) {
    const ma  = activities.filter(a => String(a.memberId) === String(member.id));
    const mw  = warnings.filter(w   => String(w.memberId) === String(member.id));
    const mp  = promotions.filter(p  => String(p.memberId) === String(member.id));
    const ini = getInitials(member.name);
    const wl  = mw.length === 0 ? null : mw.length === 1 ? 'wb-l' : mw.length === 2 ? 'wb-m' : 'wb-h';

    return (
      <div>
        {deleteTarget && (
          <ConfirmDeleteModal
            memberName={deleteTarget.name}
            onConfirm={confirmDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
        {warningTarget && (
          <WarningModal
            memberName={warningTarget.name}
            onConfirm={confirmWarning}
            onCancel={() => setWarningTarget(null)}
          />
        )}

        <button className="back-btn" onClick={() => { setLv('list'); setSelMember(null); }}>← Înapoi la Listă</button>

        <div className="mp-card">
          <div className="mp-top">
            <div className="mp-av">{ini}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                <h3 style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-.3px' }}>{member.name}</h3>
                {wl && <span className={`warn-badge ${wl}`}>⚠️ {mw.length} avert.</span>}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                <RankBadge rank={member.rank} /><StatusPill s={member.status} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--t3)' }}>
                Discord id: {member.discord || '—'} · Primire functie: {member.date}
                {member.charId ? ' · ID: ' + member.charId : ''}
              </div>
            </div>
          </div>
          <div className="mp-stats">
            <div className="mp-stat"><div className="mp-sv">{member.activities}</div><div className="mp-sl">Evenimente</div></div>
            <div className="mp-stat"><div className="mp-sv">{daysSince(member.date)}</div><div className="mp-sl">Zile</div></div>
            <div className="mp-stat">
              <div className="mp-sv" style={{ color: mw.length > 2 ? 'var(--red)' : mw.length > 0 ? 'var(--amber)' : 'var(--green)' }}>
                {mw.length}
              </div>
              <div className="mp-sl">Avertismente</div>
            </div>
          </div>
        </div>

        {/* Avertismente */}
        {mw.length > 0 && (
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-header">
              <span className="card-title">⚠️ Avertismente</span>
              <span style={{ fontSize: 10, color: 'var(--t3)' }}>{mw.length} total</span>
            </div>
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

        {/* Istoric promovări */}
        {mp.length > 0 && (
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-header">
              <span className="card-title">📈 Istoric Promovări</span>
              <span style={{ fontSize: 10, color: 'var(--t3)' }}>{mp.length} modificări</span>
            </div>
            <div style={{ padding: '10px 20px' }}>
              {[...mp].reverse().map((p, i) => (
                <div key={i} className="promo-item">
                  <div className="promo-icon">📈</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: 'var(--t)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <RankBadge rank={p.fromRank} />
                      <span className="promo-arrow">→</span>
                      <RankBadge rank={p.toRank} />
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 4 }}>{p.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notițe */}
        {member.notes && (
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-header"><span className="card-title">📝 Notițe</span></div>
            <div style={{ padding: '14px 20px', fontSize: 12, color: 'var(--t2)', lineHeight: 1.8 }}>{member.notes}</div>
          </div>
        )}

        {/* Jurnal activitate */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📋 Evenimente PR</span>
            <span style={{ fontSize: 10, color: 'var(--t3)' }}>{ma.length} înregistrări</span>
          </div>
          {!ma.length ? (
            <div className="empty-st"><div className="empty-ico">📋</div><p>Nicio activitate</p></div>
          ) : (
            <table>
              <thead><tr><th>Data</th><th>Detalii</th></tr></thead>
              <tbody>
                {[...ma].reverse().map((a, i) => (
                  <tr key={i} style={{ cursor: 'default' }}>
                    <td style={{ color: 'var(--t3)', fontSize: 10, whiteSpace: 'nowrap', width: 90 }}>{a.date}</td>
                    <td style={{ color: 'var(--t2)' }}>{a.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {isAdj && (
          <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
            <button className="btn-p" onClick={() => setEditModal(member)}>✏️ Editează</button>
            <button className="btn-s" onClick={() => setLogModal(true)}>+ Eveniment PR</button>
            <button className="btn-s"
              style={{ borderColor: 'rgba(245,158,11,0.3)', color: '#FCD34D' }}
              onClick={() => setWarningTarget({ id: member.id, name: member.name })}>
              ⚠️ Avertisment
            </button>
            {isSef && (
              <button className="btn-s"
                style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#FCA5A5', marginLeft: 'auto' }}
                onClick={() => setDeleteTarget({ id: member.id, name: member.name })}>
                🗑 Șterge cont
              </button>
            )}
          </div>
        )}

        {editModal && <AddMemberModal editData={editModal} onClose={() => setEditModal(null)} onSave={saveEdit} />}
        {logModal  && <LogModal members={members} onClose={() => setLogModal(false)} onSave={saveLog} />}
      </div>
    );
  }

// ── LIST VIEW ──────────────────────────────────────────
  return (
    <div>
      {deleteTarget && (
        <ConfirmDeleteModal
          memberName={deleteTarget.name}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {warningTarget && (
        <WarningModal
          memberName={warningTarget.name}
          onConfirm={confirmWarning}
          onCancel={() => setWarningTarget(null)}
        />
      )}

      <div style={{ display: 'flex', gap: 10, marginBottom: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          className="tb-search" style={{ flex: 1, minWidth: 150, width: 'auto' }}
          placeholder="Caută membri..." value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button className="btn-s" onClick={() => exportMembersCSV(members)}>↓ Export CSV</button>
        {isAdj && <button className="btn-s" onClick={() => setLogModal(true)}>+ Eveniment PR</button>}
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
                <th>Nume</th><th>Grad</th><th>Status</th>
                <th>Discord ID</th><th>Angajat</th><th>Evenimente</th>
                {isAdj && <th>Acțiuni</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const mwc = warnings.filter(w => String(w.memberId) === String(m.id)).length;
                return (
                  <tr key={m.id}>
                    <td className="nm" onClick={() => { setSelMember(m.id); setLv('detail'); }}>
                      {m.name}
                      {mwc > 0 && <span style={{ marginLeft: 6, fontSize: 9, color: 'var(--amber)' }}>⚠️{mwc}</span>}
                    </td>
                    <td><RankBadge rank={m.rank} /></td>
                    <td><StatusPill s={m.status} /></td>
                    <td style={{ color: 'var(--t3)', fontSize: 10, fontFamily: 'JetBrains Mono' }}>{m.discord || '—'}</td>
                    <td style={{ color: 'var(--t3)' }}>{m.date}</td>
                    <td style={{ color: 'var(--p3)', fontWeight: 700 }}>{m.activities}</td>
                    {isAdj && (
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => { setSelMember(m.id); setLv('detail'); }}
                          title="Vezi detalii"
                          style={{ background: 'rgba(147,197,253,0.1)', border: '1px solid rgba(147,197,253,0.25)', color: '#93C5FD', borderRadius: 7, padding: '4px 8px', cursor: 'pointer', fontSize: 12, marginRight: 4, transition: 'all .2s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(147,197,253,0.2)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(147,197,253,0.1)'}
                        >👁</button>
                        <button
                          onClick={() => setEditModal(m)}
                          title="Editează"
                          style={{ background: 'rgba(253,230,138,0.1)', border: '1px solid rgba(253,230,138,0.25)', color: '#FDE68A', borderRadius: 7, padding: '4px 8px', cursor: 'pointer', fontSize: 12, marginRight: 4, transition: 'all .2s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(253,230,138,0.2)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(253,230,138,0.1)'}
                        >✏️</button>
                        {isSef && (
                          <button
                            onClick={() => setDeleteTarget({ id: m.id, name: m.name })}
                            title="Șterge"
                            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#FCA5A5', borderRadius: 7, padding: '4px 8px', cursor: 'pointer', fontSize: 12, transition: 'all .2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                          >🗑</button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {editModal && <AddMemberModal editData={editModal} onClose={() => setEditModal(null)} onSave={saveEdit} />}
      {logModal  && <LogModal members={members} onClose={() => setLogModal(false)} onSave={saveLog} />}
    </div>
  );
}