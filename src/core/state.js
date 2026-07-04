let allMembers = [];
let filteredMembers = [];
let activeChapter = "ALL";
let activeIndustry = "ALL";
let activeMemberType = "ALL";

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