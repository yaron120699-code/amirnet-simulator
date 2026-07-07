# PrepLab — עדכון v0.9.9 (ספרינט 5: Vocabulary Content Factory)

## קבצים

```
vocab-studio.html     ← מחליף (שכתוב מלא — CMS)
js/vocabStore.js      ← חדש — שכבת Knowledge Base
js/questionForge.js   ← חדש — גנרטורים + pipeline אישורים
```

## למחוק באותו קומיט

```
git rm js/vocabularyEngine.js
```

(vocab-studio.html החדש לא טוען אותו; התבניות הגנריות שיצרו שאלות שבורות נמחקו בכוונה.)

## ללא שינוי
data/vocabularyBank.js (ה-seed של 800 המילים), index.html, המנוע, הבנק.

## git
```
git add .
git rm js/vocabularyEngine.js
git commit -m "feat(studio): vocabulary content factory - CMS, honest generators, approval pipeline"
git push
```

## זרימת עבודה חדשה
1. פתח vocab-studio.html → סנן "חסר משפט דוגמה" (תור העבודה)
2. העשר מילה: POS, משפט דוגמה (חייב להכיל את המילה במדויק), נרדפות, הפכים
3. Generate Draft Questions → עד 4 סוגי טיוטות
4. ערוך כל טיוטה (עם preview חי זהה לסימולטור) → אשר
5. לשונית ייצוא → העתק Snippet → הדבק ב-questionBank.js → קומיט
6. הורד vocabularyBank.js מעודכן וקמט גם אותו (העריכות שלך ב-KB)

## חשוב
העריכות נשמרות ב-localStorage של הדפדפן. הייצוא הוא מסלול הקומיט —
ייצא ושמור בריפו בסוף כל סשן עבודה.
