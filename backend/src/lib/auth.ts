import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import pool from '../db.js';
import type { PublicUser, Session, UserRole } from '../types/auth.js';
 
const BCRYPT_ROUNDS = 10;
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;       // 7 days
 
// ---------- passwords ----------
 
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}
 
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
 
// ---------- sessions ----------
 
export async function createSession(userId: number): Promise<Session> {
  const sessionId = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
 
  const result = await pool.query<Session>(
    `INSERT INTO sessions (session_id, user_id, expires_at)
     VALUES ($1, $2, $3)
     RETURNING session_id, user_id, expires_at, created_at`,
    [sessionId, userId, expiresAt],
  );
  const row = result.rows[0];
  if (!row) throw new Error('Failed to create session');
  return row;
}
 
export async function findSessionUser(sessionId: string): Promise<PublicUser | null> {
  const result = await pool.query<{
    user_id: number;
    username: string;
    email: string;
    role: UserRole;
    expires_at: Date;
  }>(
    `SELECT u.user_id, u.username, u.email, u.role, s.expires_at
       FROM sessions s
       JOIN users    u ON u.user_id = s.user_id
      WHERE s.session_id = $1`,
    [sessionId],
  );
  const row = result.rows[0];
  if (!row) return null;
 
  if (row.expires_at < new Date()) {
    await pool.query('DELETE FROM sessions WHERE session_id = $1', [sessionId]);
    return null;
  }
 
  return {
    user_id: row.user_id,
    username: row.username,
    email: row.email,
    role: row.role,
  };
}
 
export async function deleteSession(sessionId: string): Promise<void> {
  await pool.query('DELETE FROM sessions WHERE session_id = $1', [sessionId]);
}
 
// ---------- users ----------
 
export async function countUsers(): Promise<number> {
  const result = await pool.query<{ count: string }>('SELECT COUNT(*) FROM users');
  const row = result.rows[0];
  return row ? Number(row.count) : 0;
}
 
// ---------- cookie config ----------
 
export const SESSION_COOKIE_NAME = 'prembase_session';
 
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env['NODE_ENV'] === 'production',
  sameSite: 'lax' as const,
  maxAge: SESSION_DURATION_MS,
  path: '/',
};