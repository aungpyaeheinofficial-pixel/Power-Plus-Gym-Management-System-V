# 🔧 Troubleshoot API Connection Issues

## Error: ERR_CONNECTION_REFUSED

This means the backend API server is not running or not accessible.

## Quick Fix Steps

### 1. Check if Backend is Running

On your droplet:
```bash
cd /var/www/html/Power-Plus-Gym-Management-System-V/gym-backend

# Check PM2 status
pm2 status

# If gym-api is not running, start it:
pm2 start dist/server.js --name gym-api
pm2 save
```

### 2. Verify Server is Listening

```bash
# Check if port 4000 is listening
sudo netstat -tlnp | grep 4000
# or
sudo ss -tlnp | grep 4000
```

### 3. Test Locally on Droplet

```bash
# Test from the server itself
curl http://localhost:4000/api/health
```

If this works, the server is running but not accessible from outside.

### 4. Check Firewall

```bash
# Check firewall status
sudo ufw status

# Allow port 4000 if needed
sudo ufw allow 4000/tcp
sudo ufw reload
```

### 5. Check if Server Started Correctly

```bash
# View PM2 logs
pm2 logs gym-api

# Check for errors
pm2 logs gym-api --err
```

### 6. Rebuild and Restart

```bash
cd /var/www/html/Power-Plus-Gym-Management-System-V/gym-backend

# Rebuild
npm run build

# Stop old process
pm2 delete gym-api

# Start fresh
pm2 start dist/server.js --name gym-api
pm2 save
pm2 logs gym-api
```

### 7. Verify .env File

```bash
cd /var/www/html/Power-Plus-Gym-Management-System-V/gym-backend
cat .env
```

Make sure it has:
```
DB_USER=gym_user
DB_PASSWORD="GymPass123!@#"
DB_NAME=power_plus_gym
```

### 8. Test Database Connection

```bash
npm run test-connection
```

## Common Issues

**Port 4000 not accessible from outside:**
- Check DigitalOcean firewall rules
- Check UFW: `sudo ufw status`
- Allow port: `sudo ufw allow 4000/tcp`

**Server crashes on start:**
- Check logs: `pm2 logs gym-api`
- Verify database connection
- Check .env file exists and is correct

**PM2 not running:**
```bash
pm2 start dist/server.js --name gym-api
pm2 save
pm2 startup  # Enable auto-start
```

## Verify Everything Works

```bash
# 1. Check PM2
pm2 status

# 2. Test locally
curl http://localhost:4000/api/health

# 3. Test from outside (your computer)
curl http://167.172.90.182:4000/api/health
```

