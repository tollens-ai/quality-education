// Run the typography audit: every sung word, every tenth of a second, judged on size, time on
// screen, the platform UI's corners, cover, and reading order. Writes JSONL for typo-report.py.
//
//   node tools/audit.mjs 0 100 2>&1 | tail -3
//   node tools/audit.mjs 100 200.74
//
// Three ranges in parallel on a big box; VIDEO.md's pitfalls say so.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require(path.join(process.env.NODE_GLOBAL || '/usr/lib/node_modules', 'playwright'))); }

const from = Number(process.argv[2] ?? 0);
const to = Number(process.argv[3] ?? 200.74);
const STEP = 0.1;
const root = process.cwd();
const out = `video/out/audit-${from}-${to}.jsonl`;

const types = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.html': 'text/html', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(root) || !fs.existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch({ args: ['--disable-dev-shm-usage'] });
const page = await browser.newPage({ viewport: { width: 580, height: 1071 } });
page.on('pageerror', e => console.error('page error:', e.message));
await page.goto(`http://localhost:${port}/video/lib/player.html?scene=/video/ep01/counter/tools/audit-scene.js&song=/music/ep01&w=540&render=1`);
await page.waitForFunction(() => window.ready === true, null, { timeout: 60000 });

fs.mkdirSync('video/out', { recursive: true });
const fh = fs.createWriteStream(out);
let n = 0;
for (let t = from; t < to; t += STEP) {
  const recs = await page.evaluate(tt => { window.renderAt(tt); return window.__audit || []; }, +t.toFixed(2));
  for (const r of recs) fh.write(JSON.stringify(r) + '\n');
  n += recs.length;
  if (Math.round(t * 10) % 200 === 0) console.error(`  ${t.toFixed(1)}s  ${n} records`);
}
fh.end();
console.error(`${from}-${to}s -> ${out} (${n} records)`);

await browser.close();
server.close();