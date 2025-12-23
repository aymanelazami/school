import { Router } from 'express';
import { PermissionController } from '../controllers/permissionController.ts';
import { requirePermission } from '../middlewares/permissionValidation.ts';

const permissionRouter = Router();

// Get all permissions (Admin only)
permissionRouter.get(
  '/', 
  requirePermission({ section: 'permission', action: 'read' }),
  PermissionController.getAllPermissions
);
permissionRouter.get(
  '/role/:roleId',
  requirePermission({ section: 'permission', action: 'read' }),
  PermissionController.getRolePermissions
);
// Create new permission set (Admin only)
permissionRouter.post(
  '/',
  requirePermission({ section: 'permission', action: 'create' }),
  PermissionController.createPermission
);
// Update permission set (Admin only)
permissionRouter.put(
  '/:id',
  requirePermission({ section: 'permission', action: 'update' }),
  PermissionController.updatePermission
);
// Delete permission set (Admin only)
permissionRouter.delete(
  '/:id',
  requirePermission({ section: 'permission', action: 'delete' }),
  PermissionController.deletePermission
);
// Add permission to set (Admin only)
permissionRouter.patch(
  '/:id/add-permission',
  requirePermission({ section: 'permission', action: 'update' }),
  PermissionController.addPermissionToSet
);

export default permissionRouter;