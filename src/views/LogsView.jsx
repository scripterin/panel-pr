import React, { useState, useEffect, useRef } from 'react';
import { getAll, deleteOne, COL } from '../utils/storage';

// ── SVG Icons ──────────────────────────────────────────
const IcoUnlock    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>;
const IcoLock      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IcoStar      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IcoUser      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcoEdit      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcoTrash     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const IcoClipboard = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>;
const IcoWarning   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IcoTrend     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const IcoMega      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>;
const IcoKey       = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>;
const IcoPin       = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17z"/></svg>;
const IcoShield    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IcoMsg       = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const IcoImage     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const IcoMic       = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>;
const IcoSearch    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoRefresh   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
const IcoXmark     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

const ACTION_COLORS = {
  LOGIN:              '#6EE7B7',
  LOGOUT:             '#FCA5A5',
  REGISTER:           '#93C5FD',
  ADD_MEMBER:         '#86EFAC',
  EDIT_MEMBER:        '#FDE68A',
  UPDATE_MEMBER:      '#FDE68A',
  DELETE_MEMBER:      '#FCA5A5',
  ADD_ACTIVITY:       '#C4B5FD',
  ADD_WARNING:        '#FCA5A5',
  ADD_PROMOTION:      '#6EE7B7',
  ADD_ANNOUNCEMENT:   '#93C5FD',
  EDIT_ANNOUNCEMENT:  '#FDE68A',
  DELETE_ANNOUNCEMENT:'#FCA5A5',
  ADD_CODE:           '#C4B5FD',
  DELETE_CODE:        '#FCA5A5',
  POST_DOVADA:        '#F9A8D4',
  STATUS_DOVADA:      '#FDE68A',
  SEND_MESSAGE:       '#7DD3FC',
  SEND_IMAGE:         '#86EFAC',
  SEND_AUDIO:         '#C4B5FD',
};

const ACTION_ICONS = {
  LOGIN:              <IcoUnlock />,
  LOGOUT:             <IcoLock />,
  REGISTER:           <IcoStar />,
  ADD_MEMBER:         <IcoUser />,
  EDIT_MEMBER:        <IcoEdit />,
  UPDATE_MEMBER:      <IcoEdit />,
  DELETE_MEMBER:      <IcoTrash />,
  ADD_ACTIVITY:       <IcoClipboard />,
  ADD_WARNING:        <IcoWarning />,
  ADD_PROMOTION:      <IcoTrend />,
  ADD_ANNOUNCEMENT:   <IcoMega />,
  EDIT_ANNOUNCEMENT:  <IcoEdit />,
  DELETE_ANNOUNCEMENT:<IcoTrash />,
  ADD_CODE:           <IcoKey />,
  DELETE_CODE:        <IcoXmark />,
  POST_DOVADA:        <IcoPin />,
  STATUS_DOVADA:      <IcoShield />,
  SEND_MESSAGE:       <IcoMsg />,
  SEND_IMAGE:         <IcoImage />,
  SEND_AUDIO:         <IcoMic />,
};

function formatTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch { return iso; }
}

function ConfirmModal({ onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--b2)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 20, padding: '32px 28px', width: 360, boxShadow: '0 30px 80px rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'modalIn .18s ease' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FCA5A5', marginBottom: 18 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t)', marginBottom: 10, textAlign: 'center' }}>Șterge toate log-urile?</div>
        <div style={{ fontSize: 12, color: 'var(--t3)', textAlign: 'center', lineHeight: 1.7, marginBottom: 28 }}>
          Această acțiune va șterge <span style={{ color: '#FCA5A5', fontWeight: 600 }}>permanent</span> toate înregistrările din sistem.<br />
          Acțiunea este <span style={{ color: '#FCA5A5', fontWeight: 600 }}>ireversibilă</span> și nu poate fi anulată.
        </div>
        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <button onClick={onCancel}
            style={{ flex: 1, padding: '11px', borderRadius: 11, background: 'var(--b3)', border: '1px solid var(--br)', color: 'var(--t2)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', transition: 'all .2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--br)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--b3)'}>
            Anulează
          </button>
          <button onClick={onConfirm}
            style={{ flex: 1, padding: '11px', borderRadius: 11, background: 'linear-gradient(135deg, #7f1d1d, #ef4444)', border: '1px solid rgba(239,68,68,0.4)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 4px 20px rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            <IcoTrash /> Șterge tot
          </button>
        </div>
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.93) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
    </div>
  );
}

export default function LogsView({ currentUser }) {
  const [logs,      setLogs]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState('ALL');
  const [search,    setSearch]    = useState('');
  const [showModal, setShowModal] = useState(false);
  const bottomRef = useRef(null);
  const isSef = currentUser.rank === 'Sef PR';

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getAll(COL.logs);
      setLogs(data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
      setLoading(false);
    }
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  async function confirmClear() {
    await Promise.all(logs.map(l => deleteOne(COL.logs, l.id)));
    setLogs([]);
    setShowModal(false);
  }

  const categories = ['ALL','LOGIN','LOGOUT','REGISTER','MEMBER','ACTIVITY','WARNING','PROMOTION','ANNOUNCEMENT','CODE','DOVEZI','CHAT'];

  function matchesFilter(log) {
    if (filter === 'ALL')          return true;
    if (filter === 'MEMBER')       return ['ADD_MEMBER','EDIT_MEMBER','UPDATE_MEMBER','DELETE_MEMBER'].includes(log.action);
    if (filter === 'ACTIVITY')     return log.action === 'ADD_ACTIVITY';
    if (filter === 'WARNING')      return log.action === 'ADD_WARNING';
    if (filter === 'PROMOTION')    return log.action === 'ADD_PROMOTION';
    if (filter === 'ANNOUNCEMENT') return ['ADD_ANNOUNCEMENT','EDIT_ANNOUNCEMENT','DELETE_ANNOUNCEMENT'].includes(log.action);
    if (filter === 'CODE')         return ['ADD_CODE','DELETE_CODE'].includes(log.action);
    if (filter === 'DOVEZI')       return ['POST_DOVADA','STATUS_DOVADA'].includes(log.action);
    if (filter === 'CHAT')         return ['SEND_MESSAGE','SEND_IMAGE','SEND_AUDIO'].includes(log.action);
    return log.action === filter;
  }

  const filtered = logs.filter(l =>
    matchesFilter(l) &&
    (search === '' || l.details?.toLowerCase().includes(search.toLowerCase()) || l.actor?.name?.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: 'var(--t3)', fontSize: 13 }}>Se încarcă log-urile...</div>;
  }

  return (
    <>
      {showModal && <ConfirmModal onConfirm={confirmClear} onCancel={() => setShowModal(false)} />}

      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', gap: 12 }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 180, position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: 12, color: 'var(--t3)', display: 'flex' }}><IcoSearch /></span>
            <input placeholder="Caută în logs..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', background: 'var(--b2)', border: '1px solid var(--br)', borderRadius: 10, padding: '8px 14px 8px 34px', color: 'var(--t)', fontSize: 12, outline: 'none', fontFamily: 'Space Grotesk, sans-serif', boxSizing: 'border-box' }} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--t3)', whiteSpace: 'nowrap' }}>{filtered.length} logs</div>
          {isSef && (
            <button onClick={() => setShowModal(true)}
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)', color: '#FCA5A5', borderRadius: 9, padding: '8px 14px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
              <IcoTrash /> Șterge tot
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              style={{ background: filter === cat ? 'var(--p)' : 'var(--b2)', border: `1px solid ${filter === cat ? 'var(--p)' : 'var(--br)'}`, color: filter === cat ? '#fff' : 'var(--t3)', borderRadius: 8, padding: '5px 12px', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '.5px', textTransform: 'uppercase', transition: 'all .2s' }}>
              {cat}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', background: 'var(--b2)', border: '1px solid var(--br)', borderRadius: 14, padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--t3)', fontSize: 12, marginTop: 40 }}>Nu există log-uri pentru filtrul selectat.</div>
          )}
          {filtered.map((log, i) => {
            const color    = ACTION_COLORS[log.action] || '#94A3B8';
            const icon     = ACTION_ICONS[log.action]  || '•';
            const showDate = i === 0 || formatTime(log.timestamp).slice(0,10) !== formatTime(filtered[i-1].timestamp).slice(0,10);
            return (
              <div key={log.id}>
                {showDate && (
                  <div style={{ textAlign: 'center', margin: '8px 0 4px', fontSize: 10, color: 'var(--t3)', letterSpacing: 1 }}>
                    ── {formatTime(log.timestamp).slice(0,10)} ──
                  </div>
                )}
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.04)', transition: 'background .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}>
                  <div style={{ color, flexShrink: 0, marginTop: 1, display: 'flex' }}>{icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: '.5px', fontFamily: 'JetBrains Mono, monospace', background: `${color}18`, padding: '2px 7px', borderRadius: 5 }}>{log.action}</span>
                      <span style={{ fontSize: 11, color: 'var(--t2)', fontWeight: 600 }}>{log.actor?.name}</span>
                      <span style={{ fontSize: 10, color: 'var(--t3)' }}>({log.actor?.rank})</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--t)', lineHeight: 1.5 }}>{log.details}</div>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--t3)', flexShrink: 0, marginTop: 2, fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap' }}>
                    {formatTime(log.timestamp).slice(11)}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div style={{ fontSize: 10, color: 'var(--t3)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <IcoRefresh /> Se actualizează automat la fiecare 15 secunde
        </div>
      </div>
    </>
  );
}