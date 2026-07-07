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
    setActiveSearch,
    setActiveSavedOnly,
    setFilteredMembers
} from "../core/state.js";

import { renderMembers } from "./render.js";

function unique(values) {
    return [...new Set(values.filter(Boolean))].sort();
}

export function initializeFilters() {

    const container = document.getElementById("filterContainer");

    if (!container) return;

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
    const chapters = unique(Object.keys(chapterCounts));
    const industries = unique(Object.keys(industryCounts));

    container.innerHTML = `

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
        setActiveChapter("ALL");
        setActiveIndustry("ALL");
        setActiveMemberType("ALL");
        setActiveSearch("");

        const searchInput = document.getElementById("searchInput");
        if (searchInput) searchInput.value = "";

        document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));

        // activate the ALL chips
        document.querySelectorAll(".filter-chip").forEach(c => {
            if (c.dataset && c.dataset.value === "ALL") c.classList.add("active");
        });

        applyFilters();
    };

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

        if (type === "chapter") {
            setActiveChapter(text);
        } else if (type === "industry") {
            setActiveIndustry(text);
        } else if (type === "memberType") {
            setActiveMemberType(text);
        }

        applyFilters();

        // mark active only within the same section (same parent)
        Array.from(container.children).forEach(c => c.classList.remove("active"));

        chip.classList.add("active");

    };

    // set ALL as active by default
    if (text === "ALL") chip.classList.add("active");

    container.appendChild(chip);

}

// Fields the free-text search looks across.
function matchesSearch(member, keyword) {
    return [
        member.name,
        member.company,
        member.industry,
        member.chapter,
        member.phone,
        member.memberType
    ].some(value =>
        value != null &&
        value.toString().toLowerCase().includes(keyword)
    );
}

// Single filtering pipeline: chips AND free-text search are applied together,
// so neither one clobbers the other. Both the chip handlers and the search box
// funnel through here.
export function applyFilters() {

    let members = getMembers();

    const chapter = getActiveChapter();
    const industry = getActiveIndustry();
    const memberType = getActiveMemberType();
    const search = getActiveSearch().trim().toLowerCase();

    if (chapter !== "ALL") {
        members = members.filter(m => m.chapter === chapter);
    }

    if (industry !== "ALL") {
        members = members.filter(member => {

            if (!member.industry)
                return false;

            return member
                .industry
                .split(";")
                .map(i => i.trim())
                .includes(industry);

        });
    }

    if (memberType !== "ALL") {
        members = members.filter(m => (m.memberType || "Other") === memberType);
    }

    if (search) {
        members = members.filter(m => matchesSearch(m, search));
    }

    if (getActiveSavedOnly()) {
        members = members.filter(m => isSavedMember(m.id));
    }

    setFilteredMembers(members);

    renderMembers(members);

}