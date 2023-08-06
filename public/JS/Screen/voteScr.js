/*
* VOTE SCREEN
*/

const disabledBtn = function(){
    if (itemList.find('.eqm1').length === 0 || itemList.find('.eqm2').length === 0){
        mergePsd.prop('disabled', true);
    }
    if (itemList.find('.eqm3').length === 0 || itemList.find('.eqm4').length === 0){
        mergeScc.prop('disabled', true);
    }
    if (itemList.find('.piece').length < 3){
        mergeRnd.prop('disabled', true);
    }
};

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
        if (itemList.find('.eqm1').length > 0 && itemList.find('.eqm2').length > 0){
            mergePsd.prop('disabled', false);
        }
        if (itemList.find('.eqm3').length > 0 && itemList.find('.eqm4').length > 0){
            mergeScc.prop('disabled', false);
        }
        if (itemList.find('.piece').length > 2){
            mergeRnd.prop('disabled', false);
        }
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

mergePsd.on('click', function(){
    itemList.find('.eqm1').last().remove();
    itemList.find('.eqm2').last().remove();
    const newItem = eqmDiv.find('.eqm5').clone().show();
    itemList.prepend(newItem);
    disabledBtn();
});

mergeScc.on('click', function(){
    itemList.find('.eqm3').last().remove();
    itemList.find('.eqm4').last().remove();
    const newItem = eqmDiv.find('.eqm6').clone().show();
    itemList.prepend(newItem);
    disabledBtn();
});

mergeRnd.on('click', function(){
    itemList.find('.piece').last().remove();
    itemList.find('.piece').last().remove();
    itemList.find('.piece').last().remove();
    const rand = Math.floor(Math.random() * 2) + 5;
    const newItem = eqmDiv.find('.eqm' + rand.toString()).clone().show();
    itemList.prepend(newItem);
    disabledBtn();
});