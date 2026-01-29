const { getDashboardData } = require('../services/dashboardService');
const db = require('../models');

async function testDashboard() {
    try {
        await db.sequelize.authenticate();
        console.log('Database connected.');

        console.log('Fetching dashboard data...');
        const data = await getDashboardData();

        console.log('--- Dashboard Data ---');
        console.log(JSON.stringify(data, null, 2));

        console.log('--- Verification ---');
        if (data.stats && data.recentOrders && data.charts) {
            console.log('Structure is correct.');
        } else {
            console.error('Structure is INCORRECT.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await db.sequelize.close();
    }
}

testDashboard();
