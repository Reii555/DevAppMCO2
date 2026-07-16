const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

// ============================================================
// PAGE ROUTES
// ============================================================

router.get('/', reservationController.showMyReservations);

// ============================================================
// AJAX FUNCTIONALITY
// ============================================================

router.get('/details/:id', reservationController.getReservationDetails);
router.get('/seats/:flightId/:reservationId?', reservationController.getAvailableSeats);
router.get('/count', reservationController.getReservationCount);
router.put('/:id/seat', reservationController.updateReservationSeat);
router.patch('/:id/cancel', reservationController.cancelReservation);

module.exports = router;