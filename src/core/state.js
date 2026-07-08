let allMembers = [];
let filteredMembers = [];
let activeChapters = [];
let activeIndustries = [];
let activeMemberTypes = [];
let activeSearch = "";
let activeSavedOnly = false;
let savedMemberIds = loadSavedMemberIds();

export function setMembers(members) {
    allMembers = [...members];
    filteredMembers = [...members];
}

export function getMembers() {
    return allMembers;
}

export function getFilteredMembers() {
    return filteredMembers;
}

export function setFilteredMembers(members) {
    filteredMembers = [...members];
}

export function getSavedIds() {
    return [...savedMemberIds];
}

export function getSavedCount() {
    return savedMemberIds.length;
}

export function isSavedMember(id) {
    return savedMemberIds.includes(String(id));
}

export function toggleSavedMember(id) {
    const normalizedId = String(id);
    const index = savedMemberIds.indexOf(normalizedId);

    if (index >= 0) {
        savedMemberIds.splice(index, 1);
        persistSavedMemberIds();
        return false;
    }

    savedMemberIds.push(normalizedId);
    persistSavedMemberIds();
    return true;
}

export function getActiveChapter() {
    return activeChapters;
}

export function setActiveChapter(chapters) {
    activeChapters = Array.isArray(chapters) ? chapters : [];
}

export function toggleActiveChapter(chapter) {
    const idx = activeChapters.indexOf(chapter);
    if (idx >= 0) {
        activeChapters.splice(idx, 1);
    } else {
        activeChapters.push(chapter);
    }
}

export function getActiveIndustry() {
    return activeIndustries;
}

export function setActiveIndustry(industries) {
    activeIndustries = Array.isArray(industries) ? industries : [];
}

export function toggleActiveIndustry(industry) {
    const idx = activeIndustries.indexOf(industry);
    if (idx >= 0) {
        activeIndustries.splice(idx, 1);
    } else {
        activeIndustries.push(industry);
    }
}

export function getActiveMemberType(){
    return activeMemberTypes;
}

export function setActiveMemberType(types){
    activeMemberTypes = Array.isArray(types) ? types : [];
}

export function toggleActiveMemberType(type) {
    const idx = activeMemberTypes.indexOf(type);
    if (idx >= 0) {
        activeMemberTypes.splice(idx, 1);
    } else {
        activeMemberTypes.push(type);
    }
}

export function getActiveSearch(){
    return activeSearch;
}

export function setActiveSearch(query){
    activeSearch = query || "";
}

export function getActiveSavedOnly() {
    return activeSavedOnly;
}

export function setActiveSavedOnly(value) {
    activeSavedOnly = Boolean(value);
}

function loadSavedMemberIds() {
    if (typeof localStorage === "undefined") return [];

    try {
        const raw = localStorage.getItem("mpfSavedMembers");
        const parsed = JSON.parse(raw || "[]");
        return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
        return [];
    }
}

function persistSavedMemberIds() {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem("mpfSavedMembers", JSON.stringify(savedMemberIds));
}
