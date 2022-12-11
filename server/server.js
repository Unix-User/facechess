const { Chess } = require('chess.js');
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:8080',
        methods: ["GET", "POST"],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: false
    }
});

const game = new Chess();
function moveIsValid(move) {

}
let rooms = [];
server.listen(8888);
console.log('Server is running on port:8888');

io.on('connection', (socket) => {
    let playerId = socket.id;
    socket.on('joined', function (roomId) {
        let color;
        let found = false;
        for (let i = 0; i < rooms.length; i++) {
            if (rooms[i].players < 2) {
                roomId = i;
                found = true;
                break;
            }
        }
        if (!found) {
            roomId = rooms.length;
            rooms.push({ players: 0, pid: [null, null] });
        }

        for (let i = 0; i < rooms[roomId].pid.length; i++) {
            if (rooms[roomId].pid[i] === null) {
                rooms[roomId].pid[i] = playerId;
                color = (i === 0) ? 'w' : 'b';
                break;
            }
        }
        rooms[roomId].players++;
        console.log('a player had conected to this room:' + roomId, rooms[roomId]);
        socket.emit('room', roomId);
        socket.emit('player', {
            playerId,
            players: rooms[roomId].players,
            color,
            roomId
        });
    });
    socket.on('move', function (move) {
        for (let i = 0; i < rooms.length; i++) {
            if (rooms[i].pid.includes(playerId)) {
                let opponent = (rooms[i].pid[0] === playerId) ? rooms[i].pid[1] : rooms[i].pid[0];
                socket.to(opponent).emit('move-received', move);
            }
        }
    });
    socket.on('disconnect', function () {
        for (let i = 0; i < rooms.length; i++) {
            if (rooms[i].pid[0] === playerId || rooms[i].pid[1] === playerId) {
                rooms[i].players--;
                if (rooms[i].players === 0) {
                    rooms.splice(i, 1);
                } else {
                    rooms[i].pid[0] === playerId ? rooms[i].pid[0] = null : rooms[i].pid[1] = null;
                }
                (rooms[i]) ? console.log('a player had disconected from room:' + i, rooms[i]) :console.log('last player disconected there is no rooms now');
                break;
            }
        }
    });
});