const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:8080',
        methods: ["GET", "POST"],
        allowedHeaders: ['Access-Control-Allow-Origin'],
        credentials: false
    }
});

var players;
var games = Array(100);
for (let i = 0; i < 100; i++) {
    games[i] = {players: 0 , pid: [0 , 0]};
}

server.listen(8888);
console.log('Server is running on port:8888');

io.on('connection', (socket) => {
    socket.on('joined', function (roomId) {
        if (games[roomId].players < 2) {
            games[roomId].players++;
            games[roomId].pid[games[roomId].players - 1] = playerId;
        }
        else {
            socket.emit('full', roomId)
            return;
        }
        console.log(games[roomId]);
        players = games[roomId].players
        if (players % 2 == 0) color = 'black';
        else color = 'white';
        socket.emit('player', {
            playerId,
            players,
            color,
            roomId
        })
    });
    socket.on('move', function (msg) {
        socket.broadcast.emit('move', msg);
    });
    socket.on('play', function (msg) {
        socket.broadcast.emit('play', msg);
        console.log("ready " + msg);
    });
    socket.on('disconnect', function () {
        for (let i = 0; i < 100; i++) {
            if (games[i].pid[0] == playerId || games[i].pid[1] == playerId)
                games[i].players--;
        }
        console.log(playerId + ' disconnected');
    });
});