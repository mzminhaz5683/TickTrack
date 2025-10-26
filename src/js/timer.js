// =======================
// Timer Functions
// =======================

// Play audio
function playSound(currentAudio, sound) {
  if (currentAudio.audio) {
    currentAudio.audio.pause();
    currentAudio.audio.currentTime = 0;
    currentAudio.audio.loop = false; // stop previous looping
  }
  currentAudio.audio = sound;
  if (sound) {
    sound.loop = true; // loop while timer is running
    sound.play();
  }
}

// Stop audio
function stopSound(currentAudio) {
  if (currentAudio.audio) {
    currentAudio.audio.pause();
    currentAudio.audio.currentTime = 0;
    currentAudio.audio.loop = false;
  }
}

function startTimer(popup, timerDiv, duration, color, sound, currentAudio, next, isPausedObj) {
  let remaining = duration;
  popup.style.backgroundColor = color;

  playSound(currentAudio, sound);

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
        if (next) next();
      }
    }
  }, 1000);

  return interval;
}

// Start a round (work + rest)
function startRound(config) {
  if (config.currentRound >= config.rounds) {
    config.phaseDiv.textContent = "✅ Done!";
    // Play done sound once
    stopSound(config.currentAudio);          // stop any ongoing sound
    if (config.doneSound) config.doneSound.play();
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
      // If this is the last round, go straight to Done
      if (config.currentRound >= config.rounds) {
        config.phaseDiv.textContent = "✅ Done!";
        stopSound(config.currentAudio);
        if (config.doneSound) config.doneSound.play();
      } else {
        // Otherwise, start rest
        config.phaseDiv.textContent = `💤 Rest - Round ${config.currentRound}`;
        config.interval = startTimer(
          config.popup,
          config.timerDiv,
          config.restTime,
          "red",
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

// Toggle pause/resume
function togglePause(pauseBtn, currentAudio, isPausedObj) {
  isPausedObj.value = !isPausedObj.value;
  pauseBtn.textContent = isPausedObj.value ? "▶️ Resume" : "⏸ Pause";
  if (currentAudio.audio) {
    isPausedObj.value ? currentAudio.audio.pause() : currentAudio.audio.play();
  }
}

// Quit timer and remove popup
function quitTimer(config) {
  if (config.interval) clearInterval(config.interval);
  stopSound(config.currentAudio);

  config.popup.remove();
  config.startButton.style.display = "inline-block";
}
