import type { Request, Response, NextFunction } from 'express';

export const tokenBlacklist: Set<string> = new Set();

export const logout = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token) {
      tokenBlacklist.add(token);
    }
  }

  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      // Even if logout fails, we can still try to destroy the session
    }
    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        console.error('Session destruction error:', destroyErr);
        return res.status(500).json({ message: 'Session destruction failed' });
      }
      res.clearCookie('connect.sid'); // The default session cookie name
      res.json({ message: 'Déconnexion réussie' });
    });
  });
};