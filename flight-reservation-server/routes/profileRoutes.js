const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// ============================================================
// PAGE ROUTES
// ============================================================

router.get('/', profileController.showProfilePage);
router.get('/edit', profileController.showEditProfilePage);

// ============================================================
// AJAX FUNCTIONALITY - Profile
// ============================================================

// ADD THIS TEST ROUTE FIRST TO VERIFY IT WORKS
router.put('/test', function(req, res) {
    console.log('Test route hit!');
    console.log('Request body:', req.body);
    res.json({
        success: true,
        message: 'Test route works!'
    });
});

router.put('/', profileController.updateProfile);
router.post('/picture', profileController.uploadProfilePicture);
router.get('/data', profileController.getProfileData);

// ============================================================
// AJAX FUNCTIONALITY - Saved Passengers
// ============================================================

router.get('/passengers', profileController.getSavedPassengers);
router.post('/passengers', profileController.addSavedPassenger);
router.delete('/passengers/:index', profileController.removeSavedPassenger);

// ============================================================
// AJAX FUNCTIONALITY - Payment Methods
// ============================================================

router.get('/payments', profileController.getPaymentMethods);
router.post('/payments', profileController.addPaymentMethod);
router.delete('/payments/:index', profileController.removePaymentMethod);
router.put('/payments/:index/default', profileController.setDefaultPaymentMethod);

// ============================================================
// AJAX FUNCTIONALITY - Notification Preferences
// ============================================================

router.put('/notifications', profileController.updateNotificationPreferences);

module.exports = router;