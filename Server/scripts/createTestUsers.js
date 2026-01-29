const bcrypt = require('bcrypt');
const { User } = require('../models');

async function createTestUsers() {
    try {
        // Create Admin User
        const existingAdmin = await User.findOne({
            where: { email: 'admin@srfoodkraft.com' }
        });

        if (!existingAdmin) {
            const adminSalt = await bcrypt.genSalt(10);
            const adminHash = await bcrypt.hash('admin123', adminSalt);

            await User.create({
                name: 'Admin User',
                email: 'admin@srfoodkraft.com',
                phone: '9999999999',
                password_hash: adminHash,
                role: 'admin',
                is_active: true
            });
            console.log('✅ Admin user created');
        } else {
            console.log('ℹ️  Admin user already exists');
        }

        // Create Customer User
        const existingCustomer = await User.findOne({
            where: { email: 'customer@test.com' }
        });

        if (!existingCustomer) {
            const customerSalt = await bcrypt.genSalt(10);
            const customerHash = await bcrypt.hash('customer123', customerSalt);

            await User.create({
                name: 'Test Customer',
                email: 'customer@test.com',
                phone: '8888888888',
                password_hash: customerHash,
                role: 'customer',
                is_active: true
            });
            console.log('✅ Customer user created');
        } else {
            console.log('ℹ️  Customer user already exists');
        }

        console.log('\n📋 Test Credentials:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('ADMIN LOGIN:');
        console.log('  Email: admin@srfoodkraft.com');
        console.log('  Password: admin123');
        console.log('  Role: admin');
        console.log('  → Will redirect to /admin after login');
        console.log('');
        console.log('CUSTOMER LOGIN:');
        console.log('  Email: customer@test.com');
        console.log('  Password: customer123');
        console.log('  Role: customer');
        console.log('  → Will redirect to customer homepage after login');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error) {
        console.error('❌ Error creating test users:', error);
    }
}

// Run if called directly
if (require.main === module) {
    createTestUsers().then(() => process.exit(0));
}

module.exports = createTestUsers;
