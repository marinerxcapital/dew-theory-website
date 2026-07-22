/**
 * Dew Theory — Live Agent Ops Dashboard
 * Local-only observer for Emily: watch the main agent + subagents in real time.
 *
 *   node agent-ops-dashboard/server.mjs
 *   open http://127.0.0.1:3847
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.AGENT_OPS_PORT || 3847);
const HOST = process.env.AGENT_OPS_HOST || '127.0.0.1';
const DATA_DIR = path.join(__dirname, 'data');
const EVENTS_FILE = path.join(DATA_DIR, 'events.jsonl');
const STATE_FILE = path.join(DATA_DIR, 'state.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(EVENTS_FILE)) fs.writeFileSync(EVENTS_FILE, '');
if (!fs.existsSync(STATE_FILE)) {
  fs.writeFileSync(
    STATE_FILE,
    JSON.stringify(
      {
        mission: 'Awaiting mission…',
        project: 'Dew Theory',
        startedAt: null,
        agents: {},
        stats: { events: 0, tools: 0, files: 0, subagents: 0 }
      },
      null,
      2
    )
  );
}

/** @type {Set<http.ServerResponse>} */
const sseClients = new Set();

function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return { mission: '', project: 'Dew Theory', agents: {}, stats: {} };
  }
}

function writeState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function appendEvent(evt) {
  const line = JSON.stringify(evt) + '\n';
  fs.appendFileSync(EVENTS_FILE, line);
  const payload = `event: agent\ndata: ${JSON.stringify(evt)}\n\n`;
  for (const res of sseClients) {
    try {
      res.write(payload);
    } catch {
      sseClients.delete(res);
    }
  }
}

function broadcastState() {
  const state = readState();
  const payload = `event: state\ndata: ${JSON.stringify(state)}\n\n`;
  for (const res of sseClients) {
    try {
      res.write(payload);
    } catch {
      sseClients.delete(res);
    }
  }
}

function normalizeEvent(body) {
  const now = new Date().toISOString();
  const evt = {
    id: body.id || `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    ts: body.ts || now,
    agent: body.agent || 'orchestrator',
    role: body.role || 'main',
    type: body.type || 'info',
    title: body.title || body.message || 'Update',
    detail: body.detail || body.message || '',
    status: body.status || 'active',
    meta: body.meta || {}
  };

  const state = readState();
  if (!state.startedAt) state.startedAt = now;
  if (body.mission) state.mission = body.mission;
  if (body.project) state.project = body.project;

  if (!state.agents) state.agents = {};
  const agentId = evt.agent;
  if (!state.agents[agentId]) {
    state.agents[agentId] = {
      id: agentId,
      role: evt.role,
      status: 'idle',
      lastTitle: '',
      lastTs: now,
      eventCount: 0
    };
    if (evt.role === 'subagent') {
      state.stats.subagents = (state.stats.subagents || 0) + 1;
    }
  }
  const a = state.agents[agentId];
  a.role = evt.role || a.role;
  a.status = evt.status || a.status;
  a.lastTitle = evt.title;
  a.lastTs = evt.ts;
  a.eventCount = (a.eventCount || 0) + 1;
  if (evt.type === 'tool') state.stats.tools = (state.stats.tools || 0) + 1;
  if (evt.type === 'file') state.stats.files = (state.stats.files || 0) + 1;
  state.stats.events = (state.stats.events || 0) + 1;
  writeState(state);
  appendEvent(evt);
  broadcastState();
  return evt;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store'
  });
  res.end(body);
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return (
    {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.svg': 'image/svg+xml',
      '.json': 'application/json',
      '.png': 'image/png',
      '.webp': 'image/webp'
    }[ext] || 'application/octet-stream'
  );
}

function tailEvents(limit = 200) {
  try {
    const raw = fs.readFileSync(EVENTS_FILE, 'utf8').trim();
    if (!raw) return [];
    const lines = raw.split('\n');
    return lines
      .slice(-limit)
      .map((l) => {
        try {
          return JSON.parse(l);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${HOST}:${PORT}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  // Live event stream
  if (url.pathname === '/api/stream' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    res.write(`event: hello\ndata: ${JSON.stringify({ ok: true, ts: new Date().toISOString() })}\n\n`);
    res.write(`event: state\ndata: ${JSON.stringify(readState())}\n\n`);
    for (const evt of tailEvents(120)) {
      res.write(`event: agent\ndata: ${JSON.stringify(evt)}\n\n`);
    }
    sseClients.add(res);
    const ping = setInterval(() => {
      try {
        res.write(`: ping ${Date.now()}\n\n`);
      } catch {
        clearInterval(ping);
      }
    }, 15000);
    req.on('close', () => {
      clearInterval(ping);
      sseClients.delete(res);
    });
    return;
  }

  if (url.pathname === '/api/state' && req.method === 'GET') {
    return sendJson(res, 200, readState());
  }

  if (url.pathname === '/api/events' && req.method === 'GET') {
    const limit = Math.min(Number(url.searchParams.get('limit') || 200), 1000);
    return sendJson(res, 200, { events: tailEvents(limit) });
  }

  if (url.pathname === '/api/event' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      const evt = normalizeEvent(body);
      return sendJson(res, 200, { ok: true, event: evt });
    } catch (e) {
      return sendJson(res, 400, { ok: false, error: String(e.message || e) });
    }
  }

  if (url.pathname === '/api/batch' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      const list = Array.isArray(body.events) ? body.events : [body];
      const out = list.map((e) => normalizeEvent(e));
      return sendJson(res, 200, { ok: true, count: out.length });
    } catch (e) {
      return sendJson(res, 400, { ok: false, error: String(e.message || e) });
    }
  }

  if (url.pathname === '/api/reset' && req.method === 'POST') {
    fs.writeFileSync(EVENTS_FILE, '');
    writeState({
      mission: 'Session reset',
      project: 'Dew Theory',
      startedAt: new Date().toISOString(),
      agents: {},
      stats: { events: 0, tools: 0, files: 0, subagents: 0 }
    });
    broadcastState();
    appendEvent({
      id: `evt_reset_${Date.now()}`,
      ts: new Date().toISOString(),
      agent: 'orchestrator',
      role: 'main',
      type: 'system',
      title: 'Dashboard reset',
      detail: 'Event log cleared for a fresh demo',
      status: 'active',
      meta: {}
    });
    return sendJson(res, 200, { ok: true });
  }

  // Static files
  let rel = url.pathname === '/' ? '/index.html' : url.pathname;
  rel = path.normalize(rel).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(PUBLIC_DIR, rel);
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('Not found');
  }
  res.writeHead(200, { 'Content-Type': contentType(filePath), 'Cache-Control': 'no-store' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, HOST, () => {
  const url = `http://${HOST}:${PORT}`;
  console.log(`[agent-ops] Live dashboard → ${url}`);
  console.log(`[agent-ops] POST events → ${url}/api/event`);
  console.log(`[agent-ops] SSE stream → ${url}/api/stream`);

  // Boot event so the UI is never empty
  normalizeEvent({
    agent: 'orchestrator',
    role: 'main',
    type: 'system',
    status: 'active',
    mission: 'Live multi-agent session — Dew Theory',
    title: 'Dashboard online',
    detail: 'Waiting for agent activity. Emily can watch this screen in real time.',
    meta: { url }
  });
});

process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});
