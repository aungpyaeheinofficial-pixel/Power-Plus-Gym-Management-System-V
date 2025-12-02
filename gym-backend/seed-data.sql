-- ============================================
-- Power Plus Gym - Data Seeding Script
-- ============================================
-- This script populates the database with sample data for testing
-- Run this after creating the database schema
-- ============================================

-- Clear existing data (optional - uncomment if you want to reset)
-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE transaction_items;
-- TRUNCATE TABLE transactions;
-- TRUNCATE TABLE check_ins;
-- TRUNCATE TABLE staff_attendance;
-- TRUNCATE TABLE staff_weekly_schedule;
-- TRUNCATE TABLE staff_schedules;
-- TRUNCATE TABLE products;
-- TRUNCATE TABLE members;
-- TRUNCATE TABLE staff;
-- TRUNCATE TABLE product_categories;
-- TRUNCATE TABLE membership_types;
-- DELETE FROM users WHERE username != 'admin';
-- SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 1. USERS (Admin User - if not exists)
-- ============================================
INSERT IGNORE INTO users (username, password_hash, full_name, role, photo_url)
VALUES ('admin', 'admin123', 'System Administrator', 'Admin', NULL);

-- ============================================
-- 2. MEMBERSHIP TYPES
-- ============================================
INSERT INTO membership_types (name_en, name_mm, duration_days, price, description, color_code, is_active)
VALUES
  ('Walk-in', 'တစ်ရက်', 1, 3000, 'Single day access', '#9ca3af', 1),
  ('1 Month', '၁ လ', 30, 30000, 'Monthly membership', '#FFD700', 1),
  ('3 Months', '၃ လ', 90, 80000, 'Quarterly membership', '#3b82f6', 1),
  ('6 Months', '၆ လ', 180, 150000, 'Half-yearly membership', '#22c55e', 1),
  ('1 Year', '၁ နှစ်', 365, 250000, 'Annual membership', '#ec4899', 1)
ON DUPLICATE KEY UPDATE name_en = VALUES(name_en);

-- ============================================
-- 3. PRODUCT CATEGORIES
-- ============================================
INSERT INTO product_categories (name_en, name_mm, icon)
VALUES
  ('Beverages', 'အချိုရည်', '🥤'),
  ('Supplements', 'အာဟာရဖြည့်စွက်စာ', '💊'),
  ('Accessories', 'ဆက်စပ်ပစ္စည်း', '🎒'),
  ('Equipment', 'အားကစားကိရိယာ', '🏋️')
ON DUPLICATE KEY UPDATE name_en = VALUES(name_en);

-- ============================================
-- 4. PRODUCTS
-- ============================================
-- Get category IDs (assuming they're inserted in order: 1, 2, 3, 4)
INSERT INTO products (name_en, name_mm, category_id, sku, price, cost_price, stock, low_stock_threshold, unit, image, is_active)
VALUES
  -- Beverages (category_id = 1)
  ('Mineral Water', 'ရေသန့်', 1, 'BEV-001', 500, 300, 100, 20, 'Bottle', NULL, 1),
  ('Energy Drink', 'အားဖြည့်အချိုရည်', 1, 'BEV-002', 1500, 1000, 50, 10, 'Can', NULL, 1),
  ('Sports Drink', 'အားကစားအချိုရည်', 1, 'BEV-003', 2000, 1200, 30, 10, 'Bottle', NULL, 1),
  
  -- Supplements (category_id = 2)
  ('Whey Protein', 'ဝေပရိုတိန်း', 2, 'SUP-001', 85000, 70000, 15, 5, 'Bottle', NULL, 1),
  ('Creatine', 'ကရီယာတင်း', 2, 'SUP-002', 45000, 35000, 20, 5, 'Bottle', NULL, 1),
  ('BCAA', 'ဘီစီအေအေ', 2, 'SUP-003', 60000, 45000, 12, 5, 'Bottle', NULL, 1),
  ('Pre-Workout', 'အားကစားမတိုင်မီ', 2, 'SUP-004', 55000, 40000, 8, 5, 'Bottle', NULL, 1),
  
  -- Accessories (category_id = 3)
  ('Gym Gloves', 'လက်အိတ်', 3, 'ACC-001', 12000, 8000, 25, 5, 'Pair', NULL, 1),
  ('Gym Towel', 'အားကစားပုဝါ', 3, 'ACC-002', 5000, 3000, 40, 10, 'Piece', NULL, 1),
  ('Water Bottle', 'ရေပုလင်း', 3, 'ACC-003', 8000, 5000, 30, 10, 'Piece', NULL, 1),
  ('Gym Bag', 'အားကစားအိတ်', 3, 'ACC-004', 25000, 15000, 15, 5, 'Piece', NULL, 1),
  
  -- Equipment (category_id = 4)
  ('Dumbbells Set', 'ဒမ်ဘယ်လ်တွဲ', 4, 'EQP-001', 150000, 100000, 5, 2, 'Set', NULL, 1),
  ('Resistance Bands', 'ခုခံမှုတန်း', 4, 'EQP-002', 20000, 12000, 10, 3, 'Set', NULL, 1),
  ('Yoga Mat', 'ယောဂဖျာ', 4, 'EQP-003', 15000, 8000, 20, 5, 'Piece', NULL, 1)
ON DUPLICATE KEY UPDATE name_en = VALUES(name_en);

-- ============================================
-- 5. MEMBERS
-- ============================================
INSERT INTO members (
  member_code, full_name_en, full_name_mm, phone, email, gender, 
  membership_type_id, start_date, end_date, status, join_date, 
  photo_url, address, emergency_name, emergency_phone, nrc, dob, notes
)
VALUES
  ('GM001', 'John Doe', 'ဂျွန်ဒိုး', '09-123456789', 'john.doe@example.com', 'Male', 2, 
   DATE_SUB(CURDATE(), INTERVAL 15 DAY), DATE_ADD(CURDATE(), INTERVAL 15 DAY), 'Active', 
   DATE_SUB(CURDATE(), INTERVAL 15 DAY), NULL, 'Yangon, Myanmar', 'Jane Doe', '09-111111111', '12/ABC123456', 
   '1990-05-15', 'Regular member'),
   
  ('GM002', 'Thida Aye', 'သီတာအေး', '09-987654321', 'thida.aye@example.com', 'Female', 3, 
   DATE_SUB(CURDATE(), INTERVAL 60 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'Active', 
   DATE_SUB(CURDATE(), INTERVAL 60 DAY), NULL, 'Mandalay, Myanmar', 'Aung Aye', '09-222222222', '13/DEF789012', 
   '1995-08-20', NULL),
   
  ('GM003', 'Min Ko', 'မင်းကို', '09-555555555', NULL, 'Male', 4, 
   DATE_SUB(CURDATE(), INTERVAL 90 DAY), DATE_ADD(CURDATE(), INTERVAL 90 DAY), 'Active', 
   DATE_SUB(CURDATE(), INTERVAL 90 DAY), NULL, 'Naypyidaw, Myanmar', 'Ma Ma', '09-333333333', '14/GHI345678', 
   '1988-12-10', 'VIP member'),
   
  ('GM004', 'Su Su', 'စုစု', '09-444444444', 'susu@example.com', 'Female', 2, 
   DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_ADD(CURDATE(), INTERVAL 25 DAY), 'Active', 
   DATE_SUB(CURDATE(), INTERVAL 5 DAY), NULL, 'Bago, Myanmar', 'Ko Ko', '09-444444445', '15/JKL901234', 
   '1992-03-25', NULL),
   
  ('GM005', 'Aung Hla', 'အောင်လှ', '09-666666666', NULL, 'Male', 1, 
   CURDATE(), CURDATE(), 'Active', CURDATE(), NULL, 'Mawlamyine, Myanmar', NULL, NULL, NULL, 
   '1997-07-30', 'Walk-in customer'),
   
  ('GM006', 'Hla Hla', 'လှလှ', '09-777777777', 'hlahla@example.com', 'Female', 5, 
   DATE_SUB(CURDATE(), INTERVAL 180 DAY), DATE_ADD(CURDATE(), INTERVAL 185 DAY), 'Active', 
   DATE_SUB(CURDATE(), INTERVAL 180 DAY), NULL, 'Taunggyi, Myanmar', 'U Myint', '09-777777778', '16/MNO567890', 
   '1993-11-05', 'Annual member'),
   
  ('GM007', 'Ko Zaw', 'ကိုဇော်', '09-888888888', NULL, 'Male', 2, 
   DATE_SUB(CURDATE(), INTERVAL 35 DAY), DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'Inactive', 
   DATE_SUB(CURDATE(), INTERVAL 35 DAY), NULL, 'Pathein, Myanmar', 'Daw Hla', '09-888888889', '17/PQR123456', 
   '1985-09-15', 'Membership expired');

-- ============================================
-- 6. STAFF
-- ============================================
INSERT INTO staff (staff_code, name, role, phone, email, join_date, salary, photo_url, status)
VALUES
  ('ST001', 'U Myint Aung', 'Manager', '09-111111111', 'manager@gym.com', DATE_SUB(CURDATE(), INTERVAL 365 DAY), 500000, NULL, 'Active'),
  ('ST002', 'Daw Khin Khin', 'Trainer', '09-222222222', 'trainer1@gym.com', DATE_SUB(CURDATE(), INTERVAL 180 DAY), 300000, NULL, 'Active'),
  ('ST003', 'Ko Thant', 'Trainer', '09-333333333', 'trainer2@gym.com', DATE_SUB(CURDATE(), INTERVAL 120 DAY), 300000, NULL, 'Active'),
  ('ST004', 'Ma Nilar', 'Receptionist', '09-444444444', 'reception@gym.com', DATE_SUB(CURDATE(), INTERVAL 90 DAY), 200000, NULL, 'Active'),
  ('ST005', 'Ko Win', 'Cleaner', '09-555555555', NULL, DATE_SUB(CURDATE(), INTERVAL 60 DAY), 150000, NULL, 'Active');

-- Insert weekly schedules for staff (Monday to Sunday)
-- ST001 - Manager (Full time: Mon-Fri 9AM-6PM)
INSERT INTO staff_weekly_schedule (staff_id, weekday, working, start, end, shift)
SELECT 1, 'monday', 1, '09:00', '18:00', 'Day'
UNION ALL SELECT 1, 'tuesday', 1, '09:00', '18:00', 'Day'
UNION ALL SELECT 1, 'wednesday', 1, '09:00', '18:00', 'Day'
UNION ALL SELECT 1, 'thursday', 1, '09:00', '18:00', 'Day'
UNION ALL SELECT 1, 'friday', 1, '09:00', '18:00', 'Day'
UNION ALL SELECT 1, 'saturday', 0, '', '', 'Off'
UNION ALL SELECT 1, 'sunday', 0, '', '', 'Off';

-- ST002 - Trainer (Mon-Sat 6AM-2PM)
INSERT INTO staff_weekly_schedule (staff_id, weekday, working, start, end, shift)
SELECT 2, 'monday', 1, '06:00', '14:00', 'Morning'
UNION ALL SELECT 2, 'tuesday', 1, '06:00', '14:00', 'Morning'
UNION ALL SELECT 2, 'wednesday', 1, '06:00', '14:00', 'Morning'
UNION ALL SELECT 2, 'thursday', 1, '06:00', '14:00', 'Morning'
UNION ALL SELECT 2, 'friday', 1, '06:00', '14:00', 'Morning'
UNION ALL SELECT 2, 'saturday', 1, '06:00', '14:00', 'Morning'
UNION ALL SELECT 2, 'sunday', 0, '', '', 'Off';

-- ST003 - Trainer (Tue-Sun 2PM-10PM)
INSERT INTO staff_weekly_schedule (staff_id, weekday, working, start, end, shift)
SELECT 3, 'monday', 0, '', '', 'Off'
UNION ALL SELECT 3, 'tuesday', 1, '14:00', '22:00', 'Evening'
UNION ALL SELECT 3, 'wednesday', 1, '14:00', '22:00', 'Evening'
UNION ALL SELECT 3, 'thursday', 1, '14:00', '22:00', 'Evening'
UNION ALL SELECT 3, 'friday', 1, '14:00', '22:00', 'Evening'
UNION ALL SELECT 3, 'saturday', 1, '14:00', '22:00', 'Evening'
UNION ALL SELECT 3, 'sunday', 1, '14:00', '22:00', 'Evening';

-- ST004 - Receptionist (Mon-Sat 8AM-5PM)
INSERT INTO staff_weekly_schedule (staff_id, weekday, working, start, end, shift)
SELECT 4, 'monday', 1, '08:00', '17:00', 'Day'
UNION ALL SELECT 4, 'tuesday', 1, '08:00', '17:00', 'Day'
UNION ALL SELECT 4, 'wednesday', 1, '08:00', '17:00', 'Day'
UNION ALL SELECT 4, 'thursday', 1, '08:00', '17:00', 'Day'
UNION ALL SELECT 4, 'friday', 1, '08:00', '17:00', 'Day'
UNION ALL SELECT 4, 'saturday', 1, '08:00', '17:00', 'Day'
UNION ALL SELECT 4, 'sunday', 0, '', '', 'Off';

-- ST005 - Cleaner (Daily 5AM-1PM)
INSERT INTO staff_weekly_schedule (staff_id, weekday, working, start, end, shift)
SELECT 5, 'monday', 1, '05:00', '13:00', 'Morning'
UNION ALL SELECT 5, 'tuesday', 1, '05:00', '13:00', 'Morning'
UNION ALL SELECT 5, 'wednesday', 1, '05:00', '13:00', 'Morning'
UNION ALL SELECT 5, 'thursday', 1, '05:00', '13:00', 'Morning'
UNION ALL SELECT 5, 'friday', 1, '05:00', '13:00', 'Morning'
UNION ALL SELECT 5, 'saturday', 1, '05:00', '13:00', 'Morning'
UNION ALL SELECT 5, 'sunday', 1, '05:00', '13:00', 'Morning';

-- ============================================
-- 7. TRANSACTIONS
-- ============================================
-- Get user ID (admin user)
SET @admin_user_id = (SELECT id FROM users WHERE username = 'admin' LIMIT 1);

-- Transaction 1: Membership sale
INSERT INTO transactions (invoice_number, member_id, member_name, type, subtotal, discount, total, payment_method, date, processed_by)
VALUES ('INV-001', 1, 'John Doe', 'Membership', 30000, 0, 30000, 'Cash', DATE_SUB(CURDATE(), INTERVAL 15 DAY), @admin_user_id);

INSERT INTO transaction_items (transaction_id, item_type, membership_type_id, product_id, name, quantity, price)
VALUES (LAST_INSERT_ID(), 'Membership', 2, NULL, '1 Month Membership', 1, 30000);

-- Transaction 2: Product sale
INSERT INTO transactions (invoice_number, member_id, member_name, type, subtotal, discount, total, payment_method, date, processed_by)
VALUES ('INV-002', 2, 'Thida Aye', 'Product', 100000, 5000, 95000, 'KBZPay', DATE_SUB(CURDATE(), INTERVAL 10 DAY), @admin_user_id);

INSERT INTO transaction_items (transaction_id, item_type, membership_type_id, product_id, name, quantity, price)
VALUES 
  (LAST_INSERT_ID(), 'Product', NULL, 4, 'Whey Protein', 1, 85000),
  (LAST_INSERT_ID(), 'Product', NULL, 1, 'Mineral Water', 30, 15000);

-- Transaction 3: Mixed sale
INSERT INTO transactions (invoice_number, member_id, member_name, type, subtotal, discount, total, payment_method, date, processed_by)
VALUES ('INV-003', 3, 'Min Ko', 'Mixed', 150000, 10000, 140000, 'WavePay', DATE_SUB(CURDATE(), INTERVAL 5 DAY), @admin_user_id);

INSERT INTO transaction_items (transaction_id, item_type, membership_type_id, product_id, name, quantity, price)
VALUES 
  (LAST_INSERT_ID(), 'Membership', 4, NULL, '6 Months Membership', 1, 150000);

-- Transaction 4: Product sale (no member)
INSERT INTO transactions (invoice_number, member_id, member_name, type, subtotal, discount, total, payment_method, date, processed_by)
VALUES ('INV-004', NULL, 'Walk-in Customer', 'Product', 2000, 0, 2000, 'Cash', DATE_SUB(CURDATE(), INTERVAL 3 DAY), @admin_user_id);

INSERT INTO transaction_items (transaction_id, item_type, membership_type_id, product_id, name, quantity, price)
VALUES (LAST_INSERT_ID(), 'Product', NULL, 2, 'Energy Drink', 1, 1500),
       (LAST_INSERT_ID(), 'Product', NULL, 1, 'Mineral Water', 1, 500);

-- Transaction 5: Recent membership
INSERT INTO transactions (invoice_number, member_id, member_name, type, subtotal, discount, total, payment_method, date, processed_by)
VALUES ('INV-005', 4, 'Su Su', 'Membership', 30000, 0, 30000, 'Cash', DATE_SUB(CURDATE(), INTERVAL 5 DAY), @admin_user_id);

INSERT INTO transaction_items (transaction_id, item_type, membership_type_id, product_id, name, quantity, price)
VALUES (LAST_INSERT_ID(), 'Membership', 2, NULL, '1 Month Membership', 1, 30000);

-- ============================================
-- 8. CHECK-INS
-- ============================================
INSERT INTO check_ins (member_id, check_in_time, check_out_time, method)
VALUES
  (1, DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR), 'QR Code'),
  (2, DATE_SUB(NOW(), INTERVAL 3 HOUR), NULL, 'Manual'),
  (3, DATE_SUB(NOW(), INTERVAL 5 HOUR), DATE_SUB(NOW(), INTERVAL 3 HOUR), 'QR Code'),
  (4, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 2 HOUR, 'QR Code'),
  (1, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 1 HOUR, 'Manual'),
  (2, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 3 HOUR, 'QR Code'),
  (3, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 2 HOUR, 'QR Code'),
  (6, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 1 HOUR, 'QR Code');

-- ============================================
-- 9. STAFF ATTENDANCE (Sample for today)
-- ============================================
INSERT INTO staff_attendance (staff_id, date, clock_in, clock_out, status)
VALUES
  (1, CURDATE(), DATE_FORMAT(NOW(), '%Y-%m-%d 09:00:00'), NULL, 'Present'),
  (2, CURDATE(), DATE_FORMAT(NOW(), '%Y-%m-%d 06:00:00'), DATE_FORMAT(NOW(), '%Y-%m-%d 14:00:00'), 'Present'),
  (3, CURDATE(), DATE_FORMAT(NOW(), '%Y-%m-%d 14:00:00'), NULL, 'Present'),
  (4, CURDATE(), DATE_FORMAT(NOW(), '%Y-%m-%d 08:00:00'), NULL, 'Present'),
  (5, CURDATE(), DATE_FORMAT(NOW(), '%Y-%m-%d 05:00:00'), DATE_FORMAT(NOW(), '%Y-%m-%d 13:00:00'), 'Present');

-- ============================================
-- 10. APP SETTINGS (Optional)
-- ============================================
INSERT INTO app_settings (setting_key, setting_value, description)
VALUES
  ('gym_name', 'Power Plus Gym', 'Gym name'),
  ('gym_address', 'Yangon, Myanmar', 'Gym address'),
  ('gym_phone', '09-123456789', 'Gym phone number'),
  ('gym_email', 'info@powerplusgym.com', 'Gym email'),
  ('currency', 'MMK', 'Currency code'),
  ('tax_rate', '0', 'Tax rate percentage')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- ============================================
-- Summary
-- ============================================
SELECT 
  'Seeding Complete!' as Status,
  (SELECT COUNT(*) FROM users) as Users,
  (SELECT COUNT(*) FROM membership_types) as MembershipTypes,
  (SELECT COUNT(*) FROM product_categories) as Categories,
  (SELECT COUNT(*) FROM products) as Products,
  (SELECT COUNT(*) FROM members) as Members,
  (SELECT COUNT(*) FROM staff) as Staff,
  (SELECT COUNT(*) FROM transactions) as Transactions,
  (SELECT COUNT(*) FROM check_ins) as CheckIns;

