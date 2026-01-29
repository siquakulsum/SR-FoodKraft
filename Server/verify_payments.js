const http = require('http');
const querystring = require('querystring');
const fs = require('fs');
const util = require('util');

const ADMIN_EMAIL = 'admin@srfoodkraft.com'; // From create-admin.js
const ADMIN_PASSWORD = 'admin123';
const PORT = 5002;

// Helper for requests
const request = (method, path, data = null, token = null) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: PORT,
            path: '/api' + path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
            // console.log('DEBUG: Sending headers:', JSON.stringify(options.headers));
        }

        let bodyString = null;
        if (data) {
            bodyString = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(bodyString);
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    if (res.statusCode >= 400) {
                        console.log(`\nERROR [${method} ${path}] Status: ${res.statusCode}`);
                        console.log('Response Body:', JSON.stringify(json, null, 2));
                    }
                    resolve({ status: res.statusCode, body: json, headers: res.headers });
                } catch (e) {
                    console.log(`\nERROR [${method} ${path}] Status: ${res.statusCode}`);
                    console.log('Raw body:', body);
                    resolve({ status: res.statusCode, body: body, headers: res.headers });
                }
            });
        });

        req.on('error', reject);
        if (bodyString) req.write(bodyString);
        req.end();
    });
};

const logFile = fs.createWriteStream('verify_results.log', { flags: 'w' });
const log = (d) => {
    console.log(d);
    logFile.write(util.format(d) + '\n');
};

const runVerification = async () => {
    log('--- Starting Payment Verification ---');

    // 1. Login
    log('\nLogging in...');
    let loginRes = await request('POST', '/auth/login', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    if (loginRes.status !== 200) {
        log('Admin login failed. Trying admin@test.com / test123');
        loginRes = await request('POST', '/auth/login', { email: 'admin@test.com', password: 'test123' });
    }

    if (!loginRes.body.success && !loginRes.body.token) {
        log('Login failed completely: ' + JSON.stringify(loginRes.body));
        process.exit(1);
    }
    const token = loginRes.body.data ? loginRes.body.data.token : loginRes.body.token;
    log('Login successful. Token acquired: ' + (token ? 'Yes' : 'No'));

    // 2. Get an Order ID (Need an order to pay for)
    // We'll create a dummy order directly via DB or fetch one via API if possible.
    // Let's assume there's at least one order.
    // Or we can query DB directly here if we require models.

    // Using direct DB access for setting up test data is easier if we are in the server folder
    const { Order, Payment } = require('./models');

    // Ensure we have a pending order
    let order = await Order.findOne({ where: { payment_status: 'pending' } });
    if (!order) {
        // Create a dummy order
        log('Creating dummy order for testing...');
        const { User } = require('./models');
        let user = await User.findOne();
        if (!user) { log('No users found!'); process.exit(1); }

        order = await Order.create({
            user_id: user.id,
            order_number: `ORD-${Date.now()}`,
            total_amount: 500.00,
            subtotal: 450.00,
            event_date: new Date(),
            event_time: '12:00:00',
            delivery_address_json: {},
            status: 'pending'
        });
    }
    log(`Using Order ID: ${order.id}`);

    // 3. Add Payment
    log('\nTesting Add Payment...');
    const paymentData = {
        order_id: order.id,
        amount: 500,
        payment_method: 'cod',
        status: 'completed'
    };
    const addRes = await request('POST', '/payments', paymentData, token);
    log('Add Payment Status: ' + addRes.status);

    let paymentId;
    if (addRes.body.success) {
        paymentId = addRes.body.data.id;
        log('Add Payment Success: ' + JSON.stringify(addRes.body));
    } else {
        log('Add Payment Failed Response: ' + JSON.stringify(addRes.body, null, 2));
        // If it failed (maybe duplicate), let's find the existing payment
        const existing = await Payment.findOne({ where: { order_id: order.id } });
        if (existing) {
            log('Using existing payment for further tests.');
            paymentId = existing.id;
        } else {
            log('Could not create or find payment');
        }
    }

    if (!paymentId) {
        log('Leaving verification due to payment failure');
        return;
    }

    // 4. View Dashboard Stats
    log('\nTesting Dashboard Stats...');
    const statsRes = await request('GET', '/payments/stats', null, token);
    log('Stats: ' + JSON.stringify(statsRes.body));

    // 5. List Payments
    log('\nTesting List Payments...');
    const listRes = await request('GET', '/payments?limit=5', null, token);
    log('List Count: ' + (listRes.body.data ? listRes.body.data.payments.length : 0));

    // 6. View Single Payment
    log(`\nTesting View Payment ${paymentId}...`);
    const viewRes = await request('GET', `/payments/${paymentId}`, null, token);
    log('View Success: ' + viewRes.body.success);

    // 7. Update Payment
    log('\nTesting Update Payment...');
    const updateRes = await request('PATCH', `/payments/${paymentId}`, { status: 'completed' }, token);
    log('Update Status: ' + updateRes.body.success);

    // 8. Export
    log('\nTesting Export...');
    const exportRes = await request('GET', '/payments/export', null, token);
    log('Export Status: ' + exportRes.status);
    log('Export Data Length: ' + exportRes.body.length);

    // 9. Soft Delete
    log('\nTesting Delete Payment...');
    const deleteRes = await request('DELETE', `/payments/${paymentId}`, null, token);
    log('Delete Status: ' + deleteRes.body.success);

    log('\n--- Verification Complete ---');
    process.exit(0);
};

runVerification().catch(err => {
    log('Verification Error:' + err);
    process.exit(1);
});
