const inquiryService = require('../services/inquiryService');
const inquiryValidator = require('../validators/inquiryValidator');

// Helper for standardized response
const sendResponse = (res, statusCode, success, message, data = null) => {
    res.status(statusCode).json({
        success,
        message,
        data
    });
};

// Catch async errors
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

/**
 * Get dashboard statistics
 * GET /api/inquiries/stats
 */
const getStats = asyncHandler(async (req, res) => {
    const stats = await inquiryService.getStatistics();
    sendResponse(res, 200, true, 'Statistics fetched successfully', stats);
});

/**
 * List inquiries with filters, search, sorting, and pagination
 * GET /api/inquiries
 */
const listInquiries = asyncHandler(async (req, res) => {
    const { error, value } = inquiryValidator.listInquiriesSchema.validate(req.query);

    if (error) {
        return sendResponse(res, 400, false, error.details[0].message);
    }

    const result = await inquiryService.findInquiries(value);
    sendResponse(res, 200, true, 'Inquiries fetched successfully', result);
});

/**
 * Create new inquiry
 * POST /api/inquiries
 */
const createInquiry = asyncHandler(async (req, res) => {
    const { error } = inquiryValidator.createInquirySchema.validate(req.body);

    if (error) {
        return sendResponse(res, 400, false, error.details[0].message);
    }

    const inquiry = await inquiryService.createInquiry(req.body);
    sendResponse(res, 201, true, 'Inquiry created successfully', inquiry);
});

/**
 * Get inquiry by ID
 * GET /api/inquiries/:id
 */
const getInquiryById = asyncHandler(async (req, res) => {
    const inquiry = await inquiryService.getInquiryDetails(req.params.id);
    sendResponse(res, 200, true, 'Inquiry fetched successfully', inquiry);
});

/**
 * Update inquiry
 * PATCH /api/inquiries/:id
 */
const updateInquiry = asyncHandler(async (req, res) => {
    const { error } = inquiryValidator.updateInquirySchema.validate(req.body);

    if (error) {
        return sendResponse(res, 400, false, error.details[0].message);
    }

    const inquiry = await inquiryService.updateInquiry(req.params.id, req.body);
    sendResponse(res, 200, true, 'Inquiry updated successfully', inquiry);
});

/**
 * Update inquiry status
 * PATCH /api/inquiries/:id/status
 */
const updateStatus = asyncHandler(async (req, res) => {
    const { error } = inquiryValidator.updateStatusSchema.validate(req.body);

    if (error) {
        return sendResponse(res, 400, false, error.details[0].message);
    }

    const inquiry = await inquiryService.updateInquiryStatus(req.params.id, req.body.status);
    sendResponse(res, 200, true, 'Inquiry status updated successfully', inquiry);
});

/**
 * Update inquiry priority
 * PATCH /api/inquiries/:id/priority
 */
const updatePriority = asyncHandler(async (req, res) => {
    const { error } = inquiryValidator.updatePrioritySchema.validate(req.body);

    if (error) {
        return sendResponse(res, 400, false, error.details[0].message);
    }

    const inquiry = await inquiryService.updateInquiryPriority(req.params.id, req.body.priority);
    sendResponse(res, 200, true, 'Inquiry priority updated successfully', inquiry);
});

/**
 * Delete inquiry (soft delete)
 * DELETE /api/inquiries/:id
 */
const deleteInquiry = asyncHandler(async (req, res) => {
    const result = await inquiryService.softDeleteInquiry(req.params.id);
    sendResponse(res, 200, true, result.message);
});

/**
 * Export inquiries as CSV
 * GET /api/inquiries/export
 */
const exportInquiries = asyncHandler(async (req, res) => {
    const { error, value } = inquiryValidator.listInquiriesSchema.validate(req.query);

    if (error) {
        return sendResponse(res, 400, false, error.details[0].message);
    }

    const exportData = await inquiryService.exportInquiriesData(value);

    // Convert to CSV format
    if (exportData.length === 0) {
        return sendResponse(res, 200, true, 'No data to export', []);
    }

    const headers = Object.keys(exportData[0]);
    const csvRows = [
        headers.join(','),
        ...exportData.map(row =>
            headers.map(header => {
                const value = row[header];
                // Escape commas and quotes in CSV
                const escaped = String(value).replace(/"/g, '""');
                return `"${escaped}"`;
            }).join(',')
        )
    ];

    const csvContent = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=inquiries_${Date.now()}.csv`);
    res.send(csvContent);
});

module.exports = {
    getStats,
    listInquiries,
    createInquiry,
    getInquiryById,
    updateInquiry,
    updateStatus,
    updatePriority,
    deleteInquiry,
    exportInquiries
};
