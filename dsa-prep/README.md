# DSA Prep — a focused plan for Bibek

A curriculum built **around your actual gaps** (calibrated from your own Java + C++ code) and tuned to the exact online assessments you're facing: **Microsoft, Flipkart GRiD/SDE, and Trilogy.** Not a generic problem dump — every module is a pattern you either need to sharpen or have never drilled, with a LeetCode ladder and worked teaching for the clever problems.

> **The whole game in one sentence:** You already know the data structures. What you lack is *fast, correct execution of interview patterns under a clock* — a trainable muscle, not a knowledge gap. This plan builds that muscle.

## Start here

1. **Read [`00-assessment.md`](./00-assessment.md)** — the honest read of where you stand (what's solid, what's absent). It's the reason the order below is what it is.
2. **Make a LeetCode account** (you don't have a public grind yet). Free tier is enough; a few problems here are Premium and are flagged with alternatives. [neetcode.io](https://neetcode.io) is a great free companion with video explanations for most problems here.
3. **Your OA language is C++** — all templates are in C++ because your ~300 contest files prove it's your fast language. Keep your competitive template (fast I/O, macros) handy.
4. Work a module top-to-bottom: **read the pattern → memorize the template → do the ladder in order (check the boxes) → study the deep-dives → then time yourself.**

## Your targets (what each assessment actually demands)

| Company | Format | What it rewards |
|---|---|---|
| **Microsoft** | Codility OA: ~2 LeetCode-**medium**, graphs/DP-heavy → interviews with project deep-dives | Clean medium DSA + verbalizing your approach; **no** system design for interns |
| **Flipkart** (GRiD/SDE) | ~3 **hard** problems in 90 min | **Full-solve execution** — solving all/most completely beats partial dabbling; greedy, graphs/DFS, sliding window, heaps, DP |
| **Trilogy** | Hard matrix/DP-style DSA **+** a separate 15-min CCAT aptitude test (45/50 bar) | Speed. See [`15-timed-oa-and-aptitude.md`](./15-timed-oa-and-aptitude.md) for the CCAT. |

Notice the overlap: **graphs, DP, heaps, greedy, sliding window, binary search.** That's exactly what this plan front-loads.

## The modules

| # | Module | Priority for you |
|---|--------|------------------|
| 01 | [Arrays & Hashing](./01-arrays-and-hashing.md) | 🟢 review |
| 02 | [Two Pointers & Sliding Window](./02-two-pointers-and-sliding-window.md) | 🟡 fill the variable-window gap |
| 03 | [Stack & Monotonic Stack](./03-stack-and-monotonic-stack.md) | 🟢 review |
| 04 | [Binary Search](./04-binary-search.md) | 🔴 **attack** (esp. search-on-answer) |
| 05 | [Linked List](./05-linked-list.md) | 🔴 **attack** |
| 06 | [Trees & BST](./06-trees-and-bst.md) | 🟢 review, push harder |
| 07 | [Tries](./07-tries.md) | 🟡 moderate |
| 08 | [Heaps / Priority Queue](./08-heaps-priority-queue.md) | 🔴 **attack** |
| 09 | [Backtracking](./09-backtracking.md) | 🟡 moderate→attack |
| 10 | [Graphs I: Traversal & Union-Find](./10-graphs-traversal-and-union-find.md) | 🔴 **biggest gap — attack hardest** |
| 11 | [Graphs II: Dijkstra / MST](./11-graphs-weighted-dijkstra-mst.md) | 🔴 **attack** |
| 12 | [Dynamic Programming I (1-D & Knapsack)](./12-dynamic-programming-part1.md) | 🟡 moderate |
| 13 | [Dynamic Programming II (Grids, Strings, Intervals)](./13-dynamic-programming-part2.md) | 🔴 **attack** |
| 14 | [Greedy & Intervals](./14-greedy-and-intervals.md) | 🔴 **attack** |
| 15 | [Timed OA & CCAT Strategy](./15-timed-oa-and-aptitude.md) | ⭐ the meta-skill |

## The 8-week plan

~1.5–2 hrs/day, 5–6 days/week. Front-loaded to fix cheap gaps first (binary search), then build the muscles you've never trained (linked lists, heaps, **graphs**, advanced DP), ending on timed simulation. Do every 🎯 problem in a module; add the rest as time allows.

| Week | Focus | Modules |
|---|---|---|
| **1** | Warm up strengths + fix binary search | 01 (fast review), 03 (fast review), **04 (deep — search-on-answer)** |
| **2** | Pointer patterns | **05 Linked List** (new muscle), 02 Two Pointers & Sliding Window (variable windows) |
| **3** | Trees & prefix structures | 06 Trees & BST (review + harder), 07 Tries (finish the XOR-trie you stubbed) |
| **4** | The two you've never used | **08 Heaps/PQ** (learn `priority_queue` cold), **09 Backtracking** (subsets/perms/combo-sum) |
| **5** | **Graphs, part 1 — your #1 ROI week** | **10 Graphs I** — grid DFS/BFS, multi-source BFS, topological sort, Union-Find |
| **6** | Graphs, part 2 + start DP | **11 Graphs II** (Dijkstra, Bellman-Ford, MST), begin 12 DP I |
| **7** | Dynamic programming | 12 DP I (knapsack, coin change, LIS), **13 DP II** (grid, LCS/edit distance, interval, maximal-square) |
| **8** | Greedy + simulate the real thing | 14 Greedy & Intervals, then **timed OA sims** per module 15 (3 problems / 90 min, LeetCode virtual contests) |

**After week 8:** one LeetCode virtual/weekly contest per week + re-solve anything you failed, 2 days later from scratch. Keep the graph and DP templates in your fingers — those are what the OAs test.

## Rules of engagement (how to actually improve, not just grind)

- **Struggle first.** Give a problem an honest 20–30 min before looking at anything. The struggle is where the learning happens.
- **Then study the editorial properly** — don't just copy. Understand *why* the trick works (the deep-dive sections do this for the hard ones).
- **Re-solve from a blank file 2 days later.** If you can't reproduce it, you didn't learn it — you recognized it. Spaced repetition is the whole trick to retention.
- **Time the mediums.** A LeetCode-medium you can't solve in ~20–25 min isn't OA-ready yet. Speed comes from reps, not talent.
- **Talk out loud** even when solving alone — name the pattern, justify the approach, state complexity. That's exactly the interview muscle (and it's in every module's "interview tips").
- **Track your gaps.** When you miss a problem, note *which pattern* you missed — that tells you which module to revisit.

You're a strong builder with real systems depth; this is the one dimension where reps are the whole answer. Consistency beats intensity — an hour a day for eight weeks will move you further than any weekend cram. Start with module 04 today.
