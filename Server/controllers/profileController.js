const profileService = require('../services/profileService');

const getProfile = async (req, res) => {
    try {
        const user = await profileService.getProfile(req.user.id);
        res.status(200).json({
            success: true,
            message: 'Profile fetched successfully',
            data: user
        });
    } catch (error) {
        console.error('Get Profile Error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Server Error'
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const result = await profileService.updateProfile(req.user.id, req.body);

        // If OTP is required, return 202 Accepted or 200 with specific flag
        if (result.otp_required) {
            return res.status(202).json({
                success: true,
                message: result.message,
                data: result
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: result
        });
    } catch (error) {
        console.error('Update Profile Error:', error.message);
        const status = error.message.includes('already in use') ? 409 : 500;
        res.status(status).json({
            success: false,
            message: error.message || 'Server Error'
        });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { otp, contact_value, update_data } = req.body;
        const result = await profileService.verifyOtp(req.user.id, otp, contact_value, update_data);
        res.status(200).json({
            success: true,
            message: 'OTP verified and profile updated successfully',
            data: result
        });
    } catch (error) {
        console.error('Verify OTP Error:', error.message);
        res.status(400).json({
            success: false,
            message: error.message || 'Verification Failed'
        });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const result = await profileService.changePassword(req.user.id, currentPassword, newPassword);
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('Change Password Error:', error.message);
        res.status(400).json({
            success: false,
            message: error.message || 'Change Password Failed'
        });
    }
};

const uploadAvatar = async (req, res) => {
    try {
        const result = await profileService.uploadAvatar(req.user.id, req.file);
        res.status(200).json({
            success: true,
            message: 'Avatar uploaded successfully',
            data: result
        });
    } catch (error) {
        console.error('Upload Avatar Error:', error.message);
        res.status(400).json({
            success: false,
            message: error.message || 'Upload Failed'
        });
    }
};

const removeAvatar = async (req, res) => {
    try {
        const result = await profileService.removeAvatar(req.user.id);
        res.status(200).json({
            success: true,
            message: 'Avatar removed successfully',
            data: result
        });
    } catch (error) {
        console.error('Remove Avatar Error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Server Error'
        });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    verifyOtp,
    changePassword,
    uploadAvatar,
    removeAvatar
};
