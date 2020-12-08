const express = require('express');
const router = express.Router();
const formidable = require('formidable');
const fs = require('fs');

var multer = require('multer');
const crypto = require('crypto');

const storage = multer.diskStorage({
  destination: (req, file, cd) => {
    cd(null, './assets/');
  },
  // filename: (req, file, cd) => {
  //   cd(null, crypto.randomBytes(10).toString('hex') + file.originalname);
  // },
});

const uploadFile = multer({ storage });

const { body, validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Usermsg = require('../models/usermsg');
const User = require('../models/User');
const Channel = require('../models/Channel');

//wrap routes in function that takes Socket.IO server as an arg

const commentRouter = io => {
  //function that emits comment events to client
  const sendCommentToClient = (event, comment, channelID = '') => {
    const { date, _id, text, isEdited } = comment;
    const toSend = {
      _id,
      text,
      date,
      isEdited,
      ...(comment.user ? { user: comment.user.name } : { user: 'Deleted User' }),
      ...(comment.user ? { user_id: comment.user._id } : { user_id: null }),
      ...(comment.user ? { userImage: comment.user.userImage } : { userImage: null }),
    };

    if (channelID) {
      io.sockets.to(channelID).emit(event, toSend);
    } else {
      io.sockets.emit(event, toSend);
      console.log('thread');
    }
  };

  const deleteCommentFromClient = (channelID, commentID) => {
    io.sockets.to(channelID).emit('delete', commentID);
  };

  /*
Route GET requests at root 
Populate comment document with user document referenced in "user" field
return response containing array of all comments in JSON on success
*/

  router.get('/', (req, res) => {
    Comment.find({ threadedComment: false })
      .populate(['user', 'threadedComments', { path: 'threadedComments', populate: 'user' }])
      .then(comments => {
        const serializeComment = eachComment => ({
          _id: eachComment._id,
          text: eachComment.text,
          date: eachComment.date,
          isEdited: eachComment.isEdited,
          ...(eachComment.user ? { user: eachComment.user.name } : { user: 'Deleted User' }),
          ...(eachComment.user ? { user_id: eachComment.user._id } : { user_id: null }),
          ...(eachComment.user ? { userImage: eachComment.user.userImage } : { userImage: null }),
          ...(eachComment.threadedComments.length > 0
            ? { thread: eachComment.threadedComments.map(serializeComment) }
            : null),
        });

        res.json(comments.map(serializeComment));
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({ error: 'Something went wrong' });
      });
  });

  /*
Route Post requests 
Validate request body
Verify userID exists in db
Create new comment document from request body
Return response containing new comment in JSON
*/

  router.post(
    '/',
    //uploadFile.single('photo'),
    [
      body('user', 'must provide user id')
        .not()
        .isEmpty(),
      body('text', 'Comment is empty')
        .not()
        .isEmpty(),
    ],

    (req, res) => {
      //console.log(req.body);

      //express-validator
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      if (!(req.user._id.toString() === req.body.user)) {
        return res
          .status(400)
          .json({ message: "User ID in body and user ID associated with token don't match" });
      }
      const { user, text, date, threadedComment, parentID, channelID } = req.body;
      User.findById(user)
        .then(user => {
          if (user) {
            if (threadedComment) {
              if (!parentID) {
                return res.status(400).json({ Error: 'Parent comment ID not supplied' });
              }
              Comment.findById(parentID).then(parent => {
                if (parent.threadedComment) {
                  return res.status(400).json({ Error: 'You can not create a thread on a thread' });
                }
                Comment.create({
                  user: user._id,
                  text,
                  date,
                  threadedComment,
                })
                  .then(comment => {
                    const { date, _id, text } = comment;
                    parent.threadedComments.push(_id);
                    parent.save();
                    res.status(201).json({
                      date,
                      _id,
                      text,
                    });
                    return comment;
                  })
                  .catch(err => {
                    console.log(err);
                    res.status(500).json({ message: 'Something went wrong' });
                  });
              });
            } else {
              //console.log(req.body);
              Channel.findById(channelID)
                .then(channel => {
                  if (!channel) {
                    return res.status(404).json({ Error: 'Channel not found' });
                  }

                  // let photo = {};
                  // if (req.body.photostring != 'undefined' && req.body.photostring != undefined) {
                  //   let photoobj = JSON.parse(req.body.photostring);
                  //   if (photoobj.path) {
                  //     photo.data = fs.readFileSync(photoobj.path);
                  //     photo.contentType = photoobj.contentType;
                  //     photo.path = photoobj.path;
                  //   }
                  // }

                  // let form = new formidable.IncomingForm();
                  // form.keepExtensions = true;
                  // form.parse(req, async (err, fields, files) => {
                  //   if (err) {
                  //     return res.status(400).json({
                  //       error: 'Image could not be uploaded',
                  //     });
                  //   }

                  //   // var oldPath = files.photo.path;
                  //   // var newPath = path.join(__dirname, 'uploads')
                  //   //         + '/'+files.photo.name
                  //   // var rawData = fs.readFileSync(oldPath)

                  //   // fs.writeFile(newPath, rawData, function(err){
                  //   //     if(err) console.log(err)
                  //   //     return res.send("Successfully uploaded")
                  //   // })
                  //   //console.log(files);
                  // });

                  // console.log(req.body.photo);
                  // console.log(req.body.filetype);

                  photo = {};
                  photo.data = '';
                  photo.contentType = req.body.filetype.filetypep; //'image/jpeg';
                  photo.path = req.body.photo;

                  video = {};
                  video.data = '';
                  video.contentType = req.body.filetype.filetypev; //'video/mp4';
                  video.path = req.body.video;

                  etcfile = {};
                  etcfile.data = '';
                  etcfile.contentType = req.body.filetype.filetypee; //'application/zip/etc';
                  etcfile.path = req.body.etcfile;

                  Comment.create({
                    user: user._id,
                    text,
                    date,
                    photo,
                    video,
                    type: 'all',
                    etcfile,
                    filetype: req.body.filetype,
                  })
                    .then(comment => {
                      const { date, _id, text } = comment;
                      channel.comments.push(_id);
                      channel.save();
                      res.status(201).json({
                        date,
                        _id,
                        text,
                        user: user.name,
                        channelID,
                      });
                      return comment;
                    })
                    .then(comment => {
                      return Comment.populate(comment, { path: 'user' });
                    })
                    .then(comment => {
                      sendCommentToClient('post', comment, channelID);
                    })
                    .catch(err => {
                      console.log(err);
                      res.status(500).json({ message: 'Something went wrong' });
                    });
                })
                .catch(err => {
                  console.log(err);
                  res.status(500).json({ message: 'Something went wrong' });
                });
            }
          } else {
            const message = 'User not found';
            console.log(message);
            return res.status(400).send(message);
          }
        })
        .catch(err => {
          console.log(err);
          res.status(500).json({ message: 'Something went wrong' });
        });
    },

    /*
    var new_img = new Img;
    new_img.img.data = fs.readFileSync(req.file.path)
    new_img.img.contentType = 'image/jpeg';
    new_img.save();

    arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = [].slice.call(new Uint8Array(buffer));
    bytes.forEach((b) => binary += String.fromCharCode(b));
    return window.btoa(binary);
};

componentDidMount() {
    fetch('http://yourserver.com/api/img_data')
    .then((res) => res.json())
    .then((data) => {
        // console.log(img)
        var base64Flag = 'data:image/jpeg;base64,';
        var imageStr = this.arrayBufferToBase64(data.img.data.data);
        this.setState({
            img: base64Flag + imageStr
        )}
    })
}

render() {
    const {img} = this.state;
    return (
        <img
            src={img}
            alt='Helpful alt text'/>
     )
}
export default Image;
    */
  );
  router.post('/private/g', (req, res) => {
    //not in running mode(this route)
    const { userfrom, text, userto, parentID, threadedComment } = req.body; //userfrom->id of currentuser
    //console.log('hiih');
    if (threadedComment) {
      if (!parentID) return res.status(400).json({ Error: 'Parent comment ID not supplied' });

      User.findById(userfrom).then(async ufrom => {
        User.findById(userto).then(async uto => {
          // const ufrom = await User.findById(userfrom);
          // const uto = await User.findById(userto);
          Usermsg.findById(parentID).then(async parent => {
            if (parent.threadedComment) {
              return res
                .status(400)
                .json({ Error: 'You can not create a usermsg thread on a thread usermsg' });
            }

            Usermsg.create({
              userfrom: ufrom,
              userto: uto,
              text,
              threadedComment,
            })
              .then(comment => {
                //console.log(comment);
                const { date, _id, text } = comment;
                parent.threadedComments.push(_id);
                parent.save();
                let obj = {
                  date,
                  _id,
                  text,
                  user: ufrom.name,
                  userImage: ufrom.userImage,
                };
                res.status(201).json(obj);
                //return comment;
              })
              .catch(err => {
                console.log(err);
                res.status(500).json({ message: 'Something went wrong' });
              });
          });
        });
      });
    }
  });

  // router.get('/getthreadcomment/:id', async (req, res) => {
  //   const { id } = req.params;
  //   console.log(id);
  //   const msgs = await Usermsg.findById(id).then(msg => {
  //     const { date, _id, text } = msg;
  //     let obj = {
  //       date,
  //       _id,
  //       text,
  //       user: msg.userfrom[0],
  //       userImage: msg.userfrom[0].userImage,
  //     };
  //     //console.log(msg[0].threadedComments);
  //     res.send(obj);
  //   });
  // });

  router.delete('/g/:id', async (req, res) => {
    const { id } = req.params;
    //console.log(id);
    const msgs = await Usermsg.findByIdAndDelete(id).then(msg => {
      res.send(msg);
    });
  });

  router.patch('/g/:id', async (req, res) => {
    //g->thread
    const { text: textToUpdate } = req.body;
    //const { name } = req.user;

    Usermsg.findById(req.params.id)
      .then(comment => {
        if (!comment) {
          return res.status(404).json({ Error: 'Comment(usermsg) not found' });
        }

        if (req.user._id !== comment.userfrom[0]._id.toString()) {
          return res.status(403).json({ message: "This isn't your comment" });
        }

        comment.text = textToUpdate;
        comment.isEdited = true;

        comment.save().then(comment => {
          const { text, date, userfrom, userto } = comment;
          res.status(201).json({
            text,
            date,
            user: userfrom[0].name,
            channelID: userto[0]._id,
          });

          //return comment;
        });
        // .then(comment => {
        //   return Usermsg.populate(comment, { path: 'user' });
        // })
        // .then(comment => {
        //   sendCommentToClient('edit', comment, channelID);
        // });
      })
      .catch(err => res.status(500).json('Something went wrong'));
  });

  router.post('/private', (req, res) => {
    //console.log('calling from private');
    const { userfrom, text, userto, parentID, threadedComment } = req.body; //userfrom->id of currentuser
    //console.log('hiih');
    if (threadedComment) {
      if (!parentID) return res.status(400).json({ Error: 'Parent comment ID not supplied' });

      User.findById(userfrom).then(ufrom => {
        User.findById(userto).then(uto => {
          Usermsg.findById(parentID).then(parent => {
            if (parent.threadedComment) {
              return res
                .status(400)
                .json({ Error: 'You can not create a usermsg thread on a thread usermsg' });
            }

            Usermsg.create({
              userfrom: ufrom,
              userto: uto,
              text,
              threadedComment,
            })
              .then(comment => {
                //console.log(comment);
                const { date, _id, text } = comment;
                parent.threadedComments.push(_id);
                parent.save();
                res.status(201).send({
                  date,
                  _id,
                  text,
                  user: ufrom,
                  userImage: ufrom.userImage,
                });
                //return comment;
              })
              .catch(err => {
                console.log(err);
                res.status(500).json({ message: 'Something went wrong' });
              });
          });
        });
      });
    } else {
      photo = {};
      photo.data = '';
      photo.contentType = req.body.filetype.filetypep; //'image/jpeg';
      photo.path = req.body.photo;

      video = {};
      video.data = '';
      video.contentType = req.body.filetype.filetypev; //'video/mp4';
      video.path = req.body.video;

      etcfile = {};
      etcfile.data = '';
      etcfile.contentType = req.body.filetype.filetypee; //'application/zip/etc';
      etcfile.path = req.body.etcfile;

      try {
        User.findById(userfrom).then(ufrom => {
          User.findById(userto).then(uto => {
            Usermsg.create({
              userfrom: ufrom,
              text,
              userto: uto,
              photo,
              video,
              type: 'all',
              etcfile,
              filetype: req.body.filetype,
            })
              .then(msg => {
                //console.log(msg);
                res.send(msg);
              })
              .catch(e => {
                console.log(e);
              });
          });
        });
      } catch (error) {
        console.log(error);
      }
    }
  });

  router.get('/allmsgs', async (req, res) => {
    //console.log('hi');

    const tempmsg = [];
    try {
      const msgs = await Usermsg.find({ threadedComment: false })
        .populate('threadedComments', '_id text date userfrom userto isEdited threadedComments')
        .then(msg => {
          //console.log(msg[0].threadedComments);
          res.send(msg);
        });
      // await msgs.map(msgi => {
      //   let finalt = [];
      //   msgi.threadedComments.map(async (tmsg, i) => {
      //     let obj = await Usermsg.findById(tmsg);
      //     finalt.push(obj);
      //   });
      //   tempmsg.push(msgi);
      //   tempmsg.thread.push(finalt);
      // });

      //console.log(user);
    } catch (error) {
      res.status(404).send();
    }
  });

  router.delete('/privatemsg/:id', async (req, res) => {
    //console.log('hi');
    const { id } = req.params;
    try {
      const msgs = await Usermsg.findById(id).then(msg => {
        //console.log('removed' + msg);
        msg.remove();
      });
      //console.log(user);
      res.send(msgs);
    } catch (error) {
      res.status(404).send();
    }
  });

  router.patch('/private/edit/:id', async (req, res) => {
    //console.log('calling from private');
    const { userfrom, text } = req.body; //userfrom->id of currentuser
    const { id } = req.params;
    //console.log('hiih');
    try {
      const msgs = await Usermsg.findById(id).then(msg => {
        //console.log('removed' + msg);
        msg.text = text;
        msg.isEdited = true;
        msg.save();
      });
      res.send(msgs);
    } catch (error) {
      console.log(error);
    }
  });

  /*
Route DELETE requests 
Create mongoose ObjectId from parameter
Find and delete comment in db using findByIdAndDelete()
Return confirmation message on success
*/
  router.delete('/:channelID?/:commentID', (req, res) => {
    Comment.findById(req.params.commentID)
      .then(comment => {
        if (!comment) {
          return res.status(404).json({ Error: 'Comment not found' });
        }

        if (req.user._id !== comment.user.toString()) {
          return res.status(403).json({ message: "This isn't your comment" });
        }

        comment
          .remove()
          .then(() => res.status(204).end())
          .then(
            //emit delete event to all connected sockets
            deleteCommentFromClient(req.params.channelID, req.params.commentID),
          );
      })
      .catch(err => res.status(500).json('Something went wrong'));
  });

  /*
Route PATCH requests 
Create mongoose ObjectId from parameter
Find and update comment in db using findByIdAndUpdate()
Return response containing updated comment in JSON on succes
*/
  router.patch('/:commentID', (req, res) => {
    const { text: textToUpdate, channelID } = req.body;
    const { name } = req.user;

    Comment.findById(req.params.commentID)
      .then(comment => {
        if (!comment) {
          return res.status(404).json({ Error: 'Comment not found' });
        }

        if (req.user._id !== comment.user.toString()) {
          return res.status(403).json({ message: "This isn't your comment" });
        }

        comment.text = textToUpdate;
        comment.isEdited = true;

        comment
          .save()
          .then(comment => {
            const { text, date } = comment;
            res.status(201).json({
              text,
              date,
              user: name,
              channelID,
            });

            return comment;
          })
          .then(comment => {
            return Comment.populate(comment, { path: 'user' });
          })
          .then(comment => {
            sendCommentToClient('edit', comment, channelID);
          });
      })
      .catch(err => res.status(500).json('Something went wrong'));
  });

  return router;
};
module.exports = commentRouter;
