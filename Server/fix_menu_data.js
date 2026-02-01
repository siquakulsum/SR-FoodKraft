const { Sequelize } = require('sequelize');
const config = require('./config/config.js')['development'];

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect
});

const MenuItem = require('./models/MenuItem')(sequelize);
const MenuCategory = require('./models/MenuCategory')(sequelize);
const ProductType = require('./models/ProductType')(sequelize);

async function fixData() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // 1. Get Valid Categories and Types
        const categories = await MenuCategory.findAll();
        const types = await ProductType.findAll();

        if (categories.length === 0 || types.length === 0) {
            console.error('No Categories or Types found! Run seed_menu_data.js first.');
            return;
        }

        const defaultCategoryId = categories[0].id;
        const defaultTypeId = types[0].id;

        console.log(`Default Category: ${categories[0].name} (${defaultCategoryId})`);
        console.log(`Default Type: ${types[0].name} (${defaultTypeId})`);

        // 2. Find Items with Missing/Invalid IDs and Update them
        const items = await MenuItem.findAll();
        for (const item of items) {
            let updates = {};

            // Check Category
            if (!item.category_id || item.category_id === 'biryani' || item.category_id.length < 30) { // Simple check for non-UUID
                updates.category_id = defaultCategoryId;
            }

            // Check Type
            if (!item.type_id || item.type_id === 'veg' || item.type_id === 'non-veg' || item.type_id.length < 30) {
                updates.type_id = defaultTypeId;
            }

            // Fix Image URL if it's "null" string or strictly null (but model allows null)
            // If it's a blob url or invalid, we leave it, but ensure it's TEXT type (schema update handled this)

            if (Object.keys(updates).length > 0) {
                console.log(`Fixing Item: ${item.name} ...`);
                await item.update(updates);
            }
        }

        console.log('Data fix complete.');

    } catch (error) {
        console.error('Fix failed:', error);
    } finally {
        await sequelize.close();
    }
}

fixData();
