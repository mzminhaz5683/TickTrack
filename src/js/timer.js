// =======================
// CSS Helpers
// =======================
function applyPopupStyle(popup, phase) {
  const validPhases = ["work", "rest", "done"];
  popup.classList.remove("popup-work", "popup-rest", "popup-done");

  if (validPhases.includes(phase)) {
    popup.classList.add(`popup-${phase}`);
  } else {
    console.warn("Invalid phase for popup style:", phase);
  }
}

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
function startTimer(popup, timerDiv, duration, phase, sound, currentAudio, next, isPausedObj, config) {
  let remaining = duration;
  applyPopupStyle(popup, phase);

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

      // Dynamically handle repeatSound changes
      if (config.repeatSound) {
        // Start/loop sound if not playing
        if (!currentAudio.audio || currentAudio.audio.paused) {
          stopSound(currentAudio);
          currentAudio.audio = sound;
          sound.loop = true;
          sound.currentTime = 0;
          sound.play();
        } else if (!currentAudio.audio.loop) {
          currentAudio.audio.loop = true;
        }
      } else {
        // Stop looping and schedule max 5s
        if (currentAudio.audio && currentAudio.audio.loop) {
          currentAudio.audio.loop = false;
          setTimeout(() => stopSound(currentAudio), Math.min(5000, remaining * 1000));
        }
      }

      if (remaining < 0) {
        clearInterval(interval);
        stopSound(currentAudio);
        if (next) next();
      }
    }
  }, 1000);

  // Play initially according to current config
  if (config.repeatSound) {
    currentAudio.audio = sound;
    sound.loop = true;
    sound.currentTime = 0;
    sound.play();
  } else {
    currentAudio.audio = sound;
    sound.loop = false;
    sound.currentTime = 0;
    sound.play();
    setTimeout(() => stopSound(currentAudio), Math.min(5000, remaining * 1000));
  }

  return interval;
}

// =======================
// Round Management
// =======================
function startRound(config) {
  if (config.currentRound >= config.rounds) {
    config.phaseDiv.textContent = "✅ Done!";
    config.timerDiv.textContent = "0:00";
    applyPopupStyle(config.popup, "done");
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
    "work",
    config.workSound,
    config.currentAudio,
    () => {
      if (config.currentRound >= config.rounds) {
        config.phaseDiv.textContent = "✅ Done!";
        config.timerDiv.textContent = "0:00";
        applyPopupStyle(config.popup, "done");
        playOnceSound(config.currentAudio, config.doneSound);
      } else {
        // Rest Phase
        config.phaseDiv.textContent = `💤 Rest - Round ${config.currentRound}`;
        config.interval = startTimer(
          config.popup,
          config.timerDiv,
          config.restTime,
          "rest",
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
