# TASKS.md — Moonshot Development Tracker

> Pick the next PLANNED task, spawn a sub-agent, move through PLANNED → IN_PROGRESS → DONE.

---

## ✅ COMPLETED (Summary)

**120+ commits shipped.** All original tasks T001-T078 done. Additional features built:
- 6 divisions (Energy, Rockets, Manufacturing, AI, Tunnels, Robotics) with 36 tiers
- Chiefs for all divisions, worker allocation (Even/Revenue/Smart)
- Prestige system with 12-planet chain + milestones + Vision Points
- 132 achievements (including hidden easter eggs)
- Contracts system with variety + sounds + haptics
- Random events (17 types), seasonal events (8 calendar dates)
- Dynamic news ticker, activity feed, income sparkline
- Statistics page with fun facts
- Share card, offline earnings upgrades
- Tutorial (touch-safe), What's New modal
- Browser notifications, flavor text on all 36 tiers
- Save hardening (checksums, 3 backup slots, corruption recovery)
- Performance pass, accessibility pass, dead code cleanup
- Error boundaries, offline badge, storage quota handling
- Cloudflare Pages deploy config, README
- OLED dark mode, high contrast, theme system
- PWA with install prompt, service worker
- Logo tap easter egg with confetti

---

## 🧪 QA & TESTING (Current Focus)

| ID | Description | Status | Priority |
|----|-------------|--------|----------|
| QA01 | **Fresh player playtest** — New save, first 15 min. Is progression smooth? Any dead zones? Tutorial works? | IN_PROGRESS | P0 |
| QA02 | **Mobile touch QA** — Verify ALL taps, swipes, pull-to-refresh work on iOS/Android | DONE | P0 |
| QA03 | **Edge cases** — Large numbers, prestige re-entrancy, save corruption, rapid taps, 30-day offline | DONE | P0 |
| QA04 | **Save system test** — Migration, checksums, backup restore, hard reset cleanup | DONE | P0 |
| QA05 | **UI navigation test** — Every view reachable, lazy loading works, More menu items valid | DONE | P0 |
| QA06 | **Integration build** — vite build + tsc --noEmit clean, no conflicts | DONE | P0 |
| QA07 | **Mid-game balance** — $10K-$1M range. Are all 6 divisions engaging? Chief timing right? | PLANNED | P1 |
| QA08 | **Late-game/prestige test** — Colony threshold, VP spending, planet progression, NG+ scaling | PLANNED | P1 |
| QA09 | **Treasury/crypto test** — BTC/DOGE simulation, buy/sell, portfolio display, gating at $500K | PLANNED | P1 |
| QA10 | **Contracts stress test** — Do they spawn/expire/complete correctly? Edge cases with prestige? | PLANNED | P1 |
| QA11 | **Achievement verification** — Spot-check 20+ achievements fire correctly, no double-unlocks | PLANNED | P1 |
| QA12 | **Seasonal events test** — Verify Valentine's active (Feb 9-17), buffs apply to production | PLANNED | P1 |
| QA13 | **Performance profiling** — Measure tick time, re-renders, memory over 30min play session | PLANNED | P2 |
| QA14 | **Light theme / OLED / high contrast** — Visual check all views in each theme | PLANNED | P2 |
| QA15 | **Cross-browser** — Test on Safari, Chrome, Firefox (check Web Audio, notifications, PWA) | PLANNED | P2 |

---

## 🚀 DEPLOY

| ID | Description | Status | Priority |
|----|-------------|--------|----------|
| D01 | Deploy to Cloudflare Pages (`npm run deploy`) | PLANNED | P0 |
| D02 | Set up custom domain (if desired) | PLANNED | P2 |
| D03 | Verify PWA install works on deployed URL | PLANNED | P1 |

---

## 📋 BACKLOG (Post-QA)

| ID | Description | Status | Priority |
|----|-------------|--------|----------|
| B01 | Music — ambient background tracks per planet/division | PLANNED | P2 |
| B02 | Mini-game improvements — more variety, better rewards | PLANNED | P2 |
| B03 | Social features — global leaderboard (would need backend) | PLANNED | P2 |
| B04 | Ad SDK integration (placeholder exists for 2x offline earnings) | PLANNED | P2 |
| B05 | Cloud save backend | PLANNED | P2 |
| B06 | Localization/i18n | PLANNED | P2 |
| B07 | Animated tier card art/icons | PLANNED | P2 |
| B08 | Guided "goals" system (suggested next actions for new players) | PLANNED | P1 |
