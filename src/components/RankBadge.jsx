import React from 'react';

function IconStar() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  );
}

function IconCrown() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M5 16L3 6l5.5 4L12 4l3.5 6L21 6l-2 10H5zm2 2h10v2H7v-2z"/>
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M12 2L4 5v6c0 5.25 3.4 10.15 8 11.35C16.6 21.15 20 16.25 20 11V5l-8-3z"/>
    </svg>
  );
}

function IconMember() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  );
}

function IconHospital() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-7 14H8v-2h4v2zm0-4H8v-2h4v2zm4-4h-2v2h2v2h-2v2h-2v-2h-2v-2h2v-2H8V7h4V5h2v2h4v2z"/>
    </svg>
  );
}

export default function RankBadge({ rank }) {
  if (rank === 'Supervizor PR') return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700, letterSpacing: '.3px', whiteSpace: 'nowrap', background: 'rgba(250,204,21,0.15)', color: '#FDE047', border: '1px solid rgba(250,204,21,0.35)' }}>
      <IconStar /> Supervizor PR
    </span>
  );
  if (rank === 'Conducere Spital') return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700, letterSpacing: '.3px', whiteSpace: 'nowrap', background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.35)' }}>
      <IconHospital /> Conducere Spital
    </span>
  );
  if (rank === 'Sef PR') return (
    <span className="rb rb-sef" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <IconCrown /> Șef PR
    </span>
  );
  if (rank === 'Adjunct PR') return (
    <span className="rb rb-adj" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <IconShield /> Adjunct PR
    </span>
  );
  return (
    <span className="rb rb-mem" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <IconMember /> Membru PR
    </span>
  );
}