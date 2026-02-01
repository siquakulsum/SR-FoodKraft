const { User, sequelize } = require('../models');
const bcrypt = require('bcrypt');

async function seedAdmin() {
    try {
        await sequelize.authenticate();
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash('admin123', salt);

        const [admin, created] = await User.findOrCreate({
            where: { email: 'testadmin@example.com' },
            defaults: {
                name: 'Test Admin',
                email: 'testadmin@example.com',
                password_hash: password_hash,
                role: 'admin',
                phone: '9998887776',
                is_active: true
            }
        });

        if (!created) {
            admin.password_hash = password_hash;
            admin.role = 'admin';
            await admin.save();
            console.log('Admin updated with new password (admin123)');
        } else {
            console.log('Admin created with password (admin123)');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

seedAdmin();
