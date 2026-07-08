# Greedy and Intervals

> **Why this matters for you, Bibek:** Flipkart GRiD/SDE OAs *explicitly* lean on greedy. It's also your fastest-to-strengthen topic — you already have CP intuition for greedy and sorting, so this is about locking in the *interval* patterns and, critically, learning to **prove** (or disprove) a greedy so you don't confidently ship a wrong one under time pressure. Problems marked 🎯 are OA-critical.

---

## When to reach for this

Reach for **greedy** when you see these tells in a problem statement:

- You must **maximize / minimize** something, and a **locally optimal choice** (take the earliest-finishing, the largest, the cheapest-now) plausibly builds the global optimum.
- The input is (or can be) **sorted** and processed in one pass — "schedule", "select the most", "minimum number of X to cover Y".
- **Intervals / ranges** appear: `[start, end]` pairs, meetings, merges, overlaps, coverage.
- You can make an **irreversible** decision at each step and never need to look back (no "undo").
- **Warning sign it's actually DP, not greedy:** the best choice *now* depends on choices you haven't made yet, or there are multiple resource dimensions (weight *and* value → 0/1 knapsack). If a greedy counterexample springs to mind, switch to DP.

---

## Core idea and template

**The exchange argument (why a greedy is correct).** Prove greedy = optimal by showing: take any optimal solution, and if it differs from the greedy choice, you can **swap** the greedy choice in without making the solution worse. Repeat → greedy is at least as good as optimal. In an interview you don't write a full proof — you *state the swap in one sentence* ("if the optimal didn't pick the earliest-finishing interval, I can replace its first pick with mine and free up at least as much room"). That sentence is what separates a guess from a defensible answer.

### Template 1 — Sort-then-scan on intervals (merge / overlap)

```cpp
// Merge overlapping intervals. Canonical interval greedy.
vector<vector<int>> merge(vector<vector<int>>& iv) {
    sort(iv.begin(), iv.end());          // sort by START
    vector<vector<int>> res;
    for (auto& x : iv) {
        // If res empty OR current start is beyond last end -> no overlap, push new.
        if (res.empty() || x[0] > res.back()[1]) {
            res.push_back(x);
        } else {
            // Overlap: extend the last interval's end to the max.
            res.back()[1] = max(res.back()[1], x[1]);
        }
    }
    return res;
}
```

### Template 2 — Interval scheduling: max non-overlapping (sort by END)

```cpp
// Pick the MOST non-overlapping intervals. Key: sort by END, not start.
int maxNonOverlap(vector<vector<int>>& iv) {
    sort(iv.begin(), iv.end(),
         [](auto& a, auto& b){ return a[1] < b[1]; }); // earliest finish first
    int count = 0, lastEnd = INT_MIN;
    for (auto& x : iv) {
        if (x[0] >= lastEnd) {   // starts after (or when) last chosen ends
            count++;
            lastEnd = x[1];      // commit to this interval
        }
    }
    return count;               // removals = total - count
}
```

### Template 3 — Reachability greedy (jump game family)

```cpp
// Can you reach the last index? Track the FARTHEST reachable so far.
bool canJump(vector<int>& nums) {
    int farthest = 0;
    for (int i = 0; i < nums.size(); i++) {
        if (i > farthest) return false;          // stuck: can't even reach i
        farthest = max(farthest, i + nums[i]);   // greedily extend reach
    }
    return true;
}
```

**Mental checklist for any greedy:** (1) What's the sort key? (2) What single value do I carry across the scan (last end / farthest / current sum)? (3) State the one-sentence exchange argument.

---

## Problem ladder

Work top-to-bottom. Do the 🎯 ones first if you're short on time.

- [ ] [Best Time to Buy and Sell Stock](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/) — Easy — track running min, greedily update best profit in one pass.
- [ ] [Assign Cookies](https://leetcode.com/problems/assign-cookies/) — Easy — sort both, two-pointer greedy matching (classic exchange argument).
- [ ] [Lemonade Change](https://leetcode.com/problems/lemonade-change/) — Easy — always give back the largest bills first.
- [ ] 🎯 [Jump Game](https://leetcode.com/problems/jump-game/) — Medium — track farthest reachable index.
- [ ] 🎯 [Jump Game II](https://leetcode.com/problems/jump-game-ii/) — Medium — BFS-like level greedy for minimum jumps.
- [ ] 🎯 [Merge Intervals](https://leetcode.com/problems/merge-intervals/) — Medium — sort by start, coalesce overlaps.
- [ ] 🎯 [Insert Interval](https://leetcode.com/problems/insert-interval/) — Medium — three-phase scan: before, merge, after.
- [ ] 🎯 [Non-overlapping Intervals](https://leetcode.com/problems/non-overlapping-intervals/) — Medium — sort by end, count keepers (interval scheduling).
- [ ] 🎯 [Minimum Number of Arrows to Burst Balloons](https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/) — Medium — sort by end, shoot at each earliest end.
- [ ] 🎯 [Meeting Rooms II](https://leetcode.com/problems/meeting-rooms-ii/) — Medium — max concurrent intervals (heap of ends, or +1/-1 sweep line). (LeetCode-locked; also on LintCode 919 / NeetCode.)
- [ ] [Partition Labels](https://leetcode.com/problems/partition-labels/) — Medium — greedy on last-occurrence index; extend window.
- [ ] [Gas Station](https://leetcode.com/problems/gas-station/) — Medium — single-pass greedy on running tank + total feasibility.
- [ ] [Task Scheduler](https://leetcode.com/problems/task-scheduler/) — Medium — greedy on most-frequent task; idle-slot formula.
- [ ] [Candy](https://leetcode.com/problems/candy/) — Hard — two greedy passes (left-to-right, then right-to-left).

---

## Deep dives: the ingenious ones

### 1. Interval scheduling — why you sort by END, not start (Non-overlapping Intervals / Arrows)

**The problem:** given intervals, keep the maximum number that don't overlap (or remove the fewest, or shoot the fewest arrows — same problem in disguise).

**Why the naive idea fails.** The tempting greedy is "sort by start, keep picking." Counterexample: `[0,10], [1,2], [3,4]`. Sorting by start picks `[0,10]` first — it hogs the whole line and blocks the two small intervals. You keep 1 when you could keep 2.

Another tempting fix: "sort by shortest length." Counterexample: `[0,3], [2,5], [4,7]`. The short middle-ish one `[2,5]` isn't short here, but consider `[1,3],[2,4],[3,5]` variants — length-based picks conflict with two neighbors. Length is not the invariant that matters.

**The trick: sort by END time and always take the interval that finishes earliest among those still compatible.** Intuition: finishing earliest **leaves the most room** for everything after it. That's the exchange argument made physical.

```cpp
sort(iv.begin(), iv.end(), [](auto&a, auto&b){ return a[1] < b[1]; });
int kept = 0, lastEnd = INT_MIN;
for (auto& x : iv) {
    if (x[0] >= lastEnd) { kept++; lastEnd = x[1]; } // compatible -> take it
}
// Non-overlapping Intervals answer = n - kept  (min removals)
```

**Exchange-argument proof (say this out loud):** Let the greedy's first pick be interval *g* (earliest end). Take any optimal solution; its first pick *o* ends no earlier than *g* (since *g* has the globally earliest end). Swap *o* for *g*: still valid (g ends earlier, so it can't conflict with anything o didn't already conflict with), and the count is unchanged. Induct on the rest → greedy is optimal.

**Arrows are the identical problem.** "Burst all balloons with fewest arrows" = "how few points hit all intervals" = complement of packing. Sort by end; shoot an arrow at each interval's end; skip every balloon that end already covers. (Watch the overlap condition: for arrows, touching endpoints *do* count as overlapping, so use `>` not `>=`.)

- **Time:** O(n log n) sort + O(n) scan. **Space:** O(1) extra (or O(log n) for sort).

---

### 2. Meeting Rooms II — the sweep line / min-heap of end times 🎯

**The problem:** given meeting intervals, what's the **minimum number of rooms** needed? (= maximum number of meetings overlapping at any instant.)

**Why naive fails.** You can't just sort and count overlaps against one `lastEnd` — multiple meetings can be simultaneously live, and a room frees up only when *its* meeting ends. You need to know, at each new start, whether *any* room has freed.

**Trick A — min-heap of end times.** Sort meetings by start. Keep a min-heap of the end times of currently-occupied rooms. For each new meeting: if the earliest-ending room (heap top) is free by this meeting's start, pop it (reuse that room); then push this meeting's end. Heap size at the end's max = rooms needed.

```cpp
int minMeetingRooms(vector<vector<int>>& m) {
    sort(m.begin(), m.end());                 // by start
    priority_queue<int, vector<int>, greater<int>> pq; // min-heap of end times
    for (auto& x : m) {
        if (!pq.empty() && pq.top() <= x[0]) pq.pop(); // a room freed up
        pq.push(x[1]);
    }
    return pq.size();
}
```

Note this heap approach *tracks the current room count directly*; the size never exceeds the true max because you only add a room when none is free. **This is also your heaps practice — PriorityQueue/priority_queue is a gap for you, and this is the cleanest place to internalize it.**

**Trick B — sweep line / difference array (often faster and slicker).** Forget pairing meetings to rooms. Split every interval into two events: `+1` at start, `-1` at end. Sort all events by time; sweep left to right maintaining a running counter; the **peak** of that counter is the answer. This is the same idea as a prefix-sum on events — right in your wheelhouse.

```cpp
int minMeetingRooms(vector<vector<int>>& m) {
    vector<int> starts, ends;
    for (auto& x : m){ starts.push_back(x[0]); ends.push_back(x[1]); }
    sort(starts.begin(), starts.end());
    sort(ends.begin(), ends.end());
    int rooms = 0, best = 0, j = 0;
    for (int i = 0; i < starts.size(); i++) {
        while (j < ends.size() && ends[j] <= starts[i]) { rooms--; j++; }
        rooms++;
        best = max(best, rooms);
    }
    return best;
}
```

- **Time:** O(n log n). **Space:** O(n) for heap/events.

---

### 3. Jump Game II — minimum jumps as implicit BFS 🎯

**The problem:** minimum number of jumps to reach the last index, where `nums[i]` is the max jump length from `i`.

**Why naive fails.** DP `dp[i] = min jumps to reach i` is O(n²) and can TLE on big OA inputs. There's a greedy that's O(n).

**The insight: treat it as BFS in levels without a queue.** Everything reachable in 1 jump is "level 1", everything reachable in 2 jumps is "level 2", etc. You process the current level's window `[start..end]`, and while doing so you compute `farthest` = the boundary of the *next* level. When your scan index hits the current level's `end`, you've exhausted this level — increment jumps and extend the boundary to `farthest`.

```cpp
int jump(vector<int>& nums) {
    int jumps = 0, curEnd = 0, farthest = 0;
    for (int i = 0; i + 1 < nums.size(); i++) {  // no need to jump FROM the last index
        farthest = max(farthest, i + nums[i]);   // best reach discovered this level
        if (i == curEnd) {                       // exhausted current jump's range
            jumps++;
            curEnd = farthest;                   // next level's right boundary
        }
    }
    return jumps;
}
```

The one-line `i + 1 < nums.size()` guard is the subtle correctness point: you must not count a jump *from* the last cell, or you'd over-count by one.

- **Time:** O(n). **Space:** O(1).

---

### 4. Gas Station — the "if total works, one start works" lemma

**The problem:** circular route, `gas[i]` and `cost[i]` at each station. Find the unique start index from which you can complete the loop, or -1.

**Why naive fails.** Trying every start and simulating is O(n²). The greedy is O(n) but rests on two non-obvious lemmas.

**Lemma 1:** if total gas < total cost, it's impossible → return -1.
**Lemma 2:** if it's possible at all, then whenever the running tank goes negative at station `i`, **no station in `start..i` can be a valid start** — so the answer must be `i+1`. Reset the tank and keep going.

Why lemma 2 holds: if you started at `start` and ran dry reaching `i`, then any station between `start` and `i` had even *less* accumulated surplus when you passed it (you arrived there with ≥0 tank and it still couldn't carry you past `i`). So none of them survives either. Jump the candidate start past the failure point.

```cpp
int canCompleteCircuit(vector<int>& gas, vector<int>& cost) {
    int total = 0, tank = 0, start = 0;
    for (int i = 0; i < gas.size(); i++) {
        int diff = gas[i] - cost[i];
        total += diff;
        tank  += diff;
        if (tank < 0) { start = i + 1; tank = 0; } // can't start in [old start..i]
    }
    return total >= 0 ? start : -1;
}
```

- **Time:** O(n). **Space:** O(1). The elegance: one pass computes both feasibility (`total`) and the answer (`start`).

---

## Pitfalls and interview tips

**Common bugs**
- **Wrong sort key.** Merge → sort by **start**. Max non-overlapping / arrows → sort by **end**. Mixing these up is the #1 error. Say the key out loud before coding.
- **`>` vs `>=` on the boundary.** Does touching count as overlap? `[1,2]` and `[2,3]`: for *merging* they usually don't overlap (`start > lastEnd` stays separate — but many LeetCode variants treat equal endpoints as overlapping; re-read the problem). For *arrows*, touching **does** count. Get this from the examples, don't assume.
- **`INT_MIN` / `INT_MAX` init.** Initialize `lastEnd = INT_MIN` (or `LLONG_MIN` if coordinates are large) so the first interval is always taken.
- **Off-by-one in Jump Game II** — don't jump from the last index.
- **Overflow in reach:** `i + nums[i]` and gas sums can exceed int on adversarial inputs; use `long long` if constraints are large (CP habit — keep it).
- **Empty input** — return the sane base case (`0` rooms, empty merge list) instead of touching `res.back()`.

**How to spot greedy-fails-use-DP.** Ask: "does the best choice now depend on future choices, or is there a second constraint dimension?" Classic trap: 0/1 knapsack looks greedy (take highest value/weight ratio) but that greedy is *wrong* — you need DP. Coin change with arbitrary denominations: greedy (largest coin first) fails for coins like `{1,3,4}` making 6. If you can construct even one small counterexample in 30 seconds, abandon greedy.

**Interview narration (do this every time)**
1. Restate: "This is interval scheduling / a reachability greedy."
2. State the sort key and the carried value: "I'll sort by end time and track the last chosen end."
3. **Give the one-sentence exchange argument** — this is what makes interviewers trust the greedy. "Picking the earliest-finishing interval leaves maximal room for the rest, so it's never worse than any other first pick."
4. Then code. Mention the O(n log n) sort cost upfront.
5. If unsure greedy is correct, *say so*: "Let me sanity-check with a counterexample" — trying `[0,10],[1,2],[3,4]` mentally in front of the interviewer is a strong signal, not a weak one.
