const Flight = require('../models/Flight');
const Passenger = require('../models/Passenger');
const Seat = require("../models/Seat");
const Meal = require("../models/Meal");

exports.showBookingPage = async (req, res) => {
    try {
        const flight = await Flight.findById(req.params.id).lean();

        res.render('booking', {
            title: 'Book Flight',
            flight
        });

    } catch (err) {
        console.log(err);
        res.redirect('/search');
    }
};

exports.savePassenger = async (req, res) => {
    try {

        const passenger = new Passenger(req.body);

        await passenger.save();

        res.json({
            success: true
        });

    } catch(err){

        console.log(err);

        res.status(500).json({
            success:false
        });

    }
};

exports.getSeats = async (req, res) => {
    try {

        const seats = await Seat.find({flight_id: req.params.id});
        res.json(seats);

    } catch(err) {

        console.log(err);
        res.status(500).json({success:false});
    }

};

exports.getMeals = async (req, res) => {
    try {

        const meals = await Meal.find();
        res.json(meals);

    } catch(err){

        console.log(err);
        res.status(500).json({success:false});
    }
};

exports.getFlightPrice = async (req, res) => {
    const flight = await Flight.findById(req.params.id);

    res.json({
        basePrice: flight.basePrice
    });
};