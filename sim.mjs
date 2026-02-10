/**
 * QA10 Mid-game balance simulation
 * Simulates optimal play from 0 to ~2 hours
 */

// Division tier configs (from source files)
const DIVISIONS = {
  teslaenergy: {
    unlockCost: 0,
    tiers: [
      { name: 'Nuclear Reactor', baseCost: 5, baseRevenue: 1, cycleDuration: 0.6, costMultiplier: 1.07 },
      { name: 'Solar Panel Farm', baseCost: 75, baseRevenue: 10, cycleDuration: 1.5, costMultiplier: 1.08 },
      { name: 'Battery Megapack', baseCost: 600, baseRevenue: 75, cycleDuration: 4, costMultiplier: 1.10 },
      { name: 'Rocket Fuel Refinery', baseCost: 5000, baseRevenue: 600, cycleDuration: 12, costMultiplier: 1.12 },
      { name: 'Space Solar Array', baseCost: 40000, baseRevenue: 5000, cycleDuration: 30, costMultiplier: 1.14 },
      { name: 'Wireless Energy Beaming', baseCost: 350000, baseRevenue: 45000, cycleDuration: 60, costMultiplier: 1.16 },
    ]
  },
  spacex: {
    unlockCost: 500,
    tiers: [
      { name: 'Small Orbital Rocket', baseCost: 30, baseRevenue: 6, cycleDuration: 2.5, costMultiplier: 1.08 },
      { name: 'Reusable Booster', baseCost: 250, baseRevenue: 50, cycleDuration: 6, costMultiplier: 1.10 },
      { name: 'Crew Capsule', baseCost: 2000, baseRevenue: 400, cycleDuration: 15, costMultiplier: 1.12 },
      { name: 'Heavy Lift Vehicle', baseCost: 15000, baseRevenue: 3000, cycleDuration: 35, costMultiplier: 1.13 },
      { name: 'Super Heavy Starship', baseCost: 120000, baseRevenue: 25000, cycleDuration: 90, costMultiplier: 1.15 },
      { name: 'Starship Lander', baseCost: 1000000, baseRevenue: 200000, cycleDuration: 180, costMultiplier: 1.17 },
    ]
  },
  tesla: {
    unlockCost: 2500,
    tiers: [
      { name: 'Electric Cars', baseCost: 15, baseRevenue: 3, cycleDuration: 3, costMultiplier: 1.08 },
      { name: 'Gigafactory', baseCost: 500, baseRevenue: 90, cycleDuration: 8, costMultiplier: 1.10 },
      { name: 'Raw Material Processing', baseCost: 25000, baseRevenue: 5000, cycleDuration: 18, costMultiplier: 1.12 },
      { name: 'Chip Fabrication', baseCost: 5000000, baseRevenue: 1000000, cycleDuration: 40, costMultiplier: 1.13 },
      { name: 'Orbital Shipyard', baseCost: 500000000, baseRevenue: 100000000, cycleDuration: 100, costMultiplier: 1.15 },
      { name: 'Colony Kit Factory', baseCost: 50000000000, baseRevenue: 10000000000, cycleDuration: 200, costMultiplier: 1.18 },
    ]
  },
  ai: {
    unlockCost: 5000,
    tiers: [
      { name: 'Chatbot', baseCost: 5000, baseRevenue: 800, cycleDuration: 3, costMultiplier: 1.09 },
      { name: 'Language Model', baseCost: 50000, baseRevenue: 8000, cycleDuration: 8, costMultiplier: 1.11 },
      { name: 'AI Assistant', baseCost: 500000, baseRevenue: 80000, cycleDuration: 20, costMultiplier: 1.13 },
      { name: 'Autonomous Agent', baseCost: 5000000, baseRevenue: 800000, cycleDuration: 50, costMultiplier: 1.14 },
      { name: 'Neural Network Hub', baseCost: 50000000, baseRevenue: 8000000, cycleDuration: 120, costMultiplier: 1.16 },
      { name: 'AGI', baseCost: 500000000, baseRevenue: 100000000, cycleDuration: 300, costMultiplier: 1.20 },
    ]
  },
  tunnels: {
    unlockCost: 12000,
    tiers: [
      { name: 'Test Bore', baseCost: 12000, baseRevenue: 2200, cycleDuration: 5, costMultiplier: 1.09 },
      { name: 'City Tunnel', baseCost: 120000, baseRevenue: 19200, cycleDuration: 12, costMultiplier: 1.11 },
      { name: 'Transit Loop', baseCost: 1200000, baseRevenue: 180000, cycleDuration: 30, costMultiplier: 1.12 },
      { name: 'Freight Network', baseCost: 12000000, baseRevenue: 1800000, cycleDuration: 70, costMultiplier: 1.14 },
      { name: 'Continental Link', baseCost: 120000000, baseRevenue: 18000000, cycleDuration: 160, costMultiplier: 1.16 },
      { name: 'Hyperloop', baseCost: 1200000000, baseRevenue: 240000000, cycleDuration: 360, costMultiplier: 1.20 },
    ]
  },
  robotics: {
    unlockCost: 40000,
    tiers: [
      { name: 'Assembly Bot', baseCost: 40000, baseRevenue: 6000, cycleDuration: 6, costMultiplier: 1.09 },
      { name: 'Warehouse Drone', baseCost: 400000, baseRevenue: 56000, cycleDuration: 14, costMultiplier: 1.10 },
      { name: 'Humanoid Prototype', baseCost: 4000000, baseRevenue: 500000, cycleDuration: 35, costMultiplier: 1.11 },
      { name: 'Home Robot', baseCost: 40000000, baseRevenue: 5000000, cycleDuration: 80, costMultiplier: 1.11 },
      { name: 'Construction Mech', baseCost: 400000000, baseRevenue: 50000000, cycleDuration: 180, costMultiplier: 1.12 },
      { name: 'General Purpose Robot', baseCost: 4000000000, baseRevenue: 600000000, cycleDuration: 400, costMultiplier: 1.12 },
    ]
  },
};

const CHIEF_COSTS = [5000, 50000, 1000000, 25000000, 1000000000, 100000000000];
const CHIEF_SPEEDS = [1, 2, 5, 10, 50, 100];

// State
let cash = 25; // Starting cash
let totalCashEarned = 0;
const divState = {};
for (const [id, div] of Object.entries(DIVISIONS)) {
  divState[id] = {
    unlocked: id === 'teslaenergy',
    chiefLevel: 0,
    tiers: div.tiers.map(t => ({ count: 0, config: t })),
  };
}

function tierCost(config, count) {
  return config.baseCost * Math.pow(config.costMultiplier, count);
}

function revenuePerSec(divId) {
  const ds = divState[divId];
  if (!ds.unlocked) return 0;
  let total = 0;
  for (const t of ds.tiers) {
    if (t.count > 0) {
      total += (t.config.baseRevenue * t.count) / t.config.cycleDuration;
    }
  }
  return total;
}

function totalRevenuePerSec() {
  let total = 0;
  for (const id of Object.keys(DIVISIONS)) {
    total += revenuePerSec(id);
  }
  return total;
}

// Calculate RP/s
function rpPerSec() {
  let rp = 0;
  for (const [id, ds] of Object.entries(divState)) {
    if (!ds.unlocked) continue;
    rp += 0.1;
    for (const t of ds.tiers) {
      if (t.count > 0) rp += 0.05;
    }
    if (ds.chiefLevel > 0) rp += 0.2;
  }
  return rp;
}

// Simulation
const TICK = 0.1; // 100ms ticks
const MAX_TIME = 7200; // 2 hours
let time = 0;
let totalRP = 0;
const events = [];
let treasuryUnlocked = false;

function log(msg) {
  const min = (time / 60).toFixed(1);
  events.push({ time, min, cash, totalCashEarned, msg, revPerSec: totalRevenuePerSec(), rpPerSec: rpPerSec(), totalRP });
}

// Simple greedy AI: buy best ROI item available
function bestBuy() {
  let best = null;
  let bestROI = 0;
  
  // Check division unlocks
  for (const [id, div] of Object.entries(DIVISIONS)) {
    if (divState[id].unlocked) continue;
    const cost = div.unlockCost;
    if (cost > cash) continue;
    // Estimate ROI of unlocking: first tier revenue
    const firstTier = div.tiers[0];
    const tierC = firstTier.baseCost;
    const rev = firstTier.baseRevenue / firstTier.cycleDuration;
    const roi = rev / (cost + tierC);
    if (roi > bestROI) {
      bestROI = roi;
      best = { type: 'unlock', id, cost };
    }
  }
  
  // Check tier purchases
  for (const [id, ds] of Object.entries(divState)) {
    if (!ds.unlocked) continue;
    for (let i = 0; i < ds.tiers.length; i++) {
      const t = ds.tiers[i];
      const cost = tierCost(t.config, t.count);
      if (cost > cash) continue;
      const rev = t.config.baseRevenue / t.config.cycleDuration;
      const roi = rev / cost;
      if (roi > bestROI) {
        bestROI = roi;
        best = { type: 'buy', divId: id, tierIdx: i, cost };
      }
    }
  }
  
  // Check chief hires
  for (const [id, ds] of Object.entries(divState)) {
    if (!ds.unlocked) continue;
    if (ds.chiefLevel >= 6) continue;
    const cost = CHIEF_COSTS[ds.chiefLevel];
    if (cost > cash) continue;
    // Chiefs don't add revenue directly (they automate), 
    // but in an idle game they're essential. Prioritize first chief highly.
    // For simulation, treat chief as a moderate priority
    const currentRev = revenuePerSec(id);
    if (currentRev === 0) continue;
    // Speed multiplier benefit
    const currentSpeed = ds.chiefLevel > 0 ? CHIEF_SPEEDS[ds.chiefLevel - 1] : 1;
    const newSpeed = CHIEF_SPEEDS[ds.chiefLevel];
    const speedGain = newSpeed / currentSpeed;
    // Not directly revenue gain in our sim (we already count full rev), skip for now
    // But log when affordable
    if (ds.chiefLevel === 0) {
      best = best; // Don't override better buys, but note it
    }
  }
  
  return best;
}

// Run simulation
log('START: $25 cash');

while (time < MAX_TIME) {
  // Earn revenue
  const rev = totalRevenuePerSec() * TICK;
  cash += rev;
  totalCashEarned += rev;
  totalRP += rpPerSec() * TICK;
  
  // Check treasury unlock
  if (!treasuryUnlocked && totalCashEarned >= 500000) {
    treasuryUnlocked = true;
    log(`TREASURY UNLOCKED at $${(totalCashEarned).toFixed(0)} totalEarned`);
  }
  
  // Buy stuff (greedy)
  let bought = true;
  while (bought) {
    bought = false;
    const buy = bestBuy();
    if (!buy) break;
    
    if (buy.type === 'unlock') {
      cash -= buy.cost;
      divState[buy.id].unlocked = true;
      log(`UNLOCK ${buy.id} for $${buy.cost}`);
      bought = true;
    } else if (buy.type === 'buy') {
      const t = divState[buy.divId].tiers[buy.tierIdx];
      cash -= buy.cost;
      t.count++;
      if (t.count === 1) {
        log(`FIRST ${t.config.name} (${buy.divId}) for $${buy.cost.toFixed(0)}`);
      }
      bought = true;
    }
  }
  
  // Check chief affordability (just log, don't buy in sim since they don't change revenue model here)
  for (const [id, ds] of Object.entries(divState)) {
    if (!ds.unlocked) continue;
    if (ds.chiefLevel < 6) {
      const cost = CHIEF_COSTS[ds.chiefLevel];
      if (cost <= cash && ds.chiefLevel === 0) {
        ds.chiefLevel = 1;
        cash -= cost;
        log(`CHIEF HIRED for ${id} at $${cost}`);
      } else if (cost <= cash && ds.chiefLevel > 0) {
        ds.chiefLevel++;
        cash -= cost;
        log(`CHIEF UPGRADE ${id} to level ${ds.chiefLevel} at $${cost}`);
      }
    }
  }
  
  time += TICK;
}

// Summary
console.log('\n=== QA10 MID-GAME BALANCE SIMULATION ===\n');

// Key milestones
const milestones = events.filter(e => e.msg.includes('UNLOCK') || e.msg.includes('FIRST') || e.msg.includes('CHIEF') || e.msg.includes('TREASURY') || e.msg.includes('START'));
for (const m of milestones) {
  console.log(`[${m.min}m] ${m.msg} | rev/s: $${m.revPerSec.toFixed(1)} | RP/s: ${m.rpPerSec.toFixed(2)} | totalRP: ${m.totalRP.toFixed(1)}`);
}

console.log('\n--- FINAL STATE (2hr) ---');
console.log(`Cash: $${cash.toFixed(0)}`);
console.log(`Total earned: $${totalCashEarned.toFixed(0)}`);
console.log(`Total RP: ${totalRP.toFixed(1)}`);
console.log(`Rev/s: $${totalRevenuePerSec().toFixed(1)}`);
console.log(`RP/s: ${rpPerSec().toFixed(2)}`);

for (const [id, ds] of Object.entries(divState)) {
  if (!ds.unlocked) { console.log(`${id}: LOCKED`); continue; }
  const counts = ds.tiers.map((t, i) => `${t.config.name}:${t.count}`).join(', ');
  console.log(`${id} (chief ${ds.chiefLevel}): ${counts}`);
}

// Analysis
console.log('\n--- ANALYSIS ---');

// ROI comparison per tier
console.log('\nROI (rev/s per $cost at count=0):');
for (const [id, div] of Object.entries(DIVISIONS)) {
  for (const t of div.tiers) {
    const roi = (t.baseRevenue / t.cycleDuration) / t.baseCost;
    console.log(`  ${id}/${t.name}: ${roi.toFixed(6)} rev/s per $ (rev/s=${(t.baseRevenue/t.cycleDuration).toFixed(1)}, cost=$${t.baseCost})`);
  }
}

// Check dead zones (gaps between milestones > 5 min)
console.log('\nGap analysis (unlock/first-buy events):');
const keyEvents = events.filter(e => e.msg.includes('UNLOCK') || e.msg.includes('FIRST'));
for (let i = 1; i < keyEvents.length; i++) {
  const gap = keyEvents[i].time - keyEvents[i-1].time;
  if (gap > 120) { // > 2 min gap
    console.log(`  GAP: ${(gap/60).toFixed(1)}m between "${keyEvents[i-1].msg}" and "${keyEvents[i].msg}"`);
  }
}

// Chief affordability timeline
console.log('\nChief affordability:');
const chiefEvents = events.filter(e => e.msg.includes('CHIEF'));
for (const e of chiefEvents) {
  console.log(`  [${e.min}m] ${e.msg}`);
}

// RP milestones
console.log('\nRP milestones:');
const rpTargets = [10, 25, 50, 80, 120, 150];
for (const target of rpTargets) {
  // Find first event where totalRP >= target
  const found = events.find(e => e.totalRP >= target);
  if (found) {
    console.log(`  ${target} RP reached at ${found.min}m`);
  } else {
    console.log(`  ${target} RP NOT reached in 2hr`);
  }
}

// Tier dominance check
console.log('\nTier dominance check (tiers with 0 purchases):');
for (const [id, ds] of Object.entries(divState)) {
  if (!ds.unlocked) continue;
  for (let i = 0; i < ds.tiers.length; i++) {
    if (ds.tiers[i].count === 0) {
      console.log(`  ${id}/${ds.tiers[i].config.name}: NEVER BOUGHT (baseCost=$${ds.tiers[i].config.baseCost})`);
    }
  }
}
