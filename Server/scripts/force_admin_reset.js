const bcrypt = require('bcrypt');
const { User } = require('../models');

async function forceResetAdmin() {
    try {
        const adminEmail = 'admin@srfoodkraft.com';
        const newPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'ChangeMeNow!';

        if (!process.env.ADMIN_DEFAULT_PASSWORD) {
            console.warn('⚠️  WARNING: Using insecure default password. Set ADMIN_DEFAULT_PASSWORD in .env');
        }

        let admin = await User.findOne({ where: { email: adminEmail } });

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);

        if (admin) {
            console.log('Found Admin. Updating password...');
            admin.password_hash = hash;
            admin.is_active = true;
            admin.is_blocked = false;
            await admin.save();
            console.log('✅ Admin password RESET to:', newPassword);
        } else {
            console.log('Admin not found. Creating new...');
            await User.create({
                name: 'Admin User',
                email: adminEmail,
                phone: '9999999999',
                password_hash: hash,
                role: 'admin',
                is_active: true
            });
            console.log('✅ Admin CREATED with password:', newPassword);
        }

    } catch (error) {
        console.error('Reset Error:', error);
    }
}

// Run if called directly
if (require.main === module) {
    forceResetAdmin().then(() => process.exit(0));
}
