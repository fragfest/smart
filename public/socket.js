(function(){
  const socket = io();

  const formEl = document.getElementById('send');
  const msgEl = document.getElementById('msg');
  const chatMessages = document.getElementById('chat-messages');

  const userId = document.getElementById('userId').innerText;
  const roomId = document.getElementById('roomId').innerText;

  socket.emit('subscribe', {
    roomId: roomId,
    userId: userId,
  });

  formEl.addEventListener('submit', ev => {
    ev.preventDefault();

    const msg = msgEl.value || '';
    const selectUserEl = document.getElementById('selectUserId');
    const recipientId = (selectUserEl || {}).value || '';

    socket.emit('send', {
      msg: msg,
      roomId: roomId,
      userId: userId,
      recipientId: recipientId,
    });
    msgEl.value = '';
  });

  socket.on('chat', msgEmit => {
    const newListEl = document.createElement('li');
    const messageRowRoom = `
    <div class="row">
      <div class="col-sm-8">
        <p><strong> ` + msgEmit.msg + ` </strong></p>
      </div>
      <div class="col-sm-4">
        <p><small>from: ` + msgEmit.author  + ` </small></p>
      </div>
    </div>
    `;

    const messageRowPersonal = `
    <div class="row">
      <div class="col-sm-8">
        <p><strong> ` + msgEmit.msg + ` </strong></p>
      </div>
      <div class="col-sm-4">
        <p><small>to: ` +  msgEmit.recipient + ` from: ` + msgEmit.author  + ` </small></p>
      </div>
    </div>
    `;

    newListEl.innerHTML = (roomId === '0') ? messageRowPersonal : messageRowRoom;

    chatMessages.insertBefore(newListEl, chatMessages.childNodes[0]);

  });
})();
