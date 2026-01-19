import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { auditService } from '../services/AuditService';

export class AuditController {
  async getLogs(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, resource, startDate, endDate, limit } = req.query;

      const filters = {
        userId: userId as string | undefined,
        resource: resource as string | undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      };

      const logs = auditService.getLogs(filters);
      res.json({ logs, count: logs.length });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getUserActivity(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { limit } = req.query;

      const logs = auditService.getUserActivity(
        userId as string,
        limit ? parseInt(limit as string) : undefined
      );

      res.json({ logs, count: logs.length });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getResourceActivity(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { resource } = req.params;
      const { limit } = req.query;

      const logs = auditService.getResourceActivity(
        resource as string,
        limit ? parseInt(limit as string) : undefined
      );

      res.json({ logs, count: logs.length });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getRecentActivity(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { limit } = req.query;

      const logs = auditService.getRecentActivity(
        limit ? parseInt(limit as string) : undefined
      );

      res.json({ logs, count: logs.length });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { startDate, endDate, userId } = req.query;

      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        userId: userId as string | undefined,
      };

      const stats = auditService.getActivityStats(filters);
      res.json({ stats });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async searchLogs(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { query, limit } = req.query;

      if (!query) {
        res.status(400).json({ error: 'Query parameter is required' });
        return;
      }

      const logs = auditService.searchLogs(
        query as string,
        limit ? parseInt(limit as string) : undefined
      );

      res.json({ logs, count: logs.length });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}

export const auditController = new AuditController();
