# PrepLab — עדכון v1.0.0 (ספרינט 6: Knowledge Base Foundation)

## קבצים
```
js/vocabStore.js       ← מחליף (type + forms + מנוע ייבוא CSV/JSON/TXT + מיזוג בטוח)
knowledge-studio.html  ← חדש — CMS רב-טיפוסי (ניהול/חיפוש/סינון/ייבוא/סטטיסטיקות)
data/awlImport.js      ← חדש — 570 מילות AWL לייבוא
```
ללא שינוי: questionForge.js, vocab-studio.html (נשאר כ-Question Forge), המנוע, הבנק.

## git
```
git add js/vocabStore.js knowledge-studio.html data/awlImport.js
git commit -m "feat(kb): knowledge base foundation - multi-type CMS, import engine, AWL seed"
git push
```

## מיזוג ה-AWL עם ה-800 (הבקשה שלך)
1. פתח knowledge-studio.html → לשונית "ייבוא"
2. לחץ "טען AWL (570 מילים)" → תצוגה מקדימה תראה: 456 חדשים, 84 להעשרה, 114 דילוגים (כפילות)
3. לחץ "בצע ייבוא" → סה"כ ~1,256 ערכים, אפס כפילויות
4. הערכים נשמרים ב-localStorage. לקיבוע בריפו: (עתידי) ייצוא KB → commit

## כללי מיזוג
- מילה חדשה → נוספת
- קיימת ולא נערכה → מושלמים רק שדות ריקים
- קיימת ונערכה ידנית → נשמרת כמו שהיא, לעולם לא נדרסת
