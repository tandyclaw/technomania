# Balance Notes — Being Elon v0.1

## Design Philosophy

Modeled after Adventure Capitalist's pacing: fast early loop with satisfying progression curves,
manual tapping giving way to automation, each new tier/division feeling like a significant upgrade.

**Target session**: 2-4 hours from fresh start to first prestige (IPO).

## Tier Cost Formula

All three divisions use a symmetric cost/revenue curve with **12x scaling** between tiers:

| Tier | Base Cost | Base Revenue | Cycle (s) | Cost Mult | Revenue/Cycle Ratio |
|------|-----------|-------------|-----------|-----------|-------------------|
| T1   | $4        | $1          | 0.6       | 1.07      | ~25%              |
| T2   | $60       | $8          | 3.0       | 1.15      | ~13%              |
| T3   | $720      | $90         | 6.0       | 1.14      | ~12.5%            |
| T4   | $8,640    | $1,080      | 12.0      | 1.13/1.12 | ~12.5%            |
| T5   | $103,680  | $12,960     | 24-36     | 1.12/1.11 | ~12.5%            |
| T6   | $1,244,160| $155,520    | 48-96     | 1.10      | ~12.5%            |

**Cost multiplier decreases** at higher tiers (1.07→1.10) to make stacking units
less punishing as cycle times get longer.

**Revenue/cycle** ≈ baseCost/12, meaning ~12 completed cycles to earn back your investment.
This creates a satisfying "breakeven" feel before each tier becomes pure profit.

**Cycle durations** vary by division theme:
- Tesla Energy: 0.6s → 48s (energy is steady)
- SpaceX: 0.6s → 96s (rockets take time)
- Tesla: 0.6s → 64s (manufacturing at scale)

## Division Unlock Costs

| Division | Cost | Expected Unlock Time |
|----------|------|---------------------|
| Tesla Energy | Free | Instant |
| SpaceX | $1,000 | ~3 min |
| Tesla | $10,000 | ~15 min |

## Tier Unlock Costs

Unlock cost = `baseCost × 5` for each tier. This gates progression without
being punishing — about 5 cycles of the previous tier's production at scale.

## Chief (Manager) System

Chiefs auto-run production. First chief hire is the biggest feel-good moment.

| Level | Cost | Speed | Expected Time |
|-------|------|-------|--------------|
| L1 Hired | $5,000 | 1× | ~10-12 min |
| L2 Experienced | $50,000 | 2× | ~46 min |
| L3 Expert | $1,000,000 | 5× | ~109 min |
| L4 Legendary | $25,000,000 | 10× | ~195 min |
| L5 Visionary | $1,000,000,000 | 50× | Post-prestige |
| L6 Full Autonomy | $100,000,000,000 | 100× | Late prestige runs |

## Prestige System

**IPO threshold**: $1 Billion total value earned (~154 min / 2.5 hours).

**Formula**: `Vision Points = floor(log₂(totalValue / $1B))`

Each Founder's Vision point = +10% global revenue multiplier.

First prestige yields 1 Vision Point. Second run with the 1.1× multiplier
should reach prestige faster (~2 hours), earning 2-3 more points.

## Progression Timeline (Simulated)

| Time | Milestone |
|------|-----------|
| 0:00 | Start — buy Solar Panels with $25 |
| 0:30 | 25 Solar Panels, starting to accumulate |
| 2:30 | Unlock SpaceX ($1,000) |
| 6:00 | $100K total earned, T3 tiers opening |
| 10:00 | First chief hired (Tesla Energy), automation begins! |
| 15:00 | Unlock Tesla division ($10,000), all chiefs L1 at ~16 min |
| 19:00 | $1M total earned |
| 40:00 | T4 tiers (Solar Roof, Falcon Heavy, Model 3) opening |
| 46:00 | All chiefs L2 (2× speed) |
| 52:00 | $10M total earned |
| 90:00 | T5 tiers (Grid Battery, Model Y, Starship) opening |
| 102:00 | $100M total earned |
| 109:00 | All chiefs L3 (5× speed — big acceleration!) |
| 150:00 | T6 tiers (VPP, Cybertruck, Mars Lander) opening |
| 154:00 | **$1B — PRESTIGE AVAILABLE** |
| 195:00 | Chief L4 if continuing past first prestige |

## Key Balance Decisions

1. **Symmetric divisions**: All three share the same cost/revenue curve.
   Differentiation comes from cycle times, power mechanics, and flavor.
   This keeps balance tractable and prevents "one division dominates" problems.

2. **12x tier scaling**: Each new tier costs 12× more than the previous,
   but revenue scales proportionally. This means new tiers always feel like
   a meaningful upgrade, not just marginally better.

3. **Low cost multipliers for T1** (1.07): Players can stack 25-50+ Solar Panels
   cheaply, getting satisfying numbers early. Higher tiers use steeper curves
   (1.15) to prevent infinite stacking.

4. **Chief L1 at $5K**: Delayed enough (10-12 min) that players feel the
   manual tapping grind and appreciate automation when it arrives.

5. **$1B prestige threshold**: High enough to feel like an accomplishment,
   reachable in ~2.5 hours of optimal play, which aligns with the target
   2-4 hour session length.

6. **revenueMultiplier unused**: Set to 1.0 across all tiers. The per-level
   upgrade mechanic is not implemented in the current build — revenue scales
   purely from unit count. This field is reserved for future use.

## Known Issues / Future Tuning

- Power system penalties may need rebalancing post T5/T6 when consumption
  vastly exceeds generation
- Synergy bonuses are not modeled in the simulation — real gameplay will
  progress slightly faster due to speed/revenue synergies
- Research tree bonuses (+15-30% speed/revenue) will accelerate mid-game;
  may need to adjust if progression feels too fast with all tech unlocked
- Offline progress caps at 8 hours; may need adjustment based on player feedback
