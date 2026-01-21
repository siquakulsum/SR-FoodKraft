const { User } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Upload to local storage
// In production, replace this with AWS S3, Cloudinary, etc.
const uploadToCloud = async (file) => {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../uploads/avatars');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const filename = `${Date.now()}_${file.originalname}`;
    const filepath = path.join(uploadsDir, filename);

    // Write file to disk
    fs.writeFileSync(filepath, file.buffer);

    // Return URL path (relative to server)
    return `/uploads/avatars/${filename}`;
};

const getProfile = async (userId) => {
    const user = await User.findByPk(userId, {
        attributes: ['id', 'name', 'email', 'phone', 'avatar_url', 'role']
    });
    if (!user) throw new Error('User not found');
    return user;
};

const updateProfile = async (userId, data) => {
    const { name, email, phone, avatar_url } = data;

    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    // Only check for duplicates if email or phone is being updated
    if (email || phone) {
        const whereConditions = [];
        if (email) whereConditions.push({ email });
        if (phone) whereConditions.push({ phone });

        const existingUser = await User.findOne({
            where: {
                [Op.or]: whereConditions,
                id: { [Op.ne]: userId }
            }
        });

        if (existingUser) {
            if (existingUser.email === email) throw new Error('Email already in use');
            if (existingUser.phone === phone) throw new Error('Phone already in use');
        }
    }

    // Update only the fields that are provided
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (avatar_url !== undefined) user.avatar_url = avatar_url;

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
