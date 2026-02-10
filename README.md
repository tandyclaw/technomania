# 🚀 Moonshot

**Build a tech empire from garage startup to interplanetary civilization.**

Moonshot is an incremental/idle game where you grow six divisions of a tech conglomerate — from electric vehicles to Mars colonization. Prestige, research, hire chiefs, unlock synergies, and chase 130+ achievements on your path to the stars.

<!-- Screenshot placeholder: capture the main game view showing the division tab bar, tier cards with production rates, resource bar at top, and the prestige button glowing. Ideally at mid-game with 3-4 divisions unlocked. -->
![Moonshot Screenshot](docs/screenshot.png)

---

## ✨ Features

- **6 Divisions** — Tesla, Tesla Energy, SpaceX, Tunnels (Boring Co.), Robotics, and AI
- **36 Tiers** — 6 tiers per division, each with unique upgrades and production chains
- **Prestige System** — Reset for powerful multipliers; division-specific prestige for deeper runs
- **Research Tree** — Unlock permanent bonuses across a branching tech tree
- **130+ Achievements** — Milestones, hidden achievements, and challenge goals
- **Contract System** — Take on timed objectives for bonus rewards
- **Seasonal Events** — Limited-time events with exclusive rewards
- **Chiefs & Workers** — Hire leaders and allocate workers to boost production
- **Synergies** — Cross-division bonuses that reward balanced growth
- **Random Events & News Ticker** — Dynamic events that shake up gameplay
- **Mini-Games** — Interactive diversions for bonus resources
- **Daily Rewards** — Come back every day for escalating bonuses
- **Offline Progress** — Earn while you're away
- **NG+ System** — New Game Plus for the ultimate challenge
- **Sound & Music** — Ambient soundtrack and satisfying SFX
- **Keyboard Shortcuts** — Full keyboard navigation for power users
- **Auto-save** — Never lose progress

## 🛠 Tech Stack

- **[SvelteKit](https://svelte.dev/)** — Svelte 5 with runes (`$state`, `$derived`, `$effect`)
- **TypeScript** — End-to-end type safety
- **[Tailwind CSS v4](https://tailwindcss.com/)** — Utility-first styling
- **Vite** — Lightning-fast dev server and builds
- **Cloudflare Pages** — Edge deployment

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/your-username/tech-tycoon.git
cd tech-tycoon

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and start building your empire.

## 📦 Deploy

Deploys to **Cloudflare Pages** via Wrangler:

```bash
npm run deploy
```

This runs `vite build` and pushes the `build/` output to Cloudflare Pages.

## 📁 Project Structure

```
src/
├── lib/
│   ├── divisions/       # Division definitions (Tesla, SpaceX, AI, etc.)
│   ├── systems/         # Core game systems (production, prestige, contracts, etc.)
│   ├── stores/          # Svelte stores (game state, navigation, events)
│   ├── engine/          # Game loop and tick engine
│   ├── data/            # Tech tree and static data
│   ├── ui/              # Reusable UI components
│   │   └── views/       # Main game views (divisions, prestige, research, etc.)
│   ├── utils/           # Helpers and formatting utilities
│   └── assets/          # Audio, images, and static assets
├── routes/
│   ├── +page.svelte     # Main game page
│   └── game/            # Game sub-routes
└── app.d.ts             # Global type declarations
```

## 📄 License

MIT

---

*Per aspera ad astra* 🌕
