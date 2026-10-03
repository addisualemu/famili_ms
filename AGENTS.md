# Kids Life OS — Project Agent

Closed-loop family OS that teaches responsibility and money skills. Chores and homework are **Work Orders**. Kids earn **Stars**. Parents approve work, run the bank, and stock the **Family Marketplace**. No real-world banking.

## Source of truth

Read these before inventing behavior. Later code and these docs win over memory.

| Doc | Use for |
| --- | --- |
| `PRD.md` | Roles, modules, acceptance criteria, entities |
| `Technical_architectur.md` | Firebase schema, auth, rules, callable functions |
| `Implementation_phasing.md` | Build order. Never skip ahead. |
| `UI_mockup_ideas.jpeg` | Layout, density, and role-specific chrome |

Project skills in `.cursor/skills/` hold the working rules. Load the matching skill before editing that area.

| Work | Skill |
| --- | --- |
| Roles, copy, feature scope, acceptance | `kids-portal-product` |
| Auth, Firestore, Storage, Functions, rules | `kids-portal-firebase` |
| Screens, tiers, layout, visual language | `kids-portal-ui` |
| What to build now vs later | `kids-portal-milestones` |
| Reviewing a milestone or PR | `kids-portal-review` |

## Stack (locked)

- Vite + React + TypeScript + Tailwind CSS
- PWA (installable on shared tablets)
- Firebase: Auth, Firestore, Storage, Cloud Functions (`nodejs20`), Hosting
- Local emulators for Auth, Firestore, Storage, Functions
- Ledger and redemptions only through callable Cloud Functions

Do not switch to Next.js, a second database, or client-side balance writes.

## Hard rules

1. **One milestone at a time.** Finish the current phase’s acceptance checks before starting the next. No store UI in Milestone 3. No Cloud Functions until Milestone 5 unless the current milestone requires a stub.
2. **Stars never move on the client.** `members.balance` and `ledgerTransactions` change only inside Firestore transactions in Cloud Functions. Client code may read balances and submit callable requests.
3. **Shared-device auth.** One parent Firebase Auth session per family device. Kids switch via profile picker + optional PIN. Do not create a Firebase Auth user per child.
4. **Tier the UI, not the data.** Same collections for junior and senior. `members.tier` (`junior` \| `senior`) chooses presentation and which fields are shown.
5. **Task-bound chat only.** No global kid chat. Messages live under `workOrders/{id}/messages`.
6. **Kids’ photos stay in-family.** Proof images go to `families/{familyId}/proofs/`. No third-party analytics, ads, or public social features.
7. **Verify UI in the browser** after any visual or flow change. Exercise the path a parent or child would use. A screenshot is not enough.

## Terminology

Use these words in UI and code comments. Do not mix synonyms.

- Work Order (senior/parent). Junior label: **Mission**
- Stars (UI). Schema may use `pointValue` / `pointCost`
- Junior / Senior (not “little kid” / “teen mode”)
- Parent Console
- Spend / Save / Give
- Open Bounty
- Approval Queue, Rework, Fulfillment Queue
- Family Marketplace / Family Store

Work order `status`: `open` → `in_progress` → `pending_review` → `completed`. Rework returns to `rework` then `in_progress`.

## How to take a task

1. Identify the milestone from `kids-portal-milestones`.
2. Read the product + firebase + UI skills that the change touches.
3. Implement only that slice. Match `UI_mockup_ideas.jpeg` for the role you are building.
4. Check the feature IDs in `kids-portal-product` (WO-*, MSG-*, BNK-*, SHP-*).
5. If the change is visual, verify it in the browser on tablet and phone widths.
