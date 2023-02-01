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

const initialScr = $('.initial_screen');
const roomBtns = $('.initial_screen button');
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

// Event listener

// window.addEventListener('mouseup', (event) => {
// 	if (!voteScr.contains(event.target) && voteScr.style.display != "none"){
//         voteScr.style.display = "none";
//     }
// });

// window.addEventListener('mouseup', (event) => {
// 	if (!activateScr.contains(event.target) && activateScr.style.display != "none"){
//         activateScr.style.display = "none";
//     }
// });

$(window).on('mouseup', (e) => {
    const container = $('.activate_screen, .vote_screen');
    if (!container.is(e.target) && container.has(e.target).length === 0){
        container.fadeOut();
    }
});

// roomBtns.forEach(btn => {
//     btn.addEventListener("click", () => {
//         restroomScr.style.display = "grid";
//         initialScr.style.display = "none";
//     });
// });

roomBtns.on('click', () => {
    restroomScr.css('display', "grid");
    initialScr.css('display', "none");
});

// leaveRoomBtn.addEventListener("click", () => {
//     initialScr.style.display = "flex";
//     restroomScr.style.display = "none";
// });

leaveRoomBtn.on('click', () => {
    initialScr.css('display', "flex");
    restroomScr.css('display', "none");
});

// startGameBtn.addEventListener("click", () => {
//     gameScr.style.display = "grid";
//     restroomScr.style.display = "none";
//     roleScr.style.display = "flex";
//     roleName.textContent = "Role: " + randomRole();
//     if (temp > 2){
//         activateBtn.style.display = "none";
//     }
//     setTimeout(() => {
//         roleScr.style.display = "none";
//     }, 10000);
//     characterRole();
// });

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

// sliders.forEach(slider => {
//     let range = slider.getElementsByTagName('input')[0];
//     let val = slider.getElementsByTagName('span')[0];
//     val.textContent = range.value;
//     range.addEventListener('input', () => {
//         val.textContent = range.value;
//     });
// });

for (let i = 0; i < sliders.length; i++) {
    let range = sliders.eq(i).find('input');
    let val = sliders.eq(i).find('span');
    val.text(range.val());
    range.on('input', () => {
        val.text(range.val());
    });
}

// colorOptns.forEach(optn => {
//     optn.addEventListener("click", () => {
//         const elem = $(".color_options .selected");
//         if (elem != null) elem.classList.remove("selected");
//         optn.classList.add("selected");
//         selectedColor = window.getComputedStyle(optn).getPropertyValue("background-color");
//     });
// });

for (let i = 0; i < colorOptns.length; i++){
    colorOptns.eq(i).on('click', () => {
        const elem = $('.color_options .selected');
        if (elem != null) elem.removeClass('selected');
        colorOptns.eq(i).addClass('selected');
        selectedColor = colorOptns.eq(i).css('background-color');
    });
}

// activateBtn.addEventListener("click", () => {
//     activateScr.style.display = "flex";
// });

// voteBtn.addEventListener("click", () => {
//     voteScr.style.display = "flex";
// });

activateBtn.on('click', () => {
    activateScr.css('display', 'flex');
});

voteBtn.on('click', () => {
    voteScr.css('display', 'flex');
});

// chests.forEach(optn => {
//     optn.addEventListener("click", () => {
//         const elem = $(".chests .option.selected");
//         if (elem != null) elem.classList.remove("selected");
//         optn.classList.add("selected");
//     });
// });

for (let i = 0; i < chests.length; i++) {
    chests.eq(i).on('click', () => {
        const elem = $('.chests .option.selected');
        if (elem != null) elem.removeClass('selected');
        chests.eq(i).addClass('selected');
    });
}

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
    for (let i = 0; i < players.length; i++){
        player_list.append(`<div>${players[i].name}</div>`);
    }
    if (id >= 0) player_list.eq(id).css('font-weight', "bold");
});

// newRoomBtn.addEventListener("click", (e) => {
//     const roomID = randomRoomID();
//     e.preventDefault();
//     var index = players.length;
//     roomIDMessage.textContent = "ID: " + roomID;
//     socket.emit("create room", roomID.toString());
//     socket.emit("join", currentPlayer[index], index);
// });

newRoomBtn.on("click", () => {
    const roomID = randomRoomID();
    var index = players.length;
    roomIDMessage.text("ID: " + roomID);
    socket.emit("create room", roomID.toString());
    socket.emit("join", currentPlayer[index], index);
});

// joinRoomBtn.addEventListener("click", () => {
//     var index = players.length;
//     socket.emit("join room", roomIDInput.value.toString());
//     let check = false;
//     socket.on("join success", bool => {
//         check = bool;
//     })
//     console.log(check);
//     if (check){
//         roomIDMessage.textContent = "ID: " + roomIDInput.value;
//         socket.emit("join", currentPlayer[index], index);
//     }
// });

joinRoomBtn.on('click', () => {
    var index = players.length;
    socket.emit("join room", roomIDInput.value.toString());
    let check = false;
    socket.on("join success", bool => {
        check = bool;
    })
    console.log(check);
    if (check){
        roomIDMessage.text("ID: " + roomIDInput.value);
        socket.emit("join", currentPlayer[index], index);
    }
});

// Da chinh sua code khi them thu vien jQuery
