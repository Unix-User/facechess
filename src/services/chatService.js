import socketClient from "@/utils/socketClient";

class ChatService {
  static EVENT_RECEIVED_MESSAGE = 'received-message';
  static EVENT_SEND_MESSAGE = 'send-message';

  constructor() {
    this.eventHandlers = new Map();
  }

  sendMessage(message) {
    socketClient.emitEvent(ChatService.EVENT_SEND_MESSAGE, message);
  }

  onReceivedMessage(callback) {
    this.registerEventHandler(ChatService.EVENT_RECEIVED_MESSAGE, callback);
  }

  registerEventHandler(eventName, callback) {
    if (this.eventHandlers.has(eventName)) {
      return;
    }

    this.eventHandlers.set(eventName, callback);
    socketClient.onEvent(eventName, this.createEventHandler(eventName));
  }

  createEventHandler(eventName) {
    return (data) => {
      const handler = this.eventHandlers.get(eventName);
      handler?.(data);
    };
  }
}

export default new ChatService();