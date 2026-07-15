import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

declare global { namespace Express { interface Request { user?: { id: string; role: string; email?: string; phone?: string } } } }
export function auth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ message: 'Authentication required' });
  try { req.user = jwt.verify(token, env.jwtSecret) as any; next(); }
  catch { return res.status(401).json({ message: 'Invalid or expired token' }); }
}
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (token) try { req.user = jwt.verify(token, env.jwtSecret) as any; } catch {}
  next();
}
