---
name: kids-portal-product
description: Kids Life OS product domain — roles, modules, terminology, and acceptance criteria. Use when adding or changing features, copy, user flows, or deciding whether something is in scope.
---

# Kids Portal Product

Closed-loop family OS. Work Orders in, Stars out, marketplace spend. Parents are dispatcher, inspector, central banker, and store manager.

## When to use

Read this skill before creating screens, entities, or user-facing copy. For field-level schema see `kids-portal-firebase`. For layout see `kids-portal-ui`. For build order see `kids-portal-milestones`.

Acceptance tables: [acceptance.md](acceptance.md).

## Roles

| Role | Age / mode | Jobs |
| --- | --- | --- |
| Parent | Admin | Create work orders, QA proofs, release Stars, adjust ledger with a reason, stock and fulfill the store |
| Junior child | ~5–8, `tier: junior` | Claim/see today’s missions, one-tap photo done, watch one goal fill up |
| Senior child | 9+, `tier: senior` | Accept work orders, checklists, task thread, Spend/Save/Give, catalog + custom buy request |

PIN / profile switcher: avatar picker on shared devices. Junior may have no PIN. Senior and parent use a 4-digit PIN. Parent also has email/password.

## Modules

1. **Work Order & Dispatch** — create, assign or open bounty, proof, parent Approve / Rework / Reject.
2. **Communication** — per-work-order thread (MSG-01). Parent-only family bulletins (MSG-02, Phase 2+).
3. **Virtual Bank** — Spend / Save / Give, append-only ledger, parent overrides with required memo.
4. **Family Marketplace** — privileges, outings, physical rewards; checkout from Spend; parent fulfillment; senior custom buy requests.

## Work order lifecycle

```
open (bounty) → in_progress → pending_review → completed
                    ↑                │
                    └── rework ←─────┘
```

- Unassigned + `isBounty: true`: first claim wins, then `in_progress` for that child only.
- Approve credits the ledger via Cloud Function and sets `completed`.
- Rework returns the order to the kid’s active list with the parent’s note.
- Reject is parent-only; do not pay Stars.

Categories: `Daily Habit`, `Chores`, `Schoolwork`, `Deep Clean`.

## Economy rules

- Currency is internal **Stars**. No bank links, no cash-out.
- Credits split by `members.allocationConfig`. Junior default: 100% Spend (or one Save goal). Senior default: 70/20/10 unless the parent changed it.
- Store checkout spends **Spend** only. Save is locked to a goal. Give is for gifts/charity.
- Custom buy requests (senior) go to the parent queue **before** any debit.
- Catalog items may have stock (`-1` = unlimited) and `cooldownHours`.

## Scope guardrails

In MVP (Milestones 1–6): single family, one parent login, multi-child profiles, photo proof, Spend ledger, small catalog, parent fulfillment.

Not now: real payments, kid-to-kid chat, public marketplace, social feed, interest, streak multipliers, recurring routines (Phase 2).

## Copy

- Junior: short verbs, “Today’s Missions”, “Done”, star count, one target name.
- Senior: work order ids (`WO-104`), priority, checklist, Accounts.
- Parent: Approval Queue, Manage Work Orders, Family Store / inventory.
- Do not use mockup OCR junk (`Portalital`, `Banosos`, `TARGETT`). Use the labels above.
