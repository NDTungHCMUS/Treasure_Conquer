// Connect server

var socket = io("http://localhost:5500");
socket.emit("allUsers");

// User constants

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
//const playerBoxes = $(".player_list #show_player_list .box");
const colorOptns = $('.restroom_screen .color_options .option');
const sliders = $('.restroom_screen .customize div');
const ranges = $('.restroom_screen .customize div input');

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

let selectedColor;
let playerBoxes = $(".player_list #show_player_list .box");
let room_size = playerBoxes.length;
let temp = Math.floor(Math.random() * room_size);
const role = ["Adventurer", "Killer", "Hunter"];
const killerNum = 2;


$(window).on('mouseup', function(e) {
    const container = $('.activate_screen, .vote_screen');
    if (!container.is(e.target) && container.has(e.target).length === 0){
        container.fadeOut();
    }
});

// User events

let players = [];
class Player{
    constructor(index, name){
        this.index = index;
        this.name = name;
    }
}

const randomRole = function() {
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

const characterRole = function() {
    roleMes.text(randomRole());
    if (temp === 0) {
        roleDesc.text("Nhiệm vụ của bạn là tìm ra Killer đang trà trộn trong đoàn, sống sót và chiến thắng cùng Hunter.\n Mỗi lượt săn, bạn biết được số người chơi chọn 4 loại kho báu.");
    }
    else {
        if (temp <= killerNum) {
            roleDesc.text("Nhiệm vụ của bạn là cố gắng sống sót và kiếm được nhiều tiền nhất.\n Mỗi lượt săn, bạn có thể giết 1 Hunter nếu chỉ có Hunter đó săn cùng kho báu với bạn.");
        }
        else roleDesc.text("Nhiệm vụ của bạn là tìm giết Killer đang trà trộn trong đoàn.\n Mỗi lượt săn, nếu bạn được nhiều tiền nhất, bạn sẽ nhận được sự chú ý từ các thành viên khác và Killer sẽ không thể giết bạn.");
    }
    roleChr.css('background-color', selectedColor);
}

const randomRoomID = function() {
    return Math.floor(Math.random() * 90000) + 10000;
}

const chestList = function(ul, n) {
    let chest;
    for (let i = 0; i < n; i++){
        chest = $('<li>').addClass('option').text(i + 1);
        ul.append(chest);
    }
}

const createChestLists = function(n) {
    const list_60 = $('.game_screen .chests .c60');
    const list_80 = $('.game_screen .chests .c80');
    const list_120 = $('.game_screen .chests .c120');

    const n120 = Math.floor(n / 6);
    const n60 = Math.floor((n - 1 - n120) / 2);
    const n80 = Math.floor((n - 2 - n120) / 2);
    console.log(n - 2 - n120);
    console.log(n80);

    chestList(list_60, n60);
    chestList(list_80, n80);
    chestList(list_120, n120);
}

const playerJoin = function(id, username, room) {
    const player = {id, username, room};
    players.push(player);
    return player;
};

const playerLeave = function(id) {
    const index = players.findIndex(player => player.id === id);
    if (index !== -1) {
        return players.splice(index, 1)[0];
    }
} 

const getCurrentPlayer = function(id) {
    return players.find(player => player.id === id);
}

const getRoomUsers = function(room) {
    return players.filter(player => player.room === room);
}

const getActiveRooms = function() {
    return new Set(players.map(player => player.room));
}

const getActiveNames = function() {
    return players.map(player => player.username);
}

const getUsedColors = function() {
    return players.map(player => player.colorID);
}

const getDefaultColor = function() {
    for (let i = 0; i < colorOptns.length; i++) {
        if (!colorOptns.eq(i).hasClass('chosen')){
            return i;
        }
    }
    return -1;
}

const getBoxIndex = function(player) {
    for (let i = 0; i < playerBoxes.length; i++){
        if (playerBoxes.eq(i).find('p').text() == player.username){
            return i;
        }
    }
    return -1;
}

/*
* INITIAL SCREEN
*/

newRoomBtn.on("click", function() {
    // Check valid
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

    // Host event
    const username = usernameInput.val();
    socket.emit("joinRoom", username, roomID);
    roomIDMessage.text("ID: " + roomID);
    const index = getDefaultColor();
    colorOptns.eq(index).addClass('selected');
    let boxID = getBoxIndex(getCurrentPlayer(socket.id));
    selectedColor = colorOptns.eq(index).css('background-color');
    playerBoxes.eq(boxID).find('.color').css('background-color', selectedColor);
    socket.emit("selected", roomID, index);
    restroomScr.css('display', "grid");
    initialScr.css('display', "none");
});

joinRoomBtn.on('click', function() {
    // Check valid
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

    // Guest event
    const username = usernameInput.val();
    socket.emit("joinRoom", username, roomID);
    roomIDMessage.text("ID: " + roomID);
    setTimeout(() => {
        const index = getDefaultColor();
        colorOptns.eq(index).addClass('selected');
        let boxID = getBoxIndex(getCurrentPlayer(socket.id));
        selectedColor = colorOptns.eq(index).css('background-color');
        playerBoxes.eq(boxID).find('.color').css('background-color', selectedColor);
        socket.emit("selected", roomID, index);
    }, 200);
    ranges.hide();
    startGameBtn.hide();
    restroomScr.css('display', "grid");
    initialScr.css('display', "none");
});

/*
* RESTROOM SCREEN
*/

leaveRoomBtn.on('click', function() {
    initialScr.css('display', "flex");
    restroomScr.css('display', "none");
});

startGameBtn.on('click', function() {
    const roomID = getCurrentPlayer(socket.id).room;
    room_size = playerBoxes.length;
    if (room_size < 6 || room_size > 12){
        alert("Game should be started with around 6-12 players!!!");
        return;
    }
    socket.emit("startGame", roomID);
});

for (let i = 0; i < sliders.length; i++) {
    let range = sliders.eq(i).find('input');
    let val = sliders.eq(i).find('span');
    val.text(range.val());
    range.on('input', function() {
        const roomID = getCurrentPlayer(socket.id).room;
        socket.emit("customize", roomID, range.val(), i);
    });
}

for (let i = 0; i < colorOptns.length; i++){
    colorOptns.eq(i).on('click', function() {
        const roomID = getCurrentPlayer(socket.id).room;
        const elem = $('.color_options .selected');
        let index = getBoxIndex(getCurrentPlayer(socket.id));
        if (elem != null) elem.removeClass('selected');
        colorOptns.eq(i).addClass('selected');
        selectedColor = colorOptns.eq(i).css('background-color');
        playerBoxes.eq(index).find('.color').css('background-color', selectedColor);
        socket.emit("selected", roomID, i);
    });
}

/*
* GAME SCREEN
*/

activateBtn.on('click', function() {
    activateScr.css('display', 'flex');
});

voteBtn.on('click', function() {
    voteScr.css('display', 'flex');
});

for (let i = 0; i < chests.length; i++) {
    chests.eq(i).on('click', function() {
        const elem = $('.chests .option.selected');
        if (elem != null) elem.removeClass('selected');
        chests.eq(i).addClass('selected');
    });
}

// Socket events

socket.on("allUsers", listUser => {
    players = listUser;
});

socket.on("updateUsers", roomUsers => {
    player_list.html(``);
    roomUsers.forEach(player => {
        const playerDiv = $('<div>').addClass('box');
        const playerCol = $('<div>').addClass('color');
        playerDiv.append(playerCol);
        playerDiv.append(`<p>${player.username}</p>`);
        player_list.append(playerDiv);
        if (player.id === socket.id) {
            $(".player_list #show_player_list .box:last-child p").css('font-weight', "bold");
            playerBoxes = $(".player_list #show_player_list .box");
        }
    });
});

socket.on("startGame", function() {
    room_size = playerBoxes.length;
    temp = Math.floor(Math.random() * room_size);
    gameScr.css('display', "grid");
    restroomScr.css('display', "none");
    roleScr.css('display', "flex");
    roleName.text("Role: " + randomRole());
    createChestLists(room_size);
    if (temp > killerNum) {
        activateBtn.hide();
    }
    setTimeout(function() {
        roleScr.fadeOut();
    }, 8000);
    characterRole();
});

socket.on("customize", function(value, i) {
    sliders.eq(i).find('span').text(value);
});

socket.on("updateColors", function() {
    const elem = $('.color_options .chosen');
    if (elem != null) elem.removeClass('chosen');
    for (let i = 0; i < players.length; i++){
        if (players[i].id !== socket.id && players[i].colorID > -1){
            colorOptns.eq(players[i].colorID).addClass('chosen');
            const chosenColor = colorOptns.eq(players[i].colorID).css('background-color');
            console.log(chosenColor);
            playerBoxes.eq(i).find('.color').css('background-color', chosenColor);
        }
    };
})
