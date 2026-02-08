# 🚀 BEING ELON: Idle Tycoon
## Project Plan — v2.0

> *"Make life multi-planetary. One tap at a time."*

---

## Table of Contents
1. [Game Concept](#1-game-concept)
2. [The Story: Elon's Journey](#2-the-story-elons-journey)
3. [Core Mechanics](#3-core-mechanics)
4. [Company Divisions](#4-company-divisions)
5. [The Bottleneck System](#5-the-bottleneck-system)
6. [Tech Tree & Research](#6-tech-tree--research)
7. [Progression Loop](#7-progression-loop)
8. [Cross-Company Synergies](#8-cross-company-synergies)
9. [UI/UX & Art Style](#9-uiux--art-style)
10. [Tech Stack](#10-tech-stack)
11. [Monetization](#11-monetization)
12. [MVP Scope](#12-mvp-scope)
13. [Development Phases](#13-development-phases)
14. [Appendices](#14-appendices)

---

## 1. Game Concept

### Vision
**Being Elon** is a web-based, mobile-optimized idle tycoon game where you live Elon Musk's journey — from selling Zip2 to colonizing Mars. Real company names, real engineering challenges, real synergies. Every upgrade, bottleneck, and breakthrough is grounded in the actual history and engineering of SpaceX, Tesla, Starlink, Neuralink, The Boring Company, xAI, and Tesla Energy.

You start with PayPal money and a dream. You'll build your first Falcon 1 rocket (and watch it fail three times), survive "Production Hell" scaling Model 3, launch thousands of Starlink satellites, and eventually send humans to Mars — all while managing the very real constraints of power generation, supply chains, physics, and the fact that every company feeds into the same master plan.

### What Makes It Different
- **Real Story, Real Stakes**: This isn't a generic tycoon. You're living Elon's actual journey. Three Falcon 1 failures. 2008 near-bankruptcy. Model 3 Production Hell. These are scripted crisis events you must survive.
- **The Master Plan**: SpaceX launches Starlink satellites. Tesla batteries power SpaceX launch facilities. Starlink revenue funds Mars missions. xAI optimizes everything. Every company connects, exactly as Elon describes it.
- **Sustainable Energy Is The Foundation**: Tesla Energy (solar + batteries) powers everything. Your energy strategy is the meta-game that unlocks or constrains every other company.
- **Mars Is The Endgame**: Everything you build points toward one goal — a self-sustaining colony on Mars. That's not just flavor text; it's the actual win condition.

### Tone
Optimistic, ambitious, slightly irreverent, deeply nerdy. Think "what if you could replay Elon's decisions but with an idle game's satisfying numbers?" Pop-up tooltips explain the real engineering. Failures are real ("Falcon 1 Flight 3: rapid unscheduled disassembly"). The narrative celebrates audacious bets and engineering breakthroughs.

---

## 2. The Story: Elon's Journey

### Act 1: PayPal Era (Tutorial / Prologue)
**1995-2002**: Start with nothing but code and ambition.
- Found **Zip2** → Build city guide websites → Sell to Compaq for $307M → You get $22M
- Found **X.com** → Online banking → Merge with Confinity → Become **PayPal**
- eBay acquires PayPal for $1.5B → You get $175.8M as largest shareholder
- **Key moment**: You've been fired as CEO twice. But you have the money. What do you do with it?

*Game mechanic*: This is the tutorial. Simple tap-to-earn, teaches core loop. The "sale" at the end gives you your starting capital for Act 2.

### Act 2: The Bet (Early Game)
**2002-2008**: The all-in gamble that almost destroyed everything.
- Pour $100M into **SpaceX** (May 2002)
- Invest $6.35M into **Tesla** as largest shareholder (Feb 2004)
- Fund **SolarCity** concept ($10M to cousins, 2006)
- **Falcon 1 Flight 1** fails (March 2006)
- **Falcon 1 Flight 2** fails (March 2007)
- **Falcon 1 Flight 3** fails (August 2008) — "a Merlin engine, a Dragon capsule, and three satellites were destroyed"
- Tesla running out of money. SpaceX running out of money. 2008 financial crisis.
- **THE DARKEST HOUR**: Split last $30M between SpaceX and Tesla. Borrow money for rent.
- **Falcon 1 Flight 4 SUCCEEDS** (September 28, 2008)
- NASA awards $1.6B contract → SpaceX saved
- **Key emotion**: Despair → Survival → Hope

*Game mechanic*: This is the high-stakes early game. Resources are extremely tight. Failure events happen. You must make agonizing allocation decisions. The NASA contract is a scripted "rescue" milestone.

### Act 3: Building the Empire (Mid Game)
**2008-2019**: From survival to dominance.
- **SpaceX**: Falcon 9 (2010) → Dragon docks with ISS (2012) → First booster landing (2015) → Falcon Heavy (2018)
- **Tesla**: Roadster (2008) → Model S (2012) → Model X (2015) → Model 3 "Production Hell" (2017) → Model Y (2020)
- **Tesla Energy**: SolarCity acquisition (2016) → Powerwall → Megapack → Grid storage
- **Neuralink** founded (2016)
- **The Boring Company** founded (2017)
- **Starlink** first satellites (2019)

*Game mechanic*: This is the satisfying growth phase. Multiple companies scaling in parallel. Synergies start appearing. Production numbers go exponential. But new bottlenecks emerge at every scale level.

### Act 4: The Network (Late Game)
**2019-2026**: Everything connects into the master plan.
- **Starlink**: 9,000+ satellites, 9M subscribers, $12B revenue
- **The Boring Company**: Vegas Loop expanding to 68 miles
- **Neuralink**: First human implant (2024), Blindsight vision restoration
- **xAI**: Grok chatbot, Colossus supercomputer, acquired Twitter/X
- **Tesla**: Cybertruck, FSD, Robotaxi development, Optimus robot
- **Everything feeds into Mars**: Starlink for Mars internet, Tesla batteries for Mars power, Boring Company for Mars tunnels, Optimus robots for Mars labor

*Game mechanic*: Deep synergy optimization. Cross-company bonuses compound. The game becomes about orchestrating the network, not grinding individual companies.

### Act 5: Mars (Endgame)
**2026+**: The reason for everything.
- First uncrewed Starship cargo missions to Mars (2026-27 window)
- Equipment: propellant production plants, habitats, solar arrays
- First crewed mission (~12 people): build Mars Base Alpha
- Scaling: 20 missions (2028), 100 missions (2030), 500 missions (2033)
- Sabatier reaction: manufacture methane fuel from CO2 + water ice
- Transparent domes for agriculture
- Self-sustaining colony by 2050
- Goal: 1 million people on Mars

*Game mechanic*: Mars is the "second world" (like Adventure Capitalist's Moon). Everything shipped from Earth or manufactured locally. Extreme bottlenecks. Requires ALL companies contributing. The ultimate prestige unlock.

### Endgame: The Next Big Bet (Prestige)
When growth plateaus, you can "reset the timeline" — cash out everything and restart with accumulated knowledge bonuses. Just like Elon reinvests everything into the next venture, you carry your vision forward.

---

## 3. Core Mechanics

### 3.1 The Idle Loop

```
TAP/CLICK → EARN REVENUE → BUY UPGRADES → AUTOMATE → SCALE → HIT BOTTLENECK → RESEARCH → BREAKTHROUGH → BIGGER SCALE → PRESTIGE
```

**Phase 1 — Manual (First 5 minutes):**
Player taps to build. First Falcon 1 engine assembled by hand. First Roadster rolls off a workbench. This teaches the core loop.

**Phase 2 — Automation (5-30 minutes):**
Hire Division Chiefs (Gwynne Shotwell for SpaceX, etc.). They automate production. Player shifts from tapping to strategic decisions.

**Phase 3 — Scaling (30 min - hours):**
Build Gigafactories, launch facilities, data centers. Production goes exponential.

**Phase 4 — Bottlenecks (ongoing):**
Falcon 1 keeps failing. Battery yields crater during Model 3 ramp. GPUs fail mid-training at Colossus. Must solve each constraint through research, money, or cross-company synergy.

**Phase 5 — Prestige (hours - days):**
When growth plateaus, "restart the timeline" for permanent bonuses. Each prestige run unlocks deeper tech trees and new game mechanics.

### 3.2 Resources & Currencies

**Primary Currencies:**
| Currency | Symbol | How Earned | What It Buys |
|----------|--------|-----------|--------------|
| **Cash ($)** | 💰 | Revenue from all companies | Buildings, staff, equipment |
| **Research Points (RP)** | 🔬 | R&D labs, engineers | Tech tree unlocks, upgrades |
| **Power (MW)** | ⚡ | Tesla Energy output | Operating all facilities |
| **Influence** | 🌟 | Products, media, launches | Regulatory approvals, contracts |

**Prestige Currencies:**
| Currency | Symbol | How Earned | What It Buys |
|----------|--------|-----------|--------------|
| **Vision** | 👁️ | Timeline reset (prestige) | Permanent multipliers |
| **Pioneer Tokens** | 🏆 | Achievements, milestones | Cosmetics, special upgrades |

### 3.3 Automation Tiers

Each company has escalating automation:
1. **Manual**: Player taps to produce
2. **Chief of Staff**: Automates basic production (slow)
3. **VP Operations**: 2x speed, batch production
4. **Chief Engineer**: 5x speed, parallel lines
5. **AI Optimizer**: 10x speed, self-optimizing
6. **Full Autonomy**: 50x speed, runs perfectly offline

### 3.4 Offline Progression

- Game calculates earnings while away (up to 8 hours base, extendable)
- "Welcome back" screen shows what happened
- Chance of events occurring offline (NASA contract awarded, equipment failure)
- Player can choose to "bank" offline time for a burst

---

## 4. Company Divisions

Each company is a self-contained progression track with real milestones, real bottlenecks, and connections to other companies.

---

### 4.1 🚀 SpaceX (Rockets & Space)

**Progression Tiers:**

| Tier | Name | Real-World Basis | Bottleneck |
|------|------|-----------------|------------|
| 1 | Falcon 1 | First orbital rocket, 4 attempts | Cash, propulsion R&D |
| 2 | Falcon 9 | Workhorse reusable rocket | Engine production rate |
| 3 | Dragon | Commercial spacecraft, ISS docking | Life support, heat shield |
| 4 | Falcon Heavy | Triple-core heavy lifter | Manufacturing throughput |
| 5 | Starship | Largest rocket ever, fully reusable | Raptor engine mass production, heat tiles |
| 6 | Mars Lander | Starship configured for Mars | EVERYTHING (ISRU, power, habitat) |
| 7 | Booster Catch | Mechazilla tower catch system | Precision guidance software |
| 8 | Orbital Refueling | Propellant depot in orbit | Cryogenic transfer R&D |
| 9 | Moon Landing | Artemis HLS Starship | Life support + landing systems |
| 10 | Mars Transit | Interplanetary crew mission | Radiation shielding + ISRU |
| 11 | Mars Colony | Permanent settlement | All companies must contribute |
| 12 | Interplanetary Network | Multi-planet civilization | Massive infrastructure |

**Key Mechanics:**
- **Launch Cadence**: Measured in launches/month. Higher = more revenue.
- **Reusability Score**: 0-100%. Research-driven. Higher = lower cost per launch.
- **Failure Events**: Falcon 1 Flights 1-3 WILL fail. Scripted crises. Later launches have probabilistic risk.
- **Raptor Production**: Engines/month bottleneck. Each Starship needs 33 Raptors.
- **Heat Shield**: Tile loss during reentry. Research reduces failure rate.

**Revenue Sources:**
- Government contracts (NASA, military)
- Commercial satellite deployment
- Crew missions
- Starlink launches (synergy!)
- Moon/Mars mission funding (late game)

---

### 4.2 🔋 Tesla (Electric Vehicles)

**Progression Tiers:**

| Tier | Name | Real-World Basis | Bottleneck |
|------|------|-----------------|------------|
| 1 | Roadster | First mass-production EV, 2,500 built | Cash, battery sourcing |
| 2 | Model S | Luxury sedan, proved Tesla is real | Production quality |
| 3 | Model X | Crossover SUV, falcon wing doors | Manufacturing complexity |
| 4 | Model 3 | Mass market, Production Hell event | Gigafactory + "Production Hell" |
| 5 | Model Y | World's best-selling car | Global manufacturing scale |
| 6 | Cybertruck | Stainless steel pickup | Exoskeleton manufacturing |
| 7 | Semi | Electric truck, massive battery | Battery pack size, charging |
| 8 | 4680 Cell Line | Next-gen battery format | Dry electrode yields |
| 9 | Supercharger Network | Charging infrastructure | Grid connections, permits |
| 10 | Full Self-Driving | FSD, autonomous driving | Edge cases, regulatory |
| 11 | Optimus Robot | Humanoid robot for labor | Actuators, balance, AI |
| 12 | Robotaxi Fleet | Autonomous ride-hail | Fleet management, insurance |

**Key Mechanics:**
- **Production Rate**: Vehicles/week. Limited by Gigafactory capacity.
- **Battery Yield**: % of cells meeting spec. New chemistry starts at low yield.
- **"Production Hell"**: Scripted event when scaling Model 3. Cascading failures for 2-3 game days. Player allocates engineers to fix.
- **Supply Chain**: Secure lithium, nickel, cobalt contracts or build own mines.
- **FSD Training**: Requires compute from xAI. More fleet data = better AI.

---

### 4.3 🧠 xAI (Artificial Intelligence)

**Progression Tiers:**

| Tier | Name | Real-World Basis | Bottleneck |
|------|------|-----------------|------------|
| 1 | ML Workstation | Single GPU setup | Cash for hardware |
| 2 | GPU Cluster | Small training cluster | Power, cooling |
| 3 | Grok v1 | First chatbot release | Training data quality |
| 4 | Data Center | 10K GPU facility | Power plant + cooling |
| 5 | Colossus | World's largest supercomputer, 100K GPUs | Custom networking, liquid cooling |
| 6 | Grok Frontier | State-of-art model | Data curation, alignment |
| 7 | Custom AI Chips | Purpose-built silicon | Chip design, fab partnerships |
| 8 | Applied AI | FSD, robotics, energy trading | Domain-specific training |
| 9 | Grok for Government | Military/gov contracts | Security clearance |
| 10 | AGI Research | Artificial General Intelligence | Fundamental breakthroughs |

**Key Mechanics:**
- **GPU Count**: Total compute capacity. More GPUs = larger models.
- **Power Draw**: Each 1,000 GPUs ≈ 1MW. Must be supplied by Tesla Energy.
- **Colossus**: 150MW peak power — massive Tesla Energy requirement.
- **Model Quality**: Drives revenue. Higher = more users/subscribers.
- **Cross-company AI**: FSD training, Autobidder energy trading, rocket landing optimization.

---

### 4.4 🕳️ The Boring Company (Tunnel Infrastructure)

**Progression Tiers:**

| Tier | Name | Real-World Basis | Bottleneck |
|------|------|-----------------|------------|
| 1 | Test Trench | Hawthorne test tunnel | Cash, permits |
| 2 | Godot TBM | First boring machine (refurbished Lovat) | TBM acquisition |
| 3 | LVCC Loop | Las Vegas Convention Center, 3 stations | Station construction |
| 4 | Prufrock TBM | Next-gen boring machine | Engineering R&D |
| 5 | Vegas Loop | 68-mile expansion plan | Municipal permits |
| 6 | City Network | 50+ mile city system | Public transit coordination |
| 7 | Freight Tunnels | Underground logistics | Automation, cargo handling |
| 8 | Inter-City | City-to-city connection | Massive excavation |
| 9 | Mars Tunnels | Underground habitat on Mars | Regolith boring tech |

**Key Mechanics:**
- **Boring Speed**: Feet/day. Core metric. Improves with TBM upgrades.
- **Permitting Queue**: Real game-time. Spend Influence to speed up.
- **Self-Driving Vehicles**: Tesla EVs in tunnels (November 2025 trial).

---

### 4.5 🧬 Neuralink (Neural Interfaces)

**Progression Tiers:**

| Tier | Name | Real-World Basis | Bottleneck |
|------|------|-----------------|------------|
| 1 | EEG Headband | Non-invasive BCI | Basic neuroscience |
| 2 | Flexible Threads | N1 implant, 1024 electrodes | Microfabrication |
| 3 | Surgical Robot | R1 robot for implantation | Precision engineering |
| 4 | Animal Trials | Monkey playing Pong (2021) | FDA approval queue |
| 5 | Telepathy | First human implant (Noland Arbaugh, 2024) | Patient safety |
| 6 | Blindsight | Vision restoration, FDA breakthrough | Visual cortex mapping |
| 7 | Expanded Trials | Multi-patient, international (Canada 2025) | Manufacturing |
| 8 | Consumer BCI | Non-medical applications | Public acceptance |
| 9 | Cognitive Enhancement | Human-AI symbiosis | End-game tech |

**Key Mechanics:**
- **Electrode Count**: 16 → 1,024 → 4,096 progression.
- **Biocompatibility**: How well body tolerates implant. Degrades without research.
- **"Neural Lace"**: Musk's vision from Iain Banks' Culture novels — "a digital layer above the cortex."

---

### 4.6 🛰️ Starlink (Satellite Internet)

**Progression Tiers:**

| Tier | Name | Real-World Basis | Bottleneck |
|------|------|-----------------|------------|
| 1 | Ground Station | Basic relay infrastructure | Equipment + site |
| 2 | First Satellites | v0.9 prototype sats (2019) | SpaceX launch capability |
| 3 | Regional Coverage | 100+ satellites | Manufacturing throughput |
| 4 | User Terminal | Phased array dish (Dishy) | Antenna design |
| 5 | Global Coverage | 5,000+ satellites | Ground station network |
| 6 | Laser Links | Optical inter-satellite mesh | Laser miniaturization |
| 7 | Direct-to-Cell | Phone-to-satellite | Antenna design, carrier partnerships |
| 8 | Starshield | Military/gov variant | Security clearance |
| 9 | Mega Constellation | 12,000+ satellites | Space debris management |
| 10 | Mars Relay | Communication to/from Mars | Deep space network |

**Key Mechanics:**
- **Satellite Count**: More = better coverage. Launches from SpaceX.
- **Subscriber Count**: Revenue driver (9M+ as of 2025). $12B projected.
- **Mars Revenue**: "The positive cash flow from Starlink is necessary to fund Mars plans" — Musk
- **65% of all active satellites**: Starlink IS the dominant constellation.

---

### 4.7 ☀️ Tesla Energy (Energy & Solar)

**Progression Tiers:**

| Tier | Name | Real-World Basis | Bottleneck |
|------|------|-----------------|------------|
| 1 | Solar Panels | Residential rooftop solar | Installer workforce |
| 2 | Powerwall | Home battery, 13.5 kWh | Battery cell supply |
| 3 | SolarCity Commercial | Business installations | Permitting, grid connection |
| 4 | Solar Roof | Integrated solar shingles | Glass tile manufacturing |
| 5 | Gigafactory | Battery cell factory (Giga Nevada) | LFP cell production |
| 6 | Megapack | Grid-scale storage, 3.9 MWh per unit | Utility contracts |
| 7 | Solar Farm | Utility-scale solar | Land acquisition |
| 8 | Autobidder | AI energy trading platform | Market data, xAI integration |
| 9 | Virtual Power Plant | Aggregated Powerwalls as grid | Software, customer opt-in |
| 10 | Fusion Research | Holy grail of energy | End-game moonshot |

**Key Mechanics:**
- **Power Output (MW)**: THE core resource. All other companies consume it.
- **Grid Balance**: Solar has day/night cycle. Batteries smooth it.
- **Tesla Energy Revenue**: $10.1B (2024), $2.6B net income — this division PRINTS money.
- **SolarCity Acquisition**: Scripted event at Tier 4 — controversial merger with Tesla.

**CRITICAL ROLE**: Tesla Energy is the **foundation**. Every other company needs its output. This creates the central strategic tension.

---

## 5. The Bottleneck System

### 5.1 Bottleneck Categories

**🔧 Engineering Bottlenecks:**
- Falcon 1 Flight 1-3 failures (scripted)
- Heat shield tile adhesion failure
- Battery cell dry electrode yield
- GPU failure rate during training (2-5% at scale)
- TBM cutting head wear rate
- Electrode biocompatibility degradation

**⚡ Power Bottlenecks:**
- Colossus needs 150MW
- SpaceX Starbase launch complex
- Gigafactory power requirements
- Cryogenic propellant production (LOX/LCH4 are energy-intensive)

**📦 Supply Chain Bottlenecks:**
- Lithium, nickel, cobalt for batteries
- GPU allocation (competing with other AI companies)
- Stainless steel for Starship and Cybertruck
- Raptor engine production rate (33 per Starship)

**📋 Regulatory Bottlenecks:**
- FAA launch licenses
- FCC spectrum for Starlink
- FDA for Neuralink
- EPA environmental reviews
- Municipal tunnel permits

### 5.2 Scripted Crisis Events

| Event | When | What Happens |
|-------|------|-------------|
| **Falcon 1 Failures** | Act 2, Tiers 1-3 | Three consecutive launch failures. Must research + spend to fix. |
| **2008 Crisis** | Act 2 | Cash drops to near-zero. Must choose how to split remaining funds. |
| **Production Hell** | Tesla Tier 4 (Model 3) | Cascading factory failures for 2-3 game days. |
| **SolarCity Merger** | Tesla Energy Tier 4 | Controversial acquisition. Stock drops but unlocks synergies. |
| **Starship RUD** | SpaceX Tier 5 | "Rapid Unscheduled Disassembly" — Starship explodes on test. |

---

## 6. Tech Tree & Research

### 6.1 Sample Tech Tree Paths

**SpaceX Reusability Path:**
```
Parachute Recovery → Propulsive Landing → Grid Fins → Landing Legs →
Drone Ship Landing → Precision Guidance → Tower Catch (Mechazilla) →
Rapid Turnaround → Orbital Refueling
```

**Tesla Battery Evolution Path:**
```
Lithium Cobalt Oxide → NCA Chemistry → 2170 Cell →
Tabless Electrode → 4680 Cell → Dry Electrode Coating →
LFP for Storage → Solid State (Late Game)
```

**xAI Scaling Path:**
```
Transformer Architecture → Attention Mechanism →
Data Parallelism → Mixed Precision → Flash Attention →
Expert Parallelism (MoE) → Custom Chips → Neuromorphic (End Game)
```

### 6.2 Cross-Company Research

| Research Node | Cost | Unlocks |
|--------------|------|---------|
| Advanced Metallurgy | 500 RP | Better Raptor alloys + EV motor magnets |
| Thermal Management | 300 RP | GPU cooling + battery thermal + heat shields |
| Computer Vision | 400 RP | FSD + surgical robot + satellite inspection |
| Power Electronics | 350 RP | EV inverters + grid inverters + satellite power |

---

## 7. Progression Loop

### 7.1 Early Game (Act 1-2, First Session)

**What Happens:**
- PayPal tutorial → get starting capital
- Found SpaceX and invest in Tesla
- Build first Falcon 1 (it fails)
- Install first solar panels (Tesla Energy)
- Experience the 2008 crisis (scripted event)
- Falcon 1 Flight 4 succeeds → NASA contract → saved

**Player Learns:**
- Tap to produce → earn → upgrade → automate
- Power is needed for everything
- Failures are part of the journey
- Everything is connected

### 7.2 Mid Game (Act 3, Days 1-7)

**What Happens:**
- All 7 companies unlocking as milestones are hit
- Building Gigafactories, launch pads, data centers
- "Production Hell" hits during Model 3 scaling
- Cross-company synergies appearing
- Starlink starts generating revenue
- First prestige opportunity

### 7.3 Late Game (Act 4-5, Weeks 2+)

**What Happens:**
- Multiple prestige cycles
- Deep tech tree exploration
- Mars Colony unlocked (mega-project requiring ALL companies)
- Synergy optimization becomes the game
- 1 million colonists is the ultimate goal

### 7.4 Prestige System: "The Next Big Bet"

When the player resets their timeline:
- **All companies reset** (buildings, production, revenue)
- **Retain**: Research, tech tree, knowledge
- **Earn**: "Vision" points based on total empire value
- **Permanent Bonuses**: Each Vision point → +10% to all revenue/production
- **New Unlocks**: Each prestige tier opens new mechanics
  - **Reset 1**: All companies unlocked from start, Board of Directors
  - **Reset 2**: Vertical Integration (automated supply chains)
  - **Reset 3**: Government Contracts (lucrative missions with deadlines)
  - **Reset 4**: Mars Colony expansion (new world)
  - **Reset 5+**: Increasingly powerful bonuses

---

## 8. Cross-Company Synergies

### 8.1 The Master Plan Synergy Map

```
                    ┌──────────────┐
            ┌──────→│   Starlink   │←───────┐
            │       │  (Internet)  │         │
            │       └──────┬───────┘         │
            │              │ Internet for     │
     Launches for     remote operations   Military
     satellites            │              contracts
            │              ▼                  │
     ┌──────┴──────┐  ┌───────────┐   ┌──────┴──────┐
     │   SpaceX    │  │  Boring   │   │    xAI      │
     │  (Rockets)  │  │  Company  │   │   (AI/ML)   │
     └──────┬──────┘  └─────┬─────┘   └──────┬──────┘
            │               │                 │
      Mars missions    Tesla EVs in      FSD training
      need everything   tunnels          Autobidder
            │               │                 │
            ▼               ▼                 ▼
     ┌──────────────────────────────────────────────┐
     │              Tesla (EVs)                      │
     │    Batteries ←→ Supply chain ←→ Gigafactories │
     └──────────────────────┬───────────────────────┘
                            │
                    Battery cells for
                    ALL energy storage
                            │
                            ▼
     ┌──────────────────────────────────────────────┐
     │           Tesla Energy (Foundation)            │
     │     ⚡ POWERS EVERYTHING ⚡                    │
     └──────────────────────┬───────────────────────┘
                            │
                     Powers implant
                     manufacturing
                            │
                            ▼
                    ┌───────────────┐
                    │  Neuralink    │
                    │   (Neural)    │
                    └───────────────┘
```

### 8.2 Synergy Bonuses

| Source | Target | Synergy Effect |
|--------|--------|----------------|
| SpaceX | Starlink | -30% satellite launch cost |
| Tesla | Boring Company | Free tunnel vehicles (Tesla EVs) |
| Tesla | Tesla Energy | Shared battery cell supply chain |
| xAI | Tesla | +20% FSD development speed |
| xAI | Tesla Energy | Autobidder energy trading AI |
| xAI | SpaceX | +10% landing precision |
| xAI | Neuralink | +25% neural decoding accuracy |
| Tesla Energy | ALL | Powers all facilities |
| Starlink | ALL | +5% remote facility efficiency |
| Starlink | SpaceX | Mars communication relay |
| Neuralink | xAI | Neural architecture insights |
| Boring Company | Tesla | Underground Supercharger stations |

### 8.3 Synergy Discovery

Synergies are **not shown upfront**. Players discover them by developing multiple companies:

> 🔗 **SYNERGY DISCOVERED!**
> *xAI + Tesla*
> "Grok has begun training self-driving models on Tesla fleet data."
> **+20% FSD Development Speed**

---

## 9. UI/UX & Art Style

### 9.1 Art Style

**"Clean Industrial Futurism"**
- Dark navy/charcoal background, bright accent colors per company
- Company Colors:
  - 🚀 SpaceX: **Rocket Red** (#FF4444)
  - 🔋 Tesla: **Electric Blue** (#4488FF)
  - 🧠 xAI: **Neural Purple** (#9944FF)
  - 🕳️ The Boring Company: **Tunnel Orange** (#FF8844)
  - 🧬 Neuralink: **Bio Green** (#44FF88)
  - 🛰️ Starlink: **Sky Cyan** (#44DDFF)
  - ☀️ Tesla Energy: **Solar Gold** (#FFCC44)

### 9.2 Layout (Mobile-First)

```
┌─────────────────────────────────────┐
│  💰 $1.23B  🔬 456  ⚡ 89/120 MW   │  ← Resource bar
├─────────────────────────────────────┤
│                                     │
│     [ACTIVE COMPANY VIEW]           │  ← Main content
│                                     │
│  ┌─────┐  ┌─────┐  ┌─────┐        │  ← Production
│  │ 🏭  │  │ 🏭  │  │ 🏭  │        │
│  │F.9  │  │Mdl3 │  │Mega │        │
│  │x2.5 │  │x1.2 │  │x1.0 │        │
│  └─────┘  └─────┘  └─────┘        │
│                                     │
│  [UPGRADE]  [RESEARCH]  [BUILD]     │
│                                     │
├─────────────────────────────────────┤
│  🚀  🔋  🧠  🕳️  🧬  🛰️  ☀️      │  ← Company tabs
└─────────────────────────────────────┘
```

---

## 10. Tech Stack

(Unchanged from v1.0 — SvelteKit PWA, Cloudflare backend, IndexedDB saves)

### 10.1 File Structure Update

```
/src
  /engine
    GameLoop.ts, BigNumber.ts, SaveManager.ts, etc.
  /systems
    ProductionSystem.ts, PowerSystem.ts, SynergySystem.ts, etc.
  /divisions
    SpaceX.ts       (was ApexRocketry.ts)
    Tesla.ts        (was VoltMotors.ts)
    TeslaEnergy.ts  (was HeliosPower.ts)
    index.ts
  /ui
    /components, /screens, /animations
```

---

## 11. Monetization

(Unchanged from v1.0 — respect the player, no pay-to-win)

---

## 12. MVP Scope

### 12.1 MVP Goal
Playable vertical slice with **3 companies** (SpaceX, Tesla, Tesla Energy) and the power/bottleneck system. 2-4 hours to first prestige.

### 12.2 MVP Companies

1. **🚀 SpaceX** (Tiers 1-6) — The hook. Rockets are exciting. Falcon 1 → Mars Lander.
2. **🔋 Tesla** (Tiers 1-5) — Mass market appeal. Roadster → Model Y.
3. **☀️ Tesla Energy** (Tiers 1-6) — The foundation. Solar Panels → Megapack.

### 12.3 MVP Features

**Must Have:**
- [ ] Core idle loop (tap → earn → upgrade → automate)
- [ ] 3 playable companies with real names and milestones
- [ ] Division Chiefs (automation)
- [ ] Power system (Tesla Energy → powers SpaceX + Tesla)
- [ ] 3-5 bottlenecks per company
- [ ] Basic tech tree (15-20 nodes)
- [ ] 1 cross-company synergy (shared batteries)
- [ ] Offline progression
- [ ] Prestige system ("The Next Big Bet")
- [ ] Auto-save
- [ ] Mobile-responsive
- [ ] Tutorial (PayPal era)

---

## 13. Development Phases

### Phase 0: Foundation (2 weeks) — ✅ COMPLETE
### Phase 1: Core Loop (3 weeks) — ✅ COMPLETE
### Phase 2: Multi-Division (3 weeks) — ✅ IN PROGRESS (rebrand complete)
### Phase 3: Depth (3 weeks) — Research tree, prestige, full bottleneck system
### Phase 4: Polish & Launch (2 weeks) — MVP launch
### Phase 5: Expansion (Post-Launch) — xAI, Starlink, Boring Company, Neuralink
### Phase 6: End Game (Month 3-4) — Mars Colony, advanced prestige

---

## 14. Appendices

### A. Name Mapping (Old → New)

| Old (Fictional) | New (Real) |
|-----------------|------------|
| Frontier Industries | Being Elon |
| Apex Rocketry | SpaceX |
| Volt Motors | Tesla |
| Helios Power | Tesla Energy |
| Nexus AI | xAI |
| Underpass Co. | The Boring Company |
| Synapse Labs | Neuralink |
| Orbital Net | Starlink |

### B. Key Research Sources
See `RESEARCH_ELON.md` for comprehensive research on Elon Musk's vision, company histories, podcast insights, and synergy details.

---

*Last updated: 2026-02-08 — v2.0 "Being Elon" rebrand*
