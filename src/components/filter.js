import {
    getMembers,
    getActiveChapter,
    getActiveIndustry,
    getActiveMemberType,
    getActiveSearch,
    getActiveSavedOnly,
    isSavedMember,
    setActiveChapter,
    setActiveIndustry,
    setActiveMemberType,
    toggleActiveChapter,
    toggleActiveIndustry,
    toggleActiveMemberType,
    setActiveSearch,
    setFilteredMembers,
    sortMembers
} from "../core/state.js";

import { renderMembers } from "./render.js";
import { memberSearchText, escapeHtml } from "../utils/helpers.js";

function unique(values) {
    return [...new Set(values.filter(Boolean))].sort();
}

// The active chip values for a given filter dimension (now returns an array).
function activeValue(type) {
    if (type === "chapter") return getActiveChapter();
    if (type === "industry") return getActiveIndustry();
    if (type === "memberType") return getActiveMemberType();
    return [];
}

function setActiveValue(type, value) {
    if (type === "chapter") setActiveChapter(value);
    else if (type === "industry") setActiveIndustry(value);
    else if (type === "memberType") setActiveMemberType(value);
}

function toggleActiveValue(type, value) {
    if (type === "chapter") toggleActiveChapter(value);
    else if (type === "industry") toggleActiveIndustry(value);
    else if (type === "memberType") toggleActiveMemberType(value);
}

export function initializeFilters() {

    const panel = document.getElementById("filterPanel");

    if (!panel) return;

    const members = getMembers();

    // counts
    const typeCounts = {};
    const chapterCounts = {};
    const industryCounts = {};

    members.forEach(m => {
        const t = m.memberType || "Other";
        typeCounts[t] = (typeCounts[t] || 0) + 1;

        const c = m.chapter || "Unspecified";
        chapterCounts[c] = (chapterCounts[c] || 0) + 1;

        if (m.industry) {
            m.industry.split(";").map(x => x.trim()).forEach(i => {
                if (!i) return;
                industryCounts[i] = (industryCounts[i] || 0) + 1;
            });
        }
    });

    const memberTypes = unique(Object.keys(typeCounts));
    const chapters = unique(Object.keys(chapterCounts)).sort((a, b) => {
        if (a === "Other") return 1;
        if (b === "Other") return -1;
        return a.localeCompare(b, undefined, { sensitivity: "base" });
    });
    const industries = unique(Object.keys(industryCounts));

    panel.innerHTML = `

<div class="filter-section">

<h4>Member Type</h4>

<div id="memberTypeFilters" class="chip-row"></div>

</div>

<div class="filter-section">

<h4>MPF Chapter</h4>

<div id="chapterFilters" class="chip-row"></div>

</div>

<div class="filter-section">

<h4>Industry</h4>

<div id="industryFilters" class="chip-row"></div>

</div>

<div class="filter-actions">
  <button id="clearFilters" class="link">Clear all filters</button>
</div>

`;

    const memberTypeContainer = document.getElementById("memberTypeFilters");
    const chapterContainer = document.getElementById("chapterFilters");
    const industryContainer = document.getElementById("industryFilters");

    // Member Type chips
    addChip(memberTypeContainer, "ALL", "memberType", members.length);
    memberTypes.forEach(t => addChip(memberTypeContainer, t, "memberType", typeCounts[t]));

    // Chapters
    addChip(chapterContainer, "ALL", "chapter", members.length);
    chapters.forEach(ch => addChip(chapterContainer, ch, "chapter", chapterCounts[ch]));

    // Industries
    addChip(industryContainer, "ALL", "industry", members.length);
    industries.forEach(i => addChip(industryContainer, i, "industry", industryCounts[i]));

    document.getElementById("clearFilters").onclick = () => {
        setActiveChapter([]);
        setActiveIndustry([]);
        setActiveMemberType([]);
        setActiveSearch("");

        const searchInput = document.getElementById("searchInput");
        if (searchInput) searchInput.value = "";

        applyFilters();
    };

    // Collapsible "Filters" bar toggle.
    const toggle = document.getElementById("filterToggle");
    const bar = document.getElementById("filterbar");
    if (toggle && bar) {
        toggle.onclick = () => {
            const open = bar.classList.toggle("open");
            panel.hidden = !open;
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        };
    }

    applyFilters();
}

function addChip(container, text, type, count) {

    const chip = document.createElement("button");

    chip.className = "filter-chip";
    chip.dataset.type = type;
    chip.dataset.value = text;

    const display = document.createElement("span");
    display.className = "chip-label";
    display.innerText = text;

    const badge = document.createElement("span");
    badge.className = "chip-count";
    badge.innerText = count != null ? String(count) : "";

    chip.appendChild(display);
    chip.appendChild(badge);

    chip.onclick = () => {
        if (text === "ALL") {
            // Clear all filters for this dimension
            setActiveValue(type, []);
        } else {
            // Toggle this specific filter
            toggleActiveValue(type, text);
        }
        applyFilters();
    };

    // Set initial active state
    if (text === "ALL" && activeValue(type).length === 0) {
        chip.classList.add("active");
    } else if (text !== "ALL" && activeValue(type).includes(text)) {
        chip.classList.add("active");
    }

    container.appendChild(chip);

}

// Reflect the current active filter values onto the chips (single source of truth
// is state, so pills and chips never drift apart).
function syncChips() {
    document.querySelectorAll(".filter-chip").forEach(chip => {
        let active = false;
        if (chip.dataset.value === "ALL") {
            // ALL is active when no other filters are selected for that dimension
            active = activeValue(chip.dataset.type).length === 0;
        } else {
            active = activeValue(chip.dataset.type).includes(chip.dataset.value);
        }
        chip.classList.toggle("active", active);
    });
}

// Update the collapsible bar: active-filter badge, removable pills, and result count.
function updateFilterChrome(shown, total) {

    const dims = [];
    
    getActiveMemberType().forEach(v => dims.push({ type: "memberType", value: v }));
    getActiveChapter().forEach(v => dims.push({ type: "chapter", value: v }));
    getActiveIndustry().forEach(v => dims.push({ type: "industry", value: v }));

    const badge = document.getElementById("filterBadge");
    if (badge) {
        badge.textContent = String(dims.length);
        badge.hidden = dims.length === 0;
    }

    const pills = document.getElementById("activePills");
    if (pills) {
        pills.innerHTML = dims.map(d =>
            `<span class="pill">${escapeHtml(d.value)}<button type="button" data-type="${d.type}" data-value="${escapeHtml(d.value)}" aria-label="Remove ${escapeHtml(d.value)} filter">✕</button></span>`
        ).join("");
        pills.querySelectorAll("button").forEach(btn => {
            btn.onclick = () => {
                toggleActiveValue(btn.dataset.type, btn.dataset.value);
                applyFilters();
            };
        });
    }

    const rc = document.getElementById("resultCount");
    if (rc) {
        rc.textContent = shown === total ? `${total} members` : `${shown} of ${total} members`;
    }

    syncChips();
}

// Free-text search across all member fields, including the referral fields
// (services / lookingFor / canHelp / idealReferral / about) — see memberSearchText.
function matchesSearch(member, keyword) {
    return memberSearchText(member).includes(keyword);
}

// Single filtering pipeline: chips AND free-text search are applied together,
// so neither one clobbers the other. Both the chip handlers and the search box
// funnel through here.
export function applyFilters() {

    const all = getMembers();
    let members = all;

    const chapters = getActiveChapter();
    const industries = getActiveIndustry();
    const memberTypes = getActiveMemberType();
    const search = getActiveSearch().trim().toLowerCase();

    if (chapters.length > 0) {
        members = members.filter(m => chapters.includes(m.chapter));
    }

    if (industries.length > 0) {
        members = members.filter(member => {

            if (!member.industry)
                return false;

            const memberIndustries = member
                .industry
                .split(";")
                .map(i => i.trim());

            return industries.some(ind => memberIndustries.includes(ind));

        });
    }

    if (memberTypes.length > 0) {
        members = members.filter(m => memberTypes.includes(m.memberType || "Other"));
    }

    if (search) {
        members = members.filter(m => matchesSearch(m, search));
    }

    if (getActiveSavedOnly()) {
        members = members.filter(m => isSavedMember(m.id));
    }

    members = sortMembers(members);
    setFilteredMembers(members);

    renderMembers(members);

    updateFilterChrome(members.length, all.length);

}
