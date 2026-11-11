# Verification and limits

Current video: Aryan’s six supplied recordings replace the earlier synthetic track. docs/voice-video-verification.json and docs/video-provenance.json describe the current media; earlier synthetic-track checks below are historical. Full decode, per-section audio similarity, peaks, timing and encoded frames were checked. Tool audio listening is unavailable; no listening check is claimed.

Checked on 10 November 2026. Status words distinguish implementation from actual execution. The evaluator’s ground-truth labels are unavailable.

## Automated checks

| Check | Actual result | Evidence |
|---|---|---|
|Input inventory|PASS:43 questions, 44 reports, 39 reported-question groups|data-inventory.json; all records inspected|
|Original bytes|PASS: copied inputs match original SHA-256 hashes|docs/input-hashes.json; npm run check|
|Result coverage|PASS:44 unique input report IDs, correct question references|docs/results-check.json|
|Taxonomy/schema/scopes|PASS for all 44 development-reviewed results|npm run check; Ajv and deterministic patch checks|
|Repeated application|PASS: every proposed edit rejects a second application|npm run check; additive insertion regression test|
|Test suite|PASS:31 tests,0 failures on latest local run|npm test|
|Numerical evidence|PASS:18 arithmetic checks|node scripts/numeric-checks.mjs; docs/numeric-checks.json|
|Source syntax|PASS: Node checks every JS/MJS under src/scripts/public/tests|npm run check|
|Frontend compile|PASS|npm run build|
|Tracked credential scan|PASS: supplied key not found in tracked files; .env ignored|git ls-files scan; git check-ignore .env|
|Full runtime execution|PASS WITH LIMITS|Gemini3.1 Flash-Lite:20 successful calls,39 blind analyses,44 post-gate results.8 proposals blocked; factual and taxonomy mistakes documented. Root remains explicitly reviewed. See docs/lite-v3-run.json and docs/RUNTIME_REVIEW.md.|

Tests cover answer formats, all auto:false categories, invalid scopes, exact/ambiguous/empty anchors, images and active HTML, additive restrictions, canonical markup conversion, notation limits, stem/option isolation, schema-preserving MCQ→SCQ migration, premature-fixed replies, repeated patches, blind solve inputs, omitted student IDs, rate-limit stop, structured cache/model keys, invalid model output, cache-disk failure without a second successful model request, API sessions and CSRF, SQLite reopen durability, stale/conflicting revisions, duplicate requests, isolated workspaces and authoring provenance.

A Windows-sandbox temp-directory rename failed during a later run, exposing an unwanted provider retry on cache-write failure. This was fixed, a regression test added, and all 26 tests then passed. Earlier 25-test passes are historical, not the final count. The latest27-test pass also includes public video byte-range/HEAD behavior.

No lint/type system is configured for this plain-JavaScript project. Whole-source syntax, schema, API, build and behavior tests ran; a lint or TypeScript pass is not claimed. The OpenAI provider branch is implemented but not live-tested.

## Actual browser verification on the public URL

URL: https://acadza-report-fix-qeyq.onrender.com

- Public page and evaluation session loaded without Aryan’s login. Queue showed 39 questions /44 reports and the development-reviewed provenance banner.
- LCR R001–R003: inspected source C, proposed A, evidence and before/after; approved with reason. UI displayed saved A, revision 1, demo actor, timestamp and audit. After refresh, the same saved correction and audit remained.
- R034: inspected the both-false/no-valid-option reasoning, then approved the faculty recommendation. The server recorded reviewed status with no content patch.
- R044: independently compared 22 V and 8 V, confirmed 14 V with no content edit; an audit was saved.
- R022: rejected a spelling proposal in the isolated demo workspace; rejection reason and actor appeared in audit, preserving the source.
- R024: edited the proposed answer-form label from “in N” to “in newtons”, saved, and observed faculty_edited_ai_proposal provenance.
- After a code redeploy and a documented cold start, the LCR correction and audit still appeared. This verifies hosted persistence across a service restart/redeploy, not merely browser state.
- Browser console errors/warnings queried after the initial deployed action: empty. Later browser tooling target/detachment/timeouts were automation failures, not reported application console errors.
- At 390×844, opened the long X-ray/de-Broglie solution. DOM measurement: viewport 390, document width 375 including scrollbar treatment,11 MathML elements in the selected detail; no horizontal page overflow. The native fractions/exponents rendered in the saved screenshot. Temporary viewport override reset.
- Screenshots: docs/console-preview.png (actual gas-pressure case/diff), docs/deployed-mobile.png (long MathML). They are actual screenshots, not mockups.

## Hosted service

Render service srv-dbpjjhei0phs73acm320; PostgreSQL dpg-dbpjirei0phs73ackec0-a; Blueprint exs-dbpjhuh42hec73cqrc6g. The reviewed free web+Postgres plan was explicitly approved. The first deployment failed because production install omitted esbuild; npm ci --include=dev corrected it. Subsequent deployments reached live. A direct public GET /health returned 200 and {"ok":true,"store":"postgres","mode":"reviewed"}. A direct read-only SQL inspection was attempted but blocked because external database access is disabled. The exact result is saved in docs/hosted-audit-verification.json; the allowlist was not weakened. Hosted persistence evidence comes from the actual browser flow.

The free database has a 30-day lifetime; web service sleeps on idle. Configuration is intended to cover seven days after the 11 November deadline, but uninterrupted future uptime cannot be verified or promised. No model key is deployed. Public review workspaces are durable and isolated, not shared global content edits or institute-grade identity.

## Media verification and remaining limits

1. Video is now verified locally:180 seconds,1280×720,H.264/AAC,4500 decoded frames and no decode errors. It is edited and retimed from95 seconds of actual live browser capture (1288 source frames), with synthetic narration. This is not claimed to be an uninterrupted real-time180-second capture. Source timing and retiming are in docs/video-provenance.json; public HTTP/media identity checks are in docs/video-public-verification.json.
2. All44 runtime results were executed and checked for coverage/schema/patch safety. Eight proposals were blocked; additional semantic errors were found in manual source review by the coding assistant. Raw accuracy is not claimed. The committed file remains explicitly development-reviewed, with no verdict lookup keyed by report ID in the runtime engine.
3. Aryan should review the AI-assisted motivation wording and understand the implementation before submitting. The submission email has not been sent.

## Latest retry and media verification

The user requested another attempt. One bounded Gemini3.8 Flash request returned503; docs/live-retry-run.json records the real failure and no retry loop was started. The root results.json and reviewed provenance were preserved.

The gas-pressure correction was successfully saved after refreshing an expired session. Actual saved reply/audit/hash details were captured. MP4 decoded completely (4500 frames,03:00.00), and representative encoded frames at1:52 and2:25 were visually inspected. Audio is non-silent synthetic Microsoft Zira narration; the video’s narration text and retiming are disclosed. Public video endpoint tests cover200,206,HEAD and416 behavior.

Public media verification completed: /demo returned200 with a native video element; /demo.mp4 returned200 with video/mp4 and3656701 bytes; a1024-byte request returned206 with the correct Content-Range; HEAD returned200. The public and local MP4 SHA-256 hashes are identical. See docs/video-public-verification.json. The player UI could not be reopened for an additional browser playback check because the browser helper timed out; this does not change the verified media identity and full-file decode checks.

## Full live run and final boundary checks

The later free-tier Gemini3.1 Flash-Lite run completed all39 blind solves and44 triages with20 successful provider calls,6-second pacing and zero provider-error retries. The required-key schema prevented missing/merged duplicate identities. All44 post-gate results validate; eight proposed edits were blocked, not applied. docs/RUNTIME_REVIEW.md reviews every report; docs/runtime-review.json includes selected evidence, source hashes and the release hash. Agreement of verdict/repair with the reviewed decisions is21/44; that comparison is not an accuracy score or faculty ground truth. Raw output remains archived unchanged.

The latest31-test suite also covers required duplicate-report keys, generalized stem-only arithmetic, premature corrected/updated/adjusted claims, and faculty authorship when no AI patch existed. Build, source syntax,44-result/source checks and18 numeric checks pass. Final publication/deployment evidence is saved separately after the push.

## Final published API verification

Code commitfb56a41939a9c0bd699f95dd67d76897692b7f62 reached Render live (deploydep-dbpmkl2vcj2c73c2kni0). docs/final-live-verification.json records the public PostgreSQL health/queue, isolated approve/edit/reject actions, replay idempotency, stale409, first-authored-patch acknowledgement/provenance, fresh-session persistence, and unchanged source. Public video200/HEAD/206 and full-file SHA match were reverified. This API check supplements the actual earlier browser flow; no fresh browser playback observation is invented.

## User-recorded narration replacement

Aryan supplied six M4A recordings and confirmed base-file,2,3,4,5,6 order. Whisper tiny.en ran locally to corroborate sections and approximate cue timestamps; no recordings were uploaded for recognition. Screen transitions were aligned to the rendered-question, exact-patch, stored-derivation and audit phrases. Section boundaries are0,21,63,100,125,161,180seconds. Speech playback stays1.0; only screen time is retimed. Audio uses a70Hz high-pass, per-clip two-pass normalization, peak limiting and short edge fades. Full original recordings stay private. Current public player/media200,HEAD200,range206 and complete public/local SHA256 match verified after deployment. Hashff1c3aacc687f040428c39eb4de29b2e7da943b4e84cd1ce50fdda57950a62d7;4888377bytes. PostgreSQL health and39-group/44-report queue remain valid. See docs/video-public-verification.json.
