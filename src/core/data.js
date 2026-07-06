// Loads the member dataset. State (current/filtered members, active filters)
// lives in core/state.js — this module is only responsible for fetching.
export async function loadMembers() {

    try {

        const response = await fetch("/members.json");

        if (!response.ok) {

            throw new Error("Unable to load members.json");

        }

        const members = await response.json();

        console.log("Members Loaded :", members.length);

        return members;

    } catch (error) {

        console.error(error);

        return [];

    }

}
