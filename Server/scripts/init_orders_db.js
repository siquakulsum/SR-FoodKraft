const { OrderStatusHistory } = require('../models');

async function initDB() {
    try {
        console.log('Syncing OrderStatusHistory table...');
        await OrderStatusHistory.sync({ alter: true });
        console.log('✓ OrderStatusHistory table synced successfully.');
        process.exit(0);
    } catch (error) {
        console.error('✗ Error syncing table:', error);
        process.exit(1);
    }
}

initDB();
