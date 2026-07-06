window.PrepLabAdaptiveEngine = (() => {
  function nearestDifficulty(ability) {
    return Math.max(1, Math.min(5, Math.round(ability)));
  }

  function pickFromPool(pool, targetDifficulty, usedIds, recentIds = new Set()) {
    const unused = pool.filter(q => !usedIds.has(q.id));
    if (!unused.length) return null;

    function choose(candidates) {
      if (!candidates.length) return null;
      return candidates[Math.floor(Math.random() * candidates.length)];
    }

    const tiers = [
      unused.filter(q => q.difficulty === targetDifficulty && !recentIds.has(q.id)),
      unused.filter(q => Math.abs(q.difficulty - targetDifficulty) === 1 && !recentIds.has(q.id)),
      unused.filter(q => !recentIds.has(q.id)),
      unused.filter(q => q.difficulty === targetDifficulty),
      unused.filter(q => Math.abs(q.difficulty - targetDifficulty) === 1),
      unused
    ];

    for (const tier of tiers) {
      const picked = choose(tier);
      if (picked) return picked;
    }
    return null;
  }

  function normalizeQuestion(q, type, passage = null) {
    return {
      ...q,
      type,
      passageTitle: passage?.title || null,
      passage: passage?.passage || null,
      parentPassageId: passage?.id || null
    };
  }

  function buildExam(mode, blueprint, bank, recentIds = new Set()) {
    const template = blueprint.sectionTemplates[mode];
    const usedIds = new Set();
    const items = [];
    let ability = blueprint.adaptive.startAbility;
    const plannedTypes = [];

    for (let i = 0; i < template.sentenceCompletion.count; i++) plannedTypes.push("sentenceCompletion");
    for (let i = 0; i < template.restatement.count; i++) plannedTypes.push("restatement");

    plannedTypes.forEach(type => {
      const target = nearestDifficulty(ability);
      const picked = pickFromPool(bank[type], target, usedIds, recentIds);
      if (picked) {
        usedIds.add(picked.id);
        items.push(normalizeQuestion(picked, type));
        ability = Math.min(blueprint.adaptive.maxAbility, ability + 0.05);
      }
    });

    const readingPool = [...bank.reading]
      .sort((a, b) => {
        const aRecent = recentIds.has(a.id) ? 1 : 0;
        const bRecent = recentIds.has(b.id) ? 1 : 0;
        if (aRecent !== bRecent) return aRecent - bRecent;
        return Math.random() - 0.5;
      });

    readingPool.slice(0, template.reading.passages).forEach(passage => {
      usedIds.add(passage.id);
      const qs = passage.questions
        .filter(q => !usedIds.has(q.id))
        .sort(() => Math.random() - 0.5)
        .slice(0, template.reading.questionsEach);
      qs.forEach(q => {
        usedIds.add(q.id);
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
