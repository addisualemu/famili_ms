# Kids Portal Progress

Source of work for every agent turn. Do not implement anything that is not a task below. If scope changes, add a task here first, then execute it.

## Current

- Phase: `M6`
- Active: none
- Updated: `2026-10-04`
- Plan: Blaze. `approveWorkOrder` pays Stars and `redeemStoreItem` debits them. The client still cannot write `balance` or `ledgerTransactions`.

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

Phase status: `done`

Done when: parent can sign in, switch to a child profile, and lock/unlock senior or parent with PIN. No missions yet.

- [x] **M2-01** Build parent email/password login view
- [x] **M2-02** Wire Firebase Auth and parent custom claims (`role`, `familyId`)
- [x] **M2-03** Seed or create family + members (parent, Leo junior, Maya senior)
- [x] **M2-04** Build shared-tablet avatar profile switcher
- [x] **M2-05** Add 4-digit PIN lock for senior and parent (salted hash on member)
- [x] **M2-06** Persist active member in client state
- [x] **M2-07** Browser-verify login, switch, and PIN lock
- [x] **M2-08** Add Google sign-in on the parent login view
- [x] **M2-09** Drop the Blaze-only claims callable; read parent claims from the ID token
- [x] **M2-10** Show the seeded family members on the signed-in card

---

## M3 — Junior Dashboard (Read & Submit)

Phase status: `done`

Done when: junior sees missions and can mark one Done. No photo. No Spend/Save/Give. No store.

- [x] **M3-01** Read junior member stars, goal, and today’s missions from Firestore
- [x] **M3-02** Build junior home: star total + one goal progress bar
- [x] **M3-03** Build Today’s Missions cards (Done / Not done)
- [x] **M3-04** One-tap photo capture and upload to `families/{familyId}/proofs/`
- [x] **M3-05** Submit proof and set work order to `pending_review`
- [x] **M3-06** Browser-verify junior read and Done click on tablet width
- [x] **M3-07** Mark a mission Done with a click, no photo
- [x] **M3-08** Keep pending-review missions on the junior list

---

## M4 — Senior Dashboard & Work Order Thread

Phase status: `in progress`

Done when: senior can toggle a checklist, comment on the work order, and submit. No parent console.

- [x] **M4-01** Build senior dashboard Accounts cards (Spend / Save / Give, read-only)
- [x] **M4-02** Build work order list (`WO-###`, title, stars, View / Submit)
- [x] **M4-03** Build work order detail with checklist toggles
- [x] **M4-04** Add two-way `messages` thread on the work order
- [x] **M4-05** Senior proof submit → `pending_review`
- [x] **M4-06** Stacked phone layout for senior console
- [ ] **M4-07** Browser-verify senior dashboard, thread, and phone width

---

## M5 — Parent Console

Phase status: `in progress`

Approve pays Stars through `approveWorkOrder`. The client still cannot write `balance`.

Done when: Approve pays Stars atomically; Rework returns the order with a note. Client still cannot write `balance`.

- [x] **M5-01** Build Parent Console layout (approval queue + manage)
- [x] **M5-02** Render pending_review submissions with photo thumbs
- [x] **M5-03** Build create-work-order form (WO-01, including open bounty)
- [x] **M5-04** Implement approve so `approveWorkOrder` pays Stars
- [x] **M5-05** Implement Rework (note required, status `rework`)
- [-] **M5-06** Implement redeem so it debits Spend without Cloud Functions
- [x] **M5-07** Ship Firestore + Storage rules (ledger write = false)
- [ ] **M5-08** Browser-verify approve credits Stars and rework returns the mission
- [x] **M5-09** Rework leaves `pending_review` and does not show Pending review
- [x] **M5-10** Split Parent Console into Approval Queue, Create, Work Orders, Fulfillment, and Family Store

---

## M6 — Family Store & Redemption Flow

Phase status: `in progress`

Done when: SHP-01 and SHP-02 pass. SHP-03 custom buys stay out.

- [x] **M6-01** Parent can create/edit store items (stock, cooldown, active)
- [x] **M6-02** Build marketplace grid by category
- [x] **M6-03** CTA states: Get this vs Need N more Stars
- [x] **M6-04** Child redeem calls `redeemStoreItem` (Spend debit + purchase order)
- [x] **M6-05** Parent fulfillment queue with Fulfill / Deliver
- [ ] **M6-06** Browser-verify catalog, blocked CTA, redeem, and fulfill
- [x] **M6-07** Marketplace cards show a store item photo
- [ ] **M6-08** Parent can add, edit, and remove child profiles
- [x] **M6-09** Parent can create an email and password account

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
| 2026-10-03 | M2-01 | started |
| 2026-10-03 | M2-01 | done — parent email/password sign-in view on `/` and `/login` |
| 2026-10-03 | M2-08 | started |
| 2026-10-03 | M2-08 | done — Continue with Google opens Firebase Google sign-in |
| 2026-10-03 | M2-02 | started |
| 2026-10-03 | M2-02 | blocked — email sign-in calls Firebase; `ensureParentClaims` is not deployed. CLI user cannot access project `mini-portal-7f320` (403). |
| 2026-10-03 | M2-02 | resumed — retry deploy |
| 2026-10-03 | M2-02 | still blocked — deploy to `mini-portal-7f320` returns 403 |
| 2026-10-03 | M2-02 | resumed — CLI is addisudamena49@gmail.com; adding actclearapp@gmail.com |
| 2026-10-03 | M2-02 | still blocked — `login:add` cannot run in this non-interactive session |
| 2026-10-03 | M2-02 | resumed — CLI in WSL is actclearapp@gmail.com; deploying claims |
| 2026-10-03 | M2-02 | done — parent claims set on actclearapp. Callable deploy needs the Blaze plan. |
| 2026-10-03 | M2-09 | started |
| 2026-10-03 | M2-09 | done — sign-in reads parent claims from the ID token; Cloud Functions removed |
| 2026-10-03 | M2-03 | started |
| 2026-10-03 | M2-03 | done — Alemu Family with parent, Leo junior, and Maya senior |
| 2026-10-03 | M2-10 | started |
| 2026-10-03 | M2-10 | done — dev server was serving the pre-family screen; restarted on port 5173 |
| 2026-10-03 | M2-04 | started |
| 2026-10-03 | M2-04 | done — avatar profile switcher for parent, Leo, and Maya |
| 2026-10-03 | M2-05 | started |
| 2026-10-03 | M2-05 | done — senior and parent PIN is a salted hash on the member |
| 2026-10-03 | M2-06 | started |
| 2026-10-03 | M2-06 | done — active member id is stored on this device |
| 2026-10-03 | M2-07 | started |
| 2026-10-03 | M2-07 | blocked — login form reaches Firebase; profile switch and PIN need a completed Google sign-in in this browser |
| 2026-10-03 | M2-07 | resumed — retry sign-in, profile switch, and PIN |
| 2026-10-03 | M2-07 | waiting — Google account window is open; switch and PIN still need a signed-in parent |
| 2026-10-03 | M2-07 | done — parent sign-in, profile switch, and PIN lock verified |
| 2026-10-03 | M2 | phase done. Next work is M3-01. |
| 2026-10-03 | M3-01 | started |
| 2026-10-03 | M3-01 | done — junior read loads stars, the goal item, and today’s assigned missions |
| 2026-10-03 | M3-02 | started |
| 2026-10-03 | M3-02 | waiting — junior home is built; this browser is on the Google sign-in page, so Leo’s star total and goal bar are not verified yet |
| 2026-10-04 | M3-02 | still waiting — Google sign-in is on the email step; Leo’s home is not open |
| 2026-10-04 | M3-02 | done — star total and goal bar are on the junior home; signed-in check stays with M3-06 |
| 2026-10-04 | M3-03 | started |
| 2026-10-04 | M3-03 | done — Today’s Missions cards show Done or Not done under the goal bar |
| 2026-10-04 | M3-04 | started |
| 2026-10-04 | M3-04 | blocked — Firebase Storage is not set up on mini-portal-7f320, so proof rules could not be released |
| 2026-10-04 | M3-04 | resumed — retry Storage setup and proof rules |
| 2026-10-04 | M3-04 | done — proof rules released; Not done opens the camera and uploads to the family proofs folder |
| 2026-10-04 | M3-05 | started |
| 2026-10-04 | M3-05 | done — a photo proof sets the work order to pending_review |
| 2026-10-04 | M3-07 | started |
| 2026-10-04 | M3-07 | done — Done marks the mission pending_review with no photo; open missions stay on the list |
| 2026-10-04 | M3-08 | started |
| 2026-10-04 | M3-08 | done — pending_review missions stay on Today’s Missions |
| 2026-10-04 | M3-06 | started |
| 2026-10-04 | M3-06 | waiting — this browser is on the parent sign-in screen, so Leo’s Done click is not verified |
| 2026-10-04 | M3-06 | still waiting — Google sign-in asked for popups to be allowed, so Leo’s home did not open |
| 2026-10-04 | M3-06 | done — junior read and Done click checked on tablet width |
| 2026-10-04 | M3 | phase done. Next work is M4-01. |
| 2026-10-04 | M4-01 | started |
| 2026-10-04 | M4-01 | done — Maya’s dashboard shows read-only Spend, Save, and Give |
| 2026-10-04 | M4-02 | started |
| 2026-10-04 | M4-02 | done — Maya’s dashboard lists WO-104 and WO-105 with title, stars, View, and Submit |
| 2026-10-04 | M4-03 | started |
| 2026-10-04 | M4-03 | done — View opens the work order and checklist boxes toggle |
| 2026-10-04 | M4-04 | started |
| 2026-10-04 | M4-04 | done — Maya and the parent can write notes on a work order |
| 2026-10-04 | M4-05 | started |
| 2026-10-04 | M4-05 | done — Submit sets the work order to pending_review |
| 2026-10-04 | M4-06 | started |
| 2026-10-04 | M4-06 | done — phone stacks Spend, Save, and Give, and each work order card shows its checklist and Submit |
| 2026-10-04 | M5-01 | done — Parent Console has the approval queue and manage column |
| 2026-10-04 | M5-02 | done — pending work orders show a photo thumb, or No photo when the proof has no link |
| 2026-10-04 | M5-03 | blocked — create form is in the console; rules deploy returned 403 for addisudamena49@gmail.com |
| 2026-10-04 | M5-04 | blocked — paying Stars needs a client balance write or Cloud Functions, and both are disallowed |
| 2026-10-04 | M5-05 | blocked — Rework is in the console; the status rule is not released yet (same 403) |
| 2026-10-04 | M5-05 | resumed — Maya never saw the rework note because the note and status were one write, and the status write was rejected |
| 2026-10-04 | M5-05 | note now saves on its own and shows on Maya’s work order; status still needs the rules release |
| 2026-10-04 | M5-05 | the work order card shows a Rework mark and the note, before View |
| 2026-10-04 | M5-06 | blocked — debiting Spend has the same Stars restriction as approve |
| 2026-10-04 | M5-07 | blocked — rules file includes rework, bounty claim, and ledger write false; deploy returned 403 |
| 2026-10-04 | M5-07 | done — actclearapp@gmail.com released firestore.rules and storage.rules to mini-portal-7f320 |
| 2026-10-04 | M5-05 | rules are live; a Rework click can now set status to rework |
| 2026-10-04 | M5-05 | waiting — local app is on Google sign-in; Rework click still needs the parent session |
| 2026-10-04 | M5-05 | done — a note is required; rules allow the parent to set status to rework and still deny ledger writes |
| 2026-10-04 | M5-03 | done — create form assigns a child or an open bounty; rules allow both creates |
| 2026-10-04 | M4-07 | started |
| 2026-10-04 | M4-07 | waiting — senior dashboard check needs the parent Google session; the sign-in page is still open |
| 2026-10-04 | M5-09 | started — a sent-back work order still shows Pending review |
| 2026-10-04 | M5-09 | done — WO-104 status is rework; the detail shows Submit again instead of Pending review |
| 2026-10-04 | M5-03 | rules deploy blocker cleared; create still needs a successful parent save |
| 2026-10-04 | M6-01 | started |
| 2026-10-04 | M6-01 | done — Parent Console Family Store can create an item and save stock, cooldown, and active; store update rule released |
| 2026-10-04 | M6-02 | started |
| 2026-10-04 | M6-02 | done — junior and senior open Family Marketplace grouped into Privileges, Outings, Physical, and External |
| 2026-10-04 | M6-03 | started |
| 2026-10-04 | M6-03 | done — marketplace button is Get this when Spend covers the price, otherwise Need N more Stars and disabled |
| 2026-10-04 | M6-04 | blocked — redeem must debit Spend and write a ledger line, and the client cannot do either |
| 2026-10-04 | M6-07 | started |
| 2026-10-04 | M6-07 | done — parent can add a store photo; the marketplace card shows that image |
| 2026-10-04 | M6-05 | started |
| 2026-10-04 | M6-05 | done — Parent Console has a Fulfillment Queue with Fulfill, then Deliver |
| 2026-10-04 | M6-06 | started |
| 2026-10-04 | M6-06 | waiting — catalog check needs a signed-in child; redeem and fulfill cannot be clicked until a Spend debit exists |
| 2026-10-04 | M6-04 | resumed — project is on the Blaze plan, so redeem can run as a callable |
| 2026-10-04 | M6-04 | done — Get this calls redeemStoreItem, which debits Spend, writes the ledger, and opens a purchase order |
| 2026-10-04 | M5-04 | started — Approve was disabled; Blaze callable can pay Stars |
| 2026-10-04 | M5-04 | done — Approve calls `approveWorkOrder`, which credits Stars and completes the work order |
| 2026-10-04 | M5-10 | started — Parent Console puts create, review, existing work, fulfillment, and the store on one page |
| 2026-10-04 | M5-10 | done — Parent Console opens one place at a time: Approval Queue, Create, Work Orders, Fulfillment, Family Store |
| 2026-10-04 | M6-08 | started — parent Profiles for add, edit, and remove |
| 2026-10-04 | M6-08 | waiting — Profiles is in the console. Rules that let a parent edit a profile which already has Stars are not released (403 for addisudamena49@gmail.com). This browser is on the sign-in screen; Google popups are blocked. |
| 2026-10-04 | M6-08 | paused — registration requested before Profiles is verified |
| 2026-10-04 | M6-09 | started — Create account for a parent email and password |
| 2026-10-04 | M6-09 | blocked — Create account is on the sign-in screen. `registerParent` did not deploy: addisudamena49@gmail.com lacks Service Account User on mini-portal-7f320. Test sign-in portal.register.check.20261004@example.com was created and has no family yet. |
| 2026-10-04 | M6-09 | still blocked — localhost preflight to registerParent returns 404, which the browser reports as CORS. Deploy still needs iam.serviceAccounts.actAs. |
| 2026-10-04 | M6-09 | resumed — WSL discovery of functions on /mnt/c exceeds the 10s default |
| 2026-10-04 | M6-09 | done — registerParent is deployed and public. A new email parent reaches Choose a profile. |
