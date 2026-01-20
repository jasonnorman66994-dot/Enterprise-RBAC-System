# Quick Start Guide

## Prerequisites

- Node.js 14+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)

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

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings if needed
   ```

## Running the Application

### Option 1: Full Stack (Recommended)

Run both frontend and backend:

**Terminal 1 - Backend Server:**
```bash
npm run server
```
Output: `Server running on port 3000`

**Terminal 2 - Frontend:**
```bash
npm start
```
Output: `Compiled successfully! Open http://localhost:3001`

Open http://localhost:3001 in your browser.

### Option 2: Frontend Only (Mock Mode)

The frontend will work without the backend, but API calls will fail gracefully:

```bash
npm start
```

## First Steps

### 1. Access the Admin Panel

The RBAC admin panel requires the `rbac:manage` permission. For demo purposes, this is granted by default via localStorage.

### 2. Create Your First Role

1. Click the **Roles** tab (active by default)
2. Click **"+ Create Role"** button
3. Enter:
   - Name: e.g., "Content Manager"
   - Description: e.g., "Manages content creation and editing"
4. Click **"Create Role"**

### 3. Assign Permissions to Role

1. Select the newly created role from the list
2. Check the permissions you want to grant:
   - `users:read` - View users
   - `users:update` - Edit users
   - etc.
3. Changes auto-save after 1 second
4. Look for "✓ Saved" indicator

### 4. Create Custom Permissions

1. Navigate to **Permissions** tab
2. Click **"+ Create Permission"**
3. Select:
   - Resource: e.g., "content"
   - Action: e.g., "publish"
4. Preview shows: `content:publish`
5. Click **"Create Permission"**

### 5. Assign Roles to Users

1. Navigate to **Users** tab
2. Search for a user by email or name
3. Check/uncheck roles for each user
4. Changes save immediately with optimistic updates
5. See "Updating..." indicator while saving

### 6. View Audit Logs

1. Navigate to **Audit** tab
2. Use filters:
   - **Action**: create, update, delete
   - **Resource**: role, permission, user_roles
   - **Date Range**: start and end dates
3. Click **"Export CSV"** to download logs
4. Click **"Clear Client Logs"** to remove local logs

## Understanding the Interface

### Role Management Screen

```
┌─────────────────────────────────────────────────────────────┐
│ Roles Tab                                                    │
├─────────────────┬───────────────────────────────────────────┤
│ Role List       │ Role Details                              │
│                 │                                           │
│ + Create Role   │ Administrator                             │
│                 │ Full system access           ✓ Saved      │
│ ┌─────────────┐ │                                           │
│ │Administrator│ │ PERMISSIONS                               │
│ │Full system  │ │                                           │
│ │12 permissions│ │ Users                                     │
│ └─────────────┘ │ ☑ users:read                              │
│                 │ ☑ users:create                            │
│ Editor          │ ☑ users:update                            │
│ Editor content  │ ☑ users:delete                            │
│ 6 permissions   │                                           │
│                 │ Roles                                      │
│ Viewer          │ ☑ roles:read                              │
│ Read-only       │ ☑ roles:create                            │
│ 4 permissions   │ ...                                        │
└─────────────────┴───────────────────────────────────────────┘
```

### Real-time Features

**Connection Status (bottom-right corner):**
- 🟢 **Connected** - Real-time updates active
- 🔴 **Disconnected** - Attempting to reconnect

**Auto-save Indicator (top-right of Role Details):**
- **Waiting...** - Debouncing changes
- **Saving...** - Sending to server
- **✓ Saved** - Changes persisted
- **✗ Error** - Save failed

## Common Tasks

### Export Audit Logs

1. Go to Audit tab
2. Apply desired filters
3. Click **"Export CSV"**
4. File downloads: `audit-logs-2026-01-19T00-01-56.csv`

### Delete a Role

1. Go to Roles tab
2. Hover over a role in the list
3. Click the **×** button
4. Confirm deletion

### Search Users

1. Go to Users tab
2. Type in the search box
3. Results filter in real-time

### Filter Audit Logs

Use the filter panel:
- **Action**: Select from dropdown
- **Resource**: Select from dropdown
- **Start Date**: Pick date/time
- **End Date**: Pick date/time

Filters combine (AND logic).

## Keyboard Shortcuts

- **Tab**: Navigate between form fields
- **Enter**: Submit forms
- **Escape**: Close modals
- **Space**: Toggle checkboxes

## Tips & Best Practices

1. **Start with Roles**: Define your roles before creating permissions
2. **Use Descriptive Names**: Make roles and permissions self-explanatory
3. **Group by Resource**: Organize permissions by what they control
4. **Test with Sample Users**: Verify permissions work as expected
5. **Export Logs Regularly**: Download audit logs for compliance
6. **Monitor Connection**: Watch the status indicator for connectivity issues

## Troubleshooting

### Issue: Can't access admin panel

**Solution**: Ensure you have the `rbac:manage` permission.

For development, run in browser console:
```javascript
localStorage.setItem('userPermissions', '["rbac:manage"]');
// Refresh page
```

### Issue: WebSocket not connecting

**Possible causes:**
1. Backend server not running - Start with `npm run server`
2. Wrong WebSocket URL - Check `.env` file
3. Firewall blocking - Check network settings

**Check connection:**
```bash
# Test if server is running
curl http://localhost:3000/health
```

### Issue: Changes not saving

**Possible causes:**
1. No internet/server connection
2. Invalid permissions
3. Server error

**Check:**
1. Look at browser console for errors (F12)
2. Verify backend server is running
3. Check network tab for failed requests

### Issue: Build fails

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Development

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
```

Output in `build/` directory.

### Environment Variables

**Frontend (.env):**
```env
REACT_APP_WS_URL=ws://localhost:3000/ws
REACT_APP_API_URL=http://localhost:3000/api
```

**Backend (.env):**
```env
PORT=3000
JWT_SECRET=your-secret-key
NODE_ENV=development
```

## Security Notes

⚠️ **Development Mode**: The demo includes mock data and simplified authentication.

**For Production:**
1. Set a strong `JWT_SECRET`
2. Implement real authentication
3. Add database for persistence
4. Enable HTTPS/WSS
5. Configure CORS properly
6. Add rate limiting
7. Validate all inputs server-side
8. Implement proper session management

## Next Steps

1. **Customize Permissions**: Add permissions specific to your application
2. **Integrate with Backend**: Replace mock API with real backend
3. **Add User Management**: Implement user creation/editing
4. **Set Up Database**: Replace in-memory storage
5. **Deploy**: Follow production checklist in ARCHITECTURE.md

## Support

For issues and questions:
- Check ARCHITECTURE.md for technical details
- Review README.md for overview
- Check browser console for errors
- Verify all dependencies are installed

## Summary

You now have a fully functional RBAC system! The key features are:

✅ Role creation and management
✅ Permission assignment with auto-save
✅ User role assignment
✅ Real-time updates across clients
✅ Comprehensive audit logging
✅ CSV export functionality
✅ Responsive, intuitive UI

Happy managing! 🎉
