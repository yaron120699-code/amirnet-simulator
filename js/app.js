const app = document.getElementById("app");
const blueprint = window.PREPLAB_BLUEPRINT;
const bank = window.PREPLAB_QUESTIONS;
document.getElementById("versionBadge").textContent = "v0.7.2 Hebrew Polish";
document.getElementById("footerVersion").textContent = "v0.7.2 Hebrew Polish";

const I18N = {
  en: {
    dir: "ltr",
    publicBeta: "Public beta engine",
    headline: "Adaptive Amirnet-style practice",
    intro: "A first public version that builds a test from a blueprint: sentence completion, restatement, and reading comprehension as part of the score. All content is original and the score is an estimate only.",
    startFull: "Start Full Simulation",
    quick: "Quick Simulation",
    untimed: "Untimed mode",
    blueprint: "Blueprint",
    full: "Full",
    questions: "questions",
    ability: "Ability",
    adaptive: "adaptive",
    score: "Score",
    clamped: "50–150",
    question: "Question",
    untimedShort: "Untimed",
    difficulty: "Difficulty",
    currentAbility: "Current ability",
    back: "Back",
    skip: "Skip",
    next: "Next",
    submit: "Submit",
    estimatedScore: "Estimated Amirnet Score",
    range: "Range",
    correct: "Correct",
    accuracy: "Accuracy",
    confidence: "Confidence",
    answered: "Answered",
    unanswered: "Unanswered",
    weighted: "Weighted",
    finalAbility: "Final ability",
    estimateNote: "This is an estimated practice score, not an official Amirnet score.",
    scoreExplain: "The score is based on accuracy, question difficulty, unanswered questions, and the adaptive path during the simulation.",
    byType: "By question type",
    byDifficulty: "By difficulty",
    abilityPath: "Ability path",
    review: "Review",
    yourAnswer: "Your answer",
    correctAnswer: "Correct answer",
    unansweredText: "Unanswered",
    incorrect: "Incorrect",
    backHome: "Back Home",
    language: "Language",
    he: "עברית",
    en: "English",
    sentenceCompletion: "Sentence Completion",
    restatement: "Restatement",
    reading: "Reading Comprehension"
  },
  he: {
    dir: "rtl",
    publicBeta: "גרסת בטא להתנסות",
    headline: "סימולציית אמירנט אדפטיבית",
    intro: "גרסה ראשונית שמרכיבה מבחן לפי מבנה אמירנט: השלמת משפטים, ניסוח מחדש וקטעי קריאה. כל התוכן מקורי, והציון הוא אומדן לתרגול בלבד.",
    startFull: "התחלת סימולציה מלאה",
    quick: "סימולציה קצרה",
    untimed: "ללא הגבלת זמן",
    blueprint: "מבנה סימולציה",
    full: "מלאה",
    questions: "שאלות",
    ability: "רמת יכולת",
    adaptive: "אדפטיבית",
    score: "ציון",
    clamped: "50–150",
    question: "שאלה",
    untimedShort: "ללא זמן",
    difficulty: "רמת קושי",
    currentAbility: "רמת יכולת נוכחית",
    back: "חזרה",
    skip: "דלג",
    next: "הבא",
    submit: "הגש",
    estimatedScore: "ציון אמירנט משוער",
    range: "טווח משוער",
    correct: "נכון",
    accuracy: "דיוק",
    confidence: "אמינות ההערכה",
    answered: "נענו",
    unanswered: "לא נענו",
    weighted: "דיוק משוקלל",
    finalAbility: "רמת יכולת סופית",
    estimateNote: "זהו ציון תרגול משוער בלבד, ולא ציון אמירנט רשמי.",
    scoreExplain: "הציון מחושב לפי הדיוק, רמת הקושי של השאלות, שאלות שלא נענו ומסלול ההתקדמות לאורך הסימולציה.",
    byType: "פירוט לפי סוג שאלה",
    byDifficulty: "פירוט לפי רמת קושי",
    abilityPath: "מסלול רמת היכולת",
    review: "סקירת תשובות",
    yourAnswer: "התשובה שלך",
    correctAnswer: "התשובה הנכונה",
    unansweredText: "לא נענה",
    incorrect: "לא נכון",
    backHome: "חזרה לבית",
    language: "שפה",
    he: "עברית",
    en: "English",
    sentenceCompletion: "השלמת משפטים",
    restatement: "משפטים נרדפים",
    reading: "הבנת הנקרא"
  }
};

let state = {
  mode: null,
  untimed: false,
  items: [],
  answers: [],
  index: 0,
  ability: blueprint.adaptive.startAbility,
  abilityHistory: [],
  secondsLeft: 0,
  timer: null,
  startedAt: null,
  lang: localStorage.getItem("preplabLang") || "he"
};

function t(key) { return I18N[state.lang][key] || I18N.en[key] || key; }
function setLanguage(lang) {
  state.lang = lang;
  localStorage.setItem("preplabLang", lang);
  applyLanguageChrome();
  if (state.items.length && state.startedAt && !document.querySelector(".results-card")) renderExam();
  else if (document.querySelector(".results-card")) finishExam(true);
  else renderHome();
}
window.setLanguage = setLanguage;

function applyLanguageChrome() {
  document.documentElement.lang = state.lang;
  document.documentElement.dir = t("dir");
  document.body.classList.toggle("rtl", state.lang === "he");
  const langControls = document.getElementById("langControls");
  if (langControls) {
    langControls.innerHTML = `
      <button class="lang-btn ${state.lang === "he" ? "active" : ""}" onclick="setLanguage('he')">עברית</button>
      <button class="lang-btn ${state.lang === "en" ? "active" : ""}" onclick="setLanguage('en')">English</button>`;
  }
}

function renderHome() {
  clearInterval(state.timer);
  app.innerHTML = `
    <section class="hero">
      <div class="card">
        <div class="eyebrow">${t("publicBeta")}</div>
        <h2>${t("headline")}</h2>
        <p>${t("intro")}</p>
        <div class="actions">
          <button onclick="startExam('full')">${t("startFull")}</button>
          <button class="secondary" onclick="startExam('quick')">${t("quick")}</button>
        </div>
        <label class="toggle"><input id="untimed" type="checkbox" /> ${t("untimed")}</label>
      </div>
      <div class="card">
        <div class="eyebrow">${t("blueprint")}</div>
        <div class="stats-grid mini-grid">
          <div class="stat">${t("full")}<strong>27</strong><span>${t("questions")}</span></div>
          <div class="stat">${t("quick")}<strong>17</strong><span>${t("questions")}</span></div>
          <div class="stat">${t("ability")}<strong>1–5</strong><span>${t("adaptive")}</span></div>
          <div class="stat">${t("score")}<strong>50–150</strong><span>${t("clamped")}</span></div>
        </div>
      </div>
    </section>`;
}

function startExam(mode) {
  state.mode = mode;
  state.untimed = document.getElementById("untimed")?.checked || false;
  state.items = PrepLabAdaptiveEngine.buildExam(mode, blueprint, bank);
  state.answers = Array(state.items.length).fill(null);
  state.index = 0;
  state.ability = blueprint.adaptive.startAbility;
  state.abilityHistory = [state.ability];
  state.startedAt = Date.now();
  state.secondsLeft = (mode === "full" ? blueprint.timing.fullMinutes : blueprint.timing.quickMinutes) * 60;
  if (!state.untimed) {
    state.timer = setInterval(() => {
      state.secondsLeft--;
      if (state.secondsLeft <= 0) finishExam();
      else renderExam();
    }, 1000);
  }
  renderExam();
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function labelType(type) {
  return ({sentenceCompletion:t("sentenceCompletion"), restatement:t("restatement"), reading:t("reading")})[type] || type;
}

function renderExam() {
  const item = state.items[state.index];
  const progress = ((state.index + 1) / state.items.length) * 100;
  const selected = state.answers[state.index];
  app.innerHTML = `
    <section class="card exam-card">
      <div class="exam-head">
        <div>${t("question")} ${state.index + 1} / ${state.items.length}</div>
        <div>${state.untimed ? t("untimedShort") : formatTime(state.secondsLeft)}</div>
      </div>
      <div class="progress"><span style="width:${progress}%"></span></div>
      <div class="question-meta">
        <span class="pill">${labelType(item.type)}</span>
        <span class="pill">${t("difficulty")} ${item.difficulty}/5</span>
        <span class="pill">${t("currentAbility")} ${Math.round(state.ability * 10) / 10}</span>
        ${item.passageTitle ? `<span class="pill">${item.passageTitle}</span>` : ""}
      </div>
      ${item.passage ? `<div class="passage english-content"><strong>${item.passageTitle}</strong><br><br>${item.passage}</div>` : ""}
      <div class="question-text english-content">${item.question}</div>
      <div class="options english-content">
        ${item.options.map((opt, i) => `<button class="option ${selected === i ? "selected" : ""}" onclick="choose(${i})">${i + 1}. ${opt}</button>`).join("")}
      </div>
      <div class="nav">
        <button class="secondary" onclick="prevQuestion()" ${state.index === 0 ? "disabled" : ""}>${t("back")}</button>
        <div class="actions" style="margin:0">
          <button class="secondary" onclick="skipQuestion()">${t("skip")}</button>
          ${state.index === state.items.length - 1 ? `<button onclick="finishExam()">${t("submit")}</button>` : `<button onclick="nextQuestion()">${t("next")}</button>`}
        </div>
      </div>
    </section>`;
}

function choose(optionIndex) { state.answers[state.index] = optionIndex; renderExam(); }
function skipQuestion() { state.answers[state.index] = null; nextQuestion(); }
function prevQuestion() { if (state.index > 0) { state.index--; renderExam(); } }
function nextQuestion() {
  const item = state.items[state.index];
  const answer = state.answers[state.index];
  const wasAnswered = answer !== null && answer !== undefined;
  const isCorrect = answer === item.answer;
  state.ability = PrepLabAdaptiveEngine.updateAbility(state.ability, isCorrect, wasAnswered, item, blueprint);
  state.abilityHistory.push(state.ability);
  if (state.index < state.items.length - 1) { state.index++; renderExam(); }
}

function finishExam(keepScreen = false) {
  clearInterval(state.timer);
  for (let i = state.abilityHistory.length - 1; i < state.items.length; i++) {
    const item = state.items[i];
    const ans = state.answers[i];
    state.ability = PrepLabAdaptiveEngine.updateAbility(state.ability, ans === item.answer, ans !== null && ans !== undefined, item, blueprint);
    state.abilityHistory.push(state.ability);
  }
  const result = PrepLabScoring.calculate(state.items, state.answers, state.abilityHistory, blueprint);
  renderResults(result);
}

function percent(correct, total) { return total ? Math.round((correct / total) * 100) : 0; }
function progressRow(label, correct, total) {
  const p = percent(correct, total);
  return `<div class="metric-row"><div><strong>${label}</strong><span>${correct}/${total} · ${p}%</span></div><div class="progress slim"><span style="width:${p}%"></span></div></div>`;
}
function abilityPath() {
  const points = state.abilityHistory.filter((_, i) => i % Math.ceil(state.abilityHistory.length / 8) === 0).slice(0, 8);
  if (!points.includes(state.abilityHistory[state.abilityHistory.length - 1])) points.push(state.abilityHistory[state.abilityHistory.length - 1]);
  return points.map(v => `<span>${Math.round(v * 10) / 10}</span>`).join(`<b>→</b>`);
}

function renderResults(result) {
  const byType = state.items.reduce((acc, item, i) => {
    acc[item.type] ||= {total:0, correct:0};
    acc[item.type].total++;
    if (state.answers[i] === item.answer) acc[item.type].correct++;
    return acc;
  }, {});
  const byDifficulty = state.items.reduce((acc, item, i) => {
    acc[item.difficulty] ||= {total:0, correct:0};
    acc[item.difficulty].total++;
    if (state.answers[i] === item.answer) acc[item.difficulty].correct++;
    return acc;
  }, {});

  app.innerHTML = `
    <section class="card results-card">
      <div class="eyebrow">${t("estimatedScore")}</div>
      <h2 class="score-number">${result.score}</h2>
      <div class="stats-grid">
        <div class="stat">${t("range")}<strong>${result.low}–${result.high}</strong></div>
        <div class="stat">${t("correct")}<strong>${result.correct}/${result.total}</strong></div>
        <div class="stat">${t("accuracy")}<strong>${result.accuracy}%</strong></div>
        <div class="stat">${t("confidence")}<strong>${result.confidence}</strong></div>
      </div>
      <div class="stats-grid">
        <div class="stat">${t("answered")}<strong>${result.answered}</strong></div>
        <div class="stat">${t("unanswered")}<strong>${result.unanswered}</strong></div>
        <div class="stat">${t("weighted")}<strong>${result.weightedAccuracy || 0}%</strong></div>
        <div class="stat">${t("finalAbility")}<strong>${result.finalAbility || 0}</strong></div>
      </div>
      <p class="muted-note">${t("estimateNote")}</p>
      <p class="muted-note">${t("scoreExplain")}</p>
      <h3>${t("byType")}</h3>
      <div class="review metric-list">
        ${Object.entries(byType).map(([type, data]) => progressRow(labelType(type), data.correct, data.total)).join("")}
      </div>
      <h3>${t("byDifficulty")}</h3>
      <div class="review metric-list">
        ${Object.entries(byDifficulty).sort(([a],[b]) => Number(a) - Number(b)).map(([diff, data]) => progressRow(`${t("difficulty")} ${diff}`, data.correct, data.total)).join("")}
      </div>
      <h3>${t("abilityPath")}</h3>
      <div class="ability-path">${abilityPath()}</div>
      <h3>${t("review")}</h3>
      <div class="review">
        ${state.items.map((item, i) => {
          const user = state.answers[i];
          const ok = user === item.answer;
          return `<div class="review-item">
            <div><strong>Q${i+1} · ${labelType(item.type)} · ${t("difficulty")} ${item.difficulty}</strong> <span class="${ok ? 'good' : 'bad'}">${ok ? t("correct") : t("incorrect")}</span></div>
            <div class="english-content review-question">${item.question}</div>
            <div style="color:var(--muted);margin-top:6px">${t("yourAnswer")}: ${user === null || user === undefined ? t("unansweredText") : item.options[user]}</div>
            <div style="color:var(--muted)">${t("correctAnswer")}: ${item.options[item.answer]}</div>
            <div style="margin-top:6px">${item.explanation}</div>
          </div>`;
        }).join("")}
      </div>
      <div class="actions"><button onclick="renderHome()">${t("backHome")}</button></div>
    </section>`;
}

applyLanguageChrome();
renderHome();
