// List the film's shots in order and any stretch with no shot (black) or two shots at once.
//   node video/ep04/ball/tools/coverage.mjs
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(path.join(process.env.NODE_GLOBAL || '/usr/lib/node_modules', 'playwright'))); }
const root = process.cwd();
const types = { '.js': 'text/javascript', '.json': 'application/json', '.html': 'text/html', '.ttf': 'font/ttf' };
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(root) || !fs.existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res);
}).listen(0);
const browser = await chromium.launch({ args: ['--disable-dev-shm-usage'] });
const page = await browser.newPage({ viewport: { width: 300, height: 600 } });
page.on('pageerror', e => console.error('page error:', e.message));
page.on('console', m => { if (m.type() === 'error') console.error('console:', m.text()); });
await page.goto(`http://localhost:${server.address().port}/video/lib/player.html?scene=/video/ep04/ball/main.js&song=/music/ep04/piano&w=135&render=1`);
await page.waitForFunction(() => window.ready === true, null, { timeout: 90000 });
const shots = await page.evaluate(() => window.__shots);
let end = 0, issues = 0;
for (const [a, b, id] of shots) {
  if (a > end + 1e-3) { console.log(`GAP  ${end.toFixed(2)}-${a.toFixed(2)} (${(a - end).toFixed(2)} s with no shot)`); issues++; }
  if (a < end - 1e-3) { console.log(`OVERLAP ${a.toFixed(2)}-${Math.min(b, end).toFixed(2)} before ${id}`); issues++; }
  console.log(`     ${a.toFixed(2)}-${b.toFixed(2)}  ${id}`);
  end = Math.max(end, b);
}
if (end < 190.6) { console.log(`GAP  ${end.toFixed(2)}-190.60 (to the end)`); issues++; }
console.log(`${shots.length} shots, ${issues} gaps or overlaps`);
await browser.close(); server.close();
