const roomBtns = document.querySelectorAll('.initial_screen button');
const leaveRoomBtns = document.querySelector('.restroom_screen #leaveRoomBtn')
const restroomScr = document.querySelector('.restroom_screen');
const initialScr = document.querySelector('.initial_screen');
const backBtns = document.querySelectorAll('.back')
const exitBtns = document.querySelectorAll('.exit')
const noExitBtns = document.querySelectorAll('.no_btn')
const endGameScr = document.querySelector('.end_game')
const exitScr = document.querySelector('.exit_screen')
const blurScr = document.querySelector('.blur_end_game_scr')

backBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        endGameScr.style.display = 'none'
        initialScr.style.display = 'inline-block'
    })
})

exitBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        blurScr.style.display = 'inline-block'
        exitScr.style.display = 'inline-block'
    })
})

noExitBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        exitScr.style.display = 'none'
        blurScr.style.display = 'none'
    })
})

roomBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        initialScr.style.display = "none";
        restroomScr.style.display = "inline-block";
    });
});

leaveRoomBtns.addEventListener("click", () => {
    initialScr.style.display = "inline-block";
    restroomScr.style.display = "none";
})