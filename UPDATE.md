# ניקוי + סנכרון גרסה → v1.0.0

## חלק 1: תיקון גרסה (החלפת קבצים)
```
index.html   ← v0.9.8 → v1.0.0
js/app.js    ← "v0.9.8 Vocabulary Engine" → "v1.0.0 Public Beta"
```
רק 2 שורות בכל קובץ. שום לוגיקה לא נגעה.

## חלק 2: מחיקת קבצים מתים
שלושה קבצים ישנים שלא נטענים באף דף (נבדק):
```
git rm app.js          # שורש — שריד ספרינט 1 (לא js/app.js!)
git rm questions.js    # שורש — מאגר ישן
git rm js/vocabularyEngine.js   # הוחלף ב-questionForge.js בספרינט 5
```

## אל תמחק
data/levels.js — פעיל! index.html טוען אותו.

## git — הכל בקומיט אחד
```
git add index.html js/app.js
git rm app.js questions.js js/vocabularyEngine.js
git commit -m "chore: sync UI to v1.0.0 and remove dead legacy files"
git push
```

## בדיקה אחרי דחיפה
- הסימולטור מציג v1.0.0 (תג בפינה + פוטר)
- vocab-studio.html עדיין עובד (Question Forge)
- knowledge-studio.html עדיין עובד (KB + ייבוא AWL)
