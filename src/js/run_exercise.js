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

// ===========================
// Start a timer session
// ===========================
async function startTimerSession(timerName, container, startButton) {
  const timerConfig = timers[timerName];

  // Load timer HTML
  const response = await fetch("./src/html/timer.html");
  container.innerHTML = await response.text();

  // Hide start button
  startButton.style.display = "none";

  // Grab popup elements
  const popup = document.getElementById("timerPopup");
  const phaseDiv = document.getElementById("phase");
  const timerDiv = document.getElementById("timer");
  const pauseBtn = document.getElementById("pauseBtn");
  const quitBtn = document.getElementById("quitBtn");
  const workSound = document.getElementById("workSound");
  const restSound = document.getElementById("restSound");
  const doneSound = document.getElementById("doneSound");

  // Prepare configuration
  const config = {
    popup,
    phaseDiv,
    timerDiv,
    pauseBtn,
    quitBtn,
    workSound,
    restSound,
    doneSound,
    workTime: timerConfig.work_time_in_minutes * 60,
    restTime: timerConfig.relax_time_in_minutes * 60,
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
  bindPauseButton(config);
  bindQuitButton(config);
  bindKeyboardControls(config);
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
