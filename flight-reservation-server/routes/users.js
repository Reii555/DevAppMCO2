const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { 
        type: String, 
        unique: true 
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        trim: true
    },
    role: { 
        type: String, 
        default: 'customer',
        enum: ['customer', 'admin']
    },
    status: { 
        type: String, 
        default: 'active',
        enum: ['active', 'deleted']
    },
    last_login: { 
        type: Date,
        default: null
    },
    created_at: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Users', userSchema);
