# Verification and limits

Checked on 10 November 2026. Status words distinguish implementation from actual execution. The evaluator’s ground-truth labels are unavailable.

## Automated checks

| Check | Actual result | Evidence |
|---|---|---|
|Input inventory|PASS:43 questions, 44 reports, 39 reported-question groups|data-inventory.json; all records inspected|
|Original bytes|PASS: copied inputs match original SHA-256 hashes|docs/input-hashes.json; npm run check|
|Result coverage|PASS:44 unique input report IDs, correct question references|docs/results-check.json|
|Taxonomy/schema/scopes|PASS for all 44 development-reviewed results|npm run check; Ajv and deterministic patch checks|
|Repeated application|PASS: every proposed edit rejects a second application|npm run check; additive insertion regression test|
|Test suite|PASS:27 tests,0 failures on latest local run|npm test|
|Numerical evidence|PASS:18 arithmetic checks|node scripts/numeric-checks.mjs; docs/numeric-checks.json|
|Source syntax|PASS: Node checks every JS/MJS under src/scripts/public/tests|npm run check|
|Frontend compile|PASS|npm run build|
|Tracked credential scan|PASS: supplied key not found in tracked files; .env ignored|git ls-files scan; git check-ignore .env|
|Full runtime inference|BLOCKED|Original live run 12 successful calls,5 fully triaged groups;34 groups unresolved from 429/503. Later batched 404/429/503 attempts stopped. See docs/first-live-run.json.|

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
2. All 44 runtime model classifications remain unverified because of provider failures. The committed file is explicitly development-reviewed and generated by reviewed mode, with no verdict logic keyed by report ID in the engine.
3. Aryan should review the AI-assisted motivation wording and understand the implementation before submitting. The submission email has not been sent.

## Latest retry and media verification

The user requested another attempt. One bounded Gemini3.8 Flash request returned503; docs/live-retry-run.json records the real failure and no retry loop was started. The root results.json and reviewed provenance were preserved.

The gas-pressure correction was successfully saved after refreshing an expired session. Actual saved reply/audit/hash details were captured. MP4 decoded completely (4500 frames,03:00.00), and representative encoded frames at1:52 and2:25 were visually inspected. Audio is non-silent synthetic Microsoft Zira narration; the video’s narration text and retiming are disclosed. Public video endpoint tests cover200,206,HEAD and416 behavior.

Public media verification completed: /demo returned200 with a native video element; /demo.mp4 returned200 with video/mp4 and3656701 bytes; a1024-byte request returned206 with the correct Content-Range; HEAD returned200. The public and local MP4 SHA-256 hashes are identical. See docs/video-public-verification.json. The player UI could not be reopened for an additional browser playback check because the browser helper timed out; this does not change the verified media identity and full-file decode checks.
