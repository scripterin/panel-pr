import React, { useState, useEffect } from 'react';
import {
  Lock, Sparkles, AlertTriangle, CheckCircle, ChevronRight,
  ChevronLeft, Rocket, Eye, EyeOff, KeyRound, HelpCircle,
  ArrowLeft, ShieldCheck, Mail, RefreshCw,
} from 'lucide-react';
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
  const [showPw,  setShowPw]  = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [showPw3, setShowPw3] = useState(false);

  // Forgot password state
  const [forgotStep,    setForgotStep]    = useState(1); // 1=email, 2=new pw
  const [forgotEmail,   setForgotEmail]   = useState('');
  const [forgotNewPw,   setForgotNewPw]   = useState('');
  const [forgotConfirm, setForgotConfirm] = useState('');
  const [forgotOk,      setForgotOk]      = useState(false);
  const [forgotUser,    setForgotUser]    = useState(null);

  const [reg, setReg] = useState({
    code: '', email: '', password: '', confirm: '',
    firstName: '', lastName: '', discordId: '', rank: '', rankCodeId: '',
    charName: '', charId: '', faction: '', phone: '',
    icEmail: '',
  });

  useEffect(() => {
    const saved = getSavedLogin();
    if (saved) { setLd(saved); setRem(true); }
  }, []);

  function switchTab(t) {
    setTab(t); setErr(''); setStep(1);
    setForgotStep(1); setForgotEmail(''); setForgotNewPw('');
    setForgotConfirm(''); setForgotOk(false); setForgotUser(null);
  }

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

  // ── Forgot password: step 1 — verifică emailul ────────
  async function forgotCheckEmail() {
    setErr(''); setLoading(true);
    try {
      if (!forgotEmail || !/^[^@]+@[^@]+\.[^@]+$/.test(forgotEmail)) {
        setErr('Introdu un email valid!'); return;
      }
      const users = await getAll(COL.users);
      const found = users.find(u => u.email.toLowerCase() === forgotEmail.toLowerCase());
      if (!found) { setErr('Nu există niciun cont cu acest email!'); return; }
      setForgotUser(found);
      setForgotStep(2);
    } catch (e) {
      setErr('Eroare de conexiune. Încearcă din nou.');
    } finally {
      setLoading(false);
    }
  }

  // ── Forgot password: step 2 — setează parola nouă ─────
  async function forgotResetPw() {
    setErr(''); setLoading(true);
    try {
      if (!forgotNewPw || forgotNewPw.length < 6) {
        setErr('Parola trebuie să aibă minim 6 caractere!'); return;
      }
      if (forgotNewPw !== forgotConfirm) {
        setErr('Parolele nu coincid!'); return;
      }
      await updateOne(COL.users, forgotUser.id, { password: forgotNewPw });
      await addLog('RESET_PW', `Parola a fost resetată pentru: ${forgotUser.fullName}`, forgotUser);
      setForgotOk(true);
    } catch (e) {
      setErr('Eroare la resetare. Încearcă din nou.');
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

  const rc = {
    'Supervizor PR':    '#FDE047',
    'Conducere Spital': '#EF4444',
    'Sef PR':           'var(--p3)',
    'Adjunct PR':       '#93C5FD',
    'Membru PR':        '#6EE7B7',
  };

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

          {/* ── TABS ── */}
          <div className="auth-tabs">
            <div
              className={`auth-tab${tab === 'login' ? ' active' : ''}`}
              onClick={() => switchTab('login')}
            >
              <Lock size={14} strokeWidth={2} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Conectare
            </div>
            <div
              className={`auth-tab${tab === 'register' ? ' active' : ''}`}
              onClick={() => switchTab('register')}
            >
              <Sparkles size={14} strokeWidth={2} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Creare Cont
            </div>
          </div>

          {/* ── LOGIN ── */}
          {tab === 'login' && (
            <div>
              {err && (
                <div className="ferr">
                  <AlertTriangle size={14} style={{ marginRight: 6, flexShrink: 0 }} />
                  {err}
                </div>
              )}

              <label className="flabel">Email</label>
              <input
                className="finput"
                type="email"
                placeholder="adresa@email.com"
                value={ld.email}
                onChange={e => setLd(p => ({ ...p, email: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && doLogin()}
              />

              <label className="flabel">Parolă</label>
              <div style={{ position: 'relative', marginBottom: 14 }}>
                <input
                  className="finput"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={ld.password}
                  onChange={e => setLd(p => ({ ...p, password: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && doLogin()}
                  style={{ marginBottom: 0, paddingRight: 42 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--t2)', padding: 0, display: 'flex',
                  }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="remember-row">
                <input
                  type="checkbox"
                  id="rem"
                  checked={rem}
                  onChange={e => setRem(e.target.checked)}
                />
                <label htmlFor="rem">Ține-mă minte pe acest dispozitiv</label>
              </div>

              {/* Am uitat parola link */}
              <div style={{ textAlign: 'right', marginBottom: 14, marginTop: -6 }}>
                <button
                  type="button"
                  onClick={() => switchTab('forgot')}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--p3)', fontSize: 12, display: 'inline-flex',
                    alignItems: 'center', gap: 4, opacity: 0.85,
                  }}
                >
                  <HelpCircle size={13} />
                  Am uitat parola
                </button>
              </div>

              <button className="fbtn" onClick={doLogin} disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw size={14} style={{ marginRight: 6, animation: 'spin 1s linear infinite' }} />
                    Se conectează...
                  </>
                ) : (
                  <>
                    Conectează-te
                    <ChevronRight size={16} style={{ marginLeft: 6 }} />
                  </>
                )}
              </button>
            </div>
          )}

          {/* ── FORGOT PASSWORD ── */}
          {tab === 'forgot' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <button
                  type="button"
                  onClick={() => switchTab('login')}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--t2)', padding: 0, display: 'flex',
                  }}
                >
                  <ArrowLeft size={16} />
                </button>
                <span style={{ color: 'var(--t2)', fontSize: 12 }}>Resetare Parolă</span>
              </div>

              {err && (
                <div className="ferr">
                  <AlertTriangle size={14} style={{ marginRight: 6, flexShrink: 0 }} />
                  {err}
                </div>
              )}

              {/* Step indicator */}
              <div className="step-ind" style={{ marginBottom: 20 }}>
                <div className={`step-dot ${forgotStep >= 1 ? 'done' : 'pending'}`}>1</div>
                <div className={`step-line ${forgotStep >= 2 ? 'done' : ''}`} />
                <div className={`step-dot ${forgotStep === 2 ? 'active' : 'pending'}`}>2</div>
              </div>

              {/* Forgot — pasul 1: email */}
              {!forgotOk && forgotStep === 1 && (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: 16, color: 'var(--t2)', fontSize: 12 }}>
                    Introdu adresa de email asociată contului tău
                  </div>
                  <label className="flabel">Email</label>
                  <input
                    className="finput"
                    type="email"
                    placeholder="adresa@email.com"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && forgotCheckEmail()}
                  />
                  <button className="fbtn" onClick={forgotCheckEmail} disabled={loading}>
                    {loading ? (
                      <>
                        <RefreshCw size={14} style={{ marginRight: 6, animation: 'spin 1s linear infinite' }} />
                        Se verifică...
                      </>
                    ) : (
                      <>
                        <Mail size={14} style={{ marginRight: 6 }} />
                        Verifică Email
                        <ChevronRight size={16} style={{ marginLeft: 6 }} />
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Forgot — pasul 2: parolă nouă */}
              {!forgotOk && forgotStep === 2 && (
                <div>
                  {forgotUser && (
                    <div className="fok" style={{ marginBottom: 14 }}>
                      <ShieldCheck size={14} style={{ marginRight: 6 }} />
                      Cont găsit: <strong>{forgotUser.fullName}</strong>
                    </div>
                  )}

                  <label className="flabel">Parolă Nouă (minim 6 caractere)</label>
                  <div style={{ position: 'relative', marginBottom: 14 }}>
                    <input
                      className="finput"
                      type={showPw2 ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={forgotNewPw}
                      onChange={e => setForgotNewPw(e.target.value)}
                      style={{ marginBottom: 0, paddingRight: 42 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw2(v => !v)}
                      style={{
                        position: 'absolute', right: 12, top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--t2)', padding: 0, display: 'flex',
                      }}
                    >
                      {showPw2 ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <label className="flabel">Confirmare Parolă Nouă</label>
                  <div style={{ position: 'relative', marginBottom: 14 }}>
                    <input
                      className="finput"
                      type={showPw3 ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={forgotConfirm}
                      onChange={e => setForgotConfirm(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && forgotResetPw()}
                      style={{ marginBottom: 0, paddingRight: 42 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw3(v => !v)}
                      style={{
                        position: 'absolute', right: 12, top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--t2)', padding: 0, display: 'flex',
                      }}
                    >
                      {showPw3 ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <button className="fbtn" onClick={forgotResetPw} disabled={loading}>
                    {loading ? (
                      <>
                        <RefreshCw size={14} style={{ marginRight: 6, animation: 'spin 1s linear infinite' }} />
                        Se salvează...
                      </>
                    ) : (
                      <>
                        <KeyRound size={14} style={{ marginRight: 6 }} />
                        Salvează Parola Nouă
                      </>
                    )}
                  </button>
                  <button className="fbtn-sec" onClick={() => { setForgotStep(1); setErr(''); }}>
                    <ChevronLeft size={14} style={{ marginRight: 4 }} />
                    Înapoi
                  </button>
                </div>
              )}

              {/* Forgot — succes */}
              {forgotOk && (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <CheckCircle size={48} style={{ color: '#6EE7B7', marginBottom: 12 }} />
                  <div style={{ color: '#6EE7B7', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
                    Parola a fost schimbată!
                  </div>
                  <div style={{ color: 'var(--t2)', fontSize: 12, marginBottom: 20 }}>
                    Te poți conecta acum cu noua parolă.
                  </div>
                  <button className="fbtn" onClick={() => switchTab('login')}>
                    <Lock size={14} style={{ marginRight: 6 }} />
                    Mergi la Conectare
                  </button>
                </div>
              )}
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

              {err && (
                <div className="ferr">
                  <AlertTriangle size={14} style={{ marginRight: 6, flexShrink: 0 }} />
                  {err}
                </div>
              )}

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
                      <CheckCircle size={14} style={{ marginRight: 6 }} />
                      Cod valid! Grad acordat:
                      <strong style={{ color: rc[reg.rank] }}> {reg.rank}</strong>
                    </div>
                  )}
                  <button className="fbtn" onClick={checkCode} disabled={loading}>
                    {loading ? (
                      <>
                        <RefreshCw size={14} style={{ marginRight: 6, animation: 'spin 1s linear infinite' }} />
                        Se verifică...
                      </>
                    ) : (
                      <>
                        Verifică Codul
                        <ChevronRight size={16} style={{ marginLeft: 6 }} />
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Pasul 2 — email + parolă */}
              {step === 2 && (
                <div>
                  {reg.rank && (
                    <div className="fok" style={{ marginBottom: 14 }}>
                      Grad: <strong style={{ color: rc[reg.rank] }}>{reg.rank}</strong>
                    </div>
                  )}
                  <label className="flabel">Email</label>
                  <input
                    className="finput"
                    type="email"
                    placeholder="adresa@email.com"
                    value={reg.email}
                    onChange={e => setReg(p => ({ ...p, email: e.target.value }))}
                  />
                  <label className="flabel">Parolă (minim 6 caractere)</label>
                  <div style={{ position: 'relative', marginBottom: 14 }}>
                    <input
                      className="finput"
                      type={showPw ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={reg.password}
                      onChange={e => setReg(p => ({ ...p, password: e.target.value }))}
                      style={{ marginBottom: 0, paddingRight: 42 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      style={{
                        position: 'absolute', right: 12, top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--t2)', padding: 0, display: 'flex',
                      }}
                    >
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <label className="flabel">Confirmare Parolă</label>
                  <div style={{ position: 'relative', marginBottom: 14 }}>
                    <input
                      className="finput"
                      type={showPw2 ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={reg.confirm}
                      onChange={e => setReg(p => ({ ...p, confirm: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && checkEmail()}
                      style={{ marginBottom: 0, paddingRight: 42 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw2(v => !v)}
                      style={{
                        position: 'absolute', right: 12, top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--t2)', padding: 0, display: 'flex',
                      }}
                    >
                      {showPw2 ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <button className="fbtn" onClick={checkEmail} disabled={loading}>
                    {loading ? (
                      <>
                        <RefreshCw size={14} style={{ marginRight: 6, animation: 'spin 1s linear infinite' }} />
                        Se verifică...
                      </>
                    ) : (
                      <>
                        Continuă
                        <ChevronRight size={16} style={{ marginLeft: 6 }} />
                      </>
                    )}
                  </button>
                  <button className="fbtn-sec" onClick={() => setStep(1)}>
                    <ChevronLeft size={14} style={{ marginRight: 4 }} />
                    Înapoi
                  </button>
                </div>
              )}

              {/* Pasul 3 — date personale */}
              {step === 3 && (
                <div>
                  {regType === 'ic' ? (
                    <>
                      <label className="flabel">Nume + Prenume</label>
                      <input
                        className="finput"
                        placeholder="Introdu Numele si Prenumele"
                        value={reg.charName}
                        onChange={e => setReg(p => ({ ...p, charName: e.target.value }))}
                      />
                      <label className="flabel">ID</label>
                      <input
                        className="finput"
                        placeholder="Introdu ID-ul"
                        value={reg.charId}
                        onChange={e => setReg(p => ({ ...p, charId: e.target.value }))}
                      />
                      <label className="flabel">Callsign</label>
                      <div style={{ position: 'relative', marginBottom: 14 }}>
                        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--p3)', fontWeight: 700, fontSize: 13, pointerEvents: 'none', fontFamily: 'JetBrains Mono, monospace' }}>M-[</span>
                        <input
                          className="finput"
                          placeholder="Introdu Callsign-ul"
                          value={reg.faction}
                          onChange={e => setReg(p => ({ ...p, faction: e.target.value.replace(/\D/g, '') }))}
                          style={{ paddingLeft: 48, paddingRight: 28, marginBottom: 0 }}
                        />
                        <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--p3)', fontWeight: 700, fontSize: 13, pointerEvents: 'none', fontFamily: 'JetBrains Mono, monospace' }}>]</span>
                      </div>
                      {reg.faction && (
                        <div style={{ fontSize: 11, color: 'var(--t2)', marginBottom: 14, marginTop: -8 }}>
                          Callsign final: <strong style={{ color: 'var(--p3)', fontFamily: 'JetBrains Mono, monospace' }}>M-[{reg.faction}]</strong>
                        </div>
                      )}
                      <label className="flabel">Discord ID</label>
                      <input
                        className="finput"
                        placeholder="Introdu Discord ID-ul"
                        value={reg.discordId}
                        onChange={e => setReg(p => ({ ...p, discordId: e.target.value }))}
                      />
                      <label className="flabel">Email</label>
                      <input
                        className="finput"
                        type="email"
                        placeholder="email@fplayt.ro"
                        value={reg.icEmail}
                        onChange={e => setReg(p => ({ ...p, icEmail: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && finishReg()}
                      />
                    </>
                  ) : (
                    <>
                      <div className="frow">
                        <div>
                          <label className="flabel">Prenume</label>
                          <input
                            className="finput"
                            placeholder="Ion"
                            value={reg.firstName}
                            onChange={e => setReg(p => ({ ...p, firstName: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="flabel">Nume</label>
                          <input
                            className="finput"
                            placeholder="Popescu"
                            value={reg.lastName}
                            onChange={e => setReg(p => ({ ...p, lastName: e.target.value }))}
                          />
                        </div>
                      </div>
                      <label className="flabel">Număr de telefon</label>
                      <div style={{ position: 'relative', marginBottom: 14 }}>
                        <input
                          className="finput"
                          placeholder="xxx-xxxx"
                          value={reg.phone}
                          onChange={e => {
                            const digits    = e.target.value.replace(/\D/g, '').slice(0, 7);
                            const formatted = digits.length > 3 ? digits.slice(0, 3) + '-' + digits.slice(3) : digits;
                            setReg(p => ({ ...p, phone: formatted }));
                          }}
                          style={{ marginBottom: 0, fontFamily: 'JetBrains Mono, monospace', letterSpacing: 1 }}
                          maxLength={8}
                        />
                      </div>
                      {reg.phone && !/^\d{3}-\d{4}$/.test(reg.phone) && (
                        <div style={{ fontSize: 11, color: 'var(--amber)', marginBottom: 14, marginTop: -8 }}>
                          Format: <strong style={{ fontFamily: 'JetBrains Mono, monospace' }}>xxx-xxxx</strong>
                        </div>
                      )}
                      {reg.phone && /^\d{3}-\d{4}$/.test(reg.phone) && (
                        <div style={{ fontSize: 11, color: '#6EE7B7', marginBottom: 14, marginTop: -8 }}>
                          <CheckCircle size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                          Format corect
                        </div>
                      )}
                      <label className="flabel">Discord ID</label>
                      <input
                        className="finput"
                        placeholder="ex: 123456789012345678"
                        value={reg.discordId}
                        onChange={e => setReg(p => ({ ...p, discordId: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && finishReg()}
                      />
                    </>
                  )}
                  <button className="fbtn" onClick={finishReg} disabled={loading}>
                    {loading ? (
                      <>
                        <RefreshCw size={14} style={{ marginRight: 6, animation: 'spin 1s linear infinite' }} />
                        Se înregistrează...
                      </>
                    ) : (
                      <>
                        <Rocket size={14} style={{ marginRight: 6 }} />
                        Finalizează Înregistrarea
                      </>
                    )}
                  </button>
                  <button className="fbtn-sec" onClick={() => setStep(2)}>
                    <ChevronLeft size={14} style={{ marginRight: 4 }} />
                    Înapoi
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}