window.PREPLAB_BLUEPRINT = {
  version: "v0.9.6 Placement Blueprint",
  examName: "Amirnet Simulation",
  scoreRange: { min: 50, max: 150 },
  timing: {
    fullMinutes: 50,
    quickMinutes: 20
  },
  adaptive: {
    startAbility: 3.0,
    minAbility: 1,
    maxAbility: 5,
    // Logistic (Elo/IRT-style) update:
    // delta = K * (actual - expected), expected = 1/(1+e^(difficulty-ability))
    kStart: 0.55,     // initial step size — how fast the exam "finds" the user
    kHalfLife: 10,    // after this many questions, K is halved (stabilizes)
    skipFactor: 0.35  // skipped question costs K * skipFactor
  },
  sectionTemplates: {
    full: {
      label: "Full Simulation",
      sentenceCompletion: { count: 11 },
      restatement: { count: 6 },
      reading: { passages: 2, questionsEach: 5 }
    },
    quick: {
      label: "Quick Simulation",
      sentenceCompletion: { count: 8 },
      restatement: { count: 4 },
      reading: { passages: 1, questionsEach: 5 }
    }
  }
};
