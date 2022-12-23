const { Chess } = require('chess.js');
const app = require('express')();
require('dotenv').config()
const serverUrl = process.env.VUE_APP_SERVER_URL + ':' + process.env.VUE_APP_SERVER_PORT
if (process.env.VUE_APP_MODE == 'prod') {
    console.log('production mode')
    const port = (process.env.VUE_APP_CLIENT_PORT == '80') ? '' : ':' + process.env.VUE_APP_CLIENT_PORT
    var clientUrl = process.env.VUE_APP_CLIENT_URL + port
    var fs = require('fs');
    var server = require('https').Server({
        key: fs.readFileSync(process.env.VUE_APP_KEY),
        cert: fs.readFileSync(process.env.VUE_APP_CERTIFICATE)
    });
}

if (process.env.VUE_APP_MODE == 'dev') {
    console.log('development mode')
    var clientUrl = process.env.VUE_APP_CLIENT_URL + ':' + process.env.VUE_APP_CLIENT_PORT;
    var server = require('http').Server()
}

const io = require('socket.io')(server, {
    cors: {
        origin: clientUrl,
        methods: ["GET", "POST"],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: false
    }
});

const game = new Chess();
let rooms = [];
server.listen(process.env.VUE_APP_SERVER_PORT);
console.log('Server is running on: ' + serverUrl);

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
        if (rooms[roomId].pid.includes(playerId)) {
            let opponent = (rooms[roomId].pid[0] === playerId) ? rooms[roomId].pid[1] : rooms[roomId].pid[0];
            socket.to(opponent).emit('room', rooms[roomId]);
        }
        socket.emit('room', rooms[roomId]);
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
    socket.on('send-message', (msg) => {
        console.log(msg)
        for (let i = 0; i < rooms.length; i++) {
            if (rooms[i].pid.includes(playerId)) {
                let opponent = (rooms[i].pid[0] === playerId) ? rooms[i].pid[1] : rooms[i].pid[0];
                socket.to(opponent).emit('chat-message', msg);
            }
        }
        socket.emit('chat-message', msg);
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
                (rooms[i]) ? console.log('a player had disconected from room:' + i, rooms[i]) : console.log('last player disconected there is no rooms now');
                break;
            }
        }
    });
});