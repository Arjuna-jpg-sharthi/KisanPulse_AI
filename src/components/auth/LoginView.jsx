import React, { useState } from 'react';
import { Sprout, LockKeyhole } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginView() {
  const { login, register, adminLogin } = useAuth();
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('farmer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (mode === 'register' && password.length < 8) {
      setError('Use a password with at least 8 characters.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'register') await register({ name, email, password, role });
      else if (mode === 'admin') await adminLogin({ adminKey: password });
      else await login({ email, password });
    } catch (err) {
      setError(err.message || 'Could not sign in. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const fieldStyle = { width: '100%', padding: '12px 14px', border: '1px solid #d7e2d8', borderRadius: 10, fontSize: 15, boxSizing: 'border-box' };

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20, background: 'linear-gradient(135deg, #effaf0, #f8fafc 55%, #e6f4ea)' }}>
      <section style={{ width: 'min(100%, 430px)', padding: 32, borderRadius: 22, background: '#fff', boxShadow: '0 20px 70px rgba(15, 61, 34, .12)', border: '1px solid #e3ede5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 26 }}>
          <span style={{ width: 48, height: 48, display: 'grid', placeItems: 'center', borderRadius: 14, color: '#166534', background: '#dcfce7' }}><Sprout size={26} /></span>
          <div><strong style={{ fontSize: 20, color: '#153323' }}>KisanPulse AI</strong><div style={{ color: '#64748b', fontSize: 13 }}>Your farm, in one place</div></div>
        </div>
        <h1 style={{ margin: '0 0 6px', fontSize: 25, color: '#172b1f' }}>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
        <p style={{ margin: '0 0 22px', color: '#64748b', lineHeight: 1.5 }}>{mode === 'login' ? 'Sign in to continue to KisanPulse.' : mode === 'admin' ? 'Authorized administrators: use the private key configured for this server.' : 'Create an account to get started.'}</p>
        <form onSubmit={submit} style={{ display: 'grid', gap: 13 }}>
          {mode === 'register' && <>
            <input style={fieldStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" required />
            <label style={{ display: 'grid', gap: 6, color: '#334155', fontSize: 14, fontWeight: 600 }}>Account type
              <select style={fieldStyle} value={role} onChange={(e) => setRole(e.target.value)}><option value="farmer">Farmer / Seller</option><option value="buyer">Buyer</option></select>
            </label>
          </>}
          {mode !== 'admin' && <input style={fieldStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" autoComplete="email" required />}
          <input style={fieldStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === 'admin' ? 'Admin key' : 'Password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required />
          {error && <p role="alert" style={{ margin: 0, color: '#b91c1c', fontSize: 13 }}>{error}</p>}
          <button disabled={busy} type="submit" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, border: 0, borderRadius: 10, padding: 13, background: '#16803c', color: '#fff', fontWeight: 700, fontSize: 15, cursor: busy ? 'wait' : 'pointer' }}>
            <LockKeyhole size={17} /> {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : mode === 'admin' ? 'Admin sign in' : 'Create account'}
          </button>
        </form>
        <p style={{ margin: '18px 0', textAlign: 'center', color: '#64748b', fontSize: 14 }}>
          {mode === 'login' ? 'New to KisanPulse? ' : mode === 'register' ? 'Already registered? ' : 'Admin access only · '}
          <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setPassword(''); }} style={{ border: 0, background: 'none', color: '#166534', fontWeight: 700, cursor: 'pointer' }}>
            {mode === 'login' ? 'Create account' : 'Sign in'}
          </button>
          {mode !== 'admin' && <><span> · </span><button type="button" onClick={() => { setMode('admin'); setError(''); setPassword(''); }} style={{ border: 0, background: 'none', color: '#166534', fontWeight: 700, cursor: 'pointer' }}>Admin</button></>}
        </p>
        <div style={{ padding: 11, borderRadius: 9, background: '#f8fafc', color: '#64748b', fontSize: 12, lineHeight: 1.5 }}>
          Accounts are saved in the KisanPulse server database. Passwords are stored as secure hashes, never as plain text.
        </div>
      </section>
    </main>
  );
}
