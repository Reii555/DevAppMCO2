const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
    meal_name: {
        type: String,
        required: [true, 'Meal name is required'],
        trim: true,
        maxlength: 45
    },

    description: {
        type: String,
        trim: true,
        maxlength: 255
    },

    additional_price: {
        type: Number,
        required: [true, 'Additional price is required'],
        min: [0, 'Additional price cannot be negative'],
        default: 0
    }
}, {    
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

mealSchema.virtual('formattedPrice').get(function() {
    return `₱${this.additional_price.toFixed(2)}`;
});

mealSchema.virtual('displayName').get(function() {
    if (this.additional_price > 0) {
        return `${this.meal_name} (+₱${this.additional_price.toFixed(2)})`;
    }
    return this.meal_name;
});

mealSchema.pre('save', function(next) {
    if (this.meal_name) {
        this.meal_name = this.meal_name.trim();
    }
    if (this.description) {
        this.description = this.description.trim();
    }
    next();
});

mealSchema.index({ meal_name: 1 });

module.exports = mongoose.model('Meal', mealSchema);