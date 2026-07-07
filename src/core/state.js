let allMembers = [];
let filteredMembers = [];
let activeChapter = "ALL";
let activeIndustry = "ALL";
let activeMemberType = "ALL";
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
    return activeChapter;
}

export function setActiveChapter(chapter) {
    activeChapter = chapter;
}

export function getActiveIndustry() {
    return activeIndustry;
}

export function setActiveIndustry(industry) {
    activeIndustry = industry;
}

export function getActiveMemberType(){
    return activeMemberType;
}

export function setActiveMemberType(type){
    activeMemberType = type;
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
