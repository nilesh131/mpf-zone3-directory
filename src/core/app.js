import { loadMembers } from "./data.js";
import { setMembers } from "./state.js";
import { renderMembers } from "../components/render.js";
import { initializeSearch } from "../components/search.js";
import { initializeFilters } from "../components/filter.js";
import { initializeProfile } from "../components/profile.js";
import { renderDashboard } from "../components/dashboard.js";

export async function initializeApp() {

    const members = await loadMembers();

    setMembers(members);

    document.getElementById("app").innerHTML = layout();

    initializeProfile();

    renderDashboard();

    initializeFilters();

    initializeSearch();

    renderMembers(members);

}

function layout(){

return `

<header class="topbar">

    <div class="brand">

        <div class="brand-left">

            <div class="partner">
                <img
                    src="photos/MFCT.png"
                    alt="MFCT"
                >
            </div>

        </div>

        <div class="topbar-center">

            <div class="search-box">

                <input
                id="searchInput"
                type="text"
                placeholder="Search member, company or business..." />

            </div>

        </div>

    </div>

</header>

<main>

<section class="hero">

<div class="hero-content">

    <div class="hero-top">

        <div class="hero-brand">

            <div>

                <h1>MPF Zone 3</h1>

                <span>Business Referral Directory</span>
                </br></br>Browse the directory, search by anything, or match members by what they're looking for and what they can offer. 
                </br>Tap WhatsApp on any card to reach them directly.

            </div>

        </div>

    </div>


</div>

</section>

<section class="dashboard">

<div class="stat-card">

<span>👥</span>

<h3 id="memberCount">0</h3>

<p>Members</p>

<small>Business Network</small>

</div>

<div class="stat-card">

<span>🏢</span>

<h3 id="chapterCount">0</h3>

<p>Chapters</p>

<small>Active Chapters</small>

</div>

<div class="stat-card">

<span>🏭</span>

<h3 id="industryCount">0</h3>

<p>Industries</p>

<small>Business Categories</small>

</div>

</section>

<section class="filters">

<h3>

Browse Members

</h3>

<div id="filterContainer"></div>

</section>

<section
id="memberGrid"
class="member-grid">

</section>

<footer>

MPF Zone 3 Directory

<br>

Powered by MPF Zone 3

</footer>

</main>

`;

}
