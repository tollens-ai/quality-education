// Typography audit: renders the film every `step` seconds with the lettering record on and writes one
// JSON line per sung word being drawn: its box, cap height, how far it is written, the sung word it
// shows, and how well its ink stands out from what is behind it (WCAG contrast of the ink against the
// median of the box's pixels). typo-report.py judges the result.
//
//   node video/ep03/polka/tools/typo-audit.mjs [--step 0.1] [--w 540] [--from 0] [--to 214] > audit.jsonl
//   node video/ep03/polka/tools/typo-audit.mjs --fps 30 --w 120 --from 0 --to 71 > audit.jsonl    (every film frame, exact)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require(path.join(process.env.NODE_GLOBAL || '/usr/lib/node_modules', 'playwright'))); }

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, all) =>
  a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]]] : acc, []));
const step = +(args.step || .1), w = +(args.w || 540), from = +(args.from || 0), to = +(args.to || 214);
const fps = args.fps ? +args.fps : 0;      // with --fps N, sample every frame of an N fps film at exactly k/N
const root = process.cwd();
const types = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.html': 'text/html', '.json': 'application/json', '.png': 'image/png', '.ttf': 'font/ttf' };
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(root) || !fs.existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
}).listen(0);
const browser = await chromium.launch({ args: ['--disable-dev-shm-usage'] });
const page = await browser.newPage({ viewport: { width: w + 40, height: Math.round(w * 16 / 9) + 80 } });
page.on('pageerror', e => console.error('page error:', e.message));
const q = args.query ? '&' + args.query : '';
await page.goto(`http://localhost:${server.address().port}/video/lib/player.html?scene=/video/ep03/polka/${args.scene || 'main.js'}&song=/music/ep03&w=${w}&render=1${q}`);
await page.waitForFunction(() => window.ready === true, null, { timeout: 60000 });
const end = Math.min(to, await page.evaluate(() => window.duration));
const k0 = fps ? Math.ceil(from * fps - 1e-9) : 0;
for (let i = 0; fps ? (k0 + i) / fps < end : from + i * step < end; i++) {
  const t = fps ? (k0 + i) / fps : +(from + i * step).toFixed(3);
  const recs = await page.evaluate(t => {
    const A = window.__audit;
    A.on = true; A.rec = [];
    window.renderAt(t);
    const cv = document.getElementById('c'), ctx = cv.getContext('2d');
    const k = cv.width / 1080;
    const inJoin = (window.__joins || []).some(([a, b]) => t >= a && t < b);
    const lin = c => { c /= 255; return c <= .03928 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4); };
    const lumRGB = (r, g, b) => .2126 * lin(r) + .7152 * lin(g) + .0722 * lin(b);
    const hex = h => { const v = parseInt(h.slice(1), 16); return [v >> 16 & 255, v >> 8 & 255, v & 255]; };
    const ratio = (a, b) => (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
    return A.rec.map(r => {
      const x0 = Math.max(0, Math.floor(r.x * k)), y0 = Math.max(0, Math.floor((r.y - r.size) * k));
      const x1 = Math.min(cv.width, Math.ceil((r.x + r.w) * k)), y1 = Math.min(cv.height, Math.ceil(r.y * k));
      let contrast = null;
      // (Outlined bubble letters carry their own edge, so only plain words are measured against the page.)
      if (!inJoin && r.kind === 'word' && x1 - x0 > 3 && y1 - y0 > 3 && r.prog >= .98) {
        const d = ctx.getImageData(x0, y0, x1 - x0, y1 - y0).data, L = [];
        for (let j = 0; j < d.length; j += 16) L.push(lumRGB(d[j], d[j + 1], d[j + 2]));
        L.sort((a, b) => a - b);
        const med = L[L.length >> 1];
        const ink = r.fill && r.kind === 'tail' ? r.fill : r.col;
        if (typeof ink === 'string' && ink[0] === '#') { const [a, b, c] = hex(ink); contrast = +ratio(lumRGB(a, b, c), med).toFixed(2); }
      }
      return { t, kind: r.kind, str: r.str, x: +r.x.toFixed(1), y: +r.y.toFixed(1), size: +r.size.toFixed(1), w: +r.w.toFixed(1), s: r.s, v: r.v, li: r.li, wi: r.wi, prog: +r.prog.toFixed(3), alpha: +(r.alpha ?? 1).toFixed(3), contrast, inJoin };
    });
  }, t);
  for (const r of recs) console.log(JSON.stringify(r));
}
await browser.close();
server.close();
