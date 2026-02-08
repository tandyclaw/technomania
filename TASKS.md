# TASKS.md — Technomania Development Tracker

> Pick the next PLANNED task, move through PLAN → IMPLEMENT → QA/REVIEW → MERGED.
> See WORKFLOW.md for the full SDLC process.

## Legend
- **Status:** PLANNED | IN_PROGRESS | QA | DONE
- **Phase:** PLAN | IMPLEMENT | QA/REVIEW | MERGED
- **Priority:** P0 (MVP blocker) | P1 (important) | P2 (nice to have)
- **Deps:** Task IDs that must be DONE first

---

## 1. Core Engine

| ID | Description | Status | Phase | Priority | Deps |
|----|-------------|--------|-------|----------|------|
| T001 | Game loop with requestAnimationFrame + delta time | DONE | MERGED | P0 | — |
| T002 | BigNumber integration (break_infinity.js) with formatting | DONE | MERGED | P0 | — |
| T003 | Save/Load system (IndexedDB auto-save every 30s) | DONE | MERGED | P0 | — |
| T004 | Event bus for cross-system communication | DONE | MERGED | P0 | — |
| T005 | Offline progress calculator (up to 8h) | DONE | MERGED | P0 | T001, T003 |
| T006 | Number formatting (K, M, B, T, etc.) | DONE | MERGED | P0 | T002 |
| T007 | Game state initialization and reset logic | DONE | MERGED | P0 | T001, T003 |
| T008 | Auto-save integration with game loop | IN_PROGRESS | IMPLEMENT | P0 | T001, T003 |

## 2. UI Shell

| ID | Description | Status | Phase | Priority | Deps |
|----|-------------|--------|-------|----------|------|
| T009 | Mobile-first responsive layout shell | DONE | MERGED | P0 | — |
| T010 | Resource bar (cash, RP, power — always visible) | DONE | MERGED | P0 | T007 |
| T011 | Division tab bar (bottom navigation) | DONE | MERGED | P0 | T009 |
| T012 | Dashboard overview screen | DONE | MERGED | P0 | T009, T010, T011 |
| T013 | Division detail view template | DONE | MERGED | P0 | T009 |
| T014 | Upgrade/purchase button component | DONE | MERGED | P0 | T006 |
| T015 | Progress bar component (production progress) | DONE | MERGED | P0 | — |
| T016 | Notification/toast system for events | PLANNED | PLAN | P1 | T004 |

## 3. First Vertical — Helios Power (Foundation)

| ID | Description | Status | Phase | Priority | Deps |
|----|-------------|--------|-------|----------|------|
| T017 | Helios division screen with 6 tiers | PLANNED | PLAN | P0 | T013, T014, T015 |
| T018 | Tap-to-produce mechanic for Helios tiers | PLANNED | PLAN | P0 | T017, T001 |
| T019 | Power generation tracking (MW produced vs consumed) | PLANNED | PLAN | P0 | T017 |
| T020 | Division Chief hiring UI + automation logic | PLANNED | PLAN | P0 | T017, T018 |
| T021 | Tier unlock progression (cash gating) | PLANNED | PLAN | P0 | T017, T006 |

## 4. Second Vertical — Apex Rocketry

| ID | Description | Status | Phase | Priority | Deps |
|----|-------------|--------|-------|----------|------|
| T022 | Apex division screen with 6 tiers | PLANNED | PLAN | P0 | T013, T019 |
| T023 | Tap-to-produce + automation for Apex | PLANNED | PLAN | P0 | T022, T020 |
| T024 | Launch cadence mechanic (launches/month) | PLANNED | PLAN | P1 | T022 |
| T025 | Power consumption for rocket facilities | PLANNED | PLAN | P0 | T022, T019 |

## 5. Third Vertical — Volt Motors

| ID | Description | Status | Phase | Priority | Deps |
|----|-------------|--------|-------|----------|------|
| T026 | Volt division screen with 5 tiers | PLANNED | PLAN | P0 | T013, T019 |
| T027 | Tap-to-produce + automation for Volt | PLANNED | PLAN | P0 | T026, T020 |
| T028 | Production rate mechanic (vehicles/week) | PLANNED | PLAN | P1 | T026 |
| T029 | Power consumption for EV factories | PLANNED | PLAN | P0 | T026, T019 |

## 6. Bottleneck System

| ID | Description | Status | Phase | Priority | Deps |
|----|-------------|--------|-------|----------|------|
| T030 | Bottleneck detection engine (trigger on thresholds) | PLANNED | PLAN | P0 | T017, T022, T026 |
| T031 | Bottleneck resolution UI (research/money/time paths) | PLANNED | PLAN | P0 | T030 |
| T032 | 3-5 bottlenecks per division (data definitions) | PLANNED | PLAN | P0 | T030 |
| T033 | "Production Hell" event for Volt Motors | PLANNED | PLAN | P1 | T027, T030 |

## 7. Cross-Vertical Synergies

| ID | Description | Status | Phase | Priority | Deps |
|----|-------------|--------|-------|----------|------|
| T034 | Synergy detection engine | PLANNED | PLAN | P0 | T017, T022, T026 |
| T035 | Synergy notification UI ("SYNERGY DISCOVERED!") | PLANNED | PLAN | P1 | T034, T016 |
| T036 | MVP synergies: Helios→Apex power, Volt↔Helios batteries | PLANNED | PLAN | P0 | T034 |

## 8. Research & Prestige

| ID | Description | Status | Phase | Priority | Deps |
|----|-------------|--------|-------|----------|------|
| T037 | Basic tech tree (15-20 nodes, JSON data) | PLANNED | PLAN | P0 | T007 |
| T038 | Research screen UI (node selection + progress) | PLANNED | PLAN | P0 | T037, T013 |
| T039 | Research point generation from R&D labs | PLANNED | PLAN | P0 | T037 |
| T040 | Prestige system: "The IPO" calculator | PLANNED | PLAN | P0 | T007 |
| T041 | Prestige screen UI (vision points preview, reset confirm) | PLANNED | PLAN | P0 | T040, T013 |
| T042 | Prestige bonuses (permanent multipliers) | PLANNED | PLAN | P0 | T040 |

## 9. Tutorial & Onboarding

| ID | Description | Status | Phase | Priority | Deps |
|----|-------------|--------|-------|----------|------|
| T043 | Tutorial system (step-by-step guided first 5 min) | PLANNED | PLAN | P1 | T017, T018 |
| T044 | Tooltip system for real-world engineering explanations | PLANNED | PLAN | P2 | T013 |

## 10. Polish & Deploy

| ID | Description | Status | Phase | Priority | Deps |
|----|-------------|--------|-------|----------|------|
| T045 | PWA service worker + offline caching | PLANNED | PLAN | P1 | — |
| T046 | Number rolling animation (GSAP) | PLANNED | PLAN | P2 | T006 |
| T047 | Sound effects toggle (tap, ding, launch) | PLANNED | PLAN | P2 | — |
| T048 | Settings screen (music, SFX, notifications, save export) | PLANNED | PLAN | P1 | T003 |
| T049 | Cloudflare Pages deployment pipeline | PLANNED | PLAN | P1 | — |
| T050 | Balance pass — playtest all 3 divisions for 2-4h flow | PLANNED | PLAN | P0 | T017-T042 |

---

## Summary

| Priority | Total | Done | Remaining |
|----------|-------|------|-----------|
| P0 | 33 | 12 | 21 |
| P1 | 11 | 0 | 11 |
| P2 | 6 | 0 | 6 |
| **Total** | **50** | **12** | **38** |

**Next task to pick up:** T008 (Auto-save integration) or T017 (Helios division screen) — both are P0 with met deps.
