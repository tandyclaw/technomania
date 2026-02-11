# TASKS.md — Moonshot QA & Polish

> NO NEW MECHANICS. Focus on fixing, polishing, and QA only.

---

## 🔴 Current Sprint — Master Feedback 2026-02-11

| ID | Description | Status |
|----|-------------|--------|
| B01 | **Seasonal banner text cut off** — Valentine's description truncated on mobile. Make banner text always fully visible (wrap, not truncate). Consider making description 2 lines max with larger font or shorter text | PLANNED |
| B02 | **Buy/Upgrade button click-through on disabled state** — When buy button is disabled (can't afford), clicking it still produces a visual effect / seems to "do something". Disabled buttons should be completely inert — no click handler, no visual feedback, no propagation to parent card | PLANNED |
| B03 | **First click on tier not registering** — Nuclear reactor (first tier) needs 4-5 clicks before anything happens. Debug: check if first tap is being swallowed by tutorial, long-press detector, ripple, or other event handlers. Ensure first tap always triggers production immediately | PLANNED |
| B04 | **Production doesn't show until manually tapped** — After building a tier, the production progress bar doesn't appear until you tap. If you have count >= 1, the tier should auto-start producing (or clearly show "Tap to produce" state with visible progress area) | PLANNED |
| B05 | **Rename "Buy" → "Upgrade" everywhere** — Change all user-facing "Buy" labels to "Upgrade". Includes: TierCard buy button, BuyQuantityToggle label, TreasuryView "Buy Shares"/"Buy BTC"/"Buy Meme Coins", about page, any aria-labels. Do NOT change internal function names or variable names — only user-facing text | PLANNED |
| B06 | **Unlock button QA** — Verify all unlock buttons work: division unlocks, tier unlocks, chief hire buttons. Test the full flow from fresh game: Energy → first tier unlock → build → produce → unlock next tier. Document any broken paths | PLANNED |
| B07 | **Disabled buy button should not propagate click to parent** — Currently clicking disabled buy button may trigger the parent tier card's tap-to-produce handler via event bubbling. Add `event.stopPropagation()` to disabled button clicks, or prevent the event entirely | PLANNED |

---

## ✅ Completed (previous sprints)

All previous F01-F08, P01-P02, QA01-QA16 tasks complete. See git history.
