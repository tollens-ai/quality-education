// Render a scene to stills, a contact sheet or an mp4, in headless Chromium.
//
//   node video/lib/render.mjs --scene video/ep01/fetch.js --song music/ep01 \
//     [--stills 0,3,27.2] [--sheet 3] [--video out.mp4 --audio take.mp3 --fps 12] \
//     [--from 0 --to 200] [--w 540] [--out out/dir]
//
// --sheet N lays out one frame every N seconds, 6 across, with timestamps: the quickest way to
// look at a whole one-shot at once. Needs Playwright; --video needs FFMPEG (path or on PATH).
// Run it from the repo root; it serves the repo over a local port.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require(path.join(process.env.NODE_GLOBAL || '/usr/lib/node_modules', 'playwright'))); }

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, all) =>
  a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]?.startsWith('--') || all[i + 1] === undefined ? true : all[i + 1]]] : acc, []));
const root = process.cwd();
const out = args.out || 'video/out';
fs.mkdirSync(out, { recursive: true });
const w = +(args.w || 540);

const types = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.html': 'text/html', '.json': 'application/json', '.mp3': 'audio/mpeg' };
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(root) || !fs.existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: w + 40, height: Math.round(w * 16 / 9) + 80 } });
page.on('pageerror', e => console.error('page error:', e.message));
page.on('console', m => { if (m.type() === 'error') console.error('console:', m.text()); });
const url = `http://localhost:${port}/video/lib/player.html?scene=/${args.scene}&song=/${args.song}&w=${w}`;
await page.goto(url);
await page.waitForFunction(() => window.ready === true, null, { timeout: 30000 });
const duration = await page.evaluate(() => window.duration);
const from = +(args.from || 0), to = Math.min(+(args.to || duration), duration);
const name = path.basename(args.scene, '.js');

async function grab(t, type = 'png') {
  await page.evaluate(t => window.renderAt(t), t);
  const data = await page.evaluate(type => document.getElementById('c').toDataURL(`image/${type}`, 0.88), type);
  return Buffer.from(data.split(',')[1], 'base64');
}

if (args.stills) {
  for (const t of String(args.stills).split(',').map(Number)) {
    const f = path.join(out, `${name}-${t.toFixed(2)}.png`);
    fs.writeFileSync(f, await grab(t));
    console.log(f);
  }
}

if (args.sheet) {
  const step = +args.sheet, times = [];
  for (let t = from; t < to; t += step) times.push(+t.toFixed(2));
  const cols = 6, tw = 180, th = 320;
  const tiles = [];
  for (const t of times) tiles.push((await grab(t, 'jpeg')).toString('base64'));
  const sheet = await page.evaluate(async ({ tiles, times, cols, tw, th }) => {
    const rows = Math.ceil(tiles.length / cols);
    const c = document.createElement('canvas'); c.width = cols * tw; c.height = rows * (th + 22);
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
    for (let i = 0; i < tiles.length; i++) {
      const img = new Image(); img.src = 'data:image/jpeg;base64,' + tiles[i]; await img.decode();
      const x = (i % cols) * tw, y = Math.floor(i / cols) * (th + 22);
      g.drawImage(img, x, y + 22, tw - 4, th - 4);
      g.fillStyle = '#000'; g.font = '15px monospace'; g.fillText(`${times[i].toFixed(1)}s`, x + 4, y + 16);
    }
    return c.toDataURL('image/jpeg', 0.85);
  }, { tiles, times, cols, tw, th });
  const f = path.join(out, `${name}-sheet-${from}-${to}.jpg`);
  fs.writeFileSync(f, Buffer.from(sheet.split(',')[1], 'base64'));
  console.log(f);
}

if (args.video) {
  const fps = +(args.fps || 12);
  const ff = spawn(process.env.FFMPEG || 'ffmpeg', [
    '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    ...(args.audio ? ['-ss', String(from), '-t', String(to - from), '-i', args.audio] : []),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '23', ...(args.audio ? ['-c:a', 'aac', '-shortest'] : []),
    args.video,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n = Math.floor((to - from) * fps);
  for (let i = 0; i < n; i++) {
    const buf = await grab(from + i / fps, 'jpeg');
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % (fps * 20) === 0) console.log(`frame ${i}/${n}`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  console.log(args.video);
}

await browser.close();
server.close();
