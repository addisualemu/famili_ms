# Product Requirements Document (PRD)

## Kids Life Operating System (Kids Portal)

---

## 1. Executive Summary & Vision

The **Kids Life Operating System** is a closed-loop family management and educational platform designed to teach practical life skills, responsibility, and foundational economics. By framing chores, personal accountability, and homework as "Work Orders," and compensating children with a closed-loop virtual currency (Points/Stars), the system provides hands-on practice in earning, saving, budgeting, and marketplace transactions without real-world banking risks.

A tiered permission model adapts interface complexity, work order types, and ledger rules according to each child’s developmental stage.

---

## 2. User Roles & Personas

### 2.1 Parent / Admin

* **Role:** Dispatcher, Inspector, Central Banker, Store Manager.
* **Key Jobs to Be Done:**
* Define and post chores/tasks with clear completion criteria.
* Review submitted proofs (photos, check-offs) and release payouts.
* Adjust point values, issue bonuses or penalties.
* Manage inventory and pricing in the internal family marketplace.



### 2.2 Junior Kid (Ages ~5–8)

* **Experience Mode:** Gamified / Visual Tier.
* **Interface:** Large icons, visual progress bars, voice-read options, simplified numbers.
* **Core Interaction:** "Tap to claim", simple "Mark Done" (one-tap photo upload), visual piggy bank showing stars accumulated toward a concrete goal (e.g., toy or park trip).

### 2.3 Senior Kid / Tween / Teen (Ages 9+)

* **Experience Mode:** Operational / Standard Tier.
* **Interface:** Detailed task descriptions, checklist sub-tasks, multi-bucket balances (Save / Spend / Give), two-way communication thread for questions/negotiations.
* **Core Interaction:** Accept work orders, communicate status, manage budgets, submit purchase requests for parent review.

---

## 3. System Architecture & Core Modules

```
 ┌──────────────────────────────────────────────────────────┐
 │                     Parent Dashboard                     │
 │      • Task Dispatcher      • Approval Queue             │
 │      • Star Bank / Rules    • Family Store Inventory     │
 └─────────────┬────────────────────────────┬───────────────┘
               │                            │
       Role-Based Rules             Real-time Sync
               │                            │
 ┌─────────────▼────────────────────────────▼───────────────┐
 │                       Kids Portal                        │
 ├────────────────────────────┬─────────────────────────────┤
 │     Junior UI (5–8)        │      Senior UI (9+)         │
 │ • Large icons              │ • Itemized work orders      │
 │ • Photo-only completion    │ • Two-way messaging         │
 │ • Simple star count        │ • Spend / Save / Give split │
 │ • Single visual goal       │ • Catalog & custom requests │
 └────────────────────────────┴─────────────────────────────┘

```

---

## 4. Functional Requirements

### Module 1: Work Order & Dispatch System

| ID | Feature | Description | Acceptance Criteria |
| --- | --- | --- | --- |
| **WO-01** | Work Order Creation | Parents create tasks with: Title, Category (Daily Habit, Chores, Schoolwork, Deep Clean), Point Value, Expiration Date, Assigned Child (or Open Bounty). | Task shows on designated child’s feed immediately upon publishing. |
| **WO-02** | Open Bounties | Unassigned chores that any child can claim on a first-come, first-served basis. | Once claimed, status moves from "Open" to "In Progress" for the claiming child only. |
| **WO-03** | Completion Proof | Kids mark task as complete and attach proof: checklist check-off or camera photo (mandatory/optional per task setting). | Task transitions to "Pending Inspection" state; parent receives notification. |
| **WO-04** | Parent QA & Sign-off | Parent reviews the submission: **Approve** (releases stars), **Rework Required** (leaves comment/instructions), or **Reject**. | Approval automatically credits the ledger. Rework sends task back to kid's "Active" list with parent's note. |

---

### Module 2: Communication & Contextual Messaging

| ID | Feature | Description | Acceptance Criteria |
| --- | --- | --- | --- |
| **MSG-01** | Task-Bound Thread | Each work order contains an embedded comment thread between the assigned child and parent. | Avoids general chat noise; kids can ask questions like *"Where is the replacement trash bag?"* directly within the task. |
| **MSG-02** | Family Bulletins | One-way announcement feed from parents for house rules, weekly events, or extra-point announcements. | Pinned at the top of the kid's dashboard until acknowledged. |

---

### Module 3: Virtual Bank & Multi-Bucket Ledger

*Since the economy uses internal Points/Stars, all balances represent internal family scrip.*

| ID | Feature | Description | Acceptance Criteria |
| --- | --- | --- | --- |
| **BNK-01** | Multi-Bucket Engine | Balances can be partitioned into: <br>

<br>• **Spend:** Immediately spendable in the family store.<br>

<br>• **Save:** Locked toward a specific milestone goal.<br>

<br>• **Give:** Allocated for gifts or charitable activities. | Configurable per child. Default auto-allocation rule (e.g., 70% Spend, 20% Save, 10% Give). Junior tier can default to 100% Spend or a single Save Goal. |
| **BNK-02** | Transaction History | Ledger records all entries with timestamps, references (Task ID or Store Item ID), and delta (+/- stars). | Child and parent can audit full history without ambiguous balance changes. |
| **BNK-03** | Parent Bank Overrides | Manual credits, deductions (fines/penalties), or automated "Bank Interest" on the Save bucket to incentivize long-term holding. | System prompts parent for an explanatory reason when performing manual adjustments. |

---

### Module 4: Family Marketplace & Spending

| ID | Feature | Description | Acceptance Criteria |
| --- | --- | --- | --- |
| **SHP-01** | Curated Family Catalog | Parents create store items categorized as: <br>

<br>• **Privileges:** +30 min screen time, staying up 30 min late.<br>

<br>• **Outings:** Ice cream run, choose family movie.<br>

<br>• **Physical Rewards:** Books, small toys, craft kits. | Items show a Star price and stock/cooldown limits (e.g., "Max 1 per weekend"). |
| **SHP-02** | Checkout & Redemption | Child selects item, validates they have sufficient "Spend" balance, and submits a redemption. | Points deduct immediately. Item appears on parent's "Fulfillment Queue" with a "Fulfill/Deliver" button. |
| **SHP-03** | Custom Buy Request | Senior kids can submit a link or item description from an external store with an agreed point conversion (e.g., 100 stars = $5 item). | Moves to parent approval queue before any point deduction occurs. |

---

## 5. UI/UX & Tiered Adaptation

```
┌────────────────────────────────────────────────────────────────────────┐
│ UI Mode Comparison                                                     │
├───────────────────────────────────┬────────────────────────────────────┤
│ Junior Mode (Ages 5–8)            │ Senior Mode (Ages 9+)              │
├───────────────────────────────────┼────────────────────────────────────┤
│ • Giant, touch-friendly cards     │ • Compact table/list views         │
│ • Graphic icons for chore types   │ • Detailed descriptions & memos    │
│ • Audio read-aloud option         │ • In-line chat & negotiation       │
│ • Simple single Star count        │ • 3-Way split (Spend / Save / Give)│
│ • 1-step completion: Take Photo   │ • Checklist stages & upload files  │
└───────────────────────────────────┴────────────────────────────────────┘

```

* **PIN / Profile Switcher:** Simple shared device support with avatar-based selection and optional 4-digit PIN for older kids; master PIN or password for parent dashboard.

---

## 6. Data Model / Entity Relationship Overview

* **User / Profile:** `id`, `family_id`, `name`, `role` (`parent` | `child`), `ui_mode` (`junior` | `senior`), `avatar_url`, `pin_hash`.
* **WorkOrder:** `id`, `family_id`, `created_by`, `assigned_to` (nullable for open bounties), `title`, `description`, `points_reward`, `status` (`open`, `in_progress`, `pending_review`, `completed`, `rework`), `due_date`, `requires_photo`.
* **ProofSubmission:** `id`, `work_order_id`, `submitted_by`, `photo_url`, `notes`, `submitted_at`.
* **WorkOrderMessage:** `id`, `work_order_id`, `sender_id`, `message_text`, `timestamp`.
* **AccountLedger:** `id`, `child_id`, `bucket` (`spend`, `save`, `give`), `amount`, `type` (`credit`, `debit`), `reference_type` (`task`, `store_item`, `manual_adjustment`), `description`, `timestamp`.
* **StoreItem:** `id`, `family_id`, `title`, `category`, `point_cost`, `icon_url`, `cooldown_hours`, `available_stock`.
* **PurchaseOrder:** `id`, `child_id`, `item_id`, `status` (`pending`, `fulfilled`, `cancelled`), `timestamp`.

---

## 7. Recommended Next Steps for Implementation

1. **Tech Stack Selection:**
* **Frontend:** Next.js (React) + Tailwind CSS + PWA (Progressive Web App support makes it installable like a native app on iPads/tablets without App Store deployment overhead).
* **Backend & Auth:** Supabase or Firebase (built-in real-time subscriptions for messaging and work order state changes, simple file storage for photo proofs).


2. **Phase 1 MVP Scope:**
* Single parent view + multi-child profiles with PIN switcher.
* Work order creation, photo submission, and one-click parent verification.
* Basic star balance ledger with Spend bucket.
* Simple 5-item family store with parent fulfillment toggle.


3. **Phase 2 Expansion:**
* Save/Give buckets with compound interest simulation.
* Recurring daily routines (teeth brushing, bed making) with streak multipliers.