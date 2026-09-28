// A plain karaoke check of episode 2's word timings: every sung word lights up at its measured
// onset, over the song, so a listener can hear whether any word is early or late before shots
// are built on the timings. Lead lines are white, backing lines teal. At each onset the word
// turns on at once and a bar flashes under it for a tenth of a second.
//
//   node video/lib/render.mjs --scene video/ep02/karaoke/main.js --song music/ep02 \
//     --video karaoke.mp4 --audio take.wav --fps 30 --w 540
import { W, H } from '../../lib/stage.js';

export const font = 'Helvetica, Arial, sans-serif';
// How far ahead of each measured onset the word lights up (seconds), and a label for the clip.
export const OPT = { lead: 0, label: '' };
export function setLead(lead, label) { OPT.lead = lead; OPT.label = label; }
export const markColor = '#666';

const lead = S => S.lyrics.filter(l => !l.back);
const back = S => S.lyrics.filter(l => l.back);

function current(lines, t, hold = 1.5) {
  let i = -1;
  for (let k = 0; k < lines.length; k++) if (lines[k].start <= t + 0.6) i = k;
  return i;
}

function wrap(g, words, maxW) {
  const rows = [[]];
  let x = 0;
  const sp = g.measureText(' ').width;
  for (const w of words) {
    const ww = g.measureText(w.w).width;
    if (x + ww > maxW && rows[rows.length - 1].length) { rows.push([]); x = 0; }
    rows[rows.length - 1].push({ ...w, ww });
    x += ww + sp;
  }
  return { rows, sp };
}

function drawLine(g, line, t, y, size, colOn, colOff, dim) {
  g.font = `700 ${size}px ${font}`;
  const { rows, sp } = wrap(g, line.words, W - 120);
  rows.forEach((row, ri) => {
    const rw = row.reduce((a, w) => a + w.ww, 0) + sp * (row.length - 1);
    let x = (W - rw) / 2;
    const yy = y + ri * size * 1.2;
    for (const w of row) {
      const on = t + OPT.lead >= w.s;
      g.fillStyle = dim ? '#333' : on ? colOn : colOff;
      g.fillText(w.w, x, yy);
      if (!dim && t + OPT.lead >= w.s && t + OPT.lead < w.s + 0.1) {
        g.fillStyle = '#ffd400';
        g.fillRect(x, yy + size * 0.18, w.ww, size * 0.14);
      }
      x += w.ww + sp;
    }
  });
  return rows.length * size * 1.2;
}

export function draw(g, t, S) {
  g.fillStyle = '#000';
  g.fillRect(0, 0, W, H);
  g.textBaseline = 'alphabetic';
  const L = lead(S), B = back(S);
  const i = current(L, t);
  let y = 560;
  if (i > 0) y += drawLine(g, L[i - 1], t, y, 46, '#555', '#555', true) + 40;
  if (i >= 0) y += drawLine(g, L[i], t, y, 72, '#fff', '#555', false) + 40;
  if (i + 1 < L.length) drawLine(g, L[i + 1], t, y, 46, '#333', '#333', true);
  // Backing: the most recent backing line that has started, for a while after it ends.
  const bi = current(B, t);
  if (bi >= 0 && t < B[bi].end + 1.2) drawLine(g, B[bi], t, 1380, 64, '#3fd9c4', '#1d4f49', false);
  // Where we are.
  g.font = `600 30px ${font}`;
  g.fillStyle = '#888';
  g.textAlign = 'left';
  g.fillText(`${t.toFixed(2)} s   ${S.section(t).name}`, 60, 200);
  g.textAlign = 'start';
  g.fillStyle = '#222';
  g.fillRect(60, 230, W - 120, 8);
  g.fillStyle = '#d97757';
  g.fillRect(60, 230, (W - 120) * t / S.duration, 8);
  if (OPT.label) {
    g.font = `800 150px ${font}`; g.fillStyle = '#ffd400'; g.textAlign = 'center';
    g.fillText(OPT.label, W / 2, 420);
    g.font = `600 40px ${font}`; g.fillStyle = '#aaa';
    g.fillText(`words light ${Math.round(OPT.lead * 1000)} ms before the measured onset`, W / 2, 480);
    g.textAlign = 'start';
  }
  g.font = `500 26px ${font}`;
  g.fillStyle = '#666';
  g.fillText('Episode 2 timing check: each word lights up on its sung onset', 60, 1700);
  g.fillText('lead = white, backing = teal, yellow bar = the onset', 60, 1740);
}

export function drawMarks() {}
