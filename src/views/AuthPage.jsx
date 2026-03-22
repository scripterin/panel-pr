import React, { useState, useEffect } from 'react';
import {
  COL, DC,
  getAll, getOne, setOne, updateOne,
  getSession, setSession,
  getSavedLogin, setSavedLogin, clearSavedLogin,
} from '../utils/storage';
import { addLog } from '../utils/logger';

export default function AuthPage({ onLogin }) {
  const [tab,     setTab]     = useState('login');
  const [regType, setRegType] = useState('ic');
  const [step,    setStep]    = useState(1);
  const [err,     setErr]     = useState('');
  const [loading, setLoading] = useState(false);
  const [ld,      setLd]      = useState({ email: '', password: '' });
  const [rem,     setRem]     = useState(false);
  const [reg,     setReg]     = useState({
    code: '', email: '', password: '', confirm: '',
    firstName: '', lastName: '', discordId: '', rank: '', rankCodeId: '',
    charName: '', charId: '', faction: '', phone: '',
    icEmail: '',
  });

  useEffect(() => {
    const saved = getSavedLogin();
    if (saved) { setLd(saved); setRem(true); }
  }, []);

  // ── Login ──────────────────────────────────────────────
  async function doLogin() {
    setErr(''); setLoading(true);
    try {
      if (!ld.email || !ld.password) { setErr('Completează toate câmpurile!'); return; }

      const users = await getAll(COL.users);
      const user  = users.find(
        u => u.email.toLowerCase() === ld.email.toLowerCase() && u.password === ld.password
      );
      if (!user) { setErr('Email sau parolă incorectă!'); return; }

      const codes = await getAll(COL.accessCodes);
      if (!codes.find(c => c.code === user.accessCode)) {
        setErr('Accesul tău a fost revocat de administrator.');
        return;
      }

      if (rem) setSavedLogin({ email: ld.email, password: ld.password });
      else     clearSavedLogin();

      await addLog('LOGIN', `${user.fullName} (${user.rank}) s-a conectat`, user);

      setSession(user);
      onLogin(user);
    } catch (e) {
      setErr('Eroare de conexiune. Încearcă din nou.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // ── Step 1: verifică codul ─────────────────────────────
  async function checkCode() {
    setErr(''); setLoading(true);
    try {
      const codes = await getAll(COL.accessCodes);
      const found = codes.find(c => c.code === reg.code.trim() && !c.used);
      if (!found) { setErr('Cod invalid sau deja folosit!'); return; }
      setReg(p => ({ ...p, rank: found.rank, rankCodeId: found.id }));
      setStep(2);
    } catch (e) {
      setErr('Eroare de conexiune. Încearcă din nou.');
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: email + parolă ─────────────────────────────
  async function checkEmail() {
    setErr(''); setLoading(true);
    try {
      if (!reg.email || !/^[^@]+@[^@]+\.[^@]+$/.test(reg.email)) {
        setErr('Introdu un email valid!'); return;
      }
      if (!reg.password || reg.password.length < 6) {
        setErr('Parola trebuie să aibă minim 6 caractere!'); return;
      }
      if (reg.password !== reg.confirm) {
        setErr('Parolele nu coincid!'); return;
      }
      const users = await getAll(COL.users);
      if (users.find(u => u.email.toLowerCase() === reg.email.toLowerCase())) {
        setErr('Acest email este deja înregistrat!'); return;
      }
      setStep(3);
    } catch (e) {
      setErr('Eroare de conexiune. Încearcă din nou.');
    } finally {
      setLoading(false);
    }
  }

  // ── Step 3: finalizare înregistrare ───────────────────
  async function finishReg() {
    setErr(''); setLoading(true);
    try {
      if (regType === 'ic') {
        if (!reg.charName) { setErr('Completează numele!'); return; }
        if (!reg.charId)   { setErr('Completează ID-ul!'); return; }
        if (!reg.icEmail)  { setErr('Completează emailul IC (@fplayt.ro)!'); return; }
        if (!/^[^@]+@fplayt\.ro$/.test(reg.icEmail)) {
          setErr('Emailul IC trebuie să fie în format email@fplayt.ro!'); return;
        }
      } else {
        if (!reg.firstName || !reg.lastName) {
          setErr('Completează numele și prenumele!'); return;
        }
      }
      if (!reg.discordId) { setErr('Completează Discord ID!'); return; }

      await updateOne(COL.accessCodes, reg.rankCodeId, { used: true });

      const displayName = regType === 'ic'
        ? reg.charName
        : reg.firstName + ' ' + reg.lastName;

      const id = String(Date.now());
      const nu = {
        id,
        email:       reg.email,
        password:    reg.password,
        fullName:    displayName,
        firstName:   reg.firstName  || '',
        lastName:    reg.lastName   || '',
        charName:    reg.charName   || '',
        charId:      reg.charId     || '',
        faction:     reg.faction    ? 'M-[' + reg.faction + ']' : '',
        icEmail:     regType === 'ic' ? reg.icEmail : '',
        phone:       reg.phone      || '',
        discordId:   reg.discordId,
        rank:        reg.rank,
        accessCode:  reg.code,
        joinDate:    new Date().toLocaleDateString('ro-RO'),
        status:      'activ',
        activities:  0,
        notes:       '',
        accountType: regType,
      };

      await setOne(COL.users, id, nu);

      await setOne(COL.members, id, {
        id,
        name:        displayName,
        rank:        nu.rank,
        status:      'activ',
        discord:     nu.discordId,
        date:        nu.joinDate,
        activities:  0,
        notes:       '',
        accountType: regType,
        charId:      nu.charId  || '',
        icEmail:     nu.icEmail || '',
        faction:     nu.faction || '',
      });

      await addLog('REGISTER',
        `Cont nou creat: "${nu.fullName}" cu gradul "${nu.rank}" (${regType === 'ic' ? 'IC' : 'OOC'})`,
        nu
      );

      setSession(nu);
      onLogin(nu);
    } catch (e) {
      setErr('Eroare la înregistrare. Încearcă din nou.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const rc = { 'Supervizor PR': '#FDE047', 'Conducere Spital': '#2DD4BF', 'Sef PR': 'var(--p3)', 'Adjunct PR': '#93C5FD', 'Membru PR': '#6EE7B7' };

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
        <div className="auth-tabs">
          <div className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => { setTab('login'); setErr(''); setStep(1); }}>
            🔐 Conectare
          </div>
          <div className={`auth-tab${tab === 'register' ? ' active' : ''}`} onClick={() => { setTab('register'); setErr(''); setStep(1); }}>
            ✨ Creare Cont
          </div>
        </div>

          {/* ── LOGIN ── */}
          {tab === 'login' && (
            <div>
              {err && <div className="ferr">⚠️ {err}</div>}
              <label className="flabel">Email</label>
              <input className="finput" type="email" placeholder="adresa@email.com"
                value={ld.email} onChange={e => setLd(p => ({ ...p, email: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && doLogin()} />
              <label className="flabel">Parolă</label>
              <input className="finput" type="password" placeholder="••••••••"
                value={ld.password} onChange={e => setLd(p => ({ ...p, password: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && doLogin()} />
              <div className="remember-row">
                <input type="checkbox" id="rem" checked={rem} onChange={e => setRem(e.target.checked)} />
                <label htmlFor="rem">Ține-mă minte pe acest dispozitiv</label>
              </div>
              <button className="fbtn" onClick={doLogin} disabled={loading}>
                {loading ? 'Se conectează...' : 'Conectează-te →'}
              </button>
            </div>
          )}

{/* ── REGISTER ── */}
{tab === 'register' && (
  <div>

    <div className="step-ind">
      <div className={`step-dot ${step >= 1 ? 'done' : 'pending'}`}>1</div>
      <div className={`step-line ${step >= 2 ? 'done' : ''}`} />
      <div className={`step-dot ${step >= 2 ? (step === 2 ? 'active' : 'done') : 'pending'}`}>2</div>
      <div className={`step-line ${step >= 3 ? 'done' : ''}`} />
      <div className={`step-dot ${step === 3 ? 'active' : 'pending'}`}>3</div>
    </div>

    {err && <div className="ferr">⚠️ {err}</div>}

    {/* Pasul 1 — cod acces */}
    {step === 1 && (
      <div>
        <div style={{ textAlign: 'center', marginBottom: 16, color: 'var(--t2)', fontSize: 12 }}>
          Introdu codul de acces primit de la administrator
        </div>

        <label className="flabel">Cod de Acces</label>
        <input
          className="finput"
          placeholder="Introdu Codul"
          value={reg.code}
          onChange={e => setReg(p => ({ ...p, code: e.target.value.toUpperCase() }))}
          onKeyDown={e => e.key === 'Enter' && checkCode()}
        />

        {reg.rank && (
          <div className="fok">
            ✅ Cod valid! Grad acordat:
            <strong style={{ color: rc[reg.rank] }}> {reg.rank}</strong>
          </div>
        )}

        <button className="fbtn" onClick={checkCode} disabled={loading}>
          {loading ? 'Se verifică...' : 'Verifică Codul →'}
        </button>
      </div>
    )}

              {/* Pasul 2 — email + parolă */}
              {step === 2 && (
                <div>
                  {reg.rank && <div className="fok" style={{ marginBottom: 14 }}>Grad: <strong style={{ color: rc[reg.rank] }}>{reg.rank}</strong></div>}
                  <label className="flabel">Email</label>
                  <input className="finput" type="email" placeholder="adresa@email.com"
                    value={reg.email} onChange={e => setReg(p => ({ ...p, email: e.target.value }))} />
                  <label className="flabel">Parolă (minim 6 caractere)</label>
                  <input className="finput" type="password" placeholder="••••••••"
                    value={reg.password} onChange={e => setReg(p => ({ ...p, password: e.target.value }))} />
                  <label className="flabel">Confirmare Parolă</label>
                  <input className="finput" type="password" placeholder="••••••••"
                    value={reg.confirm} onChange={e => setReg(p => ({ ...p, confirm: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && checkEmail()} />
                  <button className="fbtn" onClick={checkEmail} disabled={loading}>
                    {loading ? 'Se verifică...' : 'Continuă →'}
                  </button>
                  <button className="fbtn-sec" onClick={() => setStep(1)}>← Înapoi</button>
                </div>
              )}

              {/* Pasul 3 — date personale */}
              {step === 3 && (
                <div>
                  {regType === 'ic' ? (
                    <>
                      <label className="flabel">Nume + Prenume</label>
                      <input className="finput" placeholder="Paduraru David"
                        value={reg.charName} onChange={e => setReg(p => ({ ...p, charName: e.target.value }))} />
                      <label className="flabel">ID</label>
                      <input className="finput" placeholder="ex: 12345"
                        value={reg.charId} onChange={e => setReg(p => ({ ...p, charId: e.target.value }))} />
                      <label className="flabel">Callsign</label>
                      <div style={{ position: 'relative', marginBottom: 14 }}>
                        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--p3)', fontWeight: 700, fontSize: 13, pointerEvents: 'none', fontFamily: 'JetBrains Mono, monospace' }}>M-[</span>
                        <input className="finput" placeholder="102"
                          value={reg.faction}
                          onChange={e => setReg(p => ({ ...p, faction: e.target.value.replace(/\D/g, '') }))}
                          style={{ paddingLeft: 48, paddingRight: 28, marginBottom: 0 }} />
                        <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--p3)', fontWeight: 700, fontSize: 13, pointerEvents: 'none', fontFamily: 'JetBrains Mono, monospace' }}>]</span>
                      </div>
                      {reg.faction && (
                        <div style={{ fontSize: 11, color: 'var(--t2)', marginBottom: 14, marginTop: -8 }}>
                          Callsign final: <strong style={{ color: 'var(--p3)', fontFamily: 'JetBrains Mono, monospace' }}>M-[{reg.faction}]</strong>
                        </div>
                      )}
                      <label className="flabel">Discord ID</label>
                      <input className="finput" placeholder="ex: 123456789012345678"
                        value={reg.discordId} onChange={e => setReg(p => ({ ...p, discordId: e.target.value }))} />
                      <label className="flabel">Email</label>
                      <input className="finput" type="email" placeholder="email@fplayt.ro"
                        value={reg.icEmail} onChange={e => setReg(p => ({ ...p, icEmail: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && finishReg()} />
                    </>
                  ) : (
                    <>
                      <div className="frow">
                        <div>
                          <label className="flabel">Prenume</label>
                          <input className="finput" placeholder="Ion"
                            value={reg.firstName} onChange={e => setReg(p => ({ ...p, firstName: e.target.value }))} />
                        </div>
                        <div>
                          <label className="flabel">Nume</label>
                          <input className="finput" placeholder="Popescu"
                            value={reg.lastName} onChange={e => setReg(p => ({ ...p, lastName: e.target.value }))} />
                        </div>
                      </div>
                      <label className="flabel">Telefon — format xxx-xxxx (opțional)</label>
                      <div style={{ position: 'relative', marginBottom: 14 }}>
                        <input className="finput" placeholder="xxx-xxxx"
                          value={reg.phone}
                          onChange={e => {
                            const digits    = e.target.value.replace(/\D/g, '').slice(0, 7);
                            const formatted = digits.length > 3 ? digits.slice(0, 3) + '-' + digits.slice(3) : digits;
                            setReg(p => ({ ...p, phone: formatted }));
                          }}
                          style={{ marginBottom: 0, fontFamily: 'JetBrains Mono, monospace', letterSpacing: 1 }}
                          maxLength={8} />
                      </div>
                      {reg.phone && !/^\d{3}-\d{4}$/.test(reg.phone) && (
                        <div style={{ fontSize: 11, color: 'var(--amber)', marginBottom: 14, marginTop: -8 }}>
                          Format: <strong style={{ fontFamily: 'JetBrains Mono, monospace' }}>xxx-xxxx</strong>
                        </div>
                      )}
                      {reg.phone && /^\d{3}-\d{4}$/.test(reg.phone) && (
                        <div style={{ fontSize: 11, color: '#6EE7B7', marginBottom: 14, marginTop: -8 }}>✓ Format corect</div>
                      )}
                      <label className="flabel">Discord ID</label>
                      <input className="finput" placeholder="ex: 123456789012345678"
                        value={reg.discordId} onChange={e => setReg(p => ({ ...p, discordId: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && finishReg()} />
                    </>
                  )}
                  <button className="fbtn" onClick={finishReg} disabled={loading}>
                    {loading ? 'Se înregistrează...' : '🚀 Finalizează Înregistrarea'}
                  </button>
                  <button className="fbtn-sec" onClick={() => setStep(2)}>← Înapoi</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}