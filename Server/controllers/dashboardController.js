const dashboardService = require('../services/dashboardService');

const getDashboardData = async (req, res) => {
    try {
        const data = await dashboardService.getDashboardData();
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error in getDashboardData:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data',
            error: error.message
        });
    }
};

module.exports = {
    getDashboardData
};
