/* ============================================================
   PrepLab Question Forge · v0.9.9
   Turns Knowledge Base entries into DRAFT questions.

   Principles:
   - HONEST GENERATION ONLY: every generator declares the real data
     it requires. Missing data → { blocked: true, missing: [...] },
     never an invented placeholder question.
   - NOTHING publishes automatically. Every draft passes through
     edit → approve before it can be exported to the Question Bank.
   - Knowledge Base never depends on the Question Bank. This module
     reads the KB and *produces output in* bank format — one-way.

   LLM SEAM (future): registerGenerator(name, fn) accepts any
   generator with the same contract:
     fn(entry, context) → { drafts: [...] } | { blocked, missing }
   An AI generator plugs in here and its output flows through the
   exact same review pipeline. No pipeline changes needed.
   ============================================================ */

window.PrepLabQuestionForge = (() => {
  const STORAGE_KEY = "preplab.forge.drafts.v1";

  const store = {
    load() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { drafts: [], counters: { SC: 0, RS: 0, VM: 0, RSN: 0 } };
      } catch (e) {
        return { drafts: [], counters: { SC: 0, RS: 0, VM: 0, RSN: 0 } };
      }
    },
    save(data) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); return true; }
      catch (e) { return false; }
    }
  };

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function buildOptions(correct, distractors) {
    const raw = [correct, ...distractors.slice(0, 3)];
    const order = shuffle(raw.map((_, i) => i));
    return { options: order.map(i => raw[i]), answer: order.indexOf(0) };
  }

  // Same-POS, near-difficulty distractor entries. POS "unknown" is
  // never a valid distractor pool for grammar-sensitive types.
  function distractorEntries(entry, kb, { requirePos = false, count = 3 } = {}) {
    const posOK = w => !requirePos || (w.partOfSpeech === entry.partOfSpeech);
    const pool = kb.filter(w =>
      w.id !== entry.id &&
      posOK(w) &&
      w.word && w.translation &&
      Math.abs(w.difficulty - entry.difficulty) <= 1
    );
    // de-duplicate by translation AND by word
    const seen = new Set([entry.translation, entry.word.toLowerCase()]);
    const unique = [];
    for (const w of shuffle(pool)) {
      const key = w.translation + "|" + w.word.toLowerCase();
      if (seen.has(w.translation) || seen.has(w.word.toLowerCase())) continue;
      seen.add(w.translation); seen.add(w.word.toLowerCase());
      unique.push(w);
      if (unique.length >= count) break;
    }
    return unique;
  }

  // Exact-form containment: the example must contain the word exactly
  // (word-boundary match). We do NOT guess inflections — if the example
  // uses "allocated", the editor rewrites it or generation stays blocked.
  function exampleContainsWord(entry) {
    if (!entry.example) return false;
    const re = new RegExp("\\b" + entry.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i");
    return re.test(entry.example);
  }

  function replaceWord(sentence, word, replacement) {
    const re = new RegExp("\\b" + word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i");
    return sentence.replace(re, replacement);
  }

  /* ---------------- Generators ---------------- */

  const generators = {};

  function registerGenerator(name, fn) { generators[name] = fn; }

  // 1) Vocabulary Meaning — word → Hebrew translation
  registerGenerator("vocabularyMeaning", (entry, { kb }) => {
    const missing = [];
    if (!entry.translation) missing.push("translation");
    const d = distractorEntries(entry, kb, { requirePos: entry.partOfSpeech !== "unknown" });
    if (d.length < 3) missing.push("3 distractor entries with unique translations at similar difficulty");
    if (missing.length) return { blocked: true, missing };

    const { options, answer } = buildOptions(entry.translation, d.map(w => w.translation));
    return { drafts: [draftShell(entry, "vocabularyMeaning", {
      question: `What is the closest meaning of the word "${entry.word}"?`,
      options, answer,
      explanation: `"${entry.word}" means "${entry.translation}".` + (entry.definition ? ` Definition: ${entry.definition}` : "")
    })] };
  });

  // 2) Reading Sentence — meaning in context
  registerGenerator("readingSentence", (entry, { kb }) => {
    const missing = [];
    if (!entry.translation) missing.push("translation");
    if (!entry.example) missing.push("example sentence");
    else if (!exampleContainsWord(entry)) missing.push(`example must contain the exact word form "${entry.word}"`);
    const d = distractorEntries(entry, kb, { requirePos: entry.partOfSpeech !== "unknown" });
    if (d.length < 3) missing.push("3 distractor entries with unique translations");
    if (missing.length) return { blocked: true, missing };

    const { options, answer } = buildOptions(entry.translation, d.map(w => w.translation));
    return { drafts: [draftShell(entry, "readingSentence", {
      question: `According to the sentence: "${entry.example}" — the word "${entry.word}" most nearly means:`,
      options, answer,
      explanation: `In this context, "${entry.word}" means "${entry.translation}".` + (entry.definition ? ` (${entry.definition})` : "")
    })] };
  });

  // 3) Sentence Completion — blank the word inside its real example
  registerGenerator("sentenceCompletion", (entry, { kb }) => {
    const missing = [];
    if (!entry.example) missing.push("example sentence");
    else if (!exampleContainsWord(entry)) missing.push(`example must contain the exact word form "${entry.word}"`);
    if (entry.partOfSpeech === "unknown") missing.push("partOfSpeech (distractors must match grammatically)");
    const d = entry.partOfSpeech === "unknown" ? [] : distractorEntries(entry, kb, { requirePos: true });
    if (entry.partOfSpeech !== "unknown" && d.length < 3) missing.push(`3 more "${entry.partOfSpeech}" entries at similar difficulty`);
    if (missing.length) return { blocked: true, missing };

    const { options, answer } = buildOptions(entry.word, d.map(w => w.word));
    return { drafts: [draftShell(entry, "sentenceCompletion", {
      question: replaceWord(entry.example, entry.word, "____"),
      options, answer,
      explanation: `"${entry.word}" (${entry.translation}) fits the sentence.` + (entry.definition ? ` Definition: ${entry.definition}` : "")
    })] };
  });

  // 4) Restatement — synonym swap preserves meaning; antonym swap breaks it
  registerGenerator("restatement", (entry, { kb }) => {
    const missing = [];
    if (!entry.example) missing.push("example sentence");
    else if (!exampleContainsWord(entry)) missing.push(`example must contain the exact word form "${entry.word}"`);
    if (!entry.synonyms.length) missing.push("at least one synonym");
    if (entry.partOfSpeech === "unknown") missing.push("partOfSpeech");
    const fillers = entry.partOfSpeech === "unknown" ? [] : distractorEntries(entry, kb, { requirePos: true });
    const neededFillers = entry.antonyms.length ? 2 : 3;
    if (entry.partOfSpeech !== "unknown" && fillers.length < neededFillers) missing.push(`${neededFillers} more "${entry.partOfSpeech}" entries for distractors`);
    if (missing.length) return { blocked: true, missing };

    const correct = replaceWord(entry.example, entry.word, entry.synonyms[0]);
    const distractors = [];
    if (entry.antonyms.length) distractors.push(replaceWord(entry.example, entry.word, entry.antonyms[0]));
    for (const f of fillers) {
      if (distractors.length >= 3) break;
      distractors.push(replaceWord(entry.example, entry.word, f.word));
    }
    const { options, answer } = buildOptions(correct, distractors);
    return { drafts: [draftShell(entry, "restatement", {
      question: entry.example,
      options, answer,
      explanation: `"${entry.synonyms[0]}" is a synonym of "${entry.word}" (${entry.translation}), so it preserves the original meaning.` + (entry.antonyms.length ? ` "${entry.antonyms[0]}" reverses it.` : "")
    })] };
  });

  function draftShell(entry, type, body) {
    const now = new Date().toISOString();
    return {
      id: "draft_" + Math.random().toString(36).slice(2, 10),
      type,
      status: "draft",
      generator: "template-v1",
      sourceWordId: entry.id,
      sourceWord: entry.word,
      difficulty: entry.difficulty,
      topic: entry.topic,
      tags: ["vocab-forged", entry.topic.toLowerCase().replace(/\s+/g, "-")],
      createdAt: now,
      updatedAt: now,
      ...body
    };
  }

  /* ------------- Generation entry point ------------- */
  // Returns { results: { [type]: {drafts}|{blocked,missing} } } and
  // persists any produced drafts to the pipeline.
  function generateForEntry(entryId) {
    const kb = window.PrepLabVocabStore.all();
    const entry = window.PrepLabVocabStore.get(entryId);
    if (!entry) return { error: "entry not found" };

    const state = store.load();
    const results = {};
    for (const [name, fn] of Object.entries(generators)) {
      const out = fn(entry, { kb });
      results[name] = out;
      if (out.drafts) {
        // avoid piling identical pending drafts for the same word+type
        const dup = state.drafts.some(d => d.sourceWordId === entryId && d.type === name && d.status === "draft");
        if (!dup) state.drafts.push(...out.drafts);
        else out.skipped = "a pending draft of this type already exists for this word";
      }
    }
    store.save(state);
    return { results };
  }

  /* ------------- Draft pipeline ------------- */
  function drafts(filter = {}) {
    let list = store.load().drafts;
    if (filter.status) list = list.filter(d => d.status === filter.status);
    if (filter.sourceWordId) list = list.filter(d => d.sourceWordId === filter.sourceWordId);
    return list.slice().sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  }

  function updateDraft(id, patch) {
    const state = store.load();
    const d = state.drafts.find(x => x.id === id);
    if (!d) return null;
    const editable = ["question", "options", "answer", "explanation", "difficulty", "tags", "topic"];
    for (const k of editable) if (k in patch) d[k] = patch[k];
    d.updatedAt = new Date().toISOString();
    store.save(state);
    return d;
  }

  const BANK_PREFIX = { sentenceCompletion: "SC-V", restatement: "RS-V", vocabularyMeaning: "VM-V", readingSentence: "RSN-V" };
  const COUNTER_KEY = { sentenceCompletion: "SC", restatement: "RS", vocabularyMeaning: "VM", readingSentence: "RSN" };

  function approveDraft(id) {
    const state = store.load();
    const d = state.drafts.find(x => x.id === id);
    if (!d || d.status !== "draft") return null;
    // basic validity gate before approval
    if (!d.question || !Array.isArray(d.options) || d.options.length !== 4 || d.options.some(o => !String(o).trim()) || d.answer < 0 || d.answer > 3) {
      return { error: "Draft is incomplete: needs a question, 4 non-empty options and a valid answer index." };
    }
    const ck = COUNTER_KEY[d.type];
    state.counters[ck] = (state.counters[ck] || 0) + 1;
    d.status = "approved";
    d.bankId = BANK_PREFIX[d.type] + String(state.counters[ck]).padStart(3, "0");
    d.approvedAt = new Date().toISOString();
    store.save(state);
    return d;
  }

  function rejectDraft(id) {
    const state = store.load();
    const d = state.drafts.find(x => x.id === id);
    if (!d) return null;
    d.status = "rejected";
    d.updatedAt = new Date().toISOString();
    store.save(state);
    return d;
  }

  function deleteDraft(id) {
    const state = store.load();
    state.drafts = state.drafts.filter(x => x.id !== id);
    store.save(state);
  }

  /* ------------- Export (Question Bank format) ------------- */
  function toBankQuestion(d) {
    return {
      id: d.bankId,
      type: d.type,
      difficulty: d.difficulty,
      topic: d.topic,
      question: d.question,
      options: d.options,
      answer: d.answer,
      explanation: d.explanation,
      tags: d.tags,
      version: 1,
      createdAt: d.approvedAt,
      source: "vocab:" + d.sourceWordId
    };
  }

  // sentenceCompletion / restatement → existing bank sections.
  // vocabularyMeaning / readingSentence → "vocabulary" section
  // (stored now, served when the engine supports the type).
  function exportApproved() {
    const approved = drafts({ status: "approved" }).map(toBankQuestion);
    const sections = { sentenceCompletion: [], restatement: [], vocabulary: [] };
    for (const q of approved) {
      if (q.type === "sentenceCompletion") sections.sentenceCompletion.push(q);
      else if (q.type === "restatement") sections.restatement.push(q);
      else sections.vocabulary.push(q);
    }
    return sections;
  }

  // Paste-ready snippet: array elements to append inside the matching
  // arrays in questions/questionBank.js. Zero manual formatting.
  function exportAppendSnippet() {
    const s = exportApproved();
    let out = "";
    for (const [section, items] of Object.entries(s)) {
      if (!items.length) continue;
      out += `/* ---- Append inside PREPLAB_QUESTIONS.${section} ---- */\n`;
      out += items.map(q => JSON.stringify(q, null, 2)).join(",\n") + ",\n\n";
    }
    return out || "// No approved questions to export yet.";
  }

  function stats() {
    const list = store.load().drafts;
    return {
      generated: list.length,
      pending: list.filter(d => d.status === "draft").length,
      approved: list.filter(d => d.status === "approved").length,
      rejected: list.filter(d => d.status === "rejected").length
    };
  }

  function generatorNames() { return Object.keys(generators); }

  return {
    registerGenerator, generateForEntry, generatorNames,
    drafts, updateDraft, approveDraft, rejectDraft, deleteDraft,
    exportApproved, exportAppendSnippet, stats
  };
})();
