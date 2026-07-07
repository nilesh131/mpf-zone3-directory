import { website } from "./contact.js";
import { isSavedMember, toggleSavedMember } from "../core/state.js";
import { titleCase, initials, whatsappNumber, escapeHtml as esc } from "../utils/helpers.js";

function cleanPhone(phone){
    return String(phone || "").replace(/\D/g, "");
}

function listSection(iconId, title, items){
    const clean = (items || []).filter(x => x && x !== "Looking for -");
    if(!clean.length) return "";
    return `
<section class="profile-section">
<h3><svg class="ico"><use href="#${iconId}"/></svg>${title}</h3>
<ul class="profile-list">
${clean.map(item => `<li>${esc(item)}</li>`).join("")}
</ul>
</section>`;
}

let overlay;
let drawer;
let body;
let lastFocused;

function isOpen(){
    return overlay && overlay.classList.contains("show");
}

export function initializeProfile() {

    document.body.insertAdjacentHTML("beforeend", `

<div id="profileOverlay" class="profile-overlay" aria-hidden="true">

    <div id="profileDrawer" class="profile-drawer" role="dialog" aria-modal="true" aria-labelledby="profileName" tabindex="-1">

        <button id="closeDrawer" class="drawer-close" aria-label="Close profile">✕</button>

        <div id="profileBody"></div>

    </div>

</div>

`);

    overlay = document.getElementById("profileOverlay");
    drawer = document.getElementById("profileDrawer");
    body = document.getElementById("profileBody");

    overlay.addEventListener("click", e => {
        if (e.target === overlay) closeProfile();
    });

    document.getElementById("closeDrawer").onclick = closeProfile;

    // Keyboard: Escape closes, Tab is trapped inside the open drawer.
    document.addEventListener("keydown", e => {

        if (!isOpen()) return;

        if (e.key === "Escape") {
            closeProfile();
            return;
        }

        if (e.key === "Tab") {
            trapFocus(e);
        }

    });

}

function trapFocus(e){

    const focusable = drawer.querySelectorAll(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
    );

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
    }

}

export function openProfile(member){

    lastFocused = document.activeElement;

    body.innerHTML = createProfile(member);

    overlay.classList.add("show");
    drawer.classList.add("show");
    overlay.setAttribute("aria-hidden", "false");

    document.body.classList.add("modal-open");

    bindButtons(member);

    body.scrollTop = 0;

    const closeBtn = document.getElementById("closeDrawer");
    if (closeBtn) closeBtn.focus();

}

function closeProfile(){

    overlay.classList.remove("show");
    drawer.classList.remove("show");
    overlay.setAttribute("aria-hidden", "true");

    document.body.classList.remove("modal-open");

    if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
    }

}

function bindButtons(member){

    const btnSave = document.getElementById("btnSaveProfile");
    if (btnSave) {
        btnSave.onclick = () => {
            const saved = toggleSavedMember(member.id);
            btnSave.classList.toggle("active", saved);
            btnSave.setAttribute("aria-pressed", saved ? "true" : "false");
            btnSave.title = saved ? "Remove from saved" : "Save to favorites";
            btnSave.innerHTML = `<svg class="ico"><use href="#i-star"/></svg>${saved ? "Saved" : "Save"}`;
            window.dispatchEvent(new Event("favorites-changed"));
        };
    }

    const btnWebsite = document.getElementById("btnWebsite");
    if (btnWebsite) {
        btnWebsite.onclick = () => {
            const url = website(getWebsiteFromMember(member) || member.website || "");
            if (url && url !== "#") window.open(url, "_blank", "noopener");
        };
    }

}

function createProfile(member){

    const image = member.photo || `/photos/${cleanPhone(member.phone)}.png`;
    const init = esc(initials(member.name));
    const name = esc(titleCase(member.name));

    const industries = String(member.industry || "")
        .split(";")
        .map(s => s.trim())
        .filter(Boolean);

    const webUrl = getWebsiteFromMember(member) || member.website;

    return `

<div class="p-head">

    <div class="avatar">
        <img
            src="${esc(image)}"
            alt="${name}"
            onerror="this.onerror=null;this.parentElement.textContent='${init}';"
        >
    </div>

    <div>
        <h2 class="p-name" id="profileName">${name}</h2>
        <p class="p-co">${esc(member.company || "")}</p>
    </div>

</div>

<div class="p-chips">
    <span class="tag ch">${esc(member.chapter || "MPF")}</span>
    ${industries.map(i => `<span class="tag ind">${esc(i)}</span>`).join("")}
    <span class="tag type">${esc(member.memberType || "Other")}</span>
</div>

<div class="p-actions">

    <a class="btn btn-wa" href="https://wa.me/${whatsappNumber(member.phone)}" target="_blank" rel="noopener">
        <svg class="ico"><use href="#i-chat"/></svg>WhatsApp
    </a>

    <a class="btn btn-call" href="tel:${esc(String(member.phone || ""))}">
        <svg class="ico"><use href="#i-phone"/></svg>Call
    </a>

    <button
        class="btn btn-sec btn-save-profile${isSavedMember(member.id) ? " active" : ""}"
        id="btnSaveProfile"
        type="button"
        aria-pressed="${isSavedMember(member.id)}"
        title="${isSavedMember(member.id) ? "Remove from saved" : "Save to favorites"}"
        style="grid-column:1/-1"
    >
        <svg class="ico"><use href="#i-star"/></svg>${isSavedMember(member.id) ? "Saved" : "Save"}
    </button>

    ${webUrl ? `
    <button class="btn btn-line" id="btnWebsite" style="grid-column:1/-1">
        <svg class="ico"><use href="#i-globe"/></svg>Website
    </button>` : ""}

</div>

${member.about ? `
<section class="profile-section">
<h3><svg class="ico"><use href="#i-book"/></svg>About the business</h3>
<p class="profile-about">${esc(member.about).replace(/\n/g, "<br><br>")}</p>
</section>` : ""}

${listSection("i-target", "Looking for", member.lookingFor)}

${listSection("i-star", "Ideal referral", member.idealReferral)}

${listSection("i-hand", "Can help with", member.canHelp)}

${member.services?.length ? `
<section class="profile-section">
<h3><svg class="ico"><use href="#i-wrench"/></svg>Services</h3>
<div class="service-tags">
${member.services.map(s => `<span>${esc(s)}</span>`).join("")}
</div>
</section>` : ""}

<section class="profile-section">
<div class="p-meta">
    <div><div class="k">Chapter</div><div class="v">${esc(member.chapter || "-")}</div></div>
    <div><div class="k">Mobile</div><div class="v tnum">${esc(member.phone || "-")}</div></div>
</div>
</section>

`;

}

function getWebsiteFromMember(member){

    if(!member) return null;

    if(member.website) return member.website;

    if(member.about){
        const re = /(https?:\/\/[^\s"']+)|(www\.[^\s"']+)/i;
        const m = member.about.match(re);
        if(m && m[0]){
            const url = m[0];
            if(url.toLowerCase().startsWith("www."))
                return "https://" + url;
            return url;
        }
    }

    return null;

}
