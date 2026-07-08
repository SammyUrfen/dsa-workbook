# Module 01 — Arrays and Hashing

*Foundational. This shows up in **every** OA — Microsoft, Flipkart GRiD, Trilogy. If you're fast and reflexive here, you buy yourself time for the hard graph/DP problems later in the test. The whole goal of this module is to convert "I could figure this out" into "I've already coded this pattern 30 times."*

🎯 = OA-critical. Drill these until they're muscle memory.

---

## When to reach for this

- You need to check "have I seen this value / does this thing exist?" in **O(1)** → hash set/map.
- The problem asks about **counts, frequencies, duplicates, or anagrams** → frequency map.
- You're computing **sums/XORs over subarrays or ranges**, or "count subarrays that satisfy X" → prefix sum (often + a hash map of prefixes seen).
- Brute force is an O(n²) double loop and the inner loop is just *"find a matching partner for the current element"* → replace the inner loop with a hash lookup to drop to O(n).
- You must do something in **O(1) extra space** or **in place** on the array itself → two-pass / index-as-hash tricks (mark signs, swap to home position).

---

## Core idea and template

Three engines cover ~90% of array-and-hashing OA problems.

### 1. Hash map "seen it before" (one-pass complement/lookup)

Walk the array once; for each element ask the map a question about elements you've *already* seen, then record the current element. This turns O(n²) "find a partner" into O(n).

```cpp
// Canonical: Two Sum — return indices of the two numbers adding to target.
vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> seen;              // value -> index it lives at
    for (int i = 0; i < (int)nums.size(); ++i) {
        int need = target - nums[i];           // the partner I'm looking for
        auto it = seen.find(need);
        if (it != seen.end())                  // partner already passed by?
            return {it->second, i};
        seen[nums[i]] = i;                      // record AFTER checking (avoid self-pair)
    }
    return {};                                  // problem usually guarantees a solution
}
```

### 2. Frequency counting

Count occurrences, then reason about the counts. Use `unordered_map` for arbitrary keys, or a fixed array (`int cnt[26]` for lowercase letters) when the domain is small — the array version is much faster and is the right call under time pressure.

```cpp
// Anagram signature via a 26-slot frequency array.
array<int,26> freq(const string& s) {
    array<int,26> c{};                          // zero-initialized
    for (char ch : s) c[ch - 'a']++;
    return c;
}
bool isAnagram(const string& a, const string& b) {
    return a.size() == b.size() && freq(a) == freq(b);
}
```

### 3. Prefix sum (+ hash map of prefixes)

Define `pre[i] = nums[0] + ... + nums[i-1]` (with `pre[0] = 0`). Then the sum of `nums[l..r]` is `pre[r+1] - pre[l]`. To **count subarrays** with a target sum, store how many times each prefix value has occurred and look for the complement — same complement trick as Two Sum, one dimension up.

```cpp
// Count subarrays summing to k. O(n) time, O(n) space.
int subarraySum(vector<int>& nums, int k) {
    unordered_map<long long, int> cnt;          // prefix value -> how many times seen
    cnt[0] = 1;                                  // empty prefix: needed for subarrays starting at index 0
    long long pre = 0;
    int ans = 0;
    for (int x : nums) {
        pre += x;
        // a previous prefix p with (pre - p == k) closes a valid subarray
        auto it = cnt.find(pre - k);
        if (it != cnt.end()) ans += it->second;
        cnt[pre]++;                              // record current prefix AFTER counting
    }
    return ans;
}
```

**Ordering rule to internalize:** in one-pass complement problems, *query the map for what you need, then insert the current element*. Inserting first lets an element pair with itself and is the #1 source of off-by-one bugs.

---

## Problem ladder

Do them in order. Don't peek at solutions until you've spent ~10 focused minutes.

- [ ] 🎯 [Two Sum](https://leetcode.com/problems/two-sum/) — Easy — the archetype: complement lookup in a hash map.
- [ ] 🎯 [Contains Duplicate](https://leetcode.com/problems/contains-duplicate/) — Easy — hash set membership, the "have I seen it" reflex.
- [ ] 🎯 [Valid Anagram](https://leetcode.com/problems/valid-anagram/) — Easy — frequency array over 26 letters.
- [ ] [Majority Element](https://leetcode.com/problems/majority-element/) — Easy — frequency counting, then Boyer–Moore for O(1) space.
- [ ] 🎯 [Group Anagrams](https://leetcode.com/problems/group-anagrams/) — Medium — build a canonical key (sorted string or count signature) as the map key.
- [ ] 🎯 [Top K Frequent Elements](https://leetcode.com/problems/top-k-frequent-elements/) — Medium — frequency map + bucket sort (or heap) for O(n).
- [ ] [Intersection of Two Arrays](https://leetcode.com/problems/intersection-of-two-arrays/) — Easy — set intersection.
- [ ] 🎯 [Product of Array Except Self](https://leetcode.com/problems/product-of-array-except-self/) — Medium — prefix/suffix products in two passes, no division.
- [ ] 🎯 [Subarray Sum Equals K](https://leetcode.com/problems/subarray-sum-equals-k/) — Medium — prefix sum + hash map of prefix counts.
- [ ] [Longest Consecutive Sequence](https://leetcode.com/problems/longest-consecutive-sequence/) — Medium — hash set + "start of a run" trick for O(n).
- [ ] [Find All Numbers Disappeared in an Array](https://leetcode.com/problems/find-all-numbers-disappeared-in-an-array/) — Easy — index-as-hash, sign-marking in place.
- [ ] [Set Matrix Zeroes](https://leetcode.com/problems/set-matrix-zeroes/) — Medium — use the first row/column as O(1) marker storage.
- [ ] 🎯 [Valid Sudoku](https://leetcode.com/problems/valid-sudoku/) — Medium — hash sets per row/col/box, encode the key cleanly.
- [ ] [First Missing Positive](https://leetcode.com/problems/first-missing-positive/) — Hard — cyclic in-place placement; array *is* the hash table.

---

## Deep dives: the ingenious ones

These four are where the cleverness lives. If these click, the topic is yours.

### A. Product of Array Except Self — computing without the forbidden tool

**Problem:** `out[i]` = product of all elements except `nums[i]`, and **you may not use division** (and the total product might be 0 anyway).

**Why naive fails:** The obvious move is `total_product / nums[i]`, but division is banned and blows up on zeros. Recomputing each product with a loop is O(n²).

**The insight:** `out[i]` is just *(product of everything to the left of i)* × *(product of everything to the right of i)*. Both of those are running products you can sweep in one direction each.

**The trick, step by step:**
1. Left pass: `out[i]` holds the product of all elements strictly *left* of `i`. Start the accumulator at 1.
2. Right pass: sweep backwards multiplying `out[i]` by a running product of elements strictly *right* of `i`.

```cpp
vector<int> productExceptSelf(vector<int>& nums) {
    int n = nums.size();
    vector<int> out(n, 1);
    int pre = 1;
    for (int i = 0; i < n; ++i) { out[i] = pre; pre *= nums[i]; } // left products
    int suf = 1;
    for (int i = n - 1; i >= 0; --i) { out[i] *= suf; suf *= nums[i]; } // × right products
    return out;
}
```

**Complexity:** O(n) time, O(1) extra space (the output array doesn't count). The zeros handle themselves — no special-casing needed.

---

### B. Subarray Sum Equals K — the Two Sum trick in one higher dimension

**Problem:** count the number of contiguous subarrays whose sum equals `k` (values may be negative).

**Why naive fails:** Enumerating all subarrays is O(n²). And because values can be negative, the sliding-window "grow/shrink" approach **does not work** — shrinking doesn't monotonically decrease the sum. This is the trap: people reach for sliding window and it silently gives wrong answers.

**The insight:** `sum(l..r) = pre[r+1] - pre[l]`. So a subarray ending at index `r` with sum `k` exists for every earlier prefix `pre[l]` such that `pre[l] = pre[r+1] - k`. That's a complement lookup — exactly Two Sum, but you're counting how many earlier prefixes match, not finding one index.

**The trick:** maintain a running prefix sum and a map `prefix value -> how many times it occurred`. At each step, add `cnt[pre - k]` to the answer, then record `pre`. Seed `cnt[0] = 1` so a subarray that starts at index 0 (whose full prefix equals `k`) is counted.

```cpp
// (see the template above) — the crux line:
ans += cnt[pre - k];   // every earlier prefix equal to (pre-k) closes a valid subarray
cnt[pre]++;
```

**Complexity:** O(n) time, O(n) space. The seed `cnt[0]=1` and the query-before-insert order are the two spots people get wrong.

---

### C. Longest Consecutive Sequence — O(n) without sorting

**Problem:** given an unsorted array, find the length of the longest run of consecutive integers (e.g. `[100,4,200,1,3,2]` → `1,2,3,4` → 4). Required: **O(n)**.

**Why naive fails:** Sorting is O(n log n) — explicitly not allowed as the target. Expanding each number outward while re-scanning is O(n²).

**The insight:** dump everything into a hash set. A number `x` is only the **start** of a sequence if `x-1` is *not* in the set. Only from those starting points do you walk upward (`x, x+1, x+2, …`). This guarantees each number is visited by an inner walk at most once total, so the whole thing is O(n) despite the nested-looking loop.

```cpp
int longestConsecutive(vector<int>& nums) {
    unordered_set<int> s(nums.begin(), nums.end());
    int best = 0;
    for (int x : s) {
        if (s.count(x - 1)) continue;           // not a sequence start — skip
        int len = 1, cur = x;
        while (s.count(cur + 1)) { ++cur; ++len; }  // walk the run once
        best = max(best, len);
    }
    return best;
}
```

**Complexity:** O(n) time, O(n) space. The `if (s.count(x-1)) continue;` guard is the entire trick — without it this is O(n²).

---

### D. First Missing Positive — the array as its own hash table

**Problem:** find the smallest positive integer missing from the array, in **O(n) time and O(1) extra space**. (`[3,4,-1,1]` → `2`.)

**Why naive fails:** A hash set solves it in O(n) time but O(n) space, which the "hard" version forbids. Sorting is O(n log n).

**The insight:** For an array of length `n`, the answer must be in `[1, n+1]`. Anything outside that range is irrelevant. So use the array itself as a hash table: place value `v` at index `v-1` (its "home"). After placing everyone home, the first index `i` where `nums[i] != i+1` gives the answer `i+1`.

**The trick — cyclic swapping:** while the current element `v = nums[i]` is in range `[1,n]` and not already home (`nums[v-1] != v`), swap it to its home slot. Use `while` (not `if`) because a swap drops a *new* value into position `i` that may itself need placing. Guarding against `nums[v-1] != v` prevents infinite loops on duplicates.

```cpp
int firstMissingPositive(vector<int>& nums) {
    int n = nums.size();
    for (int i = 0; i < n; ++i) {
        while (nums[i] > 0 && nums[i] <= n && nums[nums[i]-1] != nums[i])
            swap(nums[i], nums[nums[i]-1]);      // send nums[i] to its home index
    }
    for (int i = 0; i < n; ++i)
        if (nums[i] != i + 1) return i + 1;      // first slot not holding its home value
    return n + 1;                                // 1..n all present
}
```

**Complexity:** O(n) time (each swap puts at least one element permanently home, so total swaps ≤ n), O(1) extra space. The duplicate guard `nums[nums[i]-1] != nums[i]` is what keeps the `while` from spinning forever.

---

## Pitfalls and interview tips

**Common bugs**
- **Insert vs. query order** in complement problems: always *query for the partner, then insert the current element*. Reversed, elements pair with themselves.
- **Forgetting `cnt[0] = 1`** in prefix-sum counting → you miss every subarray that starts at index 0.
- **Integer overflow**: prefix sums and products overflow `int` fast. Use `long long` for running sums; for Product Except Self note LeetCode guarantees the answer fits in `int`, but say so out loud.
- **`unordered_map` vs fixed array**: for `a`–`z` or small bounded domains, `int cnt[26]` or `array<int,26>` is faster and cleaner than a hash map. Reach for it when the domain is small.
- **`operator[]` inserts on read**: `mp[key]` default-constructs a missing key (a `0` entry). Use `.count()` / `.find()` when you must not mutate the map while checking.
- **In-place marking edge cases**: sign-flip tricks (Disappeared Numbers) break if the array can contain non-positives or you re-read a value you already negated — always read `abs(nums[i])`.

**Edge cases to name unprompted**: empty array, all-equal elements, negatives (kills sliding window on sum problems), single element, duplicates, and values outside the "interesting" range.

**How to narrate in an interview / OA mindset**
1. State the brute force and its complexity first ("O(n²), pairwise check") — shows you have a baseline.
2. Name the bottleneck: "the inner loop is just a lookup." Then: "a hash map makes that O(1), so overall O(n)."
3. Call out the space/time tradeoff explicitly (hash map = O(n) space; ask if O(1) space is required — that flips you to the in-place tricks).
4. Under Codility/GRiD time pressure: reach for the fixed-size frequency array when the domain is small, keep prefix sums in `long long`, and don't over-engineer — the hash-map version usually passes. Bank the saved minutes for the graph/DP problems that actually decide the test.
