import React, { useState } from 'react';

export default function ActivityView({ members, activities, isAdj, onAddActivity }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ memberId: '', date: '' });

  async function saveLog() {
    const mid = String(form.memberId);
    const m = members.find(x => String(x.id) === mid);
    if (!m || !form.date) return;

    const [y, mo, d] = form.date.split('-');
    const dateRo = `${d}.${mo}.${y}`;

    await onAddActivity({
      memberId: m.id,
      member:   m.name,
      date:     dateRo,
    });
    setModal(false);
    setForm({ memberId: '', date: '' });
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">📋 Jurnal Evenimente PR</span>
          <span style={{ fontSize: 10, color: 'var(--t3)' }}>{activities.length} înregistrări</span>
        </div>
        {!activities.length ? (
          <div className="empty-st"><div className="empty-ico">📋</div><p>Niciun eveniment PR înregistrat</p></div>
        ) : (
          <table>
            <thead><tr><th>Data</th><th>Membru</th></tr></thead>
            <tbody>
              {[...activities].reverse().map((a, i) => (
                <tr key={i} style={{ cursor: 'default' }}>
                  <td style={{ color: 'var(--t3)', fontSize: 10, whiteSpace: 'nowrap', width: 90 }}>{a.date}</td>
                  <td className="nm" style={{ cursor: 'default' }}>{a.member}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isAdj && (
        <div style={{ marginTop: 14 }}>
          <button className="btn-p" onClick={() => setModal(true)}>+ Adaugă Eveniment PR</button>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Adaugă Eveniment PR</span>
              <button className="close-btn" onClick={() => setModal(false)}>×</button>
            </div>
<div className="modal-body">
  <label style={{ display: 'block', marginBottom: 4 }}>Membru</label>
  <select value={form.memberId} onChange={e => setForm(f => ({ ...f, memberId: e.target.value }))}>
    <option value="">— selectează —</option>
    {members
      .filter(m => !['Supervizor PR', 'Conducere Spital'].includes(m.rank))
      .map(m => <option key={m.id} value={m.id}>{m.name}</option>)
    }
  </select>
  <label style={{ display: 'block', margin: '12px 0 4px' }}>Data evenimentului</label>
  <input
    type="date"
    value={form.date}
    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
  />
</div>
            <div className="modal-footer">
              <button className="btn-s" onClick={() => setModal(false)}>Anulează</button>
              <button className="btn-p" onClick={saveLog} disabled={!form.memberId || !form.date}>Salvează</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}