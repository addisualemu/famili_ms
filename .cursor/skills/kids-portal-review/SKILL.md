---
name: kids-portal-review
description: Reviews Kids Life OS work against PRD acceptance IDs, Firebase integrity rules, UI tiers, and the current milestone. Use when reviewing a milestone, PR, or when the user asks if a feature is done.
---

# Kids Portal Review

Review only what exists. Name the milestone under review. Do not suggest building the next milestone unless asked.

## Checklist

### Scope

- [ ] Work stays inside the current milestone (`kids-portal-milestones`)
- [ ] No Phase 2 features (interest, streaks, bulletins, custom buys) unless requested
- [ ] Feature IDs in `kids-portal-product/acceptance.md` are cited for touched flows

### Integrity

- [ ] No client writes to `members.balance` or `ledgerTransactions`
- [ ] Approve / redeem / manual adjust use callable functions + Firestore transactions
- [ ] Approve is idempotent if the work order is already `completed`
- [ ] Redeem checks Spend balance, `active`, stock, and cooldown
- [ ] Manual adjustments require a memo
- [ ] Children are members, not Firebase Auth users
- [ ] Rules keep ledger append-only (`allow write: if false`)

### Product / UX

- [ ] Junior: missions, one star total, one goal, photo done — no account split
- [ ] Senior: Spend/Save/Give, WO detail, checklist, task thread
- [ ] Parent: approval queue Approve/Rework, create work order
- [ ] Store CTAs: Get this vs Need N more Stars
- [ ] Copy uses Stars, Missions / Work Orders, Parent Console — not mockup OCR

### Quality

- [ ] Schema matches `kids-portal-firebase/schema.md`
- [ ] Proof uploads go to `families/{familyId}/proofs/` and are images < 10MB
- [ ] Browser-verified if UI or flow changed (tablet + phone where relevant)

## Report format

```markdown
## Milestone N review
**Verdict:** pass | pass with gaps | fail

### Gaps
- ID or rule: what is missing, where

### Integrity
- ok / issue

### UX vs mockup
- ok / issue
```
