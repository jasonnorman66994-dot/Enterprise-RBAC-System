import React from 'react';
import { RBACQueryProvider } from './rbac/queryProvider';
import { PermissionsProvider } from './permissions/PermissionsContext';
import { WebSocketProvider } from './rbac/WebSocketProvider';
import { RBACAdmin } from './pages/RBACAdmin';

function App() {
  return (
    <RBACQueryProvider>
      <PermissionsProvider>
        <WebSocketProvider>
          <RBACAdmin />
        </WebSocketProvider>
      </PermissionsProvider>
    </RBACQueryProvider>
  );
}

export default App;
