const offersService = require('./offersService');
const { validationResult } = require('express-validator'); // If using express-validator, but I used Joi. 
// So I will validate using Joi in the controller or a separate middleware.
// Usually Joi validation is done in a middleware or at start of controller. 
// Let's use the validator schemas here.

const { createOfferSchema, updateOfferSchema, updateStatusSchema } = require('./offersValidator');

const validate = (schema, data) => {
    const { error } = schema.validate(data);
    if (error) {
        throw new Error(error.details[0].message);
    }
};

const getOffers = async (req, res) => {
    try {
        const result = await offersService.getOffers(req.query);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getOffersCount = async (req, res) => {
    try {
        const count = await offersService.getOffersCount(req.query);
        res.status(200).json({ success: true, count });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createOffer = async (req, res) => {
    try {
        console.log('Create Offer Body:', req.body);
        validate(createOfferSchema, req.body);
        const offer = await offersService.createOffer(req.body, req.user ? req.user.id : null);
        res.status(201).json({ success: true, data: offer });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const updateOffer = async (req, res) => {
    try {
        validate(updateOfferSchema, req.body);
        const offer = await offersService.updateOffer(req.params.id, req.body, req.user ? req.user.id : null);
        res.status(200).json({ success: true, data: offer });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const updateStatus = async (req, res) => {
    try {
        // Technically status toggle doesn't need body, just the ID. 
        // But if we wanted to set specific status, we'd use body. 
        // Requirement: "Toggle Active / Inactive".
        // Service implements toggle. 
        const offer = await offersService.updateOfferStatus(req.params.id, req.user ? req.user.id : null);
        res.status(200).json({ success: true, data: offer });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const deleteOffer = async (req, res) => {
    try {
        const result = await offersService.deleteOffer(req.params.id, req.user ? req.user.id : null);
        res.status(200).json({ success: true, message: result.message });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    getOffers,
    getOffersCount,
    createOffer,
    updateOffer,
    updateStatus,
    deleteOffer
};
