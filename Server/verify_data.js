const { Sequelize } = require('sequelize');
const config = require('./config/config.js')['development'];

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect
});

// Import models
const MenuCategory = require('./models/MenuCategory')(sequelize);
const ProductType = require('./models/ProductType')(sequelize);
const Offer = require('./models/Offer')(sequelize); // Assuming Offer model exists

async function verifyData() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const categoryCount = await MenuCategory.count();
        console.log(`Categories count: ${categoryCount}`);

        if (categoryCount > 0) {
            const cats = await MenuCategory.findAll({ limit: 3 });
            console.log('Sample Categories:', JSON.stringify(cats, null, 2));
        }

        const typeCount = await ProductType.count();
        console.log(`Product Types count: ${typeCount}`);

        if (typeCount > 0) {
            const types = await ProductType.findAll({ limit: 3 });
            console.log('Sample Types:', JSON.stringify(types, null, 2));
        }

        const offerCount = await Offer.count();
        console.log(`Offers count: ${offerCount}`);

        const targetOffer = await Offer.findOne({ where: { code: 'SIQUA20' } });
        if (targetOffer) {
            console.log('Found Offer SIQUA20:', JSON.stringify(targetOffer, null, 2));
        } else {
            console.log('Offer SIQUA20 NOT FOUND.');
        }

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        await sequelize.close();
    }
}

verifyData();
