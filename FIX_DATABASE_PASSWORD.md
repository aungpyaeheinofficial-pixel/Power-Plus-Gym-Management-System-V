# Fix Database Password Issue

The error "Access denied for user 'root'@'localhost'" means the password in `.env` is incorrect.

## Solution:

### Option 1: Update .env with correct password

1. Test MySQL connection to find correct password:
```bash
mysql -u root -p
# Enter your actual MySQL root password when prompted
```

2. Once you know the correct password, update .env:
```bash
nano .env
```

Change this line:
```
DB_PASSWORD=root123
```

To your actual MySQL root password, for example:
```
DB_PASSWORD=your_actual_password_here
```

Save: `Ctrl+X`, then `Y`, then `Enter`

3. Test connection again:
```bash
npm run test-connection
```

### Option 2: Reset MySQL root password (if you forgot it)

```bash
sudo mysql
```

In MySQL:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root123';
FLUSH PRIVILEGES;
EXIT;
```

Then update .env to match.

### Option 3: Create a new MySQL user (Recommended for production)

```bash
sudo mysql -u root -p
```

In MySQL:
```sql
CREATE USER 'gym_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON power_plus_gym.* TO 'gym_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Then update .env:
```
DB_USER=gym_user
DB_PASSWORD=strong_password_here
```

