const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const multer = require('multer');
const upload = multer();

// Accepts multipart/form-data
router.post('/registeradmin', upload.none(), adminController.registerAdmin);

module.exports = router;