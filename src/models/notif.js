const mongoose = require('mongoose');

const NotifSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  fromname: {
    type: String,
  },
  to: {
    //receiver user_id can also be there
    type: mongoose.Schema.Types.ObjectId,
    ref: 'channel',
  },
  channelname: {
    //receiver username can also be there
    type: String,
  },
  channeladmin: {
    type: mongoose.Schema.Types.ObjectId, //for user sending this is same as receiver user_id
    ref: 'user',
  },
  message: {
    type: String,
  },
});

module.exports = Channel = mongoose.model('notifications', NotifSchema);
