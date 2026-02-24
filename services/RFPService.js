const { Op } = require('sequelize');
const RFP = require('../models/RFPModel');
const RFPCategory = require('../models/RFPCategoryModel');
const RFPVendor = require('../models/RFPVendorModel');
const sequelize = require('../config/db');
const logger = require('../utils/logger');
const User = require('../models/userModel');

const getRFPByRFPNo = async (rfp_no) => {
    try {
        return await RFP.findOne({ where: { rfp_no } });
    } catch (err) {
        logger.error(`Failed to get RFP by RFP no: ${err.message}`, { route: 'getRFPByRFPNo' });
        throw new Error('Failed to get RFP by RFP no');
    }
};

const createRFP = async (item_name, rfp_no, item_description, quantity, last_date, minimum_price, maximum_price, categoriesArray, vendorsArray, adminId) => {
    try {
        return await sequelize.transaction(async (t) => {
            const rfp = await RFP.create({ item_name, rfp_no, item_description, quantity, last_date, minimum_price, maximum_price, admin_id: adminId }, { transaction: t });
            await RFPCategory.bulkCreate(categoriesArray.map((categoryId) => ({ rfp_id: rfp.id, category_id: categoryId })), { transaction: t });
            await RFPVendor.bulkCreate(vendorsArray.map((vendorId) => ({ rfp_id: rfp.id, vendor_id: vendorId })), { transaction: t });
            return rfp;
        });
    } catch (err) {
        logger.error(`Failed to create RFP: ${err.message}`, { route: 'createRFP' });
        throw new Error('Failed to create RFP');
    }
};

const getAllRFPs = async () => {
    try {
        const rfps = await RFP.findAll({
            include: [RFPCategory, RFPVendor]
        });
        return rfps.map((rfp) => {
            const rfpCategories = rfp.RFPCategories || rfp.RFPCategory || [];
            const rfpVendors = rfp.RFPVendors || rfp.RFPVendor || [];
            const categoryIds = rfpCategories.map((rc) => rc.category_id).filter(Boolean);
            const vendorIds = rfpVendors.map((rv) => rv.vendor_id).filter(Boolean);
            return {
                rfp_id: rfp.id,
                admin_id: rfp.admin_id,
                item_name: rfp.item_name,
                item_description: rfp.item_description,
                rfp_no: rfp.rfp_no,
                quantity: rfp.quantity,
                last_date: rfp.last_date,
                minimum_price: rfp.minimum_price,
                maximum_price: rfp.maximum_price,
                categories: categoryIds.join(','),
                vendors: vendorIds.join(','),
                created_at: rfp.created_at,
                updated_at: rfp.updated_at,
                status: rfp.status
            };
        });
    } catch (err) {
        logger.error(`Failed to get all RFPs: ${err.message}`, { route: 'getAllRFPs' });
        throw new Error('Failed to get all RFPs');
    }
}

const updateRFP = async (id, item_name, rfp_no, item_description, quantity, last_date, minimum_price, maximum_price, categoriesArray, vendorsArray, adminId) => {
    try {
        return await sequelize.transaction(async (t) => {
            await RFP.update(
                { item_name, rfp_no, item_description, quantity, last_date, minimum_price, maximum_price, admin_id: adminId },
                { where: { id }, transaction: t }
            );
            await RFPCategory.destroy({ where: { rfp_id: id }, transaction: t });
            const vendorIdsNum = vendorsArray.map((v) => parseInt(String(v), 10)).filter((n) => !isNaN(n));
            const existingRfpVendors = await RFPVendor.findAll({ where: { rfp_id: id }, transaction: t });
            const existingVendorIds = new Set(existingRfpVendors.map((rv) => Number(rv.vendor_id)));
            await RFPVendor.destroy({
                where: {
                    rfp_id: id,
                    vendor_id: { [Op.notIn]: vendorIdsNum },
                    applied_status: 'open'
                },
                transaction: t
            });
            const toAdd = vendorIdsNum.filter((vid) => !existingVendorIds.has(vid));
            if (toAdd.length) {
                await RFPVendor.bulkCreate(toAdd.map((vendorId) => ({ rfp_id: id, vendor_id: vendorId })), { transaction: t });
            }
            if (categoriesArray.length) {
                await RFPCategory.bulkCreate(categoriesArray.map((categoryId) => ({ rfp_id: id, category_id: categoryId })), { transaction: t });
            }
            return true;
        });
    } catch (err) {
        logger.error(`Failed to update RFP: ${err.message}`, { route: 'updateRFP' });
        throw new Error('Failed to update RFP');
    }
}

const getRFPById = async (id) => {
    try {
        const rfp = await RFP.findByPk(id, {
            include: [RFPCategory, RFPVendor]
        });
        if (!rfp) return null;
        const rfpCategories = rfp.RFPCategories || rfp.RFPCategory || [];
        const rfpVendors = rfp.RFPVendors || rfp.RFPVendor || [];
        const categoryIds = rfpCategories.map((rc) => rc.category_id).filter(Boolean);
        const vendorIds = rfpVendors.map((rv) => rv.vendor_id).filter(Boolean);
        return {
            rfp_id: rfp.id,
            admin_id: rfp.admin_id,
            item_name: rfp.item_name,
            item_description: rfp.item_description,
            rfp_no: rfp.rfp_no,
            quantity: rfp.quantity,
            last_date: rfp.last_date,
            minimum_price: rfp.minimum_price,
            maximum_price: rfp.maximum_price,
            categories: categoryIds.join(','),
            vendors: vendorIds.join(','),
            created_at: rfp.created_at,
            updated_at: rfp.updated_at,
            status: rfp.status
        };
    } catch (err) {
        logger.error(`Failed to get RFP by id: ${err.message}`, { route: 'getRFPById' });
        throw new Error('Failed to get RFP by id');
    }
}

const getAllRFPQuotes = async (id) => {
    try {
        const rows = await RFPVendor.findAll({
            where: { rfp_id: id },
            include: [{
                model: User,
                as: 'User'
            }]
        });
        return rows.map((row) => {
            const po = row.get({ plain: true });
            const vendor = po.User ? { ...po.User } : null;
            delete po.User;
            return {
                vendor_id: po.vendor_id,
                name: vendor.firstname + ' ' + vendor.lastname,
                item_price: po.item_price,
                total_cost: po.total_cost,
                email: vendor.email,
                mobile: vendor.mobile
            };
        });
    } catch (err) {
        logger.error(`Failed to get RFP quotes by id: ${err.message}`, { route: 'getAllRFPQuotes' });
        throw new Error('Failed to get RFP quotes by id');
    }
}

const closeRFP = async (id) => {
    try {
        const rfp = await RFP.findByPk(id);
        if(!rfp) return null;
        rfp.status = 'closed';
        await rfp.save();
        return rfp;
    }
    catch (err) {
        logger.error(`Failed to close RFP: ${err.message}`, { route: 'closeRFP' });
        throw new Error('Failed to close RFP');
    }
}

const applyVendorToRFP = async (rfpId, vendorId, { item_price, total_cost }) => {
    try {
        const rv = await RFPVendor.findOne({ where: { rfp_id: rfpId, vendor_id: vendorId } });
        if (!rv || rv.applied_status !== 'open') return false;
        const rfp = await RFP.findByPk(rfpId);
        const totalCost = total_cost != null && total_cost !== '' ? parseFloat(total_cost) : (rfp && rfp.quantity ? Number(item_price) * Number(rfp.quantity) : null);
        await rv.update({
            item_price: parseFloat(item_price),
            total_cost: totalCost,
            applied_status: 'applied',
            applied_at: new Date()
        });
        return true;
    } catch (err) {
        logger.error(`Failed to apply vendor to RFP: ${err.message}`, { route: 'applyVendorToRFP' });
        throw new Error('Failed to apply vendor to RFP');
    }
};

const getRFPByVendorId = async (vendorId) => {
    try {
        const rows = await RFPVendor.findAll({
            where: { vendor_id: vendorId },
            include: [{ model: RFP, include: [RFPCategory] }]
        });
        return rows.map((row) => {
            const rfp = row.RFP;
            if (!rfp) return null;
            const rfpCategories = rfp.RFPCategories || rfp.RFPCategory || [];
            const categoryIds = rfpCategories.map((rc) => rc.category_id).filter(Boolean);
            return {
                rfp_id: rfp.id,
                admin_id: rfp.admin_id,
                item_name: rfp.item_name,
                item_description: rfp.item_description,
                rfp_no: rfp.rfp_no,
                quantity: rfp.quantity,
                last_date: rfp.last_date,
                minimum_price: rfp.minimum_price,
                maximum_price: rfp.maximum_price,
                categories: categoryIds.join(','),
                created_at: rfp.created_at,
                updated_at: rfp.updated_at,
                vendor_id: row.vendor_id,
                item_price: row.item_price,
                total_cost: row.total_cost,
                rfp_status: rfp.status,
                applied_status: row.applied_status
            };
        }).filter(Boolean);
    } catch (err) {
        logger.error(`Failed to get RFP by vendor id: ${err.message}`, { route: 'getRFPByVendorId' });
        throw new Error('Failed to get RFP by vendor id');
    }
};

const getVendorQuoteForRFP = async (rfpId, vendorId) => {
    try {
        const rows = await RFPVendor.findAll({
            where: { rfp_id: rfpId, vendor_id: vendorId, applied_status: 'applied' },
            include: [{ model: User, as: 'User' }]
        });
        return rows.map((row) => {
            const po = row.get({ plain: true });
            const vendor = po.User || {};
            return {
                vendor_id: po.vendor_id,
                name: [vendor.firstname, vendor.lastname].filter(Boolean).join(' '),
                item_price: po.item_price,
                total_cost: po.total_cost,
                email: vendor.email,
                mobile: vendor.mobile
            };
        });
    } catch (err) {
        logger.error(`Failed to get vendor quote for RFP: ${err.message}`, { route: 'getVendorQuoteForRFP' });
        throw new Error('Failed to get vendor quote for RFP');
    }
};

module.exports = {
    getRFPByRFPNo,
    createRFP,
    getAllRFPs,
    updateRFP,
    getRFPById,
    getAllRFPQuotes,
    closeRFP,
    applyVendorToRFP,
    getRFPByVendorId,
    getVendorQuoteForRFP
}