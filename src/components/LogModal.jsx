import React, { useState } from 'react';

export default function LogModal({ members, onClose, onSave }) {
  const [form, setForm] = useState({ memberId: '', date: '' });
  const [err, setErr] = useState('');

  function save() {
    if (!form.memberId || !form.date) {
      setErr('Selectează membrul și completează data!');
      return;
    }
    const [y, mo, d] = form.date.split('-');
    onSave({ memberId: form.memberId, date: `${d}.${mo}.${y}` });
    onClose();
  }

  return (
    <div className="modal-ov" onClick={e => e.target.className === 'modal-ov' && onClose()}>
      <div className="modal">
        <div className="mh">
          <span className="mh-title">📋 Adaugă Eveniment PR</span>
          <button className="mclose" onClick={onClose}>✕</button>
        </div>
        <div className="mb">
          {err && <div className="ferr">⚠️ {err}</div>}
          <label className="flabel">Membru</label>
          <select className="finput" value={form.memberId} onChange={e => setForm(p => ({ ...p, memberId: e.target.value }))}>
            <option value="">— Selectează Membru —</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <label className="flabel">Data Evenimentului</label>
          <input
            type="date"
            className="finput"
            value={form.date}
            onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
          />
        </div>
        <div className="mf">
          <button className="btn-cancel" onClick={onClose}>Anulează</button>
          <button className="btn-save" onClick={save}>Adaugă</button>
        </div>
      </div>
    </div>
  );
}