---
name: kids-portal-firebase
description: Kids Life OS Firebase architecture — Auth profile switcher, Firestore schema, security rules, and Storage proofs. Use when touching firebase.json, rules, members, work orders, ledger, or store data. The project is on the Blaze plan.
---

# Kids Portal Firebase

Stack: Firebase Auth + Firestore + Storage + Hosting + Functions on the Blaze plan. Use the Firebase project from env. Do not use local emulators. A callable may credit or debit Stars. Do not add other paid products.

Canonical field shapes: [schema.md](schema.md). Architecture prose: `Technical_architectur.md`.

## Auth and profiles

- Parent signs in with email/password (or OAuth). Custom claims: `{ role: 'parent', familyId }`. The client reads those claims from the ID token. It does not call a function to set them.
- Children are **not** Firebase Auth users. They are `families/{familyId}/members/{memberId}` docs.
- Active child id lives in client state (`localStorage` or memory).
- Senior/parent screens: 4-digit PIN, salted hash on the member/parent record. Junior PIN may be null.
- Do not write `members.balance` or `ledgerTransactions` from the client.

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

## Client writes

| Data | Client |
| --- | --- |
| Family profile, store items | Parent only |
| Member profile except `balance` | Parent |
| `members.balance` | Never |
| `ledgerTransactions` | Read only |
| Work order create/delete | Parent |
| Work order claim, checklist, submit proof | Family member |

Approve and redeem run as callables. Do not write `members.balance` or `ledgerTransactions` from the client.

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

- Do not start Firebase emulators or point the web app at emulator hosts.
- Hosting is an SPA: Vite `out` or `dist` + rewrite `**` → `/index.html`. Point `firebase.json` hosting `public` at the real Vite output dir.
- Read the web config from `VITE_FIREBASE_*` env vars. Never commit service-account JSON or production keys.
