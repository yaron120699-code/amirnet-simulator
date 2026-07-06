window.PrepLabScoring = (() => {
  const clamp = (score) => Math.max(50, Math.min(150, Math.round(score)));

  function calculate(items, answers, abilityHistory, blueprint) {
    const total = items.length;
    const answered = answers.filter(a => a !== null && a !== undefined).length;
    const correct = items.reduce((sum, item, index) => sum + (answers[index] === item.answer ? 1 : 0), 0);
    const unanswered = total - answered;

    if (answered === 0) {
      return { score: 50, low: 50, high: 50, confidence: "Very Low", correct, total, answered, unanswered, accuracy: 0 };
    }

    const weightedPossible = items.reduce((sum, item) => sum + item.difficulty, 0);
    const weightedCorrect = items.reduce((sum, item, index) => sum + (answers[index] === item.answer ? item.difficulty : 0), 0);
    const weightedAccuracy = weightedPossible ? weightedCorrect / weightedPossible : 0;
    const rawAccuracy = correct / total;
    const finalAbility = abilityHistory.length ? abilityHistory[abilityHistory.length - 1] : blueprint.adaptive.startAbility;
    const abilityNormalized = (finalAbility - 1) / 4;

    const rawScore = 50 + (weightedAccuracy * 68) + (abilityNormalized * 32);
    const score = clamp(rawScore);

    let margin = 12;
    if (total >= 27 && answered / total > 0.9) margin = 6;
    else if (total >= 17 && answered / total > 0.75) margin = 8;
    if (unanswered > total * 0.25) margin += 4;

    const confidence = margin <= 6 ? "High" : margin <= 10 ? "Medium" : "Low";
    return {
      score,
      low: clamp(score - margin),
      high: clamp(score + margin),
      confidence,
      correct,
      total,
      answered,
      unanswered,
      accuracy: Math.round(rawAccuracy * 100),
      weightedAccuracy: Math.round(weightedAccuracy * 100),
      finalAbility: Math.round(finalAbility * 10) / 10
    };
  }

  return { clamp, calculate };
})();
