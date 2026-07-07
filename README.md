# PrepLab — Adaptive Amirnet Simulator · v1.1.0

סימולטור אמירנט אדפטיבי חינמי, ובסיס לפלטפורמת למידה רחבה יותר (PrepLab).
בנוי ב-HTML/CSS/JavaScript טהור, ללא frameworks, פרוס על GitHub Pages / Vercel.

---

## מבנה הפרויקט

### חוויית הסטודנט (ציבורי)
| קובץ | תפקיד |
|------|-------|
| `index.html` | מעטפת האפליקציה, טעינת מודולים |
| `js/app.js` | לוגיקת הממשק, זרימת הסימולציה, i18n (עברית/אנגלית) |
| `js/adaptiveEngine.js` | מנוע אדפטיבי חי — בחירת שאלות לפי ביצועים |
| `js/scoring.js` | חישוב ציון משוער (50–150) |
| `js/placement.js` | סיווג רמת אנגלית ומרחק מפטור |
| `js/telemetry.js` | איסוף סטטיסטיקות אנונימיות (מקומי) |
| `data/blueprint.js` | פרמטרי הסימולציה והמנוע |
| `data/levels.js` | מיפוי רמות אנגלית |
| `data/institutions.js` | הגדרות מוסדות (placement) |
| `questions/questionBank.js` | בנק השאלות |
| `css/styles.css` | מערכת העיצוב |

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
