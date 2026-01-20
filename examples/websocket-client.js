const io = require('socket.io-client');
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';
const SOCKET_URL = 'http://localhost:3000';

class CollaborationClient {
  constructor() {
    this.socket = null;
    this.token = null;
  }

  async login(username, password) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username,
        password
      });
      this.token = response.data.token;
      console.log('✅ Logged in as:', response.data.user.username);
      return response.data;
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data || error.message);
      throw error;
    }
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        console.log('🔌 Connected to WebSocket server');
        
        // Authenticate the socket
        this.socket.emit('authenticate', { token: this.token });
      });

      this.socket.on('authenticated', (data) => {
        console.log('✅ Socket authenticated! Session ID:', data.sessionId);
        console.log('   User:', data.user.username);
        console.log('   Roles:', data.user.roles.join(', '));
        resolve(data);
      });

      this.socket.on('auth_error', (error) => {
        console.error('❌ Authentication error:', error.message);
        reject(error);
      });

      this.socket.on('collaboration_event', (event) => {
        console.log(`\n📢 Collaboration Event: ${event.type}`);
        console.log('   User ID:', event.userId);
        console.log('   Data:', JSON.stringify(event.data, null, 2));
        console.log('   Timestamp:', event.timestamp);
      });

      this.socket.on('disconnect', () => {
        console.log('🔌 Disconnected from WebSocket server');
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error.message);
        reject(error);
      });
    });
  }

  sendActivity() {
    if (this.socket) {
      this.socket.emit('activity');
      console.log('📡 Sent activity update');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      console.log('👋 Disconnected');
    }
  }
}

// Example usage
async function main() {
  console.log('\n🌐 Enterprise RBAC System - WebSocket Client Example\n');

  const client = new CollaborationClient();

  // Login first
  console.log('📋 Step 1: Login to get token');
  await client.login('admin', 'admin123');

  // Connect to WebSocket
  console.log('\n📋 Step 2: Connect to WebSocket server');
  await client.connect();

  // Send periodic activity updates
  console.log('\n📋 Step 3: Sending activity updates every 5 seconds...');
  const activityInterval = setInterval(() => {
    client.sendActivity();
  }, 5000);

  // Keep the client running for demonstration
  console.log('\n📌 Client is now connected and listening for events.');
  console.log('📌 Press Ctrl+C to disconnect and exit.\n');

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down...');
    clearInterval(activityInterval);
    client.disconnect();
    process.exit(0);
  });
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Example failed:', error.message);
    process.exit(1);
  });
}

module.exports = CollaborationClient;
