import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { getAll, setOne, updateOne, deleteOne, deleteWhere, COL } from './storage';
import { addLog } from './logger';

export function useFirestore(currentUser) {
  const [members,       setMembers]       = useState([]);
  const [activities,    setActivities]    = useState([]);
  const [warnings,      setWarnings]      = useState([]);
  const [promotions,    setPromotions]    = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [events,        setEvents]        = useState([]);
  const [infos,         setInfos]         = useState([]);
  const [ready,         setReady]         = useState(false);

useEffect(() => {
  async function load() {
    const [a, w, p, ann, inf] = await Promise.all([
      getAll(COL.activities),
      getAll(COL.warnings),
      getAll(COL.promotions),
      getAll(COL.announcements),
      getAll(COL.infos),
    ]);
    setActivities(a); setWarnings(w);
    setPromotions(p); setAnnouncements(ann); setInfos(inf);
    setReady(true);
  }
  load();

  // ── onSnapshot pentru members — sync real-time ──
  const unsubMembers = onSnapshot(collection(db, COL.members), snap => {
    setMembers(snap.docs.map(d => ({ ...d.data(), id: d.id })));
  });

  // ── onSnapshot pentru events — sync real-time ──
  const unsubEvents = onSnapshot(collection(db, COL.events), snap => {
    setEvents(snap.docs.map(d => ({ ...d.data(), id: d.id })));
  });

  return () => {
    unsubMembers();
    unsubEvents();
  };
}, []);

  // ── MEMBERS ────────────────────────────────────────────
  const saveMember = useCallback(async (member) => {
    await setOne(COL.members, member.id, member);
    const exists = members.find(m => m.id === member.id);
    await addLog(
      exists ? 'EDIT_MEMBER' : 'ADD_MEMBER',
      exists ? `Membrul "${member.name}" a fost modificat` : `Membrul nou "${member.name}" (${member.rank}) a fost adăugat`,
      currentUser
    );
    setMembers(prev => {
      const e = prev.find(m => m.id === member.id);
      return e ? prev.map(m => m.id === member.id ? member : m) : [...prev, member];
    });
  }, [members, currentUser]);

  const updateMember = useCallback(async (id, data) => {
    await updateOne(COL.members, id, data);
    const member = members.find(m => m.id === id);
    const changes = Object.keys(data).map(k => `${k}: ${data[k]}`).join(', ');
    await addLog('UPDATE_MEMBER', `"${member?.name || id}" actualizat — ${changes}`, currentUser);
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
  }, [members, currentUser]);

  const deleteMember = useCallback(async (id) => {
    const member = members.find(m => m.id === id);
    await Promise.all([
      deleteOne(COL.members, id),
      deleteOne(COL.users, id),
      deleteWhere(COL.activities, 'memberId', id),
      deleteWhere(COL.warnings, 'memberId', id),
      deleteWhere(COL.promotions, 'memberId', id),
    ]);
    await addLog('DELETE_MEMBER', `Membrul "${member?.name || id}" (${member?.rank || '—'}) a fost șters`, currentUser);
    setMembers(prev    => prev.filter(m => m.id !== id));
    setActivities(prev => prev.filter(a => a.memberId !== id));
    setWarnings(prev   => prev.filter(w => w.memberId !== id));
    setPromotions(prev => prev.filter(p => p.memberId !== id));
  }, [members, currentUser]);

  // ── ACTIVITIES ─────────────────────────────────────────
  const addActivity = useCallback(async (activity) => {
    const id    = String(Date.now());
    const entry = { ...activity, id };
    await setOne(COL.activities, id, entry);
    await updateOne(COL.members, activity.memberId, {
      activities: (members.find(m => m.id === activity.memberId)?.activities || 0) + 1,
    });
    const memberName = members.find(m => m.id === activity.memberId)?.name || activity.memberId;
    await addLog('ADD_ACTIVITY', `Activitate adăugată pentru "${memberName}": ${activity.type || activity.description || '—'}`, currentUser);
    setActivities(prev => [...prev, entry]);
    setMembers(prev => prev.map(m =>
      m.id === activity.memberId ? { ...m, activities: (m.activities || 0) + 1 } : m
    ));
  }, [members, currentUser]);

  // ── WARNINGS ───────────────────────────────────────────
  const addWarning = useCallback(async (warning) => {
    const id    = String(Date.now());
    const entry = { ...warning, id };
    await setOne(COL.warnings, id, entry);
    const memberName = members.find(m => m.id === warning.memberId)?.name || warning.memberId;
    await addLog('ADD_WARNING', `Avertisment adăugat pentru "${memberName}": ${warning.reason || '—'}`, currentUser);
    setWarnings(prev => [...prev, entry]);
  }, [members, currentUser]);

  // ── PROMOTIONS ─────────────────────────────────────────
  const addPromotion = useCallback(async (promo) => {
    const id    = String(Date.now());
    const entry = { ...promo, id };
    await setOne(COL.promotions, id, entry);
    const memberName = members.find(m => m.id === promo.memberId)?.name || promo.memberId;
    await addLog('ADD_PROMOTION', `"${memberName}" promovat: ${promo.fromRank || '—'} → ${promo.toRank || promo.rank || '—'}`, currentUser);
    setPromotions(prev => [...prev, entry]);
  }, [members, currentUser]);

  // ── ANNOUNCEMENTS ──────────────────────────────────────
  const saveAnnouncement = useCallback(async (ann) => {
    await setOne(COL.announcements, ann.id, ann);
    const exists = announcements.find(a => a.id === ann.id);
    await addLog(
      exists ? 'EDIT_ANNOUNCEMENT' : 'ADD_ANNOUNCEMENT',
      `Anunț "${ann.title}" ${exists ? 'modificat' : 'creat'} de ${ann.author || '—'}`,
      currentUser
    );
    setAnnouncements(prev => {
      const e = prev.find(a => a.id === ann.id);
      return e ? prev.map(a => a.id === ann.id ? ann : a) : [...prev, ann];
    });
  }, [announcements, currentUser]);

  const deleteAnnouncement = useCallback(async (id) => {
    const ann = announcements.find(a => a.id === id);
    await deleteOne(COL.announcements, id);
    await addLog('DELETE_ANNOUNCEMENT', `Anunț "${ann?.title || id}" șters`, currentUser);
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  }, [announcements, currentUser]);

  // ── EVENTS — salvează în Firestore, onSnapshot face sync automat ──
  const saveEvent = useCallback(async (event) => {
    await setOne(COL.events, event.id, event);
    const exists = events.find(e => e.id === event.id);
    await addLog(
      exists ? 'EDIT_EVENT' : 'ADD_EVENT',
      `Eveniment "${event.type || event.title}" ${exists ? 'modificat' : 'postat'} de ${event.responsabil || event.postedBy || '—'}`,
      currentUser
    );
    // NU mai facem setEvents local — onSnapshot se ocupă automat
  }, [events, currentUser]);

  const deleteEvent = useCallback(async (id) => {
    const event = events.find(e => e.id === id);
    await deleteOne(COL.events, id);
    await addLog('DELETE_EVENT', `Eveniment "${event?.type || event?.title || id}" șters`, currentUser);
    // NU mai facem setEvents local — onSnapshot se ocupă automat
  }, [events, currentUser]);

  const updateEvent = useCallback(async (event) => {
    await setOne(COL.events, event.id, event);
    // NU mai facem setEvents local — onSnapshot se ocupă automat
  }, []);

  // ── INFOS ──────────────────────────────────────────────
  const saveInfo = useCallback(async (info) => {
    await setOne(COL.infos, info.id, info);
    const exists = infos.find(i => i.id === info.id);
    await addLog(
      exists ? 'EDIT_INFO' : 'ADD_INFO',
      `Info "${info.title}" (${info.category}) ${exists ? 'modificat' : 'adăugat'} de ${currentUser?.fullName || '—'}`,
      currentUser
    );
    setInfos(prev => {
      const e = prev.find(i => i.id === info.id);
      return e ? prev.map(i => i.id === info.id ? info : i) : [...prev, info];
    });
  }, [infos, currentUser]);

  const deleteInfo = useCallback(async (id) => {
    const info = infos.find(i => i.id === id);
    await deleteOne(COL.infos, id);
    await addLog('DELETE_INFO', `Info "${info?.title || id}" șters`, currentUser);
    setInfos(prev => prev.filter(i => i.id !== id));
  }, [infos, currentUser]);

  // ── ACCESS CODES ───────────────────────────────────────
  const addCode = useCallback(async (code) => {
    const id    = String(Date.now());
    const entry = { ...code, id };
    await setOne(COL.accessCodes, id, entry);
    await addLog('ADD_CODE', `Cod de acces nou generat pentru gradul "${code.rank || '—'}"`, currentUser);
    return entry;
  }, [currentUser]);

  const deleteCode = useCallback(async (codeId, codeObj) => {
    if (codeObj?.used) {
      const users = await getAll(COL.users);
      const user  = users.find(u => u.accessCode === codeObj.code);
      if (user) await deleteMember(user.id);
    }
    await deleteOne(COL.accessCodes, codeId);
    await addLog('DELETE_CODE', `Cod de acces "${codeObj?.code || codeId}" șters${codeObj?.used ? ' (cont asociat eliminat)' : ''}`, currentUser);
  }, [deleteMember, currentUser]);

  return {
    members, activities, warnings, promotions, announcements, events, infos, ready,
    setMembers, setActivities, setWarnings, setPromotions, setAnnouncements, setEvents, setInfos,
    saveMember, updateMember, deleteMember,
    addActivity, addWarning, addPromotion,
    saveAnnouncement, deleteAnnouncement,
    saveEvent, deleteEvent, updateEvent,
    saveInfo, deleteInfo,
    addCode, deleteCode,
  };
}