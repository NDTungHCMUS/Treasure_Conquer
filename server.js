const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname+ "/public")));

const http = require('http');
const server = http.createServer(app);

const {Server} = require("socket.io");

const io = new Server(server);

app.get('/', function(req, res) {
   //res.sendFile(__dirname +"/index.html");
});

const playerJoin = function(id, username, room) {
    const player = {id, username, room};
    players.push(player);
    for (let i = 0; i < leavePlayers.length; i++){
        if (leavePlayers[i].username == player.username){
            leavePlayers.splice(i, 1);
        }
    }
    return player;
};

const playerLeave = function(index) {
    let player;
    if (index !== -1) {
        player =  players.splice(index, 1)[0];
    }
    leavePlayers.push(player);
    return player;
} 

const getCurrentPlayer = function(id) {
    return players.find(player => player.id === id);
}

const getLeavePlayer = function(id) {
    return leavePlayers.find(player => player.id === id);
}

const getRoomUsers = function(room) {
    return players.filter(player => player.room === room);
}

const getActiveRooms = function() {
    return new Set(players.map(player => player.room));
}

const randomRole = function(randomID, i) {
    if (randomID[i] === 0) {
        return role[0];
    }
    else if (randomID[i] <= gameStats[0]) {
        return role[1];
    }
    else if (randomID[i] === gameStats[0] + 1){
        return role[2];
    }
    else return role[3];
}
    
let players = [];
let leavePlayers = [];
let playingRooms = [];
let gameStats = [2, 5, 30, 90];
const role = ["Captain", "Killer", "Blacksmith", "Pirate"];

//Room management
let roomList = []
class RoomData {
    constructor(roomID, roomSize){
        this.id = roomID;
        this.size = roomSize;
        this.chestList = [];
        this.createChestList();
    }
    createChestList(){
        const n120 = Math.floor((this.size+2)/7);
        const n80 = Math.floor((this.size-1-n120)/2);
        const n60 = Math.floor((this.size-2-n120)/2);
        const nList = [n120, n80, n60, 1];
        const posList = [[[12,30.5],[33,76.5]],[[23,77],[18.5,57],[12,17],[29,27]],[[8,28],[15,37],[23,55],[10,47]],[[33, 41]]];
        const valueList = [120,80,60,40];
        const idList = ['c120', 'c080', 'c060', 'c040'];
        for (let i=0; i<4;i++){
            for (let j=0; j<nList[i]; j++){
                this.chestList.push({
                    id : idList[i] + String(j),
                    value: valueList[i],
                    position: posList[i][j],
                    whoChoosen: []
                });
            }
        }
    }
    getChestById(id){
        this.chestList.forEach(chest => {
            if (chest.id = id) {
                return chest
            }
        });
    }
}

// Socket events

io.on("connection", function(socket) {
    socket.on("joinRoom", function(username, roomID) {
        const player = playerJoin(socket.id, username, roomID);
        socket.join(player.room);
        io.emit("allUsers", players, leavePlayers, playingRooms);
        io.to(roomID).emit("updateUsers", getRoomUsers(player.room));
        io.to(roomID).emit("updateColors", getRoomUsers(player.room));
        io.to(roomID).emit("customize", gameStats);
    });

    socket.on("leaveRoom", function(leaveIndex){
        const player = playerLeave(leaveIndex);
        socket.leave(player.room);
        io.emit("allUsers", players, leavePlayers, playingRooms);
        io.to(player.room).emit("updateUsers", getRoomUsers(player.room));
        io.to(player.room).emit("updateColors", getRoomUsers(player.room));
    });
    
    socket.on("allUsers", function() {
        socket.emit("allUsers", players, leavePlayers, playingRooms);
    });

    socket.on("customize", function(roomID, stats) {
        gameStats = stats;
        io.to(roomID).emit("customize", gameStats);
    });

    socket.on("selected", function(roomID, index) {
        let player = getCurrentPlayer(socket.id);
        player.colorID = index;
        io.emit("allUsers", players, leavePlayers, playingRooms);
        io.to(roomID).emit("updateColors", getRoomUsers(player.room));
    });

    socket.on("startGame", function(roomID, room_size) {
        // Generate random permutation from 0 to n - 1
        let temp = [...Array(room_size).keys()];
        for (let i = room_size - 1; i >= 0; i--){
            let j = Math.floor(Math.random() * (i + 1));
            [temp[i], temp[j]] = [temp[j], temp[i]];
        }
        let roomUsers = getRoomUsers(roomID);
        for (let i = 0; i < room_size; i++){
            roomUsers[i].role = randomRole(temp, i);
        }
        playingRooms.push(roomID);

        let roomData = new RoomData(roomID, room_size);
        roomList.push(roomData);

        io.emit("allUsers", players, leavePlayers, playingRooms);
        let timer = 30;
        setInterval(function(){          
            io.to(roomID).emit('inGamePlay', timer);
            if (timer > 0) timer--;
        }, 1000)  
        io.to(roomID).emit("startGame", temp, roomUsers, roomData);
        

    });
    
    socket.on("disconnect", function(){
        let player;
        let index = players.indexOf(getCurrentPlayer(socket.id));   
        if (index != -1){
            player =  players.splice(index, 1)[0];
            let roomID = player.room;
            socket.leave(roomID);     
            io.to(roomID).emit("updateUsers", getRoomUsers(roomID));
            io.to(roomID).emit("updateColors", getRoomUsers(roomID));
        }
        else {
            index = leavePlayers.indexOf(getLeavePlayer(socket.id));
            player = leavePlayers.splice(index, 1)[0];
        }
        io.emit("allUsers", players, leavePlayers);
    });
})
server.listen(5500, function() {
    console.log("listen 5500");
});
