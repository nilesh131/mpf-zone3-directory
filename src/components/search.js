import { getMembers, setActiveSearch } from "../core/state.js";
import { applyFilters } from "./filter.js";
import { openProfile } from "./profile.js";
import { titleCase, initials, escapeHtml } from "../utils/helpers.js";

const MAX_SUGGESTIONS = 7;

let input;
let box;
let matches = [];
let active = -1;

function matchMember(m, q){
    return [m.name, m.company, m.industry, m.chapter, m.memberType]
        .some(v => v != null && v.toString().toLowerCase().includes(q));
}

function firstIndustry(value){
    return value ? value.split(";")[0].trim() : "";
}

function renderSuggestions(q){

    if(!q){ closeSuggest(); return; }

    matches = getMembers().filter(m => matchMember(m, q)).slice(0, MAX_SUGGESTIONS);
    active = -1;

    if(!matches.length){
        box.innerHTML = `<div class="suggest-empty">No matches for “${escapeHtml(q)}”</div>`;
    } else {
        box.innerHTML = matches.map((m, i) => {
            const sub = [m.company, firstIndustry(m.industry)].filter(Boolean).join(" · ");
            return `
<div class="suggest-item" role="option" data-i="${i}">
    <div class="suggest-av">${escapeHtml(initials(m.name))}</div>
    <div class="suggest-meta">
        <div class="suggest-name">${escapeHtml(titleCase(m.name))}</div>
        <div class="suggest-sub">${escapeHtml(sub)}</div>
    </div>
    <span class="suggest-ch">${escapeHtml(m.chapter || "MPF")}</span>
</div>`;
        }).join("");

        box.querySelectorAll(".suggest-item").forEach(el => {
            // mousedown (not click) so it fires before the input's blur closes the box
            el.addEventListener("mousedown", e => { e.preventDefault(); pick(Number(el.dataset.i)); });
            el.addEventListener("mouseenter", () => setActive(Number(el.dataset.i)));
        });
    }

    box.classList.add("open");
    input.setAttribute("aria-expanded", "true");
}

function setActive(i){
    active = i;
    box.querySelectorAll(".suggest-item").forEach((el, idx) => el.classList.toggle("active", idx === i));
}

function pick(i){
    const member = matches[i];
    if(!member) return;
    closeSuggest();
    openProfile(member);
}

function closeSuggest(){
    if(!box) return;
    box.classList.remove("open");
    box.innerHTML = "";
    active = -1;
    if(input) input.setAttribute("aria-expanded", "false");
}

export function initializeSearch() {

    input = document.getElementById("searchInput");
    box = document.getElementById("searchSuggest");

    if (!input) return;

    let debounce;

    input.addEventListener("input", () => {

        const q = input.value.trim().toLowerCase();

        // Grid filtering stays (debounced) so the chips + full results still work.
        clearTimeout(debounce);
        debounce = setTimeout(() => {
            setActiveSearch(q);
            applyFilters();
        }, 120);

        // Instant autocomplete suggestions.
        if (box) renderSuggestions(q);

    });

    input.addEventListener("keydown", e => {

        if (!box || !box.classList.contains("open")) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive(Math.min(active + 1, matches.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive(Math.max(active - 1, 0));
        } else if (e.key === "Enter") {
            if (active >= 0) { e.preventDefault(); pick(active); }
            else closeSuggest();
        } else if (e.key === "Escape") {
            closeSuggest();
        }

    });

    // Close on blur (delayed so a suggestion click registers first).
    input.addEventListener("blur", () => setTimeout(closeSuggest, 120));

    // Re-open suggestions when refocusing a non-empty box.
    input.addEventListener("focus", () => {
        const q = input.value.trim().toLowerCase();
        if (q) renderSuggestions(q);
    });

}
