const fs = require('fs');
const { sequelize, User, Offer, OfferUsage, Order, OrderItem, MenuItem } = require('./models');
const offersService = require('./modules/offers/offersService');
const orderService = require('./services/orderService');
const { v4: uuidv4 } = require('uuid');

const logStream = fs.createWriteStream('verification_report.txt', { flags: 'w' });
const log = (msg) => {
    console.log(msg);
    logStream.write(msg + '\n');
};

const runVerification = async () => {
    try {
        // Disable logging for cleaner output
        sequelize.options.logging = false;
        await sequelize.authenticate();
        log('✓ Database connected');

        // 1. Setup Test Data
        const testUserId = uuidv4();
        // Create user
        try {
            await User.create({
                id: testUserId,
                name: 'Test User',
                email: `test${Date.now()}@example.com`,
                password: 'hashedpassword',
                role: 'customer',
                phone: '1234567890'
            });
            log('✓ Test User created');
        } catch (e) {
            log('⚠ User creation failed: ' + e.message);
        }

        // Create MenuItem
        const menuItemId = uuidv4();
        await MenuItem.create({
            id: menuItemId,
            name: 'Test Burger',
            price: 100,
            unit_type: 'piece',
            is_vegetarian: true
        });
        log('✓ Test MenuItem created');

        // 2. Test Offer Usage Limit
        const limitedOfferCode = `LIMIT${Date.now()}`;
        const offer = await offersService.createOffer({
            code: limitedOfferCode,
            discount_type: 'fixed',
            discount_value: 10,
            valid_from: new Date(),
            valid_to: new Date(Date.now() + 86400000), // Tomorrow
            is_active: true,
            usage_limit: 1, // Global limit 1
            user_usage_limit: 1
        }, testUserId);
        log('✓ Limited Offer created');

        // 3. Create Order Usage 1 (Should Succeed)
        const order1 = await orderService.createOrder({
            items: [{
                menu_item_id: menuItemId,
                menu_item_name: 'Test Burger',
                quantity: 1,
                unit_type: 'piece',
                unit_price: 100
            }],
            offer_code: limitedOfferCode,
            order_type: 'pickup',
            payment_method: 'cod',
            delivery_date: new Date().toISOString().split('T')[0],
            delivery_time: '12:00'
        }, testUserId);
        log(`✓ Order 1 created with offer (Discount: ${order1.discount_amount})`);

        // 4. Create Order Usage 2 (Should Fail - Global Limit)
        try {
            await orderService.createOrder({
                items: [{
                    menu_item_id: menuItemId,
                    menu_item_name: 'Test Burger',
                    quantity: 1,
                    unit_type: 'piece',
                    unit_price: 100
                }],
                offer_code: limitedOfferCode,
                order_type: 'pickup',
                payment_method: 'cod',
                delivery_date: new Date().toISOString().split('T')[0],
                delivery_time: '12:00'
            }, testUserId);
            log('❌ Order 2 should have failed but succeeded!');
        } catch (error) {
            if (error.message.includes('usage limit exceeded') || error.message.includes('already used') || error.message.includes('maximum allowed times')) {
                log('✓ Order 2 failed as expected (Usage Limit enforced)');
            } else {
                log(`❌ Order 2 failed with unexpected error: ${error.message}`);
                console.error(error);
            }
        }

        // 5. Test Expired Offer Edit
        const expiredOffer = await offersService.createOffer({
            code: `EXP${Date.now()}`,
            discount_type: 'fixed',
            discount_value: 10,
            valid_from: new Date(Date.now() - 100000),
            valid_to: new Date(Date.now() - 50000), // Expired
            is_active: true
        }, testUserId);

        try {
            await offersService.updateOffer(expiredOffer.id, { discount_value: 20 }, testUserId);
            log('❌ Edit Expired Offer should have failed!');
        } catch (error) {
            if (error.message.includes('Cannot edit expired offer')) {
                log('✓ Edit Expired Offer failed as expected');
            } else {
                log(`❌ Edit Expired Offer failed with unexpected error: ${error.message}`);
            }
        }

        // 6. Test Delete Used Offer
        try {
            await offersService.deleteOffer(offer.id, testUserId);
            log('❌ Delete Used Offer should have failed!');
        } catch (error) {
            if (error.message.includes('has been used')) {
                log('✓ Delete Used Offer failed as expected');
            } else {
                log(`❌ Delete Used Offer failed with unexpected error: ${error.message}`);
            }
        }

    } catch (error) {
        log(`Verification Error: ${error.message}`);
        console.error(error);
    } finally {
        await sequelize.close();
        logStream.end();
    }
};

runVerification();
