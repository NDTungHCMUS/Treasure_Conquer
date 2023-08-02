const express = require("express");
const path = require("path");
const app = express();

app.use(express.static(path.join(__dirname + "/public")));

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {pingInterval: 2000, pingTimeout: 5000});

app.get("/", function (req, res) {
    //res.sendFile(__dirname +"/index.html");
});

/*
* USERS HANDLING FUNCTION
*/

// User structure = {id, username, roomID, colorID, role, chestID, familiarity, gold, votedPlayers, deadState}

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

// Room structure = {id, stats, chestList, isPlaying}

const addRoom = function (roomID) {
    const room = {'id': roomID, 'stats': [1, 4, 30, 90]};
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
    return getCurrentRoom(roomID).chestList[i].hunters.map(id => getCurrentPlayer(id));
};

const createChestList = function(room) {
    const room_size = getRoomUsers(room.id).length;
    const n100 = Math.floor((room_size + 2) / 7);
    const n85 = Math.floor((room_size - 2 - n100) / 2);
    const n65 = Math.floor((room_size - 1 - n100) / 2);
    const nList = [n100, n85, n65, 2];
    const posList = [[[7.5, 40.2], [31, 68]], [[23, 62], [17, 8], [12, 17], [28, 27]], [[4, 26], [15, 37], [22, 55], [6, 53]], [[33, 41], [23, 21]]];
    const valueList = [100, 85, 65, 50];
    const idList = ["c100", "c085", "c065", "c050"];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < nList[i]; j++) {
            room.chestList.push({id: idList[i] + j.toString(), value: valueList[i], position: posList[i][j], hunters: []});
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
        const killers = chestHunters.filter(player => player.role === 'Killer').filter(player => player.killState === true);
        const chests = getCurrentRoom(roomID).chestList;
        const blacksmithIdx = chestHunters.findIndex(player => player.role === 'Blacksmith');
        const blacksmith = chestHunters.filter(player => player.role === 'Blacksmith');
        // Killer abilities
        if (killers.length > 0 && pirates.length === 1 && pirates[0].deadState !== -1){
            if (player.role === 'Killer'){
                io.to(player.id).emit("game:hint", getCaptain(roomID), chests);
            }
            else {
                player.deadState = 1;
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
            io.to(player.id).emit("game:familiarity", player.familiarity);
        }

        // Blacksmith abilities
        if (player !== chestHunters[blacksmithIdx] && player.deadState === -1){
            player.deadState = 0;
        }
        if (blacksmithIdx !== -1 && hunterNum > 1){
            if (chestHunters.includes(getCaptain(roomID))){
                getCaptain(roomID).deadState = -1;
            }
            else {
                let rand = Math.floor(Math.random() * hunterNum);
                while (rand === blacksmithIdx){
                    rand = Math.floor(Math.random() * hunterNum);
                }
                chestHunters[rand].deadState = -1;
                setTimeout(() => {
                    io.to(blacksmith.id).emit("state:alert", chestHunters[rand].username + ' was protected');
                }, 5000);
            }
        }

        // Get gold
        player.gold += Math.floor(chests[player.chestID].value / hunterNum);
        if (player === chestHunters[0]) player.gold += (chests[player.chestID].value % hunterNum);
    }
};

const updateState_votePhase = function(roomID) {
    sorted = getRoomUsers(roomID);
    sorted.sort((a, b) => b.votedPlayers.size - a.votedPlayers.size);
    if (sorted[0].votedPlayers.size <= 1){
        return;
    }
    let secondIndex = sorted.findIndex(player => player.votedPlayers.size < sorted[0].votedPlayers.size);
    if (secondIndex > 1){
        return;
    }
    let player = sorted[0];
    player.deadState = 1;
    io.to(roomID).emit("game:deadMessage", player.username);
    io.to(player.id).emit("game:disabled");
};

// Check immediate condition to end game
const checkImmediateEndGame = function(roomUsers, roomID) {
    const room = getCurrentRoom(roomID);
    const alivePlayers = roomUsers.filter(player => player.deadState < 1);
    const aliveKillers = alivePlayers.filter(player => player.role === 'Killer');
    const deadPlayers = roomUsers.filter(player => player.deadState === 1);
    if (deadPlayers.includes(getCaptain(roomID)) || 
    aliveKillers.length >= alivePlayers.length / 2) {
        io.to(roomID).emit("game:killersWin");
        room.isPlaying = false;
        return;
    }
    if (aliveKillers.length === 0) {
        io.to(roomID).emit("game:piratesWin");
        room.isPlaying = false;
        return;
    }
}

// Check last-turn condition to end game
const checkLastTurnEndGame = function(roomID) {
    sorted = getRoomUsers(roomID);
    roomUsers = sorted;
    const room = getCurrentRoom(roomID);
    sorted.sort((a, b) => b.gold - a.gold);
    let secondIndex = sorted.findIndex(player => player.gold < sorted[0].gold);
    if (secondIndex === -1){
        room.lastChance = true;
    }
    for (let i = 0; i < secondIndex; i++) {
        if (sorted[i].role !== 'Killer'){
            room.lastChance = true;
            break;
        } 
    }
    if (room.lastChance){
        const aliveKillers = roomUsers.filter(player => player.deadState < 1 && player.role === 'Killer');
        const targetSet = [...new Set(room.lastKillTarget)];
        if (room.lastKillTarget.length !== aliveKillers.length || targetSet.length !== 1 || 
            roomUsers[targetSet[0]].role !== 'Captain'){
                io.to(roomID).emit("game:piratesWin");
                room.isPlaying = false;
                return;
        }
    }
    io.to(roomID).emit("game:killersWin");
    room.isPlaying = false;
}

const removeGameProperty = function(roomID){
    let room = getCurrentRoom(roomID);
    let roomUsers = getRoomUsers(roomID);
    delete room.chestList;
    delete room.isPlaying;
    delete room.lastChance;
    delete room.lastKillTarget;
    roomUsers.forEach(player => {
        delete player.role;
        delete player.gold;
        delete player.familiarity;
        delete player.chestID;
        delete player.votedPlayers;
        delete player.deadState;
        delete player.killState;
    });
}

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
        socket.to(roomID).emit("state:alert", username + ' joined');
    });

    socket.on("room:leave", function (leaveIndex) {
        const player = playerLeave(leaveIndex);
        const roomUsers = getRoomUsers(player.room);
        let mes = "";
        socket.leave(player.room);
        if (roomUsers.length === 0){
            removeRoom(player.room);
        }
        if (leaveIndex === 0 && roomUsers.length > 0){
            mes = ", " + roomUsers[0].username + " is hosting now";
        }
        io.emit("state:allUsers", players, leavePlayers, getPlayingRooms());
        io.to(player.room).emit("room:listing", roomUsers);
        io.to(player.room).emit("room:coloring", roomUsers);
        socket.to(player.room).emit("state:alert", player.username + ' left' + mes);
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
        room.isPlaying = true;
        room.lastChance = false;
        room.lastKillTarget = [];
        createChestList(room);
        io.emit("state:allUsers", players, leavePlayers, getPlayingRooms());
        for (let i = 0; i < room_size; i++) {
            roomUsers[i].role = randomRole(temp, roomID, i);
            roomUsers[i].gold = 0;
            roomUsers[i].familiarity = 0;
            roomUsers[i].chestID = -1;
            roomUsers[i].votedPlayers = new Set();
            roomUsers[i].deadState = 0;
        }
        const killers = roomUsers.filter(player => player.role === 'Killer');
        const blacksmith = roomUsers.filter(player => player.role === 'Blacksmith');
        blacksmith[0].deadState = -1;
        killers.forEach(function(killer) {
            killer.killState = true;
        });
        io.to(roomID).emit("room:roomUsers", roomUsers);
        io.to(roomID).emit("game:start", temp, room);
    });

    socket.on("game:timing", function(roomID){
        let roomUsers = getRoomUsers(roomID);
        let numsOfTurn = getCurrentRoom(roomID).stats[1];
        let chooseChestDuration = getCurrentRoom(roomID).stats[2] / 3;
        let voteDuration = getCurrentRoom(roomID).stats[3] / 10;
        let endVoteDuration = 5; // Them 5s cap nhat so vote, thong bao co ai chet khi vote

        let counter = 0, captainDuration = 5, waitDuration = 5;
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
                    if (timeAccumulate === timer[2].start + i * eachDuration) {
                        for (let i = 0; i < roomUsers.length; i++){
                            updateState_chestPhase(roomID, roomUsers[i]);
                        }
                        for (let i = 0; i < roomUsers.length; i++){
                            io.to(roomID).emit("game:getGold", roomUsers[i].gold, i);
                        }
                    }
                    waitDown--;
                    break;
                }
                if (timeAccumulate == timer[2].end + i * eachDuration){
                    io.to(roomID).emit("game:waitDuration", waitDown);
                    checkImmediateEndGame(roomUsers, roomID);
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
                    checkImmediateEndGame(roomUsers, roomID);
                    for (let i = 0; i < roomUsers.length; i++) {
                        getCurrentRoom(roomID).chestList[i].hunters = [];
                        roomUsers[i].chestID = -1;
                        roomUsers[i].votedPlayers = new Set();
                    }
                    const killers = roomUsers.filter(player => player.role === 'Killer');
                    const blacksmith = roomUsers.filter(player => player.role === 'Blacksmith' && player.deadState < 1);
                    if (blacksmith.length){
                        blacksmith[0].deadState = 0;
                    }
                    killers.forEach(function(killer) {
                        killer.killState = true;
                    });
                    voteDown = voteDuration;
                }
            }
            if (counter == totalTime) {
                clearInterval(gameLoop);
                checkLastTurnEndGame(roomID);
            }
            if (getCurrentRoom(roomID).isPlaying === false){
                clearInterval(gameLoop);
                removeGameProperty(roomID);
                io.to(roomID).emit("game:end");
                roomUsers = getRoomUsers(roomID);
                io.to(roomID).emit("room:listing", roomUsers);
                io.to(roomID).emit("room:coloring", roomUsers);
                io.to(roomID).emit("room:customize", getCurrentRoom(roomID).stats);
            }
        }, 1000);
    })

    socket.on("game:huntChest", function (roomID, id) {
        getCurrentPlayer(socket.id).chestID = id;
        getCurrentRoom(roomID).chestList[id].hunters.push(socket.id);
        io.to(roomID).emit("room:roomUsers", getRoomUsers(roomID));
        io.to(roomID).emit("game:huntChest", getChestHunters(roomID, id), id);
    });

    socket.on("game:outChest", function(player) {
        let roomID = player.room;
        let id = player.chestID;
        let chestHunters = getCurrentRoom(roomID).chestList[id].hunters;
        chestHunters.splice(chestHunters.findIndex(x => x === socket.id), 1);
        getCurrentPlayer(socket.id).chestID = -1;
    });

    socket.on("game:killState", function(kill_state) {
        getCurrentPlayer(socket.id).killState = kill_state;
    });

    socket.on("game:vote", function (roomID, id) {
        const roomUsers = getRoomUsers(roomID);
        roomUsers[id].votedPlayers.add(socket.id);
        io.to(roomID).emit("room:roomUsers", roomUsers);
        io.to(roomID).emit("game:vote", [...roomUsers[id].votedPlayers], id);
    });

    socket.on("game:lastKill", function (roomID, id) {
        const room = getCurrentRoom(roomID);
        room.lastKillTarget.push(id);
    });
    // Chat
    socket.on("game:sendMessages", (roomID, color, text) => {
        io.to(roomID).emit("game:recvMessages", {us: getCurrentPlayer(socket.id).username, c: color, t: text});
    });
});

server.listen(5500, function () {
    console.log("listen 5500");
});