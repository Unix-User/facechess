import Peer from 'peerjs';
import socketClient from './socketClient';

let peer = null;
let localStream = null;

const initialize = async (roomId, userId) => {
  try {
    if (peer) {
      console.warn("Peer already initialized");
      return { peer, localStream };
    }

    localStream = await startLocalStream();
    if (!localStream) throw new Error("Local stream not available");
    
    peer = new Peer(userId);
    
    peer.on('open', (id) => {
      socketClient.emit('peer-ready', { roomId, peerId: id });
    });

    peer.on('call', (call) => {
      call.answer(localStream);
      call.on('stream', (remoteStream) => {
        socketClient.emit('remote-stream-ready', { stream: remoteStream, peerId: call.peer });
      });
    });

    return { peer, localStream };
  } catch (err) {
    console.error("Erro ao inicializar PeerJS:", err);
    return null;
  }
};

const callPeer = (peerId) => {
  if (peer && localStream) {
    const call = peer.call(peerId, localStream);
    call.on('stream', (remoteStream) => {
      socketClient.emit('remote-stream-ready', { stream: remoteStream, peerId });
    });
  }
};

const destroyPeer = () => {
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
  }
  if (peer) {
    peer.destroy();
  }
  localStream = null;
  peer = null;
};

const startLocalStream = async () => {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    return localStream;
  } catch (err) {
    console.error("Erro ao iniciar o stream local:", err);
    return null;
  }
};

export default {
  initialize,
  callPeer,
  destroyPeer,
  startLocalStream
};