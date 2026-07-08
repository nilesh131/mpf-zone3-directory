import { loadMembers } from "./data.js";
import { setMembers, getActiveSavedOnly, setActiveSavedOnly } from "./state.js";
import { initializeSearch } from "../components/search.js";
import { initializeFilters, applyFilters } from "../components/filter.js";
import { initializeProfile } from "../components/profile.js";
import { renderDashboard } from "../components/dashboard.js";
import { renderSavedToggle } from "../components/saved.js";

export async function initializeApp() {

    const members = await loadMembers();

    setMembers(members);

    document.getElementById("app").innerHTML = layout();

    initializeProfile();

    renderDashboard();

    initializeFilters();

    initializeSearch();

    initializeSavedControls();

    // initializeFilters() already renders the grid via applyFilters(),
    // so no extra renderMembers() call is needed here.

}

function initializeSavedControls() {
    const button = document.getElementById("savedToggle");
    if (!button) return;

    button.onclick = () => {
        setActiveSavedOnly(!getActiveSavedOnly());
        applyFilters();
        renderSavedToggle();
    };

    window.addEventListener("favorites-changed", () => {
        renderSavedToggle();
        if (getActiveSavedOnly()) {
            applyFilters();
        }
    });

    renderSavedToggle();
}

// Inline SVG sprite — line icons referenced everywhere via <use href="#id">.
const SPRITE = `
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.6" y2="16.6"/></symbol>
  <symbol id="i-users" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.1"/><path d="M2.7 20a6.3 6.3 0 0 1 12.6 0"/><path d="M16 5.2a3.1 3.1 0 0 1 0 6"/><path d="M18.3 20a6.3 6.3 0 0 0-2.4-4.9"/></symbol>
  <symbol id="i-building" viewBox="0 0 24 24"><rect x="4" y="4" width="9.5" height="16.5" rx="1"/><path d="M13.5 9.5H20V20.5H13.5"/><path d="M7.2 8h1.6M7.2 12h1.6M7.2 16h1.6M16.4 12.5h1.4M16.4 16h1.4"/></symbol>
  <symbol id="i-layers" viewBox="0 0 24 24"><path d="M12 3 21 8l-9 5-9-5 9-5Z"/><path d="M3.4 12.5 12 17.3l8.6-4.8"/></symbol>
  <symbol id="i-phone" viewBox="0 0 24 24"><path d="M5 4h3.4l1.6 4.2-2 1.4a11.5 11.5 0 0 0 5.4 5.4l1.4-2 4.2 1.6V19a2 2 0 0 1-2.1 2A16 16 0 0 1 4 6.1 2 2 0 0 1 5 4Z"/></symbol>
  <symbol id="i-chat" viewBox="0 0 24 24"><path d="M20.5 11.5a7.6 7.6 0 0 1-10.9 6.9L4.5 20l1.1-4.9A7.6 7.6 0 1 1 20.5 11.5Z"/></symbol>
  <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M7.5 16.5 16.5 7.5"/><path d="M9 7.5h7.5V15"/></symbol>
  <symbol id="i-globe" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.3 3.6 5.3 3.6 8.5S14.4 18.2 12 20.5C9.6 18.2 8.4 15.2 8.4 12S9.6 5.8 12 3.5Z"/></symbol>
  <symbol id="i-book" viewBox="0 0 24 24"><path d="M4 5.5A2 2 0 0 1 6 3.5h13v14H6a2 2 0 0 0-2 2Z"/><path d="M4 19.5A2 2 0 0 1 6 17.5h13"/></symbol>
  <symbol id="i-target" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none"/></symbol>
  <symbol id="i-star" viewBox="0 0 24 24"><path d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8-4.2-4.1 5.9-.9z"/></symbol>
  <symbol id="i-hand" viewBox="0 0 24 24"><path d="M4 12.5 8 8.5l2.5 2 3-3 4 4"/><path d="M4 12.5v3.5a3 3 0 0 0 3 3h7l3.5-3.5"/></symbol>
  <symbol id="i-wrench" viewBox="0 0 24 24"><path d="M15 6.5a4 4 0 0 1-5.2 5.2L5 16.5 7.5 19l4.8-4.8A4 4 0 0 0 17.5 9l-2.2 2.2L12.8 8.7 15 6.5Z"/></symbol>
</svg>`;

function layout(){

return `

${SPRITE}

<header class="topbar">

    <div class="topbar-in">

        <div class="brand">
            <img class="brand-logo mpf" src="/photos/MFCT.png" alt="Mahesh Professional Forum">
            <span class="brand-sep"></span>
            <img class="brand-logo" src="/photos/BizConnect.png" alt="BizConnect">
            <span class="brand-sep"></span>
            <img class="brand-logo" src="/photos/ReferralConnect.png" alt="Referral Connect 2026">
        </div>

        <div class="search">
            <svg class="ico"><use href="#i-search"/></svg>
            <input
                id="searchInput"
                type="text"
                placeholder="Search member, company or industry…"
                autocomplete="off"
                role="combobox"
                aria-expanded="false"
                aria-controls="searchSuggest"
                aria-label="Search members" />
            <div id="searchSuggest" class="suggest" role="listbox"></div>
        </div>

        <button id="savedToggle" class="btn saved-toggle" type="button" aria-pressed="false">
            <svg class="ico"><use href="#i-star"/></svg>Saved
        </button>

    </div>

</header>

<main>

<div class="wrap">

<section class="hero">

    <span class="eyebrow">Mahesh Professional Forum</span>

    <h1 class="wordmark">Referral Connect <i>Member Directory</i></h1>

    <span class="tagline">Connect · Collaborate · Grow</span>

    <p class="hero-sub">Referral Connect brings together like-minded business professionals to build lasting relationships, exchange quality referrals, and create new business opportunities. Through meaningful networking and collaboration, we empower members to grow, learn, and succeed together.</p>

    <div class="stats">

        <div class="stat">
            <div class="stat-ic"><svg class="ico"><use href="#i-users"/></svg></div>
            <div><b class="tnum" id="memberCount">0</b><p>Members</p></div>
        </div>

        <div class="stat">
            <div class="stat-ic"><svg class="ico"><use href="#i-building"/></svg></div>
            <div><b class="tnum" id="chapterCount">0</b><p>Chapters</p></div>
        </div>

        <div class="stat">
            <div class="stat-ic accent"><svg class="ico"><use href="#i-layers"/></svg></div>
            <div><b class="tnum" id="industryCount">0</b><p>Industries</p></div>
        </div>

    </div>

</section>

<section class="filters">

    <h3>Browse members <span id="resultCount" class="result-count"></span></h3>

    <div id="filterContainer"></div>

</section>

<section id="memberGrid"></section>

</div>

</main>

<footer>
    <div class="foot-logos">
        <img src="/photos/ReferralConnect.png" alt="Referral Connect 2026">
        <img src="/photos/MPBN.png" alt="MPBN">
    </div>
    <div class="foot-text">In association with Referral Connect &nbsp;·&nbsp; A Mahesh Professional Forum initiative</div>
</footer>

`;

}
