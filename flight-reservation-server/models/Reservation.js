const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  reservation_id: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  flightId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flight',
    required: [true, 'Flight ID is required']
  },

  passengerDetails: {
    fullName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    contactNumber: {
      type: String,
      required: true
    },
    passportNumber: {
      type: String,
      required: true
    },
    nationality: {
      type: String,
      required: true
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
      required: true
    }
  },

  seatNumber: {
    type: String,
    required: true
  },

  mealPreference: {
    type: String,
    enum: ['Standard', 'Vegetarian', 'Vegan', 'Halal', 'Kosher', 'Gluten-Free'],
    default: 'Standard'
  },

  mealPrice: {
    type: Number,
    default: 0
  },

  extraServices: {
    checkedBaggage: {
      type: Number,
      default: 0
    },
    carryOn: {
      type: Number,
      default: 0
    },
    priorityBoarding: {
      type: Boolean,
      default: false
    },
    travelInsurance: {
      type: Boolean,
      default: false
    },
    loungeAccess: {
      type: Boolean,
      default: false
    }
  },

  extraServicesPrice: {
    type: Number,
    default: 0
  },

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
      values: ['One-way', 'Roundtrip'],
      message: 'Trip type must be either "One-way" or "Roundtrip"'
    },
    default: 'oneway'
  },
  
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
      message: 'Status must be "Pending", "Confirmed", "Cancelled", or "Completed"'
    },
    default: 'Pending'
  },
  
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  
  total_price: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative']
  },
  
  booking_date: {
    type: Date,
    required: [true, 'Booking date is required'],
    default: Date.now
  },
  
  specialRequests: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

reservationSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const lastReservation = await this.constructor.findOne({}, {}, { sort: { 'reservation_id': -1 } });
      if (lastReservation) {
        this.reservation_id = lastReservation.reservation_id + 1;
      } else {
        this.reservation_id = 1000;
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Reservation', reservationSchema);