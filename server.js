const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname+ "/public")));

const http = require('http');
const server = http.createServer(app);

const {Server} = require("socket.io");

const io = new Server(server);

app.get('/', (req, res) => {
   //res.sendFile(__dirname +"/index.html");
});

const playerJoin = (id, username, room) => {
    const player = {id, username, room};
    players.push(player);
    return player;
};

const playerLeave = (id) => {
    const index = players.findIndex(player => player.id === id);
    if (index !== -1) {
        return players.splice(index, 1)[0];
    }
} 

const getCurrentPlayer = (id) => {
    return players.find(player => player.id === id);
}

const getRoomUsers = (room) => {
    return players.filter(player => player.room === room);
}

const getActiveRooms = () => {
    return new Set(players.map(player => player.room));
}
    
let players = [];
io.on("connection", (socket) => {
    socket.on("joinRoom", (username, roomID) => {
        const player = playerJoin(socket.id, username, roomID);
        socket.join(player.room);
        io.emit("allUsers", players);
        io.to(player.room).emit("updateRoom", getRoomUsers(player.room));
    });

    socket.on("allUsers", () => {
        socket.emit("allUsers", players);
    });

    socket.on("customize", (roomID, value, index) => {
        io.to(roomID).emit("customize", value, index);
    });

    socket.on("startGame", roomID => {
        io.to(roomID).emit("startGame");
    });
})
server.listen(5500, () => {
    console.log("listen 5500");
});
