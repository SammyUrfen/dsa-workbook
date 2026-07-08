# Graphs I: Traversal and Union-Find

> The single most-tested OA topic for you. Microsoft loves graphs+DP, Flipkart loves DFS. If you get fast at exactly the templates below, you convert a whole class of "hard" problems into muscle memory. Target emoji 🎯 marks the OA-critical ones — drill those first.

## When to reach for this

- The input is a grid, a list of `edges`/`prerequisites`/`connections`, or "n nodes and relationships between them" — that's a graph even when the word "graph" never appears.
- You're asked for **reachability**, **connected components / number of islands / groups**, or "can you get from A to B".
- You need the **shortest number of steps** on an unweighted graph or grid → BFS (levels = distance). "Minimum moves", "fewest steps", "nearest".
- You must order tasks under **dependency constraints** ("finish course B before A", "build order") → topological sort.
- You repeatedly **merge sets** or ask "are these two in the same group?" as edges arrive → Union-Find (DSU).

## Core idea and template

A graph is just nodes + edges. 90% of the work is (1) build the adjacency list, (2) run BFS or DFS with a `visited` set so you never revisit. Everything else is a variation on those two.

**Adjacency list** — the default representation. `vector<vector<int>>` for `0..n-1` nodes.

```cpp
int n;                              // number of nodes
vector<vector<int>> adj(n);        // adj[u] = list of neighbors of u
for (auto& e : edges) {            // e = {u, v}
    adj[e[0]].push_back(e[1]);
    adj[e[1]].push_back(e[0]);     // OMIT this line if the graph is DIRECTED
}
```

**DFS (recursive)** — explore as deep as possible; great for components, cycle checks, backtracking-flavored graph work.

```cpp
vector<int> visited(n, 0);
function<void(int)> dfs = [&](int u) {
    visited[u] = 1;
    for (int v : adj[u])
        if (!visited[v]) dfs(v);
};
for (int i = 0; i < n; i++)         // handles disconnected graphs
    if (!visited[i]) dfs(i);        // each fresh start = one component
```

**BFS** — explore level by level; USE THIS when you need shortest distance in an unweighted graph.

```cpp
vector<int> dist(n, -1);            // -1 = unvisited; also serves as distance
queue<int> q;
q.push(src); dist[src] = 0;
while (!q.empty()) {
    int u = q.front(); q.pop();
    for (int v : adj[u]) {
        if (dist[v] == -1) {        // first time we reach v = shortest dist
            dist[v] = dist[u] + 1;
            q.push(v);
        }
    }
}
```

**Grid as implicit graph** — no adjacency list needed; neighbors are the 4 (or 8) adjacent cells. Memorize this direction-array idiom:

```cpp
int R = grid.size(), C = grid[0].size();
int dr[] = {-1, 1, 0, 0}, dc[] = {0, 0, -1, 1};   // up, down, left, right
// inside your loop, for cell (r, c):
for (int k = 0; k < 4; k++) {
    int nr = r + dr[k], nc = c + dc[k];
    if (nr < 0 || nr >= R || nc < 0 || nc >= C) continue;  // bounds first!
    // ... process (nr, nc)
}
```

**Multi-source BFS** — when many starting points spread simultaneously (rotting oranges, nearest 0). Push ALL sources into the queue at level 0, then run ordinary BFS. The level a cell is reached at = distance to its *nearest* source.

```cpp
queue<pair<int,int>> q;
for (all source cells) { q.push({r,c}); dist[r][c] = 0; }
// then the normal BFS loop — this computes nearest-source distance for every cell
```

**Topological sort — Kahn (BFS on indegrees).** Works only on a DAG; also detects cycles (if you can't output all n nodes, there's a cycle).

```cpp
vector<int> indeg(n, 0);
for (int u = 0; u < n; u++)
    for (int v : adj[u]) indeg[v]++;       // directed edge u -> v
queue<int> q;
for (int i = 0; i < n; i++) if (indeg[i] == 0) q.push(i);
vector<int> order;
while (!q.empty()) {
    int u = q.front(); q.pop();
    order.push_back(u);
    for (int v : adj[u])
        if (--indeg[v] == 0) q.push(v);
}
if (order.size() != n) { /* CYCLE — no valid ordering */ }
```

**Topological sort — DFS (post-order + reverse).**

```cpp
vector<int> visited(n, 0), order;
function<void(int)> dfs = [&](int u) {
    visited[u] = 1;
    for (int v : adj[u]) if (!visited[v]) dfs(v);
    order.push_back(u);                     // push AFTER children = post-order
};
for (int i = 0; i < n; i++) if (!visited[i]) dfs(i);
reverse(order.begin(), order.end());        // reverse post-order = topo order
```

**Union-Find / DSU** — near-constant time `find` and `union` with path compression + union by rank. The workhorse for "connected components as edges stream in".

```cpp
struct DSU {
    vector<int> parent, rank_;
    int components;
    DSU(int n) : parent(n), rank_(n, 0), components(n) {
        iota(parent.begin(), parent.end(), 0);   // each node is its own root
    }
    int find(int x) {                             // path compression
        if (parent[x] != x) parent[x] = find(parent[x]);
        return parent[x];
    }
    bool unite(int a, int b) {                    // returns false if already joined
        a = find(a); b = find(b);
        if (a == b) return false;                 // <-- detects a cycle / redundant edge
        if (rank_[a] < rank_[b]) swap(a, b);
        parent[b] = a;
        if (rank_[a] == rank_[b]) rank_[a]++;
        components--;
        return true;
    }
};
```

## Problem ladder

Do them in order. Don't skip the easy ones — they build the reflex of "grid = graph".

- [ ] 🎯 [Flood Fill](https://leetcode.com/problems/flood-fill/) — Easy — the simplest grid DFS/BFS; learn the direction-array idiom.
- [ ] 🎯 [Number of Islands](https://leetcode.com/problems/number-of-islands/) — Medium — count connected components in a grid; the canonical grid-DFS.
- [ ] [Max Area of Island](https://leetcode.com/problems/max-area-of-island/) — Medium — grid DFS returning a size; accumulate during traversal.
- [ ] 🎯 [Rotting Oranges](https://leetcode.com/problems/rotting-oranges/) — Medium — multi-source BFS; levels = minutes elapsed.
- [ ] [01 Matrix](https://leetcode.com/problems/01-matrix/) — Medium — multi-source BFS from all 0s; nearest-source distance.
- [ ] [Walls and Gates](https://leetcode.com/problems/walls-and-gates/) — Medium — multi-source BFS from every gate (premium; do if accessible).
- [ ] 🎯 [Clone Graph](https://leetcode.com/problems/clone-graph/) — Medium — DFS/BFS while building a hashmap old→new node.
- [ ] 🎯 [Course Schedule](https://leetcode.com/problems/course-schedule/) — Medium — cycle detection in a directed graph = topological sort feasibility.
- [ ] 🎯 [Course Schedule II](https://leetcode.com/problems/course-schedule-ii/) — Medium — return an actual topological order (Kahn or DFS).
- [ ] [Pacific Atlantic Water Flow](https://leetcode.com/problems/pacific-atlantic-water-flow/) — Medium — reverse the flow; BFS/DFS inward from both borders, intersect.
- [ ] [Surrounded Regions](https://leetcode.com/problems/surrounded-regions/) — Medium — mark border-connected regions first, flip the rest.
- [ ] 🎯 [Number of Connected Components in an Undirected Graph](https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/) — Medium — the textbook DSU problem (premium; else use Graph Valid Tree).
- [ ] 🎯 [Graph Valid Tree](https://leetcode.com/problems/graph-valid-tree/) — Medium — DSU: n-1 edges, no cycle, one component (premium).
- [ ] 🎯 [Redundant Connection](https://leetcode.com/problems/redundant-connection/) — Medium — DSU; the first edge that unites already-connected nodes is the answer.
- [ ] [Word Ladder](https://leetcode.com/problems/word-ladder/) — Hard — shortest transformation = BFS on an implicit word graph.

## Deep dives: the ingenious ones

### 1. Multi-source BFS — Rotting Oranges 🎯

**The problem.** A grid of oranges: 2 = rotten, 1 = fresh, 0 = empty. Each minute, every rotten orange rots its 4-adjacent fresh neighbors. Return minutes until none are fresh, or -1 if impossible.

**Why the naive approach fails.** Running a separate BFS from each rotten orange and taking the min per cell is `O(sources × cells)` and painful to combine. Simulating "scan the whole grid each minute" is `O(minutes × cells)` and easy to get wrong (you must not let an orange rotted *this* minute rot others in the *same* minute).

**The trick.** Seed the BFS queue with **all** rotten oranges at once, at distance/level 0. Then run one ordinary BFS. Because BFS expands strictly in level order, when a fresh orange is first dequeued-neighbor, the level it's reached at is exactly the minute it rots — measured from its *nearest* rotten source, all sources racing in parallel. The answer is the last level at which anything got rotted.

```cpp
int orangesRotting(vector<vector<int>>& g) {
    int R = g.size(), C = g[0].size(), fresh = 0, minutes = 0;
    queue<pair<int,int>> q;
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++) {
            if (g[r][c] == 2) q.push({r, c});   // ALL sources at level 0
            else if (g[r][c] == 1) fresh++;
        }
    int dr[] = {-1,1,0,0}, dc[] = {0,0,-1,1};
    while (!q.empty() && fresh > 0) {
        int sz = q.size();                       // process one whole level
        for (int i = 0; i < sz; i++) {
            auto [r, c] = q.front(); q.pop();
            for (int k = 0; k < 4; k++) {
                int nr = r+dr[k], nc = c+dc[k];
                if (nr<0||nr>=R||nc<0||nc>=C||g[nr][nc]!=1) continue;
                g[nr][nc] = 2;                    // rot it; mark visited in-place
                fresh--;
                q.push({nr, nc});
            }
        }
        minutes++;                               // one minute per level
    }
    return fresh == 0 ? minutes : -1;            // leftover fresh = unreachable
}
```

**Key detail:** advance `minutes` per *level* (the `sz` snapshot), not per cell. Track `fresh` so you both know when to stop and can return -1 for isolated oranges. **Time O(R·C), space O(R·C).**

### 2. Cycle detection via topological sort — Course Schedule 🎯

**The problem.** `numCourses` and `prerequisites[i] = [a, b]` meaning you must take `b` before `a`. Can you finish all courses? (II asks for the actual order.)

**Why it's really a graph problem.** Draw a directed edge `b → a` ("b unlocks a"). You can finish everything iff this directed graph has **no cycle** — a cycle means a group of courses each waiting on another forever.

**The Kahn insight.** A course with **indegree 0** has no unmet prerequisites → take it now. Taking it removes its outgoing edges, possibly dropping other courses to indegree 0. Keep peeling. If you manage to take all `n` courses, the graph was a DAG; if you get stuck with courses remaining but none at indegree 0, those form a cycle.

```cpp
bool canFinish(int n, vector<vector<int>>& pre) {
    vector<vector<int>> adj(n);
    vector<int> indeg(n, 0);
    for (auto& p : pre) { adj[p[1]].push_back(p[0]); indeg[p[0]]++; }  // b -> a
    queue<int> q;
    for (int i = 0; i < n; i++) if (indeg[i] == 0) q.push(i);
    int taken = 0;
    while (!q.empty()) {
        int u = q.front(); q.pop(); taken++;
        for (int v : adj[u]) if (--indeg[v] == 0) q.push(v);
    }
    return taken == n;                            // all taken => no cycle
}
```

For Course Schedule **II**, collect the popped nodes into an `order` vector and return it if `taken == n`, else return `{}`. That IS the build order — free once you have Kahn. **Time O(V+E), space O(V+E).**

**Alternative (DFS with 3 colors).** Directed cycle detection by DFS needs three states: 0=unvisited, 1=in current recursion stack, 2=done. Hitting a node in state 1 means a back-edge = cycle. A plain boolean `visited` is NOT enough for *directed* cycle detection — that catches only revisits, not back-edges. This distinction is a classic interview gotcha.

### 3. Reverse-the-flow trick — Pacific Atlantic Water Flow

**The problem.** Water on a cell flows to equal-or-lower neighbors. The Pacific touches the top+left borders, the Atlantic the bottom+right. Find all cells from which water can reach **both** oceans.

**Why the naive approach fails.** DFS *from every cell* asking "can I reach the Pacific? the Atlantic?" is `O((R·C)²)` in the worst case — for each of R·C cells you may traverse the whole grid.

**The trick — invert the question.** Instead of "which cells can reach the ocean", ask "which cells can the ocean reach if water flowed **uphill**?" Start a traversal from all Pacific-border cells and move only to neighbors with height **≥** current (reverse of the real rule). Every cell you touch can drain to the Pacific. Do the same from the Atlantic border. The answer is the **intersection** of the two reachable sets. That's two grid traversals: `O(R·C)` total.

```cpp
void bfsReach(vector<vector<int>>& h, queue<pair<int,int>>& q, vector<vector<bool>>& reach) {
    int R = h.size(), C = h[0].size();
    int dr[] = {-1,1,0,0}, dc[] = {0,0,-1,1};
    while (!q.empty()) {
        auto [r, c] = q.front(); q.pop();
        for (int k = 0; k < 4; k++) {
            int nr = r+dr[k], nc = c+dc[k];
            if (nr<0||nr>=R||nc<0||nc>=C||reach[nr][nc]) continue;
            if (h[nr][nc] < h[r][c]) continue;    // UPHILL only (reversed flow)
            reach[nr][nc] = true;
            q.push({nr, nc});
        }
    }
}
```

Seed one queue with the Pacific border, one with the Atlantic border, run each, then collect cells where both `reach` grids are true. The mental unlock — *swap the direction of the relation and start from the goal* — recurs across graph problems. **Time O(R·C), space O(R·C).**

### 4. DSU for the extra edge — Redundant Connection 🎯

**The problem.** A tree with n nodes has n-1 edges. You're given n edges (one extra) forming exactly one cycle. Return the edge that, if removed, makes it a tree — if several qualify, return the last one in input order.

**Why DSU nails it.** Process edges in order and `unite` their endpoints. A tree grows by always joining two *previously disconnected* components. The moment an edge tries to connect two nodes **already in the same component**, that edge closes the cycle — it's redundant. Because you scan in input order, the first such edge you hit is exactly the last-in-order answer the problem wants.

```cpp
vector<int> findRedundantConnection(vector<vector<int>>& edges) {
    int n = edges.size();
    DSU dsu(n + 1);                               // nodes are 1-indexed
    for (auto& e : edges)
        if (!dsu.unite(e[0], e[1]))               // unite returns false => same set
            return e;                             // this edge made the cycle
    return {};
}
```

The whole solution is the DSU template plus one `if`. That's the point: once DSU is in your fingers, a chunk of "hard" graph problems collapse to a few lines. **Time O(n·α(n)) ≈ O(n), space O(n).** (`α` is the inverse-Ackermann function — effectively a small constant.)

## Pitfalls and interview tips

**Bugs that cost you the OA:**
- **Forgetting `visited` / marking too late.** In BFS, mark a node visited *when you push it*, not when you pop it — otherwise it gets enqueued many times and you TLE or loop forever. (Using `dist[v] == -1` as the visited check handles this cleanly.)
- **Bounds check order.** Test `nr/nc` in-range *before* indexing `grid[nr][nc]` — reversing that is an out-of-bounds crash.
- **Directed vs undirected.** Add both `adj[u].push_back(v)` and `adj[v].push_back(u)` only for undirected graphs. For prerequisites/dependencies it's directed — add one direction, and be deliberate about which way the edge points (`b → a` means "b before a").
- **Plain boolean visited can't detect a directed cycle.** Use indegrees (Kahn) or the 3-color DFS. A boolean set only detects *any* revisit, which is normal in a DAG.
- **Recursion depth.** DFS on a grid up to ~10⁶ cells can blow the stack. If bounds are large, prefer the **iterative BFS** template.
- **DSU without path compression + union by rank** degrades to O(n) per op and can TLE. Keep both optimizations in the struct — copy it verbatim.
- **Off-by-one in level counting.** For "minimum steps" via BFS, increment the counter once per *level* (snapshot `q.size()`), not once per node.

**Edge cases to say out loud:** empty grid / zero nodes; a single node; disconnected graph (your outer `for` loop over all nodes must exist); self-loops and duplicate edges; already-fully-connected input; unreachable targets (return -1 or leave `dist == -1`).

**How to narrate in an interview (do this every time):**
1. "This is a graph — nodes are ___, edges mean ___." Name the model explicitly; interviewers grade this.
2. "I need shortest steps on an unweighted graph, so BFS" — or — "I just need reachability/components, so DFS." Justify the choice in one sentence.
3. State complexity up front: almost all of these are **O(V + E)** time and space; for a grid, V = R·C and E ≈ 4·R·C, so **O(R·C)**.
4. Build the adjacency list out loud, then write the template you've memorized. Mention `visited` before you write the loop — signals you won't infinite-loop.
5. If dependencies/ordering appear, say "topological sort, and I'll use Kahn's indegree method which also detects cycles for free." That one sentence lands the whole class of problems.
