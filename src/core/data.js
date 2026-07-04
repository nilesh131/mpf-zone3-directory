let members = [];

export async function loadMembers() {

    try {

        const response = await fetch("/members.json");

        if (!response.ok) {

            throw new Error("Unable to load members.json");

        }

        members = await response.json();

        console.log("Members Loaded :", members.length);

        return members;

    } catch (error) {

        console.error(error);

        return [];

    }

}

export function getMembers() {

    return members;

}

export function getStatistics() {

    const chapters = new Set();

    const industries = new Set();

    const cities = new Set();

    members.forEach(member => {

        if (member.chapter)
            chapters.add(member.chapter);

        if (member.industry)
            industries.add(member.industry);

        if (member.city)
            cities.add(member.city);

    });

    return {

        members: members.length,

        chapters: chapters.size,

        industries: industries.size,

        cities: cities.size

    };

}

export function getChapters() {

    const chapters = new Set();

    members.forEach(member => {

        if (member.chapter)
            chapters.add(member.chapter);

    });

    return Array.from(chapters).sort();

}

export function getIndustries() {

    const industries = new Set();

    members.forEach(member => {

        if (member.industry)
            industries.add(member.industry);

    });

    return Array.from(industries).sort();

}