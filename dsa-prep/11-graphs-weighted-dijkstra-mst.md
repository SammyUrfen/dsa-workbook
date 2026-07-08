# Graphs II: Weighted Graphs — Dijkstra, Bellman-Ford, MST

*Module 11 — Bibek's DSA interview prep. Prereqs: adjacency lists, BFS/DFS, and `priority_queue`. This is the module that turns "graph problems" from scary into mechanical.*

---

## When to reach for this

- The graph has **weighted edges** and you're asked for a **shortest / cheapest / minimum-cost path** between nodes → Dijkstra (non-negative weights) or Bellman-Ford (negative weights).
- Edge weights are **only 0 or 1** (e.g. "cost to flip/change a cell") and you want shortest path → **0-1 BFS** with a deque (faster than Dijkstra).
- Phrases like *"minimum cost to connect all points / cities / nodes"*, *"cheapest way to make everything connected"* → **Minimum Spanning Tree** (Kruskal or Prim).
- *"maximize the minimum edge"* / *"minimize the maximum edge along a path"*, or bottleneck/effort problems → modified Dijkstra or MST-flavored.
- Negative cycle detection, "can prices go infinitely negative", or "at most K stops/edges" → **Bellman-Ford**.

---

## Core idea and template

**Dijkstra** = BFS where you always expand the *closest unfinalized* node next. A min-heap gives you that node in O(log V). Once you pop a node, its distance is final (only true when all weights ≥ 0 — that's the whole catch). Relax each outgoing edge: if going through the popped node is cheaper, push the improved distance.

Key discipline: the heap can hold **stale** entries. When you pop `(d, u)`, if `d > dist[u]` it's outdated — skip it. This "lazy deletion" is why you never need a decrease-key.

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
typedef pair<ll,int> pli;   // (distance, node)

// adj[u] = list of {neighbor, weight}
vector<ll> dijkstra(int n, vector<vector<pair<int,int>>>& adj, int src) {
    vector<ll> dist(n, LLONG_MAX);
    dist[src] = 0;
    // min-heap: smallest distance on top
    priority_queue<pli, vector<pli>, greater<pli>> pq;
    pq.push({0, src});

    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;        // stale entry — already found better
        for (auto [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) {  // relax
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;  // dist[i] == LLONG_MAX means unreachable
}
```
Complexity: **O((V + E) log V)**.

**0-1 BFS** — when every edge weight is 0 or 1. Use a `deque`: a 0-weight edge means "same layer" → push to **front**; a 1-weight edge → push to **back**. This keeps the deque monotonic, so you get Dijkstra behavior in **O(V + E)** with no heap.

```cpp
vector<int> zeroOneBFS(int n, vector<vector<pair<int,int>>>& adj, int src) {
    vector<int> dist(n, INT_MAX);
    deque<int> dq;
    dist[src] = 0; dq.push_front(src);
    while (!dq.empty()) {
        int u = dq.front(); dq.pop_front();
        for (auto [v, w] : adj[u]) {          // w is 0 or 1
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                if (w == 0) dq.push_front(v);  // free move: front
                else        dq.push_back(v);   // costs 1: back
            }
        }
    }
    return dist;
}
```

**Bellman-Ford** — handles **negative weights**. Relax *all* edges V-1 times (any shortest path has ≤ V-1 edges). A V-th pass that still relaxes something ⇒ **negative cycle**. Slower — **O(V·E)** — but it's the tool for negatives and for "at most K edges" (run only K passes on a **copy** of the array).

```cpp
struct Edge { int u, v, w; };

// returns false if a negative cycle is reachable
bool bellmanFord(int n, vector<Edge>& edges, int src, vector<ll>& dist) {
    dist.assign(n, LLONG_MAX);
    dist[src] = 0;
    for (int i = 0; i < n - 1; i++) {
        for (auto& e : edges) {
            if (dist[e.u] != LLONG_MAX && dist[e.u] + e.w < dist[e.v])
                dist[e.v] = dist[e.u] + e.w;
        }
    }
    for (auto& e : edges)               // one more pass: still improving?
        if (dist[e.u] != LLONG_MAX && dist[e.u] + e.w < dist[e.v])
            return false;               // negative cycle
    return true;
}
```

**MST — Kruskal** (sort edges, greedily add the cheapest that doesn't form a cycle; cycle-check via **Union-Find/DSU**):

```cpp
struct DSU {
    vector<int> p, r;
    DSU(int n): p(n), r(n, 0) { iota(p.begin(), p.end(), 0); }
    int find(int x) { return p[x] == x ? x : p[x] = find(p[x]); } // path compression
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;              // already connected → cycle
        if (r[a] < r[b]) swap(a, b);
        p[b] = a;
        if (r[a] == r[b]) r[a]++;
        return true;
    }
};

ll kruskal(int n, vector<Edge>& edges) {       // Edge{u, v, w}
    sort(edges.begin(), edges.end(), [](auto& a, auto& b){ return a.w < b.w; });
    DSU dsu(n);
    ll cost = 0; int used = 0;
    for (auto& e : edges) {
        if (dsu.unite(e.u, e.v)) { cost += e.w; if (++used == n - 1) break; }
    }
    return cost;   // used < n-1 ⇒ graph disconnected, no spanning tree
}
```
Complexity: **O(E log E)** dominated by the sort.

**MST — Prim** (grow the tree from one node, always add the cheapest edge crossing out of the tree; basically Dijkstra where you compare edge weight, not path distance). Prefer Prim on **dense** graphs given as an adjacency matrix / when you already have an adjacency list.

```cpp
ll prim(int n, vector<vector<pair<int,int>>>& adj) { // adj[u]={v,w}
    vector<bool> inMST(n, false);
    priority_queue<pli, vector<pli>, greater<pli>> pq; // (edgeWeight, node)
    pq.push({0, 0});
    ll cost = 0; int cnt = 0;
    while (!pq.empty() && cnt < n) {
        auto [w, u] = pq.top(); pq.pop();
        if (inMST[u]) continue;
        inMST[u] = true; cost += w; cnt++;
        for (auto [v, wt] : adj[u])
            if (!inMST[v]) pq.push({wt, v});
    }
    return cnt == n ? cost : -1;   // -1 ⇒ disconnected
}
```

---

## Problem ladder

Work top to bottom. 🎯 = OA-critical (the shape that shows up in Flipkart/Microsoft hard rounds).

- [ ] [Find the Town Judge](https://leetcode.com/problems/find-the-town-judge/) — Easy — warm-up on in/out degree, primes you for edge bookkeeping.
- [ ] [Number of Provinces](https://leetcode.com/problems/number-of-provinces/) — Medium — pure DSU / connected components; the union-find muscle you'll reuse for Kruskal.
- [ ] 🎯 [Network Delay Time](https://leetcode.com/problems/network-delay-time/) — Medium — canonical single-source Dijkstra; answer is the max finalized distance.
- [ ] 🎯 [Cheapest Flights Within K Stops](https://leetcode.com/problems/cheapest-flights-within-k-stops/) — Medium — Bellman-Ford with a K-pass cap; the "at most K edges" trap.
- [ ] 🎯 [Path with Minimum Effort](https://leetcode.com/problems/path-with-minimum-effort/) — Medium — Dijkstra on a grid minimizing the *max* edge (bottleneck).
- [ ] 🎯 [Path With Maximum Probability](https://leetcode.com/problems/path-with-maximum-probability/) — Medium — Dijkstra with a max-heap and multiplicative weights.
- [ ] 🎯 [Swim in Rising Water](https://leetcode.com/problems/swim-in-rising-water/) — Hard — minimize the maximum cell along a path; Dijkstra or DSU + binary search.
- [ ] 🎯 [Min Cost to Connect All Points](https://leetcode.com/problems/min-cost-to-connect-all-points/) — Medium — textbook MST on a complete graph (Prim shines here).
- [ ] [Connecting Cities With Minimum Cost](https://leetcode.com/problems/connecting-cities-with-minimum-cost/) — Medium — Kruskal + DSU; detect the disconnected/-1 case.
- [ ] [Min Cost to Make Connected](https://leetcode.com/problems/minimize-malware-spread/) — Medium — DSU component reasoning (name says it all — verify slug by title).
- [ ] 🎯 [The Maze II](https://leetcode.com/problems/the-maze-ii/) — Medium — Dijkstra where an edge = rolling until you hit a wall (custom edge weights).
- [ ] [01 Matrix](https://leetcode.com/problems/01-matrix/) — Medium — multi-source BFS; same skeleton as 0-1 BFS, cements the deque intuition.
- [ ] 🎯 [Reachable Nodes In Subdivided Graph](https://leetcode.com/problems/reachable-nodes-in-subdivided-graph/) — Hard — Dijkstra where distances gate how many subdivided nodes you reach.
- [ ] [Find Critical and Pseudo-Critical Edges in MST](https://leetcode.com/problems/find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree/) — Hard — MST with forced/forbidden edges; deep Kruskal + DSU mastery.

---

## Deep dives: the ingenious ones

### 1. Cheapest Flights Within K Stops — why plain Dijkstra fails

**The trap.** You reach for Dijkstra. But Dijkstra's core promise — *once a node is popped, its distance is final* — assumes cost only ever decreases as you extend a path. Here you have a **second constraint**: at most K stops. The globally cheapest way to reach a node might use too many stops, while a *more expensive* route uses fewer stops and lets you continue further. So finalizing a node the moment it's cheapest is wrong; you may need a costlier-but-shorter-in-hops path.

**The fix — Bellman-Ford, bounded to K+1 passes.** A path with at most K stops has at most **K+1 edges**. Relax all edges exactly K+1 times. The one subtlety: you must relax using distances **frozen from the previous pass**, otherwise a single pass could chain multiple edges (using an edge you just relaxed this round) and blow past your hop budget.

```cpp
int findCheapestPrice(int n, vector<vector<int>>& flights, int src, int dst, int K) {
    vector<int> dist(n, INT_MAX);
    dist[src] = 0;
    for (int i = 0; i <= K; i++) {          // K stops ⇒ K+1 edges
        vector<int> tmp = dist;             // <-- freeze: read old, write new
        for (auto& f : flights) {
            int u = f[0], v = f[1], w = f[2];
            if (dist[u] != INT_MAX && dist[u] + w < tmp[v])
                tmp[v] = dist[u] + w;
        }
        dist = tmp;
    }
    return dist[dst] == INT_MAX ? -1 : dist[dst];
}
```
The `tmp` copy is the whole trick — drop it and you'll silently allow K+1 stops. **Time O(K·E), space O(V).**

---

### 2. Path with Minimum Effort / Swim in Rising Water — Dijkstra on a *bottleneck*, not a *sum*

**The insight.** Normal Dijkstra minimizes the **sum** of edge weights. Here the cost of a path is the **maximum** single step along it (the tallest cliff you climb, or the highest water level you must wait for). You want the path whose maximum step is as small as possible — a *minimax* path.

**Why it still works with Dijkstra.** Dijkstra only needs the "relaxation" operation to be **monotonic**: extending a path never makes it better. `max(currentBottleneck, newEdge)` is monotonic — the bottleneck can only stay equal or rise. So swap the relaxation from `dist[u] + w` to `max(dist[u], w)` and everything else — heap, lazy skip, finalization guarantee — carries over unchanged.

```cpp
int minimumEffortPath(vector<vector<int>>& h) {
    int m = h.size(), n = h[0].size();
    vector<vector<int>> eff(m, vector<int>(n, INT_MAX));
    priority_queue<array<int,3>, vector<array<int,3>>, greater<>> pq; // (effort, r, c)
    eff[0][0] = 0; pq.push({0, 0, 0});
    int dr[] = {0,0,1,-1}, dc[] = {1,-1,0,0};
    while (!pq.empty()) {
        auto [e, r, c] = pq.top(); pq.pop();
        if (r == m-1 && c == n-1) return e;   // first time we pop the target = answer
        if (e > eff[r][c]) continue;
        for (int k = 0; k < 4; k++) {
            int nr = r + dr[k], nc = c + dc[k];
            if (nr<0||nc<0||nr>=m||nc>=n) continue;
            int cost = max(e, abs(h[nr][nc] - h[r][c]));  // bottleneck relaxation
            if (cost < eff[nr][nc]) { eff[nr][nc] = cost; pq.push({cost, nr, nc}); }
        }
    }
    return 0;
}
```
**Time O(V log V) with V = m·n.** *Swim in Rising Water* is the identical idea (relax with `max(dist[u], grid[nr][nc])`). Bonus mental model: it's also a **union-find + binary-search-on-answer** problem — "is there a path using only cells ≤ T?" — which is a great alternative to mention in an interview.

---

### 3. 0-1 BFS — Dijkstra without the log factor

**The setup.** Problems like "minimum number of walls to break", "minimum sign flips to travel", or "min obstacle removal to reach corner": every move costs **0 or 1**. Dijkstra works but carries an O(log V) heap overhead you don't need.

**The trick.** With only two weights, the frontier is always split across at most two distance values, `d` and `d+1`. A **deque** keeps them ordered for free: a 0-cost edge keeps you at distance `d` → push to the **front** (process before the d+1's); a 1-cost edge takes you to `d+1` → push to the **back**. The deque stays sorted by distance without any comparisons, so you pop nodes in nondecreasing distance order exactly like Dijkstra — but in **O(V + E)**.

```cpp
// Minimum Obstacle Removal to Reach Corner: '1' cells cost 1 to enter, '0' cost 0
int minObstacles(vector<vector<int>>& g) {
    int m = g.size(), n = g[0].size();
    vector<vector<int>> dist(m, vector<int>(n, INT_MAX));
    deque<pair<int,int>> dq;
    dist[0][0] = 0; dq.push_front({0, 0});
    int dr[]={0,0,1,-1}, dc[]={1,-1,0,0};
    while (!dq.empty()) {
        auto [r, c] = dq.front(); dq.pop_front();
        for (int k = 0; k < 4; k++) {
            int nr=r+dr[k], nc=c+dc[k];
            if (nr<0||nc<0||nr>=m||nc>=n) continue;
            int w = g[nr][nc];                 // 0 or 1
            if (dist[r][c] + w < dist[nr][nc]) {
                dist[nr][nc] = dist[r][c] + w;
                if (w == 0) dq.push_front({nr, nc});
                else        dq.push_back({nr, nc});
            }
        }
    }
    return dist[m-1][n-1];
}
```
Say this out loud in an interview: *"weights are 0/1, so I'll use 0-1 BFS with a deque for O(V+E) instead of Dijkstra's O(E log V)."* It signals real fluency.

---

### 4. Kruskal vs Prim — the strategic choice, and why DSU is the star

Both build an MST greedily; the difference is *what* they greedily pick.

- **Kruskal** sorts *all edges* globally and adds the cheapest that doesn't create a cycle. The cycle test is **Union-Find**: two endpoints already in the same set ⇒ adding the edge closes a loop, skip it. Best when the graph is **sparse** (edge list is small) or edges arrive pre-listed. **O(E log E).**
- **Prim** grows one connected blob, always grabbing the cheapest edge leaving the blob (min-heap keyed on edge weight). Best on **dense** graphs / adjacency matrix. **O(E log V).**

**The insight that makes Kruskal click:** an MST is just "connect everything as cheaply as possible without redundancy." Sorting guarantees you always consider the cheapest useful edge first; DSU is the O(α(n)) ≈ O(1) oracle for "would this edge be redundant?" Path compression + union by rank is what makes it near-constant. For *Min Cost to Connect All Points*, the graph is complete (V² edges via Manhattan distance) — that density is exactly when you'd lean Prim, but either works within constraints.

**Interview-grade nuance (Critical/Pseudo-Critical Edges problem):** a **critical** edge is one whose removal increases the MST weight (it's in *every* MST) — test by building an MST while *forbidding* that edge and seeing if the total rises or the graph disconnects. A **pseudo-critical** edge appears in *some* MST — test by *forcing* it in first (union its endpoints, add its weight) and checking the MST weight is unchanged. Both tests are just Kruskal runs with one edge skipped or pre-committed. That reduction — "answer each query with a slightly-tweaked Kruskal" — is the clever part.

---

## Pitfalls and interview tips

**Bugs that cost you the OA:**
- **Overflow.** Summed path costs and MST totals overflow `int` fast. Use `long long` for distances and init to `LLONG_MAX` — but then guard relaxation with `if (dist[u] != LLONG_MAX && dist[u] + w < dist[v])` so `MAX + w` doesn't wrap around to negative.
- **Forgetting the stale-entry skip** (`if (d > dist[u]) continue;`). Without it Dijkstra still gives the right answer but reprocesses nodes and can TLE on big inputs.
- **Using Dijkstra with negative edges.** It silently returns wrong answers — the finalization guarantee breaks. If you see any negative weight, switch to Bellman-Ford.
- **Bellman-Ford without the frozen copy** when there's a hop/stop limit — you'll leak extra edges into one pass.
- **Directed vs undirected.** For undirected graphs add both `adj[u].push_back({v,w})` **and** `adj[v].push_back({u,w})`. Half the wrong-answer bugs are one missing direction.
- **1-indexed problems** (Network Delay Time uses nodes 1..n). Size arrays `n+1` or subtract 1 consistently.
- **Disconnected graph in MST**: if you added fewer than `V-1` edges, there's no spanning tree — return -1, don't return a partial sum.

**Edge cases to name unprompted:** single node (answer 0), unreachable target (return -1 / INT_MAX sentinel), self-loops and duplicate/parallel edges (Kruskal handles them via the cycle check; just don't crash).

**How to narrate it:** (1) *Classify* — "weighted, non-negative, single source, shortest path → Dijkstra." Announcing the classification is half the score. (2) State the complexity before coding: "O((V+E) log V), fits n ≤ 1e5." (3) Mention the sharper tool when it applies: "weights are 0/1 so 0-1 BFS is O(V+E)," or "this is minimax not sum, so I relax with max." (4) Call out the guarantee you're relying on ("Dijkstra finalizes on non-negative weights") — it shows you know *why*, not just *what*. Interviewers reward the classification and the complexity call as much as the working code.
