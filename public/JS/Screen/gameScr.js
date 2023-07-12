/*
* GAME SCREEN
*/

killBtn.on('click', function() {
    socket.emit("game:killState", true);
    killBtn.css('display', 'none');
    offkillBtn.show();
});

offkillBtn.on('click', function() {
    socket.emit("game:killState", false);
    offkillBtn.css('display', 'none');
    killBtn.show();
});

chatBtn.on('click', function() {
    activateScr.css('display', 'flex');
});

offscoutBtn.on('click', function() {
    treasureScr.fadeIn();
    caveScr.fadeOut();
    offscoutBtn.css('display', 'none');
    socket.emit("game:outChest", getPlayerInRoom(socket.id));
});