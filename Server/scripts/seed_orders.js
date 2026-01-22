const models = require('../models');
const { v4: uuidv4 } = require('uuid');

async function seedOrders() {
    console.log('🚀 Starting seed script...');
    try {
        const { sequelize, User, MenuCategory, MenuItem, Order, OrderItem } = models;

        console.log('🔌 Authenticating database...');
        await sequelize.authenticate();
        console.log('✅ Database connected.');

        // 1. Customer
        const customerEmail = 'testcustomer@example.com';
        console.log(`👤 Finding customer: ${customerEmail}`);
        let customer = await User.findOne({ where: { email: customerEmail } });
        if (!customer) {
            console.log('   Creating new customer...');
            try {
                customer = await User.create({
                    name: 'Test Customer',
                    email: customerEmail,
                    password_hash: '$2b$10$DummyHashForTest................', // Dummy hash
                    phone: '9876543210',
                    role: 'customer', // Correct enum value
                    is_active: true
                });
            } catch (err) {
                console.error('   ❌ Failed to create customer:', err.message);
                if (err.parent) console.error('   SQL Error:', err.parent.sqlMessage);
                throw err;
            }
        }
        console.log(`   Customer ID: ${customer.id}`);

        // 2. Category
        console.log('📂 Finding category: Test Category');
        let category = await MenuCategory.findOne({ where: { name: 'Test Category' } });
        if (!category) {
            console.log('   Creating new category...');
            category = await MenuCategory.create({
                name: 'Test Category',
                image_url: 'http://example.com/cat.jpg',
                is_active: true
            });
        }
        console.log(`   Category ID: ${category.id}`);

        // 3. Menu Item
        console.log('🍔 Finding menu item: Test Burger');
        let menuItem = await MenuItem.findOne({ where: { name: 'Test Burger' } });
        if (!menuItem) {
            console.log('   Creating new menu item...');
            try {
                menuItem = await MenuItem.create({
                    name: 'Test Burger',
                    description: 'Delicious test burger',
                    price: 150.00,
                    category_id: category.id,
                    type_id: null,
                    unit_type: 'piece',
                    is_available: true
                });
            } catch (err) {
                console.error('   ❌ Failed to create menu item:', err.message);
                if (err.parent) console.error('   SQL Error:', err.parent.sqlMessage);
                throw err;
            }
        }
        console.log(`   MenuItem ID: ${menuItem.id}`);

        // 4. Order
        console.log('📝 Creating order...');
        const orderId = uuidv4();
        const orderNumber = `ORD${Date.now()}`;

        let order;
        try {
            order = await Order.create({
                id: orderId,
                user_id: customer.id,
                order_number: orderNumber,
                status: 'pending',
                order_type: 'delivery',
                delivery_address_json: {
                    street: '123 Test St',
                    city: 'Test City',
                    zip: '12345'
                },
                total_amount: 330.00,
                subtotal: 300.00,
                delivery_charges: 30.00,
                gst_amount: 0.00,
                service_charges: 0.00,
                event_date: new Date(),
                event_time: '12:00:00',
                payment_status: 'pending',
                payment_method: 'cod'
            });
        } catch (err) {
            console.error('   ❌ Failed to create order:', err.message);
            if (err.parent) console.error('   SQL Error:', err.parent.sqlMessage);
            throw err;
        }
        console.log(`   Order Created: ${order.id}`);

        // 5. Order Item
        console.log('🧾 Creating order items...');
        try {
            await OrderItem.create({
                order_id: order.id,
                menu_item_id: menuItem.id,
                menu_item_name: menuItem.name,
                quantity: 2,
                price: 150.00,
                unit_price: 150.00,
                total_price: 300.00, // 2 * 150
                unit_type: 'piece'
            });
        } catch (err) {
            console.error('   ❌ Failed to create order item:', err.message);
            if (err.parent) console.error('   SQL Error:', err.parent.sqlMessage);
            // Don't throw
        }

        const fs = require('fs');
        const output = `Order ID: ${order.id}\nOrder Number: ${order.order_number}`;
        fs.writeFileSync('seeded_order.txt', output);

        console.log('\n✅ SEED COMPLETED SUCCESSFULLY');
        console.log('================================================');
        console.log(`Order ID:      ${order.id}`);
        console.log(`Order Number:  ${order.order_number}`);
        console.log('================================================');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ FATAL ERROR:', error.message);
        process.exit(1);
    }
}

seedOrders();
