import io from 'socket.io-client';
import { stateManager } from './stateManager';

const url = `${process.env.VUE_APP_SERVER_URL}:${process.env.VUE_APP_SERVER_PORT}`;
let socket;
let socketInitialized = false;

const initializeSocket = () => {
  if (!socketInitialized) {
    socket = io(url);
    setupEventListeners();
    socketInitialized = true;
  }
};

const setupEventListeners = () => {
  const events = ['room', 'player', 'opponent', 'move-received', 'disconnected', 'received-message'];
  events.forEach(event => {
    if (!socket.hasListeners(event)) {
      socket.on(event, data => {
        console.log(`Received ${event} event:`, data);
        stateManager.updateState(event, data);
      });
    }
  });
};

const emitEvent = (event, data) => {
  initializeSocket();
  if (socket) {
    console.log(`Emitting ${event}:`, data);
    socket.emit(event, data);
  }
};

const onEvent = (event, callback) => {
  initializeSocket();
  if (socket) {
    socket.on(event, data => {
      console.log(`${event} event received:`, data);
      callback(data);
    });
  }
};

export default {
  joinRoom: (room) => emitEvent('join', room),
  sendMove: (move) => emitEvent('move', move),
  sendMessage: (message) => emitEvent('send-message', message),
  sendPeerInfo: (peerInfo) => emitEvent('peer-info', peerInfo),
  startVideoCall: (data) => emitEvent('start-video-call', data),
  stopVideoCall: (data) => emitEvent('stop-video-call', data),
  sendStreamToParticipants: (stream, roomId) => emitEvent('share-camera', { roomId, stream }),
  stopStreamForParticipants: (roomId) => emitEvent('stop-camera', { roomId }),
  onIncomingStream: (callback) => onEvent('incoming-stream', callback),
  onRemoteStreamReceived: (callback) => onEvent('remote-stream', callback),
  onRemoteStreamStopped: (callback) => onEvent('remote-stream-stopped', callback),
  onVideoCallStarted: (callback) => onEvent('video-call-started', callback),
  onVideoCallStopped: (callback) => onEvent('video-call-stopped', callback),
  onRoom: (callback) => onEvent('room', callback),
  onPlayer: (callback) => onEvent('player', callback),
  onOpponent: (callback) => onEvent('opponent', callback),
  onMoveReceived: (callback) => onEvent('move-received', callback),
  onDisconnected: (callback) => onEvent('disconnected', callback),
  onReceivedMessage: (callback) => onEvent('received-message', callback),
  on: (event, callback) => onEvent(event, callback),
  emitEvent, // Exporting emitEvent function
  onEvent // Corrected export of onEvent function
};
