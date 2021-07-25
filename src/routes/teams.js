const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Channel = require('../models/Channel');
const User = require('../models/User');
const Notif = require('../models/notif');
const Teams = require('../models/team');

const teamsRouter = io => {
  //getTeams
  router.get('/:uid', async (req, res) => {
    const { uid } = req.params;
    allteams = [];
    var uidd = JSON.stringify(uid);
    //Teams.find({ ownerId: uid })

    try {
      //if(..==uid){}else{}
      Teams.find({})
        .populate(
          'channels',
          '_id name description users comments date owner private public misctype', //users--> can be further added with user details taking userid(present there)/further nesting in with details
        )
        .populate('members', '_id name email userImage channels') //channels--> can be further added with channels details taking channelsid(present there)/further nesting in with details
        .populate('privateMembers', '_id name email userImage channels') //privateMembers=::=pmembers//channels--> can be further added with channels details taking channelsid(present there)/further nesting in with details
        .exec()
        .then(te => {
          console.log(te);
          //console.log(typeof te[0].channels[0]);
          te.map(t => {
            var memid = JSON.stringify(t.members);
            //var channelid = JSON.stringify(t.channels);

            if (memid === uidd) {
              allteams.push(te);
            }
          });
          //res.send(te);
          res.send(allteams);
        });
    } catch (error) {
      console.log(error);
    }
  });

  //   router.get('/getchannels/:uid', async (req, res) => {
  //     //tid-->team._id
  //     const { tid } = req.params;
  //     Teams.find({ ownerId: uid }).then(te => {
  //       console.log(te);
  //       res.send(te);
  //     });
  //   });
  //   router.get('/getmembers/:uid', async (req, res) => {
  //     //tid-->team._id
  //     const { tid } = req.params;
  //     Teams.find({ ownerId: uid }).then(te => {
  //       console.log(te);
  //       res.send(te);
  //     });
  //   });
  //   router.get('/getpmembers/:uid', async (req, res) => {
  //     //tid-->team._id
  //     const { tid } = req.params;
  //     Teams.find({ ownerId: uid }).then(te => {
  //       console.log(te);
  //       res.send(te);
  //     });
  //   });

  router.post('/', async (req, res) => {
    //addTeams
    //console.log(req.body);
    const { title, public, description, uid } = req.body;
    let publicbool = true; //if initially->false
    if (public == 'y') {
      //lowercase check(covert to string then), str.toLowerCase()
      publicbool = true;
    } else {
      //if initially false then this is not required
      publicbool = false;
    }

    let members = [];
    members.push(uid); //owner is also a member obviously in teams
    Teams.create({
      title,
      description,
      public: publicbool,
      ownerId: uid,
      members: members, //members,
    }).then(te => {
      console.log(te);
      res.send(te);
    });
  });

  router.post('/addchannel', async (req, res) => {
    //addChannel2Teams
    //console.log(req.body);
    const { cid, tid, uid } = req.body;
    //if(uid!=..){}else{}
    Teams.findById(tid).then(te => {
      if (JSON.stringify(uid) != JSON.stringify(te.ownerId)) {
        res.json({ msg: "You aren't admin/owner" });
      }
      te.channels.push(cid);
      te.save();
      res.json({ msg: 'channel added successfully' });
    });
  });

  router.post('/addmember', async (req, res) => {
    //addMember2Teams
    //console.log(req.body);
    const { mid, tid, uid } = req.body;
    //if(uid!=..){}else{}
    Teams.findById(tid).then(te => {
      if (JSON.stringify(uid) != JSON.stringify(te.ownerId)) {
        res.json({ msg: "You aren't admin/owner" });
      }
      te.members.push(mid);
      te.save();
      res.json({ msg: 'member added successfully' });
    });
  });

  router.post('/addpmember', async (req, res) => {
    //addPMember2Teams
    //private_member-->p_member
    //console.log(req.body);
    const { pmid, tid, uid } = req.body;
    //if(uid!=..){}else{}
    Teams.findById(tid).then(te => {
      if (JSON.stringify(uid) != JSON.stringify(te.ownerId)) {
        res.json({ msg: "You aren't admin/owner" });
      }
      te.privateMembers.push(pmid);
      te.save();
      res.json({ msg: 'private member added successfully' });
    });
  });

  return router;
};

module.exports = teamsRouter;
