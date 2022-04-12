const express = require('express');
const app = express();
const cors = require('cors');
const { Server } = require('socket.io')
const http = require('http');
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*'}});

app.use(cors({ origin: 'localhost:3000', credentials: true }));

let room = [];

io.on('connection', (socket) => {
    socket.on('join room', () => {
        room.push(socket.id);
        console.log('conectados', room);

        const otherUser = room.find((id) => id !== socket.id );
        if (otherUser) {
            socket.emit('other user', otherUser);
            io.to(otherUser).emit('user joined', socket.id);
        }
    })
    socket._onclose = () => {
        room = room.filter((id) => id != socket.id)
        console.log('desconectado', room);
    }

    socket.on("offer", payload => {
        io.to(payload.target).emit("offer", payload);
    });

    socket.on("answer", payload => {
        io.to(payload.target).emit("answer", payload);
    });

    socket.on("ice-candidate", incoming => {
        io.to(incoming.target).emit("ice-candidate", incoming.candidate);
    });
});



server.listen(3001, () => console.log('listening port 3001'));