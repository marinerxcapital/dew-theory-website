# Dew Theory — `/loop` overnight prompt

`/loop` fires a **new agent turn on an interval**. Each tick must do a **bounded chunk of work**,
update progress on disk, and exit cleanly — not attempt the entire site in one turn.

Full queue lives in `DEW_THEORY_OVERNIGHT_POLISH_LOOP.md`.  
Progress file (create/update every tick): `POLISH_PROGRESS.md`

---

## Recommended command (copy-paste into Grok)

```
/loop 30m OPEN C:\Users\Skyler B. Brown\Desktop\dew-theory. Read DEW_THEORY_LOOP_PROMPT.md and DEW_THEORY_OVERNIGHT_POLISH_LOOP.md. You are one tick of an overnight polish loop. (1) Read POLISH_PROGRESS.md if it exists; else create it from the POLISH_QUEUE in the overnight file with all items pending. (2) Find the first item whose status is not done/blocked. (3) Complete ONLY that one item fully — code, self-review, tests if relevant. (4) Commit with a message naming the item id (e.g. "polish A1: build health"). (5) Update POLISH_PROGRESS.md: mark the item done/blocked with a one-line note and timestamp. (6) If the queue is fully done, write POLISH_REPORT.md, commit it, and reply DONE — overnight polish complete. Do not invent business facts. Do not scrape Skin Script. Do not ask permission to continue. Do not restart the queue from scratch. Local git only unless a remote is already configured. START.
```

### Interval guide

| Interval | Best for |
|---|---|
| `15m` | Small fixes, aggressive overnight throughput |
| `30m` | **Recommended** — one solid queue item per tick |
| `1h` | Larger items (security pass, full responsive audit) |

Min interval is `60s`. Loops auto-expire after 7 days.

---

## Per-tick contract (the agent must follow this every fire)

```
FOLDER = C:\Users\Skyler B. Brown\Desktop\dew-theory

1. cd / open FOLDER
2. Load progress:
     if POLISH_PROGRESS.md missing → seed from POLISH_QUEUE (all pending)
3. item = first row where status ∉ {done, blocked, skipped}
4. if no item left:
     write POLISH_REPORT.md
     git commit
     reply "DONE — overnight polish complete"
     STOP (further ticks should re-check and say already complete)
5. Execute item fully (one item only — do not start the next)
6. Self-review for that item
7. git add + commit ("polish <ID>: <short description>")
8. Update POLISH_PROGRESS.md
9. Brief reply: which ID finished, what's next — then end turn
```

### Hard rules every tick

- No inventing Emily prices / address / deposit % / membership terms / discount %
- No Skin Script scraping (CSV import only)
- No force-push, no `rm -rf`, no deploy unless env already ready **and** the item requires it
- Default: **local only**
- If blocked on credentials/business fact → mark `blocked`, note in OPEN_ITEMS.md, advance next tick
- Never leave half-finished code “for later” inside the same item — finish or mark blocked with reason

---

## POLISH_PROGRESS.md seed format

Create this on first tick if missing:

```markdown
# Polish Progress

Started: <ISO timestamp>
Mode: /loop
Interval: 30m

| ID | Status | Note | Updated |
|----|--------|------|---------|
| A1 | pending | | |
| A2 | pending | | |
| A3 | pending | | |
| B1 | pending | | |
| B2 | pending | | |
| B3 | pending | | |
| B4 | pending | | |
| B5 | pending | | |
| C1 | pending | | |
| C2 | pending | | |
| C3 | pending | | |
| D1 | pending | | |
| D2 | pending | | |
| D3 | pending | | |
| D4 | pending | | |
| D5 | pending | | |
| D6 | pending | | |
| E1 | pending | | |
| E2 | pending | | |
| E3 | pending | | |
| E4 | pending | | |
| E5 | pending | | |
| F1 | pending | | |
| F2 | pending | | |
| F3 | pending | | |
| G1 | pending | | |
| G2 | pending | | |
| G3 | pending | | |
| G4 | pending | | |
| G5 | pending | | |
| G6 | pending | | |
| G7 | pending | | |
| H1 | pending | | |
| H2 | pending | | |
| H3 | pending | | |
| H4 | pending | | |
| I1 | pending | | |
| I2 | pending | | |
| I3 | pending | | |
| J1 | pending | | |
| J2 | pending | | |
| J3 | pending | | |
| J4 | pending | | |
| K1 | pending | | |
| K2 | pending | | |
| K3 | pending | | |
| L1 | pending | | |
| L2 | pending | | |
| L3 | pending | | |
| M1 | pending | | |
| M2 | pending | | |
| M3 | pending | | |
| N1 | pending | | |
| N2 | pending | | |
| N3 | pending | | |
| N4 | pending | | |

Status values: pending | in_progress | done | blocked | skipped
```

Item definitions are in `DEW_THEORY_OVERNIGHT_POLISH_LOOP.md` under `POLISH_QUEUE`.

---

## Shorter nap loop (fewer ticks)

```
/loop 20m OPEN C:\Users\Skyler B. Brown\Desktop\dew-theory. One tick only. Progress file: POLISH_PROGRESS.md. Queue restricted to: A1, A2, B5, C1, D4, E2, E3, G1, H1, N1, N3. Same rules as DEW_THEORY_LOOP_PROMPT.md — do the next pending item, commit, update progress, stop. When all those IDs are done, write POLISH_REPORT.md and say DONE.
```

---

## Cancel / check

- When the loop is created, Grok reports a scheduler job ID
- Cancel: use the UI/scheduler delete for that ID, or tell Grok to cancel the overnight polish loop
- Check progress anytime: open `POLISH_PROGRESS.md` or ask “read POLISH_PROGRESS.md”

---

## Tip: `/goal` vs `/loop`

| Command | Use when |
|---|---|
| **`/loop 30m …`** | You want **periodic ticks** while sleeping; each tick is one queue item (this file) |
| **`/goal …`** | You want one continuous objective the agent drives across turns in the same session |

For overnight unattended work, **`/loop` is the right tool** — ticks keep firing even if a single turn ends.
