const { Sequelize } = require('sequelize');
const config = require('./config/config.js')['development'];

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect
});

const MenuItem = require('./models/MenuItem')(sequelize);

async function inspectData() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        console.log('\n--- Menu Items Image URLs ---');
        const items = await MenuItem.findAll({
            attributes: ['id', 'name', 'image_url']
        });

        items.forEach(i => {
            console.log(`Name: ${i.name}`);
            console.log(`  Image URL: '${i.image_url}'`); // Quotes to see hidden spaces
            console.log('---');
        });

    } catch (error) {
        console.error('Inspection failed:', error);
    } finally {
        await sequelize.close();
    }
}

inspectData();
