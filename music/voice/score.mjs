// Turns syllable events into a phoneme timeline, then into 1 kHz control tracks
// (formants, amplitudes, frication spectrum, nasality, f0) for synth.mjs.

import { CONS, isVowel, SYLLABIC, vowelTargets, consonantFormants, velarSpec } from './phonemes.mjs';
import { rng } from './util.mjs';

export const FR = 1000; // control frames per second

// ---------------------------------------------------------------- scheduling

function parseSyllable(phs) {
  let ni = phs.findIndex(isVowel);
  if (ni < 0) ni = phs.findIndex((p) => SYLLABIC.has(p));
  if (ni < 0) throw new Error(`no nucleus in [${phs.join(' ')}]`);
  for (const p of phs) if (!isVowel(p) && !(p in CONS)) throw new Error(`unknown phoneme ${p}`);
  return { onset: phs.slice(0, ni), nucleus: phs[ni], coda: phs.slice(ni + 1) };
}

// Default duration of a consonant in a position; `last` = phrase-final coda (fully released).
function consDur(ph, pos, last) {
  const c = CONS[ph];
  if (c.kind === 'stop') return c.clo + (pos === 'onset' ? c.vot : last ? 0.04 : 0.018);
  if (c.kind === 'affr') return c.clo + c.fric;
  if (c.kind === 'nasal' || c.kind === 'approx') return c.dur * (pos === 'coda' ? 1.2 : 1);
  return c.dur * (pos === 'coda' && last ? 1.3 : 1);
}

const sum = (a) => a.reduce((x, y) => x + y, 0);

// events: [{ start, end, midi | pitch:[[t,midi],...], phonemes, stress, scoop, spoken }]
// returns { syls, segs }; every seg: { ph, t0, t1, pos, syl, kind, ... }
export function schedule(events, opts = {}) {
  const tempo = opts.consonantScale ?? 1;
  const syls = events.map((e, i) => {
    const s = { ...e, i, ...parseSyllable(e.phonemes) };
    return s;
  });
  syls.forEach((s, i) => {
    const next = syls[i + 1];
    const lastCoda = !next || next.start - 0.15 > s.end;
    s.onDur = s.onset.map((p) => consDur(p, 'onset') * tempo);
    s.codaDur = s.coda.map((p, j) => consDur(p, 'coda', lastCoda && j === s.coda.length - 1) * tempo);
    // A final stop after another consonant (prompt, fast) is released briefly.
  });
  for (let i = 0; i < syls.length; i++) {
    const s = syls[i], next = syls[i + 1];
    const nOn = next ? sum(next.onDur) : 0;
    let codaT = sum(s.codaDur);
    const overlap = next && next.start - nOn < s.end + 0.001;
    const span = (overlap ? next.start : s.end) - s.start;
    // Singers keep the vowel: it gets at least `vowelShare` of the note, consonants squeeze.
    const minV = Math.max(0.045, (s.pitch ? 0.32 : opts.vowelShare ?? 0.5) * span);
    const need = codaT + (overlap ? nOn : 0);
    const room = span - minV;
    if (need > room) {
      const f = Math.max(s.pitch ? 0.35 : opts.squeezeFloor ?? 0.22, room / need);
      s.codaDur = s.codaDur.map((d) => d * f);
      if (overlap) next.onDur = next.onDur.map((d) => d * f);
      codaT *= f;
    }
    s.release = overlap ? next.start - sum(next.onDur) : s.end;
    s.vowelEnd = s.release - codaT;
    s.onsetStart = s.start - sum(s.onDur);
  }
  const segs = [];
  for (const s of syls) {
    let t = s.onsetStart;
    s.onset.forEach((p, j) => {
      segs.push(mkSeg(p, t, t + s.onDur[j], 'onset', s));
      t += s.onDur[j];
    });
    segs.push(mkSeg(s.nucleus, s.start, s.vowelEnd, 'nucleus', s));
    t = s.vowelEnd;
    s.coda.forEach((p, j) => {
      segs.push(mkSeg(p, t, t + s.codaDur[j], 'coda', s));
      t += s.codaDur[j];
    });
  }
  // A stop followed by another stop (duct, "prompt", "good day") is unreleased: one long
  // closure, only the last stop bursts.
  for (let i = 0; i + 1 < segs.length; i++) {
    const a = segs[i], b = segs[i + 1];
    if (a.kind === 'stop' && ['stop', 'affr'].includes(b.kind) && b.t0 - a.t1 < 0.005) a.unreleased = true;
  }
  for (let i = 0; i < segs.length; i++) {
    segs[i].prev = segs[i - 1] && segs[i - 1].t1 > segs[i].t0 - 0.03 ? segs[i - 1] : null;
    segs[i].next = segs[i + 1] && segs[i + 1].t0 < segs[i].t1 + 0.03 ? segs[i + 1] : null;
  }
  return { syls, segs };
}

function mkSeg(ph, t0, t1, pos, syl) {
  const vow = pos === 'nucleus' && isVowel(ph);
  const kind = vow ? 'vowel' : CONS[ph].kind;
  return { ph, t0, t1, pos, syl, kind, vowel: vow };
}

// ---------------------------------------------------------------- tracks

const TRANS_IN = { stop: 0.03, affr: 0.03, nasal: 0.035, fric: 0.03, approx: 0.05, h: 0.0, vowel: 0.04 };
const TRANS_OUT = { stop: 0.035, affr: 0.035, nasal: 0.04, fric: 0.03, approx: 0.05, h: 0.02, vowel: 0.04 };

// The vowel target a consonant coarticulates with.
function neighbourVowel(seg) {
  const s = seg.syl;
  if (!isVowel(s.nucleus)) return { F: [500, 1600, 2800], B: [80, 100, 160] };
  const [a, b] = vowelTargets(s.nucleus);
  return seg.pos === 'coda' ? b : a;
}

export function buildTracks(segs, syls, dur, opts = {}) {
  const N = Math.ceil(dur * FR) + 2;
  const T = {
    F1: new Float32Array(N), F2: new Float32Array(N), F3: new Float32Array(N),
    B1: new Float32Array(N), B2: new Float32Array(N), B3: new Float32Array(N),
    AV: new Float32Array(N), AH: new Float32Array(N), AF: new Float32Array(N),
    G: Array.from({ length: 9 }, () => new Float32Array(N)),
    NAS: new Float32Array(N), MUR: new Float32Array(N), FZ: new Float32Array(N).fill(1500),
    TILT: new Float32Array(N), B1X: new Float32Array(N), LPF: new Float32Array(N), VOW: new Float32Array(N), N,
  };
  const breath = opts.breath ?? 0.05;
  const burstGain = opts.burstGain ?? 1.6, aspGain = opts.aspGain ?? 1.8;
  const approxAV = opts.approxAV ?? 0.5;
  const fi = (t) => Math.max(0, Math.min(N - 1, Math.round(t * FR)));
  const fill = (arr, t0, t1, v) => { for (let f = fi(t0); f < fi(t1); f++) arr[f] = v; };
  const fillG = (spec, t0, t1) => { for (let k = 0; k < 9; k++) fill(T.G[k], t0, t1, spec[k]); };

  // ---- formant keyframes
  const keys = []; // {t, F:[3], B:[3]}
  const key = (t, F, B) => keys.push({ t, F, B });
  const bursts = []; // {t, lvl, decay}

  for (const g of segs) {
    const d = g.t1 - g.t0;
    const dyn = g.syl.dyn ?? (g.syl.stress ? 1.0 : 0.8);
    if (g.kind === 'vowel') {
      const [A, Bv] = vowelTargets(g.ph);
      let tin = g.prev ? (CONS[g.prev.ph]?.tin ?? TRANS_IN[g.prev.kind]) : 0;
      let tout = g.next ? (CONS[g.next.ph]?.tin ?? TRANS_OUT[g.next.kind]) : 0;
      if (tin + tout > d) { const f = d / (tin + tout + 1e-9); tin *= f; tout *= f; }
      key(g.t0 + tin, A.F, A.B);
      if (A !== Bv) {
        // Singers hold the first target and glide late.
        const glide = Math.min(0.16, 0.5 * d);
        key(Math.max(g.t0 + tin, g.t1 - glide - tout * 0.5), A.F, A.B);
        key(g.t1 - Math.min(tout, 0.02), Bv.F, Bv.B);
      } else key(g.t1 - tout, A.F, A.B);
      fill(T.AV, g.t0, g.t1, dyn);
      fill(T.VOW, g.t0 + 0.4 * tin, g.t1 - 0.4 * tout, 1);
      fill(T.AH, g.t0, g.t1, breath * dyn);
      fill(T.TILT, g.t0, g.t1, dyn);
      continue;
    }
    if (!isVowel(g.syl.nucleus) && g.pos === 'nucleus') {
      // syllabic consonant (n, m, l) as nucleus: treat as a long voiced consonant
    }
    const c = CONS[g.ph];
    const v = neighbourVowel(g);
    let F = consonantFormants(g.ph, v, g.pos);
    // Voiceless obstruents: voicing stops (coda) or starts (onset, after aspiration) while F1 is
    // still near the vowel's value, so there is no audible F1 transition. Voiced ones show it.
    if (!c.voiced && ['stop', 'affr', 'fric'].includes(c.kind)) F = [v.F[0] * 0.85, F[1], F[2]];
    const nas = c.kind === 'nasal';
    const Bc = nas ? [100, 500, 700] : c.kind === 'approx' ? (c.B ?? [90, 120, 180]) : [150, 180, 250];
    switch (c.kind) {
      case 'stop': {
        const clo = g.unreleased ? d : Math.min(c.clo, d * 0.75);
        const tr = g.t0 + clo; // release
        key(g.t0, F, Bc); key(tr, F, Bc);
        if (c.voiced) fill(T.AV, g.t0, tr, 0.1);
        fill(T.LPF, g.t0, tr, 1);
        if (g.unreleased) break;
        fill(T.TILT, g.t0, g.t1, 0.4);
        // velar bursts are longer (and often double); labial ones short and weak
        const decay = c.place === 'vel' ? 0.012 : c.place === 'alv' ? 0.007 : 0.004;
        bursts.push({ t: tr, lvl: burstGain * c.lvl * (g.pos === 'coda' ? 0.4 : 1), decay });
        if (c.place === 'vel' && !c.voiced) bursts.push({ t: tr + 0.014, lvl: burstGain * c.lvl * 0.4, decay: 0.008 });
        const spec = c.place === 'vel' ? velarSpec(F[1]) : c.spec;
        fillG(spec, tr - 0.002, g.t1);
        if (!c.voiced) {
          fill(T.AH, tr + 0.004, g.pos === 'onset' ? g.t1 : Math.min(g.t1, tr + 0.025), aspGain * (g.pos === 'onset' ? 0.22 : 0.1));
          fill(T.AF, tr + 0.004, Math.min(g.t1, tr + 0.025), c.lvl * 0.25);
          fill(T.B1X, tr, g.t1, 300); // open glottis damps F1 during aspiration
        } else {
          fill(T.AV, tr, g.t1, 0.35 * dyn);
        }
        break;
      }
      case 'affr': {
        const tr = g.t0 + Math.min(c.clo, d * 0.45);
        key(g.t0, F, Bc); key(g.t1, F, Bc);
        if (c.voiced) { fill(T.AV, g.t0, tr, 0.1); fill(T.AV, tr, g.t1, 0.3); }
        fill(T.LPF, g.t0, tr, 1);
        bursts.push({ t: tr, lvl: c.lvl * 0.7, decay: 0.004 });
        fillG(c.spec, tr - 0.002, g.t1);
        fill(T.AF, tr, g.t1, c.lvl);
        break;
      }
      case 'fric': {
        key(g.t0, F, Bc); key(g.t1, F, Bc);
        fillG(c.spec, g.t0, g.t1);
        fill(T.AF, g.t0, g.t1, c.lvl);
        if (c.voiced) fill(T.AV, g.t0, g.t1, 0.2 * dyn);
        fill(T.LPF, g.t0, g.t1, 0.8);
        fill(T.TILT, g.t0, g.t1, 0.4);
        break;
      }
      case 'h': {
        const nv = g.next && g.next.kind === 'vowel' ? vowelTargets(g.next.ph)[0] : v;
        key(g.t0, nv.F, nv.B); key(g.t1, nv.F, nv.B);
        fill(T.AH, g.t0, g.t1, 0.28 * aspGain);
        fill(T.B1X, g.t0, g.t1, 250);
        break;
      }
      case 'nasal': {
        key(g.t0, F, Bc); key(g.t1, F, Bc);
        fill(T.AV, g.t0, g.t1, 0.55 * dyn);
        fill(T.AH, g.t0, g.t1, breath * 0.5);
        fill(T.NAS, g.t0, g.t1, 1);
        fill(T.MUR, g.t0, g.t1, 1);
        fill(T.LPF, g.t0, g.t1, opts.nasalLp ?? 0.8);
        fill(T.FZ, g.t0, g.t1, c.zero);
        fill(T.TILT, g.t0, g.t1, 0.5);
        break;
      }
      case 'approx': {
        key(g.t0 + 0.3 * d, F, Bc); key(g.t1 - 0.3 * d, F, Bc);
        fill(T.AV, g.t0, g.t1, (c.av ?? 1) * approxAV * dyn);
        if (c.lp) fill(T.LPF, g.t0, g.t1, c.lp);
        fill(T.AH, g.t0, g.t1, breath);
        fill(T.TILT, g.t0, g.t1, 0.7 * dyn);
        // devoiced after a voiceless stop in the onset (pr, kl, tw)
        if (g.prev && g.prev.kind === 'stop' && !CONS[g.prev.ph].voiced && g.pos === 'onset') {
          fill(T.AV, g.t0, g.t0 + 0.4 * d, 0.15);
          fill(T.AH, g.t0, g.t0 + 0.4 * d, 0.2);
        }
        break;
      }
    }
  }
  // Voiceless codas: voicing stops abruptly, with a brief glottal squeeze (British pre-
  // glottalisation), the main cue that "sat" isn't "sad" when the vowel length is fixed by a note.
  for (const g of segs) {
    if (g.pos !== 'coda' || !g.prev || g.prev.kind !== 'vowel') continue;
    const c = CONS[g.ph];
    if (!c || c.voiced || !['stop', 'affr', 'fric'].includes(c.kind)) continue;
    const t1 = g.t0, t0 = Math.max(g.prev.t0, t1 - 0.03);
    for (let f = fi(t0); f < fi(t1); f++) T.AV[f] *= 1 - 0.5 * ((f - fi(t0)) / Math.max(1, fi(t1) - fi(t0)));
    fill(T.AV, t1, t1 + 0.004, 0);
  }
  keys.sort((a, b) => a.t - b.t);
  // interpolate formant keys onto frames
  let k = 0;
  for (let f = 0; f < N; f++) {
    const t = f / FR;
    while (k < keys.length - 1 && keys[k + 1].t <= t) k++;
    let F, B;
    if (!keys.length) { F = [500, 1500, 2500]; B = [80, 100, 160]; }
    else if (t <= keys[0].t) ({ F, B } = keys[0]);
    else if (k >= keys.length - 1) ({ F, B } = keys[keys.length - 1]);
    else {
      const a = keys[k], b = keys[k + 1];
      const u = b.t > a.t ? (t - a.t) / (b.t - a.t) : 1;
      F = a.F.map((x, j) => x + (b.F[j] - x) * u);
      B = a.B.map((x, j) => x + (b.B[j] - x) * u);
    }
    T.F1[f] = F[0]; T.F2[f] = F[1]; T.F3[f] = F[2];
    T.B1[f] = B[0]; T.B2[f] = B[1]; T.B3[f] = B[2];
  }
  // phrase releases: a sung phrase ends with a short breathy decay
  for (const s of syls) {
    const nx = syls[s.i + 1];
    if (!nx || nx.onsetStart > s.release + 0.05) {
      if (!s.coda.length) {
        const f0 = fi(s.vowelEnd);
        for (let f = f0; f < Math.min(N, f0 + 80); f++) {
          const u = (f - f0) / 80;
          T.AH[f] = Math.max(T.AH[f], breath * 1.6 * (1 - u) ** 2);
        }
      }
    }
  }
  // smoothing
  smooth(T.AV, 8); smooth(T.AH, 8); smooth(T.AF, 4); smooth(T.TILT, 20);
  for (const g of T.G) smooth(g, 3);
  smooth(T.NAS, 35); smooth(T.MUR, 8); smooth(T.B1X, 6); smooth(T.LPF, 4); smooth(T.VOW, 12);
  for (const a of [T.F1, T.F2, T.F3, T.B1, T.B2, T.B3]) smooth(a, 8);
  // bursts (after smoothing: they are transients)
  for (const b of bursts) {
    const f0 = fi(b.t);
    for (let f = f0; f < Math.min(N, f0 + 30); f++) T.AF[f] += b.lvl * Math.exp(-(f - f0) / (b.decay * FR));
  }
  return T;
}

// centred moving average, window w frames
export function smooth(a, w) {
  if (w <= 1) return a;
  const n = a.length, out = new Float32Array(n), h = Math.floor(w / 2);
  let acc = 0;
  const get = (i) => a[Math.max(0, Math.min(n - 1, i))];
  for (let i = -h; i < w - h; i++) acc += get(i);
  for (let i = 0; i < n; i++) {
    out[i] = acc / w;
    acc += get(i + w - h) - get(i - h);
  }
  a.set(out);
  return a;
}

// ---------------------------------------------------------------- pitch

const m2hz = (m) => 440 * 2 ** ((m - 69) / 12);

// f0 track (Hz per frame): note targets with scoops, 2nd-order overshoot, late vibrato, drift.
export function buildPitch(syls, N, opts = {}) {
  const seed = opts.seed ?? 1;
  const R = rng(seed * 7919 + 17);
  const target = new Float32Array(N); // in midi
  const fi = (t) => Math.max(0, Math.min(N - 1, Math.round(t * FR)));
  const spoken = syls.some((s) => s.pitch);
  // change points
  const pts = syls.map((s, i) => {
    const onT = s.start - s.onsetStart;
    const change = i === 0 ? 0 : s.start - Math.max(0.03, 0.45 * onT);
    return { s, change };
  });
  for (let i = 0; i < pts.length; i++) {
    const { s, change } = pts[i];
    const endF = i + 1 < pts.length ? fi(pts[i + 1].change) : N;
    for (let f = fi(change); f < endF; f++) {
      const t = f / FR;
      target[f] = s.pitch ? curveAt(s.pitch, t) : s.midi;
    }
    if (s.scoop && !s.pitch) {
      const semis = s.scoop.semis ?? s.scoop, sd = s.scoop.dur ?? 0.12;
      const a = fi(s.onsetStart - 0.01), b = fi(s.start + sd);
      for (let f = a; f < b && f < endF; f++) {
        const u = Math.max(0, (f / FR - s.start) / sd);
        const e = u < 1 ? (1 - u) ** 2 : 0;
        target[f] = s.midi - semis * (f / FR < s.start ? 1 : e);
      }
    }
  }
  // Microprosody: f0 starts higher after a voiceless onset obstruent, lower after a voiced one
  // (a voicing cue listeners use), relaxing over ~60 ms.
  for (const s of syls) {
    const c = CONS[s.onset[s.onset.length - 1]];
    if (!c || !['stop', 'affr', 'fric'].includes(c.kind)) continue;
    const d = c.voiced ? -0.4 : 0.9;
    for (let f = fi(s.start - 0.01); f < fi(s.start + 0.06); f++) target[f] += d * Math.max(0, 1 - (f / FR - s.start + 0.01) / 0.07);
  }
  // 2nd-order critically-underdamped follower (overshoot, Saitou et al.)
  // Short notes get a faster, less springy response so the overshoot doesn't eat the note.
  const wf = new Float32Array(N).fill(spoken ? 9 : (opts.agility ?? 7));
  if (!spoken) for (const s of syls) {
    const len = s.end - s.start;
    if (len < 0.3) for (let f = fi(s.onsetStart - 0.03); f < fi(s.end); f++) wf[f] = opts.shortAgility ?? 16;
  }
  const z = 0.6, dt = 1 / FR;
  const out = new Float32Array(N);
  let x = target[0], v = 0;
  for (let f = 0; f < N; f++) {
    const w = 2 * Math.PI * wf[f];
    const a = w * w * (target[f] - x) - 2 * z * w * v;
    v += a * dt; x += v * dt;
    out[f] = x;
  }
  // vibrato on long notes, starting late
  if (!spoken) {
    const vr = opts.vibratoRate ?? 5.6, vd = opts.vibratoDepth ?? 0.35; // semitones (peak)
    for (const s of syls) {
      const len = s.vowelEnd - s.start;
      if (len < 0.5) continue;
      const on = s.start + Math.max(0.28, 0.35 * len), ramp = 0.3;
      const rate = vr * (1 + 0.05 * (R() - 0.5));
      let ph = 0;
      for (let f = fi(on); f < fi(s.vowelEnd + 0.02); f++) {
        const t = f / FR;
        const g = Math.min(1, (t - on) / ramp);
        ph += (2 * Math.PI * rate) / FR;
        out[f] += vd * g * Math.sin(ph);
      }
    }
  }
  // fine fluctuation: two octaves of smoothed noise, ~±8 cents
  const drift = new Float32Array(N);
  let d1 = 0, d2 = 0;
  for (let f = 0; f < N; f++) {
    d1 += 0.02 * ((R() - 0.5) * 2 - d1 * 0.05) ; d2 = 0.97 * d2 + 0.03 * (R() - 0.5) * 2;
    drift[f] = d1 * 0.5 + d2 * 0.6;
  }
  const hz = new Float32Array(N);
  const fl = opts.fluctuation ?? 0.4;
  const tr = opts.transpose ?? 0;
  for (let f = 0; f < N; f++) hz[f] = m2hz(out[f] + tr + fl * Math.max(-1.5, Math.min(1.5, drift[f])));
  return hz;
}

function curveAt(pts, t) {
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    if (t <= pts[i][0]) {
      const [t0, m0] = pts[i - 1], [t1, m1] = pts[i];
      return m0 + ((m1 - m0) * (t - t0)) / (t1 - t0);
    }
  }
  return pts[pts.length - 1][1];
}
