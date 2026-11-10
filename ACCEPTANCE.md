# Final acceptance — verified deliverables and disclosed limits

Deadline: **11 November 2026, 11:59 PM IST**. No submission email was sent.

| Requirement | Artifact or URL | Verification performed | Status | Remaining action |
|---|---|---|---|---|
|Original brief and production inputs|ASSIGNMENT.md; data/|Inspected every record;43/44 counts; original SHA-256 bytes retained|PASS|None|
|Executable engine and exact taxonomy|src/engine.mjs; src/safety.mjs|New-input fixture; schema, group coverage, safe routing tests|PASS|Live availability varies by provider|
|Actual LLM integration|src/llm.mjs; docs/lite-v3-run.json|20 successful Gemini3.1 Flash-Lite calls;39 blind analyses;44 report results|PASS|OpenAI alternative not live-tested|
|Complete live 44-report execution|docs/lite-v3-results.json; docs/RUNTIME_REVIEW.md|44 unique valid post-gate results;8 unsafe proposals blocked; all44 compared substantively with reviewed decisions|PASS WITH LIMITS|Raw model output contains factual/triage errors; release remains explicitly development-reviewed, requiring faculty approval for semantic edits|
|Committed results.json|results.json; docs/results-check.json|44 unique correct references; schemas, scopes, routes, reply conventions and repeated-patch checks pass|PASS|Development-reviewed provenance remains explicit; no ground-truth accuracy claim|
|Deterministic repair safety|src/safety.mjs; tests/|All manual-only repairs blocked from AI edits; semantic repairs review-only; exact/empty/ambiguous anchors, images, structure and types checked|PASS|Conservative policy may reject additional legitimate edits|
|Faculty console|https://acadza-report-fix-qeyq.onrender.com|Public queue, cases, evidence, MathML, before/after, exact patch, reports and replies inspected|PASS|Free-tier cold start may take about a minute|
|Approve/edit/reject and audit persistence|Same public URL; src/store.mjs|Saved all action types; inspected provenance; refresh and redeploy preserved an earlier saved correction/audit|PASS|Demo workspaces are isolated, not institute-wide authenticated faculty records|
|Mobile/long content and browser errors|docs/deployed-mobile.png; docs/console-preview.png|390 px viewport, native MathML, no horizontal page overflow; queried application console error/warn logs empty|PASS|No exhaustive device/browser matrix claimed|
|Direct SQL inspection|docs/hosted-audit-verification.json|MCP query could not reach database with external allowlist empty|NOT VERIFIED|Not required for app use; preserve private database networking|
|Public repository|https://github.com/Aryangupta-05/acadza-report-fix|Repo visibility and pushes verified; secret excluded|PASS|None|
|Free public deployment with durable store|render.yaml; public /health|Render live deploy, health 200/store postgres/mode reviewed, browser mutation and persistence|PASS|Seven-day intention documented; future uninterrupted uptime cannot be verified|
|AI-use disclosure|PROMPTS.md; INITIAL_PROMPT.txt; prompts/|Verbatim user/product prompts, schemas, real runtime traces, actual coding failures/corrections, reviewed mode and synthetic voice disclosed|PASS|Aryan should understand the AI-assisted work before submission|
|Product thinking|PRODUCT.md|Four requested questions answered in a concise one-page-sized Markdown document|PASS|None|
|Checks|VERIFICATION.md; tests/|31 tests pass; full result/source checks and build pass;18 arithmetic checks pass|PASS|OpenAI alternative and full live inference not claimed tested|
|Unreported defects bonus|BONUS.md|All 43 questions inspected, extra spelling/notation/ambiguity findings separate|PASS|Findings are assistant-reviewed, not faculty-confirmed labels|
|Three-minute screen walkthrough|https://acadza-report-fix-qeyq.onrender.com/demo; public/demo.mp4|180-second MP4 decodes; representative encoded frames inspected; actual95-second browser capture edited/retimed with synthetic narration|PASS|Public200/206/HEAD and identical-file SHA-256 verified|
|Submission materials|SUBMISSION_EMAIL.md|Repo, live and video links plus confirmed availability answers; draft only|PASS|Aryan review motivation wording; send only after explicit instruction|
|Resume checkpoint|PROGRESS.md; Git commits|Saved exact state, IDs, limitations and next actions|PASS|Resume this existing session; no automatic restart timer was created|

All required deliverable files and links are present. Full live execution is now verified; raw inference is not claimed correct. The release retains reviewed snapshots, and semantic edits still require faculty judgment. Seven-day future uptime and evaluator accuracy cannot be promised. The video has honest capture/editing disclosure. No email has been sent.
