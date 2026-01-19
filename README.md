# Enterprise RBAC System

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
