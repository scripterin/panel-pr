import React, { useState, useEffect } from 'react';
import RankBadge  from '../components/RankBadge';
import StatusPill from '../components/StatusPill';
import { getWeekStart, inDateRange } from '../utils/helpers';
import { db } from '../utils/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

/* ─── CSS injected once ─── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

  :root {
    --surface:          #131318;
    --surface-low:      #0E0E13;
    --surface-high:     #1E1D24;
    --surface-higher:   #2A292F;
    --primary:          #D2BBFF;
    --primary-mid:      #A78BFA;
    --primary-deep:     #7C3AED;
    --primary-deeper:   #6D28D9;
    --on-surface:       #F1F0FF;
    --on-surface-var:   #9B99B8;
    --ghost-border:     rgba(255,255,255,0.07);
    --violet-glow:      rgba(124,58,237,0.08);
    --shadow-ambient:   0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(124,58,237,0.05);
  }

  .db-root * { box-sizing: border-box; margin: 0; padding: 0; }
  .db-root {
    font-family: 'Space Grotesk', sans-serif;
    color: var(--on-surface);
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  /* ── Alert Banner ── */
  .db-alert {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 16px 20px;
    background: rgba(124,58,237,0.06);
    border-radius: 14px;
    border-left: 3px solid var(--primary-deep);
    border-top: 1px solid rgba(124,58,237,0.15);
    border-right: 1px solid var(--ghost-border);
    border-bottom: 1px solid var(--ghost-border);
  }
  .db-alert-icon {
    color: var(--primary-mid);
    flex-shrink: 0;
    margin-top: 2px;
  }
  .db-alert-title {
    font-size: 13px;
    font-weight: 700;
    color: var(--primary-mid);
    letter-spacing: -0.2px;
  }
  .db-alert-body {
    font-size: 11px;
    color: var(--on-surface-var);
    margin-top: 3px;
    line-height: 1.5;
  }

  /* ── Stats Grid ── */
  .db-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }
  @media (max-width: 900px) { .db-stats { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 500px) { .db-stats { grid-template-columns: 1fr; } }

  .db-stat {
    background: var(--surface-high);
    border-radius: 16px;
    padding: 20px 20px 18px;
    position: relative;
    overflow: hidden;
    border: 1px solid var(--ghost-border);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .db-stat:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-ambient);
  }
  .db-stat::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--stat-glow, transparent);
    opacity: 0;
    transition: opacity 0.3s;
    border-radius: 16px;
  }
  .db-stat:hover::before { opacity: 1; }

  .db-stat-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    flex-shrink: 0;
  }
  .db-stat-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: var(--on-surface-var);
    margin-bottom: 6px;
    font-family: 'JetBrains Mono', monospace;
  }
  .db-stat-val {
    font-size: 2.8rem;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -2px;
    color: var(--on-surface);
  }

  /* stat color variants */
  .db-stat-p  { --stat-glow: radial-gradient(circle at 0% 0%, rgba(124,58,237,0.1) 0%, transparent 60%); }
  .db-stat-p  .db-stat-icon { background: rgba(124,58,237,0.12); color: var(--primary-mid); }
  .db-stat-p  .db-stat-val  { background: linear-gradient(135deg, #fff, var(--primary-mid)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

  .db-stat-g  { --stat-glow: radial-gradient(circle at 0% 0%, rgba(16,185,129,0.08) 0%, transparent 60%); }
  .db-stat-g  .db-stat-icon { background: rgba(16,185,129,0.1); color: #6EE7B7; }
  .db-stat-g  .db-stat-val  { background: linear-gradient(135deg, #fff, #6EE7B7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

  .db-stat-b  { --stat-glow: radial-gradient(circle at 0% 0%, rgba(59,130,246,0.08) 0%, transparent 60%); }
  .db-stat-b  .db-stat-icon { background: rgba(59,130,246,0.1); color: #93C5FD; }
  .db-stat-b  .db-stat-val  { background: linear-gradient(135deg, #fff, #93C5FD); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

  .db-stat-a  { --stat-glow: radial-gradient(circle at 0% 0%, rgba(245,158,11,0.08) 0%, transparent 60%); }
  .db-stat-a  .db-stat-icon { background: rgba(245,158,11,0.1); color: #FDE047; }
  .db-stat-a  .db-stat-val  { background: linear-gradient(135deg, #fff, #FDE047); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

  /* ── Cards ── */
  .db-card {
    background: var(--surface-high);
    border-radius: 18px;
    border: 1px solid var(--ghost-border);
    overflow: hidden;
  }
  .db-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 22px 14px;
    border-bottom: 1px solid var(--ghost-border);
  }
  .db-card-title {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--on-surface-var);
    display: flex;
    align-items: center;
    gap: 7px;
    font-family: 'JetBrains Mono', monospace;
  }
  .db-card-title-icon { color: var(--primary-mid); display: flex; }
  .db-card-action {
    font-size: 11px;
    font-weight: 600;
    color: var(--primary-mid);
    cursor: pointer;
    letter-spacing: 0.2px;
    opacity: 0.75;
    transition: opacity 0.2s;
  }
  .db-card-action:hover { opacity: 1; }

  /* ── Two-Column Layouts ── */
  .db-two-col {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 12px;
  }
  .db-two-eq {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  @media (max-width: 800px) { .db-two-col, .db-two-eq { grid-template-columns: 1fr; } }

  /* ── Table ── */
  .db-table { width: 100%; border-collapse: collapse; }
  .db-table thead tr th {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: var(--on-surface-var);
    padding: 10px 22px;
    text-align: left;
    opacity: 0.6;
  }
  .db-table tbody tr {
    transition: background 0.15s;
  }
  .db-table tbody tr:hover { background: rgba(255,255,255,0.025); }
  .db-table tbody td {
    padding: 11px 22px;
    font-size: 12.5px;
    color: var(--on-surface);
    border-top: 1px solid var(--ghost-border);
  }
  .db-table .td-name {
    font-weight: 600;
    font-size: 13px;
  }
  .db-table .td-val {
    color: var(--primary-mid);
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
  }
  .db-table .td-medal {
    font-weight: 700;
    font-size: 14px;
    width: 36px;
  }

  /* ── Empty State ── */
  .db-empty {
    padding: 40px 24px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .db-empty-icon {
    font-size: 28px;
    opacity: 0.3;
    margin-bottom: 6px;
    color: var(--on-surface-var);
    display: flex;
    justify-content: center;
  }
  .db-empty p {
    font-size: 13px;
    font-weight: 600;
    color: var(--on-surface-var);
  }
  .db-empty small {
    font-size: 11px;
    color: var(--on-surface-var);
    opacity: 0.5;
  }

  /* ── Announcements Feed ── */
  .db-ann-item {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    padding: 14px 22px;
    transition: background 0.15s;
    border-top: 1px solid var(--ghost-border);
  }
  .db-ann-item:first-child { border-top: none; }
  .db-ann-item:hover { background: rgba(255,255,255,0.02); }
  .db-ann-icon {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    background: rgba(124,58,237,0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary-mid);
    flex-shrink: 0;
    margin-top: 1px;
  }
  .db-ann-title {
    font-size: 12.5px;
    font-weight: 700;
    color: var(--on-surface);
    margin-bottom: 3px;
  }
  .db-ann-body {
    font-size: 11px;
    color: var(--on-surface-var);
    line-height: 1.5;
  }
  .db-ann-date {
    font-size: 9px;
    color: var(--on-surface-var);
    font-family: 'JetBrains Mono', monospace;
    margin-top: 5px;
    opacity: 0.5;
    letter-spacing: 0.4px;
  }

  /* ── Progress Bars ── */
  .db-prog-section { padding: 16px 22px; display: flex; flex-direction: column; gap: 14px; }
  .db-prog-item {}
  .db-prog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 7px;
  }
  .db-prog-name {
    font-size: 11.5px;
    font-weight: 600;
    color: var(--on-surface);
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .db-prog-val {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    color: var(--on-surface-var);
  }
  .db-prog-track {
    height: 4px;
    background: rgba(255,255,255,0.05);
    border-radius: 99px;
    overflow: hidden;
  }
  .db-prog-fill {
    height: 100%;
    border-radius: 99px;
    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* ── System Updates ── */
  .db-updates-list { padding: 14px 20px; display: flex; flex-direction: column; gap: 8px; }
  .db-update-item {
    display: flex;
    gap: 14px;
    align-items: flex-start;
    padding: 14px 16px;
    background: var(--surface-low);
    border-radius: 12px;
    border: 1px solid var(--ghost-border);
    position: relative;
    transition: border-color 0.2s;
  }
  .db-update-item:hover { border-color: rgba(124,58,237,0.15); }
  .db-update-left {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    padding-top: 1px;
    flex-shrink: 0;
  }
  .db-update-tag {
    display: inline-flex;
    align-items: center;
    padding: 3px 9px;
    border-radius: 7px;
    font-size: 9.5px;
    font-weight: 700;
    white-space: nowrap;
    letter-spacing: 0.3px;
    font-family: 'JetBrains Mono', monospace;
  }
  .db-update-version {
    font-size: 9px;
    color: var(--on-surface-var);
    font-family: 'JetBrains Mono', monospace;
    font-weight: 600;
    letter-spacing: 0.5px;
    opacity: 0.5;
  }
  .db-update-title {
    font-size: 13px;
    font-weight: 700;
    color: var(--on-surface);
    margin-bottom: 4px;
    letter-spacing: -0.2px;
  }
  .db-update-desc {
    font-size: 11.5px;
    color: var(--on-surface-var);
    line-height: 1.6;
  }
  .db-update-meta {
    font-size: 9.5px;
    color: var(--on-surface-var);
    margin-top: 7px;
    display: flex;
    gap: 12px;
    font-family: 'JetBrains Mono', monospace;
    opacity: 0.45;
  }
  .db-update-stripe {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    border-radius: 12px 0 0 12px;
  }

  /* ── Add Update Button ── */
  .db-add-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 9px;
    background: rgba(124,58,237,0.08);
    border: 1px solid rgba(124,58,237,0.2);
    color: var(--primary-mid);
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    font-family: 'Space Grotesk', sans-serif;
    letter-spacing: 0.3px;
    transition: all 0.2s;
  }
  .db-add-btn:hover {
    background: rgba(124,58,237,0.16);
    border-color: rgba(124,58,237,0.35);
  }

  /* ── Delete Button ── */
  .db-del-btn {
    background: rgba(239,68,68,0.07);
    border: 1px solid rgba(239,68,68,0.15);
    color: #FCA5A5;
    border-radius: 8px;
    padding: 6px 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    flex-shrink: 0;
  }
  .db-del-btn:hover {
    background: rgba(239,68,68,0.18);
    border-color: rgba(239,68,68,0.35);
  }

  /* ── Modal ── */
  .db-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 2000;
    background: rgba(0,0,0,0.75);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: overlayIn 0.2s ease;
  }
  .db-modal {
    background: rgba(26, 26, 36, 0.92);
    backdrop-filter: blur(24px);
    border: 1px solid rgba(124,58,237,0.2);
    border-radius: 22px;
    padding: 28px;
    width: 480px;
    max-width: 95vw;
    box-shadow: 0 40px 80px rgba(0,0,0,0.7), 0 0 40px rgba(124,58,237,0.07);
    animation: modalIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .db-modal-head {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 24px;
  }
  .db-modal-head-icon {
    width: 46px;
    height: 46px;
    border-radius: 13px;
    background: rgba(124,58,237,0.1);
    border: 1px solid rgba(124,58,237,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary-mid);
    flex-shrink: 0;
  }
  .db-modal-head-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--on-surface);
    letter-spacing: -0.3px;
  }
  .db-modal-head-sub {
    font-size: 11px;
    color: var(--on-surface-var);
    margin-top: 3px;
  }
  .db-modal-error {
    background: rgba(239,68,68,0.07);
    border: 1px solid rgba(239,68,68,0.25);
    border-radius: 9px;
    padding: 9px 13px;
    font-size: 11px;
    color: #FCA5A5;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 7px;
  }
  .db-modal-fields { display: flex; flex-direction: column; gap: 14px; }
  .db-field-label {
    display: block;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9.5px;
    font-weight: 600;
    letter-spacing: 0.7px;
    text-transform: uppercase;
    color: var(--on-surface-var);
    margin-bottom: 7px;
  }
  .db-input {
    width: 100%;
    background: #1A1A24;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 11px;
    padding: 10px 14px;
    font-size: 12.5px;
    color: var(--on-surface);
    font-family: 'Space Grotesk', sans-serif;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .db-input::placeholder { color: rgba(155,153,184,0.4); }
  .db-input:focus {
    border-color: rgba(124,58,237,0.4);
    box-shadow: 0 0 0 4px rgba(124,58,237,0.1);
  }
  .db-modal-actions { display: flex; gap: 10px; margin-top: 22px; }
  .db-btn-cancel {
    flex: 1;
    padding: 11px;
    border-radius: 12px;
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--ghost-border);
    color: var(--on-surface-var);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'Space Grotesk', sans-serif;
    transition: all 0.2s;
  }
  .db-btn-cancel:hover { background: rgba(255,255,255,0.07); }
  .db-btn-save {
    flex: 1;
    padding: 11px;
    border-radius: 12px;
    background: linear-gradient(135deg, #7C3AED, #6D28D9);
    border: 1px solid rgba(124,58,237,0.4);
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    font-family: 'Space Grotesk', sans-serif;
    box-shadow: 0 6px 24px rgba(124,58,237,0.35);
    transition: opacity 0.2s, transform 0.15s;
  }
  .db-btn-save:hover { opacity: 0.9; transform: translateY(-1px); }
  .db-btn-save:active { transform: translateY(0); }

  @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.92) translateY(12px); }
    to   { opacity: 1; transform: scale(1)    translateY(0); }
  }
`;

/* ─── Tag Config ─── */
const TAG_CONFIG = {
  'Nou':          { color: '#10B981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.25)'  },
  'Îmbunătățit':  { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)'  },
  'Fix':          { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)'  },
  'Eliminat':     { color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.25)'   },
  'Anunț':        { color: '#A78BFA', bg: 'rgba(124,58,237,0.12)', border: 'rgba(124,58,237,0.25)'  },
};

/* ─── Icons ─── */
const Icons = {
  users:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  check:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
  star:      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  calendar:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  megaphone: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>,
  pin:       <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17z"/></svg>,
  chart:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  trophy:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-2"/><rect x="6" y="18" width="12" height="4"/></svg>,
  crown:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 20h20M5 20V8l7-5 7 5v12"/></svg>,
  zap:       <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  circle:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>,
  user:      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  edit:      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  plus:      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  trash:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
};

/* ─── Modal ─── */
function AddUpdateModal({ currentUser, onClose, onSave }) {
  const [title,   setTitle]   = useState('');
  const [desc,    setDesc]    = useState('');
  const [tag,     setTag]     = useState('Nou');
  const [version, setVersion] = useState('');
  const [err,     setErr]     = useState('');

  async function save() {
    if (!title.trim()) { setErr('Titlul este obligatoriu!'); return; }
    if (!desc.trim())  { setErr('Descrierea este obligatorie!'); return; }
    await onSave({ title: title.trim(), desc: desc.trim(), tag, version: version.trim(), autor: currentUser.fullName || currentUser.name });
    onClose();
  }

  return (
    <div className="db-modal-overlay">
      <div className="db-modal">
        <div className="db-modal-head">
          <div className="db-modal-head-icon">{Icons.plus}</div>
          <div>
            <div className="db-modal-head-title">Adaugă Actualizare</div>
            <div className="db-modal-head-sub">Completează detaliile noii actualizări</div>
          </div>
        </div>

        {err && (
          <div className="db-modal-error">
            <span>⚠️</span> {err}
          </div>
        )}

        <div className="db-modal-fields">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px', gap: 10 }}>
            <div>
              <label className="db-field-label">Titlu *</label>
              <input
                className="db-input"
                placeholder="ex: Sistem Sancțiuni"
                value={title}
                onChange={e => { setTitle(e.target.value); setErr(''); }}
              />
            </div>
            <div>
              <label className="db-field-label">Versiune</label>
              <input
                className="db-input"
                placeholder="v1.2"
                value={version}
                onChange={e => setVersion(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="db-field-label">Tip</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {Object.entries(TAG_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setTag(key)}
                  style={{
                    padding: '5px 13px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: 10.5,
                    fontWeight: 700,
                    fontFamily: 'Space Grotesk, sans-serif',
                    letterSpacing: '0.3px',
                    transition: 'all .15s',
                    background: tag === key ? cfg.bg : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${tag === key ? cfg.border : 'rgba(255,255,255,0.07)'}`,
                    color: tag === key ? cfg.color : 'var(--on-surface-var)',
                  }}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="db-field-label">Descriere *</label>
            <textarea
              rows={3}
              className="db-input"
              style={{ resize: 'vertical', minHeight: 84, lineHeight: 1.65 }}
              placeholder="Descrie ce s-a schimbat..."
              value={desc}
              onChange={e => { setDesc(e.target.value); setErr(''); }}
            />
          </div>
        </div>

        <div className="db-modal-actions">
          <button className="db-btn-cancel" onClick={onClose}>Anulează</button>
          <button className="db-btn-save"   onClick={save}>✅ Publică Actualizarea</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Dashboard ─── */
export default function Dashboard({ members, activities, announcements, warnings, setView, setSelMember, currentUser, isSef }) {
  const total = members.length;
  const activ = members.filter(m => m.status === 'activ').length;
  const sup   = members.filter(m => m.rank === 'Supervizor PR').length;
  const cond  = members.filter(m => m.rank === 'Conducere Spital').length;
  const sef   = members.filter(m => m.rank === 'Sef PR').length;
  const adj   = members.filter(m => m.rank === 'Adjunct PR').length;
  const mem   = members.filter(m => m.rank === 'Membru PR').length;
  const maxB  = Math.max(1, total);

  const EXCLUDED_RANKS = ['Supervizor PR', 'Conducere Spital'];
  const top    = [...members].filter(m => !EXCLUDED_RANKS.includes(m.rank)).sort((a, b) => b.activities - a.activities).slice(0, 5);
  const medals = ['🥇', '🥈', '🥉', '4.', '5.'];
  const pinned = announcements.filter(a => a.pinned);

  const weekStart = getWeekStart();
  const weekEnd   = new Date(weekStart.getTime() + 7 * 86400000);
  const weekActs  = activities.filter(a => inDateRange(a.date, weekStart, weekEnd));

  const [updates,  setUpdates]  = useState([]);
  const [addModal, setAddModal] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'updates'), snap => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setUpdates(docs);
    });
    return unsub;
  }, []);

  async function handleAdd(data) {
    try { await addDoc(collection(db, 'updates'), { ...data, date: new Date().toLocaleDateString('ro-RO'), createdAt: serverTimestamp() }); }
    catch(e) { console.error(e); }
  }

  async function handleDelete(id) {
    try { await deleteDoc(doc(db, 'updates', id)); }
    catch(e) { console.error(e); }
  }

  const pct = v => Math.round(v / maxB * 100) + '%';

  return (
    <div className="db-root">
      <style>{STYLES}</style>

      {addModal && <AddUpdateModal currentUser={currentUser} onClose={() => setAddModal(false)} onSave={handleAdd} />}

      {/* ── Alert Banner ── */}
      {pinned.length > 0 && (
        <div className="db-alert">
          <span className="db-alert-icon">{Icons.megaphone}</span>
          <div>
            <div className="db-alert-title">{pinned[0].title}</div>
            <div className="db-alert-body">{pinned[0].body}</div>
          </div>
        </div>
      )}

      {/* ── Stats ── */}
      <div className="db-stats">
        <div className="db-stat db-stat-p">
          <div className="db-stat-icon">{Icons.users}</div>
          <div className="db-stat-label">Total Membri</div>
          <div className="db-stat-val">{total}</div>
        </div>
        <div className="db-stat db-stat-g">
          <div className="db-stat-icon">{Icons.check}</div>
          <div className="db-stat-label">Membri Activi</div>
          <div className="db-stat-val">{activ}</div>
        </div>
        <div className="db-stat db-stat-b">
          <div className="db-stat-icon">{Icons.star}</div>
          <div className="db-stat-label">Conducere PR</div>
          <div className="db-stat-val">{sef + adj}</div>
        </div>
        <div className="db-stat db-stat-a">
          <div className="db-stat-icon">{Icons.calendar}</div>
          <div className="db-stat-label">Evenimente Săpt.</div>
          <div className="db-stat-val">{weekActs.length}</div>
        </div>
      </div>

      {/* ── Two-col: Members + Announcements ── */}
      <div className="db-two-col">
        {/* Members */}
        <div className="db-card">
          <div className="db-card-head">
            <span className="db-card-title">
              <span className="db-card-title-icon">{Icons.users}</span>
              Membri Recenți
            </span>
            <span className="db-card-action" onClick={() => setView('members')}>
              Vezi toți →
            </span>
          </div>
          {!members.length ? (
            <div className="db-empty">
              <div className="db-empty-icon">{Icons.user}</div>
              <p>Niciun membru adăugat</p>
              <small>Apasă "+ Adaugă Membru" pentru a începe</small>
            </div>
          ) : (
            <table className="db-table">
              <thead>
                <tr><th>Nume</th><th>Grad</th><th>Status</th><th>Evenimente</th></tr>
              </thead>
              <tbody>
                {members.slice(0, 6).map(m => (
                  <tr key={m.id}>
                    <td className="td-name">{m.name}</td>
                    <td><RankBadge rank={m.rank} /></td>
                    <td><StatusPill s={m.status} /></td>
                    <td className="td-val">{m.activities}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Announcements */}
        <div className="db-card">
          <div className="db-card-head">
            <span className="db-card-title">
              <span className="db-card-title-icon">{Icons.megaphone}</span>
              Anunțuri
            </span>
            <span className="db-card-action" onClick={() => setView('announcements')}>Toate →</span>
          </div>
          {!announcements.length ? (
            <div style={{ padding: '32px 22px', textAlign: 'center', color: 'var(--on-surface-var)', fontSize: 12 }}>
              Niciun anunț
            </div>
          ) : announcements.slice(0, 3).map((a, i) => (
            <div key={i} className="db-ann-item">
              <div className="db-ann-icon">{a.pinned ? Icons.pin : Icons.megaphone}</div>
              <div>
                <div className="db-ann-title">{a.title}</div>
                <div className="db-ann-body">{a.body.length > 55 ? a.body.slice(0, 55) + '…' : a.body}</div>
                <div className="db-ann-date">{a.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Two-eq: Distribution + TOP ── */}
      <div className="db-two-eq">
        {/* Grade Distribution */}
        <div className="db-card">
          <div className="db-card-head">
            <span className="db-card-title">
              <span className="db-card-title-icon">{Icons.chart}</span>
              Distribuție Grade
            </span>
          </div>
          <div className="db-prog-section">
            {[
              { label: 'Supervizor PR',    icon: Icons.star,   color: '#FDE047', fill: 'linear-gradient(90deg,#92400e,#FDE047)', val: sup  },
              { label: 'Conducere Spital', icon: Icons.circle, color: '#EF4444', fill: 'linear-gradient(90deg,#7f1d1d,#EF4444)', val: cond },
              { label: 'Șef PR',           icon: Icons.crown,  color: '#A78BFA', fill: 'linear-gradient(90deg,#4c1d95,#A78BFA)', val: sef  },
              { label: 'Adjunct PR',       icon: Icons.zap,    color: '#93C5FD', fill: 'linear-gradient(90deg,#1e3a5f,#93C5FD)', val: adj  },
              { label: 'Membru PR',        icon: Icons.circle, color: '#6EE7B7', fill: 'linear-gradient(90deg,#064e3b,#6EE7B7)', val: mem  },
            ].map(({ label, icon, color, fill, val }) => (
              <div className="db-prog-item" key={label}>
                <div className="db-prog-header">
                  <span className="db-prog-name">
                    <span style={{ color, display: 'flex' }}>{icon}</span>
                    {label}
                  </span>
                  <span className="db-prog-val" style={{ color }}>{val}</span>
                </div>
                <div className="db-prog-track">
                  <div className="db-prog-fill" style={{ width: pct(val), background: fill }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TOP Activities */}
        <div className="db-card">
          <div className="db-card-head">
            <span className="db-card-title">
              <span className="db-card-title-icon">{Icons.trophy}</span>
              Top Evenimente
            </span>
          </div>
          <table className="db-table">
            <thead><tr><th>#</th><th>Nume</th><th>Activități</th></tr></thead>
            <tbody>
              {!top.length ? (
                <tr><td colSpan="3" style={{ textAlign: 'center', padding: 28, color: 'var(--on-surface-var)' }}>Nicio activitate</td></tr>
              ) : top.map((m, i) => (
                <tr key={m.id}>
                  <td className="td-medal">{medals[i]}</td>
                  <td className="td-name">{m.name}</td>
                  <td className="td-val">{m.activities}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── System Updates ── */}
      <div className="db-card">
        <div className="db-card-head">
          <span className="db-card-title">
            <span className="db-card-title-icon">{Icons.zap}</span>
            Actualizări Sistem
          </span>
          {isSef && (
            <button className="db-add-btn" onClick={() => setAddModal(true)}>
              <span style={{ display: 'flex' }}>{Icons.edit}</span>
              Adaugă
            </button>
          )}
        </div>

        {!updates.length ? (
          <div className="db-empty">
            <div className="db-empty-icon">⚡</div>
            <p>Nicio actualizare publicată</p>
            {isSef && <small>Apasă „Adaugă" pentru a publica prima actualizare</small>}
          </div>
        ) : (
          <div className="db-updates-list">
            {updates.map(u => {
              const cfg = TAG_CONFIG[u.tag] || TAG_CONFIG['Anunț'];
              return (
                <div key={u.id} className="db-update-item">
                  <div className="db-update-stripe" style={{ background: cfg.color }} />
                  <div className="db-update-left">
                    <span className="db-update-tag" style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>{u.tag}</span>
                    {u.version && <span className="db-update-version">{u.version}</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="db-update-title">{u.title}</div>
                    <div className="db-update-desc">{u.desc}</div>
                    <div className="db-update-meta">
                      <span>📅 {u.date}</span>
                      {u.autor && <span>👤 {u.autor}</span>}
                    </div>
                  </div>
                  {isSef && (
                    <button className="db-del-btn" onClick={() => handleDelete(u.id)} title="Șterge actualizarea">
                      {Icons.trash}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}