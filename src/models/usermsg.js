//Requires Mongoose
const mongoose = require('mongoose');
//Creates comment schema

const userMsgSchema = new mongoose.Schema({
  text: { type: String, required: true },
  date: { type: Date, default: Date.now },
  userfrom: [{ type: Object }],
  userto: [{ type: Object }],
  isEdited: { type: Boolean, default: false },
  threadedComment: { type: Boolean, default: false },
  threadedComments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'usermsg' }],
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
const Usermsg = mongoose.model('usermsg', userMsgSchema);

//Exports model
module.exports = Usermsg;
