const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const upload = multer();

// Accepts multipart/form-data
router.post('/registervendor', upload.none(), vendorController.registerVendor);

router.get('/vendorlist', authMiddleware.isAdmin, vendorController.getVendorList);
router.get('/vendorlist/:category_id', authMiddleware.isAdmin, vendorController.getVendorListByCategory);
router.post('/approveVendor', authMiddleware.isAdmin, upload.none(), vendorController.approveVendor);

module.exports = router;