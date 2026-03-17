import React from 'react';
import RankBadge from '../components/RankBadge';

export default function PromotionsView({ promotions }) {
  const all = [...promotions].reverse();

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">📈 Istoric Promovări & Schimbări Grad</span>
          <span style={{ fontSize: 10, color: 'var(--t3)' }}>{promotions.length} înregistrări</span>
        </div>
        {!all.length ? (
          <div className="empty-st">
            <div className="empty-ico">📈</div>
            <p>Nicio schimbare de grad înregistrată</p>
            <small>Schimbările de grad apar automat când editezi un membru</small>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Membru</th>
                <th>De la</th>
                <th>La</th>
              </tr>
            </thead>
            <tbody>
              {all.map((p, i) => (
                <tr key={i} style={{ cursor: 'default' }}>
                  <td style={{ color: 'var(--t3)', fontSize: 10, whiteSpace: 'nowrap', width: 90 }}>{p.date}</td>
                  <td className="nm" style={{ cursor: 'default' }}>{p.memberName}</td>
                  <td><RankBadge rank={p.fromRank} /></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: 'var(--p3)', fontWeight: 700 }}>→</span>
                      <RankBadge rank={p.toRank} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
