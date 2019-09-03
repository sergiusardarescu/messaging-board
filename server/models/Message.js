const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: '',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: '',
    required: true
  },
  author: {
    type: String,
    default: '',
    required: true
  }
});

module.exports = mongoose.model('Message', MessageSchema);
