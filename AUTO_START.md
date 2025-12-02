# 🚀 Auto-Start Frontend & Backend

## Quick Start on Droplet

### Option 1: Using PM2 (Recommended for Production)

```bash
cd /var/www/html/Power-Plus-Gym-Management-System-V

# Make script executable
chmod +x start-services.sh

# Run startup script
./start-services.sh
```

### Option 2: Manual PM2 Setup

```bash
cd /var/www/html/Power-Plus-Gym-Management-System-V

# Build both
npm run build

# Start backend
cd gym-backend
pm2 start dist/server.js --name gym-api
pm2 save

# Enable PM2 to start on boot
pm2 startup
# Follow the instructions it gives you

cd ..
```

### Option 3: Using Ecosystem Config

```bash
cd /var/www/html/Power-Plus-Gym-Management-System-V

# Build both
npm run build

# Start with ecosystem config
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Development Mode (Local)

On your local machine, run both simultaneously:

```bash
npm install
npm run dev
```

This will start:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

## PM2 Commands

```bash
pm2 status              # Check running services
pm2 logs gym-api       # View backend logs
pm2 logs               # View all logs
pm2 restart gym-api    # Restart backend
pm2 restart all        # Restart all
pm2 stop gym-api       # Stop backend
pm2 stop all           # Stop all
pm2 delete gym-api     # Remove from PM2
pm2 save               # Save current process list
```

## Auto-Start on Server Reboot

After starting with PM2:

```bash
pm2 save
pm2 startup
```

Follow the command it outputs (usually something like):
```bash
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root
```

## Verify Services

```bash
# Check PM2
pm2 status

# Test API
curl http://localhost:4000/api/health

# Check if ports are listening
sudo netstat -tlnp | grep -E '4000|3000'
```

## Troubleshooting

**Backend not starting?**
```bash
cd gym-backend
npm run build
pm2 logs gym-api
```

**Frontend not loading?**
- Make sure you built it: `npm run build`
- Check Nginx is serving the `dist/` folder
- Verify `.env` has correct `VITE_API_URL`

**Port already in use?**
```bash
sudo lsof -i :4000
sudo kill -9 <PID>
```

