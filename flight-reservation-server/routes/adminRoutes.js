const express = require('express');
const router = express.Router();

// Import models
const User = require('../models/User');
const Reservation = require('../models/Reservation');
const Flight = require('../models/Flight');

// ADMIN PAGE ROUTES

// GET Admin dashboard
router.get('/dashboard', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalReservations = await Reservation.countDocuments();
        const totalFlights = await Flight.countDocuments();

        res.render('admin-dashboard', {
            title: 'Dashboard',
            layout: 'main-admin',
            user: req.session.user || { firstName: 'Test', lastName: 'Admin' },
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

// GET Admin flights page
router.get('/flights', async (req, res) => {
    try {
        res.render('admin-flights', {
            title: 'Flights',
            layout: 'main-admin',
            user: req.session.user || { firstName: 'Test', lastName: 'Admin' },
            activePage: 'flights'
        });
    } catch (error) {
        console.error('Error loading admin-flights:', error);
        res.status(500).send('Error loading flights: ' + error.message);
    }
});

// GET Admin users page
router.get('/users', async (req, res) => {
    try {
        res.render('admin-users', {
            title: 'Users',
            layout: 'main-admin',
            user: req.session.user || { firstName: 'Test', lastName: 'Admin' },
            activePage: 'users'
        });
    } catch (error) {
        console.error('Error loading admin-users:', error);
        res.status(500).send('Error loading users: ' + error.message);
    }
});

// GET Admin reservations page
router.get('/reservations', async (req, res) => {
    try {
        res.render('admin-reservations', {
            title: 'Reservations',
            layout: 'main-admin',
            user: req.session.user || { firstName: 'Test', lastName: 'Admin' },
            activePage: 'reservations'
        });
    } catch (error) {
        console.error('Error loading admin-reservations:', error);
        res.status(500).send('Error loading reservations: ' + error.message);
    }
});

module.exports = router;