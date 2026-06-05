import React, { useState, useEffect } from 'react';
import { initFirestore, getSession, clearSession, getAll, COL } from './utils/storage';
import AuthPage        from './views/AuthPage';
import Panel           from './views/Panel';
import AdminWhitelist  from './views/AdminWhitelist';

export default function App() {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [view,    setView]    = useState('panel'); // 'panel' | 'whitelist'

  useEffect(() => {
    async function boot() {
      await initFirestore();

      // Dacă URL-ul conține ?code= e callback de la Discord — lasă AuthPage să îl gestioneze
      const params = new URLSearchParams(window.location.search);
      if (params.get('code')) {
        setLoading(false);
        return;
      }

      const session = getSession();
      if (session) {
        // Verifică că userul e încă în whitelist
        const whitelist = await getAll(COL.whitelist);
        const valid     = whitelist.find(w => w.discordId === session.discordId);
        if (valid) {
          setUser(session);
        } else {
          clearSession();
        }
      }
      setLoading(false);
    }
    boot();
  }, []);

  if (loading) {
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
          Se conectează la Firebase...
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage onLogin={setUser} />;

  if (view === 'whitelist' && user.isAdmin) {
    return <AdminWhitelist currentUser={user} onBack={() => setView('panel')} />;
  }

  return (
    <Panel
      currentUser={user}
      onLogout={() => { clearSession(); setUser(null); }}
      onOpenWhitelist={user.isAdmin ? () => setView('whitelist') : null}
    />
  );
}