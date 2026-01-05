const db = require('./backend/models');

try {
    console.log('Loading models...');
    const modelNames = Object.keys(db).filter(key => key !== 'sequelize' && key !== 'Sequelize');
    console.log(`Successfully loaded ${modelNames.length} models:`);
    console.log(modelNames.join(', '));
    console.log('Verification successful.');
} catch (error) {
    console.error('Error loading models:', error);
    process.exit(1);
}
