import io from "socket.io-client";

class SocketClient {
  constructor() {
    this.socket = null;
    this.url = `${process.env.VUE_APP_SERVER_URL}:${process.env.VUE_APP_SERVER_PORT}`;
    this.eventHandlers = new Map();
  }

  connect() {
    if (this.socket) return;

    this.socket = io(this.url, {
      transports: ["websocket"],
      upgrade: false,
    });
    this.setupConnectionListeners();
  }

  setupConnectionListeners() {
    this.socket.on("connect", () => console.log("Conectado ao servidor de socket"));
    this.socket.on("disconnect", () => console.log("Desconectado do servidor de socket"));
  }

  ensureConnection() {
    if (!this.socket) {
      console.warn("Socket não está conectado. Conectando agora.");
      this.connect();
    }
  }

  emitEvent(event, data) {
    this.ensureConnection();
    console.log(`Emitting ${event}:`, data);
    this.socket.emit(event, data);
  }

  onEvent(event, callback) {
    this.ensureConnection();
    this.addEventHandler(event, callback);
    this.setupEventListener(event);
  }

  addEventHandler(event, callback) {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.push(callback);
    this.eventHandlers.set(event, handlers);
  }

  setupEventListener(event) {
    const handlers = this.eventHandlers.get(event);
    if (handlers.length === 1) {
      this.socket.on(event, (data) => {
        console.log(`${event} event received:`, data);
        handlers.forEach((handler) => handler(data));
      });
    }
  }

  offEvent(event) {
    if (!this.socket) return;
    this.socket.off(event);
    this.eventHandlers.delete(event);
  }

  sendMessage(message) {
    this.emitEvent("send-message", message);
  }

  onReceivedMessage(callback) {
    this.onEvent("received-message", callback);
  }

  offReceivedMessage() {
    this.offEvent("received-message");
  }

  joinRoom(room) {
    this.emitEvent("join", room);
  }

  sendMove(move) {
    this.emitEvent("move", move);
  }

  onRoom(callback) {
    this.onEvent("room", callback);
  }

  onPlayer(callback) {
    this.onEvent("player", callback);
  }

  onOpponent(callback) {
    this.onEvent("opponent", callback);
  }

  onMoveReceived(callback) {
    this.onEvent("move-received", callback);
  }

  onDisconnected(callback) {
    this.onEvent("disconnected", callback);
  }

  sendPeerInfo(peerInfo) {
    this.emitEvent("peer-info", peerInfo);
  }

  startVideoCall(data) {
    this.emitEvent("start-video-call", data);
  }

  stopVideoCall(data) {
    this.emitEvent("stop-video-call", data);
  }

  sendStreamToParticipants(stream, roomId) {
    this.emitEvent("share-camera", { roomId, stream });
  }

  stopStreamForParticipants(roomId) {
    this.emitEvent("stop-camera", { roomId });
  }

  initiateCall(data) {
    this.emitEvent("initiate-call", data);
  }

  endCall(data) {
    this.emitEvent("end-call", data);
  }

  onIncomingStream(callback) {
    this.onEvent("incoming-stream", callback);
  }

  onRemoteStreamReceived(callback) {
    this.onEvent("remote-stream", callback);
  }

  onRemoteStreamStopped(callback) {
    this.onEvent("remote-stream-stopped", callback);
  }

  onVideoCallStarted(callback) {
    this.onEvent("video-call-started", callback);
  }

  onVideoCallStopped(callback) {
    this.onEvent("video-call-stopped", callback);
  }

  onIncomingCall(callback) {
    this.onEvent("incoming-call", callback);
  }

  onCallEnded(callback) {
    this.onEvent("call-ended", callback);
  }
}

export default new SocketClient();
