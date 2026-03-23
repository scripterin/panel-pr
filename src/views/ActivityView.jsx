import React, { useState } from 'react';
import { todayRo } from '../utils/helpers';
import LogModal from '../components/LogModal';

export default function ActivityView({ members, activities, isAdj, onAddActivity }) {
  const [logModal, setLogModal] = useState(false);

  async function saveLog(f) {
    const mid = String(f.memberId);
    const m   = members.find(x => String(x.id) === mid);
    if (!m) return;
    await onAddActivity({
      memberId: m.id,
      member:   m.name,
      desc:     f.desc,
      date:     todayRo(),
    });
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
            <thead><tr><th>Data</th><th>Membru</th><th>Detalii Eveniment</th></tr></thead>
            <tbody>
              {[...activities].reverse().map((a, i) => (
                <tr key={i} style={{ cursor: 'default' }}>
                  <td style={{ color: 'var(--t3)', fontSize: 10, whiteSpace: 'nowrap', width: 90 }}>{a.date}</td>
                  <td className="nm" style={{ cursor: 'default' }}>{a.member}</td>
                  <td style={{ color: 'var(--t2)' }}>{a.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isAdj && (
        <div style={{ marginTop: 14 }}>
          <button className="btn-p" onClick={() => setLogModal(true)}>+ Adaugă Eveniment PR</button>
        </div>
      )}

      {logModal && <LogModal members={members.filter(m => !['Supervizor PR', 'Conducere Spital'].includes(m.rank))} onClose={() => setLogModal(false)} onSave={saveLog} />}
    </div>
  );
}