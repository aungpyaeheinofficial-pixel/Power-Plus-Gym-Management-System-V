# Fix API Connection Refused Error

## 🔴 Problem
Getting `ERR_CONNECTION_REFUSED` when accessing `http://167.172.90.182:4000/api`

This means the backend server is **not running** or **not accessible**.

## ✅ Solution: Start the Backend Server

### Step 1: SSH into Your Server

```bash
ssh root@167.172.90.182
```

### Step 2: Check if Server is Running

```bash
# Check PM2 status
pm2 status

# Check if port 4000 is in use
sudo netstat -tlnp | grep 4000
# Or
sudo lsof -i :4000
```

### Step 3: Navigate to Project

```bash
cd /var/www/html/Power-Plus-Gym-Management-System-V
```

### Step 4: Start the Backend Server

**Option A: Using PM2 (Recommended)**

```bash
cd gym-backend

# Build the backend
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

**Option B: Using Ecosystem Config**

```bash
cd /var/www/html/Power-Plus-Gym-Management-System-V
pm2 start ecosystem.config.js
pm2 save
```

**Option C: Using Start Script**

```bash
cd /var/www/html/Power-Plus-Gym-Management-System-V
chmod +x start-backend.sh
./start-backend.sh
```

### Step 5: Verify Server is Running

```bash
# Check PM2
pm2 status

# Test API locally on server
curl http://localhost:4000/api/health

# Check if port is listening
sudo netstat -tlnp | grep 4000
```

### Step 6: Check Firewall (if still not accessible)

```bash
# Check UFW status
sudo ufw status

# Allow port 4000 if needed
sudo ufw allow 4000/tcp

# Check iptables
sudo iptables -L -n | grep 4000
```

### Step 7: Test from Browser

Open: `http://167.172.90.182:4000/api/health`

Should return: `{"status":"ok","message":"Power Plus Gym API is running"}`

## 🐛 Troubleshooting

### Server Won't Start

```bash
cd gym-backend

# Check for errors
npm run build
node dist/server.js

# Check logs
pm2 logs gym-api --lines 50
```

### Port Already in Use

```bash
# Find what's using port 4000
sudo lsof -i :4000

# Kill the process if needed
sudo kill -9 <PID>
```

### Database Connection Error

```bash
# Check database connection
cd gym-backend
npm run test-connection

# Check .env file
cat .env
```

### Server Crashes Immediately

```bash
# Check logs
pm2 logs gym-api --err

# Check for missing dependencies
cd gym-backend
npm install

# Rebuild
npm run build
```

## 🔄 Quick Fix Script

Run this on your server:

```bash
cd /var/www/html/Power-Plus-Gym-Management-System-V
cd gym-backend
npm install
npm run build
pm2 delete gym-api 2>/dev/null || true
pm2 start dist/server.js --name gym-api
pm2 save
pm2 logs gym-api
```

## 📝 Common Issues

1. **Server not started** → Start with PM2
2. **Port blocked by firewall** → Allow port 4000
3. **Server crashed** → Check logs and fix errors
4. **Wrong directory** → Make sure you're in the right folder
5. **Missing dependencies** → Run `npm install`
6. **Build errors** → Check TypeScript compilation

## ✅ Verify Everything Works

```bash
# 1. Check PM2
pm2 status
# Should show "gym-api" as "online"

# 2. Test API on server
curl http://localhost:4000/api/health

# 3. Test from your computer
curl http://167.172.90.182:4000/api/health

# 4. Check frontend can access API
# Open browser: http://167.172.90.182:4000
```

## 🚀 Auto-Start on Reboot

To make sure server starts automatically after reboot:

```bash
pm2 save
pm2 startup
# Follow the command it outputs
```

---

**After following these steps, your API should be accessible at `http://167.172.90.182:4000/api`**

