require('dotenv').config();
const { User, Order, Payment } = require('../models');
const paymentController = require('../controllers/paymentController');
const crypto = require('crypto');

// Mock request/response
const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.body = data;
        return res;
    };
    return res;
};

const mockNext = (err) => {
    console.error('Next called with error:', err);
};

const runTest = async () => {
    console.log('🚀 Testing Payment Controller Fix...');

    try {
        // 1. Setup Data
        const user = await User.findOne({ where: { role: 'customer' } });
        if (!user) throw new Error('No customer found');

        const orderNum = `ORD-FIX-${crypto.randomBytes(2).toString('hex')}`;
        const order = await Order.create({
            user_id: user.id,
            order_number: orderNum,
            status: 'pending',
            total_amount: 500,
            subtotal: 400,
            gst_amount: 50,
            delivery_charges: 50,
            delivery_address_json: { street: 'Fix St' },
            event_date: new Date(),
            event_time: '12:00:00'
        });
        console.log(`✅ Created Order: ${orderNum} (UUID: ${order.id})`);

        // 2. Mock Request with Order Number (String) instead of UUID
        const req = {
            body: {
                order_id: orderNum, // <--- THE TEST
                amount: 500,
                payment_method: 'cash',
                status: 'completed',
                transaction_id: `TXN-${crypto.randomBytes(3).toString('hex')}`
            },
            user: { id: user.id },
            ip: '127.0.0.1'
        };

        const res = mockRes();

        // 3. Call Controller
        console.log('🔄 Calling paymentController.addPayment with Order NUMBER...');
        await paymentController.addPayment(req, res, mockNext);

        // 4. Validate
        if (res.statusCode === 201 && res.body.success) {
            console.log('✅ PASS: Controller accepted Order Number and created Payment.');
            console.log('   Payment ID:', res.body.data.id);
            console.log('   Linked Order ID:', res.body.data.order_id);

            if (res.body.data.order_id === order.id) {
                console.log('✅ PASS: Correctly resolved to Order UUID.');
            } else {
                console.log('❌ FAIL: Linked to wrong order ID?');
            }

        } else {
            console.log('❌ FAIL: Response status', res.statusCode);
            console.log('   Body:', res.body);
        }

    } catch (e) {
        console.error('❌ ERROR:', e);
    }

    // Cleanup if needed (script ends anyway)
    process.exit(0);
};

runTest();
