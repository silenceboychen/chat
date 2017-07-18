const express = require('express');
const app = express();
const path = require('path');

const port = process.env.PORT || 3001;

app.use(express.static(path.join(__dirname, '/static')));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, './static/index.html'));
});

const server = app.listen(port, () => {
  console.log('chat is on port ' + port + '!');
});
let messages = [];
const io = require('socket.io').listen(server);
io.sockets.on('connection', (socket) => {
  socket.on('getAllMessages', () => {
    socket.emit('allMessages', messages);
  });
  socket.on('createMessage', (message) => {
    messages.push(message);
    io.sockets.emit('messageAdded', message);
  })
});