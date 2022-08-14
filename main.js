const timer = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
  sessions: 0,
  longbreaks: 0,
  shortbreaks: 0,
};

let interval;

const buttonSound = new Audio("button-sound.mp3");
const mainButton = document.getElementById("js-btn");

mainButton.addEventListener("click", function () {
  //play the button sound upon click
  buttonSound.play();

  const { action } = mainButton.dataset;
  action === "start" ? startTimer() : endTimer();
});

const modeButtons = document.querySelector("#js-mode-buttons");
modeButtons.addEventListener("click", handleMode);

function handleMode(event) {
  const { mode } = event.target.dataset;
  console.log(mode);

  if (!mode) return;
  switchMode(mode);
  endTimer();
}

function switchMode(mode) {
  timer.mode = mode;
  timer.remainingTime = {
    total: timer[mode] * 60,
    minutes: timer[mode],
    seconds: 0,
  };

  document
    .querySelectorAll("button[data-mode]")
    .forEach((e) => e.classList.remove("active"));
  document.querySelector(`[data-mode="${mode}"]`).classList.add("active");
  document.body.style.backgroundColor = `var(--${mode})`;

  document
    .getElementById("js-progress")
    .setAttribute("max", timer.remainingTime.total);

  calcTimeBreakdown();
  updateClock();
}

function calcTimeBreakdown() {
  const totalSessions = timer.sessions * timer.pomodoro;
  const shortBreaks = timer.shortbreaks * timer.shortBreak;
  const longBreaks = timer.longbreaks * timer.longBreak;
  console.log(totalSessions, shortBreaks, longBreaks);

  productiveHours = Math.trunc(totalSessions / 60);
  productiveMinutes = totalSessions - productiveHours * 60;
  const session = document.getElementById("sessions");
  session.textContent =
    `${productiveHours}`.padStart(2, "0") +
    " hr : " +
    `${productiveMinutes}`.padStart(2, "0") +
    " min";

  const breaks = document.getElementById("breaks");
  const freeHours = Math.trunc((shortBreaks + longBreaks) / 60);
  const freeMin = shortBreaks + longBreaks - freeHours * 60;
  breaks.textContent =
    `${freeHours}`.padStart(2, "0") +
    " hr : " +
    `${freeMin}`.padStart(2, "0") +
    " min";
}

function updateClock() {
  const { remainingTime } = timer;

  const minutes = `${remainingTime.minutes}`.padStart(2, "0");
  const seconds = `${remainingTime.seconds}`.padStart(2, "0");

  const min = document.getElementById("js-minutes");
  const sec = document.getElementById("js-seconds");

  min.textContent = minutes;
  sec.textContent = seconds;

  //show timer in title of the browser
  const text = timer.mode === "pomodoro" ? "Get back to work!" : "Take a break";
  document.title = `${minutes} : ${seconds} - ${text}`;

  //showcase progress bar
  const progress = document.getElementById("js-progress");
  progress.value = timer[timer.mode] * 60 - timer.remainingTime.total;
}

function startTimer() {
  let { total } = timer.remainingTime;
  const endTime = Date.parse(new Date()) + total * 1000;
  console.log(endTime);

  if (timer.mode === "pomodoro") timer.sessions++;
  if (timer.mode === "longBreak") timer.longbreaks++;
  if (timer.mode === "shortBreak") timer.shortbreaks++;

  console.log(timer.sessions, timer.longbreaks, timer.shortbreaks);
  mainButton.dataset.action = "stop";

  mainButton.textContent = "stop";

  mainButton.classList.add("active");

  interval = setInterval(function () {
    timer.remainingTime = getRemainingTime(endTime);
    updateClock();

    total = timer.remainingTime.total;
    if (total <= 0) {
      clearInterval(interval);
      // automatically update/chnage the mode
      switch (timer.mode) {
        case "pomodoro":
          if (timer.sessions % timer.longBreakInterval === 0) {
            switchMode("longBreak");
          } else {
            switchMode("shortBreak");
          }
          break;
        default:
          switchMode("pomodoro");
      }

      // display notification text in browser if user permitted notifications for the app

      if (Notification.permission === "granted") {
        const text =
          timer.mode === "pomodoro" ? "Get back to work!" : "Take a break!";
        new Notification(text);
      }

      //play alarm sound depending on the mode session when it ends
      document.querySelector(`[data-sound="${timer.mode}"]`).play();

      startTimer();
    }
  }, 1000);
}

function endTimer() {
  clearInterval(interval);

  mainButton.dataset.action = "start";
  mainButton.textContent = "start";
  mainButton.classList.remove("active");
}
//how remaining time for timer is calculated
function getRemainingTime(endTime) {
  const currentTime = Date.parse(new Date());
  const difference = endTime - currentTime;

  const total = Number.parseInt(difference / 1000, 10);
  const minutes = Number.parseInt((total / 60) % 60, 10);
  const seconds = Number.parseInt(total % 60, 10);

  return {
    total,
    minutes,
    seconds,
  };
}
// pomodoro mode is set by default upon browser load
document.addEventListener("DOMContentLoaded", () => {
  // check if the browser supports notifications
  if ("Notification" in window) {
    // If notification permissions have neither been granted or denied
    if (
      Notification.permission !== "granted" &&
      Notification.permission !== "denied"
    ) {
      // ask the user for permission
      Notification.requestPermission().then(function (permission) {
        // If permission is granted
        if (permission === "granted") {
          // Create a new notification
          new Notification(
            "Awesome! You will be notified at the start of each session"
          );
        }
      });
    }
  }

  switchMode("pomodoro");
});
