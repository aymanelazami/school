import type { Request, Response, NextFunction } from 'express';
import passport from '../config/passport.ts';
import jwt from 'jsonwebtoken';
import { eq } from "drizzle-orm";
import { users } from "../database/user.ts";
import { roles } from '../database/role.ts';
import { permissionsTable } from '../database/permissions.ts';
import { db } from '../config/database.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'af3ee0f71443408897c5db5e0b7cbf17';

export const login = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local', async (err: any, user: any, info: any) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (!user) {
      return res.status(401).json({ message: info?.message || 'Authentication failed' });
    }

    req.login(user, async (loginErr) => {
      if (loginErr) {
        console.error('Session login error:', loginErr);
        return res.status(500).json({ message: 'Session login failed' });
      }

      const userWithDetails = await db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          twoFactorEnabled: users.twoFactorEnabled,
          roleId: users.roleId,
          roleName: roles.name,
          permissions: permissionsTable.permissionsAllowed
        })
        .from(users)
        .leftJoin(roles, eq(users.roleId, roles.id))
        .leftJoin(permissionsTable, eq(permissionsTable.roleId, roles.id))
        .where(eq(users.id, user.id));

      if (userWithDetails.length === 0) {
        return res.status(401).json({ message: 'User not found' });
      }

      const userData = userWithDetails[0];
      if (!userData) {
        return res.status(401).json({ message: 'User data not found' });
      }

      const allPermissions: string[] = [];
      userWithDetails.forEach(data => {
        if (data.permissions) {
          allPermissions.push(...data.permissions);
        }
      });

      const uniquePermissions = [...new Set(allPermissions)];

      const sessionUser = {
        ...user,
        role: userData.roleName,
        permissions: uniquePermissions,
      };

      req.user = sessionUser;

      if (userData.twoFactorEnabled) {
        // @ts-ignore
        req.session.twoFactorVerified = false;

        const tempToken = jwt.sign(
          {
            id: user.id,
            email: user.email,
            roleId: userData.roleId,
            role: userData.roleName,
            permissions: uniquePermissions,
            purpose: '2fa_verification'
          },
          JWT_SECRET,
          { expiresIn: '5m' }
        );

        return res.json({
          requires2FA: true,
          message: "2FA verification required",
          email: user.email,
          tempToken: tempToken
        });
      }

      // @ts-ignore
      req.session.twoFactorVerified = true;

      const tokenPayload = {
        id: user.id,
        email: user.email,
        roleId: userData.roleId,
        role: userData.roleName,
        permissions: uniquePermissions
      };

      const token = jwt.sign(
        tokenPayload,
        JWT_SECRET,
        { expiresIn: '12h' }
      );

      const { password: _, ...userWithoutPassword } = user;

      res.json({
        message: 'Connexion réussie',
        token: `Bearer ${token}`,
        user: {
          ...userWithoutPassword,
          role: userData.roleName,
          permissions: uniquePermissions
        },
        requires2FA: false
      });
    });
  })(req, res, next);
};