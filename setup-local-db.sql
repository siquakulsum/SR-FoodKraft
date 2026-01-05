-- SR FoodKraft - Local Database Setup Script
-- Run this in pgAdmin Query Tool after creating the database

-- ============================================
-- Step 1: Create Database (run in postgres database)
-- ============================================
-- CREATE DATABASE sr_foodkraft_dev;
-- Then connect to sr_foodkraft_dev database and run the rest

-- ============================================
-- Step 2: Enable Required Extensions
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- Text search
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- Encryption functions

-- ============================================
-- Step 3: Create Core Tables
-- ============================================

-- Users and Authentication
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Addresses
CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    type VARCHAR(20) DEFAULT 'home' CHECK (type IN ('home', 'office', 'other')),
    street TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Menu Categories
CREATE TABLE IF NOT EXISTS menu_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
    subcategory VARCHAR(255),
    image_url TEXT,
    price_per_kg DECIMAL(10, 2),
    price_per_piece DECIMAL(10, 2),
    is_vegetarian BOOLEAN DEFAULT true,
    is_available BOOLEAN DEFAULT true,
    min_quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    delivery_address JSONB NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    service_charge DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'placed' CHECK (status IN ('placed', 'paid', 'preparing', 'delivered', 'cancelled')),
    payment_method VARCHAR(20) DEFAULT 'cash' CHECK (payment_method IN ('card', 'upi', 'netbanking', 'cash')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    special_instructions TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(10) NOT NULL CHECK (unit IN ('kg', 'pieces')),
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    special_instructions TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('order_update', 'promotion', 'system', 'welcome')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    is_sent BOOLEAN DEFAULT false,
    channels TEXT[] DEFAULT ARRAY['app'],
    created_at TIMESTAMP DEFAULT NOW(),
    read_at TIMESTAMP
);

-- Notification Preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE UNIQUE,
    order_updates BOOLEAN DEFAULT true,
    promotions BOOLEAN DEFAULT true,
    system_alerts BOOLEAN DEFAULT true,
    email_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT true,
    push_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User Favorites
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, menu_item_id)
);

-- OTP Verification
CREATE TABLE IF NOT EXISTS otp_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Reviews/Ratings
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Step 4: Create Indexes for Performance
-- ============================================

CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX idx_menu_items_is_available ON menu_items(is_available);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_event_date ON orders(event_date);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_menu_item_id ON order_items(menu_item_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_reviews_menu_item_id ON reviews(menu_item_id);

-- ============================================
-- Step 5: Create Functions
-- ============================================

-- Function to auto-generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Trigger for order number generation
DROP TRIGGER IF EXISTS trg_generate_order_number ON orders;
CREATE TRIGGER trg_generate_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trg_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_menu_items_updated_at
    BEFORE UPDATE ON menu_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Step 6: Insert Sample Data
-- ============================================

-- Sample Categories
INSERT INTO menu_categories (name, description, display_order) VALUES
('Appetizers', 'Delicious starters for your event', 1),
('Main Course', 'Hearty main dishes', 2),
('Desserts', 'Sweet treats to end your meal', 3),
('Beverages', 'Refreshing drinks', 4)
ON CONFLICT DO NOTHING;

-- Sample Menu Items
INSERT INTO menu_items (name, description, category_id, price_per_kg, price_per_piece, is_vegetarian) 
SELECT 
    'Paneer Tikka', 
    'Grilled cottage cheese marinated in spices', 
    id, 
    450.00, 
    NULL, 
    true 
FROM menu_categories WHERE name = 'Appetizers'
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (name, description, category_id, price_per_kg, is_vegetarian) 
SELECT 
    'Vegetable Biryani', 
    'Fragrant rice with mixed vegetables and spices', 
    id, 
    350.00, 
    true 
FROM menu_categories WHERE name = 'Main Course'
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (name, description, category_id, price_per_piece, is_vegetarian) 
SELECT 
    'Gulab Jamun', 
    'Sweet milk solids in sugar syrup', 
    id, 
    25.00, 
    true 
FROM menu_categories WHERE name = 'Desserts'
ON CONFLICT DO NOTHING;

-- Sample Admin User (password: admin123 - change in production!)
INSERT INTO user_profiles (email, name, phone) VALUES
('admin@srfoodkraft.com', 'Admin User', '+919876543210'),
('customer@example.com', 'Test Customer', '+919876543211')
ON CONFLICT DO NOTHING;

-- ============================================
-- Step 7: Verification Queries
-- ============================================

-- Check all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check sample data
SELECT COUNT(*) as category_count FROM menu_categories;
SELECT COUNT(*) as menu_item_count FROM menu_items;
SELECT COUNT(*) as user_count FROM user_profiles;

-- Show database size
SELECT pg_size_pretty(pg_database_size(current_database())) as database_size;

-- ============================================
-- SUCCESS!
-- ============================================
-- Your local database is now ready for development!
-- 
-- Next steps:
-- 1. Update your .env.local file with database credentials
-- 2. Test connection from your application
-- 3. Start developing!
-- ============================================

