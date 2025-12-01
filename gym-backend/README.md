# Power Plus Gym Backend API

## Setup

1. Install dependencies:
```bash
npm install
```

2. Make sure MySQL is running and database is created:
```bash
mysql -u root -p
CREATE DATABASE power_plus_gym CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. Update database credentials in `db.ts` if needed.

4. Run the server:
```bash
npm run dev
```

The API will be available at `http://localhost:4000/api`

## API Endpoints

### Health Check
- `GET /api/health` - Check if API is running

### Members
- `GET /api/members` - Get all members
- `POST /api/members` - Create member
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Product Categories
- `GET /api/product-categories` - Get all categories
- `POST /api/product-categories` - Create category
- `PUT /api/product-categories/:id` - Update category
- `DELETE /api/product-categories/:id` - Delete category

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction (with items)

### Check-ins
- `GET /api/check-ins` - Get all check-ins
- `POST /api/check-ins` - Create check-in

### Staff
- `GET /api/staff` - Get all staff
- `POST /api/staff` - Create staff
- `PUT /api/staff/:id` - Update staff
- `DELETE /api/staff/:id` - Delete staff

### Staff Attendance
- `GET /api/staff-attendance` - Get attendance records
- `POST /api/staff-attendance/clock-in` - Clock in
- `PUT /api/staff-attendance/clock-out/:id` - Clock out

### Membership Types
- `GET /api/membership-types` - Get all membership types
- `POST /api/membership-types` - Create membership type
- `PUT /api/membership-types/:id` - Update membership type
- `DELETE /api/membership-types/:id` - Delete membership type

### Settings
- `GET /api/settings` - Get app settings
- `PUT /api/settings` - Update app settings

