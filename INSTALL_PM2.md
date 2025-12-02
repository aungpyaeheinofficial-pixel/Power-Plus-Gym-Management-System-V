# Install PM2 on DigitalOcean Droplet

## Quick Install

```bash
sudo npm install -g pm2
```

## Verify Installation

```bash
pm2 --version
```

## After Installing PM2

Run the startup script:
```bash
cd /var/www/html/Power-Plus-Gym-Management-System-V
./start-backend.sh
```

## Alternative: Start Backend Without PM2 (Temporary)

If you just want to test quickly:

```bash
cd /var/www/html/Power-Plus-Gym-Management-System-V/gym-backend
npm run build
node dist/server.js
```

This will run in the foreground. Press `Ctrl+C` to stop.

## Enable PM2 Auto-Start

After installing PM2 and starting your app:

```bash
pm2 save
pm2 startup
```

Follow the command it outputs (usually something like):
```bash
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root
```

