/* ============================================================
   PrepLab Adaptive Engine · v1.1.1
   Live CAT-style selection: every question is chosen AFTER the
   previous answer, based on current ability. Options are
   shuffled per session to remove answer-position bias.

   v1.1.0 stabilization:
   - probabilistic difficulty targeting instead of hard rounding
   - stronger recent-question avoidance
   - weighted pool selection for fresher simulations
   - selection diagnostics for hidden developer mode

   v1.1.1 calibration & time analytics:
   - decision-log strings for extended developer debug mode
   (selection/ability logic unchanged from v1.1.0)
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

  function weightedPick(items, weightFn) {
    if (!items.length) return null;
    const weighted = items.map(item => ({ item, weight: Math.max(0.0001, weightFn(item)) }));
    const total = weighted.reduce((sum, x) => sum + x.weight, 0);
    let roll = Math.random() * total;
    for (const x of weighted) {
      roll -= x.weight;
      if (roll <= 0) return x.item;
    }
    return weighted[weighted.length - 1].item;
  }

  function selectTargetDifficulty(ability, cfg) {
    const temperature = cfg.selectionTemperature ?? 0.85;
    const difficulties = [1, 2, 3, 4, 5];
    return weightedPick(difficulties, d => Math.exp(-Math.abs(d - ability) / temperature));
  }

  // Shuffle option order and remap the correct-answer index.
  // Removes the bank's answer-position bias without editing the bank.
  function withShuffledOptions(q) {
    const order = shuffle(q.options.map((_, i) => i));
    return {
      ...q,
      options: order.map(i => q.options[i]),
      answer: order.indexOf(q.answer),
      originalAnswer: q.answer,
      optionOrder: order
    };
  }

  function pickFromPool(pool, ability, usedIds, recentIds = new Set(), cfg = {}) {
    const unused = pool.filter(q => !usedIds.has(q.id));
    if (!unused.length) return null;

    const targetDifficulty = selectTargetDifficulty(ability, cfg);
    const fresh = unused.filter(q => !recentIds.has(q.id));
    const candidates = fresh.length ? fresh : unused;
    const freshnessMode = fresh.length ? "fresh" : "recent-fallback";
    const temperature = cfg.selectionTemperature ?? 0.85;

    const picked = weightedPick(candidates, q => {
      const distance = Math.abs((q.difficulty || 3) - targetDifficulty);
      const abilityDistance = Math.abs((q.difficulty || 3) - ability);
      const difficultyWeight = Math.exp(-distance / temperature);
      const abilityWeight = Math.exp(-abilityDistance / (temperature + 0.35));
      const jitter = 0.85 + Math.random() * 0.3;
      return difficultyWeight * abilityWeight * jitter;
    });

    if (!picked) return null;
    const roundedAbility = Math.round(ability * 10) / 10;
    return {
      question: picked,
      debug: {
        abilityBeforeSelection: Math.round(ability * 100) / 100,
        targetDifficulty,
        selectedDifficulty: picked.difficulty || 3,
        candidatePoolSize: candidates.length,
        totalUnusedPoolSize: unused.length,
        freshnessMode,
        selectionReason: `weighted ${freshnessMode} match near ability ${roundedAbility}`,
        decisionLog: `ability ${roundedAbility} → target difficulty ${targetDifficulty} → picked difficulty ${picked.difficulty || 3} ` +
          `from ${candidates.length}/${unused.length} candidates (${freshnessMode})`
      }
    };
  }

  function normalizeQuestion(q, type, passage = null, debug = null) {
    return {
      ...withShuffledOptions(q),
      type,
      passageTitle: passage?.title || null,
      passage: passage?.passage || null,
      parentPassageId: passage?.id || null,
      _debug: debug || null
    };
  }

  function passageDifficulty(p) {
    if (!p.questions || !p.questions.length) return 3;
    return p.questions.reduce((s, q) => s + (q.difficulty || 3), 0) / p.questions.length;
  }

  // Pick a passage near the user's CURRENT ability, with randomness.
  function pickPassage(pool, ability, usedIds, recentIds, cfg = {}) {
    const unused = pool.filter(p => !usedIds.has(p.id));
    if (!unused.length) return null;
    const fresh = unused.filter(p => !recentIds.has(p.id));
    const candidates = fresh.length ? fresh : unused;
    const temperature = cfg.selectionTemperature ?? 0.85;

    const passage = weightedPick(candidates, p => {
      const dist = Math.abs(passageDifficulty(p) - ability);
      return Math.exp(-dist / (temperature + 0.45)) * (0.85 + Math.random() * 0.3);
    });

    if (!passage) return null;
    const roundedAbility = Math.round(ability * 10) / 10;
    const freshnessMode = fresh.length ? "fresh" : "recent-fallback";
    return {
      passage,
      debug: {
        abilityBeforeSelection: Math.round(ability * 100) / 100,
        selectedDifficulty: Math.round(passageDifficulty(passage) * 10) / 10,
        candidatePoolSize: candidates.length,
        totalUnusedPoolSize: unused.length,
        freshnessMode,
        selectionReason: `weighted passage match near ability ${roundedAbility}`,
        decisionLog: `ability ${roundedAbility} → passage difficulty ${Math.round(passageDifficulty(passage) * 10) / 10} ` +
          `from ${candidates.length}/${unused.length} candidates (${freshnessMode})`
      }
    };
  }

  /* ---- Logistic (Elo/IRT-style) ability update ---- */
  function updateAbility(ability, isCorrect, wasAnswered, question, blueprint, answeredCount = 0) {
    const cfg = blueprint.adaptive;
    const kStart = cfg.kStart ?? 0.55;
    const kHalfLife = cfg.kHalfLife ?? 10;
    const k = kStart / (1 + answeredCount / kHalfLife);

    let delta;
    if (!wasAnswered) {
      delta = -k * (cfg.skipFactor ?? 0.35);
    } else {
      const expected = 1 / (1 + Math.exp((question.difficulty || 3) - ability));
      delta = k * ((isCorrect ? 1 : 0) - expected);
    }
    return clampAbility(ability + delta, cfg);
  }

  /* ---- Live adaptive session ---- */
  function createSession(mode, blueprint, bank, recentIds = new Set()) {
    const template = blueprint.sectionTemplates[mode];
    const cfg = blueprint.adaptive || {};
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
        const picked = pickFromPool(bank[type], ability, usedIds, recentIds, cfg);
        if (!picked) continue; // pool exhausted for this slot — move on
        usedIds.add(picked.question.id);
        return normalizeQuestion(picked.question, type, null, picked.debug);
      }

      // Phase 3: reading passages.
      if (!passageQueue.length && passagesServed < template.reading.passages) {
        const pickedPassage = pickPassage(bank.reading, ability, usedIds, recentIds, cfg);
        if (pickedPassage) {
          const passage = pickedPassage.passage;
          usedIds.add(passage.id);
          passagesServed++;
          passageQueue = passage.questions
            .filter(q => !usedIds.has(q.id))
            .slice(0, template.reading.questionsEach)
            .map((q, index) => {
              usedIds.add(q.id);
              return normalizeQuestion(q, "reading", passage, {
                ...pickedPassage.debug,
                passageQuestionIndex: index + 1,
                selectionReason: index === 0
                  ? pickedPassage.debug.selectionReason
                  : "served from selected reading passage"
              });
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
    let ability = blueprint.adaptive.startAbility;
    let item;
    while ((item = session.next(ability)) !== null) items.push(item);
    return items;
  }

  return { createSession, buildExam, updateAbility, nearestDifficulty, selectTargetDifficulty };
})();
