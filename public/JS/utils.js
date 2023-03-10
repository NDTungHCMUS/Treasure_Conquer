// User constants

const ssiBar = $('.ssi_bar');
const storyBtn = $('.ssi_bar #storyBtn');
const storyScr = $('.ssi_bar #storyScreen');
const settingBtn = $('.ssi_bar #settingBtn');
const settingScr = $('.ssi_bar #settingScreen');
const settingContent = $('.ssi_bar #settingScreen .setting_content');
const storyText = $('.ssi_bar #storyScreen .text');
const NavUpBtn = $('.navigate .up');
const NavPageBtn = $('.navigate .page-mark');
const NavDownBtn = $('.navigate .down');

const initialScr = $('.initial_screen');
const settingList = $('.initial_screen .setting_list div');
let usernameInputDiv = $('.initial_screen #usernameInputDiv');
let usernameInput = $('.initial_screen #usernameInput');
let newRoomBtnDiv = $('.initial_screen #newRoomBtnDiv');
const newRoomBtn = $('.initial_screen #newRoomBtn');
let roomIDInput = $('.initial_screen #roomCodeInput');
const joinRoomBtn = $('.initial_screen #joinRoomBtn');

const restroomScr = $('.restroom_screen');
const roomIDMessage = $('.restroom_screen h3');
const leaveRoomBtn = $('.restroom_screen #leaveRoomBtn');
const startGameBtn = $('.restroom_screen #startGameBtn');
const player_list = $(".player_list #show_player_list");
let playerBoxes = $(".player_list #show_player_list .box");
const colorOptns = $('.restroom_screen .color_options .option');
const sliders = $('.restroom_screen .customize div');
const ranges = $('.restroom_screen .customize div input');
const characterSVG = $('.update .character');

const gameScr = $('.game_screen');
const treasureScr = $('.game_screen .treasure');
const caveScr = $('.game_screen .cave');
const caveChr = $('.cave .character');
const roleName = $('.game_screen #role');
const gameTime = $('.game_screen #time');
const activateBtn = $('.game_screen #activateBtn');
let chests = $('.game_screen .treasure .chest');
const roleScr = $('.role_screen');
const roleMes = $('.role_screen #role_mes');
const roleDesc = $('#role_desc');
const roleChr = $('.role_screen .character');
const activateScr = $('.activate_screen');

const voteScr = $('.vote_screen');
const voteList = $('.vote_screen #show_vote_list');
const roleInVote = $('.vote_screen #role');
const voteTime = $('.vote_screen #time');
const skipBtn = $('.vote_screen #skipVoteBtn');
const leaderboard = $('.leaderboard #show_leaderboard');
let voteCircles;
let voteBtn;
let posters;
let goldValue;

let currentPage = 0;
const role = ["Captain", "Killer", "Blacksmith", "Pirate"];
let gameStats = [2, 5, 30, 90];
let selectedColor;
let randomID = [];
let room_size = playerBoxes.length;
let players = [];
let leavePlayers = [];
let inLeaveState = false;
let inDeadState = false;
let playingRooms = [];
let roomUsers = [];

// Clone HTML code
characterSVG.html($('.textures .spriteDiv').html());
voteList.html(player_list.html());

/*
* USERS HANDLING FUNCTION
*/

// Room ID generate from 10^4 to 10^5 - 1
const randomRoomID = function() {
    return Math.floor(Math.random() * 90000) + 10000;
}

// A player base on id (in players)
const getCurrentPlayer = function(id) {
    return players.find(player => player.id === id);
}

// A player base on id (in roomUsers)
const getPlayerInRoom = function(id) {
    return roomUsers.find(player => player.id === id);
}

// A player base on id (in leavePlayers)
const getLeavePlayer = function(id) {
    return leavePlayers.find(player => player.id === id);
}

// A list of active player names
const getActiveNames = function() {
    return players.map(player => player.username);
}

// A list of player names in leaveRoom state
const getLeaveNames = function() {
    return leavePlayers.map(player => player.username);
}

// Check if name hasn't used yet
const checkValidName = function(activeUsernames, leaveUsernames){
    if (!usernameInput.val() || usernameInput.val().length > 16){
        alert("Your username must have around 1-16 character(s)!!!");
        return false;
    }
    if (activeUsernames.includes(usernameInput.val()) || leaveUsernames.includes(usernameInput.val())){
        alert("Existed username!!!");
        return false;
    }
    return true;
}

// Check if room exists and hasn't played yet
const checkValidRoom = function(rooms, roomID){
    if (!roomID){
        alert("Forgot to enter room ID!!!");
        return false;
    }
    if (!rooms.has(roomID)){
        alert("Invalid room ID!!!");
        return false;
    }
    if (playingRooms.length > 0 && playingRooms.includes(roomID)){
        alert(`Room ${roomID} has started`);
        return false;
    }
    return true;
}

// Default color of a player
const getDefaultColor = function() {
    for (let i = 0; i < colorOptns.length; i++) {
        if (!colorOptns.eq(i).hasClass('chosen')){
            return i;
        }
    }
    return -1;
}

// Current box index
const getBoxIndex = function() {
    for (let i = 0; i < playerBoxes.length; i++) {
        if (playerBoxes.eq(i).hasClass('current')){
            return i;
        }
    }
    return -1;
}

// Box base on username
const getBoxByName = function(boxes, username) {
    for (let i = 0; i < boxes.length; i++) {
        if (boxes.eq(i).find('.username').text() === username){
            return boxes.eq(i);
        }
    }
    return null;
}

/*
* ROOM HANDLING FUNCTION
*/

// List of users base on roomID
const getRoomUsers = function(room) {
    return players.filter(player => player.room === room);
}

// List of exist rooms
const getActiveRooms = function() {
    return new Set(players.map(player => player.room));
}

// Role generate random base on room_size
const randomRole = function(i) {
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

// List of used colors by room users
const getUsedColors = function() {
    return players.map(player => player.colorID);
}

/* 
* GRAPHIC FUNCTION
*/

// Handle event for chest list from server
const chestEvent_updateByServer = function(chests){
    for (let i = 0; i < chests.length; i++) {
        chests.eq(i).on('click', function() {
            const elem = $('.treasure .chest.selected');
            if (elem != null) elem.removeClass('selected');
            chests.eq(i).addClass('selected');
            socket.emit("game:huntChest", getCurrentPlayer(socket.id).room, i, socket.id);
            treasureScr.fadeOut();
            caveScr.fadeIn();
            caveScr.css('display', 'flex');
        });
    }
}

const fillColorForCharacter = function(invisible, color) {
    caveChr.append($('.textures .spriteDiv').html());
    if (invisible) {
        $('.character .sprite:last-child').find('.cls-8').css('fill', color); 
    }
    else {
        $('.character .sprite:last-child').find('.cls-24').css('fill', color); 
        $('.character .sprite:last-child').find('.cls-23').css('fill', color);  
        $('.character .sprite:last-child').find('.cls-22').css('fill', color);  
        $('.character .sprite:last-child').find('.cls-21').css('fill', color);  
        $('.character .sprite:last-child').find('.cls-20').css('fill', color); 
        $('.character .sprite:last-child').find('.cls-19').css('fill', color);  
        $('.character .sprite:last-child').find('.cls-18').css('fill', color); 
        $('.character .sprite:last-child').find('.cls-17').css('fill', color);
        $('.character .sprite:last-child').find('.cls-16').css('fill', color);  
        $('.character .sprite:last-child').find('.cls-15').css('fill', color);  
        $('.character .sprite:last-child').find('.cls-14').css('fill', color);  
        $('.character .sprite:last-child').find('.cls-13').css('fill', color); 
        $('.character .sprite:last-child').find('.cls-12').css('fill', color);  
        $('.character .sprite:last-child').find('.cls-11').css('fill', color); 
        $('.character .sprite:last-child').find('.cls-10').css('fill', color); 
        $('.character .sprite:last-child').find('.cls-9').css('fill', color); 
        $('.character .sprite:last-child').find('.cls-8').css('fill', color);  
        $('.character .sprite:last-child').find('.cls-7').css('fill', color);  
        $('.character .sprite:last-child').find('.cls-6').css('fill', color);  
        $('.character .sprite:last-child').find('.cls-5').css('fill', color); 
        $('.character .sprite:last-child').find('.cls-4').css('fill', color);  
        $('.character .sprite:last-child').find('.cls-3').css('fill', color); 
        $('.character .sprite:last-child').find('.cls-2').css('fill', color); 
        $('.character .sprite:last-child').find('.cls-1').css('fill', color);
    }
}

// Handle event for cave room from server
const caveEvent_updateByServer = function(chestHunters){
    const currentPlayer = getPlayerInRoom(socket.id);
    if (currentPlayer.role == 'Captain'){
        for (let i = 0; i < chestHunters.length; i++){
            let chosenColor = getBoxByName(playerBoxes, chestHunters[i].username).find('.color').find('.hatcls-2').css('fill');       
            fillColorForCharacter(true, chosenColor);       
        }
        return;
    }
    if (currentPlayer.role == 'Pirate') {
        for (let i = 0; i < chestHunters.length; i++){
            if (chestHunters[i].id == socket.id){
                let chosenColor = getBoxByName(playerBoxes, chestHunters[i].username).find('.color').find('.hatcls-2').css('fill');
                fillColorForCharacter(true, chosenColor);      
            }
            else {
                fillColorForCharacter(false, '#556269');
            }   
        }
        return;
    }
    if (currentPlayer.role == 'Killer') {
        for (let i = 0; i < chestHunters.length; i++){
            if (chestHunters[i].id == socket.id){
                let chosenColor = getBoxByName(playerBoxes, chestHunters[i].username).find('.color').find('.hatcls-2').css('fill');
                fillColorForCharacter(true, chosenColor);      
            }
        }
        return;
    }
    if (currentPlayer.role == 'Blacksmith') {
        for (let i = 0; i < chestHunters.length; i++){
            if (chestHunters[i].id == socket.id || chestHunters[i].role == 'Captain'){
                let chosenColor = getBoxByName(playerBoxes, chestHunters[i].username).find('.color').find('.hatcls-2').css('fill');
                fillColorForCharacter(true, chosenColor);         
            }
            else {
                let chosenColor = getBoxByName(playerBoxes, chestHunters[i].username).find('.color').find('.hatcls-2').css('fill');
                fillColorForCharacter(false, '#556269');       
            }   
        }
    }
}

// Draw sprite in restroom
const drawSprite_restroomScr = function(boxID, colorID){
    selectedColor = colorOptns.eq(colorID).css('background-color');
    playerBoxes.eq(boxID).find('.color').find('.hatcls-2').css('fill', selectedColor);
    characterSVG.find('.cls-8').css('fill', selectedColor);
}

// Draw circle lists based on votedPlayers
const drawVotedPlayers_voteScr = function(votedPlayers, id){
    voteCircles.html(``);
    votedPlayers.forEach(playerID => {
        let player = getCurrentPlayer(playerID);
        let color = colorOptns.eq(player.colorID).css('background-color');
        let circle = $('<div class="circle"></div>').css('background-color', color);
        voteCircles.eq(id).append(circle);
    });
}

const goldRank = function(roomUsers, id){
    let name = roomUsers[id].username;
    for (let i = 0; i < roomUsers.length; i++){
        if (posters.eq(i).find('.username').text() === name){
            return i;
        }
    }
    return -1;
}

const sortLeaderboard = function() {
    posters.sort(function(a, b) {
        let val1 = parseInt($(a).find('.gold').text().replace('$', ''), 10);
        let val2 = parseInt($(b).find('.gold').text().replace('$', ''), 10);
        return (val2 - val1);
    }).appendTo(leaderboard);
}

// Write script in role screen
const drawVoteScr = function() {
    roleInVote.text("Role: " + roleMes.text());
    voteList.html(player_list.html());
    voteBoxes = $('#show_vote_list .box');
    for (let i = 0; i < voteBoxes.length; i++) {
        // Add leaderboard
        const poster = $('<div>').addClass('poster');
        if (playerBoxes.eq(i).hasClass('current')) poster.addClass('current');
        poster.append(`<p>WANTED</p>`);
        poster.append(voteBoxes.eq(i).html());
        poster.append(`<span class="gold">0$</span>`);
        leaderboard.append(poster);

        // Add vote button and votedPlayers (who vote currentPlayer)
        voteBoxes.eq(i).append(`<span class="vote">Vote</span>`);
        voteBoxes.eq(i).append(`<div class="votedCircles"></div>`);

        // Add event
        voteBoxes.eq(i).on('click', function() {
            const elem = $('#show_vote_list .selected');
            if (elem != null) elem.removeClass('selected');
            voteBoxes.eq(i).addClass('selected');
            voteBtn = voteBoxes.eq(i).find('.vote');
            voteBtn.on('click', function(e) {
                e.stopPropagation();
                voteBoxes.prop('disabled', true);
                voteBoxes.off('click');
                skipBtn.prop('disabled', true);
                $('.vote_screen .player_list').css('opacity', 0.8);
                socket.emit("game:vote", getCurrentPlayer(socket.id).room, i);
            });
        });
    }
    posters = $('.leaderboard #show_leaderboard .poster');
}

// Write script in role screen
const drawRoleScr = function() {
    let i = getBoxIndex();
    roleMes.text(randomRole(i));
    if (randomID[i] === 0) {
        roleDesc.html("<p>Nhiệm vụ của bạn là tìm ra Killer đang trà trộn trong đoàn, sống sót và chiến thắng cùng Pirate.</p><p>Mỗi lượt tìm kho báu, bạn có quyền theo dõi tình hình 1 kho báu bất kỳ trước khi chọn kho báu.</p><p>Bạn biết được thân phận những thủy thủ trong đoàn.</p>");
        roleMes.css('color', 'goldenrod');
        roleDesc.css('color', 'rgb(117, 86, 0)');
    }
    else if (randomID[i] <= gameStats[0]) {
        roleDesc.html("<p>Nhiệm vụ của bạn là cố gắng sống sót và kiếm được nhiều tiền nhất.</p><p>Mỗi lượt săn, bạn có thể giết 1 Pirate nếu chỉ có Pirate đó săn cùng kho báu với bạn. Nếu giết thành công 1 Pirate, bạn lấy được gợi ý thân phận của Captain.</p><p>Bạn không biết được thân phận những thủy thủ trong đoàn.</p>");
        roleMes.css('color', 'firebrick');
        roleDesc.css('color', 'rgb(117, 0, 0)');
    }
    else if (randomID[i] === gameStats[0] + 1){
        roleDesc.html("<p>Nhiệm vụ của bạn là bảo vệ các thành viên trong đoàn.</p><p>Mỗi lượt săn, bạn sẽ ngẫu nhiên nâng cấp trang bị cho 1 thành viên đi săn cùng kho báu với bạn (ưu tiên Captain). Thành viên được nâng cấp trang bị sẽ không bị giết trong lượt tiếp theo. Bạn không thể tự bảo vệ bản thân trừ lượt đầu tiên.</p><p>Bạn chỉ biết được thân phận của Captain</p>");
        roleMes.css('color', 'dodgerblue');
        roleDesc.css('color', 'rgb(0, 57, 114)');
    }
    else {
        roleDesc.html("<p>Nhiệm vụ của bạn là tìm giết Killer đang trà trộn trong đoàn.</p><p>Bạn không nhớ được thân phận những thủy thủ trong đoàn.</p><p>Tham gia săn kho báu cùng đồng minh sẽ giúp bạn tăng điểm thân mật. Đạt đủ điểm thân mật bạn sẽ nhận được thông tin của thủy thủ trong đoàn</p>");
        roleMes.css('color', 'forestgreen');
        roleDesc.css('color', 'rgb(0, 82, 0)');
    }
}

// Draw sprite in role screen
const drawSprite_roleScr = function(roomUsers) {
    let currentPlayer = getPlayerInRoom(socket.id);
    if (currentPlayer.role !== "Killer"){
        roleChr.html($('.textures .spriteDiv').html());
        roleChr.find('.cls-8').css('fill', selectedColor);
        return;
    }
    for (let i = 0; i < roomUsers.length; i++){
        if (roomUsers[i].role === "Killer"){
            let chosenColor = playerBoxes.eq(i).find('.color').find('.hatcls-2').css('fill');
            roleChr.append($('.textures .spriteDiv').html());
            $('.character .sprite:last-child').find('.cls-8').css('fill', chosenColor);
        }
    }
}

// Create chests in treasure map
const createChestLists = function(room) {
    room.chestList.forEach(chest => {
        treasureScr.append(`<div id="${chest.id}" class="chest"></div>`);
        const chestDiv = $('#' + chest.id);
        chestDiv.css('top', String(chest.position[0]) + "em");
        chestDiv.css('left', String(chest.position[1]) + "em");
        switch (chest.value) {
            case 100:
                chestDiv.addClass('c100');
                break;
            case 75:
                chestDiv.addClass('c75');
                break;
            case 50:
                chestDiv.addClass('c50');
                break;
            case 35:
                chestDiv.addClass('c35');
                break;
        }
    });
}

// Update navigate mark in tutorial
const updateNav = function(currentPage){ 
    for (let i = 0; i < NavPageBtn.length; i++){
        storyText.eq(i).css("display", "none");
        NavPageBtn.eq(i).css("background-image", "url('Textures/Navigate/Normal.png')");
        if (i == currentPage) {
            storyText.eq(i).css("display", "block");
            NavPageBtn.eq(i).css("background-image","url('Textures/Navigate/Active.png')");
        }
    }
}