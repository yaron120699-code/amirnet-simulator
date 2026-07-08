# PrepLab Design Language v2.0 — Changelog

Scope: UI only. Adaptive engine, scoring, blueprint, and question bank
were not touched (verified — no edits to `js/adaptiveEngine.js`,
`js/scoring.js`, `data/blueprint.js`, `questions/questionBank.js`,
`data/levels.js`, `js/placement.js`).

## Files modified
- `css/styles.css` — full rewrite as a documented, tokenized design system
- `js/app.js` — presentation-layer changes only (render/template functions,
  i18n strings). No changes to timer, adaptive session, scoring, or
  telemetry write paths.

## Files added
- `CHANGELOG_DESIGN_LANGUAGE.md` (this file)

## Files reviewed but intentionally left untouched (out of scope for this pass)
- `studio.html`, `vocab-studio.html`, `knowledge-studio.html`,
  `calibration.html` — internal authoring/calibration tools. They already
  inherit the new tokens via the shared stylesheet (buttons, cards,
  badges, inputs all update automatically); their bespoke layouts were
  not restructured in this pass.
- `app.js` (root, not `js/app.js`) — a stale, unused duplicate (not
  loaded by `index.html`). Flagged for deletion in a follow-up.

## What changed

### Design system (`css/styles.css`)
- Reorganized into 9 documented sections: tokens, base, layout,
  primitives, data display, home, exam, results, utilities.
- New token layers: 4px spacing scale (`--sp-1`…`--sp-10`), a type scale
  (`--text-xs`…`--text-4xl`), a 5-step radius scale, 3-step elevation
  scale, and named motion durations (`--motion-fast` 150ms,
  `--motion-base` 200ms) — all animations/transitions now reference
  these instead of inline magic numbers.
- Widened the app shell from a fixed `1040px` to
  `clamp(1100px, 92vw, 1280px)` (`--content-width`) so large monitors no
  longer feel empty; exam and results screens keep a narrower
  `--content-width-reading` (860px) for focused reading, per the brief's
  explicit instruction not to overdesign the exam screen.
- New reusable primitives: `.badge` (+ `.badge-soon`, `.badge-new`,
  `.badge-good`, `.badge-bad`), `.module-card` / `.module-grid`,
  `.continue-card`, `.activity-row`, `.recommend-row`, `.section-head`,
  `button.ghost`.
- No gradients, no glassmorphism, no glow — kept the existing "paper and
  ink" palette (already compliant with the brief) and made it
  systematic rather than ad hoc.
- Mobile breakpoints extended (`980px` tier added) so the module grid
  and layout degrade intentionally rather than just shrinking.

### Question / option component
- Replaced square numeric badges (`1`/`2`/`3`/`4` in a rounded square)
  with circular `A`/`B`/`C`/`D` letter badges (`.option-letter`), with a
  subtle 150ms hover state and a scale-up "locked in" animation on
  selection.

### Home page
- Added a **Continue learning** strip that reads the most recent
  completed simulation from the existing telemetry log
  (`PrepLabTelemetry.lastSimulations(1)`) and shows the last score,
  estimated level, and a relative timestamp, with a one-tap "Practice
  again" action. Renders nothing for first-time visitors — no telemetry
  data was invented or altered to support this.
- Added a **Modules** section: Amirnet as the live, clickable module,
  plus Mathematics / Physics / Statistics as visibly disabled
  "Coming soon" cards, establishing the multi-subject shell the brief
  asks for without inventing content for subjects that don't exist yet.
- Hero and blueprint stat cards preserved as-is (content unchanged),
  now sitting inside the wider shell.

### Results page
- Reordered to follow the brief's suggested narrative: Score → Estimated
  Level & Progress to Exemption → Time Analysis → Accuracy & Question
  Breakdown → Ability Path → Recommendations → Full Review → Next Step.
- Added a **Recommendations** block: identifies the weakest- and
  strongest-performing question type from the already-computed
  `byType` accuracy breakdown, plus a one-line pacing note from the
  already-computed time analysis. This is a presentational summary of
  numbers the scoring/adaptive layers already produced — no new scoring
  logic was added.
- Added a **Next step** CTA row (Back home / Practice again) so the
  page ends with a clear action instead of a single button.
- Fixed a pre-existing bug: two review-item inline styles referenced an
  undefined `--muted` CSS variable; now use `--ink-soft`.

## Testing checklist
- [ ] Full simulation (he/en): start → answer/skip through all 27
      questions → confirm results render at the new section order.
- [ ] Quick simulation, untimed mode: confirm timer chip shows "Untimed"
      instead of a countdown, and time-analysis block adapts.
- [ ] Language toggle (עברית/English) mid-exam and mid-results: confirm
      RTL/LTR layout, `.continue-card` direction, and option alignment
      all still hold.
- [ ] First-time visitor (clear localStorage): confirm the home page
      renders with **no** Continue-learning card and no console errors.
- [ ] Returning visitor (after one completed sim): confirm the
      Continue-learning card shows the correct score/level/time-ago and
      that "Practice again" starts a quick simulation.
- [ ] Keyboard navigation: Tab through topbar → hero → module grid →
      exam options → nav buttons; confirm visible focus rings
      (`:focus-visible`) throughout, including on the now-clickable
      Amirnet module card.
- [ ] `prefers-reduced-motion: reduce`: confirm all transitions/animations
      collapse to ~0ms (existing rule, unchanged).
- [ ] Resize from ~1440px → 980px → 760px → 375px: confirm module grid
      goes 4-wide → 2-wide → 2-wide → 1-wide, and exam/results stay
      readable at the narrower reading width.
- [ ] Debug mode (`?debug`): confirm the debug panel still renders and
      live-updates under the new card padding.
- [ ] Verify `studio.html` / `vocab-studio.html` / `knowledge-studio.html`
      / `calibration.html` still load correctly with the new shared
      stylesheet (buttons, cards, pills should look upgraded; layouts
      unchanged).

## Suggested commit message
```
redesign(ui): introduce PrepLab Design Language v2.0

- Rebuild css/styles.css as a documented, tokenized design system
  (space/type/radius/elevation/motion scales); widen app shell to
  clamp(1100px, 92vw, 1280px); keep exam/results at a focused 860px.
- Replace numeric option badges with circular A/B/C/D letter badges,
  with subtle hover/selection motion.
- Home: add a Continue-learning card sourced from existing telemetry,
  and a Modules section (Amirnet live; Math/Physics/Stats coming soon).
- Results: reorder into Score -> Level/Exemption -> Time -> Breakdown ->
  Recommendations -> Review -> Next step; add a recommendations block
  derived from already-computed byType/time data; fix undefined
  --muted var in review items.

No changes to adaptiveEngine.js, scoring.js, blueprint.js, placement.js,
or the question bank. UI only.
```
