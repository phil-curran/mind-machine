const AudioContext = window.AudioContext || window.webkitAudioContext;

const context = new AudioContext();

// set default frequency values
let base = 32.7;
let splitLow = 0.5;
let splitMiddle = 2.25;
let splitHigh = 4;

class Metronome {
  constructor(tempo, context, destination) {
    this.audioContext = context;
    this.notesInQueue = []; // notes that have been put into the web audio and may or may not have been played yet {note, time}
    this.currentBeatInBar = 0;
    this.beatsPerBar = 4;
    this.tempo = tempo;
    this.lookahead = 25; // How frequently to call scheduling function (in milliseconds)
    this.scheduleAheadTime = 0.1; // How far ahead to schedule audio (sec)
    this.nextNoteTime = 0.0; // when the next note is due
    this.isRunning = false;
    this.intervalID = null;
    this.destination = destination;
  }

  nextNote() {
    // Advance current note and time by a quarter note (crotchet if you're posh)
    var secondsPerBeat = 60.0 / this.tempo;
    // Notice this picks up the CURRENT tempo value to calculate beat length.
    this.nextNoteTime += secondsPerBeat; // Add beat length to last beat time

    this.currentBeatInBar++; // Advance the beat number, wrap to zero
    if (this.currentBeatInBar == this.beatsPerBar) {
      this.currentBeatInBar = 0;
    }
  }

  scheduleNote(beatNumber, time) {
    // push the note on the queue, even if we're not playing.
    this.notesInQueue.push({ note: beatNumber, time: time });

    // create an oscillator
    const osc = this.audioContext.createOscillator();
    const envelope = this.audioContext.createGain();

    osc.frequency.value = 16.4;
    osc.type = "square";
    envelope.gain.value = 1;
    envelope.gain.exponentialRampToValueAtTime(0.4, time + 0.001);
    envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.02);

    osc.connect(envelope);
    envelope.connect(this.destination);

    osc.start(time);
    osc.stop(time + 0.03);
  }

  scheduler() {
    // while there are notes that will need to play before the next interval, schedule them and advance the pointer.
    while (
      this.nextNoteTime <
      this.audioContext.currentTime + this.scheduleAheadTime
    ) {
      this.scheduleNote(this.currentBeatInBar, this.nextNoteTime);
      this.nextNote();
    }
  }

  start() {
    if (this.isRunning) return;

    if (this.audioContext == null) {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
    }

    this.isRunning = true;

    this.currentBeatInBar = 0;
    this.nextNoteTime = this.audioContext.currentTime + 0.05;

    this.intervalID = setInterval(() => this.scheduler(), this.lookahead);
  }

  stop() {
    this.isRunning = false;

    clearInterval(this.intervalID);
  }

  startStop() {
    if (this.isRunning) {
      this.stop();
    } else {
      this.start();
    }
  }
}

// create gain contexts
const masterVolume = context.createGain();
const osc1Volume = context.createGain();
const osc2Volume = context.createGain();
const lowVolume = context.createGain();
const osc3Volume = context.createGain();
const osc4Volume = context.createGain();
const midVolume = context.createGain();
const osc5Volume = context.createGain();
const osc6Volume = context.createGain();
const highVolume = context.createGain();
const clickVolume = context.createGain();

// create osc 1
const oscillator1 = context.createOscillator();
oscillator1.type = "sine";
oscillator1.frequency.value =
  Math.round(parseFloat(base + splitMiddle) * 100) / 100;
const osc1Pan = context.createStereoPanner();
osc1Pan.pan.value = -1;
oscillator1.connect(osc1Volume);
osc1Volume.connect(osc1Pan);
osc1Pan.connect(lowVolume);

// create osc 2
const oscillator2 = context.createOscillator();
oscillator2.type = "sine";
oscillator2.frequency.value =
  Math.round(parseFloat(base - splitMiddle) * 100) / 100;
const osc2Pan = context.createStereoPanner();
osc2Pan.pan.value = 1;
oscillator2.connect(osc2Volume);
osc2Volume.connect(osc2Pan);
osc2Pan.connect(lowVolume);

// create osc 3
const oscillator3 = context.createOscillator();
oscillator3.type = "sine";
oscillator3.frequency.value =
  Math.round(parseFloat(base * 2) + (splitMiddle / 2) * 100) / 100;
oscillator3.connect(osc3Volume);
const osc3Pan = context.createStereoPanner();
osc3Pan.pan.value = -1;
osc3Volume.connect(osc3Pan);
osc3Pan.connect(midVolume);

// create osc 4
const oscillator4 = context.createOscillator();
oscillator4.type = "sine";
oscillator4.frequency.value =
  Math.round(parseFloat(base * 2) - (splitMiddle / 2) * 100) / 100;
oscillator4.connect(osc4Volume);
const osc4Pan = context.createStereoPanner();
osc4Pan.pan.value = 1;
osc4Volume.connect(osc4Pan);
osc4Pan.connect(midVolume);

// create osc 5
const oscillator5 = context.createOscillator();
oscillator5.type = "sine";
oscillator5.frequency.value =
  Math.round(parseFloat(base * 4) + (splitMiddle / 4) * 100) / 100;
oscillator5.connect(osc5Volume);
const osc5Pan = context.createStereoPanner();
osc5Pan.pan.value = -1;
osc5Volume.connect(osc5Pan);
osc5Pan.connect(highVolume);

// create osc 6
const oscillator6 = context.createOscillator();
oscillator6.type = "sine";
oscillator6.frequency.value =
  Math.round(parseFloat(base * 4) - (splitMiddle / 4) * 100) / 100;
oscillator6.connect(osc6Volume);
const osc6Pan = context.createStereoPanner();
osc6Pan.pan.value = 1;
osc6Volume.connect(osc6Pan);
osc6Pan.connect(highVolume);

// connect volume submixers to masterVolume to context.destination && set levels
lowVolume.gain.value = 0.4;
lowVolume.connect(masterVolume);
midVolume.gain.value = 0.3;
midVolume.connect(masterVolume);
highVolume.gain.value = 0.2;
highVolume.connect(masterVolume);
clickVolume.gain.value = 0.5;
clickVolume.connect(masterVolume);
masterVolume.gain.value = 0.6;
masterVolume.connect(context.destination);

// grab controls
const startButton = document.querySelector("#start");
const stopButton = document.querySelector("#stop");
const masterVolumeControl = document.querySelector("#masterVolume");
const lowVolumeControl = document.querySelector("#lowVolume");
const midVolumeControl = document.querySelector("#midVolume");
const highVolumeControl = document.querySelector("#highVolume");
const clickVolumeControl = document.querySelector("#clickVolume");
const baseFrequency = document.querySelector("#baseFrequency");
const beatsFrequency = document.querySelector("#beatsFrequency");
const waveState = document.querySelector("#waveState");

// event listeners
masterVolumeControl.addEventListener("input", changeMasterVolume);
lowVolumeControl.addEventListener("input", changeLowVolume);
midVolumeControl.addEventListener("input", changeMidVolume);
highVolumeControl.addEventListener("input", changeHighVolume);
clickVolumeControl.addEventListener("input", changeClickVolume);
baseFrequency.addEventListener("input", changeBaseFrequency);
waveState.addEventListener("input", changeWaveState);
beatsFrequency.addEventListener("input", changeBeatsFrequency);

// event handlers

// refresh frequency values
function updateFrequencies() {
  oscillator1.frequency.value =
    Math.round(parseFloat(base + splitMiddle) * 100) / 100;
  oscillator2.frequency.value =
    Math.round(parseFloat(base - splitMiddle) * 100) / 100;
  oscillator3.frequency.value =
    Math.round(parseFloat(base * 2 + splitMiddle / 2) * 100) / 100;
  oscillator4.frequency.value =
    Math.round(parseFloat(base * 2 - splitMiddle / 2) * 100) / 100;
  oscillator5.frequency.value =
    Math.round(parseFloat(base * 4 + splitMiddle / 4) * 100) / 100;
  oscillator6.frequency.value =
    Math.round(parseFloat(base * 4 - splitMiddle / 4) * 100) / 100;
  // metronome.tempo = parseFloat(splitMiddle * 60);
}

// get & set base frequency
function changeBaseFrequency() {
  base = this.value;
  updateFrequencies();
}

// adjust master volume
function changeMasterVolume() {
  document.querySelector("#masterVolumeCurrentValue").innerHTML = this.value;
  masterVolume.gain.value = this.value;
}

// adjust low frequency volume submixer
function changeLowVolume() {
  document.querySelector("#lowMasterVolume").innerHTML = this.value;
  lowVolume.gain.value = this.value;
}

// adjust mid frequency volume submixer
function changeMidVolume() {
  document.querySelector("#midMasterVolume").innerHTML = this.value;
  midVolume.gain.value = this.value;
}

// adjust high frequency volume submixer
function changeHighVolume() {
  document.querySelector("#highMasterVolume").innerHTML = this.value;
  highVolume.gain.value = this.value;
}

// adjust click volume submixer
function changeClickVolume() {
  document.querySelector("#clickVolumeLevel").innerHTML = this.value;
  clickVolume.gain.value = this.value;
}

// dropdown for changing brain wave state
function changeWaveState() {
  let temp = this.value;
  if (temp == "delta") {
    splitLow = 0.5;
    splitMiddle = 2.25;
    splitHigh = 4;
  } else if (temp == "theta") {
    splitLow = 4;
    splitMiddle = 6;
    splitHigh = 8;
  } else if (temp == "alpha") {
    splitLow = 8;
    splitMiddle = 10.5;
    splitHigh = 13;
  } else if (temp == "beta") {
    splitLow = 13;
    splitMiddle = 21.5;
    splitHigh = 30;
  } else if (temp == "gamma") {
    splitLow = 30;
    splitMiddle = 65;
    splitHigh = 100;
  }
  document.querySelector("#beatsFreqLow").innerText = splitLow;
  beatsFrequency.setAttribute("min", parseFloat(splitLow));
  document.querySelector("#beatsFreqMid").innerText = splitMiddle;
  beatsFrequency.setAttribute("value", parseFloat(splitMiddle));
  metronome.tempo = parseFloat(splitMiddle * 60);
  document.querySelector("#beatsFreqHigh").innerText = splitHigh;
  beatsFrequency.setAttribute("max", parseFloat(splitHigh));
  updateFrequencies();
}

// change beats frequency via slider
function changeBeatsFrequency(splitMiddle) {
  document.querySelector("#beatsFreqMid").innerHTML = this.value;
  splitMiddle = this.value;
  updateFrequencies();
  metronome.tempo = parseFloat(splitMiddle * 60);
}

var metronome = new Metronome(splitMiddle * 60, context, clickVolume);

// connect metronome to clickVolume
// metronome.connect(clickVolume);

// start oscillators
startButton.addEventListener("click", () => {
  oscillator1.start(0);
  oscillator2.start(0);
  oscillator3.start(0);
  oscillator4.start(0);
  oscillator5.start(0);
  oscillator6.start(0);
  metronome.start();
});

// stop oscillators
stopButton.addEventListener("click", function () {
  oscillator1.stop(0);
  oscillator2.stop(0);
  oscillator3.stop(0);
  oscillator4.stop(0);
  oscillator5.stop(0);
  oscillator6.stop(0);
  metronome.stop();
  // to avoid duplicate start() calls
  location.reload();
});
