const Flight = require('../models/Flight');
const Passenger = require('../models/Passenger');

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