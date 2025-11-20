/* GLOBAL */
let data = {};
let aktLF = null;
let fragen = [];
let index = 0;
let punkte = 0;

let session = { richtig: {}, falsch: {}, progress: {} };

/* JSON LADEN */
async function loadData() {
    const res = await fetch("fragen.json");
    const json = await res.json();

    data = json["Lernfälder"];
    renderLF();
}

/* LERNFELDER */
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
    punkte = 0;
    startQuiz();
}

/* QUIZ START */
function startQuiz() {
    hideAll();
    document.getElementById("startScreen").classList.add("hidden");
    document.getElementById("quiz").classList.remove("hidden");
    zeigeFrage();
}

/* FRAGE ZEIGEN + SHUFFLE */
function zeigeFrage() {
    let f = fragen[index];
    document.getElementById("frage").innerText = f.frage;
    document.getElementById("frageCounter").innerText = `Frage ${index+1} / ${fragen.length}`;
    updateLFProgress();

    let answers = f.antworten.map((text, i)=>({text, originalIndex:i}));
    answers.sort(()=>Math.random()-0.5);

    window.currentShuffled = answers;

    let out = "";
    answers.forEach((a,i)=>{
        out += `<div class="antwort" onclick="antwort(${i})">${a.text}</div>`;
    });

    document.getElementById("antworten").innerHTML = out;
    renderFragenNav();
    document.getElementById("weiterBtn").classList.add("hidden");
}

/* ANTWORT PRÜFEN */
function antwort(i) {
    let f = fragen[index];

    let richtigeIndex = window.currentShuffled.findIndex(a => a.originalIndex === f.richtige_antwort);

    let key = `${aktLF}|${f.frage}`;

    if (i === richtigeIndex) {
        punkte++;
        session.progress[key] = (session.progress[key]||0)+1;
        session.richtig[key] = true;
        delete session.falsch[key];
    } else {
        session.falsch[key] = true;
        delete session.richtig[key];
    }

    document.querySelectorAll(".antwort").forEach((el,idx)=>{
        if(idx===richtigeIndex) el.classList.add("richtig");
        else el.classList.add("falsch");
        el.onclick=null;
    });

    document.getElementById("weiterBtn").classList.remove("hidden");

    renderFragenNav();
    updateLFProgress();
}

/* WEITER */
document.getElementById("weiterBtn").onclick = () => {
    index++;
    if(index>=fragen.length) return quizEnde();
    zeigeFrage();
};

/* FRAGEN-NAVIGATION */
function renderFragenNav() {
    let out="";
    for(let i=0;i<fragen.length;i++){
        let key = `${aktLF}|${fragen[i].frage}`;
        let cls="";

        if(i===index) cls="active";
        else if(session.richtig[key]) cls="correct";
        else if(session.falsch[key]) cls="wrong";

        out+=`<button class="${cls}" onclick="gotoFrage(${i})">${i+1}</button>`;
    }
    document.getElementById("fragenNav").innerHTML = out;
}

function gotoFrage(i){
    index=i;
    zeigeFrage();
}

/* PROGRESS */
function updateLFProgress(){
    let total=fragen.length, done=0;

    fragen.forEach(q=>{
        let key=`${aktLF}|${q.frage}`;
        if(session.progress[key]>=2) done++;
    });

    let proz=Math.round(done/total*100);

    document.querySelector(".lf-progress-bar div").style.width = proz+"%";
    document.getElementById("lfProgressText").innerText = `${proz}%`;
}

/* QUIZ ENDE */
function quizEnde(){
    hideAll();
    document.getElementById("quiz").classList.remove("hidden");
    document.getElementById("quiz").innerHTML = `
        <div class="quiz-card">
            <h2>Fertig Alex!</h2>
            <p>Du hast <strong>${punkte}</strong> von ${fragen.length} Fragen richtig!</p>
        </div>`;
}

/* STATISTIK */
document.getElementById("statBtn").onclick = () => {
    hideAll();
    renderStats();
};

function renderStats(){
    document.getElementById("statistik").classList.remove("hidden");

    let box=document.getElementById("kapitelStatList");
    box.innerHTML="";

    Object.keys(data).forEach(lf=>{
        let fragenLF=data[lf], total=fragenLF.length, done=0;

        fragenLF.forEach(q=>{
            let key=`${lf}|${q.frage}`;
            if(session.progress[key]>=2) done++;
        });

        let proz=Math.round(done/total*100);

        box.innerHTML+=`<p><strong>${lf}</strong>: ${proz}% gelernt</p>`;
    });
}

function closeStats(){
    hideAll();
    document.getElementById("quiz").classList.remove("hidden");
    renderFragenNav();
    updateLFProgress();
}

/* SIDEBAR FIX */
document.getElementById("menuBtn").onclick = () => {
    document.getElementById("sidebar").classList.toggle("show");
};

/* HIDE ALL SCREENS */
function hideAll(){
    document.querySelectorAll(".screen").forEach(s=>s.classList.add("hidden"));
}

/* START */
loadData();
