// Connect server

var socket = io("http://localhost:5500");
socket.emit("state:allUsers");

// Import other js files

$.getScript('JS/audio.js', function() {
    console.log("audio ne");
});

$.getScript("JS/utils.js", function(){

    // User events

    $(window).on('mouseup', function(e) {
        const container = $('.activate_screen, #storyScreen, #settingScreen');
        if (ssiBar.hasClass('on_screen')){ 
            ssiBar.removeClass('on_screen');
        }
        if (!container.is(e.target) && container.has(e.target).length === 0){
            container.fadeOut();
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
})