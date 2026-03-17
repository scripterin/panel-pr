import React from 'react';

export default function AnnPopup({ announcements, onClose }) {
  return (
    <div className="ann-popup-ov">
      <div className="ann-popup">
        <div className="ann-popup-header">
          <div style={{ fontSize: 30, marginBottom: 8 }}>📢</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--t)', letterSpacing: '-.3px' }}>Anunțuri Noi</div>
          <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 4 }}>Citește anunțurile înainte de a continua</div>
        </div>
        <div className="ann-popup-body">
          {announcements.map((a, i) => (
            <div key={i} className={`ann-popup-item${a.pinned ? ' pinned' : ''}`}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t)', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 8 }}>
                {a.pinned ? '📌' : '📣'} {a.title}
              </div>
              <div style={{ fontSize: 11, color: 'var(--t2)', lineHeight: 1.7 }}>{a.body}</div>
              <div style={{ fontSize: 9, color: 'var(--t3)', marginTop: 8, letterSpacing: '.3px' }}>
                DE LA {a.author.toUpperCase()} · {a.date}
              </div>
            </div>
          ))}
        </div>
        <div className="ann-popup-footer">
          <button className="btn-p" onClick={onClose} style={{ padding: '10px 32px', fontSize: 13 }}>
            Am citit, continuă →
          </button>
        </div>
      </div>
    </div>
  );
}
