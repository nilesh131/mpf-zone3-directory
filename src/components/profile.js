import {
    email,
    website,
    maps
} from "./contact.js";

let overlay;
let drawer;
let body;

export function initializeProfile() {

    document.body.insertAdjacentHTML("beforeend", `

<div id="profileOverlay" class="profile-overlay">

    <div id="profileDrawer" class="profile-drawer">

        <button id="closeDrawer" class="drawer-close">

            ✕

        </button>

        <div id="profileBody"></div>

    </div>

</div>

`);

    overlay = document.getElementById("profileOverlay");
    drawer = document.getElementById("profileDrawer");
    body = document.getElementById("profileBody");

    overlay.addEventListener("click", e => {

        if (e.target === overlay)
            closeProfile();

    });

    document
        .getElementById("closeDrawer")
        .onclick = closeProfile;

}

export function openProfile(member){

    body.innerHTML = createProfile(member);

    overlay.classList.add("show");
    drawer.classList.add("show");

    bindButtons(member);

}

function closeProfile(){

    overlay.classList.remove("show");
    drawer.classList.remove("show");

}

function bindButtons(member){

    document.getElementById("btnEmail").onclick = () => {
        const mail = email(member.email);
        if (mail && mail !== "#") window.location.href = mail;
    };

    document.getElementById("btnWebsite").onclick = () => {
        const candidate = getWebsiteFromMember(member);
        const url = website(candidate || member.website || member.company);
        if (url && url !== "#") window.open(url, "_blank");
    };

    document.getElementById("btnMap").onclick = () => {
        const url = maps(member.address || member.company || member.chapter);
        if (url && url !== "#") window.open(url, "_blank");
    };

}

function createProfile(member){

    return `

<div class="profile-header">

    <img
        src="${member.photo || `/photos/${member.phone}.png` }"
        onerror="this.src='/default-avatar.png'"
        class="profile-photo"
    >

    <h2>${member.name}</h2>

    <p>${member.company || ""}</p>

</div>

<div class="profile-section">

<h3>Business Category</h3>

${member.about ? `

<section class="profile-section">

<h3>📖 About Business</h3>

<div class="profile-about">

${member.about.replace(/\n/g,"<br><br>")}

</div>

</section>

` : ""}

${member.lookingFor?.length ? `

<section class="profile-section">

<h3>🎯 Looking For</h3>

<ul class="profile-list">

${member.lookingFor
.filter(x=>x && x!=="Looking for -")
.map(item=>`<li>${item}</li>`)
.join("")}

</ul>

</section>

`:""}

${member.canHelp?.length ? `

<section class="profile-section">

<h3>🤝 I Can Help</h3>

<ul class="profile-list">

${member.canHelp
.map(item=>`<li>${item}</li>`)
.join("")}

</ul>

</section>

`:""}

${member.services?.length ? `

<section class="profile-section">

<h3>🛠 Services</h3>

<div class="service-tags">

${member.services
.map(service=>`<span>${service}</span>`)
.join("")}

</div>

</section>

`:""}



<p>${member.industry || "-"}</p>

</div>

<div class="profile-section">

<h3>Chapter</h3>

<p>${member.chapter || "-"}</p>

</div>

<div class="profile-section">

<h3>Mobile</h3>

<p>${member.phone || "-"}</p>

</div>

<div class="profile-actions">

<button id="btnEmail" class="purple">

✉ Email

</button>

<button id="btnWebsite" class="dark">

🌐 Website

</button>

<button id="btnMap" class="orange">

📍 Map

</button>

</div>

`;

}

function getWebsiteFromMember(member){

    if(!member) return null;

    if(member.website) return member.website;

    if(member.about){
        const re = /(https?:\/\/[^\s"']+)|(www\.[^\s"']+)/i;
        const m = member.about.match(re);
        if(m && m[0]){
            const url = m[0];
            if(url.toLowerCase().startsWith('www.'))
                return 'https://' + url;
            return url;
        }
    }

    return null;

}