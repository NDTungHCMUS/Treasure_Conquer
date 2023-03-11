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

// User structure = {id, username, roomID, colorID, role, chestID, familiarity, gold, votedPlayers}

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

const getPlayerInRoom = function(room, id) {
    let roomUsers = getRoomUsers(room);
    return roomUsers.find(player => player.id === id);
}

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

const getCaptain = function(roomID) {
    return getRoomUsers(roomID).find(player => player.role === 'Captain');
}

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

const updateState_chestPhase = function(roomID, player) {
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
                io.to(player.id).emit("game:hint", getCaptain(roomID), chests);
            }
            else {
                player.deadState = true;
                io.to(roomID).emit("game:deadMessage", player.username);
                io.to(player.id).emit("game:disabled");
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

const updateState_votePhase = function(roomID) {
    sorted = getRoomUsers(roomID);
    sorted.sort((a, b) => b.votedPlayers.length - a.votedPlayers.length);
    if (sorted[0].votedPlayers.length <= 1){
        return;
    }
    let secondIndex = sorted.findIndex(player => player.votedPlayers.length < sorted[0].votedPlayers.length);
    if (secondIndex > 1){
        return;
    }
    let player = sorted[0];
    player.deadState = true;
    io.to(roomID).emit("game:deadMessage", player.username);
    io.to(player.id).emit("game:disabled");
};

// Check immediate condition to end game
const checkImmediateEndGame = function(roomID) {
    const roomUsers = getRoomUsers(roomID);
    const alivePlayers = roomUsers.filter(player => player.deadState === false);
    const aliveKillers = alivePlayers.filter(player => player.role === 'Killer');
    const deadPlayers = roomUsers.filter(player => player.deadState === true);
    if (deadPlayers.includes(getCaptain(roomID)) || 
    aliveKillers.length >= alivePlayers.length / 2) {
        io.to(roomID).emit("game:killersWin");
        isEndGame = true;
        return;
    }
    if (aliveKillers.length === 0) {
        io.to(roomID).emit("game:piratesWin");
        isEndGame = true;
        return;
    }
}

// Check last-turn condition to end game
const checkLastTurnEndGame = function(roomID) {
    sorted = getRoomUsers(roomID);
    sorted.sort((a, b) => b.gold - a.gold);
    let secondIndex = sorted.findIndex(player => player.gold < sorted[0].gold);
    for (let i = 0; i < secondIndex; i++) {
        if (sorted[i].role !== 'Killer'){
            io.to(roomID).emit("game:piratesWin");
            isEndGame = true;
            return;
        } 
    }
    io.to(roomID).emit("game:killersWin");
    isEndGame = true;
}

const removeGameProperty = function(roomID){
    let room = getCurrentRoom(roomID);
    let roomUsers = getRoomUsers(roomID);
    delete room.chestList;
    roomUsers.forEach(player => {
        delete player.role;
        delete player.gold;
        delete player.familiarity;
        delete player.chestID;
        delete player.votedPlayers;
    });
}

let players = [];
let leavePlayers = [];
let rooms = [];
let isEndGame = false;
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
        const room = getCurrentRoom(roomID);
        room.chestList = [];
        createChestList(room);
        io.emit("state:allUsers", players, leavePlayers, getPlayingRooms());
        for (let i = 0; i < room_size; i++) {
            roomUsers[i].role = randomRole(temp, roomID, i);
            roomUsers[i].gold = 0;
            roomUsers[i].familiarity = 0;
            roomUsers[i].chestID = -1;
            roomUsers[i].votedPlayers = [];
            roomUsers[i].deadState = false;
        }
        io.to(roomID).emit("room:roomUsers", roomUsers);
        io.to(roomID).emit("game:start", temp, room);
    });

    socket.on("game:timing", function(roomID){
        let roomUsers = getRoomUsers(roomID), updated = false;
        let numsOfTurn = getCurrentRoom(roomID).stats[1];
        let chooseChestDuration = getCurrentRoom(roomID).stats[2] / 3;
        let voteDuration = getCurrentRoom(roomID).stats[3] / 10;
        let endVoteDuration = 5; // Them 5s cap nhat so vote, thong bao co ai chet khi vote

        let counter = 0, captainDuration = 1, waitDuration = 1;
        let eachDuration = chooseChestDuration + captainDuration + waitDuration + voteDuration + endVoteDuration + 4;
        let totalTime = numsOfTurn * eachDuration, timeAccumulate = 0;
        let chestDown = chooseChestDuration, captainDown = captainDuration,
            waitDown = waitDuration, voteDown = voteDuration;
        let timer = [
            {
                start: 1, 
                end: 1 + chooseChestDuration
            },
            {
                start: 2 + chooseChestDuration,
                end: 2 + chooseChestDuration + captainDuration
            },
            {
                start: 3 + chooseChestDuration + captainDuration, 
                end: 3 + chooseChestDuration + captainDuration + waitDuration
            },
            {
                start: 4 + chooseChestDuration + captainDuration + waitDuration, 
                end: eachDuration
            }
        ]
        const gameLoop = setInterval(function(){
            counter++;
            if (timeAccumulate < totalTime) {
                timeAccumulate++;
            }
            for (let i = 0; i < numsOfTurn; i++){
                if (timeAccumulate >= timer[0].start + i * eachDuration &&
                    timeAccumulate < timer[0].end + i * eachDuration){
                    io.to(roomID).emit("game:chooseChestDuration", chestDown);
                    chestDown--;
                    break;
                }
                if (timeAccumulate == timer[0].end + i * eachDuration){
                    io.to(roomID).emit("game:chooseChestDuration", chestDown);
                    chestDown = chooseChestDuration;
                    break;
                }
                if (timeAccumulate >= timer[1].start + i * eachDuration &&
                    timeAccumulate < timer[1].end + i * eachDuration){
                    io.to(roomID).emit("game:captainDuration", captainDown);
                    captainDown--;
                    break;
                }
                if (timeAccumulate == timer[1].end + i * eachDuration){
                    io.to(roomID).emit("game:captainDuration", captainDown);
                    captainDown = captainDuration;
                    break;
                }
                if (timeAccumulate >= timer[2].start + i * eachDuration &&
                    timeAccumulate < timer[2].end + i * eachDuration){
                    io.to(roomID).emit("game:waitDuration", waitDown);
                    if (!updated) {
                        for (let i = 0; i < roomUsers.length; i++){
                            updateState_chestPhase(roomID, roomUsers[i]);
                        }
                        for (let i = 0; i < roomUsers.length; i++){
                            io.to(roomID).emit("game:getGold", roomUsers[i].gold, i);
                        }
                        updated = true;
                    }
                    waitDown--;
                    break;
                }
                if (timeAccumulate == timer[2].end + i * eachDuration){
                    io.to(roomID).emit("game:waitDuration", waitDown);
                    checkImmediateEndGame(roomID);
                    waitDown = waitDuration;
                    break;
                }
                if (timeAccumulate >= timer[3].start + i * eachDuration &&
                    timeAccumulate < timer[3].end + i * eachDuration){
                    io.to(roomID).emit("game:voteDuration", voteDown);
                    if (voteDown) voteDown--;
                    break;
                }
                if (timeAccumulate == timer[3].end + i * eachDuration) {
                    io.to(roomID).emit("game:voteDuration", voteDown);
                    updateState_votePhase(roomID);
                    checkImmediateEndGame(roomID, isEndGame);
                    for (let i = 0; i < roomUsers.length; i++) {
                        roomUsers[i].chestID = -1;
                        roomUsers[i].votedPlayers = [];
                    }
                    voteDown = voteDuration;
                    updated = false;
                }
            }
            if (counter == totalTime) {
                clearInterval(gameLoop);
                checkLastTurnEndGame(roomID, isEndGame);
            }
            if (isEndGame){
                clearInterval(gameLoop);
                io.to(roomID).emit("game:end");
                removeGameProperty(roomID);
                io.to(roomID).emit("room:listing", roomUsers);
                io.to(roomID).emit("room:coloring", roomUsers);
                io.to(roomID).emit("room:customize", getCurrentRoom(roomID).stats);
            }
        }, 1000);
    })

    socket.on("game:huntChest", function (roomID, chestID, id) {
        // const currentPlayer = getCurrentPlayer(socket.id);
        // currentPlayer.chestID = id;
        const currentPlayer = getPlayerInRoom(roomID, id);
        currentPlayer.chestID = chestID;
        io.to(roomID).emit("room:roomUsers", getRoomUsers(roomID));
        io.to(roomID).emit("game:huntChest", getChestHunters(roomID, chestID), chestID);
    });

    socket.on("game:vote", function (roomID, id) {
        const roomUsers = getRoomUsers(roomID);
        roomUsers[id].votedPlayers.push(socket.id);
        io.to(roomID).emit("room:roomUsers", roomUsers);
        io.to(roomID).emit("game:vote", roomUsers[id].votedPlayers, id);
    });

    // Chat
    socket.on("player-send-messages", (roomID, color, text) => {
    io.to(roomID).emit("socket-send-messages", {us: getCurrentPlayer(socket.id).username, c: color, t: text})
})
});

server.listen(5500, function () {
    console.log("listen 5500");
});