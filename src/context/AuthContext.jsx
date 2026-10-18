import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);
const LEGACY_ACCOUNTS_KEY = 'kisanpulse_local_accounts';
const LEGACY_SESSION_KEY = 'kisanpulse_session';

async function requestAuth(path, body) {
  let response;
  try {
    response = await fetch(`/api/auth/${path}`, {
      method: body ? 'POST' : 'GET',
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new Error('Could not connect to the account database. Make sure the app server is running.');
  }

  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'Account request failed. Please try again.');
  return result;
}

function readLegacyAccounts() {
  try {
    const accounts = JSON.parse(localStorage.getItem(LEGACY_ACCOUNTS_KEY) || '{}');
    return accounts && typeof accounts === 'object' && !Array.isArray(accounts) ? accounts : {};
  } catch {
    return {};
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    const initialize = async () => {
      try {
        const legacyAccounts = readLegacyAccounts();
        if (Object.keys(legacyAccounts).length) {
          // Migrate existing PBKDF2 hashes without ever sending or storing plaintext passwords.
          await requestAuth('migrate-legacy', { accounts: legacyAccounts });
          localStorage.removeItem(LEGACY_ACCOUNTS_KEY);
          localStorage.removeItem(LEGACY_SESSION_KEY);
        }
        const result = await requestAuth('me');
        if (mounted) setUser(result.user || null);
      } catch {
        // Keep local migration data intact if the server is unavailable so it can retry later.
      } finally {
        if (mounted) setReady(true);
      }
    };
    initialize();
    return () => { mounted = false; };
  }, []);

  const register = async ({ name, email, password, role }) => {
    const result = await requestAuth('register', { name, email, password, role });
    setUser(result.user);
  };

  const login = async ({ email, password }) => {
    const result = await requestAuth('login', { email, password });
    setUser(result.user);
  };

  const adminLogin = async ({ adminKey }) => {
    const result = await requestAuth('admin-login', { adminKey });
    setUser(result.user);
  };

  const logout = async () => {
    try {
      await requestAuth('logout', {});
    } finally {
      setUser(null);
    }
  };

  const value = useMemo(() => ({ user, ready, login, register, adminLogin, logout }), [user, ready]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
