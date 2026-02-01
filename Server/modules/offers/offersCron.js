const cron = require('node-cron');
const { Offer, AuditLog } = require('../../models');
const { Op } = require('sequelize');

const expireOffers = async () => {
    try {
        const now = new Date();
        const expiredOffers = await Offer.findAll({
            where: {
                valid_to: { [Op.lt]: now },
                is_active: true
            }
        });

        if (expiredOffers.length > 0) {
            console.log(`[Cron] Found ${expiredOffers.length} expired active offers. Deactivating...`);

            for (const offer of expiredOffers) {
                await offer.update({ is_active: false });

                // System logs the action
                await AuditLog.create({
                    action: 'AUTO_EXPIRE_OFFER',
                    target_type: 'OFFER',
                    target_id: offer.id,
                    details: { reason: 'Offer validity expired' },
                    user_id: null // System action
                });
            }
            console.log(`[Cron] Successfully deactivated ${expiredOffers.length} offers.`);
        } else {
            console.log('[Cron] No active expired offers found.');
        }
    } catch (error) {
        console.error('[Cron] Error running expireOffers job:', error);
    }
};

const startCron = () => {
    // Run immediately on startup to catch anything missed while down
    expireOffers();

    // Schedule task check every midnight
    // 0 0 * * * = At 00:00 every day
    cron.schedule('0 0 * * *', () => {
        console.log('[Cron] Running scheduled offer expiry check...');
        expireOffers();
    });

    console.log('✓ Offers auto-expiry cron job started (Schedule: 0 0 * * *)');
};

module.exports = { startCron };
