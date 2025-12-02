-- Create Admin User for Power Plus Gym Management System
-- Run this in MySQL: mysql -u gym_user -p power_plus_gym < create-admin-user.sql
-- Or copy and paste into MySQL console

-- Insert admin user
-- Default username: admin
-- Default password: admin123
-- You should change this password after first login!

INSERT INTO users (username, password_hash, full_name, role, photo_url) 
VALUES ('admin', 'admin123', 'System Administrator', 'Admin', NULL);

-- Verify the user was created
SELECT id, username, full_name, role, created_at FROM users WHERE username = 'admin';

