const mongoose = require("mongoose");

const extraServicesSchema = new mongoose.Schema({

    service_id: { //primary key
        type: String,
        required: [true, 'Service ID is required'],
        unique: true,
        trim: true    
    },

    service_name: {
        type: String,
        required: [true, 'Service name is required'],
        trim: true,
        maxlength: [45, 'Service name cannot exceed 45 characters']
    },

    description: {
        type: String,
        default: "",
        maxlength: 255
    },

    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative'],
        validate: {
            validator: function(value){
                return value >= 0;
            },
            message: 'Price must be a positive number'
        }
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("ExtraService", extraServicesSchema);