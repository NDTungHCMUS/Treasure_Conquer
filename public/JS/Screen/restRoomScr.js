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
    initialScr.css('display', "flex");
    restroomScr.css('display', "none");
});

startGameBtn.on('click', function() {
    room_size = playerBoxes.length;
    if (room_size < 2 || room_size > 12){
        alert("Game should be started with around 5-12 players!!!");
        return;
    }
    socket.emit("game:start", getCurrentPlayer(socket.id).room, room_size);
    setTimeout(function() {
        socket.emit("game:timing", getCurrentPlayer(socket.id).room);
    }, 3000);
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