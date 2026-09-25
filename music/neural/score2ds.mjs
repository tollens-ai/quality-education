// Converts the lead vocal in music/ep01/score.mjs into DiffSinger phrase files (.ds JSON), so a
// neural singing voicebank can sing our score. The score keeps authority over timing and pitch:
// every phoneme duration and the whole f0 curve are written here, and the voicebank only
// supplies the voice. render.py turns the .ds files into audio.
//
// Usage: node music/neural/score2ds.mjs [--set=test|lead] [--out=dir] [--bpm=N] [--cons=X] [--maxc=F] [--bath=ae]
//   --set=test  the voice test phrases (music/voice/test.mjs), one .ds per phrase (default)
//   --set=lead  the whole lead, split into phrases at rests, with absolute offsets
//
// Output: <out>/<name>.ds (a list of phrase objects in openvpi's .ds format, plus a `notes`
// field used by the checks) and <out>/phrases.json (the index).
//
// Phonemes are ARPABET-style symbols in lowercase, as used by English DiffSinger voicebanks.
// The lexicon below leans British: non-rhotic, the BATH words take /ɑː/ (aa).

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lead, meta, sections } from '../ep01/score.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const flag = (k, d) => process.argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3) ?? d;
const SET = flag('set', 'test');
const OUT = flag('out', join(here, '..', 'out', 'neural', 'ds', SET));

// --bpm=N re-times the score (a diagnostic: separates tempo squeeze from phoneme problems).
// --cons=X scales every consonant length; --maxc=F caps the share of a note consonants may take.
const BPM = Number(flag('bpm', meta.bpm));
const CSCALE = Number(flag('cons', 1));
// --bath=ae sings the BATH words (fast, last, can't, pass, laugh) with the American /æ/.
const BATH = flag('bath', 'aa');
const SIX = 60 / BPM / 4; // one sixteenth in seconds
const at = Object.fromEntries(sections.map((s) => [s.name, s.bar]));

// ---- Lexicon: every lead syllable (lower-case text as written in the score) ------------------
// Keys with a capitalised form are resolved by the written form first (e.g. 'ON' in "ON ly").
const LEX = {
  "'em": 'ax m', a: 'ax', and: 'ae n d', A: 'ey', ags: 'ax g z', ay: 'ey', back: 'b ae k', be: 'b iy', ber: 'b ax',
  blog: 'b l aa g', bot: 'b aa t', bout: 'b aw t', bug: 'b ah g', build: 'b ih l d', built: 'b ih l t',
  but: 'b ah t', can: 'k ae n', "can't": 'k aa n t', chat: 'ch ae t', cheap: 'ch iy p',
  clock: 'k l aa k', code: 'k ow d', con: 'k ax n', could: 'k uh d', de: 'd ih', DE: 'd eh',
  di: 'd ay', DI: 'd ay', did: 'd ih d', dies: 'd ay z', do: 'd uw', does: 'd ah z', done: 'd ah n',
  duct: 'd ah k t', dy: 'd iy', eez: 'iy z', eff: 'eh f', ers: 'z ax', ev: 'eh v', eye: 'ay',
  fast: 'f aa s t', fet: 'f eh t', fine: 'f ay n', floss: 'f l aa s', for: 'f ao', from: 'f r ax m',
  fun: 'f ah n', fused: 'f y uw z d', gents: 'jh ax n t s', ging: 'g ih ng', go: 'g ow',
  gone: 'g aa n', good: 'g uh d', group: 'g r uw p', grow: 'g r ow', gym: 'jh ih m', how: 'hh aw',
  i: 'ay', "i'm": 'ay m', if: 'ih f', ing: 'ih ng', it: 'ih t', "it's": 'ih t s', ject: 'jh eh k t',
  just: 'jh ah s t', keep: 'k iy p', keys: 'k iy z', know: 'n ow', koo: 'k uw', last: 'l aa s t',
  laugh: 'l aa f', learn: 'l er n', log: 'l aa g', ly: 'l iy', made: 'm ey d', mak: 'm ey k',
  make: 'm ey k', me: 'm iy', "mer's": 'm ax z', mind: 'm ay n d', mis: 'm ih s', mo: 'm ow',
  my: 'm ay', "n't": 'ax n t', "nan's": 'n ae n z', need: 'n iy d', net: 'n eh t', ni: 'n iy',
  no: 'n ow', not: 'n aa t', now: 'n aw', o: 'ow', old: 'ow l d', on: 'aa n', ON: 'ow n',
  one: 'w ah n', oops: 'uw p s', or: 'ao', own: 'ow n', pass: 'p aa s', pay: 'p ey', pee: 'p iy',
  phone: 'f ow n', please: 'p l iy z', pro: 'p r aa', prompt: 'p r aa m p t',
  prompts: 'p r aa m p t s', quo: 'k w ow', read: 'r iy d', rogue: 'r ow g', roll: 'r ow l',
  room: 'r uw m', round: 'r aw n d', run: 'r ah n', ry: 'r iy', said: 's eh d',
  screen: 's k r iy n', see: 's iy', seen: 's iy n', set: 's eh t', ship: 'sh ih p', show: 'sh ow',
  so: 's ow', some: 's ah m', stale: 's t ey l', steals: 's t iy l z', stur: 's t er',
  sub: 's ah b', sum: 's ah m', "ta's": 't ax z', takes: 't ey k s', tell: 't eh l',
  test: 't eh s t', that: 'dh ae t', the: 'dh ax', their: 'dh eh', them: 'dh eh m',
  then: 'dh eh n', they: 'dh ey', "they'll": 'dh ey l', think: 'th ih ng k', this: 'dh ih s',
  throw: 'th r ow', ti: 't iy', time: 't ay m', to: 't ax', too: 't uw', toy: 't oy',
  train: 't r ey n', twelve: 't w eh l v', two: 't uw', us: 'y uw', use: 'y uw z', ver: 'v ax',
  wall: 'w ao l', want: 'w aa n t', week: 'w iy k', what: 'w aa t', when: 'w eh n', where: 'w eh',
  who: 'hh uw', with: 'w ih dh', works: 'w er k s', wow: 'w aw', write: 'r ay t', wrong: 'r aa ng',
  yoo: 'y uw', you: 'y uw', "you're": 'y ao', your: 'y ao',
};

const VOWELS = new Set(['aa', 'ae', 'ah', 'ao', 'aw', 'ax', 'ay', 'eh', 'er', 'ey', 'ih', 'iy', 'ow', 'oy', 'uh', 'uw']);

// Consonant lengths in seconds before any squeeze: stops short, fricatives long enough to hear.
const CONS = {
  p: 0.06, t: 0.055, k: 0.065, b: 0.045, d: 0.04, g: 0.05, ch: 0.085, jh: 0.075,
  f: 0.08, th: 0.08, s: 0.085, sh: 0.09, hh: 0.07, v: 0.06, dh: 0.05, z: 0.07, zh: 0.07,
  m: 0.06, n: 0.055, ng: 0.06, l: 0.05, r: 0.05, w: 0.05, y: 0.045,
};
for (const k in CONS) CONS[k] *= CSCALE;

const BATH_WORDS = new Set(['fast', 'last', "can't", 'pass', 'laugh']);

function syllable(e) {
  let ph = LEX[e.written] ?? LEX[e.text];
  if (ph && BATH === 'ae' && BATH_WORDS.has(e.text)) ph = ph.replace('aa', 'ae');
  if (!ph) throw new Error(`no lexicon entry for "${e.written}" at t=${e.t}`);
  const p = ph.split(' ');
  const v = p.findIndex((x) => VOWELS.has(x));
  if (v < 0) throw new Error(`no vowel in "${e.written}"`);
  // A diphthong-free nucleus: the vowel run (usually one symbol).
  let ve = v;
  while (ve + 1 < p.length && VOWELS.has(p[ve + 1])) ve++;
  return { onset: p.slice(0, v), nucleus: p.slice(v, ve + 1), coda: p.slice(ve + 1) };
}

// ---- Events to syllable plan -------------------------------------------------------------------
// A melisma note ('-o') carries the previous vowel; the head syllable's coda moves to the end of
// the chain. Returns notes with times in seconds (vowel onset on the beat).
function plan(events) {
  const notes = [];
  for (const e of events) {
    const start = e.t * SIX, end = (e.t + e.dur) * SIX;
    const pitch = e.glide.length ? { from: e.glide[0], to: e.midi } : { to: e.midi };
    if (e.melisma && notes.length) {
      const prev = notes.at(-1);
      notes.push({ start, end, ...pitch, onset: [], nucleus: [prev.nucleus.at(-1)], coda: prev.coda, text: e.text, stress: false, melisma: true });
      prev.coda = [];
    } else {
      notes.push({ start, end, ...pitch, ...syllable(e), text: e.text, stress: e.stress, melisma: false });
    }
  }
  return notes;
}

// ---- Phoneme timing --------------------------------------------------------------------------
// Onset consonants sit before the beat; codas finish by the note's end (or by the next onset).
// If the consonants would take more than MAXC of a note, they are squeezed to fit.
const MAXC = Number(flag('maxc', 0.5));
const len = (ps) => ps.reduce((s, p) => s + (CONS[p] ?? 0.06), 0);

function schedule(notes, lead = 0.25, tail = 0.2) {
  const seq = []; // { ph, start, end }
  const push = (ph, a, b) => seq.push({ ph, start: a, end: b });
  const first = notes[0].start - len(notes[0].onset) - lead;
  push('SP', first, notes[0].start - len(notes[0].onset));
  {
    let t = notes[0].start - len(notes[0].onset);
    for (const p of notes[0].onset) { push(p, t, t + (CONS[p] ?? 0.06)); t += CONS[p] ?? 0.06; }
  }
  for (let i = 0; i < notes.length; i++) {
    const n = notes[i], nx = notes[i + 1];
    const joined = nx && nx.start - n.end < 1e-6; // next note starts where this one ends
    const span = n.end - n.start;
    let coda = len(n.coda), nextOn = joined ? len(nx.onset) : 0;
    const k = Math.min(1, (MAXC * span) / Math.max(1e-9, coda + nextOn));
    coda *= k;
    // Onset of this note (already placed before the beat by the previous note or the rest).
    const vEnd = n.end - coda - nextOn * k;
    const nv = n.nucleus.length;
    for (let j = 0; j < nv; j++) push(n.nucleus[j], n.start + ((vEnd - n.start) * j) / nv, n.start + ((vEnd - n.start) * (j + 1)) / nv);
    n.vowelEnd = vEnd;
    let t = vEnd;
    const cs = n.coda.map((p) => (CONS[p] ?? 0.06) * k);
    n.coda.forEach((p, j) => { push(p, t, t + cs[j]); t += cs[j]; });
    if (nx) {
      if (joined) {
        const os = nx.onset.map((p) => (CONS[p] ?? 0.06) * k);
        nx.onset.forEach((p, j) => { push(p, t, t + os[j]); t += os[j]; });
      } else {
        const on = len(nx.onset);
        const restEnd = nx.start - on;
        if (restEnd > t) push('SP', t, restEnd); // rests longer than the onset stay silent
        t = Math.max(t, restEnd);
        const os = nx.onset.map((p) => (CONS[p] ?? 0.06) * ((nx.start - t) / Math.max(1e-9, on)));
        nx.onset.forEach((p, j) => { push(p, t, t + os[j]); t += os[j]; });
      }
    }
  }
  push('SP', notes.at(-1).end, notes.at(-1).end + tail);
  return seq;
}

// ---- f0 --------------------------------------------------------------------------------------
// Semitone curve: glides written in the score (D5>Eb5) scoop over up to 150 ms; note changes move
// over ~70 ms, finishing on the vowel onset; long notes get late, gentle vibrato.
const STEP = 512 / 44100;
function f0Curve(notes, t0, t1) {
  const n = Math.ceil((t1 - t0) / STEP);
  const out = new Float64Array(n);
  const smooth = (x) => x * x * (3 - 2 * x);
  for (let i = 0; i < n; i++) {
    const t = t0 + i * STEP;
    // The note whose span (extended back to the previous note's end) holds t.
    let k = notes.findIndex((m) => t < m.end);
    if (k < 0) k = notes.length - 1;
    const m = notes[k];
    let st = m.to;
    if (m.from !== undefined) {
      const d = Math.min(0.15, (m.end - m.start) / 2);
      const x = Math.min(1, Math.max(0, (t - m.start) / d));
      st = m.from + (m.to - m.from) * smooth(x);
    }
    const p = notes[k - 1];
    if (p && t < m.start && m.start - p.end < 0.05) {
      // Portamento through the consonants into this note.
      const d = 0.07, x = Math.min(1, Math.max(0, (t - (m.start - d)) / d));
      st = p.to + ((m.from ?? m.to) - p.to) * smooth(x);
    }
    const held = t - m.start, dur = m.end - m.start;
    if (dur > 0.45 && held > 0.25 && t < m.end) {
      const depth = 0.22 * Math.min(1, (held - 0.25) / 0.25); // semitones
      st += depth * Math.sin(2 * Math.PI * 5.6 * (held - 0.25));
    }
    out[i] = 440 * 2 ** ((st - 69) / 12);
  }
  return out;
}

// ---- Phrases -----------------------------------------------------------------------------------
function phrase(name, events, text) {
  const notes = plan(events);
  const seq = schedule(notes);
  const t0 = seq[0].start, t1 = seq.at(-1).end;
  const f0 = f0Curve(notes, t0, t1);
  return {
    name,
    text,
    offset: +t0.toFixed(6),
    ph_seq: seq.map((s) => s.ph).join(' '),
    ph_dur: seq.map((s) => (s.end - s.start).toFixed(6)).join(' '),
    f0_seq: Array.from(f0, (x) => x.toFixed(1)).join(' '),
    f0_timestep: STEP.toFixed(12),
    // For the checks: vowel onsets and ends relative to the phrase start, with the score pitch.
    notes: notes.map((m) => ({ text: m.text, start: +(m.start - t0).toFixed(4), vowelEnd: +(m.vowelEnd - t0).toFixed(4), midi: m.to })),
  };
}

const window = (fromBar, fromSlot, toBar) => lead.filter((e) => e.t >= fromBar * 16 + fromSlot * 2 && e.t < toBar * 16);

const phrases = [];
if (SET === 'test') {
  const P = at['Pre-chorus'], C = at['Chorus 1'], V1 = at['Verse 1'], V2 = at['Verse 2'];
  const n = sections.find((s) => s.name === 'Pre-chorus').bars;
  phrases.push(phrase('prechorus', window(P + n - 4, 7, P + n), "I can't read your mind. I'm only reading your prompt."));
  phrases.push(phrase('hook', window(C, 4, C + 5), 'Good for who? Good for what?'));
  phrases.push(phrase('verse', window(V2, 0, V2 + 1), 'Product demo? Wow them fast.'));
  phrases.push(phrase('gym', window(V1 + 1, 0, V1 + 2), '2FA on your gym log.'));
  phrases.push(phrase('kube', window(V1 + 2, 0, V1 + 3), 'Kubernetes for your blog.'));
  phrases.push(phrase('twelve', window(V1 + 3, 0, V1 + 4), 'Twelve subagents round the clock.'));
} else {
  // Split the whole lead at rests of a beat or more.
  let cur = [];
  const flush = () => { if (cur.length) phrases.push(phrase(`p${String(phrases.length).padStart(3, '0')}`, cur, cur.map((e) => e.text).join(' '))); cur = []; };
  for (const e of lead) {
    const prev = cur.at(-1);
    if (prev && e.t - (prev.t + prev.dur) >= 4) flush();
    cur.push(e);
  }
  flush();
}

mkdirSync(OUT, { recursive: true });
for (const p of phrases) writeFileSync(join(OUT, `${p.name}.ds`), JSON.stringify([p], null, 1));
writeFileSync(join(OUT, 'phrases.json'), JSON.stringify({
  set: SET, bpm: BPM, songStart: meta.startT * SIX,
  phrases: phrases.map((p) => ({ name: p.name, text: p.text, offset: p.offset, notes: p.notes })),
}, null, 1));
console.log(`${phrases.length} phrase(s) -> ${OUT}`);
for (const p of phrases.slice(0, 8)) console.log(`${p.name}: ${p.ph_seq}`);
