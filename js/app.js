const app = document.getElementById("app");
const blueprint = window.PREPLAB_BLUEPRINT;
const bank = window.PREPLAB_QUESTIONS;
document.getElementById("versionBadge").textContent = "v0.9.5 Public Beta";
document.getElementById("footerVersion").textContent = "v0.9.5 Public Beta";

const I18N = {
  en: {
    dir: "ltr",
    publicBeta: "Practice beta",
    headline: "A quiet training room for Amirnet practice",
    intro: "Start a timed or untimed adaptive simulation: sentence completion, restatement, and reading comprehension. Questions stay in English; the interface is yours to choose.",
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
    noBack: "You cannot return to previous questions during the simulation, similar to the real Amirnet exam.",
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
    publicBeta: "גרסת התנסות",
    headline: "חדר אימון שקט לאמירנט",
    intro: "סימולציה אדפטיבית עם זמן או בלי זמן: השלמת משפטים, ניסוח מחדש והבנת הנקרא. השאלות באנגלית, הממשק לבחירתך.",
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
    noBack: "לא ניתן לחזור לשאלות קודמות במהלך הסימולציה, בדומה למבחן האמירנט האמיתי.",
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
  session: null,
  processedCount: 0,
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

function getRecentQuestionIds() {
  try {
    const raw = JSON.parse(localStorage.getItem("preplabRecentQuestionIds") || "[]");
    return new Set(Array.isArray(raw) ? raw.slice(-160) : []);
  } catch (e) {
    return new Set();
  }
}

function saveRecentQuestionIds(items) {
  try {
    const existing = JSON.parse(localStorage.getItem("preplabRecentQuestionIds") || "[]");
    const ids = items.flatMap(item => [item.id, item.parentPassageId].filter(Boolean));
    const merged = [...existing, ...ids];
    const deduped = [];
    for (const id of merged) {
      const idx = deduped.indexOf(id);
      if (idx !== -1) deduped.splice(idx, 1);
      deduped.push(id);
    }
    localStorage.setItem("preplabRecentQuestionIds", JSON.stringify(deduped.slice(-160)));
  } catch (e) {}
}

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
  state.session = PrepLabAdaptiveEngine.createSession(mode, blueprint, bank, getRecentQuestionIds());
  state.items = [];
  state.answers = [];
  state.index = 0;
  state.processedCount = 0;
  state.ability = blueprint.adaptive.startAbility;
  state.abilityHistory = [state.ability];
  state.startedAt = Date.now();
  const first = state.session.next(state.ability);
  if (!first) { renderHome(); return; }
  state.items.push(first);
  state.answers.push(null);
  state.secondsLeft = (mode === "full" ? blueprint.timing.fullMinutes : blueprint.timing.quickMinutes) * 60;
  if (!state.untimed) {
    state.timer = setInterval(() => {
      state.secondsLeft--;
      if (state.secondsLeft <= 0) { finishExam(); return; }
      const timerEl = document.getElementById("timerValue");
      if (timerEl) {
        timerEl.textContent = formatTime(state.secondsLeft);
        timerEl.classList.toggle("time-low", state.secondsLeft <= 300);
      }
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
  const plannedTotal = state.session ? state.session.plannedTotal : state.items.length;
  const progress = ((state.index + 1) / plannedTotal) * 100;
  const selected = state.answers[state.index];
  app.innerHTML = `
    <section class="card exam-card">
      <div class="exam-head">
        <div>${t("question")} ${state.index + 1} / ${plannedTotal}</div>
        <div id="timerValue" class="exam-timer ${!state.untimed && state.secondsLeft <= 300 ? "time-low" : ""}">${state.untimed ? t("untimedShort") : formatTime(state.secondsLeft)}</div>
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
        ${item.options.map((opt, i) => `<button class="option ${selected === i ? "selected" : ""}" onclick="choose(${i})"><span class="option-num">${i + 1}</span><span>${opt}</span></button>`).join("")}
      </div>
      <div class="nav">
        <span class="no-back-note">${t("noBack")}</span>
        <div class="actions" style="margin:0">
          <button class="secondary" onclick="skipQuestion()">${t("skip")}</button>
          ${state.index + 1 >= plannedTotal ? `<button onclick="finishExam()">${t("submit")}</button>` : `<button onclick="nextQuestion()">${t("next")}</button>`}
        </div>
      </div>
    </section>`;
}

function choose(optionIndex) { state.answers[state.index] = optionIndex; renderExam(); }
function skipQuestion() { state.answers[state.index] = null; nextQuestion(); }

// Locks the current question: ability updates exactly once per question.
function lockCurrentQuestion() {
  if (state.processedCount > state.index) return;
  const item = state.items[state.index];
  const answer = state.answers[state.index];
  const wasAnswered = answer !== null && answer !== undefined;
  const isCorrect = answer === item.answer;
  state.ability = PrepLabAdaptiveEngine.updateAbility(
    state.ability, isCorrect, wasAnswered, item, blueprint, state.processedCount
  );
  state.abilityHistory.push(state.ability);
  state.processedCount++;
}

function nextQuestion() {
  lockCurrentQuestion();
  const nextItem = state.session.next(state.ability);
  if (!nextItem) { finishExam(); return; }
  state.items.push(nextItem);
  state.answers.push(null);
  state.index++;
  renderExam();
}

function finishExam(keepScreen = false) {
  clearInterval(state.timer);
  if (state.items.length && state.processedCount <= state.index) lockCurrentQuestion();
  const plannedTotal = state.session ? state.session.plannedTotal : state.items.length;
  const result = PrepLabScoring.calculate(state.items, state.answers, state.abilityHistory, blueprint, plannedTotal);
  saveRecentQuestionIds(state.items);
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
