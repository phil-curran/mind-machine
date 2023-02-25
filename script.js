const AudioContext = window.AudioContext || window.webkitAudioContext;

const context = new AudioContext();

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

// set default frequency values
let base = 32.7;
let splitLow = 0.5;
let splitMiddle = 2.25;
let splitHigh = 4;

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
masterVolume.gain.value = 0.6;
masterVolume.connect(context.destination);

// grab controls
const startButton = document.querySelector("#start");
const stopButton = document.querySelector("#stop");
const masterVolumeControl = document.querySelector("#masterVolume");
const lowVolumeControl = document.querySelector("#lowVolume");
const midVolumeControl = document.querySelector("#midVolume");
const highVolumeControl = document.querySelector("#highVolume");
const baseFrequency = document.querySelector("#baseFrequency");
const beatsFrequency = document.querySelector("#beatsFrequency");
const waveState = document.querySelector("#waveState");

// event listeners
masterVolumeControl.addEventListener("input", changeMasterVolume);
lowVolumeControl.addEventListener("input", changeLowVolume);
midVolumeControl.addEventListener("input", changeMidVolume);
highVolumeControl.addEventListener("input", changeHighVolume);
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

// constants for brain wave state frequency ranges
const delta = [0.5, 2.25, 4.0];
const theta = [4.0, 6.0, 8.0];
const alpha = [8.0, 10.5, 13.0];
const beta = [13.0, 21.5, 30.0];
const gamma = [30.0, 65.0, 100];

// dropdown for changing brain wave state
function changeWaveState() {
  let temp = this.value;
  if (temp == "delta") {
    splitLow = delta[0];
    splitMiddle = delta[1];
    splitHigh = delta[2];
  } else if (temp == "theta") {
    splitLow = theta[0];
    splitMiddle = theta[1];
    splitHigh = theta[2];
  } else if (temp == "alpha") {
    splitLow = alpha[0];
    splitMiddle = alpha[1];
    splitHigh = alpha[2];
  } else if (temp == "beta") {
    splitLow = beta[0];
    splitMiddle = beta[1];
    splitHigh = beta[2];
  } else if (temp == "gamma") {
    splitLow = gamma[0];
    splitMiddle = gamma[1];
    splitHigh = gamma[2];
  }
  document.querySelector("#beatsFreqLow").innerText = splitLow;
  beatsFrequency.setAttribute("min", parseFloat(splitLow));
  document.querySelector("#beatsFreqMid").innerText = splitMiddle;
  beatsFrequency.setAttribute("value", parseFloat(splitMiddle));
  document.querySelector("#beatsFreqHigh").innerText = splitHigh;
  beatsFrequency.setAttribute("max", parseFloat(splitHigh));
  // updateFrequencies();
}

// change beats frequency via slider
function changeBeatsFrequency() {
  document.querySelector("#beatsFreqMid").innerHTML = this.value;
  splitMiddle = this.value;
  updateFrequencies();
}

// start oscillators
startButton.addEventListener("click", () => {
  let base = 32.7;
  let splitLow = 0.5;
  let splitMiddle = 2.25;
  let splitHigh = 4;
  oscillator1.start(0);
  oscillator2.start(0);
  oscillator3.start(0);
  oscillator4.start(0);
  oscillator5.start(0);
  oscillator6.start(0);
});

// stop oscillators
stopButton.addEventListener("click", function () {
  oscillator1.stop(0);
  oscillator2.stop(0);
  oscillator3.stop(0);
  oscillator4.stop(0);
  oscillator5.stop(0);
  oscillator6.stop(0);
  delete oscillator1;
  delete oscillator2;
  delete oscillator3;
  delete oscillator4;
  delete oscillator5;
  delete oscillator6;
  // to avoid duplicate start() calls
  location.reload();
});
