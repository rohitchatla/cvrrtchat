const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Channel = require('../models/Channel');
const User = require('../models/User');
const Notif = require('../models/notif');
/**
 * @route POST api/channels
 * @access Private
 * @desc Create new channel
 */

const channelRouter = io => {
  router.post(
    '/',
    [
      check('name', 'Name of the channel is required')
        .not()
        .isEmpty(),
    ],
    async (req, res) => {
      // express-validator
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      let { name, description, user, date, publictype, privatetype, misctype } = req.body;

      try {
        let channelName = await Channel.findOne({ name });

        if (channelName) {
          return res.status(409).json({
            errors: [{ msg: `Channel with name '${channelName.name}' already exists!` }],
          });
        }
        //console.log(user);
        const channel = await Channel.create({
          name,
          description: description ? description : 'This channel is without description',
          users: [user],
          comments: [],
          date,
          owner: user,
          public: publictype,
          private: privatetype,
          misctype: misctype,
        }).then(channel => {
          //console.log(channel);
          User.findById(user).then(user => {
            user.channels.push(channel._id);
            user.save();
          });
        });

        return res.status(201).json(channel);
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Something went wrong' });
      }
    },
  );

  /**
   * @route GET api/channels
   * @access Private
   * @desc Get all channels
   */
  router.get('/', async (req, res) => {
    try {
      let allChannels = await Channel.find().populate([
        'users',
        {
          path: 'comments',
          populate: ['user', 'threadedComments', { path: 'threadedComments', populate: 'user' }],
        },
      ]);

      let channels;

      if (allChannels) {
        channels = allChannels.map(channel => {
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
            type: eachComment.type,
            photo: eachComment.photo,
            video: eachComment.video,
            etcfile: eachComment.etcfile,
            filetype: eachComment.filetype,
            multiplefiles: eachComment.multiplefiles,
            replybool: eachComment.replybool,
            replymsg: eachComment.replymsg,
            replydetails: eachComment.replydetails,
            forwardbool: eachComment.forwardbool,
            forwardmsg: eachComment.forwardmsg,
            forwardpayload: eachComment.forwardpayload,
            replyfromid: eachComment.replyfromid,
            forwardfromid: eachComment.forwardfromid,
            forwardmsgbool: eachComment.forwardmsgbool,
            forwardmsgdetails: eachComment.forwardmsgdetails,
          });

          return {
            name: channel.name,
            description: channel.description,
            dateCreated: channel.date,
            id: channel._id,
            users: channel.users.map(user => ({
              id: user._id,
              name: user.name,
              email: user.email,
            })),
            owner: channel.owner,
            comments: channel.comments.map(serializeComment),
            public: channel.public,
            private: channel.private,
            misctype: channel.misctype,
          };
        });
      }

      return res.status(200).send(channels);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  });

  router.post('/adduser', async (req, res) => {
    const { cid, uid } = req.body;

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
        channel.users.push(uid);
        channel.save();
        User.findById(uid).then(user => {
          user.channels.push(cid);
          user.save();
          console.log('saved');
          res.json({ msg: 'Added User to the channel & channel to User' });
        });
      }
    });
  });

  router.post('/autoadduserinvite', async (req, res) => {
    //also for invite based on channelid for open channels without sending any notification to admin(for adding user by admin) just add user
    //or can be based on url with channel so that user can be added to that channel
    const { cid, uid } = req.body;

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
        channel.users.push(uid);
        channel.save();
        User.findById(uid).then(user => {
          user.channels.push(cid);
          user.save();
          console.log('saved');
          res.json({ msg: 'Added User to the channel & channel to User' });
        });
      }
    });
  });

  router.post('/inviteopenuserchannel', async (req, res) => {
    //also for invite based on channelid for open channels without sending any notification to admin(for adding user by admin) just add user
    //or can be based on url with channel so that user can be added to that channel
    const { cid, uid } = req.body;

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

  /*nlp_tagging->can also add like "add short for rs.10" then to add shirt in some channel,board,etc and money scrapping from it using nlp and identifying the type of the commant and NER of NLP too,etc */
  router.get('/inviteurl/:cid/:uid', async (req, res) => {
    //with oauth
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

  router.post('/inviteuserchannel', async (req, res) => {
    //for users
    const { channelid, fromid, toid } = req.body;
    Channel.findById(channelid).then(ch => {
      User.findById(fromid)
        .then(ufrom => {
          User.findById(toid).then(uto => {
            const notif = Notif.create({
              from: fromid,
              fromname: ufrom.name,
              to: toid,
              channelname: uto.name,
              channeladmin: toid,
              message: `Invitation from ${ufrom.name} for channel ${ch.name} with channel_id ${channelid}`,
            }).then(noti => {
              //console.log(noti);
            });
          });
        })
        .catch(e => {});
    });
  });

  router.post('/invite', async (req, res) => {
    //for channels
    //can handle it directly to add user to channel based on private(notif to admin as we are doing here treating all channels to be private, but still can be tweaked by adding private/public bool in channelSchema.) and public channel(add directly)
    const { channelid, uid } = req.body;
    Channel.findById(channelid)
      .then(ch => {
        User.findById(uid).then(u => {
          const notif = Notif.create({
            from: uid,
            fromname: u.name,
            to: channelid,
            channelname: ch.name,
            channeladmin: ch.owner,
            message: `Add ${u.name} to ${ch.name}`,
          }).then(noti => {
            //console.log(noti);
          });
        });
      })
      .catch(e => {});
  });

  // router.post('/allnotifs', async (req, res) => {
  //   Notif.find()
  //     .then(noti => {
  //       //console.log(noti);
  //       res.send(noti);
  //     })
  //     .catch(e => {});
  // });

  router.post('/allnotifssent', async (req, res) => {
    Notif.find({ from: req.body.uid })
      .then(noti => {
        //console.log(noti);
        res.send(noti);
      })
      .catch(e => {});
  });

  router.post('/allnotifsreceived', async (req, res) => {
    Notif.find({ channeladmin: req.body.uid })
      .then(noti => {
        //console.log(noti);
        res.send(noti);
      })
      .catch(e => {});
  });

  router.post('/deleteusernotifs', async (req, res) => {
    Notif.deleteMany({ channeladmin: req.body.uid })
      .then(noti => {
        //console.log(noti);
        res.send(noti);
      })
      .catch(e => {});
  });

  router.post('/deletesentnotifs', async (req, res) => {
    Notif.deleteMany({ from: req.body.uid })
      .then(noti => {
        //console.log(noti);
        res.send(noti);
      })
      .catch(e => {});
  });

  return router;
};

module.exports = channelRouter;
