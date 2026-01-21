const customerService = require('../services/customerService');
const customerValidator = require('../validators/customerValidator');

// Helper for standardized response
const sendResponse = (res, statusCode, success, message, data = null) => {
    return res.status(statusCode).json({
        success,
        message,
        data
    });
};

const getStats = async (req, res, next) => {
    try {
        // Distinguish which stat to fetch based on route handling or just return all?
        // Requirement said separate endpoints: /customers/stats/total, /active, etc.
        // But implementation plan proposed /stats/total etc. 
        // Logic can be shared or split. 
        // Let's implement individual handlers if we want strict separation, or a single one with filtering.
        // Given the requirement "Endpoint: GET /customers/stats/total", etc.
        // I'll assume separate controller methods or a single one analyzing the path or query.

        // Actually, let's just make one stats endpoint or separate methods?
        // The service `getCustomerStats` returns all. It's efficient enough for now to call it once.
        // If strict separate endpoints are needed, I might need to filter the response.
        // Let's implement separate methods reusing the service or just one generic stats method if the route uses params.

        // Let's go with specific methods for cleaner routing matching the requirement exactly.

        const stats = await customerService.getCustomerStats();

        const type = req.path.split('/').pop(); // naive check, or just make separate functions.

        if (req.route.path.includes('total')) return sendResponse(res, 200, true, 'Total customer count', { total: stats.totalCustomers });
        if (req.route.path.includes('active')) return sendResponse(res, 200, true, 'Active customer count', { active: stats.activeCustomers });
        if (req.route.path.includes('blocked')) return sendResponse(res, 200, true, 'Blocked customer count', { blocked: stats.blockedCustomers });
        if (req.route.path.includes('revenue')) return sendResponse(res, 200, true, 'Total revenue', { revenue: stats.totalRevenue });

        // Fallback if generic /stats
        return sendResponse(res, 200, true, 'Customer stats', stats);
    } catch (error) {
        next(error);
    }
};

const getCustomers = async (req, res, next) => {
    try {
        const { error, value } = customerValidator.listCustomersSchema.validate(req.query);
        if (error) return sendResponse(res, 400, false, error.details[0].message);

        const result = await customerService.listCustomers(value);
        sendResponse(res, 200, true, 'Customers retrieved successfully', result);
    } catch (error) {
        next(error);
    }
};

const getCustomerById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const customer = await customerService.getCustomerById(id);
        sendResponse(res, 200, true, 'Customer details retrieved', customer);
    } catch (error) {
        if (error.message === 'Customer not found') return sendResponse(res, 404, false, error.message);
        next(error);
    }
};

const createCustomer = async (req, res, next) => {
    try {
        const { error, value } = customerValidator.createCustomerSchema.validate(req.body);
        if (error) return sendResponse(res, 400, false, error.details[0].message);

        const newCustomer = await customerService.createCustomer(value);
        sendResponse(res, 201, true, 'Customer created successfully', newCustomer);
    } catch (error) {
        // Basic duplicate check handling if service throws generic error
        if (error.message.includes('already in use')) return sendResponse(res, 409, false, error.message);
        next(error);
    }
};

const blockCustomer = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { error, value } = customerValidator.blockCustomerSchema.validate(req.body);
        if (error) return sendResponse(res, 400, false, error.details[0].message);

        const result = await customerService.blockCustomer(id, value.reason);
        sendResponse(res, 200, true, result.message);
    } catch (error) {
        if (error.message === 'User not found') return sendResponse(res, 404, false, error.message);
        next(error);
    }
};

const unblockCustomer = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await customerService.unblockCustomer(id);
        sendResponse(res, 200, true, result.message);
    } catch (error) {
        if (error.message === 'User not found') return sendResponse(res, 404, false, error.message);
        next(error);
    }
};

const exportCustomers = async (req, res, next) => {
    try {
        const csvData = await customerService.exportCustomersData();
        res.header('Content-Type', 'text/csv');
        res.attachment('customers.csv');
        return res.send(csvData);
    } catch (error) {
        next(error);
    }
};

const sendNotification = async (req, res, next) => {
    try {
        const { error, value } = customerValidator.sendMessageSchema.validate(req.body);
        if (error) return sendResponse(res, 400, false, error.details[0].message);

        const result = await customerService.sendBulkMessage(value.customerIds, value.message, value.type);
        sendResponse(res, 200, true, 'Notifications sent successfully', result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getStats,
    getCustomers,
    getCustomerById,
    createCustomer,
    blockCustomer,
    unblockCustomer,
    exportCustomers,
    sendNotification
};
