import React, { useState, useEffect } from 'react';
import { initFirestore, getSession, clearSession, getAll, COL, DC } from './utils/storage';
import AuthPage from './views/AuthPage';
import Panel    from './views/Panel';

export default function App() {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function boot() {
      // Inițializează Firestore cu date implicite dacă e prima rulare
      await initFirestore();

      // Verifică dacă există sesiune salvată local
      const session = getSession();
      if (session) {
        // Verifică că codul de acces al userului e încă valid în Firestore
        const codes = await getAll(COL.accessCodes);
        const valid = codes.find(c => c.code === session.accessCode && !c._deleted);
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
        <div style={{
          width: 48, height: 48,
          background: 'linear-gradient(135deg,#4C1D95,#7C3AED)',
          borderRadius: 14, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontFamily: 'JetBrains Mono, monospace',
          fontWeight: 500, fontSize: 14, color: '#fff', letterSpacing: 1,
          boxShadow: '0 8px 24px rgba(124,58,237,0.4)',
        }}>PR</div>
        <div style={{ color: '#5E5780', fontSize: 12, letterSpacing: '.5px' }}>
          Se conectează la Firebase...
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage onLogin={setUser} />;
  return <Panel currentUser={user} onLogout={() => { clearSession(); setUser(null); }} />;
}