const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const RFPController = require('../controllers/RFPController');
const multer = require('multer');
const upload = multer();

router.post('/createrfp', authMiddleware.isAdmin, upload.none(), RFPController.createRFP);
router.get('/rfp/all', authMiddleware.authMiddleware, RFPController.getAllRFPs);

router.post('/rfp/apply/:id', authMiddleware.isVendor, upload.none(), RFPController.applyForRFP);
router.get('/rfp/getrfp/:vendor_id', authMiddleware.authMiddleware, RFPController.getRFPByVendorId);
router.get('/rfp/quotes/:id', authMiddleware.authMiddleware, RFPController.getRFPQuotes);

router.get('/rfp/closerfp/:id', authMiddleware.isAdmin, RFPController.closeRFP);
router.get('/rfp/:id', authMiddleware.authMiddleware, RFPController.getRFPById);
router.post('/rfp/:id', authMiddleware.isAdmin, upload.none(), RFPController.updateRFP);

module.exports = router;
