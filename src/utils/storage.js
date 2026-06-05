import {
  doc, getDoc, setDoc, updateDoc,
  collection, getDocs, deleteDoc,
  query, where,
} from 'firebase/firestore';
import { db } from './firebase';

export const COL = {
  members:       'members',
  activities:    'activities',
  accessCodes:   'accessCodes',
  users:         'users',
  announcements: 'announcements',
  warnings:      'warnings',
  promotions:    'promotions',
  logs:          'logs',
  events:        'events',
  infos:         'infos', 
  config:        'config',
};

export const DC = [
  { code: '', rank: 'Sef PR',     used: false, id: '1' },
  { code: '', rank: 'Adjunct PR', used: false, id: '2' },
  { code: '', rank: 'Membru PR',  used: false, id: '3' },
  { code: '', rank: 'Membru PR',  used: false, id: '4' },
  { code: '', rank: 'Membru PR',  used: false, id: '5' },
  { code: '', rank: 'Membru PR',  used: false, id: '6' },
  { code: '', rank: 'Membru PR',  used: false, id: '7' },
];

export const DA = [
  {
    id: '1',
    title: 'Bun venit în panelul PR v4!',
    body: 'Sistem actualizat cu Firebase — datele sunt salvate în cloud.',
    author: 'Administrator',
    date: new Date().toLocaleDateString('ro-RO'),
    pinned: true,
  },
];

export async function getAll(colName) {
  try {
    const snap = await getDocs(collection(db, colName));
    return snap.docs.map(d => ({ ...d.data(), id: d.id }));
  } catch (e) {
    console.error('getAll error', colName, e);
    return [];
  }
}

export async function getOne(colName, id) {
  try {
    const snap = await getDoc(doc(db, colName, String(id)));
    return snap.exists() ? { ...snap.data(), id: snap.id } : null;
  } catch (e) {
    console.error('getOne error', colName, id, e);
    return null;
  }
}

export async function setOne(colName, id, data) {
  try {
    await setDoc(doc(db, colName, String(id)), data);
    return true;
  } catch (e) {
    console.error('setOne error', colName, id, e);
    return false;
  }
}

export async function updateOne(colName, id, data) {
  try {
    await updateDoc(doc(db, colName, String(id)), data);
    return true;
  } catch (e) {
    console.error('updateOne error', colName, id, e);
    return false;
  }
}

export async function deleteOne(colName, id) {
  try {
    await deleteDoc(doc(db, colName, String(id)));
    return true;
  } catch (e) {
    console.error('deleteOne error', colName, id, e);
    return false;
  }
}

export async function deleteWhere(colName, field, value) {
  try {
    const q    = query(collection(db, colName), where(field, '==', value));
    const snap = await getDocs(q);
    await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
    return true;
  } catch (e) {
    console.error('deleteWhere error', colName, field, value, e);
    return false;
  }
}

export async function initFirestore() {
  const codes = await getAll(COL.accessCodes);
  if (codes.length === 0) {
    await Promise.all(DC.map(c => setOne(COL.accessCodes, c.id, c)));
  }
  const anns = await getAll(COL.announcements);
  if (anns.length === 0) {
    await Promise.all(DA.map(a => setOne(COL.announcements, a.id, a)));
  }
}

export function getSession() {
  try { const v = localStorage.getItem('pr_session'); return v ? JSON.parse(v) : null; } catch { return null; }
}
export function setSession(user) {
  try { localStorage.setItem('pr_session', JSON.stringify(user)); } catch {}
}
export function clearSession() {
  try { localStorage.removeItem('pr_session'); } catch {}
}
export function getSavedLogin() {
  try { const v = localStorage.getItem('pr_saved_login'); return v ? JSON.parse(v) : null; } catch { return null; }
}
export function setSavedLogin(data) {
  try { localStorage.setItem('pr_saved_login', JSON.stringify(data)); } catch {}
}
export function clearSavedLogin() {
  try { localStorage.removeItem('pr_saved_login'); } catch {}
}
export function getLastAnnSeen(userId) {
  try { const v = localStorage.getItem('pr_last_ann_' + userId); return v ? parseInt(v) : 0; } catch { return 0; }
}
export function setLastAnnSeen(userId, val) {
  try { localStorage.setItem('pr_last_ann_' + userId, String(val)); } catch {}
}