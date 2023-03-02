/*
* INITIAL SCREEN
*/

settingBtn.on('click', function() {
    settingScr.css('display', 'block');
    ssiBar.addClass('on_screen');
    for (let j = 0; j < settingList.length; j++){
        settingList.eq(j).removeClass('chosen');
        settingContent.eq(j).css('display', 'none');
        
    }
    settingList.eq(0).addClass('chosen');
    settingContent.eq(0).css('display', 'block');
});

storyBtn.on('click', function() {
    currentPage = 0;
    updateNav(currentPage);
    storyScr.css('display', 'block');
    ssiBar.addClass('on_screen');
});

newRoomBtn.on("click", function() {
    const activeUsernames = getActiveNames(players);
    const leaveUsernames = getLeaveNames();
    const rooms = getActiveRooms(players);
    const roomID = randomRoomID().toString();
    while (rooms.has(roomID)){
        roomID = randomRoomID().toString();
    }
    if (!inLeaveState){
        // Check valid
        if (!checkValidName(activeUsernames, leaveUsernames)) return;
    
        // Handle room
        const username = usernameInput.val();
        socket.emit("room:join", true, username, roomID);
        roomIDMessage.text("ID: " + roomID);

        // Modify swap room
        usernameInputDiv.html(``);
        usernameInputDiv.append(`<p>Welcome ${usernameInput.val()}</p>`);
        $('.initial_screen h4').remove();
    }
    else {
        let currentPlayer = getLeavePlayer(socket.id);
        socket.emit("room:join", true, currentPlayer.username, roomID);
        roomIDMessage.text("ID: " + roomID);

    }

    // Handle color
    setTimeout(() => {
        const index = getDefaultColor();
        colorOptns.eq(index).addClass('selected');
        drawSprite_restroomScr(getBoxIndex(), index);
        socket.emit("room:chooseColor", roomID, index);
    }, 50);

    // Handle swap room
    usernameInput.val('');
    roomIDInput.val('');
    restroomScr.css('display', "grid");
    initialScr.css('display', "none");
});

joinRoomBtn.on('click', function() {
    const rooms = getActiveRooms(players);
    const roomID = roomIDInput.val();
    if (!checkValidRoom(rooms, roomID)) return;
    if (!inLeaveState){
        // Check valid
        const activeUsernames = getActiveNames(players);
        const leaveUsernames = getLeaveNames();
        if (!checkValidName(activeUsernames, leaveUsernames)) return;

        // Handle room
        const username = usernameInput.val();
        socket.emit("room:join", false, username, roomID);
        roomIDMessage.text("ID: " + roomID);

        // Modify swap room
        usernameInputDiv.html(``);
        usernameInputDiv.append(`<p>Welcome, ${usernameInput.val()}</p>`);
        $('.initial_screen h4').remove();
    }
    else {
        // Handle room
        let currentPlayer = getLeavePlayer(socket.id);
        socket.emit("room:join", false, currentPlayer.username, roomID);
        roomIDMessage.text("ID: " + roomID);
    }

    // Handle color
    setTimeout(() => {
        const index = getDefaultColor();
        colorOptns.eq(index).addClass('selected');
        drawSprite_restroomScr(getBoxIndex(), index);
        socket.emit("room:chooseColor", roomID, index);
    }, 50);

    // Handle swap room
    ranges.hide();
    startGameBtn.hide();
    usernameInput.val('');
    roomIDInput.val('');
    restroomScr.css('display', "grid");
    initialScr.css('display', "none");
});

for (let i = 0; i < settingList.length; i++){
    settingList.eq(i).on('click', function () {
        for (let j = 0; j < settingList.length; j++){
            settingList.eq(j).removeClass('chosen');
            settingContent.eq(j).css('display', 'none');
            
        }
        settingList.eq(i).addClass('chosen');
        settingContent.eq(i).css('display', 'block');
    })
}

// Navigate story

NavUpBtn.on('click', function() {
    currentPage = (currentPage + 3) % 4;
    updateNav(currentPage);
});

NavDownBtn.on('click', function() {
    currentPage = (currentPage + 1) % 4;
    updateNav(currentPage);
});

for (let i = 0; i < NavPageBtn.length; i++){
    NavPageBtn.eq(i).on('click', function() {
        currentPage = i;
        updateNav(currentPage);
})}