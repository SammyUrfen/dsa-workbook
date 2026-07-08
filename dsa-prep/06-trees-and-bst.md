# Module 06 — Trees and BST

Trees are your strength — this module is about converting that comfort into **OA speed** and **pattern recognition**. Microsoft loves trees (STAR topic). The whole game is one idea: *most tree problems are a single DFS where every node returns a small packet of info to its parent.* Learn to see that packet and you solve 80% of tree problems on sight.

## When to reach for this

- The input is a **binary tree / BST** (`TreeNode*`), or a problem that is implicitly a tree (parent pointers, hierarchical/nested structure).
- You need something about **paths, depth, diameter, subtree properties, ancestors, or level-by-level** aggregation.
- Phrases like *"return the deepest / longest / kth / lowest common..."*, *"is this a valid / balanced / symmetric..."*, *"for each node compute..."* — all scream a single recursive DFS.
- **"Level order" / "row by row" / "zigzag" / "right side view"** → BFS with a queue.
- **"BST"** in the statement is a huge hint: the sorted-order (inorder) or the `left < root < right` invariant is almost always the trick.

## Core idea and template

There are exactly **two engines** you need, and one dominant *pattern* on top of DFS.

**1. DFS (recursion).** Pre/in/post-order differ only in *when* you touch the node relative to its children. The powerful pattern is **"return info up"**: each call returns a compact struct/value summarizing its subtree, and the parent combines its children's answers. Often you also carry a *global* variable that you update as you pass through each node (for diameter/max-path-sum style problems where the "best" answer isn't the value you return).

**2. BFS (queue).** For anything organized by *levels*.

```cpp
struct TreeNode {
    int val;
    TreeNode *left, *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

// ---------- DFS traversals: order = WHEN you visit `node` ----------
void dfs(TreeNode* node, vector<int>& out) {
    if (!node) return;
    // out.push_back(node->val);   // PRE-order:  node, left, right
    dfs(node->left, out);
    // out.push_back(node->val);   // IN-order:   left, node, right  (BST -> sorted!)
    dfs(node->right, out);
    // out.push_back(node->val);   // POST-order: left, right, node  (children before parent)
}

// ---------- THE pattern: return info up the recursion ----------
// Example packet: height of subtree, while updating a global answer (diameter).
int best = 0;
int height(TreeNode* node) {
    if (!node) return 0;                 // base case: empty subtree
    int L = height(node->left);          // ask left child for its info
    int R = height(node->right);         // ask right child for its info
    best = max(best, L + R);             // combine here: path through THIS node
    return 1 + max(L, R);                // return MY info to my parent
}

// ---------- BFS: level-order with a queue ----------
vector<vector<int>> levelOrder(TreeNode* root) {
    vector<vector<int>> res;
    if (!root) return res;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        int sz = q.size();               // freeze count: exactly this level
        vector<int> level;
        for (int i = 0; i < sz; ++i) {
            TreeNode* cur = q.front(); q.pop();
            level.push_back(cur->val);
            if (cur->left)  q.push(cur->left);
            if (cur->right) q.push(cur->right);
        }
        res.push_back(move(level));
    }
    return res;
}
```

**Mental checklist for any tree DFS:** (1) What is the base case (usually `nullptr`)? (2) What info does each subtree return to its parent? (3) How do I combine the two children's info? (4) Is the *answer I return* the same as the *answer I report*, or do I need a global? That last question separates height (return == report) from diameter/max-path (report via global, return partial).

## Problem ladder

Do these in order. The early ones cement the two engines; the middle ones drill "return info up"; the last few are the clever ones taught below.

- [ ] [Maximum Depth of Binary Tree](https://leetcode.com/problems/maximum-depth-of-binary-tree/) — Easy — the "hello world" of return-info-up; height in 3 lines.
- [ ] [Invert Binary Tree](https://leetcode.com/problems/invert-binary-tree/) — Easy — post-order structural mutation; swap children on the way up.
- [ ] [Same Tree](https://leetcode.com/problems/same-tree/) — Easy — parallel recursion over two trees at once.
- [ ] [Symmetric Tree](https://leetcode.com/problems/symmetric-tree/) — Easy — mirror recursion; compare (L.left,R.right) & (L.right,R.left).
- [ ] 🎯 [Balanced Binary Tree](https://leetcode.com/problems/balanced-binary-tree/) — Easy — return height AND balance flag in one pass (the -1 sentinel trick).
- [ ] 🎯 [Binary Tree Level Order Traversal](https://leetcode.com/problems/binary-tree-level-order-traversal/) — Medium — canonical BFS with the `sz = q.size()` level freeze.
- [ ] 🎯 [Binary Tree Right Side View](https://leetcode.com/problems/binary-tree-right-side-view/) — Medium — BFS, take last of each level (or DFS depth-first, right-first).
- [ ] 🎯 [Diameter of Binary Tree](https://leetcode.com/problems/diameter-of-binary-tree/) — Easy/Med — global-max while returning height; the report-vs-return distinction.
- [ ] 🎯 [Validate Binary Search Tree](https://leetcode.com/problems/validate-binary-search-tree/) — Medium — pass down (min,max) bounds; the classic wrong answer trap.
- [ ] 🎯 [Lowest Common Ancestor of a Binary Search Tree](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/) — Medium — exploit BST ordering to walk down without recursion.
- [ ] 🎯 [Lowest Common Ancestor of a Binary Tree](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/) — Medium — general LCA via "found-in-subtree" post-order signal.
- [ ] 🎯 [Kth Smallest Element in a BST](https://leetcode.com/problems/kth-smallest-element-in-a-bst/) — Medium — inorder gives sorted order; stop at the kth.
- [ ] [Construct Binary Tree from Preorder and Inorder Traversal](https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/) — Medium — preorder gives the root, inorder splits left/right subtrees.
- [ ] 🎯 [Binary Tree Maximum Path Sum](https://leetcode.com/problems/binary-tree-maximum-path-sum/) — Hard — the boss: global max path vs. the value you may return to a parent.
- [ ] [Serialize and Deserialize Binary Tree](https://leetcode.com/problems/serialize-and-deserialize-binary-tree/) — Hard — preorder with null markers; rebuild via a consumed cursor.

## Deep dives: the ingenious ones

### 1. Diameter of Binary Tree — the "report vs. return" split

**The trap:** the longest path in the tree may *not* pass through the root, and — crucially — a node cannot return "the longest path through me" to its parent, because a path that turns at a node (goes down-left then down-right) can't be extended upward. If you tried to return that, your parent would build an illegal path.

**The insight:** separate two quantities.
- What you **return** to your parent: the longest *downward* path from this node = `1 + max(L, R)`. This is extendable upward.
- What you **report** to the global answer: the longest path that *bends* at this node = `L + R` (edges). Every path in the tree bends at exactly one highest node, so checking `L + R` at every node covers all paths.

```cpp
int best = 0;
int depth(TreeNode* n) {
    if (!n) return 0;
    int L = depth(n->left), R = depth(n->right);
    best = max(best, L + R);   // REPORT: path bending here (counted in edges)
    return 1 + max(L, R);      // RETURN: one straight arm my parent can extend
}
// answer = best;  O(n) time, O(h) stack.
```

Once this clicks, **Binary Tree Maximum Path Sum** (below) is the same skeleton. This report-vs-return idea is the single most reused tree pattern in interviews.

### 2. Binary Tree Maximum Path Sum (Hard) — same skeleton, two twists

Values can be **negative**, and a "path" can start and end anywhere. Naively summing `L + node + R` and returning it fails for the same reason as diameter (can't return a bent path), *plus* a new subtlety: a negative subtree should be **dropped**, not included.

**Trick, step by step:**
1. From each child, get the best *downward* gain. If it's negative, clamp to 0 — better to attach nothing than to lose points: `int L = max(0, dfs(left));`.
2. **Report** the best "bent" path through this node: `L + node->val + R`. This is a complete candidate path.
3. **Return** the best straight arm your parent can extend: `node->val + max(L, R)`.

```cpp
int best = INT_MIN;
int gain(TreeNode* n) {
    if (!n) return 0;
    int L = max(0, gain(n->left));      // drop negative arms
    int R = max(0, gain(n->right));
    best = max(best, n->val + L + R);   // REPORT full path through n
    return n->val + max(L, R);          // RETURN extendable arm
}
```
`best` starts at `INT_MIN` (not 0) because the tree may be a single negative node and that lone node is a valid path. **O(n) / O(h).**

### 3. Validate BST — why "check children" is subtly wrong

**The naive bug (extremely common in interviews):** checking only `node->left->val < node->val < node->right->val` locally. This passes trees that are *not* BSTs — e.g. root 5, right child 6, and 6's left child 3. Locally each triple looks fine, but 3 sits in 5's right subtree so it violates the global rule `everything on the right of 5 must be > 5`.

**The fix — carry bounds down.** Each node is only valid inside an open interval `(low, high)` inherited from its ancestors. Going left tightens the upper bound to the node's value; going right tightens the lower bound.

```cpp
bool valid(TreeNode* n, long low, long high) {
    if (!n) return true;
    if (n->val <= low || n->val >= high) return false;
    return valid(n->left,  low, n->val)    // left subtree: max becomes n->val
        && valid(n->right, n->val, high);  // right subtree: min becomes n->val
}
// call: valid(root, LONG_MIN, LONG_MAX);
```
Use `long` (or `LONG_MIN/MAX`) because node values can be `INT_MIN/INT_MAX` and the bound comparison would otherwise false-fail. **Alternative:** an inorder traversal must be strictly increasing — track the previous value and fail if `cur <= prev`. Both are O(n); the bounds version is the one to explain first.

### 4. LCA in a Binary Tree (general) — the post-order "found signal"

No BST ordering here, so you can't just compare values. **Insight:** the LCA is the *deepest* node that has `p` in one subtree and `q` in the other (or *is* one of them with the other below it).

**How the recursion encodes it:** `dfs(node)` returns non-null if `p` or `q` is found in that subtree. At each node, look at what the two children report:
- Both children return non-null → this node is the split point → **this node is the LCA**.
- Only one child returns non-null → propagate that upward (the LCA, if any, is higher or is that returned node).

```cpp
TreeNode* lca(TreeNode* n, TreeNode* p, TreeNode* q) {
    if (!n || n == p || n == q) return n;    // found one, or dead end
    TreeNode* L = lca(n->left,  p, q);
    TreeNode* R = lca(n->right, p, q);
    if (L && R) return n;                     // p and q on opposite sides -> LCA
    return L ? L : R;                         // bubble up the single hit
}
```
It works in a single **O(n)** post-order pass with no parent pointers and no extra storage. For the **BST variant**, it's even easier: walk from the root, and if both `p,q < node` go left, if both `> node` go right, else you've found the split point — **O(h)** and no recursion needed.

## Pitfalls and interview tips

- **Null checks first.** `if (!node) return <base>;` is the first line of almost every tree function. Forgetting it is the #1 crash. Also handle the empty tree (`root == nullptr`) at the top level.
- **Edges vs. nodes.** Diameter/path-length problems: decide up front whether the answer counts *nodes* or *edges* and stay consistent (diameter on LeetCode = edges). Off-by-one here is the classic silent bug.
- **Report-vs-return.** When the best answer can *bend* at a node (diameter, max path sum), you need a **global** for the report and return only a straight, extendable arm. Say this out loud in the interview — it signals you understand the pattern, not just this problem.
- **BST = inorder is sorted.** Any "kth smallest", "validate", "find pair", "range sum" on a BST → think inorder or the `left<root<right` invariant *before* writing generic tree code. Interviewers plant "BST" specifically to see if you exploit it (O(h) instead of O(n)).
- **Integer bounds in Validate BST.** Use `long`/`LONG_MIN`/`LONG_MAX`, or a `TreeNode*` "previous" pointer for the inorder version, to survive `INT_MIN/INT_MAX` node values.
- **BFS level freeze.** Snapshot `int sz = q.size();` *before* the inner loop. Reading `q.size()` inside the loop mixes levels together.
- **Recursion depth.** A skewed tree gives O(n) stack depth. Fine for OA sizes; mention you *could* convert to an explicit stack if asked about a million-node degenerate tree.
- **Narrate the packet.** Best 20-second framing under time pressure: *"I'll do one DFS. Each node returns [X] to its parent; I combine the children with [Y]; and I track [global answer] as I go."* Fill in X/Y/global and you've essentially written the solution before touching the keyboard — exactly the speed Microsoft/Flipkart OAs reward.
- **Construct-from-traversal:** pass indices/ranges, not sliced vectors (slicing is O(n) per call → O(n²)). Use a hashmap from value → inorder index for O(1) splits.
