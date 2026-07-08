# DSA Interview Prep — Workbook (website)

An interactive teaching site built from the [`dsa-prep`](../dsa-prep/) plan — same
"Honey & Amber" theme and layout as `python/AI/nn-cv-workbook`. 16 modules in the
8-week study order, each with four tabs:

- **Learn** — teacher-style notes with callouts, C++ templates, and hand-drawn SVG
  diagrams that make the pattern visible (windows sliding, stacks evolving, BFS layers,
  DP tables filling…).
- **Problems** — the full LeetCode ladder (190 problems) with checkboxes. Checking a
  problem feeds the sidebar progress bar (which tracks 🎯 OA-critical problems). Every
  problem links straight to LeetCode — that's the judge. There's also an embedded C++
  scratchpad (OneCompiler) for quick experiments.
- **Deep Dives** — the ingeniously-hard problems: try them on LeetCode first, then
  reveal the full walkthrough.
- **Quiz** — fresh MCQs per module (pattern recognition, template bugs, complexity,
  traces) with teaching explanations.

Progress (checkboxes, quiz picks, theme) persists in `localStorage`.

## Run it

```bash
npm install
npm run dev        # dev server
npm run build      # production build into dist/
npm run preview    # serve the build
```

## Structure

- `src/topics/t00.json … t15.json` — one file per module (content + figures), see
  `AUTHORING.md` for the schema. Sorted file order = sidebar study order.
- `src/App.jsx` — the whole app; `src/index.css` — the shared theme.
- `scripts/validate.mjs` — schema + ladder cross-check against `../dsa-prep/*.md`.
- `scripts/qa.mjs` — Playwright end-to-end pass (screenshots every module, exercises
  tabs/checkboxes/quiz/theme).
