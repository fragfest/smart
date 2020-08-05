const jsonfile = require('jsonfile');
const usersFile = 'data/users.json';
const utils = require('./utils.js');

const accHighestId = (prevId, userObj) => (prevId > userObj.id) ? prevId : userObj.id;
const nameMatch = nameStr => userObj => nameStr === userObj.name;
const findById = findId => obj => Number(findId) === Number(obj.id);

let users = [];

//loadUsers
const loadUsers = () => {
  jsonfile.readFile(usersFile, (err, usersRead) => {
    if(err){
      return console.log('loadUsers() failed. Normal if first app run, file will be created if needed.');
    }
    console.log('users.js loadUsers() :: load users from json, count: ', usersRead.length);
    users = usersRead;
  });
};

//saveUsers
const saveUsers = () => {
  jsonfile.writeFile(usersFile, users, err => {
    if(err){
      return console.error(new Error('saveUsers: ' + err));
    }
  });
};

//getById
const getById = id => users.find( findById(id) );

// getByName
const getByName = nameStr => {
  if(!nameStr){
    return null;
  }
  return users.find( nameMatch(nameStr) );
};

// create
const create = nameStr => {
  if(!nameStr){
    return null;
  }
  if(getByName(nameStr)){
    return null;
  }

  const lastId = users.reduce( accHighestId, 0 );
  const newUser = {
    name: nameStr,
    id: lastId + 1,
    messages: [],
  };
  users.push(newUser);

  saveUsers();
  return newUser;
};

//sendMessageTo
const sendMessageTo = (toUserId, fromUserId, msg) => {
  const toUser = users.find( findById(toUserId) );
  const fromUser = users.find( findById(fromUserId) );
  //user sending to themselves
  if(Number(toUserId) === fromUser.id){
    return;
  }

  utils.postMessage(users, fromUser.id, msg, fromUser.name, toUser.name);
  utils.postMessage(users, toUser.id, msg, fromUser.name, toUser.name);
  saveUsers();
};

//getMessages
const getMessages = userId => {
  const user = users.find( findById(userId) );
  if(!user){
    console.error(new Error('user not found'));
    return [];
  }

  return user.messages || [];
};

//getAll
const getAll = () => {
  return users.map(u => ({
    id: u.id,
    name: u.name
  }));
};

// public functions
module.exports = {
  create: create,
  getById: getById,
  getByName: getByName,
  getMessages: getMessages,
  sendMessageTo: sendMessageTo,
  getAll: getAll,
};

/////////////////////////////////////////////////////////////////
// INIT
// app startup init calls
/////////////////////////////////////////////////////////////////
loadUsers();
