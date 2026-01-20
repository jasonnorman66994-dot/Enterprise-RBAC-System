# Enterprise RBAC System

A fully-featured enterprise Role-Based Access Control (RBAC) system with real-time collaboration and comprehensive audit trails.

## Features

### 🔐 Core RBAC
- **User Management**: Register, authenticate, and manage users
- **Role Management**: Create hierarchical roles with inheritance
- **Permission Management**: Fine-grained permission control
- **Dynamic Access Control**: Real-time permission checking
- **JWT Authentication**: Secure token-based authentication

### 🌐 Real-time Collaboration
- **WebSocket Integration**: Live updates using Socket.io
- **Active User Tracking**: Monitor who's currently online
- **Session Management**: Track multiple user sessions
- **Live Events**: Real-time notifications for permission/role changes
- **Collaborative Presence**: See when users join/leave

### 📊 Comprehensive Audit Trails
- **Complete Activity Logging**: Track all user actions
- **Detailed Audit Logs**: Capture IP, user agent, timestamps
- **Success/Failure Tracking**: Monitor both successful and failed operations
- **Search & Filter**: Query audit logs by user, resource, date range
- **Activity Statistics**: Generate reports and analytics
- **Resource Tracking**: Monitor changes to specific resources

## Getting Started

### Installation

```bash
npm install
```

### Build

```bash
npm run build
```

### Development

```bash
npm run dev
```

### Production

A comprehensive, production-ready Role-Based Access Control (RBAC) system with real-time updates, audit logging, and CSV export functionality.

## Features

- 🔐 **Role Management** - Create, update, and delete roles with granular permissions
- 👥 **User Management** - Assign roles to users with optimistic updates
- 🔑 **Permission Management** - Create and manage permissions by resource and action
- 📊 **Audit Logging** - Track all RBAC operations with filtering and CSV export
- 🔄 **Real-time Updates** - WebSocket-based live synchronization across clients
- 💾 **State Management** - Zustand for global state, TanStack Query for server state
- 🚀 **Auto-save** - Debounced automatic saving of permission changes
- 📥 **CSV Export** - Export filtered audit logs to CSV

## Tech Stack

### Frontend
- React 18
- Zustand (state management)
- TanStack Query (server state)
- Axios (HTTP client)
- WebSocket (real-time updates)

### Backend (Example)
- Express.js
- WebSocket (ws library)
- JWT authentication
- Mock data stores (replace with database)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Enterprise-RBAC-System
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```
   REACT_APP_WS_URL=ws://localhost:3000/ws
   REACT_APP_API_URL=http://localhost:3000/api
   PORT=3000
   JWT_SECRET=your-secret-key
   NODE_ENV=development
   ```

## Running the Application

### Development Mode

**Start the backend server:**
```bash
npm run server
```

**Start the React frontend (in another terminal):**
```bash
npm start
```

## Default Demo Users

The system comes with pre-configured demo users:

| Username | Password    | Role    | Description                    |
|----------|-------------|---------|--------------------------------|
| admin    | admin123    | admin   | Full administrative access     |
| manager  | manager123  | manager | User and role management       |
| user     | user123     | user    | Read-only access               |

## API Documentation

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123",
  "roles": []
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Change Password
```http
POST /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "oldPassword": "current123",
  "newPassword": "newpassword123"
}
```

### Roles

#### Create Role
```http
POST /api/roles
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "developer",
  "description": "Developer role",
  "permissions": ["permission-id-1", "permission-id-2"],
  "parentRoleId": "optional-parent-role-id"
}
```

#### Get All Roles
```http
GET /api/roles
Authorization: Bearer <token>
```

#### Get Role by ID
```http
GET /api/roles/:roleId
Authorization: Bearer <token>
```

#### Update Role
```http
PUT /api/roles/:roleId
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Updated description",
  "permissions": ["new-permission-list"]
}
```

#### Delete Role
```http
DELETE /api/roles/:roleId
Authorization: Bearer <token>
```

### Permissions

#### Create Permission
```http
POST /api/permissions
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "resource.action",
  "resource": "resource-name",
  "action": "create",
  "description": "Permission description"
}
```

#### Get All Permissions
```http
GET /api/permissions
Authorization: Bearer <token>
```

#### Delete Permission
```http
DELETE /api/permissions/:permissionId
Authorization: Bearer <token>
```

### User Role Management

#### Assign Roles to User
```http
POST /api/users/:userId/roles
Authorization: Bearer <token>
Content-Type: application/json

{
  "roleIds": ["role-id-1", "role-id-2"]
}
```

#### Remove Roles from User
```http
DELETE /api/users/:userId/roles
Authorization: Bearer <token>
Content-Type: application/json

{
  "roleIds": ["role-id-1"]
}
```

#### Get User Permissions
```http
GET /api/users/:userId/permissions
Authorization: Bearer <token>
```

#### Get User Roles
```http
GET /api/users/:userId/roles
Authorization: Bearer <token>
```

### Audit Logs

#### Get Audit Logs
```http
GET /api/audit/logs?userId=<userId>&resource=<resource>&startDate=<ISO-date>&endDate=<ISO-date>&limit=100
Authorization: Bearer <token>
```

#### Get User Activity
```http
GET /api/audit/users/:userId?limit=50
Authorization: Bearer <token>
```

#### Get Resource Activity
```http
GET /api/audit/resources/:resource?limit=50
Authorization: Bearer <token>
```

#### Get Recent Activity
```http
GET /api/audit/recent?limit=100
Authorization: Bearer <token>
```

#### Get Activity Statistics
```http
GET /api/audit/stats?startDate=<ISO-date>&endDate=<ISO-date>
Authorization: Bearer <token>
```

#### Search Audit Logs
```http
GET /api/audit/search?query=<search-term>&limit=50
Authorization: Bearer <token>
```

### Real-time Collaboration

#### Get Active Sessions
```http
GET /api/collaboration/sessions
Authorization: Bearer <token>
```

#### Get Active Users
```http
GET /api/collaboration/users
Authorization: Bearer <token>
```

#### Get User Sessions
```http
GET /api/collaboration/users/:userId/sessions
Authorization: Bearer <token>
```

#### Disconnect User
```http
POST /api/collaboration/users/:userId/disconnect
Authorization: Bearer <token>
```

#### Get User Status
```http
GET /api/collaboration/users/:userId/status
Authorization: Bearer <token>
```

Response:
```json
{
  "status": {
    "userId": "user-id",
    "username": "admin",
    "isOnline": true,
    "lastSeenAt": "2026-01-19T09:30:00.000Z",
    "lastLoginAt": "2026-01-19T09:25:00.000Z",
    "currentSessions": 2,
    "connectedSince": "2026-01-19T09:25:00.000Z"
  }
}
```

#### Get All User Statuses
```http
GET /api/collaboration/statuses
Authorization: Bearer <token>
```

Response:
```json
{
  "statuses": [
    {
      "userId": "user-id",
      "username": "admin",
      "isOnline": true,
      "lastSeenAt": "2026-01-19T09:30:00.000Z",
      "lastLoginAt": "2026-01-19T09:25:00.000Z",
      "currentSessions": 2
    }
  ],
  "count": 1
}
```

#### Get Online Users
```http
GET /api/collaboration/online
Authorization: Bearer <token>
```

Response:
```json
{
  "users": [
    {
      "userId": "user-id",
      "username": "admin",
      "isOnline": true,
      "lastSeenAt": "2026-01-19T09:30:00.000Z",
      "lastLoginAt": "2026-01-19T09:25:00.000Z",
      "currentSessions": 2,
      "connectedSince": "2026-01-19T09:25:00.000Z"
    }
  ],
  "count": 1
}
```

## WebSocket Events

### Client to Server

#### Authenticate
```javascript
socket.emit('authenticate', { token: 'your-jwt-token' });
```

#### Activity Update
```javascript
socket.emit('activity');
```

### Server to Client

#### Authenticated
```javascript
socket.on('authenticated', (data) => {
  console.log('Session ID:', data.sessionId);
  console.log('User:', data.user);
});
```

#### Authentication Error
```javascript
socket.on('auth_error', (data) => {
  console.error('Auth error:', data.message);
});
```

#### Collaboration Events
```javascript
socket.on('collaboration_event', (event) => {
  console.log('Event type:', event.type);
  console.log('User ID:', event.userId);
  console.log('Data:', event.data);
  console.log('Timestamp:', event.timestamp);
});
```

Event types:
- `user_joined`: User connected to the system (includes username, connectedAt, isOnline)
- `user_left`: User disconnected from the system (includes username, isOnline, lastSeenAt)
- `user_status_changed`: User status changed (when user disconnects but has other active sessions)
- `permission_updated`: User permissions were updated
- `role_updated`: Role was created/updated
- `user_updated`: User information was updated

## WebSocket Client Example

```javascript
const io = require('socket.io-client');
const socket = io('http://localhost:3000');

// Authenticate
socket.emit('authenticate', { token: 'your-jwt-token' });

// Listen for authentication success
socket.on('authenticated', (data) => {
  console.log('Connected! Session:', data.sessionId);
});

// Listen for collaboration events
socket.on('collaboration_event', (event) => {
  switch(event.type) {
    case 'user_joined':
      console.log(`${event.data.username} joined`);
      break;
    case 'user_left':
      console.log(`${event.data.username} left`);
      break;
    case 'permission_updated':
      console.log('Permissions updated:', event.data);
      break;
    case 'role_updated':
      console.log('Role updated:', event.data);
      break;
  }
});

// Send periodic activity updates
setInterval(() => {
  socket.emit('activity');
}, 30000);
```

## Architecture

### Components

1. **Data Store** (`src/models/DataStore.ts`)
   - In-memory data management
   - User, role, permission, audit log, and session storage
   - Efficient querying and relationships

2. **Services**
   - `AuthService`: User authentication and JWT token management
   - `RBACService`: Role and permission management
   - `AuditService`: Comprehensive audit logging
   - `CollaborationService`: Real-time WebSocket communication

3. **Controllers**
   - `AuthController`: Authentication endpoints
   - `RBACController`: Role and permission endpoints
   - `AuditController`: Audit log endpoints
   - `CollaborationController`: Session management endpoints

4. **Middleware**
   - Authentication middleware
   - Permission checking
   - Audit logging
   - Role-based access control

### Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure, expirable tokens
- **Permission Validation**: Real-time permission checking
- **Audit Trail**: Complete activity tracking
- **Session Management**: Secure WebSocket authentication

### Hierarchical Roles

The system supports role inheritance, where child roles inherit permissions from parent roles:

```javascript
// Create parent role
const parentRole = rbacService.createRole('senior-developer', 'Senior Developer', [
  'code.review',
  'code.merge'
]);

// Create child role with inheritance
const childRole = rbacService.createRole('junior-developer', 'Junior Developer', [
  'code.read',
  'code.write'
], parentRole.id);

// Junior developers will have: code.read, code.write, code.review, code.merge
```

## Environment Variables

Create a `.env` file:

```env
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=24h
```

## Technology Stack

- **Runtime**: Node.js with TypeScript
- **Web Framework**: Express.js
- **Real-time**: Socket.io
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **ID Generation**: UUID

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
The application will be available at:
- Frontend: http://localhost:3001 (or next available port)
- Backend API: http://localhost:3000/api
- WebSocket: ws://localhost:3000/ws

### Production Build

```bash
npm run build
```

## Project Structure

```
Enterprise-RBAC-System/
├── public/
│   └── index.html
├── src/
│   ├── rbac/
│   │   ├── api.js                    # API client
│   │   ├── store.js                  # Zustand store
│   │   ├── queryClient.js            # TanStack Query config
│   │   ├── queryProvider.jsx         # Query provider
│   │   ├── hooks.js                  # Custom hooks
│   │   ├── websocket.js              # WebSocket manager
│   │   ├── useWebSocket.js           # WebSocket hook
│   │   ├── WebSocketProvider.jsx     # WebSocket provider
│   │   ├── RoleList.jsx              # Role list component
│   │   ├── RoleDetails.jsx           # Role details with auto-save
│   │   ├── CreateRoleForm.jsx        # Create role form
│   │   ├── PermissionCheckbox.jsx    # Permission checkbox
│   │   ├── CreatePermissionForm.jsx  # Create permission form
│   │   ├── UserRoleManager.jsx       # User role management
│   │   └── AuditLogViewer.jsx        # Audit log viewer
│   ├── pages/
│   │   └── RBACAdmin.jsx             # Main admin page
│   ├── permissions/
│   │   └── PermissionsContext.jsx    # Permissions context
│   ├── utils/
│   │   └── csvExport.js              # CSV export utilities
│   ├── App.jsx                       # App component
│   └── index.js                      # Entry point
├── server/
│   ├── routes/
│   │   └── rbac.js                   # RBAC API routes
│   ├── websocket.js                  # WebSocket server
│   └── index.js                      # Server entry point
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Usage

### Accessing the RBAC Admin Panel

The RBAC admin panel requires the `rbac:manage` permission. For development, this is granted by default.

### Managing Roles

1. Navigate to the **Roles** tab
2. Click **"+ Create Role"** to create a new role
3. Select a role from the list to view/edit permissions
4. Changes are auto-saved after 1 second of inactivity
5. Click the **×** button to delete a role

### Managing Permissions

1. Navigate to the **Permissions** tab
2. Click **"+ Create Permission"**
3. Select a resource and action
4. Preview shows the permission format (e.g., `users:read`)

### Managing User Roles

1. Navigate to the **Users** tab
2. Use the search bar to filter users
3. Check/uncheck roles for each user
4. Changes are saved immediately with optimistic updates

### Viewing Audit Logs

1. Navigate to the **Audit** tab
2. Use filters to narrow down logs:
   - Action type (create, update, delete)
   - Resource type
   - Date range
3. Click **"Export CSV"** to download filtered logs
4. Click **"Clear Client Logs"** to remove local logs

### Real-time Updates

- Connection status is shown in the bottom-right corner
- Changes made by other users appear in real-time
- Auto-reconnection with exponential backoff
- Up to 5 reconnection attempts

## API Endpoints

### Roles
- `GET /api/roles` - Get all roles
- `GET /api/roles/:id` - Get role by ID
- `POST /api/roles` - Create role
- `PUT /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role
- `PUT /api/roles/:id/permissions` - Update role permissions

### Permissions
- `GET /api/permissions` - Get all permissions
- `POST /api/permissions` - Create permission

### Users
- `GET /api/users` - Get all users
- `PUT /api/users/:id/roles` - Update user roles

### Audit Logs
- `GET /api/audit-logs` - Get audit logs (with filters)
- `POST /api/audit-logs` - Create audit log

## WebSocket Events

### Client → Server
- `authenticate` - Authenticate with JWT token

### Server → Client
- `role:created` - Role was created
- `role:updated` - Role was updated
- `role:deleted` - Role was deleted
- `permissions:updated` - Role permissions were updated
- `user:roles:updated` - User roles were updated
- `audit:log` - New audit log entry

## Security

- JWT authentication for API and WebSocket
- Permission-based access control
- CSRF protection on state-changing operations
- Audit logging of all RBAC changes
- Input validation on all forms

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
