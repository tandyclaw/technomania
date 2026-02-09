# Moonshot Balance Report — Feb 2026

## Methodology
Simulated game progression from scratch ($25 starting cash) using a greedy ROI-based buying strategy with saving for division unlocks. Assumed active clicking (no chiefs).

## Progression Timeline (AFTER fixes)

| Milestone | Time | Cost |
|-----------|------|------|
| First Reactor | 0s | $5 |
| Rockets unlock | ~1 min | $500 |
| Manufacturing unlock | ~3.5 min | $2,500 |
| First Chief affordable | ~8 min | $5,000 |
| AI unlock | ~8 min | $10,000 |
| Tunnels unlock | ~12 min | $25,000 |
| Robotics unlock | ~18 min | $75,000 |

## Issues Found & Fixed

### 1. **18-minute dead zone (CRITICAL)**
**Before:** After Manufacturing at 3.5 min, next unlock (AI) was at 21.6 min. Nothing new happens for 18 minutes. Players would quit.

**Fix:** Reduced unlock costs:
- AI: $50,000 → $10,000
- Tunnels: $100,000 → $25,000
- Robotics: $200,000 → $75,000

Scaled all tier costs/revenues proportionally to maintain internal division balance.

### 2. **Nuclear Reactor ROI dominance**
Reactors have 4x better ROI (0.333) than the next best item (Solar at 0.089). This means the optimal strategy is to spam reactors for a long time. This is *intentional* for early game (simple, rewarding), but could become boring. No change made — the cost multiplier (1.07^n) naturally makes reactors expensive after ~50 units, forcing diversification.

### 3. **Chiefs only for 3 divisions**
Only Energy, Rockets, and Manufacturing have chiefs defined. AI, Tunnels, and Robotics don't. This means late-game divisions require manual clicking forever. **Not fixed here** — needs design decision on chief characters.

### 4. **Power balance**
Energy produces power (powerMW > 0), all other divisions consume it. Nuclear Reactor gives 0.5 MW each. With 100+ reactors by mid-game, power is never a bottleneck early. Late-game tiers consume large amounts (AGI: -200 MW, Hyperloop: -250 MW) which should create interesting tension. Power balance looks good.

### 5. **Tier unlock costs**
Tier unlock = 5x baseCost. This feels right — you need to save a bit but not forever.

### 6. **Revenue curves per division**
ROI by tier (revenue/cycle/baseCost):
- Reactor: 0.333 (excellent early)
- Solar: 0.089
- Rocket: 0.080
- Car: 0.067
- Chatbot: 0.053
- TestBore: 0.036
- Battery: 0.031
- AssemblyBot: 0.025
- Gigafactory: 0.023

Higher tiers have lower base ROI, compensated by larger absolute revenue. This is standard idle game design.

## What Feels Good
- First 3 minutes are exciting — rapid purchasing, two division unlocks
- Reactor spam is satisfying (fast cycle, quick feedback)
- Division unlock moments feel like milestones

## Remaining Concerns
- Need chiefs for AI, Tunnels, Robotics
- Chief Level 1 at $5,000 may be too cheap (affordable before AI unlocks)
- Late-game prestige loop not tested in this pass
