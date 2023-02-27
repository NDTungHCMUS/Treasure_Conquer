const express = require("express");
const path = require("path");
const app = express();

app.use(express.static(path.join(__dirname + "/public")));

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get("/", function (req, res) {
    //res.sendFile(__dirname +"/index.html");
});

/*
* USERS HANDLING FUNCTION
*/

// User structure = {id, username, roomID, colorID, role, chestID, familiarity, gold}

const playerJoin = function (id, username, room) {
    const player = { id, username, room };
    players.push(player);
    for (let i = 0; i < leavePlayers.length; i++) {
        if (leavePlayers[i].username == player.username) {
            leavePlayers.splice(i, 1);
        }
    }
    return player;
};

const playerLeave = function (index) {
    let player;
    if (index !== -1) {
        player = players.splice(index, 1)[0];
    }
    leavePlayers.push(player);
    return player;
};

const getCurrentPlayer = function (id) {
    return players.find((player) => player.id === id);
};

const getLeavePlayer = function (id) {
    return leavePlayers.find((player) => player.id === id);
};

/*
* ROOM HANDLING FUNCTION
*/

// Room structure = {id, stats, chestList}

const addRoom = function (roomID) {
    const room = {'id': roomID, 'stats': [2, 5, 30, 90]};
    rooms.push(room);
    return room;
};

const removeRoom = function (roomID) { 
    let room;
    const index = rooms.findIndex(x => x.id === roomID);
    if (index !== -1){
        room = rooms.splice(index, 1)[0];
    }
    return room;
};

const getRoomUsers = function (room) {
    return players.filter((player) => player.room === room);
};

const getActiveRooms = function () {
    return new Set(players.map((player) => player.room));
};

const getPlayingRooms = function() {
    return rooms.filter((room) => room.hasOwnProperty('chestList'));
}

const getCurrentRoom = function (roomID) {
    return rooms.find((x) => x.id === roomID);
}

const randomRole = function (randomID, roomID, i) {
    if (randomID[i] === 0) {
        return role[0];
    } else if (randomID[i] <= getCurrentRoom(roomID).stats[0]) {
        return role[1];
    } else if (randomID[i] === getCurrentRoom(roomID).stats[0] + 1) {
        return role[2];
    } else return role[3];
};

/*
* GAME HANDLING FUNCTION
*/

// Gamephase structure = {huntPhs, votePhs}

const getChestHunters = function (roomID, i) {
    return getRoomUsers(roomID).filter((player) => player.chestID === i);
};

const createChestList = function(room) {
    const room_size = getRoomUsers(room.id).length;
    const n100 = Math.floor((room_size + 2) / 7);
    const n75 = Math.floor((room_size - 2 - n100) / 2);
    const n50 = Math.floor((room_size - 1 - n100) / 2);
    const nList = [n100, n75, n50, 2];
    const posList = [[[7.5, 40.2], [31, 68]], [[23, 62], [17, 8], [12, 17], [28, 27]], [[4, 26], [15, 37], [22, 55], [6, 53]], [[33, 41], [23, 21]]];
    const valueList = [100, 75, 50, 35];
    const idList = ["c100", "c075", "c050", "c035"];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < nList[i]; j++) {
            room.chestList.push({id: idList[i] + j.toString(), value: valueList[i], position: posList[i][j]});
        }
    }
};

const updateState = function(roomID, player) {
    if (player.chestID === -1){
        return;
    }
    const chestHunters = getChestHunters(roomID, player.chestID);
    let hunterNum = chestHunters.length;
    if (hunterNum === 0){
    }
    else {
        const pirates = chestHunters.filter(player => player.role !== 'Killer');
        const killers = chestHunters.filter(player => player.role === 'Killer');
        const chests = getCurrentRoom(roomID).chestList;
        if (killers.length > 0 && pirates.length === 1){
            if (player.role === 'Killer'){
                io.to(player.id).emit("game:kill");
            }
            else {
                io.to(player.id).emit("game:killed"); 
                return;
            }
            const index = chestHunters.indexOf(pirates[0]);
            chestHunters.splice(index, 1);
            hunterNum = chestHunters.length;
        }
        else {
            player.role === 'Pirate' ? player.familiarity += (hunterNum - 1) : true;
        }
        player.gold += Math.floor(chests[player.chestID].value / hunterNum);
        if (player === chestHunters[0]) player.gold += (chests[player.chestID].value % hunterNum);
    }
    
};

let players = [];
let leavePlayers = [];
let rooms = [];
const role = ["Captain", "Killer", "Blacksmith", "Pirate"];


// Socket events

io.on("connection", function (socket) {
    socket.on("state:allUsers", function () {
        socket.emit("state:allUsers", players, leavePlayers, getPlayingRooms());
    });

    socket.on("disconnect", function () {
        let player;
        let index = players.indexOf(getCurrentPlayer(socket.id));
        if (index != -1) {
            player = players.splice(index, 1)[0];
            let roomID = player.room;
            socket.leave(roomID);
            io.to(roomID).emit("room:listing", getRoomUsers(roomID));
            io.to(roomID).emit("room:coloring", getRoomUsers(roomID));
        } else {
            index = leavePlayers.indexOf(getLeavePlayer(socket.id));
            player = leavePlayers.splice(index, 1)[0];
        }
        io.emit("state:allUsers", players, leavePlayers);
    });

    socket.on("room:join", function (isHost, username, roomID) {
        const player = playerJoin(socket.id, username, roomID);
        socket.join(player.room);
        if (isHost) {
            addRoom(roomID);
        }
        io.emit("state:allUsers", players, leavePlayers, getPlayingRooms());
        io.to(roomID).emit("room:listing", getRoomUsers(player.room));
        io.to(roomID).emit("room:coloring", getRoomUsers(player.room));
        io.to(roomID).emit("room:customize", getCurrentRoom(player.room).stats);
    });

    socket.on("room:leave", function (leaveIndex) {
        const player = playerLeave(leaveIndex);
        socket.leave(player.room);
        if (getRoomUsers(player.room).length === 0){
            removeRoom(player.room);
        }
        io.emit("state:allUsers", players, leavePlayers, getPlayingRooms());
        io.to(player.room).emit("room:listing", getRoomUsers(player.room));
        io.to(player.room).emit("room:coloring", getRoomUsers(player.room));
    });

    socket.on("room:customize", function (roomID, stats) {
        getCurrentRoom(roomID).stats = stats;
        io.to(roomID).emit("room:customize", getCurrentRoom(roomID).stats);
    });

    socket.on("room:chooseColor", function (roomID, index) {
        let player = getCurrentPlayer(socket.id);
        player.colorID = index;
        io.emit("state:allUsers", players, leavePlayers, getPlayingRooms());
        io.to(roomID).emit("room:coloring", getRoomUsers(player.room));
    });

    socket.on("game:start", function (roomID, room_size) {
        // Generate random permutation from 0 to n - 1
        let temp = [...Array(room_size).keys()];
        for (let i = room_size - 1; i >= 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [temp[i], temp[j]] = [temp[j], temp[i]];
        }
        let roomUsers = getRoomUsers(roomID);
        for (let i = 0; i < room_size; i++) {
            roomUsers[i].role = randomRole(temp, roomID, i);
            roomUsers[i].gold = 0;
            roomUsers[i].familiarity = 0;
            roomUsers[i].chestID = -1;
        }
        const room = getCurrentRoom(roomID);
        room.chestList = [];
        createChestList(room);
        io.emit("state:allUsers", players, leavePlayers, getPlayingRooms());
        io.to(roomID).emit("game:start", temp, roomUsers, room);
    });

    socket.on("game:timing", function (roomID){
        let roomUsers = getRoomUsers(roomID);
        let timer = getCurrentRoom(roomID).stats[2];
        const chestTiming = setInterval(function () {
            io.to(roomID).emit("game:timing", timer);
            if (timer > 0){
                timer--;
            }
            else {
                for (let i = 0; i < roomUsers.length; i++){
                    updateState(roomID, roomUsers[i]);
                }
                setTimeout(function() {
                    for (let i = 0; i < roomUsers.length; i++){
                        io.to(roomID).emit("game:getGold", roomUsers[i].gold, i);
                    }
                }, 6000);
                console.log(roomUsers);
                clearInterval(chestTiming);
            }
        }, 1000);
    });

    socket.on("game:huntChest", function (roomID, id) {
        const currentPlayer = getCurrentPlayer(socket.id);
        currentPlayer.chestID = id;
        io.emit("state:allUsers", players, leavePlayers, getPlayingRooms());
        io.to(roomID).emit("game:huntChest", getChestHunters(roomID, id), id);
    });
});

server.listen(5500, function () {
    console.log("listen 5500");
});
