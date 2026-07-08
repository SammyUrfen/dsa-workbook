# Dynamic Programming I: 1-D and Knapsack

DP is the single most cited topic in Microsoft OA writeups, and it shows up in every Flipkart/Trilogy hard set. The good news: 80% of DP problems are variations of the 5-6 templates below. Learn the *shape* of each and you will recognize them under time pressure.

## When to reach for this

Reach for DP when you see any of these tells:

- The problem asks for the **number of ways**, the **min/max cost/value**, or **is it possible** to reach a target — an *optimization or counting* answer, not a specific arrangement.
- You can make a **sequence of choices** (take/skip an item, step 1 or 2, pick a coin) and each choice leaves a **smaller version of the same problem**.
- A brute-force recursion works but **recomputes the same subproblem** many times (exponential blowup) — the recursion tree has overlapping branches.
- The answer at index `i` depends only on a **few earlier answers** (`i-1`, `i-2`, or "some `j < i`").
- Greedy gives a wrong answer on a small counterexample (e.g. coin change with coins {1,3,4} for amount 6 — greedy picks 4+1+1=3 coins, optimal is 3+3=2).

## Core idea and template

Every DP is three things: **state** (what parameters uniquely describe a subproblem), **transition** (how a state's answer is built from smaller states), and **base case** (the smallest states you can answer directly). Nail these three in words *before* writing code — that is also exactly how you narrate it in an interview.

Two ways to implement the same recurrence:
- **Memoization (top-down):** write the natural recursion, cache results in a `dp[]` array. Easiest to derive.
- **Tabulation (bottom-up):** fill `dp[]` from base cases upward with a loop. Usually faster (no recursion overhead) and enables space optimization.

```cpp
// ---------- TEMPLATE A: Top-down memoization ----------
// Example shape: min cost / count of ways from state i.
vector<int> memo;              // sized n+1, init to -1 (= "not computed")

int solve(int i, /* other state */ vector<int>& a) {
    // 1. BASE CASE(S): smallest solvable states
    if (i < 0) return 0;               // adapt to the problem
    // 2. MEMO CHECK: already computed?
    if (memo[i] != -1) return memo[i];
    // 3. TRANSITION: try every choice, combine sub-answers
    int best = INT_MAX;                // or 0 for counting, then +=
    best = min(best, solve(i - 1, a) /* + cost */);
    best = min(best, solve(i - 2, a) /* + cost */);
    // 4. STORE and return
    return memo[i] = best;
}
// call: memo.assign(n + 1, -1); solve(n, a);

// ---------- TEMPLATE B: Bottom-up tabulation ----------
int tabulate(vector<int>& a) {
    int n = a.size();
    vector<int> dp(n + 1);
    dp[0] = /* base */ 0;               // seed base case(s)
    for (int i = 1; i <= n; ++i) {      // fill in dependency order
        dp[i] = /* combine dp[i-1], dp[i-2], ... */ 0;
    }
    return dp[n];
}

// ---------- TEMPLATE C: 0/1 Knapsack (2-D -> 1-D) ----------
// items with weight[i], value[i]; capacity W. Each item used 0 or 1 times.
int knapsack01(vector<int>& wt, vector<int>& val, int W) {
    int n = wt.size();
    vector<int> dp(W + 1, 0);          // dp[c] = best value with capacity c
    for (int i = 0; i < n; ++i)
        // KEY: loop capacity DOWNWARD so item i is used at most once
        for (int c = W; c >= wt[i]; --c)
            dp[c] = max(dp[c], dp[c - wt[i]] + val[i]);
    return dp[W];
}

// ---------- TEMPLATE D: Unbounded knapsack (item reusable) ----------
int knapsackUnbounded(vector<int>& wt, vector<int>& val, int W) {
    int n = wt.size();
    vector<int> dp(W + 1, 0);
    for (int i = 0; i < n; ++i)
        // KEY: loop capacity UPWARD so item i can be reused
        for (int c = wt[i]; c <= W; ++c)
            dp[c] = max(dp[c], dp[c - wt[i]] + val[i]);
    return dp[W];
}
```

The direction of the inner capacity loop is the *entire* difference between 0/1 and unbounded knapsack. Memorize that.

## Problem ladder

Work top to bottom. 🎯 marks OA-critical problems (cited in Microsoft-style writeups — do these first and until fast).

- [ ] 🎯 [Climbing Stairs](https://leetcode.com/problems/climbing-stairs/) — Easy — the "hello world" of 1-D DP: `dp[i]=dp[i-1]+dp[i-2]`.
- [ ] [Min Cost Climbing Stairs](https://leetcode.com/problems/min-cost-climbing-stairs/) — Easy — same recurrence but minimizing cost; practice base cases.
- [ ] 🎯 [House Robber](https://leetcode.com/problems/house-robber/) — Medium — take/skip choice: `dp[i]=max(dp[i-1], dp[i-2]+a[i])`.
- [ ] [House Robber II](https://leetcode.com/problems/house-robber-ii/) — Medium — circular array; run House Robber twice on two ranges.
- [ ] 🎯 [Coin Change](https://leetcode.com/problems/coin-change/) — Medium — min coins to hit a target (unbounded knapsack, minimization).
- [ ] [Coin Change II](https://leetcode.com/problems/coin-change-ii/) — Medium — *count ways* to make amount; loop-order matters (combinations vs permutations).
- [ ] [Partition Equal Subset Sum](https://leetcode.com/problems/partition-equal-subset-sum/) — Medium — reduces to 0/1 knapsack: can we hit sum/2?
- [ ] [Target Sum](https://leetcode.com/problems/target-sum/) — Medium — assign +/- signs; algebra turns it into a subset-sum knapsack.
- [ ] 🎯 [Longest Increasing Subsequence](https://leetcode.com/problems/longest-increasing-subsequence/) — Medium — O(n²) DP, then the clever O(n log n) patience-sort version.
- [ ] [Word Break](https://leetcode.com/problems/word-break/) — Medium — 1-D DP over string prefixes with a dictionary set.
- [ ] [Combination Sum IV](https://leetcode.com/problems/combination-sum-iv/) — Medium — count ordered sequences summing to target (permutation-style loop order).
- [ ] [Perfect Squares](https://leetcode.com/problems/perfect-squares/) — Medium — min count of squares summing to n; unbounded-knapsack flavor.
- [ ] [Maximum Product Subarray](https://leetcode.com/problems/maximum-product-subarray/) — Medium — track min *and* max because negatives flip signs.
- [ ] [Delete and Earn](https://leetcode.com/problems/delete-and-earn/) — Medium — bucket values, then it becomes House Robber in disguise.

## Deep dives: the ingenious ones

### 1. Coin Change II — why loop order decides combinations vs permutations

**Problem:** count the number of ways to make `amount` using coins (each coin unlimited). Order does *not* matter: {1,2} and {2,1} are the same way.

**The trap:** the naive instinct is one `dp[]` array with both loops, but the order you nest them silently changes the answer.

```cpp
// COMBINATIONS (correct for Coin Change II): coins OUTER, amount INNER
int change(int amount, vector<int>& coins) {
    vector<unsigned long long> dp(amount + 1, 0);
    dp[0] = 1;                      // one way to make 0: take nothing
    for (int coin : coins)          // fix a coin, then extend all amounts
        for (int a = coin; a <= amount; ++a)
            dp[a] += dp[a - coin];
    return (int)dp[amount];
}
```

**Why it works:** by putting the coin loop *outside*, when you process coin `c` you have already finished all coins before it. So every way you count uses coins in a fixed non-decreasing order — you can never count {1 then 2} and {2 then 1} separately. That is exactly "combinations."

**The contrast:** if you swap the loops (amount outer, coin inner), you allow revisiting smaller coins after larger ones, counting {1,2} and {2,1} as distinct — that computes **permutations** (this is precisely Combination Sum IV). Same array, same `+=`, opposite meaning. In an interview, say out loud: *"outer loop = the thing whose order I want to ignore."*

- **Time** O(n·amount), **space** O(amount).

### 2. 0/1 Knapsack — why the inner loop must run *backwards*

Start from the honest 2-D table: `dp[i][c]` = best value using the first `i` items with capacity `c`. Transition: skip item `i` → `dp[i-1][c]`; take it → `dp[i-1][c-wt[i]] + val[i]`.

The critical detail is that "take" reads from row **`i-1`** — the previous item's state — guaranteeing item `i` is used at most once.

Now compress to 1-D by reusing a single row in place. If we loop capacity **upward**, then when we compute `dp[c]` we read `dp[c-wt[i]]` which was *already updated this same iteration* — meaning item `i` got used twice. That silently turns 0/1 into unbounded.

```cpp
for (int i = 0; i < n; ++i)
    for (int c = W; c >= wt[i]; --c)   // DOWNWARD
        dp[c] = max(dp[c], dp[c - wt[i]] + val[i]);
//  reading dp[c - wt[i]] here still holds the OLD (item i-1) value,
//  because we haven't touched any index < c yet this iteration.
```

**The insight:** iterating capacity from high to low keeps every `dp[c-wt[i]]` you read frozen at the previous item's value. That is the whole reason 0/1 knapsack and Partition Equal Subset Sum use a downward loop.

- **Time** O(n·W), **space** O(W).

### 3. Longest Increasing Subsequence in O(n log n) — the patience trick

The O(n²) DP (`dp[i]` = LIS ending at `i`, scan all `j<i`) is easy but too slow for large `n`. The clever version is not really "DP" anymore — it is *patience sorting*.

**The idea:** maintain an array `tails`, where `tails[k]` = the **smallest possible tail value** of any increasing subsequence of length `k+1` seen so far. This array is always sorted. For each new number `x`, find the first `tails[k] >= x` and overwrite it with `x` (or append `x` if it's bigger than everything).

```cpp
int lengthOfLIS(vector<int>& a) {
    vector<int> tails;
    for (int x : a) {
        auto it = lower_bound(tails.begin(), tails.end(), x);
        if (it == tails.end()) tails.push_back(x);   // extends longest run
        else *it = x;                                 // keep tails minimal
    }
    return tails.size();                              // length only
}
```

**Why replacing works:** overwriting `tails[k]` with a smaller `x` never shrinks the answer — it only makes future extensions *easier* by keeping tails as small as possible. The length of `tails` is the LIS length. The subtlety to internalize: `tails` is **not** an actual subsequence, it is just a bookkeeping array — do not try to read the sequence off it directly. `lower_bound` gives the O(log n) per element.

- **Time** O(n log n), **space** O(n). (Use `upper_bound` instead of `lower_bound` for the *longest non-decreasing* variant.)

### 4. Partition Equal Subset Sum — spotting knapsack in disguise

**Problem:** can you split the array into two subsets with equal sum? The "two subsets" framing hides a pure boolean 0/1 knapsack.

**The reduction:** if total sum `S` is odd, it's instantly impossible. Otherwise the question is: *does some subset sum to exactly `S/2`?* Now it is a 0/1 knapsack where "value = weight = element" and we only care about reachability.

```cpp
bool canPartition(vector<int>& nums) {
    int S = accumulate(nums.begin(), nums.end(), 0);
    if (S & 1) return false;
    int target = S / 2;
    vector<char> dp(target + 1, false);
    dp[0] = true;                          // sum 0 always reachable
    for (int x : nums)
        for (int c = target; c >= x; --c)  // DOWNWARD: each item once
            dp[c] = dp[c] || dp[c - x];
    return dp[target];
}
```

**The lesson worth generalizing:** whenever a problem says "pick a subset to hit an exact total / balance / difference," translate it to subset-sum knapsack. Target Sum is the same idea after the algebra `(sum + target)/2`. Interviewers love this reduction because the disguise is the whole difficulty.

- **Time** O(n·S), **space** O(S).

## Pitfalls and interview tips

**Common bugs**
- **Wrong knapsack loop direction** — the #1 DP bug. Downward = 0/1 (item once); upward = unbounded (reusable). Say which you need out loud before coding.
- **Coin Change vs Coin Change II loop nesting** — outer loop is the dimension whose order you want to *ignore*. Getting it backwards computes permutations instead of combinations.
- **Base-case off-by-one** — `dp[0]` must mean something concrete: for counting it's usually `1` (one empty way), for min-cost it's `0`. Get this wrong and everything downstream is off.
- **Integer overflow** — counting problems (Coin Change II, Combination Sum IV) can overflow `int`. Use `long long`/`unsigned long long`, and take `% 1e9+7` when the problem says so.
- **Unreachable = "infinity" sentinel** — in min-coins DP, initialize to a large value but guard against `INF + coin` overflowing; check `dp[i] != INF` before using it, and return -1 if the target stays unreachable.
- **`memo` init value collision** — don't init to `-1` if `-1` is a legal answer; use a distinct sentinel or a separate `visited[]`.

**Edge cases to state:** empty input, target = 0, single element, all-negative arrays (Maximum Product Subarray), and target larger than any achievable sum.

**How to narrate it in an interview** (this is graded as much as the code):
1. "Let me define the **state**: `dp[i]` means ___." State it in one sentence.
2. "The **transition** is ___ because at each step my choices are ___." Show the recurrence.
3. "**Base cases** are ___." Then, "top-down would be a clean recursion + memo; I'll write bottom-up for speed."
4. Give the **complexity** as `states × work-per-state` — e.g. "O(n·W): n·W states, O(1) transition."
5. If time allows, mention the **space optimization** (drop a dimension by reusing a row). Interviewers love seeing you know it exists even if you don't code it.

Start every DP by writing the brute-force recursion first, *then* add memoization — deriving tabulation from scratch under pressure is where people freeze. The recursion tree tells you the state and transition for free.
