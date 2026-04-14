# Samsara

A browser-based life-simulation game exploring Buddhist moral philosophy across five Southeast Asian countries — Thailand, Myanmar, Cambodia, Vietnam, and Laos. Players navigate karmic choices across a full lifetime, with country-specific events, NPC relationships, and rebirth outcomes.

Built with React + Vite. No backend, no database, no API keys required.

---

## Play It

**Live:** [buddhalife.vercel.app](https://buddhalife.vercel.app)

---

## Run Locally

**Prerequisites:** Node.js 18+

```bash
git clone https://github.com/ozemans/buddhalife.git
cd buddhalife
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

That's it — no environment variables, no accounts, no setup beyond Node.

---

## Deploy to Vercel

### Option A: One-click via Vercel dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import this GitHub repository
3. Vercel auto-detects Vite — accept the defaults
4. Click **Deploy**

No environment variables needed.

### Option B: Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts. Framework will be detected as Vite automatically.

---

## Project Structure

```
src/
├── App.jsx                  # Screen orchestration
├── engine/                  # Game logic
│   ├── gameState.js         # State reducer + localStorage save/load
│   ├── lifeProgression.js   # Aging, life stages, death checks
│   ├── karmaEngine.js       # Merit/demerit tracking
│   ├── consequences.js      # Choice → stat changes
│   ├── eventSelector.js     # Weighted event selection
│   ├── festivalEngine.js    # Regional festival events
│   ├── npcEngine.js         # NPC generation and aging
│   └── audioEngine.js       # Web Audio API (bell, chime sounds)
├── components/
│   ├── screens/             # TitleScreen, GameScreen, EndScreen, Encyclopedia
│   ├── game/                # StatsPanel, KarmaVisualizer, Timeline, EventCard
│   └── ui/                  # Button, Modal, Tooltip, SoundToggle
└── content/
    ├── events/              # Per-country event JSON (200+ events total)
    ├── characters/          # Background archetypes per country
    ├── festivals.json       # Regional festivals
    └── glossary.json        # Buddhist terms (~150+ definitions)
```

---

## Tech Stack

| | |
|---|---|
| Framework | React 19 |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 |
| State | React hooks + custom reducer |
| Persistence | Browser localStorage |
| Audio | Web Audio API |
| Hosting | Vercel |

---

## Academic Context

Created as a final-semester research project examining how everyday Buddhist practices vary across Southeast Asia. Game content is grounded in peer-reviewed ethnographies (Eberhardt, Chambers, Gustafsson, Nguyen, Edwards, and others). See `BuddhaLife_Research_Consolidation.pdf` for full citations.
