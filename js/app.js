/* ===== Jiu-Jitsu Atlas — app logic ===== */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const initials = (name) => name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  // jiujitsu.net — the cited source for current, data-driven rankings
  // (unofficial IBJJF standings via the Weisshart Elo system). We deep-link to
  // each athlete's live ranking page rather than copy numbers that would go
  // stale. Slug pattern: /athlete/<name lowercased, hyphenated, de-accented>.
  const JJNET = "https://jiujitsu.net";
  const slugify = (name) =>
    name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const jjNetUrl = (p) => `${JJNET}/athlete/${slugify(p.rankingName || p.name)}`;

  // Live rankings synced from jiujitsu.net via Tavily (data/rankings.js, refreshed
  // by the scheduled GitHub Actions job). Matched to profiles by name slug.
  // Absent/empty until the first sync — everything below degrades gracefully.
  const RANKINGS = (window.RANKINGS && Array.isArray(window.RANKINGS.athletes))
    ? window.RANKINGS : { athletes: [], updated: null };
  const rankBySlug = {};
  RANKINGS.athletes.forEach((a) => {
    if (a && a.name) rankBySlug[slugify(a.name)] = a;
  });
  const rankOf = (p) => rankBySlug[slugify(p.rankingName || p.name)] || null;

  const STAT_LABELS = {
    control: "Control", submissions: "Submissions", guard: "Guard",
    takedowns: "Takedowns", cardio: "Cardio", subRate: "Finish Rate"
  };

  // Region organization. Region is derived from nationality so there is a single
  // source of truth in the player data.
  const REGIONS = [
    { key: "South America", icon: "🌎", blurb: "Brazil — the historic heartland of the sport." },
    { key: "North America", icon: "🌎", blurb: "The USA — the modern no-gi powerhouse." },
    { key: "Europe", icon: "🌍", blurb: "A fast-rising scene led by the UK and Scandinavia." },
    { key: "Asia", icon: "🌏", blurb: "Japan's pioneers, the UAE-fueled Middle East boom, and a fast-rising Southeast Asian scene." },
    { key: "Oceania", icon: "🏝️", blurb: "Australia's leg-lock innovators and no-gi disruptors." }
  ];
  const REGION_BY_COUNTRY = {
    "Brazil": "South America",
    "USA": "North America",
    "Wales / UK": "Europe",
    "Norway": "Europe",
    "Japan": "Asia",
    "UAE": "Asia",
    "Philippines": "Asia",
    "Singapore": "Asia",
    "Australia": "Oceania"
  };
  const regionOf = (p) => REGION_BY_COUNTRY[p.country] || "Other";

  /* ---------- Tab navigation ---------- */
  function initTabs() {
    $$("nav.tabs button").forEach((btn) => {
      btn.addEventListener("click", () => {
        $$("nav.tabs button").forEach((b) => b.classList.remove("active"));
        $$(".view").forEach((v) => v.classList.remove("active"));
        btn.classList.add("active");
        $("#view-" + btn.dataset.view).classList.add("active");
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  /* ---------- Players ---------- */
  let activeFilter = "All";
  let activeRegion = "All";
  let searchTerm = "";

  function playerCard(p) {
    const r = rankOf(p);
    return `
      <div class="card" data-id="${p.id}" role="button" tabindex="0">
        <span class="tier-badge tier-${p.tier}">${p.tier}</span>
        <div class="top">
          <div class="avatar">${initials(p.name)}</div>
          <div>
            <h3>${esc(p.name)}</h3>
            ${p.nickname ? `<div class="nick">"${esc(p.nickname)}"</div>` : ""}
            <div class="meta">${p.flag} ${esc(p.country)} · ${esc(p.team)}</div>
            <div class="badge-row">
              ${p.subregion ? `<span class="subregion">📍 ${esc(p.subregion)}</span>` : ""}
              ${r ? `<span class="rank-pill" title="jiujitsu.net ranking (Weisshart Elo)">📊 #${r.rank}${r.rating ? ` · ${r.rating}` : ""}</span>` : ""}
            </div>
          </div>
        </div>
        <div class="tags">
          <span class="tag">${esc(p.division)}</span>
          <span class="tag">${esc(p.weight)}</span>
          <span class="tag">${esc(p.style)}</span>
        </div>
        <div class="mini-stats">
          <div class="m"><b>${p.stats.worldTitles}</b><span>World Titles</span></div>
          <div class="m"><b>${p.stats.adccGold}</b><span>ADCC Gold</span></div>
          <div class="m"><b>${p.stats.subRate}%</b><span>Finish Rate</span></div>
        </div>
      </div>`;
  }

  function renderPlayers() {
    const wrap = $("#player-grid");
    const list = window.PLAYERS.filter((p) => {
      const matchFilter =
        activeFilter === "All" ||
        (activeFilter === "Gi" && (p.division === "Gi" || p.division === "Both")) ||
        (activeFilter === "No-Gi" && (p.division === "No-Gi" || p.division === "Both")) ||
        (activeFilter === "GOAT" && p.tier === "GOAT") ||
        (activeFilter === "Women" && ["Beatriz Mesquita", "Ffion Davies", "Gabi Garcia", "Meggie Ochoa", "Constance Lien"].includes(p.name));
      const matchRegion = activeRegion === "All" || regionOf(p) === activeRegion;
      const t = searchTerm.toLowerCase();
      const matchSearch =
        !t ||
        p.name.toLowerCase().includes(t) ||
        p.nickname.toLowerCase().includes(t) ||
        p.team.toLowerCase().includes(t) ||
        p.country.toLowerCase().includes(t) ||
        p.style.toLowerCase().includes(t);
      return matchFilter && matchRegion && matchSearch;
    });

    if (!list.length) {
      wrap.innerHTML = `<div class="empty">No competitors match your search.</div>`;
      return;
    }

    // Group into region sections, preserving the canonical region order.
    const order = REGIONS.map((r) => r.key).concat("Other");
    const html = order.map((key) => {
      const meta = REGIONS.find((r) => r.key === key) || { key, icon: "🌐", blurb: "" };
      const members = list.filter((p) => regionOf(p) === key);
      if (!members.length) return "";
      return `
        <section class="region-section">
          <div class="region-head">
            <span class="ricon">${meta.icon}</span>
            <div class="region-title">
              <h3>${esc(meta.key)}</h3>
              ${meta.blurb ? `<span class="rblurb">${esc(meta.blurb)}</span>` : ""}
            </div>
            <span class="rcount">${members.length} athlete${members.length > 1 ? "s" : ""}</span>
          </div>
          <div class="grid">${members.map(playerCard).join("")}</div>
        </section>`;
    }).join("");

    wrap.innerHTML = html;

    $$(".card", wrap).forEach((card) => {
      const open = () => openModal(card.dataset.id);
      card.addEventListener("click", open);
      card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    });
  }

  function initPlayerControls() {
    $("#player-search").addEventListener("input", (e) => { searchTerm = e.target.value; renderPlayers(); });

    // Build region filter chips from the regions actually present in the data.
    const present = REGIONS.filter((r) => window.PLAYERS.some((p) => regionOf(p) === r.key));
    const regionBar = $("#region-filters");
    regionBar.innerHTML =
      `<button class="chip active" data-region="All">🌐 All Regions</button>` +
      present.map((r) => `<button class="chip" data-region="${esc(r.key)}">${r.icon} ${esc(r.key)}</button>`).join("");
    $$(".chip", regionBar).forEach((chip) => {
      chip.addEventListener("click", () => {
        $$(".chip", regionBar).forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        activeRegion = chip.dataset.region;
        renderPlayers();
      });
    });

    $$("#style-filters .chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        $$("#style-filters .chip").forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        activeFilter = chip.dataset.filter;
        renderPlayers();
      });
    });
  }

  /* ---------- Player modal ---------- */
  function barRow(key, val) {
    return `
      <div class="bar-row">
        <div class="lbl"><span>${STAT_LABELS[key] || key}</span><b>${val}</b></div>
        <div class="bar-track"><div class="bar-fill" data-w="${val}" style="width:0%"></div></div>
      </div>`;
  }

  function openModal(id) {
    const p = window.PLAYERS.find((x) => x.id === id);
    if (!p) return;
    const statKeys = ["control", "submissions", "guard", "takedowns", "cardio", "subRate"];
    const body = $("#modal-content");
    body.innerHTML = `
      <div class="modal-hero">
        <button class="modal-close" aria-label="Close">✕</button>
        <div class="id">
          <div class="avatar">${initials(p.name)}</div>
          <div>
            <h2>${esc(p.name)}</h2>
            ${p.nickname ? `<div class="nick">"${esc(p.nickname)}"</div>` : ""}
            <div class="meta">${p.flag} ${esc(p.country)} · ${esc(p.team)} · ${esc(p.belt)} Belt${p.born ? " · b. " + p.born : ""}</div>
            <div class="meta">${esc(p.division)} · ${esc(p.weight)} · <span style="color:var(--accent-2)">${esc(p.style)}</span></div>
            ${p.subregion ? `<div class="subregion">📍 ${esc(p.subregion)}</div>` : ""}
          </div>
        </div>
      </div>
      <div class="modal-body">
        <div class="accolades">${p.accolades.map((a) => `<span class="accolade">🏅 ${esc(a)}</span>`).join("")}</div>

        ${(() => { const r = rankOf(p); return `
        <a class="jjnet-link" href="${jjNetUrl(p)}" target="_blank" rel="noopener noreferrer">
          📊 ${r ? `Ranked <b>#${r.rank}</b>${r.rating ? ` · Elo ${r.rating}` : ""} on jiujitsu.net` : `Current ranking &amp; Elo for ${esc(p.name)} on jiujitsu.net`} ↗
        </a>`; })()}

        <div class="stat-block">
          <h4>Attribute Rating <span class="rating-src">— editorial scouting estimate; see jiujitsu.net for official Elo rankings</span></h4>
          <div class="bars">${statKeys.map((k) => barRow(k, p.stats[k])).join("")}</div>
        </div>

        <div class="stat-block">
          <h4>Signature Techniques</h4>
          <div class="sig-list">${p.signature.map((s) => `<span class="tag">${esc(s)}</span>`).join("")}</div>
        </div>

        <div class="sw-grid">
          <div class="sw-block str">
            <h4>▲ Strengths</h4>
            <p>${esc(p.strengths)}</p>
          </div>
          <div class="sw-block weak">
            <h4>▼ Weaknesses</h4>
            <p>${esc(p.weaknesses)}</p>
          </div>
        </div>
      </div>`;

    const backdrop = $("#modal");
    backdrop.classList.add("open");
    document.body.style.overflow = "hidden";
    $(".modal-close", body).addEventListener("click", closeModal);
    // animate bars
    requestAnimationFrame(() => {
      setTimeout(() => $$(".bar-fill", body).forEach((f) => { f.style.width = f.dataset.w + "%"; }), 60);
    });
  }

  function closeModal() {
    $("#modal").classList.remove("open");
    document.body.style.overflow = "";
  }

  function initModal() {
    $("#modal").addEventListener("click", (e) => { if (e.target.id === "modal") closeModal(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
  }

  /* ---------- Knowledge base ---------- */
  function renderKnowledge() {
    const K = window.KNOWLEDGE;
    const wrap = $("#kb-content");
    let html = "";

    // History
    html += kbCard(K.history, K.history.entries.map((e) =>
      `<div class="kb-entry"><h5>${esc(e.h)}</h5><p>${esc(e.t)}</p></div>`).join(""));

    // Belts
    html += kbCard(K.belts, `
      <div class="belt-strip">
        ${K.belts.ranks.map((r) => `
          <div class="belt-row">
            <div class="belt-chip" style="background:${r.color};color:${r.text}">${esc(r.belt)}</div>
            <p>${esc(r.desc)}</p>
          </div>`).join("")}
      </div>
      <div class="kb-entry" style="margin-top:14px"><p><b style="color:var(--accent-2)">Youth ranks:</b> ${esc(K.belts.kidsNote)}</p></div>`);

    // Gi vs No-Gi
    html += kbCard(K.giNoGi, K.giNoGi.entries.map((e) =>
      `<div class="kb-entry"><h5>${esc(e.h)}</h5><p>${esc(e.t)}</p></div>`).join(""));

    // Positions
    html += kbCard(K.positions, `
      <div class="pos-ladder">
        ${K.positions.items.map((i) => `
          <div class="pos-item">
            <div class="val">${i.value}</div>
            <div class="txt"><b>${esc(i.name)}</b><span>${esc(i.note)}</span></div>
          </div>`).join("")}
      </div>`);

    // Submissions
    html += kbCard(K.submissions, `
      <div class="sub-cols">
        ${K.submissions.groups.map((g) => `
          <div class="sub-fam">
            <h5 style="color:${g.color}">${esc(g.family)}</h5>
            ${g.subs.map((s) => `<div class="sub-item"><b>${esc(s.name)}</b><span>${esc(s.note)}</span></div>`).join("")}
          </div>`).join("")}
      </div>`);

    // Rules
    html += kbCard(K.rules, `
      <div class="sys-grid">
        ${K.rules.systems.map((s) => `<div class="sys-card"><b>${esc(s.name)}</b><p>${esc(s.desc)}</p></div>`).join("")}
      </div>`);

    // Events
    html += kbCard(K.events, `
      <div class="event-list">
        ${K.events.items.map((i) => `<div class="event-item"><b>${esc(i.name)}</b><p>${esc(i.note)}</p></div>`).join("")}
      </div>`);

    wrap.innerHTML = html;

    // KB quick-nav
    const nav = $("#kb-nav");
    const sections = [K.history, K.belts, K.giNoGi, K.positions, K.submissions, K.rules, K.events];
    nav.innerHTML = sections.map((s, i) =>
      `<button class="chip" data-target="kb-${i}">${s.icon} ${esc(s.title)}</button>`).join("");
    $$(".chip", nav).forEach((c) => c.addEventListener("click", () => {
      const el = $("#" + c.dataset.target);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }));
  }

  let kbIndex = 0;
  function kbCard(section, inner) {
    const id = "kb-" + kbIndex++;
    return `
      <div class="kb-card" id="${id}">
        <h3>${section.icon} ${esc(section.title)}</h3>
        <p class="intro">${esc(section.intro)}</p>
        ${inner}
      </div>`;
  }

  /* ---------- Business ---------- */
  function renderBusiness() {
    const B = window.BUSINESS;
    const wrap = $("#biz-content");
    let html = `<p class="section-sub">${esc(B.intro)}</p>`;

    html += B.categories.map((cat) => `
      <div class="biz-cat">
        <h3>${cat.icon} ${esc(cat.name)}</h3>
        <div class="cat-bar" style="background:${cat.color}"></div>
        <div class="biz-grid">
          ${cat.companies.map((c) => `
            <div class="biz-card">
              <div class="biz-head">
                <h4>${esc(c.name)}</h4>
                <span class="scale">${esc(c.scale)}</span>
              </div>
              <div class="model">${esc(c.model)}</div>
              <p class="detail">${esc(c.detail)}</p>
            </div>`).join("")}
        </div>
      </div>`).join("");

    html += `
      <div class="takeaways">
        <h3>💡 Where the money really is</h3>
        <ul>${B.takeaways.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      </div>`;

    wrap.innerHTML = html;
  }

  /* ---------- Rankings (live from jiujitsu.net) ---------- */
  function renderRankings() {
    const wrap = $("#rankings-content");
    const R = RANKINGS;
    const athletes = R.athletes || [];

    // Map ranking-name slug -> our profile id, so ranked athletes we also
    // cover become clickable links into the Atlas.
    const rosterBySlug = {};
    window.PLAYERS.forEach((p) => { rosterBySlug[slugify(p.rankingName || p.name)] = p.id; });

    const synced = R.updated ? `Last synced ${new Date(R.updated).toISOString().slice(0, 10)}` : "Awaiting first sync";
    const header = `
      <div class="rank-src-note">
        Pulled live from <a href="${JJNET}" target="_blank" rel="noopener noreferrer">jiujitsu.net</a> via Tavily —
        ${R.scope ? esc(R.scope) : "current standings"} (unofficial IBJJF · Weisshart Elo rating).
        <b>${synced}${athletes.length ? ` · ${athletes.length} athletes` : ""}.</b>
        Athletes also profiled in this Atlas are highlighted — tap to open their card.
      </div>`;

    if (!athletes.length) {
      wrap.innerHTML = header + `<div class="empty">No rankings synced yet. Once the TAVILY_API_KEY secret is set and the "Update rankings" workflow runs, the current jiujitsu.net standings appear here.</div>`;
      return;
    }

    const rows = athletes.map((a) => {
      const pid = rosterBySlug[slugify(a.name)];
      const mine = !!pid;
      return `
        <div class="lb-row${mine ? " lb-mine" : ""}"${mine ? ` data-id="${pid}" role="button" tabindex="0"` : ""}>
          <span class="lb-rank">#${a.rank}</span>
          <span class="lb-name">${esc(a.name)}${mine ? ` <span class="lb-tag">in Atlas ↗</span>` : ""}</span>
          <span class="lb-rating">${a.rating != null ? a.rating : "—"}</span>
          <a class="lb-ext" href="${JJNET}/athlete/${slugify(a.name)}" target="_blank" rel="noopener noreferrer" title="View on jiujitsu.net" aria-label="View ${esc(a.name)} on jiujitsu.net">↗</a>
        </div>`;
    }).join("");

    wrap.innerHTML = header + `
      <div class="leaderboard">
        <div class="lb-row lb-head">
          <span class="lb-rank">Rank</span>
          <span class="lb-name">Athlete</span>
          <span class="lb-rating">Elo</span>
          <span class="lb-ext"></span>
        </div>
        ${rows}
      </div>`;

    $$(".lb-row.lb-mine", wrap).forEach((row) => {
      const open = (e) => { if (e.target.closest(".lb-ext")) return; openModal(row.dataset.id); };
      row.addEventListener("click", open);
      row.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openModal(row.dataset.id); } });
    });
  }

  /* ---------- Game Plan Lab (Noah Lim matchups) ---------- */
  const NOAH_ID = "noah-lim";
  const GP_ATTRS = [
    ["cardio", "Cardio"], ["submissions", "Submissions"], ["guard", "Guard"],
    ["control", "Control"], ["takedowns", "Takedowns"], ["subRate", "Finish Rate"]
  ];

  // Derive fighting tendencies from the existing data (single source of truth).
  function fighterTags(p) {
    const s = p.stats;
    const blob = ((p.style || "") + " " + (p.signature || []).join(" ") + " " + (p.strengths || "")).toLowerCase();
    return {
      legLocker: /leg[- ]?lock|heel|ankle|kneebar|entangle|z-guard|k-guard/.test(blob),
      topPressure: s.control >= 90 || /pressure|passing|top control|body[- ]?lock/.test(blob),
      guardHeavy: s.guard >= 90 || /guard/.test(blob),
      submissionThreat: s.submissions >= 90 || /submission|choke|finish/.test(blob),
      wrestler: s.takedowns >= 82 || /takedown|wrestl/.test(blob),
      backAttack: /back/.test(blob),
      veteranMeta: p.born && p.born < 1992
    };
  }

  const avg6 = (s) => Math.round((s.cardio + s.submissions + s.guard + s.control + s.takedowns + s.subRate) / 6 * 10) / 10;

  function edgeTip(k, opp) {
    switch (k) {
      case "cardio": return `Drag ${opp} into deep water. Noah's gas tank is his equalizer — set a punishing pace, extend the match, and hunt the finish when their output drops late.`;
      case "submissions": return `Turn every scramble into a submission entry. Noah's finishing threat is higher here — keep transitions chaotic where his sub-hunting shines rather than settling into static positions.`;
      case "guard": return `Weaponize the bottom. An active, attacking guard is a real edge — threaten sweeps and submissions off your back instead of just surviving.`;
      case "control": return `Once you pass, clamp down. Noah can out-grind ${opp} from top — pass, pin, and layer attacks to break them.`;
      case "takedowns": return `Dictate where it happens. Win the hand-fight and choose standing vs. mat — don't let ${opp} set the location.`;
      case "subRate": return `Play for the tap, not the scorecard. Noah closes at a higher rate — force the finish and don't leave it to the judges.`;
    }
  }
  function threatTip(k, opp) {
    switch (k) {
      case "control": return `Respect ${opp}'s top pressure. Prioritize guard retention and early re-guards; never let them settle into a dominant pin or mount.`;
      case "submissions": return `${opp} is a lethal finisher. Be disciplined in scrambles — don't over-commit to attacks that expose the neck or an isolated arm.`;
      case "guard": return `Don't dive into ${opp}'s guard. Pass conservatively (knee-cut, heavy pressure, feet back) or keep it standing to deny their sweeps and submissions.`;
      case "takedowns": return `${opp} owns the wrestling. Be first to grips, ready to sprawl, and willing to pull guard on your own terms rather than lose a scramble.`;
      case "cardio": return `Don't turn it into a track meet — ${opp}'s conditioning matches yours. Pick your bursts instead of emptying the tank early.`;
      case "subRate": return `${opp} finishes fights. Treat every position as dangerous, stay technically tight, and never concede a lazy grip.`;
    }
  }

  function buildMatchup(oppId) {
    const noah = window.PLAYERS.find((p) => p.id === NOAH_ID);
    const opp = window.PLAYERS.find((p) => p.id === oppId);
    if (!noah || !opp) return null;

    const edges = [], threats = [], even = [];
    GP_ATTRS.forEach(([k, label]) => {
      const d = noah.stats[k] - opp.stats[k];
      const row = { k, label, d, n: noah.stats[k], o: opp.stats[k] };
      if (d >= 3) edges.push(row); else if (d <= -3) threats.push(row); else even.push(row);
    });
    edges.sort((a, b) => b.d - a.d);
    threats.sort((a, b) => a.d - b.d);

    const nIdx = avg6(noah.stats), oIdx = avg6(opp.stats);
    const gap = Math.round((nIdx - oIdx) * 10) / 10;
    let verdict, vclass;
    if (gap >= 4) { verdict = "Favoured on paper — Noah's profile stacks up well here."; vclass = "gp-fav"; }
    else if (gap > -4) { verdict = "A genuinely close, winnable matchup."; vclass = "gp-even"; }
    else if (gap > -12) { verdict = "Noah's the underdog — but there's a live upset path with the right game plan."; vclass = "gp-dog"; }
    else { verdict = "A major step up in class. It's a long shot, but the narrow path below is how it happens."; vclass = "gp-longshot"; }

    const tags = fighterTags(opp);
    const plan = [];
    if (edges[0]) plan.push(edgeTip(edges[0].k, opp.name));
    if (edges[1]) plan.push(edgeTip(edges[1].k, opp.name));
    if (threats[0]) plan.push(threatTip(threats[0].k, opp.name));
    // style-based exploit
    if (tags.veteranMeta) plan.push(`${opp.name} built their peak in an earlier meta — pressure them with modern leg-lock and scramble threats and test their pace over a long, high-output match.`);
    else if (tags.topPressure) plan.push(`Keep it dynamic. Deny the grips and slow, heavy pace ${opp.name} wants — constant movement and scrambles pull them out of their comfort zone.`);
    else if (tags.legLocker) plan.push(`Manage the legs all match. Expect entanglement entries from ${opp.name}: hide your feet, clear the knee-line early, and stay calm — never panic-yank out of a heel-hook position.`);
    else if (tags.guardHeavy) plan.push(`Stay out of ${opp.name}'s guard. Attack from standing or pass with heavy low pressure; don't get drawn into their sweep-and-submit traps.`);
    // youth x-factor
    plan.push(`Lean on the X-factor: Noah is far younger and fresher. Bank on the later rounds, force a scramble-heavy fight, and make ${opp.name} work for every position.`);

    return { noah, opp, edges, threats, even, nIdx, oIdx, gap, verdict, vclass, plan };
  }

  function attrBar(row) {
    const nBetter = row.d > 0, oBetter = row.d < 0;
    const tag = row.d === 0 ? "even" : (row.d > 0 ? `Noah +${row.d}` : `${row.d}`);
    return `
      <div class="mc-attr">
        <div class="mc-attr-label">${row.label}<span class="mc-delta ${nBetter ? "up" : oBetter ? "down" : ""}">${tag}</span></div>
        <div class="mc-bars">
          <div class="mc-side">
            <span class="mc-val">${row.n}</span>
            <div class="mc-track"><div class="mc-fill noah" style="width:${row.n}%"></div></div>
          </div>
          <div class="mc-side opp">
            <div class="mc-track"><div class="mc-fill opp" style="width:${row.o}%"></div></div>
            <span class="mc-val">${row.o}</span>
          </div>
        </div>
      </div>`;
  }

  function renderMatchup(oppId) {
    const wrap = $("#matchup-result");
    const m = buildMatchup(oppId);
    if (!m) { wrap.innerHTML = ""; return; }
    const { noah, opp } = m;

    wrap.innerHTML = `
      <div class="mc-versus">
        <div class="mc-fighter">
          <div class="avatar">${initials(noah.name)}</div>
          <div><b>${esc(noah.name)}</b><span>${noah.flag} ${esc(noah.weight)} · <span class="tier-${noah.tier}" style="padding:1px 6px;border-radius:10px">${noah.tier}</span></span></div>
        </div>
        <div class="mc-vs">VS</div>
        <div class="mc-fighter opp">
          <div><b>${esc(opp.name)}</b><span>${opp.flag} ${esc(opp.weight)} · <span class="tier-${opp.tier}" style="padding:1px 6px;border-radius:10px">${opp.tier}</span></span></div>
          <div class="avatar opp-av">${initials(opp.name)}</div>
        </div>
      </div>

      <div class="mc-verdict ${m.vclass}">
        <div class="mc-verdict-txt"><b>${esc(m.verdict)}</b></div>
        <div class="mc-index" title="Composite of the six editorial attributes">
          <span>${m.nIdx}</span><small>Noah</small>
          <em>composite index</em>
          <span>${m.oIdx}</span><small>${esc(opp.name.split(" ")[0])}</small>
        </div>
      </div>

      <div class="mc-resume">
        <div><b>${noah.stats.worldTitles}</b><span>Noah — Gi world titles</span></div>
        <div><b>${noah.stats.adccGold}</b><span>Noah — ADCC golds</span></div>
        <div class="vsep"></div>
        <div><b>${opp.stats.worldTitles}</b><span>${esc(opp.name.split(" ")[0])} — world titles</span></div>
        <div><b>${opp.stats.adccGold}</b><span>${esc(opp.name.split(" ")[0])} — ADCC golds</span></div>
      </div>
      <p class="mc-basis">Historical basis: ${esc(opp.name)} — ${opp.accolades.map(esc).join(" · ")}.</p>

      <h4 class="mc-h">Attribute matchup</h4>
      <div class="mc-attrs">${GP_ATTRS.map(([k]) => attrBar([...m.edges, ...m.threats, ...m.even].find((r) => r.k === k))).join("")}</div>

      <div class="mc-cols">
        <div class="mc-col edges">
          <h4>▲ Noah's edges to press</h4>
          ${m.edges.length ? m.edges.map((e) => `<div class="mc-item"><b>${e.label} <span>(+${e.d})</span></b><p>${esc(edgeTip(e.k, opp.name))}</p></div>`).join("") : `<p class="mc-none">No clear attribute edge — Noah must win on pace, youth, and scrambles.</p>`}
        </div>
        <div class="mc-col threats">
          <h4>▼ Threats to respect</h4>
          ${m.threats.length ? m.threats.map((t) => `<div class="mc-item"><b>${t.label} <span>(${t.d})</span></b><p>${esc(threatTip(t.k, opp.name))}</p></div>`).join("") : `<p class="mc-none">No glaring disadvantage — a rare even-or-better matchup for Noah.</p>`}
        </div>
      </div>

      <h4 class="mc-h">🎯 Game plan for Noah</h4>
      <ol class="mc-plan">${m.plan.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>

      <p class="mc-disclaimer">This is an analytical model built from each athlete's editorial attributes, style, and record — not a prediction or a log of real head-to-head bouts. Treat it as a coaching-style scouting aid.</p>`;
  }

  function renderGamePlan() {
    const sel = $("#opp-select");
    if (!sel) return;
    const tierRank = { GOAT: 0, Legend: 1, Elite: 2, Rising: 3 };
    const opps = window.PLAYERS.filter((p) => p.id !== NOAH_ID)
      .sort((a, b) => (tierRank[a.tier] - tierRank[b.tier]) || a.name.localeCompare(b.name));
    sel.innerHTML = opps.map((p) => `<option value="${p.id}">${p.flag} ${esc(p.name)} — ${p.tier}</option>`).join("");
    const def = opps.find((p) => p.id === "kade-ruotolo") ? "kade-ruotolo" : opps[0].id;
    sel.value = def;
    sel.addEventListener("change", () => renderMatchup(sel.value));
    renderMatchup(def);
  }

  /* ---------- KPIs ---------- */
  function renderHeroKpis() {
    const goats = window.PLAYERS.filter((p) => p.tier === "GOAT").length;
    const totalTitles = window.PLAYERS.reduce((s, p) => s + p.stats.worldTitles, 0);
    const totalAdcc = window.PLAYERS.reduce((s, p) => s + p.stats.adccGold, 0);
    const regions = new Set(window.PLAYERS.map(regionOf));
    $("#kpi-players").textContent = window.PLAYERS.length;
    $("#kpi-titles").textContent = totalTitles + "+";
    $("#kpi-adcc").textContent = totalAdcc + "+";
    $("#kpi-regions").textContent = regions.size;
    $("#kpi-goats").textContent = goats;
  }

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    initTabs();
    initPlayerControls();
    initModal();
    renderPlayers();
    renderHeroKpis();
    renderKnowledge();
    renderBusiness();
    renderRankings();
    renderGamePlan();
    $("#year").textContent = new Date().getFullYear();

    const ru = $("#rank-updated");
    if (ru) {
      if (RANKINGS.updated) {
        const d = new Date(RANKINGS.updated);
        const n = RANKINGS.athletes.length;
        const scope = RANKINGS.scope ? ` · ${RANKINGS.scope}` : "";
        ru.textContent = `Last synced ${d.toISOString().slice(0, 10)}${n ? ` · ${n} ranked athletes` : ""}${scope}.`;
      } else {
        ru.textContent = "Rankings sync pending — links go to live jiujitsu.net pages meanwhile.";
      }
    }
  });
})();
