const mongoose = require('mongoose');

const SubCommentSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: '',
    required: true
  },
  commentId: {
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
  subComment: {
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

module.exports = mongoose.model('SubComment', SubCommentSchema);
