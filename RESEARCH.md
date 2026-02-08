# Tech Tycoon — Research Notes

## Table of Contents
1. [Company Analysis & Bottlenecks](#company-analysis--bottlenecks)
2. [Power & Energy Infrastructure](#power--energy-infrastructure)
3. [Supply Chain Deep Dive](#supply-chain-deep-dive)
4. [Regulatory & Permitting Landscape](#regulatory--permitting-landscape)
5. [Idle/Tycoon Game Mechanics Research](#idletycoon-game-mechanics-research)

---

## Company Analysis & Bottlenecks

### 1. SpaceX — Rocket Manufacturing & Space Operations

**Real Products & Programs:**
- Falcon 9 (workhorse reusable rocket, ~100 launches/year)
- Falcon Heavy (heavy-lift variant)
- Starship/Super Heavy (next-gen super heavy-lift, fully reusable, 121m tall, 5,000 tonnes)
- Dragon capsule (crew & cargo to ISS)

**Key Technical Bottlenecks:**

*Raptor Engine Production:*
- Each Super Heavy booster uses 33 Raptor engines; each Starship upper stage uses 6
- Raptor 2 uses full-flow staged combustion (most complex engine cycle ever mass-produced)
- Chamber pressure ~300 bar — highest of any operational rocket engine
- Manufacturing involves 3D-printed components, complex turbomachinery
- Engine production rate was a major bottleneck — needed ~1 engine/day for planned cadence
- Metallurgy challenges: oxygen-rich preburner runs at extreme temps, requires nickel superalloys

*Heat Shield Tiles:*
- Starship uses ~18,000 hexagonal ceramic heat shield tiles
- Tiles are individually shaped and bonded to stainless steel hull
- Tile loss during flight test was a critical failure mode (IFT-2 through IFT-4 had tile issues)
- Each tile must withstand ~1,400°C during reentry
- Bonding tiles to flexing stainless steel is a major manufacturing challenge
- SpaceX moved from individual tile bonding to larger tile panels to improve reliability

*Starship Development Iterations:*
- Block 1: 15t to LEO, first 6 flights (4 successes, 2 failures)
- Block 2: 35t to LEO, 5 flights (2 successes, 3 failures as of Oct 2025)
- Block 3: 100t to LEO (in development)
- Block 4: 200t to LEO (planned)
- Each block requires significant manufacturing tooling changes

*Launch Infrastructure:*
- "Mechazilla" tower catch system — giant chopstick arms catch returning booster
- Orbital Launch Pad requires massive flame deflector and water deluge system
- OLP-1 destroyed during IFT-1, rebuilt with improved design
- OLP-2 under construction, plus LC-39A and SLC-37 sites
- Launch cadence limited by pad turnaround time and FAA licensing

*Orbital Refueling:*
- Mars missions require 6-10 tanker flights to refuel a single Starship in orbit
- Cryogenic propellant transfer in microgravity is unsolved at scale
- Boil-off management of liquid methane and LOX in space
- Propellant depot design — long-term storage of cryogens in orbit

*FAA Regulatory:*
- Each flight requires FAA launch license
- Environmental reviews (NEPA) can take months-years
- Mishap investigations ground the vehicle after failures
- Range scheduling at Cape Canaveral / Vandenberg is a shared resource

*Mars Colonization Challenges:*
- 6-9 month transit time, launch windows every 26 months
- ISRU (In-Situ Resource Utilization) — making propellant on Mars from CO2 + water ice
- Sabatier reaction: CO2 + 4H2 → CH4 + 2H2O (need hydrogen or water)
- Radiation shielding during transit and on surface
- Life support systems for 100+ people
- Landing on Mars with thin atmosphere (1% of Earth's)

**Game Translation: Each bottleneck becomes a progression gate. Player builds rockets → needs engines → needs metallurgy research → needs production lines → needs launch pads → needs FAA approval → needs orbital refueling → unlocks Mars.**

---

### 2. Tesla — Electric Vehicles & Manufacturing

**Real Products:**
- Model 3/Y (mass market), Model S/X (premium), Cybertruck, Semi
- FSD (Full Self-Driving) software
- Gigafactories: Nevada, Shanghai, Berlin, Texas, planned Mexico

**Key Technical Bottlenecks:**

*Battery Supply Chain:*
- Lithium: Primary sources are brine (Chile, Argentina, Australia) and hard rock (Australia)
  - Brine extraction takes 12-18 months of evaporation
  - Direct Lithium Extraction (DLE) is emerging but unproven at scale
- Nickel: High-purity Class 1 nickel needed, mostly from Indonesia, Russia, Canada
  - Processing is energy-intensive and polluting (HPAL processing)
- Cobalt: Primarily from DRC (ethical/supply concerns), moving toward low-cobalt chemistries
- Manganese: Needed for NMC and NMCA chemistries
- Graphite: Anode material, mostly from China, synthetic graphite is expensive

*Battery Cell Manufacturing:*
- 4680 cells (46mm diameter, 80mm length) — Tesla's next-gen cylindrical cell
- Dry electrode coating process — eliminates toxic solvents, but extremely hard to scale
- Ramp was years behind schedule; yields were low initially
- Tab-less design (shingled electrode) improves thermal performance but adds complexity
- Cell-to-pack architecture eliminates modules, improves energy density
- LFP (Lithium Iron Phosphate) used for standard range — cheaper but lower energy density

*Gigafactory Scaling:*
- Each gigafactory costs $5-10B+ and takes 2-3 years to build
- Machine calibration and production ramp takes additional 6-18 months
- "Production hell" — Tesla's term for the painful ramp from prototype to mass production
- Giga Berlin faced 2+ years of permitting delays in Germany
- Giga Mexico announced but construction delayed by political uncertainty

*Full Self-Driving:*
- Camera-only approach (removed radar, then ultrasonic sensors)
- Massive neural network training on fleet data (millions of miles)
- Edge cases in driving are essentially infinite
- Regulatory approval varies by jurisdiction
- Compute requirements for training: massive GPU clusters
- FSD has been "almost ready" since 2016 — classic overestimation of timeline

*Charging Infrastructure:*
- Supercharger network: 7,791 stations globally (as of 2025)
- V3 Superchargers: 250kW, V4: up to 350kW
- Grid connection for each station requires utility coordination
- Peak demand management and battery buffering at stations
- Opening network to non-Tesla vehicles (NACS standard adoption)

**Game Translation: Player starts with small EV production → needs battery cells → needs to source lithium → builds gigafactory → ramps production → hits "production hell" → needs charging network → develops FSD.**

---

### 3. xAI — Artificial Intelligence

**Real Products:**
- Grok chatbot (integrated into X/Twitter)
- Aurora (text-to-image model)
- Colossus supercomputer cluster (Memphis, TN)
- Acquired X Corp (Twitter) in March 2025

**Key Technical Bottlenecks:**

*GPU Clusters & Compute:*
- Colossus cluster: reportedly 100,000+ Nvidia H100 GPUs
- Each H100 draws ~700W, so 100K GPUs = ~70MW just for GPUs
- Total data center power including cooling, networking: ~150-200MW
- GPU procurement is a bottleneck — Nvidia allocation competition
- Networking: InfiniBand or custom Ethernet at 400Gbps+ between GPUs
- GPU failure rate at scale: ~2-5% of GPUs fail per training run
- Training a frontier model takes weeks-months even with massive clusters

*Data Center Infrastructure:*
- Memphis Colossus built in record time (~122 days for initial buildout)
- Power: xAI reportedly negotiated with Memphis Light, Gas & Water
- Cooling: Direct liquid cooling (DLC) for GPU racks, plus facility-level cooling
- PUE (Power Usage Effectiveness): Industry standard ~1.3, best-in-class ~1.1
- Backup power: Diesel generators, UPS systems
- Network backhaul: High-bandwidth fiber connections

*Training Bottlenecks:*
- Data quality and curation is as important as compute
- Tokenization, data preprocessing pipelines
- Distributed training across thousands of GPUs requires sophisticated parallelism
  - Data parallelism, tensor parallelism, pipeline parallelism, expert parallelism
- Checkpoint saving: Terabytes of model state must be saved regularly
- Learning rate scheduling, hyperparameter tuning
- Evaluation and safety testing

*Power Consumption:*
- AI data centers are projected to consume 8-12% of US electricity by 2030
- New nuclear/gas plants being built specifically for AI data centers
- SMR (Small Modular Reactors) are proposed but not yet operational
- Natural gas turbines are fastest to deploy but have emissions
- Grid constraints in many regions limit new data center construction

**Game Translation: Player starts training small models → needs GPUs → builds data center → needs power plant → scales to larger models → hits GPU supply bottleneck → needs custom chips → eventually builds AGI research lab.**

---

### 4. The Boring Company — Tunnel Infrastructure

**Real Products:**
- Prufrock TBM (Tunnel Boring Machine)
- Vegas Loop (operational system at LVCC, expanding to 68 miles)
- Electric vehicle transport through tunnels

**Key Technical Bottlenecks:**

*Tunnel Boring Speed:*
- Conventional TBMs: ~300-400 feet per day in soft ground
- Boring Company claims goal of 1 mile/week (7,500 ft/week = ~1,000 ft/day)
- Prufrock designed for continuous boring (no stopping to install tunnel lining segments)
- "Porpoising" — launching and retrieving TBM from surface without a large pit
- Current actual speeds likely 200-600 feet per day
- Ground conditions vary hugely: rock, sand, clay, water table all affect speed

*TBM Design & Manufacturing:*
- Prufrock 1, 2, 3 iterations — each improving on speed and automation
- Smaller diameter tunnels (12-14 ft) vs traditional subway tunnels (20+ ft)
- Smaller = cheaper, faster, but limits vehicle size
- TBM cutting head wear and replacement
- Muck removal (excavated material) — conveyors, rail cars, slurry pumps
- Tunnel lining: precast concrete segments vs continuous concrete pour

*Permitting & Regulation:*
- Each city/state has different tunnel permitting requirements
- Environmental impact assessments
- Utility conflicts (gas, water, sewer, electrical, telecom lines)
- Property rights and easements for underground routes
- Many announced projects (Chicago, LA, Baltimore, DC) went inactive
- Only Las Vegas has operational commercial system

*Loop System:*
- Currently uses Tesla vehicles with human drivers in tunnels
- Self-driving in tunnels began trial in Nov 2025
- Throughput limited: ~4,400 passengers/hour vs subway ~30,000/hour
- Station design and spacing affects system capacity
- No emergency ventilation system like traditional subway
- Criticized as less efficient than conventional transit

**Game Translation: Player gets first TBM → bores test tunnel → needs permits → builds stations → scales to city network → researches faster TBM → eventually hyperloop concept.**

---

### 5. Neuralink — Brain-Computer Interfaces

**Real Products:**
- N1 implant ("Telepathy") — 1,024 electrodes, coin-sized
- Blindsight — visual cortex implant for blind individuals (FDA breakthrough status)
- R1 surgical robot — places electrodes with micron precision
- BCI Link software

**Key Technical Bottlenecks:**

*FDA Regulatory Pathway:*
- IDE (Investigational Device Exemption) required for human trials
- First human implant: January 2024 (Noland Arbaugh)
- Canada trials began August 2025 (Toronto)
- Phased clinical trials: safety → efficacy → broader population
- Each phase takes 1-3 years minimum
- Post-market surveillance requirements
- Class III medical device — highest scrutiny level

*Biocompatibility:*
- Brain tissue is extremely sensitive to foreign materials
- Immune response (gliosis) forms scar tissue around electrodes
- Electrode degradation over time reduces signal quality
- Materials: platinum-iridium electrodes, parylene-C insulation, titanium housing
- Battery charging through skull via inductive coupling
- Infection risk at implant site
- Long-term stability: need 10+ year device lifetime

*Surgical Robot Precision:*
- R1 robot must place 64 threads (1,024 electrodes) into brain cortex
- Each thread is 4-6 μm wide (thinner than human hair)
- Must avoid blood vessels visible on cortex surface
- Surgery currently takes several hours
- Goal: reduce to under 1 hour for scalability
- Needle must penetrate 1-3mm into cortex without going deeper

*Electrode Longevity:*
- Signal-to-noise ratio degrades over months
- Some electrodes stop recording (Arbaugh's implant had thread retraction issues)
- Wireless data transmission bandwidth: currently ~200 Mbps
- Decoding algorithms must adapt as electrode signals change
- Battery life and charging cycles

*Data Processing:*
- Real-time neural decoding requires specialized chips
- On-implant processing vs wireless to external device
- Latency requirements for cursor control: <50ms
- Training the decoder to each individual brain's patterns
- BCI calibration sessions needed regularly

**Game Translation: Player starts with basic electrode arrays → needs biocompatible materials → builds surgical robot → gets FDA approval → first human trial → improves signal processing → scales to consumer BCI.**

---

### 6. Starlink — Satellite Internet Constellation

**Real Products:**
- 9,422+ satellites in LEO as of Jan 2026
- V2 mini satellites (~740 kg) and planned V2 (~1,250 kg)
- User terminals (dishes) — "Dishy McFlatface"
- Ground stations and PoPs (Points of Presence)
- Starshield (military variant)

**Key Technical Bottlenecks:**

*Satellite Manufacturing:*
- Must produce satellites at automotive scale (6 per day at peak)
- Redmond, WA facility handles R&D and manufacturing
- Each satellite has: phased array antennas (Ku/Ka/E-band), Hall-effect thrusters, solar panels, processors
- Component supply chain: radiation-hardened electronics, solar cells, propellant
- Quality control at volume — can't service satellites once launched

*Constellation Management:*
- Orbital mechanics: maintaining precise orbital planes and spacing
- Satellite deorbit and replacement (5-7 year lifespan per satellite)
- Collision avoidance with space debris and other operators
- ITU coordination for radio frequencies
- Currently 65% of ALL active satellites are Starlink

*Laser Inter-Satellite Links:*
- Optical laser links between satellites allow mesh networking in space
- Eliminates need for ground stations on every hop
- Reduces latency for intercontinental routing
- Each satellite needs 4-5 laser terminals pointing at neighbors
- Atmospheric interference, pointing precision requirements
- Enables service over oceans and poles without ground stations

*Ground Infrastructure:*
- Ground stations ("gateways") connect constellation to internet backbone
- Each gateway serves a region; needs fiber backhaul
- User terminals: phased array antennas, ~$500 manufacturing cost
- Terminal self-heats to melt snow (power consumption issue)
- Regulatory approval needed in each country for spectrum and operation

*Bandwidth & Capacity:*
- 9 million subscribers as of Dec 2025
- Congestion in dense urban areas — LEO satellites have limited spot beams
- V2 satellites have 4x the bandwidth of V1.5
- Spectrum allocation: Ku-band (12-18 GHz), Ka-band (26-40 GHz), E-band
- Latency: 20-40ms (much better than GEO satellites at 600ms)
- Backhaul capacity limits per ground station

**Game Translation: Player launches first satellite → scales to constellation → builds ground stations → adds laser links → manages orbital mechanics → expands to military contracts → plans mega-constellation.**

---

### 7. Tesla Energy / Solar

**Real Products:**
- Solar panels (third-party manufactured)
- Solar Roof (solar shingles — proprietary)
- Powerwall (home battery, 13.5 kWh)
- Megapack (utility-scale, 3.9 MWh per unit, new Megapack 3 at 5 MWh)
- Megablock (4x Megapack 3 = 20 MWh, announced Sept 2025)
- Autobidder (AI energy trading software)
- Virtual Power Plant (VPP) software

**Key Technical Bottlenecks:**

*Solar Roof Installation:*
- Each Solar Roof is custom-designed for the home's roof geometry
- Installation takes 1-2 weeks (vs hours for traditional solar panels)
- Requires skilled installers — labor bottleneck
- Weatherproofing integration with roofing
- Glass tile manufacturing at scale
- Cost: $40-70K for average home (much more than panels)
- Delayed rollout, with many customer complaints about wait times

*Megapack Production:*
- Lathrop, CA "Megafactory" — dedicated Megapack production
- Target: 40 GWh/year capacity when complete
- Shanghai Megafactory started production late 2024
- Houston facility announced for Megapack 3/Megablock
- Battery cell supply is the bottleneck — depends on CATL, LG Energy
- LFP chemistry (Lithium Iron Phosphate) preferred for stationary storage

*Grid-Scale Storage:*
- Utility interconnection process takes 3-5 years in many markets
- Grid interconnection queue in US has 2,600+ GW backlog
- Permitting and environmental review
- Fire safety concerns (lithium battery thermal runaway)
- Each Megapack installation needs transformer, switchgear, grid tie
- Revenue model: energy arbitrage, frequency regulation, capacity market

*Virtual Power Plant:*
- Aggregating thousands of Powerwalls into a coordinated grid resource
- Real-time coordination and dispatch
- Customer opt-in and compensation model
- Grid operator integration (varies by utility and ISO/RTO)
- Autobidder: AI-powered energy trading in wholesale markets

**Game Translation: Player installs first solar panel → manufactures Powerwalls → builds Megapack factory → deploys grid storage → creates VPP network → uses Autobidder for energy trading → builds toward 100% renewable grid.**

---

### 8. Other Ventures

**X (Twitter) — Social Media/Platform:**
- Acquired by Musk Oct 2022 for $44B
- Merged with xAI in March 2025 (valued at $33B in deal)
- Revenue decline post-acquisition (advertiser exodus)
- Engineering: recommendation algorithms, content moderation, payments
- X Premium subscriptions, creator monetization
- Platform infrastructure: serving billions of requests/day

**OpenAI (Historical):**
- Musk co-founded OpenAI in 2015, departed board in 2018
- Sued OpenAI in 2024 over mission drift from nonprofit to profit
- xAI bid $97.4B to acquire OpenAI in Feb 2025
- Competitive dynamic drives xAI's Grok development

**Optimus (Tesla Bot):**
- Humanoid robot using Tesla's FSD AI/computer vision
- Actuators, balance, manipulation are hard problems
- Battery life for mobile humanoid form factor
- Manufacturing cost target: ~$20,000
- Applications: factory work, home assistance, dangerous environments

**Game Translation: Social media platform becomes an "influence/propaganda" game mechanic. Robot manufacturing is a late-game automation unlock.**

---

## Power & Energy Infrastructure

Power is the meta-resource that connects ALL verticals. This should be the central bottleneck system.

### Power Generation Options:
| Source | Cost ($/MWh) | Build Time | Availability | Emissions | Game Role |
|--------|-------------|------------|--------------|-----------|-----------|
| Natural Gas | $40-60 | 2-3 years | 24/7 dispatchable | High CO2 | Early game, fast to build |
| Solar Farm | $25-40 | 1-2 years | Daytime only | None | Mid game, needs storage |
| Wind Farm | $25-50 | 2-3 years | Variable | None | Mid game, needs storage |
| Nuclear (Traditional) | $80-120 | 10-15 years | 24/7 baseload | None (waste) | Late game, expensive but reliable |
| SMR (Small Modular) | $60-90 | 5-7 years | 24/7 baseload | None (waste) | Late game tech unlock |
| Geothermal | $40-80 | 3-5 years | 24/7 baseload | Minimal | Mid-late game, location-dependent |
| Fusion | ??? | 20+ years | Theoretical 24/7 | None | End game moonshot |

### Power Demand by Vertical:
- **Rocket Factory**: ~50-100 MW (welding, machining, cryogenic propellant production)
- **EV Gigafactory**: ~100-300 MW (cell manufacturing, assembly, HVAC)
- **AI Data Center**: ~150-500 MW (GPUs, cooling, networking)
- **Tunnel Boring**: ~5-20 MW per TBM (cutting head, conveyors, ventilation)
- **Satellite Factory**: ~10-30 MW (clean rooms, testing, integration)
- **Battery Factory**: ~50-200 MW (electrode coating, formation cycling)
- **Solar Roof Factory**: ~20-50 MW

### Grid Constraints:
- US power grid is fragmented into ISOs/RTOs
- Interconnection queue has 2,600+ GW of projects waiting
- Transmission capacity is a bottleneck in many regions
- NIMBY opposition to new transmission lines
- Duck curve: solar overproduction during day, shortage at evening peak

---

## Supply Chain Deep Dive

### Critical Materials:
| Material | Primary Source | Bottleneck | Used By |
|----------|---------------|-----------|---------|
| Lithium | Australia, Chile, Argentina | Extraction & refining capacity | Batteries (EV + storage) |
| Nickel | Indonesia, Philippines, Russia | High-purity refining, environmental cost | NMC battery cathodes |
| Cobalt | DRC (70% global supply) | Ethical sourcing, single-country risk | NMC/NCA cathodes |
| Silicon | China (95%+ polysilicon) | Geopolitical supply risk | Solar cells |
| Gallium | China (80%+ supply) | Export restrictions possible | Semiconductors, LEDs |
| Rare Earths | China (60%+ processing) | Processing capacity, environmental cost | EV motors, rocket guidance |
| Stainless Steel | Global | Quality consistency for rocket-grade | Starship construction |
| Carbon Fiber | Japan, US | Expensive, limited production | Payload fairings, aero |
| Platinum Group | South Africa, Russia | Mining limited, geopolitical risk | Electrodes, catalysts |
| Copper | Chile, Peru, DRC | Increasing demand from electrification | Everything electrical |

### Manufacturing Dependencies:
- **TSMC/Samsung/Intel**: Semiconductor fabrication for all electronics
- **Nvidia**: GPU supply for AI training (H100, B200, etc.)
- **CATL/LG/Panasonic**: Battery cell supply
- **Corning/AGC**: Specialty glass for solar and satellite optics

---

## Regulatory & Permitting Landscape

### Key Regulatory Bodies (Game Mechanics):
- **FAA** (Federal Aviation Administration) — Launch licenses, airspace
- **FCC** (Federal Communications Commission) — Spectrum, satellite licensing
- **FDA** (Food and Drug Administration) — Medical device approval
- **EPA** (Environmental Protection Agency) — Environmental impact
- **DOE** (Department of Energy) — Nuclear licensing, energy policy
- **NRC** (Nuclear Regulatory Commission) — Nuclear plant licensing
- **State/Local** — Building permits, zoning, environmental reviews

### Permitting Timeline (Real World):
- FAA launch license: 3-12 months
- FCC satellite license: 6-24 months
- FDA IDE (device trial): 6-12 months for approval to begin trials
- FDA PMA (full approval): 2-5 years after trial data
- Nuclear plant license (NRC): 5-10 years
- Environmental Impact Statement: 1-3 years
- Municipal building permit: 1-6 months
- Gigafactory full permitting: 1-3 years (varies wildly by jurisdiction)

---

## Idle/Tycoon Game Mechanics Research

### Adventure Capitalist Core Loop:
1. **Start simple**: One lemonade stand, tap to earn
2. **Buy more**: Invest profits into more stands → new business types
3. **Hire managers**: Automate individual businesses (key idle mechanic)
4. **Buy upgrades**: Multipliers on revenue
5. **Angel investors (Prestige)**: Reset progress for permanent multiplier
6. **New worlds**: Moon, Mars unlock at milestones
7. **Events**: Limited-time themed content

### Key Idle Game Mechanics to Incorporate:
- **Exponential growth with exponential costs**: Keeps player engaged in optimization
- **Offline progression**: Game earns while you're away (capped or uncapped)
- **Prestige/Reset**: Voluntary restart for permanent bonuses — creates "one more reset" addiction
- **Multiple currencies**: Cash, research points, prestige currency, premium currency
- **Managers/Automation**: Key progression gate — manual → semi-auto → full auto
- **Achievements/Milestones**: Give direction and dopamine hits
- **Limited events**: Create urgency and engagement spikes
- **Big numbers**: Seeing millions → billions → trillions is inherently satisfying
- **Diminishing returns → breakthrough moments**: Long plateau then sudden jump

### Games to Study:
- **Adventure Capitalist**: Template for business idle games
- **Adventure Communist**: Resource-generation variant with allocation mechanics
- **Cookie Clicker**: Original genre-definer, deep prestige layers
- **Idle Miner Tycoon**: Mining progression, hiring managers, shaft upgrades
- **Cell to Singularity**: Science-themed idle with tech tree progression
- **Realm Grinder**: Multiple prestige layers (abdicate → reincarnate → ascend)
- **Factory Idle**: Factory building with conveyor layouts
- **Antimatter Dimensions**: Deep prestige system with 10+ layers
- **NGU Idle**: Number going up, deep systems
- **Egg Inc.**: Egg farm theme, brilliant prestige system, contracts

### What Makes Our Game Different:
1. **Real tech progression**: Not abstract — players learn actual engineering concepts
2. **Cross-vertical synergy**: Batteries from EV division power AI data centers; rockets launch satellites
3. **Bottleneck system**: Not just "buy more" — must solve actual engineering/regulatory problems
4. **Power as meta-resource**: Shared constraint across all divisions
5. **Research is real**: Tech tree follows actual R&D paths (not fantasy upgrades)
6. **Narrative grounding**: Players feel like they're building a tech empire, not clicking cookies

### Monetization Lessons:
- **AdVenture Capitalist**: Gold (premium), time warps, angel investor boosts, cosmetics
- **Egg Inc.**: Golden eggs, pro permit (ad-free), contracts
- **Idle Miner**: Boosts, super managers, ad-based rewards
- **Best practice**: Respect player's time, never make premium mandatory, ads should be opt-in for rewards

---

## Key Insights for Game Design

### The "Production Hell" Mechanic
Tesla's real "production hell" — where scaling from prototype to mass production revealed countless unforeseen bottlenecks — is PERFECT for idle games. The player thinks they're ready to scale, then hits cascading failures that require new research, new supply chains, and new infrastructure.

### Cross-Vertical Dependencies (The Secret Sauce)
In reality, all of Musk's companies share resources:
- **SpaceX launches Starlink satellites** (rocket division enables satellite division)
- **Tesla batteries power everything** (EV battery tech → grid storage → satellite power)
- **xAI uses Tesla data for FSD training** (AI division helps EV division)
- **Boring Company tunnels use Tesla vehicles** (tunnel division depends on EV division)
- **Starlink provides internet to remote factories** (satellite enables all other divisions)
- **Tesla Energy powers data centers** (solar/storage enables AI division)

This creates a web of dependencies that's INCREDIBLY SATISFYING as a game mechanic. Unlocking one division unlocks capabilities in others.

### The Power Bottleneck
Everything requires power. This is the central tension:
- Build more factories? Need more power.
- Train bigger AI models? Need more power.
- Produce more rockets? Need more power.
- Mine more lithium? Need more power.
- Bore more tunnels? Need more power.

Player must constantly balance power generation with power consumption across all verticals.

### Real Numbers Make It Fun
Using real-ish numbers (MW of power, kg of lithium, number of GPUs) makes the game educational and the progression tangible. Players should feel like they understand why things are hard.
