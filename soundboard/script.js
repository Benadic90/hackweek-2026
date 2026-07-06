const sounds = [
  { name: 'Kick', url: 'https://s3.amazonaws.com/freecodecamp/drums/RP4_KICK_1.mp3' },
  { name: 'Snare', url: 'https://s3.amazonaws.com/freecodecamp/drums/Brk_Snr.mp3' },
  { name: 'HiHat', url: 'https://s3.amazonaws.com/freecodecamp/drums/Cev_H2.mp3' },
  { name: 'OpenHat', url: 'https://s3.amazonaws.com/freecodecamp/drums/Dsc_Oh.mp3' },
  { name: 'Clap', url: 'https://s3.amazonaws.com/freecodecamp/drums/Heater-6.mp3' },
  { name: 'Shaker', url: 'https://s3.amazonaws.com/freecodecamp/drums/Give_us_a_light.mp3' },
  { name: 'Heater 1', url: 'https://s3.amazonaws.com/freecodecamp/drums/Heater-1.mp3' },
  { name: 'Heater 2', url: 'https://s3.amazonaws.com/freecodecamp/drums/Heater-2.mp3' },
  { name: 'Heater 3', url: 'https://s3.amazonaws.com/freecodecamp/drums/Heater-3.mp3' },
  { name: 'Chord 1', url: 'https://s3.amazonaws.com/freecodecamp/drums/Chord_1.mp3' },
  { name: 'Chord 2', url: 'https://s3.amazonaws.com/freecodecamp/drums/Chord_2.mp3' },
  { name: 'Chord 3', url: 'https://s3.amazonaws.com/freecodecamp/drums/Chord_3.mp3' }
];

const padGrid = document.getElementById('pad-grid');
const volumeSlider = document.getElementById('volume');
const stopBtn = document.getElementById('stop-btn');
const audioElements = [];

function init() {
  sounds.forEach((sound, index) => {
    // Create Audio Element
    const audio = new Audio(sound.url);
    audio.volume = volumeSlider.value;
    audioElements.push(audio);

    // Create Button Pad
    const pad = document.createElement('button');
    pad.className = 'pad';
    pad.textContent = sound.name;
    
    // Play Sound Event
    pad.addEventListener('click', () => {
      // Reset time to allow rapid clicking
      audio.currentTime = 0; 
      audio.play();
      
      // Add glowing effect
      pad.classList.add('playing');
    });

    // Remove glowing effect when sound ends
    audio.addEventListener('ended', () => {
      pad.classList.remove('playing');
    });
    
    // Fallback: remove glowing effect after a short delay so visual doesn't get stuck
    pad.addEventListener('mouseup', () => {
      setTimeout(() => {
        if (audio.paused) pad.classList.remove('playing');
      }, 150);
    });
    pad.addEventListener('mouseleave', () => {
      setTimeout(() => {
        if (audio.paused) pad.classList.remove('playing');
      }, 150);
    });

    padGrid.appendChild(pad);
  });
}

// Volume Control
volumeSlider.addEventListener('input', (e) => {
  const newVolume = e.target.value;
  audioElements.forEach(audio => {
    audio.volume = newVolume;
  });
});

// Stop All Sounds
stopBtn.addEventListener('click', () => {
  audioElements.forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });
  
  // Remove playing class from all pads
  document.querySelectorAll('.pad').forEach(pad => {
    pad.classList.remove('playing');
  });
});

// Start app
init();
