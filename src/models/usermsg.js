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
});

//Creates comment model to construct documents for our database
const Usermsg = mongoose.model('usermsg', userMsgSchema);

//Exports model
module.exports = Usermsg;
