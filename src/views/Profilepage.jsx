import React, { useState } from 'react';
import RankBadge from '../components/RankBadge';
import { db } from '../utils/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const STATUS_COLORS = {
  activ:    { color: '#10B981', bg: 'rgba(16,185,129,0.12)', label: 'Activ' },
  concediu: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', label: 'Concediu' },
  inactiv:  { color: '#6B7280', bg: 'rgba(107,114,128,0.12)', label: 'Inactiv' },
};

function StatCard({ icon, label, value, color = 'var(--p3)', small }) {
  return (
    <div style={{ background: 'var(--b3)', border: '1px solid var(--br)', borderRadius: 14, padding: '14px', display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 130 }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: color + '18', border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{icon}</div>
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
    { id: 'profil',     label: '👤 Profil' },
    { id: 'activitate', label: '📋 Activitate' },
    { id: 'sanctiuni',  label: '⚖️ Sancțiuni' },
    { id: 'promovari',  label: '🏆 Promovări' },
    ...(!readOnly ? [{ id: 'setari', label: '⚙️ Setări' }] : []),
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
      setSaveMsg('✅ Salvat cu succes!');
    } catch (e) {
      console.error(e);
      setSaveMsg('❌ Eroare la salvare.');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 3000);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>

      {/* ── Buton Închide ── */}
      <button onClick={onClose}
        style={{ position: 'absolute', top: 24, right: 24, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s', zIndex: 3001, fontFamily: 'Space Grotesk, sans-serif' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.5)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.6)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
        title="Închide"
      >✕</button>

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
            <StatCard icon="🎯" label="Activități" value={currentUser.activities || 0} color="#10B981" />
            <StatCard icon="🏷️" label="ID" value={currentUser.charId || '—'} color="var(--p3)" />
            <StatCard icon="📡" label="Callsign" value={currentUser.faction || '—'} color="#3B82F6" />
            <StatCard icon="📅" label="Angajat" value={currentUser.joinDate || '—'} color="#F59E0B" small />
          </div>

          {/* ── Tabs ── */}
          <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--br)', marginBottom: 22, flexWrap: 'wrap' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                padding: '9px 14px', borderRadius: '10px 10px 0 0', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif', transition: 'all .2s',
                background: activeTab === t.id ? 'rgba(124,58,237,0.12)' : 'transparent',
                border: activeTab === t.id ? '1px solid rgba(124,58,237,0.3)' : '1px solid transparent',
                borderBottom: activeTab === t.id ? '1px solid var(--b1)' : '1px solid transparent',
                color: activeTab === t.id ? 'var(--p3)' : 'var(--t3)',
                marginBottom: activeTab === t.id ? -1 : 0,
              }}>{t.label}</button>
            ))}
          </div>

          {/* ── Tab: Profil ── */}
          {activeTab === 'profil' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
              <div style={{ background: 'var(--b2)', border: '1px solid var(--br)', borderRadius: 16, padding: '18px 20px' }}>
                <div style={{ fontSize: 10, color: 'var(--p3)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12 }}>🎮 Date IC</div>
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
                <div style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12 }}>🌐 Date OOC</div>
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
                <div style={{ fontSize: 40 }}>📋</div>
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
                <div style={{ fontSize: 40 }}>⚖️</div>
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
                <div style={{ fontSize: 40 }}>🏆</div>
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
                <div style={{ fontSize: 10, color: 'var(--p3)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 16 }}>🖼️ Poză Profil</div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  {/* Preview */}
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
                <div style={{ fontSize: 10, color: 'var(--p3)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 16 }}>🎨 Banner Profil</div>
                {/* Preview banner */}
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
                  style={{ padding: '11px 28px', borderRadius: 12, background: 'linear-gradient(135deg, var(--pd), var(--p))', border: '1px solid rgba(124,58,237,0.4)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 4px 20px rgba(124,58,237,0.3)', opacity: saving ? 0.7 : 1, transition: 'opacity .2s' }}
                  onMouseEnter={e => { if (!saving) e.currentTarget.style.opacity = '0.85'; }}
                  onMouseLeave={e => { if (!saving) e.currentTarget.style.opacity = '1'; }}
                >
                  {saving ? '⏳ Se salvează...' : '💾 Salvează Modificările'}
                </button>
                {saveMsg && (
                  <span style={{ fontSize: 13, color: saveMsg.startsWith('✅') ? '#10B981' : '#EF4444', fontWeight: 600 }}>
                    {saveMsg}
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