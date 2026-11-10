# Full live run and release review

Gemini 3.1 Flash-Lite completed 20 successful calls: 39 independent stem-only analyses and 44 report results. Eight proposals were blocked by deterministic safety checks. The raw run is preserved in lite-v3-run.json and lite-v3-results.json. All 44 raw post-gate entries pass identity, taxonomy and patch validation. This establishes execution and safety boundaries, not substantive accuracy.

The coding assistant reviewed every released decision against the raw record and available arithmetic. No faculty or evaluator ground truth is claimed. Root results.json remains explicitly development-reviewed, with its original source-bound provenance. Raw model output was not silently overwritten. Verdict/repair agreement with the selected decisions: 21/44; this is not an accuracy score.

| Report | Raw runtime verdict / repair | Selected verdict / repair | Review |
|---|---|---|---|
|R005|not_actionable / none|defect / answer_key|Safety gate correctly blocked the model patch: Invalid answer format for question type. Retain the independently reviewed narrow proposal; see selected evidence.|
|R029|no_error / none|no_error / none|Independent review supports the selected decision; minor wording or patch differences are not ground-truth accuracy measures.|
|R012|not_actionable / none|defect / spelling|Safety gate correctly blocked the model patch: Spelling must be words only. Retain the independently reviewed narrow proposal; see selected evidence.|
|R002|defect / answer_key|defect / answer_key|Independent review supports the selected decision; minor wording or patch differences are not ground-truth accuracy measures.|
|R004|no_error / none|defect / answer_key|The model called D the stored key; actual source key is A. Both the student claim and stored key are wrong.|
|R008|not_actionable / none|defect / stem_data|Safety gate correctly blocked the model patch: Stem-data guard accepts explicit additive missing data only. Retain the independently reviewed narrow proposal; see selected evidence.|
|R034|no_error / none|defect / unsound|The model proved both statements false and admitted the key was wrong, then returned no_error; no option represents both false.|
|R010|no_error / none|defect / option_repair|The model misattributed a missing stored option to the student device.|
|R017|already_fixed / none|already_fixed / none|Independent review supports the selected decision; minor wording or patch differences are not ground-truth accuracy measures.|
|R032|no_error / none|no_error / none|Independent review supports the selected decision; minor wording or patch differences are not ground-truth accuracy measures.|
|R026|no_error / none|defect / syllabus|The model asserted exam-syllabus coverage without verification; retain a faculty scope review.|
|R042|defect / wrong_chapter|defect / wrong_chapter|Independent review supports the selected decision; minor wording or patch differences are not ground-truth accuracy measures.|
|R023|defect / wrong_chapter|defect / wrong_chapter|Independent review supports the selected decision; minor wording or patch differences are not ground-truth accuracy measures.|
|R007|not_actionable / none|defect / stem_data|Safety gate correctly blocked the model patch: Stem-data guard accepts explicit additive missing data only. Retain the independently reviewed narrow proposal; see selected evidence.|
|R003|defect / answer_key|defect / answer_key|Independent review supports the selected decision; minor wording or patch differences are not ground-truth accuracy measures.|
|R038|no_error / none|app_issue / none|Use taxonomy app_issue for recorded-selection behavior; no question edit.|
|R014|no_error / none|defect / markup_leak|The model assumed a LaTeX renderer exists; this console preserves native MathML and the source has a literal fraction command.|
|R040|no_error / none|not_actionable / none|The vague wrong report establishes no concrete defect; use not_actionable after checking content.|
|R044|no_error / none|no_error / none|Independent review supports the selected decision; minor wording or patch differences are not ground-truth accuracy measures.|
|R028|no_error / none|no_error / none|Independent review supports the selected decision; minor wording or patch differences are not ground-truth accuracy measures.|
|R022|not_actionable / none|defect / spelling|Safety gate correctly blocked the model patch: Spelling pair outside verified dictionary. Retain the independently reviewed narrow proposal; see selected evidence.|
|R015|defect / identical_options|defect / identical_options|Independent review supports the selected decision; minor wording or patch differences are not ground-truth accuracy measures.|
|R016|not_actionable / none|defect / solution_fix|Safety gate correctly blocked the model patch: Reply falsely claims persisted fix. Retain the independently reviewed narrow proposal; see selected evidence.|
|R018|defect / solution_fix|defect / solution_fix|Independent review supports the selected decision; minor wording or patch differences are not ground-truth accuracy measures.|
|R039|not_actionable / none|language_mode / none|Use taxonomy language_mode; do not invent an English-only platform policy.|
|R009|no_error / none|defect / option_repair|The model hallucinated a fourth stored option. D is absent in the raw source.|
|R013|not_actionable / none|defect / exam_reference|Safety gate correctly blocked the model patch: Only exam reference label can be removed. Retain the independently reviewed narrow proposal; see selected evidence.|
|R030|no_error / none|no_error / none|Independent review supports the selected decision; minor wording or patch differences are not ground-truth accuracy measures.|
|R001|defect / answer_key|defect / answer_key|Independent review supports the selected decision; minor wording or patch differences are not ground-truth accuracy measures.|
|R036|no_error / none|display_issue / none|Use taxonomy display_issue for phone clipping while retaining stored content.|
|R021|no_error / none|defect / type_mismatch|The model ignored mcq payload and malformed empty-string answer encoding; migration requires faculty approval.|
|R011|defect / option_repair|defect / option_repair|The 1:1 ratio is uniquely recoverable from Newton third-law symmetry; retain the narrow C option patch.|
|R041|not_actionable / none|not_actionable / none|Independent review supports the selected decision; minor wording or patch differences are not ground-truth accuracy measures.|
|R043|no_error / none|no_error / none|Independent review supports the selected decision; minor wording or patch differences are not ground-truth accuracy measures.|
|R027|no_error / none|no_error / none|Retain the independent physical check and a respectful reply without treating injection as a valid request.|
|R006|not_actionable / none|defect / stem_data|Safety gate correctly blocked the model patch: Stem-data guard accepts explicit additive missing data only. Retain the independently reviewed narrow proposal; see selected evidence.|
|R019|defect / solution_fix|defect / solution_fix|Independent review supports the selected decision; minor wording or patch differences are not ground-truth accuracy measures.|
|R035|no_error / none|no_error / none|Independent review supports the selected decision; minor wording or patch differences are not ground-truth accuracy measures.|
|R025|no_error / none|defect / diagram|The model discounted the explicitly referenced missing source figure; do not invent or dismiss it.|
|R037|not_actionable / none|display_issue / none|Use taxonomy display_issue for slow/incomplete rendering while retaining stored content.|
|R020|no_error / none|defect / answer_key|The model ignored malformed array encoding: one combined A, B, D string is not three letter elements.|
|R033|no_error / none|no_error / none|Independent review supports the selected decision; minor wording or patch differences are not ground-truth accuracy measures.|
|R031|no_error / none|no_error / none|Independent review supports the selected decision; minor wording or patch differences are not ground-truth accuracy measures.|
|R024|no_error / none|defect / answer_form|An integer response needs its unit stated; implied N does not resolve the report.|

Exact selected evidence, patches, source versions and released file hash are in runtime-review.json. The release still requires faculty judgment for semantic and manual-only repairs.
