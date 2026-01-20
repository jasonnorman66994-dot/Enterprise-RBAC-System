import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { rbacService } from '../services/RBACService';
import { auditService } from '../services/AuditService';
import { collaborationService } from '../services/CollaborationService';

export class RBACController {
  // Role endpoints
  async createRole(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, description, permissions = [], parentRoleId } = req.body;

      if (!name || !description) {
        res.status(400).json({ error: 'Name and description are required' });
        return;
      }

      const role = rbacService.createRole(name, description, permissions, parentRoleId);

      if (req.user) {
        auditService.logSuccess(
          req.user.userId,
          req.user.username,
          'create_role',
          'role',
          { roleId: role.id, name, permissions },
          { resourceId: role.id, ipAddress: req.ip, userAgent: req.headers['user-agent'] }
        );

        collaborationService.broadcastEvent({
          type: 'role_updated',
          userId: req.user.userId,
          data: { roleId: role.id, roleName: role.name, action: 'created' },
          timestamp: new Date(),
        });
      }

      res.status(201).json({ role });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getRole(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { roleId } = req.params;
      const role = rbacService.getRole(roleId as string);

      if (!role) {
        res.status(404).json({ error: 'Role not found' });
        return;
      }

      res.json({ role });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getAllRoles(req: AuthRequest, res: Response): Promise<void> {
    try {
      const roles = rbacService.getAllRoles();
      res.json({ roles });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async updateRole(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { roleId } = req.params;
      const updates = req.body;

      const role = rbacService.updateRole(roleId as string, updates);

      if (req.user) {
        auditService.logSuccess(
          req.user.userId,
          req.user.username,
          'update_role',
          'role',
          { roleId, updates },
          { resourceId: roleId as string, ipAddress: req.ip, userAgent: req.headers['user-agent'] }
        );

        collaborationService.broadcastEvent({
          type: 'role_updated',
          userId: req.user.userId,
          data: { roleId: role.id, roleName: role.name, action: 'updated' },
          timestamp: new Date(),
        });
      }

      res.json({ role });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async deleteRole(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { roleId } = req.params;
      const deleted = rbacService.deleteRole(roleId as string);

      if (!deleted) {
        res.status(404).json({ error: 'Role not found' });
        return;
      }

      if (req.user) {
        auditService.logSuccess(
          req.user.userId,
          req.user.username,
          'delete_role',
          'role',
          { roleId },
          { resourceId: roleId as string, ipAddress: req.ip, userAgent: req.headers['user-agent'] }
        );
      }

      res.json({ message: 'Role deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  // Permission endpoints
  async createPermission(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, resource, action, description } = req.body;

      if (!name || !resource || !action || !description) {
        res.status(400).json({ error: 'All fields are required' });
        return;
      }

      const permission = rbacService.createPermission(name, resource, action, description);

      if (req.user) {
        auditService.logSuccess(
          req.user.userId,
          req.user.username,
          'create_permission',
          'permission',
          { permissionId: permission.id, name, resource, action },
          { resourceId: permission.id, ipAddress: req.ip, userAgent: req.headers['user-agent'] }
        );
      }

      res.status(201).json({ permission });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getAllPermissions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const permissions = rbacService.getAllPermissions();
      res.json({ permissions });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async deletePermission(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { permissionId } = req.params;
      const deleted = rbacService.deletePermission(permissionId as string);

      if (!deleted) {
        res.status(404).json({ error: 'Permission not found' });
        return;
      }

      if (req.user) {
        auditService.logSuccess(
          req.user.userId,
          req.user.username,
          'delete_permission',
          'permission',
          { permissionId },
          { resourceId: permissionId as string, ipAddress: req.ip, userAgent: req.headers['user-agent'] }
        );
      }

      res.json({ message: 'Permission deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  // User role assignment
  async assignRoles(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { roleIds } = req.body;

      if (!roleIds || !Array.isArray(roleIds)) {
        res.status(400).json({ error: 'roleIds array is required' });
        return;
      }

      rbacService.assignRolesToUser(userId as string, roleIds);

      if (req.user) {
        auditService.logSuccess(
          req.user.userId,
          req.user.username,
          'assign_roles',
          'user',
          { userId, roleIds },
          { resourceId: userId as string, ipAddress: req.ip, userAgent: req.headers['user-agent'] }
        );

        collaborationService.broadcastEvent({
          type: 'user_updated',
          userId: userId as string,
          data: { action: 'roles_assigned', roleIds },
          timestamp: new Date(),
        });
      }

      res.json({ message: 'Roles assigned successfully' });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async removeRoles(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { roleIds } = req.body;

      if (!roleIds || !Array.isArray(roleIds)) {
        res.status(400).json({ error: 'roleIds array is required' });
        return;
      }

      rbacService.removeRolesFromUser(userId as string, roleIds);

      if (req.user) {
        auditService.logSuccess(
          req.user.userId,
          req.user.username,
          'remove_roles',
          'user',
          { userId, roleIds },
          { resourceId: userId as string, ipAddress: req.ip, userAgent: req.headers['user-agent'] }
        );

        collaborationService.broadcastEvent({
          type: 'user_updated',
          userId: userId as string,
          data: { action: 'roles_removed', roleIds },
          timestamp: new Date(),
        });
      }

      res.json({ message: 'Roles removed successfully' });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getUserPermissions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const permissions = rbacService.getUserPermissions(userId as string);
      res.json({ permissions });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getUserRoles(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const roles = rbacService.getUserRoles(userId as string);
      res.json({ roles });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}

export const rbacController = new RBACController();
