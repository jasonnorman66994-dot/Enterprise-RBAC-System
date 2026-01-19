import React, { useState, useMemo } from 'react';
import { useAuditLogs } from './hooks';
import useRBACStore from './store';
import { exportAuditLogsToCSV } from '../utils/csvExport';

const ACTION_COLORS = {
  create: '#10b981',
  update: '#3b82f6',
  delete: '#ef4444',
  read: '#6b7280',
};

const ACTION_TYPES = ['create', 'update', 'delete', 'read'];
const RESOURCE_TYPES = ['role', 'permission', 'user_roles', 'role_permissions'];

export function AuditLogViewer() {
  const clientLogs = useRBACStore((state) => state.auditLogs);
  const clearClientLogs = useRBACStore((state) => state.clearClientLogs);
  
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Build query params for server logs
  const queryParams = useMemo(() => {
    const params = {};
    if (actionFilter) params.action = actionFilter;
    if (resourceFilter) params.resource = resourceFilter;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return params;
  }, [actionFilter, resourceFilter, startDate, endDate]);

  const { data: serverLogs = [], isLoading } = useAuditLogs(queryParams);

  // Combine and filter logs
  const allLogs = useMemo(() => {
    const combined = [...clientLogs, ...serverLogs];
    
    // Apply filters
    return combined.filter((log) => {
      if (actionFilter && log.action !== actionFilter) return false;
      if (resourceFilter && log.resource !== resourceFilter) return false;
      if (startDate && new Date(log.timestamp) < new Date(startDate)) return false;
      if (endDate && new Date(log.timestamp) > new Date(endDate)) return false;
      return true;
    }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [clientLogs, serverLogs, actionFilter, resourceFilter, startDate, endDate]);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: allLogs.length,
      client: allLogs.filter(log => log.source === 'client').length,
      server: allLogs.filter(log => log.source === 'server').length,
    };
  }, [allLogs]);

  const handleExportCSV = () => {
    exportAuditLogsToCSV(allLogs);
  };

  const handleClearClientLogs = () => {
    if (window.confirm('Are you sure you want to clear all client-side logs?')) {
      clearClientLogs();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Audit Logs</h3>
        <div style={styles.actions}>
          <button
            onClick={handleClearClientLogs}
            style={styles.clearButton}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            Clear Client Logs
          </button>
          <button
            onClick={handleExportCSV}
            disabled={allLogs.length === 0}
            style={{
              ...styles.exportButton,
              opacity: allLogs.length === 0 ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (allLogs.length > 0) {
                e.currentTarget.style.backgroundColor = '#2563eb';
              }
            }}
            onMouseLeave={(e) => {
              if (allLogs.length > 0) {
                e.currentTarget.style.backgroundColor = '#3b82f6';
              }
            }}
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div style={styles.stats}>
        <div style={styles.statItem}>
          <div style={styles.statValue}>{stats.total}</div>
          <div style={styles.statLabel}>Total Logs</div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statValue}>{stats.server}</div>
          <div style={styles.statLabel}>Server</div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statValue}>{stats.client}</div>
          <div style={styles.statLabel}>Client</div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Action</label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="">All Actions</option>
            {ACTION_TYPES.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Resource</label>
          <select
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="">All Resources</option>
            {RESOURCE_TYPES.map((resource) => (
              <option key={resource} value={resource}>
                {resource}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Start Date</label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={styles.filterInput}
          />
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>End Date</label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={styles.filterInput}
          />
        </div>
      </div>

      {/* Logs List */}
      <div style={styles.logsList}>
        {isLoading && (
          <div style={styles.loading}>Loading server logs...</div>
        )}

        {!isLoading && allLogs.length === 0 && (
          <div style={styles.emptyState}>
            No audit logs found. Try adjusting your filters.
          </div>
        )}

        {allLogs.map((log) => (
          <div key={log.id} style={styles.logItem}>
            <div style={styles.logHeader}>
              <div style={styles.logHeaderLeft}>
                <span
                  style={{
                    ...styles.actionBadge,
                    backgroundColor: ACTION_COLORS[log.action] || '#6b7280',
                  }}
                >
                  {log.action}
                </span>
                <span style={styles.resourceBadge}>{log.resource}</span>
                {log.source && (
                  <span
                    style={{
                      ...styles.sourceBadge,
                      backgroundColor: log.source === 'client' ? '#f59e0b' : '#8b5cf6',
                    }}
                  >
                    {log.source}
                  </span>
                )}
              </div>
              <div style={styles.timestamp}>
                {new Date(log.timestamp).toLocaleString()}
              </div>
            </div>

            <div style={styles.logDetails}>
              {log.user && (
                <div style={styles.logDetail}>
                  <strong>User:</strong> {log.user}
                </div>
              )}
              {log.resourceId && (
                <div style={styles.logDetail}>
                  <strong>Resource ID:</strong> {log.resourceId}
                </div>
              )}
              {log.details && (
                <div style={styles.logDetail}>
                  <strong>Details:</strong>{' '}
                  <pre style={styles.detailsPre}>
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #e5e7eb',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  clearButton: {
    padding: '8px 16px',
    backgroundColor: 'white',
    color: '#ef4444',
    border: '1px solid #ef4444',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  exportButton: {
    padding: '8px 16px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  stats: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
  },
  statItem: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '6px',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px',
  },
  filters: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    marginBottom: '16px',
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '6px',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  filterLabel: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: '4px',
  },
  filterSelect: {
    padding: '8px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    backgroundColor: 'white',
  },
  filterInput: {
    padding: '8px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
  },
  logsList: {
    flex: 1,
    overflowY: 'auto',
  },
  logItem: {
    padding: '12px',
    marginBottom: '8px',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
  },
  logHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  logHeaderLeft: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  actionBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
  },
  resourceBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
    backgroundColor: '#e5e7eb',
    color: '#374151',
  },
  sourceBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
    color: 'white',
    textTransform: 'uppercase',
  },
  timestamp: {
    fontSize: '12px',
    color: '#6b7280',
  },
  logDetails: {
    fontSize: '13px',
    color: '#374151',
  },
  logDetail: {
    marginTop: '4px',
  },
  detailsPre: {
    display: 'inline-block',
    margin: '4px 0 0 0',
    padding: '8px',
    backgroundColor: '#f9fafb',
    borderRadius: '4px',
    fontSize: '12px',
    fontFamily: 'monospace',
    overflow: 'auto',
  },
  loading: {
    padding: '40px',
    textAlign: 'center',
    color: '#6b7280',
  },
  emptyState: {
    padding: '40px 20px',
    textAlign: 'center',
    color: '#9ca3af',
  },
};

export default AuditLogViewer;
