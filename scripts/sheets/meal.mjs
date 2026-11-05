/**
 * Meal Planner: for Excel and Google Sheets.
 *
 *   Start Here · Week Plan · Grocery List · Recipes · Ingredients
 *
 * Pick recipes for the week and the Grocery List writes itself: every
 * ingredient of every planned meal, times the number of times it's planned,
 * the same item added up across recipes, sorted by supermarket aisle.
 */
import { guideSheet } from "./blocks.mjs";
import {
  C,
  header,
  input,
  list,
  note,
  put,
  sheet,
  title,
  workbook,
} from "./lib.mjs";

const R0 = 6; // Recipes rows
const R1 = 105;
const I0 = 6; // Ingredients rows
const I1 = 605;
const PLAN = "'Week Plan'!$C$7:$I$10";
const MEALS = ["Breakfast", "Lunch", "Dinner", "Snack"];
const CATEGORIES = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"];
export const AISLES = [
  "Fruit & veg",
  "Meat & fish",
  "Dairy & eggs",
  "Bakery",
  "Pantry",
  "Frozen",
  "Drinks",
  "Household",
  "Other",
];
const UNITS = [
  "g",
  "kg",
  "ml",
  "l",
  "tsp",
  "tbsp",
  "cup",
  "piece",
  "pack",
  "tin",
  "bunch",
  "clove",
  "slice",
];
const IN = (col) => `Ingredients!$${col}$${I0}:$${col}$${I1}`;
const INT = (col) => `Ingredients!$${col}$1:$${col}$${I1}`;

const fillBg = (argb) => ({
  type: "pattern",
  pattern: "solid",
  bgColor: { argb },
});

/** Starter recipes (buyers keep, edit or delete them). */
export const RECIPES = [
  [
    "Overnight oats",
    "Breakfast",
    5,
    1,
    [
      ["Oats", 50, "g", "Pantry"],
      ["Milk", 150, "ml", "Dairy & eggs"],
      ["Banana", 1, "piece", "Fruit & veg"],
      ["Honey", 1, "tsp", "Pantry"],
    ],
  ],
  [
    "Scrambled eggs on toast",
    "Breakfast",
    10,
    1,
    [
      ["Eggs", 2, "piece", "Dairy & eggs"],
      ["Bread", 2, "slice", "Bakery"],
      ["Butter", 10, "g", "Dairy & eggs"],
    ],
  ],
  [
    "Chicken wraps",
    "Lunch",
    15,
    2,
    [
      ["Chicken breast", 300, "g", "Meat & fish"],
      ["Tortilla wraps", 4, "piece", "Bakery"],
      ["Lettuce", 1, "piece", "Fruit & veg"],
      ["Tomato", 2, "piece", "Fruit & veg"],
      ["Greek yoghurt", 100, "g", "Dairy & eggs"],
    ],
  ],
  [
    "Lentil soup",
    "Lunch",
    35,
    4,
    [
      ["Red lentils", 250, "g", "Pantry"],
      ["Onion", 1, "piece", "Fruit & veg"],
      ["Carrot", 2, "piece", "Fruit & veg"],
      ["Chopped tomatoes", 1, "tin", "Pantry"],
      ["Vegetable stock", 1, "l", "Pantry"],
    ],
  ],
  [
    "Spaghetti bolognese",
    "Dinner",
    40,
    4,
    [
      ["Beef mince", 500, "g", "Meat & fish"],
      ["Spaghetti", 400, "g", "Pantry"],
      ["Onion", 1, "piece", "Fruit & veg"],
      ["Garlic", 2, "clove", "Fruit & veg"],
      ["Chopped tomatoes", 2, "tin", "Pantry"],
    ],
  ],
  [
    "Salmon, rice and greens",
    "Dinner",
    25,
    2,
    [
      ["Salmon fillets", 2, "piece", "Meat & fish"],
      ["Rice", 150, "g", "Pantry"],
      ["Broccoli", 1, "piece", "Fruit & veg"],
      ["Lemon", 1, "piece", "Fruit & veg"],
    ],
  ],
  [
    "Veggie stir-fry",
    "Dinner",
    20,
    2,
    [
      ["Noodles", 2, "pack", "Pantry"],
      ["Peppers", 2, "piece", "Fruit & veg"],
      ["Garlic", 2, "clove", "Fruit & veg"],
      ["Soy sauce", 2, "tbsp", "Pantry"],
      ["Onion", 1, "piece", "Fruit & veg"],
    ],
  ],
  [
    "Apple and peanut butter",
    "Snack",
    2,
    1,
    [
      ["Apples", 1, "piece", "Fruit & veg"],
      ["Peanut butter", 1, "tbsp", "Pantry"],
    ],
  ],
];

export function buildMeal() {
  const wb = workbook();
  guideSheet(
    wb,
    "Meal Planner",
    "by Makeready · works in Google Sheets and Excel",
    [
      ["", "HOW IT WORKS", "h"],
      [
        "1",
        'Week Plan: pick a recipe for each meal from the dropdown (or just type, e.g. "Leftovers" or "Eating out").',
      ],
      [
        "2",
        "Grocery List: it writes itself. Every ingredient you need for the week, added up and sorted by aisle. Tick items off in the shop.",
      ],
      [
        "3",
        "Recipes and Ingredients: 8 starter recipes are included. Add your own: the recipe on Recipes, its ingredients on Ingredients.",
      ],
      ["", ""],
      ["", "EACH WEEK (10 MINUTES)", "h"],
      [
        "→",
        "Clear the Week Plan and the Got it ticks, plan the new week, then shop from the Grocery List.",
      ],
      [
        "→",
        "Already have something at home? Tick it on the Grocery List before you go.",
      ],
      ["", ""],
      ["", "GOOD TO KNOW", "h"],
      [
        "•",
        'Use the same spelling and unit for the same item (e.g. always "Onion", "piece"): then it\'s added up across recipes.',
      ],
      [
        "•",
        "Typed something that isn't a recipe (like \"Leftovers\")? That's fine; it just adds nothing to the list.",
      ],
      ["", ""],
      ["", "COLOUR KEY", "h"],
      [
        "",
        "Yellow cells are yours to type in. Everything else updates itself, so don't type over it.",
        "key",
      ],
    ],
  );
  weekPlan(wb);
  groceryList(wb);
  recipes(wb);
  ingredients(wb);
  return wb;
}

function weekPlan(wb) {
  const ws = sheet(wb, "Week Plan", {
    tab: C.navy,
    widths: [12, ...Array(7).fill(19)],
  });
  title(
    ws,
    "Week Plan",
    "Pick a recipe for each meal, or type anything. The grocery list builds itself.",
    8,
  );
  put(ws, "B4", "Week starting", { font: { bold: true } });
  input(
    ws,
    "C4",
    { f: "TODAY()-WEEKDAY(TODAY(),3)" },
    { fmt: "ddd d mmm yyyy", align: "center" },
  );
  header(ws, 6, 2, ["", ...Array(7).fill("")]);
  for (let d = 0; d < 7; d++) {
    const cell = ws.getCell(6, 3 + d);
    cell.value = { formula: `$C$4+${d}` };
    cell.numFmt = "dddd d";
  }
  MEALS.forEach((meal, i) => {
    const r = 7 + i;
    put(ws, `B${r}`, meal, { font: { bold: true, color: { argb: C.blue } } });
    ws.getRow(r).height = 40;
    for (let d = 0; d < 7; d++) {
      const ref = `${String.fromCharCode(67 + d)}${r}`;
      input(ws, ref, null, { wrap: true, align: "center" });
      list(ws, ref, `Recipes!$B$${R0}:$B$${R1}`);
    }
  });
  put(ws, "B11", "Prep notes", {
    font: { bold: true, color: { argb: C.muted } },
  });
  for (let d = 0; d < 7; d++)
    input(ws, `${String.fromCharCode(67 + d)}11`, null, {
      wrap: true,
      font: { size: 9, color: { argb: C.muted } },
    });
  ws.getRow(11).height = 34;
  put(
    ws,
    "B13",
    {
      f: `COUNTA(${PLAN})&" meals planned · "&COUNTIF(Ingredients!$I$${I0}:$I$${I1},1)&" items on your grocery list"`,
    },
    { font: { bold: true, color: { argb: C.good } } },
  );
  ws.mergeCells("B13:F13");
  ws.addConditionalFormatting({
    ref: "C6:I6",
    rules: [
      {
        type: "expression",
        formulae: ["C6=TODAY()"],
        style: { fill: fillBg(C.blue) },
      },
    ],
  });
}

function groceryList(wb) {
  const ws = sheet(wb, "Grocery List", {
    tab: C.good,
    widths: [16, 30, 10, 9, 8, 3, 30, 8],
  });
  title(
    ws,
    "Grocery List",
    "Built from this week's plan: added up and sorted by aisle. Tick what you've got.",
    8,
  );
  header(ws, 5, 2, [
    "Aisle",
    "Item",
    "Qty",
    "Unit",
    "Got it",
    "",
    "Also buy",
    "Got it",
  ]);
  ws.getCell("G5").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: C.white },
  };
  for (let k = 1; k <= 80; k++) {
    const r = 5 + k;
    put(ws, `J${r}`, { f: `IFERROR(SMALL(${IN("J")},${k}),"")` }); // hidden key
    const row = `MOD($J${r},10000)`;
    const pick = (col) => `IF($J${r}="","",INDEX(${INT(col)},${row}))`;
    put(
      ws,
      `B${r}`,
      {
        f: `IF($J${r}="","",IF(INDEX(${INT("F")},${row})="","Other",INDEX(${INT("F")},${row})))`,
      },
      { font: { size: 9, color: { argb: C.muted } } },
    );
    put(
      ws,
      `C${r}`,
      { f: pick("C") },
      {
        font: { bold: true },
        border: { bottom: { style: "thin", color: { argb: C.line } } },
      },
    );
    put(ws, `D${r}`, { f: pick("K") }, { align: "center" });
    put(ws, `E${r}`, { f: pick("E") }, { font: { color: { argb: C.muted } } });
    input(ws, `F${r}`, null, { align: "center" });
    list(ws, `F${r}`, ["✓"]);
  }
  for (let r = 6; r <= 35; r++) {
    input(ws, `H${r}`, null);
    input(ws, `I${r}`, null, { align: "center" });
    list(ws, `I${r}`, ["✓"]);
  }
  ws.getColumn(10).hidden = true;
  // Show each aisle name only on its first row.
  ws.addConditionalFormatting({
    ref: "B7:B85",
    rules: [
      {
        type: "expression",
        formulae: ["B7=B6"],
        style: { font: { color: { argb: C.white } } },
      },
    ],
  });
  ws.addConditionalFormatting({
    ref: "C6:F85",
    rules: [
      {
        type: "expression",
        formulae: ['$F6="✓"'],
        style: {
          font: { strike: true, color: { argb: C.faint } },
          fill: fillBg(C.goodBg),
        },
      },
    ],
  });
  ws.addConditionalFormatting({
    ref: "H6:I35",
    rules: [
      {
        type: "expression",
        formulae: ['$I6="✓"'],
        style: { font: { strike: true, color: { argb: C.faint } } },
      },
    ],
  });
  note(
    ws,
    "B87",
    "Changed the plan? Clear the Got it ticks: they belong to rows, not items.",
  );
}

function recipes(wb) {
  const ws = sheet(wb, "Recipes", {
    tab: "FFD08726",
    widths: [30, 12, 10, 10, 40, 12],
    freeze: 5,
  });
  title(
    ws,
    "Recipes",
    "Your recipe list. Put each recipe's ingredients on the Ingredients tab.",
    6,
  );
  header(ws, 5, 2, [
    "Recipe",
    "Meal",
    "Minutes",
    "Serves",
    "Link or notes",
    "This week",
  ]);
  for (let r = R0; r <= R1; r++) {
    const ex = RECIPES[r - R0];
    input(ws, `B${r}`, ex?.[0] ?? null, { font: { bold: true } });
    input(ws, `C${r}`, ex?.[1] ?? null, { align: "center", font: { size: 9 } });
    list(ws, `C${r}`, CATEGORIES);
    input(ws, `D${r}`, ex?.[2] ?? null, { align: "center" });
    input(ws, `E${r}`, ex?.[3] ?? null, { align: "center" });
    input(ws, `F${r}`, null, { font: { size: 9, color: { argb: C.muted } } });
    put(
      ws,
      `G${r}`,
      {
        f: `IF(B${r}="","",IF(COUNTIF(${PLAN},B${r})=0,"",COUNTIF(${PLAN},B${r})&"×"))`,
      },
      { align: "center", font: { bold: true, color: { argb: C.good } } },
    );
  }
}

function ingredients(wb) {
  const ws = sheet(wb, "Ingredients", {
    tab: "FFD08726",
    widths: [30, 26, 9, 9, 16],
    freeze: 5,
  });
  title(
    ws,
    "Ingredients",
    "One row per ingredient per recipe. Quantities are for one batch of the recipe.",
    6,
  );
  header(ws, 5, 2, ["Recipe", "Ingredient", "Qty", "Unit", "Aisle"]);
  const rows = RECIPES.flatMap(([name, , , , items]) =>
    items.map((it) => [name, ...it]),
  );
  const aisles = `{${AISLES.map((a) => `"${a}"`).join(",")}}`;
  for (let r = I0; r <= I1; r++) {
    const ex = rows[r - I0];
    input(ws, `B${r}`, ex?.[0] ?? null);
    list(ws, `B${r}`, `Recipes!$B$${R0}:$B$${R1}`);
    input(ws, `C${r}`, ex?.[1] ?? null, { font: { bold: true } });
    input(ws, `D${r}`, ex?.[2] ?? null, { align: "center" });
    input(ws, `E${r}`, ex?.[3] ?? null, { align: "center" });
    list(ws, `E${r}`, UNITS);
    input(ws, `F${r}`, ex?.[4] ?? null, { font: { size: 9 } });
    list(ws, `F${r}`, AISLES);
    // Hidden: times planned, total needed, first row of this item+unit, list key, item total.
    put(ws, `G${r}`, {
      f: `IF(OR(B${r}="",C${r}=""),0,COUNTIF(${PLAN},B${r}))`,
    });
    put(ws, `H${r}`, { f: `N(D${r})*G${r}` });
    put(ws, `I${r}`, {
      f: `IF(G${r}=0,"",IF(COUNTIFS($C$5:C${r - 1},C${r},$E$5:E${r - 1},E${r},$G$5:G${r - 1},">0")=0,1,""))`,
    });
    put(ws, `J${r}`, {
      f: `IF(I${r}=1,IFERROR(MATCH(F${r},${aisles},0),${AISLES.length})*10000+ROW(),"")`,
    });
    put(ws, `K${r}`, {
      f: `IF(I${r}=1,SUMIFS($H$${I0}:$H$${I1},$C$${I0}:$C$${I1},C${r},$E$${I0}:$E$${I1},E${r}),"")`,
    });
  }
  for (const c of [7, 8, 9, 10, 11]) ws.getColumn(c).hidden = true;
  ws.addConditionalFormatting({
    ref: `B${I0}:F${I1}`,
    rules: [
      {
        type: "expression",
        formulae: [`$G${I0}>0`],
        style: { fill: fillBg(C.goodBg) },
      },
    ],
  });
}

// ---- Demo data -----------------------------------------------------------

/** A planned week: [meal row][day] (null = empty, text = not a recipe). */
export const DEMO_WEEK = [
  [
    "Overnight oats",
    "Overnight oats",
    "Scrambled eggs on toast",
    "Overnight oats",
    "Overnight oats",
    "Scrambled eggs on toast",
    null,
  ],
  [
    "Lentil soup",
    "Chicken wraps",
    "Lentil soup",
    "Chicken wraps",
    "Leftovers",
    null,
    null,
  ],
  [
    "Spaghetti bolognese",
    "Veggie stir-fry",
    "Salmon, rice and greens",
    "Spaghetti bolognese",
    "Eating out",
    "Veggie stir-fry",
    "Salmon, rice and greens",
  ],
  [
    "Apple and peanut butter",
    null,
    "Apple and peanut butter",
    null,
    "Apple and peanut butter",
    null,
    null,
  ],
];

export function fillDemo(wb) {
  const ws = wb.getWorksheet("Week Plan");
  DEMO_WEEK.forEach((row, i) =>
    row.forEach((v, d) => (ws.getCell(7 + i, 3 + d).value = v)),
  );
  ws.getCell("C11").value = "Soak oats tonight";
  ws.getCell("E11").value = "Defrost salmon";
  wb.getWorksheet("Grocery List").getCell("H6").value = "Coffee";
  wb.getWorksheet("Grocery List").getCell("H7").value = "Washing-up liquid";
  return DEMO_WEEK;
}
