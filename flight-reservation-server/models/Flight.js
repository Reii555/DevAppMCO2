const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({    
    flight_number: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    airline: {
        type: String,
        required: true,
        trim: true
    },

    origin: {
        type: String,
        required: true,
        trim: true
    },

    destination: {
        type: String,
        required: true,
        trim: true
    },

    arrivalDate: {
        type: Date,
        required: true,
    },

    arrivalTime: {
        type: Date,
        required: true
    },

    departureDate: {
        type: Date,
        required: true
    },

    departureTime: {
        type: Date,
        required: true
    },

    basePrice: {
        type: Number,
        required: true,
        min: 0
    },

    cabinClass: {
        type: String,
        enum: ['Economy', 'Premium Economy', 'Business', 'First Class'],
        required: true
    },

    availableSeats: {
        type: Number,
        required: true,
        default: 40,
        min: 0,
        max: 40
    },

    status: {
        type: String,
        enum: ['Completed', 'Delayed', 'Cancelled', 'Upcoming', 'Ongoing'],
        default: "Upcoming",
        required: true
    }
    
}, {
    timestamps: true
});

module.exports = mongoose.model('Flight', flightSchema);