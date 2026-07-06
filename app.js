const $ = (s) => document.querySelector(s);
const app = $('#app');
const state = { mode:null, questions:[], index:0, answers:{}, startTime:null, endTime:null, section:1, level:2, secondsLeft:0, timer:null, untimed:false, history: JSON.parse(localStorage.getItem('amirnet_history_v01')||'[]') };
const MODES = {
  quick:{label:'סימולציה קצרה', minutes:18, count:16, desc:'אימון מהיר, טוב ליום עמוס.'},
  full:{label:'סימולציה מלאה', minutes:50, count:32, desc:'דימוי מבחן ארוך יותר עם ציון משוער.'},
  section:{label:'פרק ממוקד', minutes:12, count:10, desc:'בחר סוג שאלות ותתאמן רק עליו.'}
};
function shuffle(arr){return [...arr].sort(()=>Math.random()-.5)}
function pickQuestions(mode, type='all'){
  let bank = window.QUESTION_BANK.filter(q => type==='all' || q.type===type);
  const count = MODES[mode].count;
  const byDiff = [1,2,3].flatMap(d => shuffle(bank.filter(q=>q.difficulty===d)));
  return shuffle(byDiff).slice(0, count);
}
function saveHistory(result){state.history.unshift(result); state.history=state.history.slice(0,8); localStorage.setItem('amirnet_history_v01', JSON.stringify(state.history));}
function home(){clearInterval(state.timer); app.innerHTML = `
<div class="wrap">
  <section class="hero">
    <div class="card">
      <div class="brand"><div class="logo">A</div><span>AMIRNET SIM v0.1</span></div>
      <h1>סימולציות אנגלית, בלי רעש.</h1>
      <p class="lead">גרסה ראשונה שעובדת: טיימר, שאלות מקוריות, ציון משוער 50–150, סקירת טעויות, ומאגר שאלות שאפשר לרענן כל שבוע.</p>
      <div class="actions">
        <button class="btn" onclick="setup('full')">התחל סימולציה מלאה</button>
        <button class="btn secondary" onclick="setup('quick')">סימולציה קצרה</button>
        <button class="btn ghost" onclick="setup('section')">פרק ממוקד</button>
      </div>
      <p class="footerNote">הציון הוא הערכה פנימית לצורך מעקב התקדמות, לא ציון רשמי.</p>
    </div>
    <div class="card">
      <h2>מה יש כרגע</h2>
      <div class="stats">
        <div class="stat"><b>${window.QUESTION_BANK.length}</b><span>שאלות במאגר</span></div>
        <div class="stat"><b>4</b><span>סוגי שאלות</span></div>
        <div class="stat"><b>50–150</b><span>ציון משוער</span></div>
        <div class="stat"><b>${state.history.length}</b><span>ניסיונות שמורים</span></div>
      </div>
      <h3>היסטוריה אחרונה</h3>
      ${state.history.length ? state.history.map(h=>`<div class="pill" style="margin:8px 0">${h.mode}: ${h.score} · ${h.accuracy}% · ${h.date}</div>`).join('') : '<p class="footerNote">עדיין אין ניסיונות שמורים.</p>'}
    </div>
  </section>
</div>`}
function setup(mode){
  const types = [...new Set(window.QUESTION_BANK.map(q=>q.type))];
  app.innerHTML = `<div class="wrap"><div class="card">
    <div class="brand"><div class="logo">A</div><span>${MODES[mode].label}</span></div>
    <h1>הגדרות לפני התחלה</h1>
    <p class="lead">${MODES[mode].desc}</p>
    <div class="grid">
      <div class="card mode"><h3>${MODES[mode].count} שאלות</h3><p>מספר השאלות בסשן הזה.</p></div>
      <div class="card mode"><h3>${MODES[mode].minutes} דקות / ללא זמן</h3><p>אפשר לבחור טיימר רגיל או תרגול בלי לחץ.</p></div>
      <div class="card mode"><h3>סקירת טעויות</h3><p>בסוף תראה תשובות והסברים.</p></div>
    </div>
    <div class="setup" style="margin-top:18px">
      ${mode==='section' ? `<label>בחר סוג שאלות</label><select id="qtype" class="pill" style="width:100%;padding:14px">${types.map(t=>`<option>${t}</option>`).join('')}</select>` : '<input id="qtype" type="hidden" value="all">'}
      <label class="toggleRow"><input id="untimed" type="checkbox"> <span>מצב ללא זמן — בלי טיימר ובלי סיום אוטומטי</span></label>
    </div>
    <div class="actions" style="margin-top:22px"><button class="btn" onclick="start('${mode}')">מתחילים</button><button class="btn secondary" onclick="home()">חזרה</button></div>
  </div></div>`
}
function start(mode){
  const type = $('#qtype')?.value || 'all'; state.mode=mode; state.questions=pickQuestions(mode,type); state.index=0; state.answers={}; state.startTime=Date.now(); state.untimed=!!$('#untimed')?.checked; state.secondsLeft=MODES[mode].minutes*60; clearInterval(state.timer); if(!state.untimed){ state.timer=setInterval(tick,1000); } renderQuestion();
}
function tick(){if(state.untimed) return; state.secondsLeft--; if(state.secondsLeft<=0){finish()} else updateTimer()}
function fmt(sec){const m=Math.floor(sec/60), s=sec%60; return `${m}:${String(s).padStart(2,'0')}`}
function updateTimer(){const el=$('#timer'); if(el) el.textContent=state.untimed?'ללא זמן':fmt(state.secondsLeft)}
function renderQuestion(){
  const q=state.questions[state.index], ans=state.answers[q.id];
  const pct=((state.index)/state.questions.length)*100;
  app.innerHTML = `<div class="wrap"><div class="card">
    <div class="topbar"><div class="brand"><div class="logo">A</div><span>${MODES[state.mode].label}</span></div><div style="display:flex;gap:8px;flex-wrap:wrap"><span class="pill">שאלה ${state.index+1}/${state.questions.length}</span><span class="pill" id="timer">${state.untimed?'ללא זמן':fmt(state.secondsLeft)}</span><span class="pill">רמה ${q.difficulty}</span></div></div>
    <div class="progress"><div style="width:${pct}%"></div></div>
    <div class="question"><div class="qtype">${q.type} · ${q.skill}</div>${q.passage?`<p class="qtext" style="font-size:18px;background:#fbf8ee;border:1px solid var(--line);padding:18px;border-radius:20px">${q.passage}</p>`:''}<div class="qtext">${q.q}</div>
      <div class="answers">${q.a.map((x,i)=>`<button class="answer ${ans===i?'selected':''}" onclick="choose(${i})"><span class="letter">${String.fromCharCode(65+i)}</span><span>${x}</span></button>`).join('')}</div>
    </div>
    <div class="nav"><button class="btn secondary" onclick="prev()" ${state.index===0?'disabled':''}>אחורה</button><div style="display:flex;gap:10px"><button class="btn ghost" onclick="finish()">סיים מבחן</button><button class="btn" onclick="next()">${state.index===state.questions.length-1?'סיום':'הבא'}</button></div></div>
  </div></div>`
}
function choose(i){const q=state.questions[state.index]; state.answers[q.id]=i; renderQuestion()}
function next(){if(state.index < state.questions.length-1){state.index++; renderQuestion()} else finish()}
function prev(){if(state.index>0){state.index--; renderQuestion()}}
function calc(){
  const totalW = state.questions.reduce((s,q)=>s+q.difficulty,0); let gotW=0, correct=0;
  const byType={};
  state.questions.forEach(q=>{const ok=state.answers[q.id]===q.c; if(ok){correct++; gotW+=q.difficulty} byType[q.type] ||= {ok:0,total:0}; byType[q.type].total++; if(ok) byType[q.type].ok++;});
  const weighted = totalW ? gotW/totalW : 0; let score=Math.round(50 + weighted*100);
  // penalty for unanswered, small, to make rushing visible
  const unanswered=state.questions.filter(q=>state.answers[q.id]===undefined).length; score=Math.max(50, score - Math.round((unanswered/state.questions.length)*8));
  const acc=Math.round((correct/state.questions.length)*100);
  return {score, correct, acc, weighted:Math.round(weighted*100), byType, unanswered};
}
function finish(){clearInterval(state.timer); state.endTime=Date.now(); const r=calc(); const minutes=Math.max(1,Math.round((state.endTime-state.startTime)/60000)); saveHistory({mode:MODES[state.mode].label + (state.untimed ? ' ללא זמן' : ''),score:r.score,accuracy:r.acc,date:new Date().toLocaleDateString('he-IL')});
  const level = r.score>=135?'גבוה מאוד':r.score>=120?'חזק':r.score>=105?'טוב':r.score>=85?'בינוני':'צריך חיזוק בסיס';
  app.innerHTML = `<div class="wrap"><div class="results">
    <div class="card"><div class="brand"><div class="logo">A</div><span>תוצאה</span></div><div class="score">${r.score}</div><h2>${level}</h2><p class="lead">${r.correct}/${state.questions.length} נכון · ${r.acc}% דיוק · ${state.untimed ? minutes + ' דקות בפועל · ללא זמן' : minutes + ' דקות'}</p><div class="stats"><div class="stat"><b>${r.weighted}%</b><span>דיוק משוקלל</span></div><div class="stat"><b>${r.unanswered}</b><span>לא נענו</span></div></div><button class="btn" style="margin-top:16px" onclick="home()">חזרה לבית</button><button class="btn secondary" style="margin-top:10px" onclick="setup(state.mode)">סימולציה חדשה</button><p class="footerNote">הניקוד מתחשב בקושי השאלות. שאלות קשות שוות יותר.</p></div>
    <div class="card"><h2>פירוט לפי סוג שאלה</h2><div class="bars">${Object.entries(r.byType).map(([t,v])=>{const p=Math.round(v.ok/v.total*100);return `<div class="barrow"><b>${t}</b><div class="bar"><div style="width:${p}%"></div></div><span>${p}%</span></div>`}).join('')}</div><h2>סקירת שאלות</h2><div class="review">${state.questions.map((q,i)=>{const ua=state.answers[q.id]; const ok=ua===q.c; return `<div class="reviewItem"><div><span class="tag">${i+1}</span><span class="tag">${q.type}</span><span class="tag">רמה ${q.difficulty}</span></div><p class="question" style="font-weight:800">${q.q}</p><p class="${ok?'good':'bad'}">${ok?'נכון':'לא נכון'} · התשובה הנכונה: ${String.fromCharCode(65+q.c)}. ${q.a[q.c]}</p><p class="footerNote">${q.ex}</p></div>`}).join('')}</div></div>
  </div></div>`
}
window.home=home; window.setup=setup; window.start=start; window.choose=choose; window.next=next; window.prev=prev; window.finish=finish; home();
