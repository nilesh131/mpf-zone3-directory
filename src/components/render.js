import { openProfile } from "./profile.js";

let currentMembers = [];

export function renderMembers(members) {

    currentMembers = members;

    const grid = document.getElementById("memberGrid");

    if (!grid) return;

    if (!members || members.length === 0) {

        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <h2>No Members Found</h2>
                <p>Try changing your search or filters.</p>
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

    const chapter = member.chapter || "MPF";

    const company = member.company || "-";

    const industry = firstIndustry(member.industry);

    return `

<div class="member-card">

    <div class="member-banner">

        <div class="banner-pattern"></div>

    </div>

    <div class="member-avatar">

        <img
            src="${image}"
            loading="lazy"
            alt="${member.name}"
            onerror="this.onerror=null;this.src='/default-avatar.png';"
        >

    </div>

    <div class="member-content">

        <h2 class="member-name">

            ${member.name}

        </h2>

        <p class="member-company">

            🏢 ${company}

        </p>

        <div class="member-tags">

            <span class="tag chapter">

                ${chapter}

            </span>

            <span class="tag industry">

                ${industry}

            </span>

        </div>

        <div class="member-actions">

            <a
                class="btn whatsapp"
                href="https://wa.me/${cleanPhone(member.phone)}"
                target="_blank"
            >

            <span>💬</span>
            <span>WhatsApp</span>

            </a>

            <a
                class="btn call"
                href="tel:${member.phone}"
            >

            <span>📞</span>
            <span>Call</span>

            </a>

        </div>

        <button
            class="profileButton"
            data-id="${member.id}"
        >

        <span>👤</span>
        <span>View Profile</span>

        </button>

    </div>

</div>

`;

}

function attachEvents() {

    document
        .querySelectorAll(".profileButton")
        .forEach(button => {

            button.onclick = () => {

                const member = currentMembers.find(
                    m => String(m.id) === button.dataset.id
                );

                if (member)
                    openProfile(member);

            };

        });

}

function cleanPhone(phone) {

    if (!phone)
        return "";

    return phone
        .toString()
        .replace(/\D/g, "");

}

function getImage(member){

    if(member.photo)
        return member.photo;

    const mobile = cleanPhone(member.phone);

    return `/photos/${mobile}.png`;

}

function firstIndustry(value) {

    if (!value)
        return "Business";

    return value
        .split(";")[0]
        .trim();

}