// =======================
// Timer Functions
// =======================

// Play audio
function playSound(currentAudio, sound) {
  if (currentAudio.audio) {
    currentAudio.audio.pause();
    currentAudio.audio.currentTime = 0;
  }
  currentAudio.audio = sound;
  if (sound) sound.play();
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
    config.interval = startTimer(
      config.popup,
      config.timerDiv,
      5,
      "green",
      config.doneSound,
      config.currentAudio,
      null,
      config.isPausedObj
    );
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
  if (config.currentAudio.audio) {
    config.currentAudio.audio.pause();
    config.currentAudio.audio.currentTime = 0;
  }

  config.popup.remove();
  config.startButton.style.display = "inline-block";
}
