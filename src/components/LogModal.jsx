import React, { useState } from 'react';

export default function LogModal({ members, onClose, onSave }) {
  const [form, setForm] = useState({ memberId: '', desc: '' });
  const [err, setErr] = useState('');

  function save() {
    if (!form.memberId || !form.desc.trim()) {
      setErr('Selectează membrul și completează detaliile!');
      return;
    }
    onSave(form);
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
          <label className="flabel">Detalii Eveniment PR</label>
          <textarea
            className="finput" rows="4"
            placeholder="Descrie evenimentul PR..."
            value={form.desc}
            onChange={e => setForm(p => ({ ...p, desc: e.target.value }))}
            style={{ resize: 'none', marginBottom: 0 }}
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
