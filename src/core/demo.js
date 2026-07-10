let demoRunning = false;
let currentMember = 0;
let timer;
let scrollRaf;

export function initializeDemo(){
    const btn = document.getElementById("demoBtn");
    if (!btn) return;

    btn.onclick = () => {
        if (demoRunning) {
            stopDemo();
        } else {
            startDemo();
        }
    };
}

function startDemo(){
    demoRunning = true;
    document.getElementById("demoBtn").innerText = "■ Stop Demo";
    document.querySelector(".profile-drawer")?.classList.add("demo-fullwidth");
    playNext();
}

function playNext(){
    const cards = document.querySelectorAll(".card");
    if (cards.length === 0) return;

    if (currentMember >= cards.length) {
        currentMember = 0;
    }

    const card = cards[currentMember];
    const header = card.querySelector(".card-head");
    if (header) {
        header.click();
    } else {
        card.click();
    }

    const profileBody = document.getElementById("profileBody");
    if (profileBody) {
        profileBody.scrollTop = 0;
        scrollProfile(profileBody, 7000);
    }

    timer = setTimeout(() => {
        document.getElementById("closeDrawer")?.click();
        currentMember++;
        playNext();
    }, 8000);
}

function scrollProfile(element, duration){
    cancelAnimationFrame(scrollRaf);
    const start = element.scrollTop;
    const end = element.scrollHeight - element.clientHeight;
    if (end <= start) return;

    const startTime = performance.now();

    function step(now){
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        element.scrollTop = start + (end - start) * progress;

        if (progress < 1 && demoRunning) {
            scrollRaf = requestAnimationFrame(step);
        }
    }

    scrollRaf = requestAnimationFrame(step);
}

function stopDemo(){
    demoRunning = false;
    clearTimeout(timer);
    cancelAnimationFrame(scrollRaf);
    currentMember = 0;
    document.getElementById("demoBtn").innerText = "▶ Demo Tour";
    document.querySelector(".profile-drawer")?.classList.remove("demo-fullwidth");
}
