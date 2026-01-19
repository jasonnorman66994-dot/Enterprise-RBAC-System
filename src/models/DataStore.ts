import { User, Role, Permission, AuditLog, Session } from '../types';

class DataStore {
  private users: Map<string, User> = new Map();
  private roles: Map<string, Role> = new Map();
  private permissions: Map<string, Permission> = new Map();
  private auditLogs: AuditLog[] = [];
  private sessions: Map<string, Session> = new Map();
  private userRoles: Map<string, Set<string>> = new Map();
  private rolePermissions: Map<string, Set<string>> = new Map();

  // User operations
  addUser(user: User): void {
    this.users.set(user.id, user);
    this.userRoles.set(user.id, new Set(user.roles));
  }

  getUser(id: string): User | undefined {
    return this.users.get(id);
  }

  getUserByUsername(username: string): User | undefined {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    
    if (updates.roles) {
      this.userRoles.set(id, new Set(updates.roles));
    }
    
    return updatedUser;
  }

  deleteUser(id: string): boolean {
    this.userRoles.delete(id);
    return this.users.delete(id);
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  // Role operations
  addRole(role: Role): void {
    this.roles.set(role.id, role);
    this.rolePermissions.set(role.id, new Set(role.permissions));
  }

  getRole(id: string): Role | undefined {
    return this.roles.get(id);
  }

  getRoleByName(name: string): Role | undefined {
    return Array.from(this.roles.values()).find(r => r.name === name);
  }

  updateRole(id: string, updates: Partial<Role>): Role | undefined {
    const role = this.roles.get(id);
    if (!role) return undefined;
    
    const updatedRole = { ...role, ...updates, updatedAt: new Date() };
    this.roles.set(id, updatedRole);
    
    if (updates.permissions) {
      this.rolePermissions.set(id, new Set(updates.permissions));
    }
    
    return updatedRole;
  }

  deleteRole(id: string): boolean {
    this.rolePermissions.delete(id);
    return this.roles.delete(id);
  }

  getAllRoles(): Role[] {
    return Array.from(this.roles.values());
  }

  // Permission operations
  addPermission(permission: Permission): void {
    this.permissions.set(permission.id, permission);
  }

  getPermission(id: string): Permission | undefined {
    return this.permissions.get(id);
  }

  getPermissionByName(name: string): Permission | undefined {
    return Array.from(this.permissions.values()).find(p => p.name === name);
  }

  deletePermission(id: string): boolean {
    return this.permissions.delete(id);
  }

  getAllPermissions(): Permission[] {
    return Array.from(this.permissions.values());
  }

  // Audit log operations
  addAuditLog(log: AuditLog): void {
    this.auditLogs.push(log);
  }

  getAuditLogs(filters?: {
    userId?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
  }): AuditLog[] {
    let logs = this.auditLogs;

    if (filters) {
      if (filters.userId) {
        logs = logs.filter(l => l.userId === filters.userId);
      }
      if (filters.resource) {
        logs = logs.filter(l => l.resource === filters.resource);
      }
      if (filters.startDate) {
        logs = logs.filter(l => l.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        logs = logs.filter(l => l.timestamp <= filters.endDate!);
      }
    }

    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Session operations
  addSession(session: Session): void {
    this.sessions.set(session.id, session);
  }

  getSession(id: string): Session | undefined {
    return this.sessions.get(id);
  }

  getSessionBySocketId(socketId: string): Session | undefined {
    return Array.from(this.sessions.values()).find(s => s.socketId === socketId);
  }

  updateSession(id: string, updates: Partial<Session>): Session | undefined {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }

  deleteSession(id: string): boolean {
    return this.sessions.delete(id);
  }

  getAllSessions(): Session[] {
    return Array.from(this.sessions.values());
  }

  getUserSessions(userId: string): Session[] {
    return Array.from(this.sessions.values()).filter(s => s.userId === userId);
  }

  // Helper methods
  getUserRoles(userId: string): string[] {
    return Array.from(this.userRoles.get(userId) || []);
  }

  getRolePermissions(roleId: string): string[] {
    return Array.from(this.rolePermissions.get(roleId) || []);
  }

  getAllUserPermissions(userId: string): string[] {
    const userRoleIds = this.getUserRoles(userId);
    const allPermissions = new Set<string>();

    for (const roleId of userRoleIds) {
      const permissions = this.getRolePermissions(roleId);
      permissions.forEach(p => allPermissions.add(p));

      // Check for parent roles (hierarchical)
      const role = this.getRole(roleId);
      if (role?.parentRoleId) {
        const parentPermissions = this.getRolePermissions(role.parentRoleId);
        parentPermissions.forEach(p => allPermissions.add(p));
      }
    }

    return Array.from(allPermissions);
  }
}

export const dataStore = new DataStore();
