const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const Controllers = require('./controllers');
const port = process.env.PORT || 3001;
var signedCookieParser = cookieParser('chat')
var MongoStore = require('connect-mongo')(session)
var sessionStore = new MongoStore({
  url: 'mongodb://localhost/chat'
})
app.use(express.static(path.join(__dirname, '/static')));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, './static/index.html'));
});
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
  secret: 'chat',
  resave: true,
  saveUninitialized: false,
  cookie: {
    maxAge: 60 * 1000
  },
  store: sessionStore
}))

app.get('/api/validate', function(req, res) {
  let _userId = req.session._userId;
  if(_userId) {
    Controllers.User.findUserById(_userId, function(err, user) {
      if(err) {
        res.json(401, {
          msg: err
        })
      } else {
        res.json(user);
      }
    })
  } else {
    res.json(401, null);
  }
})

app.post('/api/login', function(req, res) {
  let email = req.body.email;
  if(email) {
    Controllers.User.findByEmailOrCreate(email, function(err, user) {
      if(err) {
        res.json(500, {
          msg: err
        })
      } else {
        req.session._userId = user._id;
        res.json(user);
      }
    })
  } else {
    res.json(403);
  }
})

app.get('/api/logout', function(req, res) {
  res.session._userId = null;
  res.json(401);
})

const server = app.listen(port, () => {
  console.log('chat is on port ' + port + '!');
});
let messages = [];
const io = require('socket.io').listen(server);

io.set('authorization', function(handshakeData, accept) {
  // console.log(handshakeData);
  signedCookieParser(handshakeData, {}, function(err) {
    if(err) {
      accept(err, false);
    } else {
      sessionStore.get(handshakeData.signedCookies['connect.sid'], function(err, session) {
        if(err) {
          accept(err.message, false);
        } else {
          console.log(session);
          handshakeData.session = session;
          if(session._userId) {
            accept(null, true);
          } else {
            accept('No login');
          }
        }
      })
    }
  })
})


io.sockets.on('connection', (socket) => {
  socket.on('getAllMessages', () => {
    socket.emit('allMessages', messages);
  });
  socket.on('createMessage', (message) => {
    messages.push(message);
    io.sockets.emit('messageAdded', message);
  })
});