const express = require('express');
const router = express.Router();

const Reservation = require("../models/Reservation");

router.get('/', async (req, res) => {
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