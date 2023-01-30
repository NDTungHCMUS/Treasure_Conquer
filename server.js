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
})

const getActiveRooms = (io) => {
    // Convert map into 2D list:
    // ==> [['4ziBKG9XFS06NdtVAAAH', Set(1)], ['room1', Set(2)], ...]
    const arr = Array.from(io.sockets.adapter.rooms);
    // Filter rooms whose name exist in set:
    // ==> [['room1', Set(2)], ['room2', Set(2)]]
    const filtered = arr.filter(room => !room[1].has(room[0]))
    // Return only the room name: 
    // ==> ['room1', 'room2']
    const res = filtered.map(i => i[0]);
    return res;
}

let users = [];
io.on("connection", (socket) => {
    console.log("user connect", socket.id);
    let activeRooms = [];

    socket.on("join room", (id) => {
        activeRooms = getActiveRooms(io);
        console.log(activeRooms);
        console.log(activeRooms.indexOf(id));
        if (activeRooms.indexOf(id) > -1){
            socket.emit("join success", true);
            socket.join(id);
        }
        else {
            
        }
    });

    socket.on("create room", (id) => {
        activeRooms = getActiveRooms(io);
        console.log(activeRooms);
        if (activeRooms.indexOf(id) === -1){
            activeRooms.push(id);
            socket.join(id);
        } 
    });

    socket.on("join", (eachUser, userID) => {
        users.push(eachUser);
        socket.emit("own_join", userID);
        io.sockets.emit("join", eachUser);
    });

    socket.on("joined", ()=>{
        // for (var i = 0; i < users.length; i++){
        //     console.log(users[i].name);
        // }
        socket.emit("joined", users);
    })
})
server.listen(5500, ()=>  {
    console.log("listen 5500");
});
