# 🧪 Test Database Connection on DigitalOcean Droplet

## Step 1: Check MySQL Status

```bash
sudo systemctl status mysql
```

If not running:
```bash
sudo systemctl start mysql
sudo systemctl enable mysql
```

## Step 2: Verify Database Exists

```bash
mysql -u root -p
```

In MySQL:
```sql
SHOW DATABASES;
USE power_plus_gym;
SHOW TABLES;
EXIT;
```

## Step 3: Install Dependencies

```bash
cd /var/www/html/Power-Plus-Gym-Management-System-V/gym-backend
npm install
```

## Step 4: Create .env File

```bash
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

Save: `Ctrl+X`, then `Y`, then `Enter`

## Step 5: Test Database Connection

```bash
npm run test-connection
```

Expected output:
```
✅ Database connection successful!
📊 Found X tables:
  - users
  - membership_types
  - product_categories
  - members
  - products
  - check_ins
  - transactions
  - transaction_items
  - staff
  - staff_weekly_schedule
  - staff_schedules
  - staff_attendance
  - app_settings
```

## Step 6: Build TypeScript

```bash
npm run build
```

## Step 7: Test API Server

```bash
npm run dev
```

In another terminal, test:
```bash
curl http://localhost:4000/api/health
```

Expected:
```json
{"status":"ok","message":"Power Plus Gym API is running"}
```

## Step 8: Start with PM2 (Production)

```bash
pm2 start dist/server.js --name gym-api
pm2 logs gym-api
```

Test again:
```bash
curl http://localhost:4000/api/health
```

