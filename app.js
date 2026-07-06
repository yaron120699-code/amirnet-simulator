const $ = (s) => document.querySelector(s);
const app = $('#app');

const MODES = {
  quick:{label:'סימולציה קצרה', minutes:18, count:16, desc:'אימון מהיר, טוב ליום עמוס.'},
  full:{label:'סימולציה מלאה', minutes:50, count:32, desc:'דימוי מבחן ארוך יותר עם ציון משוער.'},
  section:{label:'פרק ממוקד', minutes:12, count:10, desc:'בחר סוג שאלות ותתאמן רק עליו.'}
};

const state = {
  mode:null,
  questions:[],
  index:0,
  answers:{},
  usedIds:new Set(),
  ability:3,
  abilityHistory:[],
  startTime:null,
  endTime:null,
  secondsLeft:0,
  timer:null,
  untimed:false,
  selectedType:'all',
  history: JSON.parse(localStorage.getItem('amirnet_history_v03')||'[]')
};

function clamp(n,min,max){ return Math.max(min, Math.min(max,n)); }
function shuffle(arr){ return [...arr].sort(()=>Math.random()-.5); }
function normalizeDifficulty(q){
  // Older question banks may have numeric difficulty stored under skill.
  const d = Number(q.difficulty);
  const s = Number(q.skill);
  if(Number.isFinite(d) && d >= 1) return clamp(Math.round(d),1,5);
  if(Number.isFinite(s) && s >= 1) return clamp(Math.round(s),1,5);
  return 3;
}
function skillLabel(q){
  if(typeof q.skill === 'string') return q.skill;
  if(typeof q.difficulty === 'string') return q.difficulty;
  return 'adaptive';
}
function bank(){
  return (window.QUESTION_BANK || []).map(q => ({...q, level: normalizeDifficulty(q), skillLabel: skillLabel(q)}));
}
function saveHistory(result){
  state.history.unshift(result);
  state.history = state.history.slice(0,10);
  localStorage.setItem('amirnet_history_v03', JSON.stringify(state.history));
}

function home(){
  clearInterval(state.timer);
  const b = bank();
  app.innerHTML = `
<div class="wrap">
  <section class="hero">
    <div class="card">
      <div class="brand"><div class="logo">A</div><span>AMIRNET SIM v0.3</span></div>
      <h1>סימולציה אדפטיבית ראשונית.</h1>
      <p class="lead">עונים נכון — רמת השאלות עולה. טועים — הרמה יורדת. בסוף מקבלים ציון משוער 50–150 לפי המסלול, לא רק לפי אחוז הצלחה.</p>
      <div class="actions">
        <button class="btn" onclick="setup('full')">סימולציה מלאה</button>
        <button class="btn secondary" onclick="setup('quick')">סימולציה קצרה</button>
        <button class="btn ghost" onclick="setup('section')">פרק ממוקד</button>
      </div>
      <p class="footerNote">זה מנוע אדפטיבי פנימי שמחקה את הרעיון של אמירנט. הוא לא האלגוריתם הרשמי.</p>
    </div>
    <div class="card">
      <h2>מה יש כרגע</h2>
      <div class="stats">
        <div class="stat"><b>${b.length}</b><span>שאלות במאגר</span></div>
        <div class="stat"><b>1–5</b><span>רמות קושי</span></div>
        <div class="stat"><b>50–150</b><span>ציון משוער</span></div>
        <div class="stat"><b>${state.history.length}</b><span>ניסיונות שמורים</span></div>
      </div>
      <h3>היסטוריה אחרונה</h3>
      ${state.history.length ? state.history.map(h=>`<div class="pill" style="margin:8px 0">${h.mode}: ${h.score} · ${h.accuracy}% · רמה ${h.finalAbility} · ${h.date}</div>`).join('') : '<p class="footerNote">עדיין אין ניסיונות שמורים.</p>'}
    </div>
  </section>
</div>`;
}

function setup(mode){
  const types = [...new Set(bank().map(q=>q.type))];
  app.innerHTML = `<div class="wrap"><div class="card">
    <div class="brand"><div class="logo">A</div><span>${MODES[mode].label}</span></div>
    <h1>הגדרות לפני התחלה</h1>
    <p class="lead">${MODES[mode].desc}</p>
    <div class="grid">
      <div class="card mode"><h3>${MODES[mode].count} שאלות</h3><p>המנוע בוחר כל שאלה לפי הרמה שלך באותו רגע.</p></div>
      <div class="card mode"><h3>אדפטיבי</h3><p>נכון מעלה רמה, טעות מורידה רמה. לא מצב נפרד — זו ברירת המחדל.</p></div>
      <div class="card mode"><h3>ציון 50–150</h3><p>הציון משקלל קושי, דיוק והרמה הסופית.</p></div>
    </div>
    <div class="setup" style="margin-top:18px">
      ${mode==='section' ? `<label>בחר סוג שאלות</label><select id="qtype" class="pill" style="width:100%;padding:14px">${types.map(t=>`<option>${t}</option>`).join('')}</select>` : '<input id="qtype" type="hidden" value="all">'}
      <label class="toggleRow"><input id="untimed" type="checkbox"> <span>מצב ללא זמן — בלי טיימר ובלי סיום אוטומטי</span></label>
    </div>
    <div class="actions" style="margin-top:22px"><button class="btn" onclick="start('${mode}')">מתחילים</button><button class="btn secondary" onclick="home()">חזרה</button></div>
  </div></div>`;
}

function start(mode){
  state.mode = mode;
  state.selectedType = $('#qtype')?.value || 'all';
  state.questions = [];
  state.index = 0;
  state.answers = {};
  state.usedIds = new Set();
  state.ability = 3;
  state.abilityHistory = [3];
  state.startTime = Date.now();
  state.untimed = !!$('#untimed')?.checked;
  state.secondsLeft = MODES[mode].minutes * 60;
  clearInterval(state.timer);
  addNextQuestion();
  if(!state.untimed) state.timer = setInterval(tick,1000);
  renderQuestion();
}

function candidatesNearLevel(target){
  const b = bank().filter(q => (state.selectedType === 'all' || q.type === state.selectedType) && !state.usedIds.has(q.id));
  if(!b.length) return [];
  const rounded = clamp(Math.round(target),1,5);
  const same = b.filter(q => q.level === rounded);
  if(same.length) return same;
  const close = b.filter(q => Math.abs(q.level - rounded) <= 1);
  return close.length ? close : b;
}

function addNextQuestion(){
  if(state.questions.length >= MODES[state.mode].count) return false;
  const choices = candidatesNearLevel(state.ability);
  if(!choices.length) return false;
  const q = shuffle(choices)[0];
  state.usedIds.add(q.id);
  state.questions.push(q);
  return true;
}

function tick(){
  if(state.untimed) return;
  state.secondsLeft--;
  if(state.secondsLeft <= 0) finish();
  else updateTimer();
}
function fmt(sec){ const m=Math.floor(sec/60), s=sec%60; return `${m}:${String(s).padStart(2,'0')}`; }
function updateTimer(){ const el=$('#timer'); if(el) el.textContent = state.untimed ? 'ללא זמן' : fmt(state.secondsLeft); }

function renderQuestion(){
  const q = state.questions[state.index];
  if(!q){ finish(); return; }
  const ans = state.answers[q.id];
  const pct = ((state.index)/MODES[state.mode].count)*100;
  app.innerHTML = `<div class="wrap"><div class="card">
    <div class="topbar"><div class="brand"><div class="logo">A</div><span>${MODES[state.mode].label}</span></div><div style="display:flex;gap:8px;flex-wrap:wrap"><span class="pill">שאלה ${state.index+1}/${MODES[state.mode].count}</span><span class="pill" id="timer">${state.untimed?'ללא זמן':fmt(state.secondsLeft)}</span><span class="pill">רמת שאלה ${q.level}</span><span class="pill">יכולת משוערת ${state.ability.toFixed(1)}</span></div></div>
    <div class="progress"><div style="width:${pct}%"></div></div>
    <div class="question"><div class="qtype">${q.type} · ${q.skillLabel}</div>${q.passage?`<p class="qtext" style="font-size:18px;background:#fbf8ee;border:1px solid var(--line);padding:18px;border-radius:20px">${q.passage}</p>`:''}<div class="qtext">${q.q}</div>
      <div class="answers">${q.a.map((x,i)=>`<button class="answer ${ans===i?'selected':''}" onclick="choose(${i})"><span class="letter">${String.fromCharCode(65+i)}</span><span>${x}</span></button>`).join('')}</div>
    </div>
    <div class="nav"><button class="btn secondary" onclick="prev()" ${state.index===0?'disabled':''}>אחורה</button><div style="display:flex;gap:10px"><button class="btn ghost" onclick="finish()">סיים מבחן</button><button class="btn" onclick="next()">${state.index===MODES[state.mode].count-1?'סיום':'הבא'}</button></div></div>
  </div></div>`;
}

function choose(i){
  const q = state.questions[state.index];
  if(!q) return;
  state.answers[q.id] = i;
  renderQuestion();
}

function updateAbilityAfterAnswer(q){
  const ans = state.answers[q.id];
  if(ans === undefined) return;
  const ok = ans === q.c;
  const gap = q.level - state.ability;
  if(ok){
    // Correct on hard questions moves you more. Correct on easy questions moves you only a little.
    state.ability += 0.32 + Math.max(0, gap) * 0.12;
  } else {
    // Missing an easier question hurts more than missing a harder one.
    state.ability -= 0.34 + Math.max(0, -gap) * 0.12;
  }
  state.ability = clamp(state.ability,1,5);
  state.abilityHistory.push(Number(state.ability.toFixed(2)));
}

function next(){
  const q = state.questions[state.index];
  if(q && state.answers[q.id] !== undefined && !q.scored){
    q.scored = true;
    updateAbilityAfterAnswer(q);
  }
  if(state.index < MODES[state.mode].count-1){
    if(state.index === state.questions.length-1) addNextQuestion();
    state.index++;
    renderQuestion();
  } else finish();
}
function prev(){ if(state.index>0){ state.index--; renderQuestion(); } }

function calc(){
  // Make sure the last answered question is included if the user clicks finish directly.
  state.questions.forEach(q=>{ if(state.answers[q.id] !== undefined && !q.scored){ q.scored = true; updateAbilityAfterAnswer(q); } });
  const totalW = state.questions.reduce((s,q)=>s+q.level,0);
  let gotW=0, correct=0;
  const byType={}, byLevel={};
  state.questions.forEach(q=>{
    const ok = state.answers[q.id] === q.c;
    if(ok){ correct++; gotW += q.level; }
    byType[q.type] ||= {ok:0,total:0}; byType[q.type].total++; if(ok) byType[q.type].ok++;
    byLevel[q.level] ||= {ok:0,total:0}; byLevel[q.level].total++; if(ok) byLevel[q.level].ok++;
  });
  const weighted = totalW ? gotW/totalW : 0;
  const avgAbility = state.abilityHistory.reduce((a,b)=>a+b,0)/state.abilityHistory.length;
  const finalAbilityNorm = (state.ability - 1) / 4;
  const avgAbilityNorm = (avgAbility - 1) / 4;
  let score = Math.round(50 + (weighted*0.55 + finalAbilityNorm*0.30 + avgAbilityNorm*0.15) * 100);
  const unanswered = state.questions.filter(q=>state.answers[q.id]===undefined).length;
  score = clamp(score - Math.round((unanswered/MODES[state.mode].count)*10), 50, 150);
  const acc = Math.round((correct/state.questions.length)*100);
  return {score, correct, acc, weighted:Math.round(weighted*100), byType, byLevel, unanswered, finalAbility:state.ability.toFixed(1), avgAbility:avgAbility.toFixed(1)};
}

function finish(){
  clearInterval(state.timer);
  state.endTime = Date.now();
  const r = calc();
  const minutes = Math.max(1, Math.round((state.endTime-state.startTime)/60000));
  saveHistory({mode:MODES[state.mode].label + (state.untimed ? ' ללא זמן' : ''), score:r.score, accuracy:r.acc, finalAbility:r.finalAbility, date:new Date().toLocaleDateString('he-IL')});
  const level = r.score>=135?'גבוה מאוד':r.score>=120?'חזק':r.score>=105?'טוב':r.score>=85?'בינוני':'צריך חיזוק בסיס';
  app.innerHTML = `<div class="wrap"><div class="results">
    <div class="card"><div class="brand"><div class="logo">A</div><span>תוצאה</span></div><div class="score">${r.score}</div><h2>${level}</h2><p class="lead">${r.correct}/${state.questions.length} נכון · ${r.acc}% דיוק · ${state.untimed ? minutes + ' דקות בפועל · ללא זמן' : minutes + ' דקות'}</p><div class="stats"><div class="stat"><b>${r.weighted}%</b><span>דיוק משוקלל</span></div><div class="stat"><b>${r.finalAbility}</b><span>רמת יכולת סופית</span></div><div class="stat"><b>${r.avgAbility}</b><span>רמת יכולת ממוצעת</span></div><div class="stat"><b>${r.unanswered}</b><span>לא נענו</span></div></div><button class="btn" style="margin-top:16px" onclick="home()">חזרה לבית</button><button class="btn secondary" style="margin-top:10px" onclick="setup(state.mode)">סימולציה חדשה</button><p class="footerNote">הציון משוער: משקלל קושי שאלות, דיוק, רמת יכולת ממוצעת וסופית. זה לא ציון רשמי של המרכז הארצי.</p></div>
    <div class="card"><h2>פירוט לפי סוג שאלה</h2><div class="bars">${Object.entries(r.byType).map(([t,v])=>{const p=Math.round(v.ok/v.total*100);return `<div class="barrow"><b>${t}</b><div class="bar"><div style="width:${p}%"></div></div><span>${p}%</span></div>`}).join('')}</div><h2>פירוט לפי רמה</h2><div class="bars">${Object.entries(r.byLevel).sort((a,b)=>a[0]-b[0]).map(([t,v])=>{const p=Math.round(v.ok/v.total*100);return `<div class="barrow"><b>רמה ${t}</b><div class="bar"><div style="width:${p}%"></div></div><span>${p}%</span></div>`}).join('')}</div><h2>סקירת שאלות</h2><div class="review">${state.questions.map((q,i)=>{const ua=state.answers[q.id]; const ok=ua===q.c; return `<div class="reviewItem"><div><span class="tag">${i+1}</span><span class="tag">${q.type}</span><span class="tag">רמה ${q.level}</span></div><p class="question" style="font-weight:800">${q.q}</p><p class="${ok?'good':'bad'}">${ok?'נכון':'לא נכון'} · התשובה הנכונה: ${String.fromCharCode(65+q.c)}. ${q.a[q.c]}</p><p class="footerNote">${q.ex}</p></div>`}).join('')}</div></div>
  </div></div>`;
}

window.home=home; window.setup=setup; window.start=start; window.choose=choose; window.next=next; window.prev=prev; window.finish=finish; home();
