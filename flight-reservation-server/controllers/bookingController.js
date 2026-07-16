const Flight = require('../models/Flight');

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