const express = require('express');
const router = express.Router();

const bookingController = require('../controllers/bookingController');

router.get('/:id', bookingController.showBookingPage);
router.post("/save", bookingController.savePassenger);

module.exports = router;