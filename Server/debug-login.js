const { User } = require('./models');
const bcrypt = require('bcrypt');

async function debugLogin() {
    try {
        console.log('Finding user...');
        const email = 'admin@srfoodkraft.com';
        const user = await User.findOne({ where: { email } });

        if (!user) {
            console.log('User not found in DB!');
            process.exit(1);
        }

        console.log('User found:', user.email);
        console.log('Stored Hash:', user.password_hash);

        const password = 'admin123';
        console.log('Testing password:', password);

        const isMatch = await bcrypt.compare(password, user.password_hash);
        console.log('Bcrypt Compare Result:', isMatch);

        if (isMatch) {
            console.log('Password IS correct.');
        } else {
            console.log('Password is INCORRECT.');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

debugLogin();
