const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

class IntegrationTest {
  constructor() {
    this.adminToken = null;
    this.managerToken = null;
    this.userToken = null;
    this.testRoleId = null;
    this.testPermissionId = null;
  }

  async testAuthentication() {
    console.log('\n🧪 Testing Authentication...');
    
    // Test admin login
    const adminLogin = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    this.adminToken = adminLogin.data.token;
    console.log('✅ Admin login successful');

    // Test manager login
    const managerLogin = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'manager',
      password: 'manager123'
    });
    this.managerToken = managerLogin.data.token;
    console.log('✅ Manager login successful');

    // Test user login
    const userLogin = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'user',
      password: 'user123'
    });
    this.userToken = userLogin.data.token;
    console.log('✅ User login successful');

    // Test invalid credentials
    try {
      await axios.post(`${API_BASE_URL}/auth/login`, {
        username: 'admin',
        password: 'wrongpassword'
      });
      throw new Error('Should have failed with wrong password');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Invalid credentials properly rejected');
      } else {
        throw error;
      }
    }
  }

  async testRoleManagement() {
    console.log('\n🧪 Testing Role Management...');

    // Create a new role
    const createRole = await axios.post(
      `${API_BASE_URL}/roles`,
      {
        name: 'test-role',
        description: 'Test role for integration testing',
        permissions: []
      },
      { headers: { Authorization: `Bearer ${this.adminToken}` } }
    );
    this.testRoleId = createRole.data.role.id;
    console.log('✅ Role created successfully');

    // Get all roles
    const roles = await axios.get(`${API_BASE_URL}/roles`, {
      headers: { Authorization: `Bearer ${this.adminToken}` }
    });
    console.log(`✅ Retrieved ${roles.data.roles.length} roles`);

    // Update role
    await axios.put(
      `${API_BASE_URL}/roles/${this.testRoleId}`,
      { description: 'Updated test role' },
      { headers: { Authorization: `Bearer ${this.adminToken}` } }
    );
    console.log('✅ Role updated successfully');
  }

  async testPermissionManagement() {
    console.log('\n🧪 Testing Permission Management...');

    // Create a new permission
    const createPerm = await axios.post(
      `${API_BASE_URL}/permissions`,
      {
        name: 'test.execute',
        resource: 'test',
        action: 'execute',
        description: 'Test permission'
      },
      { headers: { Authorization: `Bearer ${this.adminToken}` } }
    );
    this.testPermissionId = createPerm.data.permission.id;
    console.log('✅ Permission created successfully');

    // Get all permissions
    const perms = await axios.get(`${API_BASE_URL}/permissions`, {
      headers: { Authorization: `Bearer ${this.adminToken}` }
    });
    console.log(`✅ Retrieved ${perms.data.permissions.length} permissions`);
  }

  async testAuditLogs() {
    console.log('\n🧪 Testing Audit Logs...');

    // Get recent activity
    const recent = await axios.get(`${API_BASE_URL}/audit/recent?limit=10`, {
      headers: { Authorization: `Bearer ${this.adminToken}` }
    });
    console.log(`✅ Retrieved ${recent.data.count} audit logs`);

    // Get activity stats
    const stats = await axios.get(`${API_BASE_URL}/audit/stats`, {
      headers: { Authorization: `Bearer ${this.adminToken}` }
    });
    console.log(`✅ Retrieved activity statistics: ${stats.data.stats.total} total events`);

    // Search logs
    const search = await axios.get(`${API_BASE_URL}/audit/search?query=login&limit=5`, {
      headers: { Authorization: `Bearer ${this.adminToken}` }
    });
    console.log(`✅ Search found ${search.data.count} matching logs`);
  }

  async testCollaboration() {
    console.log('\n🧪 Testing Collaboration Features...');

    // Note: WebSocket connections are tested in websocket-client.js
    // Here we just test the REST API endpoints

    // Get active sessions (should be none since no WebSocket connections)
    const sessions = await axios.get(`${API_BASE_URL}/collaboration/sessions`, {
      headers: { Authorization: `Bearer ${this.adminToken}` }
    });
    console.log(`✅ Retrieved ${sessions.data.count} active sessions`);

    // Get active users
    const users = await axios.get(`${API_BASE_URL}/collaboration/users`, {
      headers: { Authorization: `Bearer ${this.adminToken}` }
    });
    console.log(`✅ Retrieved ${users.data.count} active users`);
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up test data...');

    // Delete test role
    if (this.testRoleId) {
      await axios.delete(`${API_BASE_URL}/roles/${this.testRoleId}`, {
        headers: { Authorization: `Bearer ${this.adminToken}` }
      });
      console.log('✅ Test role deleted');
    }

    // Delete test permission
    if (this.testPermissionId) {
      await axios.delete(`${API_BASE_URL}/permissions/${this.testPermissionId}`, {
        headers: { Authorization: `Bearer ${this.adminToken}` }
      });
      console.log('✅ Test permission deleted');
    }
  }

  async runAll() {
    try {
      console.log('🚀 Starting Integration Tests...');
      
      await this.testAuthentication();
      await this.testRoleManagement();
      await this.testPermissionManagement();
      await this.testAuditLogs();
      await this.testCollaboration();
      await this.cleanup();

      console.log('\n✅ All integration tests passed!\n');
      return true;
    } catch (error) {
      console.error('\n❌ Test failed:', error.response?.data || error.message);
      console.error('Stack:', error.stack);
      return false;
    }
  }
}

// Run tests if executed directly
if (require.main === module) {
  const test = new IntegrationTest();
  test.runAll().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = IntegrationTest;
