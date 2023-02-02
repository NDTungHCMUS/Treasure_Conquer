// Connect server

var socket = io("http://localhost:5500");
socket.emit("allUsers");

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
    roleMes.text(randomRole());
    if (temp === 0) {
        roleDesc.text("Nhiệm vụ của bạn là tìm ra Killer đang trà trộn trong đoàn, sống sót và chiến thắng cùng Hunter.\n Mỗi lượt săn, bạn biết được số người chơi chọn 4 loại kho báu.");
    }
    else {
        if (temp < 3) {
            roleDesc.text("Nhiệm vụ của bạn là cố gắng sống sót và kiếm được nhiều tiền nhất.\n Mỗi lượt săn, bạn có thể giết 1 Hunter nếu chỉ có Hunter đó săn cùng kho báu với bạn.");
        }
        else roleDesc.text("Nhiệm vụ của bạn là tìm giết Killer đang trà trộn trong đoàn.\n Mỗi lượt săn, nếu bạn được nhiều tiền nhất, bạn sẽ nhận được sự chú ý từ các thành viên khác và Killer sẽ không thể giết bạn.");
    }
    roleChr.css('background-color', selectedColor);
}

const randomRoomID = () => {
    return Math.floor(Math.random() * 90000) + 10000;
}

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

const getActiveRooms = (players) => {
    return new Set(players.map(player => player.room));
}

const getActiveNames = (players) => {
    return players.map(player => player.username);
}

// User events

const initialScr = $('.initial_screen');
const roomBtns = $('.initial_screen button');
const usernameInput = $('.initial_screen #usernameInput');
const newRoomBtn = $('.initial_screen #newRoomBtn');
const roomIDInput = $('.initial_screen #roomCodeInput');
const joinRoomBtn = $('.initial_screen #joinRoomBtn');

const restroomScr = $('.restroom_screen');
const roomIDMessage = $('.restroom_screen h3');
const leaveRoomBtn = $('.restroom_screen #leaveRoomBtn');
const startGameBtn = $('.restroom_screen #startGameBtn');
const player_list = $(".player_list #show_player_list");
const colorOptns = $('.restroom_screen .color_options .option');
const sliders = $('.restroom_screen .customize div');

const gameScr = $('.game_screen');
const roleName = $('#role');
const activateBtn = $('.game_screen #activateBtn');
const voteBtn = $('.game_screen #voteBtn');
const chests = $('.game_screen .chests .option');
const roleScr = $('.role_screen');
const roleMes = $('#role_mes');
const roleDesc = $('#role_desc');
const roleChr = $('.role_screen .character');
const activateScr = $('.activate_screen');
const voteScr = $('.vote_screen');

const temp = Math.floor(Math.random() * 6);
const role = ["Adventurer", "Killer", "Hunter"];

let selectedColor = "#a9a9a9";

$(window).on('mouseup', (e) => {
    const container = $('.activate_screen, .vote_screen');
    if (!container.is(e.target) && container.has(e.target).length === 0){
        container.fadeOut();
    }
});

leaveRoomBtn.on('click', () => {
    initialScr.css('display', "flex");
    restroomScr.css('display', "none");
});

startGameBtn.on('click', () => {
    gameScr.css('display', "grid");
    restroomScr.css('display', "none");
    roleScr.css('display', "flex");
    roleName.text("Role: " + randomRole());
    if (temp > 2) {
        activateBtn.hide();
    }
    setTimeout(() => {
        roleScr.fadeOut();
    }, 8000);
    characterRole();
});

for (let i = 0; i < sliders.length; i++) {
    let range = sliders.eq(i).find('input');
    let val = sliders.eq(i).find('span');
    val.text(range.val());
    range.on('input', () => {
        val.text(range.val());
    });
}

for (let i = 0; i < colorOptns.length; i++){
    colorOptns.eq(i).on('click', () => {
        const elem = $('.color_options .selected');
        if (elem != null) elem.removeClass('selected');
        colorOptns.eq(i).addClass('selected');
        selectedColor = colorOptns.eq(i).css('background-color');
    });
}

activateBtn.on('click', () => {
    activateScr.css('display', 'flex');
});

voteBtn.on('click', () => {
    voteScr.css('display', 'flex');
});

for (let i = 0; i < chests.length; i++) {
    chests.eq(i).on('click', () => {
        const elem = $('.chests .option.selected');
        if (elem != null) elem.removeClass('selected');
        chests.eq(i).addClass('selected');
    });
}

// Socket events

socket.on("allUsers", listUser => {
    players = listUser;
});

socket.on("updateRoom", roomUsers => {
    player_list.html(``);
    roomUsers.forEach(player => {
        player_list.append(`<div>${player.username}</div>`);
    });
});

socket.on("highlight", (roomUsers, id) => { // Highlight bi sai
    const index = roomUsers.findIndex(player => player.id === id);
    player_list.eq(index).css('font-weight', "bold");
});

newRoomBtn.on("click", () => {
    const usernames = getActiveNames(players);
    const rooms = getActiveRooms(players);
    if (!usernameInput.val()){
        alert("Forgot to enter username!!!");
        return;
    }
    if (usernames.includes(usernameInput.val())){
        alert("Existed username!!!");
        return;
    }
    const roomID = randomRoomID().toString();
    while (rooms.has(roomID)){
        roomID = randomRoomID().toString();
    }
    const username = usernameInput.val();
    socket.emit("joinRoom", username, roomID);
    roomIDMessage.text("ID: " + roomID);
    restroomScr.css('display', "grid");
    initialScr.css('display', "none");
});

joinRoomBtn.on('click', () => {
    const usernames = getActiveNames(players);
    const rooms = getActiveRooms(players);
    if (!usernameInput.val()){
        alert("Forgot to enter username!!!");
        return;
    }
    if (usernames.includes(usernameInput.val())){
        alert("Existed username!!!");
        return;
    }
    if (!roomIDInput.val()){
        alert("Forgot to enter room ID!!!");
        return;
    }
    const roomID = roomIDInput.val();
    if (!rooms.has(roomID)){
        alert("Invalid room ID!!!");
        return;
    }
    const username = usernameInput.val();
    socket.emit("joinRoom", username, roomID);
    roomIDMessage.text("ID: " + roomID);
    restroomScr.css('display', "grid");
    initialScr.css('display', "none");
});
