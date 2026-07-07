# PrepLab v1.1.0 — Production Readiness Audit

## Root cause

Quick Simulation was using the live adaptive session, but the opening behavior was too narrow:

- every simulation started at ability `3.0`
- `nearestDifficulty(3.0)` forced the first pool to difficulty `3`
- the question bank has only 26 Sentence Completion questions at difficulty 3 and 14 Restatement questions at difficulty 3
- recent-question history was saved only after submit, so repeatedly starting simulations could reuse opening questions

Result: the engine was technically connected, but the first questions felt repetitive.

## Fixes

### Adaptive selection

- Replaced strict `nearestDifficulty()` selection with probabilistic difficulty targeting.
- The engine now samples around the current ability instead of always rounding to one difficulty.
- Candidate pools are weighted by closeness to current ability and target difficulty.
- Fresh questions are preferred; recent questions are used only as fallback.

### Opening diversity

- Added `startJitter` to the blueprint.
- New simulations start around 3.0, not exactly 3.0.
- This makes early questions vary while preserving the adaptive baseline.

### Recent-question avoidance

- Selected questions are now saved to recent history immediately after selection, not only after submission.
- This prevents repeated starts from showing the same first items.

### Developer Debug Mode

Open the app with:

```text
?debug=1
```

Example:

```text
https://your-site.vercel.app/?debug=1
```

The exam will show:

- Question ID
- Current ability
- Question difficulty
- Target difficulty
- Candidate pool size
- Freshness mode
- Selection reason

This is hidden from normal users.

## Manual cleanup

Delete legacy root files if they still exist in GitHub:

```bash
git rm app.js styles.css
```

Do not delete:

```text
js/app.js
css/styles.css
```

## Tests performed

- JavaScript syntax validation passed for `js/app.js` and `js/adaptiveEngine.js`.
- Simulated 1,000 quick starts.
- Before fix: 26 unique first questions.
- After fix: 99 unique first questions.
- Quick and Full still use `createSession()`.
- Scoring, question bank, placement, and knowledge tools were not modified.

## Commit message

```text
fix(adaptive): improve question diversity and add debug diagnostics
```

## Changelog

### v1.1.0

Changed

- Adaptive question selection now samples difficulty probabilistically around current ability.
- Simulations start with slight ability jitter to reduce repeated opening questions.
- Recent question history updates immediately when a question is selected.

Added

- Hidden developer debug mode via `?debug=1`.
- Selection diagnostics: pool size, target difficulty, freshness, selection reason.

Fixed

- Quick simulations often starting with the same questions.
- Overly narrow difficulty-3 opening pool behavior.
