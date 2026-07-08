# Module 07 — Tries (Prefix Trees)

You already have some Trie reps, so this module is about locking in a **bug-free template you can type from muscle memory** and mastering the two clever variants that show up in harder OAs: **word-search on a board** and the **XOR-trie**. A target emoji marks OA-critical problems.

---

## When to reach for this

- The problem talks about **prefixes**, **"starts with"**, **dictionary/word lookup**, or **auto-complete**. That word "prefix" is the loudest tell.
- You must query **many strings against a fixed set of words** — a Trie amortizes the shared prefixes so lookups are O(word length), independent of how many words are stored.
- You're doing **DFS on a grid while matching words** (Word Search II) — a Trie lets you prune all words at once instead of searching per-word.
- Anything involving **maximizing/minimizing XOR of pairs**, or bitwise greedy decisions — build a **binary trie over the bits** of each number.
- Not a Trie signal: single-string matching (use KMP/Z), or when a `unordered_set`/`unordered_map` of whole words is enough and prefixes never matter.

---

## Core idea and template

A Trie is a tree where **each edge is a character** and each root-to-node path spells a prefix. Children are stored in a fixed array (`26` for lowercase) or a hash map (for large/unknown alphabets). A boolean `isEnd` marks where a real word terminates.

### Standard lowercase-letter Trie

```cpp
struct TrieNode {
    TrieNode* child[26] = {};   // child[c] == nullptr means no edge for letter c
    bool isEnd = false;         // true if a word ends exactly here
    // Optional extras used by harder problems:
    // int passCount = 0;       // how many words pass through this node (prefix count)
    // int endCount  = 0;       // how many words end here (for duplicates)
};

struct Trie {
    TrieNode* root = new TrieNode();

    void insert(const string& w) {
        TrieNode* cur = root;
        for (char ch : w) {
            int c = ch - 'a';
            if (!cur->child[c]) cur->child[c] = new TrieNode();
            cur = cur->child[c];
            // cur->passCount++;   // if you need prefix counts
        }
        cur->isEnd = true;
    }

    // exact word present?
    bool search(const string& w) {
        TrieNode* cur = walk(w);
        return cur && cur->isEnd;
    }

    // any word with this prefix?
    bool startsWith(const string& p) {
        return walk(p) != nullptr;
    }

private:
    // follow the path for s; return the node it ends at, or nullptr if it breaks
    TrieNode* walk(const string& s) {
        TrieNode* cur = root;
        for (char ch : s) {
            int c = ch - 'a';
            if (!cur->child[c]) return nullptr;
            cur = cur->child[c];
        }
        return cur;
    }
};
```

**Complexity.** `insert`/`search`/`startsWith` are all **O(L)** where L is the word length — the alphabet size is a constant factor, not part of the input. Space is O(total characters inserted × alphabet) worst case.

### Binary (bit) Trie — for XOR problems

```cpp
struct BitTrie {
    BitTrie* child[2] = {};     // child[0] and child[1] for bit 0 / bit 1
};

const int BITS = 30;            // enough for values < ~1e9; use 31/32 for larger

void insert(BitTrie* root, int x) {
    BitTrie* cur = root;
    for (int b = BITS; b >= 0; --b) {           // MOST significant bit first
        int bit = (x >> b) & 1;
        if (!cur->child[bit]) cur->child[bit] = new BitTrie();
        cur = cur->child[bit];
    }
}

// max XOR of x with any number already inserted
int queryMaxXor(BitTrie* root, int x) {
    BitTrie* cur = root;
    int res = 0;
    for (int b = BITS; b >= 0; --b) {
        int bit = (x >> b) & 1;
        int want = bit ^ 1;                     // greedily try the OPPOSITE bit
        if (cur->child[want]) { res |= (1 << b); cur = cur->child[want]; }
        else                    cur = cur->child[bit];
    }
    return res;
}
```

---

## Problem ladder

Work top to bottom. The first two build the template; the middle drills variants; the last few are the "make it click" problems.

- [ ] 🎯 [Implement Trie (Prefix Tree)](https://leetcode.com/problems/implement-trie-prefix-tree/) — Medium — the canonical insert/search/startsWith; type it until it's automatic.
- [ ] [Implement Trie II (Prefix Tree)](https://leetcode.com/problems/implement-trie-ii-prefix-tree/) — Medium — add `countWordsEqualTo` / `countWordsStartingWith` and `erase`; teaches pass/end counters.
- [ ] [Longest Common Prefix](https://leetcode.com/problems/longest-common-prefix/) — Easy — solvable without a Trie, but do it *with* one to see prefixes as paths.
- [ ] 🎯 [Design Add and Search Words Data Structure](https://leetcode.com/problems/design-add-and-search-words-data-structure/) — Medium — Trie + DFS to handle the `.` wildcard; branch over all 26 children.
- [ ] [Replace Words](https://leetcode.com/problems/replace-words/) — Medium — insert roots, then for each word walk until the first `isEnd`; shortest-root matching.
- [ ] [Map Sum Pairs](https://leetcode.com/problems/map-sum-pairs/) — Medium — store values on nodes, sum over a prefix subtree.
- [ ] [Search Suggestions System](https://leetcode.com/problems/search-suggestions-system/) — Medium — after each prefix char, DFS for the 3 lexicographically smallest words.
- [ ] [Word Break](https://leetcode.com/problems/word-break/) — Medium — DP that pairs beautifully with a Trie to test dictionary prefixes fast.
- [ ] [Longest Word in Dictionary](https://leetcode.com/problems/longest-word-in-dictionary/) — Medium — a word is buildable only if every prefix is also a word; DFS over `isEnd` chain.
- [ ] 🎯 [Maximum XOR of Two Numbers in an Array](https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/) — Medium — the flagship binary-trie greedy; insert then query max-xor.
- [ ] 🎯 [Word Search II](https://leetcode.com/problems/word-search-ii/) — Hard — Trie + grid backtracking with pruning; the single most important Trie problem for OAs.
- [ ] [Concatenated Words](https://leetcode.com/problems/concatenated-words/) — Hard — Trie + DP: a word is concatenated if it splits into other dictionary words.
- [ ] [Palindrome Pairs](https://leetcode.com/problems/palindrome-pairs/) — Hard — reversed-word Trie plus palindrome checks on remainders; genuinely tricky.
- [ ] [Maximum XOR With an Element From Array](https://leetcode.com/problems/maximum-xor-with-an-element-from-array/) — Hard — offline queries: sort by limit, insert into bit-trie as the limit grows.

---

## Deep dives: the ingenious ones

### 1. Word Search II — one Trie, one DFS, prune everything at once 🎯

**The problem.** Given a board of letters and a list of words, return every word that can be traced through adjacent cells (no cell reused within a word).

**Why the naive approach dies.** Run Word Search I once per word: for `W` words each doing a full board DFS, you pay `O(W × cells × 4^maxLen)`. With hundreds of words this is hopeless — and you redo the *same* board exploration for words sharing a prefix.

**The insight.** Flip it around. Instead of "for each word, search the board," do **one DFS over the board, walking the Trie in lockstep.** The Trie merges all shared prefixes, so exploring a board path checks *all* words with that prefix simultaneously. The moment the current board letter has no matching Trie child, you stop — that one check prunes an entire family of words.

**The trick, step by step.**
1. Insert all words into a Trie. Store the **full word on the terminal node** (`node->word`) so you don't have to reconstruct it.
2. DFS from every cell, carrying the current Trie node. Move to a neighbor only if `node->child[letter]` exists.
3. When you land on a node with `node->word` non-empty, record it and **clear it** (`node->word = ""`) to dedupe automatically.
4. Mark cells visited by temporarily overwriting the board char with `#`, then restore on backtrack.
5. Optional but powerful: after collecting a word, **prune leaf Trie nodes** with no children so future paths die even faster.

```cpp
void dfs(vector<vector<char>>& b, int i, int j, TrieNode* node, vector<string>& out) {
    char ch = b[i][j];
    if (ch == '#' || !node->child[ch - 'a']) return;   // wall or no matching word
    node = node->child[ch - 'a'];
    if (!node->word.empty()) {                          // found a whole word
        out.push_back(node->word);
        node->word.clear();                             // dedupe: never emit twice
    }
    b[i][j] = '#';                                      // mark visited
    int dx[] = {0,0,1,-1}, dy[] = {1,-1,0,0};
    for (int d = 0; d < 4; ++d) {
        int ni = i + dx[d], nj = j + dy[d];
        if (ni >= 0 && ni < b.size() && nj >= 0 && nj < b[0].size())
            dfs(b, ni, nj, node, out);
    }
    b[i][j] = ch;                                       // restore (backtrack)
}
```

**Complexity.** Roughly `O(cells × 4 × 3^(maxLen-1))` in the worst case — but the Trie pruning makes it far faster in practice because dead prefixes are cut instantly. Space is O(total letters in all words) for the Trie.

---

### 2. Maximum XOR of Two Numbers — greedy on a bit trie 🎯

**The problem.** Find `max(a XOR b)` over all pairs in an array.

**Why the naive approach dies.** All pairs is `O(n²)` — fine for n=2000, but OAs push `n` to 2×10⁵, where n² is 4×10¹⁰. Dead.

**The insight.** XOR is decided **bit by bit, most-significant first**. To maximize `a XOR b`, at each bit you want the two numbers to **differ** — a differing bit contributes `2^b`, and a higher bit outweighs everything below it combined. So a greedy "grab the opposite bit if it exists" is *provably optimal*.

**The trick.**
1. Insert every number into a binary trie, MSB → LSB (fixed depth, e.g. 30 bits).
2. For each number `x`, walk down the trie. At bit `b`, you'd love to go to the child holding the **opposite** of `x`'s bit — that guarantees a set bit in the result. If that child exists, take it and OR `2^b` into the answer; otherwise you're forced down the same-bit child.
3. The best answer over all `x` is the max XOR pair.

Why greedy is safe: because you process bits high-to-low, securing a higher bit is always worth more than any combination of lower bits, so you never regret grabbing the opposite bit when available. (Crux code is `queryMaxXor` in the template above.)

**Complexity.** `O(n × BITS)` — about `n × 30`, linear-ish. Space `O(n × BITS)` for the trie nodes.

**The Hard variant (Maximum XOR With an Element From Array):** each query `(x, limit)` asks for max XOR using only elements `≤ limit`. Trick: **sort queries by limit and array by value**, then insert numbers into the trie only as the limit sweep passes them. This "offline + monotonic pointer" turns per-query filtering into one linear pass — a pattern worth recognizing on its own.

---

### 3. Design Add and Search Words — wildcard DFS through a Trie 🎯

**The problem.** Support `addWord` and `search`, where a search string may contain `.` matching any single letter.

**Why it's tricky.** A plain `walk` breaks the instant you hit `.` because you don't know which child to follow. You need to explore **all** possibilities — but only for the wildcard positions, so a pure hashset of words won't do.

**The trick.** Search recursively. On a normal character, descend the single matching child (fail fast if absent). On `.`, **branch into every non-null child** and recurse; succeed if any branch matches. The Trie keeps this cheap because most branches are absent.

```cpp
bool dfs(TrieNode* node, const string& w, int i) {
    if (!node) return false;
    if (i == w.size()) return node->isEnd;
    char ch = w[i];
    if (ch == '.') {                             // wildcard: try every child
        for (int c = 0; c < 26; ++c)
            if (node->child[c] && dfs(node->child[c], w, i + 1)) return true;
        return false;
    }
    return dfs(node->child[ch - 'a'], w, i + 1); // fixed letter: one path
}
```

**Complexity.** No-wildcard search is `O(L)`. Worst case (all dots) is `O(26^L)`, but real inputs branch rarely so it's fast in practice. Space is the Trie size.

---

### 4. Concatenated Words — Trie + DP over splits

**The insight.** A word is "concatenated" if it can be cut into two or more *other* dictionary words. Process words shortest-first (a concatenated word is always longer than its parts) and, for each word, run a DP: `dp[k] = true` if the prefix of length `k` splits into dictionary words. Use the Trie to test, from each position, which continuations are valid words — so you don't re-scan with substrings and a hashset. `dp[0] = true`; the word qualifies if `dp[len]` is reachable using **at least two** pieces.

**Why the Trie helps.** From position `i`, one downward walk enumerates *all* dictionary words starting at `i` in a single pass, instead of hashing every substring `s[i..j]`.

**Complexity.** About `O(n × L²)` for the DP with `n` words of length up to `L`; the Trie replaces the substring hashing constant with a cleaner O(L) walk per start index.

---

## Pitfalls and interview tips

- **Off-by-one on `isEnd`.** `search("app")` must return false if you only inserted `"apple"`. `startsWith` returns true; `search` needs `isEnd`. Test both explicitly.
- **`char - 'a'` assumes lowercase.** Confirm the alphabet. Uppercase, digits, or mixed → use a wider array or a `unordered_map<char, TrieNode*>`. State this assumption out loud in interviews.
- **Empty string / empty word list.** Decide whether `""` is insertable (it just sets `root->isEnd`). Handle before you loop.
- **XOR trie: MSB-first, fixed width.** If you iterate bits LSB-first the greedy is wrong. Pick a bit width that covers the max value (30 bits for < ~10⁹; use 31–32 and beware sign bits for full 32-bit ints).
- **Word Search II: restore the cell and dedupe.** Forgetting to reset `board[i][j]` corrupts later DFS; forgetting to clear `node->word` emits duplicates. Both are the classic bugs.
- **Memory in C++.** `new`-ing nodes leaks unless you free them — usually fine for an OA, but if asked, mention a destructor that DFS-deletes children, or use `unique_ptr`.
- **Don't build a Trie when a `unordered_set` suffices.** If prefixes never matter, a hashset of whole words is simpler and just as fast — reaching for a Trie needlessly is a small red flag.
- **How to narrate.** "The keyword is *prefix*, so I'll use a Trie: insert is O(word length), and I walk the tree to answer prefix queries. For the board problem I'll walk the Trie and the grid together so shared prefixes are checked once, and prune dead branches." Naming the pattern and its complexity up front signals you've seen it before.
