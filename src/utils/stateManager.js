import mitt from 'mitt';

const emitter = mitt();
const state = {
  rooms: {},
  players: {},
  videoStreams: {},
  cache: {}
};

// Add specific methods for accessing and updating state
const getPlayer = (id) => state.players[id];
const updatePlayer = (id, player) => {
  state.players[id] = player;
  state.cache.players = state.players;
  emitter.emit('player-updated', player);
};

const getRoom = (id) => state.rooms[id];
const updateRoom = (id, room) => {
  state.rooms[id] = room;
  state.cache.rooms = state.rooms;
  emitter.emit('room-updated', room);
};

const getState = (key) => {
  return state.cache[key] || state[key];
};

const updateState = (key, value) => {
  state[key] = value;
  state.cache[key] = value;
  emitter.emit(`${key}-updated`, value);
};

export const stateManager = {
  state,
  on: emitter.on,
  emit: emitter.emit,
  updateState,
  getState,
  getPlayer,
  updatePlayer,
  getRoom,
  updateRoom
};
