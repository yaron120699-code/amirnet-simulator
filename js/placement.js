window.PrepLabPlacement = (() => {
  const institutions = window.PREPLAB_INSTITUTIONS || {};
  const clamp = (score) => Math.max(50, Math.min(150, Math.round(score)));

  function mergeInstitution(id = "general") {
    const general = institutions.general;
    const inst = institutions[id] || general;
    if (!inst || inst.id === "general" || !inst.extends) return inst || general;
    const base = institutions[inst.extends] || general;
    return {
      ...base,
      ...inst,
      label: inst.label || base.label,
      note: inst.note || base.note,
      levels: inst.levels || base.levels,
      exemptionScore: inst.exemptionScore || base.exemptionScore
    };
  }

  function localize(value, lang = "he") {
    if (!value) return "";
    if (typeof value === "string") return value;
    return value[lang] || value.en || value.he || "";
  }

  function classify(score, institutionId = "general", lang = "he") {
    const safeScore = clamp(score);
    const institution = mergeInstitution(institutionId) || mergeInstitution("general");
    const levels = (institution.levels || []).slice().sort((a, b) => b.min - a.min);
    const level = levels.find(l => safeScore >= l.min && safeScore <= l.max) || levels[levels.length - 1];
    const higher = levels.filter(l => l.min > safeScore).sort((a, b) => a.min - b.min)[0] || null;
    const exemptionScore = institution.exemptionScore || 134;
    const pointsToExemption = Math.max(0, exemptionScore - safeScore);
    const nextTarget = pointsToExemption > 0
      ? { score: exemptionScore, label: localize(levels.find(l => l.min === exemptionScore)?.label, lang) || localize({he:"פטור", en:"Exemption"}, lang) }
      : null;

    return {
      score: safeScore,
      institutionId: institution.id,
      institutionLabel: localize(institution.label, lang),
      institutionStatus: institution.status || "draft",
      institutionNote: localize(institution.note, lang),
      levelKey: level?.key || "unknown",
      levelLabel: localize(level?.label, lang),
      levelMin: level?.min || 50,
      levelMax: level?.max || 150,
      nextLevelLabel: higher ? localize(higher.label, lang) : null,
      pointsToNextLevel: higher ? Math.max(0, higher.min - safeScore) : 0,
      exemptionScore,
      pointsToExemption,
      nextTarget,
      progress: Math.round(((safeScore - 50) / 100) * 100)
    };
  }

  function listInstitutions(lang = "he") {
    return Object.keys(institutions).map(id => {
      const inst = mergeInstitution(id);
      return { id, label: localize(inst.label, lang), status: inst.status || "draft" };
    });
  }

  // Future API hook: recommendations will be based on performance by type/tag.
  function recommend() { return null; }

  return { classify, listInstitutions, recommend };
})();
