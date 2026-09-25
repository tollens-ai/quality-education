// The band for episode 1: drums, bass and two rhythm guitars, synthesised from the score's
// `arrangement` and `chords`. Writes 48 kHz float stems, a band mix, the band with the guide
// vocal tones on top (for a human to hear the song's shape), and the event list for checks.
// Run: node music/ep01/band.mjs   → music/out/ep01-band-*.wav, ep01-band+guide.wav,
//                                   ep01-band-events.json
import { mkdirSync, writeFileSync } from 'node:fs';
import { biquad, db, filterInPlace, gauss, panGains, seeded, stereo, timing, writeWavFloat } from '../lib/audio.mjs';
import { chordTones } from '../lib/notation.mjs';
import * as kit from '../lib/band/drums.mjs';
import { amp, renderLead, renderStrings } from '../lib/band/guitar.mjs';
import { renderBass } from '../lib/band/bass.mjs';
import { compress, duckBand, limit, loudness, monoLows, room } from '../lib/band/dsp.mjs';
import { arrangement, chords, lead, leadGuitar, meta, sections } from './score.mjs';
import { guideLength, guideVoices } from './guide.mjs';

const SR = meta.sampleRate;
const at = timing(meta.bpm, SR, meta.startT); // sample 0 = meta.startT, as in the guide
const total = guideLength;
const sec = (t) => at(t) / SR;
const BAR = 16;

// ---- Harmony helpers ------------------------------------------------------------------------
const chordIndexAt = (t) => {
  let k = -1;
  for (let i = 0; i < chords.length && chords[i].t <= t + 1e-9; i++) k = i;
  return k;
};
const chordAt = (t) => chords[chordIndexAt(t)]?.chord ?? 'NC';
const nextChangeAfter = (t) => chords.find((c) => c.t > t + 1e-9)?.t ?? Infinity;

// E♭ standard tuning, as pop-punk bands in E♭ play: guitar roots E♭2–D3. The bass sits B♭1–A2,
// where the reference take's bass energy is (55–120 Hz), which also carries on small speakers.
const GTR_LOW = 39; // E♭2
const BASS_LOW = 34; // B♭1
const rootIn = (pc, low) => low + ((pc - (low % 12) + 12) % 12);

// A power chord can't tell A♭ from A♭m, so a chord that only changes quality from its
// neighbour (the intro's droop) gets its third, as a full barre chord.
function needsThird(t) {
  const k = chordIndexAt(t);
  const c = chordTones(chords[k].chord);
  return [chords[k - 1], chords[k + 1]].some((n) => {
    if (!n || n.chord === 'NC') return false;
    const o = chordTones(n.chord);
    return o.root === c.root && o.tones.join() !== c.tones.join();
  });
}
function voicing(t) {
  const name = chordAt(t);
  if (name === 'NC') return null;
  const { root, tones } = chordTones(name);
  const r = rootIn(root, GTR_LOW);
  if (!needsThird(t)) return [r, r + 7, r + 12];
  const third = tones[1] - root;
  return [r, r + 7, r + 12, r + 12 + ((third + 12) % 12), r + 19, r + 24];
}

// ---- Arrangement → events (time in sixteenths from bar 0) -----------------------------------
const drumEv = []; // { inst, t, vel, open?, bell?, tom? }
const gtrEv = []; // { t, dur, vel, mute }
const bassEv = []; // { t, dur, vel, mute }
const silent = []; // [from, to) spans where the whole band is silent
const ranges = []; // { start, end, feel, lvl } per arrangement range, for the fader rides

const HAT_OPEN = { closed: 0, half: 0.35, wide: 0.55 };
const FINAL = sections.find((s) => s.name === 'Final chorus');
const inFinal = (bar) => bar > FINAL.bar && bar < FINAL.bar + FINAL.bars;

// Distortion flattens velocity, so each feel also sets the guitars' level after the amp (how
// hard the player digs in, and the volume knob). With `level` and `rise`, this is what makes a
// verse smaller than a chorus.
const GTR_GAIN = { drive: 1, hits: 1, tagHit: 1, verse: 0.45, build: 1.35, halftime: 0.85, chug: 1.1, quiet: 0.45 };

const FEELS = {
  // Full band: open eighth-note power chords, bass eighths, kick–snare backbeat, half-open
  // hats riding eighths, a crash at each four-bar phrase. The final chorus opens the hats
  // wider and crashes every two bars.
  drive(T, bar, r, add) {
    const big = inFinal(bar);
    for (let s = 0; s < 16; s += 2) {
      const on = s % 4 === 0;
      add.gtr(T + s, 2, on ? 1 : 0.88, 0);
      add.bass(T + s, 1.8, on ? 1 : 0.85, 0);
      add.drum('hat', T + s, on ? 0.9 : 0.6, { open: big ? HAT_OPEN.wide : HAT_OPEN.half });
    }
    if (big && bar > r.b0 && (bar - r.b0) % 2 === 0) add.drum('crash', T, 0.8);
    const kicks = big || (bar - r.b0) % 2 ? [0, 6, 8, 10] : [0, 8, 10];
    kicks.forEach((s) => add.drum('kick', T + s, s % 4 ? 0.85 : 1));
    [4, 12].forEach((s) => add.drum('snare', T + s, 1));
    if (bar > r.b0 && (bar - r.b0) % 4 === 0) add.drum('crash', T, 0.85);
  },
  // Verse: palm-muted eighths, tight bass, closed hats, backbeat, so the patter sits on top.
  verse(T, bar, r, add) {
    for (let s = 0; s < 16; s += 2) {
      const on = s % 4 === 0;
      add.gtr(T + s, 2, on ? 0.85 : 0.7, 0.85);
      add.bass(T + s, 1.4, on ? 0.85 : 0.72, 0.5);
      add.drum('hat', T + s, on ? 0.7 : 0.42, { open: HAT_OPEN.closed });
    }
    [0, 8, 10].forEach((s) => add.drum('kick', T + s, s === 10 ? 0.7 : 0.82));
    [4, 12].forEach((s) => add.drum('snare', T + s, 0.78));
  },
  // One open chord per bar, crash and kick on 1, hats in quarters.
  tagHit(T, bar, r, add) {
    add.gtr(T, BAR, 0.95, 0);
    add.bass(T, BAR - 0.5, 0.95, 0);
    add.drum('kick', T, 1);
    add.drum('crash', T, 0.9);
    [4, 8, 12].forEach((s) => add.drum('hat', T + s, 0.7, { open: HAT_OPEN.closed }));
  },
  stop() {},
  // Pre-chorus: sustained open chords, bass quarters, floor-tom eighths, kick quarters; the
  // range's `rise` does the building.
  build(T, bar, r, add) {
    add.gtr(T, BAR, 0.95, 0);
    for (let s = 0; s < 16; s += 4) {
      add.bass(T + s, 3.6, 0.9, 0.2);
      add.drum('kick', T + s, 0.85);
    }
    for (let s = 0; s < 16; s += 2) add.drum('tom', T + s, s % 4 ? 0.6 : 0.85, { tom: 'floor' });
  },
  // Bridge: ringing chords, kick on 1, snare on 3, ride quarters, bass half notes.
  halftime(T, bar, r, add) {
    add.gtr(T, BAR, 0.9, 0);
    add.bass(T, 7.6, 0.9, 0);
    add.bass(T + 8, 7.6, 0.8, 0);
    add.drum('kick', T, 1);
    if ((bar - r.b0) % 2) add.drum('kick', T + 11, 0.7);
    add.drum('snare', T + 8, 1);
    [0, 4, 8, 12].forEach((s) => add.drum('ride', T + s, s ? 0.7 : 0.9, { bell: s === 0 }));
  },
  // Breakdown: half-time palm-muted chugs; accents on 1 and 3 with kick and crash.
  chug(T, bar, r, add) {
    for (let s = 0; s < 16; s += 2) {
      const accent = s % 8 === 0;
      add.gtr(T + s, 2, accent ? 1 : 0.8, accent ? 0.35 : 0.95);
      add.bass(T + s, accent ? 1.8 : 1.2, accent ? 1 : 0.8, accent ? 0 : 1);
    }
    [0, 8].forEach((s) => {
      add.drum('kick', T + s, 1);
      add.drum('crash', T + s, 0.85);
    });
    add.drum('snare', T + 8, 1);
    [4, 12].forEach((s) => add.drum('hat', T + s, 0.6, { open: HAT_OPEN.closed }));
  },
  // Tag: bass whole note, soft muted quarters, a heartbeat kick.
  quiet(T, bar, r, add) {
    for (let s = 0; s < 16; s += 4) add.gtr(T + s, 2, 0.7, 0.9);
    add.bass(T, BAR - 0.5, 0.8, 0);
    add.drum('kick', T, 0.8);
    add.drum('kick', T + 3, 0.55);
  },
};

const FILLS = {
  snare(fs, end, add) {
    add.drum('kick', fs, 0.9);
    for (let t = fs; t < end; t++) add.drum('snare', t, 0.55 + (0.45 * (t - fs)) / Math.max(1, end - fs - 1));
  },
  toms(fs, end, add) {
    const n = end - fs;
    for (let t = fs; t < end; t++) {
      const z = Math.floor((3 * (t - fs)) / n);
      add.drum('tom', t, 0.8 + (0.2 * (t - fs)) / n, { tom: ['high', 'mid', 'floor'][z] });
    }
    for (let t = fs; t < end; t += 4) add.drum('kick', t, 0.9);
  },
  roll(fs, end, add) {
    add.drum('swell', fs, 0.8, { len: end - fs }); // a cymbal swell rises under the roll
    for (let t = fs; t < end; t += 0.5) {
      const x = (t - fs) / (end - fs);
      add.drum('snare', t, 0.25 + 0.75 * x ** 1.5, { ghost: x < 0.5 });
    }
  },
};

function stabs(r, add) {
  const s0 = r.b0 * BAR;
  const cutT = r.o.cut != null ? s0 + r.o.cut : null;
  const times = r.o.at.map((a) => s0 + a);
  times.forEach((t, j) => {
    // A stab rings until the next stab, the next chord change, the cut, or the end of the run
    // of consecutive hits ranges.
    const runEnd = r.next?.feel === 'hits' && r.next.b0 === r.b1 + 1 ? r.next.b0 * BAR + r.next.o.at[0] : r.end;
    const end = Math.min(times[j + 1] ?? runEnd, nextChangeAfter(t), cutT ?? runEnd, runEnd);
    add.gtr(t, end - t, 1, 0);
    add.bass(t, end - t, 1, 0);
    add.drum('kick', t, 1);
    if ((j === 0 && r.o.crash) || cutT != null) add.drum('crash', t, 1);
    else add.drum('snare', t, 0.95);
  });
  if (cutT != null) silent.push([cutT, r.end]);
}

arrangement.forEach(([b0, b1, feel, o = {}], idx) => {
  const [nb0, , nfeel, no = {}] = arrangement[idx + 1] ?? [];
  const r = { b0, b1, feel, o, start: b0 * BAR, end: (b1 + 1) * BAR, next: nb0 && { b0: nb0, feel: nfeel, o: no } };
  const lvl = (t) => {
    const x = (t - r.start) / (r.end - r.start);
    return (o.level ?? 1) * (o.rise ? o.rise[0] + (o.rise[1] - o.rise[0]) * x : 1);
  };
  // A held chord that crosses a chord change is struck again at the change.
  const held = (list) => (t, dur, vel, mute) => {
    const dig = feel === 'drive' && inFinal(Math.floor(t / BAR)) ? 1.12 : 1; // the last chorus, harder
    const gain = dig * (GTR_GAIN[feel] ?? 1) * (o.level ?? 1) * (o.rise ? lvl(t) / (o.level ?? 1) : 1);
    const end = t + dur;
    for (let a = t; a < end - 1e-9; a = Math.min(end, nextChangeAfter(a))) {
      const b = Math.min(end, nextChangeAfter(a));
      if (chordAt(a) !== 'NC') list.push({ t: a, dur: b - a, vel: vel * lvl(a), mute, gain });
    }
  };
  const add = {
    drum: (inst, t, vel, extra = {}) => drumEv.push({ inst, t, vel: Math.min(1, vel * lvl(t)), ...extra }),
    gtr: held(gtrEv),
    bass: held(bassEv),
  };
  ranges.push({ start: r.start, end: r.end, feel, lvl, rise: !!o.rise });
  if (feel === 'stop') silent.push([r.start, r.end]);
  else if (feel === 'hits') stabs(r, add);
  else {
    if (!FEELS[feel]) throw new Error(`unknown feel ${feel}`);
    for (let bar = b0; bar <= b1; bar++) FEELS[feel](bar * BAR, bar, r, add);
  }
  if (o.crash) {
    add.drum('crash', r.start, 1);
    add.drum('kick', r.start, 1);
  }
  if (o.fill) {
    const [f, kind] = o.fill;
    const fs = b1 * BAR + f;
    // The fill replaces the time-keeping from its start; kick and crashes stay.
    for (let i = drumEv.length - 1; i >= 0; i--) {
      const e = drumEv[i];
      if (e.t >= fs && e.t < r.end && !['kick', 'crash'].includes(e.inst)) drumEv.splice(i, 1);
    }
    FILLS[kind](fs, r.end, add);
  }
});

// One hit per instrument and time; the louder wins.
const dedupe = (evs, key) => {
  const m = new Map();
  for (const e of evs) {
    const k = key(e);
    if (!m.has(k) || m.get(k).vel < e.vel) m.set(k, e);
  }
  return [...m.values()].sort((a, b) => a.t - b.t);
};
const drums = dedupe(drumEv, (e) => `${e.inst}${e.tom ?? ''}@${e.t}`);
const gtrs = dedupe(gtrEv, (e) => e.t);
const basses = dedupe(bassEv, (e) => e.t);

// ---- Humanisation ---------------------------------------------------------------------------
// Smooth 1/f-like drift: seeded value noise at four time scales, each knot keyed by
// (player, octave, knot), so adding an event never changes any other event's timing.
function drift(player, t, sigma) {
  const s = sec(t);
  let sum = 0, norm = 0;
  [[8, 1], [4, 0.7], [2, 0.5], [1, 0.35]].forEach(([period, a], oct) => {
    const x = s / period;
    const k = Math.floor(x);
    const f = 0.5 - 0.5 * Math.cos(Math.PI * (x - k));
    const v0 = gauss(seeded(player, 'drift', oct, k));
    const v1 = gauss(seeded(player, 'drift', oct, k + 1));
    sum += a * (v0 + (v1 - v0) * f);
    norm += a * a;
  });
  return (sigma * sum) / Math.sqrt(norm);
}
const jitter = (player, id, sigma) => sigma * gauss(seeded(player, 'jitter', id));
const toSamples = (msec) => Math.round((msec / 1000) * SR);

// Humanisation, in milliseconds (MUSIC.md "Humanise on purpose"). `drift` is the σ of the smooth
// wander above, seeded per player; `jitter` is the σ of the independent per-hit error on top.
// The bass rides the drummer's drift so it stays locked to the kick; each rhythm guitar has its
// own drift, which is what makes the double-tracked pair wide. `strum` is the gap between
// strings of one down-stroke.
const H = {
  drums: { drift: 3, jitter: { kick: 0.6, snare: 0.8, other: 2.5 } },
  bass: { jitter: 1.5 },
  guitar: { drift: 5, jitter: 1.5, strum: [3, 7] },
};
for (const e of drums) {
  e.id = `${e.inst}${e.tom ?? ''}@${e.t}`;
  const js = H.drums.jitter[e.inst] ?? H.drums.jitter.other;
  e.offsetMs = drift('drums', e.t, H.drums.drift) + jitter('drums', e.id, js);
  e.i = at(e.t) + toSamples(e.offsetMs);
}

// ---- Drums ------------------------------------------------------------------------------------
const PAN = { kick: 0, snare: 0, hat: -0.3, ride: 0.4, crash: 0, tomhigh: -0.15, tommid: 0.1, tomfloor: 0.35 };
const pieces = { kick: new Float32Array(total), snare: new Float32Array(total), tom: stereo(total),
  hat: new Float32Array(total), cym: stereo(total) };

function place(buf, hit, i, len = hit.length) {
  const fade = Math.round(0.005 * SR);
  for (let k = 0; k < Math.min(len + fade, hit.length) && i + k < total; k++) {
    if (i + k < 0) continue;
    const g = k < len ? 1 : 1 - (k - len) / fade;
    buf[i + k] += hit[k] * g;
  }
}
function placeStereo([L, R], hit, i, pan) {
  const [gl, gr] = panGains(pan);
  for (let k = Math.max(0, -i); k < hit.length && i + k < total; k++) {
    L[i + k] += hit[k] * gl;
    R[i + k] += hit[k] * gr;
  }
}

const hats = drums.filter((e) => e.inst === 'hat');
let crashSide = 0;
for (const e of drums) {
  const rand = seeded('drums', e.id);
  if (e.inst === 'kick') place(pieces.kick, kit.kick(e.vel, rand, SR), e.i);
  else if (e.inst === 'snare') place(pieces.snare, kit.snare(e.vel, rand, SR, { ghost: e.ghost }), e.i);
  else if (e.inst === 'tom') placeStereo(pieces.tom, kit.tom(e.vel, rand, SR, { pitch: kit.TOM_PITCH[e.tom] }), e.i, PAN[`tom${e.tom}`]);
  else if (e.inst === 'hat') {
    // The next hat chokes this one.
    const next = hats[hats.indexOf(e) + 1];
    const hit = kit.hat(e.vel, rand, SR, { open: e.open });
    place(pieces.hat, hit, e.i, next ? Math.max(0, next.i - e.i) : hit.length);
  } else if (e.inst === 'swell') {
    placeStereo(pieces.cym, kit.swell(at(e.t + e.len) - at(e.t), e.vel, rand, SR), e.i, 0);
  } else if (e.inst === 'ride') placeStereo(pieces.cym, kit.ride(e.vel, rand, SR, { bell: e.bell }), e.i, PAN.ride);
  else if (e.inst === 'crash') {
    // Two crashes, left and right of centre, alternating; each hit is a decorrelated pair.
    const side = (crashSide++ % 2 ? 1 : -1) * 0.45;
    placeStereo(pieces.cym, kit.crash(e.vel, rand, SR), e.i, side - 0.2);
    placeStereo(pieces.cym, kit.crash(e.vel, seeded('drums', e.id, 'r'), SR), e.i, side + 0.2);
  }
}

filterInPlace(pieces.kick, biquad('peak', 58, 1.2, SR, -6), biquad('peak', 130, 1, SR, -2), biquad('peak', 380, 1.2, SR, -4), biquad('peak', 4000, 1, SR, 2));
filterInPlace(pieces.snare, biquad('hp', 110, 0.7, SR), biquad('peak', 220, 0.8, SR, 4), biquad('peak', 900, 1.2, SR, -2));
filterInPlace(pieces.hat, biquad('hp', 600, 0.7, SR));

const drumsSt = stereo(total);
const roomSend = new Float32Array(total);
{
  const [hl, hr] = panGains(PAN.hat);
  for (let i = 0; i < total; i++) {
    const k = pieces.kick[i] * 1.0;
    const s = pieces.snare[i] * 0.55;
    const h = pieces.hat[i] * 0.22;
    const tl = pieces.tom[0][i] * 0.8, tr = pieces.tom[1][i] * 0.8;
    const cl = pieces.cym[0][i] * 0.2, cr = pieces.cym[1][i] * 0.2;
    drumsSt[0][i] = k + s + h * hl + tl + cl;
    drumsSt[1][i] = k + s + h * hr + tr + cr;
    roomSend[i] = 0.05 * k + 0.35 * s + 0.3 * (tl + tr) + 0.05 * (cl + cr) + 0.05 * h;
  }
}
// Parallel compression for punch, then a small room; the cymbals' top end tamed on the bus.
{
  const crushed = drumsSt.map((c) => Float32Array.from(c));
  compress(crushed, SR, { threshold: -26, ratio: 8, attack: 3, release: 90, knee: 3 });
  const [rl, rr] = room(roomSend, SR, { rt60: 0.55, damp: 5500, size: 1.1 });
  const rhp = [biquad('hp', 250, 0.7, SR), biquad('hp', 250, 0.7, SR)];
  for (let i = 0; i < total; i++) {
    drumsSt[0][i] += 0.5 * crushed[0][i] + 0.35 * rhp[0](rl[i]);
    drumsSt[1][i] += 0.5 * crushed[1][i] + 0.35 * rhp[1](rr[i]);
  }
  drumsSt.forEach((ch) => filterInPlace(ch, biquad('peak', 3500, 0.8, SR, -2), biquad('highshelf', 7500, 0.7, SR, -6.5)));
}
// Bus compression that lets the hit through: 4:1, slow attack, release inside an eighth note
// (Lord-Alge: "slow attack and quick release", "4–5dB movement").
let drumPeak = 0;
for (const ch of drumsSt) for (const x of ch) drumPeak = Math.max(drumPeak, Math.abs(x));
const drumBus = compress(drumsSt, SR, { threshold: 20 * Math.log10(drumPeak) - 18, ratio: 4, attack: 25, release: 110, knee: 4 });
monoLows(drumsSt, SR);

// ---- Bass -------------------------------------------------------------------------------------
const bassNotes = basses.map((e) => {
  const id = `bass@${e.t}`;
  const off = drift('drums', e.t, H.drums.drift) + jitter('bass', id, H.bass.jitter);
  const i = at(e.t) + toSamples(off);
  const midi = rootIn(chordTones(chordAt(e.t)).bass, BASS_LOW); // the slash note, if any
  return { i, len: at(e.t + e.dur) - at(e.t), midi, vel: e.vel, mute: e.mute, rand: seeded('bass', id) };
});
const bassMono = renderBass(bassNotes, total, SR);
compress([bassMono], SR, { threshold: -16, ratio: 4, attack: 8, release: 100 });

// ---- Guitars ----------------------------------------------------------------------------------
// Four performances of the same part, two per side (Lord-Alge's big guitars are many real
// takes, hard-panned): own seeds, own timing drift, own strum, slightly different rigs. Never a
// delayed copy. In the final chorus the second pair moves up an octave: the last chorus gets
// something new, not just louder.
const RIGS = {
  gtrL1: { mid: 750, midGain: 4, cabLp: 4000, drive: 16, bias: 0.12 },
  gtrL2: { mid: 820, midGain: 3.5, cabLp: 4200, drive: 20, bias: 0.1 },
  gtrR1: { mid: 900, midGain: 3, cabLp: 4400, drive: 18, bias: 0.08 },
  gtrR2: { mid: 700, midGain: 4.5, cabLp: 3900, drive: 15, bias: 0.14 },
};
const lift = (player, t) => player.endsWith('2') && t >= (FINAL.bar + 1) * BAR && t < (FINAL.bar + FINAL.bars) * BAR;
function guitar(player) {
  const actions = [];
  let prevSlots = 0;
  gtrs.forEach((e, j) => {
    const v = voicing(e.t).map((m) => (lift(player, e.t) ? m + 12 : m));
    const id = `${player}@${e.t}`;
    const rand = seeded(player, id);
    const t0 = at(e.t) + toSamples(drift(player, e.t, H.guitar.drift) + jitter(player, id, H.guitar.jitter));
    const [s0, s1] = H.guitar.strum;
    const spread = (s0 + (s1 - s0) * rand()) * (e.mute > 0.5 ? 0.6 : 1);
    v.forEach((midi, slot) => actions.push({
      i: t0 + toSamples(slot * spread), slot, type: 'pluck', midi,
      amp: e.vel * (1 - 0.08 * slot) * (0.95 + 0.1 * rand()), mute: e.mute, rand: seeded(player, id, slot),
    }));
    for (let slot = v.length; slot < prevSlots; slot++) actions.push({ i: t0, slot, type: 'damp' });
    prevSlots = v.length;
    const next = gtrs[j + 1];
    if (!next || next.t > e.t + e.dur + 1e-9) {
      const iEnd = at(e.t + e.dur) + toSamples(drift(player, e.t + e.dur, H.guitar.drift));
      v.forEach((_, slot) => actions.push({ i: iEnd, slot, type: 'damp' }));
      prevSlots = 0;
    }
  });
  actions.sort((a, b) => a.i - b.i);
  const di = renderStrings(actions, total, SR);
  let peak = 1e-9;
  for (const x of di) peak = Math.max(peak, Math.abs(x));
  for (let i = 0; i < total; i++) di[i] /= peak; // fixed level into the amp
  const out = amp(di, SR, RIGS[player]);
  // Post-amp level per stroke, smoothed over 15 ms.
  const env = new Float32Array(total);
  gtrs.forEach((e, j) => env.fill(e.gain, Math.max(0, at(e.t) - 240), j + 1 < gtrs.length ? at(gtrs[j + 1].t) - 240 : total));
  const k = 1 - Math.exp(-1 / (0.015 * SR));
  for (let i = 0, g = env[0]; i < total; i++) out[i] *= g += k * (env[i] - g);
  // Leave 1–4 kHz for the lead vocal: cut there rather than boost the voice (and duck further
  // while it sings, below).
  return filterInPlace(out, biquad('hp', 80, 0.7, SR), biquad('peak', 200, 0.8, SR, 4.5),
    biquad('peak', 750, 1, SR, -2.5), biquad('peak', 1000, 0.7, SR, -4.5), biquad('peak', 1400, 0.8, SR, -3.5));
}
const sumOf = (a, b) => a.map((x, i) => x + b[i]);
const gtrL = sumOf(guitar('gtrL1'), guitar('gtrL2'));
const gtrR = sumOf(guitar('gtrR1'), guitar('gtrR2'));

// While the lead vocal sings (from the score), the guitars' 1–4 kHz band drops 3 dB: a dynamic
// EQ keyed by the vocal, so the guitars keep their bite between lines.
const singing = new Float32Array(total);
for (const e of lead) singing.fill(1, Math.max(0, at(e.t) - toSamples(20)), Math.min(total, at(e.t + e.dur)));
{
  const kA = 1 - Math.exp(-1 / (0.02 * SR)), kR = 1 - Math.exp(-1 / (0.15 * SR));
  for (let i = 0, g = 0; i < total; i++) singing[i] = g += (singing[i] > g ? kA : kR) * (singing[i] - g);
}
duckBand(gtrL, SR, singing);
duckBand(gtrR, SR, singing);

// ---- Lead guitar --------------------------------------------------------------------------------
// The hook melody in the intro: one string with bends (the score's glides) and late vibrato,
// hotter into the same amp, then a dotted-eighth delay. Slightly right of centre, above the
// rhythm guitars.
const LEAD_PAN = 0.25;
const leadNotes = leadGuitar.map((e) => {
  const id = `lead@${e.t}`;
  return {
    i: at(e.t) + toSamples(drift('lead', e.t, H.guitar.drift) + jitter('lead', id, H.guitar.jitter)),
    len: at(e.t + e.dur) - at(e.t), from: e.glide.length ? e.glide[0] : e.midi, to: e.midi,
    amp: 0.9, rand: seeded('lead', id),
  };
});
const leadSt = stereo(total);
if (leadNotes.length) {
  const di = renderLead(leadNotes, total, SR);
  let peak = 1e-9;
  for (const x of di) peak = Math.max(peak, Math.abs(x));
  for (let i = 0; i < total; i++) di[i] /= peak;
  const dry = filterInPlace(amp(di, SR, { drive: 30, mid: 1000, midGain: 6, cabLp: 5500, bias: 0.1 }),
    biquad('hp', 180, 0.7, SR), biquad('peak', 1200, 0.9, SR, 2));
  // Dotted-eighth delay (3 sixteenths = 12,000 samples at 180 bpm), repeats alternating sides
  // and darkening.
  const d = at(3) - at(0);
  const fb = [new Float32Array(total), new Float32Array(total)];
  const dark = [biquad('lp', 3000, 0.7, SR), biquad('lp', 3000, 0.7, SR)];
  const [gl, gr] = panGains(LEAD_PAN);
  for (let i = 0; i < total; i++) {
    const inL = i >= d ? dark[0](0.7 * dry[i - d] + 0.35 * fb[1][i - d]) : 0; // ping
    const inR = i >= d ? dark[1](0.35 * fb[0][i - d]) : 0; // pong
    fb[0][i] = inL;
    fb[1][i] = inR;
    leadSt[0][i] = dry[i] * gl + 0.3 * inL;
    leadSt[1][i] = dry[i] * gr + 0.3 * inR;
  }
}

// ---- Silence mask: stops and cuts are truly silent -------------------------------------------
const mask = new Float32Array(total).fill(1);
for (const [a, b] of silent) {
  const i0 = at(a), i1 = b >= meta.endT ? total : at(b);
  const down = Math.round(0.008 * SR), up = Math.round(0.006 * SR);
  for (let i = i0; i < i1 && i < total; i++) {
    let g = 0;
    if (i < i0 + down) g = 1 - (i - i0) / down;
    if (i >= i1 - up && i1 < total) g = Math.max(g, 1 - (i1 - i) / up);
    mask[i] = Math.min(mask[i], g);
  }
}

// ---- Mix -----------------------------------------------------------------------------------------
// Stem levels are set by target loudness over the first chorus, in LUFS; the targets follow
// the reference take's Demucs stems (drums −2, bass −5, guitars −6 LU against the band).
const TARGET = { drums: -20.2, bass: -23.2, guitars: -24.4 };
const c1 = sections.find((s) => s.name === 'Chorus 1');
const chorus = [at((c1.bar + 1) * BAR), at((c1.bar + c1.bars) * BAR)]; // after the lead-in bar
const stems = {
  drums: drumsSt,
  bass: [bassMono, Float32Array.from(bassMono)],
  gtrL: [gtrL, new Float32Array(total)], // hard left
  gtrR: [new Float32Array(total), gtrR], // hard right
  lead: leadSt,
};
monoLows(stems.gtrL, SR, 160); // hard-panned guitars: their low end goes to the centre
monoLows(stems.gtrR, SR, 160);
monoLows(stems.lead, SR);
for (const st of Object.values(stems)) for (const ch of st) for (let i = 0; i < total; i++) ch[i] *= mask[i];
const gainTo = (chs, target) => db(target - loudness(chs, SR, ...chorus));
const gDrums = gainTo(stems.drums, TARGET.drums);
const gBass = gainTo(stems.bass, TARGET.bass);
const gGtr = gainTo([stems.gtrL[0], stems.gtrR[1]], TARGET.guitars);
const scale = (chs, g) => chs.forEach((ch) => { for (let i = 0; i < total; i++) ch[i] *= g; });
scale(stems.drums, gDrums);
scale(stems.bass, gBass);
scale(stems.gtrL, gGtr);
scale(stems.gtrR, gGtr);
// ---- Fader rides ---------------------------------------------------------------------------------
// Velocity alone can't shape the song: the drums carry most of the loudness, and the drum bus
// compressor and the amps flatten velocity. So, as an engineer rides faders, each stem gets a
// gain per section in dB (0 = the first chorus). A rising range rides up with its `rise`.
const sectionAt = (t) => sections.filter((s) => s.bar * BAR <= t).at(-1)?.name ?? '';
function ride(rg, t) {
  const name = sectionAt(t);
  if (rg.feel === 'verse') return name === 'Verse 2' ? { drums: -2, bass: -1.2 } : { drums: -3, bass: -1.8 };
  if (rg.rise) { const d = 20 * Math.log10(rg.lvl(t)); return { drums: -1 + 0.6 * d, bass: 0.5 * d }; }
  if (rg.feel === 'quiet') return { drums: -2, bass: -2 };
  if (name === 'Intro' && rg.feel === 'drive') return { drums: -2, bass: -1.5, gtr: -1.5 };
  if (name === 'Final chorus' || name === 'Outro') return { drums: 1.5, bass: 1, gtr: 1 };
  return {};
}
const rideEnv = (stem) => {
  const env = new Float32Array(total).fill(1);
  const early = toSamples(5); // move just before the downbeat, so hits land at the new level
  for (const rg of ranges) {
    for (let t = rg.start; t < rg.end; t++) {
      const g = db(ride(rg, t)[stem] ?? 0);
      env.fill(g, Math.max(0, at(t) - early), Math.min(total, rg.end >= meta.endT && t === rg.end - 1 ? total : at(t + 1) - early));
    }
  }
  const k = 1 - Math.exp(-1 / (0.01 * SR));
  for (let i = 0, g = env[0]; i < total; i++) env[i] = g += k * (env[i] - g);
  return env;
};
const applyEnv = (chs, env) => chs.forEach((ch) => { for (let i = 0; i < total; i++) ch[i] *= env[i]; });
applyEnv(stems.drums, rideEnv('drums'));
applyEnv(stems.bass, rideEnv('bass'));
{
  const g = rideEnv('gtr');
  applyEnv(stems.gtrL, g);
  applyEnv(stems.gtrR, g);
}

// The lead sits 1.5 LU over the rhythm pair while it plays: the hook is heard, but the intro
// stays under the chorus.
if (leadNotes.length) {
  const span = [leadNotes[0].i, leadNotes.at(-1).i + leadNotes.at(-1).len];
  const rhythm = loudness([stems.gtrL[0], stems.gtrR[1]], SR, ...span);
  scale(stems.lead, db(rhythm + 1.5 - loudness(stems.lead, SR, ...span)));
}

// Gain-stage the sum to peak at −6 dBFS before the bus (the stems keep that common gain, so
// they sum exactly to the pre-bus mix).
const mix = stereo(total);
const sumStems = () => {
  mix.forEach((ch) => ch.fill(0));
  for (const st of Object.values(stems)) st.forEach((ch, c) => { for (let i = 0; i < total; i++) mix[c][i] += ch[i]; });
};
sumStems();
let mixPeak = 0;
for (const ch of mix) for (const x of ch) mixPeak = Math.max(mixPeak, Math.abs(x));
const stage = db(-6) / mixPeak;
for (const st of Object.values(stems)) scale(st, stage);
sumStems();
const bus = compress(mix, SR, { threshold: -21, ratio: 2, attack: 20, release: 150, knee: 6 });

mkdirSync('music/out', { recursive: true });
const out = (name) => `music/out/ep01-band${name}.wav`;
writeWavFloat(out('-drums'), stems.drums, SR);
writeWavFloat(out('-bass'), stems.bass, SR);
writeWavFloat(out('-gtrL'), stems.gtrL, SR);
writeWavFloat(out('-gtrR'), stems.gtrR, SR);
writeWavFloat(out('-lead'), stems.lead, SR);
writeWavFloat(out(''), mix, SR);

// ---- Band + guide vocal tones, mastered for listening ---------------------------------------------
// The guide tone sits 2.5 LU over the band in the chorus, as the reference's vocal does, then the
// whole thing goes to −14 LUFS with a −1 dBTP true-peak limiter.
const voice = guideVoices();
const vGain = db(loudness(mix, SR, ...chorus) + 2.5 - loudness(voice, SR, ...chorus));
const both = mix.map((ch, c) => Float32Array.from(ch, (x, i) => x + voice[c][i] * vGain));
for (let pass = 0; pass < 2; pass++) {
  const g = db(-14 - loudness(both, SR));
  scale(both, g);
  limit(both, SR, { ceiling: -1.2, lookahead: 2, release: 80 });
}
writeWavFloat('music/out/ep01-band+guide.wav', both, SR);

// ---- Events for the checks ------------------------------------------------------------------------
writeFileSync('music/out/ep01-band-events.json', JSON.stringify({
  sampleRate: SR,
  barSeconds: sec(BAR) - sec(0),
  drums: drums.map((e) => ({ inst: e.inst, tom: e.tom, t: e.t, vel: +e.vel.toFixed(3), grid: sec(e.t), time: e.i / SR })),
  silent: silent.map(([a, b]) => [sec(a), b >= meta.endT ? total / SR : sec(b)]),
  chorus: chorus.map((i) => i / SR),
  sections: sections.map((s) => ({ name: s.name, time: sec(s.bar * BAR), end: sec((s.bar + s.bars) * BAR) })),
  bass: bassNotes.map((n) => ({ time: n.i / SR, end: (n.i + n.len) / SR, midi: n.midi })),
  lead: leadNotes.map((n) => ({ time: n.i / SR, end: (n.i + n.len) / SR, from: n.from, to: n.to })),
  gains: { drums: gDrums, bass: gBass, guitars: gGtr, stage, busMaxGr: bus.maxGr, busMeanGr: bus.meanGr,
    drumBusMaxGr: drumBus.maxGr, drumBusMeanGr: drumBus.meanGr },
}, null, 1));
console.log(`band: ${drums.length} drum hits, ${gtrs.length} guitar strokes, ${basses.length} bass notes; `
  + `drum bus comp max ${drumBus.maxGr.toFixed(1)} dB, mean ${drumBus.meanGr.toFixed(1)} dB; `
  + `mix bus comp max ${bus.maxGr.toFixed(1)} dB, mean ${bus.meanGr.toFixed(1)} dB; ${(total / SR).toFixed(1)} s`);
