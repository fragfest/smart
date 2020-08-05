const users = require('./users.js');
const rooms = require('./rooms.js');

const init = (io, socket) => {

  socket.on('subscribe', joinObj => {
    if(joinObj.roomId === '0'){
      socket.join('user=' + joinObj.userId);
      return;
    }
    socket.join('roomId=' + joinObj.roomId);
  });

  socket.on('send', obj => {
    const author = users.getById(obj.userId).name;

    if(obj.roomId === '0'){
      if(obj.recipientId === obj.userId){
        return;
      }
      const recipient = users.getById(obj.recipientId).name;
      io.to('user=' + obj.userId).emit('chat', { msg: obj.msg, author: author, recipient: recipient });
      io.to('user=' + obj.recipientId).emit('chat', { msg: obj.msg, author: author, recipient: recipient });
      return users.sendMessageTo(obj.recipientId, obj.userId, obj.msg);
    }

    io.to('roomId=' + obj.roomId).emit('chat', { msg: obj.msg, author: author });
    rooms.postMessage(obj.roomId, obj.msg, author );
  });

};

module.exports = {
  init: init,
};