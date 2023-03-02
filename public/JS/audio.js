const musicVol = $('#settingMusic #musicVol input');
const soundVol = $('#settingMusic #soundVol input');
const musicVolSpan = $('#settingMusic #musicVol span');
const soundVolSpan = $('#settingMusic #soundVol span');
const musicVolBtn = $('#settingMusic #musicVol div');
const soundVolBtn = $('#settingMusic #soundVol div');
const backgroundMusic = $('.background_music')[0];
const interactionSound1 = $('.interaction_sound').eq(0)[0];
const interactionSound2 = $('.interaction_sound').eq(1)[0];
let musicMute = false;
let soundMute = false;

// Update volume in setting
const updateVolBtn = function(vol, volBtn) {
    switch (true) {
        case (vol.val() == 0):
            volBtn.css('background-image', "url('Textures/sound_vol_level0.png')"); 
            break;
        case (vol.val() <= 33):
            volBtn.css('background-image', "url('Textures/sound_vol_level1.png')"); 
            break;
        case (vol.val() <= 66):
            volBtn.css('background-image', "url('Textures/sound_vol_level2.png')"); 
            break;
        case (vol.val() <= 100):
            volBtn.css('background-image', "url('Textures/sound_vol_level3.png')"); 
            break;
    }
}

function cloneAndPlay(audioNode) {
    // the true parameter will tell the function to make a deep clone (cloning attributes as well)
    var clone = audioNode.cloneNode(true);
    clone.volume = interactionSound2.volume
    clone.play();
}

function setMusicVol(vol){
    for (let i = 0; i < $('.background_music').length; i++) {
        $('.background_music').eq(i)[0].volume = vol;
    }
}

function setSoundVol(vol) {
    for (let i = 0; i < $('.interaction_sound').length; i++) {
        $('.interaction_sound').eq(i)[0].volume = vol;
    }
}

$(window).on('mouseup', function(){
    backgroundMusic.play();
})

setMusicVol(musicVol.val()/100);
setSoundVol(soundVol.val()/100);
musicVolSpan.text(musicVol.val());
soundVolSpan.text(soundVol.val());
updateVolBtn(musicVol, musicVolBtn);
updateVolBtn(soundVol, soundVolBtn);

musicVolBtn.on('click', function() {
    if (musicMute) {
        updateVolBtn(musicVol, musicVolBtn);
        setMusicVol(musicVol.val()/100);
    }
    else {
        musicVolBtn.css('background-image', "url('Textures/sound_vol_mute.png')");
        setMusicVol(0);
    }
    musicMute = !musicMute;
});

soundVolBtn.on('click', function() {
    if (soundMute) {
        updateVolBtn(soundVol, soundVolBtn);
        setSoundVol(soundVol.val()/100);
    }
    else {
        soundVolBtn.css('background-image', "url('Textures/sound_vol_mute.png')");
        setSoundVol(0);
    }
    soundMute = !soundMute;
});

musicVol.on('input', function() {
    musicVolSpan.text(musicVol.val());
    setMusicVol(musicVol.val()/100);
    updateVolBtn(musicVol, musicVolBtn);
})
soundVol.on('input', function() {
    soundVolSpan.text(soundVol.val());
    setSoundVol(soundVol.val()/100);
    updateVolBtn(soundVol, soundVolBtn);
})

start = 0;
step = 2;
$('.slide_sound').on('input', function(){
    if (start%step == 0){
        cloneAndPlay(interactionSound1);
    }
    start++
})
    
$('.click_sound').on('click', function () {
    cloneAndPlay(interactionSound2);
})