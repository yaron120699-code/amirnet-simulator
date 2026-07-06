/* ============================================================
   PrepLab Adaptive Engine · v0.9.5
   Live CAT-style selection: every question is chosen AFTER the
   previous answer, based on current ability. Options are
   shuffled per session to remove answer-position bias.
   Ability updates use a logistic (Elo/IRT-style) model.
   ============================================================ */

window.PrepLabAdaptiveEngine = (() => {
  function clampAbility(a, cfg) {
    return Math.max(cfg.minAbility, Math.min(cfg.maxAbility, a));
  }

  function nearestDifficulty(ability) {
    return Math.max(1, Math.min(5, Math.round(ability)));
  }

  // Fisher–Yates
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Shuffle option order and remap the correct-answer index.
  // Removes the bank's answer-position bias without editing the bank.
  function withShuffledOptions(q) {
    const order = shuffle(q.options.map((_, i) => i));
    return {
      ...q,
      options: order.map(i => q.options[i]),
      answer: order.indexOf(q.answer),
      originalAnswer: q.answer
    };
  }

  function pickFromPool(pool, targetDifficulty, usedIds, recentIds = new Set()) {
    const unused = pool.filter(q => !usedIds.has(q.id));
    if (!unused.length) return null;

    const choose = c => (c.length ? c[Math.floor(Math.random() * c.length)] : null);

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
      ...withShuffledOptions(q),
      type,
      // Metadata defaults (Part 1) — full schema without editing the bank:
      topic: q.topic || "general",
      subtopic: q.subtopic || null,
      tags: Array.isArray(q.tags) ? q.tags : [],
      version: q.version || 1,
      createdAt: q.createdAt || null,
      passageTitle: passage?.title || null,
      passage: passage?.passage || null,
      parentPassageId: passage?.id || null
    };
  }

  function passageDifficulty(p) {
    if (!p.questions || !p.questions.length) return 3;
    return p.questions.reduce((s, q) => s + (q.difficulty || 3), 0) / p.questions.length;
  }

  // Pick the unused passage whose average difficulty is closest
  // to the user's CURRENT ability (fresh passages preferred).
  function pickPassage(pool, ability, usedIds, recentIds) {
    const unused = pool.filter(p => !usedIds.has(p.id));
    if (!unused.length) return null;
    const fresh = unused.filter(p => !recentIds.has(p.id));
    const candidates = fresh.length ? fresh : unused;
    return candidates
      .map(p => ({ p, dist: Math.abs(passageDifficulty(p) - ability), r: Math.random() }))
      .sort((a, b) => a.dist - b.dist || a.r - b.r)[0].p;
  }

  /* ---- Logistic (Elo/IRT-style) ability update ----
     expected = P(correct | ability, difficulty)
     delta    = K * (actual - expected)
     K shrinks as the exam progresses, so early questions
     locate the user quickly and later ones fine-tune.       */
  function updateAbility(ability, isCorrect, wasAnswered, question, blueprint, answeredCount = 0) {
    const cfg = blueprint.adaptive;
    const kStart = cfg.kStart ?? 0.55;
    const kHalfLife = cfg.kHalfLife ?? 10;
    const k = kStart / (1 + answeredCount / kHalfLife);

    let delta;
    if (!wasAnswered) {
      delta = -k * (cfg.skipFactor ?? 0.35);
    } else {
      const expected = 1 / (1 + Math.exp(question.difficulty - ability));
      delta = k * ((isCorrect ? 1 : 0) - expected);
    }
    return clampAbility(ability + delta, cfg);
  }

  /* ---- Live adaptive session ----
     next(ability) returns ONE question chosen for the current
     ability, or null when the exam is complete.
     Phase 1: sentence completion (live-adaptive)
     Phase 2: restatement (live-adaptive)
     Phase 3: reading — passage chosen by ability at that moment,
              then its questions are served in passage order.    */
  function createSession(mode, blueprint, bank, recentIds = new Set()) {
    const template = blueprint.sectionTemplates[mode];
    const usedIds = new Set();

    const plan = [];
    for (let i = 0; i < template.sentenceCompletion.count; i++) plan.push("sentenceCompletion");
    for (let i = 0; i < template.restatement.count; i++) plan.push("restatement");

    const plannedTotal =
      plan.length + template.reading.passages * template.reading.questionsEach;

    let planIndex = 0;
    let passagesServed = 0;
    let passageQueue = [];

    function next(ability) {
      // Phase 1–2: discrete question types, chosen live.
      while (planIndex < plan.length) {
        const type = plan[planIndex++];
        const picked = pickFromPool(bank[type], nearestDifficulty(ability), usedIds, recentIds);
        if (!picked) continue; // pool exhausted for this slot — move on
        usedIds.add(picked.id);
        return normalizeQuestion(picked, type);
      }

      // Phase 3: reading passages.
      if (!passageQueue.length && passagesServed < template.reading.passages) {
        const passage = pickPassage(bank.reading, ability, usedIds, recentIds);
        if (passage) {
          usedIds.add(passage.id);
          passagesServed++;
          passageQueue = passage.questions
            .filter(q => !usedIds.has(q.id))
            .slice(0, template.reading.questionsEach)
            .map(q => {
              usedIds.add(q.id);
              return normalizeQuestion(q, "reading", passage);
            });
        } else {
          passagesServed = template.reading.passages;
        }
      }

      if (passageQueue.length) return passageQueue.shift();
      return null;
    }

    return { plannedTotal, next };
  }

  // Backward-compatible one-shot builder (tools / tests).
  function buildExam(mode, blueprint, bank, recentIds = new Set()) {
    const session = createSession(mode, blueprint, bank, recentIds);
    const items = [];
    let item;
    while ((item = session.next(blueprint.adaptive.startAbility)) !== null) items.push(item);
    return items;
  }

  return { createSession, buildExam, updateAbility, nearestDifficulty };
})();
