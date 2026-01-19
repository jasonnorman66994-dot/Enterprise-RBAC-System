import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/AuthService';
import { auditService } from '../services/AuditService';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    username: string;
    roles: string[];
    permissions: string[];
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = authService.verifyToken(token);

    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      roles: decoded.roles,
      permissions: decoded.permissions,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requirePermission = (permissionName: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const hasPermission = req.user.permissions.some(p => {
      // Check for exact match or wildcard
      return p === permissionName || p === '*';
    });

    if (!hasPermission) {
      auditService.logFailure(
        req.user.userId,
        req.user.username,
        'access_denied',
        req.path,
        { requiredPermission: permissionName },
        'Insufficient permissions',
        {
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        }
      );

      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

export const requireRole = (roleName: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const hasRole = req.user.roles.includes(roleName);

    if (!hasRole) {
      auditService.logFailure(
        req.user.userId,
        req.user.username,
        'access_denied',
        req.path,
        { requiredRole: roleName },
        'Insufficient role',
        {
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        }
      );

      res.status(403).json({ error: 'Insufficient role' });
      return;
    }

    next();
  };
};

export const auditLog = (action: string, resource: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next();
      return;
    }

    const originalSend = res.json;
    res.json = function (data: any): Response {
      const success = res.statusCode >= 200 && res.statusCode < 400;

      auditService.log(
        req.user!.userId,
        req.user!.username,
        action,
        resource,
        {
          method: req.method,
          path: req.path,
          query: req.query,
          body: req.body,
        },
        {
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          success,
          errorMessage: !success && data?.error ? data.error : undefined,
        }
      );

      return originalSend.call(this, data);
    };

    next();
  };
};
