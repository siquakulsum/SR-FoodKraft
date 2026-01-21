const { User } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Mock Cloud Storage Upload
// In a real scenario, this would import AWS S3 or similar
const uploadToCloud = async (file) => {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // For now, we'll just return a local path or a dummy CDN URL
    // In production, upload `file.buffer` or `file.path` to S3
    return `https://storage.example.com/avatars/${Date.now()}_${file.originalname}`;
};

const getProfile = async (userId) => {
    const user = await User.findByPk(userId, {
        attributes: ['id', 'name', 'email', 'phone', 'avatar_url', 'role']
    });
    if (!user) throw new Error('User not found');
    return user;
};

const updateProfile = async (userId, data) => {
    const { name, email, phone } = data;

    // Check if email or phone is already taken by another user
    const existingUser = await User.findOne({
        where: {
            [Op.or]: [{ email }, { phone }],
            id: { [Op.ne]: userId }
        }
    });

    if (existingUser) {
        if (existingUser.email === email) throw new Error('Email already in use');
        if (existingUser.phone === phone) throw new Error('Phone already in use');
    }

    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    // Logic for OTP verification would go here if email/phone changed
    // For now, we update directly as per instructions to mock/defer OTP

    user.name = name;
    user.email = email;
    user.phone = phone;

    await user.save();

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar_url: user.avatar_url,
        role: user.role
    };
};

const uploadAvatar = async (userId, file) => {
    if (!file) throw new Error('No file uploaded');

    // Validation: Check file type and size (Service layer validation)
    // Controller/Multer should catch this too, but double check
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
        throw new Error('Invalid file type. Only JPG and PNG allowed.');
    }

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size too large. Max 5MB.');
    }

    const avatarUrl = await uploadToCloud(file);

    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    user.avatar_url = avatarUrl;
    await user.save();

    return { avatar_url: avatarUrl };
};

const removeAvatar = async (userId) => {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    // Logic to delete from cloud storage would go here

    const defaultAvatar = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name);
    user.avatar_url = defaultAvatar;
    await user.save();

    return { avatar_url: defaultAvatar };
};

module.exports = {
    getProfile,
    updateProfile,
    uploadAvatar,
    removeAvatar
};
