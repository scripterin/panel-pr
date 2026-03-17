import React from 'react';

const RANKS = [
  {
    icon: '👑',
    title: 'Șef PR',
    color: 'var(--p3)',
    desc: 'Gradul cel mai înalt. Responsabil de toate deciziile, recrutările și direcția departamentului.',
    priv: 'Acces complet, gestionare coduri acces, aprobare și ștergere membri, publicare anunțuri, adăugare avertismente, acces raport săptămânal.',
  },
  {
    icon: '⚡',
    title: 'Adjunct PR',
    color: '#93C5FD',
    desc: 'Asistă Șeful PR și preia conducerea în absența acestuia.',
    priv: 'Editare membri, adăugare evenimente PR, adăugare avertismente, vizualizare raport, acces rapoarte.',
  },
  {
    icon: '●',
    title: 'Membru PR',
    color: '#6EE7B7',
    desc: 'Membrul de bază al departamentului. Participă la evenimentele PR.',
    priv: 'Vizualizare dashboard, profil propriu, jurnal activitate, anunțuri.',
  },
];

export default function RanksView() {
  return (
    <div style={{ maxWidth: 700 }}>
      {RANKS.map((r, i) => (
        <div key={i} className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <span className="card-title" style={{ color: r.color }}>{r.icon} {r.title}</span>
          </div>
          <div style={{ padding: '18px 20px' }}>
            <p style={{ fontWeight: 600, marginBottom: 8, fontSize: 13, color: 'var(--t)' }}>{r.desc}</p>
            <p style={{ color: 'var(--t2)', lineHeight: 1.8, fontSize: 12 }}>
              <strong style={{ color: r.color }}>Privilegii:</strong> {r.priv}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
