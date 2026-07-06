window.PREPLAB_BLUEPRINT = {
  version: "v0.7 Adaptive Blueprint",
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
    correctStep: 0.35,
    wrongStep: 0.45,
    unansweredPenalty: 0.2,
    exactMatchWeight: 0.72,
    adjacentMatchWeight: 0.22,
    randomWeight: 0.06
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
