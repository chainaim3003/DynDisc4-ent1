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

*(none yet)*

---

**End of decisions reference.**
