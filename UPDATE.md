# PrepLab — עדכון v0.9.6 (ספרינט 3: שכבת כיול)

## קבצים

```
index.html            ← מחליף (טוען את telemetry.js, גרסה 0.9.6)
calibration.html      ← חדש — דשבורד מפתחים, לא מקושר משום מקום
js/app.js             ← מחליף (+שורות רישום טלמטריה)
js/adaptiveEngine.js  ← מחליף (+ברירות מחדל למטא-דאטה)
js/telemetry.js       ← חדש — מודול האיסוף והכיול
```

ללא שינוי: css/styles.css, js/scoring.js, data/blueprint.js, questions/questionBank.js

## git

```
git add .
git commit -m "feat(calibration): telemetry layer + developer calibration dashboard"
git push
```

## גישה לדשבורד

https://<your-domain>/calibration.html
לא מקושר מהאתר, מסומן noindex. הנתונים מקומיים לדפדפן —
השתמש ב-Export JSON לאיסוף ידני עד שיהיה backend.

## בדיקות אחרי דיפלוי

- [ ] סימולציה רגילה עובדת בדיוק כמו קודם (אפס שינוי בחוויה)
- [ ] אחרי סימולציה: calibration.html מציג אותה ב-Recent simulations
- [ ] טבלת השאלות מתמלאת אחרי כמה סימולציות
- [ ] Export JSON מוריד קובץ
- [ ] החלפת שפה במסך תוצאות לא יוצרת רישום כפול (Simulations לא קופץ ב-2)
