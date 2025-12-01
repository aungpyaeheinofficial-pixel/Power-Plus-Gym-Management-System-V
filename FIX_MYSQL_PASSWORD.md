# Fix MySQL Password Policy Issue

MySQL 8.0 requires strong passwords. Here are solutions:

## Solution 1: Use Strong Password (Recommended)

```bash
sudo mysql
```

In MySQL:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'Root123!@#StrongPass';
FLUSH PRIVILEGES;
EXIT;
```

Then update `.env`:
```bash
nano .env
```

Change to:
```
DB_PASSWORD=Root123!@#StrongPass
```

## Solution 2: Check Current Root Password

Since you can connect with `sudo mysql` (no password), MySQL root might be using auth_socket plugin.

Check:
```bash
sudo mysql -e "SELECT user,authentication_string,plugin,host FROM mysql.user WHERE user='root';"
```

## Solution 3: Create New User (Best Practice)

```bash
sudo mysql
```

In MySQL:
```sql
CREATE USER 'gym_user'@'localhost' IDENTIFIED BY 'GymPass123!@#';
GRANT ALL PRIVILEGES ON power_plus_gym.* TO 'gym_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Update `.env`:
```
DB_USER=gym_user
DB_PASSWORD=GymPass123!@#
```

## Solution 4: Use auth_socket (if root uses it)

If root uses auth_socket, create a new user or change root to use password:

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Root123!@#StrongPass';
FLUSH PRIVILEGES;
```

