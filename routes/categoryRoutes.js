const express = require('express');
const categoryController = require('../controllers/categoryController');
const router = express.Router();
const multer = require('multer');
const upload = multer();

router.get('/categories', categoryController.getCategoryList);
router.get('/categories/:id', categoryController.getCategoryById);
router.post('/categories', upload.none(), categoryController.createCategory);
router.delete('/categories/delete/:id', categoryController.deleteCategory); 

router.post('/categories/:id', upload.none(), categoryController.updateCategory);
router.post('/categories/status/:id', upload.none(), categoryController.updateCategoryStatus);
module.exports = router;