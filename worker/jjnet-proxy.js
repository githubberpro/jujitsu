// Cloudflare Worker — jiujitsu.net athlete lookup proxy for the Jiu-Jitsu Atlas.
//
// The static site can't call Tavily directly (the key would be exposed and
// jiujitsu.net blocks browser requests). This Worker holds the key server-side
// and exposes ONE endpoint the app can call:
//
//   GET /lookup?name=<athlete name>
//     -> { found, name, rating, belt, team, country, url, source }
//
// Deploy (free): see worker/README.md. Set the secret with:
//   npx wrangler secret put TAVILY_API_KEY
//
// Optional: restrict CORS to your site by setting the ALLOW_ORIGIN var to
// "https://<you>.github.io" (defaults to "*").

export default {
  async fetch(request, env) {
    const allow = env.ALLOW_ORIGIN || "*";
    const cors = {
      "Access-Control-Allow-Origin": allow,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": "no-store",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });

    const url = new URL(request.url);
    const name = (url.searchParams.get("name") || "").trim();
    if (!name) return json({ error: "Provide ?name=" }, 400, cors);
    if (!env.TAVILY_API_KEY) return json({ error: "Worker is missing the TAVILY_API_KEY secret" }, 500, cors);

    try {
      // 1) Find the athlete's jiujitsu.net page by name.
      const s = await tavily(env, "search", {
        query: `${name} jiu jitsu athlete rating`,
        include_domains: ["jiujitsu.net"],
        max_results: 6,
      });
      const results = s.results || [];
      const hit = results.find((r) => /\/athlete\//.test(r.url || "")) || results[0];
      if (!hit) return json({ found: false, name }, 200, cors);

      // 2) The clean athlete card ("Rating: X | Belt: Y | Team: Z | Country: c")
      // lives in a BASIC extract. Search `content` is often a messy stats blob,
      // and ADVANCED extract returns the whole SPA shell — so prefer basic,
      // then fall back to search content only if needed.
      let content = "";
      try {
        const ex = await tavily(env, "extract", { urls: [hit.url], extract_depth: "basic" });
        content = (ex.results && ex.results[0] && ex.results[0].raw_content) || "";
      } catch { /* fall through */ }
      if (!/Rating:/i.test(content) && hit.content) content = hit.content;

      const info = parse(content, name);
      info.url = hit.url;
      info.source = "jiujitsu.net (via Tavily)";
      // Treat locating the athlete page as a hit even if parsing is thin.
      info.found = /\/athlete\//.test(hit.url) || info.rating != null || info.belt != null;
      return json(info, 200, cors);
    } catch (e) {
      return json({ error: String(e && e.message || e) }, 502, cors);
    }
  },
};

async function tavily(env, endpoint, body) {
  const r = await fetch(`https://api.tavily.com/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.TAVILY_API_KEY}` },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`Tavily /${endpoint} ${r.status}`);
  return r.json();
}

// jiujitsu.net athlete pages read like:
//   # Firstname Lastname
//   Rating: 1,943 | Belt: BLACK | Team: Stealth BJJ | Country: ...
function parse(text, fallbackName) {
  const g = (re) => (text.match(re) || [])[1];
  const nm = g(/^#\s*(.+)$/m);
  const rating = g(/Rating:\s*([\d,]+)/i);
  const belt = g(/Belt:\s*([A-Za-z\/ ]+?)(?:\s*\||\n|$)/i);
  const team = g(/Team:\s*([^|\n]+?)(?:\s*\||\n|$)/i);
  const country = g(/Country:\s*([^|\n]+?)(?:\s*\||\n|$)/i);
  return {
    name: (nm && nm.trim()) || fallbackName,
    rating: rating ? parseInt(rating.replace(/,/g, ""), 10) : null,
    belt: belt ? belt.trim() : null,
    team: team ? team.trim() : null,
    country: country ? country.trim() : null,
  };
}

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...cors },
  });
}
