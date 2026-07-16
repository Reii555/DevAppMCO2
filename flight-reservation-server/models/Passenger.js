const mongoose = require("mongoose");

const passengerSchema = new mongoose.Schema({
    
    user_id: { //foreign key
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    reservation_id: { //foreign key
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reservation"
    },

    full_name: {
        type: String,
        required: true,
        trim: true,
        maxlength: [100]
    },

    contact_num: {
        type: String,
        required: true
    },

    passport_num: {
        type: String,
        required: true,
        unique: true
    },

    nationality: {
        type: String,
        enum: [
            "Filipino",
            "American",
            "Japanese",
            "Chinese",
            "Korean",
            "British",
            "Australian",
            "Canadian",
            "Other"
        ],
        required: true
    },

    birth_date: {
        type: Date,
        required: true
    },

    gender: {
        type: String,
        enum: [
            "Female",
            "Male",
            "Others",
            "Prefer not to say"
        ],
        required: true
    },

    type: {
        type: String,
        enum: [
            "Adult",
            "Child",
            "Infant"
        ],
        default: "Adult",
    },

    emergency_contact: {
        type: String,
        required: true
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("Passenger", passengerSchema);