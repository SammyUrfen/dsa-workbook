# DSA Workbook — Topic Authoring Spec

You are converting one markdown module from `/home/SammyUrfen/Codes/dsa-prep/` into one
topic JSON file in `/home/SammyUrfen/Codes/dsa-workbook/src/topics/`. The site is a
teaching workbook (React + react-markdown + KaTeX) with four tabs per module:
**Learn** (teacher-style notes with SVG figures), **Problems** (the LeetCode ladder with
checkboxes — the external "judge"), **Deep Dives** (hard problems, try-then-reveal),
**Quiz** (fresh MCQs you write).

## File assignment (study order → file name, tag, week, priority)

| File | Source md | tag | week | priority | title |
|---|---|---|---|---|---|
| `t00.json` | `00-assessment.md` + `README.md` | `m00` | `Start Here · Module 00` | `meta` | Your Assessment & the 8-Week Plan |
| `t01.json` | `01-arrays-and-hashing.md` | `m01` | `Week 1 · Module 01` | `review` | Arrays & Hashing |
| `t02.json` | `03-stack-and-monotonic-stack.md` | `m03` | `Week 1 · Module 03` | `review` | Stack & Monotonic Stack |
| `t03.json` | `04-binary-search.md` | `m04` | `Week 1 · Module 04` | `attack` | Binary Search |
| `t04.json` | `05-linked-list.md` | `m05` | `Week 2 · Module 05` | `attack` | Linked List |
| `t05.json` | `02-two-pointers-and-sliding-window.md` | `m02` | `Week 2 · Module 02` | `moderate` | Two Pointers & Sliding Window |
| `t06.json` | `06-trees-and-bst.md` | `m06` | `Week 3 · Module 06` | `review` | Trees & BST |
| `t07.json` | `07-tries.md` | `m07` | `Week 3 · Module 07` | `moderate` | Tries |
| `t08.json` | `08-heaps-priority-queue.md` | `m08` | `Week 4 · Module 08` | `attack` | Heaps / Priority Queue |
| `t09.json` | `09-backtracking.md` | `m09` | `Week 4 · Module 09` | `moderate` | Backtracking |
| `t10.json` | `10-graphs-traversal-and-union-find.md` | `m10` | `Week 5 · Module 10` | `attack` | Graphs I: Traversal & Union-Find |
| `t11.json` | `11-graphs-weighted-dijkstra-mst.md` | `m11` | `Week 6 · Module 11` | `attack` | Graphs II: Dijkstra & MST |
| `t12.json` | `12-dynamic-programming-part1.md` | `m12` | `Week 7 · Module 12` | `moderate` | Dynamic Programming I |
| `t13.json` | `13-dynamic-programming-part2.md` | `m13` | `Week 7 · Module 13` | `attack` | Dynamic Programming II |
| `t14.json` | `14-greedy-and-intervals.md` | `m14` | `Week 8 · Module 14` | `attack` | Greedy & Intervals |
| `t15.json` | `15-timed-oa-and-aptitude.md` | `m15` | `Week 8 · Module 15` | `meta` | Timed OA & CCAT Strategy |

## JSON schema

```json
{
  "tag": "m04",
  "week": "Week 1 · Module 04",
  "title": "Binary Search",
  "priority": "attack",
  "summary": "1-3 sentence hook: what this pattern is and why it matters for HIS OAs (markdown).",
  "notes": [
    { "heading": "Section title", "body": "markdown — see Notes rules" }
  ],
  "problems": [
    {
      "name": "Koko Eating Bananas",
      "url": "https://leetcode.com/problems/koko-eating-bananas/",
      "difficulty": "Medium",
      "oa": true,
      "note": "one-line: which sub-pattern it drills / the key hint (markdown, no line breaks)"
    }
  ],
  "deepdives": [
    {
      "q": "**Split Array Largest Sum** — short restatement of the problem (markdown).",
      "url": "https://leetcode.com/problems/split-array-largest-sum/",
      "tag": "on-answer",
      "answer": "full walkthrough markdown — see Deep-dive rules"
    }
  ],
  "quiz": [
    {
      "q": "question (markdown)",
      "options": ["A", "B", "C", "D"],
      "answer": 2,
      "explanation": "why the right one is right AND why the tempting wrong one is wrong",
      "tag": "short-tag"
    }
  ],
  "figures": {
    "m04-on-answer-monotone": { "caption": "caption markdown (**bold** ok)", "svg": "<svg ...>...</svg>" }
  }
}
```

Strict requirements:
- File must be **valid JSON** (no trailing commas; escape backslashes/quotes/newlines in strings). After writing, self-check with `node -e 'JSON.parse(require("fs").readFileSync("<file>","utf8"))'`.
- `tag`, `week`, `title`, `priority` exactly as in the table above.
- Figure ids: globally unique, kebab-case, MUST start with `<tag>-` (e.g. `m04-...`), regex `[a-z0-9-]+`.

## Notes (the Learn tab) — the heart of the module

4–7 note sections. This is a **teacher**, not a dump of the md. Rewrite and EXPAND the
source module's "When to reach for this", "Core idea and template", and "Pitfalls and
interview tips" into a lesson that builds intuition step by step, as if explaining to a
smart student who has never seen the pattern. Keep every C++ template from the source
(students copy them), keep the source's calibration ("you already know X, you've never
done Y" — it is calibrated to this specific student's code).

Markdown toolbox inside `body` strings:
- Code: fenced blocks ` ```cpp ... ``` ` for templates; inline backticks for identifiers.
- Math: KaTeX `$O(n \log n)$` for complexities.
- Callouts (rendered as colored boxes) — use them liberally, 1–3 per section:
  - `> [!INTUITION] optional title` — the mental model
  - `> [!ANALOGY]` — real-world analogy
  - `> [!KEY]` — the one idea to remember
  - `> [!EXAMPLE]` — small worked trace (input → steps → output)
  - `> [!PITFALL]` / `> [!WARNING]` — classic bugs (off-by-one, overflow…)
  - `> [!EXAM]` — OA-specific tactic (label shows as "OA tip")
  - `> [!NOTE]`
  Callout content continues on following `>` lines. Blank line ends it.
- Figures: place `[[fig:m04-on-answer-monotone]]` on its own line where the picture
  belongs. Every figure you define MUST be referenced by at least one `[[fig:...]]`
  token, and every token must have a definition.
- Tables: GFM tables work.

## Figures (SVG) — make the problem visible

3–6 figures per module (t00 may have 1–2). Draw the thing that is hard to imagine:
array cells with moving window/pointers, the monotonic stack evolving, a rotated array,
linked-list pointer surgery step by step, heap array↔tree correspondence, BFS rippling
in layers, DSU forest merging, a DP table mid-fill with the recurrence arrows, intervals
on a number line, the false…false|true…true monotone boundary.

Hard rules (the theme depends on them):
- Root: `<svg viewBox="0 0 660 H" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="...">` with H between 140 and 420. No `width`/`height` attributes.
- **NO hardcoded colors.** No `fill="#..."`, no `stroke="red"`, no `<style>` blocks.
  Use ONLY these theme classes (they adapt to light/dark):
  - text: default `<text>` is themed; modifiers `t-muted t-accent t-accent2 t-ok t-bad t-bold t-sm t-lg t-mono`
  - stroke: `s-line s-muted s-accent s-accent2 s-ok s-bad` (+ `stroke-width`, `stroke-dasharray` attrs ok)
  - fill: `f-bg f-panel f-panel2 f-accent f-accent-soft f-accent2 f-ok f-ok-soft f-bad f-bad-soft f-warn-soft f-muted f-none`
  - opacity helpers: `o-60 o-35`
- Arrowheads: `marker-end="url(#dg-arrow)"` (line color), or `#dg-arrow-accent`,
  `#dg-arrow-accent2`, `#dg-arrow-ok`, `#dg-arrow-bad`. They are defined globally — do
  not define your own markers.
- Layout discipline (agents drawing blind MUST over-space):
  - Plan on a grid. Array cell = 44×44 `<rect class="f-panel s-line">` starting at
    x=20, step 46. Value text centered: `x = cellX+22, y = cellY+28, text-anchor="middle"`,
    class `t-mono`. Index labels BELOW the cell (`y = cellY+62`, `t-sm t-muted`).
  - Keep ≥ 26px vertical gap between separate text rows; never place text on top of a
    line/arrow; label arrows beside them, not across.
  - Max ~12 cells per row; max ~8 graph nodes per figure. Graph node = `<circle r="17">`
    with the label centered at `y = cy+5`.
  - Titles inside the SVG top-left: `x=20 y=24` class `t-bold`.
- Every figure needs a `caption` that states what to see in it.

Example fragment (window sliding over an array):

```
<svg viewBox="0 0 660 190" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sliding window over an array">
  <text x="20" y="24" class="t-bold">shrink while sum &gt; target</text>
  <rect x="20" y="44" width="44" height="44" class="f-panel s-line"/>
  <text x="42" y="72" text-anchor="middle" class="t-mono">2</text>
  <rect x="66" y="44" width="44" height="44" class="f-accent-soft s-accent"/>
  <text x="88" y="72" text-anchor="middle" class="t-mono t-accent">3</text>
  <text x="42" y="106" text-anchor="middle" class="t-sm t-muted">0</text>
  <text x="88" y="106" text-anchor="middle" class="t-sm t-muted">1</text>
  <line x1="88" y1="128" x2="88" y2="152" class="s-accent" stroke-width="2" marker-end="url(#dg-arrow-accent)"/>
  <text x="88" y="172" text-anchor="middle" class="t-sm t-accent">left</text>
</svg>
```

## Problems (the ladder / external judge)

- Copy EVERY problem from the source md's "Problem ladder" section, same order.
  Preserve the exact `name`, `url`, difficulty, and 🎯 flag (`"oa": true`).
- `note`: distill the md's dash-comment into one crisp hint line (markdown ok).
- If the md flags a problem as LeetCode **Premium**, keep it and start the note with
  `**Premium** —` plus the md's suggested free alternative if it gives one.
- t00: `problems: []`. t15: no ladder in the md — instead build 4–6 "mock set" entries
  linking to LeetCode contest/problem pages the md mentions, or representative timed
  drills (e.g. a virtual-contest link `https://leetcode.com/contest/` as one entry named
  "Run a LeetCode virtual contest (weekly, timed)"); difficulty `"Medium"`, `oa: true`
  for the ones matching the md's mock-OA advice.

## Deep Dives

One entry per "Deep dives" subsection of the source md (usually 3–5). 
- `q`: bold problem name + 1–2 sentence restatement of the task. NOT the solution.
- `url`: the LeetCode link if that problem is in the ladder / findable; omit otherwise.
- `answer`: a real walkthrough that TEACHES, expanded from the md: why naive fails →
  the insight (use a callout) → the algorithm → complete C++ from the md → complexity →
  what generalizes. Reference figures with `[[fig:...]]` where a picture helps (you may
  define figures used only in deep dives).

## Quiz

6–8 fresh MCQs you write yourself (the md has none). Mix of:
- pattern recognition: "You're asked X — which technique fits and why?"
- template details: loop bounds, `<` vs `<=`, what breaks if you swap two lines
- complexity: give code sketch or scenario, ask the big-O
- trace questions: "after 3 iterations, what does the stack/window/dist array hold?"
4 options each, exactly one correct, plausible distractors, `explanation` teaches.
`answer` is the 0-based index. Vary which letter is correct.

## Tone

Direct, warm, teacher-voice, second person ("you"). This student: strong at
implementation/arrays/stacks/trees, has NEVER done graphs/heaps/binary-search-on-answer.
C++ is his language. His targets: Microsoft (Codility, ~2 mediums), Flipkart (~3 hards /
90 min), Trilogy (hard DP + CCAT). Never fabricate LeetCode URLs — copy them from the md.
