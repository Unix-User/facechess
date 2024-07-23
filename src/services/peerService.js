import Peer from 'peerjs';
import socketClient from '../utils/socketClient';

const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_DELAY = 2000;
const DEFAULT_STUN_SERVER = 'stun:stun.l.google.com:19302';
const DEFAULT_TURN_SERVER = 'turn:turn.example.com';
const DEFAULT_TURN_USERNAME = 'webrtc@example.com';
const DEFAULT_TURN_CREDENTIAL = 'password';

let peer = null;
let localStream = null;
let reconnectAttempts = 0;

const getIceServers = () => [
  { urls: process.env.STUN_SERVER_URL || DEFAULT_STUN_SERVER },
  {
    urls: process.env.TURN_SERVER_URL || DEFAULT_TURN_SERVER,
    username: process.env.TURN_SERVER_USERNAME || DEFAULT_TURN_USERNAME,
    credential: process.env.TURN_SERVER_CREDENTIAL || DEFAULT_TURN_CREDENTIAL
  }
];

const getPeerOptions = () => ({
  config: { iceServers: getIceServers() },
  debug: Number(process.env.PEERJS_DEBUG_LEVEL) || 3
});

const startLocalStream = async () => {
  try {
    return await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  } catch (err) {
    console.error("Error starting local stream:", err);
    return null;
  }
};

const initializePeer = (roomId) => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("PeerJS connection timeout")), Number(process.env.PEERJS_CONNECTION_TIMEOUT) || 10000);

    peer = new Peer(getPeerOptions());

    peer.on('open', (id) => {
      clearTimeout(timeout);
      console.log('PeerJS connection opened with ID:', id);
      socketClient.emitEvent('peer-ready', { roomId, peerId: id });
      reconnectAttempts = 0;
      resolve(peer);
    });

    peer.on('call', handleIncomingCall);
    peer.on('error', (error) => handlePeerError(error, roomId));
    peer.on('disconnected', () => reconnectPeer(roomId));
  });
};

const handleIncomingCall = (call) => {
  call.answer(localStream);
  call.on('stream', (remoteStream) => {
    socketClient.emitEvent('remote-stream-ready', { stream: remoteStream, peerId: call.peer });
  });
};

const handlePeerError = (error, roomId) => {
  socketClient.emitEvent('peer-error', { error: error.type });
  
  switch (error.type) {
    case 'peer-unavailable':
    case 'network':
      console.log(`${error.type} error, attempting to reconnect...`);
      reconnectPeer(roomId);
      break;
    case 'server-error':
      console.error('PeerJS server error:', error);
      socketClient.emitEvent('peer-error', { error: 'server-error' });
      break;
    default:
      console.error('Unhandled PeerJS error:', error);
      socketClient.emitEvent('peer-error', { error: 'unknown-error' });
  }
};

const reconnectPeer = (roomId) => {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error('Max reconnection attempts reached. Please try again later.');
    socketClient.emitEvent('peer-error', { error: 'max-reconnect-attempts' });
    return;
  }

  reconnectAttempts++;
  console.log(`Reconnection attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`);
  
  setTimeout(() => {
    if (peer?.disconnected) {
      peer.reconnect();
      return;
    }

    initializePeer(roomId).catch((error) => {
      console.error('Reconnection failed:', error);
      reconnectPeer(roomId);
    });
  }, RECONNECT_DELAY * Math.pow(2, reconnectAttempts - 1));
};

const initialize = async (roomId) => {
  if (peer) {
    console.warn("Peer already initialized");
    return { peer, localStream };
  }

  localStream = await startLocalStream();
  if (!localStream) throw new Error("Local stream not available");

  peer = await initializePeer(roomId);
  return { peer, localStream };
};

const callPeer = (peerId) => {
  if (!peer || !localStream) return;
  const call = peer.call(peerId, localStream);
  call.on('stream', (remoteStream) => {
    socketClient.emitEvent('remote-stream-ready', { stream: remoteStream, peerId });
  });
};

const destroyPeer = () => {
  localStream?.getTracks().forEach(track => track.stop());
  peer?.destroy();
  localStream = null;
  peer = null;
};

const initializeCall = async (roomId) => {
  const { peer, localStream } = await initialize(roomId);
  if (!peer || !localStream) return null;
  socketClient.emitEvent('initiate-call', { roomId, peerId: peer.id });
  return { peer, localStream };
};

const endCall = () => {
  destroyPeer();
  socketClient.emitEvent('call-ended');
};

export {
  initialize,
  callPeer,
  destroyPeer,
  startLocalStream,
  initializeCall,
  endCall
};