document.addEventListener("DOMContentLoaded", () => {
  initTimerButtons();
});

// ===========================
// Initialize buttons for each timer
// ===========================
function initTimerButtons() {
  const container = document.getElementById("timerContainer");
  const startButtonContainer = document.getElementById("startButtonContainer");

  for (const timerName in timers) {
    const btn = document.createElement("button");
    btn.textContent = timerName.charAt(0).toUpperCase() + timerName.slice(1);
    btn.dataset.timer = timerName;
    btn.style.margin = "10px";
    startButtonContainer.appendChild(btn);

    btn.addEventListener("click", () => startTimerSession(timerName, container, btn));
  }
}

function getMaxInterval(timeInMinutes, timeInSeconds) {
  return Math.max(timeInMinutes * 60, timeInSeconds);
}

function manageSoundRepeatation(config) {
  const repeatCheckboxMain = document.getElementById("repeatSoundMain");
  const repeatCheckboxPopup = document.getElementById("repeatSoundPopup");
  repeatCheckboxMain.addEventListener("change", () => {
    config.repeatSound = repeatCheckboxMain.checked;
    repeatCheckboxPopup.checked = repeatCheckboxMain.checked; // sync popup
  });
  repeatCheckboxPopup.addEventListener("change", () => {
    config.repeatSound = repeatCheckboxPopup.checked;
    repeatCheckboxMain.checked = repeatCheckboxPopup.checked; // sync main
  });
}

// ===========================
// Start a timer session
// ===========================
async function startTimerSession(timerName, container, startButton) {
  const timerConfig = timers[timerName];

  // Load timer HTML
  const response = await fetch("./src/html/timer.html");
  container.innerHTML = await response.text();

  // Hide start buttons
  startButton.style.display = "none";

  // Grab popup elements
  const repeatCheckboxMain = document.getElementById("repeatSoundMain");
  const popup = document.getElementById("timerPopup");
  const phaseDiv = document.getElementById("phase");
  const timerDiv = document.getElementById("timer");
  const pauseBtn = document.getElementById("pauseBtn");
  const quitBtn = document.getElementById("quitBtn");
  const workSound = document.getElementById("workSound");
  const restSound = document.getElementById("restSound");
  const doneSound = document.getElementById("doneSound");

  const config = {
    popup,
    phaseDiv,
    timerDiv,
    pauseBtn,
    quitBtn,
    workSound,
    restSound,
    doneSound,
    workTime: getMaxInterval(timerConfig.work_time_in_minutes, timerConfig.work_time_in_seconds),
    restTime: getMaxInterval(timerConfig.relax_time_in_minutes, timerConfig.relax_time_in_seconds),
    repeatSound: repeatCheckboxMain.checked,
    rounds: timerConfig.round,
    currentRound: 0,
    interval: null,
    currentAudio: { audio: null },
    isPausedObj: { value: false },
    startButton
  };

  popup.classList.remove("hidden");

  // Start the first round
  startRound(config);

  // Bind buttons and keyboard
  bindQuitButton(config);
  bindPauseButton(config);
  bindKeyboardControls(config);
  manageSoundRepeatation(config);
}

// ===========================
// Pause / Resume button
// ===========================
function bindPauseButton(config) {
  config.pauseBtn.addEventListener("click", () => {
    togglePause(config.pauseBtn, config.currentAudio, config.isPausedObj);
  });
}

// ===========================
// Quit button
// ===========================
function bindQuitButton(config) {
  config.quitBtn.addEventListener("click", () => {
    quitTimer(config);
    unbindKeyboardControls();
  });
}

// ===========================
// Keyboard controls
// ===========================
let keyboardListener = null;

function bindKeyboardControls(config) {
  keyboardListener = function (e) {
    if (!config.popup) return;

    if (e.code === "Space") {
      e.preventDefault();
      togglePause(config.pauseBtn, config.currentAudio, config.isPausedObj);
    } else if (e.code === "Escape") {
      quitTimer(config);
      unbindKeyboardControls();
    }
  };

  document.addEventListener("keydown", keyboardListener);
}

function unbindKeyboardControls() {
  if (keyboardListener) {
    document.removeEventListener("keydown", keyboardListener);
    keyboardListener = null;
  }
}
