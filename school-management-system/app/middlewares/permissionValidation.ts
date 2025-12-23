import type { Request, Response, NextFunction } from 'express';
import { PermissionHelper } from '../utilities/permissionHelper.ts';
import { db } from '../config/database.ts';
import { eq } from 'drizzle-orm';
import { roles } from '../database/role.ts';

export interface PermissionOptions {
  section: string;
  action: string;
  requireAll?: boolean;
}

/**
 * Middleware factory for permission checking
 * Uses permissions already attached to req.user by Passport JWT strategy
 */
export function requirePermission(options: PermissionOptions | PermissionOptions[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      if (!req.user.permissions || !Array.isArray(req.user.permissions)) {
        return res.status(403).json({
          success: false,
          error: 'No permissions found for user'
        });
      }

      const permissionsArray = Array.isArray(options) ? options : [options];

      // Check permissions based on requireAll flag
      if (Array.isArray(options) && (options as any).requireAll) {
        // Require ALL permissions
        const hasAll = permissionsArray.every(opt =>
          PermissionHelper.hasPermission(req.user!.permissions!, opt.section, opt.action)
        );

        if (!hasAll) {
          return res.status(403).json({
            success: false,
            error: 'Insufficient permissions',
            required: permissionsArray,
            userPermissions: req.user!.permissions
          });
        }
      } else {
        // Require ANY permission (default)
        const hasAny = permissionsArray.some(opt =>
          PermissionHelper.hasPermission(req.user!.permissions!, opt.section, opt.action)
        );

        if (!hasAny) {
          return res.status(403).json({
            success: false,
            error: 'Insufficient permissions',
            required: permissionsArray,
            userPermissions: req.user!.permissions
          });
        }
      }

      next();
    } catch (error) {
      console.error('Permission middleware error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
}

/**
 * Simple middleware to check if user has specific permission
 * No database query needed - uses permissions from Passport JWT
 */
export function checkPermission(section: string, action: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.permissions) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!PermissionHelper.hasPermission(req.user.permissions, section, action)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        required: `${section}:${action}`,
        userPermissions: req.user.permissions
      });
    }

    next();
  };
}

/**
 * Optional: Only use if you need to refresh permissions from database
 * Otherwise, rely on JWT token permissions
 *
 * NOTE: This function is currently disabled because it requires db.query
 * with schema setup. For now, rely on JWT token permissions which are
 * set during login.
 */
// export function attachPermissions() {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       if (!req.user) {
//         return next();
//       }
//
//       // If permissions are already set by JWT, skip database query
//       if (req.user.permissions && Array.isArray(req.user.permissions)) {
//         return next();
//       }
//
//       // Only query database if permissions aren't in JWT
//       const userRole = await db.query.roles.findFirst({
//         where: eq(roles.id, req.user.roleId),
//         with: {
//           permissions: true
//         }
//       });
//
//       if (userRole) {
//         const allPermissions: string[] = [];
//         for (const permissionRecord of userRole.permissions) {
//           allPermissions.push(...permissionRecord.permissionsAllowed);
//         }
//
//         req.user.role = userRole.name;
//         req.user.permissions = allPermissions;
//       }
//
//       next();
//     } catch (error) {
//       console.error('Attach permissions error:', error);
//       next();
//     }
//   };
// }