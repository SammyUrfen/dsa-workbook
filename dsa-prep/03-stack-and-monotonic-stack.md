# Module 03 — Stack and Monotonic Stack

> 🎯 = **OA-critical** (STAR). Monotonic stack is a classic "aha" trick that turns an O(n²) brute force into O(n). Learn to *recognize* it under time pressure — that recognition is worth more than any single problem.

---

## When to reach for this

- You need to **match / pair / nest** things: brackets, tags, directories, "the most recent unclosed X". LIFO ordering is the whole game.
- The phrase **"next greater / next smaller / previous greater / previous smaller"** appears (explicitly or in disguise: "days until warmer", "span", "how far can you see").
- You're computing something over a range where the answer is bounded by a **min or max**, and a brute force scans all pairs/subarrays: **histogram-style** problems (largest rectangle, max area, trapping water, subarray-min sums).
- You catch yourself writing a nested loop where the inner loop scans **leftward or rightward until a condition breaks** — that "scan until bigger/smaller" is a monotonic stack in disguise.
- You need to **evaluate or simplify** an expression respecting precedence/nesting (RPN, calculator, decode string, path canonicalization).

---

## Core idea and template

A **stack** gives you O(1) access to the *most recently seen unresolved* element. A **monotonic stack** additionally keeps its contents sorted (increasing or decreasing); when a new element would break that order, you **pop** — and the moment of popping is exactly when you've found the answer for the popped element.

Key mental model: **an element sits on the stack while it is still "waiting" for its answer. The element that pops it off IS its answer.**

### Template A — Plain stack (matching / parsing)

```cpp
bool validParentheses(const string& s) {
    stack<char> st;
    unordered_map<char,char> match = {{')','('}, {']','['}, {'}','{'}};
    for (char c : s) {
        if (c=='(' || c=='[' || c=='{') {
            st.push(c);                 // open bracket: wait for its partner
        } else {                        // close bracket: must match top
            if (st.empty() || st.top() != match[c]) return false;
            st.pop();                   // matched — resolved
        }
    }
    return st.empty();                  // nothing left waiting
}
```

### Template B — Monotonic stack for "Next Greater Element"

Store **indices** (you almost always want the index so you can compute distances and index into the array). Decide direction with one question: *"while the stack top is worse than the current element, the current element is the answer for the top."*

```cpp
// Next Greater Element to the RIGHT for every index.
// ans[i] = value of the first element to the right of i that is > nums[i], else -1.
vector<int> nextGreater(const vector<int>& nums) {
    int n = nums.size();
    vector<int> ans(n, -1);
    stack<int> st;                      // holds INDICES, values strictly decreasing top->bottom
    for (int i = 0; i < n; ++i) {
        // current nums[i] resolves every waiting index smaller than it
        while (!st.empty() && nums[st.top()] < nums[i]) {
            ans[st.top()] = nums[i];    // nums[i] is the next-greater for st.top()
            st.pop();
        }
        st.push(i);                     // i now waits for ITS next-greater
    }
    return ans;                         // indices still on stack keep -1
}
```

**How to flip the four variants** (memorize this table, it removes all the guesswork):

| Want | Scan direction | Pop while |
|------|----------------|-----------|
| Next greater (right) | left → right | `top < cur` |
| Next smaller (right) | left → right | `top > cur` |
| Previous greater (left) | left → right | `top < cur`, answer = new top after popping |
| Previous smaller (left) | left → right | `top > cur`, answer = new top after popping |

For "previous" variants you don't record on pop; instead, **after popping**, whatever remains on top is the previous-greater/smaller of the current element.

Use `<=` vs `<` to control tie-handling (strictly greater vs greater-or-equal) — this matters in histogram to avoid double counting.

---

## Problem ladder

Work top to bottom. Don't skip the easy ones — they build the reflex.

- [ ] 🎯 [Valid Parentheses](https://leetcode.com/problems/valid-parentheses/) — Easy — plain stack matching, the canonical warmup.
- [ ] [Baseball Game](https://leetcode.com/problems/baseball-game/) — Easy — stack as a running record you push/pop/mutate.
- [ ] [Min Stack](https://leetcode.com/problems/min-stack/) — Medium — augment a stack to answer min() in O(1); pair each value with the running min.
- [ ] [Remove All Adjacent Duplicates In String](https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string/) — Easy — stack collapses matching neighbors.
- [ ] 🎯 [Next Greater Element I](https://leetcode.com/problems/next-greater-element-i/) — Easy — the monotonic-stack primitive, precompute NGE then map.
- [ ] 🎯 [Daily Temperatures](https://leetcode.com/problems/daily-temperatures/) — Medium — next-greater but answer is the *distance* (index gap).
- [ ] [Next Greater Element II](https://leetcode.com/problems/next-greater-element-ii/) — Medium — circular array; iterate 2n and mod the index.
- [ ] 🎯 [Evaluate Reverse Polish Notation](https://leetcode.com/problems/evaluate-reverse-polish-notation/) — Medium — stack-based expression evaluation.
- [ ] [Asteroid Collision](https://leetcode.com/problems/asteroid-collision/) — Medium — stack simulation with collision resolution on push.
- [ ] [Decode String](https://leetcode.com/problems/decode-string/) — Medium — two stacks (counts + strings) for nested `k[...]`.
- [ ] [Simplify Path](https://leetcode.com/problems/simplify-path/) — Medium — stack of path components, `..` pops.
- [ ] 🎯 [Trapping Rain Water](https://leetcode.com/problems/trapping-rain-water/) — Hard — monotonic decreasing stack filling water layer by layer (also 2-pointer).
- [ ] 🎯 [Largest Rectangle in Histogram](https://leetcode.com/problems/largest-rectangle-in-histogram/) — Hard — THE monotonic-stack masterpiece; each bar as the limiting height.
- [ ] 🎯 [Maximal Rectangle](https://leetcode.com/problems/maximal-rectangle/) — Hard — reduce each row to a histogram, then apply the above.
- [ ] [Sum of Subarray Minimums](https://leetcode.com/problems/sum-of-subarray-minimums/) — Medium — count contribution of each element as a range minimum via prev/next-smaller.

---

## Deep dives: the ingenious ones

### 1. 🎯 Largest Rectangle in Histogram

**Problem.** Given bar heights, find the largest axis-aligned rectangle that fits under the skyline.

**Why the naive approach fails.** For each bar you could expand left and right while bars are ≥ its height — that's O(n²), and with n up to 10⁵ it times out. The insight you're missing in the brute force: you keep *recomputing* the same boundaries.

**The key insight.** Fix each bar `i` as the **shortest bar** of the rectangle (the one that caps the height). Then the rectangle's width is bounded by:
- the **previous smaller** bar on the left, and
- the **next smaller** bar on the right.

Width = `right_smaller - left_smaller - 1`, area = `height[i] * width`. Every possible optimal rectangle has *some* shortest bar, so trying each bar as the cap covers all rectangles.

**The trick, step by step.** A single left-to-right pass with a **monotonic increasing stack of indices** finds *both* boundaries at once. When bar `i` is about to break the increasing order (`heights[i] < heights[st.top()]`), that means **`i` is the next-smaller-to-the-right** for the popped bar. And after popping, the **new top is the previous-smaller-to-the-left**. So the popped bar's full width is known the instant it pops.

```cpp
int largestRectangleArea(vector<int>& h) {
    int n = h.size(), best = 0;
    stack<int> st;                      // indices, heights strictly increasing bottom->top
    for (int i = 0; i <= n; ++i) {
        int cur = (i == n) ? 0 : h[i];  // sentinel 0 flushes the whole stack at the end
        while (!st.empty() && h[st.top()] > cur) {
            int height = h[st.top()]; st.pop();
            // right boundary = i (first smaller to the right)
            // left boundary  = st.top() after pop (first smaller to the left), or -1
            int leftBound = st.empty() ? -1 : st.top();
            int width = i - leftBound - 1;
            best = max(best, height * width);
        }
        st.push(i);
    }
    return best;
}
```

**Why the sentinel matters.** The trailing `cur = 0` (when `i == n`) is guaranteed smaller than every real bar, so it forces every remaining bar to pop and be measured. Without it, bars in a strictly increasing histogram never pop and you return 0. This sentinel idiom recurs across monotonic-stack problems — internalize it.

**Complexity.** O(n) time (each index pushed and popped once), O(n) space.

---

### 2. 🎯 Trapping Rain Water (monotonic stack view)

**Problem.** Given elevations, compute trapped water after rain.

**Why one naive idea fails.** "For each index, water = min(maxLeft, maxRight) − height" is correct but recomputing maxLeft/maxRight naively is O(n²). The prefix-max/suffix-max version fixes that in O(n) — but the *stack* version teaches a different, transferable idea: **filling horizontal layers**.

**The key insight.** Keep a **decreasing** stack of indices. Water gets trapped when you see a bar *taller* than the top of the stack — that bar forms the right wall, the new stack top (after popping) forms the left wall, and the popped bar is the *floor* of a horizontal slab of water.

**Step by step.** When `height[i] > height[st.top()]`:
1. Pop the floor `bottom = st.top()`.
2. If the stack is now empty there's no left wall — stop.
3. Left wall = new `st.top()`, right wall = `i`.
4. Bounded height of this slab = `min(height[left], height[i]) - height[bottom]`.
5. Width = `i - left - 1`. Add `boundedHeight * width`.

```cpp
int trap(vector<int>& h) {
    int n = h.size(), water = 0;
    stack<int> st;                      // indices, heights decreasing bottom->top
    for (int i = 0; i < n; ++i) {
        while (!st.empty() && h[i] > h[st.top()]) {
            int bottom = st.top(); st.pop();
            if (st.empty()) break;      // no left wall
            int left = st.top();
            int bounded = min(h[left], h[i]) - h[bottom];
            water += bounded * (i - left - 1);
        }
        st.push(i);
    }
    return water;
}
```

**Complexity.** O(n) / O(n). (The two-pointer solution is O(1) space and often preferred in interviews — know both, and mention the tradeoff.)

---

### 3. Sum of Subarray Minimums — the "contribution" trick

**Problem.** Sum, over *every* subarray, of its minimum element. n up to 3·10⁴, answer mod 1e9+7.

**Why the naive approach fails.** There are O(n²) subarrays; enumerating each and taking its min is O(n²) or worse.

**The key insight — flip the question.** Instead of "for each subarray, what's its min?", ask **"for each element, in how many subarrays is IT the minimum?"** Each such subarray contributes `nums[i]` to the total, so `answer = Σ nums[i] * (count of subarrays where nums[i] is the min)`.

**Counting the subarrays.** Element `i` is the minimum of a subarray iff that subarray:
- extends left no further than the **previous strictly-smaller** element, and
- extends right no further than the **next smaller-or-equal** element.

Let `left` = distance to previous smaller, `right` = distance to next smaller-or-equal. Then `i` is the min of `left * right` subarrays. The asymmetric strict/non-strict boundary (`<` on one side, `<=` on the other) is the crux: it ensures subarrays with **duplicate minimums are counted exactly once**, not zero or twice.

```cpp
// left[i]: # of contiguous elements ending at i where nums[i] is the min (using > to pop => strict left)
// right[i]: same to the right (using >= to pop => non-strict right, breaks ties)
long long sumSubarrayMins(vector<int>& a) {
    const long long MOD = 1e9+7;
    int n = a.size();
    vector<long long> left(n), right(n);
    stack<int> st;
    for (int i = 0; i < n; ++i) {                 // previous strictly smaller
        while (!st.empty() && a[st.top()] > a[i]) st.pop();
        left[i] = st.empty() ? i + 1 : i - st.top();
        st.push(i);
    }
    while (!st.empty()) st.pop();
    for (int i = n - 1; i >= 0; --i) {            // next smaller-or-equal
        while (!st.empty() && a[st.top()] >= a[i]) st.pop();
        right[i] = st.empty() ? n - i : st.top() - i;
        st.push(i);
    }
    long long ans = 0;
    for (int i = 0; i < n; ++i)
        ans = (ans + a[i] * left[i] % MOD * right[i]) % MOD;
    return ans;
}
```

**Complexity.** O(n) / O(n). This "each element's contribution as a range extremum" pattern generalizes to sum-of-subarray-maximums, sum of (max−min), and subarray-range-sum problems — a high-leverage template.

---

## Pitfalls and interview tips

**Common bugs**
- **Storing values instead of indices.** For anything involving distance, width, or boundaries, push indices and index into the array. Storing raw values throws away the position you need.
- **Forgetting the sentinel / stack flush.** In histogram and next-greater problems, elements left on the stack at the end still need processing. Either append a sentinel (`0` for histogram, treat as `-1`/unresolved for NGE) or add an explicit drain loop.
- **`<` vs `<=` tie handling.** In histogram, popping on `>` (not `>=`) can double-count equal-height rectangles; in subarray-min-sums you deliberately make one side strict and the other non-strict. Decide tie behavior *on purpose*, then test with an all-equal input like `[2,2,2]`.
- **Not checking `st.empty()` before `st.top()`.** UB in C++. Guard every `top()`/`pop()`.
- **Integer overflow.** Histogram/rectangle areas and subarray sums overflow `int` (10⁵ × 10⁴). Use `long long` and apply MOD where required.
- **Circular arrays** (Next Greater Element II): iterate `i` from `0` to `2n-1` and use `nums[i % n]`, but only push indices `< n`.

**Edge cases to name aloud**: empty input, single element, all-equal elements, strictly increasing and strictly decreasing sequences (these stress the flush logic), and for parentheses: unmatched closing at the very start (`)`) and leftover opens at the end.

**How to narrate in an interview**
1. State the brute force and its complexity first ("naively I'd scan left/right for each bar — O(n²)").
2. Say the magic sentence: *"I notice each element only needs to know its nearest smaller/greater neighbor, so a monotonic stack gives me that in one pass."* This signals pattern recognition, which is exactly what interviewers grade.
3. Declare the invariant out loud: "I'll keep a stack of indices with strictly increasing heights; when the current bar is shorter, I pop and finalize those bars."
4. Walk one small example (e.g. `[2,1,5,6,2,3]`) through the stack to prove correctness before coding.
5. Close with the amortized argument: "each index is pushed and popped at most once, so it's O(n) total even though there's a nested while loop." Interviewers love hearing the amortized-O(n) justification — volunteer it.
