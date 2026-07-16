const express = require("express");
const router = express.Router();

const adminFlightsController = require ("../controllers/flightsController");

//render
router.get("/", adminFlightsController.renderFlights);

//statistics
router.get("/data", adminFlightsController.getFlightData);

//search and filter
router.get("/search", adminFlightsController.searchFlights);

//check flight ID dupes
router.get("/check-flight-number", adminFlightsController.checkFlightNumber);

//add flight
router.post("/", adminFlightsController.addFlight);

//edit flight
router.put("/:id", adminFlightsController.updateFlight);

//delete flight
router.delete("/:id", adminFlightsController.deleteFlight);

module.exports = router;