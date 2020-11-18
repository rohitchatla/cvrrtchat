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
});

//Creates comment model to construct documents for our database
const Usermsg = mongoose.model('usermsg', userMsgSchema);

//Exports model
module.exports = Usermsg;
