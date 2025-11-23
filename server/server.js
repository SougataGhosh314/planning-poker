const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const path = require('path');

const app = express();
app.use(cors());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for simplicity
        methods: ["GET", "POST"]
    }
});

// Handle React routing, return all requests to React app
app.get(/.*/, (req, res) => {
    // Check if request is for API/Socket (handled above/internally) or static file
    // If not found in static, serve index.html
    if (!req.url.startsWith('/socket.io/')) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
});

// In-memory store for rooms
// rooms[roomId] = {
//   id: string,
//   description: string,
//   users: [ { id, name, role, vote } ],
//   reveal: boolean
// }
const rooms = {};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_room', ({ roomId, name, role }) => {
        // Create room if it doesn't exist
        if (!rooms[roomId]) {
            rooms[roomId] = {
                id: roomId,
                description: 'New Story',
                users: [],
                reveal: false
            };
            console.log(`Room ${roomId} created`);
        }

        const room = rooms[roomId];

        // Add user to room
        const user = { id: socket.id, name, role, vote: null };
        room.users.push(user);

        socket.join(roomId);

        // Emit updated room state to all in room
        io.to(roomId).emit('room_update', room);
        console.log(`${name} joined room ${roomId}`);
    });

    socket.on('update_description', ({ roomId, description }) => {
        if (rooms[roomId]) {
            rooms[roomId].description = description;
            io.to(roomId).emit('room_update', rooms[roomId]);
        }
    });

    socket.on('vote', ({ roomId, vote }) => {
        const room = rooms[roomId];
        if (room) {
            const user = room.users.find(u => u.id === socket.id);
            if (user) {
                user.vote = vote;
                io.to(roomId).emit('room_update', room);
            }
        }
    });

    socket.on('reveal_results', ({ roomId }) => {
        const room = rooms[roomId];
        if (room) {
            room.reveal = true;
            io.to(roomId).emit('room_update', room);
        }
    });

    socket.on('reset_round', ({ roomId }) => {
        const room = rooms[roomId];
        if (room) {
            room.reveal = false;
            room.users.forEach(u => u.vote = null);
            io.to(roomId).emit('room_update', room);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Remove user from all rooms they were in
        for (const roomId in rooms) {
            const room = rooms[roomId];
            const index = room.users.findIndex(u => u.id === socket.id);
            if (index !== -1) {
                room.users.splice(index, 1);
                // If room is empty, delete it (optional, but good for cleanup)
                if (room.users.length === 0) {
                    delete rooms[roomId];
                } else {
                    io.to(roomId).emit('room_update', room);
                }
                break; // Assuming user is only in one room at a time contextually
            }
        }
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
