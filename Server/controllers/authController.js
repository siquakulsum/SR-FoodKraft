const authService = require('../services/authService');
const authValidator = require('../validators/authValidator');

// Helper for standardized response
const sendResponse = (res, statusCode, success, message, data = null) => {
    res.status(statusCode).json({
        success,
        message,
        data
    });
};

// Catch async errors
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

const register = asyncHandler(async (req, res) => {
    const { error } = authValidator.registerSchema.validate(req.body);
    if (error) {
        return sendResponse(res, 400, false, error.details[0].message);
    }

    const result = await authService.register(req.body);
    sendResponse(res, 201, true, 'User registered successfully', result);
});

const login = asyncHandler(async (req, res) => {
    console.log('=== LOGIN REQUEST ===');
    console.log('Body:', req.body);

    const { error } = authValidator.loginSchema.validate(req.body);
    if (error) {
        console.log('Validation error:', error.details[0].message);
        return sendResponse(res, 400, false, error.details[0].message);
    }

    const { email, phone, password } = req.body;
    // Support email or phone in one field or separate
    const identifier = email || phone;
    console.log('Identifier:', identifier);

    try {
        const result = await authService.login(identifier, password);
        console.log('Login successful');
        sendResponse(res, 200, true, 'Login successful', result);
    } catch (err) {
        console.error('Login service error:', err.message);
        throw err; // Re-throw to be caught by asyncHandler
    }
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { error } = authValidator.forgotPasswordSchema.validate(req.body);
    if (error) {
        return sendResponse(res, 400, false, error.details[0].message);
    }

    const result = await authService.forgotPassword(req.body.email);
    sendResponse(res, 200, true, result.message);
});

const resetPassword = asyncHandler(async (req, res) => {
    const { error } = authValidator.resetPasswordSchema.validate(req.body);
    if (error) {
        return sendResponse(res, 400, false, error.details[0].message);
    }

    const result = await authService.resetPassword(req.body.token, req.body.password);
    sendResponse(res, 200, true, 'Password reset successful', result);
});

const getMe = asyncHandler(async (req, res) => {
    const user = await authService.getProfile(req.user.id);
    sendResponse(res, 200, true, 'User profile fetched', user);
});

const updateMe = asyncHandler(async (req, res) => {
    const { error } = authValidator.updateProfileSchema.validate(req.body);
    if (error) {
        return sendResponse(res, 400, false, error.details[0].message);
    }

    const result = await authService.updateProfile(req.user.id, req.body);
    sendResponse(res, 200, true, 'User profile updated', result);
});

const changePassword = asyncHandler(async (req, res) => {
    const { error } = authValidator.changePasswordSchema.validate(req.body);
    if (error) {
        return sendResponse(res, 400, false, error.details[0].message);
    }

    const result = await authService.changePassword(
        req.user.id,
        req.body.currentPassword,
        req.body.newPassword
    );
    sendResponse(res, 200, true, result.message);
});

const getUsers = asyncHandler(async (req, res) => {
    const users = await authService.getUsers();
    sendResponse(res, 200, true, 'Users fetched successfully', users);
});

module.exports = {
    register,
    login,
    forgotPassword,
    resetPassword,
    getMe,
    updateMe,
    changePassword,
    getUsers
};
