# Three-minute walkthrough

Use the public console in a new evaluation workspace. No personal login or runtime API key is needed. No verified screen recording exists yet. The narration file is synthetic Microsoft Zira audio, not Aryan’s voice. The timeline below supports the remaining actual recording.

| Time | Screen / action | Narration |
|---|---|---|
|0:00–0:20|Queue overview; point to snapshot notice and urgency|This workspace groups 44 reports into 39 questions. This demo uses development-reviewed snapshots; real Gemini requests hit provider limits. Decisions are persisted to a separate server-side workspace for each evaluator.|
|0:20–0:45|Gas-pressure case R004; question and evidence|The student proposes 8225, but P=0.09×400²/3=4800 Pa, option D. The key A is also wrong. A report can reveal a defect even when the student’s reasoning is wrong.|
|0:45–1:10|Before/after A→D; expand exact patch and stored solution|Only the answer field changes. The source hash and exact precondition prevent stale or repeated edits. An eligible or proposed fix is not a saved fix.|
|1:10–1:35|Approve & apply; enter “Verified gas-pressure calculation: 4800 Pa”; save|Faculty approve after checking the evidence. A database transaction records the actor, reason, source version, exact patch and resulting version.|
|1:35–1:55|Audit history; refresh; reopen the gas-pressure case|The answer and audit remain after refresh. Original input and the before state are retained. Only now does the reply preview say the reviewed correction was saved.|
|1:55–2:20|Search “Assertion”; inspect R034|This is the trap: at π/2 the intensity is 2I₀, so the assertion is false; the reason’s universal claim is also false. No option means both false. The system proposes no unauthorized option rewrite.|
|2:20–2:40|Search “total charge”; R044|The student’s 22 V is the potential at one point. The question asks for the difference:22−8=14 V. A report is a lead, not an instruction to change the key.|
|2:40–3:00|Return to queue, show reply/audit and provenance|The boundary is deliberate: cosmetic eligibility is narrow, semantic fixes need review, and every saved decision is traceable. The live console uses PostgreSQL so audits survive a service restart.|

## Exact recording handoff

1. Open https://acadza-report-fix-qeyq.onrender.com in Chrome and wait for the 39-case queue. Keep any API-key pages and private tabs outside the recording.
2. Use Loom, the Windows Snipping Tool screen recorder, or another recorder to capture only the console tab/window for 180 seconds. Use the timeline above; the gas-pressure case was not applied during verification, so it remains a fresh scenario in the existing browser workspace. A new browser profile also receives a fresh workspace.
3. The prepared 180-second synthetic narration is outputs/Acadza_Demo_Narration.mp 3 in the task deliverables, outside this repository. You may record your own voice instead. The audio alone is not the required screen recording.
4. Save MP 4, inspect the beginning/middle/end and confirm sound and 180-second duration. Upload as unlisted YouTube/Loom or a suitably shared Drive file, then replace the submission draft’s video placeholder.

Agent recording attempts were unsuccessful: a native Chrome approval initially timed out; background browser screenshots lost their execution context; a longer active capture timed out and reset the kernel; after user-approved retry, Computer Use stopped because it could not confidently establish the Chrome URL. No screenshot sequence is mislabeled as a three-minute recording.
