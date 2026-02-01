const { Sequelize } = require('sequelize');
const { Offer, OfferUsage, User, AuditLog } = require('../models');
const offersService = require('../modules/offers/offersService');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars from Server/.env
const envPath = path.resolve(__dirname, '../.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error("Error loading .env file from:", envPath, result.error);
    process.exit(1);
}

// Setup independent Sequelize instance using ENV vars
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: false
    }
);

const verifyFixes = async () => {
    console.log('🚀 Starting Offers Module Verification...');

    try {
        await sequelize.authenticate();
        console.log('✓ Database connected');

        // FORCE SYNC to ensure new columns exist (Simulating migration)
        await Offer.sync({ alter: true });
        await OfferUsage.sync({ alter: true }); // Ensure this exists too
        console.log('✓ Database synced (Offer & OfferUsage tables)');

        // Create Dummy Admin
        const admin = await User.create({
            name: 'Test Admin',
            email: `admin_${Date.now()}@test.com`,
            password: 'password',
            role: 'admin'
        });
        const userId = admin.id;

        // --- TEST 1: Edit Restriction on Expired Offers ---
        console.log('\n--- TEST 1: Edit Restriction on Expired Offers ---');
        const expiredOffer = await offersService.createOffer({
            code: `EXP_${Date.now()}`,
            discount_type: 'percentage',
            discount_value: 10,
            valid_from: new Date(Date.now() - 86400000 * 2), // 2 days ago
            valid_to: new Date(Date.now() - 86400000),     // 1 day ago
            usage_limit: 100
        }, userId);

        try {
            await offersService.updateOffer(expiredOffer.id, { discount_value: 20 }, userId);
            console.error('❌ FAILED: Edited expired offer successfully (Should have failed)');
        } catch (error) {
            if (error.message === 'Cannot edit expired offer') {
                console.log('✓ PASSED: Prevented editing expired offer');
            } else {
                console.error('❌ FAILED: Unexpected error:', error.message);
            }
        }

        // --- TEST 2: Usage Limit Enforcement ---
        console.log('\n--- TEST 2: Usage Limit Enforcement ---');
        const limitOffer = await offersService.createOffer({
            code: `LIM_${Date.now()}`,
            discount_type: 'fixed',
            discount_value: 50,
            valid_from: new Date(),
            valid_to: new Date(Date.now() + 86400000),
            usage_limit: 1 // Only 1 use allowed
        }, userId);

        // First Use (Should Succeed)
        const validation1 = await offersService.validateOffer(limitOffer.code, userId, 500);
        if (validation1.valid) {
            console.log('✓ Validation 1 passed');
            await offersService.trackUsage(limitOffer.id, userId, 'ORDER_123');
            console.log('✓ Usage 1 tracked');
        }

        // Second Use (Should Fail)
        try {
            await offersService.validateOffer(limitOffer.code, userId, 500);
            console.error('❌ FAILED: Excluded usage limit (Allowed 2nd use)');
        } catch (error) {
            if (error.message === 'Offer usage limit exceeded') {
                console.log('✓ PASSED: Prevented usage beyond limit');
            } else {
                console.error('❌ FAILED: Unexpected error:', error.message);
            }
        }

        // --- TEST 3: Delete Restriction on Used Offers ---
        console.log('\n--- TEST 3: Delete Restriction on Used Offers ---');
        // Try to delete the used offer from Test 2
        try {
            await offersService.deleteOffer(limitOffer.id, userId);
            console.error('❌ FAILED: Deleted used offer (Should have failed)');
        } catch (error) {
            if (error.message.includes('Cannot delete offer that has been used')) {
                console.log('✓ PASSED: Prevented deletion of used offer');
            } else {
                console.error('❌ FAILED: Unexpected error:', error.message);
            }
        }

        // --- TEST 4: Delete Unused Offer ---
        console.log('\n--- TEST 4: Delete Unused Offer ---');
        const unusedOffer = await offersService.createOffer({
            code: `UNUSED_${Date.now()}`,
            discount_type: 'fixed',
            discount_value: 10,
            valid_from: new Date(),
            valid_to: new Date(Date.now() + 86400000)
        }, userId);

        try {
            await offersService.deleteOffer(unusedOffer.id, userId);
            console.log('✓ PASSED: Deleted unused offer');
        } catch (error) {
            console.error('❌ FAILED: Could not delete unused offer:', error.message);
        }

    } catch (error) {
        console.error('FATAL ERROR:', error);
    } finally {
        await sequelize.close();
        process.exit();
    }
};

verifyFixes();
