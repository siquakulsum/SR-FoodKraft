const { Payment } = require('./models');
const fs = require('fs');

async function dumpPayments() {
    console.log('Dumping payments to file...');
    try {
        const payments = await Payment.findAll({ order: [['created_at', 'DESC']] });

        const data = payments.map(p => ({
            id: p.id,
            transaction_id: p.transaction_id,
            amount: p.amount,
            created_at: p.created_at
        }));

        fs.writeFileSync('payments_dump.json', JSON.stringify(data, null, 2));
        console.log(`Dumped ${data.length} records to payments_dump.json`);

    } catch (error) {
        console.error('Error dumping payments:', error);
    } finally {
        process.exit();
    }
}

dumpPayments();
