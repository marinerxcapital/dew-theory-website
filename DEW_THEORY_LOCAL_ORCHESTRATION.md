# Dew Theory — Local Orchestration System

This document explains `setup_orchestration.ps1` and how it relates to
`DEW_THEORY_AUTONOMOUS_BUILD_LOOP.md`. Read both — they're not competing systems, the
5-worker architecture here is *how* that loop's `TASK_QUEUE` actually gets executed
in parallel instead of serially.

---

## How this relates to the single-session loop

`DEW_THEORY_AUTONOMOUS_BUILD_LOOP.md` defines *what* needs to happen (the `TASK_QUEUE`) and
*when to stop versus keep going*. This system defines *who does it*: 5 independent worker
processes pulling from role-specific queue folders, plus one Orchestrator session (the
SuperGrok session that runs `setup_orchestration.ps1` and then stays open) that watches all 5,
restarts anything stuck, and re-files misrouted tasks.

The "stop only for these" and "do not stop for these" rules from that document apply to every
worker here individually, not just the top-level session. A worker hitting a genuine business
decision (discount percentage, Skin Script API confirmation) should placeholder it and keep
moving through its own queue — same rule, applied per-worker instead of per-session.

---

## Role-to-task mapping

Queues are seeded automatically by `setup_orchestration.ps1` from the `TASK_QUEUE` items that
fit each role. Don't let a worker's "auto-discover work" step invent scope outside this mapping
— if a worker runs out of seeded tasks, the correct move is to check `OPEN_ITEMS.md` for
anything newly relevant to its role, not to start work that isn't traceable back to either
document.

| Worker | Pulls from `TASK_QUEUE` | Explicitly not this worker's job |
|---|---|---|
| **Dev** | Shop, Product Detail, Cart/Checkout, Admin Portal, Analytics Dashboard, CSV import tool | Writing brand-voice copy — hand off to Creative |
| **Creative** | Emily's bio, Services copy, Membership copy, brand thesis, footer | Application code, pricing logic |
| **Research** | Verifying business/product facts before they're presented as real — the same process used for `data/products.json` | Never invents a fact to fill a gap. A missing fact becomes an `OPEN_ITEMS.md` line, not a guess. |
| **LLM Workflow** | Build-time tasks that need an LLM call themselves — confirmation email drafts, CSV column-mapping heuristics for Section 16.1 | Brand copy (Creative's job) and page code (Dev's job) — this role is specifically for tasks where calling an LLM *is* the task |
| **Coordinator** | Queue hygiene — re-files a task dropped in the wrong queue, flags anything sitting untouched for over an hour, keeps `status\system_status.txt` current | Doing the tasks itself — this role moves work, it doesn't perform it |

---

## Three fixes made to the system as specified, and why

**1. The service role key never reaches the browser.**
The original design used one `$ServiceKey` for both worker writes and (implicitly, via the
dashboard) reads. The service role key bypasses every Row Level Security policy — full,
unrestricted database access. If it ever ended up in `dashboard\index.html`, anyone who opened
that page's dev tools would have root access to the database.

Fix: two keys, two trust levels.
- **Service key** — lives only in `autonomous_system\config.local.ps1`, dot-sourced by the 5
  worker scripts, which run locally and are never shipped anywhere. This file is gitignored.
- **Anon key** — the only key in `dashboard\index.html`. It can `select`, nothing else, enforced
  by the `create policy "public read for dashboard"` in `headless_sessions.sql`, which grants
  read access and grants no write access at all. A leaked anon key lets someone watch your
  build status. A leaked service key hands them your database.

**2. Errors no longer disappear silently.**
The original template's `catch { Start-Sleep 60 }` retries forever with no record and no
escalation. A worker stuck on a bad task would loop quietly, possibly burning API calls the
entire time, with nothing visible anywhere.

Fix: each worker now counts consecutive failures, logs every one with a timestamp to
`autonomous_system\logs\<role>.log`, and after 5 in a row, reports `Error` status to the
dashboard and backs off for 5 minutes instead of retrying every 60 seconds. You'll see it turn
red on the dashboard instead of finding out three days later that a worker had been failing the
whole time.

**3. The build-monitoring dashboard is not part of the Dew Theory product.**
The original instruction was to add this "Autonomous 5-Headless Orchestrator" section to *the
project dashboard* — read in context, that's the Section 15 Analytics Dashboard inside
`/admin`, which is customer-business-facing (Emily's revenue, bookings, discount performance).
Internal build tooling and business analytics are different audiences and different security
surfaces; anyone with ordinary staff access to `/admin` has no reason to see live status of the
AI workers that built the site.

Fix: `autonomous_system\dashboard\index.html` is a standalone local file, opened directly in a
browser, entirely outside the Next.js app. It never gets built, deployed, or exposed publicly —
it's a file on the mini PC, for the mini PC.

---

## Secret hygiene, summarized

- `config.local.ps1` — has the real service key. Gitignored. Never leaves this machine.
- `dashboard\index.html` — has the anon key only, which is designed to be public-safe as long
  as RLS policies are correct (they are, per `headless_sessions.sql`).
- `queue\`, `logs\`, `status\`, `incoming\`, `completed\` — all gitignored. This is runtime
  state, not source code; it doesn't belong in `marinerxcapital/dew-theory-website` regardless
  of whether it contains secrets.
- `scripts\*.ps1` — safe to commit. They dot-source the config file rather than containing keys
  directly, so there's nothing sensitive in them even though they're tracked.

If `git status` ever shows `config.local.ps1` as a new/modified file, stop and check the
`.gitignore` before committing — that means the ignore rule didn't take, not that it's safe to
proceed.
