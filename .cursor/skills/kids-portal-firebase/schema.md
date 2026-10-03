# Firestore document shapes

Copy these fields. Add new fields only when a milestone requires them. Use ISO timestamps or Firestore `Timestamp` consistently (prefer `Timestamp` in code).

## `families/{familyId}`

```json
{
  "familyName": "Alemu Family",
  "createdAt": "2026-10-03T02:00:00Z",
  "currencyName": "Stars",
  "starToRealCurrencyRate": 0.05
}
```

## `members/{memberId}`

```json
{
  "name": "Leo",
  "role": "child",
  "tier": "junior",
  "avatarUrl": "",
  "pinHash": null,
  "balance": { "total": 42, "spend": 42, "save": 0, "give": 0 },
  "allocationConfig": { "spendPct": 100, "savePct": 0, "givePct": 0 },
  "currentGoalItemId": "item_lego_space"
}
```

- `role`: `parent` | `child`
- `tier`: `junior` | `senior` (children only)
- Parent members may omit `balance` / `allocationConfig`

## `workOrders/{workOrderId}`

```json
{
  "title": "Clean & Detail Family Van",
  "description": "Vacuum carpets, clean door pockets, wipe dashboard.",
  "category": "Deep Clean",
  "pointValue": 50,
  "assignedTo": "member_maya",
  "isBounty": false,
  "status": "pending_review",
  "dueDate": "2026-10-04T17:00:00Z",
  "requiresPhoto": true,
  "proofSubmission": {
    "photoUrls": [],
    "notes": "",
    "submittedAt": null
  },
  "checklist": [{ "text": "Trash emptied", "done": false }],
  "createdAt": "2026-10-03T10:00:00Z",
  "createdBy": "member_parent_1"
}
```

- `assignedTo` is null on open bounties
- `status`: `open` | `in_progress` | `pending_review` | `completed` | `rework`
- `category`: `Daily Habit` | `Chores` | `Schoolwork` | `Deep Clean`

## `workOrders/{id}/messages/{messageId}`

```json
{
  "senderId": "member_maya",
  "senderName": "Maya",
  "text": "The shop vac filter looks full, can I empty it in the main bin?",
  "createdAt": "2026-10-03T10:30:00Z"
}
```

## `ledgerTransactions/{transactionId}`

```json
{
  "childId": "member_maya",
  "type": "credit",
  "totalAmount": 50,
  "breakdown": { "spend": 35, "save": 10, "give": 5 },
  "source": "work_order",
  "referenceId": "wo_van_detail_104",
  "memo": "Payout for: Clean & Detail Family Van",
  "createdAt": "2026-10-03T17:05:00Z"
}
```

- `type`: `credit` | `debit`
- `source`: `work_order` | `store_item` | `manual_adjustment`
- Debits: `totalAmount` positive, `type: debit`, breakdown usually `{ spend: N, save: 0, give: 0 }`

## `storeItems/{itemId}`

```json
{
  "title": "Trip to Ice Cream Shop",
  "category": "privilege",
  "pointCost": 25,
  "icon": "🍦",
  "stock": -1,
  "cooldownHours": 24,
  "active": true
}
```

- `category`: `privilege` | `outing` | `physical` | `external`
- `stock: -1` means unlimited

## `purchaseOrders/{orderId}`

```json
{
  "childId": "member_leo",
  "itemId": "item_ice_cream",
  "itemTitle": "Trip to Ice Cream Shop",
  "pointCost": 25,
  "status": "pending_fulfillment",
  "requestedAt": "2026-10-03T18:00:00Z",
  "fulfilledAt": null
}
```

- `status`: `pending_fulfillment` | `fulfilled` | `cancelled`
