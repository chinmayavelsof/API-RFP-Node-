const logger = require('../utils/logger');
const RFPService = require('../services/RFPService');
const categoryService = require('../services/categoryService');
const vendorService = require('../services/vendorService');
const jwt = require('jsonwebtoken');

const validateCreateRFP = (item_name, rfp_no, item_description, quantity, last_date, minimum_price, maximum_price, categories, vendors) => {
    const errors = [];
    if(!item_name || String(item_name).trim() === '') {
        errors.push('Item name is required');
    }else if(item_name.length < 3 || item_name.length > 255) {
        errors.push('Item name must be between 3 and 255 characters');
    }
    if(!rfp_no || String(rfp_no).trim() === '') {
        errors.push('RFP number is required');
    }else if( rfp_no.length > 50) {
        errors.push('RFP number must be less than 50 characters');
    }
    // Description is optional
    if(item_description && item_description.length > 1000) {
        errors.push('Item description must be less than 1000 characters');
    }
    if(!quantity || String(quantity).trim() === '') {
        errors.push('Quantity is required');
    }else if(quantity < 1) {
        errors.push('Quantity must be greater than 0');
    }
    // last date must not be in the past
    if(!last_date || String(last_date).trim() === '') {
        errors.push('Last date is required');
    }else if(last_date < new Date()) {
        errors.push('Last date must not be in the past');
    }
    if(!minimum_price || String(minimum_price).trim() === '') {
        errors.push('Minimum price is required');
    }else if(minimum_price < 0) {
        errors.push('Minimum price must be greater than 0');
    }
    if(!maximum_price || String(maximum_price).trim() === '') {
        errors.push('Maximum price is required');
    }else if(maximum_price < 0) {
        errors.push('Maximum price must be greater than 0');
    }
    // Max price must be greater than minimum price
    if(maximum_price < minimum_price) {
        errors.push('Maximum price must be greater than minimum price');
    }
    if(!categories || String(categories).trim() === '') {
        errors.push('Categories are required');
    }
    if(!vendors || String(vendors).trim() === '') {
        errors.push('Vendors are required');
    }
    return errors;
}

const createRFP = async (req, res) => {
    const { item_name, rfp_no, item_description, quantity, last_date, minimum_price, maximum_price, categories, vendors } = req.body;
    // get the admin id from the token decoded
    const decoded = jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET);
    const adminId = decoded.id;
    const errors = validateCreateRFP(item_name, rfp_no, item_description, quantity, last_date, minimum_price, maximum_price, categories, vendors);
    if(errors.length > 0) {
        logger.error(`Validation errors: ${errors}`, { route: 'createRFP' });
        return res.status(200).json({ response: "error", error: errors });
    }
    // check if rfp_no is already exists
    try {
        const rfp = await RFPService.getRFPByRFPNo(rfp_no);
        if(rfp) {
            logger.error(`RFP number already exists`, { route: 'createRFP' });
            return res.status(200).json({ response: "error", error: "RFP number already exists" });
        }
        const categoriesArray = req.body.categories.split(',');
        const vendorsArray = req.body.vendors.split(',');
        for(const category of categoriesArray) {
            const categoryId = await categoryService.getCategoryById(category);
            if(!categoryId) {
                logger.error(`Category not found`, { route: 'createRFP' });
                return res.status(200).json({ response: "error", error: "Category not found" });
            }
        }
        for(const vendor of vendorsArray) {
            const vendorId = await vendorService.getVendorDetailsByUserId(vendor);
            if(!vendorId) {
                logger.error(`Vendor not found`, { route: 'createRFP' });
                return res.status(200).json({ response: "error", error: "Vendor not found" });
            }
        }
        // if the RFP created successfully then return success else return error
        await RFPService.createRFP(item_name, rfp_no, item_description, quantity, last_date, minimum_price, maximum_price, categoriesArray, vendorsArray, adminId);
        logger.info(`RFP created successfully`, { route: 'createRFP' });
        return res.status(200).json({ response: "success", message: "RFP created successfully" });
    } catch (err) {
        logger.error(`Internal server error: ${err.message}`, { route: 'createRFP' });
        return res.status(200).json({ response: "error", error: ["Internal server error"] });
    }
}

const getAllRFPs = async (req, res) => {
    try {
        const rfps = await RFPService.getAllRFPs();
        if(!rfps) {
            logger.error(`No RFPs found`, { route: 'getAllRFPs' });
            return res.status(200).json({ response: "error", error: "No RFPs found" });
        }else{
            logger.info(`RFPs found`, { route: 'getAllRFPs' });
            return res.status(200).json({ response: "success", rfps: rfps });
        }
    } catch (err) {
        logger.error(`Internal server error: ${err.message}`, { route: 'getAllRFPs' });
        return res.status(200).json({ response: "error", error: ["Internal server error"] });
    }
}

const updateRFP = async (req, res) => {
    const { id } = req.params;
    const decoded = jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET);
    const adminId = decoded.id;
    const { item_name, rfp_no, item_description, quantity, last_date, minimum_price, maximum_price, categories, vendors } = req.body;
    const errors = validateCreateRFP(item_name, rfp_no, item_description, quantity, last_date, minimum_price, maximum_price, categories, vendors);
    if(errors.length > 0) {
        logger.error(`Validation errors: ${errors}`, { route: 'updateRFP' });
        return res.status(200).json({ response: "error", error: errors });
    }
    try {
        const rfp = await RFPService.getRFPById(id);
        if(!rfp) {
            logger.error(`RFP not found`, { route: 'updateRFP' });
            return res.status(200).json({ response: "error", error: "RFP not found" });
        }
        const categoriesArray = req.body.categories.split(',');
        const vendorsArray = req.body.vendors.split(',');
        for(const category of categoriesArray) {
            const categoryId = await categoryService.getCategoryById(category);
            if(!categoryId) {
                logger.error(`Category not found`, { route: 'createRFP' });
                return res.status(200).json({ response: "error", error: "Category not found" });
            }
        }
        for(const vendor of vendorsArray) {
            const vendorId = await vendorService.getVendorDetailsByUserId(vendor);
            if(!vendorId) {
                logger.error(`Vendor not found`, { route: 'createRFP' });
                return res.status(200).json({ response: "error", error: "Vendor not found" });
            }
        }
        // if the RFP created successfully then return success else return error
        await RFPService.updateRFP(id, item_name, rfp_no, item_description, quantity, last_date, minimum_price, maximum_price, categoriesArray, vendorsArray, adminId);
        logger.info(`RFP updated successfully`, { route: 'updateRFP' });
        return res.status(200).json({ response: "success", message: "RFP updated successfully" });
    } catch (err) {
        logger.error(`Internal server error: ${err.message}`, { route: 'updateRFP' });
        return res.status(200).json({ response: "error", error: ["Internal server error"] });
    }
}

const getRFPById = async (req, res) => {
    const { id } = req.params;
    try {
        const rfp = await RFPService.getRFPById(id);
        if(!rfp) {
            logger.error(`RFP not found`, { route: 'getRFPById' });
            return res.status(200).json({ response: "error", error: "RFP not found" });
        }
        logger.info(`RFP found`, { route: 'getRFPById' });
        return res.status(200).json({ response: "success", rfp: rfp });
    } catch (err) {
        logger.error(`Internal server error: ${err.message}`, { route: 'getRFPById' });
        return res.status(200).json({ response: "error", error: ["Internal server error"] });
    }
}

const getAllRFPQuotes = async (req, res) => {
    const { id } = req.params;
    try {
        const rfp = await RFPService.getRFPById(id);
        if(!rfp) {
            logger.error(`RFP not found`, { route: 'getAllRFPQuotes' });
            return res.status(200).json({ response: "error", error: "RFP not found" });
        }
        const rfpQuotes = await RFPService.getAllRFPQuotes(id);
        if(!rfpQuotes){
            logger.error(`RFP Quotes not found`, { route: 'getAllRFPQuotes' });
            return res.status(200).json({ response: "error", error: "RFP not found" });
        }

        return res.status(200).json({ response: "success", quotes: rfpQuotes });
    } catch (err) {
        logger.error(`Internal server error: ${err.message}`, { route: 'getAllRFPQuotes' });
        return res.status(200).json({ response: "error", error: ["Internal server error"] });
    }
}

const closeRFP = async (req, res) => {
    const { id } = req.params;
    try {
        const rfp = await RFPService.closeRFP(id);
        if(!rfp) {
            logger.error(`RFP not found`, { route: 'closeRFP' });
            return res.status(200).json({ response: "error", error: "RFP not found" });
        }
        logger.info(`RFP closed successfully`, { route: 'closeRFP' });
        return res.status(200).json({ response: "success", message: "RFP closed successfully" });
    } catch (err) {
        logger.error(`Internal server error: ${err.message}`, { route: 'closeRFP' });
        return res.status(200).json({ response: "error", error: ["Internal server error"] });
    }
}

const applyForRFP = async (req, res) => {
    const { id } = req.params;
    const { item_price, total_cost } = req.body;
    const vendorId = req.user.id;

    if (!item_price || String(item_price).trim() === '') {
        return res.status(200).json({ response: "error", error: "Item price is required" });
    }
    const itemPrice = parseFloat(item_price);
    if (isNaN(itemPrice) || itemPrice < 0) {
        return res.status(200).json({ response: "error", error: "Invalid item price" });
    }

    try {
        const rfp = await RFPService.getRFPById(id);
        if (!rfp) {
            return res.status(200).json({ response: "error", error: "RFP not found" });
        }
        if (rfp.status === 'closed') {
            return res.status(200).json({ response: "error", error: "RFP is closed" });
        }

        const applied = await RFPService.applyVendorToRFP(id, vendorId, {
            item_price: item_price,
            total_cost: total_cost != null && total_cost !== '' ? parseFloat(total_cost) : null,
        });

        if (!applied) {
            return res.status(200).json({ response: "error", error: "You are not assigned to this RFP or already applied" });
        }
        logger.info(`Vendor applied for RFP successfully`, { route: 'applyForRFP' });
        return res.status(200).json({ response: "success", message: "Quote submitted successfully" });
    } catch (err) {
        logger.error(`applyForRFP: ${err.message}`, { route: 'applyForRFP' });
        return res.status(200).json({ response: "error", error: "Internal server error" });
    }
};

const getRFPByVendorId = async (req, res) => {
    const { vendor_id } = req.params;
    if (req.user.type === 'vendor' && String(req.user.id) !== String(vendor_id)) {
        return res.status(200).json({ response: "error", error: "Forbidden" });
    }
    try {
        const rfps = await RFPService.getRFPByVendorId(vendor_id);
        return res.status(200).json({ response: "success", rfps: rfps || [] });
    } catch (err) {
        logger.error(`getRFPByVendorId: ${err.message}`, { route: 'getRFPByVendorId' });
        return res.status(200).json({ response: "error", error: "Internal server error" });
    }
};

const getRFPQuotes = async (req, res) => {
    const { id } = req.params;
    try {
        const rfp = await RFPService.getRFPById(id);
        if (!rfp) {
            return res.status(200).json({ response: "error", error: "RFP not found" });
        }
        const isAdmin = req.user.type === 'admin';
        const quotes = isAdmin
            ? await RFPService.getAllRFPQuotes(id)
            : await RFPService.getVendorQuoteForRFP(id, req.user.id);
        if (!isAdmin && (!quotes || quotes.length === 0)) {
            return res.status(200).json({ response: "success", message: "You have not applied for the RFP" });
        }
        return res.status(200).json({ response: "success", quotes: quotes || [] });
    } catch (err) {
        logger.error(`getRFPQuotes: ${err.message}`, { route: 'getRFPQuotes' });
        return res.status(200).json({ response: "error", error: "Internal server error" });
    }
};

module.exports = {
    createRFP,
    getAllRFPs,
    updateRFP,
    getRFPById,
    getAllRFPQuotes,
    closeRFP,
    applyForRFP,
    getRFPByVendorId,
    getRFPQuotes
}