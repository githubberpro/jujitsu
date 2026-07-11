# 🥋 Jiu-Jitsu Atlas

A self-contained web app that profiles the world's top jiu-jitsu (BJJ / grappling) competitors, serves as a knowledge base for the sport, and maps the businesses making money in it.

## Features

### 🏆 Top Players
- **27 competitor profiles** — Gordon Ryan, Roger Gracie, Marcus "Buchecha" Almeida, Marcelo Garcia, the Ruotolo brothers, Craig Jones, Beatriz Mesquita, and more, tiered GOAT / Legend / Elite / Rising.
- **Organized by 5 regions** — South America, North America, Europe, Asia, and Oceania, each with its own section header and athlete count:
  - **Asia** (7) with a 📍 sub-region tag: Japan's pioneers Yuki Nakai, Masakazu Imanari & Shinya Aoki (East Asia), the UAE's Faisal Al Ketbi, and **Southeast Asia** — Meggie Ochoa (🇵🇭 Philippines), Constance Lien and rising prodigy Noah Lim (🇸🇬 Singapore).
  - **Oceania** (3) — Australia's Craig Jones (B-Team / CJI founder), Lachlan Giles, and Levi Jones-Leary.
- **Attribute ratings** — control, submissions, guard, takedowns, cardio, and finish rate, shown as animated bars.
- **Strengths & weaknesses** — an honest scouting-style breakdown of each athlete's game.
- Signature techniques, accolades, team, weight class, belt, and style.
- **Search** (name, team, country, style) plus **region filters** and **style filters** (Gi / No-Gi / Women / GOAT-tier) that combine.

### 📚 Knowledge Base
- **History & origins** — from Japanese jujutsu and Kano's judo through Maeda, the Gracie family, UFC 1, and the modern era.
- **Belt system** — white through red, with what each rank means.
- **Gi vs. No-Gi** — the two competitive formats and how strategy differs.
- **Positional hierarchy** — the scoring ladder from guard to back control.
- **Core submissions** — chokes and joint locks explained.
- **Rules & scoring** — IBJJF points, ADCC, and submission-only formats.
- **Major championships** — Worlds, ADCC, WNO, CJI, ONE, and more.

### 💰 Business
- **5 categories**, 18 companies: tournament promotions (IBJJF, ADCC, ONE, CJI), gym franchises (Gracie Barra, Gracie University), instructional media (BJJ Fanatics, FloGrappling), apparel/gear brands, and the media/personality economy.
- Each entry covers the revenue model, scale, and how it makes money — plus a "where the money really is" summary.

## Running it

No build step, no dependencies. Any of these work:

```bash
# Option 1 — zero-dependency Node server
node server.js
# → http://localhost:3000

# Option 2 — npm script (uses `serve`)
npm run serve

# Option 3 — just open the file
open index.html   # or double-click index.html
```

## Live site (GitHub Pages)

A workflow at `.github/workflows/deploy-pages.yml` auto-deploys the site to
GitHub Pages on every push to `main`. **One-time setup:** in the repo,
**Settings ▸ Pages ▸ Source** → choose **GitHub Actions**. After the next push
(or a manual run via the Actions tab), the site goes live at:

```
https://githubberpro.github.io/jujitsu/
```

## Project structure

```
index.html          # App shell & layout
css/styles.css      # Dark-themed responsive styling
js/app.js           # Rendering, tabs, search/filter, modal
data/players.js     # Competitor profiles & ratings
data/knowledge.js   # Sport knowledge base
data/business.js    # Business landscape
server.js           # Minimal static file server
```

## Rankings reference — jiujitsu.net

Current, data-driven rankings are referenced from **[jiujitsu.net](https://jiujitsu.net)**,
which publishes unofficial IBJJF standings using the **Weisshart Elo rating
system**. In the app:

- A **rankings-source banner** on the Players tab links to jiujitsu.net.
- **Every athlete profile deep-links** to that competitor's live ranking page
  (`jiujitsu.net/athlete/<name>`), so the current standing is always one click away.
- The footer credits jiujitsu.net as the ranking source.

**Why link out instead of embedding numbers?** jiujitsu.net is protected by
Cloudflare and returns HTTP 403 to plain automated requests. Deep-linking keeps
the reference authoritative and always current. The attribute bars shown in each
profile are an **editorial scouting estimate**, clearly labelled as such, not
official Elo ratings.

### Automated ranking sync (Tavily)

The app can also display **live rank badges** (`#3 · 1720`) pulled from
jiujitsu.net, refreshed automatically:

- **`scripts/update-rankings.mjs`** calls the [Tavily](https://tavily.com) API
  (server-side extract/search, which gets past the Cloudflare block) and writes
  `data/rankings.js` (`window.RANKINGS`) plus a raw dump `data/rankings-raw.json`.
- **`.github/workflows/update-rankings.yml`** runs it daily (and on demand),
  commits any change, and redeploys. The app matches each ranked athlete to a
  profile by name slug and shows a badge on the card and in the modal.

**One-time setup:** add a repo secret **`TAVILY_API_KEY`**
(Settings ▸ Secrets and variables ▸ Actions ▸ New repository secret), then run
the *"Update rankings from jiujitsu.net (Tavily)"* workflow from the Actions tab.

Until the secret is added the sync is a graceful no-op — the app falls back to
the live per-athlete jiujitsu.net links, so nothing breaks. The committed
`data/rankings-raw.json` from the first run lets the parser in
`update-rankings.mjs` be tuned to jiujitsu.net's actual output.

## Note on the data

Athlete records, attribute ratings, and business figures are **directional estimates** compiled from public competition history and industry reporting through roughly 2024–2025. The attribute ratings are an editorial scouting assessment, not official statistics. Verify specifics against primary sources (IBJJF, ADCC, FloGrappling) before relying on them.
