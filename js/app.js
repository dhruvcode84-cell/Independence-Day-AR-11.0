import { CONFIG } from "./config.js";
import { $, show, hide, bindLandingUI, createAmbientParticles } from "./ui.js";

const landing = $("#landing");
const permissionPanel = $("#permission-panel");
const demoModal = $("#demo-modal");
const arView = $("#ar-view");
const status = $("#tracking-status");
const video = $("#md-video");
const playButton = $("#play-video-btn");
const replayButton = $("#replay-btn");
const soundButton = $("#sound-toggle");
const resetButton = $("#reset-view-btn");
const gestureLayer = $("#gesture-layer");
const gestureHint = $("#gesture-hint");

let experience;
let ARExperienceClass;
let muted = true;
let starting = false;
let hintTimer;

createAmbientParticles();

function dismissGestureHint() {
  if (!gestureHint) return;
  gestureHint.classList.add("gesture-hint--dismissed");
  window.clearTimeout(hintTimer);
}

function showGestureHint() {
  if (!gestureHint) return;
  gestureHint.classList.remove("hidden", "gesture-hint--dismissed");
  window.clearTimeout(hintTimer);
  hintTimer = window.setTimeout(dismissGestureHint, 4200);
}

bindLandingUI({
  onLaunch: () => show(permissionPanel),
  onPreview: () => show(demoModal),
  onViewCard: () => window.open(CONFIG.targetImage, "_blank", "noopener"),
  onClosePermission: () => hide(permissionPanel)
});

$("#start-camera-btn")?.addEventListener("click", async () => {
  if (starting) return;
  starting = true;
  hide(permissionPanel);
  hide(landing);
  show(arView);
  if (status) status.textContent = "Loading AR engine and 3D models…";

  try {
    if (!ARExperienceClass) {
      const arModule = await import("./ar-scene.js?v=9.1-launch-fix");
      ARExperienceClass = arModule.ARExperience;
    }
  } catch (error) {
    console.error("Failed to load the AR module:", error);
    if (status) status.textContent = "AR libraries could not be loaded. Check your internet connection and reload the page.";
    starting = false;
    return;
  }

  experience = new ARExperienceClass({
    container: $("#ar-container"),
    video,
    onStatus: (message) => {
      status.textContent = message;
    },
    onTargetFound: () => {
      show(playButton);
      show(soundButton);
      show(replayButton);
      show(resetButton);
      showGestureHint();
      navigator.vibrate?.(24);
      playButton.textContent = video.paused
        ? "▶ Play leadership message"
        : "❚❚ Pause leadership message";
    },
    onTargetLost: () => {
      hide(playButton);
      hide(soundButton);
      hide(replayButton);
      hide(resetButton);
      hide(gestureHint);
    }
  });

  try {
    await experience.start();
    experience.attachInteractions(gestureLayer, {
      onInteraction: dismissGestureHint
    });
  } catch (error) {
    console.error(error);
    if (status) status.textContent = error.message.includes("card.mind")
      ? "card.mind is missing. Compile assets/card.png and place card.mind in assets."
      : "Could not start AR. Use HTTPS and allow camera permission.";
  } finally {
    starting = false;
  }
});

$("#close-ar-btn")?.addEventListener("click", async () => {
  window.clearTimeout(hintTimer);
  await experience?.stop();
  experience = undefined;
  hide(arView);
  show(landing);
});

resetButton?.addEventListener("click", (event) => {
  event.stopPropagation();
  experience?.resetView(true);
  dismissGestureHint();
});

playButton?.addEventListener("click", async (event) => {
  event.stopPropagation();
  if (video.paused) {
    video.muted = muted;
    await video.play();
    navigator.vibrate?.(12);
    playButton.textContent = "❚❚ Pause leadership message";
  } else {
    video.pause();
    playButton.textContent = "▶ Play leadership message";
  }
});

replayButton?.addEventListener("click", async (event) => {
  event.stopPropagation();
  video.currentTime = 0;
  video.muted = muted;
  await video.play();
  navigator.vibrate?.(12);
  playButton.textContent = "❚❚ Pause leadership message";
});

soundButton?.addEventListener("click", (event) => {
  event.stopPropagation();
  muted = !muted;
  video.muted = muted;
  soundButton.textContent = muted ? "🔇" : "🔊";
  soundButton.setAttribute("aria-pressed", String(!muted));
});

if (new URLSearchParams(location.search).get("source") === "qr") {
  const kicker = $(".kicker");
  if (kicker) kicker.textContent = "QR VERIFIED · EXPERIENCE READY";
}
