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
    socket._onclose = () => {
        room = room.filter((id) => id != socket.id)
    }
    socket.on('join-room', () => {
        room.push(socket.id);

        const otherUser = room.find((id) => id !== socket.id );
        if (otherUser) {
            io.to(otherUser).emit('other-user-joined', socket.id);
        }
        console.log('conectados', room);
    })

    socket.on("offer", payload => {
        const otherUser = room.find((id) => id !== socket.id );
        if (otherUser) {
            io.to(otherUser).emit("offer", payload);
        }
    });

    socket.on("answer", payload => {
       
        const otherUser = room.find((id) => id !== socket.id );
        if (otherUser) {
            io.to(otherUser).emit("answer", payload);
        }
    });

    socket.on("ice-candidate", incoming => {
        const otherUser = room.find((id) => id !== socket.id );
        if (otherUser) {
            io.to(otherUser).emit("ice-candidate", incoming);        
        }
    });
});

const PORT = process.env.PORT || 3001;



server.listen(PORT, () => console.log(`listening ${PORT}`));