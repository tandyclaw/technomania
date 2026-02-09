# TASKS.md — Being Elon Development Tracker

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
| T008 | Auto-save integration with game loop | DONE | MERGED | P0 | T001, T003 |
| T054 | **AdCap-style timed production cycles** (tap→fill→payout) | DONE | MERGED | P0 | T001, T018 |
| T055 | Smooth 60fps progress bars (CSS animation-driven) | DONE | MERGED | P0 | T054, T015 |

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
| T016 | Notification/toast system for events | DONE | MERGED | P1 | T004 |

## 3. First Vertical — Tesla Energy (Foundation)

| ID | Description | Status | Phase | Priority | Deps |
|----|-------------|--------|-------|----------|------|
| T017 | Tesla Energy division screen with 6 tiers (Solar Panels→Virtual Power Plant) | DONE | MERGED | P0 | T013, T014, T015 |
| T018 | Timed production mechanic for Tesla Energy tiers | DONE | MERGED | P0 | T017, T001, T054 |
| T019 | Power generation tracking (MW produced vs consumed) | DONE | MERGED | P0 | T017 |
| T020 | Division Chief hiring UI + automation logic | DONE | MERGED | P0 | T017, T018 |
| T021 | Tier unlock progression (cash gating) | DONE | MERGED | P0 | T017, T006 |

## 4. Second Vertical — SpaceX

| ID | Description | Status | Phase | Priority | Deps |
|----|-------------|--------|-------|----------|------|
| T022 | SpaceX division screen with 6 tiers (Falcon 1→Mars Lander) | DONE | MERGED | P0 | T013, T019 |
| T023 | Timed production + chief automation for SpaceX | DONE | MERGED | P0 | T022, T020, T054 |
| T024 | Launch cadence mechanic (launches/month) | DONE | MERGED | P1 | T022 |
| T025 | Power consumption for rocket facilities | DONE | MERGED | P0 | T022, T019 |

## 5. Third Vertical — Tesla (EVs)

| ID | Description | Status | Phase | Priority | Deps |
|----|-------------|--------|-------|----------|------|
| T026 | Tesla division screen with 6 tiers (Roadster→Cybertruck) | DONE | MERGED | P0 | T013, T019 |
| T027 | Timed production + chief automation for Tesla | DONE | MERGED | P0 | T026, T020, T054 |
| T028 | Production rate mechanic (vehicles/week) | DONE | MERGED | P1 | T026 |
| T029 | Power consumption for EV factories | DONE | MERGED | P0 | T026, T019 |

## 6. Bottleneck System

| ID | Description | Status | Phase | Priority | Deps |
|----|-------------|--------|-------|----------|------|
| T030 | Bottleneck detection engine (trigger on thresholds) | DONE | MERGED | P0 | T017, T022, T026 |
| T031 | Bottleneck resolution UI (research/money/time paths) | DONE | MERGED | P0 | T030 |
| T032 | 3-5 bottlenecks per division (data definitions) | DONE | MERGED | P0 | T030 |
| T033 | "Production Hell" event for Tesla | DONE | MERGED | P1 | T027, T030 |

## 7. Cross-Vertical Synergies

| ID | Description | Status | Phase | Priority | Deps |
|----|-------------|--------|-------|----------|------|
| T034 | Synergy detection engine | DONE | BUILD | P0 | T017, T022, T026 |
| T035 | Synergy notification UI ("SYNERGY DISCOVERED!") | DONE | MERGED | P1 | T034, T016 |
| T036 | MVP synergies: Tesla Energy→SpaceX power, Tesla↔Tesla Energy batteries | DONE | BUILD | P0 | T034 |

## 8. Research & Prestige

| ID | Description | Status | Phase | Priority | Deps |
|----|-------------|--------|-------|----------|------|
| T037 | Basic tech tree (15-20 nodes, JSON data) | DONE | MERGED | P0 | T007 |
| T038 | Research screen UI (node selection + progress) | DONE | MERGED | P0 | T037, T013 |
| T039 | Research point generation from R&D labs | DONE | MERGED | P0 | T037 |
| T040 | Prestige system: "The IPO" calculator | DONE | MERGED | P0 | T007 |
| T041 | Prestige screen UI (vision points preview, reset confirm) | DONE | MERGED | P0 | T040, T013 |
| T042 | Prestige bonuses (permanent multipliers) | DONE | MERGED | P0 | T040 |

## 9. Tutorial & Onboarding

| ID | Description | Status | Phase | Priority | Deps |
|----|-------------|--------|-------|----------|------|
| T043 | Tutorial system (step-by-step guided first 5 min) | DONE | MERGED | P1 | T017, T018 |
| T044 | Tooltip system for real-world engineering explanations | DONE | MERGED | P2 | T013 |

## 10. QoL & AdCap Mechanics

| ID | Description | Status | Phase | Priority | Deps |
|----|-------------|--------|-------|----------|------|
| T056 | **Buy quantity toggle (×1, ×10, ×100, Max)** — AdCap-style switch on division screen that changes all buy buttons | DONE | MERGED | P0 | T014 |

## 11. Polish & Deploy (was 10)

| ID | Description | Status | Phase | Priority | Deps |
|----|-------------|--------|-------|----------|------|
| T045 | PWA service worker + offline caching | DONE | MERGED | P1 | — |
| T046 | Number rolling animation (GSAP) | PLANNED | PLAN | P2 | T006 |
| T047 | Sound effects toggle (tap, ding, launch) | PLANNED | PLAN | P2 | — |
| T048 | Settings screen (music, SFX, notifications, save export) | DONE | MERGED | P1 | T003 |
| T049 | Cloudflare Pages deployment pipeline | DONE | MERGED | P1 | — |
| T050 | Balance pass — playtest all 3 divisions for 2-4h flow | DONE | MERGED | P0 | T017-T042 |

## 12. Future Features

| ID | Description | Status | Phase | Priority | Deps |
|----|-------------|--------|-------|----------|------|
| T051 | Bitcoin/crypto treasury investment mechanic | PLANNED | PLAN | P1 | T007 |
| T052 | BTC price simulation (volatile, cyclical) | PLANNED | PLAN | P1 | T051 |
| T053 | DOGE meme coin side investment (Elon tweet pump mechanic) | DONE | MERGED | P2 | T051 |

---

## Summary

| Priority | Total | Done | Remaining |
|----------|-------|------|-----------|
| P0 | 41 | 41 | 0 |
| P1 | 11 | 9 | 2 |
| P2 | 4 | 2 | 2 |
| **Total** | **56** | **52** | **4** |

**Next task to pick up:** T050 (Balance pass) or T049 (Cloudflare deploy).
