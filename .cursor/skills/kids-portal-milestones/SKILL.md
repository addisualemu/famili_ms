---
name: kids-portal-milestones
description: Kids Life OS sequential build protocol. Use when starting work, choosing the next slice, estimating scope, or when the user says build, continue, MVP, or next milestone.
---

# Kids Portal Milestones

An agent that “builds the whole app” will drop context and skip integrity work. Implement **one milestone**, prove it, then stop.

Source: `Implementation_phasing.md`.

## Current-milestone protocol

Executable tasks live in `PROGRESS.md`. This skill only defines phase done-when. Follow `kids-portal-progress` to claim and close ids.

1. Read `PROGRESS.md`. State the Active task id and the phase done-when below.
2. Read `kids-portal-product`, plus firebase/UI skills if that task touches them.
3. Implement only that task id.
4. Do not seed later-milestone UI “as a placeholder” unless the user asks.
5. Update `PROGRESS.md`. When the phase is fully `[x]`, list leftover gaps. Do not silently start the next milestone.

If `PROGRESS.md` Current Phase is `M1` (or the repo has no app yet), you are on **Milestone 1**.

## Milestone 1 — Setup and emulators

- Vite + React + TypeScript + Tailwind
- Firebase SDK, `firebase.json`, emulator config (Auth, Firestore, Storage, Functions)
- Env for project id + emulator flags
- Basic router shell (empty routes are fine)
- **Done:** `npm run dev` and `firebase emulators:start` both run. No product UI required.

## Milestone 2 — Auth shell and profile switcher

- Parent login
- Shared-tablet profile modal (avatars)
- Local 4-digit PIN for senior + parent
- Active member in client state
- **Done:** Parent can sign in, switch to a child profile, lock/unlock senior/parent. No missions yet.

## Milestone 3 — Junior dashboard (read and submit)

- Star total + one goal progress
- Today’s missions from Firestore
- One-tap photo proof → Storage → work order `pending_review`
- **Done:** Junior can see missions and submit a photo. Do not build Spend/Save/Give or the store.

## Milestone 4 — Senior dashboard and thread

- Spend / Save / Give cards (read-only balances)
- Work order detail, checklist toggles, two-way `messages` subcollection
- **Done:** Senior can complete a checklist, comment, and submit. Parent tools wait.

## Milestone 5 — Parent console and Cloud Functions

- Approval queue
- Create work order
- `approveWorkOrder` and (if store data exists) `redeemStoreItem` callables with transactions
- **Done:** Approve pays Stars atomically. Rework returns the order with a note. Client still cannot write `balance`.

## Milestone 6 — Family store and redemption

- Catalog grid
- CTA: Get this vs Need N more Stars
- Redemption → fulfillment queue
- **Done:** SHP-01 and SHP-02. SHP-03 custom buys stay out unless the user expands scope.

## Phase 2 (after Milestone 6)

Save/Give interest, recurring daily routines, streak multipliers, family bulletins, custom buy requests.

## Definition of done for any milestone

- Matches schema in `kids-portal-firebase`
- Matches the role UI in `kids-portal-ui`
- Acceptance IDs touched by the milestone pass
- UI paths verified in the browser when screens changed
- No leftover writes to `members.balance` from the client
