# ⚡ Quick Deploy to DigitalOcean Droplet

## One-Time Setup (Do this once)

### 1. Connect to your droplet:
```bash
ssh root@YOUR_DROPLET_IP
```

### 2. Install required software:
```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# PM2
sudo npm install -g pm2

# Nginx
sudo apt install -y nginx

# MySQL (if not installed)
sudo apt install -y mysql-server
```

### 3. Create directories:
```bash
mkdir -p /var/www/gym-backend
mkdir -p /var/www/gym-frontend
```

### 4. Setup MySQL database:
```bash
sudo mysql -u root -p
```
```sql
CREATE DATABASE power_plus_gym CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Create all tables (use the SQL from earlier)
EXIT;
```

## Deploy Backend

### From your local machine:

```bash
# 1. Build backend
cd gym-backend
npm install
npm run build

# 2. Upload to droplet
scp -r dist package.json root@YOUR_DROPLET_IP:/var/www/gym-backend/
scp .env.example root@YOUR_DROPLET_IP:/var/www/gym-backend/.env

# 3. SSH and setup
ssh root@YOUR_DROPLET_IP
```

### On droplet:

```bash
cd /var/www/gym-backend

# Install production dependencies
npm install --production

# Edit .env file with your MySQL credentials
nano .env

# Start with PM2
pm2 start dist/server.js --name gym-api
pm2 save
pm2 startup  # Follow instructions
```

## Deploy Frontend

### From your local machine:

```bash
# 1. Update API URL in .env
echo "VITE_API_URL=http://YOUR_DROPLET_IP/api" > .env

# 2. Build frontend
npm install
npm run build

# 3. Upload to droplet
scp -r dist root@YOUR_DROPLET_IP:/var/www/gym-frontend/
```

## Configure Nginx

### On droplet:

```bash
# Copy nginx config
sudo cp /path/to/nginx-config.conf /etc/nginx/sites-available/gym-api

# Edit with your IP/domain
sudo nano /etc/nginx/sites-available/gym-api
# Replace YOUR_DOMAIN_OR_IP with your droplet IP

# Enable site
sudo ln -s /etc/nginx/sites-available/gym-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Configure Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## Test

```bash
# Test API
curl http://YOUR_DROPLET_IP/api/health

# Should return:
# {"status":"ok","message":"Power Plus Gym API is running"}
```

## Update Frontend API URL

If deploying frontend separately (not on droplet):

1. Create `.env` file in frontend root:
```
VITE_API_URL=http://YOUR_DROPLET_IP/api
```

2. Rebuild:
```bash
npm run build
```

3. Deploy the `dist` folder to your hosting (Vercel, Netlify, etc.)

## Useful Commands

```bash
# View API logs
pm2 logs gym-api

# Restart API
pm2 restart gym-api

# Check API status
pm2 status

# View Nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

## Troubleshooting

**API not working?**
- Check PM2: `pm2 logs gym-api`
- Check if port 4000 is listening: `sudo netstat -tlnp | grep 4000`
- Check Nginx: `sudo nginx -t`

**Frontend can't connect?**
- Verify API URL in `.env`
- Check browser console for CORS errors
- Test API directly: `curl http://YOUR_DROPLET_IP/api/health`

**Database errors?**
- Check MySQL: `sudo systemctl status mysql`
- Test connection: `mysql -u root -p power_plus_gym`
- Verify credentials in `/var/www/gym-backend/.env`

