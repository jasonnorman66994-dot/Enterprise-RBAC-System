import React, { createContext, useContext, useState, useEffect } from 'react';

const PermissionsContext = createContext(null);

export function usePermissionsContext() {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissionsContext must be used within PermissionsProvider');
  }
  return context;
}

export function PermissionsProvider({ children }) {
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user permissions from localStorage or API
    const loadPermissions = async () => {
      try {
        // For demo purposes, we'll use mock permissions
        // In production, this would fetch from an API
        const mockPermissions = JSON.parse(
          localStorage.getItem('userPermissions') || '["rbac:manage"]'
        );
        setUserPermissions(mockPermissions);
      } catch (error) {
        console.error('Failed to load permissions:', error);
        setUserPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, []);

  const hasPermission = (permission) => {
    return userPermissions.includes(permission);
  };

  const hasAnyPermission = (permissions) => {
    return permissions.some((p) => userPermissions.includes(p));
  };

  const hasAllPermissions = (permissions) => {
    return permissions.every((p) => userPermissions.includes(p));
  };

  const value = {
    userPermissions,
    setUserPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    loading,
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export default PermissionsContext;
