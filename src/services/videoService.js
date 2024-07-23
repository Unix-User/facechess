import socketClient from "@/utils/socketClient";
import { initializeCall } from "@/services/peerService";

const startCall = async (roomId, callerId) => {
  const result = await initializeCall(roomId);
  if (!result) return null;
  
  const { peer, localStream } = result;
  callerId && handleStream(peer.call(callerId, localStream));
  return { peer, localStream };
};

const handleStream = (call) => {
  call.on("stream", (remoteStream) => 
    socketClient.emitEvent("remote-stream-ready", { stream: remoteStream, peerId: call.peer })
  );
  call.on("close", () => socketClient.emitEvent("call-ended"));
};

const onIncomingCall = (callback) => socketClient.onEvent("incoming-call", callback);

const onCallEnded = (callback) => socketClient.onEvent("call-ended", callback);

const closeAllStreams = (streams) => streams.forEach((_, index) => closeStream(index, streams));

const closeStream = (index, streams, emit) => {
  const currentStream = streams[index].mediaStream;
  currentStream?.getTracks().forEach(track => track.stop());
  emit("close-stream", index);
  emit("toggle-video-stream");
};

export default {
  startCall,
  handleStream,
  onIncomingCall,
  onCallEnded,
  closeAllStreams,
  closeStream,
};