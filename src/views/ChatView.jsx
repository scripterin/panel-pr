import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  collection, addDoc, onSnapshot, orderBy, query,
  serverTimestamp, doc, updateDoc, arrayUnion, getDoc, getDocs
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../utils/firebase';
import { addLog } from '../utils/logger';

/* ─── helpers ─── */
function formatTime(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
}
function formatDate(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' });
}
function sameDay(a, b) {
  if (!a || !b) return false;
  const da = a.toDate ? a.toDate() : new Date(a);
  const db2 = b.toDate ? b.toDate() : new Date(b);
  return da.toDateString() === db2.toDateString();
}

/* ─── Avatar ─── */
function Avatar({ name, size = 34 }) {
  const initials = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const colors = ['#7C3AED','#6D28D9','#4C1D95','#5B21B6','#8B5CF6'];
  const color = colors[(name || '').charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.3,
      background: `linear-gradient(135deg, ${color}cc, ${color})`,
      border: '1.5px solid rgba(124,58,237,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.34, fontWeight: 700, color: '#fff',
      flexShrink: 0, letterSpacing: '-0.5px',
      boxShadow: `0 2px 8px ${color}44`,
    }}>{initials}</div>
  );
}

/* ─── RankBadge inline ─── */
function RBadge({ rank }) {
  const map = {
    'Sef PR':      { bg: 'rgba(124,58,237,0.18)', color: '#A78BFA', icon: '👑' },
    'Adjunct PR':  { bg: 'rgba(59,130,246,0.15)', color: '#93C5FD', icon: '⚡' },
    'Membru PR':   { bg: 'rgba(16,185,129,0.13)', color: '#6EE7B7', icon: '●' },
  };
  const s = map[rank] || { bg: 'rgba(255,255,255,0.07)', color: '#94A3B8', icon: '·' };
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 5,
      background: s.bg, color: s.color, letterSpacing: '.4px', textTransform: 'uppercase',
    }}>{s.icon} {rank}</span>
  );
}

/* ─── Reacted emoji button ─── */
function ReactionPicker({ onPick }) {
  const emojis = ['👍','❤️','😂','😮','🔥','✅'];
  return (
    <div style={{
      display: 'flex', gap: 3, background: 'var(--b2)',
      border: '1px solid var(--br2)', borderRadius: 20,
      padding: '3px 6px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    }}>
      {emojis.map(e => (
        <button key={e} onClick={() => onPick(e)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 16, padding: '2px 3px', borderRadius: 8,
          transition: 'transform .15s',
        }}
          onMouseEnter={el => el.currentTarget.style.transform = 'scale(1.3)'}
          onMouseLeave={el => el.currentTarget.style.transform = 'scale(1)'}
        >{e}</button>
      ))}
    </div>
  );
}

/* ─── Single Message ─── */
function Message({ msg, currentUser, allMembers, onReply, onReact, isOwn }) {
  const [hover, setHover] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const replyMsg = msg.replyTo;
  const reactions = msg.reactions || {};

  return (
    <div
      style={{
        display: 'flex', flexDirection: isOwn ? 'row-reverse' : 'row',
        gap: 9, alignItems: 'flex-end', marginBottom: 2,
        animation: 'msgIn .2s ease',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setShowPicker(false); }}
    >
      {!isOwn && <Avatar name={msg.senderName} size={32} />}

      <div style={{ maxWidth: '68%', minWidth: 80 }}>
        {!isOwn && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, paddingLeft: 2 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--t)', fontFamily: 'Space Grotesk, sans-serif' }}>
              {msg.callsign || '—'} {msg.senderName}
            </span>
            <RBadge rank={msg.senderRank} />
          </div>
        )}

        {replyMsg && (
          <div style={{
            background: 'rgba(124,58,237,0.08)', borderLeft: '2px solid var(--p)',
            borderRadius: '6px 6px 0 0', padding: '5px 10px', marginBottom: -4,
            fontSize: 11, color: 'var(--t3)', maxWidth: '100%',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            <span style={{ color: 'var(--p3)', fontWeight: 600 }}>↩ {replyMsg.senderName}: </span>
            {replyMsg.text || (replyMsg.imageUrl ? '📷 Imagine' : replyMsg.audioUrl ? '🎙️ Mesaj vocal' : '...')}
          </div>
        )}

        <div style={{
          background: isOwn ? 'linear-gradient(135deg, var(--pd), var(--p))' : 'var(--b3)',
          border: isOwn ? '1px solid rgba(124,58,237,0.4)' : '1px solid var(--br)',
          borderRadius: '12px 4px 12px 12px',
          padding: msg.imageUrl ? '4px' : '9px 12px',
          boxShadow: isOwn ? '0 4px 16px rgba(124,58,237,0.25)' : '0 2px 8px rgba(0,0,0,0.2)',
          position: 'relative',
        }}>
          {msg.imageUrl && (
            <img src={msg.imageUrl} alt="img"
              style={{ maxWidth: 260, maxHeight: 200, borderRadius: 8, display: 'block', cursor: 'pointer' }}
              onClick={() => window.open(msg.imageUrl, '_blank')}
            />
          )}
          {msg.audioUrl && (
            <audio controls src={msg.audioUrl} style={{ height: 32, width: 220, filter: 'invert(0.8) hue-rotate(200deg)' }} />
          )}
          {msg.text && (
            <div style={{ fontSize: 13, color: isOwn ? '#fff' : 'var(--t)', lineHeight: 1.55, wordBreak: 'break-word', fontFamily: 'Space Grotesk, sans-serif' }}>
              {msg.text.split(/(@\w[\w\s]*?)(?=\s|$|@)/g).map((part, i) =>
                part.startsWith('@')
                  ? <span key={i} style={{ color: '#C4B5FD', fontWeight: 700, background: 'rgba(124,58,237,0.15)', borderRadius: 4, padding: '0 3px' }}>{part}</span>
                  : <span key={i}>{part}</span>
              )}
            </div>
          )}
          <div style={{ fontSize: 9, color: isOwn ? 'rgba(255,255,255,0.55)' : 'var(--t3)', textAlign: 'right', marginTop: msg.text ? 3 : 5, letterSpacing: '.3px' }}>
            {formatTime(msg.createdAt)}
          </div>
        </div>

        {Object.keys(reactions).length > 0 && (
          <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap', justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
            {Object.entries(reactions).map(([emoji, users]) => (
              <button key={emoji} onClick={() => onReact(msg.id, emoji)}
                style={{
                  background: users.includes(currentUser.id) ? 'rgba(124,58,237,0.2)' : 'var(--b3)',
                  border: users.includes(currentUser.id) ? '1px solid rgba(124,58,237,0.4)' : '1px solid var(--br)',
                  borderRadius: 10, padding: '2px 7px', cursor: 'pointer',
                  fontSize: 11, color: 'var(--t2)', display: 'flex', alignItems: 'center', gap: 3,
                }}>
                {emoji} <span style={{ fontSize: 10 }}>{users.length}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {hover && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignSelf: 'center', position: 'relative' }}>
          <button onClick={() => onReply(msg)} title="Reply"
            style={{ background: 'var(--b3)', border: '1px solid var(--br)', borderRadius: 7, padding: '4px 7px', cursor: 'pointer', fontSize: 13, color: 'var(--t3)', transition: 'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--p3)'; e.currentTarget.style.borderColor = 'var(--p2)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--t3)'; e.currentTarget.style.borderColor = 'var(--br)'; }}
          >↩</button>
          <button onClick={() => setShowPicker(p => !p)} title="Reacție"
            style={{ background: 'var(--b3)', border: '1px solid var(--br)', borderRadius: 7, padding: '4px 7px', cursor: 'pointer', fontSize: 13, color: 'var(--t3)', transition: 'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--p3)'; e.currentTarget.style.borderColor = 'var(--p2)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--t3)'; e.currentTarget.style.borderColor = 'var(--br)'; }}
          >😊</button>
          {showPicker && (
            <div style={{ position: 'absolute', [isOwn ? 'right' : 'left']: '110%', top: 0, zIndex: 100 }}>
              <ReactionPicker onPick={emoji => { onReact(msg.id, emoji); setShowPicker(false); }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── MAIN ChatView ─── */
export default function ChatView({ currentUser }) {
  const [messages,    setMessages]    = useState([]);
  const [text,        setText]        = useState('');
  const [replyTo,     setReplyTo]     = useState(null);
  const [members,     setMembers]     = useState([]);
  const [showMention, setShowMention] = useState(false);
  const [mentionQ,    setMentionQ]    = useState('');
  const [recording,   setRecording]   = useState(false);
  const [uploading,   setUploading]   = useState(false);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const mediaRef  = useRef(null);
  const chunksRef = useRef([]);
  const fileRef   = useRef(null);

  useEffect(() => {
    getDocs(collection(db, 'members')).then(snap => {
      setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'chat'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleTextChange(e) {
    const val = e.target.value;
    setText(val);
    const match = val.match(/@(\w*)$/);
    if (match) { setMentionQ(match[1].toLowerCase()); setShowMention(true); }
    else setShowMention(false);
  }

  function insertMention(name) {
    setText(text.replace(/@(\w*)$/, `@${name} `));
    setShowMention(false);
    inputRef.current?.focus();
  }

  async function sendText() {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText('');
    setReplyTo(null);
    setShowMention(false);
    await addDoc(collection(db, 'chat'), {
      text: trimmed,
      senderId:   currentUser.id,
      senderName: currentUser.fullName,
      senderRank: currentUser.rank,
      callsign:   currentUser.faction || currentUser.charId || '—',
      replyTo:    replyTo ? { id: replyTo.id, senderName: replyTo.senderName, text: replyTo.text, imageUrl: replyTo.imageUrl || null, audioUrl: replyTo.audioUrl || null } : null,
      reactions:  {},
      createdAt:  serverTimestamp(),
    });
    await addLog('SEND_MESSAGE', `${currentUser.fullName} a trimis un mesaj în Chat PR`, currentUser);
  }

  async function sendImage(file) {
    if (!file) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, `chat/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await addDoc(collection(db, 'chat'), {
        imageUrl:   url,
        text:       '',
        senderId:   currentUser.id,
        senderName: currentUser.fullName,
        senderRank: currentUser.rank,
        callsign:   currentUser.faction || currentUser.charId || '—',
        replyTo:    replyTo ? { id: replyTo.id, senderName: replyTo.senderName, text: replyTo.text } : null,
        reactions:  {},
        createdAt:  serverTimestamp(),
      });
      await addLog('SEND_IMAGE', `${currentUser.fullName} a trimis o imagine în Chat PR`, currentUser);
      setReplyTo(null);
    } finally {
      setUploading(false);
    }
  }

  async function toggleRecording() {
    if (recording) { mediaRef.current?.stop(); setRecording(false); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setUploading(true);
        try {
          const storageRef = ref(storage, `chat/audio_${Date.now()}.webm`);
          await uploadBytes(storageRef, blob);
          const url = await getDownloadURL(storageRef);
          await addDoc(collection(db, 'chat'), {
            audioUrl:   url,
            text:       '',
            senderId:   currentUser.id,
            senderName: currentUser.fullName,
            senderRank: currentUser.rank,
            callsign:   currentUser.faction || currentUser.charId || '—',
            replyTo:    replyTo ? { id: replyTo.id, senderName: replyTo.senderName, text: replyTo.text } : null,
            reactions:  {},
            createdAt:  serverTimestamp(),
          });
          await addLog('SEND_AUDIO', `${currentUser.fullName} a trimis un mesaj vocal în Chat PR`, currentUser);
          setReplyTo(null);
        } finally {
          setUploading(false);
        }
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
    } catch {
      alert('Nu s-a putut accesa microfonul.');
    }
  }

  async function handleReact(msgId, emoji) {
    const msgRef = doc(db, 'chat', msgId);
    const snap = await getDoc(msgRef);
    if (!snap.exists()) return;
    const data = snap.data();
    const reactions = { ...(data.reactions || {}) };
    const users = reactions[emoji] || [];
    if (users.includes(currentUser.id)) {
      reactions[emoji] = users.filter(u => u !== currentUser.id);
      if (reactions[emoji].length === 0) delete reactions[emoji];
    } else {
      reactions[emoji] = [...users, currentUser.id];
    }
    await updateDoc(msgRef, { reactions });
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendText(); }
    if (e.key === 'Escape') { setReplyTo(null); setShowMention(false); }
  }

  const grouped = [];
  messages.forEach((msg, i) => {
    const prev = messages[i - 1];
    if (!prev || !sameDay(prev.createdAt, msg.createdAt)) {
      grouped.push({ type: 'date', ts: msg.createdAt, key: 'date_' + i });
    }
    grouped.push({ type: 'msg', msg, key: msg.id });
  });

  const filteredMembers = members.filter(m =>
    m.fullName?.toLowerCase().includes(mentionQ) && m.id !== currentUser.id
  ).slice(0, 6);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: 'calc(100vh - 90px)',
      background: 'var(--b1)', borderRadius: 18,
      border: '1px solid var(--br2)', overflow: 'hidden',
      boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
    }}>
      <style>{`
        @keyframes msgIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .chat-input:focus { outline: none; border-color: var(--p2) !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.12) !important; }
        .chat-input::placeholder { color: var(--t3); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--br2); border-radius: 4px; }
      `}</style>

      {/* Header */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--br)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--b2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, var(--pd), var(--p))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>💬</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t)', fontFamily: 'Space Grotesk, sans-serif' }}>Chat PR</div>
            <div style={{ fontSize: 11, color: 'var(--t3)' }}>{members.length || '—'} membri · canal general</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block', boxShadow: '0 0 6px #10B981' }} />
          <span style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>Live</span>
        </div>
      </div>

      {/* Messages area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {grouped.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: 0.5 }}>
            <div style={{ fontSize: 40 }}>💬</div>
            <div style={{ fontSize: 13, color: 'var(--t3)', fontFamily: 'Space Grotesk, sans-serif' }}>Niciun mesaj încă. Fii primul care scrie!</div>
          </div>
        )}
        {grouped.map(item => {
          if (item.type === 'date') return (
            <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '8px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--br)' }} />
              <span style={{ fontSize: 10, color: 'var(--t3)', fontWeight: 600, letterSpacing: '.5px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{formatDate(item.ts)}</span>
              <div style={{ flex: 1, height: 1, background: 'var(--br)' }} />
            </div>
          );
          const msg = item.msg;
          const isOwn = msg.senderId === currentUser.id;
          return <Message key={item.key} msg={msg} currentUser={currentUser} allMembers={members} onReply={setReplyTo} onReact={handleReact} isOwn={isOwn} />;
        })}
        <div ref={bottomRef} />
      </div>

      {/* Reply banner */}
      {replyTo && (
        <div style={{ padding: '8px 20px', background: 'rgba(124,58,237,0.08)', borderTop: '1px solid rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 12, color: 'var(--t3)' }}>
            <span style={{ color: 'var(--p3)', fontWeight: 600 }}>↩ Răspunzi lui {replyTo.senderName}: </span>
            <span style={{ color: 'var(--t2)' }}>{replyTo.text || (replyTo.imageUrl ? '📷 Imagine' : '🎙️ Vocal')}</span>
          </div>
          <button onClick={() => setReplyTo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', fontSize: 16, lineHeight: 1 }}>×</button>
        </div>
      )}

      {/* Mention dropdown */}
      {showMention && filteredMembers.length > 0 && (
        <div style={{ margin: '0 20px', background: 'var(--b2)', border: '1px solid var(--br2)', borderRadius: 10, overflow: 'hidden', boxShadow: '0 -8px 24px rgba(0,0,0,0.3)' }}>
          {filteredMembers.map(m => (
            <div key={m.id} onClick={() => insertMention(m.fullName)}
              style={{ padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'background .15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Avatar name={m.fullName} size={26} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--t)' }}>{m.fullName}</span>
              <RBadge rank={m.rank} />
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--br)', background: 'var(--b2)', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <input type="file" accept="image/*" ref={fileRef} style={{ display: 'none' }}
          onChange={e => { sendImage(e.target.files[0]); e.target.value = ''; }} />
        <button onClick={() => fileRef.current?.click()} disabled={uploading} title="Trimite imagine"
          style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: 'var(--b3)', border: '1px solid var(--br)', cursor: 'pointer', fontSize: 16, color: 'var(--t3)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--p2)'; e.currentTarget.style.color = 'var(--p3)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--br)'; e.currentTarget.style.color = 'var(--t3)'; }}
        >📷</button>

        <button onClick={toggleRecording} title={recording ? 'Stop înregistrare' : 'Înregistrează vocal'}
          style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: recording ? 'rgba(239,68,68,0.15)' : 'var(--b3)', border: recording ? '1px solid rgba(239,68,68,0.4)' : '1px solid var(--br)', cursor: 'pointer', fontSize: 16, color: recording ? '#FCA5A5' : 'var(--t3)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}
        >{recording ? '⏹️' : '🎙️'}</button>

        <div style={{ flex: 1, position: 'relative' }}>
          <textarea
            ref={inputRef}
            className="chat-input"
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKey}
            placeholder="Scrie un mesaj... (@ pentru a menționa)"
            rows={1}
            style={{ width: '100%', resize: 'none', padding: '9px 14px', background: 'var(--b3)', border: '1px solid var(--br)', borderRadius: 10, color: 'var(--t)', fontSize: 13, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.5, boxSizing: 'border-box', maxHeight: 100, overflowY: 'auto', transition: 'border-color .2s, box-shadow .2s' }}
          />
        </div>

        <button onClick={sendText} disabled={!text.trim() || uploading}
          style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: text.trim() ? 'linear-gradient(135deg, var(--pd), var(--p))' : 'var(--b3)', border: text.trim() ? '1px solid rgba(124,58,237,0.4)' : '1px solid var(--br)', cursor: text.trim() ? 'pointer' : 'not-allowed', fontSize: 16, color: text.trim() ? '#fff' : 'var(--t3)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s', boxShadow: text.trim() ? '0 4px 12px rgba(124,58,237,0.3)' : 'none' }}
        >➤</button>
      </div>

      {uploading && (
        <div style={{ padding: '6px 20px', background: 'rgba(124,58,237,0.08)', borderTop: '1px solid rgba(124,58,237,0.1)', fontSize: 11, color: 'var(--p3)', textAlign: 'center' }}>
          Se încarcă fișierul...
        </div>
      )}
    </div>
  );
}