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

    departureTime: {
        type: Date,
        required: true,
    },

    arrivalTime: {
        type: Date,
        required: true
    },

    duration: {
        type: String,
        required: true
    },

    tripType: {
        type: String,
        enum: ['One-way', 'Round-trip'],
        required: true
    },

    // for round-trip flights
    returnDate: {
        type: Date,
        default: null
    },

    layoversCount: {
        type: Number,
        default: 0
    },

    layoverDetails: {
        type: String,
        default: "N/A"
    },

    // checked-in baggage weight for that flight
    checkedIn: {
        type: Number,
        required: true
    },

    // carry-on baggage weight for that flight
    carryOn: {
        type: Number,
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
    },

    airlineLogo: {
        type: String,
        default: null
    }
    
}, {
    timestamps: true
});

module.exports = mongoose.model('Flight', flightSchema);