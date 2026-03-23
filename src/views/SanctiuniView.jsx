import React, { useState, useEffect } from 'react';
import { db } from '../utils/firebase';
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp
} from 'firebase/firestore';
import RankBadge from '../components/RankBadge';

const Ico = {
  scale:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="3" x2="12" y2="21"/><path d="M3 6l9-3 9 3"/><path d="M3 18l9 3 9-3"/><path d="M3 6l4 6-4 6"/><path d="M21 6l-4 6 4 6"/></svg>,
  warning:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  fw:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
  money:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  edit:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  plus:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  shield: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  search: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  active: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  total:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  unpaid: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
};

const STATUS_CONFIG = {
  'Activă':    { color: '#10B981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)'  },
  'Expirată':  { color: '#6B7280', bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.3)' },
  'Plătită':   { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.3)'  },
  'Neplătită': { color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)'   },
};

const SANCTIUNE_CONFIG = {
  'Amendă':      { color: '#F59E0B', icon: Ico.money   },
  'Avertisment': { color: '#EF4444', icon: Ico.warning },
  'FW':          { color: '#7C3AED', icon: Ico.fw      },
};

function getName(m) {
  return m?.fullName || m?.charName || m?.name || '—';
}

function AddSanctiuneModal({ members, currentUser, onClose, onSave }) {
  const [form, setForm] = useState({
    memberId:        '',
    sanctiune:       'Amendă',
    dataSanctionare: new Date().toLocaleDateString('ro-RO'),
    dataExpirare:    '',
    sumaAmenzii:     '',
    motiv:           '',
    status:          'Activă',
  });
  const [err, setErr] = useState({});

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const selectedMember = members.find(m => m.id === form.memberId);

  function validate() {
    const e = {};
    if (!form.memberId)     e.memberId    = 'Selectează un membru!';
    if (!form.motiv.trim()) e.motiv       = 'Motivul este obligatoriu!';
    if (form.sanctiune === 'Amendă' && !form.sumaAmenzii) e.sumaAmenzii = 'Introdu suma!';
    return e;
  }

  async function save() {
    const e = validate();
    if (Object.keys(e).length) { setErr(e); return; }
    await onSave({
      memberId:        selectedMember.id,
      memberName:      getName(selectedMember),
      memberRank:      selectedMember.rank,
      memberCallSign:  selectedMember.faction || '—',
      memberCharId:    selectedMember.charId  || '—',
      sanctiune:       form.sanctiune,
      dataSanctionare: form.dataSanctionare,
      dataExpirare:    form.dataExpirare || '—',
      sumaAmenzii:     form.sanctiune === 'Amendă' ? Number(form.sumaAmenzii) : 0,
      motiv:           form.motiv.trim(),
      status:          form.status,
      responsabil:     getName(currentUser),
      responsabilRank: currentUser.rank,
    });
    onClose();
  }

  const inputStyle = (hasErr) => ({
    width: '100%', background: 'var(--b3)',
    border: `1px solid ${hasErr ? 'rgba(239,68,68,0.5)' : 'var(--br)'}`,
    borderRadius: 10, padding: '9px 13px', fontSize: 12, color: 'var(--t)',
    fontFamily: 'Space Grotesk, sans-serif', outline: 'none',
    transition: 'border-color .2s', boxSizing: 'border-box',
  });

  const labelStyle = {
    fontSize: 11, color: 'var(--t3)', fontWeight: 600,
    letterSpacing: '.5px', textTransform: 'uppercase',
    display: 'block', marginBottom: 6,
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--b2)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 20, padding: '28px', width: 500, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 30px 80px rgba(0,0,0,0.7)', animation: 'modalIn .18s ease' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--p3)' }}>{Ico.scale}</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t)' }}>Adaugă Sancțiune</div>
            <div style={{ fontSize: 11, color: 'var(--t3)' }}>Completează toate câmpurile obligatorii</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Membru */}
          <div>
            <label style={labelStyle}>Membru *</label>
            <select value={form.memberId} onChange={e => f('memberId', e.target.value)}
              style={{ ...inputStyle(err.memberId), cursor: 'pointer' }}
              onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.5)'}
              onBlur={e => e.target.style.borderColor = err.memberId ? 'rgba(239,68,68,0.5)' : 'var(--br)'}>
              <option value="">— Selectează membrul —</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{getName(m)} — {m.rank}</option>
              ))}
            </select>
            {err.memberId && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#FCA5A5', marginTop: 4 }}>
                <span style={{ display: 'flex' }}>{Ico.warning}</span> {err.memberId}
              </div>
            )}
            {selectedMember && (
              <div style={{ marginTop: 8, background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 10, padding: '10px 14px', display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t)', marginBottom: 3 }}>{getName(selectedMember)}</div>
                  <div style={{ fontSize: 10, color: 'var(--t3)', fontFamily: 'JetBrains Mono, monospace' }}>
                    ID: {selectedMember.charId || '—'} · Callsign: {selectedMember.faction || '—'}
                  </div>
                </div>
                <RankBadge rank={selectedMember.rank} />
              </div>
            )}
          </div>

          {/* Tip sancțiune */}
          <div>
            <label style={labelStyle}>Tip Sancțiune *</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {Object.entries(SANCTIUNE_CONFIG).map(([key, cfg]) => (
                <button key={key} onClick={() => f('sanctiune', key)} style={{
                  flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer',
                  fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, fontWeight: 600,
                  transition: 'all .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  background: form.sanctiune === key ? cfg.color + '22' : 'var(--b3)',
                  border: `1px solid ${form.sanctiune === key ? cfg.color : 'var(--br)'}`,
                  color: form.sanctiune === key ? cfg.color : 'var(--t3)',
                }}>
                  <span style={{ display: 'flex' }}>{cfg.icon}</span> {key}
                </button>
              ))}
            </div>
          </div>

          {/* Suma amenzii */}
          {form.sanctiune === 'Amendă' && (
            <div>
              <label style={labelStyle}>Suma Amenzii ($) *</label>
              <input type="number" value={form.sumaAmenzii}
                onChange={e => { f('sumaAmenzii', e.target.value); setErr(p => ({ ...p, sumaAmenzii: '' })); }}
                placeholder="ex: 5000"
                style={inputStyle(err.sumaAmenzii)}
                onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.5)'}
                onBlur={e => e.target.style.borderColor = err.sumaAmenzii ? 'rgba(239,68,68,0.5)' : 'var(--br)'}
              />
              {err.sumaAmenzii && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#FCA5A5', marginTop: 4 }}>
                  <span style={{ display: 'flex' }}>{Ico.warning}</span> {err.sumaAmenzii}
                </div>
              )}
            </div>
          )}

          {/* Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Data Sancționare *</label>
              <input value={form.dataSanctionare} onChange={e => f('dataSanctionare', e.target.value)}
                placeholder="zz.ll.aaaa" style={inputStyle(false)}
                onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.5)'}
                onBlur={e => e.target.style.borderColor = 'var(--br)'} />
            </div>
            <div>
              <label style={labelStyle}>Data Expirare</label>
              <input value={form.dataExpirare} onChange={e => f('dataExpirare', e.target.value)}
                placeholder="zz.ll.aaaa" style={inputStyle(false)}
                onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.5)'}
                onBlur={e => e.target.style.borderColor = 'var(--br)'} />
            </div>
          </div>

          {/* Status */}
          <div>
            <label style={labelStyle}>Status *</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <button key={key} onClick={() => f('status', key)} style={{
                  flex: 1, minWidth: 80, padding: '8px', borderRadius: 10, cursor: 'pointer',
                  fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, fontWeight: 600,
                  transition: 'all .2s',
                  background: form.status === key ? cfg.bg : 'var(--b3)',
                  border: `1px solid ${form.status === key ? cfg.border : 'var(--br)'}`,
                  color: form.status === key ? cfg.color : 'var(--t3)',
                }}>{key}</button>
              ))}
            </div>
          </div>

          {/* Motiv */}
          <div>
            <label style={labelStyle}>Motiv *</label>
            <textarea rows={3} value={form.motiv}
              onChange={e => { f('motiv', e.target.value); setErr(p => ({ ...p, motiv: '' })); }}
              placeholder="Descrie motivul sancțiunii..."
              style={{ ...inputStyle(err.motiv), resize: 'vertical', minHeight: 80, lineHeight: 1.6 }}
              onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.5)'}
              onBlur={e => e.target.style.borderColor = err.motiv ? 'rgba(239,68,68,0.5)' : 'var(--br)'}
            />
            {err.motiv && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#FCA5A5', marginTop: 4 }}>
                <span style={{ display: 'flex' }}>{Ico.warning}</span> {err.motiv}
              </div>
            )}
          </div>

        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: '11px', borderRadius: 11, background: 'var(--b3)', border: '1px solid var(--br)', color: 'var(--t2)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', transition: 'all .2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--br)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--b3)'}>
            Anulează
          </button>
          <button onClick={save}
            style={{ flex: 1, padding: '11px', borderRadius: 11, background: 'linear-gradient(135deg,var(--pd),var(--p))', border: '1px solid rgba(124,58,237,0.4)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 4px 20px rgba(124,58,237,0.3)', transition: 'opacity .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            <span style={{ display: 'flex' }}>{Ico.scale}</span> Adaugă Sancțiune
          </button>
        </div>
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.93) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
    </div>
  );
}

function EditStatusModal({ sanctiune, onClose, onSave }) {
  const [status, setStatus] = useState(sanctiune.status);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--b2)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 20, padding: '28px', width: 360, boxShadow: '0 30px 80px rgba(0,0,0,0.7)', animation: 'modalIn .18s ease' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t)', marginBottom: 6 }}>Modifică Status</div>
        <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 18 }}>
          Sancțiune pentru <span style={{ color: 'var(--t2)', fontWeight: 600 }}>{sanctiune.memberName}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 22 }}>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <button key={key} onClick={() => setStatus(key)} style={{
              padding: '10px 14px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
              fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, fontWeight: 600,
              transition: 'all .2s',
              background: status === key ? cfg.bg : 'var(--b3)',
              border: `1px solid ${status === key ? cfg.border : 'var(--br)'}`,
              color: status === key ? cfg.color : 'var(--t3)',
            }}>{key}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: '10px', borderRadius: 11, background: 'var(--b3)', border: '1px solid var(--br)', color: 'var(--t2)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--br)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--b3)'}>
            Anulează
          </button>
          <button onClick={() => onSave(status)}
            style={{ flex: 1, padding: '10px', borderRadius: 11, background: 'linear-gradient(135deg,var(--pd),var(--p))', border: '1px solid rgba(124,58,237,0.4)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            Salvează
          </button>
        </div>
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.93) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
    </div>
  );
}

export default function SanctiuniView({ members, currentUser, isAdj, isSef }) {
  const [sanctiuni,    setSanctiuni]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [addModal,     setAddModal]     = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filterTip,    setFilterTip]    = useState('Toate');
  const [filterStatus, setFilterStatus] = useState('Toate');
  const [search,       setSearch]       = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'sanctions'), snap => {
      setSanctiuni(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  async function handleAdd(data) {
    try { await addDoc(collection(db, 'sanctions'), { ...data, createdAt: serverTimestamp() }); }
    catch (err) { console.error('Eroare la adăugare:', err); }
  }

  async function handleStatusUpdate(id, status) {
    try { await updateDoc(doc(db, 'sanctions', id), { status }); setEditTarget(null); }
    catch (err) { console.error('Eroare la actualizare:', err); }
  }

  async function handleDelete(id) {
    try { await deleteDoc(doc(db, 'sanctions', id)); setDeleteTarget(null); }
    catch (err) { console.error('Eroare la ștergere:', err); }
  }

  const filtered = sanctiuni
    .filter(s => filterTip    === 'Toate' || s.sanctiune === filterTip)
    .filter(s => filterStatus === 'Toate' || s.status    === filterStatus)
    .filter(s => !search || (
      (s.memberName     || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.memberCallSign || s.faction || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.memberCharId   || s.charId  || '').toLowerCase().includes(search.toLowerCase())
    ))
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

  const totalAmezi   = sanctiuni.filter(s => s.sanctiune === 'Amendă').reduce((acc, s) => acc + (s.sumaAmenzii || 0), 0);
  const activeCount  = sanctiuni.filter(s => s.status === 'Activă').length;
  const fwCount      = sanctiuni.filter(s => s.sanctiune === 'FW').length;
  const neplatiteSum = sanctiuni.filter(s => s.status === 'Neplătită').reduce((acc, s) => acc + (s.sumaAmenzii || 0), 0);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--t3)', fontSize: 13 }}>
      Se încarcă sancțiunile...
    </div>
  );

  return (
    <div>
      {addModal && (
        <AddSanctiuneModal members={members} currentUser={currentUser} onClose={() => setAddModal(false)} onSave={handleAdd} />
      )}
      {editTarget && (
        <EditStatusModal sanctiune={editTarget} onClose={() => setEditTarget(null)} onSave={(status) => handleStatusUpdate(editTarget.id, status)} />
      )}
      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--b2)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 20, padding: '32px 28px', width: 360, boxShadow: '0 30px 80px rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'modalIn .18s ease' }}>
            <div style={{ color: '#EF4444', opacity: 0.7, marginBottom: 14 }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t)', marginBottom: 8, textAlign: 'center' }}>Ștergi sancțiunea?</div>
            <div style={{ fontSize: 12, color: 'var(--t3)', textAlign: 'center', marginBottom: 22 }}>
              Sancțiunea pentru <span style={{ color: 'var(--t2)', fontWeight: 600 }}>{deleteTarget.memberName}</span> va fi eliminată permanent.
            </div>
            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              <button onClick={() => setDeleteTarget(null)}
                style={{ flex: 1, padding: '10px', borderRadius: 11, background: 'var(--b3)', border: '1px solid var(--br)', color: 'var(--t2)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--br)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--b3)'}>
                Anulează
              </button>
              <button onClick={() => handleDelete(deleteTarget.id)}
                style={{ flex: 1, padding: '10px', borderRadius: 11, background: 'linear-gradient(135deg,#7f1d1d,#ef4444)', border: '1px solid rgba(239,68,68,0.4)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                <span style={{ display: 'flex' }}>{Ico.trash}</span> Șterge
              </button>
            </div>
          </div>
          <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.93) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
        </div>
      )}

      {/* ── Stat cards ── */}
      <div className="stats-grid" style={{ marginBottom: 18 }}>
        <div className="stat-card" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
          <div className="sc-ic" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, width: 36, height: 36 }}>{Ico.active}</div>
          <div className="sc-label">Sancțiuni Active</div>
          <div className="sc-val" style={{ color: '#EF4444' }}>{activeCount}</div>
          <div className="sc-sub">În desfășurare</div>
        </div>
        <div className="stat-card" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
          <div className="sc-ic" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 10, width: 36, height: 36 }}>{Ico.money}</div>
          <div className="sc-label">Total Amenzi</div>
          <div className="sc-val" style={{ color: '#F59E0B' }}>${totalAmezi.toLocaleString()}</div>
          <div className="sc-sub">Valoare totală</div>
        </div>
        <div className="stat-card" style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)' }}>
          <div className="sc-ic" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 10, width: 36, height: 36 }}>{Ico.fw}</div>
          <div className="sc-label">FW-uri</div>
          <div className="sc-val" style={{ color: '#7C3AED' }}>{fwCount}</div>
          <div className="sc-sub">Fired Warnings</div>
        </div>
        <div className="stat-card" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
          <div className="sc-ic" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, width: 36, height: 36 }}>{Ico.unpaid}</div>
          <div className="sc-label">Amenzi Neplătite</div>
          <div className="sc-val" style={{ color: '#EF4444' }}>${neplatiteSum.toLocaleString()}</div>
          <div className="sc-sub">De recuperat</div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="tb-search" style={{ flex: 1, minWidth: 150 }}
          placeholder="Caută după nume, ID, callsign..."
          value={search} onChange={e => setSearch(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          {['Toate', 'Amendă', 'Avertisment', 'FW'].map(t => (
            <button key={t} onClick={() => setFilterTip(t)} style={{
              padding: '7px 12px', borderRadius: 9, fontSize: 11, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', transition: 'all .2s',
              background: filterTip === t ? 'rgba(124,58,237,0.2)' : 'var(--b3)',
              border: `1px solid ${filterTip === t ? 'rgba(124,58,237,0.5)' : 'var(--br)'}`,
              color: filterTip === t ? 'var(--p3)' : 'var(--t3)',
            }}>{t}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['Toate', 'Activă', 'Neplătită', 'Plătită', 'Expirată'].map(s => {
            const cfg = STATUS_CONFIG[s];
            return (
              <button key={s} onClick={() => setFilterStatus(s)} style={{
                padding: '7px 12px', borderRadius: 9, fontSize: 11, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', transition: 'all .2s',
                background: filterStatus === s ? (cfg?.bg || 'rgba(124,58,237,0.2)') : 'var(--b3)',
                border: `1px solid ${filterStatus === s ? (cfg?.border || 'rgba(124,58,237,0.5)') : 'var(--br)'}`,
                color: filterStatus === s ? (cfg?.color || 'var(--p3)') : 'var(--t3)',
              }}>{s}</button>
            );
          })}
        </div>
        {isAdj && (
          <button className="btn-p" onClick={() => setAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
            <span style={{ display: 'flex' }}>{Ico.plus}</span> Adaugă Sancțiune
          </button>
        )}
      </div>

      {/* ── Tabel ── */}
      <div className="card">
        <div className="card-header">
          <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: 'var(--p3)', display: 'flex' }}>{Ico.scale}</span> Registru Sancțiuni
          </span>
          <span style={{ fontSize: 10, color: 'var(--t3)' }}>{filtered.length} înregistrări</span>
        </div>
        {!filtered.length ? (
          <div className="empty-st">
            <div className="empty-ico" style={{ display: 'flex', justifyContent: 'center', color: 'var(--t3)', opacity: 0.3 }}>{Ico.shield}</div>
            <p>Nicio sancțiune găsită</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Call Sign</th>
                  <th>Nume Prenume</th>
                  <th>Rank</th>
                  <th>Sancțiune</th>
                  <th>Data Sancționare</th>
                  <th>Data Expirare</th>
                  <th>Suma Amenzii</th>
                  <th>Motiv</th>
                  <th>Status</th>
                  <th>Responsabil</th>
                  {isAdj && <th>Acțiuni</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const tipCfg    = SANCTIUNE_CONFIG[s.sanctiune] || {};
                  const statusCfg = STATUS_CONFIG[s.status]       || {};
                  return (
                    <tr key={s.id}>
                      <td style={{ color: 'var(--t3)', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap' }}>
                        {s.memberCharId || s.charId || '—'}
                      </td>
                      <td style={{ color: 'var(--p3)', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap' }}>
                        {s.memberCallSign || s.faction || '—'}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--t)', whiteSpace: 'nowrap' }}>
                        {s.memberName}
                      </td>
                      <td><RankBadge rank={s.memberRank} /></td>
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '3px 10px', borderRadius: 7, fontSize: 11, fontWeight: 700,
                          background: tipCfg.color + '18',
                          border: `1px solid ${tipCfg.color}40`,
                          color: tipCfg.color,
                        }}>
                          <span style={{ display: 'flex' }}>{tipCfg.icon}</span> {s.sanctiune}
                        </span>
                      </td>
                      <td style={{ color: 'var(--t3)', fontSize: 11, whiteSpace: 'nowrap' }}>{s.dataSanctionare}</td>
                      <td style={{ color: 'var(--t3)', fontSize: 11, whiteSpace: 'nowrap' }}>{s.dataExpirare}</td>
                      <td style={{ color: s.sumaAmenzii > 0 ? '#F59E0B' : 'var(--t3)', fontWeight: s.sumaAmenzii > 0 ? 700 : 400, fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap' }}>
                        {s.sumaAmenzii > 0 ? `$${s.sumaAmenzii.toLocaleString()}` : '—'}
                      </td>
                      <td style={{ color: 'var(--t2)', fontSize: 11, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.motiv}
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: 7,
                          fontSize: 11, fontWeight: 700,
                          background: statusCfg.bg, border: `1px solid ${statusCfg.border}`,
                          color: statusCfg.color, whiteSpace: 'nowrap',
                        }}>
                          {s.status}
                        </span>
                      </td>
                      <td style={{ color: 'var(--t3)', fontSize: 11, whiteSpace: 'nowrap' }}>{s.responsabil}</td>
                      {isAdj && (
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <button onClick={() => setEditTarget(s)} title="Modifică status"
                            style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', color: 'var(--p3)', borderRadius: 7, padding: '5px 7px', cursor: 'pointer', marginRight: 4, transition: 'all .2s', display: 'inline-flex', alignItems: 'center' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(124,58,237,0.1)'}>
                            {Ico.edit}
                          </button>
                          {isSef && (
                            <button onClick={() => setDeleteTarget(s)} title="Șterge"
                              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#FCA5A5', borderRadius: 7, padding: '5px 7px', cursor: 'pointer', transition: 'all .2s', display: 'inline-flex', alignItems: 'center' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}>
                              {Ico.trash}
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}