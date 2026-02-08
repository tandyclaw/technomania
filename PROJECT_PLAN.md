# 🚀 TECHNOMANIA: Idle Tech Tycoon
## Project Plan — v1.0

> *"Build rockets. Train AI. Bore tunnels. Wire the planet. Colonize Mars. One tap at a time."*

---

## Table of Contents
1. [Game Concept](#1-game-concept)
2. [Fictional Universe](#2-fictional-universe)
3. [Core Mechanics](#3-core-mechanics)
4. [Company Verticals](#4-company-verticals)
5. [The Bottleneck System](#5-the-bottleneck-system)
6. [Tech Tree & Research](#6-tech-tree--research)
7. [Progression Loop](#7-progression-loop)
8. [Cross-Vertical Synergies](#8-cross-vertical-synergies)
9. [UI/UX & Art Style](#9-uiux--art-style)
10. [Tech Stack](#10-tech-stack)
11. [Monetization](#11-monetization)
12. [MVP Scope](#12-mvp-scope)
13. [Development Phases](#13-development-phases)
14. [Appendices](#14-appendices)

---

## 1. Game Concept

### Vision
**Technomania** is a web-based, mobile-optimized idle tycoon game where players build a tech empire spanning rockets, electric vehicles, AI, tunnels, brain implants, satellite internet, and clean energy. Unlike typical idle games with abstract businesses, every upgrade, bottleneck, and breakthrough is grounded in real engineering challenges.

Players start with a garage workshop and a dream. They'll manufacture their first rocket engine, experience "production hell" scaling their first EV factory, build GPU clusters to train AI, bore tunnels under cities, launch satellite constellations, and eventually colonize Mars — all while managing the very real constraints of power generation, supply chains, regulatory approval, and physics.

### What Makes It Different
- **Real Tech, Real Bottlenecks**: Heat shield tiles fall off. Battery yields crater during ramp. GPUs fail mid-training. These aren't random events — they're engineering realities players must solve.
- **Interconnected Empire**: Your rocket division launches satellites for your internet division. Your battery division powers your AI data centers. Your AI improves your self-driving cars. Everything connects.
- **Power Is The Meta-Game**: Every facility needs electricity. You decide: cheap natural gas (fast but polluting, public opinion penalty), solar + batteries (clean but intermittent), or go nuclear (expensive, slow to build, but game-changing).
- **Educational**: Players absorb real engineering knowledge through gameplay. Why IS it hard to make a reusable rocket? What's the actual bottleneck in battery production? The game teaches by making you solve these problems.

### Tone
Optimistic, slightly irreverent, deeply nerdy. Think Kerbal Space Program's sense of humor meets Adventure Capitalist's addictive loop. Pop-up tooltips explain the real science. Flavor text is witty. Failures are funny (your rocket didn't explode, it experienced "rapid unscheduled disassembly").

---

## 2. Fictional Universe

### The Company: **Frontier Industries**
You are the founder of **Frontier Industries**, a holding company with seven operating divisions. Each division is a game vertical inspired by a real tech company but with distinct fictional branding.

### Divisions (Fictional Names)

| Division | Inspired By | Fictional Name | Description |
|----------|-------------|----------------|-------------|
| Rockets & Space | SpaceX | **Apex Rocketry** | Reusable rockets, space launches, Mars missions |
| Electric Vehicles | Tesla (vehicles) | **Volt Motors** | EVs, gigafactories, autonomous driving |
| Artificial Intelligence | xAI | **Nexus AI** | GPU clusters, model training, chatbots |
| Tunnel Infrastructure | Boring Company | **Underpass Co.** | Tunnel boring machines, urban transit loops |
| Neural Interfaces | Neuralink | **Synapse Labs** | Brain-computer interfaces, neural implants |
| Satellite Internet | Starlink | **Orbital Net** | LEO satellite constellation, global internet |
| Energy & Solar | Tesla Energy | **Helios Power** | Solar, batteries, grid storage, virtual power plants |

### The Protagonist
The player character is **never named or gendered** — they're "The Founder." No face, no backstory beyond "you had a vision." The player IS the protagonist.

### The World
Set in a near-future Earth where these technologies are emerging. No sci-fi magic — everything is grounded. The game world has:
- **Regulators**: The fictional "Federal Technical Authority" (FTA) handles permits
- **Competitors**: Background AI opponents that set benchmark pressure
- **Public Opinion**: A reputation meter affected by your environmental choices, safety record, and product quality
- **Media Headlines**: Procedural news ticker that reacts to player actions

---

## 3. Core Mechanics

### 3.1 The Idle Loop

```
TAP/CLICK → EARN REVENUE → BUY UPGRADES → AUTOMATE → SCALE → HIT BOTTLENECK → RESEARCH → BREAKTHROUGH → BIGGER SCALE → PRESTIGE
```

**Phase 1 — Manual (First 5 minutes):**
Player taps to build individual products. First rocket engine assembled by hand. First EV rolls off a workbench. This teaches the core loop.

**Phase 2 — Automation (5-30 minutes):**
Hire "Division Chiefs" (equivalent to Adventure Capitalist's managers). They automate production. Player shifts from tapping to strategic decision-making.

**Phase 3 — Scaling (30 min - hours):**
Build factories, hire engineers, research upgrades. Production numbers go up. Revenue grows exponentially.

**Phase 4 — Bottlenecks (ongoing):**
Every vertical hits real-world bottlenecks. Can't build more rockets without more engine production. Can't make more engines without specialized metallurgy. Can't get metallurgy without rare earth minerals. Must solve each constraint through research, infrastructure, or cross-vertical synergy.

**Phase 5 — Prestige (hours - days):**
When growth plateaus, "IPO" your company for permanent bonuses and restart with new knowledge. Each prestige run unlocks deeper tech trees and new game mechanics.

### 3.2 Resources & Currencies

**Primary Currencies:**
| Currency | Symbol | How Earned | What It Buys |
|----------|--------|-----------|--------------|
| **Cash ($)** | 💰 | Revenue from all divisions | Buildings, staff, equipment |
| **Research Points (RP)** | 🔬 | R&D labs, scientists | Tech tree unlocks, upgrades |
| **Power (MW)** | ⚡ | Power plants, solar, nuclear | Operating all facilities |
| **Influence** | 🌟 | Public opinion, media, products | Regulatory approvals, contracts |

**Prestige Currencies:**
| Currency | Symbol | How Earned | What It Buys |
|----------|--------|-----------|--------------|
| **Founder's Vision** | 👁️ | IPO (prestige reset) | Permanent multipliers, new divisions |
| **Pioneer Tokens** | 🏆 | Achievements, milestones | Cosmetics, special upgrades |

**Division-Specific Resources:**
| Resource | Division | Description |
|----------|----------|-------------|
| Lithium, Nickel, Cobalt | Volt Motors / Helios Power | Battery raw materials |
| Steel, Titanium | Apex Rocketry | Rocket construction materials |
| GPUs, Compute Cycles | Nexus AI | Training resources |
| Concrete, TBM Parts | Underpass Co. | Tunnel construction |
| Biocompatible Materials | Synapse Labs | Implant manufacturing |
| Satellite Components | Orbital Net | Constellation building |

### 3.3 Automation Tiers

Each division has escalating automation:
1. **Manual**: Player taps to produce
2. **Crew Chief**: Automates basic production (slow)
3. **Division VP**: 2x speed, unlocks batch production
4. **Chief Engineer**: 5x speed, unlocks parallel lines
5. **AI Optimizer**: 10x speed, self-optimizing production
6. **Full Autonomy**: 50x speed, division runs perfectly offline

### 3.4 Offline Progression

- Game calculates earnings while away (up to 8 hours base, extendable)
- "Welcome back" screen shows what happened while away
- Chance of events occurring while offline (regulatory approval, supply shipment, equipment failure)
- Player can choose to "bank" offline time for a burst or let it auto-collect

---

## 4. Company Verticals

Each vertical is a self-contained progression track with 10-15 tiers of development, real bottlenecks, and connections to other verticals.

---

### 4.1 🚀 Apex Rocketry (Rockets & Space)

**Progression Tiers:**

| Tier | Name | Real-World Basis | Bottleneck |
|------|------|-----------------|------------|
| 1 | Hobby Rocket | Model rocketry | Cash |
| 2 | Sounding Rocket | Suborbital test vehicles | Propulsion research |
| 3 | Small-Sat Launcher | Electron-class rocket | Engine production rate |
| 4 | Medium Lifter | Falcon 9 analog | Reusability research |
| 5 | Reusable Booster | Falcon 9 landing | Landing software + legs/grid fins |
| 6 | Heavy Lifter | Falcon Heavy | Manufacturing throughput |
| 7 | Mega Rocket (Stage 1) | Starship analog | Raptor-class engine mass production |
| 8 | Heat Shield System | Starship TPS | Ceramic tile manufacturing + bonding |
| 9 | Mega Rocket (Full Stack) | Full Starship | Launch pad infrastructure |
| 10 | Booster Catch System | Mechazilla tower catch | Precision guidance software |
| 11 | Orbital Refueling | Propellant depot | Cryogenic transfer in microgravity |
| 12 | Moon Landing | Artemis HLS analog | Life support + landing systems |
| 13 | Mars Transit | Interplanetary mission | Radiation shielding + ISRU research |
| 14 | Mars Colony | Permanent settlement | EVERYTHING (power, food, habitat, ISRU) |
| 15 | Interplanetary Network | Multi-planet civilization | Massive infrastructure investment |

**Key Mechanics:**
- **Launch Cadence**: Measured in launches/month. Higher cadence = more revenue from satellite deployment contracts.
- **Reusability Score**: 0-100%. Higher = lower cost per launch. Research-driven.
- **Failure Risk**: Each launch has a success probability based on tech level and testing. Failed launches cost money and halt operations for investigation.
- **Engine Production Rate**: Engines/month bottleneck. Each engine requires specialized manufacturing.
- **Heat Shield Integrity**: Tile loss during reentry is probabilistic. Research reduces tile failure rate.

**Revenue Sources:**
- Government contracts (satellite launches)
- Commercial satellite deployment
- Space tourism (mid-game)
- Moon/Mars mission funding (late game)

---

### 4.2 🔋 Volt Motors (Electric Vehicles)

**Progression Tiers:**

| Tier | Name | Real-World Basis | Bottleneck |
|------|------|-----------------|------------|
| 1 | Garage EV | DIY conversion | Cash, basic parts |
| 2 | Sports EV | Tesla Roadster analog | Battery sourcing |
| 3 | Luxury Sedan | Model S analog | Production quality |
| 4 | Mass Market Sedan | Model 3 analog | Gigafactory construction |
| 5 | Mass Market SUV | Model Y analog | "Production Hell" event |
| 6 | 4680 Cell Line | Next-gen battery cell | Dry electrode manufacturing yields |
| 7 | Charging Network | Supercharger analog | Grid connections, locations |
| 8 | Pickup Truck | Cybertruck analog | Stainless steel manufacturing |
| 9 | Semi Truck | Tesla Semi analog | Battery pack size, charging speed |
| 10 | Basic ADAS | Autopilot-level | Camera/sensor suite, AI training data |
| 11 | Full Self-Driving | FSD analog | Edge case resolution, regulatory approval |
| 12 | Humanoid Robot | Optimus analog | Actuators, balance, AI |
| 13 | Robotaxi Fleet | Autonomous ride-hail | Fleet management, insurance, permits |
| 14 | Global Manufacturing | 5+ gigafactories | International permits, supply chains |
| 15 | EV Dominance | 20M+ vehicles/year | Market saturation, competition |

**Key Mechanics:**
- **Production Rate**: Vehicles/week. Limited by factory capacity and supply chain.
- **Battery Yield**: % of cells that meet spec. New cell chemistry starts at low yield, improves with R&D.
- **"Production Hell"**: Special event when scaling a new factory. Random cascading failures for 2-3 game days. Player must allocate engineers to fix issues. Can be shortened with research.
- **Supply Chain**: Must secure lithium, nickel, cobalt contracts. Can build own mines or buy on market (price fluctuates).
- **FSD Training**: Requires compute from Nexus AI division. More fleet miles = better AI. Classic chicken-and-egg.

**Revenue Sources:**
- Vehicle sales (primary)
- Charging network fees
- FSD subscription
- Robotaxi revenue (late game)
- Regulatory credits (sold to competitors)

---

### 4.3 🧠 Nexus AI (Artificial Intelligence)

**Progression Tiers:**

| Tier | Name | Real-World Basis | Bottleneck |
|------|------|-----------------|------------|
| 1 | ML Workstation | Single GPU setup | Cash for hardware |
| 2 | GPU Rack | 8-GPU server | Power, cooling |
| 3 | Training Cluster | 100-GPU cluster | Networking bandwidth |
| 4 | Small Language Model | GPT-2 scale | Training data quality |
| 5 | Medium Language Model | GPT-3 scale | Compute time, GPU memory |
| 6 | Data Center | 10K GPU facility | Power plant + cooling systems |
| 7 | Large Language Model | GPT-4 scale | GPU procurement, power |
| 8 | Mega Cluster | 100K GPU "Colossus" | Custom networking, liquid cooling |
| 9 | Frontier Model | State-of-art LLM | Data curation, alignment |
| 10 | Multimodal AI | Text + image + video | Training architecture research |
| 11 | Custom AI Chips | TPU/custom ASIC | Chip design, fab partnerships |
| 12 | AI Platform | Consumer chatbot | User acquisition, trust |
| 13 | Applied AI | Robotics, vehicles, science | Domain-specific training |
| 14 | AGI Research | Artificial General Intelligence | Fundamental research breakthroughs |
| 15 | Superintelligence | Beyond human-level | (End-game prestige unlock) |

**Key Mechanics:**
- **GPU Count**: Your total compute capacity. More GPUs = train larger models.
- **Power Draw**: GPUs are hungry. Each 1,000 GPUs needs ~1MW. Must be supplied by Helios Power or grid.
- **Cooling Efficiency**: Higher cooling = better GPU performance. Air → liquid → immersion cooling research path.
- **Training Runs**: Each model takes a set number of "compute cycles" to train. Larger models need exponentially more.
- **GPU Failure Rate**: At scale, 2-5% of GPUs fail during a training run. Better hardware → lower failure rate.
- **Model Quality Score**: Drives revenue from AI products. Higher = more users/subscribers.

**Revenue Sources:**
- AI API subscriptions (per-query pricing)
- Enterprise contracts
- Consumer chatbot subscriptions
- AI applied to other divisions (FSD, satellite management, energy trading)

---

### 4.4 🕳️ Underpass Co. (Tunnel Infrastructure)

**Progression Tiers:**

| Tier | Name | Real-World Basis | Bottleneck |
|------|------|-----------------|------------|
| 1 | Test Trench | Open-cut trench | Cash, permits |
| 2 | Used TBM | Refurbished boring machine | TBM acquisition |
| 3 | First Tunnel | Short test tunnel | Ground conditions, muck removal |
| 4 | TBM Mk2 | Improved boring machine | Engineering research |
| 5 | Convention Loop | LVCC Loop analog | Station construction, vehicles |
| 6 | City Loop Segment | Multi-station expansion | Municipal permits (SLOW) |
| 7 | Continuous Boring | Prufrock analog | Tunnel lining automation |
| 8 | Rapid Launch/Retrieve | "Porpoising" technique | TBM design breakthrough |
| 9 | Full City Network | 50+ mile system | Public transit authority coordination |
| 10 | Freight Tunnels | Underground logistics | Automation, cargo handling |
| 11 | Inter-City Tunnels | City-to-city connection | Massive excavation, geology |
| 12 | Hyperloop Research | Vacuum tube concept | Physics research, vacuum systems |
| 13 | Hyperloop Prototype | Short vacuum tunnel | Materials science, safety |
| 14 | Continental Network | Cross-country tunnels | Unprecedented infrastructure investment |

**Key Mechanics:**
- **Boring Speed**: Feet/day. The core metric. Improves with TBM upgrades.
- **Permitting Queue**: Each new tunnel segment requires permits. Takes real game-time. Can spend Influence to speed up.
- **Ground Conditions**: RNG element — sometimes you hit hard rock, water table, or utility conflicts. Must research solutions.
- **Muck Disposal**: Excavated material must go somewhere. Research recycling to turn it into construction material.
- **System Throughput**: Passengers/hour through loop. Limited by station design, vehicle count, speed.

**Revenue Sources:**
- Transit fares
- Municipal contracts
- Freight delivery fees
- Infrastructure licensing

---

### 4.5 🧬 Synapse Labs (Neural Interfaces)

**Progression Tiers:**

| Tier | Name | Real-World Basis | Bottleneck |
|------|------|-----------------|------------|
| 1 | EEG Headband | Non-invasive BCI | Basic neuroscience research |
| 2 | Research Electrodes | Utah array analog | Biocompatibility materials |
| 3 | Flexible Thread Array | Neuralink N1 analog | Microfabrication |
| 4 | Surgical Robot v1 | R1 robot analog | Precision engineering |
| 5 | Animal Trials | Pre-clinical testing | FDA-analog (FTA) approval queue |
| 6 | First Human Trial | IDE equivalent | Patient recruitment, safety monitoring |
| 7 | Neural Decoder v1 | Basic cursor control | Signal processing algorithms |
| 8 | Wireless Implant | Untethered device | Power management, data bandwidth |
| 9 | Expanded Trials | Multi-patient study | Manufacturing consistency |
| 10 | Motor BCI | Full movement restoration | Advanced neural decoding |
| 11 | Sensory Feedback | Bidirectional interface | Stimulation safety |
| 12 | Vision Restoration | Blindsight analog | Visual cortex mapping |
| 13 | Consumer BCI | Non-medical applications | Mass manufacturing, public acceptance |
| 14 | Neural Mesh | Whole-brain coverage | Materials science breakthrough |
| 15 | Cognitive Enhancement | Human-AI symbiosis | (End-game) |

**Key Mechanics:**
- **Electrode Count**: More electrodes = better signal. 16 → 256 → 1,024 → 4,096 progression.
- **Biocompatibility Score**: How well the body tolerates the implant. Degrades over time without research.
- **Regulatory Pipeline**: Multi-phase approval process that takes real game-time. Each phase requires clinical data.
- **Signal-to-Noise Ratio**: Key performance metric. Better materials and algorithms improve it.
- **Patient Outcomes**: Successful implants build Influence and unlock more trial participants.

**Revenue Sources:**
- Research grants (early)
- Medical device sales (mid)
- Insurance reimbursement (mid-late)
- Consumer BCI subscriptions (late game)

---

### 4.6 🛰️ Orbital Net (Satellite Internet)

**Progression Tiers:**

| Tier | Name | Real-World Basis | Bottleneck |
|------|------|-----------------|------------|
| 1 | Ground Station | Basic internet relay | Equipment + site |
| 2 | First Satellite | CubeSat-class | Apex Rocketry launch capability |
| 3 | Small Constellation | 10 satellites | Manufacturing throughput |
| 4 | User Terminal v1 | Basic dish | Phased array antenna design |
| 5 | Regional Coverage | 100 satellites | Ground station network |
| 6 | LEO Constellation | 500 satellites | Orbital management software |
| 7 | Laser Inter-Sat Links | Optical mesh network | Laser terminal miniaturization |
| 8 | Continental Coverage | 2,000 satellites | Spectrum licensing (FTA) |
| 9 | Global Coverage | 5,000 satellites | Scaling everything simultaneously |
| 10 | V2 Satellites | 4x bandwidth upgrade | Larger rockets needed (Apex Rocketry) |
| 11 | Direct-to-Cell | Phone-to-satellite | Antenna design, carrier partnerships |
| 12 | Military Contracts | Starshield analog | Security clearance, encrypted comms |
| 13 | Mega Constellation | 12,000+ satellites | Space debris management |
| 14 | Deep Space Network | Mars communication relay | Interplanetary communication |

**Key Mechanics:**
- **Satellite Count**: More satellites = better coverage and throughput. Launches come from Apex Rocketry.
- **Manufacturing Rate**: Satellites/day. Must build factory and supply chain.
- **Orbital Management**: As constellation grows, collision avoidance becomes critical. Software research required.
- **Subscriber Count**: Revenue driver. Limited by coverage area and bandwidth capacity.
- **Latency Score**: Lower = better. Improved by laser links and constellation density.

**Revenue Sources:**
- Consumer subscriptions
- Enterprise/marine/aviation contracts
- Government/military contracts
- Bandwidth resale

---

### 4.7 ☀️ Helios Power (Energy & Solar)

**Progression Tiers:**

| Tier | Name | Real-World Basis | Bottleneck |
|------|------|-----------------|------------|
| 1 | Rooftop Solar | Residential panels | Installer workforce |
| 2 | Home Battery | Powerwall analog | Battery cell supply |
| 3 | Commercial Solar | Business installations | Permitting, grid connection |
| 4 | Solar Shingle | Solar Roof analog | Glass tile manufacturing |
| 5 | Battery Factory | Megafactory analog | LFP cell production |
| 6 | Grid Storage Unit | Megapack analog | Utility contracts |
| 7 | Solar Farm | Utility-scale solar | Land acquisition, grid interconnect |
| 8 | Grid Storage Farm | 100+ Megapacks | Fire safety certification |
| 9 | Energy Trading AI | Autobidder analog | Market data, AI from Nexus division |
| 10 | Virtual Power Plant | Aggregated home batteries | Software platform, customer opt-in |
| 11 | Natural Gas Plant | Dispatchable backup | Emissions penalty, fast to build |
| 12 | Wind Farm | Additional renewable | Site selection, transmission |
| 13 | Geothermal Plant | Baseload clean energy | Deep drilling technology |
| 14 | Small Modular Reactor | SMR nuclear | NRC-analog approval (VERY slow) |
| 15 | Fusion Research | Holy grail | (End-game moonshot) |

**Key Mechanics:**
- **Power Output (MW)**: The core resource that ALL other divisions consume.
- **Grid Balance**: Must match generation to consumption. Solar has day/night cycle. Batteries smooth it.
- **Capacity Factor**: Solar ~25%, wind ~35%, nuclear ~90%, gas ~85%. Affects actual output vs nameplate.
- **Storage Duration**: Hours of backup power. More storage = more grid stability.
- **Public Opinion**: Clean energy boosts reputation. Gas/nuclear have trade-offs.

**Revenue Sources:**
- Residential solar installation
- Battery sales (home + grid)
- Energy trading profits
- Power sold to own divisions (internal transfer pricing)
- Utility contracts

**CRITICAL ROLE**: Helios Power is the **foundation division**. Every other division needs its output. This creates the game's central strategic tension — do you invest in more power to unlock other divisions, or push a specific division ahead and deal with power constraints later?

---

## 5. The Bottleneck System

This is the game's most innovative feature. Instead of simply "buy more for bigger numbers," players must solve real engineering problems.

### 5.1 Bottleneck Categories

**🔧 Engineering Bottlenecks:**
- Heat shield tile adhesion failure rate
- Battery cell dry electrode yield
- GPU failure rate during training
- TBM cutting head wear rate
- Electrode biocompatibility degradation
- Satellite antenna pointing precision

**⚡ Power Bottlenecks:**
- Total MW available vs total MW demanded
- Peak vs baseload mismatch
- Cooling power for data centers
- Cryogenic propellant production (LOX/LCH4 are energy-intensive)

**📦 Supply Chain Bottlenecks:**
- Lithium availability and price
- GPU allocation (competing with other AI companies)
- Stainless steel quality for rockets
- Rare earth elements for motors
- Semiconductor fab capacity

**📋 Regulatory Bottlenecks:**
- Launch licenses (per-launch approval)
- Spectrum licenses (for satellite comms)
- FDA-analog approval for neural implants
- Environmental impact reviews
- Municipal tunnel permits
- Nuclear plant licensing

**👥 Human Capital Bottlenecks:**
- Engineer hiring rate
- Specialized skill availability (rocket engineers, neurosurgeons, ML researchers)
- Training time for new hires
- Burnout and retention

### 5.2 Bottleneck Resolution

Each bottleneck can be resolved through one or more paths:

```
BOTTLENECK → [Research Path] → Permanent improvement
           → [Money Path]   → Temporary bypass (expensive)
           → [Synergy Path] → Another division helps
           → [Time Path]    → Just wait (slow)
```

**Example: "Production Hell" Bottleneck (Volt Motors)**
- *Research*: Invest RP in "Manufacturing Process Optimization" → reduces Production Hell duration by 50%
- *Money*: Hire consulting engineers ($$$) → reduces duration by 25%
- *Synergy*: Nexus AI develops factory optimization model → reduces future Production Hells by 30%
- *Time*: Just grind through it (1-3 game days)

### 5.3 Dynamic Bottleneck Scaling

As players scale, new bottlenecks emerge at predictable thresholds:

| Scale Level | Bottleneck Type | Example |
|-------------|----------------|---------|
| 1-10 units | Component quality | Engine reliability |
| 10-100 units | Production rate | Factory throughput |
| 100-1K units | Supply chain | Raw material sourcing |
| 1K-10K units | Infrastructure | Power, transportation |
| 10K-100K units | Regulatory | Permits, environmental |
| 100K+ units | Market/Demand | Customer acquisition |

---

## 6. Tech Tree & Research

### 6.1 Structure

The tech tree is organized as a **web** (not a linear tree), with nodes that branch, merge, and cross between divisions.

**Research Categories:**
- 🔴 **Materials Science**: Alloys, ceramics, polymers, composites
- 🔵 **Manufacturing**: Process engineering, automation, quality control
- 🟢 **Software & AI**: Algorithms, control systems, neural networks
- 🟡 **Energy**: Generation, storage, transmission, efficiency
- 🟣 **Biotech**: Biocompatibility, neural science, life support
- 🟠 **Aerospace**: Propulsion, orbital mechanics, thermal protection
- ⚪ **Infrastructure**: Construction, logistics, telecommunications

### 6.2 Sample Tech Tree Paths

**Rocket Reusability Path:**
```
Parachute Recovery → Propulsive Landing Research → Grid Fin Design → 
Landing Leg Engineering → Autonomous Barge → Precision Guidance Software → 
Propulsive Booster Landing → Tower Catch System → Rapid Turnaround
```

**Battery Evolution Path:**
```
Lead Acid → Lithium Cobalt Oxide → NMC Chemistry → NCA Chemistry → 
Cylindrical 2170 Cell → Tabless Electrode Design → 4680 Cell Format → 
Dry Electrode Coating → LFP for Storage → Solid State (Late Game) → 
Lithium-Sulfur (End Game)
```

**AI Scaling Path:**
```
Gradient Descent → Transformer Architecture → Attention Mechanism → 
Data Parallelism → Tensor Parallelism → Pipeline Parallelism → 
Mixed Precision Training → Flash Attention → Expert Parallelism (MoE) →
Custom Training Chips → Neuromorphic Compute (End Game)
```

**Neural Interface Path:**
```
Surface EEG → Microelectrode Array → Flexible Polymer Threads → 
Surgical Robot Precision → Wireless Power Transfer → 
Neural Signal Decoding → Bidirectional Stimulation → 
Whole-Brain Mapping → Cognitive Enhancement
```

### 6.3 Cross-Division Research

Some research nodes unlock benefits across multiple divisions:

| Research Node | Cost | Unlocks |
|--------------|------|---------|
| Advanced Metallurgy | 500 RP | Better rocket alloys + EV motor magnets |
| Thermal Management | 300 RP | GPU cooling + battery thermal + rocket thermal |
| Computer Vision | 400 RP | FSD driving + surgical robot + satellite inspection |
| Power Electronics | 350 RP | EV inverters + grid inverters + satellite power |
| Signal Processing | 250 RP | Neural decoding + satellite comms + radar |

---

## 7. Progression Loop

### 7.1 Early Game (First Session, 0-2 hours)

**What Happens:**
- Tutorial introduces Apex Rocketry and Helios Power
- Player builds first rocket engine (tap to assemble)
- Installs first solar panel (generates initial power)
- Launches first sounding rocket (small revenue)
- Unlocks Volt Motors division
- Builds first EV in a garage
- Hires first Division Chiefs (automation begins)

**Player Learns:**
- Tap to produce → earn money → buy upgrades → automate
- Power is needed for everything
- Research unlocks new capabilities

**Emotional Arc:** Excitement → understanding → first "aha" moment when automation kicks in

### 7.2 Mid Game (Days 1-7)

**What Happens:**
- All 7 divisions unlocked (last ones require specific milestones)
- Building first factories/facilities for each division
- "Production Hell" events start occurring
- Supply chain management becomes important
- Cross-division synergies begin appearing
- First regulatory bottlenecks (permits take real time)
- Power becomes THE bottleneck — player must choose energy strategy
- First prestige opportunity appears

**Player Learns:**
- Balancing investment across divisions
- Solving bottlenecks through research vs money vs time
- Cross-division synergies are powerful
- Power management is the meta-game

**Emotional Arc:** Growing competence → strategic depth → "just one more upgrade" → prestige temptation

### 7.3 Late Game (Weeks 2-4+)

**What Happens:**
- Multiple prestige cycles completed
- Deep tech tree exploration
- Mars colonization unlocked (mega-project requiring ALL divisions)
- Fusion research (end-game energy moonshot)
- AGI research (end-game AI moonshot)
- Cognitive Enhancement (end-game neural moonshot)
- Competing for leaderboard position
- Limited-time events and challenges

**Player Learns:**
- Long-term planning across prestige cycles
- Optimal prestige timing
- Min-maxing cross-division synergies

**Emotional Arc:** Mastery → big-picture strategy → chasing moonshots → "one more prestige run"

### 7.4 Prestige System: "The IPO"

When the player "IPOs" their company:
- **All divisions reset to zero** (buildings, production, revenue)
- **Retain**: Research unlocks, tech tree progress, blueprints
- **Earn**: "Founder's Vision" points based on total company value at IPO
- **Permanent Bonuses**: Each Vision point gives +X% to all revenue, production speed, research speed
- **New Unlocks**: Each prestige tier unlocks new game mechanics:
  - **IPO 1**: Unlock all 7 divisions from start, "Board of Directors" (global multiplier managers)
  - **IPO 2**: Unlock "Vertical Integration" (cross-division automated supply chains)
  - **IPO 3**: Unlock "Government Contracts" (large lucrative missions with deadlines)
  - **IPO 4**: Unlock "Mars Colony" expansion (new "world" like Adventure Capitalist's Moon)
  - **IPO 5+**: Increasingly powerful bonuses, cosmetic unlocks, leaderboard tiers

**Optimal Timing**: The game calculates "IPO readiness" — a meter showing projected Vision points. Players learn to IPO at the optimal moment (when growth rate flattens and projected Vision points plateau).

### 7.5 Mars Colony (Post-Prestige Expansion)

Unlocked after IPO 4, Mars Colony is a new "world" (like Adventure Capitalist's Moon/Mars) that:
- Requires ongoing support from Earth operations
- Has unique resources (Martian regolith, water ice, CO2)
- Features ISRU (In-Situ Resource Utilization) research tree
- Has no existing infrastructure — build everything from scratch
- Extreme bottlenecks: everything shipped from Earth or manufactured locally
- New division: "Frontier Colony" (habitat, life support, agriculture, terraforming)

---

## 8. Cross-Vertical Synergies

This is the game's **strategic depth layer** — the thing that keeps experienced players optimizing.

### 8.1 Synergy Map

```
                    ┌──────────────┐
            ┌──────→│  Orbital Net  │←───────┐
            │       │  (Satellites) │         │
            │       └──────┬───────┘         │
            │              │ Internet for     │
     Launches for     remote sites       Military
     satellites            │              contracts
            │              ▼                  │
     ┌──────┴──────┐  ┌───────────┐   ┌──────┴──────┐
     │    Apex     │  │  Underpass │   │   Nexus AI  │
     │  Rocketry   │  │    Co.    │   │   (AI/ML)   │
     └──────┬──────┘  └─────┬─────┘   └──────┬──────┘
            │               │                 │
      Mars missions    Tesla vehicles    FSD training
      need ISRU        in tunnels        data & compute
            │               │                 │
            ▼               ▼                 ▼
     ┌──────────────────────────────────────────────┐
     │              Volt Motors (EVs)                │
     │    Batteries ←→ Supply chain ←→ Manufacturing │
     └──────────────────────┬───────────────────────┘
                            │
                    Battery cells for
                    ALL energy storage
                            │
                            ▼
     ┌──────────────────────────────────────────────┐
     │           Helios Power (Energy)               │
     │     ⚡ POWERS EVERYTHING ⚡                    │
     └──────────────────────┬───────────────────────┘
                            │
                     Powers implant
                     manufacturing
                            │
                            ▼
                    ┌───────────────┐
                    │  Synapse Labs │
                    │   (Neural)    │
                    └───────────────┘
```

### 8.2 Synergy Bonuses (Examples)

| Source Division | Target Division | Synergy Effect |
|-----------------|-----------------|----------------|
| Apex Rocketry | Orbital Net | -30% satellite launch cost |
| Volt Motors | Underpass Co. | Free tunnel vehicles |
| Volt Motors | Helios Power | Shared battery cell supply chain |
| Nexus AI | Volt Motors | +20% FSD development speed |
| Nexus AI | Helios Power | +15% energy trading revenue |
| Nexus AI | Apex Rocketry | +10% landing precision |
| Nexus AI | Synapse Labs | +25% neural decoding accuracy |
| Helios Power | ALL | Powers all facilities |
| Orbital Net | ALL | +5% remote facility efficiency |
| Orbital Net | Apex Rocketry | Communication for Mars missions |
| Synapse Labs | Nexus AI | Neural architecture insights (+5% model quality) |
| Underpass Co. | Volt Motors | EV charging in tunnels |

### 8.3 Synergy Discovery

Synergies are **not shown upfront**. Players discover them by developing multiple divisions simultaneously. When a synergy activates, there's a satisfying notification:

> 🔗 **SYNERGY DISCOVERED!**
> *Nexus AI + Volt Motors*
> "Your AI division has begun training self-driving models on fleet data from Volt Motors vehicles."
> **+20% FSD Development Speed**

This encourages experimentation and balanced development across divisions.

---

## 9. UI/UX & Art Style

### 9.1 Art Style

**"Clean Industrial Futurism"**
- Flat design with subtle depth (soft shadows, slight gradients)
- Color palette: Dark navy/charcoal background, bright accent colors per division
- Division Colors:
  - 🚀 Apex Rocketry: **Rocket Red** (#FF4444)
  - 🔋 Volt Motors: **Electric Blue** (#4488FF)
  - 🧠 Nexus AI: **Neural Purple** (#9944FF)
  - 🕳️ Underpass Co.: **Tunnel Orange** (#FF8844)
  - 🧬 Synapse Labs: **Bio Green** (#44FF88)
  - 🛰️ Orbital Net: **Sky Cyan** (#44DDFF)
  - ☀️ Helios Power: **Solar Gold** (#FFCC44)

- Icons: Simple, geometric, recognizable at small sizes
- Animations: Satisfying micro-animations for production, launches, breakthroughs
- Numbers: Large, bold, with satisfying "rolling" animation as they increase
- Particles: Subtle particle effects for big milestones (confetti, sparks, etc.)

### 9.2 Layout (Mobile-First)

```
┌─────────────────────────────────────┐
│  💰 $1.23B  🔬 456  ⚡ 89/120 MW   │  ← Resource bar (always visible)
├─────────────────────────────────────┤
│                                     │
│     [ACTIVE DIVISION VIEW]          │  ← Main content area
│                                     │
│  ┌─────┐  ┌─────┐  ┌─────┐        │  ← Production units
│  │ 🏭  │  │ 🏭  │  │ 🏭  │        │     (tap to produce or
│  │Tier5│  │Tier3│  │Tier1│        │      view details)
│  │x2.5 │  │x1.2 │  │x1.0 │        │
│  └─────┘  └─────┘  └─────┘        │
│                                     │
│  [UPGRADE]  [RESEARCH]  [BUILD]     │  ← Action buttons
│                                     │
├─────────────────────────────────────┤
│  🚀  🔋  🧠  🕳️  🧬  🛰️  ☀️      │  ← Division tab bar
└─────────────────────────────────────┘
```

### 9.3 Key Screens

1. **Dashboard**: Overview of all 7 divisions, total revenue, power status
2. **Division View**: Deep dive into one division's production, upgrades, bottlenecks
3. **Tech Tree**: Visual web of research nodes (pinch to zoom on mobile)
4. **Power Grid**: Visual representation of power generation vs consumption
5. **Supply Chain**: Map showing material flows between divisions
6. **Prestige Screen**: IPO calculator, bonuses preview
7. **Mars Colony**: Separate world view (post-prestige)
8. **Events**: Limited-time challenges and rewards
9. **Settings**: Offline progression config, notifications, account

### 9.4 Accessibility
- All interactions work with one thumb on mobile
- Color-blind friendly palette (test with Coblis simulator)
- Font sizes adjustable
- Screen reader support for key information
- No flashing or rapid animations without user control

---

## 10. Tech Stack

### 10.1 Architecture Decision: PWA

**Progressive Web App** is the clear winner for this project:
- ✅ Single codebase for all platforms
- ✅ Works on iOS, Android, desktop browsers
- ✅ Installable on home screen (feels native)
- ✅ Offline support via Service Worker
- ✅ No app store fees (30% saved)
- ✅ Instant updates (no approval process)
- ✅ Shareable via URL
- ❌ No push notifications on iOS (but improving)
- ❌ Limited background execution

### 10.2 Frontend

| Technology | Choice | Rationale |
|-----------|--------|-----------|
| **Framework** | **SvelteKit** | Smallest bundle size, best perf for animations, compiler-based |
| **Rendering** | **Canvas 2D + DOM hybrid** | Canvas for animations/particles, DOM for UI controls |
| **State Management** | **Svelte Stores + IndexedDB** | Reactive state with persistent local storage |
| **Big Numbers** | **break_infinity.js** | Library for numbers up to 10^308 (standard idle game lib) |
| **Animations** | **GSAP** | Butter-smooth tweens for number rolling, transitions |
| **Offline** | **Service Worker + Workbox** | Cache-first strategy, background sync |

### 10.3 Backend

| Technology | Choice | Rationale |
|-----------|--------|-----------|
| **Server** | **Cloudflare Workers** | Edge computing, serverless, low latency globally |
| **Database** | **Cloudflare D1 (SQLite)** + **KV** | D1 for save data, KV for leaderboards/config |
| **Auth** | **Cloudflare Access** or simple JWT | Lightweight auth for save sync |
| **Real-time** | **Cloudflare Durable Objects** | For events, leaderboards, optional multiplayer |

### 10.4 Game Engine Layer

No full game engine needed. Build a lightweight idle game framework:

```
/src
  /engine
    GameLoop.ts          — requestAnimationFrame loop, offline calculation
    BigNumber.ts         — Wrapper around break_infinity.js
    SaveManager.ts       — Auto-save, cloud sync, import/export
    OfflineCalculator.ts — Calculate gains while away
    EventBus.ts          — Pub/sub for game events
  /systems
    ProductionSystem.ts  — Core production calculations
    ResearchSystem.ts    — Tech tree state and unlocks
    BottleneckSystem.ts  — Dynamic bottleneck detection and resolution
    PowerSystem.ts       — Power generation/consumption balance
    SupplyChainSystem.ts — Material flows between divisions
    SynergySystem.ts     — Cross-division bonus calculations
    PrestigeSystem.ts    — IPO calculations and permanent bonuses
  /divisions
    ApexRocketry.ts
    VoltMotors.ts
    NexusAI.ts
    UnderpassCo.ts
    SynapseLabs.ts
    OrbitalNet.ts
    HeliosPower.ts
  /ui
    /components           — Svelte components
    /screens              — Screen-level views
    /animations           — Canvas animation controllers
  /data
    tech-tree.json        — Full tech tree definition
    divisions.json        — Division configuration
    bottlenecks.json      — Bottleneck definitions
    synergies.json        — Synergy rules
    events.json           — Event templates
```

### 10.5 Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Bundle size (gzipped) | < 200KB |
| Frame rate | 60fps (animations) |
| Offline calculation | < 100ms for 8 hours |
| Battery impact | < 3% per hour active play |
| Memory usage | < 50MB |

### 10.6 Save System

- Auto-save every 30 seconds to IndexedDB
- Cloud sync on explicit action + periodic background sync
- Export/Import save as Base64 string
- Save file versioning for backwards compatibility
- Cheat detection (basic timestamp validation)

---

## 11. Monetization

### Philosophy
**Respect the player.** No pay-to-win. No artificial energy/stamina gates. No mandatory ads. Premium purchases should feel like "thanks for making a great game" not "I'm stuck without paying."

### 11.1 Revenue Model: Hybrid F2P + Premium

**Free Tier:**
- Full game, all content, no content locks
- Optional rewarded ads for small boosts
- Limited to 2 save slots

**Premium Pass ($4.99 one-time):**
- Remove all ads
- 2x offline progression cap (16 hours vs 8)
- 5 save slots
- Exclusive cosmetic theme ("Blueprint Mode" — technical drawing aesthetic)
- Priority cloud save sync

### 11.2 Optional IAP (In-App Purchases)

| Item | Price | Effect |
|------|-------|--------|
| **Time Warp (4h)** | $0.99 | Instantly gain 4 hours of production |
| **Time Warp (24h)** | $2.99 | Instantly gain 24 hours of production |
| **Research Boost (24h)** | $1.99 | 2x research speed for 24 hours |
| **Cosmetic Pack** | $2.99 | Division color themes, UI skins |
| **Founder's Pack** | $9.99 | Premium Pass + 3 time warps + cosmetic pack |

### 11.3 Rewarded Ads (Opt-in)

- Watch ad → 2x production for 30 minutes
- Watch ad → Instant 2-hour time skip
- Watch ad → Free tech tree respec (normally costs RP)
- Maximum 5 rewarded ads per day (prevent ad fatigue)

### 11.4 Revenue Projection (Conservative)

Assuming 100K MAU after 6 months:
- 5% premium conversion = 5,000 × $4.99 = $24,950
- 2% IAP spenders, avg $5/month = 2,000 × $5 = $10,000/month
- Ad revenue (CPM $5-15) = ~$5,000-15,000/month
- **Monthly revenue estimate: $40,000-50,000**

---

## 12. MVP Scope

### 12.1 MVP Goal
A playable vertical slice that demonstrates the core loop with **3 divisions** and the power/bottleneck system. Enough content for 2-4 hours of gameplay before first prestige.

### 12.2 MVP Divisions

1. **🚀 Apex Rocketry** (Tiers 1-6) — The hook. Rockets are exciting.
2. **🔋 Volt Motors** (Tiers 1-5) — Mass market appeal. Everyone knows EVs.
3. **☀️ Helios Power** (Tiers 1-6) — The foundation. Demonstrates power mechanic.

### 12.3 MVP Features

**Must Have (Launch Blocker):**
- [ ] Core idle loop (tap → earn → upgrade → automate)
- [ ] 3 playable divisions with 5-6 tiers each
- [ ] Division Chiefs (automation)
- [ ] Power system (generation vs consumption)
- [ ] 3-5 bottlenecks per division
- [ ] Basic tech tree (15-20 research nodes)
- [ ] 1 cross-division synergy (Helios → Apex power, Volt → shared batteries)
- [ ] Offline progression (calculate gains while away)
- [ ] Prestige system (1 IPO tier)
- [ ] Auto-save to IndexedDB
- [ ] Mobile-responsive UI
- [ ] Tutorial/onboarding (first 5 minutes guided)

**Should Have (Week 1 Update):**
- [ ] Sound effects and music toggle
- [ ] Achievement system (20 achievements)
- [ ] Statistics/analytics screen
- [ ] Cloud save sync
- [ ] PWA installation prompt

**Nice to Have (Post-MVP):**
- [ ] News ticker
- [ ] Detailed tech tree visualization
- [ ] Supply chain map
- [ ] Animations and particle effects
- [ ] Social sharing

### 12.4 MVP Data Model

```typescript
interface GameState {
  version: number;
  lastSaved: number;
  lastPlayed: number;
  
  // Currencies
  cash: BigNumber;
  researchPoints: BigNumber;
  influence: number;
  foundersVision: number; // prestige currency
  
  // Power
  powerGenerated: number; // MW
  powerConsumed: number;  // MW
  
  // Divisions
  divisions: {
    apex: DivisionState;
    volt: DivisionState;
    helios: DivisionState;
    // nexus, underpass, synapse, orbital added post-MVP
  };
  
  // Research
  unlockedResearch: string[];
  activeResearch: { id: string; progress: number } | null;
  
  // Prestige
  prestigeCount: number;
  totalValueEarned: BigNumber; // lifetime for prestige calc
  
  // Meta
  achievements: string[];
  stats: GameStats;
  settings: GameSettings;
}

interface DivisionState {
  unlocked: boolean;
  tiers: TierState[];
  chiefLevel: number; // 0 = no chief, 1-6 = automation tiers
  bottlenecks: BottleneckState[];
}

interface TierState {
  unlocked: boolean;
  count: number;        // how many of this tier owned
  level: number;        // upgrade level
  producing: boolean;   // is it currently producing
  progress: number;     // 0-1 production progress
}
```

---

## 13. Development Phases

### Phase 0: Foundation (2 weeks)
**Goal:** Project scaffolding, engine core, tooling

- [ ] SvelteKit project setup with TypeScript
- [ ] Game loop implementation (requestAnimationFrame + delta time)
- [ ] BigNumber integration and testing
- [ ] Save/Load system (IndexedDB)
- [ ] Offline calculation engine
- [ ] Event bus system
- [ ] Basic UI shell (resource bar, division tabs, content area)
- [ ] PWA manifest and service worker
- [ ] CI/CD pipeline (GitHub Actions → Cloudflare Pages)

### Phase 1: Core Loop (3 weeks)
**Goal:** One division (Helios Power) fully playable with core idle mechanics

- [ ] Production system (tap → earn → upgrade)
- [ ] Helios Power: Tiers 1-6 with balancing
- [ ] Division Chief hiring and automation
- [ ] Power generation/consumption system
- [ ] Basic upgrade system (multipliers)
- [ ] Number formatting (K, M, B, T, etc.)
- [ ] UI: Production view, upgrade buttons, progress bars
- [ ] Tutorial: First 5 minutes guided experience
- [ ] Playtesting and balance iteration

### Phase 2: Multi-Division (3 weeks)
**Goal:** 3 divisions with cross-division mechanics

- [ ] Apex Rocketry: Tiers 1-6
- [ ] Volt Motors: Tiers 1-5
- [ ] Division switching UI
- [ ] Power as shared resource (Helios → other divisions)
- [ ] Basic bottleneck system (3-5 per division)
- [ ] Bottleneck resolution mechanics
- [ ] First synergy: shared battery supply chain
- [ ] Dashboard overview screen
- [ ] Balance iteration with real players

### Phase 3: Depth (3 weeks)
**Goal:** Research tree, prestige, full bottleneck system

- [ ] Tech tree: 15-20 nodes with visual web
- [ ] Research point generation and spending
- [ ] Prestige system: "The IPO"
- [ ] Prestige bonuses and permanent progression
- [ ] Dynamic bottleneck scaling
- [ ] "Production Hell" event system
- [ ] Achievement system (20 achievements)
- [ ] Statistics tracking
- [ ] Sound effects (tap, ding, launch, etc.)
- [ ] Comprehensive balance pass

### Phase 4: Polish & Launch (2 weeks)
**Goal:** MVP launch-ready

- [ ] Onboarding flow polish
- [ ] UI animations (number rolling, transitions)
- [ ] Cloud save sync (Cloudflare backend)
- [ ] Mobile optimization pass (touch targets, performance)
- [ ] PWA install prompt
- [ ] Analytics integration (privacy-respecting: Plausible or self-hosted)
- [ ] Landing page
- [ ] Beta testing (50-100 players)
- [ ] Bug fixes and balance adjustments
- [ ] **LAUNCH MVP** 🚀

### Phase 5: Expansion (Post-Launch, ongoing)
**Goal:** Full game content

- [ ] Week 1-2: Nexus AI division (Tiers 1-8)
- [ ] Week 3-4: Orbital Net division (Tiers 1-8)
- [ ] Week 5-6: Underpass Co. division (Tiers 1-8)
- [ ] Week 7-8: Synapse Labs division (Tiers 1-8)
- [ ] Remaining tiers for MVP divisions (up to 15)
- [ ] Full tech tree (100+ nodes)
- [ ] All synergies activated
- [ ] Supply chain map visualization
- [ ] News ticker system
- [ ] Limited-time events framework
- [ ] Leaderboards
- [ ] Monetization implementation (Premium Pass, IAP)

### Phase 6: End Game (Month 3-4)
**Goal:** Deep end-game content

- [ ] Mars Colony expansion
- [ ] Advanced prestige tiers (IPO 2-5+)
- [ ] Government Contracts system
- [ ] Vertical Integration automation
- [ ] Board of Directors (global managers)
- [ ] Seasonal events
- [ ] Community features
- [ ] Analytics-driven balance updates

---

## 14. Appendices

### A. Competitive Analysis

| Game | Strengths | Weaknesses | What We Take |
|------|-----------|-----------|-------------|
| Adventure Capitalist | Perfect idle loop, satisfying numbers | No depth, repetitive | Core idle mechanics |
| Cell to Singularity | Science theme, educational | Linear progression | Real-world tech as content |
| Factory Idle | Spatial factory building | Complex UI | Production line visualization |
| Idle Miner Tycoon | Clear progression, good managers | Pay-to-win tendencies | Manager automation tiers |
| Egg Inc. | Brilliant prestige, contracts | Narrow theme | Prestige system design |
| Realm Grinder | Deep prestige layers | Overwhelming complexity | Multi-layer prestige for hardcore |

### B. Key Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| Balancing 7 divisions is extremely hard | High | High | Start with 3, iterate with data |
| Scope creep | High | High | Strict MVP, weekly scope review |
| Power mechanic too constraining | Medium | Medium | Tunable parameters, generous early game |
| Real tech too educational, not fun | Medium | Low | Fun first, education as bonus |
| Performance on low-end mobile | High | Medium | Performance budget from day 1 |
| Player retention after initial novelty | High | Medium | Deep prestige system, events |

### C. Name Alternatives Considered

For the overall game:
- ~~Technomania~~ → **Technomania** ✅ (energetic, memorable, available)
- Tech Empire Idle
- Frontier: Idle Tycoon
- LaunchPad Idle
- Venture Capital: Idle

For divisions, all names avoid real trademarks:
- Apex Rocketry (not SpaceX — "apex" suggests pinnacle)
- Volt Motors (not Tesla — "volt" is generic electrical unit)
- Nexus AI (not xAI — "nexus" means connection point)
- Underpass Co. (not Boring — "underpass" is descriptive)
- Synapse Labs (not Neuralink — "synapse" is neuroscience term)
- Orbital Net (not Starlink — "orbital" is descriptive)
- Helios Power (not Tesla Energy — "helios" is Greek sun god)

### D. Inspirational Quotes for Loading Screens

> "The first step is to establish that something is possible; then probability will occur." — flavor text for Research system
>
> "Failure is an option here. If things are not failing, you are not innovating enough." — flavor text for bottleneck system
>
> "When something is important enough, you do it even if the odds are not in your favor." — flavor text for prestige system
>
> "I think it's possible for ordinary people to choose to be extraordinary." — flavor text for first launch

*(Note: These would be paraphrased/attributed to "The Founder" in-game to avoid IP issues)*

### E. Estimated Timeline Summary

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Phase 0: Foundation | 2 weeks | Scaffolding, engine, tooling |
| Phase 1: Core Loop | 3 weeks | 1 playable division |
| Phase 2: Multi-Division | 3 weeks | 3 divisions, cross-mechanics |
| Phase 3: Depth | 3 weeks | Research, prestige, bottlenecks |
| Phase 4: Polish & Launch | 2 weeks | **MVP LAUNCH** |
| Phase 5: Expansion | 8 weeks | All 7 divisions, full features |
| Phase 6: End Game | 8 weeks | Mars, events, community |
| **Total to MVP** | **13 weeks** | |
| **Total to Full Game** | **29 weeks** | |

---

## Ready to Build 🚀

This game sits at the intersection of **addictive idle mechanics** and **real engineering education**. Every tap teaches something real. Every bottleneck mirrors an actual challenge. Every prestige run makes you a better tech tycoon.

The key insight: **real tech is more interesting than fiction**. The actual reason it's hard to build reusable rockets is more fascinating than any made-up obstacle. The real supply chain for lithium batteries is more complex than any game designer would invent. We just need to make it *feel* like a game.

Let's build it.

---

*Document version: 1.0*
*Created: February 8, 2026*
*Author: Tandyclaw, Frontier Industries Chief Architect*
