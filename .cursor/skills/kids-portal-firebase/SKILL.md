---
name: kids-portal-firebase
description: Kids Life OS Firebase architecture — Auth profile switcher, Firestore schema, security rules, Storage proofs, and callable Cloud Functions. Use when touching firebase.json, rules, functions, members, work orders, ledger, or store data.
---

# Kids Portal Firebase

Stack: Firebase Auth + Firestore + Storage + Cloud Functions (`nodejs20`) + Hosting. Develop against emulators.

Canonical field shapes: [schema.md](schema.md). Architecture prose: `Technical_architectur.md`.

## Auth and profiles

- Parent signs in with email/password (or OAuth). Custom claims: `{ role: 'parent', familyId }`.
- Children are **not** Firebase Auth users. They are `families/{familyId}/members/{memberId}` docs.
- Active child id lives in client state (`localStorage` or memory).
- Senior/parent screens: 4-digit PIN, salted hash on the member/parent record. Junior PIN may be null.
- Any mutation that pays Stars, spends Stars, or changes balances goes through a **callable function** that checks claims (and PIN when required).

## Collection tree

```
families/{familyId}
  members/{memberId}
  workOrders/{workOrderId}
    messages/{messageId}
  ledgerTransactions/{transactionId}
  storeItems/{itemId}
  purchaseOrders/{orderId}
```

Do not flatten these to root collections. Do not add parallel “users” or “wallets” collections.

## Client vs server writes

| Data | Client | Cloud Function |
| --- | --- | --- |
| Family profile, store items | Parent only | — |
| Member profile except `balance` | Parent | — |
| `members.balance` | Never | Yes |
| `ledgerTransactions` | Read only | Create only |
| Work order create/delete | Parent | — |
| Work order claim, checklist, submit proof | Family member | Optional later hardening |
| `approveWorkOrder` | Calls function | Status → `completed` + credit |
| `redeemStoreItem` | Calls function | Debit Spend + purchase order |

## Callable functions (required)

Implement with `https.onCall` and a Firestore transaction.

### `approveWorkOrder`

1. Caller `role == 'parent'` and same `familyId`.
2. Load work order + assigned member.
3. Reject if status is not `pending_review` (idempotent if already `completed`).
4. Split `pointValue` by `allocationConfig` (remainder goes to Spend).
5. In one transaction: `status = 'completed'`, increment `balance.total|spend|save|give`, insert ledger credit (`source: 'work_order'`).

### `redeemStoreItem`

1. Caller is a family member acting as `childId`.
2. `balance.spend >= pointCost`. Honor `active`, stock (`-1` unlimited), and cooldown.
3. In one transaction: decrement spend + total, decrement stock if finite, insert `purchaseOrders` with `pending_fulfillment`, insert ledger debit (`source: 'store_item'`).

Parent manual adjust (Milestone 5+): same pattern, `source: 'manual_adjustment'`, memo required.

## Security rules (intent)

Ship rules that match `Technical_architectur.md`:

- Family read: custom claim `familyId`.
- Family write / store item write / member create: parent.
- Member update: parent, and `balance` is not in the changed keys.
- Ledger: `allow write: if false`.
- Work orders: parent create/delete; members may update (tighten to status/checklist/proof fields when you can).
- Messages: members read/create; parent update/delete.
- Purchase orders: members create; parent update/delete.
- Storage proofs: `families/{familyId}/proofs/{file}`, authenticated family, image/*, < 10MB.

After any rules change, run the Firebase security-rules auditor skill if available.

## Emulators and hosting

- `firebase emulators:start` for Auth, Firestore, Storage, Functions.
- Hosting is an SPA: Vite `out` or `dist` + rewrite `**` → `/index.html`. Point `firebase.json` hosting `public` at the real Vite output dir.
- Point the web app at emulator hosts in development. Never commit service-account JSON or production keys.
