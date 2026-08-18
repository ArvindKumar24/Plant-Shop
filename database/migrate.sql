-- ============================================================
-- Migration Script: Align database schema with application code
--
-- Run this in Supabase Dashboard -> SQL Editor if you have an
-- EXISTING database that was created with the old schema.
--
-- Safe to run multiple times (uses IF NOT EXISTS / IF EXISTS).
-- ============================================================

-- ============================================================
-- USERS TABLE
-- ============================================================

-- Add phone column (missing from old schema)
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(30);

-- Rename password -> password_hash (code expects password_hash)
-- PostgreSQL does not support IF EXISTS for RENAME COLUMN,
-- so we check first.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'password'
    ) THEN
        ALTER TABLE users RENAME COLUMN password TO password_hash;
    END IF;
END $$;


-- ============================================================
-- PRODUCTS TABLE
-- ============================================================

-- Add plant_type column (missing from old schema)
ALTER TABLE products ADD COLUMN IF NOT EXISTS plant_type VARCHAR(100) DEFAULT 'general';


-- ============================================================
-- ORDERS TABLE
-- ============================================================

-- Add payment_method column (missing from old schema)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);

-- Add payment_status column (missing from old schema)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending';

-- Rename status -> order_status (code expects order_status)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = 'status'
    ) THEN
        ALTER TABLE orders RENAME COLUMN status TO order_status;
    END IF;
END $$;


-- ============================================================
-- VERIFY
-- ============================================================

SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('users', 'products', 'orders')
ORDER BY table_name, ordinal_position;
