# Requirements and evidence

Status: pending / implemented / verified / blocked. Input documents describe the target, not permission to contact others. Publication authorized in chat; email sending is not.

| ID | Requirement | Artifact / evidence | Status |
|---|---|---|---|
| INPUT | Read email, README, every question/report and taxonomy; preserve originals | ASSIGNMENT.md; data/; data-inventory.json | verified |
| ENGINE | Executable pipeline supports new production-format inputs, groups by question and returns one result per report | src/engine.mjs | implemented |
| TAXONOMY | Exact verdict/repair keys, result fields and null conventions | src/safety.mjs | verified |
| LLM | Actual provider calls, strict structured output, retries, timeout, cache, visible failure, server-only secrets | src/llm.mjs; prompts/ | blocked |
| SOLVER | Independent stem-only solve before stored answer and solution, mathematical checks | src/engine.mjs; src/proofs.mjs | implemented |
| SAFETY | Repair scope and every repair restriction enforced independently of model | src/safety.mjs | verified |
| MANUAL | auto:false never edited; empty fields mean evidence and recommendation only | src/safety.mjs | verified |
| PATCH | Unique nonempty anchors, stale versions, idempotency, structure and images retained | src/safety.mjs; src/store.mjs | verified |
| ANSWERS | SCQ, MCQ and integer formats; type migrations safely require review | src/safety.mjs | verified |
| TRAPS | Vague, duplicate, conflict, injection, app/display/language/already-fixed/uncertainty | results.json; tests/ | verified |
| CONSOLE | Grouped queue, urgency, search, filters, statuses, concise decision evidence | public/ | verified |
| RENDER | Sanitized HTML and MathML, images/missing image state, long content | src/content.mjs; public/ | verified |
| DIFF | Readable before/after and exact patch, report and reply previews | public/ | verified |
| ACTIONS | Working approve/edit/reject and conflict handling; no premature fixed replies | src/app.mjs; src/store.mjs | verified |
| AUDIT | Durable server audit: actor, timestamp, reason, source version, change, provenance | src/store.mjs | verified |
| UX | Loading/empty/error/saving/success/conflict, keyboard, contrast and responsive | public/ | verified |
| RESULTS | 44 results, IDs/references/schema/scopes/replies reviewed; rerun idempotency | results.json; VERIFICATION.md | verified |
| BONUS | Review all 43 questions; keep unreported findings separate | BONUS.md | verified |
| PROMPTS | Verbatim user and product prompts, versions, decisions, actual AI errors | PROMPTS.md; INITIAL_PROMPT.txt; prompts/ | verified |
| DOCS | Setup, architecture, env, limits, deployment, PRODUCT at most one page | README.md; PRODUCT.md; .env.example | verified |
| VIDEO | Actual verified three-minute recording and timestamped script | DEMO_SCRIPT.md; video file | blocked |
| SUBMIT | Email draft with verified links and 4 confirmed personal answers; never send without approval | SUBMISSION_EMAIL.md | blocked |
| TEST | Schema, repair safety, formats, injection, duplicates, stale/conflict, sanitization and durable audit | tests/; VERIFICATION.md | verified |
| BROWSER | Actual browser queue/detail/diff/actions/persistence; screenshots, narrow screen and errors | docs/; VERIFICATION.md | verified |
| REPO | Public GitHub code and results committed | GitHub URL pending | verified |
| DEPLOY | Public live app, persistent reviews, practical evaluator access, seven-day configuration | Live URL pending | verified |
| ACCEPT | Final acceptance matrix with honest status and interview walkthrough | ACCEPTANCE.md; WALKTHROUGH.md | verified |

Defaults: proposed auto_apply is eligibility, never proof of persistence. Null repair/edit for nondefects; manual-only defects have null edit. Type migrations always require review. No exposure counts invented. Reviewer actions use isolated durable demo workspaces unless an authorized shared reviewer token is supplied.

Verified scope: reviewed-mode results and public console. Complete live inference remains blocked by provider responses; the video has no verified artifact. See ACCEPTANCE.md and VERIFICATION.md for exact execution boundaries, not just implementation claims.
