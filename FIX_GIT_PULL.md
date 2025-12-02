# 🔧 Fix Git Pull Conflict

When you get this error:
```
error: Your local changes to the following files would be overwritten by merge:
        package-lock.json
```

## Quick Fix (Recommended)

Run these commands on your droplet:

```bash
cd /var/www/html/Power-Plus-Gym-Management-System-V

# Stash local changes
git stash

# Pull latest changes
git pull origin main

# Rebuild and deploy
npm install
npm run build:frontend
rm -rf /var/www/app3000/*
cp -r dist/* /var/www/app3000/
sudo systemctl reload nginx
```

## Alternative: Reset package-lock.json

If you don't need local changes:

```bash
cd /var/www/html/Power-Plus-Gym-Management-System-V

# Discard local changes to package-lock.json
git checkout -- package-lock.json

# Pull latest changes
git pull origin main

# Rebuild
npm install
npm run build:frontend
rm -rf /var/www/app3000/*
cp -r dist/* /var/www/app3000/
sudo systemctl reload nginx
```

## Using the Script

Or use the provided script:

```bash
chmod +x fix-git-pull.sh
./fix-git-pull.sh
```

## Why This Happens

`package-lock.json` is auto-generated and can have local differences. It's safe to discard or stash these changes - `npm install` will regenerate it correctly.

## After Fixing

Your app should be updated with the latest changes including:
- ✅ Separated membership and product sales in Dashboard
- ✅ Updated Reports page
- ✅ All other recent improvements

