# Module 08 — Heaps & Priority Queue

A heap is just an array that pretends to be a balanced tree so you can grab the smallest (or largest) element in O(log n). In C++ that array is `std::priority_queue`. Master four patterns and you cover ~90% of interview heap questions: **top-K**, **K-way merge**, **two-heaps running median**, and **greedy scheduling with a heap**.

---

## When to reach for this

- The problem asks for the **"K-th largest / smallest"**, the **"top K"**, or **"K most frequent"** anything — and you don't need the items fully sorted.
- You must repeatedly **pull the current min or max** while **new elements keep arriving** (streaming, scheduling, simulation). Re-sorting each step is the naive trap.
- You're **merging several already-sorted lists/arrays** and want the next-smallest across all of them.
- You need a **running median / running order statistic** over a growing stream.
- A **greedy** solution keeps asking "what's the largest/most-urgent thing available *right now*?" — the heap is how you answer that in O(log n) instead of O(n).

---

## Core idea and template

A priority queue gives you: `push` O(log n), `pop` the extreme element O(log n), `top` (peek) O(1). It does **not** let you search or index. If you catch yourself wanting to look at the middle, a heap is the wrong tool.

The single most important C++ fact: **`priority_queue` is a MAX-heap by default.** For a min-heap you must spell it out.

```cpp
#include <queue>
#include <vector>
using namespace std;

// MAX-heap (default): top() is the LARGEST element
priority_queue<int> maxHeap;

// MIN-heap: top() is the SMALLEST element. Memorize this incantation.
priority_queue<int, vector<int>, greater<int>> minHeap;

// Heap of pairs — orders by .first, then .second (lexicographic).
// Min-heap of (cost, node) is the workhorse for Dijkstra / K-way merge.
priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> pq;

// Custom comparator via lambda (e.g. order points by distance to origin).
// NOTE: the comparator returns true when a should come BELOW b (weaker priority),
// which is the REVERSE of the intuition — same rule as sort's comparator inverted.
auto cmp = [](const vector<int>& a, const vector<int>& b) {
    return a[0]*a[0]+a[1]*a[1] > b[0]*b[0]+b[1]*b[1]; // '>' => min-heap by distance
};
priority_queue<vector<int>, vector<vector<int>>, decltype(cmp)> distHeap(cmp);
```

### Template 1 — Top-K largest with a size-K MIN-heap

Counter-intuitive but essential: to find the K **largest** elements, keep a **min-heap of size K**. The smallest of your current top-K sits at `top()`; if a new element beats it, evict the top. This is O(n log K), far better than sorting everything when K is small.

```cpp
// Returns the K largest elements (unordered).
vector<int> topKLargest(vector<int>& nums, int k) {
    priority_queue<int, vector<int>, greater<int>> minHeap; // min-heap, cap = k
    for (int x : nums) {
        minHeap.push(x);
        if ((int)minHeap.size() > k) minHeap.pop(); // drop the current smallest
    }
    vector<int> res;
    while (!minHeap.empty()) { res.push_back(minHeap.top()); minHeap.pop(); }
    return res; // the k survivors are the k largest
}
```

### Template 2 — K-way merge (min-heap of "next pointers")

Push one entry per source list. Each entry carries enough info to fetch its successor. Pop the global min, emit it, push its successor.

```cpp
// Merge k sorted vectors. Heap holds (value, whichList, indexInThatList).
vector<int> mergeK(vector<vector<int>>& lists) {
    priority_queue<array<int,3>, vector<array<int,3>>, greater<array<int,3>>> pq;
    for (int i = 0; i < (int)lists.size(); ++i)
        if (!lists[i].empty()) pq.push({lists[i][0], i, 0});
    vector<int> res;
    while (!pq.empty()) {
        auto [val, li, idx] = pq.top(); pq.pop();
        res.push_back(val);
        if (idx + 1 < (int)lists[li].size())
            pq.push({lists[li][idx+1], li, idx+1}); // push successor from same list
    }
    return res;
}
```

### Template 3 — Two heaps for a running median

Keep a **max-heap `lo`** for the smaller half and a **min-heap `hi`** for the larger half. Enforce that every element in `lo` ≤ every element in `hi`, and that sizes differ by at most 1. Median is then either `lo.top()` or the average of the two tops.

```cpp
priority_queue<int> lo;                                     // max-heap: smaller half
priority_queue<int, vector<int>, greater<int>> hi;         // min-heap: larger half

void addNum(int num) {
    lo.push(num);                 // 1) tentatively add to lower half
    hi.push(lo.top()); lo.pop();  // 2) move its max up to keep lo <= hi ordered
    if (hi.size() > lo.size()) {  // 3) rebalance so lo has >= as many as hi
        lo.push(hi.top()); hi.pop();
    }
}
double findMedian() {
    return lo.size() > hi.size() ? lo.top() : (lo.top() + hi.top()) / 2.0;
}
```

---

## Problem ladder

Work top to bottom. 🎯 = OA-critical (Flipkart-style; heaps show up explicitly).

- [ ] [Kth Largest Element in a Stream](https://leetcode.com/problems/kth-largest-element-in-a-stream/) — Easy — size-K min-heap as a running structure; the "why min-heap for largest" intuition.
- [ ] [Last Stone Weight](https://leetcode.com/problems/last-stone-weight/) — Easy — max-heap simulation; pop two, push the difference.
- [ ] 🎯 [Kth Largest Element in an Array](https://leetcode.com/problems/kth-largest-element-in-an-array/) — Medium — canonical top-K; heap in O(n log k), then compare vs quickselect.
- [ ] 🎯 [Top K Frequent Elements](https://leetcode.com/problems/top-k-frequent-elements/) — Medium — hash-map count then heap by frequency; also drills bucket-sort alternative.
- [ ] [K Closest Points to Origin](https://leetcode.com/problems/k-closest-points-to-origin/) — Medium — top-K with a custom distance comparator; size-K max-heap.
- [ ] [Sort Characters By Frequency](https://leetcode.com/problems/sort-characters-by-frequency/) — Medium — count then heap-order by frequency; rebuild string.
- [ ] 🎯 [Task Scheduler](https://leetcode.com/problems/task-scheduler/) — Medium — greedy-with-heap scheduling; always run the most-frequent available task.
- [ ] 🎯 [Reorganize String](https://leetcode.com/problems/reorganize-string/) — Medium — greedy heap: repeatedly place the most-frequent char that isn't the previous one.
- [ ] 🎯 [Meeting Rooms II](https://leetcode.com/problems/meeting-rooms-ii/) — Medium — min-heap of end times; the "how many rooms at once" interval pattern.
- [ ] [Kth Smallest Element in a Sorted Matrix](https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/) — Medium — K-way merge over rows; heap of (value, r, c).
- [ ] 🎯 [Merge k Sorted Lists](https://leetcode.com/problems/merge-k-sorted-lists/) — Hard — the canonical K-way merge; heap of list-head nodes.
- [ ] 🎯 [Find Median from Data Stream](https://leetcode.com/problems/find-median-from-data-stream/) — Hard — the two-heaps running-median pattern in full.
- [ ] [Find K Pairs with Smallest Sums](https://leetcode.com/problems/find-k-pairs-with-smallest-sums/) — Medium — K-way merge dressed as pair-sums; push neighbors lazily.
- [ ] [IPO](https://leetcode.com/problems/ipo/) — Hard — two-heap greedy: unlock projects by capital, then grab the max profit available.

---

## Deep dives: the ingenious ones

### 1. Find Median from Data Stream — why two heaps beat everything else

**The problem:** numbers arrive one at a time; after each you must be able to report the current median in O(1)-ish time.

**Why the naive approaches fail.** Keeping a sorted array means every insert is O(n) (you shift elements to make room). A balanced BST works but is a lot of code and easy to get wrong under time pressure. Neither exploits the fact that **you never need the full order — only the middle.**

**The insight.** The median only cares about the boundary between the smaller half and the larger half. So maintain exactly that boundary with two heaps:
- `lo` = a **max-heap** holding the smaller half. Its top is the *largest of the small numbers* — i.e. the left side of the median.
- `hi` = a **min-heap** holding the larger half. Its top is the *smallest of the large numbers* — the right side.

If you keep them balanced (`lo` has the same count as `hi`, or exactly one more), the median is `lo.top()` when the total is odd, or the average of the two tops when even.

**The trick that makes insertion correct (step by step).** The subtle bug is: how do you insert a new number into the *right* half without comparing against boundaries yourself? Use a launder-through-both-heaps move:

```cpp
lo.push(num);                 // 1) blindly add to the smaller half
hi.push(lo.top()); lo.pop();  // 2) shove lo's current max into hi
                              //    -> guarantees every lo element <= every hi element
if (hi.size() > lo.size()) {  // 3) if hi got too big, hand its min back to lo
    lo.push(hi.top()); hi.pop();
}
```

Step 2 is the elegant part: instead of deciding which half `num` belongs to, you let it enter `lo`, then push `lo`'s maximum across to `hi`. That maximum is exactly the element that should sit on the boundary, so the ordering invariant (`max(lo) <= min(hi)`) repairs itself automatically. Step 3 only fixes sizes, never ordering.

**Complexity:** each `addNum` is O(log n); `findMedian` is O(1). Space O(n). This is the intended solution and interviewers expect it by name ("two heaps").

**Follow-up they love to ask:** if all numbers are in [0, 100], you can replace the heaps with a count array of 101 buckets and answer in O(100) — mention it, it shows range awareness.

### 2. Task Scheduler — greedy by "most frequent first"

**The problem:** given tasks (letters) and a cooldown `n`, the same task must be `n` slots apart. Minimize total time (including forced idles).

**Why greedy-by-most-frequent is right.** The task with the highest count is the bottleneck — it forces the most idle gaps. So on every cycle you should schedule the most-frequent *still-remaining* tasks first, spacing them out. A **max-heap keyed on remaining count** always gives you the current most-frequent task in O(log 26).

**The trick step by step.** Process in rounds of length `n+1` (one full cooldown window). In each round, pop up to `n+1` distinct tasks from the heap, decrement each, and stash the ones that still have count > 0. After the round, push the survivors back.

```cpp
int leastInterval(vector<char>& tasks, int n) {
    int cnt[26] = {0};
    for (char c : tasks) cnt[c - 'A']++;
    priority_queue<int> pq;                 // max-heap of remaining counts
    for (int c : cnt) if (c) pq.push(c);

    int time = 0;
    while (!pq.empty()) {
        vector<int> temp;                   // tasks scheduled this window
        for (int i = 0; i < n + 1; ++i) {   // one cooldown window = n+1 slots
            if (!pq.empty()) { temp.push_back(pq.top() - 1); pq.pop(); }
        }
        for (int r : temp) if (r > 0) pq.push(r); // re-arm tasks that remain
        // if heap emptied out, the last partial window has no trailing idle
        time += pq.empty() ? (int)temp.size() : n + 1;
    }
    return time;
}
```

**The one gotcha:** in the *final* window you don't pad with idles — if the heap is empty you only add the number of real tasks you actually placed (`temp.size()`), not the full `n+1`. Getting that boundary right is the whole problem.

**Complexity:** O(total tasks) heap operations, each O(log 26) = O(1) effectively, so O(T). There's also a slick O(1) closed-form formula, but the heap version is what generalizes and what to lead with.

### 3. Merge k Sorted Lists — the K-way merge skeleton

**Why not just concatenate and sort?** That's O(N log N) over all N nodes and throws away the fact that each list is already sorted. The heap version is O(N log k) — a real win when k is small relative to N, and it streams (you can stop early after emitting M elements).

**The insight.** At any moment, the global next-smallest element is the minimum among the **current heads** of the k lists — only k candidates, not N. A size-k min-heap tracks exactly those heads. Pop the min, append it, and push that node's `next` to refill the slot.

```cpp
struct Cmp { bool operator()(ListNode* a, ListNode* b){ return a->val > b->val; } };

ListNode* mergeKLists(vector<ListNode*>& lists) {
    priority_queue<ListNode*, vector<ListNode*>, Cmp> pq;
    for (auto l : lists) if (l) pq.push(l);   // seed with every non-empty head
    ListNode dummy, *tail = &dummy;
    while (!pq.empty()) {
        ListNode* node = pq.top(); pq.pop();
        tail->next = node; tail = node;       // splice smallest onto the result
        if (node->next) pq.push(node->next);  // refill from the SAME list
    }
    return dummy.next;
}
```

**Why the heap never exceeds size k:** you seed k nodes and every pop is followed by at most one push. The invariant "heap holds at most one live head per list" is what caps it. **Complexity:** O(N log k) time, O(k) space. The same skeleton solves *Kth Smallest in a Sorted Matrix* (seed the first column, push right/down neighbors) and *Find K Pairs with Smallest Sums*.

### 4. IPO — two heaps for "unlock, then grab the best"

**The setup:** you can do at most `k` projects; each needs some capital and yields a profit that adds to your capital. Maximize final capital.

**Why sorting alone fails.** You want the most profitable project, but affordability changes as capital grows — a project too expensive now becomes reachable after a few wins. You need two different orderings at once.

**The trick:** a **min-heap by capital** (the "locked" projects, cheapest-to-unlock on top) feeds a **max-heap by profit** (the "available" projects). Each of the k rounds: move every project whose capital ≤ current capital from the capital-heap into the profit-heap, then pop the single most profitable available project and bank it.

```cpp
int findMaximizedCapital(int k, int W, vector<int>& profits, vector<int>& capital) {
    int n = profits.size();
    vector<pair<int,int>> proj(n);           // (capital, profit)
    for (int i = 0; i < n; ++i) proj[i] = {capital[i], profits[i]};
    sort(proj.begin(), proj.end());          // ascending by capital => easy unlocking
    priority_queue<int> avail;               // max-heap of unlocked profits
    int i = 0;
    while (k--) {
        while (i < n && proj[i].first <= W) avail.push(proj[i++].second);
        if (avail.empty()) break;            // nothing affordable => stop
        W += avail.top(); avail.pop();       // take the richest reachable project
    }
    return W;
}
```

The engine is the greedy exchange: because completing a project never reduces capital, once something is affordable it stays affordable, so it's always safe to grab the max-profit unlocked project. **Complexity:** O(n log n). This "unlock into a max-heap, greedily extract" shape recurs in many scheduling/resource problems.

---

## Pitfalls and interview tips

- **Default is a MAX-heap.** The single most common bug in C++. If you want the smallest on top, you must write `priority_queue<int, vector<int>, greater<int>>`. Say it out loud when you declare it.
- **Comparator direction is inverted vs `sort`.** For a heap, the comparator returning `true` means "a has *lower* priority than b" (a sinks). For a *min*-heap by key you use `greater` / `>`. When in doubt, write it, test on a 3-element example, and check `top()`.
- **Top-K uses the *opposite* heap.** K largest → size-K **min**-heap (evict the smallest). K smallest → size-K **max**-heap. Getting this backwards silently returns wrong answers on large inputs. Verbalize: "I keep a min-heap of size k so the weakest survivor is on top and cheap to kick out."
- **Guard `top()`/`pop()` on empty.** Calling them on an empty `priority_queue` is undefined behavior, not an exception. Always `while (!pq.empty())` or check size first.
- **Two-heaps rebalancing is an invariant, not an afterthought.** After every insert, re-establish both `max(lo) <= min(hi)` *and* the size rule. Skipping the launder-through step (push to lo, move lo.top to hi) is the classic median bug.
- **Complexity narration.** Lead with "heap gives me O(log k) per op." For top-K state O(n log k) and contrast with O(n log n) full sort and O(n) average quickselect — knowing all three signals depth.
- **Know when NOT to use a heap.** If you need the full sorted order anyway, just sort. If K is close to N, sorting is simpler and same asymptotics. If values are in a small fixed range, counting/bucket sort beats a heap — mention it as the optimal follow-up (Top K Frequent, median in [0,100]).
- **Ties and stability.** Heaps are not stable. If ties must break by a secondary key, encode it into the comparator (e.g. pair of (primary, secondary)) rather than hoping.
- **Interview framing:** when you spot "K-th", "top K", "median of a stream", or "next-smallest across sorted sources," name the pattern before coding — "this is a two-heaps / K-way-merge problem" — then reach for the matching template above.
