# Kids Portal Progress

Source of work for every agent turn. Do not implement anything that is not a task below. If scope changes, add a task here first, then execute it.

## Current

- Phase: `M2`
- Active: `none`
- Updated: `2026-10-03`

Statuses: `[ ]` todo · `[~]` in progress (at most one) · `[x]` done · `[-]` blocked

---

## M0 — Docs, skills, and progress agent

Phase status: `done`

- [x] **M0-01** Write `PRD.md`
- [x] **M0-02** Write `Technical_architectur.md`
- [x] **M0-03** Write `Implementation_phasing.md`
- [x] **M0-04** Add `UI_mockup_ideas.jpeg`
- [x] **M0-05** Create project skills, `AGENTS.md`, and always-on rule
- [x] **M0-06** Create phase progress tracker, progress skill, and session hooks

---

## M1 — Project Setup

Phase status: `done`

Done when: `npm run dev` runs. No product UI. No Firebase emulators.

- [x] **M1-01** Scaffold Vite + React + TypeScript app in this repo
- [x] **M1-02** Add Tailwind CSS and a blank app shell
- [x] **M1-03** Add Firebase SDK, `firebase.json`, and placeholder config
- [-] **M1-04** Enable Auth, Firestore, Storage, and Functions emulators
- [x] **M1-05** Add `.env.example` and env wiring (project id)
- [x] **M1-06** Add basic client routing (empty routes are fine)
- [x] **M1-07** Verify the dev server starts locally

---

## M2 — Auth Shell & Profile Switcher

Phase status: `todo`

Done when: parent can sign in, switch to a child profile, and lock/unlock senior or parent with PIN. No missions yet.

- [ ] **M2-01** Build parent email/password login view
- [ ] **M2-02** Wire Firebase Auth and parent custom claims (`role`, `familyId`)
- [ ] **M2-03** Seed or create family + members (parent, Leo junior, Maya senior)
- [ ] **M2-04** Build shared-tablet avatar profile switcher
- [ ] **M2-05** Add 4-digit PIN lock for senior and parent (salted hash on member)
- [ ] **M2-06** Persist active member in client state
- [ ] **M2-07** Browser-verify login, switch, and PIN lock

---

## M3 — Junior Dashboard (Read & Submit)

Phase status: `todo`

Done when: junior sees missions and can submit a photo proof. No Spend/Save/Give. No store.

- [ ] **M3-01** Read junior member stars, goal, and today’s missions from Firestore
- [ ] **M3-02** Build junior home: star total + one goal progress bar
- [ ] **M3-03** Build Today’s Missions cards (Done / Not done)
- [ ] **M3-04** One-tap photo capture and upload to `families/{familyId}/proofs/`
- [ ] **M3-05** Submit proof and set work order to `pending_review`
- [ ] **M3-06** Browser-verify junior read + photo submit on tablet width

---

## M4 — Senior Dashboard & Work Order Thread

Phase status: `todo`

Done when: senior can toggle a checklist, comment on the work order, and submit. No parent console.

- [ ] **M4-01** Build senior dashboard Accounts cards (Spend / Save / Give, read-only)
- [ ] **M4-02** Build work order list (`WO-###`, title, stars, View / Submit)
- [ ] **M4-03** Build work order detail with checklist toggles
- [ ] **M4-04** Add two-way `messages` thread on the work order
- [ ] **M4-05** Senior proof submit → `pending_review`
- [ ] **M4-06** Stacked phone layout for senior console
- [ ] **M4-07** Browser-verify senior dashboard, thread, and phone width

---

## M5 — Parent Console & Cloud Functions

Phase status: `todo`

Done when: Approve pays Stars atomically; Rework returns the order with a note. Client still cannot write `balance`.

- [ ] **M5-01** Build Parent Console layout (approval queue + manage)
- [ ] **M5-02** Render pending_review submissions with photo thumbs
- [ ] **M5-03** Build create-work-order form (WO-01, including open bounty)
- [ ] **M5-04** Implement `approveWorkOrder` callable with a Firestore transaction
- [ ] **M5-05** Implement Rework (note required, status `rework`)
- [ ] **M5-06** Implement `redeemStoreItem` callable with a Firestore transaction
- [ ] **M5-07** Ship Firestore + Storage rules (ledger write = false)
- [ ] **M5-08** Browser-verify approve credits Stars and rework returns the mission

---

## M6 — Family Store & Redemption Flow

Phase status: `todo`

Done when: SHP-01 and SHP-02 pass. SHP-03 custom buys stay out.

- [ ] **M6-01** Parent can create/edit store items (stock, cooldown, active)
- [ ] **M6-02** Build marketplace grid by category
- [ ] **M6-03** CTA states: Get this vs Need N more Stars
- [ ] **M6-04** Child redeem calls `redeemStoreItem` (Spend debit + purchase order)
- [ ] **M6-05** Parent fulfillment queue with Fulfill / Deliver
- [ ] **M6-06** Browser-verify catalog, blocked CTA, redeem, and fulfill

---

## Phase 2 — After MVP

Phase status: `locked` (do not start until M6 is `done`)

- [ ] **P2-01** Save/Give interest simulation
- [ ] **P2-02** Recurring daily routines + streak multipliers
- [ ] **P2-03** Family bulletins (MSG-02)
- [ ] **P2-04** Senior custom buy requests (SHP-03)

---

## Log

| Date | Task | Change |
| --- | --- | --- |
| 2026-10-03 | M0-06 | Progress board, skill, and hooks created. Next work is M1-01. |
| 2026-10-03 | M1-01 | started |
| 2026-10-03 | M1-01 | done — Vite + React + TypeScript scaffold; `npm run build` succeeds |
| 2026-10-03 | M1-02 | started |
| 2026-10-03 | M1-04 | cancelled — do not use Firebase emulators |
| 2026-10-03 | M1-02 | done — Tailwind shell; cream canvas and title verified in the browser |
| 2026-10-03 | M1-03 | done — Firebase SDK, firebase.json, placeholder rules and project id |
| 2026-10-03 | M1-05 | done — `.env.example` and `VITE_FIREBASE_*` wiring, no emulator flag |
| 2026-10-03 | M1-06 | done — `/` renders the blank shell |
| 2026-10-03 | M1-07 | done — `npm run dev` serves http://localhost:5173/ |
| 2026-10-03 | M1 | phase done. Next work is M2-01. |
| 2026-10-03 | M1-05 | `.env` has the live web config. `.firebaserc` default is `mini-portal-7f320`. |
