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
const sliders = document.querySelectorAll('.restroom_screen .customize div');

const gameScr = document.querySelector('.game_screen');
const roleName = document.querySelector('#role');
const activateBtn = document.querySelector('.game_screen #activateBtn');
const voteBtn = document.querySelector('.game_screen #voteBtn');
const chests = document.querySelectorAll('.game_screen .chests .option');
const roleScr = document.querySelector('.role_screen');
const roleMes = document.querySelector('#role_mes');
const roleDesc = document.querySelector('#role_desc');
const roleChr = document.querySelector('.role_screen .character');
const activateScr = document.querySelector('.activate_screen');
const voteScr = document.querySelector('.vote_screen');

const temp = Math.floor(Math.random() * 6);
const role = ["Adventurer", "Killer", "Hunter"];

let selectedColor = "#a9a9a9";

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

const characterRole = () => {
    roleMes.innerText = randomRole();
    if (temp === 0) {
        roleDesc.innerText = "Nhiệm vụ của bạn là tìm ra Killer đang trà trộn trong đoàn, sống sót và chiến thắng cùng Hunter.\n Mỗi lượt săn, bạn biết được số người chơi chọn 4 loại kho báu.";
    }
    else {
        if (temp < 3) {
            roleDesc.innerText = "Nhiệm vụ của bạn là cố gắng sống sót và kiếm được nhiều tiền nhất.\n Mỗi lượt săn, bạn có thể giết 1 Hunter nếu chỉ có Hunter đó săn cùng kho báu với bạn.";
        }
        else roleDesc.innerText = "Nhiệm vụ của bạn là tìm giết Killer đang trà trộn trong đoàn.\n Mỗi lượt săn, nếu bạn được nhiều tiền nhất, bạn sẽ nhận được sự chú ý từ các thành viên khác và Killer sẽ không thể giết bạn. ";
    }
    roleChr.style.backgroundColor = selectedColor;
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
    roleScr.style.display = "flex";
    roleName.textContent = "Role: " + randomRole();
    if (temp > 2){
        activateBtn.style.display = "none";
    }
    setTimeout(() => {
        roleScr.style.display = "none";
    }, 10000);
    characterRole();
});

sliders.forEach(slider => {
    let range = slider.getElementsByTagName('input')[0];
    let val = slider.getElementsByTagName('span')[0];
    val.textContent = range.value;
    range.addEventListener('input', () => {
        val.textContent = range.value;
    });
});

colorOptns.forEach(optn => {
    optn.addEventListener("click", () => {
        const elem = document.querySelector(".color_options .selected");
        if (elem != null) elem.classList.remove("selected");
        optn.classList.add("selected");
        selectedColor = window.getComputedStyle(optn).getPropertyValue("background-color");
    });
});

activateBtn.addEventListener("click", () => {
    activateScr.style.display = "flex";
});

voteBtn.addEventListener("click", () => {
    voteScr.style.display = "flex";
});

chests.forEach(optn => {
    optn.addEventListener("click", () => {
        const elem = document.querySelector(".chests .option.selected");
        if (elem != null) elem.classList.remove("selected");
        optn.classList.add("selected");
    });
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
});
