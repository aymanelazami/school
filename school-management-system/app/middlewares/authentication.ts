import type { Request, Response, NextFunction } from "express";
import passport from "../config/passport.ts";
import { tokenBlacklist } from "../controllers/logoutController.ts";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    // If authenticated via session, check if 2FA is needed
    if ((req.user as any).twoFactorEnabled && !(req.session as any).twoFactorVerified) {
      return res.status(403).json({ error: 'Forbidden - 2FA verification required' });
    }
    return next();
  }

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token && tokenBlacklist.has(token)) {
      return res.status(401).json({ error: 'Unauthorized - Token is blacklisted' });
    }
  }

  passport.authenticate('jwt', { session: false }, (err: any, user: any, info: any) => {
    if (err) {
      return res.status(500).json({ error: 'Authentication error' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token or session' });
    }
    // If authenticated via JWT, the token should be a final one, not a temp one.
    if (user.purpose === '2fa_verification') {
      return res.status(401).json({ error: 'Unauthorized - 2FA verification required' });
    }
    req.user = user;
    next();
  })(req, res, next);
};

export const requireRole = (roles: string[] | string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req.user as any)?.roleId;

    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!userRole || !allowedRoles.includes(userRole.toString())) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
};