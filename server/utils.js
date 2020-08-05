
const findById = findId => obj => Number(findId) === Number(obj.id);

//postMessage
const maxMessagesHistory = 20;
const postMessage = (arr, recipientId, msg, author, recipient) => {
  if(!recipientId || !msg || !author){
    console.error(new Error('(recipientId, msg, author) : ' + recipientId + ', ' + msg + ', ' + author));
    return false;
  }
  const obj = arr.find( findById(recipientId) );
  obj.messages.unshift({
    msg: msg || '',
    author: author || '',
    recipient: recipient || '',
  });
  obj.messages = obj.messages.slice(0, maxMessagesHistory);

  return true;
};

module.exports = {
  postMessage: postMessage,
};
