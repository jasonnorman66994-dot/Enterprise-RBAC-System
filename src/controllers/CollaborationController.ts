import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { collaborationService } from '../services/CollaborationService';

export class CollaborationController {
  async getActiveSessions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const sessions = collaborationService.getActiveSessions();
      res.json({ sessions, count: sessions.length });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getActiveUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const users = collaborationService.getActiveUsers();
      res.json({ users, count: users.length });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getUserSessions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const count = collaborationService.getUserSessionCount(userId as string);
      res.json({ userId, sessionCount: count });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async disconnectUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      collaborationService.disconnectUser(userId as string);
      res.json({ message: 'User disconnected successfully' });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}

export const collaborationController = new CollaborationController();
