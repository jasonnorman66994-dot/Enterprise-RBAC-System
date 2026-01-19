export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  parentRoleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
}

export interface Session {
  id: string;
  userId: string;
  socketId: string;
  connectedAt: Date;
  lastActivity: Date;
  metadata?: any;
}

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'execute';
export type ResourceType = 'user' | 'role' | 'permission' | 'audit' | 'session' | '*';

export interface AuthToken {
  userId: string;
  username: string;
  roles: string[];
  permissions: string[];
  iat: number;
  exp: number;
}

export interface CollaborationEvent {
  type: 'user_joined' | 'user_left' | 'permission_updated' | 'role_updated' | 'user_updated';
  userId: string;
  data: any;
  timestamp: Date;
}
