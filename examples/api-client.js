const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

class RBACClient {
  constructor() {
    this.token = null;
  }

  async register(username, email, password) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        username,
        email,
        password,
        roles: []
      });
      this.token = response.data.token;
      console.log('✅ Registered successfully:', response.data.user);
      return response.data;
    } catch (error) {
      console.error('❌ Registration failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async login(username, password) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username,
        password
      });
      this.token = response.data.token;
      console.log('✅ Logged in successfully:', response.data.user);
      return response.data;
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async getMe() {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      console.log('✅ Current user:', response.data.user);
      return response.data;
    } catch (error) {
      console.error('❌ Get me failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async getAllRoles() {
    try {
      const response = await axios.get(`${API_BASE_URL}/roles`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      console.log(`✅ Found ${response.data.roles.length} roles`);
      return response.data.roles;
    } catch (error) {
      console.error('❌ Get roles failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async getAllPermissions() {
    try {
      const response = await axios.get(`${API_BASE_URL}/permissions`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      console.log(`✅ Found ${response.data.permissions.length} permissions`);
      return response.data.permissions;
    } catch (error) {
      console.error('❌ Get permissions failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async getAuditLogs(limit = 10) {
    try {
      const response = await axios.get(`${API_BASE_URL}/audit/recent?limit=${limit}`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      console.log(`✅ Found ${response.data.count} audit logs`);
      return response.data.logs;
    } catch (error) {
      console.error('❌ Get audit logs failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async getActiveSessions() {
    try {
      const response = await axios.get(`${API_BASE_URL}/collaboration/sessions`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      console.log(`✅ Found ${response.data.count} active sessions`);
      return response.data.sessions;
    } catch (error) {
      console.error('❌ Get sessions failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async getActiveUsers() {
    try {
      const response = await axios.get(`${API_BASE_URL}/collaboration/users`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      console.log(`✅ Found ${response.data.count} active users`);
      return response.data.users;
    } catch (error) {
      console.error('❌ Get active users failed:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Example usage
async function main() {
  const client = new RBACClient();

  console.log('\n🔐 Enterprise RBAC System - API Client Example\n');

  // Login with admin user
  console.log('📋 Step 1: Login as admin');
  await client.login('admin', 'admin123');

  // Get current user info
  console.log('\n📋 Step 2: Get current user info');
  await client.getMe();

  // Get all roles
  console.log('\n📋 Step 3: Get all roles');
  const roles = await client.getAllRoles();
  roles.forEach(role => {
    console.log(`   - ${role.name}: ${role.description}`);
  });

  // Get all permissions
  console.log('\n📋 Step 4: Get all permissions');
  const permissions = await client.getAllPermissions();
  permissions.forEach(perm => {
    console.log(`   - ${perm.name}: ${perm.description}`);
  });

  // Get recent audit logs
  console.log('\n📋 Step 5: Get recent audit logs');
  const logs = await client.getAuditLogs(5);
  logs.forEach(log => {
    console.log(`   - [${log.timestamp}] ${log.username} - ${log.action} on ${log.resource}`);
  });

  console.log('\n✅ All operations completed successfully!\n');
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Example failed:', error.message);
    process.exit(1);
  });
}

module.exports = RBACClient;
