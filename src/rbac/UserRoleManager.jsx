import React, { useState } from 'react';
import { useUsers, useRoles, useUpdateUserRoles } from './hooks';

export function UserRoleManager() {
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: roles, isLoading: rolesLoading } = useRoles();
  const updateUserRolesMutation = useUpdateUserRoles();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingUserId, setLoadingUserId] = useState(null);
  const [optimisticUpdates, setOptimisticUpdates] = useState({});

  const filteredUsers = users?.filter((user) =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRoleToggle = async (userId, roleId, currentRoles) => {
    const hasRole = currentRoles.includes(roleId);
    const newRoles = hasRole
      ? currentRoles.filter((r) => r !== roleId)
      : [...currentRoles, roleId];

    // Optimistic update
    setOptimisticUpdates((prev) => ({ ...prev, [userId]: newRoles }));
    setLoadingUserId(userId);

    try {
      await updateUserRolesMutation.mutateAsync({
        userId,
        roles: newRoles,
      });
      // Clear optimistic update on success
      setOptimisticUpdates((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    } catch (error) {
      // Rollback on error
      setOptimisticUpdates((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
      alert('Failed to update user roles: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoadingUserId(null);
    }
  };

  const getUserRoles = (user) => {
    return optimisticUpdates[user.id] !== undefined
      ? optimisticUpdates[user.id]
      : user.roles || [];
  };

  if (usersLoading || rolesLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading users and roles...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>User Role Management</h3>
        <input
          type="text"
          placeholder="Search by email or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      <div style={styles.userList}>
        {filteredUsers && filteredUsers.length === 0 && (
          <div style={styles.emptyState}>
            {searchTerm ? 'No users found matching your search.' : 'No users available.'}
          </div>
        )}

        {filteredUsers && filteredUsers.map((user) => {
          const userRoles = getUserRoles(user);
          const isLoading = loadingUserId === user.id;

          return (
            <div key={user.id} style={styles.userCard}>
              <div style={styles.userInfo}>
                <div style={styles.userName}>{user.name || user.email}</div>
                {user.name && (
                  <div style={styles.userEmail}>{user.email}</div>
                )}
              </div>

              <div style={styles.rolesContainer}>
                {roles && roles.map((role) => {
                  const hasRole = userRoles.includes(role.id);
                  
                  return (
                    <label
                      key={role.id}
                      style={{
                        ...styles.roleCheckbox,
                        opacity: isLoading ? 0.6 : 1,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={hasRole}
                        onChange={() => handleRoleToggle(user.id, role.id, userRoles)}
                        disabled={isLoading}
                        style={styles.checkbox}
                      />
                      <span style={styles.roleName}>{role.name}</span>
                    </label>
                  );
                })}
              </div>

              {isLoading && (
                <div style={styles.loadingIndicator}>Updating...</div>
              )}
            </div>
          );
        })}
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
    marginBottom: '20px',
  },
  title: {
    margin: '0 0 12px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
  },
  searchInput: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    outline: 'none',
  },
  userList: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  userCard: {
    padding: '16px',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    position: 'relative',
  },
  userInfo: {
    marginBottom: '12px',
    paddingBottom: '12px',
    borderBottom: '1px solid #f3f4f6',
  },
  userName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '2px',
  },
  userEmail: {
    fontSize: '13px',
    color: '#6b7280',
  },
  rolesContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  roleCheckbox: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 12px',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  checkbox: {
    marginRight: '6px',
    cursor: 'pointer',
  },
  roleName: {
    fontSize: '13px',
    color: '#374151',
    fontWeight: '500',
  },
  loadingIndicator: {
    position: 'absolute',
    top: '8px',
    right: '12px',
    fontSize: '12px',
    color: '#3b82f6',
    fontWeight: '500',
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

export default UserRoleManager;
