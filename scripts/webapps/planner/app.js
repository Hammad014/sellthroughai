/* Makeready Life Planner — everything lives in this browser (localStorage). */
(() => {
  "use strict";

  const KEY = "makeready-life-planner-v1";

  // ---------- Helpers ----------
  const $ = (s, el = document) => el.querySelector(s);
  const uid = () => Math.random().toString(36).slice(2, 10);
  const esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const pad = (n) => String(n).padStart(2, "0");
  const keyOf = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = (k) => {
    const [y, m, d] = k.split("-").map(Number);
    return new Date(y, m - 1, d || 1);
  };
  const addDays = (k, n) => {
    const d = parse(k);
    d.setDate(d.getDate() + n);
    return keyOf(d);
  };
  const todayKey = () => keyOf(new Date());
  const monthOf = (k) => k.slice(0, 7);
  const addMonths = (mk, n) => {
    const d = parse(`${mk}-01`);
    d.setMonth(d.getMonth() + n);
    return keyOf(d).slice(0, 7);
  };
  const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const DAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const daysIn = (mk) => {
    const d = parse(`${mk}-01`);
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  };
  const weekStartOf = (k) => {
    const d = parse(k);
    const dow = d.getDay();
    d.setDate(
      d.getDate() - (S.settings.weekStart === "sun" ? dow : (dow + 6) % 7),
    );
    return keyOf(d);
  };
  const dayOrder = () =>
    S.settings.weekStart === "sun"
      ? [0, 1, 2, 3, 4, 5, 6]
      : [1, 2, 3, 4, 5, 6, 0];
  const longDate = (k) => {
    const d = parse(k);
    return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
  };
  const shortDate = (k) => {
    const d = parse(k);
    return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
  };
  const isoWeek = (k) => {
    const d = parse(k);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const jan4 = new Date(d.getFullYear(), 0, 4);
    return (
      1 + Math.round(((d - jan4) / 864e5 - 3 + ((jan4.getDay() + 6) % 7)) / 7)
    );
  };
  const num = (v) => {
    const n = parseFloat(String(v).replace(/,/g, ""));
    return Number.isFinite(n) ? n : 0;
  };
  const money = (n) =>
    `${n < 0 ? "−" : ""}${S.settings.currency}${Math.abs(n).toLocaleString(
      undefined,
      {
        minimumFractionDigits: Math.abs(n) % 1 ? 2 : 0,
        maximumFractionDigits: 2,
      },
    )}`;

  // ---------- Icons ----------
  const svg = (d, extra = "") =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;
  const I = {
    today: svg(
      '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    ),
    week: svg(
      '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9 4v16M15 4v16"/>',
    ),
    month: svg(
      '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    ),
    habits: svg('<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>'),
    goals: svg(
      '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    ),
    dump: svg(
      '<path d="M4 13h4l2 3h4l2-3h4"/><path d="M5.5 5h13L21 13v6H3v-6z"/>',
    ),
    money: svg(
      '<rect x="3" y="6" width="18" height="14" rx="3"/><path d="M3 10h18M16 15h2"/>',
    ),
    settings: svg(
      '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    ),
    more: svg(
      '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
    ),
    left: svg('<path d="m15 18-6-6 6-6"/>'),
    right: svg('<path d="m9 18 6-6-6-6"/>'),
    check: svg('<path d="m5 12 5 5 9-10"/>', 'stroke-width="3"'),
    trash: svg(
      '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    ),
    later: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    star: '<svg viewBox="0 0 24 24" fill="currentColor" class="star"><path d="m12 2.8 2.8 5.7 6.3.9-4.6 4.5 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.4l6.3-.9z"/></svg>',
    drop: '<svg viewBox="0 0 24 32" fill="currentColor"><path d="M12 2C7 10 4 14.5 4 19a8 8 0 0 0 16 0c0-4.5-3-9-8-17z"/></svg>',
    plus: svg('<path d="M12 5v14M5 12h14"/>'),
  };

  // ---------- State ----------
  const HABIT_COLORS = [
    "#3e8a67",
    "#2b78c9",
    "#d08726",
    "#9a5bc9",
    "#c2523f",
    "#2f9aa0",
  ];
  const defaults = () => ({
    version: 1,
    settings: {
      name: "",
      weekStart: "mon",
      theme: "auto",
      currency: "$",
      lastBackup: null,
      welcomed: false,
    },
    days: {},
    weeks: {},
    months: {},
    events: {},
    habits: [
      { id: uid(), name: "Drink water", color: HABIT_COLORS[1] },
      { id: uid(), name: "Move for 20 minutes", color: HABIT_COLORS[0] },
      { id: uid(), name: "Read 10 pages", color: HABIT_COLORS[3] },
      { id: uid(), name: "No phone after 10pm", color: HABIT_COLORS[2] },
    ],
    habitLog: {},
    goals: [],
    dump: [],
    money: {
      categories: [
        { id: uid(), name: "Groceries", budget: 400 },
        { id: uid(), name: "Eating out", budget: 120 },
        { id: uid(), name: "Transport", budget: 150 },
        { id: uid(), name: "Shopping", budget: 100 },
        { id: uid(), name: "Fun", budget: 80 },
        { id: uid(), name: "Bills", budget: 900 },
      ],
      tx: {},
      savings: [],
    },
  });

  let storageOK = true;
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaults();
      const saved = JSON.parse(raw);
      const base = defaults();
      return {
        ...base,
        ...saved,
        settings: { ...base.settings, ...saved.settings },
        money: { ...base.money, ...saved.money },
      };
    } catch {
      storageOK = false;
      return defaults();
    }
  }
  let S = load();

  let saveTimer;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(KEY, JSON.stringify(S));
        storageOK = true;
        const el = $("#saved");
        if (el) el.textContent = "Saved";
      } catch {
        storageOK = false;
        toast("This browser isn't saving. Use Settings → Download backup.");
      }
    }, 250);
  }

  const day = (k) =>
    (S.days[k] ??= {
      top: [
        { t: "", done: false },
        { t: "", done: false },
        { t: "", done: false },
      ],
      tasks: [],
      blocks: {},
      notes: "",
      mood: null,
      energy: null,
      water: 0,
      wins: [],
    });
  const peekDay = (k) => S.days[k];
  const hasData = () =>
    Object.keys(S.days).length > 0 ||
    S.goals.length > 0 ||
    Object.keys(S.money.tx).length > 0;

  // ---------- UI state ----------
  const ui = {
    view: "today",
    date: todayKey(),
    month: monthOf(todayKey()),
    moneyMonth: monthOf(todayKey()),
    habitMonth: monthOf(todayKey()),
  };

  function toast(msg) {
    document.querySelectorAll(".toast").forEach((t) => t.remove());
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    document.body.append(t);
    setTimeout(() => t.remove(), 2600);
  }

  function applyTheme() {
    const t = S.settings.theme;
    const dark =
      t === "dark" ||
      (t === "auto" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }

  // ---------- Shared bits ----------
  const check = (on, act, data = "", round = false) =>
    `<button class="check${round ? " round" : ""}${on ? " on" : ""}" data-act="${act}" ${data} aria-label="${on ? "Mark not done" : "Mark done"}">${I.check}</button>`;
  const headNav = (prev, next, todayAct, label, before = "") =>
    `<div class="head-nav">${before}
      <button class="icon-btn" data-act="${prev}" aria-label="Previous">${I.left}</button>
      <button class="btn" data-act="${todayAct}">${label}</button>
      <button class="icon-btn" data-act="${next}" aria-label="Next">${I.right}</button>
    </div>`;
  const ring = (done, total) => {
    const pct = total ? done / total : 0;
    const c = 2 * Math.PI * 24;
    return `<div class="ring"><svg viewBox="0 0 58 58"><circle cx="29" cy="29" r="24" fill="none" stroke="var(--soft2)" stroke-width="6"/><circle cx="29" cy="29" r="24" fill="none" stroke="var(--good)" stroke-width="6" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct)}"/></svg><span>${total ? Math.round(pct * 100) : 0}%</span></div>`;
  };
  const bar = (value, max, cls = "") =>
    `<div class="bar ${cls}"><i style="width:${max > 0 ? Math.min(100, (value / max) * 100) : 0}%"></i></div>`;

  function backupBanner() {
    if (!storageOK)
      return `<div class="banner"><span class="grow"><b>Heads up:</b> this browser isn't letting the planner save. Open the file in Chrome, Edge or Firefox, or download a backup before closing.</span><button class="btn primary" data-act="backup">Download backup</button></div>`;
    const last = S.settings.lastBackup;
    const stale = !last || (Date.now() - new Date(last)) / 864e5 > 14;
    if (!hasData() || !stale) return "";
    return `<div class="banner"><span class="grow">Your planner saves in this browser. Download a backup now and then, so you never lose it.</span><button class="btn primary" data-act="backup">Download backup</button><button class="btn ghost" data-act="snooze-backup">Later</button></div>`;
  }

  // ---------- Views ----------
  const V = {};

  V.today = () => {
    const k = ui.date;
    const d = peekDay(k) ?? {
      top: [{}, {}, {}],
      tasks: [],
      blocks: {},
      notes: "",
      mood: null,
      energy: null,
      water: 0,
      wins: [],
    };
    const all = [...d.top.filter((t) => t.t), ...d.tasks];
    const done = all.filter((t) => t.done).length;
    const tomorrow = peekDay(addDays(k, 1))?.top?.[0]?.t ?? "";
    const isToday = k === todayKey();
    const hours = Array.from({ length: 17 }, (_, i) => i + 6);
    const moods = ["😞", "😕", "😐", "🙂", "😄"];
    return `
      ${backupBanner()}
      <div class="head">
        <div>
          <div class="eyebrow">${isToday ? "Today · " : ""}Week ${isoWeek(k)}</div>
          <h1>${longDate(k)}</h1>
        </div>
        ${headNav("day-prev", "day-next", "day-today", "Today", `<input type="date" class="field" style="width:auto" value="${k}" data-input="jump-date" aria-label="Pick a date">`)}
      </div>
      <div class="grid cols-3">
        <section class="card blocks-card">
          <div class="card-head"><h2>Time blocks</h2><span class="hint">Type what you'll do when</span></div>
          <div class="blocks">
            ${hours
              .map(
                (h) =>
                  `<div class="block"><label>${h % 12 || 12}${h < 12 ? "am" : "pm"}</label><input data-input="block" data-h="${h}" value="${esc(d.blocks[h])}" placeholder=" "></div>`,
              )
              .join("")}
          </div>
        </section>
        <div class="stack">
          <section class="card tint-accent">
            <div class="card-head"><div><h2>Just 3 things</h2><div class="hint">The star is the one that matters most</div></div>${ring(done, all.length)}</div>
            <div class="list">
              ${d.top
                .map(
                  (t, i) =>
                    `<div class="row${t.done ? " done" : ""}">${check(t.done, "top-toggle", `data-i="${i}"`, true)}${i === 0 ? I.star : ""}<div class="text"><input data-input="top" data-i="${i}" value="${esc(t.t)}" placeholder="${["The one big thing", "Second thing", "Third thing"][i]}"></div></div>`,
                )
                .join("")}
            </div>
          </section>
          <section class="card">
            <div class="card-head"><h2>To-do</h2><span class="pill">${d.tasks.filter((t) => t.done).length}/${d.tasks.length} done</span></div>
            <div class="list">
              ${d.tasks.length ? "" : '<div class="empty">Nothing here yet. Add the small stuff below.</div>'}
              ${d.tasks
                .map(
                  (t) =>
                    `<div class="row${t.done ? " done" : ""}">${check(t.done, "task-toggle", `data-id="${t.id}"`)}<div class="text"><input data-input="task" data-id="${t.id}" value="${esc(t.t)}"></div><div class="tools"><button class="icon-btn small" data-act="task-later" data-id="${t.id}" title="Move to tomorrow">${I.later}</button><button class="icon-btn small" data-act="task-del" data-id="${t.id}" title="Delete">${I.trash}</button></div></div>`,
                )
                .join("")}
            </div>
            <div class="add-row"><input class="field" id="add-task" placeholder="Add a task and press Enter" data-enter="task-add"><button class="btn" data-act="task-add">Add</button></div>
          </section>
          <section class="card">
            <div class="card-head"><h2>Notes</h2></div>
            <textarea class="lined" data-input="notes" placeholder="Thoughts, ideas, things to remember…">${esc(d.notes)}</textarea>
          </section>
        </div>
        <div class="stack">
          <section class="card">
            <div class="card-head"><h2>Check-in</h2></div>
            <div class="eyebrow" style="margin-bottom:8px">Mood</div>
            <div class="scale">${moods.map((m, i) => `<button class="${d.mood === i ? "on" : ""}" data-act="mood" data-v="${i}" aria-label="Mood ${i + 1}">${m}</button>`).join("")}</div>
            <div class="eyebrow" style="margin:14px 0 8px">Energy</div>
            <div class="scale">${[1, 2, 3, 4, 5].map((n) => `<button class="${d.energy === n ? "on" : ""}" data-act="energy" data-v="${n}" style="font-size:15px;font-weight:600">${n}</button>`).join("")}</div>
            <div class="eyebrow" style="margin:14px 0 8px">Water · ${d.water}/8</div>
            <div class="drops">${Array.from({ length: 8 }, (_, i) => `<button class="drop${i < d.water ? " on" : ""}" data-act="water" data-v="${i + 1}" aria-label="${i + 1} glasses">${I.drop}</button>`).join("")}</div>
          </section>
          <section class="card">
            <div class="card-head"><h2>Habits</h2><button class="btn ghost" data-act="go" data-view="habits">Edit</button></div>
            <div class="list">
              ${S.habits.length ? "" : '<div class="empty">No habits yet.</div>'}
              ${S.habits
                .map((h) => {
                  const on = !!S.habitLog[h.id]?.[k];
                  return `<div class="row${on ? " done" : ""}">${check(on, "habit-toggle", `data-id="${h.id}" data-k="${k}"`, true)}<div class="text"><span class="swatch" style="background:${h.color}"></span>${esc(h.name)}</div><span class="pill">🔥 ${streak(h.id)}</span></div>`;
                })
                .join("")}
            </div>
          </section>
          <section class="card tint-warm">
            <div class="card-head"><h2>Wins today</h2></div>
            <div class="list">
              ${d.wins.map((w) => `<div class="row"><span>✨</span><div class="text"><input data-input="win" data-id="${w.id}" value="${esc(w.t)}"></div><div class="tools"><button class="icon-btn small" data-act="win-del" data-id="${w.id}">${I.trash}</button></div></div>`).join("")}
            </div>
            <div class="add-row"><input class="field" id="add-win" placeholder="Big or tiny, it counts" data-enter="win-add"><button class="btn" data-act="win-add">Add</button></div>
          </section>
          <section class="card">
            <div class="card-head"><h2>Tomorrow, first thing</h2></div>
            <input class="field" data-input="tomorrow" value="${esc(tomorrow)}" placeholder="Becomes tomorrow's top task">
          </section>
        </div>
      </div>`;
  };

  V.week = () => {
    const start = weekStartOf(ui.date);
    const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
    const w = S.weeks[start] ?? {};
    const today = todayKey();
    return `
      <div class="head">
        <div><div class="eyebrow">Week ${isoWeek(start)}</div><h1>${shortDate(days[0])} – ${shortDate(days[6])}</h1></div>
        ${headNav("week-prev", "week-next", "week-today", "This week")}
      </div>
      <section class="card tint-accent" style="margin-bottom:16px">
        <div class="card-head"><h2>This week's one focus</h2></div>
        <input class="field" data-input="week-focus" data-k="${start}" value="${esc(w.focus)}" placeholder="If this week only achieved one thing, it would be…">
      </section>
      <div class="week">
        ${days
          .map((k) => {
            const d = peekDay(k);
            const items = d
              ? [
                  ...d.top
                    .filter((t) => t.t)
                    .map((t) => ({ ...t, star: true })),
                  ...d.tasks,
                ]
              : [];
            const shown = items.slice(0, 6);
            return `<div class="day-card${k === today ? " today" : ""}">
              <button class="day-link" data-act="open-day" data-k="${k}"><span class="dname">${DAYS[parse(k).getDay()].slice(0, 3)}</span><span class="dnum">${parse(k).getDate()}</span></button>
              ${shown.map((t) => `<div class="mini${t.done ? " done" : ""}">${t.star ? "★ " : ""}${esc(t.t)}</div>`).join("") || '<div class="hint">Free day</div>'}
              ${items.length > shown.length ? `<div class="hint">+${items.length - shown.length} more</div>` : ""}
              <input placeholder="+ Add task" data-enter="week-add" data-k="${k}">
            </div>`;
          })
          .join("")}
      </div>
      <section class="card" style="margin-top:16px">
        <div class="card-head"><h2>Week review</h2><span class="hint">What went well? What will you change?</span></div>
        <textarea class="lined" data-input="week-review" data-k="${start}">${esc(w.review)}</textarea>
      </section>`;
  };

  V.month = () => {
    const mk = ui.month;
    const first = parse(`${mk}-01`);
    const order = dayOrder();
    const lead = order.indexOf(first.getDay());
    const n = daysIn(mk);
    const cells = Math.ceil((lead + n) / 7) * 7;
    const today = todayKey();
    const m = S.months[mk] ?? {};
    const events = Object.entries(S.events)
      .filter(([k, list]) => k.startsWith(mk) && list.length)
      .sort(([a], [b]) => a.localeCompare(b));
    return `
      <div class="head">
        <div><div class="eyebrow">${first.getFullYear()}</div><h1>${MONTHS[first.getMonth()]}</h1></div>
        ${headNav("month-prev", "month-next", "month-today", "This month")}
      </div>
      <div class="cal">
        ${order.map((d) => `<div class="dow">${DAYS[d].slice(0, 3)}</div>`).join("")}
        ${Array.from({ length: cells }, (_, i) => {
          const k = addDays(`${mk}-01`, i - lead);
          const out = !k.startsWith(mk);
          const d = peekDay(k);
          const items = d ? [...d.top.filter((t) => t.t), ...d.tasks] : [];
          const done = items.filter((t) => t.done).length;
          const ev = S.events[k] ?? [];
          return `<button class="cell${out ? " out" : ""}${k === today ? " today" : ""}" data-act="open-day" data-k="${k}">
            <span class="n">${parse(k).getDate()}</span>
            ${ev
              .slice(0, 2)
              .map((e) => `<span class="tag">${esc(e.t)}</span>`)
              .join("")}
            ${items.length ? `<span class="tag task">${items.length} task${items.length > 1 ? "s" : ""}</span><span class="meter"><i style="width:${(done / items.length) * 100}%"></i></span>` : ""}
          </button>`;
        }).join("")}
      </div>
      <div class="grid cols-2" style="margin-top:16px">
        <section class="card tint-accent">
          <div class="card-head"><h2>Goals for ${MONTHS[first.getMonth()]}</h2></div>
          <textarea class="lined" data-input="month-goals" data-k="${mk}" placeholder="What would make this month a win?">${esc(m.goals)}</textarea>
        </section>
        <section class="card">
          <div class="card-head"><h2>Dates to remember</h2></div>
          <div class="list">
            ${events.length ? "" : '<div class="empty">Birthdays, deadlines, appointments…</div>'}
            ${events
              .flatMap(([k, list]) =>
                list.map(
                  (e) =>
                    `<div class="row"><span class="pill">${shortDate(k)}</span><div class="text">${esc(e.t)}</div><div class="tools"><button class="icon-btn small" data-act="event-del" data-k="${k}" data-id="${e.id}">${I.trash}</button></div></div>`,
                ),
              )
              .join("")}
          </div>
          <div class="add-row">
            <input type="date" class="field" id="event-date" style="max-width:160px" value="${monthOf(today) === mk ? today : `${mk}-01`}">
            <input class="field" id="event-text" placeholder="What's happening?" data-enter="event-add">
            <button class="btn" data-act="event-add">Add</button>
          </div>
        </section>
      </div>`;
  };

  function streak(id) {
    const log = S.habitLog[id] ?? {};
    let k = todayKey();
    if (!log[k]) k = addDays(k, -1);
    let n = 0;
    while (log[k]) {
      n++;
      k = addDays(k, -1);
    }
    return n;
  }

  V.habits = () => {
    const mk = ui.habitMonth;
    const n = daysIn(mk);
    const today = todayKey();
    const first = parse(`${mk}-01`);
    const keys = Array.from({ length: n }, (_, i) => `${mk}-${pad(i + 1)}`);
    const passed = keys.filter((k) => k <= today).length;
    return `
      <div class="head">
        <div><div class="eyebrow">Habit tracker</div><h1>${MONTHS[first.getMonth()]} ${first.getFullYear()}</h1></div>
        ${headNav("habit-prev", "habit-next", "habit-today", "This month")}
      </div>
      <section class="card habit-table">
        ${
          S.habits.length
            ? `<table>
          <tr><th class="name"></th>${keys.map((k) => `<th>${DAYS[parse(k).getDay()][0]}<br>${parse(k).getDate()}</th>`).join("")}<th></th></tr>
          ${S.habits
            .map((h) => {
              const log = S.habitLog[h.id] ?? {};
              const count = keys.filter((k) => log[k]).length;
              return `<tr><td class="name"><span class="swatch" style="background:${h.color}"></span>${esc(h.name)}</td>
                ${keys.map((k) => `<td><button class="dot${log[k] ? " on" : ""}${k === today ? " today" : ""}${k > today ? " future" : ""}" style="${log[k] ? `background:${h.color}` : ""}" data-act="habit-toggle" data-id="${h.id}" data-k="${k}" aria-label="${esc(h.name)} ${k}"></button></td>`).join("")}
                <td class="stat">${count}/${passed || n} · 🔥 ${streak(h.id)}</td></tr>`;
            })
            .join("")}
        </table>`
            : '<div class="empty">Add your first habit below.</div>'
        }
      </section>
      <section class="card" style="margin-top:16px;max-width:640px">
        <div class="card-head"><h2>Your habits</h2><span class="hint">Keep it to a few small ones</span></div>
        <div class="list">
          ${S.habits
            .map(
              (h) =>
                `<div class="row"><div class="seg">${HABIT_COLORS.map((c) => `<button data-act="habit-color" data-id="${h.id}" data-c="${c}" aria-label="Colour" style="padding:6px 8px"><span class="swatch" style="background:${c};margin:0;${c === h.color ? "outline:2px solid var(--ink);outline-offset:1px" : ""}"></span></button>`).join("")}</div><div class="text"><input data-input="habit-name" data-id="${h.id}" value="${esc(h.name)}"></div><div class="tools"><button class="icon-btn small" data-act="habit-del" data-id="${h.id}">${I.trash}</button></div></div>`,
            )
            .join("")}
        </div>
        <div class="add-row"><input class="field" id="add-habit" placeholder="New habit, e.g. 10 minutes of stretching" data-enter="habit-add"><button class="btn" data-act="habit-add">Add</button></div>
      </section>`;
  };

  V.goals = () => `
    <div class="head">
      <div><div class="eyebrow">The bigger picture</div><h1>Goals</h1></div>
      <button class="btn primary" data-act="goal-add">${I.plus.replace("<svg", '<svg width="16" height="16"')} New goal</button>
    </div>
    ${S.goals.length ? "" : '<section class="card"><div class="empty">No goals yet. Add one, break it into milestones, and watch the bar fill up.</div></section>'}
    <div class="goals">
      ${S.goals
        .map((g) => {
          const done = g.milestones.filter((m) => m.done).length;
          const pct = g.milestones.length
            ? Math.round((done / g.milestones.length) * 100)
            : 0;
          return `<section class="card">
            <div class="card-head goal-title" style="margin-bottom:6px"><input class="plain" data-input="goal" data-id="${g.id}" data-f="title" value="${esc(g.title)}" placeholder="Goal name"><button class="icon-btn small" data-act="goal-del" data-id="${g.id}" title="Delete goal">${I.trash}</button></div>
            <input class="plain hint" data-input="goal" data-id="${g.id}" data-f="why" value="${esc(g.why)}" placeholder="Why it matters to me" style="margin-bottom:12px">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px"><div style="flex:1">${bar(pct, 100)}</div><b>${pct}%</b></div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px"><span class="hint">By</span><input type="date" class="field" style="width:auto;padding:5px 9px" data-input="goal" data-id="${g.id}" data-f="deadline" value="${esc(g.deadline)}"></div>
            <div class="eyebrow" style="margin-bottom:4px">Milestones</div>
            <div class="list">
              ${g.milestones.map((m) => `<div class="row${m.done ? " done" : ""}">${check(m.done, "ms-toggle", `data-g="${g.id}" data-id="${m.id}"`)}<div class="text"><input data-input="ms" data-g="${g.id}" data-id="${m.id}" value="${esc(m.t)}"></div><div class="tools"><button class="icon-btn small" data-act="ms-del" data-g="${g.id}" data-id="${m.id}">${I.trash}</button></div></div>`).join("")}
            </div>
            <div class="add-row"><input class="field" id="add-ms-${g.id}" placeholder="Add a milestone" data-enter="ms-add" data-g="${g.id}"><button class="btn" data-act="ms-add" data-g="${g.id}">Add</button></div>
          </section>`;
        })
        .join("")}
    </div>`;

  V.dump = () => `
    <div class="head"><div><div class="eyebrow">Get it out of your head</div><h1>Brain dump</h1></div>${S.dump.length ? '<button class="btn ghost" data-act="dump-clear">Clear all</button>' : ""}</div>
    <section class="card dump-input" style="margin-bottom:16px">
      <textarea class="field" id="dump-text" placeholder="Type everything on your mind. One thing per line. Don't sort it yet."></textarea>
      <div class="add-row" style="justify-content:flex-end"><button class="btn primary" data-act="dump-add">Add to list</button></div>
    </section>
    <div class="grid" style="gap:8px">
      ${S.dump.length ? '<div class="hint" style="margin-bottom:4px">Now sort each one: do it today, tomorrow, or let it go.</div>' : ""}
      ${S.dump
        .map(
          (
            x,
          ) => `<div class="dump-item"><div class="text">${esc(x.t)}</div><div class="dump-actions">
            <button class="btn" data-act="dump-to" data-id="${x.id}" data-when="0">Today</button>
            <button class="btn" data-act="dump-to" data-id="${x.id}" data-when="1">Tomorrow</button>
            <button class="btn ghost" data-act="dump-del" data-id="${x.id}">Let it go</button></div></div>`,
        )
        .join("")}
    </div>`;

  V.money = () => {
    const mk = ui.moneyMonth;
    const tx = (S.money.tx[mk] ?? [])
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date));
    const inc = tx
      .filter((t) => t.type === "in")
      .reduce((a, t) => a + num(t.amount), 0);
    const out = tx
      .filter((t) => t.type !== "in")
      .reduce((a, t) => a + num(t.amount), 0);
    const first = parse(`${mk}-01`);
    const today = todayKey();
    const spentBy = (id) =>
      tx
        .filter((t) => t.type !== "in" && t.cat === id)
        .reduce((a, t) => a + num(t.amount), 0);
    const catName = (id) =>
      S.money.categories.find((c) => c.id === id)?.name ?? "Other";
    return `
      <div class="head">
        <div><div class="eyebrow">Money · ${first.getFullYear()}</div><h1>${MONTHS[first.getMonth()]}</h1></div>
        ${headNav("money-prev", "money-next", "money-today", "This month")}
      </div>
      <div class="stats" style="margin-bottom:16px">
        <section class="card stat-card"><div class="eyebrow">Money in</div><div class="big">${money(inc)}</div></section>
        <section class="card stat-card"><div class="eyebrow">Money out</div><div class="big">${money(out)}</div></section>
        <section class="card stat-card ${inc - out >= 0 ? "tint-good" : "tint-warm"}"><div class="eyebrow">Left over</div><div class="big${inc - out < 0 ? " neg" : ""}">${money(inc - out)}</div></section>
      </div>
      <section class="card" style="margin-bottom:16px">
        <div class="card-head"><h2>Add money in or out</h2></div>
        <div class="tx-form">
          <input type="date" class="field" id="tx-date" value="${monthOf(today) === mk ? today : `${mk}-01`}">
          <input class="field" id="tx-desc" placeholder="What was it?" data-enter="tx-add">
          <select class="field" id="tx-cat">${S.money.categories.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join("")}<option value="">Other</option></select>
          <input class="field" id="tx-amount" inputmode="decimal" placeholder="Amount" data-enter="tx-add">
          <select class="field" id="tx-type"><option value="out">Money out</option><option value="in">Money in</option></select>
          <button class="btn primary" data-act="tx-add">Add</button>
        </div>
      </section>
      <div class="grid cols-2">
        <section class="card">
          <div class="card-head"><h2>Budget by category</h2><span class="hint">Monthly budget</span></div>
          ${S.money.categories
            .map((c) => {
              const spent = spentBy(c.id);
              const b = num(c.budget);
              const cls =
                b && spent > b ? "over" : b && spent > b * 0.85 ? "warn" : "";
              return `<div style="margin-bottom:12px"><div class="cat-row"><input class="plain" data-input="cat" data-id="${c.id}" data-f="name" value="${esc(c.name)}" style="font-weight:600"><input class="field" style="padding:5px 9px;text-align:right" inputmode="decimal" data-input="cat" data-id="${c.id}" data-f="budget" value="${esc(c.budget)}"></div>${bar(spent, b, cls)}<div class="cat-row"><div class="meta" style="grid-column:1/-1"><span>Spent ${money(spent)}</span><span>${b ? (spent > b ? `${money(spent - b)} over` : `${money(b - spent)} left`) : ""}</span></div></div></div>`;
            })
            .join("")}
          <div class="add-row"><input class="field" id="add-cat" placeholder="New category" data-enter="cat-add"><button class="btn" data-act="cat-add">Add</button></div>
        </section>
        <div class="stack">
          <section class="card">
            <div class="card-head"><h2>This month</h2><span class="pill">${tx.length} entries</span></div>
            ${
              tx.length
                ? `<table class="tx-table"><tr><th>Date</th><th>What</th><th>Category</th><th style="text-align:right">Amount</th><th></th></tr>
              ${tx.map((t) => `<tr><td>${shortDate(t.date)}</td><td>${esc(t.desc)}</td><td>${t.type === "in" ? '<span class="pill">Income</span>' : esc(catName(t.cat))}</td><td class="amt${t.type === "in" ? " in" : ""}">${t.type === "in" ? "+" : ""}${money(num(t.amount))}</td><td><button class="icon-btn small" data-act="tx-del" data-id="${t.id}">${I.trash}</button></td></tr>`).join("")}</table>`
                : '<div class="empty">Add your income first, then spending as it happens.</div>'
            }
          </section>
          <section class="card tint-good">
            <div class="card-head"><h2>Savings goals</h2></div>
            ${S.money.savings
              .map(
                (g) =>
                  `<div style="margin-bottom:14px"><div class="cat-row" style="grid-template-columns:1fr 90px 90px auto"><input class="plain" data-input="saving" data-id="${g.id}" data-f="name" value="${esc(g.name)}" style="font-weight:600"><input class="field" style="padding:5px 9px;text-align:right" inputmode="decimal" title="Saved" data-input="saving" data-id="${g.id}" data-f="saved" value="${esc(g.saved)}"><input class="field" style="padding:5px 9px;text-align:right" inputmode="decimal" title="Target" data-input="saving" data-id="${g.id}" data-f="target" value="${esc(g.target)}"><button class="icon-btn small" data-act="saving-del" data-id="${g.id}">${I.trash}</button></div>${bar(num(g.saved), num(g.target))}<div class="meta hint" style="margin-top:4px">${money(num(g.saved))} of ${money(num(g.target))}${num(g.target) ? ` · ${Math.min(100, Math.round((num(g.saved) / num(g.target)) * 100))}%` : ""}</div></div>`,
              )
              .join("")}
            <div class="hint" style="margin-bottom:6px">${S.money.savings.length ? "Columns: saved · target" : "Saving for a holiday, a laptop, an emergency fund?"}</div>
            <div class="add-row"><input class="field" id="add-saving" placeholder="New savings goal" data-enter="saving-add"><button class="btn" data-act="saving-add">Add</button></div>
          </section>
        </div>
      </div>`;
  };

  V.settings = () => {
    const seg = (field, opts) =>
      `<div class="seg">${opts.map(([v, l]) => `<button class="${S.settings[field] === v ? "on" : ""}" data-act="setting" data-f="${field}" data-v="${v}">${l}</button>`).join("")}</div>`;
    return `
      <div class="head"><div><div class="eyebrow">Make it yours</div><h1>Settings</h1></div></div>
      <div class="settings">
        <section class="card grid">
          <div class="setting"><b>Your name</b><input class="field" data-input="setting-name" value="${esc(S.settings.name)}" placeholder="Shown on the welcome line"></div>
          <div class="setting"><b>Week starts on</b>${seg("weekStart", [
            ["mon", "Monday"],
            ["sun", "Sunday"],
          ])}</div>
          <div class="setting"><b>Theme</b>${seg("theme", [
            ["auto", "Auto"],
            ["light", "Light"],
            ["dark", "Dark"],
          ])}</div>
          <div class="setting"><b>Currency symbol</b><input class="field" style="max-width:120px" data-input="setting-currency" value="${esc(S.settings.currency)}"></div>
        </section>
        <section class="card grid">
          <h2>Backup</h2>
          <p class="hint" style="margin:0">Your planner saves automatically in this browser on this device. Download a backup now and then (it's a small file) and keep it somewhere safe. To move to another computer, download a backup here and restore it there.</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <button class="btn primary" data-act="backup">Download backup</button>
            <button class="btn" data-act="restore">Restore from backup</button>
            <input type="file" id="restore-file" accept=".json,application/json" hidden>
          </div>
          <div class="hint">${S.settings.lastBackup ? `Last backup: ${new Date(S.settings.lastBackup).toLocaleDateString()}` : "No backup yet."}</div>
        </section>
        <section class="card grid">
          <h2>Print</h2>
          <p class="hint" style="margin:0">Open any page (today, a week, a month…) and press <b>Ctrl+P</b> (or <b>⌘P</b> on a Mac) to print it or save it as a PDF.</p>
        </section>
        <section class="card grid">
          <h2>Start over</h2>
          <p class="hint" style="margin:0">Erase everything in this planner. Download a backup first if you might want it back.</p>
          <div><button class="btn danger" data-act="erase">Erase everything</button></div>
        </section>
      </div>`;
  };

  V.more = () => `
    <div class="head"><div><div class="eyebrow">Planner</div><h1>More</h1></div></div>
    <div class="grid" style="gap:10px">
      ${NAV.map(([id, label]) => `<button class="card more-link" data-act="go" data-view="${id}">${I[id]}<b>${label}</b>${I.right}</button>`).join("")}
    </div>`;

  // ---------- Shell ----------
  const NAV = [
    ["today", "Today"],
    ["week", "Week"],
    ["month", "Month"],
    ["habits", "Habits"],
    ["goals", "Goals"],
    ["dump", "Brain dump"],
    ["money", "Money"],
    ["settings", "Settings"],
  ];
  const TABS = ["today", "week", "habits", "money", "more"];

  function shell() {
    document.body.innerHTML = `
      <div class="app">
        <aside class="side">
          <div class="brand"><div class="brand-mark">M</div><div><b>Life Planner</b><small>${S.settings.name ? `Hi, ${esc(S.settings.name)}` : "by Makeready"}</small></div></div>
          ${NAV.map(([id, label]) => `<button class="nav-btn" data-act="go" data-view="${id}">${I[id]}${label}</button>`).join("")}
          <div class="side-foot"><div class="saved" id="saved">Saved</div></div>
        </aside>
        <main id="main"></main>
        <nav class="tabbar">${TABS.map((id) => `<button data-act="go" data-view="${id}">${I[id]}${id === "more" ? "More" : NAV.find((n) => n[0] === id)[1]}</button>`).join("")}</nav>
      </div>`;
  }

  function render(focusId) {
    const main = $("#main");
    main.innerHTML = V[ui.view]();
    document.querySelectorAll("[data-view]").forEach((b) => {
      const active =
        b.dataset.view === ui.view ||
        (b.closest(".tabbar") &&
          b.dataset.view === "more" &&
          !TABS.includes(ui.view));
      b.classList.toggle("active", active);
    });
    if (focusId) $(`#${CSS.escape(focusId)}`)?.focus();
    // On narrow screens the habit grid scrolls sideways: start at today.
    const grid = $(".habit-table");
    const now = grid && $(".dot.today", grid);
    if (now)
      grid.scrollLeft +=
        now.getBoundingClientRect().left -
        grid.getBoundingClientRect().left -
        grid.clientWidth / 2;
    if (!S.settings.welcomed) welcome();
  }

  function welcome() {
    if ($(".welcome")) return;
    const w = document.createElement("div");
    w.className = "welcome";
    w.innerHTML = `<div class="card"><div class="eyebrow">Welcome</div><h1 style="margin-top:6px">Your planner is ready</h1>
      <ul>
        <li>Everything saves automatically, right here in your browser.</li>
        <li>It works offline: no account, no app, no internet needed.</li>
        <li>Keep this file somewhere safe, and open it the same way each time.</li>
        <li>Download a backup now and then from <b>Settings</b>.</li>
      </ul>
      <input class="field" id="welcome-name" placeholder="Your first name (optional)" style="margin-bottom:14px">
      <button class="btn primary" data-act="welcome-done" style="width:100%;justify-content:center;padding:12px">Start planning</button></div>`;
    document.body.append(w);
  }

  // ---------- Actions ----------
  const byId = (list, id) => list.find((x) => x.id === id);
  const A = {
    go: (el) => {
      ui.view = el.dataset.view;
      render();
      scrollTo(0, 0);
    },
    "welcome-done": () => {
      S.settings.name = $("#welcome-name")?.value.trim() ?? "";
      S.settings.welcomed = true;
      $(".welcome")?.remove();
      save();
      shell();
      render();
    },
    "day-prev": () => ((ui.date = addDays(ui.date, -1)), render()),
    "day-next": () => ((ui.date = addDays(ui.date, 1)), render()),
    "day-today": () => ((ui.date = todayKey()), render()),
    "open-day": (el) => (
      (ui.date = el.dataset.k),
      (ui.view = "today"),
      render(),
      scrollTo(0, 0)
    ),
    "top-toggle": (el) => {
      const t = day(ui.date).top[+el.dataset.i];
      t.done = !t.done;
      save();
      render();
    },
    "task-toggle": (el) => {
      const t = byId(day(ui.date).tasks, el.dataset.id);
      t.done = !t.done;
      save();
      render();
    },
    "task-add": () => {
      const input = $("#add-task");
      const t = input.value.trim();
      if (!t) return input.focus();
      day(ui.date).tasks.push({ id: uid(), t, done: false });
      save();
      render("add-task");
    },
    "task-del": (el) => {
      const d = day(ui.date);
      d.tasks = d.tasks.filter((t) => t.id !== el.dataset.id);
      save();
      render();
    },
    "task-later": (el) => {
      const d = day(ui.date);
      const t = byId(d.tasks, el.dataset.id);
      d.tasks = d.tasks.filter((x) => x !== t);
      day(addDays(ui.date, 1)).tasks.push({ ...t, done: false });
      save();
      render();
      toast("Moved to tomorrow");
    },
    mood: (el) => {
      const d = day(ui.date);
      d.mood = d.mood === +el.dataset.v ? null : +el.dataset.v;
      save();
      render();
    },
    energy: (el) => {
      const d = day(ui.date);
      d.energy = d.energy === +el.dataset.v ? null : +el.dataset.v;
      save();
      render();
    },
    water: (el) => {
      const d = day(ui.date);
      d.water = d.water === +el.dataset.v ? +el.dataset.v - 1 : +el.dataset.v;
      save();
      render();
    },
    "win-add": () => {
      const input = $("#add-win");
      const t = input.value.trim();
      if (!t) return input.focus();
      day(ui.date).wins.push({ id: uid(), t });
      save();
      render("add-win");
    },
    "win-del": (el) => {
      const d = day(ui.date);
      d.wins = d.wins.filter((w) => w.id !== el.dataset.id);
      save();
      render();
    },
    "habit-toggle": (el) => {
      const log = (S.habitLog[el.dataset.id] ??= {});
      if (log[el.dataset.k]) delete log[el.dataset.k];
      else log[el.dataset.k] = true;
      save();
      render();
    },
    "habit-add": () => {
      const input = $("#add-habit");
      const name = input.value.trim();
      if (!name) return input.focus();
      S.habits.push({
        id: uid(),
        name,
        color: HABIT_COLORS[S.habits.length % HABIT_COLORS.length],
      });
      save();
      render("add-habit");
    },
    "habit-del": (el) => {
      if (!confirm("Delete this habit and its history?")) return;
      S.habits = S.habits.filter((h) => h.id !== el.dataset.id);
      delete S.habitLog[el.dataset.id];
      save();
      render();
    },
    "habit-color": (el) => {
      byId(S.habits, el.dataset.id).color = el.dataset.c;
      save();
      render();
    },
    "habit-prev": () => (
      (ui.habitMonth = addMonths(ui.habitMonth, -1)),
      render()
    ),
    "habit-next": () => (
      (ui.habitMonth = addMonths(ui.habitMonth, 1)),
      render()
    ),
    "habit-today": () => ((ui.habitMonth = monthOf(todayKey())), render()),
    "week-prev": () => ((ui.date = addDays(ui.date, -7)), render()),
    "week-next": () => ((ui.date = addDays(ui.date, 7)), render()),
    "week-today": () => ((ui.date = todayKey()), render()),
    "month-prev": () => ((ui.month = addMonths(ui.month, -1)), render()),
    "month-next": () => ((ui.month = addMonths(ui.month, 1)), render()),
    "month-today": () => ((ui.month = monthOf(todayKey())), render()),
    "event-add": () => {
      const k = $("#event-date").value;
      const input = $("#event-text");
      const t = input.value.trim();
      if (!k || !t) return input.focus();
      (S.events[k] ??= []).push({ id: uid(), t });
      save();
      render("event-text");
    },
    "event-del": (el) => {
      S.events[el.dataset.k] = (S.events[el.dataset.k] ?? []).filter(
        (e) => e.id !== el.dataset.id,
      );
      save();
      render();
    },
    "goal-add": () => {
      S.goals.unshift({
        id: uid(),
        title: "",
        why: "",
        deadline: "",
        milestones: [],
      });
      save();
      render();
      $("[data-input='goal'][data-f='title']")?.focus();
    },
    "goal-del": (el) => {
      if (!confirm("Delete this goal?")) return;
      S.goals = S.goals.filter((g) => g.id !== el.dataset.id);
      save();
      render();
    },
    "ms-add": (el) => {
      const g = byId(S.goals, el.dataset.g);
      const input = $(`#add-ms-${g.id}`);
      const t = input.value.trim();
      if (!t) return input.focus();
      g.milestones.push({ id: uid(), t, done: false });
      save();
      render(`add-ms-${g.id}`);
    },
    "ms-toggle": (el) => {
      const m = byId(byId(S.goals, el.dataset.g).milestones, el.dataset.id);
      m.done = !m.done;
      save();
      render();
    },
    "ms-del": (el) => {
      const g = byId(S.goals, el.dataset.g);
      g.milestones = g.milestones.filter((m) => m.id !== el.dataset.id);
      save();
      render();
    },
    "dump-add": () => {
      const input = $("#dump-text");
      const lines = input.value
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      if (!lines.length) return input.focus();
      S.dump.push(...lines.map((t) => ({ id: uid(), t })));
      save();
      render("dump-text");
    },
    "dump-to": (el) => {
      const x = byId(S.dump, el.dataset.id);
      const k = addDays(todayKey(), +el.dataset.when);
      day(k).tasks.push({ id: uid(), t: x.t, done: false });
      S.dump = S.dump.filter((d) => d !== x);
      save();
      render();
      toast(`Added to ${+el.dataset.when ? "tomorrow" : "today"}`);
    },
    "dump-del": (el) => {
      S.dump = S.dump.filter((d) => d.id !== el.dataset.id);
      save();
      render();
    },
    "dump-clear": () => {
      if (!confirm("Clear the whole brain dump?")) return;
      S.dump = [];
      save();
      render();
    },
    "money-prev": () => (
      (ui.moneyMonth = addMonths(ui.moneyMonth, -1)),
      render()
    ),
    "money-next": () => (
      (ui.moneyMonth = addMonths(ui.moneyMonth, 1)),
      render()
    ),
    "money-today": () => ((ui.moneyMonth = monthOf(todayKey())), render()),
    "tx-add": () => {
      const date = $("#tx-date").value;
      const desc = $("#tx-desc").value.trim();
      const amount = num($("#tx-amount").value);
      const type = $("#tx-type").value;
      if (!date || !amount) {
        toast("Add a date and an amount");
        return $("#tx-amount").focus();
      }
      (S.money.tx[monthOf(date)] ??= []).push({
        id: uid(),
        date,
        desc: desc || (type === "in" ? "Income" : "Spending"),
        cat: type === "in" ? "" : $("#tx-cat").value,
        amount,
        type,
      });
      ui.moneyMonth = monthOf(date);
      save();
      render("tx-desc");
    },
    "tx-del": (el) => {
      const list = S.money.tx[ui.moneyMonth] ?? [];
      S.money.tx[ui.moneyMonth] = list.filter((t) => t.id !== el.dataset.id);
      save();
      render();
    },
    "cat-add": () => {
      const input = $("#add-cat");
      const name = input.value.trim();
      if (!name) return input.focus();
      S.money.categories.push({ id: uid(), name, budget: 0 });
      save();
      render("add-cat");
    },
    "saving-add": () => {
      const input = $("#add-saving");
      const name = input.value.trim();
      if (!name) return input.focus();
      S.money.savings.push({ id: uid(), name, saved: 0, target: 1000 });
      save();
      render();
    },
    "saving-del": (el) => {
      S.money.savings = S.money.savings.filter((g) => g.id !== el.dataset.id);
      save();
      render();
    },
    setting: (el) => {
      S.settings[el.dataset.f] = el.dataset.v;
      applyTheme();
      save();
      render();
    },
    "snooze-backup": () => {
      S.settings.lastBackup = new Date(Date.now() - 7 * 864e5).toISOString();
      save();
      render();
    },
    backup: () => {
      S.settings.lastBackup = new Date().toISOString();
      const blob = new Blob([JSON.stringify(S, null, 1)], {
        type: "application/json",
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `life-planner-backup-${todayKey()}.json`;
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      save();
      render();
      toast("Backup downloaded");
    },
    restore: () => $("#restore-file").click(),
    erase: () => {
      if (!confirm("Erase everything in this planner? This can't be undone."))
        return;
      S = defaults();
      S.settings.welcomed = true;
      save();
      shell();
      render();
      toast("Planner erased");
    },
  };

  // ---------- Inputs (typing never re-renders, so focus stays put) ----------
  const IN = {
    block: (el) => {
      const d = day(ui.date);
      if (el.value) d.blocks[el.dataset.h] = el.value;
      else delete d.blocks[el.dataset.h];
    },
    top: (el) => (day(ui.date).top[+el.dataset.i].t = el.value),
    task: (el) => (byId(day(ui.date).tasks, el.dataset.id).t = el.value),
    win: (el) => (byId(day(ui.date).wins, el.dataset.id).t = el.value),
    notes: (el) => (day(ui.date).notes = el.value),
    tomorrow: (el) => (day(addDays(ui.date, 1)).top[0].t = el.value),
    "jump-date": (el) => {
      if (!el.value) return;
      ui.date = el.value;
      render();
    },
    "week-focus": (el) => ((S.weeks[el.dataset.k] ??= {}).focus = el.value),
    "week-review": (el) => ((S.weeks[el.dataset.k] ??= {}).review = el.value),
    "month-goals": (el) => ((S.months[el.dataset.k] ??= {}).goals = el.value),
    "habit-name": (el) => (byId(S.habits, el.dataset.id).name = el.value),
    goal: (el) => (byId(S.goals, el.dataset.id)[el.dataset.f] = el.value),
    ms: (el) =>
      (byId(byId(S.goals, el.dataset.g).milestones, el.dataset.id).t =
        el.value),
    cat: (el) =>
      (byId(S.money.categories, el.dataset.id)[el.dataset.f] = el.value),
    saving: (el) =>
      (byId(S.money.savings, el.dataset.id)[el.dataset.f] = el.value),
    "setting-name": (el) => (S.settings.name = el.value),
    "setting-currency": (el) => (S.settings.currency = el.value || "$"),
  };

  // Fields that feed totals or bars: re-render once typing pauses, keeping
  // the cursor where it was.
  const REFRESH = new Set(["cat", "saving", "setting-currency"]);
  let refreshTimer;
  function refreshSoon(el) {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => {
      const ae = document.activeElement;
      if (ae !== el) return render();
      const sel = `[data-input="${ae.dataset.input}"]${ae.dataset.id ? `[data-id="${ae.dataset.id}"]` : ""}${ae.dataset.f ? `[data-f="${ae.dataset.f}"]` : ""}`;
      const pos = ae.selectionStart;
      render();
      const again = $(sel);
      if (!again) return;
      again.focus();
      try {
        again.setSelectionRange(pos, pos);
      } catch {
        /* not a text input */
      }
    }, 700);
  }

  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-act]");
    if (!el) return;
    const fn = A[el.dataset.act];
    if (fn) {
      e.preventDefault();
      fn(el, e);
    }
  });
  document.addEventListener("input", (e) => {
    const el = e.target.closest("[data-input]");
    if (!el || !IN[el.dataset.input]) return;
    IN[el.dataset.input](el);
    const saved = $("#saved");
    if (saved) saved.textContent = "Saving…";
    save();
    if (REFRESH.has(el.dataset.input)) refreshSoon(el);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || e.shiftKey) return;
    const el = e.target.closest("[data-enter]");
    if (!el) return;
    e.preventDefault();
    if (el.dataset.enter === "week-add") {
      const t = el.value.trim();
      if (!t) return;
      day(el.dataset.k).tasks.push({ id: uid(), t, done: false });
      save();
      render();
      $(`[data-enter="week-add"][data-k="${el.dataset.k}"]`)?.focus();
      return;
    }
    A[el.dataset.enter]?.(el);
  });
  document.addEventListener("change", (e) => {
    if (e.target.id !== "restore-file") return;
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((text) => {
      try {
        const data = JSON.parse(text);
        if (!data || data.version !== 1 || !data.settings)
          throw new Error("not a backup");
        if (!confirm("Replace everything in this planner with the backup?"))
          return;
        S = {
          ...defaults(),
          ...data,
          settings: {
            ...defaults().settings,
            ...data.settings,
            welcomed: true,
          },
        };
        save();
        applyTheme();
        shell();
        render();
        toast("Backup restored");
      } catch {
        toast("That file isn't a Life Planner backup");
      }
    });
  });
  matchMedia("(prefers-color-scheme: dark)").addEventListener?.(
    "change",
    applyTheme,
  );

  // Save before the tab closes, even mid-debounce.
  addEventListener("beforeunload", () => {
    clearTimeout(saveTimer);
    try {
      localStorage.setItem(KEY, JSON.stringify(S));
    } catch {
      /* nothing more we can do */
    }
  });

  applyTheme();
  shell();
  render();
})();
