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

            <div>

                <h1>MPF Zone 3</h1>

                <span>Business Referral Directory</span>

            </div>

            <div class="partner">
            <img
                src="photos/MFCT.png"
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

        <div class="event-brand">

        <img
            src="photos/BizConnect.png"
            class="biz-logo"
            alt="BizConnect"
        >
    </div>

    <div class="partners">

        <div class="partner">

            <img
                src="photos/ReferralConnect.png"
            >

        </div>

    </div>

</header>

<main>

<section class="hero">

<div class="hero-content">

<h2>

Connect.

Refer.

Grow.

</h2>

<p>

Search members, companies and industries instantly.

</p>

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
