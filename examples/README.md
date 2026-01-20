# Running Examples

This directory contains example client code for interacting with the Enterprise RBAC System.

## Prerequisites

1. Make sure the RBAC server is running:
   ```bash
   npm start
   ```

2. Install axios and socket.io-client for the examples:
   ```bash
   npm install axios socket.io-client
   ```

## API Client Example

Demonstrates basic REST API usage including authentication, role/permission management, and audit log queries.

```bash
node examples/api-client.js
```

This example will:
- Login as the admin user
- Retrieve current user information
- List all roles and permissions
- Query recent audit logs

## WebSocket Client Example

Demonstrates real-time collaboration features using WebSocket connections.

```bash
node examples/websocket-client.js
```

This example will:
- Login and authenticate via WebSocket
- Maintain a persistent connection
- Send periodic activity updates
- Listen for collaboration events (user joins/leaves, permission updates, etc.)

To see collaboration events in action, run multiple instances of the WebSocket client in different terminals.

## Using in Your Application

You can import and use these clients in your own Node.js applications:

```javascript
const RBACClient = require('./examples/api-client');
const CollaborationClient = require('./examples/websocket-client');

const client = new RBACClient();
await client.login('admin', 'admin123');
const roles = await client.getAllRoles();
```
