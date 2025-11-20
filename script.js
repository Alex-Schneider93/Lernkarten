let data = {};
let aktLF = null;
let fragen = [];
let index = 0;
let punkte = 0;

/* Session Speicher (RAM ONLY) */
let session = {
    richtig: {},
    falsch: {},
    progress: {}
};

async function loadData() {
    const res = await fetch("fragen.json");
    const json = await res.json();

    data = json["Lernfälder"];
    renderLF();
}

/* ---------------- LERNFELDER ---------------- */
function renderLF() {
    let out = "";

    Object.keys(data).forEach(lf => {
        out += `<button onclick="startLF('${lf}')">${lf}</button>`;
    });

    document.getElementById("lfContainer").innerHTML = out;
}

function startLF(lf) {
    aktLF = lf;
    fragen = data[lf];
    index = 0;
    startQuiz();
}

/* ---------------- QUIZ ---------------- */
function startQuiz() {
    hideAll();
    document.getElementById("quiz").classList.remove("hidden");
    zeigeFrage();
}

function zeigeFrage() {
    let f = fragen[index];

    document.getElementById("frage").innerText = f.frage;
    document.getElementById("frageCounter").innerText =
        `Frage ${index + 1} / ${fragen.length}`;

    updateLFProgress();

    let out = "";
    f.antworten.forEach((a, i) => {
        out += `<div class="antwort" onclick="antwort(${i})">${a}</div>`;
    });

    document.getElementById("antworten").innerHTML = out;
    renderFragenNav();

    document.getElementById("weiterBtn").classList.add("hidden");
}

function antwort(i) {
    let f = fragen[index];
    let richtige = f.richtige_antwort;
    let key = `${aktLF}|${f.frage}`;

    if (i === richtige) {
        punkte++;
        session.progress[key] = (session.progress[key] || 0) + 1;
        session.richtig[key] = true;
        delete session.falsch[key];
    } else {
        session.falsch[key] = true;
        delete session.richtig[key];
    }

    document.querySelectorAll(".antwort").forEach((el, idx) => {
        if (idx === richtige) el.classList.add("richtig");
        else el.classList.add("falsch");
        el.onclick = null;
    });

    document.getElementById("weiterBtn").classList.remove("hidden");

    renderFragenNav();
    updateLFProgress();
}

document.getElementById("weiterBtn").onclick = () => {
    index++;
    if (index >= fragen.length) return quizEnde();
    zeigeFrage();
};

/* ---------------- NAVIGATION ---------------- */
function renderFragenNav() {
    let out = "";

    for (let i = 0; i < fragen.length; i++) {
        let key = `${aktLF}|${fragen[i].frage}`;
        let cls = "";

        if (i === index) cls = "active";
        else if (session.richtig[key]) cls = "correct";
        else if (session.falsch[key]) cls = "wrong";

        out += `<button class="${cls}" onclick="gotoFrage(${i})">${i + 1}</button>`;
    }

    document.getElementById("fragenNav").innerHTML = out;
}

function gotoFrage(i) {
    index = i;
    zeigeFrage();
}

/* ---------------- FORTSCHRITT ---------------- */
function updateLFProgress() {
    let total = fragen.length;
    let done = 0;

    fragen.forEach(q => {
        let key = `${aktLF}|${q.frage}`;
        if (session.progress[key] >= 2) done++;
    });

    let proz = Math.round(done / total * 100);

    document.querySelector(".lf-progress-bar div").style.width = proz + "%";
    document.getElementById("lfProgressText").innerText = `${proz}% gelernt`;
}

/* ---------------- STATISTIK ---------------- */
document.getElementById("statBtn").onclick = () => {
    hideAll();
    renderStats();
};

function renderStats() {
    document.getElementById("statistik").classList.remove("hidden");

    let box = document.getElementById("kapitelStatList");
    box.innerHTML = "";

    Object.keys(data).forEach(lf => {
        let fragenLF = data[lf];
        let total = fragenLF.length;
        let done = 0;

        fragenLF.forEach(q => {
            let key = `${lf}|${q.frage}`;
            if (session.progress[key] >= 2) done++;
        });

        let proz = Math.round((done / total) * 100);

        box.innerHTML += `<p><strong>${lf}</strong>: ${proz}% gelernt</p>`;
    });
}

function closeStats() {
    hideAll();
    document.getElementById("quiz").classList.remove("hidden");
    renderFragenNav();
    updateLFProgress();
}



/* ---------------- HELPER ---------------- */
function hideAll() {
    document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
}

document.getElementById("menuBtn").onclick = () =>
    document.getElementById("sidebar").classList.toggle("hidden");

loadData();
