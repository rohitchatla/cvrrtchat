require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const passport = require('passport');
const path = require('path');
const Channel = require('./models/Channel');
const User = require('./models/User');
const Notif = require('./models/notif');

const app = express();

//create http server
const server = require('http').Server(app);

//mount Socket.io server to http server
const io = require('socket.io')(server);

const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');
const userRouter = require('./routes/users')(io);
const channelRouter = require('./routes/channel')(io);
const teamsRouter = require('./routes/teams')(io);
const inviteRouter = require('./routes/invite');
//pass mounted Socket.io server to comments router
const commentRouter = require('./routes/comments')(io);

const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common';

var bodyParser = require('body-parser');

app.use(bodyParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(express.json());

passport.use(localStrategy);
passport.use(jwtStrategy);

const jwtAuth = passport.authenticate('jwt', { session: false });

// Protected test endpoint
app.get('/api/protected', jwtAuth, (req, res) => {
  return res.json({ data: 'rosebud' });
});

// Route for user authentication when logging in
app.use('/api/users/login', authRouter);

// User route
app.use('/api/users', userRouter);

// Comment route
app.use('/api/comments', jwtAuth, commentRouter);

// Channel route
app.use('/api/channels', jwtAuth, channelRouter);

//Teams route
app.use('/api/teams', jwtAuth, teamsRouter);
//Invite route
app.use('/api/invite', inviteRouter);

// app.get('/api/channels/inviteurlwooauth/:cid/:uid', (req, res) => {//without oauth
//http://localhost:8000/api/channels/inviteurl/1/2
//   const { cid, uid } = req.params;
//   console.log(cid, uid);
//   Channel.findById(cid).then(channel => {
//     const func = userid => userid == uid;
//     const funcown = userid => userid == channel.owner;
//     const bol = channel.users.some(func);
//     const bolown = channel.users.some(funcown);
//     if (bol) {
//       if (bolown) {
//         res.json({ msg: 'Owner cant him/her-self :D)' });
//       } else {
//         res.json({ msg: 'User already there in the channel' });
//       }
//     } else {
//       if (channel.public) {
//         //only if the channel is public or accessed or not private(!channel.private)
//         channel.users.push(uid);
//         channel.save();
//         User.findById(uid).then(user => {
//           user.channels.push(cid);
//           user.save();
//           console.log('saved');
//           res.json({ msg: 'Added User to the channel & channel to User' });
//         });
//       }
//     }
//   });
// });

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

//Serve Static Assets in production
//set static folder
if (process.env.NODE_ENV === 'production') {
  //..prod..//
  //local .env is 'development' and in production .env/heroku it is 'production'
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

module.exports = { app, server, io };
