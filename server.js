let express = require('express');
const path = require('path');
const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 5000

app.use(express.static('app'));

let clientSocketIds = [];
let connectedUsers = [];

/* socket function starts */
io.on('connection', socket => {
  console.log('conected')
  socket.on('disconnect', () => {
    console.log("disconnected")
    connectedUsers = connectedUsers.filter(item => item.socketId != socket.id);
    io.emit('updateUserList', connectedUsers)
  });

  socket.on('loggedin', user => {
    clientSocketIds.push({ socket: socket, userId: user.user_id });
    connectedUsers = connectedUsers.filter(item => item.user_id != user.user_id);
    connectedUsers.push({ ...user, socketId: socket.id })
    console.log(connectedUsers)
    io.emit('updateUserList', connectedUsers)
  });

  socket.on('create', function (data) {
    console.log("create room")
    socket.join(data.room);
    let withSocket = getSocketByUserId(data.withUserId);
    socket.broadcast.to(withSocket.id).emit("invite", { room: data })
  });

  socket.on('joinRoom', function (data) {
    socket.join(data.room.room);

  });
  socket.on('message', function (data) {
    socket.broadcast.to(data.room).emit('message', data);

  })

});


/* socket function ends */

const getSocketByUserId = (userId) => {

  let socket = '';

  for (let i = 0; i < clientSocketIds.length; i++) {

    if (clientSocketIds[i].userId == userId) {

      socket = clientSocketIds[i].socket;

      break;

    }

  }
  return socket;

}
server.listen(port, function () {

  console.log(`server started ${port}`)
});


