require('dotenv').config();
const { sequelize } = require('../models');

const fixSchema = async () => {
    try {
        console.log('🔄 Altering payments table to include "cash" in payment_method...');
        // MySQL specific syntax for ENUM modification
        await sequelize.query(`
            ALTER TABLE payments 
            MODIFY COLUMN payment_method ENUM('card', 'upi', 'netbanking', 'cod', 'cash') NOT NULL;
        `);
        console.log('✅ Schema updated successfully.');
    } catch (error) {
        console.error('❌ Schema update failed:', error);
    } // process.exit is not needed if node script ends naturally, but forcing exit is okay for simple script
    process.exit(0);
};

fixSchema();
