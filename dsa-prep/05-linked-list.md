# Module 05 — Linked List

Linked-list problems are almost never about the data structure itself — they are about *pointer choreography*. The list is a thin excuse to test whether you can juggle 2-3 pointers without dropping a node, losing the head, or creating a cycle. This is a **Microsoft interview staple** (target emoji = OA-critical). The good news: the entire topic reduces to about five reusable maneuvers, and once they are muscle memory you can solve most problems in under 5 minutes.

## When to reach for this

- The input is a singly-linked list and you are asked to **reverse**, **reorder**, **merge**, or **remove** nodes — anything that rewires `next` pointers.
- You need the **middle**, the **k-th from the end**, or to **detect/locate a cycle** in O(1) extra space → fast/slow (tortoise & hare) pointers.
- You are told **"do it in-place / O(1) space"** on a list — this rules out copying to an array and forces pointer surgery.
- You need to process **two sorted lists together** or splice sublists → merge / dummy-node stitching.
- Any phrasing like "without knowing the length", "one pass", or "constant memory" on a list is a dead giveaway for the two-pointer family.

## Core idea and template

Two workhorse patterns cover ~90% of list problems.

**1. Dummy node** — When the head itself might change or be deleted, allocate a fake node in front of the list so you never special-case the head. You return `dummy.next` at the end.

**2. Fast/slow pointers** — Advance one pointer 2 steps for every 1 step of the other. When fast reaches the end, slow is at the middle. If there is a cycle, they are guaranteed to meet.

```cpp
struct ListNode {
    int val;
    ListNode* next;
    ListNode(int x) : val(x), next(nullptr) {}
};

// ---- In-place reversal (the single most important primitive) ----
// Walk the list, flipping each node's next pointer to point backwards.
// prev trails, cur leads, nxt saves the rest before we clobber cur->next.
ListNode* reverse(ListNode* head) {
    ListNode* prev = nullptr;
    ListNode* cur  = head;
    while (cur) {
        ListNode* nxt = cur->next; // 1. stash the rest of the list
        cur->next = prev;          // 2. reverse this link
        prev = cur;                // 3. advance prev
        cur = nxt;                 // 4. advance cur
    }
    return prev; // prev is the new head (old tail)
}

// ---- Dummy-node skeleton (deletion / merging / building output) ----
ListNode* templateWithDummy(ListNode* head) {
    ListNode dummy(0);        // fake node BEFORE the head
    dummy.next = head;
    ListNode* prev = &dummy;  // prev always points at the node before "cur"
    ListNode* cur  = head;
    while (cur) {
        // ... decide to keep or unlink cur ...
        // to delete cur:  prev->next = cur->next; cur = cur->next;
        // to keep   cur:  prev = cur;             cur = cur->next;
    }
    return dummy.next;        // head may have changed — this is why we used dummy
}

// ---- Fast/slow: find middle (slow lands on 2nd middle for even length) ----
ListNode* middle(ListNode* head) {
    ListNode* slow = head;
    ListNode* fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
    }
    return slow;
}
```

Memorize the reversal loop as a four-line chant: **save, flip, walk prev, walk cur.** You will write it in a dozen problems.

## Problem ladder

Work top to bottom. Do not skip the easy ones — they build the pointer reflexes the hard ones assume.

- [ ] [Middle of the Linked List](https://leetcode.com/problems/middle-of-the-linked-list/) — Easy — fast/slow pointers, the cleanest introduction.
- [ ] 🎯 [Reverse Linked List](https://leetcode.com/problems/reverse-linked-list/) — Easy — the reversal primitive; know it iteratively AND recursively.
- [ ] 🎯 [Linked List Cycle](https://leetcode.com/problems/linked-list-cycle/) — Easy — Floyd detection: do fast and slow ever meet?
- [ ] 🎯 [Merge Two Sorted Lists](https://leetcode.com/problems/merge-two-sorted-lists/) — Easy — dummy-node stitching of two lists.
- [ ] [Remove Duplicates from Sorted List](https://leetcode.com/problems/remove-duplicates-from-sorted-list/) — Easy — unlink adjacent equal nodes.
- [ ] 🎯 [Remove Nth Node From End of List](https://leetcode.com/problems/remove-nth-node-from-end-of-list/) — Medium — two pointers a gap of n apart; dummy handles head removal.
- [ ] [Palindrome Linked List](https://leetcode.com/problems/palindrome-linked-list/) — Easy — find middle, reverse second half, compare (O(1) space).
- [ ] 🎯 [Linked List Cycle II](https://leetcode.com/problems/linked-list-cycle-ii/) — Medium — Floyd part 2: find the *entry* node of the cycle.
- [ ] [Odd Even Linked List](https://leetcode.com/problems/odd-even-linked-list/) — Medium — weave two sublists by index parity.
- [ ] 🎯 [Reorder List](https://leetcode.com/problems/reorder-list/) — Medium — middle + reverse + merge; three primitives in one.
- [ ] 🎯 [Copy List with Random Pointer](https://leetcode.com/problems/copy-list-with-random-pointer/) — Medium — interleave-clone trick for O(1) extra space.
- [ ] [Add Two Numbers](https://leetcode.com/problems/add-two-numbers/) — Medium — dummy node + carry propagation across two lists.
- [ ] 🎯 [Reverse Nodes in k-Group](https://leetcode.com/problems/reverse-nodes-in-k-group/) — Hard — reverse fixed-size blocks and re-stitch them.
- [ ] 🎯 [Merge k Sorted Lists](https://leetcode.com/problems/merge-k-sorted-lists/) — Hard — min-heap or divide-and-conquer merge (also drills heaps, a gap of yours).

## Deep dives: the ingenious ones

These four contain the "aha" tricks that make interviewers nod. Understand *why* each works, not just the code.

### 1. Floyd's cycle detection — and finding the entry node (Cycle II)

**Naive approach & why it fails:** A hash set of visited nodes detects a cycle in O(n) time but O(n) space. The interview twist is "O(1) space", which kills the hash-set idea.

**The insight (detection):** Move `slow` by 1 and `fast` by 2. If there is no cycle, `fast` falls off the end. If there is a cycle, `fast` laps the track and the gap between them shrinks by exactly 1 each step, so they *must* collide.

**The genuinely clever part (finding the entry):** Let the distance from head to the cycle entry be `a`, and let the meeting point be `b` nodes into the cycle (cycle length `c`). When they meet:
- slow travelled `a + b`
- fast travelled `a + b + k·c` (it went around `k` extra times)
- fast went twice as far: `2(a + b) = a + b + k·c` ⟹ `a + b = k·c` ⟹ `a = k·c − b`.

`k·c − b` is exactly the distance from the meeting point, walking forward, back to the entry. So: **reset one pointer to head, advance both one step at a time, and they meet at the cycle entry.** No arithmetic needed at runtime — just walk.

```cpp
ListNode* detectCycle(ListNode* head) {
    ListNode *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) {              // collision => cycle exists
            ListNode* p = head;
            while (p != slow) {          // a == k*c - b, so they meet at entry
                p = p->next;
                slow = slow->next;
            }
            return p;                    // the cycle's entry node
        }
    }
    return nullptr;                      // fast hit the end => no cycle
}
```
**Complexity:** O(n) time, O(1) space. The `a = k·c − b` derivation is the whole point — be ready to explain it on a whiteboard.

### 2. Reorder List — composing three primitives

**Task:** Turn `1→2→3→4→5` into `1→5→2→4→3` (first, last, second, second-last, …).

**Naive approach & why it fails:** You cannot walk backwards in a singly-linked list, so "grab the last node" is O(n) each time → O(n²). Copying node pointers into an array works (O(n) space) but the elegant answer is O(1) space.

**The trick — decompose into three known moves:**
1. **Find the middle** with fast/slow.
2. **Reverse the second half** (your memorized primitive).
3. **Merge the two halves alternately**, taking one node from each.

```cpp
void reorderList(ListNode* head) {
    if (!head || !head->next) return;
    // 1. middle: slow ends at the start of the second half
    ListNode *slow = head, *fast = head;
    while (fast->next && fast->next->next) { slow = slow->next; fast = fast->next->next; }
    // 2. reverse the second half
    ListNode *second = slow->next; slow->next = nullptr; // split
    ListNode *prev = nullptr;
    while (second) { ListNode* n = second->next; second->next = prev; prev = second; second = n; }
    second = prev;                        // head of reversed second half
    // 3. weave the two lists together
    ListNode* first = head;
    while (second) {
        ListNode *f = first->next, *s = second->next;
        first->next = second; second->next = f;
        first = f; second = s;
    }
}
```
**Why it clicks:** hard list problems are usually just 2-3 easy primitives glued together. Recognizing the decomposition is the skill. **Complexity:** O(n) time, O(1) space.

### 3. Copy List with Random Pointer — the interleaving clone

**Task:** Deep-copy a list where each node has a `next` and a `random` pointer to any node (or null).

**Naive approach & why it fails:** You can map `original node → copied node` in a hash map, then a second pass to set `random` pointers — clean, but O(n) extra space for the map. The interviewer wants O(1) extra (besides the output).

**The trick — weave clones into the original list:**
1. **Insert each clone right after its original:** `A → A' → B → B' → C → C'`. Now every clone is reachable as `original->next`.
2. **Wire up randoms in place:** for each original `cur`, `cur->next->random = cur->random->next`. Read it slowly: `cur->next` is the clone; `cur->random` is some original; `cur->random->next` is *that* original's clone. Pure pointer arithmetic, no map.
3. **Unweave** the two lists to restore the original and extract the copy.

```cpp
Node* copyRandomList(Node* head) {
    if (!head) return nullptr;
    for (Node* cur = head; cur; cur = cur->next->next) {   // 1. interleave clones
        Node* clone = new Node(cur->val);
        clone->next = cur->next;
        cur->next = clone;
    }
    for (Node* cur = head; cur; cur = cur->next->next)      // 2. set random via neighbours
        if (cur->random) cur->next->random = cur->random->next;
    Node dummy(0); Node* copyTail = &dummy;                 // 3. detach the copy
    for (Node* cur = head; cur; cur = cur->next) {
        copyTail->next = cur->next;
        copyTail = copyTail->next;
        cur->next = cur->next->next;                        // restore original
    }
    return dummy.next;
}
```
**Why it clicks:** the interleaving turns "which clone corresponds to this node?" into a local `->next` lookup, replacing the hash map with the list's own structure. **Complexity:** O(n) time, O(1) extra space.

### 4. Reverse Nodes in k-Group — block reversal with clean stitching

**Task:** Reverse every consecutive group of `k` nodes; leave a trailing remainder of `<k` nodes untouched.

**Why it is tricky:** you must reverse a *sublist* and then reconnect the reversed block's ends to the surrounding list correctly, repeatedly. Off-by-one errors and lost tails are everywhere.

**The trick — anchor with a `groupPrev` pointer and reverse exactly k links:**
1. From `groupPrev`, look ahead k nodes to check a full group exists (else stop — leave the tail as is).
2. Reverse the k nodes. The node that *was* first in the group becomes the tail of the reversed block.
3. Re-stitch: `groupPrev->next` points to the new block head; the old first node's `next` points to the rest of the list; then move `groupPrev` to that old-first node for the next round.

```cpp
ListNode* reverseKGroup(ListNode* head, int k) {
    ListNode dummy(0); dummy.next = head;
    ListNode* groupPrev = &dummy;
    while (true) {
        // find the k-th node from groupPrev
        ListNode* kth = groupPrev;
        for (int i = 0; i < k && kth; i++) kth = kth->next;
        if (!kth) break;                         // fewer than k left -> done
        ListNode* groupNext = kth->next;         // first node AFTER the group
        // reverse the group, initializing prev to groupNext so the block
        // links straight into the rest of the list
        ListNode* prev = groupNext;
        ListNode* cur  = groupPrev->next;
        while (cur != groupNext) {
            ListNode* nxt = cur->next;
            cur->next = prev;
            prev = cur;
            cur = nxt;
        }
        ListNode* oldFirst = groupPrev->next;    // now the block's tail
        groupPrev->next = kth;                   // kth is the block's new head
        groupPrev = oldFirst;                     // advance anchor for next group
    }
    return dummy.next;
}
```
**Why it clicks:** initializing `prev = groupNext` instead of `nullptr` means the reversed block is *already* connected to the remainder — no separate re-linking step for the tail. The dummy node handles the very first group changing the head. **Complexity:** O(n) time, O(1) space.

## Pitfalls and interview tips

**Common bugs**
- **Losing the rest of the list:** always stash `cur->next` in a temp *before* you overwrite it. This is the #1 reversal bug.
- **Null dereference:** in fast/slow loops the guard must be `while (fast && fast->next)`. Check `fast` first — short-circuit evaluation stops before `fast->next` blows up on the last node.
- **Head changes:** if the first node can be deleted or moved, use a dummy node. Forgetting this forces ugly `if (head == target)` special cases.
- **Even vs odd length:** `while (fast && fast->next)` puts slow on the *second* middle for even lists; `while (fast->next && fast->next->next)` puts it on the node *before* the split. Pick deliberately based on whether you need the split point or the exact middle.
- **Infinite loops:** after rewiring, make sure some tail's `next` is set to `nullptr`, or you have accidentally built a cycle.

**Edge cases to name out loud before coding:** empty list (`head == nullptr`), single node, two nodes, and (for k-group / nth-from-end) `k`/`n` equal to the list length.

**How to narrate in an interview**
1. Restate the constraint that matters: "It says O(1) space, so I won't copy to an array — I'll use pointer manipulation."
2. Name the pattern: "This is find-middle plus reverse plus merge," or "This is Floyd's algorithm."
3. **Draw the pointers.** Sketch `prev / cur / nxt` boxes and move them by hand for one iteration — it catches off-by-one errors and shows the interviewer your reasoning.
4. State complexity unprompted: nearly all of these are O(n) time, O(1) space — say so.
5. Dry-run your final code on a 2-node list before declaring done; that size exposes most pointer bugs cheaply.
