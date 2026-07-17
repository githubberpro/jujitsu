// One-off diagnostic: replicate the Worker's lookup for a name and dump every
// step so we can see why the app returns nothing. Writes data/_diag.json.
import { writeFile } from "node:fs/promises";
const KEY = process.env.TAVILY_API_KEY;
const T = "https://api.tavily.com";
const NAME = process.env.DIAG_NAME || "Alexander Sak";

async function tav(ep, body) {
  const r = await fetch(`${T}/${ep}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` }, body: JSON.stringify(body) });
  const t = await r.text(); let j = null; try { j = JSON.parse(t); } catch {}
  return { status: r.status, ok: r.ok, json: j, textLen: t.length };
}
function parse(text, fb) {
  const g = (re) => (text.match(re) || [])[1];
  return {
    name: ((g(/^#\s*(.+)$/m) || fb) || "").trim(),
    rating: (g(/Rating:\s*([\d,]+)/i) || "").replace(/,/g, "") || null,
    belt: g(/Belt:\s*([A-Za-z\/ ]+?)(?:\s*\||\n|$)/i) || null,
    team: g(/Team:\s*([^|\n]+?)(?:\s*\||\n|$)/i) || null,
  };
}

const out = { name: NAME };
out.search = await tav("search", { query: `${NAME} jiu jitsu athlete rating`, include_domains: ["jiujitsu.net"], max_results: 6 });
out.searchPlain = await tav("search", { query: NAME, include_domains: ["jiujitsu.net"], max_results: 6 });

const results = out.search.json?.results || [];
out.hits = results.map((r) => ({ url: r.url, hasRating: /Rating:/i.test(r.content || ""), contentHead: (r.content || "").slice(0, 140) }));
const hit = results.find((r) => /\/athlete\//.test(r.url)) || results[0];
out.chosen = hit ? { url: hit.url, contentHead: (hit.content || "").slice(0, 200) } : null;

if (hit) {
  out.extractBasic = await tav("extract", { urls: [hit.url], extract_depth: "basic" });
  out.extractAdvanced = await tav("extract", { urls: [hit.url], extract_depth: "advanced" });
  const rcB = out.extractBasic.json?.results?.[0]?.raw_content || "";
  const rcA = out.extractAdvanced.json?.results?.[0]?.raw_content || "";
  out.basic = { hasRating: /Rating:/i.test(rcB), len: rcB.length, head: rcB.slice(0, 180) };
  out.advanced = { hasRating: /Rating:/i.test(rcA), len: rcA.length, snippet: (rcA.match(/#[^\n]*\n[\s\S]{0,180}/) || [""])[0] };
  out.parseFromSearchContent = parse(hit.content || "", NAME);
  out.parseFromAdvancedExtract = parse(rcA, NAME);
}
await writeFile("data/_diag.json", JSON.stringify(out, null, 2));
console.log("diag written for", NAME);
