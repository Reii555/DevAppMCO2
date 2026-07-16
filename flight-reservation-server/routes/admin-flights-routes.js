const express = require("express");
const router = express.Router();

const adminFlightsController = require("../controllers/flightsController");

router.get("/", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect("/login");
        }
        if (req.session.user.role !== "admin") {
            return res.redirect("/?error=Access Denied: Admin access only.");
        }
        adminFlightsController.renderFlights(req, res);

    } catch (error) {
        console.error("Error loading admin-flights:", error);
        res.status(500).send("Error loading flights: " + error.message);
    }
});

router.get("/data", adminFlightsController.getFlightData);
router.get("/search", adminFlightsController.searchFlights);
router.get("/check-flight-number", adminFlightsController.checkFlightNumber);
router.post("/", adminFlightsController.addFlight);
router.put("/:id", adminFlightsController.updateFlight);
router.delete("/:id", adminFlightsController.deleteFlight);

module.exports = router;