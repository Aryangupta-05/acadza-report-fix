# Verified three-minute walkthrough

Video: https://acadza-report-fix-qeyq.onrender.com/demo
MP4: public/demo.mp4

This is an edited screen walkthrough from95 seconds of actual deployed-console viewport capture (1,288 source frames), retimed to180 seconds for readability. It is not a mockup, regenerated UI, or an uninterrupted180-second real-time recording. Narration now uses six real recordings supplied by Aryan, in the order he confirmed. Speech stays at its original speed; levels, peaks and short edge fades are adjusted. No synthetic narration or voice cloning is used. Screen transitions follow approximate local word timestamps; raw recordings remain private. See docs/video-provenance.json for the capture segments and exact retiming.

| Video time | Recorded content |
|---|---|
|0:00–0:21|Queue overview,39 question groups /44 reports, durable demo workspace and explicit reviewed-snapshot banner|
|0:21–1:03|Gas-pressure R004: student suggests8225, stored key A is also wrong; independent calculation gives4800Pa, option D; rendered question and reports|
|1:03–1:40|Before/after A→D, exact answer-field patch and stored derivation; semantic fix requires faculty approval|
|1:40–2:05|Concrete verification reason in the approval dialog; clearly identified demo actor|
|2:05–2:41|Successful saved correction, student-reply preview and persisted audit|
|2:41–3:00|Expanded audit source/result hashes, exact patch and provenance|

A session expired after a prior deployment during preparation. It was refreshed, the same unmodified proposal reopened, and the successful save and audit were verified before their footage was used. Idle/tool-recovery gaps are cut. Browser refresh/redeploy persistence was separately tested earlier; the video does not pretend to show an extra refresh sequence that was not captured.

## Recording script (delivery may differ; not a verbatim transcript)

### 0:00–0:21

This is Acadza Report to Fix. Forty-four reports are grouped into thirty-nine question cases. The console labels development-reviewed results. A full Gemini run is archived separately, including its mistakes. Reviewer decisions are saved on the server in an isolated evaluation workspace.

### 0:21–1:03

Here is the tricky case. A student says the gas pressure should be eight thousand two hundred twenty-five. Independently, pressure equals density times root mean square speed squared, divided by three. Zero point zero nine times four hundred squared, divided by three, gives four thousand eight hundred pascals: option D. The student is wrong, but the stored key A is also wrong. The rendered question retains its mathematics and four options. The report is a lead to investigate, not an instruction to follow.

### 1:03–1:40

The before and after comparison changes only the answer key, from A to D. Expanding the exact patch shows the field, the original value and its replacement. The original question and options remain intact. A source hash and revision prevent stale or repeated changes. The stored derivation also reaches four thousand eight hundred, but the key must first be checked independently. This semantic correction requires faculty approval. A confidence score, or two agreeing models, is not proof that an edit is safe.

### 1:40–2:05

I enter a concrete verification reason in the approval dialog. The actor is explicitly a demo faculty reviewer, not a claim that a real teacher reviewed the case. An expired session required a refresh before the successful save. The server then checked the source version and persisted the correction and audit together.

### 2:05–2:41

The saved state now shows the reviewed correction, the student reply and the audit history. Only after the successful application does the reply preview say the correction has been saved. No student message is actually sent. The audit records the actor, timestamp, reason and change provenance. Earlier deployed checks verified that saved actions survive refresh and redeployment. PostgreSQL holds this history on the server; it is not a browser-local audit trail.

### 2:41–3:00

The expanded audit shows both version hashes and the exact answer-key patch. Manual-only repairs cannot carry AI content edits, and uncertain cases need faculty judgment. The repository includes the prompts, tests and limitations. The footage uses actual browser capture, edited and retimed for narration; that disclosure appears on the public player page.


Audio/video QC: all six final decoded audio sections correlate above0.95 with their corresponding processed recordings. Full decode produces4500 video frames and180 seconds of audio; encoded cue frames were inspected. Automatic transcripts are approximate alignment aids, not verbatim speech or speaker authentication. Tool-based audio listening is unavailable; no listening check is claimed.
