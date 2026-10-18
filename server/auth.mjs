import { createHash, pbkdf2 as pbkdf2Callback, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const pbkdf2 = promisify(pbkdf2Callback);
const COOKIE = 'kisanpulse_session';
const SESSION_TTL = 14 * 24 * 60 * 60 * 1000;

export function initializeAuth(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS app_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE, password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL, password_scheme TEXT NOT NULL DEFAULT 'scrypt',
      role TEXT NOT NULL DEFAULT 'farmer',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS app_sessions (
      token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS app_sessions_expiry_idx ON app_sessions(expires_at);
  `);
  const userColumns = new Set(db.prepare('PRAGMA table_info(app_users)').all().map((column) => column.name));
  if (!userColumns.has('role')) db.exec("ALTER TABLE app_users ADD COLUMN role TEXT NOT NULL DEFAULT 'farmer'");
}

const tokenHash = (token) => createHash('sha256').update(token).digest('hex');
const normalizeEmail = (email) => typeof email === 'string' ? email.trim().toLowerCase() : '';
const publicUser = (user) => ({ name: user.name, email: user.email, role: user.role || 'farmer' });

function readToken(req) {
  const cookie = String(req.headers.cookie || '').split(';').map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE}=`));
  if (!cookie) return '';
  try { return decodeURIComponent(cookie.slice(COOKIE.length + 1)); } catch { return ''; }
}

function respond(res, status, payload, token, maxAge = SESSION_TTL / 1000) {
  const headers = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };
  if (token !== undefined) headers['set-cookie'] = `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
  res.writeHead(status, headers);
  res.end(JSON.stringify(payload));
}

async function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return { salt: salt.toString('base64'), hash: Buffer.from(hash).toString('base64') };
}

async function verifyPassword(password, user) {
  try {
    const salt = Buffer.from(user.password_salt, 'base64');
    const expected = Buffer.from(user.password_hash, 'base64');
    if (!salt.length || !expected.length) return false;
    const actual = user.password_scheme === 'pbkdf2-sha256'
      ? await pbkdf2(password, salt, 120000, 32, 'sha256')
      : await scrypt(password, salt, expected.length, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
    return expected.length === actual.length && timingSafeEqual(expected, Buffer.from(actual));
  } catch { return false; }
}

function setSession(db, res, user) {
  db.prepare('DELETE FROM app_sessions WHERE expires_at<=?').run(Date.now());
  const token = randomBytes(32).toString('base64url');
  db.prepare('INSERT INTO app_sessions(token_hash,user_id,expires_at) VALUES(?,?,?)').run(tokenHash(token), user.id, Date.now() + SESSION_TTL);
  respond(res, 200, { user: publicUser(user) }, token);
}

export function getAuthenticatedUser(req, db) {
  const token = readToken(req);
  return token ? db.prepare('SELECT u.id,u.name,u.email,u.role FROM app_sessions s JOIN app_users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?').get(tokenHash(token), Date.now()) || null : null;
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left || ''));
  const b = Buffer.from(String(right || ''));
  return a.length > 0 && a.length === b.length && timingSafeEqual(a, b);
}

export async function handleAuthRequest(req, res, url, db, readBody) {
  const path = url.pathname;
  if (!path.startsWith('/api/auth/')) return false;
  if (path === '/api/auth/me' && req.method === 'GET') {
    const user = getAuthenticatedUser(req, db);
    respond(res, 200, { user: user ? publicUser(user) : null });
    return true;
  }
  if (path === '/api/auth/admin-login' && req.method === 'POST') {
    const body = await readBody(req);
    const configuredKey = process.env.ADMIN_API_KEY;
    if (!configuredKey || !safeEqual(body.adminKey, configuredKey)) { respond(res, 401, { error: 'Admin key is incorrect or not configured on the server.' }); return true; }
    let admin = db.prepare("SELECT id,name,email,role FROM app_users WHERE email='admin@kisanpulse.invalid'").get();
    if (admin && admin.role !== 'admin') { respond(res, 409, { error: 'Admin account reservation conflict. Contact the project maintainer.' }); return true; }
    if (!admin) {
      const secret = randomBytes(48);
      const result = db.prepare("INSERT INTO app_users(name,email,password_hash,password_salt,password_scheme,role) VALUES('KisanPulse Admin','admin@kisanpulse.invalid',?,?,'admin-key','admin')").run(secret.toString('base64'), randomBytes(16).toString('base64'));
      admin = { id: Number(result.lastInsertRowid), name: 'KisanPulse Admin', email: 'admin@kisanpulse.invalid', role: 'admin' };
    }
    setSession(db, res, admin);
    return true;
  }
  if (path === '/api/auth/logout' && req.method === 'POST') {
    const token = readToken(req);
    if (token) db.prepare('DELETE FROM app_sessions WHERE token_hash=?').run(tokenHash(token));
    respond(res, 200, { ok: true }, '', 0);
    return true;
  }
  if (path === '/api/auth/register' && req.method === 'POST') {
    const body = await readBody(req);
    const name = String(body.name || '').trim();
    const email = normalizeEmail(body.email);
    const password = typeof body.password === 'string' ? body.password : '';
    const role = body.role === 'buyer' ? 'buyer' : body.role === 'farmer' ? 'farmer' : '';
    if (!name || name.length > 100) { respond(res, 400, { error: 'Enter a name under 100 characters.' }); return true; }
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { respond(res, 400, { error: 'Enter a valid email address.' }); return true; }
    if (email === 'admin@kisanpulse.invalid') { respond(res, 400, { error: 'This email address is reserved.' }); return true; }
    if (!role) { respond(res, 400, { error: 'Choose Buyer or Farmer for this account.' }); return true; }
    if (password.length < 8 || Buffer.byteLength(password) > 1024) { respond(res, 400, { error: 'Use a password with at least 8 characters.' }); return true; }
    const fields = await hashPassword(password);
    try {
      const result = db.prepare('INSERT INTO app_users(name,email,password_hash,password_salt,password_scheme,role) VALUES(?,?,?,?,?,?)').run(name, email, fields.hash, fields.salt, 'scrypt', role);
      setSession(db, res, { id: Number(result.lastInsertRowid), name, email, role });
    } catch (error) {
      if (String(error.message).includes('UNIQUE')) respond(res, 409, { error: 'An account with this email already exists.' });
      else throw error;
    }
    return true;
  }
  if (path === '/api/auth/login' && req.method === 'POST') {
    const body = await readBody(req);
    const email = normalizeEmail(body.email);
    const password = typeof body.password === 'string' ? body.password : '';
    const user = db.prepare('SELECT id,name,email,password_hash,password_salt,password_scheme,role FROM app_users WHERE email=?').get(email);
    if (!user || user.role === 'admin' || !await verifyPassword(password, user)) respond(res, 401, { error: 'Email or password is incorrect.' });
    else {
      if (user.password_scheme !== 'scrypt') {
        const fields = await hashPassword(password);
        db.prepare("UPDATE app_users SET password_hash=?,password_salt=?,password_scheme='scrypt' WHERE id=?").run(fields.hash, fields.salt, user.id);
      }
      setSession(db, res, user);
    }
    return true;
  }
  if (path === '/api/auth/migrate-legacy' && req.method === 'POST') {
    const { accounts } = await readBody(req);
    if (!accounts || typeof accounts !== 'object' || Array.isArray(accounts)) { respond(res, 400, { error: 'Invalid legacy account data.' }); return true; }
    const insert = db.prepare("INSERT OR IGNORE INTO app_users(name,email,password_hash,password_salt,password_scheme) VALUES(?,?,?,?, 'pbkdf2-sha256')");
    let imported = 0;
    db.exec('BEGIN');
    try {
      for (const [rawEmail, account] of Object.entries(accounts).slice(0, 1000)) {
        const email = normalizeEmail(rawEmail);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof account?.name !== 'string' || typeof account?.salt !== 'string' || typeof account?.passwordHash !== 'string') continue;
        imported += Number(insert.run(account.name.trim().slice(0, 100), email, account.passwordHash.slice(0, 200), account.salt.slice(0, 100)).changes);
      }
      db.exec('COMMIT');
    } catch (error) { db.exec('ROLLBACK'); throw error; }
    respond(res, 200, { ok: true, imported });
    return true;
  }
  respond(res, 404, { error: 'Account endpoint not found.' });
  return true;
}
