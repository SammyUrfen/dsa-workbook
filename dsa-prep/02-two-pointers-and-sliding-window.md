# Two Pointers and Sliding Window

> Module 02 of your OA prep. Flipkart GRiD and Microsoft love sliding-window mediums — the 🎯 problems are the ones most likely to show up in a timed assessment. Drill those to reflex speed.

---

## When to reach for this

Reach for two-pointers / sliding window when you see any of these tells:

- The input is a **contiguous** structure (array, string) and the answer is about a **subarray / substring** (not a subsequence).
- Words like **"longest / shortest / count of"** a window satisfying a constraint (sum ≤ K, at most K distinct, no repeats).
- The array is **sorted** (or can be sorted) and you want a **pair/triple** meeting a target — opposite pointers.
- Brute force is an O(n²) or O(n³) scan over all subarrays/pairs, and each step's work **overlaps** the previous step — that overlap is what a moving window reuses.
- You need **in-place** array partitioning (move zeros, dedupe, Dutch-national-flag).

---

## Core idea and template

Two families. Know both cold.

**1. Opposite-direction pointers** — `lo` starts at the front, `hi` at the back, they walk toward each other. Works on **sorted** data or on symmetric problems (palindrome, container). Each step you decide which pointer to move based on a comparison, so you never revisit a state — O(n).

**2. Same-direction (sliding window)** — `left` and `right` both start at 0; `right` expands the window, and when the window becomes **invalid**, `left` shrinks it. Every index enters the window once and leaves once → O(n) total even though it looks nested.

```cpp
// ---------- OPPOSITE POINTERS (sorted array, find a pair summing to target) ----------
bool twoSumSorted(const vector<int>& a, int target) {
    int lo = 0, hi = (int)a.size() - 1;
    while (lo < hi) {
        int s = a[lo] + a[hi];
        if (s == target) return true;
        if (s < target) lo++;   // need bigger sum -> move left pointer up
        else            hi--;   // need smaller sum -> move right pointer down
    }
    return false;
}

// ---------- VARIABLE-SIZE SLIDING WINDOW (generic skeleton) ----------
// Find the LONGEST window that stays valid.
int longestValidWindow(const vector<int>& a) {
    int left = 0, best = 0;
    // <window state> e.g. running sum, a frequency map, a distinct-count...
    for (int right = 0; right < (int)a.size(); right++) {
        // 1) ADD a[right] to the window state
        // ... update state with a[right] ...

        // 2) While the window is INVALID, shrink from the left
        while (/* window invalid */) {
            // ... remove a[left] from state ...
            left++;
        }

        // 3) Window is now valid: record the answer
        best = max(best, right - left + 1);
    }
    return best;
}

// ---------- FIXED-SIZE SLIDING WINDOW (window of exactly size k) ----------
long long bestFixedWindow(const vector<int>& a, int k) {
    long long sum = 0, best = LLONG_MIN;
    for (int i = 0; i < (int)a.size(); i++) {
        sum += a[i];                 // add the entering element
        if (i >= k) sum -= a[i - k]; // once the window is full, drop the leaving element
        if (i >= k - 1) best = max(best, sum); // window [i-k+1 .. i] is complete
    }
    return best;
}
```

The single most important reusable idea is the **shrink-when-invalid** loop. For "longest" problems you shrink only while invalid and record after. For "shortest" problems you shrink **greedily while still valid** and record inside the shrink loop (see Minimum Size Subarray Sum below).

---

## Problem ladder

Work top to bottom. Don't move on until you can re-solve a problem from a blank editor in a few minutes.

- [ ] [Two Sum II - Input Array Is Sorted](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/) — Easy — opposite pointers on sorted data, the base case.
- [ ] [Valid Palindrome](https://leetcode.com/problems/valid-palindrome/) — Easy — opposite pointers with skip-non-alphanumeric.
- [ ] [Move Zeroes](https://leetcode.com/problems/move-zeroes/) — Easy — slow/fast same-direction write pointer (in-place partition).
- [ ] [Remove Duplicates from Sorted Array](https://leetcode.com/problems/remove-duplicates-from-sorted-array/) — Easy — slow write pointer keeps the compacted prefix.
- [ ] 🎯 [Best Time to Buy and Sell Stock](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/) — Easy — one-pass min-so-far, a degenerate window.
- [ ] 🎯 [Maximum Average Subarray I](https://leetcode.com/problems/maximum-average-subarray-i/) — Easy — the canonical fixed-size window.
- [ ] 🎯 [Longest Substring Without Repeating Characters](https://leetcode.com/problems/longest-substring-without-repeating-characters/) — Medium — variable window with a last-seen map; OA staple.
- [ ] 🎯 [Minimum Size Subarray Sum](https://leetcode.com/problems/minimum-size-subarray-sum/) — Medium — shortest window, shrink-while-valid.
- [ ] [Container With Most Water](https://leetcode.com/problems/container-with-most-water/) — Medium — opposite pointers, move the shorter wall (greedy proof).
- [ ] 🎯 [3Sum](https://leetcode.com/problems/3sum/) — Medium — sort + fix one element + opposite pointers + dedupe.
- [ ] 🎯 [Permutation in String](https://leetcode.com/problems/permutation-in-string/) — Medium — fixed window + frequency match (anagram check).
- [ ] 🎯 [Longest Repeating Character Replacement](https://leetcode.com/problems/longest-repeating-character-replacement/) — Medium — window valid when (len − maxFreq) ≤ k.
- [ ] 🎯 [Fruit Into Baskets](https://leetcode.com/problems/fruit-into-baskets/) — Medium — longest window with at most 2 distinct.
- [ ] 🎯 [Subarrays with K Different Integers](https://leetcode.com/problems/subarrays-with-k-different-integers/) — Hard — the at-most-K subtraction trick (exactly K = atMost(K) − atMost(K−1)).
- [ ] [Minimum Window Substring](https://leetcode.com/problems/minimum-window-substring/) — Hard — shortest window covering a required multiset; the boss problem.

---

## Deep dives: the ingenious ones

### 1. The "exactly K" → "at most K" subtraction trick — *Subarrays with K Different Integers*

**Problem:** count subarrays with **exactly** K distinct integers.

**Why the naive window fails:** For "longest window with at most K distinct" a sliding window is clean. But "**exactly** K" is not monotonic in a way a single window captures — as `right` moves, a window can have exactly K distinct, then you shrink and it's still messy to count *every* subarray ending at `right`. There's no clean valid/invalid boundary to shrink against.

**The insight:** `exactly(K) = atMost(K) − atMost(K−1)`.

Counting subarrays with **at most** K distinct *is* a clean sliding window, because "at most K distinct" is monotonic: if a window is valid, every subarray inside it is valid too. The trick is the counting step: when the window `[left, right]` has ≤ K distinct, the number of valid subarrays **ending at `right`** is exactly `right − left + 1` (every start from `left` to `right` works). Sum that over all `right`.

```cpp
int atMost(const vector<int>& a, int K) {
    if (K < 0) return 0;
    unordered_map<int,int> cnt;
    int left = 0, res = 0;
    for (int right = 0; right < (int)a.size(); right++) {
        if (++cnt[a[right]] == 1) K--;      // new distinct value consumed a slot
        while (K < 0) {                     // too many distinct -> shrink
            if (--cnt[a[left]] == 0) K++;   // freed a slot
            left++;
        }
        res += right - left + 1;            // <-- all subarrays ending at right
    }
    return res;
}
int subarraysWithKDistinct(vector<int>& a, int k) {
    return atMost(a, k) - atMost(a, k - 1);
}
```

**Complexity:** O(n) per `atMost`, O(n) total. Space O(K).
**Why it's worth memorizing:** the identity `exactly(K)=atMost(K)−atMost(K−1)` and the `res += right-left+1` counting idiom reappear in a whole family of "count subarrays where..." problems (count with sum ≤ K, count nice subarrays, count subarrays bounded by a max). This is the single highest-leverage trick in the module.

### 2. Move the shorter wall — *Container With Most Water*

**Problem:** pick two lines; area = `min(height[lo], height[hi]) × (hi − lo)`. Maximize.

**Why naive fails:** all pairs is O(n²) — too slow for large n in a timed OA.

**The trick:** put `lo` at 0, `hi` at the end. Area is capped by the **shorter** wall. If you move the taller wall inward, the width shrinks *and* the height is still capped by the same short wall — area can only stay the same or drop. So moving the taller wall can never help; the only move that could possibly find something better is to **discard the shorter wall**. Move whichever pointer points at the shorter line.

```cpp
int maxArea(vector<int>& h) {
    int lo = 0, hi = h.size() - 1, best = 0;
    while (lo < hi) {
        best = max(best, min(h[lo], h[hi]) * (hi - lo));
        if (h[lo] < h[hi]) lo++; else hi--;   // drop the shorter wall
    }
    return best;
}
```

**Complexity:** O(n) time, O(1) space. The clever part is the *proof* that discarding the short wall loses nothing — say that proof out loud in an interview and you've won the problem.

### 3. Window valid when `len − maxFreq ≤ k` — *Longest Repeating Character Replacement*

**Problem:** longest substring you can make all-same by replacing **at most k** characters.

**The insight:** in any window, the cheapest way to make it uniform is to keep the **most frequent** character and replace all the rest. So the window is achievable iff `(windowLength − countOfMostFrequentChar) ≤ k`. Slide a variable window; shrink when that condition breaks.

**The subtle optimization:** you never need to *decrease* `maxFreq` when shrinking. The answer is monotonic — once you've seen a window of some length, you only care about beating it, so a slightly stale `maxFreq` never produces a *longer* wrong answer. This lets you drop the `while` and shrink by at most one step per iteration with a plain `if`.

```cpp
int characterReplacement(string s, int k) {
    vector<int> cnt(26, 0);
    int left = 0, maxFreq = 0, best = 0;
    for (int right = 0; right < (int)s.size(); right++) {
        maxFreq = max(maxFreq, ++cnt[s[right] - 'A']);
        // if replacements needed exceed k, slide the window right by one
        if ((right - left + 1) - maxFreq > k) {
            cnt[s[left] - 'A']--;
            left++;
        }
        best = max(best, right - left + 1);
    }
    return best;
}
```

**Complexity:** O(n) time, O(26) space. The "don't bother recomputing maxFreq on shrink" step is the trick that trips people up — understand *why* it's safe.

### 4. Shrink-while-valid for "shortest" — *Minimum Size Subarray Sum*

**Problem:** shortest contiguous subarray with sum ≥ target (positive numbers).

**The contrast with "longest" problems:** for *longest*-valid you shrink only when the window is *invalid*. For *shortest*-valid you flip it: expand until the window becomes **valid**, then greedily **shrink while it stays valid**, recording the length at each step. Positive numbers guarantee monotonicity — adding grows the sum, removing shrinks it.

```cpp
int minSubArrayLen(int target, vector<int>& a) {
    int left = 0, best = INT_MAX; long long sum = 0;
    for (int right = 0; right < (int)a.size(); right++) {
        sum += a[right];
        while (sum >= target) {              // shrink WHILE still valid
            best = min(best, right - left + 1);
            sum -= a[left++];
        }
    }
    return best == INT_MAX ? 0 : best;
}
```

**Complexity:** O(n) time, O(1) space. Note the sliding-window sum trick assumes **non-negative** values; with negatives you'd need prefix sums + a monotonic deque instead — a good thing to mention as a caveat.

---

## Pitfalls and interview tips

**Common bugs**
- **Off-by-one on window length:** it's `right - left + 1`, not `right - left`. Write it once, trust it.
- **Fixed window: subtract the leaving element at the right time.** Guard with `if (i >= k)` before `sum -= a[i-k]`, and only record once `i >= k-1`.
- **Forgetting to update state on *both* add and remove.** Every `left++` must undo exactly what the matching `right` did (decrement the freq map, subtract from sum). Asymmetry here is the #1 sliding-window bug.
- **Erasing vs decrementing in a freq map:** when a count hits 0, decrement your distinct-counter (or `erase` the key) — otherwise `map.size()` overcounts distinct elements.
- **Overflow:** sums of large arrays overflow `int`; use `long long`.
- **`3Sum` / sorted-pair dedupe:** after finding a valid pair/triple, skip duplicates on *both* pointers (`while (lo<hi && a[lo]==a[lo+1]) lo++;`) or you emit repeats.
- **Shortest vs longest confusion:** record the answer *inside* the shrink loop for shortest, *after* the shrink loop for longest. Getting this backwards silently returns wrong answers.

**Edge cases to name unprompted:** empty array, k = 0, k larger than the array, all-equal elements, single element, target unreachable (return 0 / −1 per spec), negative numbers (do they break the monotonicity your window relies on?).

**How to narrate it in the interview**
1. State the pattern out loud: "The answer is a contiguous subarray and brute force is O(n²) over all subarrays with overlapping work — that's a sliding window."
2. Define the window invariant precisely ("window has at most K distinct" / "sum ≥ target") *before* coding.
3. Say the complexity up front: "Each index enters and leaves the window once, so it's O(n) despite the nested loop."
4. For opposite-pointer greedy (Container, move-the-shorter-wall), **state the exchange argument** — why the discarded side can't beat what you keep. Interviewers grade the justification, not just the code.
5. If you see "**exactly** K" or "**count** subarrays," immediately float the `atMost(K) − atMost(K−1)` reframing — it signals real pattern fluency.
