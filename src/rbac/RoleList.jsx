import React, { useState } from 'react';
import { useRoles, useDeleteRole } from './hooks';

export function RoleList({ selectedRoleId, onSelectRole, onCreateRole }) {
  const { data: roles, isLoading, error } = useRoles();
  const deleteRoleMutation = useDeleteRole();
  const [deletingRoleId, setDeletingRoleId] = useState(null);

  const handleDelete = async (roleId, roleName) => {
    if (window.confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
      setDeletingRoleId(roleId);
      try {
        await deleteRoleMutation.mutateAsync(roleId);
        if (selectedRoleId === roleId) {
          onSelectRole(null);
        }
      } catch (error) {
        alert('Failed to delete role: ' + (error.response?.data?.message || error.message));
      } finally {
        setDeletingRoleId(null);
      }
    }
  };

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading roles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          Error loading roles: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Roles</h3>
        <button
          onClick={onCreateRole}
          style={styles.createButton}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
        >
          + Create Role
        </button>
      </div>
      
      <div style={styles.roleList}>
        {roles && roles.length === 0 && (
          <div style={styles.emptyState}>
            No roles found. Create your first role to get started.
          </div>
        )}
        
        {roles && roles.map((role) => (
          <div
            key={role.id}
            style={{
              ...styles.roleItem,
              ...(selectedRoleId === role.id ? styles.roleItemSelected : {}),
            }}
          >
            <div
              style={styles.roleContent}
              onClick={() => onSelectRole(role.id)}
            >
              <div style={styles.roleName}>{role.name}</div>
              {role.description && (
                <div style={styles.roleDescription}>{role.description}</div>
              )}
              <div style={styles.roleInfo}>
                {role.permissions?.length || 0} permissions
              </div>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(role.id, role.name);
              }}
              disabled={deletingRoleId === role.id}
              style={{
                ...styles.deleteButton,
                opacity: deletingRoleId === role.id ? 0.5 : 1,
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {deletingRoleId === role.id ? '...' : '×'}
            </button>
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
  createButton: {
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
  roleList: {
    flex: 1,
    overflowY: 'auto',
  },
  roleItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px',
    marginBottom: '8px',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  roleItemSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.1)',
  },
  roleContent: {
    flex: 1,
    minWidth: 0,
  },
  roleName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '4px',
  },
  roleDescription: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  roleInfo: {
    fontSize: '12px',
    color: '#9ca3af',
  },
  deleteButton: {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    color: '#ef4444',
    fontSize: '20px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    flexShrink: 0,
    marginLeft: '8px',
  },
  loading: {
    padding: '20px',
    textAlign: 'center',
    color: '#6b7280',
  },
  error: {
    padding: '20px',
    textAlign: 'center',
    color: '#ef4444',
    backgroundColor: '#fef2f2',
    borderRadius: '6px',
  },
  emptyState: {
    padding: '40px 20px',
    textAlign: 'center',
    color: '#9ca3af',
  },
};

export default RoleList;
