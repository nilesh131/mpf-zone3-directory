import { getActiveSavedOnly, getSavedCount } from "../core/state.js";

export function renderSavedToggle() {
    const button = document.getElementById("savedToggle");
    if (!button) return;

    const active = getActiveSavedOnly();
    const count = getSavedCount();

    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
    button.innerHTML = `
        <svg class="ico"><use href="#i-star"/></svg>
        ${active ? `Saved (${count})` : `Saved${count ? ` (${count})` : ""}`}
    `;
}
