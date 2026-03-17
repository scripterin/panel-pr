import React, { useState, useEffect } from 'react';
import { getAll, COL } from '../utils/storage';

const CODE_GROUPS = [
  { label: '👑 Coduri Șef PR',    rank: 'Sef PR',     color: 'var(--p3)' },
  { label: '⚡ Coduri Adjunct PR', rank: 'Adjunct PR', color: '#93C5FD'   },
  { label: '● Coduri Membru PR',  rank: 'Membru PR',  color: '#6EE7B7'   },
];

function ConfirmModal({ code, onConfirm, onCancel }) {
  const isUsed = code?.used;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--b2)',
        border: `1px solid ${isUsed ? 'rgba(239,68,68,0.35)' : 'rgba(239,68,68,0.2)'}`,
        borderRadius: 20,
        padding: '32px 28px',
        width: 380,
        boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(239,68,68,0.08)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        animation: 'modalIn .18s ease',
      }}>
        {/* Icon */}
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: isUsed ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.08)',
          border: `1px solid ${isUsed ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.18)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, marginBottom: 18,
        }}>
          {isUsed ? '⚠️' : '🗑️'}
        </div>

        {/* Title */}
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t)', marginBottom: 10, textAlign: 'center' }}>
          {isUsed ? 'Cod folosit — ești sigur?' : `Ștergi codul "${code?.code}"?`}
        </div>

        {/* Body */}
        {isUsed ? (
          <div style={{ width: '100%', marginBottom: 24 }}>
            <div style={{ fontSize: 12, color: 'var(--t3)', textAlign: 'center', lineHeight: 1.7, marginBottom: 14 }}>
              Codul <span style={{ color: 'var(--p3)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>{code?.code}</span> este în folosință.
              Ștergerea va elimina <span style={{ color: '#FCA5A5', fontWeight: 600 }}>complet și ireversibil</span>:
            </div>
            <div style={{
              background: 'rgba(239,68,68,0.07)',
              border: '1px solid rgba(239,68,68,0.15)',
              borderRadius: 12, padding: '12px 16px',
              display: 'flex', flexDirection: 'column', gap: 6,
            }}>
              {['Contul asociat codului', 'Toate activitățile membrului', 'Toate avertismentele', 'Istoricul promovărilor'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#FCA5A5' }}>
                  <span style={{ fontSize: 10 }}>✕</span> {item}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 12, color: 'var(--t3)', textAlign: 'center', lineHeight: 1.7, marginBottom: 24 }}>
            Codul <span style={{ color: 'var(--p3)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>{code?.code}</span> va fi
            șters <span style={{ color: '#FCA5A5', fontWeight: 600 }}>permanent</span>.<br />
            Acțiunea nu poate fi anulată.
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '11px', borderRadius: 11,
              background: 'var(--b3)', border: '1px solid var(--br)',
              color: 'var(--t2)', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif',
              transition: 'all .2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--br)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--b3)'}
          >
            Anulează
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '11px', borderRadius: 11,
              background: 'linear-gradient(135deg, #7f1d1d, #ef4444)',
              border: '1px solid rgba(239,68,68,0.4)',
              color: '#fff', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif',
              boxShadow: '0 4px 20px rgba(239,68,68,0.3)',
              transition: 'opacity .2s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            {isUsed ? '⚠️ Șterge tot' : '🗑️ Șterge'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.93) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
    </div>
  );
}

export default function CodesView({ onAdd, onDelete }) {
  const [codes,      setCodes]      = useState([]);
  const [newCode,    setNewCode]    = useState('');
  const [newRank,    setNewRank]    = useState('Membru PR');
  const [err,        setErr]        = useState('');
  const [loading,    setLoading]    = useState(true);
  const [modalCode,  setModalCode]  = useState(null); // codul selectat pentru ștergere

  useEffect(() => {
    getAll(COL.accessCodes).then(c => {
      setCodes(c);
      setLoading(false);
    });
  }, []);

  async function addCode() {
    if (!newCode.trim()) { setErr('Introdu un cod!'); return; }
    if (codes.find(c => c.code === newCode.trim())) { setErr('Codul există deja!'); return; }
    const entry = await onAdd({
      code: newCode.trim().toUpperCase(),
      rank: newRank,
      used: false,
    });
    setCodes(prev => [...prev, entry]);
    setNewCode('');
    setErr('');
  }

  async function confirmDelete() {
    if (!modalCode) return;
    await onDelete(modalCode.id, modalCode);
    setCodes(prev => prev.filter(x => x.id !== modalCode.id));
    setModalCode(null);
  }

  if (loading) {
    return <div style={{ color: 'var(--t3)', fontSize: 12, padding: 20 }}>Se încarcă codurile...</div>;
  }

  return (
    <>
      {modalCode && (
        <ConfirmModal
          code={modalCode}
          onConfirm={confirmDelete}
          onCancel={() => setModalCode(null)}
        />
      )}

      <div style={{ maxWidth: 660 }}>
        {/* Adaugă cod nou */}
        <div className="card" style={{ marginBottom: 18 }}>
          <div className="card-header">
            <span className="card-title">➕ Adaugă Cod Nou</span>
          </div>
          <div style={{ padding: '16px 20px' }}>
            {err && <div className="ferr">⚠️ {err}</div>}
            <div className="code-add-row">
              <input
                className="finput"
                placeholder="Cod nou (ex: SEF-2025)"
                value={newCode}
                onChange={e => setNewCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && addCode()}
              />
              <select className="finput" value={newRank} onChange={e => setNewRank(e.target.value)}>
                <option value="Sef PR">Șef PR</option>
                <option value="Adjunct PR">Adjunct PR</option>
                <option value="Membru PR">Membru PR</option>
              </select>
              <button className="btn-save" onClick={addCode}>Adaugă</button>
            </div>
            <div style={{ fontSize: 11, color: '#FCA5A5', marginTop: 10, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.17)', borderRadius: 9, padding: '9px 13px', lineHeight: 1.7 }}>
              ⚠️ Ștergerea unui cod <strong>folosit</strong> elimină complet contul și toate datele asociate.
            </div>
          </div>
        </div>

        {/* Grupuri coduri */}
        {CODE_GROUPS.map(({ label, rank, color }) => {
          const items     = codes.filter(c => c.rank === rank);
          const available = items.filter(c => !c.used).length;

          return (
            <div key={rank} className="card" style={{ marginBottom: 16 }}>
              <div className="card-header">
                <span className="card-title">{label}</span>
                <span style={{ fontSize: 10, color: 'var(--t3)' }}>{available} disponibile / {items.length} total</span>
              </div>
              <div style={{ padding: '12px 20px' }}>
                {!items.length && (
                  <div style={{ color: 'var(--t3)', fontSize: 12, textAlign: 'center', padding: '12px 0' }}>Niciun cod</div>
                )}
                {items.map(c => (
                  <div key={c.id} className={`code-item${c.used ? ' code-used-item' : ''}`}>
                    <div>
                      <div className="code-val" style={{ color: c.used ? 'var(--t3)' : color }}>{c.code}</div>
                      <div className="code-st">{c.used ? '✅ FOLOSIT — cont activ' : '⭕ DISPONIBIL'}</div>
                    </div>
                    <button className="code-del" onClick={() => setModalCode(c)}>✕ Șterge</button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}