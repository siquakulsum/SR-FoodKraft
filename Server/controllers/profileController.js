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
        const updatedUser = await profileService.updateProfile(req.user.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser
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
    uploadAvatar,
    removeAvatar
};
