import { setOne, COL } from './storage';

export async function addLog(action, details, user) {
  const id = String(Date.now()) + Math.random().toString(36).slice(2, 6);
  const entry = {
    id,
    timestamp: new Date().toISOString(),
    action,      // ex: 'LOGIN', 'ADD_MEMBER', 'DELETE_WARNING'
    details,     // ex: 'Ion Popescu a fost adăugat'
    actor: user ? {
      name: user.fullName || user.name || 'Necunoscut',
      rank: user.rank || '—',
      id:   user.id   || '—',
    } : { name: 'Sistem', rank: '—', id: '—' },
  };
  await setOne(COL.logs, id, entry);
}