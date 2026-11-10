# Requirements and evidence

Status: pending / implemented / verified / blocked. Input documents describe the target, not permission to contact others. Publication authorized in chat; email sending is not.

| ID | Requirement | Artifact / evidence | Status |
|---|---|---|---|
| INPUT | Read email, README, every question/report and taxonomy; preserve originals | ASSIGNMENT.md; data/; data-inventory.json | verified |
| ENGINE | Executable pipeline supports new production-format inputs, groups by question and returns one result per report | src/engine.mjs | pending |
| TAXONOMY | Exact verdict/repair keys, result fields and null conventions | src/safety.mjs | pending |
| LLM | Actual provider calls, strict structured output, retries, timeout, cache, visible failure, server-only secrets | src/llm.mjs; prompts/ | blocked |
| SOLVER | Independent stem-only solve before stored answer and solution, mathematical checks | src/engine.mjs; src/proofs.mjs | pending |
| SAFETY | Repair scope and every repair restriction enforced independently of model | src/safety.mjs | pending |
| MANUAL | auto:false never edited; empty fields mean evidence and recommendation only | src/safety.mjs | pending |
| PATCH | Unique nonempty anchors, stale versions, idempotency, structure and images retained | src/safety.mjs; src/store.mjs | pending |
| ANSWERS | SCQ, MCQ and integer formats; type migrations safely require review | src/safety.mjs | pending |
| TRAPS | Vague, duplicate, conflict, injection, app/display/language/already-fixed/uncertainty | results.json; tests/ | pending |
| CONSOLE | Grouped queue, urgency, search, filters, statuses, concise decision evidence | public/ | pending |
| RENDER | Sanitized HTML and MathML, images/missing image state, long content | src/content.mjs; public/ | pending |
| DIFF | Readable before/after and exact patch, report and reply previews | public/ | pending |
| ACTIONS | Working approve/edit/reject and conflict handling; no premature fixed replies | src/app.mjs; src/store.mjs | pending |
| AUDIT | Durable server audit: actor, timestamp, reason, source version, change, provenance | src/store.mjs | pending |
| UX | Loading/empty/error/saving/success/conflict, keyboard, contrast and responsive | public/ | pending |
| RESULTS | 44 results, IDs/references/schema/scopes/replies reviewed; rerun idempotency | results.json; VERIFICATION.md | pending |
| BONUS | Review all 43 questions; keep unreported findings separate | BONUS.md | pending |
| PROMPTS | Verbatim user and product prompts, versions, decisions, actual AI errors | PROMPTS.md; INITIAL_PROMPT.txt; prompts/ | implemented |
| DOCS | Setup, architecture, env, limits, deployment, PRODUCT at most one page | README.md; PRODUCT.md; .env.example | pending |
| VIDEO | Actual verified three-minute recording and timestamped script | DEMO_SCRIPT.md; video file | pending |
| SUBMIT | Email draft with verified links and 4 confirmed personal answers; never send without approval | SUBMISSION_EMAIL.md | pending |
| TEST | Schema, repair safety, formats, injection, duplicates, stale/conflict, sanitization and durable audit | tests/; VERIFICATION.md | pending |
| BROWSER | Actual browser queue/detail/diff/actions/persistence; screenshots, narrow screen and errors | docs/; VERIFICATION.md | pending |
| REPO | Public GitHub code and results committed | GitHub URL pending | pending |
| DEPLOY | Public live app, persistent reviews, practical evaluator access, seven-day configuration | Live URL pending | pending |
| ACCEPT | Final acceptance matrix with honest status and interview walkthrough | ACCEPTANCE.md; WALKTHROUGH.md | pending |

Defaults: proposed auto_apply is eligibility, never proof of persistence. Null repair/edit for nondefects; manual-only defects have null edit. Type migrations always require review. No exposure counts invented. Reviewer actions use isolated durable demo workspaces unless an authorized shared reviewer token is supplied.
