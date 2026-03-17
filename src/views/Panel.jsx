import React, { useState, useEffect, useRef } from 'react';
import { clearSession, getLastAnnSeen, setLastAnnSeen } from '../utils/storage';
import { useFirestore } from '../utils/useFirestore';
import { todayFull, getInitials } from '../utils/helpers';
import { addLog } from '../utils/logger';
import RankBadge         from '../components/RankBadge';
import AnnPopup          from '../components/AnnPopup';

import Dashboard         from './Dashboard';
import MembersView       from './MembersView';
import ActivityView      from './ActivityView';
import AnnouncementsView from './AnnouncementsView';
import ReportView        from './ReportView';
import PromotionsView    from './PromotionsView';
import RanksView         from './RanksView';
import CodesView         from './CodesView';
import LogsView          from './LogsView';
import EventsView        from './EventsView';
import InfoView          from './InfoView';
import ChatView          from './ChatView';
import DoveziboardView   from './DoveziboardView';


function IconEye({ open }) {
  return open ? (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
    </svg>
  ) : (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
    </svg>
  );
}

function PersonIcon({ size = 36, radius = 10 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: radius,
      background: 'linear-gradient(135deg, var(--pd), var(--p))',
      border: '2px solid var(--br2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, cursor: 'pointer',
      boxShadow: '0 2px 10px rgba(124,58,237,0.25)',
    }}>
      <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 24 24" fill="rgba(255,255,255,0.9)">
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
      </svg>
    </div>
  );
}

function ConfirmEmailModal({ onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--b2)', border: '1px solid rgba(124,58,237,0.25)',
        borderRadius: 20, padding: '32px 28px', width: 340,
        boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        animation: 'modalIn .18s ease',
      }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 18 }}>👁️</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t)', marginBottom: 10, textAlign: 'center' }}>Afișezi adresa de email?</div>
        <div style={{ fontSize: 12, color: 'var(--t3)', textAlign: 'center', lineHeight: 1.7, marginBottom: 24 }}>
          Adresa ta de email va fi <span style={{ color: 'var(--p3)', fontWeight: 600 }}>vizibilă</span> pe ecran.<br />
          Asigură-te că nu ești observat de persoane neautorizate.
        </div>
        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <button onClick={onCancel}
            style={{ flex: 1, padding: '11px', borderRadius: 11, background: 'var(--b3)', border: '1px solid var(--br)', color: 'var(--t2)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', transition: 'all .2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--br)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--b3)'}>
            Anulează
          </button>
          <button onClick={onConfirm}
            style={{ flex: 1, padding: '11px', borderRadius: 11, background: 'linear-gradient(135deg, var(--pd), var(--p))', border: '1px solid rgba(124,58,237,0.4)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 4px 20px rgba(124,58,237,0.3)', transition: 'opacity .2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            👁️ Afișează
          </button>
        </div>
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.93) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
    </div>
  );
}

function ConfirmLogoutModal({ currentUser, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--b2)', border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 20, padding: '32px 28px', width: 340,
        boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        animation: 'modalIn .18s ease',
      }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 18 }}>↩️</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t)', marginBottom: 10, textAlign: 'center' }}>Te deconectezi?</div>
        <div style={{ fontSize: 12, color: 'var(--t3)', textAlign: 'center', lineHeight: 1.7, marginBottom: 24 }}>
          Ești conectat ca <span style={{ color: 'var(--t2)', fontWeight: 600 }}>{currentUser.fullName}</span>.<br />
          Vei fi redirecționat către pagina de <span style={{ color: '#FCA5A5', fontWeight: 600 }}>autentificare</span>.
        </div>
        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <button onClick={onCancel}
            style={{ flex: 1, padding: '11px', borderRadius: 11, background: 'var(--b3)', border: '1px solid var(--br)', color: 'var(--t2)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', transition: 'all .2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--br)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--b3)'}>
            Rămân
          </button>
          <button onClick={onConfirm}
            style={{ flex: 1, padding: '11px', borderRadius: 11, background: 'linear-gradient(135deg, #7f1d1d, #ef4444)', border: '1px solid rgba(239,68,68,0.4)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 4px 20px rgba(239,68,68,0.3)', transition: 'opacity .2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            ↩ Deconectare
          </button>
        </div>
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.93) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
    </div>
  );
}

export default function Panel({ currentUser, onLogout }) {
const {
    members, activities, warnings, promotions, announcements, events, infos, ready,
    updateMember, deleteMember,
    addActivity, addWarning, addPromotion,
    saveAnnouncement, deleteAnnouncement,
    saveEvent, deleteEvent,
    saveInfo, deleteInfo,
    addCode, deleteCode,
  } = useFirestore(currentUser);

  const [view,            setView]            = useState('dashboard');
  const [selMember,       setSelMember]       = useState(null);
  const [showAnnPopup,    setShowAnnPopup]    = useState(false);
  const [profileOpen,     setProfileOpen]     = useState(false);
  const [emailVisible,    setEmailVisible]    = useState(false);
  const [showEmailModal,  setShowEmailModal]  = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const profileRef = useRef(null);

  const isSef = currentUser.rank === 'Sef PR';
  const isAdj = currentUser.rank === 'Adjunct PR' || isSef;

  useEffect(() => {
    function handleClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
        setEmailVisible(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const lastSeen = getLastAnnSeen(currentUser.id);
    const newAnns  = announcements.filter(a => Number(a.id) > lastSeen);
    if (newAnns.length > 0) setShowAnnPopup(true);
  }, [ready]);

  function closeAnnPopup() {
    const maxId = announcements.reduce((max, a) => Math.max(max, Number(a.id) || 0), 0);
    setLastAnnSeen(currentUser.id, maxId);
    setShowAnnPopup(false);
  }

  async function logout() {
    await addLog('LOGOUT', `${currentUser.fullName} (${currentUser.rank}) s-a deconectat`, currentUser);
    clearSession();
    onLogout();
  }

  function toggleEmail() {
    if (!emailVisible) setShowEmailModal(true);
    else setEmailVisible(false);
  }

const navItems = [
  { id: 'dashboard',     label: 'Dashboard',         icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>, section: 'Principal' },
  { id: 'members',       label: 'Membri',            icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, badge: members.length },
  { id: 'activity',      label: 'Activitate PR',     icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
  { id: 'announcements', label: 'Anunțuri',          icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> },
  { id: 'events',        label: 'Evenimente',        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { id: 'info',          label: 'Informații',        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
  { id: 'dovezi',        label: 'Dovezi',            icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg> },
  { id: 'chat',          label: 'Chat PR',           icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, section: undefined },
  { id: 'report',        label: 'Raport Săptămânal', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>, section: 'Analiză' },
  { id: 'promotions',    label: 'Istoric Promovări', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> },
  { id: 'ranks',         label: 'Grade',             icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>, section: 'Info' },
  ...(isSef ? [{ id: 'codes', label: 'Coduri Acces', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>, section: 'Admin' }] : []),
  ...(isAdj ? [{ id: 'logs',  label: 'Sistem Logs',  icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>, section: !isSef ? 'Admin' : undefined }] : []),
];

  const titles = {
    dashboard:       'Dashboard',
    members:         'Gestionare Membri',
    activity:        'Activitate PR',
    announcements:   'Anunțuri',
    events:          'Evenimente PR',
    info:            'Informații PR',
    dovezi:          'Dovezi Board',
    chat:            'Chat PR',
    'member-detail': 'Profil Membru',
    ranks:           'Grade & Privilegii',
    codes:           'Coduri de Acces',
    report:          'Raport Săptămânal',
    promotions:      'Istoric Promovări',
    logs:            'Sistem Logs',
  };

  const isActiveMembersView = view === 'members' || view === 'member-detail';

  if (!ready) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#08060F', flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg,#4C1D95,#7C3AED)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}>PR</div>
        <div style={{ color: '#5E5780', fontSize: 12 }}>Se încarcă datele...</div>
      </div>
    );
  }

  const dataRows = [
    {
      label: 'Email',
      custom: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--t2)', fontFamily: 'JetBrains Mono, monospace', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {emailVisible ? currentUser.email : '••••••••••••'}
          </span>
          <button onClick={toggleEmail} style={{ background: 'none', border: 'none', cursor: 'pointer', color: emailVisible ? 'var(--p3)' : 'var(--t3)', padding: 2, display: 'flex', alignItems: 'center', transition: 'color .2s' }} title={emailVisible ? 'Ascunde' : 'Afișează emailul'}>
            <IconEye open={emailVisible} />
          </button>
        </div>
      ),
    },
    { label: 'Angajat',    value: currentUser.joinDate },
    { label: 'Status',     value: currentUser.status === 'activ' ? '🟢 Activ' : currentUser.status === 'concediu' ? '🟡 Concediu' : '⚫ Inactiv' },
    { label: 'Activități', value: String(currentUser.activities || 0) },
    ...(currentUser.accountType === 'ic' ? [
      { label: 'ID Joc',   value: currentUser.charId  || '—' },
      { label: 'Callsign', value: currentUser.faction || '—' },
      { label: 'Email IC', value: currentUser.icEmail || '—' },
    ] : [
      { label: 'Telefon',  value: currentUser.phone   || '—' },
    ]),
  ];

  return (
    <div className="panel-wrap">
      {showEmailModal && (
        <ConfirmEmailModal
          onConfirm={() => { setEmailVisible(true); setShowEmailModal(false); }}
          onCancel={() => setShowEmailModal(false)}
        />
      )}
      {showLogoutModal && (
        <ConfirmLogoutModal
          currentUser={currentUser}
          onConfirm={logout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
      {showAnnPopup && announcements.length > 0 && (
        <AnnPopup announcements={announcements} onClose={closeAnnPopup} />
      )}

      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sb-logo">
          <img src="/logo_pr.png" alt="PR Logo" style={{ width: 38, height: 38, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
          <div>
            <div className="sb-logo-text">Relații Publice</div>
            <div className="sb-logo-sub">Management System v1</div>
          </div>
        </div>
        <nav className="sb-nav">
          {navItems.map(item => (
            <div key={item.id}>
              {item.section && <div className="sb-section">{item.section}</div>}
              <div
                className={`sb-item${(view === item.id || (isActiveMembersView && item.id === 'members')) ? ' active' : ''}`}
                onClick={() => { setView(item.id); if (item.id !== 'members') setSelMember(null); }}
              >
                <span className="sb-icon" style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                {item.label}
                {item.badge !== undefined && <span className="sb-badge">{item.badge}</span>}
              </div>
            </div>
          ))}
        </nav>
        <div className="sb-footer">
          <div className="sb-status"><span className="pulse" /><span>System P.R. · v1</span></div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="main-area">
        <div className="topbar">
          <div>
            <div className="tb-title">{titles[view] || view}</div>
            <div className="tb-sub">{todayFull()}</div>
          </div>
          <div className="tb-right">
            <div ref={profileRef} style={{ position: 'relative' }}>
              <div onClick={() => { setProfileOpen(p => !p); setEmailVisible(false); }}>
                <PersonIcon size={36} radius={10} />
              </div>

              {profileOpen && (
                <div style={{ position: 'absolute', top: 44, right: 0, width: 310, background: 'var(--b2)', border: '1px solid var(--br2)', borderRadius: 16, zIndex: 500, boxShadow: '0 20px 60px rgba(0,0,0,0.6), var(--glow)', overflow: 'hidden' }}>

                  {/* Header */}
                  <div style={{ padding: '18px 18px 14px', borderBottom: '1px solid var(--br)', display: 'flex', gap: 14, alignItems: 'center', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,var(--p2),transparent)', opacity: .5 }} />
                    <PersonIcon size={54} radius={13} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t)', letterSpacing: '-.2px', marginBottom: 5 }}>{currentUser.fullName}</div>
                      <RankBadge rank={currentUser.rank} />
                      <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 5 }}>Discord: {currentUser.discordId || '—'}</div>
                    </div>
                  </div>

                  {/* Date cont */}
                  <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--br)' }}>
                    <div style={{ fontSize: 9, color: 'var(--t3)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>Date Cont</div>
                    {dataRows.map((row, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid rgba(124,58,237,0.05)' }}>
                        <span style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 500, flexShrink: 0 }}>{row.label}</span>
                        {row.custom ? row.custom : (
                          <span style={{ fontSize: 11, color: 'var(--t2)', fontFamily: ['Email IC','Callsign','ID Joc'].includes(row.label) ? 'JetBrains Mono, monospace' : 'inherit', maxWidth: 170, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {row.value}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Deconectare */}
                  <div style={{ padding: '10px 18px' }}>
                    <button
                      onClick={() => setShowLogoutModal(true)}
                      style={{ width: '100%', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.22)', color: '#FCA5A5', padding: '9px', borderRadius: 9, fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, cursor: 'pointer', fontWeight: 600, letterSpacing: '.2px' }}
                    >
                      ↩ Deconectare
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="content-area">
          {view === 'dashboard'     && <Dashboard members={members} activities={activities} announcements={announcements} warnings={warnings} setView={setView} setSelMember={setSelMember} />}
          {isActiveMembersView      && <MembersView members={members} activities={activities} warnings={warnings} promotions={promotions} setView={setView} selMember={selMember} setSelMember={setSelMember} isAdj={isAdj} isSef={isSef} onUpdateMember={updateMember} onDeleteMember={deleteMember} onAddActivity={addActivity} onAddWarning={addWarning} onAddPromotion={addPromotion} />}
          {view === 'activity'      && <ActivityView members={members} activities={activities} isAdj={isAdj} onAddActivity={addActivity} />}
          {view === 'announcements' && <AnnouncementsView announcements={announcements} isSef={isSef} currentUser={currentUser} onSave={saveAnnouncement} onDelete={deleteAnnouncement} />}
          {view === 'events'        && <EventsView events={events} isSef={isSef} isAdj={isAdj} currentUser={currentUser} onSave={saveEvent} onDelete={deleteEvent} />}
          {view === 'info'          && <InfoView infos={infos} isSef={isSef} isAdj={isAdj} currentUser={currentUser} onSave={saveInfo} onDelete={deleteInfo} />}
          {view === 'dovezi'        && <DoveziboardView currentUser={currentUser} isAdj={isAdj} isSef={isSef} />}
          {view === 'chat'          && <ChatView currentUser={currentUser} />}
          {view === 'report'        && <ReportView members={members} activities={activities} warnings={warnings} promotions={promotions} />}
          {view === 'promotions'    && <PromotionsView promotions={promotions} />}
          {view === 'ranks'         && <RanksView />}
          {view === 'codes'         && isSef && <CodesView onAdd={addCode} onDelete={deleteCode} />}
          {view === 'logs'          && isAdj && <LogsView currentUser={currentUser} />}
        </div>
      </main>
    </div>
  );
}