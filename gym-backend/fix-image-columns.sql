-- Fix image columns to support large base64 images
-- Change VARCHAR(255) to TEXT to allow full base64 data URIs

-- Products table
ALTER TABLE products MODIFY COLUMN image TEXT;

-- Members table (photo_url)
ALTER TABLE members MODIFY COLUMN photo_url TEXT;

-- Staff table (photo_url)
ALTER TABLE staff MODIFY COLUMN photo_url TEXT;

-- Users table (photo_url)
ALTER TABLE users MODIFY COLUMN photo_url TEXT;

-- Product categories (icon)
ALTER TABLE product_categories MODIFY COLUMN icon TEXT;

