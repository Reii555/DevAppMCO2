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

// ============================================================
// DEBUG ENDPOINT - Remove this after testing
// ============================================================

router.get('/debug', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.json({ error: 'Not logged in' });
        }
        const passenger = await Passenger.findOne({ user_id: req.session.user._id });
        res.json({
            userId: req.session.user._id,
            passengerExists: !!passenger,
            passengerData: passenger ? {
                full_name: passenger.full_name,
                savedPassengers: passenger.savedPassengers || [],
                savedPassengersCount: (passenger.savedPassengers || []).length,
                paymentMethods: passenger.paymentMethods || [],
                paymentMethodsCount: (passenger.paymentMethods || []).length
            } : null
        });
    } catch (error) {
        res.json({ error: error.message });
    }
});

module.exports = router;