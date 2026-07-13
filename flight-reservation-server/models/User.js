// will update
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String
}, { timestamps: true });

module.exports = mongoose.model('Users', userSchema); // copied from sir's example
