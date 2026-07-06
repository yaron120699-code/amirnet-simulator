window.PrepLabAdaptiveEngine = (() => {
  function nearestDifficulty(ability) {
    return Math.max(1, Math.min(5, Math.round(ability)));
  }

  function pickFromPool(pool, targetDifficulty, usedIds) {
    const unused = pool.filter(q => !usedIds.has(q.id));
    if (!unused.length) return null;
    const exact = unused.filter(q => q.difficulty === targetDifficulty);
    if (exact.length) return exact[Math.floor(Math.random() * exact.length)];
    const adjacent = unused.filter(q => Math.abs(q.difficulty - targetDifficulty) === 1);
    if (adjacent.length) return adjacent[Math.floor(Math.random() * adjacent.length)];
    return unused[Math.floor(Math.random() * unused.length)];
  }

  function normalizeQuestion(q, type, passage = null) {
    return {
      ...q,
      type,
      passageTitle: passage?.title || null,
      passage: passage?.passage || null
    };
  }

  function buildExam(mode, blueprint, bank) {
    const template = blueprint.sectionTemplates[mode];
    const usedIds = new Set();
    const items = [];
    let ability = blueprint.adaptive.startAbility;
    const plannedTypes = [];

    for (let i = 0; i < template.sentenceCompletion.count; i++) plannedTypes.push("sentenceCompletion");
    for (let i = 0; i < template.restatement.count; i++) plannedTypes.push("restatement");

    plannedTypes.forEach(type => {
      const target = nearestDifficulty(ability);
      const picked = pickFromPool(bank[type], target, usedIds);
      if (picked) {
        usedIds.add(picked.id);
        items.push(normalizeQuestion(picked, type));
        // planned path nudges upward slightly so early correct answers can meet harder questions
        ability = Math.min(blueprint.adaptive.maxAbility, ability + 0.05);
      }
    });

    const readingPool = [...bank.reading].sort(() => Math.random() - 0.5);
    readingPool.slice(0, template.reading.passages).forEach(passage => {
      passage.questions.slice(0, template.reading.questionsEach).forEach(q => {
        items.push(normalizeQuestion(q, "reading", passage));
      });
    });

    return items;
  }

  function updateAbility(ability, isCorrect, wasAnswered, question, blueprint) {
    const cfg = blueprint.adaptive;
    let delta;
    if (!wasAnswered) delta = -cfg.unansweredPenalty;
    else if (isCorrect) delta = cfg.correctStep * (question.difficulty / 3);
    else delta = -cfg.wrongStep * ((6 - question.difficulty) / 3);
    return Math.max(cfg.minAbility, Math.min(cfg.maxAbility, ability + delta));
  }

  return { buildExam, updateAbility, nearestDifficulty };
})();
