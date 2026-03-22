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

function IconAsp() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10"/>
    </svg>
  );
}

export default function RankBadge({ rank }) {
  if (rank === 'Supervizor PR') return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700, letterSpacing: '.3px', whiteSpace: 'nowrap', background: 'rgba(250,204,21,0.15)', color: '#FDE047', border: '1px solid rgba(250,204,21,0.35)' }}>
      <IconStar /> Supervizor PR
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
  if (rank === 'Aspirant PR') return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700, letterSpacing: '.3px', whiteSpace: 'nowrap', background: 'rgba(100,116,139,0.15)', color: '#94A3B8', border: '1px solid rgba(100,116,139,0.30)' }}>
      <IconAsp /> Aspirant PR
    </span>
  );
  return (
    <span className="rb rb-mem" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <IconMember /> Membru PR
    </span>
  );
}