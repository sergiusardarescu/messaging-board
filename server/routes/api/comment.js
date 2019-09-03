const Comment = require('../../models/Comment');
const Message = require('../../models/Message');
const User = require('../../models/User');

module.exports = (app) => {

  app.post('/api/comment/new', (req, res, next) => {
    const {
      body
    } = req;
    const {
      userId,
      messageId,
    } = body;

    let {
      comment
    } = body;

    if (!userId) {
      return res.send({
        success: false,
        message: 'Error: UserId cannot be blank'
      });
    }

    if (!messageId) {
      return res.send({
        success: false,
        message: 'Error: MessageId cannot be blank'
      });
    }

    if (!comment) {
      return res.send({
        success: false,
        message: 'Error: Comment cannot be blank'
      });
    }

    Message.find({
      _id: messageId
    }, (err, messages) => {
      if (err) {
        return res.send({
          success: false,
          message: 'Error: Server error'
        });
      }

      if (messages.length != 1) {
        return res.send({
          success: false,
          message: 'Error: Message not found'
        });
      }

      User.find({
        _id: userId
      }, (err, previousUsers) => {
        if (err) {
          return res.send({
            success: false,
            message: 'Error: Server error'
          });
        }

        const fullName = previousUsers[0].firstName + ' ' + previousUsers[0].lastName;
        const message = messages[0];

        const newComment = new Comment();

        newComment.userId = userId;
        newComment.messageId = message._id;
        newComment.comment = comment;
        newComment.author = fullName;
        newComment.save((err, comment) => {
          if (err) {
            return res.send({
              success: false,
              message: 'Error: Server error'
            });
          }
          return res.send({
            success: true,
            message: 'Comment stored'
          });
        });
      })
    });
  });


}
