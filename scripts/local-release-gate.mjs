#!/usr/bin/env node
/**
 * Local CI replacement — must pass before local main merge.
 * NO GitHub Actions.
 */
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(ROOT, '.artifacts/release');
fs.mkdirSync(outDir, { recursive: true });

function run(name, cmd, args) {
  const started = Date.now();
  const res = spawnSync(cmd, args, {
    cwd: ROOT,
    encoding: 'utf8',
    shell: process.platform === 'win32',
    env: process.env,
    maxBuffer: 20 * 1024 * 1024
  });
  return {
    name,
    ok: res.status === 0,
    status: res.status,
    ms: Date.now() - started,
    stdout_tail: (res.stdout || '').slice(-2000),
    stderr_tail: (res.stderr || '').slice(-2000)
  };
}

const steps = [];
steps.push(run('npm_test', 'npm', ['test']));
steps.push(run('continuity', 'npm', ['run', 'continuity']));
steps.push(run('build', 'npm', ['run', 'build']));

const report = {
  generated_at: new Date().toISOString(),
  ok: steps.every((s) => s.ok),
  steps: steps.map(({ name, ok, status, ms }) => ({ name, ok, status, ms }))
};

fs.writeFileSync(path.join(outDir, 'local-release-gate-report.json'), JSON.stringify({ ...report, steps }, null, 2));
fs.writeFileSync(
  path.join(outDir, 'local-release-gate-report.md'),
  [
    '# Local Release Gate',
    '',
    `Generated: ${report.generated_at}`,
    `Overall: ${report.ok ? 'PASS' : 'FAIL'}`,
    '',
    ...report.steps.map((s) => `- ${s.ok ? 'PASS' : 'FAIL'}: ${s.name} (${s.ms}ms)`)
  ].join('\n')
);

console.log(JSON.stringify(report, null, 2));
process.exit(report.ok ? 0 : 1);
