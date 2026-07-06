window.PREPLAB_INSTITUTIONS = {
  general: {
    id: "general",
    status: "community",
    label: { he: "כללי", en: "General" },
    note: {
      he: "סיווג כללי לפי טווחי רמות נפוצים. יש לבדוק מול מוסד הלימודים הרשמי.",
      en: "General placement based on common level ranges. Always verify with the official institution."
    },
    exemptionScore: 134,
    levels: [
      { min: 134, max: 150, key: "exemption", label: { he: "פטור", en: "Exemption" } },
      { min: 120, max: 133, key: "advancedB", label: { he: "מתקדמים ב׳", en: "Advanced B" } },
      { min: 100, max: 119, key: "advancedA", label: { he: "מתקדמים א׳", en: "Advanced A" } },
      { min: 85,  max: 99,  key: "basic", label: { he: "בסיסי", en: "Basic" } },
      { min: 70,  max: 84,  key: "preBasicB", label: { he: "טרום בסיסי ב׳", en: "Pre-Basic B" } },
      { min: 60,  max: 69,  key: "preBasicA", label: { he: "טרום בסיסי א׳", en: "Pre-Basic A" } },
      { min: 50,  max: 59,  key: "beginning", label: { he: "רמת התחלה", en: "Beginning" } }
    ]
  },
  haifa: {
    id: "haifa",
    extends: "general",
    status: "draft",
    label: { he: "אוניברסיטת חיפה", en: "University of Haifa" },
    note: {
      he: "טיוטה לאימות. יש לבדוק את הספים מול אוניברסיטת חיפה לפני שימוש רשמי.",
      en: "Draft mapping. Verify thresholds with the University of Haifa before relying on it."
    }
  }
};
