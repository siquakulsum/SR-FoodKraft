const { Offer, OfferUsage } = require('../../models');
const { Op } = require('sequelize');

const preventExpiredModification = async (req, res, next) => {
    try {
        const { id } = req.params;
        const offer = await Offer.findByPk(id);

        if (!offer) {
            return res.status(404).json({ success: false, message: 'Offer not found' });
        }

        const now = new Date();
        if (offer.valid_to < now) {
            return res.status(400).json({ success: false, message: 'Cannot edit or delete expired offers' });
        }

        req.offer = offer; // Attach offer to request for reuse
        next();
    } catch (error) {
        console.error('Middleware Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const checkOfferUsage = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if offer is used
        const usageCount = await OfferUsage.count({ where: { offer_id: id } });

        if (usageCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete offer that has been used by customers'
            });
        }

        next();
    } catch (error) {
        console.error('Middleware Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    preventExpiredModification,
    checkOfferUsage
};
