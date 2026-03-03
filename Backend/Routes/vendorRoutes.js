const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/vendor/dashboard
router.get('/dashboard', authMiddleware, vendorController.getVendorDashboard);
// GET /api/vendor/students
router.get('/students', authMiddleware, vendorController.getVendorStudents);

// PUT /api/vendor/update-request
router.put('/update-request', authMiddleware, vendorController.updateRequestStatus);

// Communication Center Routes
router.get('/communications', authMiddleware, vendorController.getCommunicationData);
router.put('/update-menu', authMiddleware, vendorController.updateWeeklyMenu);
router.post('/post-announcement', authMiddleware, vendorController.postAnnouncement);
router.get('/deliveries/today', authMiddleware, vendorController.getDailyDeliveryList);
// Vendor Profile Settings Routes
router.get('/profile', authMiddleware, vendorController.getVendorProfileSettings);
router.put('/profile', authMiddleware, vendorController.updateVendorProfileSettings);
router.get('/payments', authMiddleware, vendorController.getPaymentRecords);
router.put('/payments/:subscriptionId/mark-paid', authMiddleware, vendorController.markAsPaid);
module.exports = router;