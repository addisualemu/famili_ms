# Acceptance criteria (from PRD)

Use these IDs in commits, PRs, and “done” checks. Do not mark a feature complete if its row fails.

## Work orders

| ID | Feature | Done when |
| --- | --- | --- |
| WO-01 | Create | Parent sets title, category, star value, due date, assigned child or open bounty. Published order appears on the child’s feed immediately. |
| WO-02 | Open bounties | Any child can claim. After claim, status is `in_progress` and only that child owns it. |
| WO-03 | Proof | Kid marks complete with checklist and/or photo per `requiresPhoto`. Status becomes `pending_review`. Parent is notified. |
| WO-04 | QA | Approve credits ledger. Rework returns to active with parent note. Reject pays nothing. |

## Messaging

| ID | Feature | Done when |
| --- | --- | --- |
| MSG-01 | Task thread | Comments live on the work order only. Kid and parent can write. No family-wide kid chat. |
| MSG-02 | Bulletins | Parent one-way announcements pin on the kid dashboard until acknowledged. Phase 2. |

## Bank

| ID | Feature | Done when |
| --- | --- | --- |
| BNK-01 | Buckets | Spend / Save / Give exist. Allocation is per child. Junior can be 100% Spend or one save goal. |
| BNK-02 | History | Every credit/debit has timestamp, reference (work order or store item or manual), and signed amount. |
| BNK-03 | Overrides | Parent credits, fines, or interest require a written reason. |

## Store

| ID | Feature | Done when |
| --- | --- | --- |
| SHP-01 | Catalog | Items in privileges / outings / physical (or external). Star price plus stock or cooldown. |
| SHP-02 | Checkout | Spend balance checked. Stars debit immediately. Item lands on parent fulfillment queue. |
| SHP-03 | Custom buy | Senior submits link or description. Parent approves **before** debit. Phase 2 / post-MVP unless milestone says otherwise. |
