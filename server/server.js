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
    socket.on('move', (data) => {
    });
});
