const Comment = require('../../models/Comment');
const User = require('../../models/User');
const SubComment = require('../../models/SubComment');

module.exports = (app) => {

  app.post('/api/sub_comment/new', (req, res, next) => {
    const {
      body
    } = req;
    const {
      userId,
      commentId,
    } = body;

    let {
      sub_comment
    } = body;

    if (!userId) {
      return res.send({
        success: false,
        message: 'Error: UserId cannot be blank'
      });
    }

    if (!commentId) {
      return res.send({
        success: false,
        message: 'Error: CommentId cannot be blank'
      });
    }

    if (!sub_comment) {
      return res.send({
        success: false,
        message: 'Error: Sub comment cannot be blank'
      });
    }

    Comment.find({
      _id: commentId
    }, (err, comments) => {
      if (err) {
        return res.send({
          success: false,
          message: 'Error: Server error'
        });
      }

      if (comments.length != 1) {
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
        const comment = comments[0];

        const newSubComment = new SubComment();

        newSubComment.userId = userId;
        newSubComment.commentId = comment._id;
        newSubComment.subComment = sub_comment;
        newSubComment.author = fullName;
        newSubComment.save((err, comment) => {
          if (err) {
            return res.send({
              success: false,
              message: 'Error: Server error ' + err 
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
