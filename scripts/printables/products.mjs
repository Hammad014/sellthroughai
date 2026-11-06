/**
 * Printable pages for each spreadsheet product (same ids as
 * scripts/sheets/build.mjs). Every page is blank, to print and write on.
 */
const DAYS3 = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS3 = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DATES31 = Array.from({ length: 31 }, (_, i) => String(i + 1));
const habitPage = (title = "Habit Tracker") => ({
  title,
  sub: "Colour in a box every day you do it.",
  blocks: [
    { type: "fields", items: ["Month", "Year"] },
    {
      type: "grid",
      first: "Habit",
      firstW: "22%",
      rows: 14,
      cols: DATES31,
      row: 0.42,
    },
    { type: "lines", h: "What helped this month?", n: 4 },
  ],
});

export const PRINTABLES = {
  budget: {
    name: "Budget Planner",
    pages: [
      {
        title: "Monthly Budget",
        blocks: [
          { type: "fields", items: ["Month", "Year"] },
          {
            type: "row",
            widths: ["1fr", "1fr"],
            blocks: [
              {
                type: "table",
                h: "Income",
                cols: [
                  { h: "Source" },
                  { h: "Planned", w: "26%" },
                  { h: "Actual", w: "26%" },
                ],
                rows: 4,
              },
              {
                type: "table",
                h: "Summary",
                cols: [
                  { h: "" },
                  { h: "Planned", w: "30%" },
                  { h: "Actual", w: "30%" },
                ],
                rows: 4,
                prefill: [
                  ["Money in"],
                  ["Money out"],
                  ["Saved + debt"],
                  ["Left over"],
                ],
              },
            ],
          },
          {
            type: "table",
            h: "Spending",
            cols: [
              { h: "Category" },
              { h: "Budget", w: "18%" },
              { h: "Spent", w: "18%" },
              { h: "Left", w: "18%" },
            ],
            rows: 15,
          },
          {
            type: "row",
            blocks: [
              {
                type: "table",
                h: "Savings",
                cols: [{ h: "Goal" }, { h: "Amount", w: "30%" }],
                rows: 4,
              },
              {
                type: "table",
                h: "Debt payments",
                cols: [{ h: "Debt" }, { h: "Amount", w: "30%" }],
                rows: 4,
              },
            ],
          },
        ],
      },
      {
        title: "Bill Tracker",
        sub: "Tick each month when it's paid.",
        blocks: [
          { type: "fields", items: ["Year"] },
          {
            type: "grid",
            first: "Bill · amount · due",
            firstW: "30%",
            rows: 20,
            cols: MONTHS3,
            row: 0.4,
          },
        ],
      },
      {
        title: "Spending Log",
        blocks: [
          { type: "fields", items: ["Month", "Year"] },
          {
            type: "table",
            cols: [
              { h: "Date", w: "12%" },
              { h: "What" },
              { h: "Category", w: "22%" },
              { h: "Amount", w: "14%" },
              { h: "Need / want", w: "14%" },
            ],
            rows: 26,
          },
        ],
      },
      {
        title: "Debt Payoff",
        blocks: [
          {
            type: "table",
            h: "My debts",
            cols: [
              { h: "Debt" },
              { h: "Balance", w: "15%" },
              { h: "Interest %", w: "14%" },
              { h: "Minimum", w: "14%" },
              { h: "Order", w: "10%" },
              { h: "Paid off", w: "14%" },
            ],
            rows: 8,
          },
          {
            type: "boxes",
            h: "Payoff tracker: shade a box for every payment",
            n: 120,
            per: 20,
            numbered: true,
          },
          {
            type: "table",
            h: "Payments",
            cols: [
              { h: "Date", w: "14%" },
              { h: "Debt" },
              { h: "Paid", w: "16%" },
              { h: "New balance", w: "18%" },
            ],
            rows: 9,
          },
        ],
      },
      {
        title: "Savings Tracker",
        sub: "Write the goal, then colour a box every time you save.",
        blocks: [
          { type: "fields", items: ["Saving for", "Target", "By"] },
          {
            type: "boxes",
            n: 100,
            per: 20,
            numbered: true,
            label: "Each box = 1% of your target.",
          },
          { type: "fields", items: ["Saving for", "Target", "By"] },
          {
            type: "boxes",
            n: 100,
            per: 20,
            numbered: true,
            label: "Each box = 1% of your target.",
          },
        ],
      },
    ],
  },

  life: {
    name: "Life Planner",
    pages: [
      {
        title: "My Year",
        blocks: [
          { type: "fields", items: ["Year", "Word for the year"] },
          {
            type: "table",
            h: "Goals",
            cols: [
              { h: "Goal" },
              { h: "Area", w: "16%" },
              { h: "Why it matters", w: "34%" },
              { h: "By", w: "12%" },
            ],
            rows: 10,
          },
          {
            type: "row",
            blocks: [
              { type: "lines", h: "I want to feel…", n: 6 },
              { type: "lines", h: "I'll stop / I'll start…", n: 6 },
            ],
          },
        ],
      },
      {
        title: "Goal Planner",
        blocks: [
          { type: "fields", items: ["Goal", "Target date"] },
          { type: "lines", h: "Why this matters to me", n: 3 },
          {
            type: "table",
            h: "Steps",
            cols: [
              { h: "Step" },
              { h: "By", w: "15%" },
              { h: "Done", w: "10%" },
            ],
            rows: 12,
          },
          {
            type: "lines",
            h: "What might get in the way, and what I'll do",
            n: 4,
          },
        ],
      },
      {
        title: "Weekly Plan",
        blocks: [
          { type: "fields", items: ["Week of"] },
          {
            type: "table",
            h: "Top 3 this week",
            cols: [
              { h: "#", w: "6%" },
              { h: "Priority" },
              { h: "Done", w: "10%" },
            ],
            rows: 3,
            prefill: [["1"], ["2"], ["3"]],
          },
          { type: "week", lines: 6, extra: "Review: wins & lessons" },
        ],
      },
      habitPage(),
      {
        title: "Monthly Review",
        blocks: [
          { type: "fields", items: ["Month"] },
          { type: "scale", label: "How was this month?", n: 10 },
          { type: "lines", h: "Best moments", n: 5 },
          { type: "lines", h: "What I learned", n: 5 },
          { type: "lines", h: "Next month I'll focus on", n: 5 },
        ],
      },
      {
        title: "Important Dates",
        blocks: [
          {
            type: "grid",
            first: "Month",
            firstW: "14%",
            rows: MONTHS3,
            cols: ["Birthdays & anniversaries", "Appointments & deadlines"],
            row: 0.68,
          },
        ],
      },
    ],
  },

  adhd: {
    name: "ADHD Daily Planner",
    pages: [
      {
        title: "Today",
        blocks: [
          { type: "fields", items: ["Date"] },
          { type: "scale", label: "Energy", n: 5 },
          {
            type: "table",
            h: "Just 3 things",
            cols: [
              { h: "#", w: "6%" },
              { h: "Thing" },
              { h: "Tiny first step", w: "38%" },
              { h: "Done", w: "9%" },
            ],
            rows: 3,
            prefill: [["1"], ["2"], ["3"]],
            row: 0.38,
          },
          {
            type: "table",
            h: "Also today",
            cols: [
              { h: "Task" },
              { h: "Size", w: "14%" },
              { h: "Done", w: "9%" },
            ],
            rows: 8,
          },
          {
            type: "row",
            blocks: [
              { type: "checklist", h: "Habits", sections: [{ blank: 6 }] },
              { type: "lines", h: "Brain dump", n: 6 },
            ],
          },
          { type: "lines", h: "One win today", n: 2 },
        ],
      },
      {
        title: "Brain Dump & Sort",
        sub: "Write it all down on the left. Then sort each one into a box.",
        blocks: [
          {
            type: "row",
            grow: true,
            widths: ["1fr", "1fr"],
            blocks: [
              { type: "lines", h: "Everything on my mind", n: 26, grow: true },
              {
                type: "columns",
                cols: [
                  { h: "Today", lines: 8 },
                  { h: "This week", lines: 8 },
                ],
              },
            ],
          },
          {
            type: "columns",
            cols: [
              { h: "Someday", lines: 5 },
              { h: "Let it go", lines: 5 },
            ],
          },
        ],
      },
      {
        title: "Routines",
        sub: "Same steps, same order. Tick each day.",
        blocks: [
          {
            type: "grid",
            h: "Morning",
            first: "Step",
            firstW: "40%",
            rows: 7,
            cols: DAYS3,
            row: 0.3,
          },
          {
            type: "grid",
            h: "After work / school",
            first: "Step",
            firstW: "40%",
            rows: 5,
            cols: DAYS3,
            row: 0.3,
          },
          {
            type: "grid",
            h: "Evening",
            first: "Step",
            firstW: "40%",
            rows: 7,
            cols: DAYS3,
            row: 0.3,
          },
        ],
      },
      {
        title: "Dopamine Menu",
        sub: "Your own list of things that give you energy. Pick from it when you're stuck.",
        blocks: [
          {
            type: "row",
            blocks: [
              { type: "lines", h: "Starters (1–5 min)", n: 7 },
              { type: "lines", h: "Mains (20+ min)", n: 7 },
            ],
          },
          {
            type: "row",
            blocks: [
              { type: "lines", h: "Sides (make boring tasks better)", n: 7 },
              { type: "lines", h: "Desserts (easy to overdo)", n: 7 },
            ],
          },
          { type: "lines", h: "Specials (once in a while)", n: 4 },
        ],
      },
      habitPage(),
    ],
  },

  student: {
    name: "ADHD Student Planner",
    pages: [
      {
        title: "Assignment Tracker",
        blocks: [
          {
            type: "table",
            cols: [
              { h: "Class", w: "16%" },
              { h: "Assignment" },
              { h: "Due", w: "11%" },
              { h: "Tiny first step", w: "26%" },
              { h: "Done", w: "8%" },
            ],
            rows: 28,
          },
        ],
      },
      {
        title: "This Week",
        blocks: [
          { type: "fields", items: ["Week of"] },
          { type: "week", lines: 7, extra: "Coming up next week" },
        ],
      },
      {
        title: "My Classes",
        blocks: [
          {
            type: "table",
            cols: [
              { h: "Class" },
              { h: "Teacher", w: "20%" },
              { h: "Room / link", w: "18%" },
              { h: "Office hours", w: "18%" },
              { h: "Grade", w: "10%" },
            ],
            rows: 8,
            row: 0.42,
          },
          {
            type: "table",
            h: "Exams",
            cols: [
              { h: "Class", w: "20%" },
              { h: "Exam" },
              { h: "Date", w: "14%" },
              { h: "Ready (1–5)", w: "14%" },
            ],
            rows: 8,
          },
        ],
      },
      {
        title: "Exam Study Plan",
        blocks: [
          { type: "fields", items: ["Exam", "Date"] },
          {
            type: "table",
            h: "Topics",
            cols: [
              { h: "Topic" },
              { h: "Notes done", w: "13%" },
              { h: "Practised", w: "13%" },
              { h: "Confident", w: "13%" },
            ],
            rows: 12,
          },
          {
            type: "grid",
            h: "Study sessions",
            first: "Day",
            firstW: "16%",
            rows: 7,
            cols: ["What I'll study", "Minutes", "Done"],
            row: 0.32,
          },
        ],
      },
      {
        title: "Focus Log",
        blocks: [
          {
            type: "table",
            cols: [
              { h: "Date", w: "12%" },
              { h: "Class", w: "18%" },
              { h: "What I did" },
              { h: "Minutes", w: "11%" },
            ],
            rows: 28,
          },
        ],
      },
    ],
  },

  reading: {
    name: "Reading Tracker",
    pages: [
      {
        title: "Reading Log",
        blocks: [
          {
            type: "table",
            cols: [
              { h: "#", w: "5%" },
              { h: "Title" },
              { h: "Author", w: "20%" },
              { h: "Pages", w: "8%" },
              { h: "Finished", w: "11%" },
              { h: "Rating ☆☆☆☆☆", w: "16%" },
            ],
            rows: 28,
          },
        ],
      },
      {
        title: "Book Review",
        blocks: [
          { type: "fields", items: ["Title", "Author"] },
          { type: "fields", items: ["Started", "Finished", "Pages"] },
          {
            type: "scale",
            label: "Rating",
            n: 5,
            labels: ["★", "★", "★", "★", "★"],
          },
          { type: "lines", h: "What it's about", n: 4 },
          { type: "lines", h: "What I loved", n: 4 },
          { type: "lines", h: "Favourite quote", n: 3 },
          { type: "lines", h: "Who I'd recommend it to", n: 2 },
        ],
      },
      {
        title: "Reading Challenge",
        sub: "24 prompts for the year. Write the book you read for each.",
        blocks: [
          {
            type: "table",
            cols: [
              { h: "Prompt", w: "46%" },
              { h: "Book" },
              { h: "Done", w: "8%" },
            ],
            rows: 24,
            prefill: [
              "A book published this year",
              "A debut novel",
              "A book over 500 pages",
              "A book under 200 pages",
              "An author from another country",
              "A classic you've never read",
              "A friend's recommendation",
              "A one-word title",
              "A memoir or biography",
              "Set somewhere you want to visit",
              "One you've owned for over a year",
              "An audiobook",
              "A genre you never read",
              "Became a film or series",
              "Poems or short stories",
              "Non-fiction on a new topic",
              "From the year you were born",
              "A reread of an old favourite",
              "An author you've read before",
              "A colour in the title",
              "A book under 5 hours as audio",
              "Bought from a local bookshop",
              "The first in a series",
              "Picked for its cover",
            ].map((p) => [p]),
          },
        ],
      },
      {
        title: "To Be Read",
        blocks: [
          {
            type: "table",
            cols: [
              { h: "Title" },
              { h: "Author", w: "22%" },
              { h: "Where I heard of it", w: "26%" },
              { h: "Got it", w: "9%" },
            ],
            rows: 28,
          },
        ],
      },
    ],
  },

  meal: {
    name: "Meal Planner",
    pages: [
      {
        title: "Weekly Meal Plan",
        blocks: [
          { type: "fields", items: ["Week of"] },
          {
            type: "grid",
            first: "",
            firstW: "13%",
            rows: DAYS3,
            cols: ["Breakfast", "Lunch", "Dinner", "Snack"],
            row: 0.95,
          },
          { type: "lines", h: "Prep notes", n: 3 },
        ],
      },
      {
        title: "Grocery List",
        blocks: [
          {
            type: "columns",
            cols: [
              { h: "Fruit & veg", lines: 12 },
              { h: "Meat & fish", lines: 12 },
              { h: "Dairy & eggs", lines: 12 },
            ],
          },
          {
            type: "columns",
            cols: [
              { h: "Bakery", lines: 8 },
              { h: "Pantry", lines: 8 },
              { h: "Frozen", lines: 8 },
            ],
          },
          {
            type: "columns",
            cols: [
              { h: "Drinks", lines: 5 },
              { h: "Household", lines: 5 },
              { h: "Other", lines: 5 },
            ],
          },
        ],
      },
      {
        title: "Recipe Cards",
        blocks: [0, 1].map(() => ({
          type: "row",
          widths: ["1fr", "1.3fr"],
          blocks: [
            {
              type: "table",
              h: "Recipe: ______________________",
              cols: [{ h: "Ingredient" }, { h: "Qty", w: "24%" }],
              rows: 10,
            },
            { type: "lines", h: "Method  ·  serves ___  ·  ___ min", n: 11 },
          ],
        })),
      },
      {
        title: "Pantry Inventory",
        blocks: [
          {
            type: "row",
            blocks: [
              {
                type: "table",
                h: "Cupboard",
                cols: [
                  { h: "Item" },
                  { h: "Have", w: "16%" },
                  { h: "Buy", w: "12%" },
                ],
                rows: 26,
              },
              {
                type: "table",
                h: "Fridge & freezer",
                cols: [
                  { h: "Item" },
                  { h: "Have", w: "16%" },
                  { h: "Use by", w: "18%" },
                ],
                rows: 26,
              },
            ],
          },
        ],
      },
    ],
  },

  cleaning: {
    name: "Cleaning Schedule",
    pages: [
      {
        title: "Weekly Cleaning Checklist",
        blocks: [
          { type: "fields", items: ["Week of"] },
          ...["Kitchen", "Bathroom", "Bedrooms", "Living room"].map((room) => ({
            type: "grid",
            h: room,
            first: "Task",
            firstW: "38%",
            rows: 4,
            cols: DAYS3,
            row: 0.27,
          })),
          {
            type: "grid",
            h: "Everywhere",
            first: "Task",
            firstW: "38%",
            rows: 4,
            cols: DAYS3,
            row: 0.27,
          },
        ],
      },
      {
        title: "Monthly & Seasonal",
        blocks: [
          {
            type: "checklist",
            h: "Every month",
            columns: 2,
            sections: [
              {
                items: [
                  "Clean the microwave",
                  "Descale taps and shower head",
                  "Wipe light switches and handles",
                  "Test smoke alarms",
                  "Clean the washing machine filter",
                  "Declutter one drawer",
                ],
                blank: 4,
              },
              { blank: 10 },
            ],
          },
          {
            type: "checklist",
            h: "Every 3 months",
            columns: 2,
            sections: [
              {
                items: [
                  "Clean the oven",
                  "Wash cushion covers",
                  "Dust skirting boards",
                  "Clean the windows",
                ],
                blank: 2,
              },
              { blank: 6 },
            ],
          },
          {
            type: "checklist",
            h: "Once or twice a year",
            columns: 2,
            sections: [
              {
                items: [
                  "Flip the mattress",
                  "Deep clean carpets",
                  "Clear the gutters",
                  "Sort the wardrobe",
                ],
                blank: 2,
              },
              { blank: 6 },
            ],
          },
        ],
      },
      {
        title: "Chore Chart",
        sub: "Who does what. Write a name, then tick each day it's done.",
        blocks: [
          { type: "fields", items: ["Week of"] },
          {
            type: "grid",
            first: "Chore · who",
            firstW: "34%",
            rows: 18,
            cols: DAYS3,
            row: 0.42,
          },
        ],
      },
      {
        title: "Declutter 30",
        sub: "One small spot a day. Ten minutes is enough. Colour the box when it's done.",
        blocks: [
          {
            type: "table",
            cols: [
              { h: "Day", w: "8%" },
              { h: "Spot" },
              { h: "Done", w: "9%" },
              { h: "Day", w: "8%" },
              { h: "Spot" },
              { h: "Done", w: "9%" },
            ],
            rows: 15,
            prefill: Array.from({ length: 15 }, (_, i) => [
              String(i + 1),
              "",
              "",
              String(i + 16),
            ]),
            row: 0.42,
          },
          { type: "lines", h: "What I'm glad to be rid of", n: 5 },
        ],
      },
    ],
  },

  fitness: {
    name: "Workout & Weight Tracker",
    pages: [
      {
        title: "Weekly Workout Log",
        blocks: [
          { type: "fields", items: ["Week of"] },
          {
            type: "table",
            cols: [
              { h: "Day", w: "9%" },
              { h: "Workout" },
              { h: "Minutes", w: "11%" },
              { h: "How hard (1–5)", w: "15%" },
              { h: "Notes", w: "26%" },
            ],
            rows: 7,
            prefill: DAYS3.map((d) => [d]),
            row: 0.5,
          },
          { type: "lines", h: "This week I'm proud of", n: 3 },
        ],
      },
      {
        title: "Strength Log",
        blocks: [
          { type: "fields", items: ["Date", "Workout"] },
          {
            type: "table",
            cols: [
              { h: "Exercise" },
              { h: "Set 1", w: "13%" },
              { h: "Set 2", w: "13%" },
              { h: "Set 3", w: "13%" },
              { h: "Set 4", w: "13%" },
              { h: "Best", w: "10%" },
            ],
            rows: 10,
            row: 0.36,
          },
          { type: "fields", items: ["Date", "Workout"] },
          {
            type: "table",
            cols: [
              { h: "Exercise" },
              { h: "Set 1", w: "13%" },
              { h: "Set 2", w: "13%" },
              { h: "Set 3", w: "13%" },
              { h: "Set 4", w: "13%" },
              { h: "Best", w: "10%" },
            ],
            rows: 10,
            row: 0.36,
          },
          {
            type: "note",
            text: "Write each set as weight × reps, e.g. 60 × 8.",
          },
        ],
      },
      {
        title: "Weight & Measurements",
        blocks: [
          { type: "fields", items: ["Start", "Goal", "Unit"] },
          {
            type: "table",
            cols: [
              { h: "Week", w: "8%" },
              { h: "Date", w: "14%" },
              { h: "Weight", w: "13%" },
              { h: "Change", w: "12%" },
              { h: "Waist", w: "12%" },
              { h: "Notes" },
            ],
            rows: 26,
            prefill: Array.from({ length: 26 }, (_, i) => [String(i + 1)]),
          },
        ],
      },
      {
        title: "Workout Calendar",
        sub: "Colour in each day you move. Write what you did.",
        blocks: [
          { type: "fields", items: ["Month", "Goal: ___ workouts"] },
          { type: "month" },
        ],
      },
    ],
  },

  baby: {
    name: "Pregnancy & Baby Tracker",
    pages: [
      {
        title: "Appointments",
        blocks: [
          {
            type: "table",
            cols: [
              { h: "Date", w: "11%" },
              { h: "Time", w: "8%" },
              { h: "Type / with", w: "22%" },
              { h: "Questions to ask" },
              { h: "Notes", w: "24%" },
            ],
            rows: 18,
            row: 0.48,
          },
        ],
      },
      {
        title: "Bump Log",
        blocks: [
          {
            type: "table",
            cols: [
              { h: "Week", w: "8%" },
              { h: "Date", w: "12%" },
              { h: "Weight", w: "11%" },
              { h: "Bump", w: "10%" },
              { h: "Feeling / symptoms" },
              { h: "Mood", w: "10%" },
            ],
            rows: 20,
            row: 0.42,
          },
        ],
      },
      {
        title: "Hospital Bag",
        sub: "Pack from about week 35.",
        blocks: [
          {
            type: "checklist",
            columns: 3,
            sections: [
              {
                h: "For you",
                items: [
                  "Maternity notes & birth plan",
                  "Nightdress / big T-shirt",
                  "Dressing gown & slippers",
                  "Maternity pads",
                  "Big comfy knickers",
                  "Nursing bras",
                  "Toiletries & lip balm",
                  "Long phone charger",
                  "Snacks & drinks",
                  "Hair ties",
                  "Going-home clothes",
                  "Glasses / lenses",
                ],
                blank: 4,
              },
              {
                h: "For baby",
                items: [
                  "Newborn nappies",
                  "Water wipes / cotton wool",
                  "Vests (newborn + 0–3m)",
                  "Sleepsuits",
                  "Hat & socks",
                  "Muslins",
                  "Blanket",
                  "Car seat (fitted!)",
                  "Going-home outfit",
                  "Formula & bottles (if using)",
                ],
                blank: 6,
              },
              {
                h: "For your partner",
                items: [
                  "Change of clothes",
                  "Snacks & drinks",
                  "Phone charger",
                  "Change for parking",
                  "Pillow",
                  "Something to read",
                ],
                blank: 10,
              },
            ],
          },
        ],
      },
      {
        title: "Baby's Day",
        sub: "Feeds, nappies and sleep. One row each time.",
        blocks: [
          { type: "fields", items: ["Date"] },
          {
            type: "table",
            cols: [
              { h: "Time", w: "10%" },
              { h: "Feed (L / R / bottle)", w: "20%" },
              { h: "ml / min", w: "11%" },
              { h: "Wet", w: "7%" },
              { h: "Dirty", w: "7%" },
              { h: "Sleep from–to", w: "17%" },
              { h: "Notes" },
            ],
            rows: 24,
          },
        ],
      },
      {
        title: "Week by Week Notes",
        blocks: [
          {
            type: "grid",
            first: "Week",
            firstW: "10%",
            rows: Array.from(
              { length: 18 },
              (_, i) => String(4 + i * 2) + "–" + String(5 + i * 2),
            ),
            cols: ["Size · how I'm feeling · cravings · kicks"],
            row: 0.48,
          },
        ],
      },
    ],
  },

  wedding: {
    name: "Wedding Planner",
    pages: [
      {
        title: "Wedding Checklist",
        blocks: [
          {
            type: "checklist",
            columns: 2,
            sections: [
              {
                h: "12+ months",
                items: [
                  "Set a budget",
                  "Draft the guest list",
                  "Book the venue",
                  "Book the officiant",
                ],
              },
              {
                h: "9–10 months",
                items: [
                  "Book the photographer",
                  "Book the caterer",
                  "Send save-the-dates",
                  "Book band / DJ",
                ],
              },
              {
                h: "6–8 months",
                items: [
                  "Choose outfits",
                  "Choose the wedding party",
                  "Book the florist",
                  "Book hair & makeup",
                  "Plan the honeymoon",
                ],
              },
              {
                h: "3–5 months",
                items: [
                  "Order the cake",
                  "Book transport",
                  "Buy the rings",
                  "Order & send invitations",
                  "Menu tasting",
                ],
              },
              {
                h: "1–2 months",
                items: [
                  "Plan the order of the day",
                  "Dress fitting",
                  "Chase RSVPs",
                  "Final numbers to venue",
                  "Seating plan",
                  "Marriage licence",
                ],
              },
              {
                h: "Last weeks",
                items: [
                  "Vows & speeches",
                  "Final fitting",
                  "Confirm every vendor",
                  "Pay final balances",
                  "Pack for the honeymoon",
                  "Rehearsal & an early night",
                ],
              },
            ],
          },
        ],
      },
      {
        title: "Wedding Budget",
        blocks: [
          { type: "fields", items: ["Total budget", "Wedding date"] },
          {
            type: "table",
            cols: [
              { h: "Item" },
              { h: "Estimate", w: "15%" },
              { h: "Actual", w: "15%" },
              { h: "Paid", w: "15%" },
              { h: "Due", w: "12%" },
            ],
            rows: 26,
            prefill: [
              ["Venue"],
              ["Catering"],
              ["Drinks"],
              ["Photography"],
              ["Attire"],
              ["Rings"],
              ["Flowers"],
              ["Music"],
              ["Cake"],
              ["Stationery"],
              ["Hair & makeup"],
              ["Transport"],
            ],
          },
        ],
      },
      {
        title: "Guest List",
        blocks: [
          {
            type: "table",
            cols: [
              { h: "Name" },
              { h: "People", w: "9%" },
              { h: "Invited", w: "9%" },
              { h: "RSVP", w: "10%" },
              { h: "Meal", w: "14%" },
              { h: "Table", w: "8%" },
            ],
            rows: 28,
          },
        ],
      },
      {
        title: "Vendors",
        blocks: [
          {
            type: "table",
            cols: [
              { h: "Type", w: "15%" },
              { h: "Business" },
              { h: "Contact & phone", w: "24%" },
              { h: "Booked", w: "9%" },
              { h: "Deposit", w: "11%" },
            ],
            rows: 14,
            row: 0.55,
          },
        ],
      },
      {
        title: "Seating Plan",
        blocks: [
          {
            type: "row",
            blocks: [
              {
                type: "table",
                h: "Table ___",
                cols: [{ h: "Guest" }],
                rows: 10,
              },
              {
                type: "table",
                h: "Table ___",
                cols: [{ h: "Guest" }],
                rows: 10,
              },
              {
                type: "table",
                h: "Table ___",
                cols: [{ h: "Guest" }],
                rows: 10,
              },
            ],
          },
          {
            type: "row",
            blocks: [
              {
                type: "table",
                h: "Table ___",
                cols: [{ h: "Guest" }],
                rows: 10,
              },
              {
                type: "table",
                h: "Table ___",
                cols: [{ h: "Guest" }],
                rows: 10,
              },
              {
                type: "table",
                h: "Table ___",
                cols: [{ h: "Guest" }],
                rows: 10,
              },
            ],
          },
        ],
      },
    ],
  },

  shop: {
    name: "Sales Tracker",
    pages: [
      {
        title: "Order Log",
        blocks: [
          { type: "fields", items: ["Month", "Year"] },
          {
            type: "table",
            cols: [
              { h: "Date", w: "10%" },
              { h: "Order #", w: "11%" },
              { h: "Product" },
              { h: "Qty", w: "6%" },
              { h: "Price", w: "10%" },
              { h: "Shipping", w: "10%" },
              { h: "Platform", w: "12%" },
              { h: "Sent", w: "7%" },
            ],
            rows: 28,
          },
        ],
      },
      {
        title: "Monthly Sales Summary",
        blocks: [
          { type: "fields", items: ["Year"] },
          {
            type: "table",
            cols: [
              { h: "Month", w: "12%" },
              { h: "Revenue" },
              { h: "Fees" },
              { h: "Cost of goods" },
              { h: "Expenses" },
              { h: "Profit" },
            ],
            rows: 13,
            prefill: [...MONTHS3, "Year"].map((m) => [m]),
            row: 0.42,
          },
          { type: "lines", h: "Best sellers & notes", n: 5 },
        ],
      },
      {
        title: "Product Costing",
        sub: "What one item really costs you, and what you keep.",
        blocks: [0, 1].map(() => ({
          type: "row",
          widths: ["1.3fr", "1fr"],
          blocks: [
            {
              type: "table",
              h: "Product: __________________",
              cols: [{ h: "Material / packaging" }, { h: "Cost", w: "22%" }],
              rows: 8,
            },
            {
              type: "table",
              h: "Price check",
              cols: [{ h: "" }, { h: "Amount", w: "36%" }],
              rows: 8,
              prefill: [
                ["Materials"],
                ["Packaging"],
                ["Labour (time × rate)"],
                ["Fees"],
                ["Postage"],
                ["Total cost"],
                ["Price"],
                ["Profit"],
              ],
            },
          ],
        })),
      },
      {
        title: "Expenses",
        blocks: [
          {
            type: "table",
            cols: [
              { h: "Date", w: "11%" },
              { h: "Type", w: "18%" },
              { h: "What" },
              { h: "Amount", w: "13%" },
              { h: "Receipt", w: "9%" },
            ],
            rows: 28,
          },
        ],
      },
      {
        title: "Inventory",
        blocks: [
          {
            type: "table",
            cols: [
              { h: "Product / material" },
              { h: "In stock", w: "12%" },
              { h: "Reorder at", w: "12%" },
              { h: "Supplier", w: "22%" },
              { h: "Ordered", w: "11%" },
            ],
            rows: 28,
          },
        ],
      },
    ],
  },
};
