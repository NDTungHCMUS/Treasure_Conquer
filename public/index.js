// Connect server

var socket = io("http://localhost:5500");
socket.emit("joined");

// Player

let players = [];
class Player{
    constructor(index, name){
        this.index = index;
        this.name = name;
    }
}
const currentPlayer = new Array(12);
for (let i = 0; i < currentPlayer.length; i++){
    currentPlayer[i] = new Player(i, "Player " + (i + 1));
}

// User events

const initialScr = document.querySelector('.initial_screen');
const roomBtns = document.querySelectorAll('.initial_screen button');
const newRoomBtn = document.querySelector('.initial_screen #newRoomBtn');
const roomIDInput = document.querySelector('.initial_screen #roomCodeInput');
const joinRoomBtn = document.querySelector('.initial_screen #joinRoomBtn');

const restroomScr = document.querySelector('.restroom_screen');
const roomIDMessage = document.querySelector('.restroom_screen h3');
const leaveRoomBtn = document.querySelector('.restroom_screen #leaveRoomBtn');
const startGameBtn = document.querySelector('.restroom_screen #startGameBtn');
const player_list = document.querySelector(".player_list #show_player_list");
const colorOptns = document.querySelectorAll('.restroom_screen .color_options .option');

const gameScr = document.querySelector('.game_screen');
const roleMessage = document.querySelector('#role');
const activateBtn = document.querySelector('.game_screen #activateBtn');
const voteBtn = document.querySelector('.game_screen #voteBtn');

const activateScr = document.querySelector('.activate_screen');
const voteScr = document.querySelector('.vote_screen');

const temp = Math.floor(Math.random() * 6);
const role = ["Adventurer", "Killer", "Hunter"];


const randomRole = () => {
    if (temp === 0) {
        return role[0];
    }
    else {
        if (temp < 3) {
            return role[1];
        }
        else return role[2];
    }
}

const randomRoomID = () => {
    return Math.floor(Math.random() * 90000) + 10000;
}

// Event listener

window.addEventListener('mouseup', (event) => {
	if (!voteScr.contains(event.target) && voteScr.style.display != "none"){
        voteScr.style.display = "none";
    }
});

window.addEventListener('mouseup', (event) => {
	if (!activateScr.contains(event.target) && activateScr.style.display != "none"){
        activateScr.style.display = "none";
    }
});

roomBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        restroomScr.style.display = "grid";
        initialScr.style.display = "none";
    });
});

leaveRoomBtn.addEventListener("click", () => {
    initialScr.style.display = "flex";
    restroomScr.style.display = "none";
});

startGameBtn.addEventListener("click", () => {
    gameScr.style.display = "grid";
    restroomScr.style.display = "none";
    roleMessage.textContent = "Role: " + randomRole();
    if (temp > 2){
        activateBtn.style.display = "none";
    }
});

colorOptns.forEach(optn => {
    optn.addEventListener("click", () => {
        document.querySelector(".color_options .selected").classList.remove("selected");
        optn.classList.add("selected");
    });
});

activateBtn.addEventListener("click", () => {
    activateScr.style.display = "flex";
});

voteBtn.addEventListener("click", () => {
    voteScr.style.display = "flex";
});

// Socket events
socket.on("joined", (listUser) => {
    players = [];
    listUser.forEach((player) => {
        players.push(player);
        console.log(player.name);     
    })
})

let id = -1;
socket.on("own_join", (userID) => {
    id = userID;
});

socket.on("join", (eachUser) => {
    players.push(eachUser);
    player_list.innerHTML = "";
    for (let i = 0; i < players.length; i++){
        player_list.innerHTML += `<div>${players[i].name}</div>`;
    }
    if (id >= 0) player_list.childNodes[id].style.fontWeight = "bold";
});

newRoomBtn.addEventListener("click", (e) => {
    const roomID = randomRoomID();
    e.preventDefault();
    var index = players.length;
    roomIDMessage.textContent = "ID: " + roomID;
    socket.emit("create room", roomID.toString());
    socket.emit("join", currentPlayer[index], index);
});

joinRoomBtn.addEventListener("click", () => {
    var index = players.length;
    socket.emit("join room", roomIDInput.value.toString());
    let check = false;
    socket.on("join success", bool => {
        check = bool;
    })
    console.log(check);
    if (check){
        roomIDMessage.textContent = "ID: " + roomIDInput.value;
        socket.emit("join", currentPlayer[index], index);
    }
})




