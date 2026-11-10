# Explain the implementation in an interview

The engine separates inference from authority. Its first live prompt sees only a question’s stem, options and type. The second compares that solve with the stored content and each student comment. A JSON schema constrains structure, and a deterministic validator constrains what an edit may touch. The model cannot write the database.

The best tricky case is the gas-pressure report. The student argues for8225, but P=ρv²/3 gives4800Pa. The stored key is also wrong: A rather than D. Simply trusting or rejecting the student would both miss the real repair. Another useful example is the assertion–reason question: both statements are false and no option represents that outcome, so faculty must author the repair.

An approved action locks the current record, checks its revision and hash, checks the patch again, writes the new content and an audit event in one transaction, then updates the reply preview. A repeated request returns the original outcome. An outdated request returns409 and asks the reviewer to reload. Raw input records stay intact. Local SQLite and hosted PostgreSQL implement the same store interface.

The deliberate tradeoff is conservative automation. Only a small set of cosmetic operations can be auto-eligible, while semantic corrections need faculty review. Public evaluator workspaces are durable but isolated; this keeps the demo useful without pretending it has institute-grade authentication. A production rollout would add authenticated faculty roles, retention and backup policies, and a controlled release workflow for global content updates.

The free provider run exposed a quota problem. The initial orchestration was too chatty; the revised engine batches blind solves and then triages four questions per call, caches successful calls, checkpoints completed batches and stops on429. The demo uses honest development-reviewed snapshots rather than invented model output. I would not claim a measured accuracy without held-out faculty labels.

If asked to adapt a requirement live, identify the owning boundary first. A new report filter belongs in the queue; a new repair type needs a taxonomy entry, schema/guard policy and regression tests; a new answer type needs both format validation and a schema-preserving patch operation. A changed automation threshold must not bypass repair-specific restrictions. Demonstrate the change against one passing case and one harmful attempted edit.
