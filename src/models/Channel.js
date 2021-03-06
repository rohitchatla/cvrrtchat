const mongoose = require('mongoose');
const Comment = require('./Comment');

const ChannelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: Comment,
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
  },
  private: {
    type: Boolean,
    default: false,
  },
  public: {
    type: Boolean,
    default: true,
  },
  misctype: {
    type: String,
    default: 'all',
  },
  //invitingchannels(bol)-->autoadd once clicked in invite(channel type: public(true) && misctype: notall )
  teams: [
    {
      type: mongoose.Schema.Types.ObjectId, //Schema.Types.ObjectId(error)-->const Schema = mongoose.Schema;-->//mongoose.Schema.Types.ObjectId(fullpath one)
      ref: 'teams',
    },
  ],
});

module.exports = Channel = mongoose.model('channel', ChannelSchema);
