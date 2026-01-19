# Enterprise RBAC System - Component Architecture

## Component Hierarchy

```
App.jsx
└── RBACQueryProvider (TanStack Query)
    └── PermissionsProvider
        └── WebSocketProvider
            └── RBACAdmin
                ├── Tab: Roles
                │   ├── RoleList
                │   │   └── CreateRoleForm (modal)
                │   └── RoleDetails
                │       └── PermissionCheckbox (multiple)
                │
                ├── Tab: Users
                │   └── UserRoleManager
                │
                ├── Tab: Permissions
                │   └── CreatePermissionForm (modal)
                │
                └── Tab: Audit
                    └── AuditLogViewer
```

## Data Flow

### State Management
- **Zustand Store** (`store.js`): Global RBAC state
  - Roles, permissions, users
  - Client-side audit logs
  - WebSocket connection status
  - Event handlers for real-time updates

- **TanStack Query** (`hooks.js`): Server state
  - API queries with caching
  - Mutations with optimistic updates
  - Automatic query invalidation
  - Background refetching

### Real-time Updates Flow
1. User performs action (e.g., create role)
2. TanStack Query mutation triggered
3. Optimistic update to UI
4. API call to backend
5. Backend broadcasts WebSocket event (excluding originating user)
6. Other clients receive WebSocket event
7. Event handler updates Zustand store
8. TanStack Query invalidates relevant queries
9. UI re-renders with updated data

### Audit Log Flow
1. Any RBAC operation triggers audit log creation
2. Client-side logs stored in Zustand (last 100)
3. Server-side logs stored in backend
4. AuditLogViewer combines both sources
5. Filters applied on combined dataset
6. Export to CSV downloads filtered results

## Key Features Implementation

### Auto-save (RoleDetails)
- Uses `useCallback` hook with debounce timer
- 1 second delay after last change
- Visual status indicator (Waiting → Saving → Saved)
- Error handling with rollback

### Optimistic Updates (UserRoleManager)
- Immediate UI update on role toggle
- Temporary state stored in component
- Server sync in background
- Rollback on error with user notification

### WebSocket Reconnection
- Exponential backoff strategy
- Max 5 reconnection attempts
- Connection status indicator (bottom-right)
- Auto-resubscribe to events on reconnect

### Permission Grouping
- Permissions grouped by resource type
- Format: `resource:action`
- Collapsible groups in RoleDetails
- Alphabetical sorting within groups

## API Integration

### REST API
- All endpoints use Axios instance
- JWT authentication via interceptor
- Centralized error handling
- Response data extraction

### WebSocket
- Path: `/ws`
- JWT authentication on connect
- Event-based messaging
- Broadcast with user exclusion
- Connection state management

## Security Features

1. **Authentication**
   - JWT tokens in localStorage
   - Auto-attached to all requests
   - WebSocket authentication

2. **Authorization**
   - Permission-based access control
   - `rbac:manage` required for admin panel
   - Access denied page for unauthorized users

3. **Audit Trail**
   - All operations logged
   - Timestamp, user, action, resource tracked
   - Exportable for compliance

4. **Input Validation**
   - Form validation on all inputs
   - Max length constraints
   - Required field checks
   - XSS prevention via React

## Performance Optimizations

1. **Query Caching**
   - 5-minute stale time
   - 10-minute cache time
   - Background refetching

2. **Debouncing**
   - Auto-save: 1 second
   - Search: Real-time (no debounce needed)

3. **Optimistic Updates**
   - Immediate UI feedback
   - Reduced perceived latency

4. **Code Splitting**
   - React.lazy() potential
   - Route-based splitting ready

## Testing Strategy

### Unit Tests
- Component rendering
- Hook behavior
- Utility functions (CSV export)

### Integration Tests
- User workflows
- API integration
- WebSocket events

### E2E Tests
- Complete user journeys
- Multi-user scenarios
- Real-time updates

## Deployment Considerations

### Frontend
- Static build output
- CDN deployable
- Environment variables via `.env`

### Backend
- Stateless design
- Horizontal scaling ready
- WebSocket sticky sessions required
- Replace mock data with database

### Production Checklist
- [ ] Set strong JWT_SECRET
- [ ] Configure CORS properly
- [ ] Set up database
- [ ] Configure WebSocket load balancing
- [ ] Set up monitoring/logging
- [ ] Enable HTTPS/WSS
- [ ] Implement rate limiting
- [ ] Set up backup/restore
