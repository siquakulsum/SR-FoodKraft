const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User } = require('../models');
const { Op } = require('sequelize');

// Helper to generate JWT
const generateToken = (id, role) => {
    return jwt.sign({ userId: id, role }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

const register = async (userData) => {
    const { name, email, phone, password, role } = userData;

    // Normalize phone - treat empty string as null
    const normalizedPhone = phone && phone.trim() !== '' ? phone.trim() : null;

    // Check if user exists by email
    const existingUserByEmail = await User.findOne({
        where: { email: email }
    });

    if (existingUserByEmail) {
        throw new Error('An account with this email already exists');
    }

    // Check if user exists by phone (only if phone is provided)
    if (normalizedPhone) {
        const existingUserByPhone = await User.findOne({
            where: { phone: normalizedPhone }
        });

        if (existingUserByPhone) {
            throw new Error('An account with this phone number already exists');
        }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
        name,
        email,
        phone: normalizedPhone,
        password_hash,
        role: role || 'customer',
        is_active: true
    });

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user.id, user.role),
    };
};

const login = async (identifier, password) => {
    // identifier can be email or phone
    const user = await User.findOne({
        where: {
            [Op.or]: [
                { email: identifier },
                { phone: identifier }
            ]
        }
    });

    if (!user) {
        throw new Error('Invalid credentials');
    }

    if (user.is_blocked) {
        throw new Error('Account is blocked');
    }

    // Check if password exists (could be oauth user)
    if (!user.password_hash) {
        throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    // Update last login
    user.last_login_at = new Date();
    await user.save();

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user.id, user.role),
    };
};

// Mock In-Memory Store for reset tokens (In production, use Redis or DB table)
// Since requirements said "Store token with expiry", maybe create a model?
// Or add fields to User model?
// "Forgot Password: Generate secure reset token, Store token with expiry"
// "Use existing models" -> User model doesn't have reset token fields.
// "Generate only missing backend logic" -> But "Do not recreate models".
// However, if I can't modify the model, I can't store it in DB unless I add columns.
// Or I can use a separate table if I could generate migrations.
// Requirement: "Migrations only if required".
// So I SHOULD create a migration to add `reset_password_token` and `reset_password_expires` to users table.
// That is the cleanest way.
// I will start with this assumption, but for now I'll implement the service.  
// Wait, I should create the migration FIRST if I plan to use it.
// Let's implement `generateResetToken` assuming fields exist, and I'll add a migration step.

const forgotPassword = async (email) => {
    const user = await User.findOne({ where: { email } });

    if (!user) {
        throw new Error('User not found');
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token for storage
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Expire in 10 minutes
    const resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    // Update user - Assuming we adding these fields
    // If fields don't exist, this will fail.
    // I will create a migration to add these columns.
    await user.update({
        reset_password_token: resetPasswordToken,
        reset_password_expires: resetPasswordExpire // Sequelize handles Date
    });

    // Send email (Mock)
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    console.log('====================================');
    console.log(`EMAIL SENT TO: ${email}`);
    console.log(`RESET URL: ${resetUrl}`);
    console.log('====================================');

    return { message: 'Email sent' };
};

const resetPassword = async (token, newPassword) => {
    // Hash token to compare
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    const user = await User.findOne({
        where: {
            reset_password_token: resetPasswordToken,
            reset_password_expires: { [Op.gt]: Date.now() } // Expires in future
        }
    });

    if (!user) {
        throw new Error('Invalid token');
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(newPassword, salt);

    // Clear reset token
    // Passing null might require allowNull: true in DB (which it usually is for new cols)
    user.reset_password_token = null;
    user.reset_password_expires = null;

    await user.save();

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id, user.role),
    };
};

const updateProfile = async (userId, updateData) => {
    const user = await User.findByPk(userId);

    if (!user) {
        throw new Error('User not found');
    }

    // Filter allowed fields
    const { name, phone, avatar_url } = updateData;

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar_url) user.avatar_url = avatar_url;

    await user.save();

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar_url: user.avatar_url
    };
};

const getProfile = async (userId) => {
    const user = await User.findByPk(userId, {
        attributes: { exclude: ['password_hash', 'reset_password_token', 'reset_password_expires'] }
    });
    if (!user) throw new Error('User not found');
    return user;
};

const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await User.findByPk(userId);

    if (!user) {
        throw new Error('User not found');
    }

    if (!user.password_hash) {
        throw new Error('User does not have a password set');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
        throw new Error('Incorrect current password');
    }

    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(newPassword, salt);
    await user.save();

    return { message: 'Password updated successfully' };
};

module.exports = {
    register,
    login,
    forgotPassword,
    resetPassword,
    updateProfile,
    getProfile,
    changePassword
};
