// Check the film's one rule about words: while the song plays, the only lettering on screen is the
// lyric (and the two corner marks, and digits in a sum). Every fillText and strokeText call is
// recorded with the tag its drawer set (window.__textTag: 'lyric', 'marks', 'sum', 'endcard');
// anything untagged is a word that shouldn't be there.
//   node video/ep04/ball/tools/text-audit.mjs --from 0 --to 191 --step .25 [--query part=verse2]
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
await page.addInitScript(() => {
  for (const m of ['fillText', 'strokeText']) {
    const orig = CanvasRenderingContext2D.prototype[m];
    CanvasRenderingContext2D.prototype[m] = function (s, ...a) { if (window.__auditText) window.__auditText.push([String(s), window.__textTag || null]); return orig.call(this, s, ...a); };
  }
});
const query = args.query ? `&${args.query}` : '';
await page.goto(`http://localhost:${server.address().port}/video/lib/player.html?scene=/video/ep04/ball/main.js&song=/music/ep04/piano&w=135&render=1${query}`);
await page.waitForFunction(() => window.ready === true, null, { timeout: 90000 });
const from = +(args.from || 0), to = +(args.to || 191), step = +(args.step || .25), songEnd = 182.6;
const bad = new Map();
for (let k = Math.round(from / step); k * step < to; k++) {
  const t = +(k * step).toFixed(3);
  const rec = await page.evaluate(t => { window.__auditText = []; window.renderAt(t); const r = window.__auditText; window.__auditText = null; return r; }, t);
  for (const [s, tag] of rec) {
    const ok = tag === 'lyric' || tag === 'marks' || (tag === 'title' && t < 2.9) || (tag === 'sum' && /^[\d\s+=\-×÷?]+$/.test(s)) || (tag === 'endcard' && t >= songEnd);
    if (!ok && s.trim()) { const key = `${tag || 'untagged'}: ${s}`; if (!bad.has(key)) bad.set(key, []); bad.get(key).push(t); }
  }
}
console.log(bad.size ? `${bad.size} kinds of stray lettering:` : 'no stray lettering');
for (const [k, ts] of bad) console.log(`  ${k}  at ${ts.slice(0, 6).join(', ')}${ts.length > 6 ? ` (+${ts.length - 6})` : ''}`);
await browser.close(); server.close();
