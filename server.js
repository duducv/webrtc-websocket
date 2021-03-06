const express = require('express');
const app = express();
const cors = require('cors');
const { Server } = require('socket.io')
const http = require('http');
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST', 'PUT']}});

    app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT'] }));

let room = [];

app.get('/', (req, res) => {
    res.send('Hello world')
})

io.on('connection', (socket) => {
    socket.on('join room', () => {
        room.push(socket.id);

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

const PORT = process.env.PORT || 3000;



server.listen(PORT, () => console.log(`listening ${PORT}`));