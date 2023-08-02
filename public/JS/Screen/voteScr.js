/*
* VOTE SCREEN
*/

skipBtn.on('click', function(){
    voteBoxes = $('#show_vote_list .box');
    const elem = $('#show_vote_list .selected');
    if (elem != null) elem.removeClass('selected');
    voteBoxes.css('pointer-events', 'none');
    skipBtn.prop('disabled', true);
    $('.vote_screen .player_list').css('opacity', 0.8);
});

inventoryBtn.on('click', function() {
    if (inventDiv.css('display') == 'none'){
        inventDiv.slideToggle("slow");
        inventDiv.css('display', 'flex');
    }
    else {
        inventDiv.slideToggle("slow");
    }
});

$(".vote_screen .text_chat").keypress((e) => {
    var t = $(".vote_screen .text_chat").val()
    if(e.which == 13 && t != "") {
        let currentPlayer = getCurrentPlayer(socket.id);
        let color = colorOptns.eq(currentPlayer.colorID).css('background-color');
        socket.emit("game:sendMessages", getCurrentPlayer(socket.id).room, color, t);
    }
});