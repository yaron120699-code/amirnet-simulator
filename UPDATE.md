# PrepLab — עדכון v0.9.5 (ספרינטים 1+2)

## מה יש בתיקייה

מבנה התיקייה זהה למבנה הריפו — פשוט להעתיק הכול לשורש הפרויקט ולאשר החלפה:

```
index.html            ← מחליף את הקיים
css/styles.css        ← מחליף את הקיים
js/app.js             ← מחליף את הקיים
js/adaptiveEngine.js  ← מחליף את הקיים
js/scoring.js         ← מחליף את הקיים
data/blueprint.js     ← מחליף את הקיים
```

## חשוב — מחיקת קבצים מתים

בשורש הריפו יש שלושה קבצים ישנים שלא בשימוש (index.html לא טוען אותם).
למחוק אותם באותו קומיט:

```
git rm app.js questions.js styles.css
```

(לא לגעת ב־js/app.js וב־css/styles.css — רק בקבצים שבשורש!)

## פקודות git

```
git add .
git rm app.js questions.js styles.css
git commit -m "feat: v0.9.5 - new visual identity + true adaptive engine

- New light editorial design system (paper/ink, Fraunces + Inter/Heebo)
- Timer updates single node instead of re-rendering (fixes passage scroll reset)
- Live CAT-style question selection based on current ability
- Logistic (Elo/IRT-style) ability model with shrinking step size
- Per-session option shuffling (removes 48% position-1 answer bias)
- Back navigation removed during simulation (matches real Amirnet)
- Early-timeout scoring: unpresented questions count as unanswered
- Remove dead legacy files from repo root"
git push
```

## מה לא השתנה

- questions/questionBank.js — המאגר נשאר כמו שהוא
- studio.html — ללא שינוי (יורש אוטומטית את העיצוב החדש מ־styles.css)
- docs/roadmap.md — ללא שינוי

## בדיקות אחרי דיפלוי

- [ ] סימולציה מלאה: "שאלה 1 / 27", סימולציה קצרה: 17
- [ ] תשובות נכונות ברצף מעלות את רמת הקושי; טעויות מורידות
- [ ] אין כפתור "חזרה"; מופיעה ההערה על אי-חזרה (עברית/אנגלית לפי שפה)
- [ ] סדר התשובות משתנה בין ריצות
- [ ] גלילה בקטע קריאה במצב עם טיימר לא מתאפסת
- [ ] טיימר הופך כתום מתחת ל-5 דקות
- [ ] ציון בטווח 50–150; טיימר שנגמר באמצע נותן אמינות נמוכה
- [ ] מובייל: עמודה אחת, כפתורים ברוחב מלא
