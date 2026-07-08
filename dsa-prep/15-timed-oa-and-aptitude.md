# 15 - Timed OAs & Aptitude (Capstone Strategy)

This is the last module. Everything before it (01-14) built your *toolkit*. This one is about **using that toolkit fast, correctly, under a clock, with a scoreboard watching**. That is a different skill from solving a problem with unlimited time, and it is the one OAs actually test.

## The real bottleneck

Your problem is not that you *can't* do DSA. You can build things, you're a Codeforces pupil/specialist, and you have solid arrays, hashing, stacks, and trees. The bottleneck is **executing a correct solution quickly, on the first try, under time pressure** — especially in topics you haven't drilled (graphs, binary search, heaps, harder DP/backtracking). OAs don't reward "I would have gotten it with 20 more minutes." So this module reframes the goal: not *learn more*, but *convert what you know into fast, bug-free, tested submissions*. Treat speed and reliability as the deliverable, not knowledge.

## How to run a mock OA

The single highest-value habit before any OA season: **do one full timed set per week**, plus a couple of shorter timed drills. A timed set = **3 problems, 90 minutes, no pausing, no looking things up.** That last constraint is the whole point.

**Weekly routine (pick a fixed day/time so it becomes a ritual):**
- **1x full mock** — 3 problems, 90 min, hard stop. This is your "real OA."
- **2-3x short drills** — 1 medium in 25 min, or 2 easies in 25 min. Builds the "solve fast and move" reflex.
- **1x review session** — re-solve every problem you failed or barely passed, *from scratch*, until it's automatic.

**Where to get sets:**
- **LeetCode Weekly & Biweekly Contests** — the closest thing to a real OA: 4 problems, 90 min, fresh problems you haven't seen, live ranking. Do these *live* when you can.
- **LeetCode Virtual Contests** — run any past contest as a timed 90-min session on your own schedule. Infinite supply of realistic mock sets.
- **Company mock assessments** — LeetCode has company-tagged assessments and problem lists (Microsoft, Flipkart, etc.); do a tagged set as a timed block. HackerRank and Codility both have practice/sample tests that mimic their real assessment UI — use them so the *interface* is never a surprise on test day.

**Time budgeting for a 3-problem / 90-min set:**
- Spend the **first 3-5 min scanning all 3** and ranking by difficulty. Don't just start at #1.
- **Easiest first, always.** Bank a guaranteed solve. Target ~15-20 min.
- **Medium next**, ~30-35 min.
- **Hard last**, with whatever remains.
- Rough split: ~20 / 35 / 35. Adjust as you read them.

**Skip-and-return rule:** if you're **10+ minutes into a problem with no clear path**, stop, submit any partial you have, and move to the next problem. A fresh problem you can fully solve is worth more than staring at a stuck one. Come back only if time remains.

**Partial-scoring strategy (critical for Codility / HackerRank):** these platforms score against *many* test groups and **award partial credit** for passing some of them. So:
1. **Brute force first.** Write the obviously-correct O(n^2) (or worse) solution and submit it. It passes the small/correctness test groups and locks in points immediately.
2. **Then optimize.** Improve to the target complexity to grab the large/performance groups.
3. This guarantees you're never at zero on a problem, and it de-risks the clock — if you run out of time mid-optimization, you still keep the brute-force points.

On **Flipkart-style** tests where scoring is closer to all-or-nothing, invert this: a fully correct solution to fewer problems beats partials on all (see company notes).

## Debugging speed and test-first habits

Most lost points in an OA come from *bugs*, not from not knowing the algorithm. Build reflexes that catch them before the clock does.

**Sanity-test before submitting — every time:**
- Run the **provided samples** first, obviously.
- Then hand-run **your own tiny cases**: I usually type 2-3 quick ones directly.
- Add a **known-answer case you compute by hand** so you're not just trusting the sample.

**The edge-case checklist (run through it mentally on every problem):**
- **Empty input** — `n == 0`, empty string, empty array.
- **Single element** — `n == 1`; loops and two-pointer logic often break here.
- **Duplicates / all-equal** — repeated values, all-same array.
- **Overflow** — the #1 silent killer. Sums of `n` up to 1e5 ints overflow `int`. **Default to `long long`** for sums, products, prefix sums, and anything near 1e9. This alone will save you failed test groups.
- **Boundaries** — max constraints (n = 1e5, values = 1e9), negative numbers, min/max ints.
- **Sorted / reverse-sorted / already-answer** inputs.

**Fast I/O in C++ (paste this at the top of every OA solution):**
```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);
    // ... solve
    return 0;
}
```
Without `sync_with_stdio(false); cin.tie(nullptr);`, reading 1e5-1e6 lines with `cin` can TLE purely on I/O. Use `'\n'` instead of `endl` in loops (`endl` flushes every call and is slow).

**Avoiding TLE:**
- **Read the constraints first** — they tell you the target complexity. n ≤ 20 → exponential/backtracking is fine. n ≤ 2000 → O(n^2) ok. n ≤ 1e5 → you need O(n log n) or O(n). n ≤ 1e9 → O(log n) or math; think binary-search-on-answer.
- Avoid accidental O(n^2): repeated `string +=` in a loop, `.find()` inside a loop, erasing from the middle of a vector, passing big containers by value (pass by `const&`).
- Prefer `vector` + reserve over repeated reallocation; use `unordered_map` for O(1) lookups but be aware of its constant factor.

## Company-specific notes

### Microsoft (Codility)
- Delivered through **Codility** — get familiar with its editor and its **partial/test-group scoring** (brute-force-first strategy from above applies directly).
- Problem style leans **LeetCode-medium**, with a real emphasis on **graphs and DP** — exactly your two biggest gaps, so weight your prep there (modules 11-13).
- Later rounds are often live/interview-style: **verbalize your approach before coding.** State the idea, the complexity, and the edge cases out loud. Interviewers score your *reasoning*, not just a passing green checkmark. Practice narrating while you solve so it's natural.

### Flipkart (GRiD / SDE)
- Format is brutal by design: **3 hard problems in 90 minutes.** Do not expect to full-clear all three — most strong candidates don't.
- **Full-solve beats partial here.** Scoring rewards *completely correct* solutions, so pick the 1-2 problems you can actually finish and drive them to 100% rather than spraying partial attempts across all three.
- Read all three in the first 5 minutes, identify the one most in your wheelhouse (likely a greedy/implementation/DP problem given your strengths), lock it down fully, then attack the next.
- These are *hard* problems — this is where your module 12-13 (advanced DP) and 11 (graphs) work pays off. Prioritize correctness and edge cases over cleverness.

### Trilogy Innovations
Two separate things, and **both** gate you:

**1. The coding assessment** — hard, **matrix / grid / DP-heavy** style problems. Think heavy 2D DP, grid traversal, and simulation. Modules 12-13 (DP) and 11 (graphs/grids) are your prep.

**2. The CCAT (Criteria Cognitive Aptitude Test)** — a **separate 15-minute aptitude test of 50 questions** mixing **math, logic, verbal, and spatial reasoning.** This is not a coding test and being a strong coder does *not* carry over automatically.
- 50 questions in 15 minutes = **~18 seconds per question.** Almost nobody finishes; the score is raw number correct.
- **The bar is high: aim for ~45/50.** Trilogy filters aggressively on this. Do not treat it as a formality.
- **How to prep** (drill these as timed sets — you do NOT need paid sites; standard aptitude-prep material covers all of it):
  - **Fast mental math:** percentages, ratios, fractions, averages, simple/compound interest, unit conversions, number series ("what comes next"). Practice doing these *without* a calculator, fast.
  - **Logical / verbal reasoning:** syllogisms, if-then deductions, word analogies, odd-one-out, sentence logic.
  - **Spatial reasoning:** shape rotation, folding/unfolding, pattern completion, visualizing 2D/3D.
  - **The meta-skill:** speed and knowing when to skip. Do the easy ones instantly, flag hard ones, never burn 40 seconds on a single question. Take full **timed 15-min / 50-question mocks** so the pace becomes muscle memory.

## An 8-week schedule

Realistic **~1-2 hr/day**. Front-loads your gaps (graphs, binary search, heaps, advanced DP/backtracking), keeps your strengths warm, and ends in full timed simulation. Modules referenced by filename.

**Week 1 — Foundations refresh + fix the gaps in fundamentals.**
`01-arrays-and-hashing.md`, `02-two-pointers-and-sliding-window.md`. These are strengths — move fast, treat as a speed warm-up. Goal: re-establish the "solve easy in <15 min" reflex.

**Week 2 — Binary search (a core gap) + stacks.**
`03-binary-search.md` (spend real time here — you have *no* working binary search; drill both classic search and **binary-search-on-answer** predicates), `04-stacks-and-queues.md` (a strength — go quick).

**Week 3 — Linked lists + recursion/backtracking (gaps).**
`05-linked-lists.md` (you have no real linked-list practice — do reverse, cycle detection, merge), `06-recursion-and-backtracking.md` (drill subsets, permutations, N-queens, word-search — your one prior attempt didn't compile, so build these clean from scratch).

**Week 4 — Trees + tries.**
`07-trees-and-bst.md` (a genuine strength — go fast, focus on speed and edge cases), `08-tries.md`. Reinforce the win, then pivot to hard topics.

**Week 5 — Heaps + intro graphs (big gaps).**
`09-heaps-and-priority-queues.md` (learn `priority_queue` cold — you've never used one; top-K, merge-K, running median), `10-graphs-part1.md` (adjacency lists, **BFS/DFS on graphs** — your single biggest interview gap).

**Week 6 — Advanced graphs (the biggest gap).**
`11-graphs-part2.md` — **union-find/DSU, topological sort, Dijkstra/shortest paths.** Spend the most time of any week here. These show up constantly at Microsoft/Codility.

**Week 7 — Advanced DP + greedy.**
`12-dynamic-programming-part1.md`, `13-dynamic-programming-part2.md` (**knapsack, LCS, edit distance, interval DP** — beyond your current 1D/2D counting), `14-greedy-and-intervals.md` (you have essentially no greedy practice — drill interval scheduling, greedy exchange arguments).

**Week 8 — Full timed-OA simulation.**
No new topics. Run the **"How to run a mock OA" routine at full intensity**: 3-4 full 90-min mocks (LeetCode virtual/weekly contests + company-tagged sets), review every failure from scratch, and — if targeting Trilogy — add daily **15-min / 50-question CCAT aptitude mocks**. This week is where speed and reliability get forged.

*Tight on time? Compress weeks 1-2 and 4 (your strengths) and reinvest that time into weeks 5-7 (graphs, heaps, advanced DP) — that's where your points are being left on the table.*

## Mindset

- You're a **strong builder** already — a Codeforces pupil/specialist with real command of arrays, stacks, and trees. You are not starting from zero; you're closing specific, nameable gaps.
- **OA speed is a trainable muscle, not a talent.** Every timed set you run makes the next one faster. The nervousness and the fumbling both fade with reps — guaranteed.
- **Consistency beats intensity.** One focused timed set a week for eight weeks will transform you far more than one heroic 10-hour cram. Show up daily, even for 45 minutes.
- The gaps you have (graphs, binary search, heaps, DP) are **the most learnable topics in DSA** because they're pattern-based. Drill the pattern once and it's yours for every future problem. You've got this.
