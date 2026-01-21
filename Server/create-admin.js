const bcrypt = require('bcrypt');
const { User } = require('./models');

async function createAdmin() {
    try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({
            where: { email: 'admin@srfoodkraft.com' }
        });

        if (existingAdmin) {
            console.log('✓ Admin user already exists!');
            console.log('Email:', existingAdmin.email);
            console.log('Role:', existingAdmin.role);
            process.exit(0);
        }

        // Create admin user
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash('admin123', salt);

        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@srfoodkraft.com',
            phone: '1234567890',
            password_hash,
            role: 'admin',
            is_active: true
        });

        console.log('✓ Admin user created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Email:    admin@srfoodkraft.com');
        console.log('Password: admin123');
        console.log('Role:     admin');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\nYou can now login with these credentials!');

        process.exit(0);
    } catch (error) {
        console.error('✗ Error creating admin user:', error.message);
        process.exit(1);
    }
}

createAdmin();
