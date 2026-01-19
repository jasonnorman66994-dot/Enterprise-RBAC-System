const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

class WebSocketServer {
  constructor(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws'
    });
    
    this.clients = new Map(); // userId -> Set of WebSocket connections
    
    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });
  }

  handleConnection(ws, req) {
    console.log('New WebSocket connection');
    
    let userId = null;
    let isAuthenticated = false;

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === 'authenticate') {
          const { token } = data.payload;
          
          try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            userId = decoded.userId;
            isAuthenticated = true;
            
            // Add client to clients map
            if (!this.clients.has(userId)) {
              this.clients.set(userId, new Set());
            }
            this.clients.get(userId).add(ws);
            
            ws.send(JSON.stringify({
              type: 'authenticated',
              payload: { userId }
            }));
            
            console.log(`User ${userId} authenticated`);
          } catch (error) {
            ws.send(JSON.stringify({
              type: 'auth:error',
              payload: { message: 'Invalid token' }
            }));
          }
        }
      } catch (error) {
        console.error('Error handling message:', error);
      }
    });

    ws.on('close', () => {
      if (userId && this.clients.has(userId)) {
        this.clients.get(userId).delete(ws);
        if (this.clients.get(userId).size === 0) {
          this.clients.delete(userId);
        }
      }
      console.log('WebSocket connection closed');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  /**
   * Broadcast message to all connected clients except the originating user
   */
  broadcast(type, payload, excludeUserId = null) {
    const message = JSON.stringify({ type, payload });
    
    this.clients.forEach((connections, userId) => {
      if (userId !== excludeUserId) {
        connections.forEach((ws) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(message);
          }
        });
      }
    });
  }

  /**
   * Send message to specific user
   */
  sendToUser(userId, type, payload) {
    const message = JSON.stringify({ type, payload });
    const connections = this.clients.get(userId);
    
    if (connections) {
      connections.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      });
    }
  }

  /**
   * Broadcast role created event
   */
  broadcastRoleCreated(role, excludeUserId) {
    this.broadcast('role:created', role, excludeUserId);
  }

  /**
   * Broadcast role updated event
   */
  broadcastRoleUpdated(role, excludeUserId) {
    this.broadcast('role:updated', role, excludeUserId);
  }

  /**
   * Broadcast role deleted event
   */
  broadcastRoleDeleted(roleId, excludeUserId) {
    this.broadcast('role:deleted', { roleId }, excludeUserId);
  }

  /**
   * Broadcast permissions updated event
   */
  broadcastPermissionsUpdated(roleId, permissions, excludeUserId) {
    this.broadcast('permissions:updated', { roleId, permissions }, excludeUserId);
  }

  /**
   * Broadcast user roles updated event
   */
  broadcastUserRolesUpdated(userId, roles, excludeUserId) {
    this.broadcast('user:roles:updated', { userId, roles }, excludeUserId);
  }

  /**
   * Broadcast audit log event
   */
  broadcastAuditLog(log, excludeUserId) {
    this.broadcast('audit:log', log, excludeUserId);
  }
}

module.exports = WebSocketServer;
