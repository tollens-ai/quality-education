// Leap budget: the hook's leap to the high E♭ only lands if the rest of the melody mostly moves
// by step (Qing: "it's like seasoning"). Lists every leap of 5+ semitones between consecutive
// lead notes in the same phrase (less than a beat apart), and each section's step profile.
// Run: node music/ep01/leaps.mjs
import { lead, sections } from './score.mjs';

const NAMES = 'C Db D Eb E F Gb G Ab A Bb B'.split(' ');
const nm = (m) => `${NAMES[m % 12]}${Math.floor(m / 12) - 1}`;
const sectionOf = (t) => [...sections].reverse().find((s) => t >= s.bar * 16 - 2)?.name ?? 'Intro';

const leaps = [];
const profile = {};
for (let i = 1; i < lead.length; i++) {
  const a = lead[i - 1];
  const b = lead[i];
  if (b.t - (a.t + a.dur) >= 4) continue; // a new phrase after a rest of a beat or more
  const from = a.midi;
  const to = b.glide.length ? b.glide[0] : b.midi; // a scoop starts where the leap lands
  const iv = to - from;
  const sec = sectionOf(b.t);
  (profile[sec] ??= []).push(Math.abs(iv));
  if (Math.abs(iv) >= 5) leaps.push({ sec, bar: Math.floor(b.t / 16), iv, text: `${a.text} ${nm(from)} → ${b.text} ${nm(to)}` });
}
console.log('Leaps of 5+ semitones:');
for (const l of leaps) console.log(`  ${l.sec.padEnd(18)} b${String(l.bar).padEnd(4)} ${l.iv > 0 ? '+' : ''}${l.iv}  ${l.text}`);
console.log('\nPer section: moves, share that are steps (0–2), largest leap');
for (const s of sections) {
  const p = profile[s.name];
  if (!p) continue;
  const steps = p.filter((x) => x <= 2).length / p.length;
  console.log(`  ${s.name.padEnd(18)} ${String(p.length).padStart(3)}  ${(steps * 100).toFixed(0).padStart(3)}%  ${Math.max(...p)}`);
}
