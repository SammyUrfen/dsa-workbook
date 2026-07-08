# 09 — Backtracking

Backtracking = DFS over a tree of partial solutions. You build a candidate incrementally, and the moment a partial candidate can't possibly lead to a valid answer, you *undo the last choice* (backtrack) and try the next one. It's brute force with a rewind button and (usually) pruning.

## When to reach for this
- The problem asks you to **enumerate / list all** valid configurations: "return all subsets", "all permutations", "all combinations that sum to X", "all valid placements".
- The answer is a **sequence of choices** where each step picks from a small set of options (include/exclude an element, place a queen in a column, pick the next character).
- Constraints are **small** (n ≤ ~20 for subsets/perms, board ≤ ~10×10) — a signal that exponential search is intended.
- You need to **count** or find *one* valid arrangement under combinatorial constraints and there's no clean greedy/DP formula.
- Keyword tells: "all possible", "generate", "every way", "return all combinations", "does a path exist".

## Core idea and template
The universal shape: a recursive `backtrack(state)` that

1. checks a **base case** (record a full solution), then
2. loops over **choices**, and for each choice: **make it → recurse → undo it**.

The undo step is what makes it backtracking. Master these three templates and you can adapt 90% of problems.

```cpp
// ---------- TEMPLATE 1: SUBSETS (include/exclude, order doesn't matter) ----------
// For each element you decide to take it or not. 2^n leaves.
void subsets(int i, vector<int>& nums, vector<int>& cur, vector<vector<int>>& res) {
    if (i == (int)nums.size()) {           // decided every element
        res.push_back(cur);                // every node/leaf is a valid subset
        return;
    }
    cur.push_back(nums[i]);                 // choice: take nums[i]
    subsets(i + 1, nums, cur, res);
    cur.pop_back();                         // UNDO
    subsets(i + 1, nums, cur, res);         // choice: skip nums[i]
}

// ---------- TEMPLATE 2: COMBINATIONS / COMBINATION-SUM (start index avoids dups) ----------
// Use a `start` index so you never reuse earlier elements -> combinations, not permutations.
void combine(int start, vector<int>& nums, vector<int>& cur, vector<vector<int>>& res) {
    res.push_back(cur);                     // record current combination (if every prefix is valid)
    for (int i = start; i < (int)nums.size(); ++i) {
        cur.push_back(nums[i]);             // choose nums[i]
        combine(i + 1, nums, cur, res);     // i+1 => can't reuse; i => allow reuse (combination sum)
        cur.pop_back();                     // UNDO
    }
}

// ---------- TEMPLATE 3: PERMUTATIONS (order matters, track used) ----------
void permute(vector<int>& nums, vector<bool>& used,
             vector<int>& cur, vector<vector<int>>& res) {
    if (cur.size() == nums.size()) { res.push_back(cur); return; }
    for (int i = 0; i < (int)nums.size(); ++i) {
        if (used[i]) continue;              // pruning: skip already-placed elements
        used[i] = true; cur.push_back(nums[i]);
        permute(nums, used, cur, res);
        cur.pop_back(); used[i] = false;    // UNDO both
    }
}
```

**Handling duplicates** (e.g. Subsets II / Permutations II): sort first, then inside the loop skip a value equal to its predecessor at the *same tree depth*:
```cpp
sort(nums.begin(), nums.end());
for (int i = start; i < n; ++i) {
    if (i > start && nums[i] == nums[i-1]) continue; // skip dup siblings
    ...
}
```

## Problem ladder
Work top to bottom. 🎯 = OA-critical (Flipkart-style subsets / target-sum), do these cold.

- [ ] 🎯 [Subsets](https://leetcode.com/problems/subsets/) — Medium — the canonical include/exclude template (Template 1 & 2).
- [ ] [Combinations](https://leetcode.com/problems/combinations/) — Medium — pick k of n; drills the `start` index.
- [ ] 🎯 [Combination Sum](https://leetcode.com/problems/combination-sum/) — Medium — reuse allowed (recurse with `i`, not `i+1`); target pruning.
- [ ] [Combination Sum II](https://leetcode.com/problems/combination-sum-ii/) — Medium — each number once + skip duplicate siblings.
- [ ] 🎯 [Permutations](https://leetcode.com/problems/permutations/) — Medium — `used[]` array, order matters (Template 3).
- [ ] [Permutations II](https://leetcode.com/problems/permutations-ii/) — Medium — permutations with duplicates; the trickiest dedup rule.
- [ ] [Subsets II](https://leetcode.com/problems/subsets-ii/) — Medium — subsets + sort-and-skip-dup pattern.
- [ ] [Letter Combinations of a Phone Number](https://leetcode.com/problems/letter-combinations-of-a-phone-number/) — Medium — map digits to letters, branch per digit.
- [ ] [Generate Parentheses](https://leetcode.com/problems/generate-parentheses/) — Medium — prune with open/close counts instead of generating-then-filtering.
- [ ] [Palindrome Partitioning](https://leetcode.com/problems/palindrome-partitioning/) — Medium — partition-point choices + palindrome check.
- [ ] [Word Search](https://leetcode.com/problems/word-search/) — Medium — DFS on a grid, mark/unmark visited cells.
- [ ] [N-Queens](https://leetcode.com/problems/n-queens/) — Hard — column/diagonal constraint sets; classic pruning.
- [ ] [Sudoku Solver](https://leetcode.com/problems/sudoku-solver/) — Hard — constraint propagation on a 9×9 grid.
- [ ] [Word Search II](https://leetcode.com/problems/word-search-ii/) — Hard — backtracking + Trie to prune many words at once.

## Deep dives: the ingenious ones

### 1. Combination Sum — why reuse works and how to prune (🎯 OA-critical)
**Problem:** given distinct candidates and a target, return all combinations (each candidate usable unlimited times) summing to target.

**Naive fail:** if you loop from index 0 every level, you'll generate `[2,3]` and `[3,2]` as different results — permutations, not combinations — and blow up with duplicates. The fix is the **start index**: at each recursion you may only pick candidates from index `i` onward. That enforces non-decreasing selection order, so each *set* is produced exactly once.

**The reuse trick:** to allow using a number again, recurse with the **same index `i`** (not `i+1`). Using `i` = "I can pick this one more time"; using `i+1` = "move on."

```cpp
void dfs(int start, int target, vector<int>& c, vector<int>& cur, vector<vector<int>>& res) {
    if (target == 0) { res.push_back(cur); return; }
    for (int i = start; i < (int)c.size(); ++i) {
        if (c[i] > target) break;      // PRUNE: sorted candidates -> the rest are larger too
        cur.push_back(c[i]);
        dfs(i, target - c[i], c, cur, res);  // `i` (not i+1) => reuse allowed
        cur.pop_back();                       // UNDO
    }
}
// caller: sort(c); dfs(0, target, c, cur, res);
```
The `break` after sorting is the key optimization: once `c[i] > target`, every later (larger) candidate is hopeless, so you cut the whole tail. **Complexity:** worst case O(N^(T/M)) nodes where T = target, M = smallest candidate (branching by how many ways to reach the target); space O(T/M) recursion depth.

### 2. Permutations II — deduping siblings correctly
**Problem:** permutations of an array **with duplicates**, no repeated permutations.

**Naive fail:** generate all `n!` permutations and stuff them in a `set`. Works but wasteful, and interviewers want the pruning. The subtle part: with duplicates you must skip a value only when its identical predecessor **hasn't been used at this level**.

**The insight:** sort so equal values are adjacent. When you're about to place `nums[i]`, if `nums[i] == nums[i-1]` and `used[i-1]` is *false*, it means the previous identical value was already backtracked (undone) at this same depth — so choosing `nums[i]` now would regenerate an identical branch. Skip it.

```cpp
sort(nums.begin(), nums.end());
void dfs(vector<int>& nums, vector<bool>& used, vector<int>& cur, vector<vector<int>>& res) {
    if (cur.size() == nums.size()) { res.push_back(cur); return; }
    for (int i = 0; i < (int)nums.size(); ++i) {
        if (used[i]) continue;
        if (i > 0 && nums[i] == nums[i-1] && !used[i-1]) continue; // key dedup line
        used[i] = true; cur.push_back(nums[i]);
        dfs(nums, used, cur, res);
        cur.pop_back(); used[i] = false;
    }
}
```
Why `!used[i-1]` and not `used[i-1]`? If `used[i-1]` is *true*, the duplicate before us is part of the *current* prefix — a legitimately different position — so we're allowed to use `nums[i]`. Only when the predecessor is free (unused at this level) is picking us a redundant sibling. **Complexity:** O(n · n!) worst case, far fewer with duplicates.

### 3. Word Search — DFS with in-place visited marking
**Problem:** does `word` exist in the grid via 4-directionally adjacent, non-reused cells?

**Naive fail:** a separate `visited` boolean matrix works but costs O(mn) extra memory and is easy to desync on backtrack. The elegant trick: **mutate the board itself** as your visited marker, then restore it on the way out.

```cpp
bool dfs(vector<vector<char>>& b, int r, int c, const string& w, int k) {
    if (k == (int)w.size()) return true;                 // matched all chars
    if (r < 0 || c < 0 || r >= (int)b.size() || c >= (int)b[0].size()) return false;
    if (b[r][c] != w[k]) return false;                   // mismatch or already-visited sentinel

    char tmp = b[r][c];
    b[r][c] = '#';                                        // mark visited in place
    bool found = dfs(b,r+1,c,w,k+1) || dfs(b,r-1,c,w,k+1)
              || dfs(b,r,c+1,w,k+1) || dfs(b,r,c-1,w,k+1);
    b[r][c] = tmp;                                        // UNDO — restore the char
    return found;
}
```
The `'#'` sentinel does double duty: it fails the `b[r][c] != w[k]` check so you never step on your own path, and restoring it lets other search paths reuse the cell. **Complexity:** O(m·n·4^L) where L = word length (each start cell branches 4 ways up to depth L); O(L) recursion space.

### 4. N-Queens — O(1) constraint checking with diagonal sets
**Problem:** place n queens on n×n so none attack each other.

**Naive fail:** for each candidate cell, scan the whole board/column/diagonals to check safety → O(n) per check, and messy. The clever encoding: place **one queen per row**, and track three sets — occupied **columns**, occupied **"↘" diagonals** (`row - col`, add n to keep it non-negative), and occupied **"↙" diagonals** (`row + col`). Every cell on the same ↘ diagonal shares `row - col`; every cell on the same ↙ diagonal shares `row + col`. So safety is an **O(1) set lookup**.

```cpp
int n; vector<bool> col, diag1 /*row+col*/, diag2 /*row-col+n*/; int count = 0;
void solve(int row) {
    if (row == n) { ++count; return; }        // placed all rows
    for (int c = 0; c < n; ++c) {
        if (col[c] || diag1[row+c] || diag2[row-c+n]) continue;   // O(1) attack check
        col[c] = diag1[row+c] = diag2[row-c+n] = true;            // place
        solve(row + 1);
        col[c] = diag1[row+c] = diag2[row-c+n] = false;           // UNDO
    }
}
```
Placing one queen per row automatically handles the row constraint (no set needed). The diagonal-index math is the whole trick — internalize `row+col` and `row-col`. **Complexity:** roughly O(n!) branches (each row prunes columns), O(n) space.

## Pitfalls and interview tips
- **Forgetting to undo.** Every `push_back` / `used[i]=true` / board mutation needs a matching pop/reset *after* the recursive call. A missing `pop_back()` corrupts every subsequent branch — the #1 backtracking bug.
- **Pushing a shared reference.** `res.push_back(cur)` copies the vector — good. But if you store pointers/iterators into `cur`, they'll dangle. Always record a *copy* of the current state.
- **`i+1` vs `i` vs `start`.** `i+1` = each element once (combinations); `i` = reuse allowed (combination sum); loop from `0` with `used[]` = permutations. Mixing these up silently produces wrong-shaped output.
- **Dedup at the wrong level.** The `if (i > start && nums[i]==nums[i-1]) continue` guard must compare against `start` (siblings), not `0` — otherwise you drop valid combinations.
- **Prune early, prune hard.** Sort candidates and `break`/`return` the moment the partial sum exceeds target, an invalid cell is hit, or remaining elements can't reach the goal. In timed OAs, pruning is often the difference between AC and TLE.
- **Base case placement.** For subsets, *every* node is an answer (record before the loop); for permutations, only *full-length* leaves count. Decide which and be explicit.
- **Passing big containers by value.** Take `vector`/`string` state by **reference** (`&`) and mutate-then-restore; copying at every level turns O(2^n) into something much worse.
- **How to narrate it:** say out loud — "This is enumerate-all with small n, so backtracking. My state is `cur`, my choices at each step are `<X>`, my base case is `<Y>`, and I'll prune when `<Z>`." Then write the make→recurse→undo skeleton first and fill in choices. Stating the state/choice/base-case/prune structure up front signals you *recognize the pattern* rather than groping for it — exactly what the pattern-recognition-focused OAs reward.
