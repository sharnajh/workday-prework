//Global Constants
const clueHoldTime = 1000; //how long to hold each clue's light/sound
const cluePauseTime = 333; //how long to pause in between clues
const nextClueWaitTime = 1000; //how long to wait before starting playback of the clue sequence

//Global Variables
let pattern = []; // Random pattern is generate at every new game
let progress = 0;
let gamePlaying = false;
let tonePlaying = false;
let volume = 0.5; // must be int between 0 and 1
let guessCounter = 0;

// Generate random pattern
const randomPattern = () => {
  for (let i = 0; i < 8; i++) {
    // Sets each index of pattern to a random number between 1 and 4
    pattern[i] = Math.floor(Math.random() * 4) + 1;
  }
};

const startGame = () => {
  incrementProgressBar(0);
  
  //initialize game variables
  progress = 0;
  gamePlaying = true;
  randomPattern();

  // swap the Start and Stop buttons
  document.getElementById("startBtn").classList.add("hidden");
  document.getElementById("stopBtn").classList.remove("hidden");
  document.getElementById("progressBar").classList.remove("hidden");
  
  // Proceed
  context.resume().then(() => {
    console.log("Playback resumed successfully");
    playClueSequence();
  });
};

const stopGame = () => {
  gamePlaying = false;
  incrementProgressBar(0);
  document.getElementById("startBtn").classList.remove("hidden");
  document.getElementById("stopBtn").classList.add("hidden");
  document.getElementById("progressBar").classList.add("hidden");
};

const lightButton = btn => {
  document.getElementById("button" + btn).classList.add("lit");
};
const clearButton = btn => {
  document.getElementById("button" + btn).classList.remove("lit");
};

const playSingleClue = btn => {
  if (gamePlaying) {
    lightButton(btn);
    playTone(btn, clueHoldTime);
    setTimeout(clearButton, clueHoldTime, btn);
  }
};

const incrementProgressBar = width => {
  document.getElementById("progressBar").style.width = width + "px";
};

const playClueSequence = () => {
  guessCounter = 0;
  let delay = nextClueWaitTime; //set delay to initial wait time
  for (let i = 0; i <= progress; i++) {
    // for each clue that is revealed so far
    incrementProgressBar((document.body.clientWidth / 8.0) * progress + 1);
    console.log(
      progress + ": play single clue: " + pattern[i] + " in " + delay + "ms"
    );
    setTimeout(playSingleClue, delay, pattern[i]); // set a timeout to play that clue
    delay += clueHoldTime;
    delay += cluePauseTime;
  }
};

const guess = btn => {
  console.log("user guessed: " + btn);
  if (!gamePlaying) {
    return;
  }

  // add game logic here
  // Check if the user input was correct
  if (btn == pattern[guessCounter]) {
    if (guessCounter == progress) {
      // Check if game has reached final pattern clue
      if (progress == pattern.length - 1) {
        incrementProgressBar(document.body.clientWidth);
        // Execute after loading bar animation
        setTimeout(winGame(), 1000);
      } else {
        // Increment progress and move on to next clue
        progress++;
        playClueSequence();
      }
    } else {
      guessCounter++;
    }
  } else {
    loseGame();
  }
};

const loseGame = () => {
  stopGame();
  alert("Game Over. You lost.");
};

const winGame = () => {
  stopGame();
  alert("Game Over. You won!");
};

//Sound Synthesis Functions
const freqMap = {
  1: 231.6,
  2: 319.6,
  3: 342,
  4: 436.2
};

const playTone = (btn, len) => {
  o.frequency.value = freqMap[btn];
  g.gain.setTargetAtTime(volume, context.currentTime + 0.05, 0.025);
  tonePlaying = true;
  setTimeout(() => {
    stopTone();
  }, len);
};

const startTone = btn => {
  if (!tonePlaying) {
    o.frequency.value = freqMap[btn];
    g.gain.setTargetAtTime(volume, context.currentTime + 0.05, 0.025);
    tonePlaying = true;
  }
};

const stopTone = () => {
  g.gain.setTargetAtTime(0, context.currentTime + 0.05, 0.025);
  tonePlaying = false;
};

//Page Initialization
//Init Sound Synthesizer
let context = new AudioContext();
let o = context.createOscillator();
let g = context.createGain();
g.connect(context.destination);
g.gain.setValueAtTime(0, context.currentTime);
o.connect(g);
o.start(0);
