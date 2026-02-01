const { Sequelize, DataTypes } = require('sequelize');
const config = require('./config/config.js')['development'];

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect
});

const MenuCategory = require('./models/MenuCategory')(sequelize);
const ProductType = require('./models/ProductType')(sequelize);

const categories = [
    { name: 'Biryani', slug: 'biryani', display_order: 1 },
    { name: 'Curries & Gravies', slug: 'curries', display_order: 2 },
    { name: 'Rice Varieties', slug: 'rice', display_order: 3 },
    { name: 'Breads', slug: 'breads', display_order: 4 },
    { name: 'Starters', slug: 'starters', display_order: 5 },
    { name: 'Desserts', slug: 'desserts', display_order: 6 },
    { name: 'Beverages', slug: 'beverages', display_order: 7 }
];

const types = [
    { name: 'Veg', slug: 'veg', color: '#22C55E' },
    { name: 'Non-Veg', slug: 'non-veg', color: '#EF4444' },
    { name: 'Egg', slug: 'egg', color: '#F59E0B' },
    { name: 'Vegan', slug: 'vegan', color: '#10B981' }
];

const seed = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Seed Categories
        for (const cat of categories) {
            const [model, created] = await MenuCategory.findOrCreate({
                where: { slug: cat.slug },
                defaults: cat
            });
            if (created) console.log(`Created Category: ${cat.name}`);
        }

        // Seed Types
        for (const t of types) {
            const [model, created] = await ProductType.findOrCreate({
                where: { slug: t.slug },
                defaults: t
            });
            if (created) console.log(`Created Type: ${t.name}`);
        }

        console.log('Seeding completed.');
    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await sequelize.close();
    }
};

seed();
