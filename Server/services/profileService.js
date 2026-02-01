const { User, OtpLog, AuditLog } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const validator = require('validator');

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

// Initiate sensitive change (Mock OTP sending)
const requestSensitiveChange = async (userId, data) => {
    const { email, phone } = data;
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    // Check for duplicates before sending OTP
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

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    let contactType = 'email';
    let contactValue = email || user.email;

    if (phone && phone !== user.phone) {
        contactType = 'phone';
        contactValue = phone;
    } else if (email && email !== user.email) {
        contactType = 'email';
        contactValue = email;
    } else {
        // No sensitive change, just update metadata
        return null;
    }

    // Save to DB
    await OtpLog.create({
        user_id: userId,
        otp_code: otpCode,
        contact_type: contactType,
        contact_value: contactValue,
        expires_at: expiresAt,
        is_verified: false
    });

    console.log(`[MOCK OTP] Sent to ${contactValue}: ${otpCode}`);

    return {
        otp_required: true,
        message: `OTP sent to ${contactValue}. Please verify to complete the update.`,
        contact_type: contactType,
        contact_value: contactValue
    };
};

const verifyOtp = async (userId, otpCode, contactValue, updateData) => {
    const otpRecord = await OtpLog.findOne({
        where: {
            user_id: userId,
            contact_value: contactValue,
            otp_code: otpCode,
            is_verified: false,
            expires_at: { [Op.gt]: new Date() }
        },
        order: [['created_at', 'DESC']]
    });

    if (!otpRecord) {
        throw new Error('Invalid or expired OTP');
    }

    // [SECURITY FIX] Ensure the update payload matches the verified contact
    const intendedEmail = updateData.email;
    const intendedPhone = updateData.phone;

    if (otpRecord.contact_type === 'email' && intendedEmail && intendedEmail !== contactValue) {
        throw new Error('Security Mismatch: Verified email does not match update request');
    }
    if (otpRecord.contact_type === 'phone' && intendedPhone && intendedPhone !== contactValue) {
        throw new Error('Security Mismatch: Verified phone does not match update request');
    }

    // Mark as verified
    await otpRecord.update({ is_verified: true });

    // Proceed with update
    return await updateProfile(userId, updateData, true);
};

const updateProfile = async (userId, data, isVerified = false) => {
    const { name, email, phone, avatar_url } = data;

    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    // If email/phone changed and NOT verified, request OTP
    if ((email && email !== user.email) || (phone && phone !== user.phone)) {
        if (!isVerified) {
            const otpRequest = await requestSensitiveChange(userId, data);
            if (otpRequest) return otpRequest;
        }
    }

    const previousData = {
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar_url: user.avatar_url
    };

    // Update fields
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (avatar_url !== undefined) user.avatar_url = avatar_url;

    await user.save();

    // Audit Log for Profile Update
    try {
        await AuditLog.create({
            user_id: userId,
            action: 'PROFILE_UPDATE',
            target_type: 'USER',
            target_id: userId,
            details: {
                message: 'Admin updated profile details',
                changes: {
                    before: previousData,
                    after: { name, email, phone, avatar_url }
                }
            },
            ip_address: 'System'
        });
    } catch (auditErr) {
        console.error('Audit Log Error:', auditErr.message);
    }

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar_url: user.avatar_url,
        role: user.role,
        otp_required: false
    };
};

const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    // Verify current password
    if (!user.password_hash) {
        // Handle case where user might not have a password (e.g. OAuth), though unlikely for Admin
        throw new Error('Password not set for this user');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
        await AuditLog.create({
            user_id: userId,
            action: 'PASSWORD_CHANGE_FAILED',
            target_type: 'USER',
            target_id: userId,
            details: { reason: 'Incorrect current password' },
            ip_address: 'System'
        });
        throw new Error('Incorrect current password');
    }

    // Validate new password strength
    // Regex: At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (!strongPasswordRegex.test(newPassword)) {
        throw new Error('Password must be at least 8 characters long and contain uppercase, lowercase, number, and a special character.');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password_hash = hashedPassword;
    // user.last_password_change = new Date(); // If we had this field
    await user.save();

    await AuditLog.create({
        user_id: userId,
        action: 'PASSWORD_CHANGE_SUCCESS',
        target_type: 'USER',
        target_id: userId,
        details: { message: 'Password updated successfully' },
        ip_address: 'System'
    });

    return { message: 'Password changed successfully' };
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

    const oldAvatar = user.avatar_url;
    user.avatar_url = avatarUrl;
    await user.save();

    await AuditLog.create({
        user_id: userId,
        action: 'AVATAR_UPLOAD',
        target_type: 'USER',
        target_id: userId,
        details: { old_avatar: oldAvatar, new_avatar: avatarUrl },
        ip_address: 'System'
    });

    return { avatar_url: avatarUrl };
};

const removeAvatar = async (userId) => {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    // Logic to delete from cloud storage would go here

    const defaultAvatar = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name);
    const oldAvatar = user.avatar_url;
    user.avatar_url = defaultAvatar;
    await user.save();

    await AuditLog.create({
        user_id: userId,
        action: 'AVATAR_REMOVE',
        target_type: 'USER',
        target_id: userId,
        details: { old_avatar: oldAvatar },
        ip_address: 'System'
    });

    return { avatar_url: defaultAvatar };
};

module.exports = {
    getProfile,
    updateProfile,
    uploadAvatar,
    removeAvatar,
    verifyOtp,
    changePassword
};
