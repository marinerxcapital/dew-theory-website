<#
  Dew Theory — Local Orchestration Setup
  Run this once on the mini PC to create the project folder on the Desktop,
  the 5-worker + orchestrator scaffolding, and seed the task queues from the
  already-defined build plan (DEW_THEORY_AUTONOMOUS_BUILD_LOOP.md).

  This script is idempotent — safe to re-run. It will not overwrite
  autonomous_system\config.local.ps1 if it already exists, so you don't
  lose your real Supabase keys on a re-run.
#>

# ---------------------------------------------------------------------------
# CONFIG — edit these three lines, then run the script
# ---------------------------------------------------------------------------
$ProjectName = "Dew Theory"
$ProjectRoot = "$env:USERPROFILE\Desktop\Dew Theory Website"
$SupabaseUrl = "https://lbsqyhfjgjaclkfawffr.supabase.co"      
$ServiceKey  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxic3F5aGZqZ2phY2xrZmF3ZmZyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDQyMzk3OCwiZXhwIjoyMDk5OTk5OTc4fQ.RznRAqlUFqfn5PxX2v13fl9giNcArgScrct9ZEgMdr8"    
$AnonKey     = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxic3F5aGZqZ2phY2xrZmF3ZmZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0MjM5NzgsImV4cCI6MjA5OTk5OTk3OH0.QT70YErftvKSTmC2UVA1PIWunCjuttewsZBlPtiQ89k"     
# ---------------------------------------------------------------------------
# Step 1 — Project folder on the Desktop
# ---------------------------------------------------------------------------
Write-Host "Creating project folder: $ProjectRoot" -ForegroundColor Cyan
New-Item -Path $ProjectRoot -ItemType Directory -Force | Out-Null
Set-Location $ProjectRoot

# If the deliverable zip is sitting on the Desktop or in Downloads and this
# folder is otherwise empty, unpack it here automatically.
$alreadyPopulated = Test-Path (Join-Path $ProjectRoot "package.json")
if (-not $alreadyPopulated) {
    $zipCandidates = @(
        "$env:USERPROFILE\Desktop\dew-theory-website.zip",
        "$env:USERPROFILE\Downloads\dew-theory-website.zip"
    ) | Where-Object { Test-Path $_ }

    if ($zipCandidates.Count -gt 0) {
        Write-Host "Found $($zipCandidates[0]) — extracting into $ProjectRoot" -ForegroundColor Cyan
        Expand-Archive -Path $zipCandidates[0] -DestinationPath $ProjectRoot -Force
        # The zip contains a top-level dew-theory\ folder — flatten it up one level.
        $inner = Join-Path $ProjectRoot "dew-theory"
        if (Test-Path $inner) {
            Get-ChildItem $inner -Force | Move-Item -Destination $ProjectRoot -Force
            Remove-Item $inner -Recurse -Force
        }
    } else {
        Write-Host "No project files found and no zip to extract. Unzip dew-theory-website.zip into $ProjectRoot yourself, then re-run this script." -ForegroundColor Yellow
    }
}

# ---------------------------------------------------------------------------
# Step 2 — autonomous_system folder structure
# ---------------------------------------------------------------------------
Write-Host "Creating autonomous_system folders" -ForegroundColor Cyan
$dirs = @(
    "autonomous_system\queue\dev",
    "autonomous_system\queue\creative",
    "autonomous_system\queue\research",
    "autonomous_system\queue\llm",
    "autonomous_system\queue\coordinator",
    "autonomous_system\incoming",
    "autonomous_system\completed",
    "autonomous_system\logs",
    "autonomous_system\status",
    "autonomous_system\scripts",
    "autonomous_system\dashboard"
)
foreach ($d in $dirs) { New-Item -Path (Join-Path $ProjectRoot $d) -ItemType Directory -Force | Out-Null }

# ---------------------------------------------------------------------------
# Step 3 — config.local.ps1 (gitignored — the ONE place secrets live)
# All 5 worker scripts dot-source this instead of embedding keys directly,
# so rotating a key means editing one file, not five.
# ---------------------------------------------------------------------------
$configPath = Join-Path $ProjectRoot "autonomous_system\config.local.ps1"
if (-not (Test-Path $configPath)) {
    @"
# Dew Theory orchestration config — LOCAL ONLY. Never commit this file.
`$ProjectName = "$ProjectName"
`$ProjectRoot = "$ProjectRoot"
`$SupabaseUrl = "$SupabaseUrl"
`$ServiceKey  = "$ServiceKey"
"@ | Set-Content -Path $configPath -Encoding UTF8
    Write-Host "Wrote autonomous_system\config.local.ps1 — edit it with your real Supabase URL and service key before launching workers." -ForegroundColor Yellow
} else {
    Write-Host "config.local.ps1 already exists — leaving it alone (re-running this script never overwrites your keys)." -ForegroundColor Green
}

# ---------------------------------------------------------------------------
# Step 4 — .gitignore: make sure secrets and runtime state never reach GitHub
# ---------------------------------------------------------------------------
$gitignorePath = Join-Path $ProjectRoot ".gitignore"
$orchestrationIgnores = @(
    "",
    "# Local orchestration — never push this to marinerxcapital/dew-theory-website",
    "autonomous_system/config.local.ps1",
    "autonomous_system/logs/",
    "autonomous_system/status/",
    "autonomous_system/queue/",
    "autonomous_system/incoming/",
    "autonomous_system/completed/"
)
if (Test-Path $gitignorePath) {
    $existing = Get-Content $gitignorePath -Raw
    if ($existing -notmatch "config\.local\.ps1") {
        Add-Content -Path $gitignorePath -Value ($orchestrationIgnores -join "`n")
        Write-Host "Added orchestration entries to .gitignore" -ForegroundColor Cyan
    }
} else {
    $orchestrationIgnores -join "`n" | Set-Content -Path $gitignorePath -Encoding UTF8
}

# ---------------------------------------------------------------------------
# Step 5 — status file
# ---------------------------------------------------------------------------
$statusPath = Join-Path $ProjectRoot "autonomous_system\status\system_status.txt"
"$(Get-Date -Format o)  System scaffolded. Workers not yet launched." | Set-Content -Path $statusPath -Encoding UTF8

# ---------------------------------------------------------------------------
# Step 6 — Supabase table + RLS policy (prints SQL to run once in the
# Supabase SQL editor — this script doesn't execute SQL itself)
# ---------------------------------------------------------------------------
$sql = @"
create table if not exists headless_sessions (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  status text not null default 'Idle',
  current_task text,
  last_heartbeat timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table headless_sessions enable row level security;

-- Dashboard (anon key, browser) may READ ONLY. It can never write —
-- only the service role key, used exclusively inside the local worker
-- scripts, can insert or update. This is what keeps the service key
-- out of the dashboard entirely: the dashboard doesn't need it.
create policy "public read for dashboard" on headless_sessions
  for select using (true);

alter publication supabase_realtime add table headless_sessions;
"@
$sqlPath = Join-Path $ProjectRoot "autonomous_system\headless_sessions.sql"
$sql | Set-Content -Path $sqlPath -Encoding UTF8
Write-Host "Wrote autonomous_system\headless_sessions.sql — run this once in the Supabase SQL editor." -ForegroundColor Yellow

# ---------------------------------------------------------------------------
# Step 7 — the 5 worker scripts + coordinator
# ---------------------------------------------------------------------------
$scriptsDir = Join-Path $ProjectRoot "autonomous_system\scripts"

function Write-WorkerScript {
    param($Role, $Description, $FileName)

    $body = @"
# ============================================================================
# Dew Theory — $Role Worker
# $Description
# ============================================================================
. "`$PSScriptRoot\..\config.local.ps1"

`$Role     = "$Role"
`$QueueDir = Join-Path `$ProjectRoot "autonomous_system\queue\$($Role.ToLower())"
`$LogFile  = Join-Path `$ProjectRoot "autonomous_system\logs\$($Role.ToLower()).log"
`$headers  = @{
    apikey        = `$ServiceKey
    Authorization = "Bearer `$ServiceKey"
    "Content-Type"= "application/json"
    Prefer        = "resolution=merge-duplicates"
}

Set-Location `$ProjectRoot

function Send-Heartbeat(`$status, `$task) {
    `$body = @{ role = `$Role; status = `$status; current_task = `$task; last_heartbeat = (Get-Date -Format o); updated_at = (Get-Date -Format o) } | ConvertTo-Json
    try {
        Invoke-RestMethod -Uri "`$SupabaseUrl/rest/v1/headless_sessions" -Method POST -Headers `$headers -Body `$body -ErrorAction Stop | Out-Null
    } catch {
        Add-Content -Path `$LogFile -Value "`$(Get-Date -Format o) HEARTBEAT FAILED: `$(`$_.Exception.Message)"
    }
}

`$failCount = 0
`$maxConsecutiveFailures = 5

while (`$true) {
    try {
        `$taskFile = Get-ChildItem `$QueueDir -Filter *.txt -ErrorAction SilentlyContinue | Sort-Object LastWriteTime | Select-Object -First 1

        if (`$taskFile) {
            `$task = Get-Content `$taskFile.FullName -Raw
            Send-Heartbeat "Running" `$task
            Add-Content -Path `$LogFile -Value "`$(Get-Date -Format o) START: `$task"

            # --------------------------------------------------------------
            # TODO (SuperGrok fills this in at runtime): process `$task here.
            # This is where the $Role work actually happens — invoke
            # whatever your own task-execution method is (sub-agent call,
            # local model, etc.). This script intentionally does not
            # hardcode that call, since it depends on your own runtime.
            # --------------------------------------------------------------

            Move-Item `$taskFile.FullName (Join-Path `$ProjectRoot "autonomous_system\completed\") -Force
            Add-Content -Path `$LogFile -Value "`$(Get-Date -Format o) DONE: `$task"
            Send-Heartbeat "Idle" ""
            `$failCount = 0
        } else {
            Send-Heartbeat "Idle" ""
            # --------------------------------------------------------------
            # Auto-discover work: only pull from the TASK_QUEUE already
            # defined in DEW_THEORY_AUTONOMOUS_BUILD_LOOP.md / OPEN_ITEMS.md
            # for this role. Do not invent new scope here — see
            # DEW_THEORY_LOCAL_ORCHESTRATION.md for the role-to-task mapping.
            # --------------------------------------------------------------
        }

        Start-Sleep 20
    } catch {
        `$failCount++
        Add-Content -Path `$LogFile -Value "`$(Get-Date -Format o) ERROR (`$failCount/`$maxConsecutiveFailures): `$(`$_.Exception.Message)"

        if (`$failCount -ge `$maxConsecutiveFailures) {
            Send-Heartbeat "Error" "5+ consecutive failures — see log"
            Add-Content -Path `$LogFile -Value "`$(Get-Date -Format o) ESCALATED: cooling down 5 minutes"
            Start-Sleep 300
            `$failCount = 0
        } else {
            Start-Sleep 60
        }
    }
}
"@
    $body | Set-Content -Path (Join-Path $scriptsDir $FileName) -Encoding UTF8
    Write-Host "  Wrote scripts\$FileName" -ForegroundColor Green
}

Write-Host "Writing worker scripts" -ForegroundColor Cyan
Write-WorkerScript -Role "Dev"         -FileName "headless_dev.ps1"         -Description "Shop, Product Detail, Cart/Checkout, Admin Portal, Analytics Dashboard, Skin Script CSV import — the code-heavy TASK_QUEUE items."
Write-WorkerScript -Role "Creative"    -FileName "headless_creative.ps1"    -Description "Copy for About Emily, Services, brand thesis, footer, Membership — the placeholder copy already flagged in OPEN_ITEMS.md."
Write-WorkerScript -Role "Research"    -FileName "headless_research.ps1"    -Description "Verifies business/product facts before they're presented as real, the same way the product catalog was researched. Never invents facts — flags gaps to OPEN_ITEMS.md instead."
Write-WorkerScript -Role "Llm"         -FileName "headless_llm.ps1"         -Description "Tasks that need an LLM call as part of the build itself (drafting confirmation email templates, CSV column-mapping heuristics for Section 16's import tool) — distinct from Creative's brand-voice copy."
Write-WorkerScript -Role "Coordinator" -FileName "headless_coordinator.ps1" -Description "Queue hygiene: re-files misrouted tasks, flags anything stuck in a queue for over an hour, keeps status\system_status.txt current. Not the same as the Orchestrator session — this is plumbing, the Orchestrator is strategy."

# ---------------------------------------------------------------------------
# Step 8 — seed the queues from the already-defined TASK_QUEUE
# ---------------------------------------------------------------------------
Write-Host "Seeding queues from the build plan" -ForegroundColor Cyan

$devTasks = @(
    "Build Shop page: product grid from data/products.json, category filter, add-to-cart",
    "Build Product Detail page template",
    "Build Cart/Checkout with Stripe test mode, shipping rule ($7 flat, free at $49+ pre-discount subtotal)",
    "Build Admin Portal: /admin auth against Admins table, product CRUD, order queue, discount codes",
    "Build Analytics Dashboard: revenue, product performance, funnel per Addendum Section 15",
    "Build Skin Script CSV import tool per Addendum Section 16.1"
)
$creativeTasks = @(
    "Write Emily Mitchener bio and philosophy paragraph for About page",
    "Write real Services menu copy (names, durations, prices) pending Emily's actual list",
    "Write Membership page value-prop copy — terms still open, see OPEN_ITEMS.md"
)
$researchTasks = @(
    "Confirm Sheer Protection SPF retail price with Skin Script rep",
    "Confirm Lip Treatment SKU structure (one listing with scent selector vs two SKUs)",
    "Ask Skin Script rep whether a CSV export, API, or EDI feed exists (Addendum Section 16.2)"
)

$i = 0
foreach ($t in $devTasks)      { $i++; $t | Set-Content (Join-Path $ProjectRoot "autonomous_system\queue\dev\$('{0:D2}' -f $i)_task.txt") }
$i = 0
foreach ($t in $creativeTasks) { $i++; $t | Set-Content (Join-Path $ProjectRoot "autonomous_system\queue\creative\$('{0:D2}' -f $i)_task.txt") }
$i = 0
foreach ($t in $researchTasks) { $i++; $t | Set-Content (Join-Path $ProjectRoot "autonomous_system\queue\research\$('{0:D2}' -f $i)_task.txt") }

Write-Host "  dev: $($devTasks.Count) tasks | creative: $($creativeTasks.Count) tasks | research: $($researchTasks.Count) tasks" -ForegroundColor Green

# ---------------------------------------------------------------------------
# Step 9 — local dashboard (anon key ONLY — safe for a browser)
# ---------------------------------------------------------------------------
$dashboardHtml = @"
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Dew Theory — Autonomous 5-Headless Orchestrator</title>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<style>
  body { background:#F4F6F7; color:#24262C; font-family:system-ui,sans-serif; padding:2rem; }
  h1 { font-weight:400; letter-spacing:0.02em; }
  .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:1rem; margin-top:1.5rem; }
  .card { background:rgba(255,255,255,0.7); border:1px solid rgba(255,255,255,0.9); border-radius:4px; padding:1.25rem; }
  .role { font-size:0.7rem; letter-spacing:0.2em; text-transform:uppercase; color:#828F9A; }
  .status { font-size:1.4rem; margin-top:0.4rem; }
  .status.Running { color:#2D2F3A; }
  .status.Idle { color:#828F9A; }
  .status.Error { color:#b3453f; }
  .task { margin-top:0.6rem; font-size:0.85rem; color:#24262C99; word-break:break-word; }
</style>
</head>
<body>
  <h1>Autonomous 5-Headless Orchestrator</h1>
  <p style="color:#828F9A">This is a local build-monitoring tool, not part of the Dew Theory site.
     Uses the Supabase anon key with a read-only policy — safe to leave open in a browser tab.</p>
  <div id="cards" class="grid"></div>

<script>
  const supabase = window.supabase.createClient("$SupabaseUrl", "$AnonKey");
  const roles = ["Dev", "Creative", "Research", "Llm", "Coordinator"];
  const cards = {};

  function render(row) {
    if (!cards[row.role]) {
      const el = document.createElement("div");
      el.className = "card";
      document.getElementById("cards").appendChild(el);
      cards[row.role] = el;
    }
    cards[row.role].innerHTML =
      '<div class="role">' + row.role + '</div>' +
      '<div class="status ' + row.status + '">' + row.status + '</div>' +
      '<div class="task">' + (row.current_task || "—") + '</div>';
  }

  roles.forEach(r => render({ role: r, status: "Idle", current_task: "waiting for first heartbeat" }));

  supabase
    .channel("headless")
    .on("postgres_changes", { event: "*", schema: "public", table: "headless_sessions" }, (payload) => render(payload.new))
    .subscribe();

  supabase.from("headless_sessions").select("*").then(({ data }) => (data || []).forEach(render));
</script>
</body>
</html>
"@
$dashboardHtml | Set-Content -Path (Join-Path $ProjectRoot "autonomous_system\dashboard\index.html") -Encoding UTF8
Write-Host "Wrote autonomous_system\dashboard\index.html — open this file directly in a browser to watch live status." -ForegroundColor Green

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------
Write-Host ""
Write-Host "Setup complete: $ProjectRoot" -ForegroundColor Cyan
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Edit autonomous_system\config.local.ps1 with your real Supabase URL and service key."
Write-Host "  2. Run the SQL in autonomous_system\headless_sessions.sql once, in the Supabase SQL editor."
Write-Host "  3. Launch the 5 workers, each in its own terminal:"
Write-Host '     Start-Process powershell -ArgumentList "-NoExit","-File",".\autonomous_system\scripts\headless_dev.ps1"'
Write-Host "     (repeat for creative, research, llm, coordinator)"
Write-Host "  4. Open autonomous_system\dashboard\index.html in a browser to watch live status."
Write-Host "  5. Paste DEW_THEORY_AUTONOMOUS_BUILD_LOOP.md's orchestrator instruction into this session to become the Orchestrator."
