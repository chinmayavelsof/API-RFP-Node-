const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const multer = require('multer');
const upload = multer();

// Accepts multipart/form-data
router.post('/registervendor', upload.none(), vendorController.registerVendor);

module.exports = router;