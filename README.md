# Acadza · Report → Fix

A faculty workbench for checking student reports, proposing small corrections, and keeping decisions traceable.

**[Public repository](https://github.com/Aryangupta-05/acadza-report-fix) · [Console](https://acadza-report-fix-qeyq.onrender.com)**

## Read this first: inference provenance

The published console uses **development-reviewed snapshots**, created with coding-assistant help and explicitly labeled in the UI. They are not faculty-validated ground truth or fabricated runtime model output. `npm run engine -- --mode reviewed` reproduces the committed 44-result file from source-version-bound snapshots. A new or changed question has no matching reviewed snapshot and fails visibly for faculty review.

An actual Gemini integration is implemented and was exercised. The first `gemini-3.6-flash` run produced 12 successful solve/triage calls, completing five question groups; 34 groups failed with 429/503 errors. The original outputs and real provider metadata are preserved in `docs/first-live-{run,results}.json`. A batched 2.5 Flash attempt returned 404, a 3.6 Flash batch returned 429, and a 3.8 Flash batch returned 503. Full live inference is **blocked by provider availability/quota**, not claimed complete. No billing was enabled. No generation retry loop runs in the deployed app.

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
npm run engine -- --model gemini-3.8-flash
```

For new inputs use `--questions path/questions.json --reports path/reports.json --out path/results.json`. Live mode uses one blind solve batch, then four-question triage batches. Checkpoints are written after each successful triage batch to `docs/batch-checkpoint.json`; successful responses are cached privately by SHA-256 of provider, model, complete prompts, input and schema. Re-running reuses matching cached calls. A 429 stops immediately; other transient errors have one bounded retry, and each call times out after 90 seconds. A failed batch run leaves the previous final `results.json` intact. Inspect its provenance before submitting it.

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

**Video remains blocked.** The demo script and 180-second synthetic narration are prepared, but no verified screen recording or hosted video link exists.
