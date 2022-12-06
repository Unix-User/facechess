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

server.listen(8000);
console.log('Server is running on port:8000');

io.on('connection', (socket) => {
    console.log('user ' + socket.id + ' connected');
    socket.on('join-room', (room, id) => {
        socket.broadcast.emit('user-connected', id)
        console.log(socket.id + ' received ' + id + ' peer, joining room: ' + room);
        socket.on('make-move', (data) => {
            if (isValidMove(move)) {
                // envia a jogada para todos os outros usuários
                socket.broadcast.emit('move-made', move);
              }
        });
        socket.on('disconnect', () => {
            socket.broadcast.emit('user-disconnected', id)
            console.log('user ' + socket.id + ' disconnected');
        });
    });
});