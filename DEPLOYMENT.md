# Deployment Guide

This guide covers deploying the Enterprise RBAC System in various environments.

## Production Deployment

### Environment Setup

1. **Create a production `.env` file**:
   ```env
   PORT=3000
   JWT_SECRET=<generate-a-strong-random-secret-key>
   JWT_EXPIRATION=24h
   NODE_ENV=production
   ```

   Generate a secure JWT secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Install dependencies**:
   ```bash
   npm ci --production
   ```

3. **Build the application**:
   ```bash
   npm run build
   ```

4. **Start the server**:
   ```bash
   npm start
   ```

### Using PM2 (Recommended for Production)

PM2 is a production process manager for Node.js applications.

1. **Install PM2**:
   ```bash
   npm install -g pm2
   ```

2. **Create PM2 ecosystem file** (`ecosystem.config.js`):
   ```javascript
   module.exports = {
     apps: [{
       name: 'enterprise-rbac',
       script: './dist/index.js',
       instances: 'max',
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       },
       error_file: './logs/err.log',
       out_file: './logs/out.log',
       log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
       merge_logs: true
     }]
   };
   ```

3. **Start with PM2**:
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

4. **Monitor the application**:
   ```bash
   pm2 status
   pm2 logs enterprise-rbac
   pm2 monit
   ```

### Docker Deployment

1. **Create a Dockerfile**:
   ```dockerfile
   FROM node:20-alpine

   WORKDIR /app

   # Copy package files
   COPY package*.json ./

   # Install dependencies
   RUN npm ci --production

   # Copy source code
   COPY . .

   # Build TypeScript
   RUN npm run build

   # Expose port
   EXPOSE 3000

   # Start the server
   CMD ["npm", "start"]
   ```

2. **Create `.dockerignore`**:
   ```
   node_modules
   dist
   .git
   .env
   *.log
   ```

3. **Build and run**:
   ```bash
   docker build -t enterprise-rbac .
   docker run -d -p 3000:3000 --env-file .env --name rbac-server enterprise-rbac
   ```

### Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  rbac-api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRATION=24h
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
```

Run with:
```bash
docker-compose up -d
```

## Nginx Reverse Proxy

For production deployments, use Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## SSL/TLS Configuration

### Using Let's Encrypt with Certbot

1. **Install Certbot**:
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   ```

2. **Obtain certificate**:
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

3. **Auto-renewal**:
   ```bash
   sudo certbot renew --dry-run
   ```

## Monitoring and Logging

### Application Logs

The application logs to stdout/stderr by default. In production:

1. **Using PM2**:
   ```bash
   pm2 logs enterprise-rbac
   pm2 logs --lines 100
   ```

2. **Using Docker**:
   ```bash
   docker logs rbac-server -f
   ```

### Health Checks

The application provides a health endpoint at `/health`:

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-19T00:00:00.000Z"
}
```

## Scaling

### Horizontal Scaling

For high availability, run multiple instances:

1. **With PM2 Cluster Mode**:
   ```javascript
   // ecosystem.config.js
   instances: 'max',  // or specify a number
   exec_mode: 'cluster'
   ```

2. **With Load Balancer**:
   - Use Nginx, HAProxy, or cloud load balancers
   - Configure session affinity for WebSocket connections

### Session Management

For distributed deployments, consider:
- Redis for session storage
- Sticky sessions for WebSocket connections
- Database-backed session storage

## Security Best Practices

1. **Environment Variables**:
   - Never commit `.env` files
   - Use environment-specific configurations
   - Rotate JWT secrets regularly

2. **HTTPS Only**:
   - Always use SSL/TLS in production
   - Redirect HTTP to HTTPS

3. **Rate Limiting**:
   ```javascript
   const rateLimit = require('express-rate-limit');
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   
   app.use('/api/', limiter);
   ```

4. **Helmet.js** for security headers:
   ```bash
   npm install helmet
   ```
   ```javascript
   const helmet = require('helmet');
   app.use(helmet());
   ```

5. **CORS Configuration**:
   ```javascript
   app.use((req, res, next) => {
     res.header('Access-Control-Allow-Origin', 'https://your-domain.com');
     // ... other headers
   });
   ```

## Database Migration (Future)

For production use with persistent storage:

1. Consider migrating from in-memory storage to:
   - PostgreSQL for relational data
   - MongoDB for flexible schemas
   - Redis for sessions and cache

2. Implement data persistence layer
3. Add database migrations
4. Backup and recovery procedures

## Backup and Recovery

1. **Export data** (add endpoint):
   ```javascript
   GET /api/admin/export
   ```

2. **Import data** (add endpoint):
   ```javascript
   POST /api/admin/import
   ```

3. **Regular backups**:
   - Schedule automated backups
   - Test recovery procedures
   - Store backups securely

## Performance Optimization

1. **Enable compression**:
   ```bash
   npm install compression
   ```
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

2. **Response caching**:
   - Cache frequently accessed data
   - Use Redis for distributed caching

3. **Database indexing**:
   - Index frequently queried fields
   - Optimize query patterns

## Troubleshooting

### Common Issues

1. **Port already in use**:
   ```bash
   lsof -i :3000
   kill -9 <PID>
   ```

2. **WebSocket connection fails**:
   - Check firewall settings
   - Verify proxy configuration
   - Enable WebSocket in reverse proxy

3. **High memory usage**:
   - Implement data cleanup
   - Add pagination to large responses
   - Monitor with `pm2 monit`

### Support

For issues and questions:
- Check the main README.md
- Review API documentation
- Check server logs for error details
