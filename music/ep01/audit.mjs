// Checks the score before anything is rendered: stresses on beats, melody against harmony,
// vocal range, and that every section's bars add up. Run: node music/ep01/audit.mjs
import { chordTones } from '../lib/notation.mjs';
import { chords, lead, meta, sections, vocals } from './score.mjs';

const NAMES = 'C Db D Eb E F Gb G Ab A Bb B'.split(' ');
const noteName = (m) => `${NAMES[m % 12]}${Math.floor(m / 12) - 1}`;
const where = (t) => `b${Math.floor(t / 16)}.${Math.floor((t % 16) / 4) + 1}${['', 'e', '&', 'a'][Math.floor(t % 4)]}`;
const chordAt = (t) => [...chords].reverse().find((c) => c.t <= t);

let problems = 0;
const flag = (msg) => {
  problems++;
  console.log('  ' + msg);
};

console.log('Sections');
sections.forEach((s, i) => {
  const next = sections[i + 1];
  if (next && s.bar + s.bars !== next.bar) flag(`${s.name} ends at ${s.bar + s.bars}, next starts ${next.bar}`);
});

console.log('Stressed syllables off the beat (lead)');
for (const e of lead) {
  if (e.stress && e.t % 4 !== 0) flag(`${where(e.t)} "${e.text}"`);
}

console.log('Stressed or long notes that are not chord tones');
for (const e of vocals) {
  if (e.voice === 'spoken') continue;
  const c = chordAt(e.t);
  if (!c || c.chord === 'NC') continue;
  const { tones } = chordTones(c.chord);
  const onBeat = e.t % 4 === 0;
  if ((e.stress || e.dur >= 4) && onBeat && !tones.includes(e.midi % 12)) {
    flag(`${e.voice} ${where(e.t)} "${e.text}" ${noteName(e.midi)} over ${c.chord} (${e.dur / 4} beats)`);
  }
}

console.log('Range by voice');
for (const v of ['lead', 'gang', 'bots', 'spoken']) {
  const ms = vocals.filter((e) => e.voice === v).flatMap((e) => [e.midi, ...e.glide]);
  if (ms.length) console.log(`  ${v}: ${noteName(Math.min(...ms))}–${noteName(Math.max(...ms))} (${ms.length} notes)`);
}

console.log('Overlaps within the lead');
for (let i = 1; i < lead.length; i++) {
  if (lead[i].t < lead[i - 1].t + lead[i - 1].dur) flag(`${where(lead[i].t)} "${lead[i].text}" overlaps "${lead[i - 1].text}"`);
}

const secs = (meta.endT - meta.startT) / 4 * 60 / meta.bpm;
console.log(`\n${lead.length} lead syllables, ${vocals.length} vocal events, ${chords.length} chord changes, ${secs.toFixed(1)} s`);
console.log(`${problems} flags`);
