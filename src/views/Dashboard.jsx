import React, { useState, useEffect } from 'react';
import RankBadge  from '../components/RankBadge';
import StatusPill from '../components/StatusPill';
import { getWeekStart, inDateRange } from '../utils/helpers';
import { db } from '../utils/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

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
  edit:      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  plus:      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  trash:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
};

const TAG_CONFIG = {
  'Nou':        { color: '#10B981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)'  },
  'Îmbunătățit':{ color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)'  },
  'Fix':        { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)'  },
  'Eliminat':   { color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)'   },
  'Anunț':      { color: '#A78BFA', bg: 'rgba(124,58,237,0.12)', border: 'rgba(124,58,237,0.3)'  },
};

function AddUpdateModal({ currentUser, onClose, onSave }) {
  const [title,   setTitle]   = useState('');
  const [desc,    setDesc]    = useState('');
  const [tag,     setTag]     = useState('Nou');
  const [version, setVersion] = useState('');
  const [err,     setErr]     = useState('');

  async function save() {
    if (!title.trim()) { setErr('Titlul este obligatoriu!'); return; }
    if (!desc.trim())  { setErr('Descrierea este obligatorie!'); return; }
    await onSave({ title: title.trim(), desc: desc.trim(), tag, version: version.trim(), autor: currentUser.fullName || currentUser.name });
    onClose();
  }

  const inp = {
    width: '100%', background: 'var(--b3)', border: '1px solid var(--br)',
    borderRadius: 10, padding: '9px 13px', fontSize: 12, color: 'var(--t)',
    fontFamily: 'Space Grotesk, sans-serif', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color .2s',
  };
  const lbl = { fontSize: 11, color: 'var(--t3)', fontWeight: 600, letterSpacing: '.5px', textTransform: 'uppercase', display: 'block', marginBottom: 6 };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--b2)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 20, padding: 28, width: 480, boxShadow: '0 30px 80px rgba(0,0,0,0.7)', animation: 'modalIn .18s ease' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--p3)' }}>{Icons.plus}</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t)' }}>Adaugă Actualizare</div>
            <div style={{ fontSize: 11, color: 'var(--t3)' }}>Completează detaliile noii actualizări</div>
          </div>
        </div>

        {err && <div style={{ background: 'rgba(239,68,68,0.09)', border: '1px solid rgba(239,68,68,0.28)', borderRadius: 8, padding: '8px 12px', fontSize: 11, color: '#FCA5A5', marginBottom: 14 }}>⚠️ {err}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Titlu + Versiune */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10 }}>
            <div>
              <label style={lbl}>Titlu *</label>
              <input style={inp} placeholder="ex: Sistem Sancțiuni" value={title} onChange={e => { setTitle(e.target.value); setErr(''); }}
                onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.5)'}
                onBlur={e => e.target.style.borderColor = 'var(--br)'} />
            </div>
            <div>
              <label style={lbl}>Versiune</label>
              <input style={{ ...inp, width: 90 }} placeholder="v1.2" value={version} onChange={e => setVersion(e.target.value)}
                onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.5)'}
                onBlur={e => e.target.style.borderColor = 'var(--br)'} />
            </div>
          </div>

          {/* Tag */}
          <div>
            <label style={lbl}>Tip</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {Object.entries(TAG_CONFIG).map(([key, cfg]) => (
                <button key={key} onClick={() => setTag(key)} style={{
                  padding: '5px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 11, fontWeight: 600,
                  fontFamily: 'Space Grotesk, sans-serif', transition: 'all .15s',
                  background: tag === key ? cfg.bg : 'var(--b3)',
                  border: `1px solid ${tag === key ? cfg.border : 'var(--br)'}`,
                  color: tag === key ? cfg.color : 'var(--t3)',
                }}>{key}</button>
              ))}
            </div>
          </div>

          {/* Descriere */}
          <div>
            <label style={lbl}>Descriere *</label>
            <textarea rows={3} style={{ ...inp, resize: 'vertical', minHeight: 80, lineHeight: 1.6 }}
              placeholder="Descrie ce s-a schimbat..."
              value={desc} onChange={e => { setDesc(e.target.value); setErr(''); }}
              onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.5)'}
              onBlur={e => e.target.style.borderColor = 'var(--br)'}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: '10px', borderRadius: 11, background: 'var(--b3)', border: '1px solid var(--br)', color: 'var(--t2)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--br)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--b3)'}>
            Anulează
          </button>
          <button onClick={save}
            style={{ flex: 1, padding: '10px', borderRadius: 11, background: 'linear-gradient(135deg,var(--pd),var(--p))', border: '1px solid rgba(124,58,237,0.4)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 4px 20px rgba(124,58,237,0.3)' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            ✅ Publică Actualizarea
          </button>
        </div>
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.93) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
    </div>
  );
}

export default function Dashboard({ members, activities, announcements, warnings, setView, setSelMember, currentUser, isSef }) {
  const total  = members.length;
  const activ  = members.filter(m => m.status === 'activ').length;
  const sup    = members.filter(m => m.rank === 'Supervizor PR').length;
  const cond   = members.filter(m => m.rank === 'Conducere Spital').length;
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

  const [updates,   setUpdates]   = useState([]);
  const [addModal,  setAddModal]  = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'updates'), snap => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setUpdates(docs);
    });
    return unsub;
  }, []);

  async function handleAdd(data) {
    try {
      await addDoc(collection(db, 'updates'), {
        ...data,
        date: new Date().toLocaleDateString('ro-RO'),
        createdAt: serverTimestamp(),
      });
    } catch(e) { console.error(e); }
  }

  async function handleDelete(id) {
    try { await deleteDoc(doc(db, 'updates', id)); }
    catch(e) { console.error(e); }
  }

  return (
    <div>
      {addModal && (
        <AddUpdateModal
          currentUser={currentUser}
          onClose={() => setAddModal(false)}
          onSave={handleAdd}
        />
      )}

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
        </div>
        <div className="stat-card sg">
          <div className="sc-ic ig" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icons.check}</div>
          <div className="sc-label">Membri Activi</div>
          <div className="sc-val">{activ}</div>
        </div>
        <div className="stat-card sb2">
          <div className="sc-ic ib" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icons.star}</div>
          <div className="sc-label">Conducere PR</div>
          <div className="sc-val">{sef + adj}</div>
        </div>
        <div className="stat-card sa">
          <div className="sc-ic ia" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{Icons.calendar}</div>
          <div className="sc-label">Evenimente Săpt.</div>
          <div className="sc-val">{weekActs.length}</div>
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
                  <span style={{ color: '#FDE047', display: 'flex' }}>{Icons.star}</span> Supervizor PR
                </span>
                <span className="prog-v" style={{ color: '#FDE047' }}>{sup}</span>
              </div>
              <div className="prog-track"><div className="prog-fill" style={{ width: Math.round(sup / maxB * 100) + '%', background: 'linear-gradient(90deg, #92400e, #FDE047)' }} /></div>
            </div>
            <div className="prog-item">
              <div className="prog-hdr">
                <span className="prog-n" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ color: '#EF4444 ', display: 'flex' }}>{Icons.circle}</span> Conducere Spital
                </span>
                <span className="prog-v" style={{ color: '#EF4444' }}>{cond}</span>
              </div>
              <div className="prog-track"><div className="prog-fill" style={{ width: Math.round(cond / maxB * 100) + '%', background: 'linear-gradient(90deg, #065f46, #2DD4BF)' }} /></div>
            </div>
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

      {/* ── Actualizări ── */}
      <div className="card" style={{ marginTop: 4 }}>
        <div className="card-header">
          <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: 'var(--p3)', display: 'flex' }}>{Icons.zap}</span> Actualizări Sistem
          </span>
          {isSef && (
            <button
              onClick={() => setAddModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', color: 'var(--p3)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', transition: 'all .2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(124,58,237,0.1)'}
            >
              <span style={{ display: 'flex' }}>{Icons.edit}</span> Adaugă
            </button>
          )}
        </div>

        {!updates.length ? (
          <div className="empty-st">
            <div className="empty-ico">⚡</div>
            <p>Nicio actualizare publicată</p>
            {isSef && <small>Apasă „Adaugă" pentru a publica prima actualizare</small>}
          </div>
        ) : (
          <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {updates.map(u => {
              const tagCfg = TAG_CONFIG[u.tag] || TAG_CONFIG['Anunț'];
              return (
                <div key={u.id} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '14px 16px', background: 'var(--b3)', border: '1px solid var(--br)', borderRadius: 12, borderLeft: `3px solid ${tagCfg.color}` }}>
                  {/* Tag + versiune */}
                  <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, paddingTop: 2 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 7, fontSize: 10, fontWeight: 700, background: tagCfg.bg, border: `1px solid ${tagCfg.border}`, color: tagCfg.color, whiteSpace: 'nowrap' }}>
                      {u.tag}
                    </span>
                    {u.version && (
                      <span style={{ fontSize: 9, color: 'var(--t3)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, letterSpacing: '.5px' }}>{u.version}</span>
                    )}
                  </div>

                  {/* Conținut */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t)', marginBottom: 4 }}>{u.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.6 }}>{u.desc}</div>
                    <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 6, display: 'flex', gap: 10 }}>
                      <span>📅 {u.date}</span>
                      {u.autor && <span>👤 {u.autor}</span>}
                    </div>
                  </div>

                  {/* Șterge (doar Șef PR) */}
                  {isSef && (
                    <button onClick={() => handleDelete(u.id)}
                      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5', borderRadius: 7, padding: '5px 7px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all .2s', flexShrink: 0 }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.18)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                      title="Șterge actualizarea">
                      {Icons.trash}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}