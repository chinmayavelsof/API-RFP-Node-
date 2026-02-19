const categoryService = require('../services/categoryService');
const logger = require('../utils/logger');

const getCategoryList = async (req, res) => {
    try {
        const categories = await categoryService.getCategoryList();
        // {"192":{"id":192,"name":"Computerize","status":"Inactive"} format should be like this {192: {id: 192, name: "Computerize", status: "Inactive"}}
        const categoryList = categories.reduce((acc, category) => {
            acc[category.id] = {
                id: category.id,
                name: category.name,
                status: category.status
            };
            return acc;
        }, {});
        return res.status(200).json({ response: "success", categories: categoryList });
    } catch (err) {
        logger.error(`Failed to get category list: ${err.message}`, { route: 'getCategoryList' });
        return res.status(200).json({ response: "error", error: ["Internal server error"] });
    }
}

const getCategoryById = async (req, res) => {
    try {
        const category = await categoryService.getCategoryById(req.params.id);
        return res.status(200).json({ response: "success", category });
    } catch (err) {
        logger.error(`Failed to get category by id: ${err.message}`, { route: 'getCategoryById' });
        return res.status(200).json({ response: "error", error: ["Internal server error"] });
    }
}

const createCategory = async (req, res) => {
    const { name } = req.body;
    if(!name || name.trim() === '' || name.length < 3 || name.length > 191) {
        return res.status(200).json({ response: "error", error: "Name is required and must be between 3 and 191 characters" });
    }
    try {
    // Unique category name check 
    let category = await categoryService.getCategoryByName(name);
    if(category) {
        return res.status(200).json({ response: "error", error: "Category name already exists" });
    }
        category = await categoryService.createCategory(name);
        return res.status(200).json({ response: "success"});
    } catch (err) {
        logger.error(`Failed to create category: ${err.message}`, { route: 'createCategory' });
        return res.status(200).json({ response: "error", error: ["Internal server error"] });
    }
}

const deleteCategory = async (req, res) => {
    const id = req.params.id;
    if(!id || id.trim() === '' || id.length < 1) {
        return res.status(200).json({ response: "error", error: "ID is required" });
    }
    try {
        const category = await categoryService.getCategoryById(id);
        if(!category) {
            return res.status(200).json({ response: "error", error: "Category not found" });
        }
        await categoryService.deleteCategory(id);
    } catch (err) {
        logger.error(`Failed to delete category: ${err.message}`, { route: 'deleteCategory' });
        return res.status(200).json({ response: "error", error: ["Internal server error"] });
    }
    return res.status(200).json({ response: "success"});
}

const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if(!id || id.trim() === '' || id.length < 1) {
        return res.status(200).json({ response: "error", error: "ID is required" });
    }
    if(!name || name.trim() === '' || name.length < 3 || name.length > 191) {
        return res.status(200).json({ response: "error", error: "Name is required and must be between 3 and 191 characters" });
    }
    try {
        let category = await categoryService.getCategoryById(id);
        if(!category) {
            return res.status(200).json({ response: "error", error: "Category not found" });
        }
        category = await categoryService.updateCategory(id, name);
    } catch (err) {
        logger.error(`Failed to update category: ${err.message}`, { route: 'updateCategory' });
        return res.status(200).json({ response: "error", error: ["Internal server error"] });
    }
    return res.status(200).json({ response: "success"});
}

const updateCategoryStatus = async (req, res) => {
    const id = req.params.id;
    if(!id || id.trim() === '' || id.length < 1) {
        return res.status(200).json({ response: "error", error: "ID is required" });
    }
    try {
        let category = await categoryService.getCategoryById(id);
        if(!category) {
            return res.status(200).json({ response: "error", error: "Category not found" });
        }
        let status = '';
        if(category.status === 'Active') {
            status = 'Inactive';
        } else {
            status = 'Active';
        }
        category = await categoryService.updateCategoryStatus(id, status);
        if(!category) {
            return res.status(200).json({ response: "error", error: "Failed to update category status" });
        }
    } catch (err) {
        logger.error(`Failed to update category status: ${err.message}`, { route: 'updateCategoryStatus' });
        return res.status(200).json({ response: "error", error: ["Internal server error"] });
    }
    return res.status(200).json({ response: "success"});
}

module.exports = {
    getCategoryList,
    getCategoryById,
    createCategory,
    deleteCategory,
    updateCategory,
    updateCategoryStatus
};