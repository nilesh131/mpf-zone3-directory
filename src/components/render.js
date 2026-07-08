import { openProfile } from "./profile.js";
import { isSavedMember, toggleSavedMember, getActiveSavedOnly } from "../core/state.js";
import { titleCase, initials, whatsappNumber, escapeHtml, isBareUrl } from "../utils/helpers.js";

let currentMembers = [];

export function renderMembers(members) {

    currentMembers = members;

    const grid = document.getElementById("memberGrid");

    if (!grid) return;

    if (!members || members.length === 0) {

        const savedEmpty = getActiveSavedOnly();

        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <svg class="ico" style="width:40px;height:40px;color:var(--muted-2)"><use href="#${savedEmpty ? "i-star" : "i-search"}"/></svg>
                </div>
                <h2>${savedEmpty ? "No saved members yet" : "No members found"}</h2>
                <p>${savedEmpty ? "Tap the star on any card to save members here." : "Try a different search or clear the filters."}</p>
            </div>
        `;

        return;
    }

    grid.innerHTML = members
        .map(memberCard)
        .join("");

    attachEvents();

}

function memberCard(member) {

    const image = getImage(member);

    const name = member.name;

    const company = member.company || "-";

    const industries = allIndustries(member.industry);

    const chapter = member.chapter || "MPF";

    const type = member.memberType || "Other";

    // A bare URL reads as noise in the card body; the profile drawer surfaces it
    // as a proper Website button instead.
    const aboutRaw = member.about;

    const about = escapeHtml(String(aboutRaw || "").replace(/\s+/g, " ").trim());

    const init = escapeHtml(initials(member.name));

    return `

<article class="card" data-id="${member.id}">

    <div class="card-head">

        <div class="avatar">
            <img
                src="${image}"
                alt="${escapeHtml(name)}"
                loading="lazy"
                onerror="this.onerror=null;this.parentElement.textContent='${init}';"
            >
        </div>

        <div>
            <h3 class="card-name">${escapeHtml(name)}</h3>
            <p class="card-co">
                <svg class="ico"><use href="#i-building"/></svg>${escapeHtml(company)}
            </p>
        </div>

    </div>

    <div class="card-chips">
        <span class="tag ch">${escapeHtml(chapter)}</span>
        ${industries.map(i => `<span class="tag ind">${escapeHtml(i)}</span>`).join("")}
        <span class="tag type">${escapeHtml(type)}</span>
    </div>

    <button
        class="save-button${isSavedMember(member.id) ? " saved" : ""}"
        type="button"
        data-id="${member.id}"
        aria-pressed="${isSavedMember(member.id)}"
        aria-label="${isSavedMember(member.id) ? "Remove from saved" : "Save to favorites"}"
        title="${isSavedMember(member.id) ? "Remove from saved" : "Save to favorites"}"
    >
        <svg class="ico"><use href="#i-star"/></svg>
    </button>

    <p class="card-about">${about}</p>

    <div class="card-actions">

        <a
            class="btn btn-wa"
            href="https://wa.me/${whatsappNumber(member.phone)}"
            target="_blank"
            rel="noopener"
        >
            <svg class="ico"><use href="#i-chat"/></svg>WhatsApp
        </a>

        <a class="btn btn-sec" href="tel:${escapeHtml(String(member.phone || ""))}">
            <svg class="ico"><use href="#i-phone"/></svg>Call
        </a>

        <button class="btn btn-sec profileButton" data-id="${member.id}">
            <svg class="ico"><use href="#i-arrow"/></svg>Profile
        </button>

    </div>

</article>

`;

}

function attachEvents() {

    document.querySelectorAll(".save-button").forEach(button => {
        button.onclick = e => {
            e.stopPropagation();
            const saved = toggleSavedMember(button.dataset.id);
            button.classList.toggle("saved", saved);
            button.setAttribute("aria-pressed", saved ? "true" : "false");
            button.title = saved ? "Remove from saved" : "Save to favorites";
            window.dispatchEvent(new Event("favorites-changed"));
        };
    });

    document.querySelectorAll(".profileButton").forEach(button => {
        button.onclick = e => {
            e.stopPropagation();
            openById(button.dataset.id);
        };
    });

    // The photo/name area is also clickable to open the profile.
    document.querySelectorAll(".card-head").forEach(head => {
        head.onclick = () => {
            const card = head.closest(".card");
            if (card) openById(card.dataset.id);
        };
    });

}

function openById(id) {
    const member = currentMembers.find(m => String(m.id) === String(id));
    if (member) openProfile(member);
}

function cleanPhone(phone) {
    if (!phone) return "";
    return phone.toString().replace(/\D/g, "");
}

function getImage(member) {
    if (member.photo) return member.photo;
    const mobile = cleanPhone(member.phone);
    return `/photos/${mobile}.webp`;
}

function allIndustries(value) {
    if (!value) return ["Business"];
    return value.split(";").map(i => i.trim()).filter(Boolean);
}
