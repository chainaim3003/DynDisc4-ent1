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

---

**End of decisions reference.**
