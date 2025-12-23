import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { Request, Response } from 'express';
import { users } from "../database/user.ts";
import { roles } from "../database/role.ts";
import { permissionsTable } from "../database/permissions.ts";

const db = drizzle(process.env.DATABASE_URL!);

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userRequest = (req as any).user;

    const userData = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        birthDate: users.birthDate,
        isActive: users.isActive,
        emailVerified: users.emailVerified,
        roleId: users.roleId,
        roleName: roles.name,
        permissions: permissionsTable.permissionsAllowed
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .leftJoin(permissionsTable, eq(permissionsTable.roleId, roles.id))
      .where(eq(users.id, userRequest.id));

    if (userData.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const allPermissions: string[] = [];
    userData.forEach(data => {
      if (data.permissions) {
        allPermissions.push(...data.permissions);
      }
    });

    const result = userData[0];

    if (!result) {
      return res.status(404).json({ error: 'User data not found' });
    }

    const userProfile = {
      id: result.id,
      firstName: result.firstName,
      lastName: result.lastName,
      email: result.email,
      birthDate: result.birthDate,
      isActive: result.isActive,
      emailVerified: result.emailVerified,
      roleId: result.roleId,
      roleName: result.roleName,
      permissions: [...new Set(allPermissions)]
    };

    res.json({
      user: userProfile
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};