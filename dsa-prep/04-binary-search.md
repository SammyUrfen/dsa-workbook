# Binary Search

Binary search is not just "find an element in a sorted array." Its real interview power is **binary-search-on-answer**: when you can't compute the answer directly but you *can* check "is answer `x` feasible?" cheaply, and feasibility is monotonic, you binary search over the answer space. This is one of the highest-leverage patterns for your OAs — mark 🎯 problems as must-do.

## When to reach for this

- The array is **sorted**, or rotated-sorted, or you can define a **monotonic predicate** over the input.
- You're asked for a **min/max value that satisfies a condition** — "minimum capacity", "smallest divisor", "maximum you can guarantee", "least time to finish". This is the tell for binary-search-on-answer.
- The answer lies in a **numeric range** `[lo, hi]` and a candidate `x` can be **checked in O(n)** but computed directly only in O(n log) or worse.
- Brute force is O(n²)/O(n·range) and TLEs, but the search space is monotone (if `x` works, everything on one side of `x` also works).
- Phrases like "minimize the maximum" / "maximize the minimum" — near-certain parametric search.

## Core idea and template

Binary search maintains an invariant: the answer is always inside `[lo, hi]`. Each step halves the range. The two things that cause 90% of bugs are (1) the loop condition (`<` vs `<=`) and (2) how you shrink the boundary. Pick ONE style and use it everywhere so it becomes muscle memory.

```cpp
// ---------- 1. Classic: find exact target in sorted array ----------
// Half-open reasoning with [lo, hi] inclusive. Returns index or -1.
int binarySearch(const vector<int>& a, int target) {
    int lo = 0, hi = (int)a.size() - 1;   // inclusive bounds
    while (lo <= hi) {                     // <= because lo==hi is a valid cell
        int mid = lo + (hi - lo) / 2;      // avoids int overflow vs (lo+hi)/2
        if (a[mid] == target) return mid;
        else if (a[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}

// ---------- 2. lower_bound: first index with a[i] >= target ----------
// Returns a.size() if no such element. This is the "boundary" style —
// learn this one cold; upper_bound and most predicates are variants.
int lowerBound(const vector<int>& a, int target) {
    int lo = 0, hi = (int)a.size();        // note: hi = n (exclusive!)
    while (lo < hi) {                      // < because hi is one-past-valid
        int mid = lo + (hi - lo) / 2;
        if (a[mid] < target) lo = mid + 1; // mid too small -> discard left half
        else hi = mid;                     // mid is a candidate -> keep it
    }
    return lo;                             // lo == hi == first valid boundary
}
// upper_bound (first index with a[i] > target): change condition to a[mid] <= target.

// ---------- 3. Binary search on answer (THE money pattern) ----------
// Find the smallest x in [lo, hi] such that feasible(x) is true,
// given feasible() is monotonic: false...false,true...true.
bool feasible(long long x /*, params */) {
    // O(n) check: can we achieve the goal with candidate value x?
    return true;
}
long long minFeasible(long long lo, long long hi) {
    while (lo < hi) {
        long long mid = lo + (hi - lo) / 2;
        if (feasible(mid)) hi = mid;       // mid works -> answer could be mid or smaller
        else lo = mid + 1;                 // mid fails -> need bigger
    }
    return lo;                             // smallest feasible value
}
// For "largest x that is feasible" (true...true,false...false), flip:
//   if (feasible(mid)) lo = mid; else hi = mid - 1;  with mid = lo + (hi - lo + 1)/2;
//   (the +1 in mid biases UP to avoid an infinite loop when lo == hi-1)
```

The mental checklist for on-answer: **(a)** What am I binary searching over? (the answer value, not an index). **(b)** What are `lo`/`hi` bounds? (theoretical min/max the answer can take). **(c)** Is `feasible` monotonic, and which direction? **(d)** Write `feasible` first, test it on the examples, then wrap the search.

## Problem ladder

- [ ] [Binary Search](https://leetcode.com/problems/binary-search/) — Easy — the canonical exact-match template; get it bug-free from memory.
- [ ] [Search Insert Position](https://leetcode.com/problems/search-insert-position/) — Easy — literally `lower_bound`; cements the boundary style.
- [ ] [First Bad Version](https://leetcode.com/problems/first-bad-version/) — Easy — first `true` in false...true; the predicate mindset with minimal code.
- [ ] [Sqrt(x)](https://leetcode.com/problems/sqrtx/) — Easy — binary search on the answer value, watch for overflow in `mid*mid`.
- [ ] [Find First and Last Position of Element in Sorted Array](https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/) — Medium — lower_bound + upper_bound combined.
- [ ] [Search in Rotated Sorted Array](https://leetcode.com/problems/search-in-rotated-sorted-array/) — Medium — decide which half is sorted, then discard.
- [ ] [Find Minimum in Rotated Sorted Array](https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/) — Medium — find the pivot with a monotone comparison to `a[hi]`.
- [ ] 🎯 [Koko Eating Bananas](https://leetcode.com/problems/koko-eating-bananas/) — Medium — the cleanest intro to search-on-answer (min eating speed).
- [ ] 🎯 [Capacity To Ship Packages Within D Days](https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/) — Medium — minimize the max load; near-identical to Koko.
- [ ] 🎯 [Split Array Largest Sum](https://leetcode.com/problems/split-array-largest-sum/) — Hard — "minimize the maximum subarray sum"; the archetype OA problem.
- [ ] 🎯 [Minimum Number of Days to Make m Bouquets](https://leetcode.com/problems/minimum-number-of-days-to-make-m-bouquets/) — Medium — binary search on days with a greedy feasibility scan.
- [ ] 🎯 [Find the Smallest Divisor Given a Threshold](https://leetcode.com/problems/find-the-smallest-divisor-given-a-threshold/) — Medium — monotone sum-of-ceilings predicate.
- [ ] [Median of Two Sorted Arrays](https://leetcode.com/problems/median-of-two-sorted-arrays/) — Hard — partition-based binary search on the smaller array.
- [ ] [Kth Smallest Element in a Sorted Matrix](https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/) — Medium — binary search on value, count-less-equal as predicate.

## Deep dives: the ingenious ones

### 1. Split Array Largest Sum 🎯 (the on-answer archetype)

**Problem:** Split `nums` into `k` contiguous subarrays to minimize the largest subarray sum.

**Why the naive approach fails:** The obvious move is DP over `(index, splits)` — O(n²·k). Correct but slow, and it hides the elegant structure. Under OA time pressure you want the fast, easy-to-code version.

**The insight — flip the question.** Instead of "what's the best split?", ask "given a cap `X`, can I split into **≤ k** pieces where each piece's sum ≤ X?" This is a trivial greedy: walk left to right, keep adding; when adding would exceed `X`, cut a new piece. Count the pieces.

**Why it's monotonic:** If cap `X` is achievable with ≤ k pieces, then any larger cap `X' > X` is *also* achievable (bigger buckets means fewer or equal cuts). So feasibility is `false, false, ..., true, true` as `X` increases — perfect for binary search. The answer is the smallest feasible `X`.

**Bounds:** `lo = max(nums)` (no piece can be smaller than the biggest element), `hi = sum(nums)` (one piece holds everything).

```cpp
int splitArray(vector<int>& nums, int k) {
    long long lo = 0, hi = 0;
    for (int x : nums) { lo = max(lo, (long long)x); hi += x; }
    auto pieces = [&](long long cap) {          // greedy feasibility
        long long cur = 0; int cnt = 1;
        for (int x : nums) {
            if (cur + x > cap) { cnt++; cur = x; } // start a new piece
            else cur += x;
        }
        return cnt;
    };
    while (lo < hi) {
        long long mid = lo + (hi - lo) / 2;
        if (pieces(mid) <= k) hi = mid;          // feasible -> try smaller cap
        else lo = mid + 1;                       // too many pieces -> raise cap
    }
    return (int)lo;
}
```

**Complexity:** O(n · log(sum)). The log factor is over the *value range*, not n — this is why on-answer beats the DP. Koko, Ship Packages, Smallest Divisor, and Bouquets are all the *same* code with a different `feasible`. Recognize the family and you solve four OA problems with one template.

### 2. Search in Rotated Sorted Array (reasoning under a broken invariant)

**Problem:** A sorted array rotated at an unknown pivot; find `target` in O(log n). No duplicates.

**Why naive binary search fails:** The array isn't globally sorted, so `a[mid] < target ⇒ go right` is wrong. But there's hidden structure: at any `mid`, **at least one of the two halves `[lo..mid]` and `[mid..hi]` is fully sorted** (the pivot lives in only one of them).

**The trick:** Detect which half is sorted by comparing `a[lo]` with `a[mid]`. If `a[lo] <= a[mid]`, the left half is sorted — check if `target` lies in `[a[lo], a[mid])`; if so go left, else go right. Otherwise the right half is sorted — mirror the logic. Because you only ever discard the half you can *prove* doesn't contain the target, correctness holds.

```cpp
int search(vector<int>& a, int target) {
    int lo = 0, hi = (int)a.size() - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] == target) return mid;
        if (a[lo] <= a[mid]) {                       // left half sorted
            if (a[lo] <= target && target < a[mid]) hi = mid - 1;
            else lo = mid + 1;
        } else {                                     // right half sorted
            if (a[mid] < target && target <= a[hi]) lo = mid + 1;
            else hi = mid - 1;
        }
    }
    return -1;
}
```

**Complexity:** O(log n), O(1) space. The lesson that transfers: when the global invariant is broken, find a *local* invariant (one half is always sorted) and branch on it.

### 3. Median of Two Sorted Arrays (binary search on a partition, not a value)

**Problem:** Two sorted arrays, find the median of their union in O(log(min(m,n))).

**Why naive fails:** Merging is O(m+n). To hit log, you can't touch every element — you must binary search a *structural choice*.

**The insight — search for the partition.** The median splits the combined `m+n` elements into a left half and right half of (nearly) equal size. Pick how many elements `i` come from array A's left part; then B contributes `j = (m+n+1)/2 - i` automatically. A partition is **correct** when every left element ≤ every right element, which reduces to just two cross-checks: `A[i-1] <= B[j]` and `B[j-1] <= A[i]`. Binary search `i` over the *smaller* array; use ±∞ sentinels for the out-of-range edges.

```cpp
double findMedianSortedArrays(vector<int>& A, vector<int>& B) {
    if (A.size() > B.size()) swap(A, B);             // search the smaller one
    int m = A.size(), n = B.size(), half = (m + n + 1) / 2;
    int lo = 0, hi = m;
    while (lo <= hi) {
        int i = lo + (hi - lo) / 2, j = half - i;
        int Al = (i == 0 ? INT_MIN : A[i-1]);        // sentinels handle edges
        int Ar = (i == m ? INT_MAX : A[i]);
        int Bl = (j == 0 ? INT_MIN : B[j-1]);
        int Br = (j == n ? INT_MAX : B[j]);
        if (Al <= Br && Bl <= Ar) {                  // correct partition
            if ((m + n) % 2) return max(Al, Bl);
            return (max(Al, Bl) + min(Ar, Br)) / 2.0;
        } else if (Al > Br) hi = i - 1;              // A's left too big -> take fewer from A
        else lo = i + 1;                             // take more from A
    }
    return 0.0;
}
```

**Complexity:** O(log(min(m,n))), O(1) space. The transferable idea: sometimes you binary search over a *decision* (how to partition) rather than an index or a value, and correctness is a couple of boundary inequalities.

## Pitfalls and interview tips

- **Overflow:** always `mid = lo + (hi - lo) / 2`, never `(lo + hi) / 2`. In on-answer problems make `lo/hi/sum` `long long` — a sum of 32-bit ints overflows fast.
- **Infinite loops:** in the `lo < hi` boundary style, `hi = mid` and `lo = mid + 1` are the safe pair. If you ever write `if (feasible) lo = mid`, you MUST bias mid upward (`mid = lo + (hi - lo + 1)/2`) or it loops forever when `hi - lo == 1`.
- **`<` vs `<=`:** exact-match template uses inclusive `hi = n-1` and `while (lo <= hi)`. Boundary/on-answer uses exclusive `hi = n` (or the value upper bound) and `while (lo < hi)`. Don't mix the two dialects in one function.
- **Off-by-one on bounds:** for on-answer, sanity-check that `lo` is actually feasible-or-below and `hi` is actually feasible. `lo = max(element)` matters in Split Array — starting at 0 or 1 still works but is slower; starting too high can skip the answer.
- **Test the predicate alone.** Before wrapping the binary search, run `feasible(lo)`, `feasible(hi)`, and one mid value by hand against the examples. A wrong predicate makes a perfect binary search return garbage.
- **Rotated arrays with duplicates** (LC 81) break the `a[lo] <= a[mid]` test — you need an extra `lo++` when `a[lo]==a[mid]==a[hi]`, degrading to O(n) worst case. Mention this if asked.
- **Interview narration:** say it out loud in this order — "The answer is monotone: if X works, X+1 works, so I'll binary search the answer. My feasibility check is [greedy], O(n). Bounds are [lo, hi]. That gives O(n log range)." This signals pattern recognition instantly and is exactly what OA-graders and interviewers reward.
