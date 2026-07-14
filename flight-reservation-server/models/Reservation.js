const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    reservation_id: { // dis d primary keyy
        type: Number,
        required: true,
        unique: true,
        index: true
    },

    // foreign keyz
    flight_id:{
        type: Number,
        ref: 'Flight',
        required: [true, 'Flight ID is required']
    },
    meal_id: {
        type: Number,
        ref: 'Meal',
        required: true
    },

    // rest of the reservation fields
    booking_ref: {
        type: String,
        required: [true, 'Booking reference is required'],
        unique: true,
        uppercase: true,
        maxlength: [10, 'Booking reference must be up to 10 chars only']
    },
    trip_type: {
        type: String,
        required: [true, 'Trip type is required'],
        enum: {
            values: ['oneway', 'roundtrip'],
            message: 'Trip type must be either "oneway" or "roundtrip"'
        },
        default: 'oneway'
    },
    
    status: {
        type: String,
        required: [true, 'Status is required'],
        enum: {
            values: ['Approved', 'Cancelled', 'Pending'],
            message: 'Status must be "Approved", "Cancelled", or "Pending"'
        },
        default: 'Pending'
    },
    
    total_price: {
        type: Number,
        required: [true, 'Total price is required'],
        min: [0, 'Total price cannot be negative'],
        validate: {
            validator: function(value) {
                return value >= 0;
            },
            message: 'Total price must be a positive number'
        }
    },
    
    booking_date: {
        type: Date,
        required: [true, 'Booking date is required'],
        default: Date.now
    },
    
});

// Auto-increment reservation_id before saving
reservationSchema.pre('save', async function(next) {
    if (this.isNew) {
        try {
            // Find the highest reservation_id and increment by 1
            const lastReservation = await this.constructor.findOne({}, {}, { sort: { 'reservation_id': -1 } });
            if (lastReservation) {
                this.reservation_id = lastReservation.reservation_id + 1;
            } else {
                this.reservation_id = 1000; // Starting value
            }
        } catch (error) {
            return next(error);
        }
    }
    next();
});

module.exports = mongoose.model('Reservation', reservationSchema);
