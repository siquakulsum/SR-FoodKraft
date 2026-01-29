const db = require('./models');

console.log('=== Available Models ===');
Object.keys(db).forEach(key => {
    if (key !== 'sequelize' && key !== 'Sequelize') {
        console.log(`- ${key}`);
    }
});

console.log('\n=== Testing CMSFAQ ===');
console.log('CMSFAQ exists:', !!db.CMSFAQ);
console.log('CMSFAQ type:', typeof db.CMSFAQ);

if (db.CMSFAQ) {
    console.log('CMSFAQ tableName:', db.CMSFAQ.tableName);
    console.log('CMSFAQ attributes:', Object.keys(db.CMSFAQ.rawAttributes));
}

process.exit(0);
