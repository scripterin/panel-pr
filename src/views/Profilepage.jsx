import React, { useState } from 'react';
import RankBadge from '../components/RankBadge';
import { db } from '../utils/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const Ico = {
  target:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  tag:      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  radio:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="currentColor"/></svg>,
  calendar: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  user:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  globe:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  activity: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  shield:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  trophy:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-2"/><rect x="6" y="18" width="12" height="4"/></svg>,
  settings: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  image:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  layout:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>,
  save:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  loader:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>,
  check:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
  x:        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  gamepad:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><circle cx="15" cy="12" r="1" fill="currentColor"/><circle cx="17.5" cy="10" r="1" fill="currentColor"/><path d="M17 2H7a5 5 0 0 0-5 5v6a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5z"/></svg>,
};

const STATUS_COLORS = {
  activ:    { color: '#10B981', bg: 'rgba(16,185,129,0.12)', label: 'Activ' },
  concediu: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', label: 'Concediu' },
  inactiv:  { color: '#6B7280', bg: 'rgba(107,114,128,0.12)', label: 'Inactiv' },
};

function StatCard({ icon, label, value, color = 'var(--p3)', small }) {
  return (
    <div style={{ background: 'var(--b3)', border: '1px solid var(--br)', borderRadius: 14, padding: '14px', display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 130 }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: color + '18', border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 600, letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: small ? 13 : 17, fontWeight: 700, color, fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid rgba(124,58,237,0.06)' }}>
      <span style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 12, color: 'var(--t2)', fontFamily: mono ? 'JetBrains Mono, monospace' : undefined, fontWeight: mono ? 500 : 400 }}>{value || '—'}</span>
    </div>
  );
}

const inputSt = {
  width: '100%', background: 'var(--b3)', border: '1px solid var(--br)',
  borderRadius: 10, padding: '10px 14px', fontSize: 12, color: 'var(--t)',
  fontFamily: 'Space Grotesk, sans-serif', outline: 'none',
  transition: 'border-color .2s', boxSizing: 'border-box',
};

const labelSt = {
  fontSize: 11, color: 'var(--t3)', fontWeight: 600,
  letterSpacing: '.5px', textTransform: 'uppercase',
  display: 'block', marginBottom: 6,
};

export default function ProfilePage({ currentUser, onClose, readOnly = false }) {
  const [activeTab,     setActiveTab]     = useState('profil');
  const [avatarUrl,     setAvatarUrl]     = useState(currentUser.avatarUrl  || '');
  const [bannerUrl,     setBannerUrl]     = useState(currentUser.bannerUrl  || '');
  const [avatarPreview, setAvatarPreview] = useState(currentUser.avatarUrl  || '');
  const [bannerPreview, setBannerPreview] = useState(currentUser.bannerUrl  || '');
  const [saving,        setSaving]        = useState(false);
  const [saveMsg,       setSaveMsg]       = useState('');

  const statusCfg = STATUS_COLORS[currentUser.status] || STATUS_COLORS.activ;

  const tabs = [
    { id: 'profil',     label: 'Profil',     icon: Ico.user },
    { id: 'activitate', label: 'Activitate', icon: Ico.activity },
    { id: 'sanctiuni',  label: 'Sancțiuni',  icon: Ico.shield },
    { id: 'promovari',  label: 'Promovări',  icon: Ico.trophy },
    ...(!readOnly ? [{ id: 'setari', label: 'Setări', icon: Ico.settings }] : []),
  ];

  async function saveSettings() {
    setSaving(true);
    setSaveMsg('');
    try {
      const payload = { avatarUrl: avatarUrl.trim(), bannerUrl: bannerUrl.trim() };
      await updateDoc(doc(db, 'members', currentUser.id), payload);
      await updateDoc(doc(db, 'users',   currentUser.id), payload);
      setAvatarPreview(avatarUrl.trim());
      setBannerPreview(bannerUrl.trim());
      setSaveMsg('success');
    } catch (e) {
      console.error(e);
      setSaveMsg('error');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 3000);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>

      {/* ── Buton Închide ── */}
      <button onClick={onClose}
        style={{ position: 'absolute', top: 24, right: 24, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s', zIndex: 3001 }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.5)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.6)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
        title="Închide"
      >{Ico.x}</button>

      <div style={{ width: '100%', maxWidth: 820, maxHeight: '92vh', overflowY: 'auto', borderRadius: 24, background: 'var(--b1)', border: '1px solid rgba(124,58,237,0.2)', boxShadow: '0 40px 120px rgba(0,0,0,0.8)', animation: 'modalIn .22s ease' }}>

        {/* ── Banner ── */}
        <div style={{ position: 'relative', height: 160, borderRadius: '24px 24px 0 0', overflow: 'hidden', background: 'linear-gradient(135deg, #0f0a1e 0%, #1a0d3d 40%, #2d1065 70%, #1a0d3d 100%)' }}>
          {bannerPreview
            ? <img src={bannerPreview} alt="banner" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} onError={e => e.target.style.display = 'none'} />
            : <>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(124,58,237,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(59,130,246,0.2) 0%, transparent 40%)' }} />
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, rgba(124,58,237,0.03) 0px, transparent 1px, transparent 40px)', backgroundSize: '100% 40px' }} />
              </>
          }
        </div>

        {/* ── Avatar + Nume ── */}
        <div style={{ padding: '0 28px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: -28, marginBottom: 24 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', border: '3px solid var(--b1)', flexShrink: 0, boxShadow: '0 6px 24px rgba(124,58,237,0.35)', overflow: 'hidden', background: 'var(--b2)', position: 'relative', zIndex: 1 }}>
              <img
                src={avatarPreview || '/logo_pr.png'}
                alt="avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => { e.target.src = '/logo_pr.png'; }}
              />
            </div>
            <div style={{ paddingTop: 32 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--t)', letterSpacing: '-.3px', lineHeight: 1.2, marginBottom: 8 }}>
                {currentUser.fullName || currentUser.charName || currentUser.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <RankBadge rank={currentUser.rank} />
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.color}40` }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: statusCfg.color, display: 'inline-block' }} />
                  {statusCfg.label}
                </span>
              </div>
            </div>
          </div>

          {/* ── Stat cards ── */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 22 }}>
            <StatCard icon={Ico.target}   label="Activități" value={currentUser.activities || 0} color="#10B981" />
            <StatCard icon={Ico.tag}      label="ID"         value={currentUser.charId || '—'}   color="var(--p3)" />
            <StatCard icon={Ico.radio}    label="Callsign"   value={currentUser.faction || '—'}  color="#3B82F6" />
            <StatCard icon={Ico.calendar} label="Angajat"    value={currentUser.joinDate || '—'} color="#F59E0B" small />
          </div>

          {/* ── Tabs ── */}
          <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--br)', marginBottom: 22, flexWrap: 'wrap' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 14px', borderRadius: '10px 10px 0 0', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', transition: 'all .2s',
                background: activeTab === t.id ? 'rgba(124,58,237,0.12)' : 'transparent',
                border: activeTab === t.id ? '1px solid rgba(124,58,237,0.3)' : '1px solid transparent',
                borderBottom: activeTab === t.id ? '1px solid var(--b1)' : '1px solid transparent',
                color: activeTab === t.id ? 'var(--p3)' : 'var(--t3)',
                marginBottom: activeTab === t.id ? -1 : 0,
              }}>
                <span style={{ display: 'flex', opacity: activeTab === t.id ? 1 : 0.6 }}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Tab: Profil ── */}
          {activeTab === 'profil' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
              <div style={{ background: 'var(--b2)', border: '1px solid var(--br)', borderRadius: 16, padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 10, color: 'var(--p3)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12 }}>
                  <span style={{ display: 'flex' }}>{Ico.gamepad}</span> Date IC
                </div>
                <InfoRow label="Nume complet"   value={currentUser.fullName || currentUser.charName} />
                <InfoRow label="ID"             value={currentUser.charId}   mono />
                <InfoRow label="Callsign"       value={currentUser.faction}  mono />
                <InfoRow label="Email IC"       value={currentUser.icEmail}  mono />
                <InfoRow label="Grad"           value={currentUser.rank} />
                <InfoRow label="Data angajării" value={currentUser.joinDate} />
                <InfoRow label="Tip cont"       value={currentUser.accountType === 'ic' ? 'In-Character (IC)' : 'Out-of-Character (OOC)'} />
                <InfoRow label="Status"         value={statusCfg.label} />
                <InfoRow label="Activități"     value={String(currentUser.activities || 0)} />
                <InfoRow label="Note"           value={currentUser.notes || 'Fără note'} />
              </div>
              <div style={{ background: 'var(--b2)', border: '1px solid var(--br)', borderRadius: 16, padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 10, color: 'var(--t3)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12 }}>
                  <span style={{ display: 'flex' }}>{Ico.globe}</span> Date OOC
                </div>
                <InfoRow label="Discord ID" value={currentUser.discordId} mono />
                {!readOnly && <InfoRow label="Email"  value={currentUser.email}    mono />}
                {!readOnly && <InfoRow label="Parolă" value={currentUser.password} mono />}
              </div>
            </div>
          )}

          {/* ── Tab: Activitate ── */}
          {activeTab === 'activitate' && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ background: 'var(--b2)', border: '1px solid var(--br)', borderRadius: 16, padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <div style={{ color: 'var(--p3)', opacity: 0.4 }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t2)' }}>Istoric Activitate</div>
                <div style={{ fontSize: 12, color: 'var(--t3)', textAlign: 'center' }}>
                  Activitățile acestui membru sunt vizibile în secțiunea <span style={{ color: 'var(--p3)', fontWeight: 600 }}>Activitate PR</span>.
                </div>
                <div style={{ marginTop: 8, background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 700, color: 'var(--p3)' }}>
                  Total: {currentUser.activities || 0} activități
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: Sancțiuni ── */}
          {activeTab === 'sanctiuni' && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ background: 'var(--b2)', border: '1px solid var(--br)', borderRadius: 16, padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <div style={{ color: '#EF4444', opacity: 0.4 }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t2)' }}>Registru Sancțiuni</div>
                <div style={{ fontSize: 12, color: 'var(--t3)', textAlign: 'center' }}>
                  Sancțiunile acestui membru sunt vizibile în secțiunea <span style={{ color: '#EF4444', fontWeight: 600 }}>Sancțiuni</span>.
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: Promovări ── */}
          {activeTab === 'promovari' && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ background: 'var(--b2)', border: '1px solid var(--br)', borderRadius: 16, padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <div style={{ color: '#10B981', opacity: 0.4 }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-2"/><rect x="6" y="18" width="12" height="4"/></svg>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t2)' }}>Istoric Promovări</div>
                <div style={{ fontSize: 12, color: 'var(--t3)', textAlign: 'center' }}>
                  Promovările acestui membru sunt vizibile în secțiunea <span style={{ color: '#10B981', fontWeight: 600 }}>Istoric Promovări</span>.
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: Setări ── */}
          {activeTab === 'setari' && (
            <div style={{ marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Poză profil */}
              <div style={{ background: 'var(--b2)', border: '1px solid var(--br)', borderRadius: 16, padding: '20px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 10, color: 'var(--p3)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 16 }}>
                  <span style={{ display: 'flex' }}>{Ico.image}</span> Poză Profil
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', border: '2px solid var(--br)', overflow: 'hidden', flexShrink: 0, background: 'var(--b3)' }}>
                    <img
                      src={avatarUrl || '/logo_pr.png'}
                      alt="preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { e.target.src = '/logo_pr.png'; }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelSt}>URL Imagine</label>
                    <input
                      style={inputSt}
                      placeholder="https://i.imgur.com/exemplu.png"
                      value={avatarUrl}
                      onChange={e => setAvatarUrl(e.target.value)}
                      onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.5)'}
                      onBlur={e => e.target.style.borderColor = 'var(--br)'}
                    />
                    <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 6 }}>
                      Acceptă orice link direct către o imagine (imgur, discord CDN, etc.)
                    </div>
                  </div>
                </div>
              </div>

              {/* Banner */}
              <div style={{ background: 'var(--b2)', border: '1px solid var(--br)', borderRadius: 16, padding: '20px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 10, color: 'var(--p3)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 16 }}>
                  <span style={{ display: 'flex' }}>{Ico.layout}</span> Banner Profil
                </div>
                <div style={{ width: '100%', height: 90, borderRadius: 10, overflow: 'hidden', marginBottom: 14, border: '1px solid var(--br)', background: 'linear-gradient(135deg, #0f0a1e, #2d1065)', position: 'relative' }}>
                  {bannerUrl && (
                    <img src={bannerUrl} alt="banner preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                  )}
                  {!bannerUrl && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>
                      Preview banner
                    </div>
                  )}
                </div>
                <label style={labelSt}>URL Banner</label>
                <input
                  style={inputSt}
                  placeholder="https://i.imgur.com/banner.png"
                  value={bannerUrl}
                  onChange={e => setBannerUrl(e.target.value)}
                  onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'var(--br)'}
                />
                <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 6 }}>
                  Dimensiune recomandată: 820×160px. Acceptă orice link direct.
                </div>
              </div>

              {/* Buton salvare */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <button
                  onClick={saveSettings}
                  disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 28px', borderRadius: 12, background: 'linear-gradient(135deg, var(--pd), var(--p))', border: '1px solid rgba(124,58,237,0.4)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 4px 20px rgba(124,58,237,0.3)', opacity: saving ? 0.7 : 1, transition: 'opacity .2s' }}
                  onMouseEnter={e => { if (!saving) e.currentTarget.style.opacity = '0.85'; }}
                  onMouseLeave={e => { if (!saving) e.currentTarget.style.opacity = '1'; }}
                >
                  <span style={{ display: 'flex' }}>{saving ? Ico.loader : Ico.save}</span>
                  {saving ? 'Se salvează...' : 'Salvează Modificările'}
                </button>
                {saveMsg && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: saveMsg === 'success' ? '#10B981' : '#EF4444', fontWeight: 600 }}>
                    <span style={{ display: 'flex' }}>{saveMsg === 'success' ? Ico.check : Ico.x}</span>
                    {saveMsg === 'success' ? 'Salvat cu succes!' : 'Eroare la salvare.'}
                  </span>
                )}
              </div>

            </div>
          )}

        </div>
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.96) translateY(12px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
    </div>
  );
}