const fs = require('fs');
const path = require('path');
const dashboardService = require('../services/dashboardService');
const { sequelize } = require('../models');

async function verify() {
    try {
        console.log("Connecting...");
        await sequelize.authenticate();
        console.log("Fetching...");
        const data = await dashboardService.getDashboardData();
        fs.writeFileSync(path.join(__dirname, '../../dashboard_data.json'), JSON.stringify(data, null, 2), 'utf8');
        console.log("Written to dashboard_data.json");
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await sequelize.close();
    }
}

verify();
