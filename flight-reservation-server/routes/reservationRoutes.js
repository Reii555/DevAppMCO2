const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

// ============================================================
// PAGE ROUTES
// ============================================================

// GET - My Reservations Page
router.get('/', reservationController.showMyReservations);

// ============================================================
// AJAX FUNCTIONALITY
// ============================================================

// GET - Get Reservation Details (AJAX)
router.get('/details/:id', reservationController.getReservationDetails);

// GET - Get Available Seats (AJAX)
router.get('/seats/:flightId/:reservationId?', reservationController.getAvailableSeats);

// GET - Reservation Count (AJAX)
router.get('/count', reservationController.getReservationCount);

// PUT - Update Reservation Seat (AJAX)
router.put('/:id/seat', reservationController.updateReservationSeat);

// PATCH - Cancel Reservation (AJAX)
router.patch('/:id/cancel', reservationController.cancelReservation);

module.exports = router;