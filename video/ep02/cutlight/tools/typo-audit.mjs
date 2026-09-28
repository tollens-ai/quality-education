// Typography audit: renders the film every `step` seconds and records every sung word as it's
// drawn: its box, cap height and angle on screen, how far it's cut, which lyric word it is, and,
// against the finished frame, how well its letter faces stand out from what's round them (edge)
// and how much of them something drawn later covers (hidden). One JSON line per frame, for
// typo-report.py to judge.
//
//   node video/ep02/cutlight/tools/typo-audit.mjs [--step 0.1] [--w 540] [--from 0] [--to 175] > audit.jsonl
//
// Words cut out of the mirror come with their pieces as screen polygons (_polys); lettering drawn
// flat (handwriting) with a box only (_rect), which gets no edge check.
const SCENE = '/video/ep02/cutlight/main.js', SONG = '/music/ep02';
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
const step = +(args.step || .1), w = +(args.w || 540), from = +(args.from || 0), to = +(args.to || 176);
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
await page.goto(`http://localhost:${server.address().port}/video/lib/player.html?scene=${SCENE}&song=${SONG}&w=${w}&render=1`);
await page.waitForFunction(() => window.ready === true, null, { timeout: 60000 });
const end = Math.min(to, await page.evaluate(() => window.duration));
for (let i = 0; from + i * step < end; i++) {
  const t = +(from + i * step).toFixed(3);
  const recs = await page.evaluate(t => {
    const A = window.__typo;
    A.on = true; A.recs = [];
    window.renderAt(t);
    const cv = document.getElementById('c'), ctx = cv.getContext('2d');
    const k = cv.width / 1080;
    const lin = c => { c /= 255; return c <= .03928 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4); };
    const lum = (d, i) => .2126 * lin(d[i]) + .7152 * lin(d[i + 1]) + .0722 * lin(d[i + 2]);
    const ratio = (a, b) => (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
    const out = A.recs.map(r => {
      let edge = null, hidden = null, faceL = null, bgL = null;
      if (r._polys) {
        let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
        for (const p of r._polys) for (const [x, y] of p) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
        const pad = Math.max(3, r.cap * .08);
        const X0 = Math.max(0, Math.floor((x0 - pad) * k)), Y0 = Math.max(0, Math.floor((y0 - pad) * k));
        const X1 = Math.min(cv.width, Math.ceil((x1 + pad) * k)), Y1 = Math.min(cv.height, Math.ceil((y1 + pad) * k));
        const w0 = X1 - X0, h0 = Y1 - Y0;
        if (w0 > 3 && h0 > 3) {
          const mc = document.createElement('canvas'); mc.width = w0; mc.height = h0;
          const mx = mc.getContext('2d');
          mx.setTransform(k, 0, 0, k, -X0, -Y0);
          mx.fillStyle = '#fff';
          for (const p of r._polys) { mx.beginPath(); p.forEach(([x, y], j) => j ? mx.lineTo(x, y) : mx.moveTo(x, y)); mx.closePath(); mx.fill(); }
          const md = mx.getImageData(0, 0, w0, h0).data, M = new Uint8Array(w0 * h0);
          for (let j = 0; j < M.length; j++) M[j] = md[j * 4 + 3];
          const d = ctx.getImageData(X0, Y0, w0, h0).data;
          // The ring: pixels just outside the letter faces.
          const rad = Math.max(1, Math.round(r.cap * k * .05));
          const hmax = new Uint8Array(w0 * h0), dil = new Uint8Array(w0 * h0);
          for (let y = 0; y < h0; y++) for (let x = 0; x < w0; x++) { let v = 0; for (let q = Math.max(0, x - rad); q <= Math.min(w0 - 1, x + rad); q++) if (M[y * w0 + q] > 128) { v = 1; break; } hmax[y * w0 + x] = v; }
          for (let y = 0; y < h0; y++) for (let x = 0; x < w0; x++) { let v = 0; for (let q = Math.max(0, y - rad); q <= Math.min(h0 - 1, y + rad); q++) if (hmax[q * w0 + x]) { v = 1; break; } dil[y * w0 + x] = v; }
          const faces = [];
          for (let j = 0; j < M.length; j++) if (M[j] > 230) faces.push(lum(d, j * 4));
          if (faces.length > 8) {
            faces.sort((a, b) => a - b);
            faceL = faces[faces.length >> 1];
            let n = 0, bad = 0, s = 0;
            for (let j = 0; j < M.length; j++) if (dil[j] && M[j] < 20) { n++; const l = lum(d, j * 4); s += l; if (ratio(l, faceL) < 2) bad++; }
            edge = n ? +(bad / n).toFixed(3) : null;
            bgL = n ? +(s / n).toFixed(3) : null;
            // Covered: face pixels gone dark. A cut letter shows the day behind it, so its face is
            // bright but not even; what's dark in it is something in front, or a shadow in the view.
            let off = 0;
            for (const f of faces) if (f < .06) off++;
            hidden = +(off / faces.length).toFixed(3);
          }
        }
      }
      const { _polys, _rect, ...rest } = r;
      return { ...rest, edge, hidden, faceL: faceL === null ? null : +faceL.toFixed(3), bgL, cap: +rest.cap.toFixed(1), rot: +rest.rot.toFixed(3), box: rest.box.map(v => Math.round(v)), base: rest.base.map(v => Math.round(v)) };
    });
    A.on = false; A.recs = [];
    return out;
  }, t);
  process.stdout.write(JSON.stringify({ t, recs }) + '\n');
  if (i % 200 === 0) console.error(`t=${t}`);
}
await browser.close();
server.close();
