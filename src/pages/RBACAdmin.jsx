import React, { useState } from 'react';
import { usePermissionsContext } from '../permissions/PermissionsContext';
import { RoleList } from '../rbac/RoleList';
import { RoleDetails } from '../rbac/RoleDetails';
import { CreateRoleForm } from '../rbac/CreateRoleForm';
import { CreatePermissionForm } from '../rbac/CreatePermissionForm';
import { UserRoleManager } from '../rbac/UserRoleManager';
import { AuditLogViewer } from '../rbac/AuditLogViewer';

export function RBACAdmin() {
  const { hasPermission, loading } = usePermissionsContext();
  const [activeTab, setActiveTab] = useState('roles');
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [showCreateRoleForm, setShowCreateRoleForm] = useState(false);
  const [showCreatePermissionForm, setShowCreatePermissionForm] = useState(false);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (!hasPermission('rbac:manage')) {
    return (
      <div style={styles.accessDenied}>
        <h2 style={styles.accessDeniedTitle}>Access Denied</h2>
        <p style={styles.accessDeniedText}>
          You don't have permission to access the RBAC administration panel.
        </p>
        <p style={styles.accessDeniedText}>
          Required permission: <code style={styles.code}>rbac:manage</code>
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>RBAC Administration</h1>
        <p style={styles.subtitle}>
          Manage roles, permissions, and user access
        </p>
      </header>

      {/* Tab Navigation */}
      <div style={styles.tabsContainer}>
        <button
          onClick={() => setActiveTab('roles')}
          style={{
            ...styles.tab,
            ...(activeTab === 'roles' ? styles.tabActive : {}),
          }}
        >
          Roles
        </button>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            ...styles.tab,
            ...(activeTab === 'users' ? styles.tabActive : {}),
          }}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab('permissions')}
          style={{
            ...styles.tab,
            ...(activeTab === 'permissions' ? styles.tabActive : {}),
          }}
        >
          Permissions
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          style={{
            ...styles.tab,
            ...(activeTab === 'audit' ? styles.tabActive : {}),
          }}
        >
          Audit Logs
        </button>
      </div>

      {/* Tab Content */}
      <div style={styles.content}>
        {activeTab === 'roles' && (
          <div style={styles.rolesLayout}>
            <div style={styles.roleListPanel}>
              <RoleList
                selectedRoleId={selectedRoleId}
                onSelectRole={setSelectedRoleId}
                onCreateRole={() => setShowCreateRoleForm(true)}
              />
            </div>
            <div style={styles.roleDetailsPanel}>
              <RoleDetails roleId={selectedRoleId} />
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div style={styles.tabContent}>
            <UserRoleManager />
          </div>
        )}

        {activeTab === 'permissions' && (
          <div style={styles.tabContent}>
            <div style={styles.permissionsHeader}>
              <h3 style={styles.sectionTitle}>Permission Management</h3>
              <button
                onClick={() => setShowCreatePermissionForm(true)}
                style={styles.createButton}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
              >
                + Create Permission
              </button>
            </div>
            <div style={styles.permissionsInfo}>
              <p style={styles.infoText}>
                Permissions are managed through roles. Create new permissions here,
                then assign them to roles in the Roles tab.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div style={styles.tabContent}>
            <AuditLogViewer />
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateRoleForm && (
        <CreateRoleForm
          onClose={() => setShowCreateRoleForm(false)}
          onSuccess={(role) => setSelectedRoleId(role.id)}
        />
      )}

      {showCreatePermissionForm && (
        <CreatePermissionForm
          onClose={() => setShowCreatePermissionForm(false)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
  },
  loading: {
    fontSize: '16px',
    color: '#6b7280',
  },
  accessDenied: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '20px',
    textAlign: 'center',
  },
  accessDeniedTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#ef4444',
    marginBottom: '12px',
  },
  accessDeniedText: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '8px',
  },
  code: {
    padding: '2px 6px',
    backgroundColor: '#f3f4f6',
    borderRadius: '3px',
    fontFamily: 'monospace',
    fontSize: '14px',
  },
  header: {
    padding: '24px 32px',
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
  },
  title: {
    margin: '0 0 4px 0',
    fontSize: '28px',
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#6b7280',
  },
  tabsContainer: {
    display: 'flex',
    padding: '0 32px',
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
  },
  tab: {
    padding: '12px 24px',
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6b7280',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s',
  },
  tabActive: {
    color: '#3b82f6',
    borderBottomColor: '#3b82f6',
  },
  content: {
    padding: '24px 32px',
    minHeight: 'calc(100vh - 180px)',
  },
  rolesLayout: {
    display: 'grid',
    gridTemplateColumns: '350px 1fr',
    gap: '24px',
    height: 'calc(100vh - 220px)',
  },
  roleListPanel: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  roleDetailsPanel: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  tabContent: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    minHeight: 'calc(100vh - 220px)',
  },
  permissionsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e5e7eb',
  },
  sectionTitle: {
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
  permissionsInfo: {
    padding: '16px',
    backgroundColor: '#eff6ff',
    borderRadius: '6px',
    border: '1px solid #bfdbfe',
  },
  infoText: {
    margin: 0,
    fontSize: '14px',
    color: '#1e40af',
    lineHeight: '1.5',
  },
};

export default RBACAdmin;
