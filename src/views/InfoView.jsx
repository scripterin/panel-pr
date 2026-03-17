import React, { useState } from 'react';

const CATEGORIES = [
  { id: 'all',      label: 'Toate',      icon: '📋' },
  { id: 'rules',    label: 'Reguli',     icon: '📜' },
  { id: 'packages', label: 'Pachete PR', icon: '📦' },
  { id: 'info',     label: 'Informații', icon: 'ℹ️'  },
  { id: 'other',    label: 'Altele',     icon: '📌'  },
];

const CAT_COLORS = {
  rules:    { bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.2)',  text: '#FCD34D' },
  packages: { bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.2)', text: 'var(--p3)' },
  info:     { bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.2)', text: '#93C5FD'  },
  other:    { bg: 'rgba(110,231,183,0.08)',border: 'rgba(110,231,183,0.2)',text: '#6EE7B7'  },
};

const EMPTY_FORM = { title: '', content: '', category: 'rules', pinned: false };

// Legendă statusuri din imagine
const LEGEND = [
{ icon: '✅', color: '#86EFAC', label: 'Confirmați / Vin cu siguranță' },
{ icon: '👍', color: '#FFA500', label: 'Posibil să vină / Au participat anterior' }, 
{ icon: '❌', color: '#F87171', label: 'Nu pot ajunge' },                          
{ icon: '🏖️', color: '#38BDF8', label: 'În concediu' },                          
];

function ConfirmModal({ title, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--b2)', border: '1px solid rgba(239,68,68,0.25)',
        borderRadius: 20, padding: '32px 28px', width: 360,
        boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        animation: 'modalIn .18s ease',
      }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 18 }}>🗑️</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t)', marginBottom: 10, textAlign: 'center' }}>Ștergi această intrare?</div>
        <div style={{ fontSize: 12, color: 'var(--t3)', textAlign: 'center', lineHeight: 1.7, marginBottom: 24 }}>
          <span style={{ color: 'var(--t2)', fontWeight: 600 }}>„{title}"</span> va fi ștearsă{' '}
          <span style={{ color: '#FCA5A5', fontWeight: 600 }}>permanent</span>.<br />Acțiunea nu poate fi anulată.
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
            🗑️ Șterge
          </button>
        </div>
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.93) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
    </div>
  );
}

export default function InfoView({ infos, isAdj, isSef, currentUser, onSave, onDelete }) {
  const [activeCat,  setActiveCat]  = useState('all');
  const [show,       setShow]       = useState(false);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [err,        setErr]        = useState('');
  const [modalInfo,  setModalInfo]  = useState(null);
  const [expanded,   setExpanded]   = useState(null);
  const canEdit = isSef || isAdj;

  function cancelForm() {
    setShow(false);
    setForm(EMPTY_FORM);
    setErr('');
  }

  async function submit() {
    if (!form.title.trim())   { setErr('Titlul este obligatoriu!'); return; }
    if (!form.content.trim()) { setErr('Conținutul este obligatoriu!'); return; }
    await onSave({
      ...form,
      id:       String(Date.now()),
      postedBy: currentUser.fullName,
      postedAt: new Date().toLocaleDateString('ro-RO'),
    });
    cancelForm();
  }

  async function confirmDelete() {
    if (!modalInfo) return;
    await onDelete(modalInfo.id);
    if (expanded === modalInfo.id) setExpanded(null);
    setModalInfo(null);
  }

  const filtered = infos
    .filter(i => activeCat === 'all' || i.category === activeCat)
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return Number(b.id) - Number(a.id);
    });

  return (
    <>
      {modalInfo && (
        <ConfirmModal
          title={modalInfo.title}
          onConfirm={confirmDelete}
          onCancel={() => setModalInfo(null)}
        />
      )}

      <div style={{ maxWidth: 760 }}>

        {/* ── Legendă statusuri ── */}
        <div style={{
          background: 'var(--b2)', border: '1px solid var(--br)',
          borderRadius: 14, padding: '14px 18px', marginBottom: 18,
        }}>
          <div style={{ fontSize: 9, color: 'var(--t3)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>Legendă Statusuri Evenimente</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {LEGEND.map((l, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 15, flexShrink: 0 }}>{l.icon}</span>
                <span style={{ fontSize: 12, color: l.color, fontWeight: 500 }}>— {l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Buton adaugă ── */}
        {canEdit && (
          !show ? (
            <button className="btn-p" style={{ marginBottom: 18 }} onClick={() => setShow(true)}>
              + Adaugă Informație
            </button>
          ) : (
            <div className="card" style={{ marginBottom: 18 }}>
              <div className="card-header">
                <span className="card-title">📋 Informație Nouă</span>
              </div>
              <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {err && <div className="ferr">⚠️ {err}</div>}

                {/* Titlu */}
                <div>
                  <label className="flabel">Titlu *</label>
                  <input className="finput" placeholder="ex: Pachete PR — Prețuri Actualizate"
                    value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                </div>

                {/* Categorie */}
                <div>
                  <label className="flabel">Categorie</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                      <button key={cat.id} onClick={() => setForm(p => ({ ...p, category: cat.id }))}
                        style={{
                          padding: '7px 14px', borderRadius: 9, fontSize: 11, fontWeight: 600,
                          cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', transition: 'all .2s',
                          background: form.category === cat.id ? CAT_COLORS[cat.id]?.bg : 'var(--b3)',
                          border: `1px solid ${form.category === cat.id ? CAT_COLORS[cat.id]?.border : 'var(--br)'}`,
                          color: form.category === cat.id ? CAT_COLORS[cat.id]?.text : 'var(--t3)',
                        }}>
                        {cat.icon} {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conținut */}
                <div>
                  <label className="flabel">Conținut *</label>
                  <textarea className="finput" rows={6}
                    placeholder="Scrie informațiile aici..."
                    value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                    style={{ resize: 'vertical', minHeight: 120, lineHeight: 1.7 }} />
                </div>

                {/* Pinned */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" id="pin-info" checked={form.pinned}
                    onChange={e => setForm(p => ({ ...p, pinned: e.target.checked }))}
                    style={{ accentColor: 'var(--p)' }} />
                  <label htmlFor="pin-info" style={{ fontSize: 12, color: 'var(--t2)', cursor: 'pointer' }}>
                    📌 Fixat în partea de sus
                  </label>
                </div>

                {/* Butoane */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn-save" onClick={submit}>✓ Publică</button>
                  <button className="btn-cancel" onClick={cancelForm}>Anulează</button>
                </div>
              </div>
            </div>
          )
        )}

        {/* ── Filter tabs categorii ── */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveCat(cat.id)}
              style={{
                padding: '6px 14px', borderRadius: 9, fontSize: 11, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', transition: 'all .2s',
                background: activeCat === cat.id ? 'var(--p)' : 'var(--b2)',
                border: `1px solid ${activeCat === cat.id ? 'var(--p)' : 'var(--br)'}`,
                color: activeCat === cat.id ? '#fff' : 'var(--t3)',
              }}>
              {cat.icon} {cat.label}
              {cat.id !== 'all' && (
                <span style={{ marginLeft: 6, fontSize: 10, opacity: .7 }}>
                  ({infos.filter(i => i.category === cat.id).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Lista intrări ── */}
        {!filtered.length ? (
          <div className="empty-st">
            <div className="empty-ico">📋</div>
            <p>Nicio informație în această categorie</p>
          </div>
        ) : (
          filtered.map(info => {
            const isExp  = expanded === info.id;
            const colors = CAT_COLORS[info.category] || CAT_COLORS.other;
            const cat    = CATEGORIES.find(c => c.id === info.category);

            return (
              <div key={info.id} style={{
                background: 'var(--b2)',
                border: `1px solid ${isExp ? colors.border : 'var(--br)'}`,
                borderRadius: 16, marginBottom: 12, overflow: 'hidden',
                boxShadow: isExp ? `0 6px 24px ${colors.bg}` : 'none',
                transition: 'all .2s',
              }}>
                {/* Header */}
                <div style={{
                  padding: '14px 18px', display: 'flex',
                  justifyContent: 'space-between', alignItems: 'center',
                  cursor: 'pointer', gap: 10,
                }} onClick={() => setExpanded(isExp ? null : info.id)}>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                    {info.pinned && <span style={{ fontSize: 13, flexShrink: 0 }}>📌</span>}
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t)', marginBottom: 4 }}>
                        {info.title}
                      </div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, letterSpacing: '.5px',
                          padding: '2px 8px', borderRadius: 6,
                          background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text,
                        }}>
                          {cat?.icon} {cat?.label}
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--t3)' }}>
                          👤 {info.postedBy} · 📅 {info.postedAt}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {canEdit && (
                      <button className="code-del" onClick={e => { e.stopPropagation(); setModalInfo(info); }}>✕</button>
                    )}
                    <span style={{
                      fontSize: 11, color: 'var(--t3)', display: 'inline-block',
                      transition: 'transform .2s', transform: isExp ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}>▾</span>
                  </div>
                </div>

                {/* Conținut expandat */}
                {isExp && (
                  <div style={{
                    padding: '16px 18px', borderTop: `1px solid ${colors.border}`,
                    background: colors.bg,
                  }}>
                    <div style={{
                      fontSize: 13, color: 'var(--t)', lineHeight: 1.8,
                      whiteSpace: 'pre-wrap', fontFamily: 'Space Grotesk, sans-serif',
                    }}>
                      {info.content}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  );
}