// Builds a self-contained listening page: the audio plus the lyric grid, lighting up each
// syllable as it plays. Usage: node music/ep01/karaoke.mjs <audio.mp3> <events.json> <out.html>
import { readFileSync, writeFileSync } from 'node:fs';

const [audioPath, eventsPath, outPath] = process.argv.slice(2);
const audio = readFileSync(audioPath).toString('base64');
const events = readFileSync(eventsPath, 'utf8');

const html = `<!doctype html>
<meta charset="utf-8">
<title>Good for Who?: listening check</title>
<style>
  body { font: 16px/1.4 system-ui, sans-serif; background: #111; color: #ddd; margin: 0; padding: 20px; }
  header { position: sticky; top: 0; background: #111; padding-bottom: 10px; z-index: 1; }
  audio { width: 100%; }
  #now { font-size: 28px; margin: 8px 0; }
  #now b { color: #ffd54a; }
  .sec { margin-top: 24px; color: #8ab4f8; font-weight: 600; }
  .bar { display: grid; grid-template-columns: 48px 70px repeat(16, 1fr); gap: 2px; align-items: center; cursor: pointer; }
  .bar:hover { background: #1c1c1c; }
  .bar .n, .bar .c { color: #777; font-size: 12px; }
  .cell { min-height: 22px; font-size: 13px; padding: 1px 2px; border-left: 1px solid #222; white-space: nowrap; overflow: visible; }
  .cell.beat { border-left: 1px solid #444; }
  .syl { color: #bbb; }
  .syl.stress { font-weight: 700; color: #fff; }
  .syl.gang { color: #7fd1a7; font-style: italic; }
  .syl.bots { color: #f28b82; }
  .syl.spoken { color: #aaa; font-style: italic; }
  .syl.on { background: #ffd54a; color: #000; border-radius: 3px; }
  .bar.cur { background: #202a38; }
</style>
<header>
  <audio id="a" controls src="data:audio/mpeg;base64,${audio}"></audio>
  <div id="pos"></div>
  <div id="now">&nbsp;</div>
  <div style="color:#777;font-size:13px">Each row is one bar of sixteen sixteenths; beats are the brighter lines. Bold = stressed.
  Green = gang vocals, red = bots, italic grey = spoken. Click a bar to jump to it.</div>
</header>
<main id="m"></main>
<script>
const ev = ${events};
const a = document.getElementById('a');
const m = document.getElementById('m');
const rows = [];
const sylEls = [];
let si = 0;
for (let b = 0; b < ev.bars.length; b++) {
  const s = ev.sections.find((x) => x.bar === b);
  if (s) { const d = document.createElement('div'); d.className = 'sec'; d.textContent = s.name; m.append(d); }
  const row = document.createElement('div');
  row.className = 'bar';
  const chordsHere = ev.chords.filter((c) => c.time >= ev.bars[b] - 1e-6 && (b + 1 >= ev.bars.length || c.time < ev.bars[b + 1] - 1e-6)).map((c) => c.chord).join(' / ');
  row.innerHTML = '<span class="n">' + b + '</span><span class="c">' + chordsHere + '</span>';
  const cells = [];
  for (let i = 0; i < 16; i++) { const c = document.createElement('span'); c.className = 'cell' + (i % 4 === 0 ? ' beat' : ''); row.append(c); cells.push(c); }
  row.onclick = () => { a.currentTime = Math.max(0, ev.bars[b] - 0.05); a.play(); };
  m.append(row);
  rows.push(row);
  for (const e of ev.vocals.filter((e) => Math.floor(e.t / 16) === b)) {
    const sp = document.createElement('span');
    sp.className = 'syl ' + e.voice + (e.stress ? ' stress' : '');
    sp.textContent = (e.melisma ? '-' : '') + e.text.replace(/^i(?=$|')/, 'I') + ' ';
    cells[Math.floor(e.t % 16)].append(sp);
    sylEls.push({ e, sp });
  }
}
const now = document.getElementById('now');
const pos = document.getElementById('pos');
let lastBar = -1;
function tick() {
  const t = a.currentTime;
  let b = ev.bars.findIndex((x, i) => t >= x && (i + 1 >= ev.bars.length || t < ev.bars[i + 1]));
  if (b !== lastBar) {
    rows.forEach((r, i) => r.classList.toggle('cur', i === b));
    if (b >= 0 && !a.paused) rows[b].scrollIntoView({ block: 'center', behavior: 'smooth' });
    lastBar = b;
  }
  const beat = b >= 0 ? Math.floor((t - ev.bars[b]) / (60 / ev.bpm)) + 1 : 0;
  const sec = [...ev.sections].reverse().find((s) => t >= s.time);
  pos.textContent = (sec ? sec.name : '') + ' · bar ' + b + ' · beat ' + beat;
  const words = [];
  for (const { e, sp } of sylEls) {
    const on = t >= e.time && t < e.end;
    sp.classList.toggle('on', on);
    if (on && e.voice === 'lead') words.push(e.stress ? '<b>' + e.text + '</b>' : e.text);
  }
  if (words.length) now.innerHTML = words.join(' ');
  requestAnimationFrame(tick);
}
tick();
</script>`;
writeFileSync(outPath, html);
console.log(`wrote ${outPath} (${(html.length / 1e6).toFixed(1)} MB)`);
