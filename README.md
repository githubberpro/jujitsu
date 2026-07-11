# 🥋 Jiu-Jitsu Atlas

A self-contained web app that profiles the world's top jiu-jitsu (BJJ / grappling) competitors, serves as a knowledge base for the sport, and maps the businesses making money in it.

## Features

### 🏆 Top Players
- **20 elite competitor profiles** — Gordon Ryan, Roger Gracie, Marcus "Buchecha" Almeida, Marcelo Garcia, the Ruotolo brothers, Beatriz Mesquita, and more.
- **Organized by region** — South America, North America, Europe, and **Asia** (Japan's pioneers Yuki Nakai & Masakazu Imanari, plus the UAE's Faisal Al Ketbi), each with its own section header and athlete count.
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

## Note on the data

Athlete records, attribute ratings, and business figures are **directional estimates** compiled from public competition history and industry reporting through roughly 2024–2025. The attribute ratings are an editorial scouting assessment, not official statistics. Verify specifics against primary sources (IBJJF, ADCC, FloGrappling) before relying on them.
