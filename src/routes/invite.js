const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Channel = require('../models/Channel');
const User = require('../models/User');
const Notif = require('../models/notif');

router.get('/inviteurlwooauth/:cid/:uid', async (req, res) => {
  //without oauth
  //http://localhost:8000/api/invite/inviteurlwoauth/1/2
  //invite url based
  const { cid, uid } = req.params;
  console.log(cid, uid);
  Channel.findById(cid).then(channel => {
    const func = userid => userid == uid;
    const funcown = userid => userid == channel.owner;
    const bol = channel.users.some(func);
    const bolown = channel.users.some(funcown);
    if (bol) {
      if (bolown) {
        res.json({ msg: 'Owner cant him/her-self :D)' });
      } else {
        res.json({ msg: 'User already there in the channel' });
      }
    } else {
      if (channel.public) {
        //only if the channel is public or accessed or not private(!channel.private)
        channel.users.push(uid);
        channel.save();
        User.findById(uid).then(user => {
          user.channels.push(cid);
          user.save();
          console.log('saved');
          res.json({ msg: 'Added User to the channel & channel to User' });
        });
      }
    }
  });
});

module.exports = router;
