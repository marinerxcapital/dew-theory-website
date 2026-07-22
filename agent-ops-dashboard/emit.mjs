/**
 * Post an event to the live Agent Ops dashboard.
 *
 *   node agent-ops-dashboard/emit.mjs --agent orchestrator --title "Hello"
 *   node agent-ops-dashboard/emit.mjs --json '{"agent":"dev-1","role":"subagent","type":"tool","title":"Reading Hero.jsx"}'
 */
const BASE = process.env.AGENT_OPS_URL || 'http://127.0.0.1:3847';

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') {
      out.json = argv[++i];
    } else if (a.startsWith('--')) {
      const key = a.slice(2);
      out[key] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
    }
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
let body;
if (args.json) {
  body = JSON.parse(args.json);
} else {
  body = {
    agent: args.agent || 'orchestrator',
    role: args.role || 'main',
    type: args.type || 'info',
    status: args.status || 'active',
    title: args.title || 'Update',
    detail: args.detail || '',
    mission: args.mission,
    meta: {}
  };
}

const res = await fetch(`${BASE}/api/event`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
});
const data = await res.json();
if (!res.ok) {
  console.error(data);
  process.exit(1);
}
console.log(JSON.stringify(data.event, null, 2));
