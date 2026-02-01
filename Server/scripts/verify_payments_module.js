require('dotenv').config();
const { Payment, Order, User, AuditLog, sequelize } = require('../models');
const { Op } = require('sequelize');
const paymentService = require('../services/paymentService');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Helpers
const generateRandomId = () => crypto.randomBytes(4).toString('hex');

// Helper to save results
const saveResults = (res) => {
    console.log('\n🏁 Final Payment Verification Results:');
    console.table(res);
    try {
        fs.writeFileSync(path.join(__dirname, 'payments_results.json'), JSON.stringify(res, null, 2));
    } catch (e) { console.error('Error writing results:', e); }
};

const runVerification = async () => {
    console.log('🚀 Starting Payments Module Verification (TC-112 to TC-125)...');
    const results = {};
    let testUser, testOrder, testPaymentId;

    try {
        // --- SETUP ---
        console.log('\n🛠️  Setup: Creating Test Data...');
        try {
            testUser = await User.findOne({ where: { role: 'customer' } });
            if (!testUser) throw new Error('No customer user found.');

            testOrder = await Order.create({
                user_id: testUser.id,
                order_number: `ORD-${generateRandomId()}`,
                status: 'pending',
                order_type: 'delivery',
                delivery_address_json: { street: 'Payment St', city: 'Finance City' },
                total_amount: 1234.56,
                subtotal: 1000.00,
                gst_amount: 100.00,
                delivery_charges: 134.56,
                event_date: new Date(),
                event_time: '12:00:00'
            });
            console.log(`PASS: Created Order ${testOrder.order_number}`);
        } catch (setupErr) {
            console.error('❌ FATAL SETUP ERROR:', setupErr);
            results['SETUP'] = 'FAIL: ' + setupErr.message;
            saveResults(results);
            return;
        }

        // --- TC-112: Add Payment ---
        console.log('\n🔍 TC-112: Verify Add Payment (Manual)...');
        try {
            const paymentData = {
                order_id: testOrder.id,
                amount: 1234.56,
                payment_method: 'cash',
                transaction_id: `TXN-${generateRandomId()}`,
                status: 'pending',
                provider: 'manual',
                provider_response: {}
            };
            const payment = await paymentService.addPayment(paymentData, testUser.id, '127.0.0.1');
            testPaymentId = payment.id;

            if (payment && payment.id) {
                console.log('   PASS: Payment created successfully.');
                results['TC-112'] = 'PASS';
            } else { throw new Error('No ID returned'); }
        } catch (e) {
            console.error('   ❌ FAIL TC-112: ' + e.message);
            results['TC-112'] = 'FAIL: ' + e.message;

            // Fallback
            console.log('   ⚠️ Creating Fallback Payment via Model...');
            try {
                const fb = await Payment.create({
                    order_id: testOrder.id,
                    amount: 1234.56,
                    payment_method: 'cash',
                    transaction_id: `TXN-${generateRandomId()}`,
                    status: 'pending',
                    provider: 'manual',
                    provider_response: {}
                });
                testPaymentId = fb.id;
            } catch (fbErr) {
                console.error('   ❌ FATAL FALLBACK ERROR:', fbErr);
                results['FALLBACK'] = 'FAIL: ' + fbErr.message;
                saveResults(results);
                return;
            }
        }

        // --- TC-116: Verify Transaction ID Column ---
        console.log('\n🔍 TC-116: Verify Transaction ID Format...');
        try {
            const p116 = await Payment.findByPk(testPaymentId);
            if (p116 && p116.transaction_id.startsWith('TXN-')) {
                console.log(`   PASS: ID format correct (${p116.transaction_id}).`);
                results['TC-116'] = 'PASS';
            } else {
                console.log(`   FAIL: ID format incorrect (${p116 ? p116.transaction_id : 'null'}).`);
                results['TC-116'] = 'FAIL';
            }
        } catch (e) { results['TC-116'] = 'ERROR: ' + e.message; }

        // --- TC-118: Verify Amount Column Precision ---
        console.log('\n🔍 TC-118: Verify Amount Precision...');
        try {
            const p118 = await Payment.findByPk(testPaymentId);
            const storedAmount = parseFloat(p118.amount);
            if (storedAmount === 1234.56) {
                console.log(`   PASS: Amount matches exactly (${storedAmount}).`);
                results['TC-118'] = 'PASS';
            } else {
                console.log(`   FAIL: Amount mismatch (Expected 1234.56, Got ${storedAmount}).`);
                results['TC-118'] = 'FAIL';
            }
        } catch (e) { results['TC-118'] = 'ERROR: ' + e.message; }

        // --- TC-119: Verify Payment Mode Badge (Enum) ---
        console.log('\n🔍 TC-119: Verify Payment Mode Enum...');
        try {
            const p119 = await Payment.findByPk(testPaymentId);
            if (['cash', 'upi', 'card', 'netbanking', 'cod'].includes(p119.payment_method)) {
                console.log(`   PASS: Mode valid (${p119.payment_method}).`);
                results['TC-119'] = 'PASS';
            } else {
                console.log(`   FAIL: Invalid mode (${p119.payment_method}).`);
                results['TC-119'] = 'FAIL';
            }
        } catch (e) { results['TC-119'] = 'ERROR: ' + e.message; }

        // --- TC-121: Verify Date Column Display ---
        console.log('\n🔍 TC-121: Verify Date Column...');
        try {
            const p121 = await Payment.findByPk(testPaymentId);
            if (p121.createdAt instanceof Date && !isNaN(p121.createdAt)) {
                console.log('   PASS: CreatedAt is valid Date.');
                results['TC-121'] = 'PASS';
            } else if (p121.created_at) {
                console.log('   PASS: created_at exists.');
                results['TC-121'] = 'PASS (Backend OK)';
            } else {
                console.log('   FAIL: Missing timestamp.');
                results['TC-121'] = 'FAIL';
            }
        } catch (e) { results['TC-121'] = 'ERROR: ' + e.message; }

        // --- TC-117: Verify Customer Column Display (Join) ---
        console.log('\n🔍 TC-117: Verify Customer Column (Join)...');
        try {
            const p117 = await paymentService.getPaymentById(testPaymentId);
            if (p117.order && p117.order.user && p117.order.user.name) {
                console.log(`   PASS: Customer linked (${p117.order.user.name}).`);
                results['TC-117'] = 'PASS';
            } else {
                console.log('   FAIL: Customer join failed.');
                results['TC-117'] = 'FAIL';
            }
        } catch (e) { results['TC-117'] = 'ERROR: ' + e.message; }

        // --- TC-122: Verify Action: View Details ---
        console.log('\n🔍 TC-122: Verify View Details...');
        try {
            const det = await paymentService.getPaymentById(testPaymentId);
            if (det.id === testPaymentId) {
                console.log('   PASS: Details fetched.');
                results['TC-122'] = 'PASS';
            } else { results['TC-122'] = 'FAIL'; }
        } catch (e) { results['TC-122'] = 'ERROR: ' + e.message; }

        // --- TC-123: Verify Action: Edit (Manual Correction) ---
        console.log('\n🔍 TC-123: Verify Edit (Manual Correction)...');
        try {
            await paymentService.updatePayment(testPaymentId, { status: 'completed' }, testUser.id, '127.0.0.1');
            const pUpdated = await Payment.findByPk(testPaymentId);

            const statusOk = pUpdated.status === 'completed';
            const log = await AuditLog.findOne({
                where: { target_id: testPaymentId, action: 'UPDATE_PAYMENT' }
            });

            if (statusOk && log) {
                console.log('   PASS: Status updated and Audited.');
                results['TC-123'] = 'PASS';
            } else {
                console.log(`   FAIL: Status: ${pUpdated.status}, Log: ${!!log}`);
                results['TC-123'] = 'FAIL';
            }
        } catch (e) { results['TC-123'] = 'ERROR: ' + e.message; }

        // --- TC-120: Verify Status Column status ---
        console.log('\n🔍 TC-120: Verify Status Column...');
        try {
            const p120 = await Payment.findByPk(testPaymentId);
            if (p120.status === 'completed') {
                console.log('   PASS: Status persistence verified.');
                results['TC-120'] = 'PASS';
            } else { results['TC-120'] = 'FAIL'; }
        } catch (e) { results['TC-120'] = 'ERROR: ' + e.message; }

        // --- TC-125: Verify Duplicate Payment Prevention ---
        console.log('\n🔍 TC-125: Verify Duplicate Payment Prevention...');
        try {
            await paymentService.addPayment({
                order_id: testOrder.id,
                amount: 50.00,
                payment_method: 'cash',
                status: 'completed',
                provider_response: {}
            }, testUser.id, '1.1.1.1');

            console.log('   FAIL: Duplicate payment allowed.');
            results['TC-125'] = 'FAIL';
        } catch (e) {
            if (e.message.includes('Order already has a completed payment')) {
                console.log('   PASS: Blocked duplicate successfully.');
                results['TC-125'] = 'PASS';
            } else {
                console.log('   FAIL: Incorrect error message: ' + e.message);
                results['TC-125'] = 'FAIL (Wrong Error)';
            }
        }

        // --- TC-113: Verify Export CSV ---
        console.log('\n🔍 TC-113: Verify Export CSV...');
        try {
            const csv = await paymentService.exportPayments({ status: 'completed' });
            if (typeof csv === 'string' && csv.includes(testPaymentId)) {
                console.log('   PASS: CSV contains test payment.');
                results['TC-113'] = 'PASS';
            } else {
                console.log('   FAIL: CSV missing data.');
                results['TC-113'] = 'FAIL';
            }
        } catch (e) { results['TC-113'] = 'ERROR: ' + e.message; }

        // --- TC-114: Verify Search Bar ---
        console.log('\n🔍 TC-114: Verify Search Bar...');
        try {
            const pSearch = await Payment.findByPk(testPaymentId);
            const searchRes = await paymentService.getAllPayments({ search: pSearch.transaction_id });
            if (searchRes.payments.length > 0 && searchRes.payments.some(p => p.id === testPaymentId)) {
                console.log('   PASS: Found by ID.');
                results['TC-114'] = 'PASS';
            } else {
                console.log('   FAIL: Search failed.');
                results['TC-114'] = 'FAIL';
            }
        } catch (e) { results['TC-114'] = 'ERROR: ' + e.message; }

        // --- TC-115: Verify Filters ---
        console.log('\n🔍 TC-115: Verify Filters...');
        try {
            const filterRes = await paymentService.getAllPayments({ payment_method: 'cash', status: 'completed' });
            if (filterRes.payments.some(p => p.id === testPaymentId)) {
                console.log('   PASS: Filter match.');
                results['TC-115'] = 'PASS';
            } else {
                console.log('   FAIL: Filter missed record.');
                results['TC-115'] = 'FAIL';
            }
        } catch (e) { results['TC-115'] = 'ERROR: ' + e.message; }

        // --- TC-124: Verify Soft Delete ---
        console.log('\n🔍 TC-124: Verify Soft Delete...');
        try {
            await paymentService.deletePayment(testPaymentId, testUser.id, '1.1.1.1');
            const pDeleted = await Payment.findByPk(testPaymentId); // Should be null
            const pRaw = await Payment.findOne({ where: { id: testPaymentId }, paranoid: false }); // Should exist

            if (pDeleted === null && pRaw && pRaw.deletedAt) {
                console.log('   PASS: Soft deleted.');
                results['TC-124'] = 'PASS';
            } else {
                console.log(`   FAIL: Active=${!!pDeleted}, Raw=${!!pRaw}`);
                results['TC-124'] = 'FAIL';
            }
        } catch (e) { results['TC-124'] = 'ERROR: ' + e.message; }

    } catch (gErr) {
        console.error('❌ GLOBAL SCRIPT ERROR:', gErr);
    } finally {
        saveResults(results);
    }
};

runVerification();
