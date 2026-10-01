// Record every sung word as the film letters it, every `step` seconds, as JSON lines.
//   node video/ep04/ball/tools/typo-audit.mjs --from 0 --to 191 --step .1 > audit.jsonl
// Each line: {t, words: [{w, s, x0, x1, y0, y1, size, a, full}]} in master pixels. typo-report.py judges it.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(path.join(process.env.NODE_GLOBAL || '/usr/lib/node_modules', 'playwright'))); }
const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, all) => a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]]] : acc, []));
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
// the lyric is drawn over every shot whatever the parts, so --query part=intro (any one part) makes it fast
const query = args.query ? `&${args.query}` : '';
await page.goto(`http://localhost:${server.address().port}/video/lib/player.html?scene=/video/ep04/ball/main.js&song=/music/ep04/piano&w=135&render=1${query}`);
await page.waitForFunction(() => window.ready === true, null, { timeout: 60000 });
const from = +(args.from || 0), to = +(args.to || 191), step = +(args.step || .1);
for (let k = Math.round(from / step); k * step < to; k++) {
  const t = +(k * step).toFixed(3);
  const words = await page.evaluate(t => { window.__typo = []; window.renderAt(t); const w = window.__typo; window.__typo = null; return w; }, t);
  process.stdout.write(JSON.stringify({ t, words }) + '\n');
}
await browser.close(); server.close();
