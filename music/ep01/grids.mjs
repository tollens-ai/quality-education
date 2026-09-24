// Prints the song map's form table and rhythm grids from the score, so the map never drifts
// from what is rendered. Run: node music/ep01/grids.mjs > /tmp/grids.md, then paste the
// blocks between the markers in episodes/01-song-map.md (or use --write to replace them).
import { readFileSync, writeFileSync } from 'node:fs';
import { chords, lead, meta, sections, vocals } from './score.mjs';

const W = 7; // column width per eighth-note slot
const NAMES = 'C D♭ D E♭ E F G♭ G A♭ A B♭ B'.split(' ');
const mmss = (bar) => {
  const s = Math.round(((bar * 16 - meta.startT) / 4) * (60 / meta.bpm));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
const pretty = (c) => c.replace(/([A-G])b/g, '$1♭').replace('NC', 'N.C.');

function chordsIn(bar) {
  return chords.filter((c) => Math.floor(c.t / 16) === bar).map((c) => pretty(c.chord)).join(' · ');
}

// One text row per voice for a bar: each eighth slot shows the syllable starting there, `~` if
// a note is held through it, `.` if silent; two sixteenths are joined with `·`.
function row(evs, bar) {
  const cells = [];
  for (let slot = 0; slot < 8; slot++) {
    const t0 = bar * 16 + slot * 2;
    const starts = evs.filter((e) => e.t >= t0 && e.t < t0 + 2);
    if (starts.length) {
      cells.push(starts.map((e) => (e.melisma ? '-' : '') + (e.stress ? e.text.toUpperCase() : e.written)).join('·'));
    } else if (evs.some((e) => e.t < t0 && e.t + e.dur > t0)) cells.push('~');
    else cells.push('.');
  }
  return cells.map((c) => c.padEnd(W - 1) + ' ').join('');
}

function grid(from, to) {
  const lines = ['```', `${'bar'.padEnd(10)}${['1', '&', '2', '&', '3', '&', '4', '&'].map((x) => x.padEnd(W)).join('')}chords`];
  const voices = [
    ['', vocals.filter((e) => e.voice === 'lead')],
    ['spoken', vocals.filter((e) => e.voice === 'spoken')],
    ['gang', vocals.filter((e) => e.voice === 'gang')],
    ['bots', vocals.filter((e) => e.voice === 'bots')],
  ];
  for (let b = from; b <= to; b++) {
    let first = true;
    for (const [name, evs] of voices) {
      const inBar = evs.filter((e) => Math.floor(e.t / 16) === b);
      const heldIn = evs.some((e) => e.t < b * 16 && e.t + e.dur > b * 16);
      if (!inBar.length && !(heldIn && name === '')) {
        if (name === '' ) {
          // an empty lead bar still gets a row, so the bar count is visible
        } else continue;
      }
      const label = first ? `b${b}` : `  ${name}`;
      lines.push(`${label.padEnd(10)}${row(evs, b)}${first ? chordsIn(b) : ''}`);
      first = false;
    }
  }
  lines.push('```');
  return lines.join('\n');
}

const formTable = [
  '| Bars | Start | Section |',
  '|---|---|---|',
  ...sections.map((s) => `| ${s.bar}–${s.bar + s.bars - 1} | ${mmss(s.bar)} | ${s.name} |`),
].join('\n');
const total = ((meta.endT - meta.startT) / 4) * (60 / meta.bpm);

const blocks = {
  form: `${formTable}\n\n${meta.endT / 16 - 1} bars, about **${Math.floor(total / 60)}:${String(Math.round(total % 60)).padStart(2, '0')}** at ${meta.bpm} bpm.`,
};
for (const s of sections) blocks[s.name] = grid(s.name === 'Intro' ? 0 : s.bar, s.bar + s.bars - 1);

if (process.argv.includes('--write')) {
  const path = 'episodes/01-song-map.md';
  let md = readFileSync(path, 'utf8');
  for (const [k, v] of Object.entries(blocks)) {
    const re = new RegExp(`(<!-- grid:${k} -->\\n)[\\s\\S]*?(<!-- /grid -->)`);
    if (!re.test(md)) throw new Error(`no marker for ${k}`);
    md = md.replace(re, (_, open, close) => `${open}${v}\n${close}`);
  }
  writeFileSync(path, md);
  console.log(`updated ${Object.keys(blocks).length} blocks in ${path}`);
} else {
  for (const [k, v] of Object.entries(blocks)) console.log(`<!-- grid:${k} -->\n${v}\n<!-- /grid -->\n`);
}
void NAMES;
