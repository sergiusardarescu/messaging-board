const mongoose = require('mongoose');

const LoginSessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('LoginSession', LoginSessionSchema);
