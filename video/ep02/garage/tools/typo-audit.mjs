// Typography audit: renders the film every `step` seconds and records every lettered string, with
// its cap height (master pixels), angle, the brightness and clutter behind it, whether anything was
// drawn over it afterwards, and which lyric word it is. Writes one JSON line per frame, for
// typo-report.py to judge.
//
//   node video/ep02/garage/tools/typo-audit.mjs [--step 0.1] [--w 540] [--from 0] [--to 175] > audit.jsonl
//
// Run from the repo root on a machine with Playwright's Chromium. On a small box, run three time
// ranges in parallel and join the files in order.

// Episode settings: change these when you copy the renderer for another episode.
const SCENE = '/video/ep02/garage/main.js', SONG = '/music/ep02';
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
const step = +(args.step || .1), w = +(args.w || 540), from = +(args.from || 0), to = +(args.to || 201);
const root = process.cwd();
const types = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.html': 'text/html', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ttf': 'font/ttf' };
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(root) || !fs.existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
}).listen(0);
const browser = await chromium.launch({ args: ['--disable-dev-shm-usage'] });
const page = await browser.newPage({ viewport: { width: w + 40, height: Math.round(w * 16 / 9) + 80 } });
page.on('pageerror', e => console.error('page error:', e.message));
await page.goto(`http://localhost:${server.address().port}/video/lib/player.html?scene=${SCENE}&song=${SONG}&w=${w}&render=1`);
await page.waitForFunction(() => window.ready === true, null, { timeout: 30000 });
const end = Math.min(to, await page.evaluate(() => window.duration));
for (let i = 0; from + i * step < end; i++) {
  const t = +(from + i * step).toFixed(3);
  const recs = await page.evaluate(t => {
    const A = window.__typo;
    A.on = true; A.recs = []; A.ctx = null;
    window.renderAt(t);
    const ctx = document.getElementById('c').getContext('2d');
    const lin = c => { c /= 255; return c <= .03928 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4); };
    const lum = (d, i) => .2126 * lin(d[i]) + .7152 * lin(d[i + 1]) + .0722 * lin(d[i + 2]);
    const ratio = (a, b) => (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
    const out = A.recs.map(r => {
      // In the finished frame: the letter faces (from the mask) against the ring of pixels right
      // round them. edge: how many ring pixels are too close to the face to tell apart (contrast
      // under 2). hidden: how many face pixels were painted over by something drawn later.
      let edge = null, hidden = null, faceL = null;
      if (r._mask && r.main) {
        const [x0, y0, w0, h0] = r._dev;
        const d = ctx.getImageData(x0, y0, w0, h0).data, M = r._mask;
        const rad = Math.max(1, Math.round(r.strokeW * .6));
        // Dilate the mask (separably) to find the ring.
        const hmax = new Uint8Array(w0 * h0), dil = new Uint8Array(w0 * h0);
        for (let y = 0; y < h0; y++) for (let x = 0; x < w0; x++) {
          let v = 0; for (let k = Math.max(0, x - rad); k <= Math.min(w0 - 1, x + rad); k++) if (M[y * w0 + k] > 128) { v = 1; break; }
          hmax[y * w0 + x] = v;
        }
        for (let y = 0; y < h0; y++) for (let x = 0; x < w0; x++) {
          let v = 0; for (let k = Math.max(0, y - rad); k <= Math.min(h0 - 1, y + rad); k++) if (hmax[k * w0 + x]) { v = 1; break; }
          dil[y * w0 + x] = v;
        }
        const faces = [];
        for (let i = 0; i < M.length; i++) if (M[i] > 230) faces.push(lum(d, i * 4));
        if (faces.length > 8) {
          faces.sort((a, b) => a - b);
          faceL = faces[faces.length >> 1];
          let n = 0, bad = 0;
          for (let i = 0; i < M.length; i++) if (dil[i] && M[i] < 20) { n++; if (ratio(lum(d, i * 4), faceL) < 2) bad++; }
          edge = n ? +(bad / n).toFixed(3) : null;
          const expected = faceL; let off = 0;
          for (const f of faces) if (ratio(f, expected) > 1.8) off++;
          hidden = +(off / faces.length).toFixed(3);
        }
      }
      const { _after, _dev, _mask, ...rest } = r;
      return { ...rest, edge, hidden, faceL: faceL === null ? null : +faceL.toFixed(3), cap: +rest.cap.toFixed(1), rot: +rest.rot.toFixed(3), bgL: rest.bgL === undefined ? null : +rest.bgL.toFixed(3), bgStd: rest.bgStd === undefined ? null : +rest.bgStd.toFixed(3), box: rest.box.map(v => Math.round(v)), base: rest.base.map(v => Math.round(v)) };
    });
    A.on = false; A.recs = [];
    return out;
  }, t);
  process.stdout.write(JSON.stringify({ t, recs }) + '\n');
  if (i % 200 === 0) console.error(`t=${t}`);
}
await browser.close();
server.close();
