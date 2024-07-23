import socketClient from "@/utils/socketClient";

const createEventHandler = (eventName) => ({
  emit: (data) => socketClient.emitEvent(eventName, data),
  on: (callback) => socketClient.onEvent(eventName, callback)
});

const events = {
  move: createEventHandler("move"),
  room: createEventHandler("room"),
  player: createEventHandler("player"),
  opponent: createEventHandler("opponent"),
  disconnected: createEventHandler("disconnected"),
  moveReceived: createEventHandler("move-received")
};

const boardService = {
  ...events,
  joinRoom: (room) => socketClient.emitEvent("join", room),
  
  on: (eventName, callback) => {
    const event = events[eventName];
    if (event?.on) {
      event.on(callback);
      return;
    }
    console.error(`Invalid event: ${eventName}`);
  }
};

Object.keys(events).forEach(eventName => {
  const capitalizedEventName = eventName.charAt(0).toUpperCase() + eventName.slice(1);
  boardService[`on${capitalizedEventName}`] = (callback) => events[eventName].on(callback);
});

export default boardService;