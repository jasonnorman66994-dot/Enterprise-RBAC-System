import React, { useEffect, useRef, createContext, useContext } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import WebSocketManager from './websocket';
import useRBACStore from './store';

const WebSocketContext = createContext(null);

export function useWebSocketContext() {
  return useContext(WebSocketContext);
}

export function WebSocketProvider({ children, url }) {
  const wsManagerRef = useRef(null);
  const queryClient = useQueryClient();
  const store = useRBACStore();
  const wsConnected = useRBACStore(state => state.wsConnected);

  useEffect(() => {
    // Initialize WebSocket manager
    const wsUrl = url || process.env.REACT_APP_WS_URL || 'ws://localhost:3000/ws';
    wsManagerRef.current = new WebSocketManager(wsUrl);
    wsManagerRef.current.connect();

    // Subscribe to RBAC events
    const unsubscribers = [];

    // Role events
    unsubscribers.push(
      wsManagerRef.current.on('role:created', (role) => {
        store.handleRoleCreated(role);
        queryClient.invalidateQueries({ queryKey: ['roles'] });
      })
    );

    unsubscribers.push(
      wsManagerRef.current.on('role:updated', (role) => {
        store.handleRoleUpdated(role);
        queryClient.invalidateQueries({ queryKey: ['roles'] });
        queryClient.invalidateQueries({ queryKey: ['role', role.id] });
      })
    );

    unsubscribers.push(
      wsManagerRef.current.on('role:deleted', (data) => {
        store.handleRoleDeleted(data.roleId);
        queryClient.invalidateQueries({ queryKey: ['roles'] });
      })
    );

    // Permission events
    unsubscribers.push(
      wsManagerRef.current.on('permissions:updated', (data) => {
        store.handlePermissionsUpdated(data);
        queryClient.invalidateQueries({ queryKey: ['roles'] });
        queryClient.invalidateQueries({ queryKey: ['role', data.roleId] });
      })
    );

    // User events
    unsubscribers.push(
      wsManagerRef.current.on('user:roles:updated', (data) => {
        store.handleUserRolesUpdated(data);
        queryClient.invalidateQueries({ queryKey: ['users'] });
      })
    );

    // Audit log events
    unsubscribers.push(
      wsManagerRef.current.on('audit:log', (log) => {
        store.handleAuditLog(log);
        queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      })
    );

    // Cleanup
    return () => {
      unsubscribers.forEach(unsub => unsub());
      if (wsManagerRef.current) {
        wsManagerRef.current.disconnect();
      }
    };
  }, [url, queryClient, store]);

  return (
    <WebSocketContext.Provider value={wsManagerRef.current}>
      {children}
      <ConnectionStatusIndicator connected={wsConnected} />
    </WebSocketContext.Provider>
  );
}

function ConnectionStatusIndicator({ connected }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '8px 16px',
        borderRadius: '20px',
        backgroundColor: connected ? '#10b981' : '#ef4444',
        color: 'white',
        fontSize: '12px',
        fontWeight: '600',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <div
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: 'white',
          animation: connected ? 'pulse 2s infinite' : 'none',
        }}
      />
      {connected ? 'Connected' : 'Disconnected'}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
}

export default WebSocketProvider;
