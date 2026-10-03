Implementation Phasing & Step-by-Step Task List
An AI will lose context if given an entire PRD and instructed to "build the whole app." Break the project into sequential prompts/milestones:

Milestone 1: Project Setup & Emulator Scaffold

Initialize repo (e.g., Vite/React + Tailwind + Firebase SDK).

Configure the Firebase project from env. Do not use local emulators.

Configure environment variables and basic routing.

Milestone 2: Auth Shell & Profile Switcher

Parent login view.

Shared tablet profile-switching modal with local 4-digit PIN lock for senior/parent.

Milestone 3: Junior Dashboard (Read & Submit)

Display star balance and active missions.

Implement one-tap photo proof capture and submit to Cloud Storage.

Milestone 4: Senior Dashboard & Work Order Thread

Spend/Save/Give split cards.

Work order detail view with checklist toggle and two-way Firestore comment thread.

Milestone 5: Parent Console & Cloud Functions

Approval queue for pending submissions.

approveWorkOrder and redeemStoreItem callable functions with atomic Firestore transactions.

Milestone 6: Family Store & Redemption Flow

Store grid with dynamic affordance states ([GET THIS] vs [NEED X MORE STARS]).