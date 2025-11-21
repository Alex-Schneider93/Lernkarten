/* ===== GLOBAL VARS ===== */

let data = {};
let aktLF = null;
let fragen = [];
let index = 0;
let punkte = 0;

let session = { richtig: {}, falsch: {} };

const leftSidebar = document.getElementById("sidebar-left");
const rightSidebar = document.getElementById("sidebar-right");
const overlay = document.getElementById("overlay");

/* ===== JSON LADEN ===== */

async function loadData() {
    const res = await fetch("fragen.json");
    const json = await res.json();
    data = json["Lernfälder"];
}
loadData();

/* ======================
   SIDEBAR OPEN/CLOSE
====================== */

function closeAllSidebars() {
    leftSidebar.classList.remove("show");
    rightSidebar.classList.remove("show");
    overlay.classList.add("hidden");
}

function openLeftSidebar() {
    closeAllSidebars();
    leftSidebar.classList.add("show");
    overlay.classList.remove("hidden");
}

function openRightSidebar() {
    closeAllSidebars();
    rightSidebar.classList.add("show");
    overlay.classList.remove("hidden");
}

document.getElementById("menuBtn").onclick = () => {
    document.getElementById("sidebarLeftContent").innerHTML = `
        <h2>Lernfelder</h2>
        ${Object.keys(data).map(lf =>
            `<button onclick="startLF('${lf}')">${lf}</button>`
        ).join("")}
    `;
    openLeftSidebar();
};

document.getElementById("statBtn").onclick = () => {
    document.getElementById("sidebarRightContent").innerHTML = `
        <h2>Lernstand</h2>
        ${Object.keys(data).map(lf => {
            let total = data[lf].length;
            let done = 0;

            data[lf].forEach(q => {
                let key = `${lf}|${q.frage}`;
                if (session.richtig[key]) done++;
            });

            let p = Math.round(done / total * 100);
            return `<p><strong>${lf}</strong>: ${p}%</p>`;
        }).join("")}
    `;
    openRightSidebar();
};

overlay.onclick = closeAllSidebars;

/* ======================
   QUIZ STARTEN
====================== */

function startLF(lf) {
    aktLF = lf;
    fragen = data[lf];
    index = 0;
    punkte = 0;

    closeAllSidebars();

    // Willkommen AUSBLENDEN
    document.getElementById("startScreen").classList.add("hidden");

    hideAllQuiz();
    document.getElementById("quiz").classList.remove("hidden");
    zeigeFrage();
}


/* ======================
   FRAGEN
====================== */

function zeigeFrage() {
    let f = fragen[index];

    document.getElementById("frage").innerText = f.frage;
    document.getElementById("frageCounter").innerText =
        `Frage ${index+1} / ${fragen.length}`;

    let answers = f.antworten.map((t,i)=>({text:t,orig:i}));
    answers.sort(()=>Math.random()-0.5);
    window.shuffled = answers;

    document.getElementById("antworten").innerHTML =
        answers.map((a,i)=>`
            <div class="antwort" onclick="antwort(${i})">${a.text}</div>
        `).join("");

    document.getElementById("weiterBtn").classList.add("hidden");

    renderFragenNav();
    updateProgress();
}

/* ======================
   ANTWORT
====================== */

function antwort(i){
    let f = fragen[index];
    let richtige = window.shuffled.findIndex(a=>a.orig===f.richtige_antwort);

    let key = `${aktLF}|${f.frage}`;

    if(i===richtige){
        punkte++;
        session.richtig[key] = true;
        delete session.falsch[key];
    } else {
        session.falsch[key] = true;
    }

    document.querySelectorAll(".antwort").forEach((el,idx)=>{
        el.classList.add(idx===richtige?"richtig":"falsch");
        el.onclick=null;
    });

    document.getElementById("weiterBtn").classList.remove("hidden");

    renderFragenNav();
    updateProgress();
}

/* ======================
   WEITER
====================== */

document.getElementById("weiterBtn").onclick = () => {
    index++;
    if(index>=fragen.length) return quizEnde();
    zeigeFrage();
};

/* ======================
   PROGRESS
====================== */

function updateProgress(){
    let total = fragen.length;
    let done = 0;

    fragen.forEach(q=>{
        let key=`${aktLF}|${q.frage}`;
        if(session.richtig[key]) done++;
    });

    let p = Math.round(done / total * 100);

    document.querySelector(".lf-progress-bar div").style.width = p+"%";
    document.getElementById("lfProgressText").innerText = p+"%";
}

/* ======================
   QUIZ ENDE
====================== */

function quizEnde(){
    hideAllQuiz();
    document.getElementById("quiz").classList.remove("hidden");

    document.getElementById("quiz").innerHTML = `
        <div class="quiz-card">
            <h2>Sehr gut Alex!</h2>
            <p>Du hast <strong>${punkte}</strong> von ${fragen.length} Fragen richtig.</p>
        </div>
    `;
}

/* ======================
   NAVIGATION
====================== */

function renderFragenNav(){
    let html="";

    fragen.forEach((q,i)=>{
        let key = `${aktLF}|${q.frage}`;
        let cls="";

        if(i===index) cls="active";
        else if(session.richtig[key]) cls="correct";
        else if(session.falsch[key]) cls="wrong";

        html+=`<button class="${cls}" onclick="gotoFrage(${i})">${i+1}</button>`;
    });

    document.getElementById("fragenNav").innerHTML = html;
}

function gotoFrage(i){
    index=i;
    zeigeFrage();
}

/* ======================
   HELPERS
====================== */

function hideAllQuiz(){
    document.querySelectorAll(".screen").forEach(s=>s.classList.add("hidden"));
}
function closeAllSidebars() {
    leftSidebar.classList.remove("show");
    rightSidebar.classList.remove("show");
    overlay.classList.add("hidden");

    // QUIZ aus, Willkommen wieder anzeigen
    document.getElementById("quiz").classList.add("hidden");
    document.getElementById("startScreen").classList.remove("hidden");
}
