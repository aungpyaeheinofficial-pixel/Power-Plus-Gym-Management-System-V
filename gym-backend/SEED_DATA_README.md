# 🌱 Data Seeding Script

This script populates your database with sample data for testing and development.

## 📋 What Gets Seeded

1. **Admin User** - Default admin account (username: `admin`, password: `admin123`)
2. **5 Membership Types** - Walk-in, 1 Month, 3 Months, 6 Months, 1 Year
3. **4 Product Categories** - Beverages, Supplements, Accessories, Equipment
4. **13 Sample Products** - Various products across all categories
5. **7 Sample Members** - Mix of active and inactive members with different membership types
6. **5 Staff Members** - Manager, Trainers, Receptionist, Cleaner with schedules
7. **5 Sample Transactions** - Mix of membership, product, and mixed transactions
8. **8 Check-ins** - Recent check-in records
9. **5 Staff Attendance Records** - Today's attendance
10. **App Settings** - Basic gym information

## 🚀 How to Use

### Option 1: Run on DigitalOcean Droplet

```bash
cd /var/www/html/Power-Plus-Gym-Management-System-V/gym-backend

# Read database credentials from .env
source .env

# Run the seeding script
mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < seed-data.sql
```

Or if password is not in .env:
```bash
mysql -u gym_user -p power_plus_gym < seed-data.sql
# Enter password when prompted: GymPass123!@#
```

### Option 2: Run in MySQL Console

```bash
mysql -u gym_user -p power_plus_gym
```

Then in MySQL:
```sql
source /var/www/html/Power-Plus-Gym-Management-System-V/gym-backend/seed-data.sql;
```

Or copy and paste the entire SQL file content into MySQL console.

### Option 3: Reset and Reseed

If you want to clear existing data and reseed:

1. Edit `seed-data.sql`
2. Uncomment the `TRUNCATE` statements at the top
3. Run the script again

## ✅ Verify Seeding

After running the script, verify the data:

```sql
-- Check counts
SELECT 
  (SELECT COUNT(*) FROM users) as Users,
  (SELECT COUNT(*) FROM membership_types) as MembershipTypes,
  (SELECT COUNT(*) FROM product_categories) as Categories,
  (SELECT COUNT(*) FROM products) as Products,
  (SELECT COUNT(*) FROM members) as Members,
  (SELECT COUNT(*) FROM staff) as Staff,
  (SELECT COUNT(*) FROM transactions) as Transactions,
  (SELECT COUNT(*) FROM check_ins) as CheckIns;
```

Expected results:
- Users: 1
- MembershipTypes: 5
- Categories: 4
- Products: 13
- Members: 7
- Staff: 5
- Transactions: 5
- CheckIns: 8

## 🔐 Security Note

**Important:** Change the admin password after first login!

The default admin credentials are:
- Username: `admin`
- Password: `admin123`

## 📝 Notes

- Dates are calculated relative to current date (using `CURDATE()` and `DATE_SUB`)
- Member codes follow pattern: GM001, GM002, etc.
- Staff codes follow pattern: ST001, ST002, etc.
- Invoice numbers follow pattern: INV-001, INV-002, etc.
- All prices are in MMK (Myanmar Kyat)
- Image fields are set to NULL (you can add images later through the UI)

## 🐛 Troubleshooting

### Error: Foreign key constraint fails
- Make sure you've run the database schema creation first
- Check that all tables exist: `SHOW TABLES;`

### Error: Duplicate entry
- The script uses `INSERT IGNORE` and `ON DUPLICATE KEY UPDATE` to handle duplicates
- If you get duplicate errors, the data might already exist

### Error: Column cannot be null
- Make sure you've run `fix-image-columns.sql` first to change VARCHAR(255) to TEXT

## 🔄 Resetting Data

To completely reset and reseed:

```sql
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE transaction_items;
TRUNCATE TABLE transactions;
TRUNCATE TABLE check_ins;
TRUNCATE TABLE staff_attendance;
TRUNCATE TABLE staff_weekly_schedule;
TRUNCATE TABLE staff_schedules;
TRUNCATE TABLE products;
TRUNCATE TABLE members;
TRUNCATE TABLE staff;
TRUNCATE TABLE product_categories;
TRUNCATE TABLE membership_types;
DELETE FROM users WHERE username != 'admin';
SET FOREIGN_KEY_CHECKS = 1;
```

Then run `seed-data.sql` again.

