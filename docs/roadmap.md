# Roadmap

## v0.8
- Add 5–10 reading passages
- Expand question bank to 250+ items
- Improve mobile layout

## v0.9
- Add local statistics
- Prevent repeated questions across sessions

## v1.0
- 1,000+ original questions
- Stronger adaptive scoring calibration

## v1.1
- Adaptive selection samples difficulty probabilistically around ability
- Hidden developer debug mode (`?debug=1`)

## v1.1.1
- Time analytics: per-question/section/total time, one exam-level clock only
- Time Analysis section on the results screen
- Calibration data (`js/telemetry.js`) wired into the live exam, with timeSpent/abilityBefore/abilityAfter per question
- Repo cleanup: removed dead legacy `app.js` and `studio.html`

## Next
- Backend-synced calibration (merge telemetry across devices)
- Use collected time data to flag questions that are miscalibrated for pacing, not just accuracy
