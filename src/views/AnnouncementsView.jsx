import React, { useState } from 'react';
import { todayRo } from '../utils/helpers';

function ConfirmModal({ title, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--b2)',
        border: '1px solid rgba(239,68,68,0.25)',
        borderRadius: 20,
        padding: '32px 28px',
        width: 360,
        boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(239,68,68,0.08)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        animation: 'modalIn .18s ease',
      }}>
        {/* Icon */}
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, marginBottom: 18,
        }}>🗑️</div>

        {/* Title */}
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t)', marginBottom: 10, textAlign: 'center' }}>
          Ștergi anunțul?
        </div>

        {/* Body */}
        <div style={{ fontSize: 12, color: 'var(--t3)', textAlign: 'center', lineHeight: 1.7, marginBottom: 24 }}>
          Anunțul <span style={{ color: 'var(--t2)', fontWeight: 600 }}>„{title}"</span> va fi șters{' '}
          <span style={{ color: '#FCA5A5', fontWeight: 600 }}>permanent</span>.<br />
          Acțiunea nu poate fi anulată.
        </div>

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
            🗑️ Șterge
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

export default function AnnouncementsView({ announcements, isSef, currentUser, onSave, onDelete }) {
  const [form,       setForm]       = useState({ title: '', body: '', pinned: false });
  const [show,       setShow]       = useState(false);
  const [err,        setErr]        = useState('');
  const [modalAnn,   setModalAnn]   = useState(null); // anunțul selectat pentru ștergere

  async function addAnn() {
    if (!form.title.trim() || !form.body.trim()) { setErr('Completează titlul și conținutul!'); return; }
    await onSave({
      ...form,
      id:     String(Date.now()),
      author: currentUser.fullName,
      date:   todayRo(),
    });
    setForm({ title: '', body: '', pinned: false });
    setShow(false);
    setErr('');
  }

  async function confirmDelete() {
    if (!modalAnn) return;
    await onDelete(modalAnn.id);
    setModalAnn(null);
  }

  async function togglePin(a) {
    await onSave({ ...a, pinned: !a.pinned });
  }

  return (
    <>
      {modalAnn && (
        <ConfirmModal
          title={modalAnn.title}
          onConfirm={confirmDelete}
          onCancel={() => setModalAnn(null)}
        />
      )}

      <div style={{ maxWidth: 720 }}>
        {isSef && (
          !show ? (
            <button className="btn-p" style={{ marginBottom: 18 }} onClick={() => setShow(true)}>+ Anunț Nou</button>
          ) : (
            <div className="card" style={{ marginBottom: 18 }}>
              <div className="card-header"><span className="card-title">📢 Anunț Nou</span></div>
              <div style={{ padding: '16px 20px' }}>
                {err && <div className="ferr">⚠️ {err}</div>}
                <label className="flabel">Titlu</label>
                <input className="finput" placeholder="Titlul anunțului..." value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                <label className="flabel">Conținut</label>
                <textarea className="finput" rows="4" placeholder="Conținut..." value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} style={{ resize: 'none' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <input type="checkbox" id="pin" checked={form.pinned} onChange={e => setForm(p => ({ ...p, pinned: e.target.checked }))} style={{ accentColor: 'var(--p)' }} />
                  <label htmlFor="pin" style={{ fontSize: 12, color: 'var(--t2)', cursor: 'pointer' }}>📌 Fixat pe dashboard + popup la login</label>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn-save" onClick={addAnn}>Publică</button>
                  <button className="btn-cancel" onClick={() => setShow(false)}>Anulează</button>
                </div>
              </div>
            </div>
          )
        )}

        {!announcements.length ? (
          <div className="empty-st"><div className="empty-ico">📢</div><p>Niciun anunț publicat</p></div>
        ) : (
          announcements.map((a, i) => (
            <div key={i} className={`ann-item${a.pinned ? ' pinned-ann' : ''}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div className="ann-title-txt">{a.pinned ? '📌 ' : ''}{a.title}</div>
                {isSef && (
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => togglePin(a)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, opacity: .7 }}
                      title={a.pinned ? 'Dezafișează' : 'Fixează'}
                    >
                      {a.pinned ? '📌' : '📍'}
                    </button>
                    <button className="code-del" onClick={() => setModalAnn(a)}>✕</button>
                  </div>
                )}
              </div>
              <div className="ann-body-txt">{a.body}</div>
              <div className="ann-meta">
                <span>👤 {a.author}</span>
                <span>📅 {a.date}</span>
                {a.pinned && <span style={{ color: 'var(--amber)', fontWeight: 600 }}>FIXAT</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}