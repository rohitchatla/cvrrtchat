//Requires Mongoose
const mongoose = require('mongoose');
//Creates comment schema

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  text: { type: String, required: true },
  date: { type: Date, default: Date.now },
  isEdited: { type: Boolean, default: false },
  threadedComment: { type: Boolean, default: false },
  threadedComments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  type: { type: String, default: 'all', required: false }, //for pic/vid add added
  //filetype: { type: String, default: '.', required: false }, //if video can be videe/etc-->but now added etcfile new field for that
  filetype: { type: Object },
  video: {
    contentType: String,
    path: String,
    required: false,
  },
  photo: {
    data: Buffer,
    contentType: String,
    path: String,
    required: false,
  },
  etcfile: {
    data: Buffer,
    contentType: String,
    path: String,
    required: false,
  },
  multiplefiles: [{ type: Object }],

  replybool: { type: Boolean, default: false },
  replydetails: { type: Object },
  replymsg: { type: String, default: '' },
  replyfromid: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }], //just like that(clone of user_id msg-->reply for which message(user_id), to_id is sent like normal message as it is same routine channel or usermsg )

  forwardbool: { type: Boolean, default: false },
  forwardmsg: { type: String, default: '' },
  forwardpayload: { type: Object },
  forwardfromid: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }], //just like that(clone of user_id msg-->reply for which message(user_id), to_id is sent like normal message as it is same routine channel or usermsg )

  forwardmsgbool: { type: Boolean, default: false },
  forwardmsgdetails: [{ type: Object }],
  //customtextbool: { type: Boolean, default: false },//but here used text & forwardmsgdetails.text with checking for forwarded msgs
});

//Creates comment model to construct documents for our database
const Comment = mongoose.model('Comment', commentSchema);

//Exports model
module.exports = Comment;

/* QuickNote :: Message for private users can be implemented by using each user a seperate channel(both in this & in threaded one)
 but space complexity increases. Usermsg collection is kept in threaded one for private messages(inclu. thread), here messages collections is used 
 for both channels and private chat diff. in channelID(in private it is receivers id). Fetching threads here can also be done by action->reducer too. */
