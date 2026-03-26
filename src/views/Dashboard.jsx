import React, { useState, useEffect } from 'react';
import RankBadge  from '../components/RankBadge';
import StatusPill from '../components/StatusPill';
import { getWeekStart, inDateRange } from '../utils/helpers';
import { db } from '../utils/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

/* ── Material Symbols helper ── */
const Icon = ({ name, fill = 0, size = 20, className = '' }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{ fontSize: size, fontVariationSettings: `'FILL' ${fill}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}
  >
    {name}
  </span>
);

const TAG_CONFIG = {
  'Nou':          { color: 'text-emerald-400',  bg: 'bg-emerald-400/10',  border: 'border-emerald-400',  dot: 'bg-emerald-400'  },
  'Îmbunătățit':  { color: 'text-blue-400',     bg: 'bg-blue-400/10',     border: 'border-blue-400',     dot: 'bg-blue-400'     },
  'Fix':          { color: 'text-amber-400',    bg: 'bg-amber-400/10',    border: 'border-amber-400',    dot: 'bg-amber-400'    },
  'Eliminat':     { color: 'text-red-400',      bg: 'bg-red-400/10',      border: 'border-red-400',      dot: 'bg-red-400'      },
  'Anunț':        { color: 'text-[#D2BBFF]',   bg: 'bg-[#D2BBFF]/10',   border: 'border-[#D2BBFF]',   dot: 'bg-[#D2BBFF]'   },
};

/* ── MODAL ── */
function AddUpdateModal({ currentUser, onClose, onSave }) {
  const [title,   setTitle]   = useState('');
  const [desc,    setDesc]    = useState('');
  const [tag,     setTag]     = useState('Nou');
  const [version, setVersion] = useState('');
  const [err,     setErr]     = useState('');

  async function save() {
    if (!title.trim()) { setErr('Titlul este obligatoriu!'); return; }
    if (!desc.trim())  { setErr('Descrierea este obligatorie!'); return; }
    await onSave({ title: title.trim(), desc: desc.trim(), tag, version: version.trim(), autor: currentUser.fullName || currentUser.name });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[2000] bg-black/75 backdrop-blur-md flex items-center justify-center px-4">
      <div className="bg-[#1f1f24] border border-[#7C3AED]/25 rounded-2xl p-7 w-full max-w-[480px] shadow-[0_30px_80px_rgba(0,0,0,0.7)]">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-[#7C3AED]/10 border border-[#7C3AED]/20 flex items-center justify-center">
            <Icon name="add" className="text-[#D2BBFF]" size={18} />
          </div>
          <div>
            <p className="font-['Space_Grotesk'] font-bold text-[15px] text-[#F1F0FF]">Adaugă Actualizare</p>
            <p className="text-[11px] text-[#958DA1]">Completează detaliile noii actualizări</p>
          </div>
        </div>

        {err && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-[11px] text-red-300 mb-4">⚠️ {err}</div>
        )}

        <div className="flex flex-col gap-3">
          {/* Title + Version */}
          <div className="grid grid-cols-[1fr_auto] gap-2.5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#958DA1] mb-1.5">Titlu *</label>
              <input
                className="w-full bg-[#2a292f] border border-white/[0.07] rounded-lg px-3 py-2 text-[12px] text-[#F1F0FF] font-['Space_Grotesk'] outline-none focus:border-[#7C3AED]/50 transition-colors placeholder:text-[#4a4455]"
                placeholder="ex: Sistem Sancțiuni"
                value={title}
                onChange={e => { setTitle(e.target.value); setErr(''); }}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#958DA1] mb-1.5">Versiune</label>
              <input
                className="w-[90px] bg-[#2a292f] border border-white/[0.07] rounded-lg px-3 py-2 text-[12px] text-[#F1F0FF] font-['JetBrains_Mono'] outline-none focus:border-[#7C3AED]/50 transition-colors placeholder:text-[#4a4455]"
                placeholder="v1.2"
                value={version}
                onChange={e => setVersion(e.target.value)}
              />
            </div>
          </div>

          {/* Tag selector */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#958DA1] mb-1.5">Tip</label>
            <div className="flex gap-1.5 flex-wrap">
              {Object.entries(TAG_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setTag(key)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold font-['Space_Grotesk'] border transition-all
                    ${tag === key
                      ? `${cfg.bg} ${cfg.border} ${cfg.color}`
                      : 'bg-[#2a292f] border-white/[0.07] text-[#958DA1] hover:border-white/20'}`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#958DA1] mb-1.5">Descriere *</label>
            <textarea
              rows={3}
              className="w-full bg-[#2a292f] border border-white/[0.07] rounded-lg px-3 py-2 text-[12px] text-[#F1F0FF] font-['Space_Grotesk'] outline-none focus:border-[#7C3AED]/50 transition-colors resize-y min-h-[80px] leading-relaxed placeholder:text-[#4a4455]"
              placeholder="Descrie ce s-a schimbat..."
              value={desc}
              onChange={e => { setDesc(e.target.value); setErr(''); }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2.5 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-[#2a292f] border border-white/[0.07] text-[#9B99B8] text-[13px] font-bold font-['Space_Grotesk'] hover:bg-[#35343a] transition-colors"
          >
            Anulează
          </button>
          <button
            onClick={save}
            className="flex-1 py-2.5 rounded-xl bg-[#7C3AED] border border-[#7C3AED]/40 text-white text-[13px] font-bold font-['Space_Grotesk'] hover:bg-[#6D28D9] transition-colors shadow-[0_4px_20px_rgba(124,58,237,0.3)]"
          >
            ✅ Publică Actualizarea
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── RANK COLOR MAP ── */
const RANK_COLOR = {
  'Supervizor PR':     'text-[#D2BBFF]',
  'Conducere Spital':  'text-blue-400',
  'Sef PR':            'text-amber-400',
  'Adjunct PR':        'text-blue-300',
  'Membru PR':         'text-[#D2BBFF]',
};

/* ── MAIN DASHBOARD ── */
export default function Dashboard({ members, activities, announcements, warnings, setView, setSelMember, currentUser, isSef }) {
  const total    = members.length;
  const activ    = members.filter(m => m.status === 'activ').length;
  const sup      = members.filter(m => m.rank === 'Supervizor PR').length;
  const cond     = members.filter(m => m.rank === 'Conducere Spital').length;
  const sef      = members.filter(m => m.rank === 'Sef PR').length;
  const adj      = members.filter(m => m.rank === 'Adjunct PR').length;
  const mem      = members.filter(m => m.rank === 'Membru PR').length;
  const maxB     = Math.max(1, total);

  const EXCLUDED_RANKS = ['Supervizor PR', 'Conducere Spital'];
  const top    = [...members].filter(m => !EXCLUDED_RANKS.includes(m.rank)).sort((a, b) => b.activities - a.activities).slice(0, 5);
  const medals = ['🥇', '🥈', '🥉', '4.', '5.'];
  const pinned = announcements.filter(a => a.pinned);

  const weekStart = getWeekStart();
  const weekEnd   = new Date(weekStart.getTime() + 7 * 86400000);
  const weekActs  = activities.filter(a => inDateRange(a.date, weekStart, weekEnd));

  const [updates,  setUpdates]  = useState([]);
  const [addModal, setAddModal] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'updates'), snap => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setUpdates(docs);
    });
    return unsub;
  }, []);

  async function handleAdd(data) {
    try { await addDoc(collection(db, 'updates'), { ...data, date: new Date().toLocaleDateString('ro-RO'), createdAt: serverTimestamp() }); }
    catch(e) { console.error(e); }
  }

  async function handleDelete(id) {
    try { await deleteDoc(doc(db, 'updates', id)); }
    catch(e) { console.error(e); }
  }

  const GRADE_BARS = [
    { label: 'Supervizor PR',    count: sup,  colorClass: 'bg-[#D2BBFF]', dotClass: 'bg-[#D2BBFF]', textClass: 'text-[#D2BBFF]' },
    { label: 'Conducere Spital', count: cond, colorClass: 'bg-blue-400',  dotClass: 'bg-blue-400',  textClass: 'text-blue-400'  },
    { label: 'Șef PR',           count: sef,  colorClass: 'bg-amber-400', dotClass: 'bg-amber-400', textClass: 'text-amber-400' },
    { label: 'Adjunct PR',       count: adj,  colorClass: 'bg-emerald-400',dotClass:'bg-emerald-400',textClass:'text-emerald-400'},
    { label: 'Membru PR',        count: mem,  colorClass: 'bg-[#D2BBFF]', dotClass: 'bg-[#D2BBFF]', textClass: 'text-[#958DA1]' },
  ];

  return (
    <div className="space-y-5">
      {addModal && <AddUpdateModal currentUser={currentUser} onClose={() => setAddModal(false)} onSave={handleAdd} />}

      {/* ── ALERT BANNER ── */}
      {pinned.length > 0 && (
        <div className="relative overflow-hidden rounded-xl bg-[#7C3AED]/10 border-l-4 border-[#7C3AED] p-4 flex items-start gap-3">
          <Icon name="campaign" className="text-[#D2BBFF] shrink-0" size={20} />
          <div className="space-y-1">
            <p className="font-['Space_Grotesk'] font-bold text-sm tracking-tight text-[#D2BBFF]">{pinned[0].title}</p>
            <p className="text-xs text-[#9B99B8] leading-relaxed">{pinned[0].body}</p>
          </div>
        </div>
      )}

      {/* ── STATS GRID ── */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Total Membri',    value: total,          icon: 'groups',       iconColor: 'text-[#D2BBFF]', bgColor: 'bg-[#D2BBFF]/10',  valColor: 'text-[#D2BBFF]'  },
          { label: 'Membri Activi',   value: activ,          icon: 'bolt',         iconColor: 'text-emerald-400', bgColor: 'bg-emerald-500/10', valColor: 'text-emerald-400' },
          { label: 'Conducere PR',    value: sef + adj,      icon: 'shield_person', iconColor: 'text-blue-400',  bgColor: 'bg-blue-500/10',    valColor: 'text-blue-400'    },
          { label: 'Evenimente Săpt.',value: weekActs.length, icon: 'event',        iconColor: 'text-amber-400', bgColor: 'bg-amber-500/10',   valColor: 'text-amber-400'   },
        ].map(s => (
          <div key={s.label} className="bg-[#2a292f] rounded-xl p-4 flex flex-col justify-between aspect-square">
            <div className={`w-8 h-8 rounded-lg ${s.bgColor} flex items-center justify-center`}>
              <Icon name={s.icon} className={s.iconColor} size={18} fill={1} />
            </div>
            <div>
              <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest text-[#958DA1] block mb-1">{s.label}</span>
              <span className={`font-['Space_Grotesk'] text-3xl font-bold tracking-tight ${s.valColor}`}>
                {String(s.value).padStart(2, '0')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── MEMBRI RECENȚI ── */}
      <section className="bg-[#2a292f] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-['Space_Grotesk'] text-base font-bold tracking-tight text-[#F1F0FF]">Membri Recenți</h2>
          <button onClick={() => setView('members')} className="text-[11px] text-[#D2BBFF] font-['Space_Grotesk'] font-semibold hover:opacity-75 transition-opacity">
            Vezi toți →
          </button>
        </div>

        {!members.length ? (
          <div className="py-8 text-center space-y-2">
            <Icon name="person" className="text-[#4a4455] mx-auto" size={32} />
            <p className="text-[#958DA1] text-sm">Niciun membru adăugat</p>
            <p className="text-[#4a4455] text-xs">Apasă "+ Adaugă Membru" pentru a începe</p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.slice(0, 6).map(m => (
              <div key={m.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#1f1f24] flex items-center justify-center shrink-0">
                    <Icon name="person" className="text-[#958DA1]" size={20} />
                  </div>
                  <div>
                    <p className="font-['Space_Grotesk'] font-semibold text-sm text-[#F1F0FF]">{m.name}</p>
                    <span className={`inline-flex px-2 py-0.5 rounded-full bg-[#1f1f24] text-[10px] font-bold uppercase font-['Space_Grotesk'] ${RANK_COLOR[m.rank] || 'text-[#D2BBFF]'}`}>
                      {m.rank}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase font-['Space_Grotesk'] ${m.status === 'activ' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[#35343a] text-[#958DA1]'}`}>
                    {m.status}
                  </span>
                  <span className="font-['Space_Grotesk'] font-bold text-sm text-[#D2BBFF] min-w-[24px] text-right">{m.activities}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── ANUNȚURI ── */}
      <section className="bg-[#2a292f] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-['Space_Grotesk'] text-base font-bold tracking-tight text-[#F1F0FF]">Anunțuri</h2>
          <button onClick={() => setView('announcements')} className="text-[11px] text-[#D2BBFF] font-['Space_Grotesk'] font-semibold hover:opacity-75 transition-opacity">
            Toate →
          </button>
        </div>

        {!announcements.length ? (
          <div className="py-6 text-center text-[#958DA1] text-sm">Niciun anunț</div>
        ) : (
          <div className="space-y-1">
            {announcements.slice(0, 3).map((a, i) => (
              <div key={i} className="flex gap-3 items-start p-3 rounded-xl hover:bg-white/[0.03] transition-colors">
                <Icon name={a.pinned ? 'push_pin' : 'notifications_active'} className="text-[#D2BBFF] shrink-0 mt-0.5" size={18} fill={a.pinned ? 1 : 0} />
                <div className="space-y-0.5 min-w-0">
                  <p className="font-['Space_Grotesk'] font-bold text-sm text-[#F1F0FF]">{a.title}</p>
                  <p className="text-xs text-[#958DA1] line-clamp-1">{a.body}</p>
                  <span className="block font-['JetBrains_Mono'] text-[9px] text-[#D2BBFF]/60 uppercase tracking-widest">{a.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── DISTRIBUȚIE GRADE ── */}
      <section className="bg-[#2a292f] rounded-xl p-5">
        <h2 className="font-['Space_Grotesk'] text-base font-bold tracking-tight text-[#F1F0FF] mb-5">Distribuție Grade</h2>
        <div className="space-y-4">
          {GRADE_BARS.map(g => (
            <div key={g.label} className="space-y-1.5">
              <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-[#958DA1]">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${g.dotClass}`} />
                  <span>{g.label}</span>
                </div>
                <span className={g.textClass}>{g.count}</span>
              </div>
              <div className="h-1.5 w-full bg-[#35343a] rounded-full overflow-hidden">
                <div
                  className={`h-full ${g.colorClass} rounded-full transition-all duration-700`}
                  style={{ width: Math.round(g.count / maxB * 100) + '%' }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TOP EVENIMENTE ── */}
      <section className="bg-[#2a292f] rounded-xl p-5">
        <h2 className="font-['Space_Grotesk'] text-base font-bold tracking-tight text-[#F1F0FF] mb-4">TOP EVENIMENTE</h2>
        {!top.length ? (
          <div className="py-6 text-center text-[#958DA1] text-sm">Nicio activitate</div>
        ) : (
          <div className="space-y-2">
            {top.map((m, i) => (
              <div
                key={m.id}
                className={`flex items-center justify-between p-3 rounded-lg ${i === 0 ? 'bg-[#131318]' : 'bg-[#131318]/50'} ${i >= 3 ? 'opacity-70' : ''}`}
              >
                <div className="flex items-center gap-3">
                  {i < 3
                    ? <span className="text-lg">{medals[i]}</span>
                    : <span className="font-['JetBrains_Mono'] text-xs text-[#958DA1] pl-1">{medals[i]}</span>
                  }
                  <span className="font-['Space_Grotesk'] font-medium text-sm text-[#F1F0FF]">{m.name}</span>
                </div>
                <span className={`font-['Space_Grotesk'] font-bold text-sm ${i >= 3 ? 'text-[#D2BBFF]/70' : 'text-[#D2BBFF]'}`}>
                  {m.activities} activ.
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── ACTUALIZĂRI SISTEM ── */}
      <section className="bg-[#2a292f] rounded-xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-['Space_Grotesk'] text-base font-bold tracking-tight text-[#F1F0FF]">Actualizări Sistem</h2>
          {isSef && (
            <button
              onClick={() => setAddModal(true)}
              className="px-3 py-1.5 rounded-lg border border-[#7C3AED]/40 text-[#D2BBFF] font-['Space_Grotesk'] text-xs font-bold hover:bg-[#7C3AED]/10 active:scale-95 transition-all"
            >
              + Adaugă
            </button>
          )}
        </div>

        {!updates.length ? (
          <div className="py-8 text-center space-y-2">
            <span className="text-2xl block">⚡</span>
            <p className="text-[#958DA1] text-sm">Nicio actualizare publicată</p>
            {isSef && <p className="text-[#4a4455] text-xs">Apasă „Adaugă" pentru a publica prima actualizare</p>}
          </div>
        ) : (
          <div className="space-y-5">
            {updates.map(u => {
              const tagCfg = TAG_CONFIG[u.tag] || TAG_CONFIG['Anunț'];
              return (
                <div key={u.id} className={`relative pl-4 border-l-2 ${tagCfg.border}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 ${tagCfg.bg} ${tagCfg.color} text-[9px] font-bold rounded uppercase font-['Space_Grotesk']`}>
                        {u.tag}
                      </span>
                      {u.version && (
                        <span className="font-['JetBrains_Mono'] text-[10px] text-[#958DA1]">{u.version}</span>
                      )}
                    </div>
                    {isSef && (
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="text-red-400/40 hover:text-red-400 transition-colors"
                        title="Șterge actualizarea"
                      >
                        <Icon name="delete" size={18} />
                      </button>
                    )}
                  </div>
                  <h3 className="font-['Space_Grotesk'] text-sm font-bold text-[#F1F0FF] mb-1">{u.title}</h3>
                  <p className="text-xs text-[#958DA1] leading-relaxed mb-2">{u.desc}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-['JetBrains_Mono'] text-[9px] text-[#958DA1]/60">📅 {u.date}</span>
                    {u.autor && <span className="font-['JetBrains_Mono'] text-[9px] text-[#D2BBFF]/80">👤 {u.autor}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}