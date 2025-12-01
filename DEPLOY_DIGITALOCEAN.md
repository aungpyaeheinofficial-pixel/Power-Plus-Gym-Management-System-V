# 🚀 DigitalOcean Droplet Deployment Guide

## Prerequisites

- DigitalOcean Droplet (Ubuntu 20.04/22.04 recommended)
- SSH access to your droplet
- Domain name (optional, can use IP address)

## Step 1: Initial Server Setup

### Connect to your droplet:
```bash
ssh root@YOUR_DROPLET_IP
```

### Update system:
```bash
sudo apt update && sudo apt upgrade -y
```

### Install Node.js (v18+):
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Should show v18.x or higher
```

### Install MySQL (if not already installed):
```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation
```

### Install PM2 (Process Manager):
```bash
sudo npm install -g pm2
```

### Install Nginx (Reverse Proxy):
```bash
sudo apt install -y nginx
```

## Step 2: Database Setup

### Create database and user:
```bash
sudo mysql -u root -p
```

In MySQL:
```sql
CREATE DATABASE power_plus_gym CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Use root user (as you mentioned)
-- Make sure root password is set: ALTER USER 'root'@'localhost' IDENTIFIED BY 'root123';
FLUSH PRIVILEGES;
EXIT;
```

### Create all tables:
```bash
# Copy your SQL schema file to server, then:
mysql -u root -p power_plus_gym < schema.sql
```

Or manually create tables using the SQL statements we provided earlier.

## Step 3: Deploy Backend Code

### Option A: Using Git (Recommended)
```bash
# On your droplet
cd /var/www
git clone YOUR_REPO_URL gym-backend
cd gym-backend/gym-backend
npm install
```

### Option B: Using SCP (from your local machine)
```bash
# From your local machine
scp -r gym-backend root@YOUR_DROPLET_IP:/var/www/
```

Then on droplet:
```bash
cd /var/www/gym-backend
npm install
```

### Configure database connection:
Edit `gym-backend/db.ts`:
```typescript
export const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'root123',  // Your MySQL root password
  database: 'power_plus_gym',
  waitForConnections: true,
  connectionLimit: 10,
});
```

### Build TypeScript:
```bash
cd /var/www/gym-backend
npm run build
```

## Step 4: Configure Environment Variables

Create `.env` file:
```bash
cd /var/www/gym-backend
nano .env
```

Add:
```
NODE_ENV=production
PORT=4000
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=root123
DB_NAME=power_plus_gym
```

Update `db.ts` to use environment variables:
```typescript
export const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root123',
  database: process.env.DB_NAME || 'power_plus_gym',
  waitForConnections: true,
  connectionLimit: 10,
});
```

## Step 5: Start Backend with PM2

```bash
cd /var/www/gym-backend
pm2 start dist/server.js --name gym-api
pm2 save
pm2 startup  # Follow instructions to enable auto-start on reboot
```

Check status:
```bash
pm2 status
pm2 logs gym-api
```

## Step 6: Configure Nginx Reverse Proxy

Create Nginx config:
```bash
sudo nano /etc/nginx/sites-available/gym-api
```

Add:
```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve frontend static files (if deploying frontend to same server)
    location / {
        root /var/www/gym-frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/gym-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 7: Configure Firewall

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS (if using SSL)
sudo ufw enable
```

**Important**: MySQL port (3306) should NOT be exposed. Only allow localhost access.

## Step 8: Update Frontend API URL

### Option A: Environment Variable
Create `.env` in your frontend root:
```bash
VITE_API_URL=http://YOUR_DROPLET_IP/api
# Or with domain:
VITE_API_URL=http://yourdomain.com/api
```

### Option B: Update api.ts directly
Edit `api.ts`:
```typescript
const API_BASE = import.meta.env.VITE_API_URL || 'http://YOUR_DROPLET_IP/api';
```

Rebuild frontend:
```bash
npm run build
```

## Step 9: Deploy Frontend (Optional - Same Server)

### Build frontend locally:
```bash
npm run build
```

### Upload to droplet:
```bash
scp -r dist root@YOUR_DROPLET_IP:/var/www/gym-frontend/
```

Nginx will serve it automatically (already configured above).

## Step 10: SSL Certificate (Optional but Recommended)

Install Certbot:
```bash
sudo apt install -y certbot python3-certbot-nginx
```

Get SSL certificate:
```bash
sudo certbot --nginx -d yourdomain.com
```

Update Nginx config to redirect HTTP to HTTPS automatically.

## Step 11: Test Everything

### Test API:
```bash
curl http://YOUR_DROPLET_IP/api/health
```

Expected:
```json
{"status":"ok","message":"Power Plus Gym API is running"}
```

### Test from browser:
Visit: `http://YOUR_DROPLET_IP/api/health`

### Test frontend:
Visit: `http://YOUR_DROPLET_IP` (if deployed on same server)

## Monitoring & Maintenance

### View PM2 logs:
```bash
pm2 logs gym-api
```

### Restart API:
```bash
pm2 restart gym-api
```

### View Nginx logs:
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Check MySQL:
```bash
sudo systemctl status mysql
mysql -u root -p power_plus_gym
```

## Troubleshooting

### API not responding:
1. Check PM2: `pm2 status`
2. Check logs: `pm2 logs gym-api`
3. Check port: `sudo netstat -tlnp | grep 4000`
4. Check Nginx: `sudo nginx -t`

### Database connection error:
1. Verify MySQL is running: `sudo systemctl status mysql`
2. Test connection: `mysql -u root -p power_plus_gym`
3. Check credentials in `.env`

### CORS errors:
- Already handled in `server.ts` with `cors()` middleware

### Frontend can't connect:
1. Check API URL in `.env` or `api.ts`
2. Verify backend is running: `pm2 status`
3. Check browser console for errors
4. Test API directly: `curl http://YOUR_DROPLET_IP/api/health`

## Security Checklist

- ✅ MySQL only accessible from localhost
- ✅ Firewall configured (UFW)
- ✅ PM2 running as non-root user (recommended)
- ✅ Nginx reverse proxy configured
- ✅ SSL certificate installed (recommended)
- ✅ Strong database passwords
- ✅ Regular backups

## Quick Commands Reference

```bash
# Backend
pm2 restart gym-api          # Restart API
pm2 logs gym-api             # View logs
pm2 stop gym-api             # Stop API
pm2 start gym-api            # Start API

# Nginx
sudo systemctl restart nginx # Restart Nginx
sudo nginx -t                # Test config

# MySQL
sudo systemctl restart mysql # Restart MySQL
mysql -u root -p             # Connect to MySQL

# Firewall
sudo ufw status              # Check firewall
sudo ufw allow 80/tcp        # Allow port
```

Your app is now deployed on DigitalOcean! 🎉

