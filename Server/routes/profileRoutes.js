const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const profileController = require('../controllers/profileController');
const profileValidator = require('../validators/profileValidator');

// Configure Multer (Memory storage handles the file buffer for our service to simulate cloud upload)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit catch at route level too
});

// All routes are protected and restricted to admin
router.use(protect);
router.use(authorize('admin'));

// GET /admin/profile
router.get('/', profileController.getProfile);

// PATCH /admin/profile
router.patch('/', profileValidator.updateProfile, profileController.updateProfile);

// POST /admin/profile/avatar
router.post('/avatar', upload.single('avatar'), profileController.uploadAvatar);

// DELETE /admin/profile/avatar
router.delete('/avatar', profileController.removeAvatar);

// POST /admin/profile/verify-otp
router.post('/verify-otp', profileController.verifyOtp);

// POST /admin/profile/change-password
router.post('/change-password', profileController.changePassword);

module.exports = router;
