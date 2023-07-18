/*
* RESTROOM SCREEN
*/

leaveRoomBtn.on('click', function() {
    inLeaveState = true;
    let currentPlayer = getCurrentPlayer(socket.id);
    colorOptns.eq(currentPlayer.colorID).removeClass('selected');
    let leaveIndex = players.indexOf(currentPlayer);
    if (leaveIndex > -1){
        players.splice(leaveIndex, 1);
    }
    socket.emit("room:leave", leaveIndex);   
    restroomScr.css('display', "none");
    transition(1500, 'Leave current room');
    initialScr.fadeIn(3500);
    initialScr.css('display', "flex");
});

startGameBtn.on('click', function() {
    room_size = playerBoxes.length;
    if (room_size < 4 || room_size > 12){
        serverAlert("Game should be started with around 4-12 players!!!");
        return;
    }
    if (room_size / gameStats[0] <= 2){
        serverAlert("Game should be started with killer numbers lower than pirate numbers!!!");
        return;
    }
    socket.emit("game:start", getCurrentPlayer(socket.id).room, room_size);
    setTimeout(function() {
        socket.emit("game:timing", getCurrentPlayer(socket.id).room);
    }, 9000);
});

for (let i = 0; i < sliders.length; i++) {
    let range = sliders.eq(i).find('input');
    let val = sliders.eq(i).find('span');
    val.text(range.val());
    range.on('input', function() {
        gameStats[i] = parseInt(range.val());
        socket.emit("room:customize", getCurrentPlayer(socket.id).room, gameStats);
    });
}

for (let i = 0; i < colorOptns.length; i++){
    colorOptns.eq(i).on('click', function() {
        const elem = $('.color_options .selected');
        if (elem != null) elem.removeClass('selected');
        colorOptns.eq(i).addClass('selected');
        drawSprite_restroomScr(getBoxIndex(), i);
        socket.emit("room:chooseColor", getCurrentPlayer(socket.id).room, i);
    });
}