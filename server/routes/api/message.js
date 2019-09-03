const Message = require('../../models/Message');
const Comment = require('../../models/Comment');
const User = require('../../models/User');
const SubComment = require('../../models/SubComment');
const async = require('async');

module.exports = (app) => {

  app.post('/api/message/new', (req, res, next) => {
    const {
      body
    } = req;
    const {
      userId
    } = body;

    let {
      message
    } = body;

    if (!userId) {
      return res.send({
        success: false,
        message: 'Error: UserId cannot be blank'
      });
    }

    if (!message) {
      return res.send({
        success: false,
        message: 'Error: Message cannot be blank'
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

      const newMessage = new Message();
      newMessage.userId = userId;
      newMessage.message = message;
      newMessage.author = fullName;
      newMessage.save((err, comment) => {
        if (err) {
          return res.send({
            success: false,
            message: 'Error: Server error'
          });
        }
        return res.send({
          success: true,
          message: 'Message stored'
        });
      });
    })
  });

  app.get('/api/message/list', (req, res, next) => {
    Message.find({}, function (err, messages) {

      if (err) {
        return res.send({
          success: false,
          message: 'Error: Server error'
        });
      }

      let messageMap = {};

      async.forEachOf(messages, (value, key, callback) => {
        messageMap[value._id] = {
          message: value.message
        };
        User.find({
          _id: value.userId
        }, (err, users) => {
          if (err) {
            return callback();
          }
          let user = users[0];
          messageMap[value._id].author = user.firstName + ' ' + user.lastName;
          Comment.find({
            messageId: value._id,
            isDeleted: false
          }, (err, comments) => {
            if (err) {
              return callback();
            }
            async.forEachOf(comments, (value1, key, commentCb) => {
              User.find({
                _id: value1.userId
              }, (err, users1) => {
                if (err) {
                  return commentCb();
                }
                if (messageMap[value._id].hasOwnProperty('comments')) {
                  messageMap[value._id].comments[value1._id] = {
                    comment: value1.comment,
                    author: users1[0].firstName + ' ' + users1[0].lastName
                  };
                } else {
                  messageMap[value._id].comments = {};
                  messageMap[value._id].comments[value1._id] = {
                    comment: value1.comment,
                    author: users1[0].firstName + ' ' + users1[0].lastName
                  };
                }
                SubComment.find({
                  commentId: value1._id,
                  isDeleted: false
                }, (err, subComments) => {
                  if (err) {
                    return commentCb();
                  }
  
                  async.forEachOf(subComments, (value2, key, subCommentCb) => {
                    User.find({
                      _id: value2.userId
                    }, (err, users2) => {
                      if (messageMap[value._id].comments[value1._id].hasOwnProperty('subComments')) {
                        messageMap[value._id].comments[value1._id].subComments[value2._id] = {
                          subComment: value2.subComment,
                          author: users2[0].firstName + ' ' + users2[0].lastName
                        };
                      } else {
                        messageMap[value._id].comments[value1._id].subComments = {};
                        messageMap[value._id].comments[value1._id].subComments[value2._id] = {
                          subComment: value2.subComment,
                          author: users2[0].firstName + ' ' + users2[0].lastName
                        };
                      }
                      subCommentCb();
                    });
                  }, (err) => {
                    if (err) {
                      return commentCb();
                    }
                    commentCb();
                  });
                });
              })
            }, (err) => {
              if (err) {
                return callback();
              }
              callback();
            });
          });
        });
      }, err => {
        if (err) {
          return res.send({
            success: false,
            message: 'Error: Server error'
          });
        }

        return res.send({
          success: true,
          message: messageMap
        });
      });
    }).limit(10);
  })

}