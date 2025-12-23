import { type typePermission } from "../database/customTypes/typeObject.ts";

export class PermissionHelper {
  /**
   * Check if permissions array contains specific permission
   */
  static hasPermission(
    permissions: typePermission,
    section: string,
    action: string
  ): boolean {
    return permissions.includes(`${section}:${action}`);
  }

  /**
   * Check if user has any of the required permissions
   */
  static hasAnyPermission(
    permissions: typePermission,
    requiredPermissions: string[]
  ): boolean {
    return requiredPermissions.some(permission =>
      permissions.includes(permission)
    );
  }

  /**
   * Check if user has all required permissions
   */
  static hasAllPermissions(
    permissions: typePermission,
    requiredPermissions: string[]
  ): boolean {
    return requiredPermissions.every(permission =>
      permissions.includes(permission)
    );
  }

  /**
   * Add permission to array
   */
  static addPermission(
    permissions: typePermission,
    section: string,
    action: string
  ): typePermission {
    const newPermissions = [...permissions];
    const permissionString = `${section}:${action}`;

    if (!newPermissions.includes(permissionString)) {
      newPermissions.push(permissionString);
    }

    return newPermissions;
  }

  /**
   * Remove permission from array
   */
  static removePermission(
    permissions: typePermission,
    section: string,
    action: string
  ): typePermission {
    const permissionString = `${section}:${action}`;
    return permissions.filter(p => p !== permissionString);
  }

  /**
   * Get permissions by section
   */
  static getPermissionsBySection(permissions: typePermission, section: string): string[] {
    return permissions
      .filter(p => p.startsWith(`${section}:`))
      .map(p => p.split(':')[1])
      .filter((p): p is string => p !== undefined);
  }

  /**
   * Check if user has permission for any action in a section
   */
  static hasSectionAccess(permissions: typePermission, section: string): boolean {
    return permissions.some(p => p.startsWith(`${section}:`));
  }
}