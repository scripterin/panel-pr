import React, { useState, useRef } from 'react';
import { setOne, COL } from '../utils/storage';

// ─── DISCORD WEBHOOK ─────────────────────────────────────────────────────────
const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1483106104778035334/n3B3H21LUQJgReL9h5D91QoHCacewCwolQ5qKIbwrrLOXB4LzTCD8M5FwchYoLjVmqLn';

async function sendDiscordNotification(ev) {
  try {
    await fetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `@everyone 📋 **Eveniment nou postat!**`,
      }),
    });
  } catch (err) {
    console.error('Discord webhook error:', err);
  }
}

// ─── Constante ───────────────────────────────────────────────────────────────

const ASSIST_OPTS = [
  { label: 'Asistență medicală (1 medic)', base: '100.000$', extra: '1.000$ / min extra' },
  { label: 'Asistență medicală (2 medici)', base: '125.000$', extra: '1.250$ / min extra' },
];

const REACT_OPTS = [
  { emoji: '✅', key: 'confirm',   label: 'Confirmați / Vin cu siguranță' },
  { emoji: '👍', key: 'maybe',    label: 'Posibil să vină / Au participat anterior' },
  { emoji: '❌', key: 'no',       label: 'Nu pot ajunge' },
  { emoji: '🏖️', key: 'vacation', label: 'În concediu' },
];

const EMPTY_FORM = {
  date: '', type: '', organizer: '', time: '', location: '',
  assist: '', phone: '', imageBase64: '',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}.${m}.${y}`;
}

function StatusBadge({ label, color }) {
  const colors = {
    green:  { bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.3)',  text: '#4ade80' },
    amber:  { bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)', text: '#fbbf24' },
    blue:   { bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.3)', text: '#60a5fa' },
    violet: { bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.3)', text: '#a78bfa' },
  };
  const c = colors[color] || colors.violet;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
      letterSpacing: '0.6px', textTransform: 'uppercase',
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.text, display: 'inline-block' }} />
      {label}
    </span>
  );
}

function ConfirmModal({ title, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--b2)', border: '1px solid rgba(239,68,68,0.25)',
        borderRadius: 20, padding: '32px 28px', width: 360,
        boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        animation: 'modalIn .18s ease',
      }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 16 }}>🗑️</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t)', marginBottom: 8, textAlign: 'center' }}>Ștergi evenimentul?</div>
        <div style={{ fontSize: 12, color: 'var(--t3)', textAlign: 'center', lineHeight: 1.8, marginBottom: 24 }}>
          <span style={{ color: 'var(--t2)', fontWeight: 600 }}>„{title}"</span> va fi șters{' '}
          <span style={{ color: '#FCA5A5', fontWeight: 600 }}>permanent</span>. Acțiunea nu poate fi anulată.
        </div>
        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <button onClick={onCancel}
            style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'var(--b3)', border: '1px solid var(--br)', color: 'var(--t2)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            Anulează
          </button>
          <button onClick={onConfirm}
            style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'linear-gradient(135deg,#7f1d1d,#ef4444)', border: '1px solid rgba(239,68,68,0.4)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            🗑️ Șterge
          </button>
        </div>
      </div>
      <style>{`@keyframes modalIn{from{opacity:0;transform:scale(.93) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
    </div>
  );
}

// ─── Componenta principală ────────────────────────────────────────────────────

export default function EventsView({ events, isSef, isAdj, currentUser, onSave, onDelete }) {
  const [showForm,   setShowForm]   = useState(false);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [err,        setErr]        = useState('');
  const [sending,    setSending]    = useState(false);
  const [delModal,   setDelModal]   = useState(null);
  const [expanded,   setExpanded]   = useState(null);
  const [imgPreview, setImgPreview] = useState('');
  const fileRef = useRef(null);

  const canPost = isSef || isAdj;

  function handleImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { setErr('Imaginea trebuie să fie sub 3MB!'); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      setImgPreview(ev.target.result);
      setForm(p => ({ ...p, imageBase64: ev.target.result }));
    };
    reader.readAsDataURL(file);
  }

  function removeImg() {
    setImgPreview('');
    setForm(p => ({ ...p, imageBase64: '' }));
    if (fileRef.current) fileRef.current.value = '';
  }

  function cancelForm() {
    setShowForm(false);
    setForm(EMPTY_FORM);
    setImgPreview('');
    setErr('');
    if (fileRef.current) fileRef.current.value = '';
  }

  async function submit() {
    if (!form.date)             { setErr('Data este obligatorie!'); return; }
    if (!form.type.trim())      { setErr('Tipul evenimentului este obligatoriu!'); return; }
    if (!form.organizer.trim()) { setErr('Organizatorul este obligatoriu!'); return; }
    if (!form.time)             { setErr('Ora evenimentului este obligatorie!'); return; }
    if (!form.location.trim())  { setErr('Locația este obligatorie!'); return; }
    if (!form.assist)           { setErr('Tipul de asistență este obligatoriu!'); return; }
    if (!form.phone.trim())     { setErr('Numărul de telefon este obligatoriu!'); return; }

    const responsabil = `${currentUser.faction} ${currentUser.fullName} — ${currentUser.rank}`;
    const newEv = {
      ...form,
      id:          String(Date.now()),
      responsabil,
      postedAt:    new Date().toLocaleDateString('ro-RO'),
      status:      'neincasat',
      desfasurare: 'in-asteptare',
      reactions:   [],
      statusLog:   [],
    };

    setSending(true);
    try {
      if (typeof onSave === 'function') await onSave(newEv);
      await sendDiscordNotification(newEv);
      cancelForm();
    } finally {
      setSending(false);
    }
  }

  async function confirmDelete() {
    if (!delModal) return;
    if (typeof onDelete === 'function') await onDelete(delModal.id);
    if (expanded === delModal.id) setExpanded(null);
    setDelModal(null);
  }

  // ── Salvează direct în Firestore → onSnapshot face sync automat ──

  function handleReaction(ev, reactKey) {
    const cs = currentUser.faction;
    const alreadyReacted = (ev.reactions || []).find(r => r.callsign === cs && r.key === reactKey);
    let newReactions;
    if (alreadyReacted) {
      newReactions = ev.reactions.filter(r => !(r.callsign === cs && r.key === reactKey));
    } else {
      const filtered = (ev.reactions || []).filter(r => r.callsign !== cs);
      const opt = REACT_OPTS.find(o => o.key === reactKey);
      const note = `${currentUser.faction} ${currentUser.fullName} — ${currentUser.rank}: ${opt.label}`;
      newReactions = [...filtered, { callsign: cs, key: reactKey, note }];
    }
    setOne(COL.events, ev.id, { ...ev, reactions: newReactions });
  }

  function setDesfasurare(ev, val) {
    const log = [...(ev.statusLog || []), {
      field: 'desfasurare', val,
      by: `${currentUser.faction} ${currentUser.fullName} — ${currentUser.rank}`,
      at: new Date().toLocaleString('ro-RO'),
    }];
    setOne(COL.events, ev.id, { ...ev, desfasurare: val, statusLog: log });
  }

  function setFinanciar(ev, val) {
    const log = [...(ev.statusLog || []), {
      field: 'financiar', val,
      by: `${currentUser.faction} ${currentUser.fullName} — ${currentUser.rank}`,
      at: new Date().toLocaleString('ro-RO'),
    }];
    setOne(COL.events, ev.id, { ...ev, status: val, statusLog: log });
  }

  // ── events vine direct din useFirestore cu onSnapshot — mereu actualizat ──
  const sorted = [...(events || [])].sort((a, b) => Number(b.id) - Number(a.id));

  return (
    <>
      {delModal && <ConfirmModal title={delModal.type || delModal.id} onConfirm={confirmDelete} onCancel={() => setDelModal(null)} />}

      <div style={{ maxWidth: 780 }}>

        {canPost && (
          !showForm ? (
            <button className="btn-p" style={{ marginBottom: 20 }} onClick={() => setShowForm(true)}>
              + Postează Eveniment
            </button>
          ) : (
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="card-header">
                <span className="card-title">📋 Eveniment Nou</span>
              </div>
              <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 15 }}>
                {err && <div className="ferr">⚠️ {err}</div>}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="flabel">Data * (zz.ll.2026)</label>
                    <input className="finput" type="date" value={form.date}
                      onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={{ colorScheme: 'dark' }} />
                  </div>
                  <div>
                    <label className="flabel">Tipul Evenimentului *</label>
                    <input className="finput" placeholder="ex: Recrutare PR, Patrulare..."
                      value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="flabel">Organizator * (Nume Prenume)</label>
                    <input className="finput" placeholder="ex: Ion Popescu"
                      value={form.organizer} onChange={e => setForm(p => ({ ...p, organizer: e.target.value }))} />
                  </div>
                  <div>
                    <label className="flabel">Ora Evenimentului *</label>
                    <input className="finput" type="time" value={form.time}
                      onChange={e => setForm(p => ({ ...p, time: e.target.value }))} style={{ colorScheme: 'dark' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="flabel">Locația *</label>
                    <input className="finput" placeholder="ex: Spitalul Central..."
                      value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
                  </div>
                  <div>
                    <label className="flabel">Număr de Telefon *</label>
                    <input className="finput" placeholder="xxx-xxxx"
                      value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                </div>

                <div>
                  <label className="flabel">Tip Asistență Medicală *</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {ASSIST_OPTS.map((opt, i) => {
                      const sel = form.assist === opt.label;
                      return (
                        <div key={i} onClick={() => setForm(p => ({ ...p, assist: opt.label }))}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 12, cursor: 'pointer', border: `1px solid ${sel ? 'var(--p)' : 'var(--br)'}`, background: sel ? 'rgba(124,58,237,0.1)' : 'var(--b3)', transition: 'all .15s' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${sel ? 'var(--p)' : 'var(--br)'}`, background: sel ? 'var(--p)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {sel && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                            </div>
                            <span style={{ fontSize: 12, color: sel ? 'var(--t)' : 'var(--t2)', fontWeight: sel ? 600 : 400 }}>🏥 {opt.label}</span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 11, color: 'var(--p3)', fontWeight: 700 }}>{opt.base} truse</div>
                            <div style={{ fontSize: 10, color: 'var(--t3)' }}>{opt.extra}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 12, padding: '12px 16px' }}>
                  <div style={{ fontSize: 9, color: 'var(--t3)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Responsabil (din cont)</div>
                  <div style={{ fontSize: 12, color: 'var(--p3)', fontWeight: 600 }}>{currentUser.faction} {currentUser.fullName} — {currentUser.rank}</div>
                </div>

                <div>
                  <label className="flabel">Imagine banner (opțional, max 3MB)</label>
                  {!imgPreview ? (
                    <div onClick={() => fileRef.current?.click()}
                      style={{ border: '2px dashed var(--br)', borderRadius: 12, padding: '24px 20px', textAlign: 'center', cursor: 'pointer', background: 'var(--b3)', transition: 'all .2s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--p)'; e.currentTarget.style.background = 'rgba(124,58,237,0.05)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--br)'; e.currentTarget.style.background = 'var(--b3)'; }}>
                      <div style={{ fontSize: 26, marginBottom: 6 }}>🖼️</div>
                      <div style={{ fontSize: 11, color: 'var(--t3)' }}>Click pentru a selecta o imagine</div>
                      <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 3 }}>PNG, JPG, WEBP — max 3MB</div>
                    </div>
                  ) : (
                    <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--br)' }}>
                      <img src={imgPreview} alt="preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }} />
                      <button onClick={removeImg} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: 8, color: '#FCA5A5', padding: '5px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>✕ Elimină</button>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />
                </div>

                <div style={{ fontSize: 11, color: 'var(--t3)', background: 'rgba(88,101,242,0.08)', border: '1px solid rgba(88,101,242,0.2)', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>🔔</span>
                  La postare se trimite automat <strong style={{ color: '#7289DA' }}>@everyone</strong> pe Discord.
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn-save" onClick={submit} disabled={sending}
                    style={{ opacity: sending ? 0.7 : 1, cursor: sending ? 'not-allowed' : 'pointer' }}>
                    {sending ? '⏳ Se postează...' : '📋 Postează Eveniment'}
                  </button>
                  <button className="btn-cancel" onClick={cancelForm} disabled={sending}>Anulează</button>
                </div>
              </div>
            </div>
          )
        )}

        {!sorted.length ? (
          <div className="empty-st">
            <div className="empty-ico">📋</div>
            <p>Niciun eveniment postat</p>
          </div>
        ) : (
          sorted.map(ev => {
            const isExp   = expanded === ev.id;
            const myReact = (ev.reactions || []).find(r => r.callsign === currentUser.faction);
            const lastDesfLog = [...(ev.statusLog || [])].reverse().find(l => l.field === 'desfasurare');
            const lastFinLog  = [...(ev.statusLog || [])].reverse().find(l => l.field === 'financiar');

            return (
              <div key={ev.id} style={{ background: 'var(--b2)', border: `1px solid ${isExp ? 'var(--br2)' : 'var(--br)'}`, borderRadius: 18, marginBottom: 14, overflow: 'hidden', boxShadow: isExp ? '0 8px 32px rgba(124,58,237,0.12)' : 'none', transition: 'all .2s' }}>

                {ev.imageBase64 && (
                  <div style={{ width: '100%', height: 180, overflow: 'hidden' }}>
                    <img src={ev.imageBase64} alt={ev.type} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                )}

                <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer', gap: 10 }}
                  onClick={() => setExpanded(isExp ? null : ev.id)}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--t)' }}>📋 {ev.type}</span>
                      <StatusBadge label={ev.desfasurare === 'finalizat' ? 'Finalizat' : ev.desfasurare === 'in-desfasurare' ? 'În desfășurare' : 'În așteptare'} color={ev.desfasurare === 'finalizat' ? 'green' : ev.desfasurare === 'in-desfasurare' ? 'blue' : 'violet'} />
                      <StatusBadge label={ev.status === 'incasat' ? 'Încasat' : 'Neîncasat'} color={ev.status === 'incasat' ? 'green' : 'amber'} />
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: 'var(--p3)', fontWeight: 600 }}>📅 {fmt(ev.date)} · {ev.time}</span>
                      <span style={{ fontSize: 11, color: 'var(--t3)' }}>📍 {ev.location}</span>
                      <span style={{ fontSize: 11, color: 'var(--t3)' }}>👤 {ev.organizer}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {canPost && <button className="code-del" onClick={e => { e.stopPropagation(); setDelModal(ev); }}>✕</button>}
                    <span style={{ fontSize: 11, color: 'var(--t3)', display: 'inline-block', transform: isExp ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>▾</span>
                  </div>
                </div>

                {isExp && (
                  <div style={{ borderTop: '1px solid var(--br)', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                      {[
                        { ico: '📅', label: 'Data',          val: fmt(ev.date) },
                        { ico: '⏰', label: 'Ora',           val: ev.time },
                        { ico: '📍', label: 'Locație',       val: ev.location },
                        { ico: '👤', label: 'Organizator',   val: ev.organizer },
                        { ico: '🏥', label: 'Tip Asistență', val: ev.assist },
                        { ico: '📞', label: 'Telefon',       val: ev.phone },
                      ].map((row, i) => (
                        <div key={i} style={{ background: 'var(--b3)', borderRadius: 10, padding: '10px 14px', border: '1px solid var(--br)' }}>
                          <div style={{ fontSize: 9, color: 'var(--t3)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, marginBottom: 3 }}>{row.label}</div>
                          <div style={{ fontSize: 12, color: 'var(--t2)', fontWeight: 500 }}>{row.ico} {row.val}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.18)', borderRadius: 10, padding: '10px 14px' }}>
                      <div style={{ fontSize: 9, color: 'var(--t3)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, marginBottom: 3 }}>Responsabil</div>
                      <div style={{ fontSize: 12, color: 'var(--p3)', fontWeight: 600 }}>🎖️ {ev.responsabil}</div>
                      <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 2 }}>Postat: {ev.postedAt}</div>
                    </div>

                    {canPost && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ fontSize: 9, color: 'var(--t3)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700 }}>Management Status</div>
                        <div style={{ background: 'var(--b3)', border: '1px solid var(--br)', borderRadius: 12, padding: '12px 14px' }}>
                          <div style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 600, marginBottom: 8 }}>Desfășurare Eveniment</div>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {[
                              { val: 'in-asteptare', label: '🕐 În așteptare', color: 'rgba(167,139,250,0.15)', border: 'rgba(167,139,250,0.3)', text: '#a78bfa' },
                              { val: 'finalizat',    label: '✅ Finalizat',    color: 'rgba(34,197,94,0.15)',  border: 'rgba(34,197,94,0.3)',  text: '#4ade80' },
                            ].map(opt => (
                              <button key={opt.val} onClick={() => setDesfasurare(ev, opt.val)}
                                style={{ padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s', background: ev.desfasurare === opt.val ? opt.color : 'transparent', border: `1px solid ${ev.desfasurare === opt.val ? opt.border : 'var(--br)'}`, color: ev.desfasurare === opt.val ? opt.text : 'var(--t3)' }}>
                                {opt.label}
                              </button>
                            ))}
                          </div>
                          {lastDesfLog && <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 6 }}>Setat de <span style={{ color: 'var(--t2)' }}>{lastDesfLog.by}</span> · {lastDesfLog.at}</div>}
                        </div>
                        <div style={{ background: 'var(--b3)', border: '1px solid var(--br)', borderRadius: 12, padding: '12px 14px' }}>
                          <div style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 600, marginBottom: 8 }}>Status Financiar</div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            {[
                              { val: 'neincasat', label: '💰 Neîncasat', color: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.3)', text: '#fbbf24' },
                              { val: 'incasat',   label: '✅ Încasat',   color: 'rgba(34,197,94,0.15)',  border: 'rgba(34,197,94,0.3)',  text: '#4ade80' },
                            ].map(opt => (
                              <button key={opt.val} onClick={() => setFinanciar(ev, opt.val)}
                                style={{ padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s', background: ev.status === opt.val ? opt.color : 'transparent', border: `1px solid ${ev.status === opt.val ? opt.border : 'var(--br)'}`, color: ev.status === opt.val ? opt.text : 'var(--t3)' }}>
                                {opt.label}
                              </button>
                            ))}
                          </div>
                          {lastFinLog && <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 6 }}>Setat de <span style={{ color: 'var(--t2)' }}>{lastFinLog.by}</span> · {lastFinLog.at}</div>}
                        </div>
                      </div>
                    )}

                    <div>
                      <div style={{ fontSize: 9, color: 'var(--t3)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>Prezență Membri</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {REACT_OPTS.map(opt => {
                          const count  = (ev.reactions || []).filter(r => r.key === opt.key).length;
                          const isMine = myReact?.key === opt.key;
                          return (
                            <button key={opt.key} onClick={() => handleReaction(ev, opt.key)} title={opt.label}
                              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: isMine ? 700 : 500, transition: 'all .15s', background: isMine ? 'rgba(124,58,237,0.18)' : 'var(--b3)', border: `1px solid ${isMine ? 'var(--p)' : 'var(--br)'}`, color: isMine ? 'var(--p3)' : 'var(--t2)' }}>
                              <span style={{ fontSize: 15 }}>{opt.emoji}</span>
                              <span>{count > 0 ? count : ''}</span>
                            </button>
                          );
                        })}
                      </div>
                      {(ev.reactions || []).length > 0 && (
                        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 5 }}>
                          {ev.reactions.map((r, i) => {
                            const opt = REACT_OPTS.find(o => o.key === r.key);
                            return (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--b3)', border: '1px solid var(--br)', borderRadius: 8, padding: '7px 12px', fontSize: 11, color: 'var(--t2)' }}>
                                <span style={{ fontSize: 14 }}>{opt?.emoji}</span>
                                <span style={{ color: 'var(--t3)', fontStyle: 'italic' }}>{r.note}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
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