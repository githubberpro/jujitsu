/* ===== Jiu-Jitsu Atlas — app logic ===== */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const initials = (name) => name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

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
    { key: "Asia", icon: "🌏", blurb: "Japan's pioneers, the UAE-fueled Middle East boom, and a fast-rising Southeast Asian scene." }
  ];
  const REGION_BY_COUNTRY = {
    "Brazil": "South America",
    "USA": "North America",
    "Wales / UK": "Europe",
    "Norway": "Europe",
    "Japan": "Asia",
    "UAE": "Asia",
    "Philippines": "Asia",
    "Singapore": "Asia"
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
    return `
      <div class="card" data-id="${p.id}" role="button" tabindex="0">
        <span class="tier-badge tier-${p.tier}">${p.tier}</span>
        <div class="top">
          <div class="avatar">${initials(p.name)}</div>
          <div>
            <h3>${esc(p.name)}</h3>
            ${p.nickname ? `<div class="nick">"${esc(p.nickname)}"</div>` : ""}
            <div class="meta">${p.flag} ${esc(p.country)} · ${esc(p.team)}</div>
            ${p.subregion ? `<div class="subregion">📍 ${esc(p.subregion)}</div>` : ""}
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

        <div class="stat-block">
          <h4>Attribute Rating</h4>
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
    $("#year").textContent = new Date().getFullYear();
  });
})();
