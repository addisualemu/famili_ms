# Technical Architecture Document: Firebase Implementation

## Kids Life Operating System (Kids Portal)

---

## 1. System Overview & Technology Choices

* **Hosting & Web Framework:** Firebase Hosting serving a Vite + React SPA (TypeScript + Tailwind CSS + PWA).
* **Identity & Access:** Firebase Authentication (Parent email/password + custom token / PIN-based child profiles).
* **Primary Database:** Cloud Firestore (NoSQL document-based, real-time listeners for live task and balance syncing).
* **File Storage:** Cloud Storage for Firebase (optimized for chore proof photos and avatar uploads).
* **Backend Logic & Security:** Cloud Functions for Firebase (enforces atomic ledger balances, prevents double-spending, manages scheduled interest/allowances).

---

## 2. Authentication & Multi-Profile Model

Shared family tablets and phones require a parent-controlled master account combined with fast, lightweight profile switching for the kids.

```
 ┌────────────────────────────────────────────────────────┐
 │           Parent Account (Firebase Auth)               │
 │           Email + Password / Social Login              │
 └───────────────────────────┬────────────────────────────┘
                             │
       ┌─────────────────────┴─────────────────────────────┐
       ▼                                                   ▼
┌──────────────┐                                  ┌──────────────┐
│  Junior Mode │                                  │  Senior Mode │
│   (No PIN)   │                                  │  (4-Digit)   │
└──────────────┘                                  └──────────────┘

```

### 2.1 Parent Authentication

* **Provider:** Standard Firebase Auth (`EmailAuthProvider` or OAuth).
* **Custom Claims:** On sign-up or verification, assign `customUserClaims: { role: 'parent', familyId: '<FAMILY_UID>' }`.

### 2.2 Child Profile Switcher (Shared Device Session)

To avoid logging out of the parent Firebase session on a home tablet:

1. Store the active child’s `childId` in local client state (`localStorage` or memory).
2. Older kids and parents protect their screens with a local 4-digit PIN stored as a salted hash in the child document.
3. For secure server-side mutations (approving stars, spending money), requests pass through **Cloud Functions (Callable Functions)** that verify the caller's rights and PIN before mutating the Firestore ledger.

---

## 3. Cloud Firestore Data Schema

### Collection Hierarchy

```
families/{familyId}
  ├── members/{memberId}
  ├── workOrders/{workOrderId}
  │     └── messages/{messageId}
  ├── ledgerTransactions/{transactionId}
  ├── storeItems/{itemId}
  └── purchaseOrders/{orderId}

```

---

### 3.1 Document Specifications

#### `families/{familyId}`

```json
{
  "familyName": "Alemu Family",
  "createdAt": "2026-10-03T02:00:00Z",
  "currencyName": "Stars",
  "starToRealCurrencyRate": 0.05
}
```

#### `families/{familyId}/members/{memberId}`

```json
{
  "name": "Leo",
  "role": "child",
  "tier": "junior",
  "avatarUrl": "https://storage.googleapis.com/.../leo.png",
  "pinHash": null,
  "balance": {
    "total": 42,
    "spend": 42,
    "save": 0,
    "give": 0
  },
  "allocationConfig": {
    "spendPct": 100,
    "savePct": 0,
    "givePct": 0
  },
  "currentGoalItemId": "item_lego_space"
}
```

#### `families/{familyId}/workOrders/{workOrderId}`

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
    "photoUrls": [
      "https://storage.googleapis.com/.../van_front.jpg",
      "https://storage.googleapis.com/.../van_back.jpg"
    ],
    "notes": "Done! Emptied trash in yard bin.",
    "submittedAt": "2026-10-03T16:30:00Z"
  },
  "checklist": [
    { "text": "Trash emptied", "done": true },
    { "text": "Vacuum carpets", "done": true },
    { "text": "Mats shaken", "done": true }
  ],
  "createdAt": "2026-10-03T10:00:00Z",
  "createdBy": "member_parent_1"
}
```

#### `families/{familyId}/workOrders/{workOrderId}/messages/{messageId}`

```json
{
  "senderId": "member_maya",
  "senderName": "Maya",
  "text": "The shop vac filter looks full, can I empty it in the main bin?",
  "createdAt": "2026-10-03T10:30:00Z"
}
```

#### `families/{familyId}/ledgerTransactions/{transactionId}`

```json
{
  "childId": "member_maya",
  "type": "credit",
  "totalAmount": 50,
  "breakdown": {
    "spend": 35,
    "save": 10,
    "give": 5
  },
  "source": "work_order",
  "referenceId": "wo_van_detail_104",
  "memo": "Payout for: Clean & Detail Family Van",
  "createdAt": "2026-10-03T17:05:00Z"
}
```

#### `families/{familyId}/storeItems/{itemId}`

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

#### `families/{familyId}/purchaseOrders/{orderId}`

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

---

## 4. Firestore Security Rules (`firestore.rules`)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isFamilyMember(familyId) {
      return isAuthenticated() && request.auth.token.familyId == familyId;
    }
    
    function isParent(familyId) {
      return isFamilyMember(familyId) && request.auth.token.role == 'parent';
    }

    match /families/{familyId} {
      allow read: if isFamilyMember(familyId);
      allow write: if isParent(familyId);

      // Members profiles
      match /members/{memberId} {
        allow read: if isFamilyMember(familyId);
        // Balance mutations must go through Cloud Functions
        allow update: if isParent(familyId) && !request.resource.data.diff(resource.data).affectedKeys().hasAny(['balance']);
        allow write: if isParent(familyId);
      }

      // Work Orders
      match /workOrders/{workOrderId} {
        allow read: if isFamilyMember(familyId);
        allow create, delete: if isParent(familyId);
        
        // Children can update status to 'pending_review' or toggle checklists
        allow update: if isFamilyMember(familyId);
        
        match /messages/{messageId} {
          allow read, create: if isFamilyMember(familyId);
          allow update, delete: if isParent(familyId);
        }
      }

      // Ledger: strictly append-only, handled via Cloud Functions
      match /ledgerTransactions/{transactionId} {
        allow read: if isFamilyMember(familyId);
        allow write: if false; 
      }

      // Store items & orders
      match /storeItems/{itemId} {
        allow read: if isFamilyMember(familyId);
        allow write: if isParent(familyId);
      }

      match /purchaseOrders/{orderId} {
        allow read: if isFamilyMember(familyId);
        allow create: if isFamilyMember(familyId);
        allow update, delete: if isParent(familyId);
      }
    }
  }
}
```

---

## 5. Cloud Storage Rules (`storage.rules`)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /families/{familyId}/proofs/{fileName} {
      allow read: if request.auth != null && request.auth.token.familyId == familyId;
      // Allow image uploads under 10MB
      allow write: if request.auth != null 
                   && request.auth.token.familyId == familyId
                   && request.resource.size < 10 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

## 6. Core Cloud Functions (Atomic Financial Ledger)

To maintain financial integrity, star disbursements and redemptions must execute inside Firestore transactions.

### 6.1 `approveWorkOrder` (Callable Function)

* **Trigger:** Parent clicks "Approve" in the dashboard.
* **Logic:**
1. Verify caller has `role == 'parent'`.
2. Read the `workOrder` document and targeted `member` document.
3. Calculate the split according to `member.allocationConfig` (e.g., 70% Spend, 20% Save, 10% Give).
4. Perform atomic transaction:
* Set `workOrder.status = 'completed'`.
* Increment `member.balance.total`, `spend`, `save`, and `give`.
* Create an entry in `ledgerTransactions`.

### 6.2 `redeemStoreItem` (Callable Function)

* **Trigger:** Child confirms purchase in the family store.
* **Logic:**
1. Retrieve `member.balance.spend` and `storeItem.pointCost`.
2. Verify `spend >= pointCost`.
3. Decrement `member.balance.spend` and `member.balance.total`.
4. Create `purchaseOrders` record with status `pending_fulfillment`.
5. Add a negative entry to `ledgerTransactions`.

---

## 7. Firebase Hosting & Deployment Configuration

### `firebase.json`

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "functions": {
    "source": "functions",
    "runtime": "nodejs20"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

---

## 8. Development & Deployment Roadmap

1. **Firebase CLI Init:** Run `firebase init` selecting **Firestore, Functions, Hosting, and Storage**.
2. **Firebase project:** Point the web app at the Firebase project in env (`VITE_FIREBASE_*`). Do not use the local emulators.
3. **PWA Integration:** Add a `manifest.json` and service worker so shared tablets can install the hosted URL directly to the home screen as a full-screen app.
