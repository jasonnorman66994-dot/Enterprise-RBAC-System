import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { authService } from '../services/AuthService';
import { auditService } from '../services/AuditService';
import { dataStore } from '../models/DataStore';

export class AuthController {
  async register(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { username, email, password, roles = [] } = req.body;

      if (!username || !email || !password) {
        res.status(400).json({ error: 'Username, email, and password are required' });
        return;
      }

      const user = await authService.register(username, email, password, roles);
      const token = authService.generateToken(user);

      auditService.logSuccess(
        user.id,
        user.username,
        'register',
        'user',
        { email, roles },
        {
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        }
      );

      res.status(201).json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          roles: user.roles,
        },
        token,
      });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async login(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
        return;
      }

      const { user, token } = await authService.login(username, password);

      auditService.logSuccess(
        user.id,
        user.username,
        'login',
        'user',
        {},
        {
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        }
      );

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          roles: user.roles,
        },
        token,
      });
    } catch (error) {
      res.status(401).json({ error: (error as Error).message });
    }
  }

  async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        res.status(400).json({ error: 'Old and new passwords are required' });
        return;
      }

      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      await authService.changePassword(req.user.userId, oldPassword, newPassword);

      auditService.logSuccess(
        req.user.userId,
        req.user.username,
        'change_password',
        'user',
        {},
        {
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        }
      );

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async me(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = dataStore.getUser(req.user.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const permissions = dataStore.getAllUserPermissions(user.id);

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles,
        permissions,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  }
}

export const authController = new AuthController();
