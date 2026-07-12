// Refresh current jiu-jitsu rankings from jiujitsu.net using the Tavily API.
//
// jiujitsu.net is Cloudflare-protected and 403s plain fetches, so we go through
// Tavily's server-side extractor/search. Runs at BUILD TIME (in GitHub Actions),
// never in the browser — the API key stays a repo secret.
//
// Output:
//   data/rankings.js       -> `window.RANKINGS = {...}` consumed by the app
//   data/rankings-raw.json  -> raw Tavily payloads, so the parser can be tuned
//                              against real output on the first successful run.
//
// Env: TAVILY_API_KEY (required to actually fetch; absent => graceful no-op).

import { writeFile } from "node:fs/promises";

const KEY = process.env.TAVILY_API_KEY;
const OUT_JS = "data/rankings.js";
const OUT_RAW = "data/rankings-raw.json";
const TAVILY = "https://api.tavily.com";

// jiujitsu.net ranking surfaces to try to extract.
const RANK_URLS = [
  "https://jiujitsu.net/",
  "https://jiujitsu.net/rankings",
  "https://jiujitsu.net/rankings/pound-for-pound",
];

function nowIso() {
  return new Date().toISOString();
}

async function tavily(endpoint, body) {
  const res = await fetch(`${TAVILY}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Tavily /${endpoint} HTTP ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

// Pull every bit of text content out of the Tavily payloads.
function collectText(raw) {
  const chunks = [];
  const ex = raw.extract && (raw.extract.results || raw.extract.data || []);
  if (Array.isArray(ex)) for (const r of ex) if (r && r.raw_content) chunks.push(r.raw_content);
  const se = raw.search && raw.search.results;
  if (Array.isArray(se)) for (const r of se) chunks.push(r.raw_content || r.content || "");
  return chunks.filter(Boolean).join("\n");
}

// Parse ranked athletes. jiujitsu.net's ratings page renders as a markdown
// table via Tavily, e.g.:
//   | 1 |  | [Tainan Dalpra](url) ![img] | ![img] | 2574 |  |  |  |
// We parse that primarily, and fall back to a loose "1. Name 1850" line format.
function parseAthletes(raw) {
  const text = collectText(raw);
  if (!text) return [];
  const out = [];
  const seen = new Set();

  // Primary: markdown table rows.
  for (const line of text.split("\n")) {
    const rankM = line.match(/^\|\s*(\d{1,3})\s*\|/);
    if (!rankM) continue;
    const nameM = line.match(/\[([^\]]+?)\]\(/); // first markdown link = athlete name
    if (!nameM) continue;
    const ratingM = line.match(/\|\s*(\d{4})\s*\|/); // 4-digit Elo cell
    const rank = parseInt(rankM[1], 10);
    const name = nameM[1].replace(/\s+/g, " ").trim();
    const rating = ratingM ? parseInt(ratingM[1], 10) : null;
    const key = rank + "|" + name.toLowerCase();
    if (rank >= 1 && rank <= 500 && name.length > 2 && !seen.has(key)) {
      seen.add(key);
      out.push({ rank, name, rating });
    }
  }

  // Fallback: loose line format, only if the table yielded nothing.
  if (!out.length) {
    const re =
      /(?:^|\n)\s*#?(\d{1,3})[.)]?\s+([A-Z][A-Za-zÀ-ÿ'’.\-]+(?:\s+[A-Z][A-Za-zÀ-ÿ'’.\-]+){0,3})\s*[-–—:|]*\s*(\d{3,4})?/g;
    let m;
    while ((m = re.exec(text)) !== null) {
      const rank = parseInt(m[1], 10);
      const name = m[2].trim();
      const key = name.toLowerCase();
      if (rank >= 1 && rank <= 100 && name.length > 3 && !seen.has(key)) {
        seen.add(key);
        out.push({ rank, name, rating: m[3] ? parseInt(m[3], 10) : null });
      }
    }
  }

  out.sort((a, b) => a.rank - b.rank);
  return out.slice(0, 100);
}

async function writeData(athletes, fetchedAt, errors) {
  const data = {
    updated: fetchedAt,
    source: "jiujitsu.net (unofficial IBJJF · Weisshart Elo) via Tavily",
    scope: "Gi · Pound-for-Pound (top of the open ranking)",
    count: athletes.length,
    note: athletes.length
      ? ""
      : "No rankings parsed on this run — inspect data/rankings-raw.json and tune parseAthletes().",
    errors: errors || [],
    athletes,
  };
  await writeFile(OUT_JS, "window.RANKINGS = " + JSON.stringify(data, null, 2) + ";\n");
  console.log(`Wrote ${OUT_JS} — ${athletes.length} ranked athletes.`);
}

async function main() {
  if (!KEY) {
    console.warn("TAVILY_API_KEY is not set — skipping ranking fetch (no changes written).");
    console.warn("Add it as a repo secret (Settings ▸ Secrets and variables ▸ Actions) to enable syncing.");
    return; // graceful no-op so scheduled runs stay green before setup
  }

  const fetchedAt = nowIso();
  const raw = { fetchedAt, extract: null, search: null, errors: [] };

  try {
    raw.extract = await tavily("extract", { urls: RANK_URLS, extract_depth: "advanced" });
  } catch (e) {
    raw.errors.push("extract: " + e.message);
    console.warn(e.message);
  }

  try {
    raw.search = await tavily("search", {
      query: "jiujitsu.net current pound for pound BJJ rankings top ranked athletes by division",
      search_depth: "advanced",
      max_results: 10,
      include_domains: ["jiujitsu.net"],
    });
  } catch (e) {
    raw.errors.push("search: " + e.message);
    console.warn(e.message);
  }

  await writeFile(OUT_RAW, JSON.stringify(raw, null, 2));

  const athletes = parseAthletes(raw);
  await writeData(athletes, fetchedAt, raw.errors);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
