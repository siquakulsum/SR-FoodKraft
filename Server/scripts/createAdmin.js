const bcrypt = require('bcrypt');
const { User } = require('../models');

async function createAdminUser() {
    try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({
            where: { email: 'admin@srfoodkraft.com' }
        });

        if (existingAdmin) {
            console.log('Admin user already exists');
            return;
        }

        // Create admin user
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash('admin123', salt);

        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@srfoodkraft.com',
            phone: '9999999999',
            password_hash,
            role: 'admin',
            is_active: true
        });

        console.log('✅ Admin user created successfully!');
        console.log('Email: admin@srfoodkraft.com');
        console.log('Password: admin123');
        console.log('Role: admin');

    } catch (error) {
        console.error('Error creating admin user:', error);
    }
}

// Run if called directly
if (require.main === module) {
    createAdminUser().then(() => process.exit(0));
}

module.exports = createAdminUser;
