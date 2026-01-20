import React, { useState, useEffect, useCallback } from 'react';
import { useRole, usePermissions, useUpdateRolePermissions } from './hooks';
import { PermissionCheckbox } from './PermissionCheckbox';

export function RoleDetails({ roleId }) {
  const { data: role, isLoading: roleLoading } = useRole(roleId);
  const { data: allPermissions, isLoading: permissionsLoading } = usePermissions();
  const updatePermissionsMutation = useUpdateRolePermissions();
  
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [saveStatus, setSaveStatus] = useState(''); // '', 'saving', 'saved', 'error'
  const [debounceTimer, setDebounceTimer] = useState(null);

  // Update selected permissions when role data changes
  useEffect(() => {
    if (role?.permissions) {
      setSelectedPermissions(role.permissions);
    }
  }, [role]);

  // Debounced auto-save
  const debouncedSave = useCallback((permissions) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    setSaveStatus('pending');
    
    const timer = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        await updatePermissionsMutation.mutateAsync({
          roleId,
          permissions,
        });
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(''), 2000);
      } catch (error) {
        setSaveStatus('error');
        console.error('Failed to save permissions:', error);
      }
    }, 1000); // 1 second debounce

    setDebounceTimer(timer);
  }, [roleId, updatePermissionsMutation, debounceTimer]);

  const handlePermissionToggle = (permission, checked) => {
    const newPermissions = checked
      ? [...selectedPermissions, permission]
      : selectedPermissions.filter(p => p !== permission);
    
    setSelectedPermissions(newPermissions);
    debouncedSave(newPermissions);
  };

  // Group permissions by resource
  const groupedPermissions = React.useMemo(() => {
    if (!allPermissions) return {};
    
    return allPermissions.reduce((groups, permission) => {
      const [resource] = permission.split(':');
      if (!groups[resource]) {
        groups[resource] = [];
      }
      groups[resource].push(permission);
      return groups;
    }, {});
  }, [allPermissions]);

  if (!roleId) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          Select a role to view and edit permissions
        </div>
      </div>
    );
  }

  if (roleLoading || permissionsLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (!role) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>Role not found</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>{role.name}</h3>
          {role.description && (
            <p style={styles.description}>{role.description}</p>
          )}
        </div>
        
        <div style={styles.statusContainer}>
          {saveStatus === 'pending' && (
            <span style={styles.statusPending}>Waiting...</span>
          )}
          {saveStatus === 'saving' && (
            <span style={styles.statusSaving}>Saving...</span>
          )}
          {saveStatus === 'saved' && (
            <span style={styles.statusSaved}>✓ Saved</span>
          )}
          {saveStatus === 'error' && (
            <span style={styles.statusError}>✗ Error</span>
          )}
        </div>
      </div>

      {role.updatedAt && (
        <div style={styles.lastUpdated}>
          Last updated: {new Date(role.updatedAt).toLocaleString()}
        </div>
      )}

      <div style={styles.permissionsContainer}>
        <h4 style={styles.permissionsTitle}>Permissions</h4>
        
        {Object.keys(groupedPermissions).length === 0 && (
          <div style={styles.emptyState}>
            No permissions available. Create permissions first.
          </div>
        )}
        
        {Object.entries(groupedPermissions).map(([resource, permissions]) => (
          <div key={resource} style={styles.permissionGroup}>
            <div style={styles.resourceName}>{resource}</div>
            <div style={styles.permissionList}>
              {permissions.map((permission) => (
                <PermissionCheckbox
                  key={permission}
                  permission={permission}
                  checked={selectedPermissions.includes(permission)}
                  onChange={(checked) => handlePermissionToggle(permission, checked)}
                  disabled={saveStatus === 'saving'}
                />
              ))}
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
    alignItems: 'flex-start',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #e5e7eb',
  },
  title: {
    margin: '0 0 4px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
  },
  description: {
    margin: 0,
    fontSize: '14px',
    color: '#6b7280',
  },
  statusContainer: {
    minWidth: '80px',
    textAlign: 'right',
  },
  statusPending: {
    fontSize: '12px',
    color: '#9ca3af',
  },
  statusSaving: {
    fontSize: '12px',
    color: '#3b82f6',
    fontWeight: '500',
  },
  statusSaved: {
    fontSize: '12px',
    color: '#10b981',
    fontWeight: '500',
  },
  statusError: {
    fontSize: '12px',
    color: '#ef4444',
    fontWeight: '500',
  },
  lastUpdated: {
    fontSize: '12px',
    color: '#9ca3af',
    marginBottom: '16px',
  },
  permissionsContainer: {
    flex: 1,
    overflowY: 'auto',
  },
  permissionsTitle: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  permissionGroup: {
    marginBottom: '20px',
  },
  resourceName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '8px',
    padding: '6px 12px',
    backgroundColor: '#f9fafb',
    borderRadius: '4px',
    textTransform: 'capitalize',
  },
  permissionList: {
    display: 'flex',
    flexDirection: 'column',
  },
  loading: {
    padding: '40px',
    textAlign: 'center',
    color: '#6b7280',
  },
  error: {
    padding: '40px',
    textAlign: 'center',
    color: '#ef4444',
  },
  emptyState: {
    padding: '40px 20px',
    textAlign: 'center',
    color: '#9ca3af',
  },
};

export default RoleDetails;
