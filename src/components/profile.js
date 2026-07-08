import { website } from "./contact.js";
import { isSavedMember, toggleSavedMember } from "../core/state.js";
import { titleCase, initials, whatsappNumber, escapeHtml as esc, isBareUrl } from "../utils/helpers.js";

function cleanPhone(phone){
    return String(phone || "").replace(/\D/g, "");
}

// A bulk data import split many members' sentences at every comma, turning one
// flowing sentence into a dozen nonsense one-word bullets ("Secretary", "Jain"…).
// When we detect that pattern, rejoin the fragments and re-split into whole
// sentences so each bullet reads properly. Genuinely distinct item lists (every
// entry a self-contained capitalised phrase) are left untouched.
function coalesceItems(items){
    const clean = (items || []).map(s => String(s).trim()).filter(x => x && x !== "Looking for -");
    if (clean.length < 2) return clean;

    const overSplit = clean.some((s, i) =>
        i > 0 && (/^[a-z]/.test(s) || /^(or|and)\b/i.test(s))
    );
    if (!overSplit) return clean;

    const joined = clean.join(", ").replace(/,\s*,/g, ", ").replace(/\s+/g, " ").trim();

    // Split back into whole sentences at .!? followed by a capital
    // (lookahead only + a sentinel, so no lookbehind — widest browser support).
    const SENT = "@@S@@";
    const parts = joined
        .replace(/([.!?])\s+(?=[A-Z])/g, "$1" + SENT)
        .split(SENT)
        .map(s => s.trim())
        .filter(Boolean);

    return parts.length ? parts : [joined];
}

// Services render as short tag chips, so (unlike the bullet lists) we don't want
// to fuse everything into one sentence. Instead we only re-attach the stray
// lower-case / "or,and" continuation fragments to the tag before them, keeping
// genuinely distinct services as separate chips.
function coalesceTags(items){
    const clean = (items || []).map(s => String(s).trim()).filter(Boolean);
    if (clean.length < 2) return clean;

    const out = [];
    for (const s of clean) {
        const isContinuation = /^[a-z]/.test(s) || /^(or|and)\b/i.test(s);
        if (out.length && isContinuation) {
            out[out.length - 1] = out[out.length - 1].replace(/[,;\s]*$/, "") + ", " + s;
        } else {
            out.push(s);
        }
    }
    return out;
}

function listSection(iconId, title, items){
    const clean = coalesceItems(items);
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
let lightbox;
let lightboxImg;

function isOpen(){
    return overlay && overlay.classList.contains("show");
}

function isLightboxOpen(){
    return lightbox && lightbox.classList.contains("show");
}

function openLightbox(src, alt){
    if(!src) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    lightbox.classList.add("show");
    lightbox.setAttribute("aria-hidden", "false");
    document.getElementById("lightboxClose").focus();
}

function closeLightbox(){
    lightbox.classList.remove("show");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImg.src = "";
    // Return focus to the drawer photo that opened it, if still present.
    const photo = document.getElementById("profilePhoto");
    if (photo) photo.focus();
}

export function initializeProfile() {

    document.body.insertAdjacentHTML("beforeend", `

<div id="profileOverlay" class="profile-overlay" aria-hidden="true">

    <div id="profileDrawer" class="profile-drawer" role="dialog" aria-modal="true" aria-labelledby="profileName" tabindex="-1">

        <button id="closeDrawer" class="drawer-close" aria-label="Close profile">✕</button>

        <div id="profileBody"></div>

    </div>

</div>

<div id="photoLightbox" class="photo-lightbox" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Member photo">
    <button id="lightboxClose" class="lightbox-close" aria-label="Close photo">✕</button>
    <img id="lightboxImg" alt="">
</div>

`);

    overlay = document.getElementById("profileOverlay");
    drawer = document.getElementById("profileDrawer");
    body = document.getElementById("profileBody");

    lightbox = document.getElementById("photoLightbox");
    lightboxImg = document.getElementById("lightboxImg");

    lightbox.addEventListener("click", e => {
        // Tap anywhere (backdrop or image) closes the lightbox.
        if (e.target === lightbox || e.target === lightboxImg || e.target.id === "lightboxClose") {
            closeLightbox();
        }
    });

    overlay.addEventListener("click", e => {
        if (e.target === overlay) closeProfile();
    });

    document.getElementById("closeDrawer").onclick = closeProfile;

    // Keyboard: Escape closes, Tab is trapped inside the open drawer.
    document.addEventListener("keydown", e => {

        // Lightbox takes precedence: Escape closes the enlarged photo, not the drawer.
        if (isLightboxOpen()) {
            if (e.key === "Escape") closeLightbox();
            return;
        }

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

    // Tap/Enter/Space on the drawer photo enlarges it in a lightbox.
    const photo = document.getElementById("profilePhoto");
    if (photo) {
        const enlarge = () => {
            const img = photo.querySelector("img");
            if (img) openLightbox(img.src, img.alt);
        };
        photo.onclick = enlarge;
        photo.onkeydown = e => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                enlarge();
            }
        };
    }

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

    const image = member.photo || `/photos/${cleanPhone(member.phone)}.webp`;
    const init = esc(initials(member.name));
    const name = esc(member.name);

    const industries = String(member.industry || "")
        .split(";")
        .map(s => s.trim())
        .filter(Boolean);

    const webUrl = getWebsiteFromMember(member) || member.website;

    const services = coalesceTags(member.services);

    return `

<div class="p-head">

    <div class="avatar" id="profilePhoto" role="button" tabindex="0" aria-label="Enlarge photo of ${name}">
        <img
            src="${esc(image)}"
            alt="${name}"
            onerror="this.onerror=null;this.parentElement.textContent='${init}';this.parentElement.removeAttribute('role');this.parentElement.removeAttribute('tabindex');"
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

${member.about && !isBareUrl(member.about) ? `
<section class="profile-section">
<h3><svg class="ico"><use href="#i-book"/></svg>About the business</h3>
<p class="profile-about">${esc(member.about).replace(/\n/g, "<br><br>")}</p>
</section>` : ""}

${listSection("i-target", "Looking for", member.lookingFor)}

${listSection("i-star", "Ideal referral", member.idealReferral)}

${listSection("i-hand", "Can help with", member.canHelp)}

${services.length ? `
<section class="profile-section">
<h3><svg class="ico"><use href="#i-wrench"/></svg>Services</h3>
<div class="service-tags">
${services.map(s => `<span>${esc(s)}</span>`).join("")}
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
