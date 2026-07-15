const express = require('express');
const router = express.Router();

const User = require('../models/User');
const Reservation = require('../models/Reservation');
const Flight = require('../models/Flight');

router.get('/', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalReservations = await Reservation.countDocuments();
        const totalFlights = await Flight.countDocuments();

        res.render('admin-dashboard', {
            title: 'Dashboard',
            layout: 'main-admin',
            user: req.session.user || {
                firstName: 'Test',
                lastName: 'Admin'
            },
            activePage: 'dashboard',
            totalUsers,
            totalReservations,
            totalFlights
        });

    } catch (error) {
        console.error('Error loading admin-dashboard:', error);
        res.status(500).send('Error loading dashboard: ' + error.message);
    }
});

module.exports = router;
module.exports = router;