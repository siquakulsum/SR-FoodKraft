const { User, Order, OrderItem, MenuItem, MenuCategory, OrderStatusHistory, sequelize } = require('./models');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const API_URL = 'http://localhost:5001/api';
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const logInfo = (msg) => {
    console.log(msg);
    fs.appendFileSync('verify_results.log', msg + '\n');
};
const logError = (msg, data) => {
    console.error(msg, data || '');
    fs.appendFileSync('verify_results.log', msg + (data ? ' ' + data : '') + '\n');
};

async function runVerification() {
    fs.writeFileSync('verify_results.log', '--- Verification Results ---\n');
    try {
        logInfo('--- Starting Verification ---');

        // Ensure new table exists
        await OrderStatusHistory.sync();
        logInfo('✓ OrderStatusHistory table synced');

        // 1. Create Test Admin User & Token
        logInfo('Creating Admin User...');
        const adminId = '11111111-1111-1111-1111-111111111111';
        const token = jwt.sign({ userId: adminId, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

        try {
            await User.findOrCreate({
                where: { id: adminId },
                defaults: {
                    name: 'Test Admin',
                    email: 'testadmin@example.com',
                    password_hash: 'hash',
                    role: 'admin',
                    phone: '1234567890'
                }
            });
        } catch (e) {
            logError('Error creating User:', e.message);
            throw e;
        }

        const categoryId = '33333333-3333-3333-3333-333333333333';
        const menuItemId = '22222222-2222-2222-2222-222222222222';
        const orderId = '44444444-4444-4444-4444-444444444444';

        logInfo('Cleaning up...');
        try {
            await OrderItem.destroy({ where: { order_id: orderId }, force: true });
            await Order.destroy({ where: { id: orderId }, force: true });
        } catch (e) {
            logInfo('Cleanup warning: ' + e.message);
        }

        logInfo('Creating MenuCategory...');
        try {
            if (MenuCategory) {
                const [cat, created] = await MenuCategory.findOrCreate({
                    where: { id: categoryId },
                    defaults: {
                        name: 'Test Category',
                        description: 'Test Desc',
                        is_active: true,
                        slug: 'test-category-' + Date.now()
                    }
                });
                if (!created && !cat.slug) {
                    cat.slug = 'test-category-' + Date.now();
                    await cat.save();
                }
            }
        } catch (e) {
            logError('Error creating MenuCategory:', e.message);
            throw e;
        }

        logInfo('Creating MenuItem...');
        try {
            await MenuItem.findOrCreate({
                where: { id: menuItemId },
                defaults: {
                    name: 'Test Pizza',
                    price: 15.00,
                    description: 'Yummy',
                    category_id: categoryId,
                    is_veg: true,
                    is_available: true,
                    unit_type: 'piece'
                }
            });
        } catch (e) {
            logError('Error creating MenuItem:', e.message);
            throw e;
        }

        logInfo('Creating Order...');
        try {
            await Order.create({
                id: orderId,
                user_id: adminId,
                order_number: 'ORDTEST001',
                status: 'pending',
                order_type: 'delivery',
                delivery_address_json: { street: '123 Test St', city: 'Test City' },
                total_amount: 100.00,
                subtotal: 90.00,
                gst_amount: 5.00,
                delivery_charges: 5.00,
                event_date: new Date(),
                event_time: '12:00:00'
            });
        } catch (e) {
            logError('Error creating Order:', e.message);
            throw e;
        }

        logInfo('Creating OrderItem...');
        try {
            await OrderItem.create({
                order_id: orderId,
                menu_item_id: menuItemId,
                menu_item_name: 'Test Pizza',
                quantity: 2,
                unit_type: 'piece',
                unit_price: 45.00,
                total_price: 90.00
            });
        } catch (e) {
            logError('Error creating OrderItem:', e.message);
            throw e;
        }

        logInfo('✓ Test data seeded');

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        const fetchJson = async (url, options = {}) => {
            const res = await fetch(url, options);
            const text = await res.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                data = text;
            }
            return { ok: res.ok, status: res.status, data };
        };

        // 3. Test Search
        logInfo('Testing GET /api/orders...');
        const searchRes = await fetchJson(`${API_URL}/orders?search=ORDTEST`, { headers });
        if (searchRes.data.success && searchRes.data.data.orders.length > 0) {
            logInfo('✓ Search API working');
        } else {
            logError('✗ Search API failed', JSON.stringify(searchRes.data, null, 2));
        }

        // 4. Test Count
        logInfo('Testing GET /api/orders/count...');
        const countRes = await fetchJson(`${API_URL}/orders/count?status=pending`, { headers });
        if (countRes.data.success && typeof countRes.data.data.count === 'number') {
            logInfo('✓ Count API working');
        } else {
            logError('✗ Count API failed', JSON.stringify(countRes.data, null, 2));
        }

        // 5. Test Get By ID
        logInfo('Testing GET /api/orders/:id...');
        const getRes = await fetchJson(`${API_URL}/orders/${orderId}`, { headers });
        if (getRes.data.success && getRes.data.data.id === orderId) {
            logInfo('✓ Get Order API working');
            if (getRes.data.data.items && getRes.data.data.items.length > 0) {
                logInfo('✓ Order Items included');
            } else {
                logInfo('! Order Items missing');
            }
        } else {
            logError('✗ Get Order API failed', JSON.stringify(getRes.data, null, 2));
        }

        // 6. Test Update Status
        logInfo('Testing PATCH /api/orders/:id/status...');
        const statusRes = await fetchJson(`${API_URL}/orders/${orderId}/status`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
                status: 'confirmed',
                note: 'Confirmed via test script'
            })
        });
        if (statusRes.data.success && statusRes.data.data.status === 'confirmed') {
            logInfo('✓ Update Status API working');
        } else {
            logError('✗ Update Status API failed', JSON.stringify(statusRes.data, null, 2));
        }

        // 7. Test Update Details (Items)
        logInfo('Testing PATCH /api/orders/:id...');
        const updateRes = await fetchJson(`${API_URL}/orders/${orderId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
                items: [
                    {
                        menu_item_id: menuItemId,
                        menu_item_name: 'Test Pizza',
                        quantity: 3, // Changed quantity
                        unit_type: 'pc',
                        unit_price: 45.00,
                        special_instructions: 'Extra cheese'
                    }
                ]
            })
        });

        if (updateRes.data.success && updateRes.data.data.total_amount > 100) { // Should be higher now
            logInfo('✓ Update Details API working');
        } else {
            logError('✗ Update Details API failed', JSON.stringify(updateRes.data, null, 2));
        }

        // 8. Test Delete
        logInfo('Testing DELETE /api/orders/:id...');
        const deleteRes = await fetchJson(`${API_URL}/orders/${orderId}`, {
            method: 'DELETE',
            headers
        });
        if (deleteRes.data.success) {
            logInfo('✓ Delete API working');
        } else {
            logError('✗ Delete API failed', deleteRes.data); // Log stringified data often is HTML
        }

        logInfo('--- Verification Complete ---');
        process.exit(0);

    } catch (e) {
        logError('Verification Failed:', e.message);
        if (e.stack) logError(e.stack);
        fs.writeFileSync('verify_error.log', e.message + '\n' + (e.stack ? e.stack : '') + '\n' + JSON.stringify(e, null, 2));
        process.exit(1);
    }
}

runVerification();
