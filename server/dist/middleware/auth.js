import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
export function auth(req, res, next) {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token)
        return res.status(401).json({ message: 'Authentication required' });
    try {
        req.user = jwt.verify(token, env.jwtSecret);
        next();
    }
    catch {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}
export function optionalAuth(req, _res, next) {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (token)
        try {
            req.user = jwt.verify(token, env.jwtSecret);
        }
        catch { }
    next();
}
