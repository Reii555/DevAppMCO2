const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    validate: {
      validator: function(v) {
        const phoneRegex = /^\+?[0-9\s\-\(\)]{7,20}$/;
        if (!phoneRegex.test(v)) {
          return false;
        }
        const digits = v.replace(/\D/g, '');
        return digits.length >= 7 && digits.length <= 15;
      },
      message: 'Please enter a valid phone number (e.g., +63 912 345 6789, +1 234 567 8900)'
    }
  },
  
  dateOfBirth: {
    type: Date
  },
  
  passportNumber: {
    type: String,
    trim: true,
    uppercase: true
  },
  
  nationality: {
    type: String,
    trim: true
  },
  
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Prefer not to say']
  },

  role: {
    type: String,
    enum: ['admin', 'customer'],
    default: 'customer'
  },

  status: {
    type: String,
    enum: ['active', 'inactive', 'deleted'],
    default: 'active'
  },

  lastLogin: {
    type: Date,
    default: null
  },

  profilePicture: {
    type: String,
    default: null
  },

  emergencyContact: {
    name: {
      type: String,
      trim: true
    },
    relationship: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    }
  },

  savedPassengers: [{
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    passportNumber: {
      type: String,
      required: true,
      trim: true
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    nationality: {
      type: String,
      required: true
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
      required: true
    },
    type: {
      type: String,
      enum: ['Adult', 'Child', 'Infant'],
      default: 'Adult'
    }
  }],

  paymentMethods: [{
    cardType: {
      type: String,
      enum: ['VISA', 'Mastercard', 'Amex', 'Discover'],
      required: true
    },
    cardNumber: {
      type: String,
      required: true,
      trim: true
    },
    cardholderName: {
      type: String,
      required: true,
      trim: true
    },
    expiryMonth: {
      type: String,
      required: true
    },
    expiryYear: {
      type: String,
      required: true
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],

  notificationPreferences: {
    promotionalOffers: {
      type: Boolean,
      default: true
    },
    flightStatusAlerts: {
      type: Boolean,
      default: true
    },
    loyaltyUpdates: {
      type: Boolean,
      default: true
    },
    smsAlerts: {
      type: Boolean,
      default: true
    }
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now    
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.virtual('fullName').get(function() {
  return this.firstName + ' ' + this.lastName;
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return this.password === candidatePassword;
};

userSchema.statics.findByEmailWithPassword = function(email) {
  return this.findOne({ email }).select('+password');
};

module.exports = mongoose.model('User', userSchema);