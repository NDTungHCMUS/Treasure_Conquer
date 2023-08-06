// Connect server

var socket = io("http://localhost:5500");
socket.emit("state:allUsers");

/* 
Import other js files
*/

// Audio

$.getScript('JS/audio.js', function() {
});

// Variables and functions

$.getScript("JS/utils.js", function(){
})

// User events

$(window).on('load', function(){
    const loader = $('.loading_wrapper');
    $('body').css('cursor', 'progress');
    loader.fadeOut(1500);
    setTimeout(function(){
        $('body').css('cursor', 'default');
    }, 1500);
});

$(window).on('mouseup', function(e) {
    const container = $('#storyScreen, #settingScreen, #infoScreen');
    if (ssiBar.hasClass('on_screen')){ 
        ssiBar.removeClass('on_screen');
    }
    if (!container.is(e.target) && container.has(e.target).length === 0){
        container.fadeOut('slow');
    }
});

// Initial Screen

$.getScript("JS/Screen/initialScr.js", function(){
});

// Restroom Screen

$.getScript("JS/Screen/restRoomScr.js", function(){
});

// Game Screen
    
$.getScript("JS/Screen/gameScr.js", function(){
});    

// Vote Screen
    
$.getScript("JS/Screen/voteScr.js", function(){
});    

// Socket Event
        
$.getScript("JS/event.js", function(){
});      

