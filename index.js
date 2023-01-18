const roomBtns = document.querySelectorAll('.initial_screen button');
const leaveRoomBtns = document.querySelector('.restroom_screen #leaveRoomBtn')
const restroomScr = document.querySelector('.restroom_screen');
const initialScr = document.querySelector('.initial_screen');

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