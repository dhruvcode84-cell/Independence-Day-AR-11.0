export const $ = (selector) => document.querySelector(selector);
export const show = (element) => element?.classList.remove("hidden");
export const hide = (element) => element?.classList.add("hidden");

export function bindLandingUI({ onLaunch, onPreview, onViewCard, onClosePermission }) {
  $("#launch-btn")?.addEventListener("click", onLaunch);
  $("#nav-launch-btn")?.addEventListener("click", onLaunch);
  $("#demo-btn")?.addEventListener("click", onPreview);
  $("#view-card-btn")?.addEventListener("click", onViewCard);
  $("#open-card-btn")?.addEventListener("click", onViewCard);
  $(".modal-close")?.addEventListener("click", onClosePermission);
  $(".demo-close")?.addEventListener("click", () => {
    const modal = $("#demo-modal");
    hide(modal);
    modal?.querySelector("video")?.pause();
  });
}

export function createAmbientParticles() {
  const field = $(".particle-field");
  if (!field) return;
  for (let i = 0; i < 34; i += 1) {
    const particle = document.createElement("i");
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.animationDelay = `${Math.random() * 8}s`;
    particle.style.animationDuration = `${7 + Math.random() * 9}s`;
    field.appendChild(particle);
  }
}
