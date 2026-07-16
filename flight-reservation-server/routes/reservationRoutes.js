const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const Flight = require('../models/Flight');

// ============================================================
// PAGE ROUTES
// ============================================================

// GET - My Reservations Page
router.get('/', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page - 1) * limit;

        const reservations = await Reservation.find({ userId: req.session.user._id })
            .populate('flightId')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Reservation.countDocuments({ userId: req.session.user._id });

        res.render('my-reservations', {
            title: 'My Reservations',
            reservations: reservations,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            },
            isAuthenticated: true,
            user: req.session.user
        });
    } catch (error) {
        console.error('My reservations error:', error);
        // If error, render with empty reservations
        res.render('my-reservations', {
            title: 'My Reservations',
            reservations: [],
            pagination: {
                currentPage: 1,
                totalPages: 1,
                totalItems: 0,
                hasNext: false,
                hasPrev: false
            },
            isAuthenticated: true,
            user: req.session.user
        });
    }
});

// ============================================================
// AJAX FUNCTIONALITY
// ============================================================

// GET - Get Reservation Details (AJAX)
router.get('/details/:id', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const reservation = await Reservation.findById(req.params.id)
            .populate('flightId')
            .populate('userId');

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
        }

        // Check if this reservation belongs to the user
        if (reservation.userId._id.toString() !== req.session.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.json({
            success: true,
            data: reservation
        });
    } catch (error) {
        console.error('Get reservation details error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reservation details'
        });
    }
});

// GET - Get Available Seats (AJAX)
router.get('/seats/:flightId/:reservationId?', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const flightId = req.params.flightId;
        const reservationId = req.params.reservationId;

        const flight = await Flight.findById(flightId);
        if (!flight) {
            return res.status(404).json({
                success: false,
                message: 'Flight not found'
            });
        }

        // Get booked seats for this flight (excluding current reservation)
        const query = {
            flightId: flightId,
            status: { $in: ['Pending', 'Confirmed'] }
        };
        
        if (reservationId) {
            query._id = { $ne: reservationId };
        }

        const bookedReservations = await Reservation.find(query);
        const bookedSeats = bookedReservations.map(r => r.seatNumber);

        let currentSeat = null;
        if (reservationId) {
            const currentReservation = await Reservation.findById(reservationId);
            if (currentReservation) {
                currentSeat = currentReservation.seatNumber;
            }
        }

        // Generate all seats (simplified)
        const allSeats = [];
        const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
        const maxRows = Math.ceil(flight.availableSeats / rows.length) || 10;

        for (let row = 1; row <= maxRows; row++) {
            for (let col of rows) {
                const seatNumber = `${row}${col}`;
                if (allSeats.length < flight.availableSeats) {
                    allSeats.push({
                        seat: seatNumber,
                        isBooked: bookedSeats.includes(seatNumber),
                        isCurrent: seatNumber === currentSeat
                    });
                }
            }
        }

        res.json({
            success: true,
            data: {
                availableSeats: allSeats.filter(s => !s.isBooked || s.isCurrent).length,
                totalSeats: flight.availableSeats,
                currentSeat: currentSeat,
                allSeats: allSeats,
                flight: {
                    id: flight._id,
                    flightId: flight.flightId || flight.flight_number,
                    route: `${flight.origin} → ${flight.destination}`
                }
            }
        });
    } catch (error) {
        console.error('Get available seats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching available seats'
        });
    }
});

// GET - Reservation Count (AJAX)
router.get('/count', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const count = await Reservation.countDocuments({
            userId: req.session.user._id,
            status: { $in: ['Pending', 'Confirmed'] }
        });

        res.json({
            success: true,
            data: { count }
        });
    } catch (error) {
        console.error('Get reservation count error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reservation count'
        });
    }
});

// PUT - Update Reservation Seat (AJAX)
router.put('/:id/seat', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const reservationId = req.params.id;
        const { seatNumber, mealPreference, specialRequests } = req.body;

        const reservation = await Reservation.findById(reservationId);
        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
        }

        // Check authorization
        if (reservation.userId.toString() !== req.session.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Check if reservation can be updated
        if (!['Pending', 'Confirmed'].includes(reservation.status)) {
            return res.status(400).json({
                success: false,
                message: 'Reservation cannot be updated in its current status'
            });
        }

        // Validate seat number
        if (!seatNumber) {
            return res.status(400).json({
                success: false,
                message: 'Seat number is required'
            });
        }

        // Validate seat format
        const seatRegex = /^[0-9]{1,3}[A-Z]$/;
        if (!seatRegex.test(seatNumber)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid seat format. Must be number followed by letter (e.g., 12A)'
            });
        }

        // If seat is being changed, validate availability
        if (seatNumber !== reservation.seatNumber) {
            const existingReservation = await Reservation.findOne({
                flightId: reservation.flightId,
                seatNumber: seatNumber,
                status: { $in: ['Pending', 'Confirmed'] },
                _id: { $ne: reservationId }
            });

            if (existingReservation) {
                return res.status(400).json({
                    success: false,
                    message: 'This seat is already booked'
                });
            }
        }

        // Update reservation
        const updateData = {
            seatNumber: seatNumber.toUpperCase()
        };
        if (mealPreference) updateData.mealPreference = mealPreference;
        if (specialRequests !== undefined) updateData.specialRequests = specialRequests;

        const updatedReservation = await Reservation.findByIdAndUpdate(
            reservationId,
            updateData,
            { new: true }
        ).populate('flightId');

        res.json({
            success: true,
            message: 'Reservation updated successfully',
            data: updatedReservation
        });
    } catch (error) {
        console.error('Update reservation seat error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating reservation'
        });
    }
});

// PATCH - Cancel Reservation (AJAX)
router.patch('/:id/cancel', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const reservationId = req.params.id;

        const reservation = await Reservation.findById(reservationId);
        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
        }

        // Check authorization
        if (reservation.userId.toString() !== req.session.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Check if reservation can be cancelled
        if (!['Pending', 'Confirmed'].includes(reservation.status)) {
            return res.status(400).json({
                success: false,
                message: 'Reservation cannot be cancelled in its current status'
            });
        }

        // Update reservation status
        reservation.status = 'Cancelled';
        await reservation.save();

        // Restore seat availability
        const flight = await Flight.findById(reservation.flightId);
        if (flight) {
            flight.availableSeats += 1;
            await flight.save();
        }

        res.json({
            success: true,
            message: 'Reservation cancelled successfully',
            data: reservation
        });
    } catch (error) {
        console.error('Cancel reservation error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error cancelling reservation'
        });
    }
});

module.exports = router;