//   requireAuth   — 401 if no logged-in user
//   requireAdmin  — 401 if not logged in, 403 if not admin
 
import type { NextFunction, Request, Response } from 'express';
import { SESSION_COOKIE_NAME, findSessionUser } from '../lib/auth.js';
 
export async function attachUser(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const cookies = req.cookies as Record<string, string> | undefined;
  const sessionId = cookies?.[SESSION_COOKIE_NAME];
  if (sessionId) {
    const user = await findSessionUser(sessionId);
    if (user) req.user = user;
  }
  next();
}
 
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'authentication required' });
    return;
  }
  next();
}
 
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'authentication required' });
    return;
  }
  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'admin access required' });
    return;
  }
  next();
}