// One-off discovery probe: find jiujitsu.net's backend data source so we can
// pull the FULL ranked list instead of just page 1 of the SPA. Writes findings
// to data/_discovery.json for inspection. Uses TAVILY_API_KEY. Safe to delete
// after we've learned what's reachable.

import { writeFile } from "node:fs/promises";

const KEY = process.env.TAVILY_API_KEY;
const T = "https://api.tavily.com";

async function call(ep, body) {
  try {
    const r = await fetch(`${T}/${ep}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
      body: JSON.stringify(body)
    });
    const text = await r.text();
    let json = null; try { json = JSON.parse(text); } catch {}
    return { httpOk: r.ok, status: r.status, json, textLen: text.length };
  } catch (e) { return { httpOk: false, error: String(e) }; }
}

if (!KEY) { console.error("TAVILY_API_KEY not set"); process.exit(1); }

const out = { when: new Date().toISOString() };

// 1) Probe likely data/API endpoints directly (extract returns raw_content).
const candidates = [
  "https://jiujitsu.net/api/ratings",
  "https://jiujitsu.net/api/ratings?page=1&limit=100",
  "https://jiujitsu.net/api/rankings",
  "https://jiujitsu.net/api/athletes",
  "https://jiujitsu.net/ratings.json",
  "https://api.jiujitsu.net/ratings",
  "https://jiujitsu.net/database"
];
out.extract = await call("extract", { urls: candidates, extract_depth: "advanced" });

// 2) Map the site to enumerate reachable URLs (athlete pages, api paths, etc.).
out.map = await call("map", { url: "https://jiujitsu.net", max_depth: 2, limit: 200 });

// 3) Search for any documented endpoint / structure.
out.search = await call("search", {
  query: "jiujitsu.net ratings api endpoint athletes json database",
  max_results: 8, include_domains: ["jiujitsu.net"]
});

await writeFile("data/_discovery.json", JSON.stringify(out, null, 2));
console.log("Discovery written. extract candidates:", candidates.length,
  "| map:", out.map?.status, "| search:", out.search?.status);
