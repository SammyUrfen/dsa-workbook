# Dynamic Programming II: Grids, Strings and Intervals

You already know 1D/2D counting DP. This module is about the *shape* of the state, not the mechanics of memoization. Three big families live here: **grid DP** (walk a matrix), **two-sequence DP** (align two strings), and **interval DP** (solve a range by splitting it). Master the state definition for each and most OA "hard" DP problems collapse into templates.

---

## When to reach for this

- The input is a **grid/matrix** and you move in restricted directions (right/down, or 4-neighbours) — think "count paths" or "cheapest path".
- You have **two strings/arrays** and must compare, align, or edit one into the other (LCS, edit distance, matching). State = `(i, j)` prefixes.
- You care about **contiguous substrings** and a property like palindrome — the answer for `[i..j]` depends on the inner range `[i+1..j-1]`.
- The problem says "**split** the array/string optimally", "merge stones/balloons", "burst" — order of operations matters → **interval DP**, state `(i, j)`.
- You are asked for the **largest square/rectangle of 1s** in a binary matrix — the canonical matrix DP recurrence (Trilogy loves this one).

---

## Core idea and template

The whole game is: **define the state so the answer at a cell depends only on already-computed cells.** Pick the iteration order that respects those dependencies.

### Form A — Grid path DP (move right/down)

```cpp
// Min path sum from top-left to bottom-right (Unique Paths / Min Path Sum share this shape)
int minPathSum(vector<vector<int>>& g) {
    int m = g.size(), n = g[0].size();
    // dp[i][j] = best cost to REACH cell (i,j)
    vector<vector<int>> dp(m, vector<int>(n, 0));
    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++) {
            if (i == 0 && j == 0) dp[i][j] = g[0][0];          // start
            else {
                int up   = (i > 0) ? dp[i-1][j] : INT_MAX;      // came from above
                int left = (j > 0) ? dp[i][j-1] : INT_MAX;      // came from left
                dp[i][j] = g[i][j] + min(up, left);
            }
        }
    return dp[m-1][n-1];
    // For COUNTING paths: dp[i][j] = dp[i-1][j] + dp[i][j-1], base dp[0][0]=1.
    // Space: can compress to a single row (1D) since you only look up/left.
}
```

### Form B — Two-sequence DP (LCS skeleton)

```cpp
// Longest Common Subsequence — the parent of edit distance, min-delete, etc.
int lcs(const string& a, const string& b) {
    int m = a.size(), n = b.size();
    // dp[i][j] = LCS of a[0..i-1] and b[0..j-1]. Row/col 0 = empty prefix = 0.
    vector<vector<int>> dp(m+1, vector<int>(n+1, 0));
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++) {
            if (a[i-1] == b[j-1])
                dp[i][j] = 1 + dp[i-1][j-1];          // match: extend diagonal
            else
                dp[i][j] = max(dp[i-1][j], dp[i][j-1]); // skip one char
        }
    return dp[m][n];
}
```

### Form C — Interval DP (split a range)

```cpp
// Generic interval DP: answer(i,j) built from smaller ranges. Iterate by LENGTH.
int intervalDP(int n) {
    vector<vector<int>> dp(n, vector<int>(n, 0));
    for (int len = 2; len <= n; len++)          // grow interval length
        for (int i = 0; i + len - 1 < n; i++) { // left endpoint
            int j = i + len - 1;                 // right endpoint
            dp[i][j] = INT_MAX;                  // or 0, depends on problem
            for (int k = i; k < j; k++)          // split point / last op
                dp[i][j] = min(dp[i][j],
                               dp[i][k] + dp[k+1][j] + cost(i, k, j));
        }
    return dp[0][n-1];
}
```

**The one rule that ties them together:** figure out what smaller subproblem the answer decomposes into, then order your loops so those subproblems are ready. Grid → row-major. Two-seq → prefix order. Interval → by increasing length.

---

## Problem ladder

Work top to bottom. Don't skip the easy ones — they build the muscle memory for the state definition.

- [ ] [Unique Paths](https://leetcode.com/problems/unique-paths/) — Easy/Medium — grid counting DP, base case in the top row/left column.
- [ ] [Unique Paths II](https://leetcode.com/problems/unique-paths-ii/) — Medium — same, but obstacles force `dp=0`; edge case on the start cell.
- [ ] [Minimum Path Sum](https://leetcode.com/problems/minimum-path-sum/) — Medium — min instead of count; the Form A template verbatim.
- [ ] [Triangle](https://leetcode.com/problems/triangle/) — Medium — grid DP on a jagged triangle; bottom-up is cleanest.
- [ ] 🎯 [Maximal Square](https://leetcode.com/problems/maximal-square/) — Medium — the Trilogy STAR: min of three neighbours + 1. Memorize this.
- [ ] [Longest Common Subsequence](https://leetcode.com/problems/longest-common-subsequence/) — Medium — the parent two-sequence recurrence.
- [ ] [Edit Distance](https://leetcode.com/problems/edit-distance/) — Hard — insert/delete/replace; a classic Microsoft/Flipkart favourite.
- [ ] [Delete Operation for Two Strings](https://leetcode.com/problems/delete-operation-for-two-strings/) — Medium — LCS in disguise: `m + n - 2*LCS`.
- [ ] [Longest Palindromic Substring](https://leetcode.com/problems/longest-palindromic-substring/) — Medium — interval-style `dp[i][j]`; also expand-around-center.
- [ ] [Palindromic Substrings](https://leetcode.com/problems/palindromic-substrings/) — Medium — count instead of longest; same `dp[i][j]` boolean table.
- [ ] [Longest Palindromic Subsequence](https://leetcode.com/problems/longest-palindromic-subsequence/) — Medium — interval DP, or LCS of `s` and `reverse(s)`.
- [ ] [Maximal Rectangle](https://leetcode.com/problems/maximal-rectangle/) — Hard — matrix DP + histogram/stack; the tougher sibling of Maximal Square.
- [ ] [Burst Balloons](https://leetcode.com/problems/burst-balloons/) — Hard — the canonical "last operation" interval DP; genuinely hard, huge payoff.
- [ ] [Minimum Cost to Cut a Stick](https://leetcode.com/problems/minimum-cost-to-cut-a-stick/) — Hard — interval DP over cut positions; same skeleton as Burst Balloons.

---

## Deep dives: the ingenious ones

### 1. 🎯 Maximal Square — why "min of three neighbours"?

**Problem:** largest square of all-`1`s in a binary matrix, return its area.

**Naive:** for every cell try every square size and verify — O((mn) · min(m,n)²). Times out.

**The insight.** Define `dp[i][j]` = **side length of the largest all-1 square whose bottom-right corner is `(i,j)`**. That framing is the whole trick: anchoring the square at its bottom-right corner makes the recurrence local.

If `matrix[i][j] == 1`, a square of side `s` ending here exists only if squares of side `s-1` end at the three cells that share its border: directly **up**, directly **left**, and the **diagonal**. The largest square you can extend is limited by the *smallest* of those three:

```cpp
if (matrix[i][j] == '1')
    dp[i][j] = 1 + min({ dp[i-1][j], dp[i][j-1], dp[i-1][j-1] });
else
    dp[i][j] = 0;   // a 0 cell can be no square's corner
```

**Why `min` and not `max`?** A square is only as big as its weakest supporting corner. If up allows side 3 but the diagonal only allows side 1, the top-left region of your would-be 4×4 has a hole — you can only guarantee a 2×2. The `min` conservatively takes the largest side *all three* can support, and the `+1` adds the current cell.

Track the global max side as you fill; answer is `maxSide²`. **Time O(mn), space O(mn)** (compressible to O(n) with a rolling row + one diagonal temp).

```cpp
int maximalSquare(vector<vector<char>>& m) {
    int R = m.size(), C = m[0].size(), best = 0;
    vector<vector<int>> dp(R+1, vector<int>(C+1, 0)); // +1 border avoids i-1/j-1 checks
    for (int i = 1; i <= R; i++)
        for (int j = 1; j <= C; j++)
            if (m[i-1][j-1] == '1') {
                dp[i][j] = 1 + min({dp[i-1][j], dp[i][j-1], dp[i-1][j-1]});
                best = max(best, dp[i][j]);
            }
    return best * best;
}
```

### 2. Edit Distance — three edits, one diagonal

**Problem:** min insert/delete/replace operations to turn `a` into `b`.

**The insight.** Let `dp[i][j]` = edit distance between `a[0..i-1]` and `b[0..j-1]`. Consider the last characters:

- If `a[i-1] == b[j-1]`: they cost nothing, the problem reduces to `dp[i-1][j-1]`.
- Otherwise you must do exactly one of three things, then solve the rest:
  - **replace** `a[i-1]` → `b[j-1]`: `1 + dp[i-1][j-1]`
  - **delete** `a[i-1]`: `1 + dp[i-1][j]`
  - **insert** `b[j-1]` into `a`: `1 + dp[i][j-1]`

```cpp
if (a[i-1] == b[j-1]) dp[i][j] = dp[i-1][j-1];
else dp[i][j] = 1 + min({ dp[i-1][j-1],   // replace
                          dp[i-1][j],     // delete from a
                          dp[i][j-1] });  // insert into a
```

**Base cases are the trap:** `dp[i][0] = i` (delete all of `a`'s prefix), `dp[0][j] = j` (insert all of `b`'s prefix). Fill those before the double loop. **Time O(mn), space O(mn)** → O(n) rolling.

The mental model that makes it click: the DP grid is an alignment. Diagonal move = match-or-replace, down = delete, right = insert. Edit distance is the cheapest monotone path through that grid.

### 3. Palindromic Substrings — the `dp[i][j]` boolean table

**Problem:** count how many substrings are palindromes.

**Naive:** enumerate O(n²) substrings and check each in O(n) → O(n³).

**The insight.** `s[i..j]` is a palindrome iff `s[i] == s[j]` **and** the inside `s[i+1..j-1]` is already a palindrome. That inner range is *shorter*, so if we fill by increasing length (or iterate `i` downward and `j` upward), the dependency is always ready.

```cpp
int countSubstrings(string s) {
    int n = s.size(), cnt = 0;
    vector<vector<bool>> dp(n, vector<bool>(n, false));
    for (int i = n - 1; i >= 0; i--)          // i decreasing so i+1 is done
        for (int j = i; j < n; j++) {          // j increasing so j-1 is done
            if (s[i] == s[j] && (j - i < 2 || dp[i+1][j-1])) {
                dp[i][j] = true;               // len 0/1/2 need no inner check
                cnt++;
            }
        }
    return cnt;
}
```

**The subtle bit — `j - i < 2`:** single chars (`j==i`) and adjacent equal chars (`j-i==1`) are palindromes without consulting the inner cell, which would be out of range. Handle that short-circuit *before* reading `dp[i+1][j-1]`. This same table gives Longest Palindromic Substring (track the max `j-i+1` where `dp[i][j]` is true). **Time & space O(n²).**

### 4. Burst Balloons — think about the LAST balloon, not the first

**Problem:** balloons with values; bursting balloon `i` earns `nums[i-1] * nums[i] * nums[i+1]` (neighbours at burst time). Maximize total. Pad both ends with `1`.

**Why naive DP fails.** The obvious "which balloon to burst first" recursion breaks the array into two halves — but the halves aren't independent, because a burst in the left half changes the neighbours seen by the right half. The subproblems overlap in a way that isn't cleanly separable.

**The trick — reverse the question.** Instead of "which do I burst *first*", ask **"which balloon `k` do I burst *last* in the open interval `(i, j)`?"** If `k` is last in `(i, j)`, then when it pops, everything strictly between `i` and `j` is already gone, so its live neighbours are exactly `nums[i]` and `nums[j]` — the fixed boundaries. That decouples the two sides:

```cpp
// dp[i][j] = max coins bursting all balloons strictly between i and j (exclusive ends)
for (int len = 2; len <= n - 1; len++)          // distance between boundaries
    for (int i = 0; i + len <= n - 1; i++) {
        int j = i + len;
        for (int k = i + 1; k < j; k++)          // k = last balloon in (i,j)
            dp[i][j] = max(dp[i][j],
                dp[i][k] + dp[k][j]              // sub-intervals, already solved
                + nums[i] * nums[k] * nums[j]);  // k bursts against fixed i, j
    }
// answer: dp[0][n-1] over the padded array
```

Because `k` is burst *last*, `dp[i][k]` and `dp[k][j]` are fully independent — neither can affect the other's neighbours. That is the entire reason interval DP works here, and it's the reusable idea behind Minimum Cost to Cut a Stick and Matrix Chain Multiplication. **Time O(n³), space O(n²).**

---

## Pitfalls and interview tips

- **Off-by-one on prefix DP.** For two-sequence DP, `dp` has dimensions `(m+1) × (n+1)` and `dp[i][j]` refers to `a[i-1]`/`b[j-1]`. Mixing 0-indexed strings with 1-indexed DP is the #1 bug. Pick the `+1` padded convention and stay consistent.
- **Forgetting base rows/columns.** Edit distance needs `dp[i][0]=i`, `dp[0][j]=j`. Grid counting needs the first row/column seeded to 1 (or 0 past an obstacle). A wrong base case silently corrupts everything downstream.
- **Interval DP iteration order.** You MUST iterate by increasing length (or in an order that guarantees inner ranges are computed). A plain `for i for j` left-to-right will read uninitialized `dp[i][k]`/`dp[k][j]`. This is the most common interval-DP mistake.
- **Palindrome inner-range guard.** Always check `j - i < 2` before reading `dp[i+1][j-1]`, or you index out of bounds / read garbage for length-1 and length-2 substrings.
- **Maximal Square returns area, not side.** Return `side * side`. Easy to lose a test on this.
- **Space compression as a follow-up.** Grid and two-sequence DP only look at the previous row → interviewers love "can you do O(n) space?". Know that you keep a rolling 1D array, and for the diagonal term (LCS, edit distance) stash `dp[i-1][j-1]` in a temp *before* you overwrite it.
- **How to narrate.** Say it in this order: (1) "Let me define the state — `dp[i][j]` means…", (2) "the recurrence: from a smaller subproblem I get here by…", (3) "base cases are…", (4) "iteration order so dependencies are ready is…", (5) complexity. Stating the state clearly first signals seniority and stops you from coding a wrong recurrence.
- **Under time pressure**, always write the O(mn) 2D table first and get it correct; only compress space if there's time left. A correct O(mn) solution beats a buggy O(n) one in every OA.
- **Recognize disguises.** "Min deletions to make two strings equal" = `m + n - 2·LCS`. "Longest palindromic subsequence" = LCS of `s` and `reverse(s)`. Spotting that a problem reduces to LCS saves you from deriving a recurrence from scratch.
