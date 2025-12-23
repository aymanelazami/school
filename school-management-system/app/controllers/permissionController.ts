import type { Request, Response } from 'express';
import { permissionsTable } from '../database/permissions.ts';
import { roles } from '../database/role.ts';
import { eq, and } from 'drizzle-orm';
import { PermissionHelper } from '../utilities/permissionHelper.ts';
import { db } from '../config/database.ts';

export class PermissionController {
  /**
   * Get all permissions
   */
  static async getAllPermissions(req: Request, res: Response) {
    try {
      const permissions = await db
        .select({
          id: permissionsTable.id,
          description: permissionsTable.description,
          permissionsAllowed: permissionsTable.permissionsAllowed,
          roleId: permissionsTable.roleId,
          createdAt: permissionsTable.createdAt,
          updatedAt: permissionsTable.updatedAt,
          role: {
            id: roles.id,
            name: roles.name
          }
        })
        .from(permissionsTable)
        .leftJoin(roles, eq(permissionsTable.roleId, roles.id));

      res.json({
        success: true,
        data: permissions,
        count: permissions.length
      });
    } catch (error) {
      console.error('Get all permissions error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch permissions'
      });
    }
  }

  /**
   * Get permissions for a specific role
   */
  static async getRolePermissions(req: Request, res: Response) {
    try {
      const { roleId } = req.params;

      if (!roleId) {
        return res.status(400).json({
          success: false,
          error: 'roleId is required'
        });
      }

      const permissions = await db
        .select({
          id: permissionsTable.id,
          description: permissionsTable.description,
          permissionsAllowed: permissionsTable.permissionsAllowed,
          roleId: permissionsTable.roleId,
          createdAt: permissionsTable.createdAt,
          updatedAt: permissionsTable.updatedAt,
          role: {
            id: roles.id,
            name: roles.name
          }
        })
        .from(permissionsTable)
        .leftJoin(roles, eq(permissionsTable.roleId, roles.id))
        .where(eq(permissionsTable.roleId, parseInt(roleId)));

      if (permissions.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'No permissions found for this role'
        });
      }

      res.json({
        success: true,
        data: permissions,
        count: permissions.length
      });
    } catch (error) {
      console.error('Get role permissions error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch role permissions'
      });
    }
  }

  /**
   * Create new permission set for a role
   */
  static async createPermission(req: Request, res: Response) {
    try {
      const { roleId, description, permissionsAllowed } = req.body;

      // Validate required fields
      if (!roleId || !description || !permissionsAllowed) {
        return res.status(400).json({
          success: false,
          error: 'roleId, description, and permissionsAllowed are required'
        });
      }

      // Verify role exists
      const role = await db
        .select()
        .from(roles)
        .where(eq(roles.id, parseInt(roleId)))
        .limit(1);

      if (role.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Role not found'
        });
      }

      // Validate permissions format
      if (!Array.isArray(permissionsAllowed)) {
        return res.status(400).json({
          success: false,
          error: 'permissionsAllowed must be an array of strings'
        });
      }

      for (const permission of permissionsAllowed) {
        if (typeof permission !== 'string' || !permission.includes(':')) {
          return res.status(400).json({
            success: false,
            error: `Invalid permission format: "${permission}". Must be in "section:action" format`
          });
        }
      }

      const [newPermission] = await db
        .insert(permissionsTable)
        .values({
          roleId: parseInt(roleId),
          description,
          permissionsAllowed
        })
        .returning();

      res.status(201).json({
        success: true,
        message: 'Permission set created successfully',
        data: newPermission
      });
    } catch (error) {
      console.error('Create permission error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create permission set'
      });
    }
  }

  /**
   * Update permission set
   */
  static async updatePermission(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { description, permissionsAllowed } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'id is required'
        });
      }

      // Check if permission exists
      const existingPermission = await db
        .select()
        .from(permissionsTable)
        .where(eq(permissionsTable.id, parseInt(id)))
        .limit(1);

      if (existingPermission.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Permission set not found'
        });
      }

      // Validate permissions format if provided
      if (permissionsAllowed && !Array.isArray(permissionsAllowed)) {
        return res.status(400).json({
          success: false,
          error: 'permissionsAllowed must be an array of strings'
        });
      }

      if (permissionsAllowed) {
        for (const permission of permissionsAllowed) {
          if (typeof permission !== 'string' || !permission.includes(':')) {
            return res.status(400).json({
              success: false,
              error: `Invalid permission format: "${permission}". Must be in "section:action" format`
            });
          }
        }
      }

      const updateData: any = {
        updatedAt: new Date()
      };

      if (description !== undefined) updateData.description = description;
      if (permissionsAllowed !== undefined) updateData.permissionsAllowed = permissionsAllowed;

      const [updatedPermission] = await db
        .update(permissionsTable)
        .set(updateData)
        .where(eq(permissionsTable.id, parseInt(id)))
        .returning();

      res.json({
        success: true,
        message: 'Permission set updated successfully',
        data: updatedPermission
      });
    } catch (error) {
      console.error('Update permission error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update permission set'
      });
    }
  }

  /**
   * Delete permission set
   */
  static async deletePermission(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'id is required'
        });
      }

      // Check if permission exists
      const existingPermission = await db
        .select()
        .from(permissionsTable)
        .where(eq(permissionsTable.id, parseInt(id)))
        .limit(1);

      if (existingPermission.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Permission set not found'
        });
      }

      await db
        .delete(permissionsTable)
        .where(eq(permissionsTable.id, parseInt(id)));

      res.json({
        success: true,
        message: 'Permission set deleted successfully'
      });
    } catch (error) {
      console.error('Delete permission error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete permission set'
      });
    }
  }

  /**
   * Add permission to existing permission set
   */
  static async addPermissionToSet(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { section, action } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'id is required'
        });
      }

      if (!section || !action) {
        return res.status(400).json({
          success: false,
          error: 'section and action are required'
        });
      }

      // Get existing permission set
      const permissionSet = await db
        .select()
        .from(permissionsTable)
        .where(eq(permissionsTable.id, parseInt(id)))
        .limit(1);

      if (permissionSet.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Permission set not found'
        });
      }

      const foundPermission = permissionSet[0];
      if (!foundPermission) {
        return res.status(404).json({
          success: false,
          error: 'Permission set data not found'
        });
      }

      const existingPermissions = foundPermission.permissionsAllowed;
      const updatedPermissions = PermissionHelper.addPermission(
        existingPermissions,
        section,
        action
      );

      const [updatedPermission] = await db
        .update(permissionsTable)
        .set({
          permissionsAllowed: updatedPermissions,
          updatedAt: new Date()
        })
        .where(eq(permissionsTable.id, parseInt(id)))
        .returning();

      res.json({
        success: true,
        message: 'Permission added successfully',
        data: updatedPermission
      });
    } catch (error) {
      console.error('Add permission error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add permission'
      });
    }
  }

  /**
   * Remove permission from permission set
   */
  static async removePermissionFromSet(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { section, action } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'id is required'
        });
      }

      if (!section || !action) {
        return res.status(400).json({
          success: false,
          error: 'section and action are required'
        });
      }

      // Get existing permission set
      const permissionSet = await db
        .select()
        .from(permissionsTable)
        .where(eq(permissionsTable.id, parseInt(id)))
        .limit(1);

      if (permissionSet.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Permission set not found'
        });
      }

      const foundPermission = permissionSet[0];
      if (!foundPermission) {
        return res.status(404).json({
          success: false,
          error: 'Permission set data not found'
        });
      }

      const existingPermissions = foundPermission.permissionsAllowed;
      const updatedPermissions = PermissionHelper.removePermission(
        existingPermissions,
        section,
        action
      );

      const [updatedPermission] = await db
        .update(permissionsTable)
        .set({
          permissionsAllowed: updatedPermissions,
          updatedAt: new Date()
        })
        .where(eq(permissionsTable.id, parseInt(id)))
        .returning();

      res.json({
        success: true,
        message: 'Permission removed successfully',
        data: updatedPermission
      });
    } catch (error) {
      console.error('Remove permission error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to remove permission'
      });
    }
  }

  /**
   * Get available permission templates
   */
  static async getPermissionTemplates(req: Request, res: Response) {
    try {
      const templates = {
        admin: [
          "user:create", "user:read", "user:update", "user:delete",
          "student:create", "student:read", "student:update", "student:delete",
          "teacher:create", "teacher:read", "teacher:update", "teacher:delete",
          "course:create", "course:read", "course:update", "course:delete",
          "class:create", "class:read", "class:update", "class:delete",
          "attendance:create", "attendance:read", "attendance:update", "attendance:delete",
          "grade:create", "grade:read", "grade:update", "grade:delete",
          "permission:create", "permission:read", "permission:update", "permission:delete",
          "role:create", "role:read", "role:update", "role:delete",
          "system:manage", "reports:generate"
        ],
        teacher: [
          "student:read", "attendance:create", "attendance:read", "attendance:update",
          "grade:create", "grade:read", "grade:update", "class:read",
          "course:read", "reports:generate"
        ],
        student: [
          "student:read", "attendance:read", "grade:read", "class:read",
          "course:read"
        ]
      };

      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error('Get permission templates error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch permission templates'
      });
    }
  }
}