// =======================
// Audio Helpers
// =======================

// Play looping sound (for work/rest) with repeatSound support
function playPhaseSound(currentAudio, sound, config, phaseDuration) {
  stopSound(currentAudio);
  if (!sound) return;

  currentAudio.audio = sound;

  if (config.repeatSound) {
    sound.loop = true;
    sound.play();
  } else {
    sound.loop = false;
    sound.currentTime = 0;
    sound.play();
    // Stop after max 5 seconds or phase duration if shorter
    const maxPlay = Math.min(5000, phaseDuration * 1000);
    setTimeout(() => stopSound(currentAudio), maxPlay);
  }
}

function playOnceSound(currentAudio, sound) {
  stopSound(currentAudio);
  if (!sound) return;

  currentAudio.audio = sound;
  sound.loop = false;
  sound.play();
}

function stopSound(currentAudio) {
  if (currentAudio.audio) {
    currentAudio.audio.pause();
    currentAudio.audio.currentTime = 0;
    currentAudio.audio.loop = false;
  }
}

// =======================
// Timer Function
// =======================
function startTimer(popup, timerDiv, duration, color, sound, currentAudio, next, isPausedObj, config) {
  let remaining = duration;
  popup.style.backgroundColor = color;

  playPhaseSound(currentAudio, sound, config, duration);

  const updateDisplay = () => {
    const min = Math.floor(remaining / 60);
    const sec = (remaining % 60).toString().padStart(2, "0");
    timerDiv.textContent = `${min}:${sec}`;
  };

  updateDisplay();

  const interval = setInterval(() => {
    if (!isPausedObj.value) {
      remaining--;
      updateDisplay();

      if (remaining < 0) {
        clearInterval(interval);
        stopSound(currentAudio);
        if (next) next();
      }
    }
  }, 1000);

  return interval;
}

// =======================
// Round Management
// =======================
function startRound(config) {
  if (config.currentRound >= config.rounds) {
    config.phaseDiv.textContent = "✅ Done!";
    config.timerDiv.textContent = "0:00";
    config.popup.style.backgroundColor = "lightgray";
    playOnceSound(config.currentAudio, config.doneSound);
    return;
  }

  config.currentRound++;

  // Work Phase
  config.phaseDiv.textContent = `🔥 Work - Round ${config.currentRound}`;
  config.interval = startTimer(
    config.popup,
    config.timerDiv,
    config.workTime,
    "blue",
    config.workSound,
    config.currentAudio,
    () => {
      if (config.currentRound >= config.rounds) {
        config.phaseDiv.textContent = "✅ Done!";
        config.timerDiv.textContent = "0:00";
        config.popup.style.backgroundColor = "lightgray";
        playOnceSound(config.currentAudio, config.doneSound);
      } else {
        // Rest Phase
        config.phaseDiv.textContent = `💤 Rest - Round ${config.currentRound}`;
        config.interval = startTimer(
          config.popup,
          config.timerDiv,
          config.restTime,
          "red",
          config.restSound,
          config.currentAudio,
          () => startRound(config),
          config.isPausedObj,
          config
        );
      }
    },
    config.isPausedObj,
    config
  );
}

// =======================
// Pause/Resume
// =======================
function togglePause(pauseBtn, currentAudio, isPausedObj) {
  isPausedObj.value = !isPausedObj.value;
  pauseBtn.textContent = isPausedObj.value ? "▶️ Resume" : "⏸ Pause";

  if (currentAudio.audio) {
    isPausedObj.value ? currentAudio.audio.pause() : currentAudio.audio.play();
  }
}

// =======================
// Quit Timer
// =======================
function quitTimer(config) {
  if (config.interval) clearInterval(config.interval);
  stopSound(config.currentAudio);

  config.popup.remove();
  config.startButton.style.display = "inline-block";
}
