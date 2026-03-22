import React, { useState, useEffect, useRef } from 'react';
import { clearSession, getLastAnnSeen, setLastAnnSeen } from '../utils/storage';
import { useFirestore } from '../utils/useFirestore';
import { todayFull, getInitials } from '../utils/helpers';
import { addLog } from '../utils/logger';
import { db } from '../utils/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
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
import SanctiuniView     from './SanctiuniView';
import Profilepage       from './Profilepage';


function PersonIcon({ size = 36, radius = 10, avatarUrl }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: '2px solid var(--br2)', overflow: 'hidden',
      flexShrink: 0, cursor: 'pointer',
      boxShadow: '0 2px 10px rgba(124,58,237,0.25)',
    }}>
      <img
        src={avatarUrl || '/logo_pr.png'}
        alt="avatar"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={e => { e.target.src = '/logo_pr.png'; }}
      />
    </div>
  );
}

function ConfirmLogoutModal({ currentUser, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--b2)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 20, padding: '32px 28px', width: 340, boxShadow: '0 30px 80px rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'modalIn .18s ease' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 18 }}>↩️</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t)', marginBottom: 10, textAlign: 'center' }}>Te deconectezi?</div>
        <div style={{ fontSize: 12, color: 'var(--t3)', textAlign: 'center', lineHeight: 1.7, marginBottom: 24 }}>
          Ești conectat ca <span style={{ color: 'var(--t2)', fontWeight: 600 }}>{currentUser.fullName}</span>.<br />
          Vei fi redirecționat către pagina de <span style={{ color: '#FCA5A5', fontWeight: 600 }}>autentificare</span>.
        </div>
        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '11px', borderRadius: 11, background: 'var(--b3)', border: '1px solid var(--br)', color: 'var(--t2)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', transition: 'all .2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--br)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--b3)'}>Rămân</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '11px', borderRadius: 11, background: 'linear-gradient(135deg, #7f1d1d, #ef4444)', border: '1px solid rgba(239,68,68,0.4)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 4px 20px rgba(239,68,68,0.3)', transition: 'opacity .2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>↩ Deconectare</button>
        </div>
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.93) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
    </div>
  );
}

export default function Panel({ currentUser: initialUser, onLogout }) {
  const [currentUser,       setCurrentUser]       = useState(initialUser);
  const [view,              setView]              = useState('dashboard');
  const [selMember,         setSelMember]         = useState(null);
  const [showAnnPopup,      setShowAnnPopup]      = useState(false);
  const [profileOpen,       setProfileOpen]       = useState(false);
  const [showLogoutModal,   setShowLogoutModal]   = useState(false);
  const [showProfilepage,   setShowProfilepage]   = useState(false);
  const [viewMemberProfile, setViewMemberProfile] = useState(null);
  const [isDark, setIsDark] = useState(true);
  const profileRef = useRef(null);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.body.classList.toggle('light', !next);
  }

  const {
    members, activities, warnings, promotions, announcements, events, infos, ready,
    updateMember, deleteMember,
    addActivity, addWarning, addPromotion,
    saveAnnouncement, deleteAnnouncement,
    saveEvent, deleteEvent,
    saveInfo, deleteInfo,
    addCode, deleteCode,
  } = useFirestore(currentUser);

  useEffect(() => {
    if (!initialUser?.id) return;
    const unsub = onSnapshot(doc(db, 'members', initialUser.id), snap => {
      if (snap.exists()) setCurrentUser(prev => ({ ...prev, ...snap.data(), id: snap.id }));
    });
    return unsub;
  }, [initialUser?.id]);

  const isSef = currentUser.rank === 'Sef PR' || currentUser.rank === 'Supervizor PR';
  const isAdj = currentUser.rank === 'Adjunct PR' || currentUser.rank === 'Conducere Spital' || isSef;

  useEffect(() => {
    function handleClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
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

  const navItems = [
    { id: 'dashboard',     label: 'Dashboard',         icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>, section: 'Principal' },
    { id: 'members',       label: 'Membri',            icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, badge: members.length },
    { id: 'activity',      label: 'Activitate PR',     icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
    { id: 'announcements', label: 'Anunțuri',          icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> },
    { id: 'events',        label: 'Evenimente',        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
    { id: 'info',          label: 'Informații',        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
    { id: 'dovezi',        label: 'Dovezi',            icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg> },
    { id: 'chat',          label: 'Chat PR',           icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
    { id: 'sanctiuni',     label: 'Sancțiuni',         icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
    { id: 'report',        label: 'Raport Bilunar',    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>, section: 'Analiză' },
    { id: 'promotions',    label: 'Istoric Promovări', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> },
    { id: 'ranks',         label: 'Grade',             icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>, section: 'Info' },
    ...(isSef ? [{ id: 'codes', label: 'Coduri Acces', section: 'Admin', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg> }] : []),
    ...(isAdj ? [{ id: 'logs', label: 'Sistem Logs', section: !isSef ? 'Admin' : undefined, icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> }] : []),
  ];

  const titles = {
    dashboard: 'Dashboard', members: 'Gestionare Membri', activity: 'Activitate PR',
    announcements: 'Anunțuri', events: 'Evenimente PR', info: 'Informații PR',
    dovezi: 'Dovezi Board', chat: 'Chat PR', 'member-detail': 'Profil Membru',
    ranks: 'Grade & Privilegii', codes: 'Coduri de Acces', report: 'Raport Bilunar',
    sanctiuni: 'Registru Sancțiuni', promotions: 'Istoric Promovări', logs: 'Sistem Logs',
  };

  const isActiveMembersView = view === 'members' || view === 'member-detail';

  if (!ready) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#08060F', flexDirection: 'column', gap: 12 }}>
        <img src="/logo_pr.png" alt="PR Logo" style={{ width: 38, height: 38, borderRadius: 10, objectFit: 'cover' }} />
        <div style={{ color: '#5E5780', fontSize: 12 }}>Se încarcă datele...</div>
      </div>
    );
  }

  return (
    <>
      {/* ── Profil curent ── */}
      {showProfilepage && (
        <Profilepage
          currentUser={currentUser}
          onClose={() => setShowProfilepage(false)}
        />
      )}

      {/* ── Profil membru din lista ── */}
      {viewMemberProfile && (
        <Profilepage
          currentUser={viewMemberProfile}
          onClose={() => setViewMemberProfile(null)}
          readOnly
        />
      )}

      {/* ── Logout Modal ── */}
      {showLogoutModal && (
        <ConfirmLogoutModal
          currentUser={currentUser}
          onConfirm={logout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}

      <div className="panel-wrap">
        {showAnnPopup && announcements.length > 0 && (
          <AnnPopup announcements={announcements} onClose={closeAnnPopup} />
        )}

        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <div className="sb-logo">
            <img src="/logo_pr.png" alt="PR Logo" style={{ width: 38, height: 38, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
            <div><div className="sb-logo-text">Relații Publice</div></div>
          </div>
          <nav className="sb-nav">
            {navItems.map(item => (
              <div key={item.id}>
                {item.section && <div className="sb-section">{item.section}</div>}
                <div
                  className={`sb-item${(view === item.id || (isActiveMembersView && item.id === 'members')) ? ' active' : ''}`}
                  onClick={() => { setView(item.id); setSelMember(null); }}
                >
                  <span className="sb-icon">
                    <span style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: (view === item.id || (isActiveMembersView && item.id === 'members'))
                        ? 'rgba(255,255,255,0.15)'
                        : 'rgba(124,58,237,0.1)',
                      border: (view === item.id || (isActiveMembersView && item.id === 'members'))
                        ? '1px solid rgba(255,255,255,0.2)'
                        : '1px solid rgba(124,58,237,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, transition: 'all .15s',
                    }}>
                      {item.icon}
                    </span>
                  </span>
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
              {/* ── Toggle Dark/Light ── */}
              <button
                onClick={toggleTheme}
                title={isDark ? 'Schimbă la Light Mode' : 'Schimbă la Dark Mode'}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'var(--b3)', border: '1px solid var(--br2)',
                  color: 'var(--t2)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, transition: 'all .2s', flexShrink: 0,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--b4)'; e.currentTarget.style.borderColor = 'var(--br3)'; e.currentTarget.style.color = 'var(--p3)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--b3)'; e.currentTarget.style.borderColor = 'var(--br2)'; e.currentTarget.style.color = 'var(--t2)'; }}
              >
                {isDark ? '💡' : '🌙'}
              </button>
              <div ref={profileRef} style={{ position: 'relative' }}>
                <div onClick={() => setProfileOpen(p => !p)}>
                  <PersonIcon size={36} radius={10} avatarUrl={currentUser.avatarUrl} />
                </div>

                {profileOpen && (
                  <div style={{ position: 'absolute', top: 48, right: 0, width: 240, background: 'var(--b2)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 16, zIndex: 500, boxShadow: '0 20px 60px rgba(0,0,0,0.6)', overflow: 'hidden', animation: 'dropIn .18s ease' }}>

                    {/* Header cu avatar */}
                    <div style={{ padding: '16px 16px 14px', borderBottom: '1px solid var(--br)', display: 'flex', gap: 12, alignItems: 'center', background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(59,130,246,0.04))' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--br2)', flexShrink: 0, boxShadow: '0 4px 14px rgba(124,58,237,0.35)' }}>
                        <img
                          src={currentUser.avatarUrl || '/logo_pr.png'}
                          alt="avatar"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { e.target.src = '/logo_pr.png'; }}
                        />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t)', letterSpacing: '-.2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {currentUser.fullName || currentUser.charName || currentUser.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--t3)', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>
                          ID {currentUser.charId || '—'}
                        </div>
                      </div>
                    </div>

                    {/* Butoane meniu */}
                    <div style={{ padding: '8px' }}>
                      <button
                        onClick={() => { setProfileOpen(false); setShowProfilepage(true); }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', background: 'transparent', border: 'none', fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--t2)', textAlign: 'left', transition: 'all .15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.1)'; e.currentTarget.style.color = 'var(--p3)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--t2)'; }}
                      >
                        <span style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>👤</span>
                        Profilul meu
                      </button>

                      <div style={{ height: 1, background: 'var(--br)', margin: '6px 4px' }} />

                      <button
                        onClick={() => { setProfileOpen(false); setShowLogoutModal(true); }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', background: 'transparent', border: 'none', fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, fontWeight: 600, color: 'var(--t3)', textAlign: 'left', transition: 'all .15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#FCA5A5'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--t3)'; }}
                      >
                        <span style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>↩️</span>
                        Delogheaza-te
                      </button>
                    </div>
                  </div>
                )}

                <style>{`@keyframes dropIn { from { opacity:0; transform:translateY(-8px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>
              </div>
            </div>
          </div>

          <div className="content-area">
            {view === 'dashboard'     && <Dashboard members={members} activities={activities} announcements={announcements} warnings={warnings} setView={v => { setView(v); setSelMember(null); }} setSelMember={setSelMember} currentUser={currentUser} isSef={isSef} />}
            {isActiveMembersView      && (
              <MembersView
                members={members} activities={activities} warnings={warnings} promotions={promotions}
                setView={setView} selMember={selMember} setSelMember={setSelMember}
                isAdj={isAdj} isSef={isSef}
                onUpdateMember={updateMember} onDeleteMember={deleteMember}
                onAddActivity={addActivity} onAddWarning={addWarning} onAddPromotion={addPromotion}
                onViewProfile={m => setViewMemberProfile({
                  ...m,
                  fullName:  m.fullName  || m.name        || '—',
                  joinDate:  m.joinDate  || m.date        || '—',
                  discordId: m.discordId || m.discord     || '—',
                  charId:    m.charId    || '—',
                  faction:   m.faction   || '—',
                  status:    m.status    || 'activ',
                  rank:      m.rank      || '—',
                  activities: m.activities || 0,
                })}
              />
            )}
            {view === 'activity'      && <ActivityView members={members} activities={activities} isAdj={isAdj} onAddActivity={addActivity} />}
            {view === 'announcements' && <AnnouncementsView announcements={announcements} isSef={isSef} currentUser={currentUser} onSave={saveAnnouncement} onDelete={deleteAnnouncement} />}
            {view === 'events'        && <EventsView events={events} isSef={isSef} isAdj={isAdj} currentUser={currentUser} onSave={saveEvent} onDelete={deleteEvent} />}
            {view === 'info'          && <InfoView infos={infos} isSef={isSef} isAdj={isAdj} currentUser={currentUser} onSave={saveInfo} onDelete={deleteInfo} />}
            {view === 'dovezi'        && <DoveziboardView currentUser={currentUser} isAdj={isAdj} isSef={isSef} />}
            {view === 'chat'          && <ChatView currentUser={currentUser} />}
            {view === 'report'        && <ReportView members={members} activities={activities} warnings={warnings} promotions={promotions} isAdj={isAdj} />}
            {view === 'sanctiuni'     && <SanctiuniView members={members} currentUser={currentUser} isAdj={isAdj} isSef={isSef} />}
            {view === 'promotions'    && <PromotionsView promotions={promotions} />}
            {view === 'ranks'         && <RanksView />}
            {view === 'codes'         && isSef && <CodesView onAdd={addCode} onDelete={deleteCode} />}
            {view === 'logs'          && isAdj && <LogsView currentUser={currentUser} />}
          </div>
        </main>
      </div>
    </>
  );
}