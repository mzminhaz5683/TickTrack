// =======================
// Audio Helpers
// =======================

// Play looping sound (for work/rest)
function playLoopingSound(currentAudio, sound) {
  stopSound(currentAudio);         // stop any previous sound
  if (!sound) return;

  currentAudio.audio = sound;
  sound.loop = true;
  sound.play();
}

// Play one-time sound (for Done)
function playOnceSound(currentAudio, sound) {
  stopSound(currentAudio);         // stop any previous sound
  if (!sound) return;

  currentAudio.audio = sound;
  sound.loop = false;
  sound.play();
}

// Stop any current sound
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

function startTimer(popup, timerDiv, duration, color, sound, currentAudio, next, isPausedObj) {
  let remaining = duration;
  popup.style.backgroundColor = color;

  playLoopingSound(currentAudio, sound);  // work/rest sounds always loop

  // Update display immediately
  const min = Math.floor(remaining / 60);
  const sec = (remaining % 60).toString().padStart(2, "0");
  timerDiv.textContent = `${min}:${sec}`;

  const interval = setInterval(() => {
    if (!isPausedObj.value) {
      remaining--;
      const min = Math.floor(remaining / 60);
      const sec = (remaining % 60).toString().padStart(2, "0");
      timerDiv.textContent = `${min}:${sec}`;

      if (remaining < 0) {
        clearInterval(interval);
        stopSound(currentAudio);        // stop looping sound when phase ends
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
    config.timerDiv.textContent = "0:00";  // Reset timer display
    config.popup.style.backgroundColor = "gray";  // set Done color
    playOnceSound(config.currentAudio, config.doneSound);  // play Done sound once
    return;
  }

  config.currentRound++;
  config.phaseDiv.textContent = `🔥 Work - Round ${config.currentRound}`;
  config.interval = startTimer(
    config.popup,
    config.timerDiv,
    config.workTime,
    "blue",
    config.workSound,
    config.currentAudio,
    () => {
      // Last round? Skip rest and go straight to Done
      if (config.currentRound >= config.rounds) {
        config.phaseDiv.textContent = "✅ Done!";
        config.timerDiv.textContent = "0:00";  // Reset timer display
        config.popup.style.backgroundColor = "gray";  // set Done color
        playOnceSound(config.currentAudio, config.doneSound);  // play Done sound once
      } else {
        // Otherwise, start rest phase
        config.phaseDiv.textContent = `💤 Rest - Round ${config.currentRound}`;
        config.interval = startTimer(
          config.popup,
          config.timerDiv,
          config.restTime,
          "green",
          config.restSound,
          config.currentAudio,
          () => startRound(config),
          config.isPausedObj
        );
      }
    },
    config.isPausedObj
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
