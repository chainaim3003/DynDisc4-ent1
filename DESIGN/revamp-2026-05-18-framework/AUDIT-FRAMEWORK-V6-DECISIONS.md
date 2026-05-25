# Audit Framework v6 — Sealed Decisions Reference

**Project:** DynDisc4-ent1 — Agentic Procurement
**Codebase:** `C:\SATHYA\CHAINAIM3003\mcp-servers\FINAGENTS\FINAGENTS1\DynDisc4-ent1`
**Created:** 2026-05-23 (Iteration 1, Phase 0)
**Status:** Locked — no changes without opening a new design revision
**Companion docs:**
- `AUDIT-FRAMEWORK-V6-DESIGN.md` — what to build
- `AUDIT-FRAMEWORK-V6-ITERATION-PLAN.md` — how to execute (7 iterations)
- `AUDIT-FRAMEWORK-V6-SUPERSEDES.md` — bridge to prior plans

---

## Purpose

This document is the standalone reference for the 17 design decisions that govern all v6 audit framework implementation. It restates Part 1 of the iteration plan in a single self-contained file so future contributors don't have to scroll through a 450-line execution plan to look up "what did we decide about X."

If anything in code or future design revisions conflicts with this table, stop and reconcile before proceeding.

---

## The 17 sealed decisions

| # | Decision | Locked value |
|---|---|---|
| Q1 | Folder name | `audits/` |
| Q2 | Date partitioning | UTC |
| Q3 | Per-NEG subfolders | YES (`audits/YYYY-MM-DD/NEG-{id}/`) |
| Q4 | Legacy file strategy | Bulk move verbatim to `audits/_legacy_escalations/` |
| Q5 | `index.jsonl` granularity | One line per deal |
| Q6 | `selfCheck.overallVerdict` enum | `ON_TRACK` / `ON_TRACK_BUT_FLAGGED` / `OFF_TRACK` / `NEEDS_REVIEW` |
| Q7 | Phasing | 7-iteration plan (see `AUDIT-FRAMEWORK-V6-ITERATION-PLAN.md`) |
| Q8 | Gemini prompt storage | Hash + text now; config flag flips to hash-only later |
| Q9 | Autonomy model | Option C — six pillars + HITC/HITL/HOTL/HOOTL |
| Q10 | DCC per delegation entry | YES — all 7 properties |
| Q15 | New `messageSigningPosture.tier` value | YES — add `HASH_ENVELOPE` (5th tier) |
| Q16 | Legacy bulk move | YES — all 494 files at once (verified count, 2026-05-23) |
| Q17 | Port `:7074` | Confirmed free |
| Q24 | AuditReportingAgent port | `:7074` |
| Q25 | Cron schedule | Daily 21:00 UTC; weekly Sunday 21:00 UTC (= 2:30 AM IST) |
| Q26 | Report cache window | 5 minutes |
| Q27 | Authority role | Chief Audit Officer (non-vLEI plain JSON today; vLEI deferred) |
| Q31 | Discriminator field placement | Option A — sibling fields next to `outcome` |
| Q32 | `commitGate.state` enum | All 8 values: `NOT_REQUIRED` / `PENDING` / `APPROVED` / `REJECTED` / `DEFERRED` / `TIMED_OUT` / `CANCELLED` / `ESCALATED` |

---

## Errata (corrections to companion docs)

| # | Doc | Issue | Correction |
|---|---|---|---|
| E1 | `AUDIT-FRAMEWORK-V6-ITERATION-PLAN.md` line 4 | Header states codebase path as `FINAGENTS\FINAGENTS4\DynDisc4-ent1` | Actual path is `FINAGENTS\FINAGENTS1\DynDisc4-ent1`. To be fixed in a follow-up commit. |
| E2 | `AUDIT-FRAMEWORK-V6-ITERATION-PLAN.md` Part 2 row P8 | Pre-flight grep result said "no agent files hardcode the path" | Verified incorrect 2026-05-23. `agents/buyer-agent/index.ts` declares `escalationsDir` twice (lines 1086 and 1698). Phase 3 scope correspondingly expanded to cover buyer-agent path edits in addition to the planned Bug 2 fix. No change to phase budget. |
| E3 | `AUDIT-FRAMEWORK-V6-ITERATION-PLAN.md` Part 3 Iteration 1 Phase 3 | Plan implies 3 hardcoded path references total across `shared/logger.ts` and `shared/audit-writer.ts` | Verified count is ~25 references across `shared/logger.ts` (3 declarations + uses), `shared/audit-writer.ts` (1 constant + 4 uses), and `agents/buyer-agent/index.ts` (2 declarations + ~12 uses). All replaced uniformly via the new `shared/audit-paths.ts` helper. No goal change. |

---

## Pre-flight verification record (Iteration 1)

For audit trail purposes, the pre-flight state captured at start of Iteration 1:

| # | Item | Verified value | Date |
|---|---|---|---|
| P1 | Iteration branch | `audit-v6-iter1` created from `main` after commit of v6 docs | 2026-05-23 |
| P2 | Escalations backup | 494 files, 4,196,356 bytes, byte-identical to source at `C:\SATHYA\backups\DynDisc4\escalations-pre-iter1-2026-05-23` | 2026-05-23 |
| P3 | Baseline audit | `NEG-1779515273352_escalation_BUYER.audit.json` (21,317 bytes) saved as `C:\SATHYA\backups\DynDisc4\_baseline_audit.json` | 2026-05-23 |
| P4 | File inventory | `shared/logger.ts`, `shared/audit-writer.ts`, `agents/buyer-agent/index.ts`, `agents/seller-agent/index.ts` all confirmed present | 2026-05-23 |
| P5 | Package manager | npm (chosen over declared pnpm field; `package-lock.json` already present, no `pnpm-lock.yaml`). Workspace will be configured via npm `workspaces` field in `A2A/js/package.json` | 2026-05-23 |
| P6 | Root package.json | `A2A/js/package.json` (not at repo root) | Confirmed prior session |
| P7 | `/api/self/mode-status` on seller | Exists (added CONT8 / M2-ε) | Confirmed prior session |
| P8 | Hardcoded path grep | Definitive grep saved as artifact during Iteration 1 prep. Scope captured in errata E2 and E3 above. | 2026-05-23 |

---

## How to use this document

- Looking up a single decision: scan the table.
- Disagreeing with a decision: do not edit this file. Open a new design revision (v7) in a separate folder and supersede v6 in writing.
- Adding context to a decision: append to a "Notes" section below, never alter the locked value column.

---

## Notes (append-only)

### 2026-05-23 — Erratum E5: Twilio Account SIDs scrubbed from iter-1 branch (bulk + targeted)

The first acceptance-test deal (`NEG-1779521359763`, run during T2 verification) wrote
the Twilio Account SID into its `notifications[].error` field via WhatsApp delivery
failures (Twilio quota-exceeded error 63038). When the iter-1 branch was pushed to
origin, GitHub Push Protection rejected the push at 5 occurrences in that file.

**On second push attempt, the scanner then flagged the same SID in a LEGACY audit
file (`NEG-1779294300774_escalation_BUYER.audit.json`), revealing that the SID was
pre-existing in the 494 historical files migrated from `escalations/` into
`_legacy_escalations/` by Iteration 1.** The same Twilio account had been used
throughout the project, so most historical deals that experienced a Twilio quota
error embedded the same account SID into their audit JSON. Selectively scrubbing
file-by-file would have been whack-a-mole; a bulk scrub was required.

**Action taken (2026-05-23):**
- The entire `audits/2026-05-23/NEG-1779521359763/` folder was deleted from the
  iter-1 branch via history rewrite (soft reset + recommit). This was the test
  deal; no historical value.
- The 2 corresponding lines were removed from `audits/index.jsonl`.
- A bulk-scrub script (`Scrub-TwilioSIDs-LegacyAudits.ps1`) was written to walk
  every `*.audit.json`, `*.json`, and `*.txt` under `A2A/js/src/audits/` and
  replace every match of `(?-i)AC[0-9a-f]{32}` with the literal
  `AC_REDACTED_LEGACY`. Script result on first run: **502 files scanned, 112
  modified, 1680 SID occurrences replaced**. Second run: 0 modifications,
  confirming idempotency. Cross-check pass: zero SIDs remain anywhere under
  `audits/`.
- Original (un-redacted) audit data is preserved in the source-of-truth backup
  at `C:\SATHYA\backups\DynDisc4\escalations-pre-iter1-2026-05-23`. If the
  original SID is ever needed for forensics, restore from backup.
- Acceptance tests T1–T7 had already passed against `NEG-1779521359763`; they were
  re-validated against `NEG-1779524748883` (a later test deal). Test-AuditV6-Iter1.ps1
  was re-run after the scrub: expected to remain 34/34 PASS, 0 FAIL (the scrub
  only modifies `notifications[].error` string content; structural keys and
  shape are unaffected).
- No production data was affected.

**Root cause:** Iteration 1's audit-writer changes did not include a redactor for
upstream provider error strings. Any audit JSON containing a Twilio quota error
embeds the account SID via the raw error message.

**Deferred to a later iteration (NOT iter 2):** add a redactor in
`logger.ts` (or wherever `notifications[].error` is captured) that scrubs
`AC[a-f0-9]{32}` and similar provider-identifying patterns before writing to
disk. Until that ships, every new audit that includes a Twilio failure will
reintroduce the same secret-scanner trigger. Workaround for users running
iter-1 code locally and pushing to a secret-scanning-enabled remote: re-run
`Scrub-TwilioSIDs-LegacyAudits.ps1` before commit, or do not commit
`audits/YYYY-MM-DD/NEG-*/` folders containing such errors.

### 2026-05-23 — Notes addendum: 5-tier `messageSigningPosture.tier` enum (Iter 2)

Q15 locked `HASH_ENVELOPE` as the 5th tier of `messageSigningPosture.tier`
without enumerating the other 4 sibling values. Iter 2 needs the closed
enum to write the new audit block, so the full set is recorded here:

| Tier | Meaning | Wired today? |
|---|---|---|
| `NONE` | No envelope — plain payload, no tamper-evidence, no replay protection. Reserved for downgrade scenarios. | No |
| `HASH_ENVELOPE` | sha256(payload) + monotonic counter + ISO timestamp + sha256(envelope). Tamper-evidence + replay protection. No identity proof. | Yes — `PlainHashSigner` (current default) |
| `SIGNED_HASH` | `HASH_ENVELOPE` + Ed25519 (or equivalent) signature over the envelope hash. Cryptographic non-repudiation, but signing key not bound to a legal entity. | No — reserved intermediate step |
| `KERI_SEAL` | A KERI seal anchored in a Key Event Log (KEL) under a self-addressing identifier (SAID). Auditable key history and rotation. | No — reserved for iter-9 / iter-14 (KERI signing track) |
| `VLEI_BOUND` | `KERI_SEAL` + the signing AID is provably delegated via the GLEIF chain `GLEIF_ROOT → QVI → LE → OOR → agent`. Signature legally binds the represented legal entity. | No — reserved for iter-14 (full vLEI binding) |

Every audit written today emits `"tier": "HASH_ENVELOPE"` because that is
the honest label for what `PlainHashSigner` produces. The other 4 values
are reserved vocabulary so future iterations can climb the ladder without
audit-schema changes.

This addendum does not modify Q15 (locked value remains "add `HASH_ENVELOPE`
as the 5th tier"); it documents the full set of sibling values that Iter 2
encodes into the audit JSON schema.

### 2026-05-24 — Notes addendum: Iter 3 vocabulary lock (intent + autonomy)

Iter 3 emits two new audit blocks: `intent` and `autonomy`. Q9 (autonomy
model), Q31 (discriminator placement), and Q32 (commitGate state enum) lock
the **structure** but leave the **vocabulary** open. This addendum locks
the vocabulary so future iterations do not silently redefine these enums.

Nothing in this addendum changes the locked value column for Q9 / Q31 / Q32;
it only supplies the sibling values that Iter 3 encodes.

#### Item 1 — `autonomy.capabilitiesActive` six pillars (Q9 Option C)

Locked vocabulary, mapped to the procurement agents' actual behavior today.
Each entry on the audit block is `{ active: boolean, justification: string,
deferredTo?: string }`.

| Pillar | Meaning | Active today? |
|---|---|---|
| `goalInterpretation` | Agent receives a mandate and parses it into actionable parameters | true (`scenario-loader` / `cli-parser`) |
| `planning` | Agent chooses its own round-by-round action sequence | true (buyer `decideAction`, seller L2 reasoner) |
| `toolInvocation` | Agent calls sub-agents / external services without per-call human approval | true (advisor consultations, ACTUS, market data) |
| `commitmentAuthority` | Agent commits binding outcomes (PO / Invoice) without human approval | true (buyer auto-commits on `ACCEPT_OFFER`) |
| `peerCommunication` | Agent talks directly to other agents (A2A) without human relay | true (buyer↔seller, both↔treasury) |
| `learningFromOutcome` | Agent modifies future behavior based on past outcomes | false (L4 deferred) |

Ordering is the canonical order in which Iter 3 emits the six rows. The enum
is closed: adding a seventh pillar requires a new addendum.

#### Item 2 — `autonomy.humanOversightPosition` enum

Locked enum, ordered weakest → strongest human oversight:

`"HITC"` | `"HITL"` | `"HITL_with_guardrails"` | `"HOTL"` | `"HOTL_with_guardrails"` | `"HOOTL"` | `"HOOTL_with_guardrails"`

Current state value: **`"HOOTL_with_guardrails"`** (matches PLAN Iter 3 T4).

Sibling field `autonomy.guardrails: string[]` enumerates the active guardrails.
For the current state: `["maxRounds=3", "treasury-ACTUS-veto", "applySellerConstraints"]`.

#### Item 3 — `intent.expectedOutcome.shape` discriminator enum (Q31 Option A)

Q31 locks "sibling fields next to `outcome`" but does not enumerate `shape`.
Locked enum:

- `"PRICE_RANGE_CLOSE"` — author expects deal to close within a price range
- `"POINT_CLOSE"` — author expects deal to close near a single target price
- `"ESCALATION_EXPECTED"` — author explicitly expects escalation
- `"ABANDON_EXPECTED"` — author expects walk-away with no escalation
- `"FREE_TEXT"` — author wrote `likely` as free-form text; no machine-parseable shape

`shape` is **inferred at audit-write time** from the scenario's
`expectedOutcome.likely` string via a small heuristic in `intent-block.ts`:
- regex matches a numeric range (e.g. `₹370–₹390`, `370-390`, `370 to 390`) → `PRICE_RANGE_CLOSE`
- regex matches keyword `escalat` → `ESCALATION_EXPECTED`
- regex matches keyword `abandon|walk away|walk-away` → `ABANDON_EXPECTED`
- regex matches a single price target with no range → `POINT_CLOSE`
- otherwise → `FREE_TEXT`

No false precision. When `shape` is `FREE_TEXT`, no derived numeric fields
(e.g. `priceRange`) are emitted.

Sibling fields on `expectedOutcome` (per Q31 Option A — next to `outcome`,
not nested deeper):
- `shape` — the discriminator above
- `likely` — verbatim from scenario
- `possible` — verbatim (optional)
- `failureMode` — verbatim (optional)
- `priceRange?` — `{ minPerUnit, maxPerUnit, currency }`, only when `shape=PRICE_RANGE_CLOSE`
- `roundRange?` — `{ minRounds, maxRounds }`, only when parseable from `likely`

#### Item 4 — `intent.deviationFromIntent.dimensions[]` taxonomy

Locked dimension enum. Each entry on `dimensions[]` is
`{ dimension, expected, actual, severity, note }`:

- `"outcomeShape"` — expected shape vs actual deal status (CLOSED / ESCALATED / FAILED / REJECTED)
- `"pricePerUnit"` — parsed price range vs actual final unit price
- `"roundCount"` — parsed round range vs actual rounds used
- `"productMismatch"` — `situation.product` vs actual closed product
- `"quantityMismatch"` — `situation.quantity` vs actual closed quantity

Severity enum: `"high"` | `"medium"` | `"low"` | `"none"`. `dimensions[]` is
`[]` (empty array) when there is no deviation OR no declared intent — the
empty array is explicit, not omitted, so absence is distinguishable from
"never declared."

Sibling field `intent.intentSource: string`:
- `"SCENARIO_DECLARED"` — buyer was started with `--scenario <id>`
- `"AGENT_DEFAULT_CONFIG"` — no scenario; falling back to agent's hardcoded defaults
- `"NONE"` — nothing known (defensive default)

#### Item 5 — `autonomy.commitGate.wouldFireAt[]` event taxonomy

Today `commitGate.state` is **always `"NOT_REQUIRED"`** (no human-approval
gate exists in the procurement agents). The 8-value enum (Q32) is reserved
vocabulary; only `NOT_REQUIRED` is wired today.

`wouldFireAt[]` records events that *would have* fired a commit gate if one
existed. Locked event types:

- `"TREASURY_VETO"` — seller's `applyTreasuryConstraint()` or L2's `runL2Path` rejects on ACTUS / NPV / safety-threshold grounds. `wouldRequireApproval: true`.
- `"MAX_ROUNDS_REACHED"` — buyer's `escalateToHuman` invoked because `currentRound >= maxRounds`. `wouldRequireApproval: true`.
- `"COUNTERPARTY_REJECT_FINAL"` — buyer received a `finalRound: true` REJECT from seller. `wouldRequireApproval: true`.
- `"GUARDRAIL_OVERRIDE"` — `applySellerConstraints` overrode the LLM proposal. Informational only. `wouldRequireApproval: false`.

Each entry: `{ eventType, round, timestamp, triggerSource, details, severity, wouldRequireApproval }`.

Severity reuses the iter-4 dimension severity enum (`high` / `medium` / `low` / `none`).

Both agents accumulate per-negotiation arrays (`state.commitGateEvents`)
parallel to how `decisionTrail` is accumulated today. Cleared by
`message-log-collector`-style cleanup at deal close in iter 4+ if needed;
for iter 3, in-memory map keyed by `negotiationId` is sufficient.

#### Item 6 — `scenarioIntent` propagation buyer → seller via `OfferData`

`intent-types.ts` documents that today the seller's behavior is driven by its
`.env` (`SELLER_RESPONSE_MODE`) and hardcoded `SELLER_CONFIG`; the scenario's
`sellerIntent` is captured in the JSON but **not yet transmitted** to the
seller agent, with the explicit note that doing so requires extending the
OFFER envelope schema and was out of CONT8 scope.

Iter 3 takes that step, **scoped strictly to audit purposes** (not behavior).
The seller's runtime behavior remains unchanged — it continues to act on its
`.env` and `SELLER_CONFIG`. Iter 3 only records the received intent in the
seller's audit block.

New type `ScenarioIntentExcerpt` in `shared/intent-types.ts`:

```ts
export interface ScenarioIntentExcerpt {
  scenarioId:      string;
  scenarioTitle:   string;
  buyerIntent:     BuyerIntent;
  sellerIntent:    SellerIntent;
  situation:       Situation;
  expectedOutcome: ExpectedOutcome;
}
```

Wiring:
- `BuyerNegotiationState.scenarioIntent?: ScenarioIntentExcerpt` — populated in `startNegotiation` if `--scenario <id>` was passed.
- `OfferData.scenarioIntent?: ScenarioIntentExcerpt` — new optional field; populated on the first offer the buyer sends.
- `SellerNegotiationState.receivedScenarioIntent?: ScenarioIntentExcerpt` — captured in `handleBuyerOffer` from `OfferData.scenarioIntent`.

Both sides build their `intent` block from their own state at deal close.
When no scenario was declared, `intent.intentSource = "AGENT_DEFAULT_CONFIG"`
and both `buyerIntent` / `sellerIntent` blocks are derived from the agents'
hardcoded defaults instead.

This wire is **audit-only**. The intent-types.ts honesty comment about
seller-intent NOT driving seller behavior **remains accurate**.

#### What this addendum does NOT change

- Q9 / Q31 / Q32 locked value columns — unchanged.
- Seller's runtime behavior — unchanged. `SELLER_RESPONSE_MODE` and `SELLER_CONFIG` continue to drive decisions.
- `commitGate.state` runtime value — remains `"NOT_REQUIRED"` until a real commit gate is built (post-MVP).
- `learningFromOutcome` pillar — remains `false` until L4 ships.

### 2026-05-25 — Notes addendum: Iter 4 vocabulary lock (reasoning + delegation chain)

Iter 4 emits two new audit blocks: `thinkCycleTrace[]` and
`delegationChain[]`. PLAN Iter 4 §Scope locks the **structure** at a
high level. DECISIONS.md Q8 / Q10 / Q31 lock partial vocabulary. This
addendum locks the remaining vocabulary plus the **scoping philosophy**
under which iter 4 ships.

Nothing in this addendum changes the locked value column for any prior
Q. It supplies the field-level vocabulary that iter 4 encodes and the
honest-current-state scoping that governs what gets emitted vs deferred.

#### Item 0 — Core philosophy: honest partial > misleading complete

The audit must capture only what the system can honestly observe,
verify, and attest to today. Concretely, iter 4 honors all of:

- If a referenced paper or specification is inaccessible at iter-4 time,
  do not guess missing schema fields. Lock what's reachable; defer the
  rest with an explicit deferred-reason marker.
- If an agent does not have a real multi-step reasoning pipeline, do
  not force one onto it. Emit the block only on the agent where the
  structure is genuine.
- If the system does not yet support a compliance capability (e.g. human
  override or intervention), do not pretend it does. The relevant
  attribute is `false`, not silently omitted.
- If the LLM SDK does not return a telemetry field, do not emit a null
  for it. **Missing by design ≠ missing by failure.** Omit the key.

This philosophy governs every other item below. Where a tension exists
between schema completeness and honesty, honesty wins.

#### Item 1 — `thinkCycleTrace[]` scope and the 5 step names (Q4-1)

`thinkCycleTrace[]` is emitted on the **seller audit only**. The buyer
agent has no advisor pipeline, no math aggregator, and no tier-gated
prompt structure; forcing a 5-step shape on it would fabricate
structure that doesn't exist (Item 0).

Locked step names and ordering, sourced verbatim from FRAMEWORK-V2 §6
("The five-step seller-response-thinking-iteration"):

| # | stepName              | What runs in this step                                                  |
|---|-----------------------|-------------------------------------------------------------------------|
| 1 | `receiveOffer`        | Receive the buyer's offer envelope; load negotiation state              |
| 2 | `advisorConsultation` | Decide which advisors to consult; call them in parallel                 |
| 3 | `mathAggregator`      | Run `ADVISOR_MATH_AGGREGATOR` (effective floor, NBS, utility)           |
| 4 | `geminiCall`          | Build the tier-appropriate prompt; call Gemini                          |
| 5 | `guardrails`          | Apply tier-appropriate guardrails to Gemini's output → final decision   |

One `thinkCycleTrace[]` entry per round. Each entry has shape:

```json
{
  "round": <int>,
  "steps": [
    { "stepNumber": 1, "stepName": "receiveOffer",        ...step-1 observable output... },
    { "stepNumber": 2, "stepName": "advisorConsultation", ...step-2 observable output... },
    { "stepNumber": 3, "stepName": "mathAggregator",      ...step-3 observable output... },
    { "stepNumber": 4, "stepName": "geminiCall",          ...step-4 fields per Item 2... },
    { "stepNumber": 5, "stepName": "guardrails",          ...step-5 observable output... }
  ]
}
```

Steps 1–3 and 5: each carries only the fields that are observable from
what that step actually computes. No standard subset is forced. (The
shape is implementation-driven, not schema-driven, per Item 0.)

#### Item 2 — `gen_ai.*` field policy and placement (Q4-6, Follow-on A)

`gen_ai.*` keys appear **only on step 4** of each `thinkCycleTrace[]`
entry (the `geminiCall` step). Steps 1, 2, 3, 5 do not carry `gen_ai.*`
keys — there is no LLM call there, so the field family doesn't apply.

Field set on step 4: the **honest superset of what the Gemini SDK
actually returns**, named per [OTEL-GENAI-SEMCONV]. A field is emitted
only when the SDK produces a value for it. Examples likely present:

- `gen_ai.system` (`"gemini"`)
- `gen_ai.request.model`
- `gen_ai.response.id`
- `gen_ai.response.finish_reasons`
- `gen_ai.usage.input_tokens`
- `gen_ai.usage.output_tokens`

Plus, on step 4 only:

- `prompt.hash`  — sha256 of the prompt text, always emitted
- `prompt.text`  — verbatim prompt text, emitted per Item 3's config flag

Fields the SDK does not return are **omitted from the JSON**, not
written as `null`. (Item 0.)

#### Item 3 — `prompt.text` config flag (Q4-7, Follow-on B)

A config flag controls whether `prompt.text` is written into the audit.

- **Flag name:** `auditConfig.includePromptText`
- **Default value (iter 4):** `true`
- **When `true`:** step 4 emits both `prompt.hash` and `prompt.text`
- **When `false`:** step 4 emits only `prompt.hash`; the `prompt.text`
  key is **omitted entirely**, not written as `null`

The flag's storage location (env var, config file, hardcoded constant)
is an implementation detail resolved during the iter-4 code-edit phase
by reading existing project conventions in `shared/`. The **behavior**
above is locked regardless of where the flag lives.

Acceptance test PLAN T6 ("Audit contains both `prompt.hash` AND
`prompt.text` (config flag verifiable)") is honored at default. Setting
the flag to `false` and re-running yields an audit with only
`prompt.hash` — that's the verifiability path.

#### Item 4 — `delegationChain[]` step vocabulary (Q4-4)

`delegationChain[]` is emitted on the **seller audit only**, for the
same reason as Item 1: the 6 step names enumerate seller-side
sub-agents and the seller's executive-synthesis layer. Buyer does not
have this structure.

Locked step name enum, sourced verbatim from
`AUDIT-FRAMEWORK-V6-DESIGN.md` Appendix B.2.2:

1. `treasury-consultation`
2. `inventory-consultation`
3. `logistics-consultation`
4. `credit-consultation`
5. `executive-synthesis`
6. `consultation-routing`

PLAN T3 ("~18 entries (6 × 3 rounds) for a 3-round deal") is satisfied
when every round emits all 6 entries in canonical order. Per
Appendix B.2.2, this enum lives in a config file
(`@chainaim/audit-framework-procurement/config/delegation-steps.json`
or equivalent location chosen at code-edit time), not hardcoded in a
TypeScript enum in the core validator.

#### Item 5 — DCC properties on each delegation entry (Q10 partial)

Q10 locks "YES — all 7 DCC properties." The 7 are sourced from
[DCC-2026] (Patil, *SentinelAgent*, arXiv 2604.02767, 2026), which is
not accessible at iter-4 time. Per Item 0, iter 4 does **not** invent
the missing 3.

Iter 4 emits the **4 properties verifiably sourced from FRAMEWORK-V2 §8**:

1. `decidedBy`         — agent that produced this decision
2. `onAuthorityOf`     — organizational role under which the decision was made
3. `authorityEnvelope` — `{ description, limits }` of the role's authority
4. `signature`         — see Item 7

Plus an explicit deferred-state marker block per entry:

```json
"dcc": {
  "propertiesEmitted":   4,
  "propertiesFullSpec":  7,
  "spec":                "FRAMEWORK-V2 §8 (4 of 7)",
  "deferredReason":      "[DCC-2026] Patil arxiv 2604.02767 not accessible at iter-4 lock time (2026-05-25). Remaining 3 properties to be added in a future addendum once the spec is read."
}
```

When the [DCC-2026] spec becomes accessible, a future addendum locks the
remaining 3 properties and removes the deferred marker. Q10's locked
value column in the main table is unchanged.

#### Item 6 — EU AI Act Article 14 attributes per delegation entry (Q4-3)

Closed set per delegation entry: **the 4 booleans named in PLAN Iter 4
T5**, no more. The full Article 14 attribute set is larger as a
regulation but the values for those additional attributes cannot be
honestly stated until the code supports the underlying capabilities
(intervention paths, override paths, etc).

Locked attribute set today:

| Attribute              | Current state value | Why |
|------------------------|---------------------|-----|
| `monitorability`       | `true`              | Live agent state observable via existing `/api/self/*` endpoints |
| `traceability`         | `true`              | `messageLog[]` (iter 2) + `decisionTrail` capture every message and decision |
| `interventionPossible` | `false`             | No mid-deal pause/intervene endpoint exists in current code |
| `overridePossible`     | `false`             | No human-override endpoint exists; `commitGate.state` is always `NOT_REQUIRED` (iter-3 addendum) |

Per-entry shape:

```json
"euAiActArticle14": {
  "monitorability":       true,
  "traceability":         true,
  "interventionPossible": false,
  "overridePossible":     false,
  "attributesEmitted":    4,
  "note":                 "Honest current-state booleans per ITERATION-PLAN Iter 4 T5. Article 14 as a regulation defines additional attributes; those are deferred until the code supports intervention and override paths."
}
```

When intervention/override paths ship in a future iteration, those
booleans flip and additional Article 14 attributes can be added in a
future addendum.

#### Item 7 — `decisionAttestation` signature target and signer (Q4-5)

Each delegation entry's `signature` field is structured per FRAMEWORK-V2
§8:

```json
"signature": {
  "kind":     "HMAC",
  "value":    "<hex-encoded signature output>",
  "signedAt": "<ISO 8601 UTC timestamp>"
}
```

- **kind** today: `"HMAC"`. (Future tiers per V2 §8: `vLEI-OOR-credential`,
  `vLEI-LE-credential` — out of scope per PLAN Part 7.)
- **Signer:** the existing `PlainHashSigner` (= `messageSigningPosture.tier`
  value `HASH_ENVELOPE` per iter-2 addendum). No new signer in iter 4.
- **Signed value (`value` field):** the output of
  `PlainHashSigner.sign( sha256( canonicalJSON(entry-minus-`signature`) ) )`,
  where `canonicalJSON` is sorted-key, no-whitespace JSON serialization of
  the delegation entry with the `signature` field excluded. The exact
  canonicalization helper is an implementation detail resolved at
  code-edit time by reusing whatever the iter-2 message-log signer
  already uses.

What this means in practice: every field of the delegation entry —
`stepName`, `decidedBy`, `onAuthorityOf`, `authorityEnvelope`,
`outcome`, `rationale`, `dcc.*`, `euAiActArticle14.*`, `signedAt` —
is covered by the signature. Mutating any of them invalidates the
signature. The `signature` field itself is excluded from its own
target (avoids the self-reference cycle).

T4 ("Has valid `decisionAttestation` signature (verifies with
MessageSigner)") is verified by passing each entry through the same
helper in the opposite direction.

#### Item 8 — Honesty markers as first-class schema (cross-cutting)

Per Item 0, every place iter 4 ships a partial implementation carries
a self-describing marker in the audit JSON so a reader can see the
partial-ness without external context. Locked marker fields:

- On each `delegationChain[]` entry: `dcc.propertiesEmitted`,
  `dcc.propertiesFullSpec`, `dcc.deferredReason` (Item 5)
- On each `delegationChain[]` entry: `euAiActArticle14.attributesEmitted`,
  `euAiActArticle14.note` (Item 6)
- At the top of `thinkCycleTrace[]` array (sibling field):
  `thinkCycleTraceScope: "seller-only"` so a reader doesn't ask
  "where's the buyer's?" (Item 1)
- At the top of `delegationChain[]` array (sibling field):
  `delegationChainScope: "seller-only"` for the same reason (Item 4)

These markers are append-only. Future iterations that expand a partial
implementation update the marker (e.g. `propertiesEmitted: 4 → 7`) and
add a corresponding addendum entry to this file.

#### What this addendum does NOT change

- **Q8** locked value (Gemini prompt storage hash+text now; config flag
  flips to hash-only later) — Item 3 implements this behavior verbatim.
- **Q10** locked value column (`DCC per delegation entry: YES — all 7
  properties`) — Item 5 ships 4-of-7 with an explicit deferred marker;
  the locked target remains 7.
- **Q31** locked value (discriminator placement: Option A, sibling
  fields next to `outcome`) — unchanged.
- **Q32** locked value (`commitGate.state` enum: all 8 values) — unchanged;
  `commitGate` runtime state remains `"NOT_REQUIRED"` per iter-3 addendum
  Item 5.
- The buyer audit. Iter 4 does not modify the buyer audit shape. Buyer
  retains its iter-3 state. (Item 1 / Item 4 scoping.)
- `shared/llm-client.ts` instrumentation captures LLM call telemetry
  for **every** caller (buyer or seller) so the same client serves both.
  But only the seller-side audit consumer reads from that telemetry
  buffer in iter 4. Whether the buyer audit later surfaces its own
  LLM-call records is out of scope here.

#### What's deferred to the iter-4 code-edit phase (not locked here)

The following are implementation choices that are resolved by reading
existing project code/conventions during the iter-4 file/edit plan, not
by this addendum:

- **Q4-7 specifics:** the exact storage location for
  `auditConfig.includePromptText` (env var name, config module path, or
  hardcoded constant location). Behavior in Item 3 is locked regardless.
- **Q4-8:** the relationship between the new `thinkCycleTrace[]` /
  `delegationChain[]` and the existing in-state `decisionTrail`
  accumulator (iter-3 addendum Item 5 referenced this). Resolved by
  reading `agents/seller-agent/index.ts` at code-edit time. Default
  intent: both new blocks are additive; `decisionTrail` is untouched.
- The exact canonical-JSON helper to use for Item 7's signature target.
- The on-disk location of the `delegation-steps.json` config file
  (Item 4) — `packages/audit-framework-procurement/config/` is the
  intent per v6 Appendix B.2.2 but the actual workspace path is
  resolved at code-edit time.

### 2026-05-25 — Notes addendum: Iter 5 vocabulary lock (economics + self-check + compliance)

Iter 5 emits three new audit blocks on **both** the buyer audit and the
seller audit: `frameworkMetrics`, `selfCheck`, and `compliance`. Q6
already locks the four `selfCheck.overallVerdict` values. This addendum
locks the remaining vocabulary (the 5 boolean check names, the metric
schema, the compliance crosswalk schema, the verdict derivation rule,
and the per-block scope markers) and restates the honest-partial
philosophy from the iter-4 addendum so iter-5 honors it consistently.

Nothing in this addendum changes the locked-value column for any prior
Q. It supplies the field-level vocabulary that iter 5 encodes and the
honest-current-state behavior that governs what is computed vs deferred.

#### Item 0 — Core philosophy (carried forward verbatim from iter-4 Item 0)

Honest partial > misleading complete. Missing by design ≠ missing by
failure. Cross-side N/A (e.g. seller-only blocks on the buyer audit) is
represented as explicit tri-state `null` on a uniform shape, NOT by
omission of the key — so a reader can distinguish "not applicable on
this side" from "should have been there but failed." The selfCheck
array length (5) is preserved across both sides; the tri-state captures
the honesty.

#### Item 1 — `frameworkMetrics` block schema and scope

Scope marker: `frameworkMetricsScope: "both"` — emitted on both audits.

Shape:

```json
"frameworkMetrics": {
  "frameworkMetricsScope": "both",
  "cost": {
    "totalCostUSD": <number>,
    "currency":     "USD",
    "byModel": {
      "<model-name>": {
        "calls":         <int>,
        "inputTokens":   <int>,
        "outputTokens":  <int>,
        "costUSD":       <number>
      }
    },
    "perCallSource": "shared/llm-client.ts estimateCostUSD (GEMINI_PRICING table dated May 2026)"
  },
  "outcome": {
    "closed":               <bool>,
    "finalPrice":           <number|null>,
    "currency":             "INR",
    "surplusCapturedShare": <number|null>
  },
  "riskAvoided": {
    "treasuryVetoes":           <int>,
    "maxRoundsReached":         <int>,
    "counterpartyRejectFinal":  <int>,
    "guardrailOverrides":       <int>,
    "source":                   "/autonomy/commitGate/eventCounts"
  }
}
```

Cost source: on the SELLER audit, sum of `gemini.estimatedCostUSD`
across every `thinkCycleTrace[].steps[stepName=geminiCall]`. On the
BUYER audit, sum of LLM-call cost records collected by the buyer agent
during the deal (the buyer's existing LLM telemetry, captured through
the same `shared/llm-client.ts` instrumentation). `byModel` is the same
sum keyed by `gen_ai.request.model`. When a side performed zero LLM
calls, `totalCostUSD` is `0` and `byModel` is `{}` — emitted, not
omitted (Item 0).

`outcome.surplusCapturedShare` is sourced from
`outcomeQuality.surplusSplit.buyerShare` on the buyer audit and
`outcomeQuality.surplusSplit.sellerShare` on the seller audit. `null`
when the deal did not close or `outcomeQuality` is absent.

`riskAvoided` counts mirror `autonomy.commitGate.eventCounts` (iter-3
addendum Item 5) into the metrics block so a regulator reading
`frameworkMetrics` alone gets the risk-avoidance summary without
navigating to `autonomy`. The `source` pointer makes the duplication
explicit.

**T1** ("Total cost in USD is non-zero and reasonable for round count")
passes when `cost.totalCostUSD > 0` AND `cost.byModel` has at least one
entry with `calls >= 1`, on any audit produced from a deal where at
least one Gemini call succeeded. **T5** ("Cost calculation matches
Gemini's published per-token pricing") passes when for every
`byModel[m]`: `costUSD == round((inputTokens/1e6)*pricing[m].in +
(outputTokens/1e6)*pricing[m].out, 8)` where `pricing` is the
`GEMINI_PRICING` table in `shared/llm-client.ts`.

#### Item 2 — `selfCheck` block schema, scope, and the 5 check names

Scope marker: `selfCheckScope: "both"`. The array has length 5 on
both sides. Cross-side N/A checks carry `passed: null` with a `note`
explaining the scoping (Item 0).

Locked check names + RFC-6901 `ref` pointers (evaluated against the
audit JSON containing the selfCheck block):

| # | check.name                  | passes when                                                                                                              | ref                       | per-side scope |
|---|-----------------------------|--------------------------------------------------------------------------------------------------------------------------|---------------------------|----------------|
| 1 | `identityVerified`          | `identityProof.self.lei` and `.counterparty.lei` both present; counterparty `verified === true` (plain mode)             | `/identityProof`          | both           |
| 2 | `messageIntegrityIntact`    | every `messageLog[]` receive entry has `verification.valid === true`; `messageSigningPosture.tier` ∈ the 5-value enum    | `/messageSigningPosture`  | both           |
| 3 | `intentDeclaredAndTracked`  | `intent.intentSource !== "NONE"` AND `intent.deviationFromIntent` present (empty `dimensions[]` is fine)                  | `/intent`                 | both           |
| 4 | `reasoningAuditable`        | every `thinkCycleTrace[]` round has a `geminiCall` step with valid `prompt.hash` (sha256(prompt.text) == hash if text present) | `/thinkCycleTrace`    | seller-only    |
| 5 | `delegationAttested`        | every `delegationChain[]` entry has a valid HMAC signature matching `computeDelegationSignatureValue(entry-minus-sig)`     | `/delegationChain`        | seller-only    |

On the BUYER audit, checks 4 and 5 are emitted with `passed: null` and
`note: "scope: seller-only per iter-4 addendum Item 1/4 — not
applicable on buyer audit"`. The `ref` field on a cross-side N/A check
is still emitted (`/thinkCycleTrace`, `/delegationChain`) so the reader
can verify the absence with a deterministic pointer; resolving the
pointer on the buyer audit yields "not found", which matches the honest
tri-state.

Per-check entry shape:

```json
{
  "name":   "<one-of-five>",
  "passed": <true|false|null>,
  "ref":    "<RFC-6901 JSON Pointer>",
  "note":   "<optional string>"
}
```

#### Item 3 — `selfCheck.overallVerdict` derivation (uses Q6 enum)

Q6 locks the four values: `ON_TRACK` / `ON_TRACK_BUT_FLAGGED` /
`OFF_TRACK` / `NEEDS_REVIEW`.

Derivation algorithm (locked, evaluated against the 5 checks):

```
critical       = (identityVerified === true) AND (messageIntegrityIntact === true)
allPassedOrNA  = every check is true OR null     // null counts as passed for cross-side

if (!critical)           -> "OFF_TRACK"
else if (allPassedOrNA)  -> "ON_TRACK"
else                     -> "ON_TRACK_BUT_FLAGGED"
```

`NEEDS_REVIEW` is reserved vocabulary for cases where the algorithm
cannot evaluate (e.g. a referenced block is malformed, an `unknown`
schema version is detected). It is NOT produced by a clean iter-5 audit
on a successful deal; future iterations may emit it when explicit
uncertainty needs to be surfaced. The enum value remains locked.

#### Item 4 — `compliance` block schema, framework set, and wildcard convention

Scope marker: `complianceScope: "both"`.

Shape:

```json
"compliance": {
  "complianceScope": "both",
  "evidenceRefConvention": "RFC-6901 JSON Pointers, extended with non-standard wildcard '*' meaning 'every index in the array at the parent path'. A reader expanding a wildcard MUST emit one concrete pointer per array index found on the audit being inspected; a wildcard pointing into an absent array (e.g. /thinkCycleTrace/* on a buyer audit) resolves to zero concrete pointers, which is the honest cross-side state per Item 0.",
  "frameworks": [
    { "id": "NIST_AI_RMF",            "version": "1.0",                              "mappedTo": ["GOVERN-1.1", "MEASURE-2.7", "MANAGE-4.1"],                        "evidenceRefs": ["/autonomy", "/decisions", "/intent/deviationFromIntent"] },
    { "id": "ISO_42001",              "version": "2023",                             "mappedTo": ["6.1.2", "8.2", "9.1"],                                            "evidenceRefs": ["/autonomy/capabilitiesActive", "/decisions"] },
    { "id": "EU_AI_Act_Article_14",   "version": "Reg 2024/1689",                    "mappedTo": ["human-oversight"],                                                "evidenceRefs": ["/delegationChain/*/euAiActArticle14", "/autonomy/humanOversightPosition"] },
    { "id": "DCC_2026",               "version": "Patil arXiv 2604.02767 (deferred)","mappedTo": ["4-of-7 properties per iter-4 Item 5"],                             "evidenceRefs": ["/delegationChain/*/dcc"] },
    { "id": "OpenTelemetry_GenAI",    "version": "semconv v1.28",                    "mappedTo": ["gen_ai.system", "gen_ai.request.model", "gen_ai.usage.*"],        "evidenceRefs": ["/thinkCycleTrace/*/steps"] },
    { "id": "VERIFAGENT_2025",        "version": "deferred (post-WEDGE1)",           "mappedTo": ["challenge-response (not yet wired)"],                             "evidenceRefs": [] }
  ]
}
```

Locked framework `id` ordering: `NIST_AI_RMF`, `ISO_42001`,
`EU_AI_Act_Article_14`, `DCC_2026`, `OpenTelemetry_GenAI`,
`VERIFAGENT_2025`. This is the order `frameworks[]` is emitted in.

Frameworks whose `evidenceRefs[]` point into seller-only blocks (e.g.
`EU_AI_Act_Article_14` → `/delegationChain/*/euAiActArticle14`,
`DCC_2026` → `/delegationChain/*/dcc`, `OpenTelemetry_GenAI` →
`/thinkCycleTrace/*/steps`) emit those wildcard pointers on BOTH audits.
On the buyer audit those pointers resolve to zero concrete pointers,
which is the honest cross-side N/A state per Item 0. The `complianceScope`
remains `"both"` because the crosswalk itself applies to both audits
uniformly; the resolved evidence count differs by side.

**T4** ("compliance block has entries for NIST AI RMF, ISO 42001, EU AI
Act Article 14, DCC") passes when those four `id` values are present in
`frameworks[]`. `OpenTelemetry_GenAI` and `VERIFAGENT_2025` are emitted
but not required by T4.

#### Item 5 — Per-block scope markers (cross-cutting honesty, iter-4 Item 8)

Iter 5 adds three scope markers, all `"both"`:

| Sibling marker key      | Value    | Block              |
|-------------------------|----------|--------------------|
| `frameworkMetricsScope` | `"both"` | `frameworkMetrics` |
| `selfCheckScope`        | `"both"` | `selfCheck`        |
| `complianceScope`       | `"both"` | `compliance`       |

These are append-only. If a future iteration restricts a block to one
side, the marker flips to `"buyer-only"` or `"seller-only"` and an
addendum entry records the change with rationale.

#### Item 6 — What this addendum does NOT change

- **Q6** locked value (the four `overallVerdict` enum values) — Item 3
  implements the derivation; the enum itself is unchanged.
- **Q8** locked value (Gemini prompt storage hash+text now, config flag
  flips to hash-only later) — unchanged. `prompt.text` continues to be
  the verification source for `prompt.hash`; when the flag flips, the
  `reasoningAuditable` selfCheck still passes by verifying `prompt.hash`
  shape alone (the verification path adapts at the iter-5 code-edit phase).
- Buyer audit shape — unchanged from iter-3/iter-4 EXCEPT for the three
  new top-level blocks (`frameworkMetrics`, `selfCheck`, `compliance`).
  The seller-only blocks (`thinkCycleTrace`, `delegationChain`) remain
  absent on the buyer.
- The `GEMINI_PRICING` table in `shared/llm-client.ts` — used as-is for
  iter-5 since iter-4 audits already depend on it and passed. A one-time
  verification against Google's published per-token pricing page is
  required before tagging iter-5; the table is updated in a follow-up
  commit if rates have moved.
- Existing audit-block builders (`identity-proof.ts`,
  `message-signing-posture.ts`, `intent-block.ts`, `autonomy-block.ts`,
  `think-cycle-trace.ts`, `delegation-chain.ts`) — none of them are
  modified by iter-5.

#### What's deferred to the iter-5 code-edit phase (not locked here)

- Whether `frameworkMetrics` / `selfCheck` / `compliance` are computed
  inline inside `saveAuditJson` (preferred default — zero agent-side
  changes, since all three blocks are pure functions of the already-
  assembled audit object) or assembled by the agents and passed in (the
  iter-4 pattern). Default intent: compute inline; the audit-block
  builders are pure functions over typed input shapes and `logger.ts`
  orchestrates by extracting those inputs from the assembled audit just
  before serialization. This choice can flip without changing the
  vocabulary above.
- The exact RFC-6901 pointer resolver used by `Test-AuditV6-Iter5.ps1`
  to validate selfCheck `ref` fields against the audit JSON. PowerShell-
  side detail; the JSON Pointers themselves are locked above.

---

**End of decisions reference.**
