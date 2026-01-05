-- SR FoodKraft - Sample Data for Development
-- Run this in pgAdmin after setting up the database
-- This adds realistic test data for development

-- ============================================
-- CLEAR EXISTING DATA (optional)
-- ============================================
-- Uncomment if you want to start fresh
-- TRUNCATE TABLE order_items, orders, user_favorites, reviews, notifications, addresses, menu_items, menu_categories, user_profiles RESTART IDENTITY CASCADE;

-- ============================================
-- MENU CATEGORIES
-- ============================================

INSERT INTO menu_categories (name, description, display_order, is_active) VALUES
('Appetizers & Starters', 'Begin your event with delicious starters', 1, true),
('Main Course - Vegetarian', 'Delightful vegetarian main dishes', 2, true),
('Main Course - Non-Vegetarian', 'Flavorful non-vegetarian specialties', 3, true),
('Breads & Rice', 'Freshly prepared breads and aromatic rice', 4, true),
('Desserts', 'Sweet treats to conclude your meal', 5, true),
('Beverages', 'Refreshing drinks and beverages', 6, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- MENU ITEMS - Appetizers
-- ============================================

INSERT INTO menu_items (name, description, category_id, price_per_kg, price_per_piece, is_vegetarian, is_available, min_quantity)
SELECT 'Paneer Tikka', 'Grilled cottage cheese marinated in aromatic spices', id, 450.00, NULL, true, true, 2
FROM menu_categories WHERE name = 'Appetizers & Starters';

INSERT INTO menu_items (name, description, category_id, price_per_kg, is_vegetarian, is_available, min_quantity)
SELECT 'Vegetable Spring Rolls', 'Crispy rolls filled with fresh vegetables', id, 350.00, true, true, 2
FROM menu_categories WHERE name = 'Appetizers & Starters';

INSERT INTO menu_items (name, description, category_id, price_per_kg, is_vegetarian, is_available, min_quantity)
SELECT 'Chicken 65', 'Spicy and tangy fried chicken appetizer', id, 550.00, false, true, 2
FROM menu_categories WHERE name = 'Appetizers & Starters';

INSERT INTO menu_items (name, description, category_id, price_per_piece, is_vegetarian, is_available, min_quantity)
SELECT 'Samosa', 'Crispy pastry with spiced potato filling', id, 15.00, true, true, 20
FROM menu_categories WHERE name = 'Appetizers & Starters';

-- ============================================
-- MENU ITEMS - Vegetarian Main Course
-- ============================================

INSERT INTO menu_items (name, description, category_id, price_per_kg, is_vegetarian, is_available, min_quantity)
SELECT 'Paneer Butter Masala', 'Creamy tomato-based curry with cottage cheese', id, 420.00, true, true, 3
FROM menu_categories WHERE name = 'Main Course - Vegetarian';

INSERT INTO menu_items (name, description, category_id, price_per_kg, is_vegetarian, is_available, min_quantity)
SELECT 'Vegetable Biryani', 'Fragrant basmati rice with mixed vegetables and spices', id, 350.00, true, true, 5
FROM menu_categories WHERE name = 'Main Course - Vegetarian';

INSERT INTO menu_items (name, description, category_id, price_per_kg, is_vegetarian, is_available, min_quantity)
SELECT 'Dal Makhani', 'Slow-cooked black lentils in creamy tomato gravy', id, 320.00, true, true, 3
FROM menu_categories WHERE name = 'Main Course - Vegetarian';

INSERT INTO menu_items (name, description, category_id, price_per_kg, is_vegetarian, is_available, min_quantity)
SELECT 'Malai Kofta', 'Cottage cheese dumplings in rich cashew gravy', id, 450.00, true, true, 3
FROM menu_categories WHERE name = 'Main Course - Vegetarian';

-- ============================================
-- MENU ITEMS - Non-Vegetarian Main Course
-- ============================================

INSERT INTO menu_items (name, description, category_id, price_per_kg, is_vegetarian, is_available, min_quantity)
SELECT 'Chicken Biryani', 'Aromatic basmati rice with tender chicken pieces', id, 550.00, false, true, 5
FROM menu_categories WHERE name = 'Main Course - Non-Vegetarian';

INSERT INTO menu_items (name, description, category_id, price_per_kg, is_vegetarian, is_available, min_quantity)
SELECT 'Butter Chicken', 'Tender chicken in creamy tomato and butter sauce', id, 580.00, false, true, 3
FROM menu_categories WHERE name = 'Main Course - Non-Vegetarian';

INSERT INTO menu_items (name, description, category_id, price_per_kg, is_vegetarian, is_available, min_quantity)
SELECT 'Mutton Rogan Josh', 'Slow-cooked lamb in aromatic Kashmiri spices', id, 750.00, false, true, 3
FROM menu_categories WHERE name = 'Main Course - Non-Vegetarian';

INSERT INTO menu_items (name, description, category_id, price_per_kg, is_vegetarian, is_available, min_quantity)
SELECT 'Fish Curry', 'Fresh fish in tangy coconut-based curry', id, 650.00, false, true, 3
FROM menu_categories WHERE name = 'Main Course - Non-Vegetarian';

-- ============================================
-- MENU ITEMS - Breads & Rice
-- ============================================

INSERT INTO menu_items (name, description, category_id, price_per_piece, is_vegetarian, is_available, min_quantity)
SELECT 'Naan', 'Soft leavened flatbread baked in tandoor', id, 20.00, true, true, 10
FROM menu_categories WHERE name = 'Breads & Rice';

INSERT INTO menu_items (name, description, category_id, price_per_piece, is_vegetarian, is_available, min_quantity)
SELECT 'Butter Naan', 'Naan brushed with butter', id, 25.00, true, true, 10
FROM menu_categories WHERE name = 'Breads & Rice';

INSERT INTO menu_items (name, description, category_id, price_per_piece, is_vegetarian, is_available, min_quantity)
SELECT 'Garlic Naan', 'Naan topped with fresh garlic and herbs', id, 30.00, true, true, 10
FROM menu_categories WHERE name = 'Breads & Rice';

INSERT INTO menu_items (name, description, category_id, price_per_kg, is_vegetarian, is_available, min_quantity)
SELECT 'Jeera Rice', 'Basmati rice tempered with cumin seeds', id, 180.00, true, true, 3
FROM menu_categories WHERE name = 'Breads & Rice';

INSERT INTO menu_items (name, description, category_id, price_per_kg, is_vegetarian, is_available, min_quantity)
SELECT 'Pulao Rice', 'Fragrant rice with vegetables and aromatic spices', id, 220.00, true, true, 3
FROM menu_categories WHERE name = 'Breads & Rice';

-- ============================================
-- MENU ITEMS - Desserts
-- ============================================

INSERT INTO menu_items (name, description, category_id, price_per_piece, is_vegetarian, is_available, min_quantity)
SELECT 'Gulab Jamun', 'Deep-fried milk solids in rose-flavored sugar syrup', id, 25.00, true, true, 20
FROM menu_categories WHERE name = 'Desserts';

INSERT INTO menu_items (name, description, category_id, price_per_piece, is_vegetarian, is_available, min_quantity)
SELECT 'Rasgulla', 'Soft cottage cheese balls in light sugar syrup', id, 20.00, true, true, 20
FROM menu_categories WHERE name = 'Desserts';

INSERT INTO menu_items (name, description, category_id, price_per_kg, is_vegetarian, is_available, min_quantity)
SELECT 'Kheer', 'Creamy rice pudding with nuts and cardamom', id, 280.00, true, true, 2
FROM menu_categories WHERE name = 'Desserts';

INSERT INTO menu_items (name, description, category_id, price_per_kg, is_vegetarian, is_available, min_quantity)
SELECT 'Gajar Halwa', 'Sweet carrot pudding with ghee and nuts', id, 350.00, true, true, 2
FROM menu_categories WHERE name = 'Desserts';

-- ============================================
-- MENU ITEMS - Beverages
-- ============================================

INSERT INTO menu_items (name, description, category_id, price_per_piece, is_vegetarian, is_available, min_quantity)
SELECT 'Masala Chai', 'Traditional spiced Indian tea', id, 15.00, true, true, 10
FROM menu_categories WHERE name = 'Beverages';

INSERT INTO menu_items (name, description, category_id, price_per_piece, is_vegetarian, is_available, min_quantity)
SELECT 'Lassi (Sweet)', 'Refreshing yogurt-based drink', id, 40.00, true, true, 10
FROM menu_categories WHERE name = 'Beverages';

INSERT INTO menu_items (name, description, category_id, price_per_piece, is_vegetarian, is_available, min_quantity)
SELECT 'Fresh Lime Soda', 'Fizzy lemon drink with mint', id, 30.00, true, true, 10
FROM menu_categories WHERE name = 'Beverages';

INSERT INTO menu_items (name, description, category_id, price_per_piece, is_vegetarian, is_available, min_quantity)
SELECT 'Mango Lassi', 'Creamy mango yogurt drink', id, 50.00, true, true, 10
FROM menu_categories WHERE name = 'Beverages';

-- ============================================
-- TEST USERS
-- ============================================

INSERT INTO user_profiles (email, name, phone) VALUES
('admin@srfoodkraft.com', 'Admin User', '+919876543210'),
('john.doe@example.com', 'John Doe', '+919876543211'),
('jane.smith@example.com', 'Jane Smith', '+919876543212'),
('wedding@example.com', 'Wedding Organizer', '+919876543213'),
('corporate@example.com', 'Corporate Events', '+919876543214')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- TEST ADDRESSES
-- ============================================

INSERT INTO addresses (user_id, type, street, city, state, zip_code, is_default)
SELECT 
    id, 
    'home', 
    '123 MG Road, Brigade Road', 
    'Bangalore', 
    'Karnataka', 
    '560001',
    true
FROM user_profiles WHERE email = 'john.doe@example.com';

INSERT INTO addresses (user_id, type, street, city, state, zip_code, is_default)
SELECT 
    id, 
    'office', 
    '456 Whitefield Main Road, ITPL', 
    'Bangalore', 
    'Karnataka', 
    '560066',
    false
FROM user_profiles WHERE email = 'corporate@example.com';

-- ============================================
-- SAMPLE ORDERS
-- ============================================

-- Order 1: Wedding Event
INSERT INTO orders (
    user_id, 
    event_date, 
    event_time, 
    delivery_address, 
    subtotal, 
    service_charge, 
    total_amount, 
    status, 
    payment_status,
    payment_method,
    special_instructions
)
SELECT 
    id,
    CURRENT_DATE + INTERVAL '7 days',
    '18:00:00',
    jsonb_build_object(
        'street', 'Palace Grounds',
        'city', 'Bangalore',
        'state', 'Karnataka',
        'zip_code', '560080'
    ),
    25000.00,
    1250.00,
    26250.00,
    'paid',
    'paid',
    'upi',
    'Wedding event for 200 guests. Please arrive by 5 PM.'
FROM user_profiles WHERE email = 'wedding@example.com';

-- Order 2: Corporate Event
INSERT INTO orders (
    user_id, 
    event_date, 
    event_time, 
    delivery_address, 
    subtotal, 
    service_charge, 
    total_amount, 
    status, 
    payment_status,
    payment_method
)
SELECT 
    id,
    CURRENT_DATE + INTERVAL '3 days',
    '12:30:00',
    jsonb_build_object(
        'street', '456 Whitefield Main Road, ITPL',
        'city', 'Bangalore',
        'state', 'Karnataka',
        'zip_code', '560066'
    ),
    15000.00,
    750.00,
    15750.00,
    'preparing',
    'paid',
    'netbanking'
FROM user_profiles WHERE email = 'corporate@example.com';

-- Order 3: Small Party
INSERT INTO orders (
    user_id, 
    event_date, 
    event_time, 
    delivery_address, 
    subtotal, 
    service_charge, 
    total_amount, 
    status, 
    payment_status,
    payment_method
)
SELECT 
    id,
    CURRENT_DATE + INTERVAL '1 day',
    '19:00:00',
    jsonb_build_object(
        'street', '123 MG Road, Brigade Road',
        'city', 'Bangalore',
        'state', 'Karnataka',
        'zip_code', '560001'
    ),
    5000.00,
    250.00,
    5250.00,
    'placed',
    'pending',
    'cash'
FROM user_profiles WHERE email = 'john.doe@example.com';

-- ============================================
-- SAMPLE ORDER ITEMS
-- ============================================

-- Wedding Order Items
INSERT INTO order_items (order_id, menu_item_id, quantity, unit, unit_price, total_price)
SELECT 
    o.id,
    m.id,
    10.00,
    'kg',
    550.00,
    5500.00
FROM orders o
CROSS JOIN menu_items m
WHERE o.user_id = (SELECT id FROM user_profiles WHERE email = 'wedding@example.com')
AND m.name = 'Chicken Biryani'
LIMIT 1;

INSERT INTO order_items (order_id, menu_item_id, quantity, unit, unit_price, total_price)
SELECT 
    o.id,
    m.id,
    5.00,
    'kg',
    420.00,
    2100.00
FROM orders o
CROSS JOIN menu_items m
WHERE o.user_id = (SELECT id FROM user_profiles WHERE email = 'wedding@example.com')
AND m.name = 'Paneer Butter Masala'
LIMIT 1;

-- ============================================
-- SAMPLE NOTIFICATIONS
-- ============================================

INSERT INTO notifications (user_id, type, title, message, is_read)
SELECT 
    id,
    'order_update',
    'Order Confirmed',
    'Your order has been confirmed and is being prepared.',
    false
FROM user_profiles WHERE email = 'john.doe@example.com';

INSERT INTO notifications (user_id, type, title, message, is_read)
SELECT 
    id,
    'promotion',
    'Special Discount: 20% Off',
    'Book your next event this week and get 20% off!',
    false
FROM user_profiles WHERE email = 'jane.smith@example.com';

-- ============================================
-- SAMPLE USER FAVORITES
-- ============================================

INSERT INTO user_favorites (user_id, menu_item_id)
SELECT 
    u.id,
    m.id
FROM user_profiles u
CROSS JOIN menu_items m
WHERE u.email = 'john.doe@example.com'
AND m.name IN ('Chicken Biryani', 'Butter Chicken', 'Gulab Jamun')
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

SELECT '=== Database Statistics ===' as info;

SELECT 'Categories:' as table_name, COUNT(*) as count FROM menu_categories
UNION ALL
SELECT 'Menu Items:', COUNT(*) FROM menu_items
UNION ALL
SELECT 'Users:', COUNT(*) FROM user_profiles
UNION ALL
SELECT 'Addresses:', COUNT(*) FROM addresses
UNION ALL
SELECT 'Orders:', COUNT(*) FROM orders
UNION ALL
SELECT 'Order Items:', COUNT(*) FROM order_items
UNION ALL
SELECT 'Notifications:', COUNT(*) FROM notifications
UNION ALL
SELECT 'Favorites:', COUNT(*) FROM user_favorites;

-- ============================================
-- SAMPLE QUERIES FOR TESTING
-- ============================================

SELECT '=== Sample Queries ===' as info;

-- View all menu items with categories
SELECT 
    mc.name as category,
    mi.name as item,
    mi.price_per_kg,
    mi.price_per_piece,
    CASE WHEN mi.is_vegetarian THEN 'Veg' ELSE 'Non-Veg' END as type
FROM menu_items mi
JOIN menu_categories mc ON mi.category_id = mc.id
ORDER BY mc.display_order, mi.name;

-- View recent orders with customer details
SELECT 
    o.order_number,
    u.name as customer,
    u.phone,
    o.event_date,
    o.total_amount,
    o.status,
    o.payment_status
FROM orders o
JOIN user_profiles u ON o.user_id = u.id
ORDER BY o.created_at DESC;

-- ============================================
-- SUCCESS!
-- ============================================
SELECT '✅ Sample data loaded successfully!' as message;
SELECT 'You can now start testing your application.' as next_step;

