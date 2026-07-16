const express = require('express');
const router = express.Router();

const bookingController = require('../controllers/bookingController');

router.post("/save", bookingController.savePassenger);
router.get("/meals", bookingController.getMeals);
router.get("/:id/seats", bookingController.getSeats);
router.get("/:id/price", bookingController.getFlightPrice);
router.get('/:id', bookingController.showBookingPage);

module.exports = router;