const express = require('express');
const http = require('http');
const cors = require('cors');
require('dotenv').config();

const WebSocketServer = require('./websocket');
const rbacRoutes = require('./routes/rbac');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Initialize WebSocket server
const wsServer = new WebSocketServer(server);
app.wsServer = wsServer;

// Routes
app.use('/api', rbacRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server available at ws://localhost:${PORT}/ws`);
});
