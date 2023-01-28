const initialScr = document.querySelector('.initial_screen');
const roomBtns = document.querySelectorAll('.initial_screen button');

const restroomScr = document.querySelector('.restroom_screen');
const leaveRoomBtn = document.querySelector('.restroom_screen #leaveRoomBtn');
const startGameBtn = document.querySelector('.restroom_screen #startGameBtn');
const colorOptns = document.querySelectorAll('.restroom_screen .color_options .option');

const gameScr = document.querySelector('.game_screen');
const roleMessage = document.querySelector('#role');
const activateBtn = document.querySelector('.game_screen #activateBtn');
const voteBtn = document.querySelector('.game_screen #voteBtn');

const activateScr = document.querySelector('.activate_screen');
const voteScr = document.querySelector('.vote_screen');

const temp = Math.floor(Math.random() * 6);
const role = ["Adventurer", "Killer", "Hunter"];


const randomRole = () => {
    if (temp === 0) {
        return role[0];
    }
    else {
        if (temp < 3) {
            return role[1];
        }
        else return role[2];
    }
}

// Event listener

window.addEventListener('mouseup', (event) => {
	if (!voteScr.contains(event.target) && voteScr.style.display != "none"){
        voteScr.style.display = "none";
    }
});

window.addEventListener('mouseup', (event) => {
	if (!activateScr.contains(event.target) && activateScr.style.display != "none"){
        activateScr.style.display = "none";
    }
});

roomBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        restroomScr.style.display = "grid";
        initialScr.style.display = "none";
    });
});

leaveRoomBtn.addEventListener("click", () => {
    initialScr.style.display = "flex";
    restroomScr.style.display = "none";
});

startGameBtn.addEventListener("click", () => {
    gameScr.style.display = "grid";
    restroomScr.style.display = "none";
    roleMessage.textContent = "Role: " + randomRole();
    if (temp > 2){
        activateBtn.style.display = "none";
    }
});

colorOptns.forEach(optn => {
    optn.addEventListener("click", () => {
        document.querySelector(".color_options .selected").classList.remove("selected");
        optn.classList.add("selected");
    });
});

activateBtn.addEventListener("click", () => {
    activateScr.style.display = "flex";
});

voteBtn.addEventListener("click", () => {
    voteScr.style.display = "flex";
});
