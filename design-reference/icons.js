/* AISELLING — inline SVG icon set + small UI helpers. Attaches to window. */
(function () {
  const I = {
    sparkles: '<path d="M12 3l1.6 4.6L18 9.2l-4.4 1.6L12 15l-1.6-4.2L6 9.2l4.4-1.6L12 3z"/><path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
    play: '<circle cx="12" cy="12" r="9"/><path d="M10 9l5 3-5 3V9z" fill="currentColor" stroke="none"/>',
    bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>',
    book: '<path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5z"/><path d="M4 19a2 2 0 012-2h13"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    bolt2: '<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>',
    refresh: '<path d="M21 12a9 9 0 11-2.6-6.3"/><path d="M21 4v5h-5"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/>',
    heart: '<path d="M12 20s-7-4.5-9.5-9C1 8 2.5 4.5 6 4.5c2 0 3.2 1.2 4 2.3.8-1.1 2-2.3 4-2.3 3.5 0 5 3.5 3.5 6.5C19 15.5 12 20 12 20z"/>',
    cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.4 12.4a1.5 1.5 0 001.5 1.2h8.6a1.5 1.5 0 001.5-1.2L22 7H6"/>',
    star: '<path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.8 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9L12 2.5z" fill="currentColor" stroke="none"/>',
    check: '<path d="M5 12l4.5 4.5L19 7"/>',
    chevR: '<path d="M9 6l6 6-6 6"/>',
    arrowR: '<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>',
    sun: '<circle cx="12" cy="12" r="4.5"/><path d="M12 1.5v2.5M12 20v2.5M4.2 4.2l1.8 1.8M18 18l1.8 1.8M1.5 12h2.5M20 12h2.5M4.2 19.8l1.8-1.8M18 6l1.8-1.8"/>',
    moon: '<path d="M20 13.5A8 8 0 1110.5 4a6.5 6.5 0 009.5 9.5z"/>',
    download: '<path d="M12 3v12"/><path d="M7 11l5 5 5-5"/><path d="M5 21h14"/>',
    folder: '<path d="M3 6a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V6z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    flame: '<path d="M12 3c1 3-2 4-2 7a3 3 0 006 0c0-1-.5-2-.5-2 2 1 3.5 3 3.5 5.5a7 7 0 11-14 0C5 9 9 7 12 3z"/>',
    award: '<circle cx="12" cy="9" r="5"/><path d="M9 13.5L7 22l5-3 5 3-2-8.5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>',
    twitter: '<path d="M22 5.5c-.7.3-1.5.6-2.3.7.8-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1a4 4 0 00-6.8 3.6A11.3 11.3 0 013 4.8a4 4 0 001.2 5.3c-.6 0-1.2-.2-1.7-.5a4 4 0 003.2 4 4 4 0 01-1.8.1 4 4 0 003.7 2.8A8 8 0 012 18.3 11.3 11.3 0 008.1 20c7.3 0 11.4-6.1 11.4-11.4v-.5c.8-.6 1.5-1.3 2-2.1z" stroke="none" fill="currentColor"/>',
    github: '<path d="M12 2a10 10 0 00-3.2 19.5c.5 0 .7-.2.7-.5v-1.8c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6 0-.6 0-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.300C5.7 14.8 5 14 5 12.5c0-.7.3-1.3.7-1.7-.1-.3-.3-1 .1-2 0 0 .8-.3 2.6 1a9 9 0 014.8 0c1.8-1.3 2.6-1 2.6-1 .4 1 .2 1.7.1 2 .4.4.7 1 .7 1.7 0 1.5-.7 2.3-2.3 2.7.3.3.6.8.6 1.6v2.4c0 .3.2.5.7.5A10 10 0 0012 2z" stroke="none" fill="currentColor"/>',
    linkedin: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 014 0v4M11 10v7" />',
    logo: '<path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" opacity="0.25"/><path d="M12 7l-4 2.2v4.6L12 16l4-2.2V9.2L12 7z"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  };

  function icon(name, attrs) {
    const a = attrs || {};
    const sw = a.stroke || 2;
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[name] || ""}</svg>`;
  }
  function stars(rating) {
    let s = "";
    for (let i = 0; i < 5; i++) s += icon("star");
    return `<span class="stars" style="--r:${rating}"><span class="stars-row">${s}</span><span class="stars-fill"><span class="stars-row">${s}</span></span></span>`;
  }
  window.ICONS = I;
  window.icon = icon;
  window.starRow = stars;
})();
