const express = require('express');
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport');

const auth = require('./server/auth.js');
const users = require('./server/users.js');
const rooms = require('./server/rooms.js');
const socket = require('./server/socket.js');

const app = express();
const port = 3000;

//app setup
app.set('view engine', 'ejs');
app.use( express.static('public') );
app.use( express.urlencoded({ extended: false }) );
app.use( session({
  secret: '684d42a8-0385-47fe-b251-0aee52aea117',   //TODO get from environment
  resave: false,
  saveUninitialized: false,
}) );
app.use( flash() );
app.use( passport.initialize() );
app.use( passport.session() );

auth.init(passport);

// socket.io real time events
const http = require('http').createServer(app);
const io = require('socket.io').listen(http);
io.on('connection', socketRef => socket.init(io, socketRef));

// functions
const isAuthenticated = req => req.isAuthenticated() ? true : false;
const checkAuth = (req, res, next) => isAuthenticated(req) ? next() : res.redirect('/');
const checkUnAuth = (req, res, next) => isAuthenticated(req) ? res.redirect('/rooms') : next();
const roomNotFound = roomId => {
  console.log('app.js :: GET /room/:roomId/messages :: unknown room id: ' + roomId);
  return '/rooms';
};


//express GET routes
app.get('/', checkUnAuth, (req, res) => res.render('index.ejs'));

app.get('/rooms', checkAuth, (req, res) => res.render('rooms.ejs', {
  name: req.user.name || '',
  rooms: rooms.getAll(),
}));

app.get('/room/:roomId/messages', checkAuth, (req, res) => {
  const room = rooms.getRoomById(req.params.roomId || null);
  if(!room) {
    return res.redirect( roomNotFound(req.params.roomId) );
  }

  res.render('message.ejs', {
    name: room.name,
    id: room.id,
    messages: room.messages,
    userId: req.user.id,
  });
});

app.get('/rooms/personal', checkAuth, (req, res) => {
  const messages = users.getMessages(req.user.id);
  res.render('message.ejs', {
    name: 'Direct Messages',
    id: 0,
    messages: messages,
    users: users.getAll(),
    userId: req.user.id,
  });
});

//express POST routes
app.post('/rooms/personal', checkAuth, (req, res) => {
  users.sendMessageTo(req.body.selectUserId, req.user.id, req.body.message);
  res.redirect('/rooms/personal');
});

app.post('/room/:roomId/messages', checkAuth, (req, res) => {
  const room = rooms.getRoomById(req.params.roomId);
  if(!room) {
    return res.redirect( roomNotFound(req.params.roomId) );
  }
  rooms.postMessage(room.id, req.body.message || '', req.user.name || '');
  return res.redirect('/room/' + room.id + '/messages');
});

app.post('/rooms', (req, res) => {
  const newRoom = rooms.create(req.body.name || '');
  if(!newRoom){
    console.log('app.js :: POST /rooms :: room name required');
    req.flash('error', 'Room name required');
  }
  res.redirect('/rooms');
});

//auth routes
app.post('/register', (req, res) => {
  const name = req.body.username || '';
  const userObj = users.create(name);
  if(!userObj){
    console.log('app.js :: POST /register :: user already exists: ' + name);
    req.flash('error', 'User already exists: ' + name);
    return res.redirect('/');
  }

  req.login(userObj, err => err
    ? res.redirect('/')
    : res.redirect('/rooms')
  );
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/rooms',
  failureRedirect: '/',
  failureFlash: true,
}));

app.post('/logout', (req, res) => {
  req.logOut();
  res.redirect('/');
});

//start server
http.listen(port, () => console.log(`chat server running at http://localhost:${port}`));
