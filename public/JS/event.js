// Socket events

socket.on("state:allUsers", function(activeUsers, leaveUsers, playRooms){
    players = activeUsers;
    leavePlayers = leaveUsers;
    playingRooms = playRooms;
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
        playerDiv.append(`<p>${player.username}</p>`);
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

socket.on("game:start", function(temp, roomUsers, room) {
    randomID = temp;
    createChestLists(room);
    drawRoleScr();
    drawSprite_roleScr(roomUsers);
    roleName.text("Role: " + roleMes.text());
    restroomScr.css('display', "none");
    roleScr.css('display', "flex");
    setTimeout(function() {
        roleScr.fadeOut();
        gameScr.css('display', "grid");
    }, 3000);
});

// Game Loop
socket.on("game:chooseChestDuration", function(chestTimer){
    gameTime.text("Time: " + chestTimer.toString() + ' s');
    voteScr.css('display', 'none');
    gameScr.css('display', 'grid');
    chests = $('.game_screen .treasure .chest');
    chestEvent_updateByServer(chests);
})

socket.on("game:captainDuration", function(captainTimer){
    gameTime.text("Time: " + captainTimer.toString() + ' s');
    voteScr.css('display', 'none');
    gameScr.css('display', 'grid');
});

socket.on("game:waitDuration", function(waitTimer){
    gameTime.text("Time: " + waitTimer.toString() + ' s');
    voteScr.css('display', 'none');
    gameScr.css('display', 'grid'); 
    chests.off();
});

socket.on("game:voteDuration", function(voteTimer) {
    voteTime.text("Time: " + voteTimer.toString() + " s");
    drawVoteScr();
    gameScr.fadeOut();
    voteScr.css('display', "grid");   
})

// Handle into the cave

socket.on("game:huntChest", function(chestHunters, id){
    if (getCurrentPlayer(socket.id).chestID !== id) return;
    caveChr.html(``);
    caveEvent_updateByServer(chestHunters);
});

socket.on("game:killed", function(){
    alert("You died");
});

socket.on("game:kill", function(){
    alert("You kill a pirate");
});

socket.on("game:getGold", function(gold, index){
    posters.eq(index).find('.gold').text(gold.toString() + '$');
});