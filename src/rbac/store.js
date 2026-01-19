import { create } from 'zustand';

const useRBACStore = create((set, get) => ({
  // State
  roles: [],
  permissions: [],
  users: [],
  auditLogs: [],
  wsConnected: false,
  
  // Actions
  setRoles: (roles) => set({ roles }),
  setPermissions: (permissions) => set({ permissions }),
  setUsers: (users) => set({ users }),
  setWsConnected: (wsConnected) => set({ wsConnected }),
  
  // Role operations
  addRole: (role) => set((state) => ({ 
    roles: [...state.roles, role] 
  })),
  
  updateRole: (id, updatedRole) => set((state) => ({
    roles: state.roles.map(role => 
      role.id === id ? { ...role, ...updatedRole } : role
    )
  })),
  
  deleteRole: (id) => set((state) => ({
    roles: state.roles.filter(role => role.id !== id)
  })),
  
  // Permission operations
  addPermission: (permission) => set((state) => ({
    permissions: [...state.permissions, permission]
  })),
  
  updateRolePermissions: (roleId, permissions) => set((state) => ({
    roles: state.roles.map(role =>
      role.id === roleId ? { ...role, permissions } : role
    )
  })),
  
  // User operations
  updateUserRoles: (userId, roles) => set((state) => ({
    users: state.users.map(user =>
      user.id === userId ? { ...user, roles } : user
    )
  })),
  
  // Audit log operations (client-side logs, keep last 100)
  addAuditLog: (log) => set((state) => {
    const newLogs = [
      {
        ...log,
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        source: 'client'
      },
      ...state.auditLogs
    ].slice(0, 100); // Keep only last 100 logs
    return { auditLogs: newLogs };
  }),
  
  clearClientLogs: () => set((state) => ({
    auditLogs: state.auditLogs.filter(log => log.source !== 'client')
  })),
  
  // WebSocket event handlers
  handleRoleCreated: (role) => {
    get().addRole(role);
  },
  
  handleRoleUpdated: (role) => {
    get().updateRole(role.id, role);
  },
  
  handleRoleDeleted: (roleId) => {
    get().deleteRole(roleId);
  },
  
  handlePermissionsUpdated: (data) => {
    const { roleId, permissions } = data;
    get().updateRolePermissions(roleId, permissions);
  },
  
  handleUserRolesUpdated: (data) => {
    const { userId, roles } = data;
    get().updateUserRoles(userId, roles);
  },
  
  handleAuditLog: (log) => {
    get().addAuditLog({ ...log, source: 'server' });
  },
}));

export default useRBACStore;
