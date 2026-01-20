import { v4 as uuidv4 } from 'uuid';
import { AuditLog } from '../types';
import { dataStore } from '../models/DataStore';

export class AuditService {
  log(
    userId: string,
    username: string,
    action: string,
    resource: string,
    details: any,
    options?: {
      resourceId?: string;
      ipAddress?: string;
      userAgent?: string;
      success?: boolean;
      errorMessage?: string;
    }
  ): AuditLog {
    const auditLog: AuditLog = {
      id: uuidv4(),
      userId,
      username,
      action,
      resource,
      resourceId: options?.resourceId,
      details,
      ipAddress: options?.ipAddress,
      userAgent: options?.userAgent,
      timestamp: new Date(),
      success: options?.success ?? true,
      errorMessage: options?.errorMessage,
    };

    dataStore.addAuditLog(auditLog);
    return auditLog;
  }

  logSuccess(
    userId: string,
    username: string,
    action: string,
    resource: string,
    details: any,
    options?: {
      resourceId?: string;
      ipAddress?: string;
      userAgent?: string;
    }
  ): AuditLog {
    return this.log(userId, username, action, resource, details, { ...options, success: true });
  }

  logFailure(
    userId: string,
    username: string,
    action: string,
    resource: string,
    details: any,
    errorMessage: string,
    options?: {
      resourceId?: string;
      ipAddress?: string;
      userAgent?: string;
    }
  ): AuditLog {
    return this.log(userId, username, action, resource, details, {
      ...options,
      success: false,
      errorMessage,
    });
  }

  getLogs(filters?: {
    userId?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): AuditLog[] {
    let logs = dataStore.getAuditLogs({
      userId: filters?.userId,
      resource: filters?.resource,
      startDate: filters?.startDate,
      endDate: filters?.endDate,
    });

    if (filters?.limit) {
      logs = logs.slice(0, filters.limit);
    }

    return logs;
  }

  getUserActivity(userId: string, limit: number = 50): AuditLog[] {
    return this.getLogs({ userId, limit });
  }

  getResourceActivity(resource: string, limit: number = 50): AuditLog[] {
    return this.getLogs({ resource, limit });
  }

  getRecentActivity(limit: number = 100): AuditLog[] {
    return this.getLogs({ limit });
  }

  getActivityStats(filters?: {
    startDate?: Date;
    endDate?: Date;
    userId?: string;
  }): {
    total: number;
    successful: number;
    failed: number;
    byResource: Record<string, number>;
    byAction: Record<string, number>;
  } {
    const logs = this.getLogs(filters);

    const stats = {
      total: logs.length,
      successful: logs.filter(l => l.success).length,
      failed: logs.filter(l => !l.success).length,
      byResource: {} as Record<string, number>,
      byAction: {} as Record<string, number>,
    };

    logs.forEach(log => {
      stats.byResource[log.resource] = (stats.byResource[log.resource] || 0) + 1;
      stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;
    });

    return stats;
  }

  searchLogs(query: string, limit: number = 50): AuditLog[] {
    const allLogs = dataStore.getAuditLogs();
    const lowerQuery = query.toLowerCase();

    return allLogs
      .filter(log => {
        return (
          log.username.toLowerCase().includes(lowerQuery) ||
          log.action.toLowerCase().includes(lowerQuery) ||
          log.resource.toLowerCase().includes(lowerQuery) ||
          JSON.stringify(log.details).toLowerCase().includes(lowerQuery)
        );
      })
      .slice(0, limit);
  }
}

export const auditService = new AuditService();
