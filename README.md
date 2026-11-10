# Acadza · Report → Fix

A faculty workbench for checking student reports, proposing small corrections, and keeping decisions traceable.

**[Public repository](https://github.com/Aryangupta-05/acadza-report-fix) · [Console](https://acadza-report-fix-qeyq.onrender.com) · [Three-minute video](https://acadza-report-fix-qeyq.onrender.com/demo)**

## Read this first: inference provenance

The published console uses **development-reviewed snapshots**, created with coding-assistant help and explicitly labeled in the UI. They are not faculty-validated ground truth or fabricated runtime model output. `npm run engine -- --mode reviewed` reproduces the committed 44-result file from source-version-bound snapshots. A new or changed question has no matching reviewed snapshot and fails visibly for faculty review.

The real Gemini integration now completed a full live run using `gemini-3.1-flash-lite`: **20 successful provider calls, 39 independent question analyses, and 44 report results**. Eight proposed edits were blocked by deterministic guards. Further source review found substantive errors in structurally valid decisions, including hallucinated options and misread keys. Raw results and provider metadata are preserved in `docs/lite-v3-{run,results}.json`; the per-report review is in `docs/RUNTIME_REVIEW.md` and `docs/runtime-review.json`. The published file deliberately retains the independently reviewed proposals, with truthful reviewed-mode provenance. Raw output is not claimed accurate or silently relabeled. No billing was enabled and no retry loop runs in the deployed app.

Earlier attempts failed with 404/429/503; their evidence remains archived. The successful run resolved the execution blocker, not the need for faculty judgment or evaluator ground truth.

## Run locally

Requires Node **24.2.0** (or compatible Node >=22.13 with built-in SQLite).

```sh
npm ci --include=dev
cp .env.example .env
npm run engine -- --mode reviewed
npm run check
npm test
npm run build
npm start
```

On PowerShell use `Copy-Item .env.example .env` and `npm.cmd` if execution policy blocks npm.ps 1. Open `http://localhost:3100`. Local actions persist in `runtime/acadza.sqlite` through a restart. The source data remains unchanged.

For actual inference, put a fresh, free-tier Gemini key in `.env` and explicitly select a currently accessible free model:

```sh
npm run engine -- --model gemini-3.1-flash-lite --out docs/new-live-results.json
```

For new inputs use `--questions path/questions.json --reports path/reports.json --out path/results.json`. Live mode first solves all questions in four-question batches without keys, solutions or reports, then triages four-question batches. Both response envelopes require an entry keyed by every supplied identity, including duplicate reports. Stem-only executable calculations corroborate supported arithmetic; they never authorize writes. Set LLM_MIN_INTERVAL_MS=6000 for pacing. Checkpoints are written after each successful triage batch to `docs/batch-checkpoint.json`; successful responses are cached privately by SHA-256 of provider, model, complete prompts, input and schema. Re-running reuses matching cached calls. A 429 stops immediately; other transient errors have one bounded retry, and each call times out after 90 seconds. A failed batch run leaves the previous final result file intact. The default output is paired with docs/engine-run.json; a custom --out path is paired with <out>.run.json so experiments preserve the release provenance. Override the metadata path with --run-out. Inspect both outputs before submitting them.

Optional OpenAI Responses integration is selected with `LLM_PROVIDER=openai`, `OPENAI_API_KEY`, and `OPENAI_MODEL`; it is implemented but **not live-tested**, and needs separately authorized spend. Do not assume an OpenAI model is free.

## Architecture and safety

`src/engine.mjs` groups reports by question. A first prompt sees only stems/options/types/images, never the key, solution or comments. A second prompt compares that independent analysis with the record and each report. All embedded content is untrusted. Structured output is provider-constrained and independently validated with Ajv. Raw student identifiers are omitted from inference and public API responses.

`src/safety.mjs` enforces taxonomy fields, repair restrictions, exact unique anchors, answer formats, image preservation and repeat-insertion rejection. Manual-only categories carry no AI patch. Cosmetic automatic eligibility is deliberately narrow: verified spelling pairs, exam-label removal, approved noise labels, and a deterministic raw-fraction-to-MathML converter. Semantic repairs and supported MCQ→SCQ migrations require faculty approval. Unsupported semantic patches fail safely; faculty can author separate content under explicit provenance. Type migrations move the nested payload and normalize its answer without flattening the production schema.

The engine never applies content. `auto_apply` means eligible, not already applied. The console’s saved action invokes the patcher in a database transaction and records the actor, time, reason, original/resulting hash, exact patch, provenance and idempotency key. Optimistic revision checks plus PostgreSQL row locks prevent stale/conflicting decisions. Repeated requests do not create duplicate audits. Original and current versions are stored separately. Student replies only say a correction is saved after successful application, and no reply is actually sent.

`src/app.mjs` provides same-origin APIs. Each evaluator receives a high-entropy, HttpOnly, SameSite cookie identifying an isolated **durable demo workspace**. This is not a real faculty authentication system. CSRF checks and per-session mutation limits protect ordinary evaluator use. Refresh preserves actions; clearing the cookie starts a new workspace. Public visitors cannot call inference or spend the API key. Database schema initializes at server startup; no model key is deployed.

## Review experience

Search question text, chapter or report text; filter by status, verdict or route. Urgency = severity (60 answer/type/unsound, 40 other defects, 20 review referral, 5 other) + repeated-report points (5 each, capped at 20) + waiting-age points (2/day, capped at 20). It does not invent student exposure. Native MathML is preserved by a server sanitizer; scripts, handlers, unsafe URLs and SVG are removed. Missing image records and failed loads are visible. Before/after, exact patches, student reports, replies, solution and audit history appear in one case view. Faculty-only authoring is explicitly distinguished from AI suggestions.

## Deployment and seven-day evaluation

`render.yaml` provisions a **free** Node web service and PostgreSQL database in Singapore. Production refuses ephemeral SQLite. Render’s database URL is injected through `fromDatabase`; no secrets are committed. The app’s `/health` endpoint reports the store and snapshot mode. Build installs development tools explicitly, then runs tests and compiles assets.

The deployment is intended to remain available through at least **18 November 2026**, seven days after the submission deadline, subject to free-tier availability. Free web services sleep after 15 idle minutes and may need about a minute to wake; local disk changes are ephemeral. Free PostgreSQL lasts 30 days, has no backups, and may have maintenance interruptions. The shared database preserves demo actions across web-service restarts. There is no promise of uninterrupted uptime. [Render free-tier limitations](https://render.com/docs/free)

## Results and verification

Source: 43 questions, 44 reports, 39 reported-question groups. Committed results: 44 unique report IDs, 27 defect reports, 19 proposed patches, 4 automatic-eligible routes, 23 faculty-review routes and 17 no-change routes. Source byte hashes are recorded in `docs/input-hashes.json`; `npm run check` compares them, validates every result and rejects repeat patch application. See `VERIFICATION.md` for actual test/browser/deployment evidence and limits. Evaluator ground-truth labels are unavailable; no accuracy percentage is claimed. Confidence values are subjective judgments, not calibrated probabilities.

See `PROMPTS.md`, `PRODUCT.md`, `BONUS.md`, `REQUIREMENTS.md`, `PROGRESS.md`, `DEMO_SCRIPT.md`, `SUBMISSION_EMAIL.md` and `WALKTHROUGH.md`. Submission answers are in the draft email. Do not send it without Aryan’s final instruction.

## Submission answers for review

- Remote Monday–Saturday: yes (confirmed by Aryan).
- Commitment: 6 months (confirmed).
- Earliest start: 21 November 2026 (confirmed).
- Motivation draft: I want to build AI that makes a real student workflow more reliable, with clear evidence and careful safeguards. This work interests me because the useful outcome is a correction people can trust, and I want to develop that product judgment alongside my engineering skills. Aryan should review this AI-assisted wording before submission.

**Video available:** [watch the walkthrough](https://acadza-report-fix-qeyq.onrender.com/demo). The180-second MP4 is edited and retimed from95 seconds of actual browser capture, with synthetic narration; see DEMO_SCRIPT.md and docs/video-provenance.json.

Latest full execution: docs/lite-v3-run.json records 20 successful calls and eight safety-blocked proposals. The released 44-result file remains explicitly development-reviewed after substantive review.
