import express, { Request, Response } from 'express';
import http from 'http';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { authController } from './controllers/AuthController';
import { rbacController } from './controllers/RBACController';
import { auditController } from './controllers/AuditController';
import { collaborationController } from './controllers/CollaborationController';
import { authenticate, requirePermission, auditLog } from './middleware/auth';
import { collaborationService } from './services/CollaborationService';
import { rbacService } from './services/RBACService';
import { authService } from './services/AuthService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting middleware
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs for auth routes
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Authentication routes (with stricter rate limiting)
app.post('/api/auth/register', authLimiter, (req, res) => authController.register(req, res));
app.post('/api/auth/login', authLimiter, (req, res) => authController.login(req, res));
app.post('/api/auth/change-password', apiLimiter, authenticate, auditLog('change_password', 'user'), (req, res) => 
  authController.changePassword(req, res)
);
app.get('/api/auth/me', apiLimiter, authenticate, (req, res) => authController.me(req, res));

// Role routes
app.post('/api/roles', apiLimiter, authenticate, auditLog('create_role', 'role'), (req, res) => 
  rbacController.createRole(req, res)
);
app.get('/api/roles', apiLimiter, authenticate, (req, res) => rbacController.getAllRoles(req, res));
app.get('/api/roles/:roleId', apiLimiter, authenticate, (req, res) => rbacController.getRole(req, res));
app.put('/api/roles/:roleId', apiLimiter, authenticate, auditLog('update_role', 'role'), (req, res) => 
  rbacController.updateRole(req, res)
);
app.delete('/api/roles/:roleId', apiLimiter, authenticate, auditLog('delete_role', 'role'), (req, res) => 
  rbacController.deleteRole(req, res)
);

// Permission routes
app.post('/api/permissions', apiLimiter, authenticate, auditLog('create_permission', 'permission'), (req, res) => 
  rbacController.createPermission(req, res)
);
app.get('/api/permissions', apiLimiter, authenticate, (req, res) => rbacController.getAllPermissions(req, res));
app.delete('/api/permissions/:permissionId', apiLimiter, authenticate, auditLog('delete_permission', 'permission'), (req, res) => 
  rbacController.deletePermission(req, res)
);

// User role assignment routes
app.post('/api/users/:userId/roles', apiLimiter, authenticate, auditLog('assign_roles', 'user'), (req, res) => 
  rbacController.assignRoles(req, res)
);
app.delete('/api/users/:userId/roles', apiLimiter, authenticate, auditLog('remove_roles', 'user'), (req, res) => 
  rbacController.removeRoles(req, res)
);
app.get('/api/users/:userId/permissions', apiLimiter, authenticate, (req, res) => 
  rbacController.getUserPermissions(req, res)
);
app.get('/api/users/:userId/roles', apiLimiter, authenticate, (req, res) => 
  rbacController.getUserRoles(req, res)
);

// Audit routes
app.get('/api/audit/logs', apiLimiter, authenticate, (req, res) => auditController.getLogs(req, res));
app.get('/api/audit/users/:userId', apiLimiter, authenticate, (req, res) => auditController.getUserActivity(req, res));
app.get('/api/audit/resources/:resource', apiLimiter, authenticate, (req, res) => auditController.getResourceActivity(req, res));
app.get('/api/audit/recent', apiLimiter, authenticate, (req, res) => auditController.getRecentActivity(req, res));
app.get('/api/audit/stats', apiLimiter, authenticate, (req, res) => auditController.getStats(req, res));
app.get('/api/audit/search', apiLimiter, authenticate, (req, res) => auditController.searchLogs(req, res));

// Collaboration routes
app.get('/api/collaboration/sessions', apiLimiter, authenticate, (req, res) => 
  collaborationController.getActiveSessions(req, res)
);
app.get('/api/collaboration/users', apiLimiter, authenticate, (req, res) => 
  collaborationController.getActiveUsers(req, res)
);
app.get('/api/collaboration/users/:userId/sessions', apiLimiter, authenticate, (req, res) => 
  collaborationController.getUserSessions(req, res)
);
app.post('/api/collaboration/users/:userId/disconnect', apiLimiter, authenticate, (req, res) => 
  collaborationController.disconnectUser(req, res)
);

// Initialize demo data
async function initializeDemoData() {
  console.log('Initializing demo data...');

  try {
    // Create default permissions
    const permissions = [
      { name: 'user.read', resource: 'user', action: 'read', description: 'Read user information' },
      { name: 'user.write', resource: 'user', action: 'write', description: 'Create/update user information' },
      { name: 'user.delete', resource: 'user', action: 'delete', description: 'Delete users' },
      { name: 'role.read', resource: 'role', action: 'read', description: 'Read role information' },
      { name: 'role.write', resource: 'role', action: 'write', description: 'Create/update roles' },
      { name: 'role.delete', resource: 'role', action: 'delete', description: 'Delete roles' },
      { name: 'permission.read', resource: 'permission', action: 'read', description: 'Read permissions' },
      { name: 'permission.write', resource: 'permission', action: 'write', description: 'Create/update permissions' },
      { name: 'audit.read', resource: 'audit', action: 'read', description: 'Read audit logs' },
      { name: 'admin.*', resource: '*', action: '*', description: 'Full administrative access' },
    ];

    const createdPermissions: { [key: string]: string } = {};
    for (const perm of permissions) {
      const created = rbacService.createPermission(perm.name, perm.resource, perm.action, perm.description);
      createdPermissions[perm.name] = created.id;
    }

    // Create default roles
    const adminRole = rbacService.createRole(
      'admin',
      'Administrator with full access',
      [createdPermissions['admin.*']]
    );

    const managerRole = rbacService.createRole(
      'manager',
      'Manager with user and role management access',
      [
        createdPermissions['user.read'],
        createdPermissions['user.write'],
        createdPermissions['role.read'],
        createdPermissions['role.write'],
        createdPermissions['audit.read'],
      ]
    );

    const userRole = rbacService.createRole(
      'user',
      'Regular user with read-only access',
      [
        createdPermissions['user.read'],
        createdPermissions['role.read'],
        createdPermissions['permission.read'],
      ]
    );

    // Create demo users
    const adminUser = await authService.register('admin', 'admin@example.com', 'admin123', [adminRole.id]);
    const managerUser = await authService.register('manager', 'manager@example.com', 'manager123', [managerRole.id]);
    const regularUser = await authService.register('user', 'user@example.com', 'user123', [userRole.id]);

    console.log('Demo data initialized successfully!');
    console.log('\nDefault Users:');
    console.log('- admin/admin123 (Admin role)');
    console.log('- manager/manager123 (Manager role)');
    console.log('- user/user123 (User role)');
  } catch (error) {
    console.log('Demo data already exists or error occurred:', (error as Error).message);
  }
}

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server for real-time collaboration
collaborationService.initialize(server);

// Start server
server.listen(PORT, () => {
  console.log(`\n🚀 Enterprise RBAC System running on port ${PORT}`);
  console.log(`📡 WebSocket server ready for real-time collaboration`);
  console.log(`📊 Audit logging enabled`);
  console.log(`\nEndpoints:`);
  console.log(`- Health: http://localhost:${PORT}/health`);
  console.log(`- API: http://localhost:${PORT}/api`);
  console.log(`- WebSocket: ws://localhost:${PORT}`);
  
  initializeDemoData();
});

export default app;
