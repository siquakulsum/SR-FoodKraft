const db = require('./models');

async function checkTable() {
    try {
        const [results] = await db.sequelize.query('DESCRIBE cms_faqs');
        console.log('cms_faqs table structure:');
        results.forEach(col => {
            console.log(`- ${col.Field} (${col.Type})`);
        });
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkTable();
