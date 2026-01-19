import { useEffect, useRef } from 'react';
import useRBACStore from './store';

/**
 * Custom hook for WebSocket integration
 * @param {WebSocketManager} wsManager - WebSocket manager instance
 * @returns {Object} WebSocket status and methods
 */
export function useWebSocket(wsManager) {
  const setWsConnected = useRBACStore(state => state.setWsConnected);
  const wsConnected = useRBACStore(state => state.wsConnected);
  const unsubscribersRef = useRef([]);

  useEffect(() => {
    if (!wsManager) return;

    // Subscribe to connection status
    const statusUnsubscribe = wsManager.on('connection:status', ({ connected }) => {
      setWsConnected(connected);
    });

    unsubscribersRef.current.push(statusUnsubscribe);

    // Cleanup
    return () => {
      unsubscribersRef.current.forEach(unsub => unsub());
      unsubscribersRef.current = [];
    };
  }, [wsManager, setWsConnected]);

  return {
    connected: wsConnected,
    isConnected: wsManager?.isConnected(),
    send: (type, payload) => wsManager?.send(type, payload),
    on: (event, callback) => wsManager?.on(event, callback),
    off: (event, callback) => wsManager?.off(event, callback),
  };
}

export default useWebSocket;
