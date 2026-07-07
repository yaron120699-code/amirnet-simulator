/* ============================================================
   PrepLab Vocabulary Store (Knowledge Base layer) · v0.9.9

   ARCHITECTURAL RULE: this module NEVER reads or references the
   Question Bank. The Question Bank depends on the Knowledge Base,
   never the reverse.

   Data model:
   - Seed: window.PREPLAB_VOCABULARY (data/vocabularyBank.js, in repo)
   - Overlay: localStorage edits/additions by the admin
   - merged view = seed patched by overlay (overlay wins by id)
   - exportBankFile() regenerates a full vocabularyBank.js for commit

   Full entry schema (missing fields get defaults on read):
   id, word, translation, difficulty, partOfSpeech, topic, frequency,
   definition, synonyms[], antonyms[], example, source, tags[],
   status, createdAt, updatedAt
   ============================================================ */

window.PrepLabVocabStore = (() => {
  const STORAGE_KEY = "preplab.kb.vocab.v1";

  const store = {
    load() {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { entries: {}, deleted: [] }; }
      catch (e) { return { entries: {}, deleted: [] }; }
    },
    save(data) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); return true; }
      catch (e) { return false; }
    }
  };

  function normalize(e) {
    return {
      id: e.id,
      word: e.word || "",
      translation: e.translation || "",
      difficulty: Number(e.difficulty) || 3,
      partOfSpeech: e.partOfSpeech || "unknown",
      topic: e.topic || "General Academic",
      frequency: e.frequency || "medium",
      definition: e.definition || "",
      synonyms: Array.isArray(e.synonyms) ? e.synonyms : [],
      antonyms: Array.isArray(e.antonyms) ? e.antonyms : [],
      example: e.example || "",
      source: e.source || "unknown",
      tags: Array.isArray(e.tags) ? e.tags : [],
      status: e.status || "draft",
      createdAt: e.createdAt || null,
      updatedAt: e.updatedAt || null
    };
  }

  function all() {
    const overlay = store.load();
    const seed = window.PREPLAB_VOCABULARY || [];
    const map = new Map();
    seed.forEach(e => map.set(e.id, normalize(e)));
    Object.values(overlay.entries).forEach(e => map.set(e.id, normalize(e)));
    (overlay.deleted || []).forEach(id => map.delete(id));
    return [...map.values()];
  }

  function get(id) {
    return all().find(e => e.id === id) || null;
  }

  function nextId() {
    const ids = all().map(e => e.id).filter(id => /^v_\d+$/.test(id));
    const max = ids.reduce((m, id) => Math.max(m, parseInt(id.slice(2), 10)), 0);
    return "v_" + String(max + 1).padStart(4, "0");
  }

  function save(entry) {
    const overlay = store.load();
    const now = new Date().toISOString();
    const existing = get(entry.id);
    const merged = normalize({
      ...(existing || {}),
      ...entry,
      id: entry.id || nextId(),
      createdAt: existing?.createdAt || entry.createdAt || now,
      updatedAt: now
    });
    overlay.entries[merged.id] = merged;
    overlay.deleted = (overlay.deleted || []).filter(id => id !== merged.id);
    store.save(overlay);
    return merged;
  }

  function remove(id) {
    const overlay = store.load();
    delete overlay.entries[id];
    if (!overlay.deleted.includes(id)) overlay.deleted.push(id);
    store.save(overlay);
  }

  /* Search & filters: word/translation text, difficulty, topic,
     partOfSpeech, source, and data-completeness (workflow queue). */
  function search({ text = "", difficulty = "", topic = "", partOfSpeech = "", source = "", missing = "" } = {}) {
    const q = text.trim().toLowerCase();
    return all().filter(e => {
      if (q && !(e.word.toLowerCase().includes(q) || e.translation.includes(text.trim()) || e.topic.toLowerCase().includes(q))) return false;
      if (difficulty && e.difficulty !== Number(difficulty)) return false;
      if (topic && e.topic !== topic) return false;
      if (partOfSpeech && e.partOfSpeech !== partOfSpeech) return false;
      if (source && e.source !== source) return false;
      if (missing === "example" && e.example) return false;
      if (missing === "synonyms" && e.synonyms.length) return false;
      if (missing === "pos" && e.partOfSpeech !== "unknown") return false;
      if (missing === "enriched" && !(e.example && e.synonyms.length && e.partOfSpeech !== "unknown")) return false;
      return true;
    });
  }

  function facets() {
    const entries = all();
    const topics = [...new Set(entries.map(e => e.topic))].sort();
    const sources = [...new Set(entries.map(e => e.source))].sort();
    const pos = [...new Set(entries.map(e => e.partOfSpeech))].sort();
    return { topics, sources, pos };
  }

  function stats() {
    const entries = all();
    const byDifficulty = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const byTopic = {};
    let enriched = 0;
    for (const e of entries) {
      byDifficulty[e.difficulty] = (byDifficulty[e.difficulty] || 0) + 1;
      byTopic[e.topic] = (byTopic[e.topic] || 0) + 1;
      if (e.example && e.synonyms.length && e.partOfSpeech !== "unknown") enriched++;
    }
    return { total: entries.length, byDifficulty, byTopic, enriched };
  }

  // Regenerates the full data/vocabularyBank.js content for committing
  // the current working state back into the repo.
  function exportBankFile() {
    const body = JSON.stringify(all(), null, 2);
    return "window.PREPLAB_VOCABULARY = " + body + ";\n";
  }

  function exportJSON() {
    return JSON.stringify({ exportedAt: new Date().toISOString(), entries: all() }, null, 2);
  }

  function pendingOverlayCount() {
    const overlay = store.load();
    return Object.keys(overlay.entries).length + (overlay.deleted || []).length;
  }

  function resetOverlay() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  }

  return { all, get, save, remove, search, facets, stats, exportBankFile, exportJSON, nextId, pendingOverlayCount, resetOverlay };
})();
