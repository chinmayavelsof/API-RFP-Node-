const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const upload = multer();

// Accepts multipart/form-data
router.post('/login', upload.none(), loginController.login);

module.exports = router;