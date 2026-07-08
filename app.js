const app = document.getElementById("app");
const blueprint = window.PREPLAB_BLUEPRINT;
const bank = window.PREPLAB_QUESTIONS;
document.getElementById("versionBadge").textContent = "v1.1.1 Adaptive Calibration & Time Analytics";
document.getElementById("footerVersion").textContent = "v1.1.1 Adaptive Calibration & Time Analytics";

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
    placement: "Estimated English Level",
    nextGoal: "Next goal",
    pointsLeft: "points remaining",
    exemptionReached: "Exemption reached",
    officialDisclaimer: "This is an estimated English level based on your simulation performance. Official placement is determined only by the official Amirnet exam.",
    question: "Question",
    untimedShort: "Untimed",
    difficulty: "Difficulty",
    currentAbility: "Current ability",
    back: "Back",
    noBack: "You cannot return to previous questions during the simulation, similar to the real Amirnet exam.",
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
    reading: "Reading Comprehension",
    timeAnalysis: "Time Management",
    totalTime: "Total Time",
    avgTimePerQuestion: "Average Time",
    avgReadingTime: "Reading",
    avgSentenceTime: "Sentence Completion",
    avgRestatementTime: "Restatement",
    fastestQuestion: "Fastest Question",
    slowestQuestion: "Slowest Question",
    untimedTotal: "Untimed",
    continueLearning: "Continue learning",
    lastScore: "Last score",
    lastLevel: "Estimated level",
    practiceAgain: "Practice again",
    modules: "Modules",
    amirnetModule: "Amirnet",
    amirnetModuleDesc: "Adaptive practice for the Amirnet English exam.",
    comingSoon: "Coming soon",
    mathModule: "Mathematics",
    physicsModule: "Physics",
    statisticsModule: "Statistics",
    futureModuleDesc: "Not yet available.",
    tabOverview: "Overview",
    tabBreakdown: "Breakdown",
    tabReview: "Full review",
    practiceAgainNote: "Practice again to update this score."
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
    placement: "רמת אנגלית משוערת",
    nextGoal: "היעד הבא",
    pointsLeft: "נקודות חסרות",
    exemptionReached: "הגעת לפטור",
    officialDisclaimer: "זוהי רמת אנגלית משוערת על בסיס הביצועים שלך בסימולציה. השיבוץ הרשמי נקבע רק במבחן אמירנט הרשמי.",
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
    reading: "הבנת הנקרא",
    timeAnalysis: "ניהול זמן",
    totalTime: "זמן כולל",
    avgTimePerQuestion: "זמן ממוצע לשאלה",
    avgReadingTime: "הבנת הנקרא",
    avgSentenceTime: "השלמת משפטים",
    avgRestatementTime: "משפטים נרדפים",
    fastestQuestion: "השאלה המהירה ביותר",
    slowestQuestion: "השאלה האיטית ביותר",
    untimedTotal: "ללא הגבלת זמן",
    continueLearning: "המשך מהנקודה שבה עצרת",
    lastScore: "ציון אחרון",
    lastLevel: "רמה משוערת",
    practiceAgain: "תרגול נוסף",
    modules: "מודולים",
    amirnetModule: "אמירנט",
    amirnetModuleDesc: "תרגול אדפטיבי למבחן האמירנט באנגלית.",
    comingSoon: "בקרוב",
    mathModule: "מתמטיקה",
    physicsModule: "פיזיקה",
    statisticsModule: "סטטיסטיקה",
    futureModuleDesc: "עדיין לא זמין.",
    tabOverview: "סקירה כללית",
    tabBreakdown: "פירוט",
    tabReview: "סקירת שאלות",
    practiceAgainNote: "תרגלו שוב כדי לעדכן את הציון."
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
  debugMode: new URLSearchParams(window.location.search).has("debug") || localStorage.getItem("preplabDebug") === "true",
  abilityHistory: [],
  secondsLeft: 0,
  timer: null,
  startedAt: null,
  finishedAt: null,
  // Time analytics: one timer for the whole exam (never per-question).
  // Per-question time is derived by diffing timestamps, not by running
  // a separate countdown per item.
  times: [],
  questionStartedAt: null,
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

function rememberSelectedItem(item) {
  // Persist each selected question immediately, not only at submit.
  // This prevents repeated starts from showing the same opening items.
  if (!item) return;
  saveRecentQuestionIds([item]);
}

function initialAbility() {
  const cfg = blueprint.adaptive || {};
  const jitter = cfg.startJitter ?? 0;
  const base = cfg.startAbility ?? 3;
  const raw = base + (Math.random() * 2 - 1) * jitter;
  return Math.max(cfg.minAbility ?? 1, Math.min(cfg.maxAbility ?? 5, raw));
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

function timeAgo(iso) {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.round(ms / 60000);
  if (mins < 60) return state.lang === "he" ? `לפני ${mins} דקות` : `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return state.lang === "he" ? `לפני ${hours} שעות` : `${hours}h ago`;
  const days = Math.round(hours / 24);
  return state.lang === "he" ? `לפני ${days} ימים` : `${days}d ago`;
}

function continueLearningBlock() {
  if (!window.PrepLabTelemetry) return "";
  const last = PrepLabTelemetry.lastSimulations(1)[0];
  if (!last) return "";
  const placement = window.PrepLabPlacement ? PrepLabPlacement.classify(last.score, state.lang, last.confidence) : null;
  return `
    <div class="continue-card">
      <div>
        <div class="eyebrow">${t("continueLearning")}</div>
        <div class="stat-line">
          <span>${t("lastScore")}: <strong>${last.score}</strong></span>
          ${placement ? `<span>${t("lastLevel")}: <strong>${placement.levelLabel}</strong></span>` : ""}
          <span>${timeAgo(last.at)}</span>
        </div>
      </div>
      <button class="secondary" onclick="startExam('quick')">${t("practiceAgain")}</button>
    </div>`;
}

function moduleGrid() {
  return `
    <div class="module-grid">
      <div class="module-card live" onclick="startExam('full')">
        <span class="badge badge-new">${t("amirnetModule")}</span>
        <div class="module-desc">${t("amirnetModuleDesc")}</div>
      </div>
      <div class="module-card disabled">
        <span class="badge badge-soon">${t("comingSoon")}</span>
        <div class="module-title">${t("mathModule")}</div>
        <div class="module-desc">${t("futureModuleDesc")}</div>
      </div>
      <div class="module-card disabled">
        <span class="badge badge-soon">${t("comingSoon")}</span>
        <div class="module-title">${t("physicsModule")}</div>
        <div class="module-desc">${t("futureModuleDesc")}</div>
      </div>
      <div class="module-card disabled">
        <span class="badge badge-soon">${t("comingSoon")}</span>
        <div class="module-title">${t("statisticsModule")}</div>
        <div class="module-desc">${t("futureModuleDesc")}</div>
      </div>
    </div>`;
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
    </section>
    ${continueLearningBlock()}
    <section>
      <div class="section-head"><h3>${t("modules")}</h3></div>
      ${moduleGrid()}
    </section>`;
}

function startExam(mode) {
  state.mode = mode;
  state.untimed = document.getElementById("untimed")?.checked || false;
  state.session = PrepLabAdaptiveEngine.createSession(mode, blueprint, bank, getRecentQuestionIds());
  state.items = [];
  state.answers = [];
  state.times = [];
  state.index = 0;
  state.processedCount = 0;
  state.ability = initialAbility();
  state.abilityHistory = [state.ability];
  state.startedAt = Date.now();
  state.finishedAt = null;
  const first = state.session.next(state.ability);
  if (!first) { renderHome(); return; }
  state.items.push(first);
  rememberSelectedItem(first);
  state.answers.push(null);
  state.questionStartedAt = Date.now();
  state.secondsLeft = (mode === "full" ? blueprint.timing.fullMinutes : blueprint.timing.quickMinutes) * 60;
  // One tick for the whole exam — used for the single 50-minute countdown
  // (real Amirnet exams have no per-question timer) and, when debug mode
  // is on, to refresh the live "time on current question" readout.
  state.timer = setInterval(() => {
    if (!state.untimed) {
      state.secondsLeft--;
      if (state.secondsLeft <= 0) { finishExam(); return; }
      const timerEl = document.getElementById("timerValue");
      if (timerEl) {
        timerEl.textContent = formatTime(state.secondsLeft);
        timerEl.classList.toggle("time-low", state.secondsLeft <= 300);
      }
    }
    if (state.debugMode) updateDebugTimeReadout();
  }, 1000);
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

// Live-updating debug readouts (time on question, running average) —
// refreshed by the single exam tick, not by a timer of their own.
function averageTimeSoFarMs() {
  const done = state.times.slice(0, state.processedCount).filter(t => t != null);
  if (!done.length) return 0;
  return Math.round(done.reduce((s, t) => s + t, 0) / done.length);
}

function updateDebugTimeReadout() {
  const onQuestionEl = document.getElementById("debugTimeOnQuestion");
  if (onQuestionEl && state.questionStartedAt) {
    onQuestionEl.textContent = formatTime(Math.floor((Date.now() - state.questionStartedAt) / 1000));
  }
  const avgEl = document.getElementById("debugAvgTime");
  if (avgEl) avgEl.textContent = formatTime(Math.floor(averageTimeSoFarMs() / 1000));
}

function renderDebugPanel(item) {
  if (!state.debugMode || !item?._debug) return "";
  const d = item._debug;
  return `<details class="debug-panel english-content" open>
    <summary>Developer Debug</summary>
    <div class="debug-grid">
      <span>Question ID</span><strong>${item.id}</strong>
      <span>Type</span><strong>${item.type}</strong>
      <span>Current Ability</span><strong>${Math.round(state.ability * 100) / 100}</strong>
      <span>Question Difficulty</span><strong>${item.difficulty}</strong>
      <span>Target Difficulty</span><strong>${d.targetDifficulty ?? "—"}</strong>
      <span>Candidate Pool</span><strong>${d.candidatePoolSize ?? "—"}/${d.totalUnusedPoolSize ?? "—"}</strong>
      <span>Freshness</span><strong>${d.freshnessMode ?? "—"}</strong>
      <span>Selection Reason</span><strong>${d.selectionReason ?? "—"}</strong>
      <span>Ability Before</span><strong>${d.abilityBeforeAnswer ?? d.abilityBeforeSelection ?? "—"}</strong>
      <span>Ability After</span><strong>${d.abilityAfterAnswer ?? "—"}</strong>
      <span>Time On Current Question</span><strong id="debugTimeOnQuestion">0:00</strong>
      <span>Average Time</span><strong id="debugAvgTime">${formatTime(Math.floor(averageTimeSoFarMs() / 1000))}</strong>
      <span>Decision Log</span><strong>${d.decisionLog ?? "—"}</strong>
    </div>
  </details>`;
}

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

function examRail(item) {
  return `
    <div class="exam-rail english-content">
      <div class="rail-stat"><span>${labelType(item.type)}</span><strong>${t("difficulty")} ${item.difficulty}/5</strong></div>
      <div class="rail-stat"><span>${t("currentAbility")}</span><strong>${Math.round(state.ability * 10) / 10}</strong></div>
      ${item.passageTitle ? `<div class="rail-stat"><span>${t("reading")}</span><strong>${item.passageTitle}</strong></div>` : ""}
    </div>`;
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
      <div class="exam-grid">
        <div class="exam-main">
          ${item.passage ? `<div class="passage english-content"><strong>${item.passageTitle}</strong><br><br>${item.passage}</div>` : ""}
          <div class="question-text english-content">${item.question}</div>
          <div class="options english-content">
            ${item.options.map((opt, i) => `<button class="option ${selected === i ? "selected" : ""}" onclick="choose(${i})"><span class="option-letter">${OPTION_LETTERS[i] || i + 1}</span><span>${opt}</span></button>`).join("")}
          </div>
          ${renderDebugPanel(item)}
          <div class="nav">
            <span class="no-back-note">${t("noBack")}</span>
            <div class="actions" style="margin:0">
              <button class="secondary" onclick="skipQuestion()">${t("skip")}</button>
              ${state.index + 1 >= plannedTotal ? `<button onclick="finishExam()">${t("submit")}</button>` : `<button onclick="nextQuestion()">${t("next")}</button>`}
            </div>
          </div>
        </div>
        ${examRail(item)}
      </div>
    </section>`;
}

function choose(optionIndex) { state.answers[state.index] = optionIndex; renderExam(); }
function skipQuestion() { state.answers[state.index] = null; nextQuestion(); }

// Locks the current question: ability updates exactly once per question.
// Time spent is measured once here too, by diffing timestamps —
// there is still only one exam-level timer, never one per question.
function lockCurrentQuestion() {
  if (state.processedCount > state.index) return;
  const item = state.items[state.index];
  const answer = state.answers[state.index];
  const wasAnswered = answer !== null && answer !== undefined;
  const isCorrect = answer === item.answer;
  const before = state.ability;
  state.ability = PrepLabAdaptiveEngine.updateAbility(
    state.ability, isCorrect, wasAnswered, item, blueprint, state.processedCount
  );
  const timeSpentMs = state.questionStartedAt ? Math.max(0, Date.now() - state.questionStartedAt) : 0;
  state.times[state.index] = timeSpentMs;
  item._debug = {
    ...(item._debug || {}),
    abilityBeforeAnswer: Math.round(before * 100) / 100,
    abilityAfterAnswer: Math.round(state.ability * 100) / 100,
    wasAnswered,
    isCorrect,
    timeSpentMs
  };
  state.abilityHistory.push(state.ability);
  state.processedCount++;
}

function nextQuestion() {
  lockCurrentQuestion();
  const nextItem = state.session.next(state.ability);
  if (!nextItem) { finishExam(); return; }
  state.items.push(nextItem);
  rememberSelectedItem(nextItem);
  state.answers.push(null);
  state.questionStartedAt = Date.now();
  state.index++;
  renderExam();
}

function finishExam(keepScreen = false) {
  clearInterval(state.timer);
  if (state.items.length && state.processedCount <= state.index) lockCurrentQuestion();
  state.finishedAt = Date.now();
  const plannedTotal = state.session ? state.session.plannedTotal : state.items.length;
  const result = PrepLabScoring.calculate(state.items, state.answers, state.abilityHistory, blueprint, plannedTotal);
  saveRecentQuestionIds(state.items);
  try {
    // Fail-silent: telemetry must never break the exam flow.
    if (window.PrepLabTelemetry) {
      PrepLabTelemetry.recordSimulation({
        items: state.items,
        answers: state.answers,
        abilityHistory: state.abilityHistory,
        result,
        mode: state.mode,
        times: state.times
      });
    }
  } catch (e) {}
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

// One exam-level clock (start → finish), diffed against per-question
// timestamps recorded while answering. No timer is created per question.
function computeTimeAnalysis() {
  const times = state.times.filter(t => t != null);
  if (!times.length) return null;

  const totalMs = state.finishedAt && state.startedAt ? state.finishedAt - state.startedAt : times.reduce((s, t) => s + t, 0);
  const avgMs = Math.round(times.reduce((s, t) => s + t, 0) / times.length);

  const byType = {};
  state.items.forEach((item, i) => {
    const ms = state.times[i];
    if (ms == null) return;
    (byType[item.type] ||= []).push(ms);
  });
  const avgByType = (type) => {
    const list = byType[type];
    if (!list || !list.length) return null;
    return Math.round(list.reduce((s, t) => s + t, 0) / list.length);
  };

  let fastestIndex = -1, slowestIndex = -1;
  state.items.forEach((item, i) => {
    const ms = state.times[i];
    if (ms == null) return;
    if (fastestIndex === -1 || ms < state.times[fastestIndex]) fastestIndex = i;
    if (slowestIndex === -1 || ms > state.times[slowestIndex]) slowestIndex = i;
  });

  const allottedSeconds = (state.mode === "full" ? blueprint.timing.fullMinutes : blueprint.timing.quickMinutes) * 60;

  return {
    totalMs,
    avgMs,
    avgReadingMs: avgByType("reading"),
    avgSentenceMs: avgByType("sentenceCompletion"),
    avgRestatementMs: avgByType("restatement"),
    fastestIndex,
    slowestIndex,
    allottedSeconds
  };
}

function timeAnalysisBlock() {
  const t1 = computeTimeAnalysis();
  if (!t1) return "";
  const secs = (ms) => Math.floor(ms / 1000);
  const totalLine = state.untimed
    ? `${formatTime(secs(t1.totalMs))} (${t("untimedTotal")})`
    : `${formatTime(secs(t1.totalMs))} / ${formatTime(t1.allottedSeconds)}`;
  const rows = [
    [t("avgTimePerQuestion"), formatTime(secs(t1.avgMs))],
    t1.avgReadingMs != null ? [t("avgReadingTime"), formatTime(secs(t1.avgReadingMs))] : null,
    t1.avgSentenceMs != null ? [t("avgSentenceTime"), formatTime(secs(t1.avgSentenceMs))] : null,
    t1.avgRestatementMs != null ? [t("avgRestatementTime"), formatTime(secs(t1.avgRestatementMs))] : null,
    t1.fastestIndex !== -1 ? [t("fastestQuestion"), `Q${t1.fastestIndex + 1} · ${formatTime(secs(state.times[t1.fastestIndex]))}`] : null,
    t1.slowestIndex !== -1 ? [t("slowestQuestion"), `Q${t1.slowestIndex + 1} · ${formatTime(secs(state.times[t1.slowestIndex]))}`] : null
  ].filter(Boolean);

  return `
    <h3>${t("timeAnalysis")}</h3>
    <div class="review metric-list">
      <div class="metric-row"><div><strong>${t("totalTime")}</strong><span>${totalLine}</span></div></div>
      ${rows.map(([label, value]) => `<div class="metric-row"><div><strong>${label}</strong><span>${value}</span></div></div>`).join("")}
    </div>`;
}


function placementBlock(result) {
  if (!window.PrepLabPlacement) return "";
  const placement = PrepLabPlacement.classify(result.score, state.lang, result.confidence);
  const pos = Math.max(0, Math.min(100, placement.progress));
  const goalPos = Math.max(0, Math.min(100, ((placement.exemptionScore - 50) / 100) * 100));
  const goalText = placement.pointsToExemption > 0
    ? `${placement.exemptionLabel} (${placement.exemptionScore})`
    : t("exemptionReached");
  const distanceText = placement.pointsToExemption > 0
    ? `${placement.pointsToExemption} ${t("pointsLeft")}`
    : t("exemptionReached");
  return `
    <div class="placement-card">
      <div class="placement-main">
        <div>
          <div class="eyebrow">${t("placement")}</div>
          <h3 class="placement-title">${placement.levelLabel}</h3>
          <p class="muted-note"><strong>${t("nextGoal")}:</strong> ${goalText} · <strong>${distanceText}</strong></p>
        </div>
        <div class="placement-target">
          <span>${t("confidence")}</span>
          <strong>${result.confidence}</strong>
        </div>
      </div>
      <div class="score-scale" aria-label="50 to 150 score scale">
        <span class="scale-end">50</span>
        <div class="scale-track">
          <span class="scale-goal" style="left:${goalPos}%"></span>
          <span class="scale-dot" style="left:${pos}%"></span>
        </div>
        <span class="scale-end">150</span>
      </div>
      <p class="muted-note small-note">${placement.message}</p>
      <p class="muted-note small-note">${placement.note || t("officialDisclaimer")}</p>
    </div>`;
}

function showResultTab(name) {
  document.querySelectorAll(".result-tab").forEach(el => el.classList.toggle("active", el.dataset.tab === name));
  document.querySelectorAll(".result-panel").forEach(el => el.classList.toggle("active", el.dataset.panel === name));
}
window.showResultTab = showResultTab;

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
      ${placementBlock(result)}

      <div class="result-tabs">
        <button class="result-tab active" data-tab="overview" onclick="showResultTab('overview')">${t("tabOverview")}</button>
        <button class="result-tab" data-tab="breakdown" onclick="showResultTab('breakdown')">${t("tabBreakdown")}</button>
        <button class="result-tab" data-tab="review" onclick="showResultTab('review')">${t("tabReview")}</button>
      </div>

      <div class="result-panel active" data-panel="overview">
        <div class="stats-grid">
          <div class="stat">${t("answered")}<strong>${result.answered}</strong></div>
          <div class="stat">${t("unanswered")}<strong>${result.unanswered}</strong></div>
          <div class="stat">${t("weighted")}<strong>${result.weightedAccuracy || 0}%</strong></div>
          <div class="stat">${t("finalAbility")}<strong>${result.finalAbility || 0}</strong></div>
        </div>
        <p class="muted-note">${t("estimateNote")}</p>
        <p class="muted-note">${t("scoreExplain")}</p>
      </div>

      <div class="result-panel" data-panel="breakdown">
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
        ${timeAnalysisBlock()}
      </div>

      <div class="result-panel" data-panel="review">
        <div class="review">
          ${state.items.map((item, i) => {
            const user = state.answers[i];
            const ok = user === item.answer;
            return `<div class="review-item">
              <div><strong>Q${i+1} · ${labelType(item.type)} · ${t("difficulty")} ${item.difficulty}</strong> <span class="${ok ? 'good' : 'bad'}">${ok ? t("correct") : t("incorrect")}</span></div>
              <div class="english-content review-question">${item.question}</div>
              <div style="color:var(--ink-soft);margin-top:6px">${t("yourAnswer")}: ${user === null || user === undefined ? t("unansweredText") : item.options[user]}</div>
              <div style="color:var(--ink-soft)">${t("correctAnswer")}: ${item.options[item.answer]}</div>
              <div style="margin-top:6px">${item.explanation}</div>
            </div>`;
          }).join("")}
        </div>
      </div>

      <div class="actions"><button onclick="renderHome()">${t("backHome")}</button><button class="secondary" onclick="startExam('quick')">${t("practiceAgain")}</button></div>
    </section>`;
}

applyLanguageChrome();
renderHome();
