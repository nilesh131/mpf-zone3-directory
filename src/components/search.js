import {
    getMembers,
    setFilteredMembers
} from "../core/state.js";

import {
    renderMembers
} from "./render.js";

function contains(value, keyword) {

    if (!value) return false;

    return value
        .toString()
        .toLowerCase()
        .includes(keyword);

}

export function initializeSearch() {

    const searchInput = document.getElementById("searchInput");

    if (!searchInput) return;

    searchInput.addEventListener("input", () => {

        const keyword = searchInput.value
            .trim()
            .toLowerCase();

        if (keyword === "") {

            const members = getMembers();

            setFilteredMembers(members);

            renderMembers(members);

            return;

        }

        const filtered = getMembers().filter(member => {

            return (

                contains(member.name, keyword)

                ||

                contains(member.company, keyword)

                ||

                contains(member.industry, keyword)

                ||

                contains(member.chapter, keyword)

                ||

                contains(member.phone, keyword)


                ||

                contains(member.memberType, keyword)

            );

        });

        setFilteredMembers(filtered);

        renderMembers(filtered);

    });

}