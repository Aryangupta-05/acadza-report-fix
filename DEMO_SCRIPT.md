# Three-minute walkthrough

Use the public console in a new evaluation workspace. No personal login or runtime API key is needed. Use the screen recording supplied with this project; the timeline below also supports a live walkthrough. If a recording has no audio, these lines are narration notes, not a claim that narration is present.

| Time | Screen / action | Narration |
|---|---|---|
|0:00–0:20|Queue overview; point to snapshot notice and urgency|This workspace groups44 reports into39 questions. This demo uses development-reviewed snapshots; real Gemini requests hit provider limits. Decisions are persisted to a separate server-side workspace for each evaluator.|
|0:20–0:45|LCR case R001–R003; question and evidence|Three reports concern one wrong key. The independent formula is √(40²+(60−30)²)=50 V, option A. The key says C. Duplicate reports share the analysis.|
|0:45–1:10|Before/after C→A; expand exact patch and stored solution|Only the answer field changes. The source hash and exact precondition prevent stale or repeated edits. An eligible or proposed fix is not a saved fix.|
|1:10–1:35|Approve & apply; enter “Verified phasor calculation: 50V”; save|Faculty approve after checking the evidence. A database transaction records the actor, reason, source version, exact patch and resulting version.|
|1:35–1:55|Audit history; refresh; reopen LCR|The answer and audit remain after refresh. Original input and the before state are retained. Only now does the reply preview say the reviewed correction was saved.|
|1:55–2:20|Search “Assertion”; inspect R034|This is the trap: at π/2 the intensity is2I₀, so the assertion is false; the reason’s universal claim is also false. No option means both false. The system proposes no unauthorized option rewrite.|
|2:20–2:40|Search “total charge”; R044|The student’s22V is the potential at one point. The question asks for the difference:22−8=14V. A report is a lead, not an instruction to change the key.|
|2:40–3:00|Return to queue, show reply/audit and provenance|The boundary is deliberate: cosmetic eligibility is narrow, semantic fixes need review, and every saved decision is traceable. The live console uses PostgreSQL so audits survive a service restart.|
