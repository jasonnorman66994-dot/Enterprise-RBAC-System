const express = require('express');
const router = express.Router();

// Mock data stores (replace with database in production)
let roles = [
  { 
    id: '1', 
    name: 'Administrator', 
    description: 'Full system access',
    permissions: ['users:read', 'users:create', 'users:update', 'users:delete', 'roles:manage', 'rbac:manage'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  { 
    id: '2', 
    name: 'Editor', 
    description: 'Can edit content',
    permissions: ['users:read', 'users:update'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
];

let permissions = [
  'users:read',
  'users:create',
  'users:update',
  'users:delete',
  'roles:read',
  'roles:create',
  'roles:update',
  'roles:delete',
  'roles:manage',
  'permissions:read',
  'permissions:create',
  'rbac:manage',
  'audit:read',
  'audit:create',
];

let users = [
  { 
    id: '1', 
    name: 'Admin User', 
    email: 'admin@example.com', 
    roles: ['1'] 
  },
  { 
    id: '2', 
    name: 'Editor User', 
    email: 'editor@example.com', 
    roles: ['2'] 
  },
];

let auditLogs = [];

// Roles endpoints
router.get('/roles', (req, res) => {
  res.json(roles);
});

router.get('/roles/:id', (req, res) => {
  const role = roles.find(r => r.id === req.params.id);
  if (!role) {
    return res.status(404).json({ message: 'Role not found' });
  }
  res.json(role);
});

router.post('/roles', (req, res) => {
  const { name, description, permissions: rolePermissions } = req.body;
  
  const newRole = {
    id: String(Date.now()),
    name,
    description,
    permissions: rolePermissions || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  roles.push(newRole);
  
  // Broadcast via WebSocket
  if (req.app.wsServer) {
    req.app.wsServer.broadcastRoleCreated(newRole, req.userId);
  }
  
  res.status(201).json(newRole);
});

router.put('/roles/:id', (req, res) => {
  const { name, description } = req.body;
  const roleIndex = roles.findIndex(r => r.id === req.params.id);
  
  if (roleIndex === -1) {
    return res.status(404).json({ message: 'Role not found' });
  }
  
  roles[roleIndex] = {
    ...roles[roleIndex],
    name: name !== undefined ? name : roles[roleIndex].name,
    description: description !== undefined ? description : roles[roleIndex].description,
    updatedAt: new Date().toISOString()
  };
  
  // Broadcast via WebSocket
  if (req.app.wsServer) {
    req.app.wsServer.broadcastRoleUpdated(roles[roleIndex], req.userId);
  }
  
  res.json(roles[roleIndex]);
});

router.delete('/roles/:id', (req, res) => {
  const roleIndex = roles.findIndex(r => r.id === req.params.id);
  
  if (roleIndex === -1) {
    return res.status(404).json({ message: 'Role not found' });
  }
  
  roles.splice(roleIndex, 1);
  
  // Broadcast via WebSocket
  if (req.app.wsServer) {
    req.app.wsServer.broadcastRoleDeleted(req.params.id, req.userId);
  }
  
  res.json({ message: 'Role deleted' });
});

router.put('/roles/:id/permissions', (req, res) => {
  const { permissions: newPermissions } = req.body;
  const roleIndex = roles.findIndex(r => r.id === req.params.id);
  
  if (roleIndex === -1) {
    return res.status(404).json({ message: 'Role not found' });
  }
  
  roles[roleIndex].permissions = newPermissions;
  roles[roleIndex].updatedAt = new Date().toISOString();
  
  // Broadcast via WebSocket
  if (req.app.wsServer) {
    req.app.wsServer.broadcastPermissionsUpdated(req.params.id, newPermissions, req.userId);
  }
  
  res.json(roles[roleIndex]);
});

// Permissions endpoints
router.get('/permissions', (req, res) => {
  res.json(permissions);
});

router.post('/permissions', (req, res) => {
  const { name, resource, action } = req.body;
  
  const permissionName = name || `${resource}:${action}`;
  
  if (!permissions.includes(permissionName)) {
    permissions.push(permissionName);
  }
  
  res.status(201).json({ id: permissions.length, name: permissionName, resource, action });
});

// Users endpoints
router.get('/users', (req, res) => {
  res.json(users);
});

router.put('/users/:id/roles', (req, res) => {
  const { roles: newRoles } = req.body;
  const userIndex = users.findIndex(u => u.id === req.params.id);
  
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  users[userIndex].roles = newRoles;
  
  // Broadcast via WebSocket
  if (req.app.wsServer) {
    req.app.wsServer.broadcastUserRolesUpdated(req.params.id, newRoles, req.userId);
  }
  
  res.json(users[userIndex]);
});

// Audit logs endpoints
router.get('/audit-logs', (req, res) => {
  const { action, resource, startDate, endDate } = req.query;
  
  let filteredLogs = [...auditLogs];
  
  if (action) {
    filteredLogs = filteredLogs.filter(log => log.action === action);
  }
  
  if (resource) {
    filteredLogs = filteredLogs.filter(log => log.resource === resource);
  }
  
  if (startDate) {
    filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= new Date(startDate));
  }
  
  if (endDate) {
    filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= new Date(endDate));
  }
  
  res.json(filteredLogs);
});

router.post('/audit-logs', (req, res) => {
  const log = {
    id: String(Date.now()),
    ...req.body,
    timestamp: new Date().toISOString(),
    source: 'server'
  };
  
  auditLogs.push(log);
  
  // Keep only last 1000 logs
  if (auditLogs.length > 1000) {
    auditLogs = auditLogs.slice(-1000);
  }
  
  // Broadcast via WebSocket
  if (req.app.wsServer) {
    req.app.wsServer.broadcastAuditLog(log, req.userId);
  }
  
  res.status(201).json(log);
});

module.exports = router;
