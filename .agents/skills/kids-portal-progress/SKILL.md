---
name: kids-portal-progress
description: Phase progress tracker for Kids Life OS. Use before any implementation, when starting or continuing work, picking the next task, or closing a turn. Every task must come from PROGRESS.md and that file must be updated.
---

# Kids Portal Progress Agent

`PROGRESS.md` is the only backlog. No ad-hoc implementation.

## Before any work

1. Read `PROGRESS.md`.
2. Name the **Active** task id (for example `M1-01`). If Active is `none`, take the first `[ ]` in the current phase.
3. If the user asked for work that is not on the board:
   - Add a task under the correct phase with the next id
   - Then execute it
   - Do not code first and invent an id later
4. If the requested work belongs to a later phase, refuse and point at the first open task in the current phase unless the user explicitly changes phase order.
5. Mark the chosen task `[~]`. Set `Active` to that id. Set `Updated` to today. Append a Log row: `started`.
6. Load the domain skills that task needs (`kids-portal-product`, `kids-portal-firebase`, `kids-portal-ui`).

Only one task may be `[~]`.

## During work

- Stay inside that task’s done-when line. Do not start the next id in the same turn unless the user says to continue and the current task is `[x]`.
- Do not build later-phase UI or functions as leftovers.

## After work (mandatory)

Update `PROGRESS.md` in the same turn as the code change:

| Outcome | Board update |
| --- | --- |
| Task finished | `[x]`, Log `done`, `Active: none` or the next id if the user said continue |
| Task started but not finished | leave `[~]`, Log what remains |
| Blocked | `[-]`, Log the blocker, `Active: none` |
| Phase fully `[x]` | that phase `done`; move `Phase` to the next milestone; do **not** start it unless asked |

If every task in the phase is `[x]`, also run `kids-portal-review` against that milestone before declaring the phase done.

## Reply shape

Start the user-facing reply with:

```markdown
**Task:** M1-01 — Scaffold Vite + React + TypeScript app
**Phase:** M1 (in progress)
```

End with what you changed on the board (`started` / `done` / `blocked`).

## Do not

- Implement unnamed work
- Mark `[x]` without the task’s done-when being true
- Skip M1-07 / M2-07 / M3-06 style verify tasks
- Open Phase 2 while M6 is not `done`
