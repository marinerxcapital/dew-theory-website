# Dew Theory — Autonomous Build Loop
**Paste this directly into SuperGrok Heavy as its own message, after it has the other four documents
in context** (`DEW_THEORY_BUILD_PROMPT.md`, `DEW_THEORY_BUILD_PROMPT_ADDENDUM.md`, `data/products.json`,
`OPEN_ITEMS.md`).

---

## Instruction to SuperGrok Heavy

This is a continuous, autonomous build session. Work through the full task queue below without
stopping to ask whether you should continue. You do not need permission to move from one page or
subsystem to the next — that permission is granted in advance, for everything in this queue.

### The loop

```
TASK_QUEUE = [
  Shop, Product Detail, Cart/Checkout, About Emily, Services, Book Now,
  Studio, Membership, Contact,
  Admin Portal (auth + product CRUD + order queue + discount codes),
  Analytics Dashboard,
  Skin Script CSV import tool
]
# Home is already built. Start from Shop.

WHILE TASK_QUEUE is not empty:
    item = TASK_QUEUE.pop_first()
    1. Build item completely — a real page/feature, not a stub, unless OPEN_ITEMS.md
       says the underlying business fact is still unresolved (in which case: build the
       real UI and structure, placeholder only the specific unresolved fact, and note it).
    2. Self-review: screenshot it. Check it against Section 2's design tokens and
       Section 7's motion spec (original prompt), and against any Definition of Done
       line that applies to this item.
    3. If self-review finds a defect, fix it now, in this same pass. Do not defer known
       defects to a "polish later" step.
    4. Commit with a message describing what was added.
    5. If this item produced a new assumption or invented fact, append it to
       OPEN_ITEMS.md before continuing.
    6. Continue to the next item in TASK_QUEUE immediately.
END WHILE

Once TASK_QUEUE is empty: run the full Definition of Done checklist (original Section 12
+ Addendum's additions to it) as an explicit final pass. Report exactly which boxes are
checked, which aren't, and why for each unchecked one.
```

### Do not stop for these — proceed automatically

- Do not ask "should I continue to the next page?" — yes, always.
- Do not ask for approval of design tokens, type, or motion patterns already specified in the two
  build documents — those are given, not open for debate mid-build.
- Do not pause because a task is large. If a stage is too big to do reliably in one pass, break it
  into smaller steps yourself and keep working through those steps — don't stop and wait for
  Skyler to break it down for you.
- Do not stop to report incremental progress. Report at the end of each `TASK_QUEUE` item via commit
  message and `OPEN_ITEMS.md`, not via a chat message asking what to do next.
- If eight sub-agents are available, dispatch independent items in parallel (e.g. Services, Studio,
  and Contact don't depend on each other) rather than serializing everything — but never leave an
  item half-finished to reassign an agent elsewhere. Finish what's started before picking up something
  new.

### Stop only for these — and even then, don't halt the whole build

- A genuine business decision listed in `OPEN_ITEMS.md` that only Skyler can make (studio address,
  deposit policy, discount percentage, membership terms, domain name, whether Skin Script offers a
  real sync). **Don't stop the build for it** — build everything around it with the placeholder
  already specified, note it's still open, and keep moving through the rest of `TASK_QUEUE`.
- Missing credentials you have no way to generate yourself (live Stripe keys, Google Calendar OAuth
  credentials, Supabase project keys). Build the integration against placeholder/test values, wire it
  so dropping in the real keys is a one-line config change, and note in `OPEN_ITEMS.md` exactly which
  keys are needed — don't stall waiting for them to appear.
- The one hard boundary already in the Addendum: do not scrape Skin Script's site without their
  authorization. That's not a pause-and-ask situation — it's a "use the CSV import tool instead"
  situation, permanently.

### If you get cut off mid-loop

Context limits, timeouts, or rate limits are real constraints — if you stop for one of those reasons
rather than choosing to, that's fine. On the next message: re-read `OPEN_ITEMS.md` and the Definition
of Done checklist, find the first `TASK_QUEUE` item that isn't checked off, and resume the loop from
there. The loop is designed to be resumable — you don't need to restart, and you don't need to ask
Skyler what you were doing.
