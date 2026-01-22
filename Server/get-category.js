const { MenuCategory } = require('./models');
const fs = require('fs');

async function listCategories() {
    try {
        const categories = await MenuCategory.findAll();
        if (categories.length > 0) {
            const cat = categories[0];
            const info = `ID: ${cat.id}\nName: ${cat.name}`;
            console.log(info);
            fs.writeFileSync('category_info.txt', info);
        } else {
            const newCat = await MenuCategory.create({
                name: 'Main Course',
                slug: 'main-course',
                description: 'Primary meals',
                is_active: true
            });
            const info = `ID: ${newCat.id}\nName: ${newCat.name}`;
            console.log(info);
            fs.writeFileSync('category_info.txt', info);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

listCategories();
