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

  const KNOWLEDGE_TYPES = ["vocabulary", "phrasalVerb", "idiom", "academicExpression", "grammarPattern"];

  function normalize(e) {
    return {
      id: e.id,
      type: KNOWLEDGE_TYPES.includes(e.type) ? e.type : "vocabulary",
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
      forms: Array.isArray(e.forms) ? e.forms : [],
      source: e.source || "unknown",
      tags: Array.isArray(e.tags) ? e.tags : [],
      status: e.status || "draft",
      manualEdit: e.manualEdit === true,
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

  function save(entry, opts = {}) {
    const overlay = store.load();
    const now = new Date().toISOString();
    const existing = get(entry.id);
    const merged = normalize({
      ...(existing || {}),
      ...entry,
      id: entry.id || nextId(),
      // Manual saves set the flag so imports never overwrite them.
      // Import saves pass { fromImport: true } and preserve the prior flag.
      manualEdit: opts.fromImport ? (existing?.manualEdit === true) : true,
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
  function search({ text = "", type = "", difficulty = "", topic = "", partOfSpeech = "", source = "", missing = "" } = {}) {
    const q = text.trim().toLowerCase();
    return all().filter(e => {
      if (q && !(e.word.toLowerCase().includes(q) || e.translation.includes(text.trim()) || e.topic.toLowerCase().includes(q))) return false;
      if (type && e.type !== type) return false;
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
    const byType = {};
    let enriched = 0;
    for (const e of entries) {
      byDifficulty[e.difficulty] = (byDifficulty[e.difficulty] || 0) + 1;
      byTopic[e.topic] = (byTopic[e.topic] || 0) + 1;
      byType[e.type] = (byType[e.type] || 0) + 1;
      if (e.example && e.synonyms.length && e.partOfSpeech !== "unknown") enriched++;
    }
    return { total: entries.length, byDifficulty, byTopic, byType, enriched };
  }

  /* ============================================================
     IMPORT ENGINE — CSV / JSON / TXT → normalized entries → merge
     Merge policy:
       - new (by type+word)              → add
       - existing, not manually edited   → fill EMPTY fields only
       - existing, manualEdit === true   → skip entirely
     ============================================================ */

  function keyOf(type, word) {
    return (type || "vocabulary") + "::" + String(word || "").trim().toLowerCase();
  }

  // Minimal RFC-4180-ish CSV parser (handles quotes, commas, newlines).
  function parseCSV(text) {
    const rows = [];
    let row = [], field = "", inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i], next = text[i + 1];
      if (inQuotes) {
        if (c === '"' && next === '"') { field += '"'; i++; }
        else if (c === '"') inQuotes = false;
        else field += c;
      } else {
        if (c === '"') inQuotes = true;
        else if (c === ",") { row.push(field); field = ""; }
        else if (c === "\r") { /* skip */ }
        else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
        else field += c;
      }
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }
    if (!rows.length) return [];
    const headers = rows[0].map(h => h.trim());
    return rows.slice(1).filter(r => r.some(c => c.trim())).map(r => {
      const obj = {};
      headers.forEach((h, idx) => obj[h] = (r[idx] ?? "").trim());
      return obj;
    });
  }

  const LIST_FIELDS = ["synonyms", "antonyms", "forms", "tags"];

  function coerceEntry(raw) {
    const e = { ...raw };
    for (const f of LIST_FIELDS) {
      if (typeof e[f] === "string") {
        e[f] = e[f].split(/[;|]/).map(s => s.trim()).filter(Boolean);
      }
    }
    if (e.difficulty != null) e.difficulty = Number(e.difficulty) || 3;
    return e;
  }

  // Parse raw text of a given format into an array of raw entry objects.
  function parseImport(text, format) {
    if (format === "json") {
      const data = JSON.parse(text);
      const arr = Array.isArray(data) ? data : (data.entries || data.PREPLAB_VOCABULARY || []);
      return arr.map(coerceEntry);
    }
    if (format === "csv") {
      return parseCSV(text).map(coerceEntry);
    }
    if (format === "txt") {
      // One entry per line. "word" or "word<TAB>translation" or
      // "word = translation". Everything else defaults.
      return text.split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(line => {
        let word = line, translation = "";
        const m = line.split(/\t|\s=\s|\s\|\s/);
        if (m.length >= 2) { word = m[0].trim(); translation = m[1].trim(); }
        return coerceEntry({ word, translation });
      });
    }
    throw new Error("Unsupported format: " + format);
  }

  // Compute what an import WOULD do without writing. Returns a plan.
  function planImport(rawEntries, defaults = {}) {
    const existing = all();
    const byKey = new Map(existing.map(e => [keyOf(e.type, e.word), e]));
    const plan = { added: [], enriched: [], skippedManual: [], skippedNoWord: [], total: rawEntries.length };

    for (const raw of rawEntries) {
      const type = raw.type || defaults.type || "vocabulary";
      const word = (raw.word || "").trim();
      if (!word) { plan.skippedNoWord.push(raw); continue; }
      const key = keyOf(type, word);
      const match = byKey.get(key);
      const entry = normalize({ ...defaults, ...raw, type, word });

      if (!match) {
        plan.added.push(entry);
      } else if (match.manualEdit) {
        plan.skippedManual.push({ word, id: match.id });
      } else {
        // enrich: which empty fields would be filled?
        const fills = {};
        for (const [k, v] of Object.entries(entry)) {
          if (["id", "createdAt", "updatedAt", "manualEdit"].includes(k)) continue;
          const cur = match[k];
          const curEmpty = cur === "" || cur === "unknown" || (Array.isArray(cur) && !cur.length) || cur == null;
          const newHas = !(v === "" || v === "unknown" || (Array.isArray(v) && !v.length) || v == null);
          if (curEmpty && newHas) fills[k] = v;
        }
        if (Object.keys(fills).length) plan.enriched.push({ id: match.id, word, fills });
      }
    }
    return plan;
  }

  // Execute a plan (or a fresh import). Writes to the overlay.
  function applyImport(rawEntries, defaults = {}) {
    const plan = planImport(rawEntries, defaults);
    for (const entry of plan.added) {
      save({ ...entry, status: entry.status || "seed" }, { fromImport: true });
    }
    for (const { id, fills } of plan.enriched) {
      save({ id, ...fills }, { fromImport: true });
    }
    return {
      added: plan.added.length,
      enriched: plan.enriched.length,
      skippedManual: plan.skippedManual.length,
      skippedNoWord: plan.skippedNoWord.length,
      total: plan.total
    };
  }

  function importText(text, format, defaults = {}) {
    const raw = parseImport(text, format);
    return { plan: planImport(raw, defaults), raw };
  }


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

  return { all, get, save, remove, search, facets, stats, exportBankFile, exportJSON, nextId, pendingOverlayCount, resetOverlay,
    parseImport, planImport, applyImport, importText, KNOWLEDGE_TYPES };
})();
