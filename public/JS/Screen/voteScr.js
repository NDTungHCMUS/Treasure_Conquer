/*
* VOTE SCREEN
*/

skipBtn.on('click', function(){
    voteBoxes = $('#show_vote_list .box');
    const elem = $('#show_vote_list .selected');
    if (elem != null) elem.removeClass('selected');
    voteBoxes.prop('disabled', true);
    skipBtn.prop('disabled', true);
    $('.vote_screen .player_list').css('opacity', 0.8);
});