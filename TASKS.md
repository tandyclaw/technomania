# TASKS.md — Moonshot QA & Polish

> NO NEW MECHANICS. Focus on fixing, polishing, and QA only.

---

## 🔴 P0 — Critical Fixes (from master feedback)

| ID | Description | Status |
|----|-------------|--------|
| F01 | **Remove Workers mechanic completely** — delete WorkerSystem.ts, WorkerPanel.svelte, all worker references in gameState, dashboard, division views | PLANNED |
| F02 | **Remove Division Prestige (stars) completely** — delete DivisionPrestigeSystem.ts, star UI, division star fields. Keep the main colony prestige (New Colony) | PLANNED |
| F03 | **Fix scrolling** — top resource bar and bottom tab bar block content. Ensure padding-top/padding-bottom on main content area accounts for fixed bars. Test on iPhone | PLANNED |
| F04 | **Resource bar buttons → correct pages**: Research icon → Research view, Energy/Power icon → explain what power does, Cash icon → Treasury | PLANNED |
| F05 | **Fix tier card height change on produce tap** — card height must NOT change when tapped/producing. Lock height, remove text that appears/disappears on state change | PLANNED |
| F06 | **Reduce notifications** — only notify for special events (achievements, synergies, prestige). Remove toasts for routine purchases, production completions, etc. | PLANNED |
| F07 | **Make notification X button bigger** — much larger close button, easy to tap on mobile. Consider swipe-to-dismiss | PLANNED |
| F08 | **Lean out tier cards** — remove unnecessary text, make cards compact and easy to tap on mobile | PLANNED |

## 🟡 P1 — Polish

| ID | Description | Status |
|----|-------------|--------|
| P01 | **Full text/icon congruency sweep** — verify all text, icons, descriptions match the Moonshot story. No stale references, no confusing labels | PLANNED |
| P02 | **Homepage cleanup** — clean, clear, minimal, accurate. Remove anything that doesn't match current game state | PLANNED |

## 🟢 P2 — QA

| ID | Description | Status |
|----|-------------|--------|
| QA01 | Full mobile playtest after P0 fixes | PLANNED |
| QA02 | Integration build check | PLANNED |
