window.PrepLabPlacement = (() => {
  const config = window.PREPLAB_LEVELS || {};
  const clamp = (score) => Math.max(50, Math.min(150, Math.round(score)));

  function localize(value, lang = "he") {
    if (!value) return "";
    if (typeof value === "string") return value;
    return value[lang] || value.en || value.he || "";
  }

  function getLevels() {
    return (config.levels || []).slice().sort((a, b) => b.min - a.min);
  }

  function classify(score, lang = "he", confidence = null) {
    const safeScore = clamp(score);
    const levels = getLevels();
    const level = levels.find(l => safeScore >= l.min && safeScore <= l.max) || levels[levels.length - 1];
    const exemptionScore = config.exemptionScore || 134;
    const nextLevel = levels
      .filter(l => l.min > safeScore)
      .sort((a, b) => a.min - b.min)[0] || null;
    const pointsToNext = nextLevel ? Math.max(0, nextLevel.min - safeScore) : 0;
    const pointsToExemption = Math.max(0, exemptionScore - safeScore);
    const exemptionLevel = levels.find(l => l.key === "exemption") || levels[0];

    return {
      score: safeScore,
      levelKey: level?.key || "unknown",
      levelLabel: localize(level?.label, lang),
      levelMin: level?.min || 50,
      levelMax: level?.max || 150,
      nextLevelKey: nextLevel?.key || null,
      nextLevelLabel: nextLevel ? localize(nextLevel.label, lang) : null,
      nextLevelScore: nextLevel?.min || null,
      pointsToNext,
      exemptionScore,
      exemptionLabel: localize(exemptionLevel?.label, lang) || localize({ he: "פטור", en: "Exemption" }, lang),
      pointsToExemption,
      goalLabel: pointsToExemption > 0
        ? (localize(exemptionLevel?.label, lang) || localize({ he: "פטור", en: "Exemption" }, lang))
        : null,
      goalScore: pointsToExemption > 0 ? exemptionScore : null,
      message: localize(level?.message, lang),
      note: localize(config.note, lang),
      confidence,
      progress: Math.round(((safeScore - 50) / 100) * 100)
    };
  }

  // Future API hook: recommendations will be based on performance by type/tag.
  function recommend() { return null; }

  return { classify, recommend };
})();
