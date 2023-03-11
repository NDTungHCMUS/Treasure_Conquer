// Socket events

socket.on("state:allUsers", function(activeUsers, leaveUsers, playRooms){
    players = activeUsers;
    leavePlayers = leaveUsers;
    playingRooms = playRooms;
});

socket.on("room:roomUsers", function(users){
    roomUsers = users;
});

socket.on("room:listing", function(roomUsers) {
    let currentPlayer = getCurrentPlayer(socket.id);
    if (roomUsers[0].username == currentPlayer.username){
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
    createChestLists(room);
    chests = $('.game_screen .treasure .chest');
    drawSprite_roleScr(roomUsers);
    drawRoleScr();
    drawVoteScr();
    roleName.text("Role: " + roleMes.text());
    restroomScr.css('display', "none");
    roleScr.css('display', "flex");
    setTimeout(function() {
        roleScr.fadeOut();
        gameScr.css('display', "grid");
    }, 5000);
});

// Game Loop

socket.on("game:chooseChestDuration", function(chestTimer){
    gameTime.text("Time: " + chestTimer.toString() + ' s');
    if (chestTimer === gameStats[2] / 3) {
        // Set variables for new turn
        voteScr.css('display', 'none');
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
        voteBoxes.prop('disabled', false);
        voteBoxes.on('click');
        skipBtn.prop('disabled', false);
        voteCircles = $('.vote_screen .votedCircles');
        voteCircles.empty();
        voteCircles.css('display', 'none');
    }
})

socket.on("game:captainDuration", function(captainTimer){
    gameTime.text("Time: " + captainTimer.toString() + ' s');
    if (getPlayerInRoom(socket.id).role !== 'Captain'){
        chests.off();
    }
});

socket.on("game:waitDuration", function(waitTimer){
    gameTime.text("Time: " + waitTimer.toString() + ' s');
    chests.off();
});

socket.on("game:voteDuration", function(voteTimer) {
    voteTime.text("Time: " + voteTimer.toString() + " s");
    if (voteTimer === gameStats[3] / 10) {
        caveScr.css('display', 'none');
        voteScr.css('display', "grid");   
    }
    if (voteTimer === 0){
        // Set game screen for new turn
        voteCircles.css('display', 'flex');
        $('.vote_screen .player_list').css('opacity', 1);
        gameScr.fadeOut();
        treasureScr.fadeIn();
        voteBoxes.prop('disabled', true);
        skipBtn.prop('disabled', true);
    }
})

// Handle into the cave

socket.on("game:huntChest", function(chestHunters, chestID){
    if (getPlayerInRoom(socket.id).chestID !== chestID) return;
    caveChr.html(``);
    caveEvent_updateByServer(chestHunters);
});

socket.on("game:deadMessage", function(name){
    //alert(name + " died");
    voteBoxes = $('#show_vote_list .box');
    posters = $('.leaderboard #show_leaderboard .poster');
    getBoxByName(voteBoxes, name).addClass('dead');
    getBoxByName(posters, name).addClass('dead');
});

socket.on("game:hint", function(captain, chests){
    if (captain.chestID === -1){
        alert("Captain didn't chose chest in last turn");
        return;
    }
    if (chests[captain.chestID].value % 2 === 1) {
        alert("Captain chose chest 75$ or 35$ in last turn");
        return;
    }
    alert("Captain chose chest 50$ or 100$ in last turn");
});

socket.on("game:disabled", function(){
    voteBoxes = $('#show_vote_list .box');
    voteBoxes.off();
    skipBtn.off();
    inDeadState = true;
});

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
        alert("Defeat");
    }
    else {
        alert("Victory");
    }
});

socket.on("game:piratesWin", function() {
    if (getPlayerInRoom(socket.id).role === 'Killer') {
        alert("Defeat");
    }
    else {
        alert("Victory");
    }
});

socket.on("game:end", function() {
    gameScr.css('display', 'none');
    voteScr.css('display', 'none');
    restroomScr.css('display', 'grid');
});