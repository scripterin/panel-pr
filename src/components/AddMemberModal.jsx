import React, { useState } from 'react';

export default function AddMemberModal({ onClose, onSave, editData }) {
  const [form, setForm] = useState(
    editData || { name: '', rank: 'Membru PR', status: 'activ', discord: '', notes: '' }
  );
  const [err, setErr] = useState('');

  function save() {
    if (!form.name.trim()) { setErr('Completează numele!'); return; }
    onSave(form);
    onClose();
  }

  return (
    <div className="modal-ov" onClick={e => e.target.className === 'modal-ov' && onClose()}>
      <div className="modal">
        <div className="mh">
          <span className="mh-title">👤 {editData ? 'Editează Membrul' : 'Adaugă Membru Nou'}</span>
          <button className="mclose" onClick={onClose}>✕</button>
        </div>
        <div className="mb">
          {err && <div className="ferr">⚠️ {err}</div>}
          <label className="flabel">Nume</label>
          <input className="finput" placeholder="Nume personaj / real" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          <div className="frow" style={{ marginBottom: 0 }}>
            <div>
              <label className="flabel">Grad</label>
              <select className="finput" value={form.rank} onChange={e => setForm(p => ({ ...p, rank: e.target.value }))}>
                <option value="Sef PR">Șef PR</option>
                <option value="Adjunct PR">Adjunct PR</option>
                <option value="Membru PR">Membru PR</option>
              </select>
            </div>
            <div>
              <label className="flabel">Status</label>
              <select className="finput" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                <option value="activ">Activ</option>
                <option value="inactiv">Inactiv</option>
                <option value="concediu">Concediu</option>
              </select>
            </div>
          </div>
          <label className="flabel" style={{ marginTop: 14 }}>Discord ID</label>
          <input className="finput" placeholder="123456789012345678" value={form.discord} onChange={e => setForm(p => ({ ...p, discord: e.target.value }))} />
          <label className="flabel">Notițe</label>
          <textarea className="finput" rows="3" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} style={{ resize: 'none', marginBottom: 0 }} />
        </div>
        <div className="mf">
          <button className="btn-cancel" onClick={onClose}>Anulează</button>
          <button className="btn-save" onClick={save}>Salvează</button>
        </div>
      </div>
    </div>
  );
}
