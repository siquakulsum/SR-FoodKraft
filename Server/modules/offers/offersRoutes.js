const express = require('express');
const router = express.Router();
const offersController = require('./offersController');
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');
const { preventExpiredModification, checkOfferUsage } = require('./offersMiddleware');

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/', offersController.getOffers);
router.get('/count', offersController.getOffersCount);

router.post('/', offersController.createOffer);

router.patch('/:id', preventExpiredModification, offersController.updateOffer);
router.patch('/:id/status', offersController.updateStatus);

router.delete('/:id', preventExpiredModification, checkOfferUsage, offersController.deleteOffer);

module.exports = router;
