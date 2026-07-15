const express = require('express');
const router = express.Router();

const Flight = require("../models/Flight");

router.get("/", async(req, res) => {
    try {
        const flights = await Flight.find();
        const airlines = [
            ...new Set(flights.map(flight => flight.airline))
        ];

        res.render("admin-flights", {
            title: "Flights",
            layout: "main-admin",
            flights: flights
        });
    } catch(error){
        console.error(error);
        res.send("Error loading flights");
    }
});

module.exports = router;
