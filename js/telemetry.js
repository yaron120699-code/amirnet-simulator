/* ============================================================
   PrepLab Telemetry & Calibration Layer · v0.9.6
   Collects anonymous learning statistics locally so question
   difficulty, scoring and the adaptive engine can be calibrated
   against real usage.

   Design principles:
   - Mergeable aggregates: sums + counts, never averages, so a
     future backend (Supabase/Firebase/Postgres) can merge data
     from many devices with simple addition.
   - Single write path: recordSimulation(). Quality metrics are
     computed on read, never stored.
   - Fail-silent: telemetry must NEVER break the exam flow.

   Backend readiness: replace `store` with an adapter that POSTs
   the same JSON shape. Nothing else changes.
   ============================================================ */

window.PrepLabTelemetry = (() => {
  const SCHEMA_VERSION = 1;
  const STORAGE_KEY = "preplab.telemetry.v1";
  const MAX_STORED_SIMULATIONS = 30; // rolling window for diagnostics
  const MIN_SAMPLE = 10;             // answers needed before flagging a question

  /* ---- Storage adapter (the future-backend seam) ---- */
  const store = {
    load() {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null; }
      catch (e) { return null; }
    },
    save(data) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); return true; }
      catch (e) { return false; }
    },
    clear() {
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    }
  };

  function emptyState() {
    return {
      schemaVersion: SCHEMA_VERSION,
      totals: { simulations: 0 },
      questions: {},   // id -> aggregate stats
      simulations: []  // rolling diagnostic records
    };
  }

  function getState() {
    const s = store.load();
    if (!s || s.schemaVersion !== SCHEMA_VERSION) return emptyState();
    return s;
  }

  function emptyQuestionStats(version) {
    return {
      version: version || 1,
      shown: 0,
      correct: 0,
      incorrect: 0,
      skipped: 0,
      abilitySum: 0,        // avg ability when shown = abilitySum / shown
      solverScoreSum: 0,    // final scores of users who answered correctly
      solverCount: 0,
      failScoreSum: 0,      // final scores of users who answered incorrectly
      failCount: 0
    };
  }

  // P(correct) including the 4-option guessing floor. Used for
  // diagnostics and calibration comparisons (the engine's internal
  // update uses the pure logistic; this one models real behavior).
  function expectedSuccess(ability, difficulty) {
    return 0.25 + 0.75 / (1 + Math.exp(difficulty - ability));
  }

  /* ============================================================
     WRITE PATH — called once per completed simulation
     ============================================================ */
  function recordSimulation({ items, answers, abilityHistory, result, mode }) {
    const state = getState();
    state.totals.simulations++;

    const record = {
      at: new Date().toISOString(),
      mode: mode || null,
      score: result.score,
      low: result.low,
      high: result.high,
      confidence: result.confidence,
      abilityPath: abilityHistory.map(a => Math.round(a * 100) / 100),
      questions: []
    };

    items.forEach((item, i) => {
      // Reset stats when a question was edited (new version):
      // old-version data must not pollute new-version calibration.
      let stats = state.questions[item.id];
      if (!stats || (item.version && item.version !== stats.version)) {
        stats = state.questions[item.id] = emptyQuestionStats(item.version);
      }

      const abilityWhenShown = abilityHistory[i] != null
        ? abilityHistory[i]
        : abilityHistory[abilityHistory.length - 1];
      const answer = answers[i];
      const wasAnswered = answer !== null && answer !== undefined;
      const isCorrect = wasAnswered && answer === item.answer;

      stats.shown++;
      stats.abilitySum += abilityWhenShown;
      if (!wasAnswered) {
        stats.skipped++;
      } else if (isCorrect) {
        stats.correct++;
        stats.solverScoreSum += result.score;
        stats.solverCount++;
      } else {
        stats.incorrect++;
        stats.failScoreSum += result.score;
        stats.failCount++;
      }

      record.questions.push({
        id: item.id,
        type: item.type,
        difficulty: item.difficulty,
        outcome: !wasAnswered ? "skip" : (isCorrect ? "correct" : "wrong"),
        abilityWhenShown: Math.round(abilityWhenShown * 100) / 100,
        expectedSuccess: Math.round(expectedSuccess(abilityWhenShown, item.difficulty) * 100)
      });
    });

    state.simulations.push(record);
    if (state.simulations.length > MAX_STORED_SIMULATIONS) {
      state.simulations = state.simulations.slice(-MAX_STORED_SIMULATIONS);
    }

    store.save(state);
    return record;
  }

  /* ============================================================
     READ PATH — quality metrics, computed on demand
     ============================================================ */
  function analyzeQuestion(id, stats, meta, medianExposure) {
    const answered = stats.correct + stats.incorrect;
    const difficultyIndex = answered ? stats.correct / answered : null; // classical p-value
    const avgAbility = stats.shown ? stats.abilitySum / stats.shown : null;
    const avgSolverScore = stats.solverCount ? stats.solverScoreSum / stats.solverCount : null;
    const avgFailScore = stats.failCount ? stats.failScoreSum / stats.failCount : null;

    // Discrimination: approximation of point-biserial via the gap
    // between final scores of solvers vs. failers, normalized by a
    // typical score spread (20 pts). Requires minimal samples on
    // both sides to mean anything.
    let discrimination = null;
    if (stats.solverCount >= 3 && stats.failCount >= 3) {
      discrimination = Math.max(-1, Math.min(1, (avgSolverScore - avgFailScore) / 20));
    }

    const flags = [];
    let recommendation = "Not enough data";

    if (answered >= MIN_SAMPLE) {
      recommendation = "Looks calibrated";
      const expected = avgAbility != null
        ? expectedSuccess(avgAbility, meta?.difficulty ?? 3)
        : null;

      if (expected != null && difficultyIndex - expected > 0.15) {
        flags.push("too-easy");
        recommendation = "Increase difficulty";
      } else if (expected != null && expected - difficultyIndex > 0.15) {
        flags.push("too-hard");
        recommendation = "Decrease difficulty";
      }
      if (difficultyIndex >= 0.92 && !flags.includes("too-easy")) {
        flags.push("too-easy");
        recommendation = "Increase difficulty";
      }
      if (difficultyIndex <= 0.20) {
        // Below the 25% guessing floor — suspicious question or wrong key.
        if (!flags.includes("too-hard")) flags.push("too-hard");
        recommendation = "Review question / answer key";
      }
      if (discrimination !== null && discrimination < 0.15) {
        flags.push("poor-discriminator");
        if (recommendation === "Looks calibrated") recommendation = "Review distractors";
      }
    }
    if (medianExposure > 0 && stats.shown > Math.max(20, medianExposure * 3)) {
      flags.push("overused");
    }

    return {
      id,
      version: stats.version,
      type: meta?.type || null,
      declaredDifficulty: meta?.difficulty ?? null,
      topic: meta?.topic || "general",
      exposure: stats.shown,
      answered,
      skipped: stats.skipped,
      correct: stats.correct,
      incorrect: stats.incorrect,
      difficultyIndex: difficultyIndex != null ? Math.round(difficultyIndex * 100) / 100 : null,
      avgAbility: avgAbility != null ? Math.round(avgAbility * 100) / 100 : null,
      avgSolverScore: avgSolverScore != null ? Math.round(avgSolverScore) : null,
      avgFailScore: avgFailScore != null ? Math.round(avgFailScore) : null,
      discrimination: discrimination != null ? Math.round(discrimination * 100) / 100 : null,
      flags,
      recommendation
    };
  }

  // Flattens the question bank into id -> metadata for report joins.
  function bankIndex(bank) {
    const index = {};
    if (!bank) return index;
    (bank.sentenceCompletion || []).forEach(q => index[q.id] = { ...q, type: "sentenceCompletion" });
    (bank.restatement || []).forEach(q => index[q.id] = { ...q, type: "restatement" });
    (bank.reading || []).forEach(p => (p.questions || []).forEach(q => index[q.id] = { ...q, type: "reading" }));
    return index;
  }

  function report(bank) {
    const state = getState();
    const index = bankIndex(bank);
    const exposures = Object.values(state.questions).map(s => s.shown).sort((a, b) => a - b);
    const medianExposure = exposures.length ? exposures[Math.floor(exposures.length / 2)] : 0;

    const rows = Object.entries(state.questions)
      .map(([id, stats]) => analyzeQuestion(id, stats, index[id], medianExposure))
      .sort((a, b) => b.exposure - a.exposure);

    return {
      generatedAt: new Date().toISOString(),
      totals: { ...state.totals, questionsWithData: rows.length, medianExposure },
      rows
    };
  }

  function lastSimulations(n = 5) {
    return getState().simulations.slice(-n).reverse();
  }

  function exportJSON() {
    const state = getState();
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `preplab-telemetry-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function reset() { store.clear(); }

  return { recordSimulation, report, lastSimulations, exportJSON, reset, expectedSuccess };
})();
