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
    if (klchatScr.css('display') == 'none'){
        klchatScr.slideToggle("slow");
        klchatScr.css('display', 'flex');
    }
    else {
        klchatScr.slideToggle("slow");
    }
});

offscoutBtn.on('click', function() {
    treasureScr.fadeIn();
    caveScr.fadeOut();
    offscoutBtn.css('display', 'none');
    socket.emit("game:outChest", getPlayerInRoom(socket.id));
});

equipBtn.on('click', function() {
    if (equipDiv.css('display') == 'none'){
        equipDiv.slideToggle("slow");
        equipDiv.css('display', 'flex');
        if (itemList.find('.eqm5').length > 0){
            usePsd.prop('disabled', false);
        }
        if (itemList.find('.eqm6').length > 0){
            useScc.prop('disabled', false);
        }
    }
    else {
        equipDiv.slideToggle("slow");
    }
});

usePsd.on('click', function(e) {
    e.stopPropagation();
    equipDiv.slideToggle("slow");
    itemList.find('.eqm5').last().remove();
    serverAlert('Successfully used poison dagger');
    equipBtn.css('pointer-events', 'none');
});

useScc.on('click', function() {
    e.stopPropagation();
    equipDiv.slideToggle("slow");
    itemList.find('.eqm6').last().remove();
    serverAlert('Successfully used scarecrow');
    equipBtn.css('pointer-events', 'none');
});

// Chat in gameScr
$(".klchat .text_chat").keypress((e) => {
    var t = $(".klchat .text_chat").val()
    if(e.which == 13 && t != "") {
        let currentPlayer = getCurrentPlayer(socket.id);
        let color = colorOptns.eq(currentPlayer.colorID).css('background-color');
        socket.emit("game:sendMessages", getCurrentPlayer(socket.id).room, color, t);
    }
});