/* ============================================================
   PrepLab Vocabulary Engine · v0.9.8
   Internal vocabulary layer: turns word entries into draft items.
   Drafts require human review before entering questionBank.js.
   ============================================================ */

window.PrepLabVocabularyEngine = (() => {
  const bank = () => window.PREPLAB_VOCABULARY || [];

  function byLevel(level) {
    return bank().filter(w => Number(w.difficulty) === Number(level));
  }

  function search(query = "") {
    const q = query.trim().toLowerCase();
    if (!q) return bank();
    return bank().filter(w =>
      w.word.toLowerCase().includes(q) ||
      (w.translation || "").includes(query) ||
      (w.topic || "").toLowerCase().includes(q)
    );
  }

  function stats() {
    const items = bank();
    const byDifficulty = {1:0,2:0,3:0,4:0,5:0};
    const byTopic = {};
    for (const item of items) {
      byDifficulty[item.difficulty] = (byDifficulty[item.difficulty] || 0) + 1;
      byTopic[item.topic] = (byTopic[item.topic] || 0) + 1;
    }
    return { total: items.length, byDifficulty, byTopic };
  }

  function sampleDistractors(target, count = 3) {
    const sameLevel = bank().filter(w => w.id !== target.id && w.difficulty === target.difficulty);
    const nearLevel = bank().filter(w => w.id !== target.id && Math.abs(w.difficulty - target.difficulty) <= 1);
    const pool = sameLevel.length >= count ? sameLevel : nearLevel;
    return shuffle(pool).slice(0, count);
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function templateFor(word) {
    const topic = word.topic || "General Academic";
    if (topic === "Government") return `The new policy was designed to ____ outdated regulations.`;
    if (topic === "Business") return `The company tried to ____ its position in the market.`;
    if (topic === "Health") return `Researchers attempted to ____ the causes of the condition.`;
    if (topic === "Science") return `The study helped scientists ____ the phenomenon more clearly.`;
    if (topic === "Nature") return `The changes in the environment may ____ several species.`;
    if (topic === "Culture") return `The article attempts to ____ the cultural significance of the work.`;
    return `The report helped readers ____ the issue more clearly.`;
  }

  function generateVocabularyQuestion(word) {
    const distractors = sampleDistractors(word, 3);
    const optionsRaw = [word, ...distractors].map(w => w.translation);
    const order = shuffle(optionsRaw.map((_, i) => i));
    return {
      id: `VQ-${word.id}-${Date.now()}`,
      type: "vocabulary",
      difficulty: word.difficulty,
      topic: word.topic,
      tags: ["vocabulary", ...(word.tags || [])],
      status: "draft",
      sourceWordId: word.id,
      question: `What is the closest Hebrew meaning of “${word.word}”?`,
      options: order.map(i => optionsRaw[i]),
      answer: order.indexOf(0),
      explanation: `“${word.word}” means: ${word.translation}. Human review required before publishing.`
    };
  }

  function generateSentenceCompletionDraft(word) {
    const distractors = sampleDistractors(word, 3);
    const optionsRaw = [word, ...distractors].map(w => w.word);
    const order = shuffle(optionsRaw.map((_, i) => i));
    return {
      id: `SC-DRAFT-${word.id}-${Date.now()}`,
      type: "sentenceCompletion",
      difficulty: word.difficulty,
      topic: word.topic,
      tags: ["sentence-completion", "vocabulary-draft", ...(word.tags || [])],
      status: "draft",
      sourceWordId: word.id,
      question: templateFor(word),
      options: order.map(i => optionsRaw[i]),
      answer: order.indexOf(0),
      explanation: `Target word: ${word.word} (${word.translation}). This is an auto-generated draft and must be reviewed for semantic fit.`
    };
  }

  function generateRestatementPrompt(word) {
    return {
      id: `RS-PROMPT-${word.id}-${Date.now()}`,
      type: "restatementPrompt",
      difficulty: word.difficulty,
      topic: word.topic,
      status: "draft",
      sourceWordId: word.id,
      prompt: `Create a Restatement question using the word “${word.word}” (${word.translation}). The correct answer should preserve the original meaning, and the distractors should change logic, scope, or cause/effect. Difficulty: ${word.difficulty}/5.`,
      note: "Use this as an AI/human prompt. Do not publish directly."
    };
  }

  function generateBundle(word) {
    return {
      word,
      drafts: [
        generateVocabularyQuestion(word),
        generateSentenceCompletionDraft(word),
        generateRestatementPrompt(word)
      ]
    };
  }

  return { search, byLevel, stats, generateBundle, generateVocabularyQuestion, generateSentenceCompletionDraft, generateRestatementPrompt };
})();
