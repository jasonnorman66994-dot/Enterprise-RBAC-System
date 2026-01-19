import { v4 as uuidv4 } from 'uuid';
import { Role, Permission, PermissionAction, ResourceType } from '../types';
import { dataStore } from '../models/DataStore';

export class RBACService {
  // Role management
  createRole(name: string, description: string, permissions: string[] = [], parentRoleId?: string): Role {
    if (dataStore.getRoleByName(name)) {
      throw new Error('Role with this name already exists');
    }

    const role: Role = {
      id: uuidv4(),
      name,
      description,
      permissions,
      parentRoleId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dataStore.addRole(role);
    return role;
  }

  getRole(roleId: string): Role | undefined {
    return dataStore.getRole(roleId);
  }

  getAllRoles(): Role[] {
    return dataStore.getAllRoles();
  }

  updateRole(roleId: string, updates: Partial<Omit<Role, 'id' | 'createdAt'>>): Role {
    const role = dataStore.updateRole(roleId, updates);
    if (!role) {
      throw new Error('Role not found');
    }
    return role;
  }

  deleteRole(roleId: string): boolean {
    return dataStore.deleteRole(roleId);
  }

  addPermissionsToRole(roleId: string, permissionIds: string[]): Role {
    const role = dataStore.getRole(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    const updatedPermissions = Array.from(new Set([...role.permissions, ...permissionIds]));
    return this.updateRole(roleId, { permissions: updatedPermissions });
  }

  removePermissionsFromRole(roleId: string, permissionIds: string[]): Role {
    const role = dataStore.getRole(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    const updatedPermissions = role.permissions.filter(p => !permissionIds.includes(p));
    return this.updateRole(roleId, { permissions: updatedPermissions });
  }

  // Permission management
  createPermission(name: string, resource: string, action: string, description: string): Permission {
    if (dataStore.getPermissionByName(name)) {
      throw new Error('Permission with this name already exists');
    }

    const permission: Permission = {
      id: uuidv4(),
      name,
      resource,
      action,
      description,
      createdAt: new Date(),
    };

    dataStore.addPermission(permission);
    return permission;
  }

  getPermission(permissionId: string): Permission | undefined {
    return dataStore.getPermission(permissionId);
  }

  getAllPermissions(): Permission[] {
    return dataStore.getAllPermissions();
  }

  deletePermission(permissionId: string): boolean {
    return dataStore.deletePermission(permissionId);
  }

  // User-Role assignment
  assignRolesToUser(userId: string, roleIds: string[]): void {
    const user = dataStore.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify all roles exist
    for (const roleId of roleIds) {
      if (!dataStore.getRole(roleId)) {
        throw new Error(`Role ${roleId} not found`);
      }
    }

    const updatedRoles = Array.from(new Set([...user.roles, ...roleIds]));
    dataStore.updateUser(userId, { roles: updatedRoles });
  }

  removeRolesFromUser(userId: string, roleIds: string[]): void {
    const user = dataStore.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const updatedRoles = user.roles.filter(r => !roleIds.includes(r));
    dataStore.updateUser(userId, { roles: updatedRoles });
  }

  // Permission checking
  hasPermission(userId: string, permissionName: string): boolean {
    const permissions = dataStore.getAllUserPermissions(userId);
    const permissionIds = permissions.map(pid => {
      const perm = dataStore.getPermission(pid);
      return perm?.name;
    });
    
    return permissionIds.includes(permissionName);
  }

  hasResourcePermission(userId: string, resource: string, action: PermissionAction): boolean {
    const permissions = dataStore.getAllUserPermissions(userId);
    
    for (const permId of permissions) {
      const permission = dataStore.getPermission(permId);
      if (!permission) continue;

      // Check for wildcard permissions
      if (permission.resource === '*' || permission.action === '*') {
        return true;
      }

      // Check for exact match
      if (permission.resource === resource && permission.action === action) {
        return true;
      }
    }

    return false;
  }

  getUserPermissions(userId: string): Permission[] {
    const permissionIds = dataStore.getAllUserPermissions(userId);
    return permissionIds
      .map(id => dataStore.getPermission(id))
      .filter(p => p !== undefined) as Permission[];
  }

  getUserRoles(userId: string): Role[] {
    const user = dataStore.getUser(userId);
    if (!user) return [];

    return user.roles
      .map(roleId => dataStore.getRole(roleId))
      .filter(r => r !== undefined) as Role[];
  }

  // Hierarchical role support
  getRoleHierarchy(roleId: string): Role[] {
    const hierarchy: Role[] = [];
    let currentRole = dataStore.getRole(roleId);

    while (currentRole) {
      hierarchy.push(currentRole);
      if (currentRole.parentRoleId) {
        currentRole = dataStore.getRole(currentRole.parentRoleId);
      } else {
        break;
      }
    }

    return hierarchy;
  }

  getAllPermissionsInHierarchy(roleId: string): Permission[] {
    const hierarchy = this.getRoleHierarchy(roleId);
    const allPermissionIds = new Set<string>();

    for (const role of hierarchy) {
      role.permissions.forEach(p => allPermissionIds.add(p));
    }

    return Array.from(allPermissionIds)
      .map(id => dataStore.getPermission(id))
      .filter(p => p !== undefined) as Permission[];
  }
}

export const rbacService = new RBACService();
