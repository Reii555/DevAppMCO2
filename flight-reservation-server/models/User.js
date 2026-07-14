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

        if (!phoneTegex.test(v))
          return false;

        // count only the digits
        const digits = v.replace(/\D/g, '');
        return digits.length >= 7 && digits.length <= 15;
      },
      message: 'Please enter a valid phone number (e.g., +63 912 345 6789, +1 234 567 8900)'
    }
  },
  
  dateofBirth: {
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
    type: String, // question mark
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
            trim: true,
            validate: {
                validator: function(v) {
                    if (!v) return true; // Optional field
                    const phoneRegex = /^\+?[0-9\s\-\(\)]{7,20}$/;
                    if (!phoneRegex.test(v)) return false;
                    const digits = v.replace(/\D/g, '');
                    return digits.length >= 7 && digits.length <= 15;
                },
                message: 'Please enter a valid emergency phone number'
            }
        },
        email: {
            type: String,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
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
    return `${this.firstName} ${this.lastName}`;
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Static method to find by email with password
userSchema.statics.findByEmailWithPassword = function(email) {
    return this.findOne({ email }).select('+password');
};

module.exports = mongoose.model('User', userSchema);