---
name: kids-portal-ui
description: Kids Life OS UI system — junior, senior, parent, and marketplace layouts from UI_mockup_ideas.jpeg. Use when building or changing screens, navigation, components, Tailwind styles, or responsive behavior.
---

# Kids Portal UI

Visual source: `UI_mockup_ideas.jpeg`. Match structure and density, not the garbled mockup labels.

Screen inventory: [screens.md](screens.md).

## Design language

- Geometric rounded sans. Section titles can be small, tracked, uppercase.
- Soft cards, large radius (`rounded-2xl` / `rounded-3xl`), light borders, little shadow.
- Circles for avatars. Yellow star + number for prices and balances.
- Tablet landscape is the primary canvas (shared iPad). Phone is required for senior console and marketplace.
- Touch targets: junior ≥ 56px, senior/parent ≥ 44px.

### Palette

| Token | Use |
| --- | --- |
| Sky `#E8F3FB` | Junior sidebar / page wash |
| Cream `#F7F1E8` | Junior content, parent canvas |
| Navy `#1B2A3A` | Senior/parent chrome, headers |
| White | Cards, marketplace |
| Green | Done / approve / positive |
| Coral | Not done / needs attention |
| Gold | Stars |

Do not use noisy kid-clipart backgrounds. The product is friendly and operational, not a cartoon game.

## Three experiences, one app

Route by `activeMember.role` and `activeMember.tier`.

| Experience | Density | Navigation | Money | Work |
| --- | --- | --- | --- | --- |
| Junior | Huge cards | Left rail: avatar, name, age, view label | One star total + one goal bar | Today’s Missions grid |
| Senior | Compact dashboard | Dark rail: Accounts, Work Orders, Settings | Spend / Save / Give cards | Itemized WO list + detail |
| Parent | Console | Dark top bar + icons | Bank tools later | Approval Queue + dispatch |

Shared device: avatar profile switcher. PIN gate before senior or parent surfaces.

## Junior (Leo)

- Left column: avatar, “Leo”, age, “Junior view”, short nav.
- Top: `{n} Stars` and a single goal — name + `current/target` bar (example: Lego Space Shuttle 42/60).
- Body: **Today’s Missions** as 2×2 (or wrapping) cards. Icon, title, star value, status pill.
- Status: **Done** (green) vs **Not done** (outline/coral). One tap opens camera when `requiresPhoto`.
- No tables, no Spend/Save/Give, no work-order IDs, no comment inbox.

## Senior (Maya)

- Dark sidebar, title **Maya’s Dashboard**.
- **Accounts**: three cards — Spend, Save, Give — star amounts only in MVP.
- **Work Orders**: rows with `WO-###`, title, star value, priority, checklist preview, View / Submit.
- Phone: stacked Accounts + work-order cards with checklist and Submit.
- Detail: checklist toggles, photo/file proof, task-bound message thread.

## Parent console

- Header **Parent Console**. Two columns on tablet.
- Left **Approval Queue**: child name, photo thumb, title, stars, **Approve** / **Rework**.
- Right **Manage Work Orders**: Create work order, view store. Below, **Family Store** inventory counts.
- Approve calls `approveWorkOrder`. Rework writes a note and sets `rework`.

## Marketplace

- White catalog grid. Category sections: Privileges, Outings, External / physical.
- Card: image or emoji, title, star price, primary CTA.
- CTA: **Redeem** / **Get this** if `spend >= price`, else **Need N more Stars** (disabled).
- Buy calls `redeemStoreItem`. Parent sees the result on the fulfillment queue.

## Implementation notes

- React + Tailwind. Prefer small presentational components (`StarBadge`, `MissionCard`, `AccountCard`, `ApprovalRow`).
- PWA: standalone display, theme color navy, app name “Kids Portal”.
- Respect `prefers-reduced-motion`. Do not autoplay sound. Read-aloud is optional and parent-gated.
- Verify tablet (~1024–1366) and phone (~390) after UI work.
