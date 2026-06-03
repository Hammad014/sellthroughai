/* AISELLING — product detail page */
(function () {
  const { icon, starRow } = window;
  const { money, fmt, catName } = window.UI;

  function detail(id) {
    const P = window.AISELLING.PRODUCTS;
    const p = P.find((x) => x.id === id) || P[2];
    const off = p.was ? Math.round((1 - p.price / p.was) * 100) : 0;
    const related = P.filter((x) => x.cat === p.cat && x.id !== p.id).slice(0, 3);
    const fallbackRelated = related.length ? related : P.filter((x) => x.id !== p.id).slice(0, 3);

    return `<div class="container container-wide detail-top">
      <nav class="breadcrumb">
        <a onclick="GO('landing')">Home</a>${icon("chevR")}
        <a onclick="GO('landing','#categories')">${catName(p.cat)}</a>${icon("chevR")}
        <span class="muted">${p.title}</span>
      </nav>

      <div class="detail-grid">
        <div class="detail-media">
          <div class="cover ${p.grad}">
            <span class="cover-glyph">${icon(p.glyph)}</span>
            <span class="cover-tag">${catName(p.cat)}</span>
          </div>
          <div class="detail-thumbs">
            <div class="cover ${p.grad} is-active"><span class="cover-glyph">${icon(p.glyph)}</span></div>
            <div class="cover ${p.grad}" style="filter:hue-rotate(20deg)"><span class="cover-glyph">${icon("grid")}</span></div>
            <div class="cover ${p.grad}" style="filter:hue-rotate(-25deg)"><span class="cover-glyph">${icon("layers")}</span></div>
            <div class="cover ${p.grad}" style="filter:hue-rotate(45deg)"><span class="cover-glyph">${icon("play")}</span></div>
          </div>
        </div>

        <div class="detail-info">
          <div class="row gap-2 wrap">
            ${p.badge ? `<span class="badge badge-accent">${p.badge}</span>` : ""}
            <span class="badge">${catName(p.cat)}</span>
          </div>
          <h1>${p.title}</h1>
          <p class="lead">${p.lead}</p>
          <div class="row gap-4 wrap" style="margin-top:var(--space-5)">
            <span class="rating">${starRow(p.rating)}<span class="rating-val">${p.rating.toFixed(1)} · ${fmt(p.reviews)} reviews</span></span>
            <span class="faint" style="font-size:var(--text-sm)">${icon("download")} ${fmt(p.sales)} downloads</span>
          </div>

          <div class="buybox" style="margin-top:var(--space-8)">
            <div class="buybox-price">
              <span class="now">${money(p.price)}</span>
              ${p.was ? `<span class="strike price" style="font-size:var(--text-lg)">${money(p.was)}</span><span class="badge badge-success">Save ${off}%</span>` : `<span class="badge badge-success">One-time</span>`}
            </div>
            <ul class="buybox-list">
              <li>${icon("check")} Instant digital delivery — access on purchase</li>
              <li>${icon("check")} Lifetime access &amp; free future updates</li>
              <li>${icon("check")} Works in ${p.format.join(", ")}</li>
              <li>${icon("check")} 14-day no-questions refund</li>
            </ul>
            <div class="buybox-actions">
              <button class="btn btn-primary btn-lg btn-block">${icon("cart")} Add to cart — ${money(p.price)}</button>
              <button class="btn btn-outline btn-lg btn-block" onclick="GO('library')">Buy now</button>
            </div>
            <p class="buybox-note" style="margin-top:var(--space-4)">${icon("shield")} Secure checkout · Visa, Mastercard, PayPal, Apple Pay</p>
          </div>
        </div>
      </div>

      <section class="detail-section">
        <h2>What's inside</h2>
        <div class="feature-list">
          ${p.includes.map((f) => `<div class="feature-item"><span class="ic">${icon(f.icon)}</span><div><h4>${f.h}</h4><p>${f.p}</p></div></div>`).join("")}
        </div>
      </section>

      <section class="detail-section">
        <h2>About this product</h2>
        <div class="prose">
          <p>${p.lead}</p>
          <p>Built for non-technical professionals, ${p.title} skips the jargon and hands you something you can use the same day you buy it. Every asset has been tested in real workflows — no filler, no "coming soon," no fluff.</p>
          <p>You'll get instant access in your library the moment you purchase, plus every future update at no extra cost. If it's not a fit, our 14-day refund has you covered.</p>
        </div>
      </section>

      <section class="detail-section">
        <h2>Created by</h2>
        <div class="author-card">
          <span class="avatar" style="background:oklch(0.6 0.16 ${p.authorHue})">${p.initials}</span>
          <div class="grow">
            <div class="row gap-2"><b>${p.author}</b><span class="badge badge-accent">Verified creator</span></div>
            <p class="bio">Top-rated Aiselling creator · ${fmt(p.sales)}+ sales · helping pros do more with AI since 2023.</p>
          </div>
          <button class="btn btn-secondary">View profile</button>
        </div>
      </section>

      <section class="detail-section">
        <h2>Ratings &amp; reviews</h2>
        <div class="review-summary">
          <div style="text-align:center">
            <div class="review-big">${p.rating.toFixed(1)}</div>
            <span class="rating" style="justify-content:center;margin-top:var(--space-2)">${starRow(p.rating)}</span>
            <p class="faint" style="font-size:var(--text-xs);margin-top:var(--space-2)">${fmt(p.reviews)} reviews</p>
          </div>
          <div class="review-bars">
            ${[[5,82],[4,13],[3,3],[2,1],[1,1]].map(([s,pct]) => `<div class="review-bar"><span>${s}★</span><span class="track"><span class="fill" style="width:${pct}%"></span></span><span>${pct}%</span></div>`).join("")}
          </div>
        </div>
        ${reviewItem("Jordan P.", "JP", 200, 5, "Genuinely the best money I've spent on AI stuff. Everything is organized and just works — I was using it within ten minutes.")}
        ${reviewItem("Renée K.", "RK", 320, 5, "I bought this for my team of six and we all use it weekly now. The updates keep coming too, which is rare.")}
        ${reviewItem("Tomás G.", "TG", 90, 4, "Really solid and clearly made by someone who does this work. Would've loved a couple more advanced examples, but no regrets.")}
      </section>

      <section class="section">
        <div class="section-head"><h2 class="section-title">You might also like</h2><button class="btn btn-ghost" onclick="GO('landing','#featured')">More ${icon("chevR")}</button></div>
        <div class="grid-products">${fallbackRelated.map(window.UI.productCard).join("")}</div>
      </section>
    </div>`;
  }

  function reviewItem(name, initials, hue, rating, text) {
    return `<div class="review">
      <div class="review-head">
        <span class="avatar" style="width:32px;height:32px;font-size:var(--text-xs);background:oklch(0.6 0.15 ${hue})">${initials}</span>
        <div><b style="font-size:var(--text-sm)">${name}</b> <span class="rating" style="vertical-align:middle">${starRow(rating)}</span></div>
        <span class="faint" style="margin-left:auto;font-size:var(--text-xs)">Verified purchase</span>
      </div>
      <p class="muted" style="font-size:var(--text-sm);line-height:var(--leading-relaxed)">${text}</p>
    </div>`;
  }

  window.SCREENS = window.SCREENS || {};
  window.SCREENS.detail = detail;
})();
