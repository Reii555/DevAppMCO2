const Reservation = require('../models/Reservation');
const Flight = require('../models/Flight');

// ============================================================
// PAGE ROUTES
// ============================================================

exports.showMyReservations = async (req, res) => {
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

        const formattedReservations = reservations.map(function(reservation) {
            var mealPrices = {
                'Standard': 0,
                'Vegetarian': 150,
                'Vegan': 200,
                'Halal': 250,
                'Kosher': 300,
                'Gluten-Free': 200
            };
            var mealPrice = mealPrices[reservation.mealPreference] || 0;
            
            return {
                _id: reservation._id.toString(),
                booking_ref: reservation.booking_ref,
                passengerName: reservation.passengerDetails.fullName,
                flight_id: reservation.flightId,
                seatNumber: reservation.seatNumber,
                status: reservation.status,
                total_price: reservation.total_price,
                trip_type: reservation.trip_type,
                meal_id: { 
                    meal_name: reservation.mealPreference || 'Standard',
                    meal_price: mealPrice
                },
                passengerDetails: reservation.passengerDetails,
                booking_date: reservation.booking_date
            };
        });

        res.render('my-reservations', {
            title: 'My Reservations',
            reservations: formattedReservations,
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
};

// ============================================================
// GET reservation deets using AJAX
// ============================================================

exports.getReservationDetails = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const reservationId = req.params.id;
        
        if (!reservationId || reservationId === 'undefined' || reservationId === 'null') {
            return res.status(400).json({
                success: false,
                message: 'Invalid reservation ID'
            });
        }

        const reservation = await Reservation.findById(reservationId)
            .populate('flightId')
            .populate('userId');

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
        }

        if (reservation.userId._id.toString() !== req.session.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        var mealPrices = {
            'Standard': 0,
            'Vegetarian': 150,
            'Vegan': 200,
            'Halal': 250,
            'Kosher': 300,
            'Gluten-Free': 200
        };
        var mealPrice = mealPrices[reservation.mealPreference] || 0;

        res.json({
            success: true,
            data: {
                _id: reservation._id,
                reservation_id: reservation.reservation_id,
                booking_ref: reservation.booking_ref,
                passengerName: reservation.passengerDetails.fullName,
                flight: {
                    _id: reservation.flightId._id,
                    flight_number: reservation.flightId.flight_number,
                    airline: reservation.flightId.airline,
                    origin: reservation.flightId.origin,
                    destination: reservation.flightId.destination,
                    departureTime: reservation.flightId.departureTime,
                    arrivalTime: reservation.flightId.arrivalTime
                },
                seatNumber: reservation.seatNumber,
                mealPreference: reservation.mealPreference,
                mealPrice: mealPrice,
                status: reservation.status,
                total_price: reservation.total_price,
                passengerDetails: reservation.passengerDetails,
                specialRequests: reservation.specialRequests || '',
                booking_date: reservation.booking_date,
                trip_type: reservation.trip_type
            }
        });
    } catch (error) {
        console.error('Get reservation details error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching reservation details'
        });
    }
};

exports.getAvailableSeats = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const flightId = req.params.flightId;
        const reservationId = req.params.reservationId;

        if (!flightId || flightId === 'undefined' || flightId === 'null') {
            return res.status(400).json({
                success: false,
                message: 'Invalid flight ID'
            });
        }

        const flight = await Flight.findById(flightId);
        if (!flight) {
            return res.status(404).json({
                success: false,
                message: 'Flight not found'
            });
        }

        const query = {
            flightId: flightId,
            status: { $in: ['Pending', 'Confirmed'] }
        };
        
        if (reservationId && reservationId !== 'undefined' && reservationId !== 'null') {
            query._id = { $ne: reservationId };
        }

        const bookedReservations = await Reservation.find(query);
        const bookedSeats = bookedReservations.map(function(r) {
            return r.seatNumber;
        });

        let currentSeat = null;
        if (reservationId && reservationId !== 'undefined' && reservationId !== 'null') {
            const currentReservation = await Reservation.findById(reservationId);
            if (currentReservation) {
                currentSeat = currentReservation.seatNumber;
            }
        }

        const allSeats = [];
        const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
        const maxRows = 10;

        for (let row = 1; row <= maxRows; row++) {
            for (let col = 0; col < rows.length; col++) {
                const seatNumber = row + rows[col];
                allSeats.push({
                    seat: seatNumber,
                    isBooked: bookedSeats.includes(seatNumber),
                    isCurrent: seatNumber === currentSeat
                });
            }
        }

        const availableCount = allSeats.filter(function(s) {
            return !s.isBooked || s.isCurrent;
        }).length;

        res.json({
            success: true,
            data: {
                availableSeats: availableCount,
                totalSeats: allSeats.length,
                currentSeat: currentSeat,
                allSeats: allSeats,
                flight: {
                    id: flight._id,
                    flightId: flight.flight_number,
                    route: flight.origin + ' → ' + flight.destination
                }
            }
        });
    } catch (error) {
        console.error('Get available seats error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching available seats'
        });
    }
};

exports.getReservationCount = async (req, res) => {
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
            data: { count: count }
        });
    } catch (error) {
        console.error('Get reservation count error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reservation count'
        });
    }
};

exports.updateReservationSeat = async (req, res) => {
    try {
        console.log('Updating reservation seat:', req.params.id);
        
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const reservationId = req.params.id;
        const { seatNumber, mealPreference, specialRequests, extraServices, extraServicesPrice } = req.body;

        // Validate ID
        if (!reservationId || reservationId === 'undefined' || reservationId === 'null') {
            return res.status(400).json({
                success: false,
                message: 'Invalid reservation ID'
            });
        }

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
        if (reservation.status !== 'Pending' && reservation.status !== 'Confirmed') {
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

        // Calculate new total price
        var mealPrices = {
            'Standard': 0,
            'Vegetarian': 150,
            'Vegan': 200,
            'Halal': 250,
            'Kosher': 300,
            'Gluten-Free': 200
        };
        
        var newMealPrice = mealPrices[mealPreference] || 0;
        var oldMealPrice = mealPrices[reservation.mealPreference] || 0;
        var priceDifference = (newMealPrice - oldMealPrice) + (extraServicesPrice || 0);
        var newTotalPrice = reservation.total_price + priceDifference;

        console.log('Old meal:', reservation.mealPreference, 'Old price:', oldMealPrice);
        console.log('New meal:', mealPreference, 'New price:', newMealPrice);
        console.log('Extra services price:', extraServicesPrice);
        console.log('Price difference:', priceDifference, 'New total:', newTotalPrice);

        // Build extra services object
        var extraServicesObj = {
            premiumSeat: false,
            checkedBaggage: 0,
            carryOn: 0,
            priorityBoarding: false,
            travelInsurance: false,
            loungeAccess: false
        };

        if (extraServices && extraServices.length > 0) {
            extraServices.forEach(function(service) {
                var name = service.name;
                var price = service.price;
                if (name === 'Premium Seat') {
                    extraServicesObj.premiumSeat = true;
                } else if (name === 'Checked-in Baggage') {
                    extraServicesObj.checkedBaggage = 1;
                } else if (name === 'Carry-on Baggage') {
                    extraServicesObj.carryOn = 1;
                } else if (name === 'Priority Boarding') {
                    extraServicesObj.priorityBoarding = true;
                } else if (name === 'Travel Insurance') {
                    extraServicesObj.travelInsurance = true;
                } else if (name === 'Lounge Access') {
                    extraServicesObj.loungeAccess = true;
                }
            });
        }

        // Update reservation in database
        const updateData = {
            seatNumber: seatNumber.toUpperCase(),
            mealPreference: mealPreference || 'Standard',
            mealPrice: newMealPrice,
            extraServices: extraServicesObj,
            extraServicesPrice: extraServicesPrice || 0,
            total_price: newTotalPrice
        };
        
        if (specialRequests !== undefined) {
            updateData.specialRequests = specialRequests;
        }

        const updatedReservation = await Reservation.findByIdAndUpdate(
            reservationId,
            updateData,
            { new: true }
        ).populate('flightId');

        console.log('Reservation updated successfully in database');

        res.json({
            success: true,
            message: 'Reservation updated successfully',
            data: {
                _id: updatedReservation._id,
                seatNumber: updatedReservation.seatNumber,
                mealPreference: updatedReservation.mealPreference,
                mealPrice: updatedReservation.mealPrice,
                extraServices: updatedReservation.extraServices,
                extraServicesPrice: updatedReservation.extraServicesPrice,
                total_price: updatedReservation.total_price,
                status: updatedReservation.status
            }
        });
    } catch (error) {
        console.error('Update reservation seat error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating reservation'
        });
    }
};

exports.cancelReservation = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const reservationId = req.params.id;

        if (!reservationId || reservationId === 'undefined' || reservationId === 'null') {
            return res.status(400).json({
                success: false,
                message: 'Invalid reservation ID'
            });
        }

        const reservation = await Reservation.findById(reservationId);
        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
        }

        if (reservation.userId.toString() !== req.session.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        if (reservation.status !== 'Pending' && reservation.status !== 'Confirmed') {
            return res.status(400).json({
                success: false,
                message: 'Reservation cannot be cancelled in its current status'
            });
        }

        reservation.status = 'Cancelled';
        await reservation.save();

        const flight = await Flight.findById(reservation.flightId);
        if (flight) {
            flight.availableSeats = flight.availableSeats + 1;
            await flight.save();
        }

        res.json({
            success: true,
            message: 'Reservation cancelled successfully',
            data: {
                _id: reservation._id,
                status: reservation.status
            }
        });
    } catch (error) {
        console.error('Cancel reservation error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error cancelling reservation'
        });
    }
};