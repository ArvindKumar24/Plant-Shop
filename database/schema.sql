-- ============================================
-- E-commerce Plant Website - Database Schema
-- PostgreSQL (Supabase)
--
-- Run this in the Supabase Dashboard:
--   SQL Editor -> New query -> paste -> Run
-- ============================================

-- Drop tables in reverse dependency order (for clean re-runs)
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS admin_users;
DROP TABLE IF EXISTS users;

-- ============================================
-- Users table (customer accounts)
-- ============================================
CREATE TABLE users (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  phone         VARCHAR(30),
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- Products table
-- ============================================
CREATE TABLE products (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  category    TEXT NOT NULL CHECK (category IN ('indoor', 'outdoor')),
  plant_type  VARCHAR(100) NOT NULL DEFAULT 'general',
  price       NUMERIC(10,2) NOT NULL,
  description TEXT,
  image_url   VARCHAR(500),
  stock       INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- Orders table
-- ============================================
CREATE TABLE orders (
  id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id        BIGINT REFERENCES users(id),
  customer_name  VARCHAR(150) NOT NULL,
  customer_phone VARCHAR(30),
  customer_email VARCHAR(150),
  address        TEXT,
  total_amount   NUMERIC(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'upi', 'card')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  order_status   TEXT NOT NULL DEFAULT 'pending'
                 CHECK (order_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  order_date     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- Order items table (one order -> many items)
-- ============================================
CREATE TABLE order_items (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id   BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id),
  quantity   INT NOT NULL,
  price      NUMERIC(10,2) NOT NULL
);

-- ============================================
-- Admin users table
-- ============================================
CREATE TABLE admin_users (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username      VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL
);

-- ============================================
-- Seed data
-- ============================================

-- Default admin: username = admin, password = admin123
-- (This is a SHA-256 hash of "admin123")
INSERT INTO admin_users (username, password_hash) VALUES
('admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9');

-- Sample products
INSERT INTO products (name, category, plant_type, price, description, image_url, stock) VALUES
('Snake Plant', 'indoor', 'Succulent', 12.99, 'Low-maintenance indoor plant, great for beginners and air purification.', 'https://images.unsplash.com/photo-1593691509543-c55fb32e8aeb?w=400', 25),
('Monstera Deliciosa', 'indoor', 'Foliage', 24.50, 'Large split leaves that add a tropical feel to any room.', 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400', 15),
('Peace Lily', 'indoor', 'Flowering', 18.00, 'Elegant white blooms and dark green leaves. Thrives in low light.', 'https://images.unsplash.com/photo-1597223557154-721c1cecc4b0?w=400', 20),
('Aloe Vera', 'indoor', 'Succulent', 9.99, 'Medicinal succulent perfect for sunny windowsills.', 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400', 30),
('Rose Bush', 'outdoor', 'Flowering', 22.00, 'Classic fragrant roses for your garden, easy to grow.', 'https://images.unsplash.com/photo-1496062031456-07b8f162a322?w=400', 12),
('Lavender', 'outdoor', 'Herb', 8.50, 'Aromatic herb with purple flowers, loved by bees and pollinators.', 'https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=400', 40),
('Basil Plant', 'outdoor', 'Herb', 5.99, 'Fresh culinary herb for your kitchen garden.', 'https://images.unsplash.com/photo-1563412885-2e01a0b96447?w=400', 50),
('Sunflower', 'outdoor', 'Flowering', 6.50, 'Bright and cheerful flowers that follow the sun.', 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=400', 35),
('Fiddle Leaf Fig', 'indoor', 'Foliage', 32.00, 'Statement indoor tree with large glossy violin-shaped leaves.', 'https://images.unsplash.com/photo-1582560475093-ba66accbc424?w=400', 8),
('Cactus Mix', 'indoor', 'Succulent', 14.99, 'A delightful assortment of small cacti in a single pot.', 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400', 22),
('Tomato Plant', 'outdoor', 'Vegetable', 7.99, 'Homegrown juicy tomatoes, great for vegetable gardens.', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400', 45),
('Mint Plant', 'outdoor', 'Herb', 4.99, 'Refreshing mint for teas, mojitos, and cooking.', 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b3?w=400', 60);
