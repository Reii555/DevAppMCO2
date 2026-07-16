const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  user_id: {
    type: Number,
    // required: true, commented for testing purposes
    unique: true,
    index: true 
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
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
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  
  profilePicture: {
    type: String,
    default: null
  },
  
  created_at: {
    type: Date,
    default: Date.now
  },
  
  last_login: {
    type: Date,
    default: null
  },
  
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  
  status: {
    type: String,
    enum: ['active', 'deleted'],
    default: 'active'
  }
}, {
  timestamps: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Auto-increment user_id before saving
userSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const lastUser = await this.constructor.findOne({}, {}, { sort: { 'user_id': -1 } });
      if (lastUser) {
        this.user_id = lastUser.user_id + 1;
      } else {
        this.user_id = 1000;
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return this.password === candidatePassword;
};

// Find by email with password
userSchema.statics.findByEmailWithPassword = function(email) {
  return this.findOne({ email }).select('+password');
};

module.exports = mongoose.model('User', userSchema);