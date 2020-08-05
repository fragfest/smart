const jsonfile = require('jsonfile');
const roomsFile = 'data/rooms.json';

const maxMessagesHistory = 20;
let rooms = [];

const accHighestId = (prevId, obj) => (prevId > obj.id) ? prevId : obj.id;
const findById = findId => obj => Number(findId) === Number(obj.id);

//loadUsers
const loadRooms = () => {
  jsonfile.readFile(roomsFile, (err, roomsRead) => {
    if(err){
      return console.log('loadRooms() failed. Normal if first app run, file will be created if needed.');
    }
    console.log('rooms.js loadRooms() :: load rooms from json, count: ', roomsRead.length);
    rooms = roomsRead;
  });
};

//saveUsers
const saveRooms = () => {
  jsonfile.writeFile(roomsFile, rooms, err => {
    if(err){
      return console.error(new Error('saveRooms: ' + err));
    }
  });
};

// create
const create = nameStr => {
  if(!nameStr){
    return null;
  }

  const lastId = rooms.reduce( accHighestId, 0);
  const newRoom = {
    name: nameStr,
    id: lastId + 1,
    messages: [],
  };
  rooms.push(newRoom);

  saveRooms();
  return newRoom;
};

// getAll
const getAll = () => rooms;  //TODO return clone instead

//getRoomById
const getRoomById = roomIdStr => {
  if(!roomIdStr){
    return null;
  }
  return rooms.find( findById(roomIdStr) );
};

//postMessage
const postMessage = (roomIdStr, msg, author) => {
  if(!roomIdStr || !msg || !author){
    console.error(new Error('(roomIdStr, msg, author) : ' + roomIdStr + ', ' + msg + ', ' + author));
    return false;
  }
  const room = rooms.find( findById(roomIdStr) );
  room.messages.unshift({
    msg: msg || '',
    author: author || '',
  });
  room.messages = room.messages.slice(0, maxMessagesHistory);

  saveRooms();
  return true;
};

//public functions
module.exports = {
  create: create,
  getAll: getAll,
  getRoomById: getRoomById,
  postMessage: postMessage,
};

/////////////////////////////////////////////////////////////////
// INIT
// app startup init calls
/////////////////////////////////////////////////////////////////
loadRooms();
