//   POST /api/auth/register  — first user becomes admin, rest are viewers
//   POST /api/auth/login     — username or email + password
//   POST /api/auth/logout    — clears the session cookie
//   GET  /api/auth/me        — returns the logged-in user
 
import type { Request, Response } from 'express';
import pool from '../db.js';
import {
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
  countUsers,
  createSession,
  deleteSession,
  hashPassword,
  verifyPassword,
} from '../lib/auth.js';
import type { User, UserRole } from '../types/auth.js';
 
interface RegisterBody {
  username?: string;
  email?: string;
  password?: string;
}
 
interface LoginBody {
  identifier?: string;       // username OR email
  password?: string;
}
 
// ---------- POST /api/auth/register ----------
 
export async function register(req: Request, res: Response): Promise<void> {
  const { username, email, password } = (req.body ?? {}) as RegisterBody;
 
  if (!username || !email || !password) {
    res.status(400).json({ error: 'username, email, and password are required' });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: 'password must be at least 8 characters' });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'invalid email format' });
    return;
  }
 
  try {
    // First user signs up as admin; everyone after gets viewer.
    const existingCount = await countUsers();
    const role: UserRole = existingCount === 0 ? 'admin' : 'viewer';
 
    const passwordHash = await hashPassword(password);
 
    const result = await pool.query<User>(
      `INSERT INTO users (username, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING user_id, username, email, role, password_hash, created_at`,
      [username, email, passwordHash, role],
    );
    const user = result.rows[0];
    if (!user) {
      res.status(500).json({ error: 'Failed to create user' });
      return;
    }
 
    const session = await createSession(user.user_id);
    res.cookie(SESSION_COOKIE_NAME, session.session_id, SESSION_COOKIE_OPTIONS);
 
    res.status(201).json({
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    if (isUniqueViolation(err)) {
      res.status(409).json({ error: 'username or email already taken' });
      return;
    }
    console.error('[auth] register failed', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
 
// ---------- POST /api/auth/login ----------
 
export async function login(req: Request, res: Response): Promise<void> {
  const { identifier, password } = (req.body ?? {}) as LoginBody;
 
  if (!identifier || !password) {
    res.status(400).json({ error: 'identifier and password are required' });
    return;
  }
 
  try {
    const result = await pool.query<User>(
      `SELECT user_id, username, email, role, password_hash, created_at
         FROM users
        WHERE username = $1 OR email = $1
        LIMIT 1`,
      [identifier],
    );
    const user = result.rows[0];
    if (!user) {
      res.status(401).json({ error: 'invalid credentials' });
      return;
    }
 
    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) {
      res.status(401).json({ error: 'invalid credentials' });
      return;
    }
 
    const session = await createSession(user.user_id);
    res.cookie(SESSION_COOKIE_NAME, session.session_id, SESSION_COOKIE_OPTIONS);
 
    res.json({
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error('[auth] login failed', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
 
// ---------- POST /api/auth/logout ----------
 
export async function logout(req: Request, res: Response): Promise<void> {
  const cookies = req.cookies as Record<string, string> | undefined;
  const sessionId = cookies?.[SESSION_COOKIE_NAME];
  if (sessionId) {
    await deleteSession(sessionId);
  }
  res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
  res.status(204).end();
}
 
// ---------- GET /api/auth/me ----------
 
export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'not authenticated' });
    return;
  }
  res.json(req.user);
}
 
// ---------- helpers ----------
 
function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: string }).code === '23505'
  );
}
