const app = document.getElementById("app");
const blueprint = window.PREPLAB_BLUEPRINT;
const bank = window.PREPLAB_QUESTIONS;
document.getElementById("versionBadge").textContent = blueprint.version;
document.getElementById("footerVersion").textContent = blueprint.version;

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
  startedAt: null
};

function renderHome() {
  clearInterval(state.timer);
  app.innerHTML = `
    <section class="hero">
      <div class="card">
        <div class="eyebrow">Public beta engine</div>
        <h2>Adaptive Amirnet-style practice</h2>
        <p>גרסה ראשונית שמרכיבה מבחן לפי Blueprint: השלמת משפטים, ניסוח מחדש, ואנסין כחלק מובנה מהציון. התוכן מקורי, והציון הוא אומדן בלבד.</p>
        <div class="actions">
          <button onclick="startExam('full')">Start Full Simulation</button>
          <button class="secondary" onclick="startExam('quick')">Quick Simulation</button>
        </div>
        <label class="toggle"><input id="untimed" type="checkbox" /> Untimed mode</label>
      </div>
      <div class="card">
        <div class="eyebrow">Blueprint</div>
        <div class="stats-grid" style="grid-template-columns:1fr 1fr;">
          <div class="stat">Full<strong>27</strong><span>questions</span></div>
          <div class="stat">Quick<strong>17</strong><span>questions</span></div>
          <div class="stat">Ability<strong>1–5</strong><span>adaptive</span></div>
          <div class="stat">Score<strong>50–150</strong><span>clamped</span></div>
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
  return ({sentenceCompletion:"Sentence Completion", restatement:"Restatement", reading:"Reading Comprehension"})[type] || type;
}

function renderExam() {
  const item = state.items[state.index];
  const progress = ((state.index + 1) / state.items.length) * 100;
  const selected = state.answers[state.index];
  app.innerHTML = `
    <section class="card">
      <div class="exam-head">
        <div>Question ${state.index + 1} / ${state.items.length}</div>
        <div>${state.untimed ? "Untimed" : formatTime(state.secondsLeft)}</div>
      </div>
      <div class="progress"><span style="width:${progress}%"></span></div>
      <div class="question-meta">
        <span class="pill">${labelType(item.type)}</span>
        <span class="pill">Difficulty ${item.difficulty}/5</span>
        <span class="pill">Current ability ${Math.round(state.ability * 10) / 10}</span>
        ${item.passageTitle ? `<span class="pill">${item.passageTitle}</span>` : ""}
      </div>
      ${item.passage ? `<div class="passage"><strong>${item.passageTitle}</strong><br><br>${item.passage}</div>` : ""}
      <div class="question-text">${item.question}</div>
      <div class="options">
        ${item.options.map((opt, i) => `<button class="option ${selected === i ? "selected" : ""}" onclick="choose(${i})">${i + 1}. ${opt}</button>`).join("")}
      </div>
      <div class="nav">
        <button class="secondary" onclick="prevQuestion()" ${state.index === 0 ? "disabled" : ""}>Back</button>
        <div class="actions" style="margin:0">
          <button class="secondary" onclick="skipQuestion()">Skip</button>
          ${state.index === state.items.length - 1 ? `<button onclick="finishExam()">Submit</button>` : `<button onclick="nextQuestion()">Next</button>`}
        </div>
      </div>
    </section>`;
}

function choose(optionIndex) {
  state.answers[state.index] = optionIndex;
  renderExam();
}
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

function finishExam() {
  clearInterval(state.timer);
  // Apply unanswered penalties for questions never visited after current index.
  for (let i = state.abilityHistory.length - 1; i < state.items.length; i++) {
    const item = state.items[i];
    const ans = state.answers[i];
    state.ability = PrepLabAdaptiveEngine.updateAbility(state.ability, ans === item.answer, ans !== null && ans !== undefined, item, blueprint);
    state.abilityHistory.push(state.ability);
  }
  const result = PrepLabScoring.calculate(state.items, state.answers, state.abilityHistory, blueprint);
  renderResults(result);
}

function renderResults(result) {
  const byType = state.items.reduce((acc, item, i) => {
    acc[item.type] ||= {total:0, correct:0};
    acc[item.type].total++;
    if (state.answers[i] === item.answer) acc[item.type].correct++;
    return acc;
  }, {});

  app.innerHTML = `
    <section class="card">
      <div class="eyebrow">Estimated Amirnet Score</div>
      <h2 style="font-size:64px;margin:8px 0;">${result.score}</h2>
      <div class="stats-grid">
        <div class="stat">Range<strong>${result.low}–${result.high}</strong></div>
        <div class="stat">Correct<strong>${result.correct}/${result.total}</strong></div>
        <div class="stat">Accuracy<strong>${result.accuracy}%</strong></div>
        <div class="stat">Confidence<strong>${result.confidence}</strong></div>
      </div>
      <div class="stats-grid">
        <div class="stat">Answered<strong>${result.answered}</strong></div>
        <div class="stat">Unanswered<strong>${result.unanswered}</strong></div>
        <div class="stat">Weighted<strong>${result.weightedAccuracy || 0}%</strong></div>
        <div class="stat">Ability<strong>${result.finalAbility || 0}</strong></div>
      </div>
      <p style="color:var(--muted)">This is an estimated practice score, not an official Amirnet score.</p>
      <h3>By question type</h3>
      <div class="review">
        ${Object.entries(byType).map(([type, data]) => `<div class="review-item"><strong>${labelType(type)}</strong>: ${data.correct}/${data.total}</div>`).join("")}
      </div>
      <h3>Review</h3>
      <div class="review">
        ${state.items.map((item, i) => {
          const user = state.answers[i];
          const ok = user === item.answer;
          return `<div class="review-item">
            <div><strong>Q${i+1} · ${labelType(item.type)} · Difficulty ${item.difficulty}</strong> <span class="${ok ? 'good' : 'bad'}">${ok ? 'Correct' : 'Incorrect'}</span></div>
            <div style="color:var(--muted);margin-top:6px">Your answer: ${user === null || user === undefined ? 'Unanswered' : item.options[user]}</div>
            <div style="color:var(--muted)">Correct: ${item.options[item.answer]}</div>
            <div style="margin-top:6px">${item.explanation}</div>
          </div>`;
        }).join("")}
      </div>
      <div class="actions"><button onclick="renderHome()">Back Home</button></div>
    </section>`;
}

renderHome();
