// Socket events

socket.on("state:allUsers", function(activeUsers, leaveUsers, playRooms){
    players = activeUsers;
    leavePlayers = leaveUsers;
    playingRooms = playRooms;
});

socket.on("state:alert", function(mes){
    serverAlert(mes);
});

socket.on("room:roomUsers", function(users){
    roomUsers = users;
});

socket.on("room:listing", function(roomUsers) {
    if (roomUsers[0].id === socket.id){
        ranges.show();
        for (let i = 0; i < ranges.length; i++) {
            ranges.eq(i).val(gameStats[i]);
        }
        startGameBtn.show();
    }
    player_list.html(``);
    roomUsers.forEach(player => {
        const playerDiv = $('<div>').addClass('box');
        playerDiv.append($('.textures .colorDiv').html());
        playerDiv.append(`<p class="username">${player.username}</p>`);
        player_list.append(playerDiv);
        if (player.id === socket.id) {
            $(".player_list #show_player_list .box:last-child").addClass('current');
        }
    });
    playerBoxes = $(".player_list #show_player_list .box");
});

socket.on("room:customize", function(stats) {
    gameStats = stats;
    for (let i = 0; i < sliders.length; i++) {
        sliders.eq(i).find('span').text(gameStats[i]);
    }
});

socket.on("room:coloring", function(roomUsers) {
    const elem = $('.color_options .chosen');
    if (elem != null) elem.removeClass('chosen');
    for (let i = 0; i < roomUsers.length; i++){
        let circle_i = colorOptns.eq(roomUsers[i].colorID);
        if (roomUsers[i].id !== socket.id && roomUsers[i].colorID > -1){
            let chosenColor = circle_i.css('background-color');
            circle_i.addClass('chosen');
            playerBoxes.eq(i).find('.color').find('.hatcls-2').css('fill', chosenColor);
            characterSVG.find('.cls-8').css('fill', selectedColor);
        }
        else {
            drawSprite_restroomScr(getBoxIndex(), roomUsers[i].colorID);
        }
    };
});

socket.on("game:start", function(temp, room) {
    randomID = temp;
    day = 0;
    createChestLists(room);
    chests = $('.game_screen .treasure .chest');
    restroomScr.css('display', "none");
    transition(1500, 'Land to new island...');
    roleScr.fadeIn(3500);
    roleScr.css('display', "flex");
    drawSprite_roleScr(roomUsers);
    drawRoleScr();
    drawVoteScr();
    roleName.text("Role: " + roleMes.text());
    setTimeout(function() {
        roleScr.fadeOut('fast');
    }, 9000);
});

// Game Loop

socket.on("game:chooseChestDuration", function(chestTimer){
    gameTime.text("Time: " + chestTimer.toString() + ' s');
    if (chestTimer === gameStats[2] / 3) {
        // Set variables for new turn
        day++;
        gameDay.text('DAY ' + day.toString());
        voteScr.css('display', 'none');
        transition(1500, 'Hunting!!!');
        gameScr.fadeIn(3000);
        gameScr.css('display', 'grid');
        if (!inDeadState){
            chestEvent_updateByServer(chests);
        }
    }
    if (chestTimer === 0) {
        // Set variables for vote phase
        const elem = $('#show_vote_list .selected');
        if (elem != null) {
            elem.removeClass('selected');
        }
        voteBoxes.css('pointer-events', 'fill');
        voteList.find('.current').css('pointer-events', 'none');
        skipBtn.prop('disabled', false);
        voteCircles = $('.vote_screen .votedCircles');
        voteCircles.html(``);
        voteCircles.css('display', 'none');
    }
})

socket.on("game:captainDuration", function(captainTimer){
    gameTime.text("Time: " + captainTimer.toString() + ' s');
    if (captainTimer === 5){
        if (getPlayerInRoom(socket.id).role !== 'Captain'){
            chests.off();
        }
    }
});

socket.on("game:waitDuration", function(waitTimer){
    gameTime.text("Time: " + waitTimer.toString() + ' s');
    if (waitTimer === 5){
        chests.off();
        killBtn.css('display', 'none');
        offkillBtn.css('display', 'none');
        chatBtn.css('display', 'none');
        offscoutBtn.css('display', 'none');
        klchatScr.css('display', 'none');
    }
});

socket.on("game:voteDuration", function(voteTimer) {
    voteTime.text("Time: " + voteTimer.toString() + " s");
    if (voteTimer === gameStats[3] / 10) {
        voteDay.text('DAY ' + day.toString());
        gameScr.css('display', 'none');
        transition(1500, 'Gathering!!!');
        voteScr.fadeIn(3000);
        voteScr.css('display', "grid");
    }
    if (voteTimer === 0){
        // Set game screen for new turn
        $('.vote_screen .player_list').css('opacity', 1);
        voteCircles.css('display', 'flex');
        gameScr.fadeOut();
        treasureScr.fadeIn('slow');
        voteBoxes.css('pointer-events', 'none');
        skipBtn.prop('disabled', true);
        scouted = false;
        drawActivateDiv(getPlayerInRoom(socket.id).role);
    }
})

// Handle into the cave

socket.on("game:huntChest", function(chestHunters, id){
    if (getPlayerInRoom(socket.id).chestID !== id) return;
    caveChr.html(``);
    caveEvent_updateByServer(chestHunters);
});

socket.on("game:deadMessage", function(name){
    serverAlert(name + " died");
    voteBoxes = $('#show_vote_list .box');
    posters = $('.leaderboard #show_leaderboard .poster');
    getBoxByName(voteBoxes, name).addClass('dead');
    getBoxByName(posters, name).addClass('dead');
});

socket.on("game:hint", function(captain, chests){
    if (captain.chestID === -1){
        serverAlert("Hint: Captain didn't chose chest in last turn");
        return;
    }
    let rand = Math.floor(Math.random() * 4);
    while (chests[captain.chestID].value === chestValue[rand]) {
        rand = Math.floor(Math.random() * 4);
    }
    serverAlert("Hint: Captain didn't chose chest " +  chestValue[rand] + "$ in last turn");
});

socket.on("game:disabled", function(){
    voteBoxes = $('#show_vote_list .box');
    voteBoxes.off();
    skipBtn.off();
    inDeadState = true;
});

socket.on("game:familiarity", function(familiarity){
    if (familiarity === 0) return;
    let frontBarWidth = Math.min(Math.floor(200 * familiarity / maxFame), 200);
    familiarityPer.css('width', frontBarWidth + 'px');
})

socket.on("game:getGold", function(gold, index){
    posters.eq(goldRank(roomUsers, index)).find('.gold').text(gold.toString() + '$');
    if (index === roomUsers.length - 1){
        sortLeaderboard();
    }
});

socket.on("game:vote", function(votedPlayers, id){
    voteCircles = $('.vote_screen .votedCircles');
    drawVotedPlayers_voteScr(votedPlayers, id);
});

// Handle end game

socket.on("game:killersWin", function() {
    if (getPlayerInRoom(socket.id).role !== 'Killer') {
        isVictory = false;
    }
    else {
        isVictory = true;
    }
});

socket.on("game:piratesWin", function() {
    if (getPlayerInRoom(socket.id).role === 'Killer') {
        isVictory = false;
    }
    else {
        isVictory = true;
    }
});

socket.on("game:end", function() {
    gameScr.css('display', 'none');
    voteScr.css('display', 'none');
    if (!isVictory) {
        ship.css('background-image', 'url("/Textures/Font-SVG/burnedship.svg")');
        transition(3500, "Defeat", false);
    }
    else {
        transition(3500, "Victory", false);
    }
    setTimeout(() => {
        ship.css('background-image', 'url("/Textures/Font-SVG/ship.svg")');
        restroomScr.fadeIn(1000);
        restroomScr.css('display', 'grid');
    }, 3000);
    
});

socket.on("game:recvMessages", function(data) {
    $(".text_chat").val("");
    let lastLine;
    if (voteScr.css('display') == 'none'){
        klchatDiv.append(`<div class="chat_line"><span class="username">${data.us}:</span> <span class="text_content">${data.t}</span></div>`);
        lastLine = $(".klchat .chat_line:last-child");
    }
    else {
        votechatDiv.append(`<div class="chat_line"><span class="username">${data.us}:</span> <span class="text_content">${data.t}</span></div>`);
        lastLine = $(".chat .chat_line:last-child");
    }
    if(data.t.indexOf(" ") == -1) {
        lastLine.find('.text_content').css('word-break','break-all');
    } 
    else {
        lastLine.find('.text_content').css('word-break','break-word');
    }
    lastLine.find('.username').css('font-weight', 'bold');
    if (data.us == getCurrentPlayer(socket.id).username){
        lastLine.css('background-image', 'linear-gradient(to right, rgba(247, 207, 225, 0.6), rgba(186, 237, 245, 0.6))');
        lastLine.css('border-radius', '15vh 15vh 0 15vh');
        lastLine.find('.text_content').css('color', 'brown');
        lastLine.find('.username').css('color', 'brown');
    }
})