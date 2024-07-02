import io from 'socket.io-client';

const url = process.env.VUE_APP_SERVER_URL + ':' + process.env.VUE_APP_SERVER_PORT;
const socket = io(url);

// Emit join event
const joinRoom = (room) => {
  console.log(`Joining room: ${room}`);
  socket.emit('join', room);
};

// Listen for room event
const onRoom = (callback) => {
  socket.on('room', (data) => {
    console.log(`Room data received: ${JSON.stringify(data)}`);
    callback(data);
  });
};

// Listen for player event
const onPlayer = (callback) => {
  socket.on('player', (data) => {
    console.log(`Player data received: ${JSON.stringify(data)}`);
    callback(data);
  });
};

// Listen for opponent event
const onOpponent = (callback) => {
  socket.on('opponent', (data) => {
    console.log(`Opponent data received: ${JSON.stringify(data)}`);
    callback(data);
  });
};

// Listen for move-received event
const onMoveReceived = (callback) => {
  socket.on('move-received', (data) => {
    console.log(`Move received: ${JSON.stringify(data)}`);
    callback(data);
  });
};

// Emit move event
const sendMove = (move) => {
  console.log(`Sending move: ${JSON.stringify(move)}`);
  socket.emit('move', move);
};

// Emit send-message event
const sendMessage = (message) => {
  console.log(`Sending message: ${message}`);
  socket.emit('send-message', message);
};

// Listen for received-message event
const onReceivedMessage = (callback) => {
  socket.on('received-message', (message) => {
    console.log(`Message received: ${message}`);
    callback(message);
  });
};

// Listen for message-sent event
const onMessageSent = (callback) => {
  socket.on('message-sent', (message) => {
    console.log(`Message sent: ${message}`);
    callback(message);
  });
};

// Listen for disconnected event
const onDisconnected = (callback) => {
  socket.on('disconnected', (data) => {
    console.log(`Disconnected: ${data}`);
    callback(data);
  });
};

export default {
  joinRoom,
  onRoom,
  onPlayer,
  onOpponent,
  onMoveReceived,
  sendMove,
  sendMessage,
  onReceivedMessage,
  onMessageSent,
  onDisconnected,
};