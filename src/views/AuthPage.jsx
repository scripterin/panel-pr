import React, { useEffect, useState } from 'react';
import { COL, getAll, setOne, updateOne, getSession, setSession } from '../utils/storage';
import { addLog } from '../utils/logger';

const DISCORD_CLIENT_ID  = 'PUNE_CLIENT_ID_AICI';
const DISCORD_REDIRECT   = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/auth/callback'
  : 'https://panel-pr.vercel.app/auth/callback';
const DISCORD_SCOPE      = 'identify';

export default function AuthPage({ onLogin }) {
  const [status, setStatus] = useState('idle'); // idle | loading | denied | error
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code   = params.get('code');
    if (code) {
      window.history.replaceState({}, '', '/');
      handleCallback(code);
    }
  }, []);

  async function handleCallback(code) {
    setStatus('loading');
    try {
      const res = await fetch('/api/discord-auth', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ code }),
      });

      const data = await res.json();
      if (!res.ok || !data.discordId) {
        setErrMsg('Autentificare Discord eșuată. Încearcă din nou.');
        setStatus('error');
        return;
      }

      const { discordId, discordTag, discordAvatar } = data;

      // Verifică whitelist
      const whitelist = await getAll(COL.whitelist);
      const entry     = whitelist.find(w => w.discordId === discordId);

      if (!entry) {
        setStatus('denied');
        return;
      }

      // Verifică dacă există deja user sau creează unul
      const users      = await getAll(COL.users);
      let   user       = users.find(u => u.discordId === discordId);

      if (!user) {
        const id = discordId;
        user = {
          id,
          discordId,
          discordTag,
          discordAvatar: discordAvatar || '',
          fullName:      entry.nume,
          rank:          entry.grad,
          status:        'activ',
          activities:    0,
          notes:         '',
          joinDate:      new Date().toLocaleDateString('ro-RO'),
          isAdmin:       entry.isAdmin || false,
        };
        await setOne(COL.users, id, user);
        await setOne(COL.members, id, {
          id,
          name:       entry.nume,
          rank:       entry.grad,
          status:     'activ',
          discord:    discordId,
          date:       user.joinDate,
          activities: 0,
          notes:      '',
        });
      } else {
        // Actualizează avatar și tag la fiecare login
        await updateOne(COL.users, user.id, {
          discordTag,
          discordAvatar: discordAvatar || user.discordAvatar || '',
        });
        user = { ...user, discordTag, discordAvatar };
      }

      await addLog('LOGIN', `${user.fullName} (${user.rank}) s-a conectat via Discord`, user);
      setSession(user);
      onLogin(user);

    } catch (e) {
      console.error(e);
      setErrMsg('Eroare de conexiune. Încearcă din nou.');
      setStatus('error');
    }
  }

  function loginWithDiscord() {
    const url = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT)}&response_type=code&scope=${DISCORD_SCOPE}`;
    window.location.href = url;
  }

  // ── DENIED ──────────────────────────────────────────────
  if (status === 'denied') {
    return (
      <div className="auth-wrap">
        <div className="auth-mesh" />
        <div className="auth-dots" />
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <img src="/logo_pr.png" alt="Logo PR" />
            </div>
            <div className="auth-title">Acces Refuzat</div>
            <div className="auth-sub">Nu ești pe lista de acces</div>
          </div>
          <div className="auth-body">
            <div style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 10,
              padding: '16px',
              marginBottom: 20,
              fontSize: 13,
              color: '#EF4444',
              textAlign: 'center',
              lineHeight: 1.6,
            }}>
              Contul tău de Discord nu are acces la acest panel.<br />
              <span style={{ color: 'var(--t2)', fontSize: 12 }}>
                Contactează administratorul pentru a fi adăugat.
              </span>
            </div>
            <button className="fbtn" onClick={() => setStatus('idle')}>
              ← Înapoi
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── LOADING ──────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#08060F', gap: 16,
      }}>
        <img src="/logo_pr.png" alt="PR Logo" style={{
          width: 48, height: 48, borderRadius: 14, objectFit: 'cover',
          boxShadow: '0 8px 24px rgba(124,58,237,0.4)',
        }} />
        <div style={{ color: '#5E5780', fontSize: 12, letterSpacing: '.5px' }}>
          Se verifică accesul...
        </div>
      </div>
    );
  }

  // ── IDLE / ERROR ─────────────────────────────────────────
  return (
    <div className="auth-wrap">
      <div className="auth-mesh" />
      <div className="auth-dots" />
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <img src="/logo_pr.png" alt="Logo PR" />
          </div>
          <div className="auth-title">Relații Publice</div>
          <div className="auth-sub">Sistem Management</div>
        </div>
        <div className="auth-body">
          {status === 'error' && (
            <div className="ferr">⚠️ {errMsg}</div>
          )}
          <button className="fbtn" onClick={loginWithDiscord} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
            </svg>
            Conectează-te cu Discord
          </button>
          <div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: 'var(--t3)' }}>
            Accesul este restricționat. Doar membrii autorizați pot intra.
          </div>
        </div>
      </div>
    </div>
  );
}