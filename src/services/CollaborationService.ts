import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { v4 as uuidv4 } from 'uuid';
import { Session, CollaborationEvent } from '../types';
import { dataStore } from '../models/DataStore';
import { authService } from './AuthService';

export class CollaborationService {
  private io: SocketIOServer | null = null;

  initialize(httpServer: HTTPServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    this.io.on('connection', (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);
      this.handleConnection(socket);
    });
  }

  private handleConnection(socket: Socket): void {
    // Authenticate the socket connection
    socket.on('authenticate', async (data: { token: string }) => {
      try {
        const authToken = authService.verifyToken(data.token);
        const user = dataStore.getUser(authToken.userId);

        if (!user) {
          socket.emit('auth_error', { message: 'User not found' });
          return;
        }

        // Create session
        const session: Session = {
          id: uuidv4(),
          userId: user.id,
          socketId: socket.id,
          connectedAt: new Date(),
          lastActivity: new Date(),
          metadata: {
            username: user.username,
            roles: user.roles,
          },
        };

        dataStore.addSession(session);
        socket.data.userId = user.id;
        socket.data.username = user.username;
        socket.data.sessionId = session.id;

        socket.emit('authenticated', {
          sessionId: session.id,
          user: {
            id: user.id,
            username: user.username,
            roles: user.roles,
          },
        });

        // Notify other users
        this.broadcastEvent({
          type: 'user_joined',
          userId: user.id,
          data: { username: user.username },
          timestamp: new Date(),
        });

        console.log(`User authenticated: ${user.username} (${socket.id})`);
      } catch (error) {
        socket.emit('auth_error', { message: 'Authentication failed' });
      }
    });

    // Handle activity updates
    socket.on('activity', () => {
      if (socket.data.sessionId) {
        dataStore.updateSession(socket.data.sessionId, {
          lastActivity: new Date(),
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      
      if (socket.data.sessionId) {
        dataStore.deleteSession(socket.data.sessionId);
      }

      if (socket.data.userId && socket.data.username) {
        this.broadcastEvent({
          type: 'user_left',
          userId: socket.data.userId,
          data: { username: socket.data.username },
          timestamp: new Date(),
        });
      }
    });

    // Handle permission updates
    socket.on('permission_updated', (data: { userId: string; permissions: string[] }) => {
      if (socket.data.userId) {
        this.broadcastEvent({
          type: 'permission_updated',
          userId: data.userId,
          data: { permissions: data.permissions },
          timestamp: new Date(),
        });
      }
    });

    // Handle role updates
    socket.on('role_updated', (data: { roleId: string; roleName: string }) => {
      if (socket.data.userId) {
        this.broadcastEvent({
          type: 'role_updated',
          userId: socket.data.userId,
          data: { roleId: data.roleId, roleName: data.roleName },
          timestamp: new Date(),
        });
      }
    });

    // Handle user updates
    socket.on('user_updated', (data: { userId: string; updates: any }) => {
      if (socket.data.userId) {
        this.broadcastEvent({
          type: 'user_updated',
          userId: data.userId,
          data: { updates: data.updates },
          timestamp: new Date(),
        });
      }
    });
  }

  broadcastEvent(event: CollaborationEvent): void {
    if (this.io) {
      this.io.emit('collaboration_event', event);
    }
  }

  notifyUser(userId: string, eventName: string, data: any): void {
    if (!this.io) return;

    const sessions = dataStore.getUserSessions(userId);
    sessions.forEach(session => {
      this.io!.to(session.socketId).emit(eventName, data);
    });
  }

  getActiveSessions(): Session[] {
    return dataStore.getAllSessions();
  }

  getActiveUsers(): Array<{ userId: string; username: string; connectedAt: Date }> {
    const sessions = dataStore.getAllSessions();
    const userMap = new Map<string, { userId: string; username: string; connectedAt: Date }>();

    sessions.forEach(session => {
      if (!userMap.has(session.userId)) {
        userMap.set(session.userId, {
          userId: session.userId,
          username: session.metadata?.username || 'Unknown',
          connectedAt: session.connectedAt,
        });
      }
    });

    return Array.from(userMap.values());
  }

  getUserSessionCount(userId: string): number {
    return dataStore.getUserSessions(userId).length;
  }

  disconnectUser(userId: string): void {
    if (!this.io) return;

    const sessions = dataStore.getUserSessions(userId);
    sessions.forEach(session => {
      const socket = this.io!.sockets.sockets.get(session.socketId);
      if (socket) {
        socket.disconnect(true);
      }
      dataStore.deleteSession(session.id);
    });
  }
}

export const collaborationService = new CollaborationService();
