# Agent Ops Dashboard (local)

Live HTML dashboard so Emily (or anyone at the desk) can watch the main Grok agent and subagents work in real time.

## Start

```bash
node agent-ops-dashboard/server.mjs
```

Open: **http://127.0.0.1:3847**

Localhost only — not exposed to the internet.

## Emit events

```bash
node agent-ops-dashboard/emit.mjs --agent orchestrator --title "Planning hero video swap" --detail "Inspecting assets"
node agent-ops-dashboard/emit.mjs --agent video-1 --role subagent --type tool --title "ffmpeg encode" --status active
```

Or `POST http://127.0.0.1:3847/api/event` with JSON:

```json
{
  "agent": "docs-3",
  "role": "subagent",
  "type": "file",
  "status": "active",
  "title": "Updating OPEN_ITEMS.md",
  "detail": "Hero video dimensions note",
  "mission": "Replace landing hero video"
}
```

## Endpoints

| Path | Purpose |
|------|---------|
| `/` | Dashboard UI |
| `/api/stream` | Server-Sent Events (live) |
| `/api/event` | POST one event |
| `/api/batch` | POST `{ "events": [...] }` |
| `/api/state` | Current agent map + stats |
| `/api/reset` | Clear log for a fresh demo |
