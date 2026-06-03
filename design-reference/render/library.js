/* AISELLING — My Library dashboard */
(function () {
  const { icon } = window;
  const { fmt, catName } = window.UI;

  function library() {
    const L = window.AISELLING.LIBRARY;
    const sideItem = (ic, label, count, active) =>
      `<a class="lib-nav ${active ? "is-active" : ""}">${icon(ic)} ${label}${count != null ? `<span class="count">${count}</span>` : ""}</a>`;

    const stat = (k, kicon, v, d) => `<div class="stat-card">
      <div class="k">${icon(kicon)} ${k}</div>
      <div class="v">${v}</div>
      <div class="d">${d}</div>
    </div>`;

    return `<div class="lib-shell">
      <aside class="lib-side">
        ${sideItem("grid", "All products", L.length, true)}
        ${sideItem("flame", "In progress", 2)}
        ${sideItem("heart", "Favorites", 4)}
        ${sideItem("download", "Downloads", 4)}
        <div class="lib-side-label">Categories</div>
        ${sideItem("sparkles", "Prompt Packs", 2)}
        ${sideItem("layers", "Templates", 1)}
        ${sideItem("play", "Courses", 1)}
        ${sideItem("bolt", "Automation", 1)}
        ${sideItem("book", "Ebooks", 1)}
        <div class="lib-side-label">Account</div>
        ${sideItem("user", "Profile")}
        ${sideItem("settings", "Settings")}
      </aside>

      <main class="lib-main">
        <div class="lib-header">
          <div>
            <h1>Welcome back, Alex</h1>
            <p class="sub">You own ${L.length} products · keep building your edge.</p>
          </div>
          <button class="btn btn-primary" onclick="GO('landing','#featured')">${icon("sparkles")} Discover more</button>
        </div>

        <div class="lib-stats">
          ${stat("Products owned", "grid", L.length, "Across 5 categories")}
          ${stat("In progress", "flame", "2", "AI in 7 Days · 57%")}
          ${stat("Hours learned", "clock", "11.5", "+2.5 this week")}
          ${stat("Certificates", "award", "1", "AI in 7 Days")}
        </div>

        <div class="lib-tabs">
          <button class="lib-tab is-active">All</button>
          <button class="lib-tab">Courses</button>
          <button class="lib-tab">Templates &amp; kits</button>
          <button class="lib-tab">Files</button>
        </div>

        <div class="grid-library">
          ${L.map(libItem).join("")}
        </div>
      </main>
    </div>`;
  }

  function libItem(p) {
    const isCourse = p.cat === "courses";
    const primary = isCourse
      ? `<button class="btn btn-primary btn-sm grow" onclick="GO('detail','${p.id}')">${icon("play")} ${p.progress === 100 ? "Review" : "Continue"}</button>`
      : `<button class="btn btn-primary btn-sm grow" onclick="GO('detail','${p.id}')">${icon("download")} ${p.cat === "templates" ? "Open" : "Download"}</button>`;

    const progressBlock = isCourse
      ? `<div style="display:flex;flex-direction:column;gap:6px">
           <div class="progress-label"><span>${p.meta}</span><span>${p.progress}%</span></div>
           <div class="progress-track"><span class="progress-fill" style="width:${p.progress}%"></span></div>
         </div>`
      : `<div class="row gap-2"><span class="badge badge-success">${icon("check")} ${p.status}</span><span class="faint" style="font-size:var(--text-xs)">${p.meta}</span></div>`;

    return `<article class="lib-item">
      <div class="lib-item-media">
        <div class="cover ${p.grad}">
          <span class="cover-glyph">${icon(p.glyph)}</span>
          <span class="cover-tag">${catName(p.cat)}</span>
        </div>
      </div>
      <div class="lib-item-body">
        <span class="pcard-cat">${catName(p.cat)}</span>
        <h3 class="lib-item-title">${p.title}</h3>
        ${progressBlock}
        <div class="lib-item-foot">
          ${primary}
          <button class="btn btn-secondary btn-icon btn-sm" aria-label="Details" onclick="GO('detail','${p.id}')">${icon("chevR")}</button>
        </div>
      </div>
    </article>`;
  }

  window.SCREENS = window.SCREENS || {};
  window.SCREENS.library = library;
})();
