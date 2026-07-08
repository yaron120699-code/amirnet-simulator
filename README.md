# PrepLab — Adaptive Amirnet Simulator · v2.0

סימולטור אמירנט אדפטיבי חינמי, ובסיס לפלטפורמת למידה רחבה יותר (PrepLab).
בנוי ב-HTML/CSS/JavaScript טהור, ללא frameworks, פרוס על GitHub Pages / Vercel.

---

## מבנה הפרויקט

### חוויית הסטודנט (ציבורי)
| קובץ | תפקיד |
|------|-------|
| `index.html` | מעטפת האפליקציה, טעינת מודולים |
| `js/app.js` | לוגיקת הממשק, זרימת הסימולציה, מדידת זמן, i18n (עברית/אנגלית) |
| `js/adaptiveEngine.js` | מנוע אדפטיבי חי — בחירת שאלות לפי ביצועים |
| `js/scoring.js` | חישוב ציון משוער (50–150) |
| `js/placement.js` | סיווג רמת אנגלית ומרחק מפטור |
| `js/telemetry.js` | איסוף סטטיסטיקות אנונימיות (מקומי), כולל זמן לשאלה |
| `data/blueprint.js` | פרמטרי הסימולציה והמנוע |
| `data/levels.js` | מיפוי רמות אנגלית |
| `questions/questionBank.js` | בנק השאלות |
| `css/styles.css` | מערכת העיצוב (PrepLab Design Language v2.0) — טוקנים, רכיבים, משותף לכל הדפים |

### כלי אדמין (נסתרים, לא מקושרים מהאתר)
| קובץ | תפקיד |
|------|-------|
| `knowledge-studio.html` | CMS לניהול מאגר הידע (Knowledge Base) |
| `vocab-studio.html` | Question Forge — יצירת טיוטות שאלות ממילים |
| `calibration.html` | דשבורד כיול למפתחים |
| `js/vocabStore.js` | שכבת ה-Knowledge Base (CRUD, ייבוא, מיזוג) |
| `js/questionForge.js` | גנרטורים + pipeline אישור שאלות |
| `data/vocabularyBank.js` | מאגר הידע (seed) |
| `data/awlImport.js` | 570 מילות AWL לייבוא |

כל כלי האדמין מסומנים `noindex` ואינם מקושרים מהאתר הציבורי.
גישה ידנית בלבד דרך הכתובת (למשל `/knowledge-studio.html`).

---

## תכונות מרכזיות

**מנוע אדפטיבי אמיתי** — כל שאלה נבחרת אחרי התשובה הקודמת, לפי רמת היכולת
הנוכחית (מודל לוגיסטי בסגנון Elo/IRT). סדר התשובות מעורבב בכל סימולציה.
אין חזרה לשאלות קודמות, כמו במבחן האמירנט האמיתי.

**ציון ושיבוץ** — ציון משוער 50–150, המתורגם לרמת אנגלית ומרחק מפטור,
עם תמיכה בהגדרות ספציפיות למוסד.

**Knowledge Base** — מאגר ידע רב-טיפוסי (אוצר מילים, פעלים מורכבים, ניבים,
ביטויים אקדמיים, תבניות דקדוק) שממנו נוצרות שאלות. ייבוא CSV/JSON/TXT
עם מיזוג בטוח שלא דורס עריכות ידניות.

**כיול** — טלמטריה אנונימית מקומית לשיפור רמות הקושי, הציון והמנוע לאורך זמן.

---

## עקרונות ארכיטקטורה

- **ה-Knowledge Base לעולם לא תלוי בבנק השאלות.** בנק השאלות תלוי ב-Knowledge Base.
- **שום שאלה לא מתפרסמת אוטומטית** — כל טיוטה עוברת אישור אנושי.
- **גנרטורים כנים** — חוסר נתונים חוסם יצירה עם הסבר, במקום להמציא שאלה.
- **מוכן ל-backend** — שכבות האחסון בנויות כ-adapter שקל להחליף ב-API.

---

## פריסה

להעלות לשורש הריפו:
```text
index.html  css/  js/  data/  questions/
knowledge-studio.html  vocab-studio.html  calibration.html
README.md
```

פרוס אוטומטית ב-GitHub Pages או Vercel. אין שלב build.

---

## הערת איכות

רמות הקושי, חלקי הדיבר והנושאים במאגר הם הערכה ראשונית ומתכיילים עם הזמן
דרך שכבת הטלמטריה. ספי השיבוץ למוסדות דורשים אימות מול הפרסום הרשמי של
כל מוסד לפני הצגה כמחייבים — הסימולטור מספק הערכה בלבד.


## v1.1.0 Production Readiness

Stabilization sprint focused on the adaptive engine and question diversity.

### Added
- Hidden developer debug mode with `?debug=1`
- Adaptive selection diagnostics

### Changed
- Question selection now samples around current ability instead of strict rounding
- Opening ability includes slight jitter to reduce repeated starts
- Recent-question history is updated immediately when a question is selected

### Fixed
- Quick Simulation frequently starting with the same questions
- Overly narrow opening pool around Difficulty 3

See `AUDIT_REPORT.md` for details.

---

## v1.1.1 Adaptive Calibration & Time Analytics

Follow-up sprint focused on realism: a single exam-level clock, richer
calibration data, and repo cleanup. No UI redesign, no scoring changes,
no new features beyond what's listed below.

### Added
- **Time Analytics** — question, section and total exam time are measured
  by diffing timestamps against the existing 50-minute exam clock. There
  is still only **one** timer for the whole exam, exactly like the real
  Amirnet test; no per-question timer was introduced.
- **Time Analysis** section on the results screen: total time (vs. the
  allotted time), average time per question, average time by question
  type (reading / sentence completion / restatement), and the fastest
  and slowest questions of the simulation.
- **Calibration data** — `js/telemetry.js` is now actually loaded and
  called from the live exam (`js/app.js`). Every finished simulation
  stores, per question: `questionId`, `difficulty`, `correct`,
  `timeSpent`, `abilityBefore` and `abilityAfter`, alongside the existing
  mergeable aggregates used by `calibration.html`.
- **Developer Debug Mode** extended with: Ability Before / Ability After,
  Time On Current Question (live), running Average Time, and a Decision
  Log line describing why each question was picked. Still hidden from
  normal users behind `?debug=1`.

### Changed
- `calibration.html` now shows an average-time column per question and
  total time per recent simulation.

### Fixed / Cleaned up
- `js/telemetry.js` was written but never wired into `index.html` or
  `js/app.js` — calibration data was silently never collected. Now fixed.
- Removed dead legacy root `app.js` (superseded by `js/app.js`, already
  flagged for deletion in `UPDATE.md` but re-added by a later upload).
- Removed `studio.html`, an early, undocumented predecessor of
  `vocab-studio.html` that was no longer referenced anywhere.

### Quality checklist
- Adaptive engine behavior (selection, ability updates) is unchanged from v1.1.0.
- Question diversity/consecutive-simulation variety unchanged (already solved in v1.1.0).
- Time tracking verified end-to-end (question → section → total) via a scripted simulation run.
- Exam timer remains a single 50-minute (or 20-minute quick) countdown; no per-question timer exists anywhere in the code.
- Debug mode verified to show the new fields and remains hidden without `?debug=1`.
- README and `docs/roadmap.md` updated.

---

## v2.0 PrepLab Design Language

UI-only design system pass, laying the visual foundation for future
modules (Mathematics / Physics / Statistics). No changes to the
adaptive engine, scoring, blueprint, placement logic, or question bank.

### Added
- **PrepLab Design Language**: `css/styles.css` rebuilt as a documented,
  tokenized design system — spacing scale, type scale, radius scale,
  elevation scale, and named motion durations (150ms/200ms), organized
  into 9 labeled sections instead of ad hoc rules. Shared by every page
  (`index.html` and all four admin studio pages).
- **Modules section on the home page**: Amirnet as the live module, plus
  Mathematics / Physics / Statistics shown as disabled "Coming soon"
  cards, establishing the multi-subject shell described in the product
  vision.
- **Continue-learning card** on the home page: surfaces the most recent
  completed simulation (score, estimated level, relative time) by
  reading the existing telemetry log (`PrepLabTelemetry.lastSimulations`)
  — no new storage or scoring logic.
- **Recommendations block** on the results page: identifies the
  weakest/strongest question type from the already-computed `byType`
  accuracy breakdown and a pacing note from the already-computed time
  analysis.
- **Next step** CTA row at the end of the results page (Back home /
  Practice again).

### Changed
- App shell widened from a fixed `1040px` to `clamp(1100px, 92vw, 1280px)`
  so large monitors no longer feel empty; the exam and results screens
  intentionally keep a narrower ~860px reading column, per the product
  vision's instruction not to overdesign the exam screen.
- Results page reordered: Score → Estimated Level & Progress to
  Exemption → Time Analysis → Accuracy & Question Breakdown → Ability
  Path → Recommendations → Full Review → Next Step.
- Answer options: numeric square badges (`1`–`4`) replaced with circular
  `A`–`D` letter badges, with a subtle hover state and a "locked in"
  selection animation.

### Fixed
- Two review-item inline styles referenced an undefined `--muted` CSS
  variable; now use `--ink-soft`.

### Not in this pass
- `studio.html`, `vocab-studio.html`, `knowledge-studio.html`,
  `calibration.html` inherit the new shared tokens (buttons, cards,
  badges, inputs) automatically but were not restructured — a
  candidate for a follow-up pass.
- Root-level duplicate `app.js` (unused, superseded by `js/app.js` — see
  v1.1.1) — still present in this checkout and should be deleted.

See `CHANGELOG_DESIGN_LANGUAGE.md` for the full design rationale and a
manual testing checklist.
