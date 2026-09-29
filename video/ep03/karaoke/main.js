// A plain karaoke check of episode 3's word timings: every sung word lights up at its measured
// onset, over the song, so a listener can hear whether any word is early or late before shots
// are built on the timings. The line being sung is big, the one before and after it small. At each
// onset the word turns on at once and a bar flashes under it for a tenth of a second; a section
// name and the bar count run along the top.
//
//   node video/lib/render.mjs --scene video/ep03/karaoke/main.js --song music/ep03 \
//     --video karaoke.mp4 --audio take.wav --fps 30 --w 540
//
// `--query lead=0.085` in milliseconds is not supported by the shared player, so the lead is set
// in a wrapper scene (lead-085.js) that calls setLead.
import { W, H } from '../../lib/stage.js';

export const font = 'Helvetica, Arial, sans-serif';
export const OPT = { lead: 0, label: '' };
export function setLead(lead, label) { OPT.lead = lead; OPT.label = label; }
export const markColor = '#666';

function current(lines, t) {
  let i = -1;
  for (let k = 0; k < lines.length; k++) if (lines[k].start <= t + 0.6 + OPT.lead) i = k;
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
  const L = S.lyrics;
  const i = current(L, t);
  let y = 620;
  if (i > 0) y += drawLine(g, L[i - 1], t, y, 46, '#555', '#555', true) + 40;
  if (i >= 0) y += drawLine(g, L[i], t, y, 72, '#fff', '#555', false) + 40;
  if (i + 1 < L.length) drawLine(g, L[i + 1], t, y, 46, '#333', '#333', true);
  // Where we are: the section, and a bar along the top.
  const sec = S.beats.sections.filter(s => t >= s.start - 0.05).pop();
  g.font = `600 44px ${font}`;
  g.fillStyle = '#d97757';
  g.fillText(sec ? sec.name : '', 60, 170);
  g.fillStyle = '#333';
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
  // The beat, as a flash in the corner: a check that the beat grid sits on the music too.
  const beats = S.beats.beats;
  let bi = -1;
  for (let k = 0; k < beats.length; k++) if (beats[k].t <= t) bi = k; else break;
  if (bi >= 0) {
    const since = t - beats[bi].t;
    if (since < 0.09) {
      g.fillStyle = beats[bi].down ? '#ff5533' : '#4aa3e3';
      g.beginPath(); g.arc(W - 110, 170, beats[bi].down ? 26 : 16, 0, Math.PI * 2); g.fill();
    }
  }
  g.font = `500 26px ${font}`;
  g.fillStyle = '#666';
  g.textAlign = 'start';
  g.fillText('Episode 3 timing check: each word lights up on its sung onset', 60, 1700);
  g.fillText('yellow bar = the onset; dot top right = the beat (orange oom, blue pah)', 60, 1740);
}

export function drawMarks() {}
