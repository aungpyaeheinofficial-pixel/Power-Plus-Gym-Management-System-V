# Start Backend Server Now

## The server is not running. Let's start it:

```bash
cd /var/www/html/Power-Plus-Gym-Management-System-V/gym-backend

# Make sure it's built
npm run build

# Start with PM2
pm2 start dist/server.js --name gym-api

# Save PM2 process list
pm2 save

# Check status
pm2 status

# View logs
pm2 logs gym-api
```

## Quick One-Liner

```bash
cd /var/www/html/Power-Plus-Gym-Management-System-V/gym-backend && npm run build && pm2 start dist/server.js --name gym-api && pm2 save && pm2 logs gym-api
```

## Verify It's Working

```bash
# Test API
curl http://localhost:4000/api/health

# Check PM2
pm2 status

# Check port
sudo netstat -tlnp | grep 4000
```

## If You Get Errors

Check the logs:
```bash
pm2 logs gym-api --err
```

Make sure dependencies are installed:
```bash
cd /var/www/html/Power-Plus-Gym-Management-System-V/gym-backend
npm install
```

