# WORKFLOW.md — Technomania SDLC Process

## Task Lifecycle

Every task flows through four phases:

```
PLAN → IMPLEMENT → QA/REVIEW → MERGED
```

### 1. PLAN
- Read the task description and relevant PROJECT_PLAN.md sections
- Identify which files need to be created/modified
- Check dependencies are DONE
- Update task status to `IN_PROGRESS` and phase to `PLAN`

### 2. IMPLEMENT
- Create a feature branch: `git checkout -b feat/T{ID}-{short-desc}`
- Write the code, following existing patterns
- Update phase to `IMPLEMENT`
- Commit incrementally with clear messages

### 3. QA/REVIEW
- Run type checking: `npm run check`
- Test in browser (dev server must be running)
- Verify mobile responsiveness
- Check for console errors
- Update phase to `QA/REVIEW`

### 4. MERGED
- Merge feature branch to main: `git checkout main && git merge feat/T{ID}-{short-desc}`
- Delete feature branch: `git branch -d feat/T{ID}-{short-desc}`
- Push to GitHub: `git push`
- Update task status to `DONE` and phase to `MERGED`
- Update TASKS.md summary counts

---

## Git Strategy

### Branches
- `main` — production-ready code, always deployable
- `feat/T{ID}-{short-desc}` — feature branches for each task

### Commit Conventions
```
feat(T{ID}): Short description of what was added
fix(T{ID}): Bug fix description
refactor(T{ID}): Code restructuring without behavior change
docs: Documentation updates
chore: Tooling, config, dependency updates
```

**Examples:**
```
feat(T017): Add Helios Power division screen with 6 tiers
fix(T018): Fix tap production not updating state correctly
refactor(T009): Extract ResourceBar into reusable component
docs: Update TASKS.md with completed T017
chore: Update tailwindcss to v4.1
```

### Rules
- Never commit directly to `main` (except initial scaffold and docs)
- Each task gets its own branch
- Squash-merge if the branch has many small commits
- Push to GitHub after every merged task

---

## Heartbeat Integration

On each heartbeat cycle:
1. Check dev server is running (restart if dead)
2. Read TASKS.md to find next PLANNED task with met dependencies
3. Pick highest priority (P0 > P1 > P2)
4. Work through PLAN → IMPLEMENT → QA/REVIEW → MERGED
5. Commit and push
6. Update TASKS.md

### Dev Server Health Check
```bash
# Check if running
curl -s http://localhost:3000 > /dev/null && echo "OK" || echo "DOWN"

# Restart if needed
cd /Users/t/.openclaw/workspace/projects/tech-tycoon
pkill -f "vite dev" 2>/dev/null
nohup npm run dev -- --host 0.0.0.0 --port 3000 > dev-server.log 2>&1 &
```

---

## File Organization

Follow the structure from PROJECT_PLAN.md Section 10.4:

```
src/
  lib/
    engine/       — Core game systems (GameLoop, SaveManager, etc.)
    systems/      — Game logic (Production, Research, Power, etc.)
    divisions/    — Division configs and logic
    stores/       — Svelte stores for reactive state
    ui/           — Shared UI components
    data/         — JSON data files (tech tree, bottlenecks, etc.)
  routes/         — SvelteKit pages
    +page.svelte  — Landing / game entry
    game/         — Game screens (future)
static/           — Static assets (icons, manifest, etc.)
```

---

## Quality Standards

- **TypeScript strict mode** — no `any` types unless absolutely necessary
- **Mobile-first** — design for phone, enhance for desktop
- **Performance budget** — bundle < 200KB gzipped, 60fps animations
- **Accessibility** — touch targets ≥ 44px, color-blind friendly
- **State persistence** — game state survives page refresh and browser close
