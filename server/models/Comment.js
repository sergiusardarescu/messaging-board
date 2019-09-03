const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: '',
    required: true
  },
  messageId: {
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
  comment: {
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

module.exports = mongoose.model('Comment', CommentSchema);
