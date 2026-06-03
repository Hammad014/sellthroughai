/* AISELLING — landing page */
(function () {
  const { icon, starRow } = window;

  function hero() {
    const P = window.AISELLING.PRODUCTS;
    return `<section class="hero">
      <div class="hero-bg"></div>
      <div class="container container-wide">
        <div class="hero-inner">
          <div class="hero-copy">
            <span class="hero-pill"><span class="badge badge-accent">New</span> Content Engine for n8n just dropped</span>
            <h1>AI tools that<br><em>just work</em> — no code required.</h1>
            <p class="hero-sub">Prompt packs, Notion systems, mini-courses and automation kits — curated for professionals who want results, not a research project.</p>
            <div class="hero-cta">
              <button class="btn btn-primary btn-lg" onclick="GO('landing','#featured')">Browse the catalog ${icon("arrowR")}</button>
              <button class="btn btn-outline btn-lg" onclick="GO('detail','ai-in-7')">See a sample course</button>
            </div>
            <div class="hero-trust">
              <div class="stat"><b>120k+</b><span>Happy buyers</span></div>
              <div class="divider"></div>
              <div class="stat"><b>4.8/5</b><span>Avg. rating</span></div>
              <div class="divider"></div>
              <div class="stat"><b>150+</b><span>Products</span></div>
            </div>
          </div>
          <div class="hero-visual">
            <div class="hero-card hero-card-2">${miniCover(P[4])}</div>
            <div class="hero-card hero-card-1">${miniCover(P[2])}</div>
            <div class="hero-card hero-card-3">${miniCover(P[0])}</div>
            <div class="hero-float-badge hero-float-1">${icon("shield")} Lifetime access</div>
          </div>
        </div>
      </div>
    </section>
    <div class="container container-wide" style="padding-bottom:var(--space-16)">
      <div class="logocloud">
        <span>Notion</span><span>Zapier</span><span>Make</span><span>n8n</span><span>OpenAI</span><span>Claude</span>
      </div>
    </div>`;
  }

  function miniCover(p) {
    return `<div class="cover ${p.grad}"><span class="cover-glyph">${icon(p.glyph)}</span><span class="cover-tag">${p.title}</span></div>`;
  }

  function featured() {
    const P = window.AISELLING.PRODUCTS;
    const picks = [P[2], P[0], P[3], P[1], P[7], P[4]];
    return `<section class="section" id="featured">
      <div class="container container-wide">
        <div class="section-head">
          <div>
            <span class="eyebrow">${icon("flame")} Trending now</span>
            <h2 class="section-title" style="margin-top:var(--space-3)">Featured products</h2>
            <p class="section-sub">Hand-picked by our team — the tools buyers keep coming back for.</p>
          </div>
          <button class="btn btn-ghost" onclick="GO('landing','#categories')">View all ${icon("chevR")}</button>
        </div>
        <div class="scroller">
          ${picks.map(window.UI.productCard).join("")}
        </div>
      </div>
    </section>`;
  }

  function categories() {
    const C = window.AISELLING.CATEGORIES;
    const hue = { prompts: 270, templates: 215, courses: 165, automation: 50, ebooks: 330 };
    const card = (c, feature) => `<article class="cat-card ${feature ? "is-feature" : ""}" onclick="GO('landing','#featured')">
      <div class="cat-orb ${c.grad}"></div>
      <div class="cat-icon">${icon(c.icon)}</div>
      <div class="cat-body">
        <h3>${c.name.replace(" & Productivity Templates", " Templates")}</h3>
        <p>${c.blurb}</p>
        <span class="cat-count">${c.count} products ${icon("arrowR")}</span>
      </div>
    </article>`;
    return `<section class="section section-tight" id="categories">
      <div class="container container-wide">
        <div class="section-head">
          <div>
            <span class="eyebrow">${icon("grid")} Shop by category</span>
            <h2 class="section-title" style="margin-top:var(--space-3)">Find your next unfair advantage</h2>
          </div>
        </div>
        <div class="grid-cats">
          ${card(C[0], true)}
          ${card(C[1])}
          ${card(C[2])}
          ${card(C[3])}
          ${card(C[4])}
        </div>
      </div>
    </section>`;
  }

  function testimonials() {
    const T = window.AISELLING.TESTIMONIALS;
    const card = (t) => `<figure class="testi">
      <span class="rating">${starRow(5)}</span>
      <blockquote class="testi-quote">“${t.quote}”</blockquote>
      <figcaption class="testi-foot">
        <span class="avatar" style="background:oklch(0.6 0.16 ${t.hue})">${t.initials}</span>
        <span><span class="testi-name" style="display:block">${t.name}</span><span class="testi-role">${t.role}</span></span>
      </figcaption>
    </figure>`;
    return `<section class="section testi-band">
      <div class="container container-wide">
        <div class="section-head">
          <div>
            <span class="eyebrow">${icon("heart")} Loved by 120,000+ pros</span>
            <h2 class="section-title" style="margin-top:var(--space-3)">Don't take our word for it</h2>
          </div>
          <div class="rating" style="gap:var(--space-3)">${starRow(5)}<span class="muted" style="font-size:var(--text-sm)"><b style="color:var(--text)">4.8</b> from 14,200+ reviews</span></div>
        </div>
        <div class="grid-testi">${T.map(card).join("")}</div>
      </div>
    </section>`;
  }

  function ctaBand() {
    return `<section class="section" id="pricing">
      <div class="container container-wide">
        <div class="cta-band">
          <div class="hero-bg"></div>
          <span class="eyebrow" style="position:relative;z-index:1">${icon("award")} Aiselling for teams</span>
          <h2 style="margin-top:var(--space-4)">Equip your whole team to work with AI</h2>
          <p>Bundle any products into a team license with shared seats, onboarding and volume pricing. One invoice, lifetime access.</p>
          <div class="hero-cta">
            <button class="btn btn-primary btn-lg">Talk to sales ${icon("arrowR")}</button>
            <button class="btn btn-outline btn-lg">Browse bundles</button>
          </div>
        </div>
      </div>
    </section>`;
  }

  window.SCREENS = window.SCREENS || {};
  window.SCREENS.landing = function () {
    return hero() + featured() + categories() + testimonials() + ctaBand();
  };
})();
