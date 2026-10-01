// A plain karaoke check of the episode 4 piano take's word timings (adapted from
// video/ep03/karaoke/main.js): every sung word lights up at its measured onset, over the song, so a
// listener can hear whether any word is early or late before shots are built on the timings.
// The line being sung is big, the one before and after it small. At each onset the word turns
// white at once and a yellow bar flashes under it for a tenth of a second. The section name and a
// progress bar run along the top; the dot top right flashes on each beat (orange on a bar's
// downbeat), and a small green bar under it shows the strongest piano stabs.
//
//   node video/lib/render.mjs --scene music/ep04/piano/karaoke/main.js --song music/ep04/piano \
//     --video karaoke.mp4 --audio .private/ep04-piano/take.wav --fps 30 --w 540
//
// lead-085.js wraps this with the words lit 85 ms ahead of the onset (episode 2's chosen lead).
import { W, H } from '../../../../video/lib/stage.js';

export const font = 'Helvetica, Arial, sans-serif';
export const OPT = { lead: 0, label: '' };
export function setLead(lead, label) { OPT.lead = lead; OPT.label = label; }
export const markColor = '#666';

let AUDIO = null;
export async function init(S) {
  AUDIO = await fetch('/music/ep04/piano/audio.json').then(r => r.json());
}

function current(lines, t) {
  let i = -1;
  for (let k = 0; k < lines.length; k++) if (lines[k].start <= t + 0.6 + OPT.lead) i = k;
  return i;
}

// Backing echoes are drawn in their own slot while they sound; they never become the main line.
function echoAt(lines, t) {
  return lines.find(l => l.back && t + OPT.lead >= l.start - 0.3 && t + OPT.lead < l.end + 0.3);
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
      const tt = t + OPT.lead;
      const on = tt >= w.s;
      const held = on && tt < w.e;
      g.fillStyle = dim ? '#333' : held ? '#ffffff' : on ? colOn : colOff;
      g.fillText(w.w, x, yy);
      if (!dim && tt >= w.s && tt < w.s + 0.1) {
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
  g.textAlign = 'start';
  const L = S.lyrics.filter(l => !l.back);
  const i = current(L, t);
  const echo = echoAt(S.lyrics, t);
  if (echo) {
    g.font = `italic 700 54px ${font}`;
    drawLine(g, echo, t, 470, 54, '#7fd6ff', '#2d4f60', false);
    g.font = `500 26px ${font}`; g.fillStyle = '#4f8fa8';
    g.fillText('backing echo', 60, 400);
  }
  let y = 620;
  if (i > 0) y += drawLine(g, L[i - 1], t, y, 46, '#555', '#555', true) + 40;
  if (i >= 0) y += drawLine(g, L[i], t, y, 72, '#b8b8b8', '#555', false) + 40;
  if (i + 1 < L.length) drawLine(g, L[i + 1], t, y, 46, '#333', '#333', true);
  const sec = S.beats.sections.filter(s => t >= s.start - 0.05).pop();
  g.font = `600 44px ${font}`;
  g.fillStyle = '#d97757';
  g.fillText(sec ? sec.name : '', 60, 170);
  g.fillStyle = '#333';
  g.fillRect(60, 230, W - 120, 8);
  g.fillStyle = '#d97757';
  g.fillRect(60, 230, (W - 120) * t / S.duration, 8);
  if (OPT.label) {
    g.font = `600 36px ${font}`; g.fillStyle = '#aaa';
    g.fillText(OPT.label, 60, 300);
  }
  const beats = S.beats.beats;
  let bi = -1;
  for (let k = 0; k < beats.length; k++) if (beats[k].t <= t) bi = k; else break;
  if (bi >= 0 && t - beats[bi].t < 0.09) {
    g.fillStyle = beats[bi].down ? '#ff5533' : '#4aa3e3';
    g.beginPath(); g.arc(W - 110, 160, beats[bi].down ? 26 : 16, 0, Math.PI * 2); g.fill();
  }
  if (AUDIO && AUDIO.stabs) {
    for (const s of AUDIO.stabs) {
      if (t >= s.t && t < s.t + 0.12) {
        g.fillStyle = '#5ccf6a';
        g.fillRect(W - 150, 200, 80 * Math.min(1, s.w + 0.3), 14);
      }
    }
  }
  g.font = `500 26px ${font}`;
  g.fillStyle = '#666';
  g.fillText('Episode 4, piano take: each word lights on its sung onset', 60, 1700);
  g.fillText('yellow bar = onset; white = word still sounding', 60, 1740);
  g.fillText('dot = beat (orange = downbeat); green bar = piano stab', 60, 1780);
}

export function drawMarks() {}
