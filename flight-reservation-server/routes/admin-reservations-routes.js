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

router.get('/api', async (req, res) => {
    try {
        const { page = 1, limit = 5, filter = 'all', search = '' } = req.query;
        const skip = (page - 1) * limit;
        
        let query = {};
        if (filter !== 'all') {
            query.status = filter;
        }
        if (search) {
            query.$or = [
                { booking_ref: { $regex: search, $options: 'i' } },
                { 'passengerDetails.fullName': { $regex: search, $options: 'i' } }
            ];
        }
        
        const reservations = await Reservation.find(query)
            .populate('flightId', 'origin destination flight_number')
            .sort({ booking_date: -1 })
            .skip(parseInt(skip))
            .limit(parseInt(limit));
        
        const total = await Reservation.countDocuments(query);
        
        const formattedReservations = reservations.map(res => ({
            id: res._id,
            book_ref: res.booking_ref || 'N/A',
            pass_name: res.passengerDetails?.fullName || 'N/A',
            flight_route: res.flightId ? `${res.flightId.origin} → ${res.flightId.destination}` : 'N/A',
            seat_no: res.seatNumber || 'N/A',
            status: res.status || 'Pending',
            total_price: res.total_price ? res.total_price.toFixed(2) : '0.00'
        }));
        
        res.json({
            reservations: formattedReservations,
            total: total
        });
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;