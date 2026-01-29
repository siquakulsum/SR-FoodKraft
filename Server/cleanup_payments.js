const { Payment } = require('./models');

async function cleanupPayments() {
    console.log('Starting payment cleanup...');

    try {
        const payments = await Payment.findAll();

        // Group by order_id using native reduce
        const paymentsByOrder = payments.reduce((acc, payment) => {
            const orderId = payment.order_id;
            if (!acc[orderId]) {
                acc[orderId] = [];
            }
            acc[orderId].push(payment);
            return acc;
        }, {});

        let deletedCount = 0;

        for (const orderId in paymentsByOrder) {
            if (paymentsByOrder[orderId].length > 1) {
                console.log(`Found duplicate payments for Order ID: ${orderId}`);
                const duplicates = paymentsByOrder[orderId];

                // Sort by created_at desc (newest first) using native sort
                const sorted = duplicates.sort((a, b) => {
                    return new Date(b.created_at) - new Date(a.created_at);
                });

                // Keep the first one (most recent)
                // const toKeep = sorted[0];
                const toDelete = sorted.slice(1);

                for (const payment of toDelete) {
                    console.log(`Deleting duplicate payment ID: ${payment.id}`);
                    await payment.destroy({ force: true });
                    deletedCount++;
                }
            }
        }

        console.log(`Cleanup complete. Deleted ${deletedCount} duplicate payments.`);
    } catch (error) {
        console.error('Error cleaning up payments:', error);
    } finally {
        process.exit();
    }
}

cleanupPayments();
