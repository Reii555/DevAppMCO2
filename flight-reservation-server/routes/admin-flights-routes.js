const express = require("express");
const router = express.Router();

const Flight = require("../models/Flight");


// render
router.get("/", async (req, res) => {

    try {

        const flights = await Flight.find().lean();

        /*const airlines = [
            ...new Set(
                flights.map(flight => flight.airline)
            )
        ];*/

        res.render("admin-flights", {
            title: "Flights",
            layout: "main-admin",
            flights/*,
            airlines: airlines*/
        });

    } catch (error) {

        console.error(error);
        res.status(500).send("Error loading flights");
    }
});


// statistics
router.get("/data", async (req, res) => {

    try {

        const flights = await Flight.find();

        res.json(flights);

    } catch (error) {

        console.error(error);
        res.status(500).json({
            error: "Error loading flight data"
        });
    }
});


// search and filter
router.get("/search", async (req, res) => {

    try {

        const {
            search = "",
            airline = "ALL",
            status = "ALL"
        } = req.query;

        let query = {};

        if (search.trim() !== "") {

            query.$or = [
                {
                    flight_number: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    airline: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ];
        }

        if (airline !== "ALL") {
            query.airline = airline;
        }

        if (status !== "ALL") {
            query.status = status;
        }

        const flights = await Flight.find(query);

        res.json(flights);

    } catch (error) {

        console.error(error);
        res.status(500).json({
            error: "Error searching flights"
        });
    }
});


// add flight
router.post("/", async (req, res) => {

    try {

        const flight = new Flight(req.body);

        await flight.save();

        res.status(201).json({
            message: "Flight added successfully",
            flight: flight
        });

    } catch (error) {

        console.error(error);

        res.status(400).json({
            error: error.message
        });
    }
});


// edit flight
router.put("/:id", async (req, res) => {

    try {

        const flight = await Flight.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!flight) {

            return res.status(404).json({
                error: "Flight not found"
            });
        }

        res.json({
            message: "Flight updated successfully",
            flight: flight
        });

    } catch (error) {

        console.error(error);

        res.status(400).json({
            error: error.message
        });
    }
});


// delete flight
router.delete("/:id", async (req, res) => {

    try {

        const flight = await Flight.findByIdAndDelete(
            req.params.id
        );

        if (!flight) {

            return res.status(404).json({
                error: "Flight not found"
            });
        }

        res.json({
            message: "Flight deleted successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Error deleting flight"
        });
    }
});


module.exports = router;