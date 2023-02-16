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

const getChestHunters = function(roomID, i){
    return getRoomUsers(roomID).filter(player => player.chestID === i);
}

const getGameStats = function(roomID){
    return allGameStats.find(x => x.room === roomID).stats;
}

const randomRole = function(randomID, i) {
    if (randomID[i] === 0) {
        return role[0];
    }
    else if (randomID[i] <= allGameStats[0]) {
        return role[1];
    }
    else if (randomID[i] === allGameStats[0] + 1){
        return role[2];
    }
    else return role[3];
}
    
let players = [];
let leavePlayers = [];
let playingRooms = [];
let allGameStats = [];
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
    socket.on("room:join", function(isHost, username, roomID) {
        const player = playerJoin(socket.id, username, roomID);
        socket.join(player.room);
        if (isHost){
            allGameStats.push({'room': roomID, 'stats': [2, 5, 30, 90]});
        }
        io.emit("state:allUsers", players, leavePlayers, playingRooms);
        io.to(roomID).emit("room:listing", getRoomUsers(player.room));
        io.to(roomID).emit("room:coloring", getRoomUsers(player.room));
        io.to(roomID).emit("room:customize", getGameStats(player.room));
    });

    socket.on("room:leave", function(leaveIndex){
        const player = playerLeave(leaveIndex);
        socket.leave(player.room);
        io.emit("state:allUsers", players, leavePlayers, playingRooms);
        io.to(player.room).emit("room:listing", getRoomUsers(player.room));
        io.to(player.room).emit("room:coloring", getRoomUsers(player.room));
    });
    
    socket.on("state:allUsers", function() {
        socket.emit("state:allUsers", players, leavePlayers, playingRooms);
    });

    socket.on("room:customize", function(roomID, stats) {
        allGameStats.find(x => x.room === roomID).stats = stats;
        io.to(roomID).emit("room:customize", getGameStats(roomID));
    });

    socket.on("room:chooseColor", function(roomID, index) {
        let player = getCurrentPlayer(socket.id);
        player.colorID = index;
        io.emit("state:allUsers", players, leavePlayers, playingRooms);
        io.to(roomID).emit("room:coloring", getRoomUsers(player.room));
    });

    socket.on("game:start", function(roomID, room_size) {
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

        io.emit("state:allUsers", players, leavePlayers, playingRooms);
        let timer = getGameStats(roomID)[2] + 8;
        setInterval(function(){    
            io.to(roomID).emit("game:timing", timer);
            if (timer > 0) timer--;
        }, 1000);
        io.to(roomID).emit("game:start", temp, roomUsers, roomData);
        chestRooms = new Array(room_size).fill([]);
        

    });
    
    socket.on("disconnect", function(){
        let player;
        let index = players.indexOf(getCurrentPlayer(socket.id));   
        if (index != -1){
            player =  players.splice(index, 1)[0];
            let roomID = player.room;
            socket.leave(roomID);     
            io.to(roomID).emit("room:listing", getRoomUsers(roomID));
            io.to(roomID).emit("room:coloring", getRoomUsers(roomID));
        }
        else {
            index = leavePlayers.indexOf(getLeavePlayer(socket.id));
            player = leavePlayers.splice(index, 1)[0];
        }
        io.emit("state:allUsers", players, leavePlayers);
    });

    socket.on("game:huntChest", function(roomID, id){
        const currentPlayer = getCurrentPlayer(socket.id);
        currentPlayer.chestID = id;
        io.emit("state:allUsers", players, leavePlayers, playingRooms);
        io.to(roomID).emit("game:huntChest", getChestHunters(roomID, id), id);
    });
})

server.listen(5500, function() {
    console.log("listen 5500");
});
