# Fix Frontend Not Saving Data

## Problem
Frontend on port 3000 is not saving data to database because it's trying to connect to `localhost:4000` instead of the droplet's API.

## Solution

### On Your Droplet:

```bash
cd /var/www/html/Power-Plus-Gym-Management-System-V

# Create .env file with correct API URL
cat > .env << 'EOF'
VITE_API_URL=http://167.172.90.182:4000/api
EOF

# Rebuild frontend (IMPORTANT: Vite needs rebuild to pick up .env)
npm run build

# Restart frontend if using PM2
pm2 restart gym-frontend || pm2 start serve --name gym-frontend -- -s dist -l 3000
pm2 save
```

### Or use the setup script:

```bash
chmod +x setup-frontend-env.sh
./setup-frontend-env.sh
```

## Why This Happens

Vite (the frontend build tool) embeds environment variables at **build time**, not runtime. So:
1. ✅ Create `.env` file with `VITE_API_URL`
2. ✅ Run `npm run build` to rebuild
3. ✅ The built files will have the correct API URL

## Verify It Works

1. Open browser console (F12)
2. Check Network tab when adding a member
3. Should see request to `http://167.172.90.182:4000/api/members`
4. Check PM2 logs: `pm2 logs gym-api` to see API requests

## Quick Test

```bash
# Test API from droplet
curl http://localhost:4000/api/members

# Should return member list (or empty array [])
```

