const mongoose = require('mongoose');

const TeamsSchema = new mongoose.Schema({
  title: { type: String, required: false },
  description: { type: String, required: false },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
  ],
  channels: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'channel',
    },
  ],
  public: {
    type: Boolean,
    default: true, //false->private
  },
  privateMembers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
  ],
});

module.exports = Channel = mongoose.model('teams', TeamsSchema);
