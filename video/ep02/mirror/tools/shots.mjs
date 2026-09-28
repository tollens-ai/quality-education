// List the film's shot boundaries and any gap or overlap between them, so no stretch of the song
// goes undrawn and no two shots fight over a moment.
//
//   node video/ep02/mirror/tools/shots.mjs
//
// Run from the repo root on a machine with Playwright's Chromium.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require(path.join(process.env.NODE_GLOBAL || '/usr/lib/node_modules', 'playwright'))); }
const root = process.cwd();
const types = { '.js': 'text/javascript', '.json': 'application/json', '.ttf': 'font/ttf', '.html': 'text/html' };
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(root) || !fs.existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
}).listen(0);
const browser = await chromium.launch({ args: ['--disable-dev-shm-usage'] });
const page = await browser.newPage();
page.on('pageerror', e => console.error('page error:', e.message));
await page.goto(`http://localhost:${server.address().port}/video/lib/player.html?scene=/video/ep02/mirror/main.js&song=/music/ep02&w=270&render=1`);
await page.waitForFunction(() => window.ready === true, null, { timeout: 60000 });
const shots = await page.evaluate(() => window.__shots);
let prev = 0;
for (const [a, b] of shots) {
  if (Math.abs(a - prev) > .002) console.log(`${a > prev ? 'GAP' : 'OVERLAP'} ${prev.toFixed(3)} -> ${a.toFixed(3)}`);
  prev = Math.max(prev, b);
}
console.log(`${shots.length} shots; the last ends at ${prev.toFixed(3)} s`);
await browser.close();
server.close();
