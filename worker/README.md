# Lookup Worker — free-form opponent search from jiujitsu.net

The Game Plan Lab lets you type **any** opponent's name and pull their live
jiujitsu.net data (Elo rating, belt, team, country). Because the site is static
(GitHub Pages) and the Tavily key must stay secret, the lookup runs through this
tiny **Cloudflare Worker**, which holds the key and does the search server-side.

Deploying is free and takes a few minutes.

## What it does
`GET https://<your-worker-url>?name=Gordon%20Ryan` →

```json
{ "found": true, "name": "Gordon Ryan", "rating": 2100, "belt": "BLACK",
  "team": "New Wave", "country": "USA", "url": "https://jiujitsu.net/athlete/...",
  "source": "jiujitsu.net (via Tavily)" }
```

## Deploy (Cloudflare Workers — free tier)

1. **Install Wrangler** (Cloudflare's CLI) and log in:
   ```bash
   npm install -g wrangler
   wrangler login
   ```
2. **From this `worker/` folder**, set your Tavily key as a secret and deploy:
   ```bash
   cd worker
   wrangler secret put TAVILY_API_KEY      # paste your tvly-... key when prompted
   wrangler deploy
   ```
   Wrangler prints your Worker URL, e.g. `https://jjnet-proxy.your-name.workers.dev`.
3. *(Recommended)* Lock CORS to your site — uncomment `ALLOW_ORIGIN` in
   `wrangler.toml`, set it to `https://githubberpro.github.io`, and `wrangler deploy` again.

### No CLI? Use the dashboard
- Cloudflare dashboard → **Workers & Pages → Create → Worker** → paste the
  contents of `jjnet-proxy.js` → **Deploy**.
- Then **Settings → Variables → Add variable → Encrypt**, name `TAVILY_API_KEY`,
  value = your `tvly-...` key → **Save and deploy**.

## Connect it to the app
1. Open the app → **🎯 Game Plan** tab → click **⚙︎ Endpoint**.
2. Paste your Worker URL → **Save**. (Stored in your browser only.)
3. Type any name in the lookup box → **🔎 Look up**.

Found opponents are **saved in your browser** (localStorage): they appear in the
opponent dropdown under **⭐ Looked up (saved)** and persist across reloads, so
each name is only fetched once. Use **Clear saved opponents** under ⚙︎ Endpoint
to reset.

## Notes
- jiujitsu.net tracks **IBJJF gi** competition, so results are gi rating/belt/team —
  great for a class/verdict, framed in-app as a gi-vs-no-gi matchup for Noah.
- The same `TAVILY_API_KEY` you use for the ranking sync works here; the Worker's
  copy is separate from the GitHub Actions secret.
- Free tiers (Cloudflare Workers + Tavily) comfortably cover personal use.
