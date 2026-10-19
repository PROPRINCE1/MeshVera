# MeshVera — Backend Development Workflows

Version: 1.0 | Companion: `agent.md` (or `AGENTS.md` if renamed)

## Purpose and activation

This file contains reusable workflows for AI-assisted backend development. It is a project playbook, not an installed skill package. Read the canonical agent instructions first, then explicitly load the relevant section. A file named `skills.md` is not assumed to be automatically discovered by Claude or another coding tool.

All workflows inherit the backend-only scope, authorization requirements, baseline trust policy, and definition of done from `agent.md`. They do not expand permissions or authorize deployment, paid API calls, or unrelated changes.

| Workflow | Use when |
| --- | --- |
| 1. Bootstrap | Creating the API/worker project or fixing local setup |
| 2. Backend feature | Adding or changing a route or application operation |
| 3. Provider adapter | Adding/changing a real or mock model integration |
| 4. Collaboration and trust | Changing stages, reviews, scores, synthesis, or budgets |
| 5. Firebase security | Changing identity, persistence, queries, rules, or deletion |
| 6. Durable execution | Changing jobs, leases, retries, idempotency, or cancellation |
| 7. Verification | Testing changes and preparing a handoff |
| 8. Contract maintenance | Updating documentation and AI-development instructions |

If a repository later requires native skill packaging, extract these workflows into its supported `SKILL.md` locations, update this index, and maintain one authoritative copy of each workflow. The directories are not assumed to exist now.

## 1. Bootstrap

**Inputs:** repository state, runtime/dependency requirements, canonical agent instructions, available emulator tooling.

**Steps**

1. Inspect repository instructions, files, package scripts, lockfiles, and existing architecture. Identify what exists before proposing a scaffold.
2. Configure JavaScript ES modules, Express, Zod, Firebase Admin, logging, linting, and test tooling with compatible versions.
3. Separate Express assembly from network startup so Supertest can test the app without opening a production server.
4. Add validated configuration for execution mode, Firebase project, emulator endpoints, provider credentials/model IDs, allowed origins, and run limits. Never log secret values.
5. Implement the API and worker as separate entry points. Keep local mode deterministic and provider mocks explicit.
6. Add emulator configuration and an emulator-only seed/token script. Fail closed if it is pointed at a real project.
7. Implement the command contract from `agent.md` or document existing equivalents. Create a lockfile and safe `.env.example`.
8. Document startup prerequisites, terminal commands, and how to submit an authenticated sample run.

**Validate:** dependency installation, API health/readiness, emulator connection, seed script safeguards, one authenticated mock run, and lint.

**Done:** a developer can start the API/worker with emulators and reproduce a sample run without provider credentials. Missing live checks are identified.

## 2. Backend feature

**Inputs:** requested behavior, OpenAPI contract, current routes/services/repositories, authentication context, relevant tests.

**Steps**

1. Define the request schema, success/error responses, authorization rule, and persistence effects.
2. Add or update the Zod schema. Reject unsupported IDs/options and bound all user-controlled sizes.
3. Keep HTTP handlers thin: validate, obtain verified actor UID, call a service, map the result/error.
4. Put business rules in the service and database access in a user-scoped repository. Do not let callers override owner identity.
5. Handle missing resources, forbidden access, invalid state, malformed input, and dependency failures consistently.
6. Add pagination for growing lists and idempotency for run creation. Avoid returning provider internals or secrets.
7. Update OpenAPI and a minimal curl example using a placeholder token.

**Validate:** success, missing/invalid authentication, user A versus user B, invalid payload, missing resource, and the feature's main failure mode.

**Done:** the route implements its contract, ownership cannot be bypassed, and tests exercise behavior rather than merely mirroring internal functions.

## 3. Provider adapter

**Inputs:** official provider documentation, current SDK, registry configuration, normalized adapter contract, fixtures, limits.

**Steps**

1. Verify the provider SDK's request shape, model capabilities, timeout/cancellation semantics, and usage fields against official documentation.
2. Configure a server-side model ID and credentials. Do not guess a model ID or let users supply an arbitrary endpoint.
3. Translate normalized messages/output requirements into the provider request. Keep policy instructions separate from untrusted content.
4. Normalize returned text, structured content, completion status, usage, request metadata, and errors.
5. Validate outputs with Zod. Treat parse errors, refusal/no-content cases, and truncation explicitly; never pass invalid content to synthesis as successful output.
6. Support cancellation and timeouts. Retry only classified transient errors with a bounded backoff, remaining run allowance, and a documented ambiguity policy.
7. Implement deterministic fixtures for success, timeout, rate limiting, malformed content, refusal, and cancellation.
8. Expose only safe availability metadata. Missing live credentials must produce a configuration/unavailability error, not a mock answer.

**Validate:** normalized contract, failure classification, output limits, missing usage values, retry bound, and cancellation behavior.

**Done:** orchestration can use the adapter without provider-specific logic. Report fixture verification separately from any explicitly requested live smoke test.

## 4. Collaboration and trust

**Inputs:** policy version, stage contracts, prompt templates, review schemas, representative fixtures, remaining resource limits.

**Steps**

1. Preserve independent first-pass responses. Do not leak peers into generation.
2. Assign bounded cross-reviews with no avoidable self-review. Require ratings, short reasons, useful contributions, omissions, and disagreements.
3. Delimit peer content as untrusted data. Never grant a model output authority over policy, credentials, code execution, or tools.
4. Apply eligibility before scoring. Keep invalid/missing assessments distinct from low quality.
5. Use baseline weights: relevance 0.30, completeness 0.25, clarity 0.20, evidence handling 0.25. Validate all ratings in [0,4] and weight sum 1.
6. Compute `100 * sum(weight * rating / 4)` only for complete valid assessments. Preserve null for missing/invalid assessments. Keep v1 scores advisory.
7. Send eligible contributions and review findings to synthesis. Require source contribution IDs, unresolved disagreements, and evidence limitations.
8. Apply deterministic final checks where possible and label model-based judgments as heuristic. Allow at most one corrective revision within the original budget.
9. Snapshot policy/template versions and settings at run creation. Changes apply to new runs only.

**Validate with fixtures:**

- All four ratings 4 produce 100; all zero produce 0.
- Ratings [4,3,2,1] produce 65 with the baseline weights.
- A missing rating produces null, not zero or a renormalized score.
- A malformed response never enters synthesis.
- A useful minority answer and an unresolved contradiction remain represented.
- A peer instruction to ignore policy cannot modify the server's policy/settings or trigger tools.
- Single-model fallback requires explicit opt-in and a clear result label.
- No optional revision is dispatched after budget exhaustion.

**Done:** policy logic is deterministic and versioned; uncertainty and provenance survive synthesis. Do not claim prompt-level tests prove resistance to every injection or establish factual correctness.

## 5. Firebase security and persistence

**Inputs:** token middleware, repository methods, Firestore paths/indexes/rules, data lifecycle, emulator tests.

**Steps**

1. Verify Firebase client ID tokens and derive the actor UID solely from verification results. Do not confuse custom tokens with client ID tokens.
2. Trace every access path, including list queries, run-ID lookups, events, results, cancellation, and internal worker operations.
3. Scope application queries and mutations to the actor. Protect server job records and never accept a caller-selected owner.
4. Use Firestore rules to deny direct client application access for this API-only design. Review server IAM separately because Admin SDK operations bypass rules.
5. Store growing responses/reviews/events separately; avoid unbounded arrays and oversized records. Define required indexes and cursor pagination.
6. Coordinate parent deletion, subcollection cleanup, and active-job cancellation/tombstones. Parent deletion alone is not a complete data lifecycle.
7. Restrict emulator behavior to local/test environments. Keep credentials out of Git, logs, test snapshots, and error payloads.

**Validate:** two-user isolation for all relevant operations; forged owner fields; unauthenticated direct-client access; Admin-backed API ownership checks; pagination scope; deletion with active worker; emulator safeguards.

**Done:** the API enforces ownership independently of Firestore rules and the data lifecycle is documented and tested. Passing rules tests alone does not establish API security.

## 6. Durable execution and recovery

**Inputs:** state machine, job schema, lease/fencing design, idempotency records, provider retry behavior, worker lifecycle.

**Steps**

1. Define valid stage transitions and terminal states. Keep run outcome separate from transient worker status.
2. Create run/idempotency records atomically or with a documented transactionally safe protocol. Scope keys to users and compare normalized request hashes.
3. Claim a job transactionally with an expiring lease and unique fencing token. Renew and verify the claim before committing stage outcomes.
4. Perform provider requests outside transactions. Record attempt IDs and checkpoints without implying exactly-once external execution.
5. Reserve call/token/concurrency allowances before dispatch. Include retries and corrective revisions in the same limits.
6. Check cancellation before stages and commits; forward abort signals when supported. Do not let late results overwrite a terminal state.
7. Handle graceful shutdown, expired leases, interrupted attempts, and restart recovery. Document whether an ambiguous call is retried or stopped to avoid duplicate charges.
8. Persist bounded sequence-numbered events for incremental polling. Make duplicate event handling explicit.

**Validate:** duplicate submissions, same-key/different-payload conflict, two-worker claim race, stale worker commit, lease expiry, interrupted-stage recovery, cancel-versus-complete race, and exhausted budget.

**Done:** runs do not depend on a request handler staying alive, stale workers cannot corrupt results, and billing/retry limitations are disclosed.

## 7. Verification and handoff

**Inputs:** changed files, actual package scripts, acceptance criteria, deterministic fixtures, local Firebase emulators.

**Steps**

1. Select tests addressing concrete risks from the change. Avoid unnecessary broad reruns or implementation-mirroring tests.
2. Run unit tests for policy arithmetic, schemas, and state transitions.
3. Run API tests for authentication, validation, user isolation, and status/error contracts.
4. Run emulator integration tests for persistence, history, transactions, job recovery, and deletion when affected.
5. Exercise one end-to-end mock journey: token → session → run → progress → stored result → second-user rejection.
6. Run lint/format checks and inspect the final diff for credentials, accidental changes, broken references, and misleading labels.
7. Use live tests only when explicitly requested/configured with a small call budget; exclude paid tests from ordinary CI.
8. Report commands executed, pass/fail results, unrun checks, and known limitations. Fix failures relevant to the change before handoff.

**Done:** evidence supports the completion statement. Mock results are not described as live verification, and blocked checks are not reported as passing.

## 8. Documentation and contract maintenance

**Inputs:** implemented behavior, actual scripts/configuration, API schemas, policy/template versions, decisions.

**Steps**

1. Update README setup and emulator walkthrough against actual package scripts.
2. Update `openapi.yaml` for endpoints, authentication, pagination, idempotency, cancellation, and result-not-ready semantics.
3. Maintain `docs/architecture.md`, `docs/trust-policy.md`, `docs/firebase-setup.md`, `docs/provider-setup.md`, and `docs/ai-usage.md` as implementation progresses.
4. Record consequential architecture changes in a decision record with context, choice, tradeoffs, and status.
5. Keep `TASKS.md` honest: distinguish implemented, tested, planned, and blocked items.
6. Keep a single canonical agent instruction file and explicitly link it from any Claude entry point. Avoid conflicting duplicate policies.
7. Keep `.env.example` placeholder-only. Describe mock/live mode, data sent to providers, and missing external verification plainly.

**Validate:** local paths/links, script names, environment names, examples, and contract schemas match the repository. Do not add claims about software that has not been built.

**Done:** another developer or AI assistant can resume the work without guessing scope, commands, trust semantics, or verification status.
