# Fix Backend Server Crash

## The server is crashing. Check the logs:

```bash
# View error logs
pm2 logs gym-api --err --lines 50

# Or view all logs
pm2 logs gym-api --lines 50
```

## Common Issues and Fixes

### 1. Database Connection Error

If you see database connection errors:

```bash
cd /var/www/html/Power-Plus-Gym-Management-System-V/gym-backend

# Check .env file exists
cat .env

# Test database connection
npm run test-connection
```

### 2. Missing Dependencies

```bash
cd /var/www/html/Power-Plus-Gym-Management-System-V/gym-backend
npm install
npm run build
pm2 restart gym-api
```

### 3. Path Issues (dist folder)

The server might be looking for the dist folder in the wrong place. Check:

```bash
# Check if dist folder exists
ls -la /var/www/html/Power-Plus-Gym-Management-System-V/gym-backend/dist/

# Check if server.js exists
ls -la /var/www/html/Power-Plus-Gym-Management-System-V/gym-backend/dist/server.js
```

### 4. Port Already in Use

```bash
# Check if port 4000 is already in use
sudo lsof -i :4000

# Kill the process if needed
sudo kill -9 <PID>
```

## Quick Diagnostic

Run this to see what's wrong:

```bash
cd /var/www/html/Power-Plus-Gym-Management-System-V/gym-backend

# Check logs
pm2 logs gym-api --err --lines 100

# Try running manually to see error
node dist/server.js
```

This will show you the exact error message.

