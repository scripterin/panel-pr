import React, { useState, useEffect } from 'react';
import { COL, getAll, setOne, deleteOne } from '../utils/storage';

const GRADE = ['Sef PR', 'Adjunct PR', 'Membru PR', 'Supervizor PR', 'Conducere Spital'];

export default function AdminWhitelist({ currentUser, onBack }) {
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState('');
  const [ok,      setOk]      = useState('');
  const [form,    setForm]    = useState({
    nume: '', discordId: '', grad: 'Membru PR', isAdmin: false,
  });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const data = await getAll(COL.whitelist);
    setList(data);
    setLoading(false);
  }

  async function addMember() {
    setErr(''); setOk('');
    if (!form.nume.trim())      { setErr('Completează numele!'); return; }
    if (!form.discordId.trim()) { setErr('Completează Discord ID!'); return; }
    if (!/^\d{17,20}$/.test(form.discordId.trim())) {
      setErr('Discord ID invalid! Trebuie să fie 17-20 cifre.'); return;
    }
    if (list.find(w => w.discordId === form.discordId.trim())) {
      setErr('Acest Discord ID există deja în whitelist!'); return;
    }

    setSaving(true);
    const id   = form.discordId.trim();
    const data = {
      id,
      nume:      form.nume.trim(),
      discordId: id,
      grad:      form.grad,
      isAdmin:   form.isAdmin,
      addedBy:   currentUser.fullName,
      addedAt:   new Date().toLocaleDateString('ro-RO'),
    };

    const res = await setOne(COL.whitelist, id, data);
    if (res) {
      setOk(`✅ ${form.nume} a fost adăugat în whitelist!`);
      setForm({ nume: '', discordId: '', grad: 'Membru PR', isAdmin: false });
      await load();
    } else {
      setErr('Eroare la salvare. Încearcă din nou.');
    }
    setSaving(false);
  }

  async function removeMember(id, nume) {
    if (!window.confirm(`Ștergi ${nume} din whitelist? Nu va mai putea accesa panelul.`)) return;
    await deleteOne(COL.whitelist, id);
    await load();
  }

  const rc = {
    'Supervizor PR':    '#FDE047',
    'Conducere Spital': '#EF4444',
    'Sef PR':           'var(--p3)',
    'Adjunct PR':       '#93C5FD',
    'Membru PR':        '#6EE7B7',
  };

  return (
    <div style={{ padding: '24px 16px', maxWidth: 600, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{
          background: 'none', border: '1px solid var(--b1)',
          borderRadius: 8, padding: '6px 12px', color: 'var(--t2)',
          cursor: 'pointer', fontSize: 13,
        }}>← Înapoi</button>
        <div>
          <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--t1)' }}>Gestionare Whitelist</div>
          <div style={{ fontSize: 12, color: 'var(--t3)' }}>{list.length} membri autorizați</div>
        </div>
      </div>

      {/* Formular adăugare */}
      <div style={{
        background: 'var(--card)', border: '1px solid var(--b1)',
        borderRadius: 12, padding: 20, marginBottom: 24,
      }}>
        <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--t1)', marginBottom: 16 }}>
          Adaugă Membru
        </div>

        {err && <div className="ferr">⚠️ {err}</div>}
        {ok  && <div className="fok">{ok}</div>}

        <label className="flabel">Nume Complet</label>
        <input className="finput" placeholder="Ion Popescu"
          value={form.nume}
          onChange={e => setForm(p => ({ ...p, nume: e.target.value }))} />

        <label className="flabel">Discord ID</label>
        <input className="finput" placeholder="ex: 123456789012345678"
          value={form.discordId}
          onChange={e => setForm(p => ({ ...p, discordId: e.target.value.replace(/\D/g, '') }))} />

        <label className="flabel">Grad</label>
        <select className="finput" value={form.grad}
          onChange={e => setForm(p => ({ ...p, grad: e.target.value }))}>
          {GRADE.map(g => <option key={g} value={g}>{g}</option>)}
        </select>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0 16px' }}>
          <input type="checkbox" id="isAdmin" checked={form.isAdmin}
            onChange={e => setForm(p => ({ ...p, isAdmin: e.target.checked }))} />
          <label htmlFor="isAdmin" style={{ fontSize: 13, color: 'var(--t2)', cursor: 'pointer' }}>
            Acces Admin (poate gestiona whitelist)
          </label>
        </div>

        <button className="fbtn" onClick={addMember} disabled={saving}>
          {saving ? 'Se salvează...' : '+ Adaugă în Whitelist'}
        </button>
      </div>

      {/* Lista */}
      <div style={{
        background: 'var(--card)', border: '1px solid var(--b1)',
        borderRadius: 12, overflow: 'hidden',
      }}>
        <div style={{
          padding: '12px 16px', borderBottom: '1px solid var(--b1)',
          fontSize: 13, fontWeight: 500, color: 'var(--t2)',
        }}>
          Membri Autorizați
        </div>

        {loading ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--t3)', fontSize: 13 }}>
            Se încarcă...
          </div>
        ) : list.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--t3)', fontSize: 13 }}>
            Niciun membru în whitelist
          </div>
        ) : (
          list.map(w => (
            <div key={w.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', borderBottom: '1px solid var(--b1)',
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--t1)' }}>
                  {w.nume}
                  {w.isAdmin && (
                    <span style={{
                      marginLeft: 8, fontSize: 10, background: 'rgba(124,58,237,0.15)',
                      color: 'var(--p3)', borderRadius: 4, padding: '2px 6px',
                    }}>ADMIN</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>
                  <span style={{ color: rc[w.grad] || 'var(--t2)' }}>{w.grad}</span>
                  {' · '}Discord: {w.discordId}
                </div>
              </div>
              <button onClick={() => removeMember(w.id, w.nume)} style={{
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                color: '#EF4444', borderRadius: 8, padding: '6px 12px',
                cursor: 'pointer', fontSize: 12,
              }}>
                Șterge
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}