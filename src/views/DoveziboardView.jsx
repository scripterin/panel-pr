import React, { useState, useEffect } from 'react';
import {
  collection, addDoc, onSnapshot, orderBy, query,
  serverTimestamp, doc, updateDoc,
} from 'firebase/firestore';
import { db } from '../utils/firebase';

// ── SVG Icons ──────────────────────────────────────────
const IcoLock     = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IcoUpload   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;
const IcoShield   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IcoSearch   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoCart     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
const IcoHospital = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>;
const IcoPin      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17z"/></svg>;
const IcoSave     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const IcoCheck    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoX        = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoClock    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcoList     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;

/* ─── helpers ─── */
function nowDate() {
  return new Date().toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function nowTime() {
  return new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
}

/* ─── Status badge ─── */
const STATUS_MAP = {
  neverificat: { label: 'Neverificat', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', icon: <IcoClock /> },
  verificat:   { label: 'Verificat',   color: '#10B981', bg: 'rgba(16,185,129,0.12)', icon: <IcoCheck /> },
  neregula:    { label: 'Neregulă',    color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  icon: <IcoX />    },
};

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.neverificat;
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
      background: s.bg, color: s.color, letterSpacing: '.4px',
      border: `1px solid ${s.color}33`, display: 'inline-flex', alignItems: 'center', gap: 4,
    }}>{s.icon} {s.label}</span>
  );
}

/* ─── Locked field ─── */
function LockedField({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 700, letterSpacing: '.8px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
        {label} <IcoLock />
      </label>
      <div style={{
        padding: '9px 12px', background: 'rgba(124,58,237,0.05)',
        border: '1px solid rgba(124,58,237,0.15)', borderRadius: 9,
        fontSize: 12, color: 'var(--t2)', fontFamily: 'JetBrains Mono, monospace',
        opacity: 0.8,
      }}>{value || '—'}</div>
    </div>
  );
}

/* ─── Post Form Modal ─── */
function PostFormModal({ currentUser, category, onClose, onSuccess }) {
  const [imgurLink, setImgurLink] = useState('');
  const [preview,   setPreview]   = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  function handleLinkChange(e) {
    const val = e.target.value.trim();
    setImgurLink(val);
    setError('');
    if (val.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i) || val.includes('imgur.com')) {
      setPreview(val);
    } else {
      setPreview(null);
    }
  }

  async function handleSubmit() {
    if (!imgurLink) { setError('Link-ul imgur este obligatoriu!'); return; }
    if (!imgurLink.startsWith('http')) { setError('Link-ul trebuie să înceapă cu https://'); return; }
    setSaving(true);
    setError('');
    try {
      await addDoc(collection(db, 'dovezi'), {
        category,
        senderId:   currentUser.id,
        senderName: currentUser.fullName,
        callsign:   currentUser.faction || currentUser.charId || '—',
        charId:     currentUser.charId  || '—',
        rank:       currentUser.rank,
        date:       nowDate(),
        time:       nowTime(),
        photoUrl:   imgurLink,
        status:     'neverificat',
        createdAt:  serverTimestamp(),
      });
      onSuccess();
    } catch (err) {
      setError('Eroare la salvare. Încearcă din nou.');
    } finally {
      setSaving(false);
    }
  }

  const catLabel = category === 'marketplace' ? 'Marketplace' : 'Anunț Spital';
  const CatIcon  = category === 'marketplace' ? IcoCart : IcoHospital;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: 'var(--b2)', border: '1px solid var(--br2)',
        borderRadius: 20, width: '100%', maxWidth: 460,
        boxShadow: '0 30px 80px rgba(0,0,0,0.7), var(--glow)',
        overflow: 'hidden', animation: 'modalIn .18s ease',
      }}>
        <div style={{
          padding: '18px 22px', borderBottom: '1px solid var(--br)',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.08), transparent)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t)', fontFamily: 'Space Grotesk, sans-serif' }}>
              Postează Anunț
            </div>
            <div style={{ fontSize: 11, color: 'var(--p3)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
              <CatIcon /> {catLabel}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', fontSize: 20, lineHeight: 1, padding: 4 }}>×</button>
        </div>

        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <LockedField label="Nume Prenume"      value={currentUser.fullName}       />
            <LockedField label="Callsign / Faction" value={currentUser.faction || '—'} />
            <LockedField label="ID Personaj"        value={currentUser.charId  || '—'} />
            <LockedField label="Grad"               value={currentUser.rank}           />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <LockedField label="Data" value={nowDate()} />
            <LockedField label="Ora"  value={nowTime()} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 700, letterSpacing: '.8px', textTransform: 'uppercase' }}>
              Link Imgur <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <div style={{
              fontSize: 10, color: 'var(--t3)', background: 'rgba(124,58,237,0.06)',
              border: '1px solid rgba(124,58,237,0.15)', borderRadius: 8, padding: '7px 10px', lineHeight: 1.6,
            }}>
              Pași: mergi pe <strong style={{ color: 'var(--p3)' }}>imgur.com</strong> → încarcă poza → click dreapta pe imagine → <strong style={{ color: 'var(--p3)' }}>Copy image address</strong> → lipește mai jos
            </div>
            <input
              type="text" value={imgurLink} onChange={handleLinkChange}
              placeholder="https://i.imgur.com/xxxxxxx.jpg"
              style={{ padding: '10px 14px', background: 'var(--b3)', border: '1px solid var(--br)', borderRadius: 9, color: 'var(--t)', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', outline: 'none', transition: 'border-color .2s' }}
              onFocus={e => e.target.style.borderColor = 'var(--p)'}
              onBlur={e  => e.target.style.borderColor = 'var(--br)'}
            />
            {preview && (
              <div style={{ position: 'relative' }}>
                <img src={preview} alt="preview" onError={() => setPreview(null)}
                  style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 9, border: '1px solid var(--br2)', display: 'block' }} />
                <div style={{ position: 'absolute', top: 6, left: 6, background: 'rgba(16,185,129,0.9)', borderRadius: 5, padding: '2px 8px', fontSize: 10, color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <IcoCheck /> Preview
                </div>
              </div>
            )}
          </div>

          {error && (
            <div style={{ fontSize: 12, color: '#FCA5A5', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <IcoX /> {error}
            </div>
          )}
        </div>

        <div style={{ padding: '0 22px 20px', display: 'flex', gap: 10 }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: '11px', borderRadius: 11, background: 'var(--b3)', border: '1px solid var(--br)', color: 'var(--t2)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}>
            Anulează
          </button>
          <button onClick={handleSubmit} disabled={saving}
            style={{ flex: 2, padding: '11px', borderRadius: 11, background: saving ? 'var(--b3)' : 'linear-gradient(135deg, var(--pd), var(--p))', border: '1px solid rgba(124,58,237,0.4)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 4px 20px rgba(124,58,237,0.3)', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            {saving ? <><IcoClock /> Se salvează...</> : <><IcoUpload /> Postează Anunțul</>}
          </button>
        </div>
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.94) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
    </div>
  );
}

/* ─── Admin Status Modal ─── */
function AdminStatusModal({ post, onClose, onSave }) {
  const [status, setStatus] = useState(post.status || 'neverificat');
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2100, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--b2)', border: '1px solid var(--br2)', borderRadius: 20, width: '100%', maxWidth: 380, boxShadow: '0 30px 80px rgba(0,0,0,0.7)', overflow: 'hidden', animation: 'modalIn .18s ease' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--br)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t)', display: 'flex', alignItems: 'center', gap: 7 }}>
            <IcoShield /> Gestionează Anunț
          </div>
          <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 3 }}>Postat de {post.senderName}</div>
        </div>
        <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 700, letterSpacing: '.8px', textTransform: 'uppercase', marginBottom: 4 }}>Setează Status</div>
          {Object.entries(STATUS_MAP).map(([key, val]) => (
            <button key={key} onClick={() => setStatus(key)}
              style={{ padding: '11px 16px', borderRadius: 10, cursor: 'pointer', background: status === key ? val.bg : 'var(--b3)', border: status === key ? `1px solid ${val.color}55` : '1px solid var(--br)', color: status === key ? val.color : 'var(--t2)', fontSize: 13, fontWeight: 600, textAlign: 'left', fontFamily: 'Space Grotesk, sans-serif', transition: 'all .15s', display: 'flex', alignItems: 'center', gap: 8 }}>
              {val.icon} {val.label}
            </button>
          ))}
        </div>
        <div style={{ padding: '0 22px 20px', display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'var(--b3)', border: '1px solid var(--br)', color: 'var(--t2)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}>
            Anulează
          </button>
          <button onClick={() => onSave(post.id, status)} style={{ flex: 2, padding: '10px', borderRadius: 10, background: 'linear-gradient(135deg, var(--pd), var(--p))', border: '1px solid rgba(124,58,237,0.4)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            <IcoSave /> Salvează
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Post Card ─── */
function PostCard({ post, isAdmin, onManage }) {
  const [imgOpen, setImgOpen] = useState(false);
  return (
    <div style={{ background: 'var(--b2)', border: '1px solid var(--br)', borderRadius: 14, overflow: 'hidden', transition: 'border-color .2s, box-shadow .2s', animation: 'fadeUp .25s ease' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--br2)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--br)';  e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setImgOpen(true)}>
        <img src={post.photoUrl} alt="dovada" style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)', display: 'flex', alignItems: 'flex-end', padding: '10px 12px' }}>
          <StatusBadge status={post.status} />
        </div>
        <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', borderRadius: 6, padding: '3px 7px', fontSize: 10, color: '#fff', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <IcoSearch /> Mărește
        </div>
      </div>

      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t)', fontFamily: 'Space Grotesk, sans-serif' }}>{post.senderName}</div>
            <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 2 }}>{post.rank}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: 'var(--t3)' }}>{post.date}</div>
            <div style={{ fontSize: 10, color: 'var(--t3)' }}>{post.time}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
          {[{ label: 'Callsign', value: post.callsign }, { label: 'ID', value: post.charId }].map(({ label, value }) => (
            <div key={label} style={{ background: 'var(--b3)', borderRadius: 7, padding: '5px 9px' }}>
              <div style={{ fontSize: 9, color: 'var(--t3)', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase' }}>{label}</div>
              <div style={{ fontSize: 11, color: 'var(--t2)', fontFamily: 'JetBrains Mono, monospace', marginTop: 1 }}>{value}</div>
            </div>
          ))}
        </div>

        {isAdmin && (
          <button onClick={() => onManage(post)}
            style={{ width: '100%', padding: '8px', borderRadius: 9, background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', color: 'var(--p3)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', transition: 'all .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(124,58,237,0.08)'}
          ><IcoShield /> Gestionează</button>
        )}
      </div>

      {imgOpen && (
        <div onClick={() => setImgOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', padding: 20 }}>
          <img src={post.photoUrl} alt="dovada" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12, objectFit: 'contain' }} />
        </div>
      )}
    </div>
  );
}

/* ─── Category Tab ─── */
function CategoryTab({ posts, category, catLabel, currentUser, isAdmin }) {
  const [showForm,   setShowForm]   = useState(false);
  const [managePost, setManagePost] = useState(null);

  const myPosts = posts.filter(p => p.senderId === currentUser.id);

  async function handleSaveStatus(postId, status) {
    await updateDoc(doc(db, 'dovezi', postId), { status });
    setManagePost(null);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {showForm && <PostFormModal currentUser={currentUser} category={category} onClose={() => setShowForm(false)} onSuccess={() => setShowForm(false)} />}
      {managePost && <AdminStatusModal post={managePost} onClose={() => setManagePost(null)} onSave={handleSaveStatus} />}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={() => setShowForm(true)}
          style={{ padding: '10px 20px', borderRadius: 11, background: 'linear-gradient(135deg, var(--pd), var(--p))', border: '1px solid rgba(124,58,237,0.4)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 4px 16px rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', gap: 8, transition: 'opacity .2s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        ><IcoUpload /> Postează Anunț</button>
      </div>

      {isAdmin ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ padding: '10px 16px', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 10, fontSize: 12, color: 'var(--p3)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <IcoShield /> <strong>Mod Admin</strong> — Vezi toate postările și gestionează statusurile
          </div>
          {(() => {
            const grouped = {};
            posts.forEach(p => {
              if (!grouped[p.senderId]) grouped[p.senderId] = { name: p.senderName, rank: p.rank, posts: [] };
              grouped[p.senderId].posts.push(p);
            });
            return Object.entries(grouped).map(([uid, data]) => (
              <div key={uid}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)', fontFamily: 'Space Grotesk, sans-serif' }}>{data.name}</div>
                  <span style={{ fontSize: 10, color: 'var(--t3)', background: 'var(--b3)', padding: '2px 7px', borderRadius: 5 }}>{data.rank}</span>
                  <span style={{ fontSize: 10, color: 'var(--t3)' }}>{data.posts.length} anunț{data.posts.length !== 1 ? 'uri' : ''}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                  {data.posts.map(p => <PostCard key={p.id} post={p} isAdmin={true} onManage={setManagePost} />)}
                </div>
              </div>
            ));
          })()}
          {posts.length === 0 && <EmptyState label={`Nicio dovadă în ${catLabel}`} />}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 700, letterSpacing: '.8px', textTransform: 'uppercase', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <IcoList /> Istoricul Meu · {myPosts.length} anunț{myPosts.length !== 1 ? 'uri' : ''}
          </div>
          {myPosts.length === 0 ? (
            <EmptyState label="Nu ai postat nicio dovadă încă" />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
              {myPosts.map(p => <PostCard key={p.id} post={p} isAdmin={false} onManage={() => {}} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ label }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 20px', opacity: 0.5 }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, color: 'var(--t3)' }}>
        <IcoPin />
      </div>
      <div style={{ fontSize: 13, color: 'var(--t3)', fontFamily: 'Space Grotesk, sans-serif' }}>{label}</div>
    </div>
  );
}

/* ─── MAIN ─── */
export default function DoveziBoardView({ currentUser, isAdj, isSef }) {
  const [activeTab, setActiveTab] = useState('marketplace');
  const [allPosts,  setAllPosts]  = useState([]);

  const isAdmin = isAdj || isSef;

  useEffect(() => {
    const q = query(collection(db, 'dovezi'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setAllPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const tabs = [
    { id: 'marketplace', label: 'Marketplace',  Icon: IcoCart     },
    { id: 'spital',      label: 'Anunț Spital', Icon: IcoHospital },
  ];

  const filtered = allPosts.filter(p => p.category === activeTab);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeUp .3s ease' }}>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--t)', fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-.3px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--p3)', display: 'flex' }}><IcoPin /></span> Dovezi
          </div>
          <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 3 }}>
            Postează și urmărește dovezile tale · {allPosts.length} total
          </div>
        </div>
        {isAdmin && (
          <div style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', fontSize: 11, color: 'var(--p3)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <IcoShield /> Acces Admin
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 6, background: 'var(--b2)', padding: 5, borderRadius: 13, border: '1px solid var(--br)', width: 'fit-content' }}>
        {tabs.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            style={{ padding: '9px 20px', borderRadius: 9, cursor: 'pointer', background: activeTab === id ? 'linear-gradient(135deg, var(--pd), var(--p))' : 'transparent', border: activeTab === id ? '1px solid rgba(124,58,237,0.4)' : '1px solid transparent', color: activeTab === id ? '#fff' : 'var(--t3)', fontSize: 13, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', boxShadow: activeTab === id ? '0 4px 12px rgba(124,58,237,0.25)' : 'none', transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon /> {label}
            <span style={{ fontSize: 10, background: activeTab === id ? 'rgba(255,255,255,0.2)' : 'var(--b3)', padding: '1px 6px', borderRadius: 5 }}>
              {allPosts.filter(p => p.category === id).length}
            </span>
          </button>
        ))}
      </div>

      <CategoryTab
        key={activeTab}
        posts={filtered}
        category={activeTab}
        catLabel={tabs.find(t => t.id === activeTab)?.label}
        currentUser={currentUser}
        isAdmin={isAdmin}
      />
    </div>
  );
}