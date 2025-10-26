# TickTrack: Custom Work/Rest Timer

This is a simple **work/rest timer** implemented in JavaScript. It supports multiple timers, each with configurable work and rest durations, number of rounds, and audio feedback. When you add a new timer entry, a button will automatically appear, and the timer will work for that configuration.

---

## Features

- Separate **work** and **rest** phases with configurable durations.
- Configurable **number of rounds**.
- **Audio feedback**:
  - Looped sound during work/rest.
  - One-time sound when all rounds are completed ("Done").
- **Pause/Resume** functionality via button or **Spacebar**.
- **Quit timer** via button or **Escape key**.
- Automatically displays **timer countdown** in minutes:seconds format.
- Popup background color changes:
  - Work: Blue  
  - Rest: Red  
  - Done: Light gray  

---

## Timer Configuration (`time_manage.js`)

All timers are defined in the `timers` object in `time_manage.js`. Example:

```javascript
const timers = {
  'jumper': {
    'work_time_in_minutes': 0,
    'relax_time_in_minutes': 0,
    'work_time_in_seconds': 1,
    'relax_time_in_seconds': 1,
    'round': 2,
  },
};
````

### Rules

* The timer automatically selects the **larger of the minute-based or second-based values**.
* `round`: Number of work/rest cycles to perform.

### Adding a New Timer

To add a new timer:

1. Add a new key to the `timers` object with its configuration. Example:

```javascript
const timers = {
  'jumper': { /* existing config */ },
  'breathing': {
    'work_time_in_minutes': 0,
    'relax_time_in_minutes': 0,
    'work_time_in_seconds': 1,
    'relax_time_in_seconds': 1,
    'round': 3,
  },
};
```

2. Reload the page. A new button (`Breathing`) will automatically appear.
3. Click the button to start the timer with this configuration.

---

## Audio Configuration

Your timer uses three types of sounds:

| Purpose    | HTML `<audio>` ID | Default file                  |
| ---------- | ----------------- | ----------------------------- |
| Work start | `workSound`       | `timer_sounds/work_start.mp3` |
| Rest start | `restSound`       | `timer_sounds/rest_start.mp3` |
| Done       | `doneSound`       | `timer_sounds/done.mp3`       |

### Changing Timer Sounds

If you want to replace the audio for any phase:

1. Prepare your new sound file (e.g., `bird.mp3`).
2. Go to the `timer_sounds/` folder.
3. Replace the existing sound file for the target phase by **renaming your new file** to match the existing one:

| Phase      | Existing file    | Action example                                                           |
| ---------- | ---------------- | ------------------------------------------------------------------------ |
| Work start | `work_start.mp3` | Rename `bird.mp3` → `work_start.mp3` and delete the old `work_start.mp3` |
| Rest start | `rest_start.mp3` | Rename your new file → `rest_start.mp3` and delete the old one           |
| Done       | `done.mp3`       | Rename your new file → `done.mp3` and delete the old one                 |

4. Reload the page. The timer will automatically use the new audio — **no code changes required**.

> ✅ Tip: Make sure the new file has the **exact same name** as the old one for that phase.

---

## Running the Timer Locally

You can run the timer as a local server to properly load JS, CSS, and audio files. Two scripts are provided:

### Linux/macOS

```bash
./runner.sh
```

* Starts a BusyBox HTTP server.
* Opens at `http://127.0.0.1:8080/index.html`.
* If port 8080 is in use, the script shows the PID and asks whether to kill it (default Yes).

### Windows

```bat
runner.bat
```

* Starts a PowerShell-based HTTP server.
* Opens at `http://127.0.0.1:8080/index.html`.
* If port 8080 is in use, the script shows the process ID and asks whether to terminate it (default Yes).

> ✅ After starting, open your browser and navigate to `http://127.0.0.1:8080/index.html`.

---

## Usage

1. Open the page via the local server.
2. Click a timer button to start the session.
3. The timer popup shows the current phase (work/rest), countdown, and controls.
4. Use **Pause** button or **Spacebar** to pause/resume.
5. Use **Quit** button or **Escape key** to stop the timer and close the popup.
6. When all rounds are completed:

   * Popup background turns **light gray**.
   * Timer shows `0:0`.
   * Done sound plays **once**.

---

## File Structure

```
TickTrack/
├── index.html
├── README.md
├── runner.bat       <-- Windows server script
├── runner.sh        <-- Linux/macOS server script
├── src/
│   ├── css/
│   │   └── style.css
│   ├── html/
│   │   └── timer.html
│   └── js/
│       ├── run_exercise.js
│       └── timer.js
├── time_manage.js      <-- timers object here
└── timer_sounds/      <-- Audio files here
    ├── done.mp3
    ├── rest_start.mp3
    └── work_start.mp3
```

* `time_manage.js` contains the `timers` object.
* `timer_sounds/` contains the audio files for work/rest/done phases.
* `src/html/timer.html` defines the popup HTML elements with `<audio>` IDs: `workSound`, `restSound`, `doneSound`.
* `runner.sh` and `runner.bat` start a local server to run the timer correctly.
