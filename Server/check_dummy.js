const { Payment } = require('./models');

async function checkDummyData() {
    console.log('Checking for dummy data...');
    try {
        const dummyPayments = await Payment.findAll({
            where: {
                transaction_id: ['TXN001', 'TXN002', 'TXN003', 'TXN004', 'TXN005', 'TXN006', 'TXN007', 'TXN008', 'TXN009', 'TXN010']
            }
        });

        console.log(`Found ${dummyPayments.length} dummy records.`);
        if (dummyPayments.length > 0) {
            dummyPayments.forEach(p => console.log(`- ${p.transaction_id}: ${p.amount} (${p.payment_method})`));
        } else {
            console.log("No dummy records found with these Transaction IDs.");
        }

    } catch (error) {
        console.error('Error checking dummy data:', error);
    } finally {
        process.exit();
    }
}

checkDummyData();
