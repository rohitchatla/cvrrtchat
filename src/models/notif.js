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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'channel',
  },
  channelname: {
    type: String,
  },
  channeladmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  message: {
    type: String,
  },
});

module.exports = Channel = mongoose.model('notifications', NotifSchema);
