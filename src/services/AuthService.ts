import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { User, AuthToken } from '../types';
import { dataStore } from '../models/DataStore';

const JWT_SECRET = process.env.JWT_SECRET || 'enterprise-rbac-secret-key-change-in-production';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';

export class AuthService {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async register(username: string, email: string, password: string, roles: string[] = []): Promise<User> {
    // Check if user already exists
    if (dataStore.getUserByUsername(username)) {
      throw new Error('Username already exists');
    }
    if (dataStore.getUserByEmail(email)) {
      throw new Error('Email already exists');
    }

    const passwordHash = await this.hashPassword(password);
    const user: User = {
      id: uuidv4(),
      username,
      email,
      passwordHash,
      roles,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    dataStore.addUser(user);
    return user;
  }

  async login(username: string, password: string): Promise<{ user: User; token: string }> {
    const user = dataStore.getUserByUsername(username);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      throw new Error('User account is inactive');
    }

    const isValid = await this.verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login time and last seen time
    const now = new Date();
    const updatedUser = dataStore.updateUser(user.id, {
      lastLoginAt: now,
      lastSeenAt: now,
      isOnline: true,
    });

    const token = this.generateToken(updatedUser || user);
    return { user: updatedUser || user, token };
  }

  generateToken(user: User): string {
    const permissions = dataStore.getAllUserPermissions(user.id);
    
    const payload: Omit<AuthToken, 'iat' | 'exp'> = {
      userId: user.id,
      username: user.username,
      roles: user.roles,
      permissions,
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION } as jwt.SignOptions);
  }

  verifyToken(token: string): AuthToken {
    try {
      return jwt.verify(token, JWT_SECRET) as AuthToken;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = dataStore.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isValid = await this.verifyPassword(oldPassword, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid current password');
    }

    const newPasswordHash = await this.hashPassword(newPassword);
    dataStore.updateUser(userId, { passwordHash: newPasswordHash });
  }

  async resetPassword(userId: string, newPassword: string): Promise<void> {
    const user = dataStore.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const newPasswordHash = await this.hashPassword(newPassword);
    dataStore.updateUser(userId, { passwordHash: newPasswordHash });
  }
}

export const authService = new AuthService();
