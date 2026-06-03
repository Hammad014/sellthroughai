/* AISELLING — shared chrome: nav, footer, product card, cover art */
(function () {
  const { icon, starRow } = window;

  function cover(p, opts) {
    const o = opts || {};
    const tag = o.tag ? `<span class="cover-tag">${o.tag}</span>` : "";
    return `<div class="cover ${p.grad}">
      <span class="cover-glyph">${icon(p.glyph)}</span>
      ${tag}
      ${o.fav ? `<button class="pcard-fav" aria-label="Save to favorites" onclick="event.stopPropagation();this.classList.toggle('is-on')">${icon("heart")}</button>` : ""}
    </div>`;
  }

  function money(n) { return "$" + n; }

  function productCard(p) {
    const wasHtml = p.was ? `<span class="strike price">${money(p.was)}</span>` : "";
    const badge = p.badge ? `<span class="cover-tag" style="left:auto;right:var(--space-3);background:var(--accent);color:var(--accent-fg);border-color:transparent">${p.badge}</span>` : "";
    return `<article class="pcard" onclick="GO('detail','${p.id}')">
      <div class="pcard-media">
        <div class="cover ${p.grad}">
          <span class="cover-glyph">${icon(p.glyph)}</span>
          ${badge}
          <button class="pcard-fav" aria-label="Save" onclick="event.stopPropagation();this.classList.toggle('is-on')">${icon("heart")}</button>
        </div>
      </div>
      <div class="pcard-body">
        <span class="pcard-cat">${catName(p.cat)}</span>
        <h3 class="pcard-title">${p.title}</h3>
        <p class="pcard-desc">${p.desc}</p>
        <div class="pcard-meta">
          <span class="rating">${starRow(p.rating)}<span class="rating-val">${p.rating.toFixed(1)}</span></span>
          <span class="pcard-sales">${fmt(p.sales)} sold</span>
        </div>
        <div class="pcard-foot">
          <div class="row gap-2"><span class="pcard-price">${money(p.price)}</span>${wasHtml}</div>
          <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();GO('detail','${p.id}')">${icon("cart")} View</button>
        </div>
      </div>
    </article>`;
  }

  function fmt(n) { return n >= 1000 ? (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "k" : "" + n; }
  function catName(id) {
    const c = window.AISELLING.CATEGORIES.find((x) => x.id === id);
    return c ? c.name.replace(" & Productivity Templates", " Templates").replace("Notion Templates", "Notion Template") : id;
  }

  function nav(active) {
    const link = (id, label) => `<a class="nav-link ${active === id ? "is-active" : ""}" onclick="GO('${id}')">${label}</a>`;
    return `<nav class="nav">
      <div class="nav-inner">
        <a class="logo" onclick="GO('landing')">
          <span class="logo-mark">${icon("logo")}</span>
          <span>ai<b>selling</b></span>
        </a>
        <div class="nav-links">
          ${link("landing", "Browse")}
          <a class="nav-link" onclick="GO('landing','#categories')">Categories</a>
          <a class="nav-link" onclick="GO('detail')">Bestsellers</a>
          <a class="nav-link" onclick="GO('landing','#pricing')">For teams</a>
        </div>
        <div class="nav-right">
          <label class="nav-search">
            ${icon("search")}
            <input placeholder="Search products…" />
            <span class="kbd">⌘K</span>
          </label>
          <button class="btn btn-icon btn-ghost cart-dot" aria-label="Cart">${icon("cart")}</button>
          <button class="btn btn-icon btn-ghost theme-toggle" aria-label="Toggle theme" onclick="TOGGLE_THEME()" id="themeBtn">${icon("moon")}</button>
          <button class="btn btn-secondary" onclick="GO('library')">${icon("folder")} My Library</button>
        </div>
      </div>
    </nav>`;
  }

  function footer() {
    const col = (h, links) => `<div class="footer-col"><h4>${h}</h4>${links.map((l) => `<a>${l}</a>`).join("")}</div>`;
    return `<footer class="footer">
      <div class="container container-wide">
        <div class="footer-inner">
          <div class="footer-brand">
            <a class="logo" onclick="GO('landing')"><span class="logo-mark">${icon("logo")}</span><span>ai<b>selling</b></span></a>
            <p>Premium AI tools for people who'd rather get the work done than fight the tools. Buy once, own forever.</p>
          </div>
          ${col("Products", ["Prompt Packs", "Notion Templates", "Mini-Courses", "Automation Kits", "Ebooks"])}
          ${col("Company", ["About", "Creators", "Affiliates", "Careers", "Press"])}
          ${col("Resources", ["Help center", "Blog", "Changelog", "Roadmap"])}
          ${col("Legal", ["Terms", "Privacy", "Licenses", "Refunds"])}
        </div>
        <div class="footer-bottom">
          <p>© 2026 Aiselling, Inc. — Crafted for the AI-curious.</p>
          <div class="footer-social">
            <button class="btn btn-icon btn-ghost btn-sm" aria-label="X">${icon("twitter")}</button>
            <button class="btn btn-icon btn-ghost btn-sm" aria-label="GitHub">${icon("github")}</button>
            <button class="btn btn-icon btn-ghost btn-sm" aria-label="LinkedIn">${icon("linkedin")}</button>
          </div>
        </div>
      </div>
    </footer>`;
  }

  window.UI = { cover, productCard, nav, footer, money, fmt, catName };
})();
