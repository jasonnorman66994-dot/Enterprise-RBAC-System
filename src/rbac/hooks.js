import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleAPI, permissionAPI, userAPI, auditAPI } from './api';
import useRBACStore from './store';

// ============= Role Hooks =============

export function useRoles() {
  const setRoles = useRBACStore(state => state.setRoles);
  
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const roles = await roleAPI.getAll();
      setRoles(roles);
      return roles;
    },
  });
}

export function useRole(id) {
  return useQuery({
    queryKey: ['role', id],
    queryFn: () => roleAPI.getById(id),
    enabled: !!id,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  const addRole = useRBACStore(state => state.addRole);
  const addAuditLog = useRBACStore(state => state.addAuditLog);

  return useMutation({
    mutationFn: roleAPI.create,
    onSuccess: (newRole) => {
      addRole(newRole);
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      addAuditLog({
        action: 'create',
        resource: 'role',
        resourceId: newRole.id,
        details: { name: newRole.name },
      });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  const updateRole = useRBACStore(state => state.updateRole);
  const addAuditLog = useRBACStore(state => state.addAuditLog);

  return useMutation({
    mutationFn: ({ id, data }) => roleAPI.update(id, data),
    onSuccess: (updatedRole, variables) => {
      updateRole(variables.id, updatedRole);
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role', variables.id] });
      addAuditLog({
        action: 'update',
        resource: 'role',
        resourceId: variables.id,
        details: variables.data,
      });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  const deleteRole = useRBACStore(state => state.deleteRole);
  const addAuditLog = useRBACStore(state => state.addAuditLog);

  return useMutation({
    mutationFn: roleAPI.delete,
    onSuccess: (_, roleId) => {
      deleteRole(roleId);
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      addAuditLog({
        action: 'delete',
        resource: 'role',
        resourceId: roleId,
      });
    },
  });
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();
  const updateRolePermissions = useRBACStore(state => state.updateRolePermissions);
  const addAuditLog = useRBACStore(state => state.addAuditLog);

  return useMutation({
    mutationFn: ({ roleId, permissions }) => roleAPI.updatePermissions(roleId, permissions),
    onSuccess: (_, variables) => {
      updateRolePermissions(variables.roleId, variables.permissions);
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role', variables.roleId] });
      addAuditLog({
        action: 'update',
        resource: 'role_permissions',
        resourceId: variables.roleId,
        details: { permissions: variables.permissions },
      });
    },
  });
}

// ============= Permission Hooks =============

export function usePermissions() {
  const setPermissions = useRBACStore(state => state.setPermissions);
  
  return useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const permissions = await permissionAPI.getAll();
      setPermissions(permissions);
      return permissions;
    },
  });
}

export function useCreatePermission() {
  const queryClient = useQueryClient();
  const addPermission = useRBACStore(state => state.addPermission);
  const addAuditLog = useRBACStore(state => state.addAuditLog);

  return useMutation({
    mutationFn: permissionAPI.create,
    onSuccess: (newPermission) => {
      addPermission(newPermission);
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      addAuditLog({
        action: 'create',
        resource: 'permission',
        resourceId: newPermission.id,
        details: { name: newPermission.name },
      });
    },
  });
}

// ============= User Hooks =============

export function useUsers() {
  const setUsers = useRBACStore(state => state.setUsers);
  
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const users = await userAPI.getAll();
      setUsers(users);
      return users;
    },
  });
}

export function useUpdateUserRoles() {
  const queryClient = useQueryClient();
  const updateUserRoles = useRBACStore(state => state.updateUserRoles);
  const addAuditLog = useRBACStore(state => state.addAuditLog);

  return useMutation({
    mutationFn: ({ userId, roles }) => userAPI.updateRoles(userId, roles),
    onSuccess: (_, variables) => {
      updateUserRoles(variables.userId, variables.roles);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      addAuditLog({
        action: 'update',
        resource: 'user_roles',
        resourceId: variables.userId,
        details: { roles: variables.roles },
      });
    },
  });
}

// ============= Audit Log Hooks =============

export function useAuditLogs(params = {}) {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => auditAPI.getAll(params),
  });
}

export function useCreateAuditLog() {
  const queryClient = useQueryClient();
  const addAuditLog = useRBACStore(state => state.addAuditLog);

  return useMutation({
    mutationFn: auditAPI.create,
    onSuccess: (log) => {
      addAuditLog({ ...log, source: 'server' });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });
}
