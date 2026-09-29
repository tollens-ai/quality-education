// The kit for "Pencil Polka": maths, noise, colour, the record's beat grid and measurements, and
// the sung words. Everything is in the 1080×1920 master's pixels and the song's seconds.

export const W = 1080, H = 1920, TAU = Math.PI * 2;

export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, p) => a + (b - a) * p;
export const inv = (a, b, x) => clamp((x - a) / (b - a));
export const smooth = p => { p = clamp(p); return p * p * (3 - 2 * p); };
export const easeOut = (p, k = 3) => 1 - Math.pow(1 - clamp(p), k);
export const easeIn = (p, k = 3) => Math.pow(clamp(p), k);
export const easeInOut = p => { p = clamp(p); return p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
export const backOut = (p, s = 1.7) => { p = clamp(p) - 1; return 1 + p * p * ((s + 1) * p + s); };
export const elastic = p => { p = clamp(p); return p === 0 || p === 1 ? p : Math.pow(2, -9 * p) * Math.sin((p * 10 - .75) * (TAU / 3)) + 1; };
export const pulseK = (x, w) => Math.exp(-(x * x) / (w * w));

// Deterministic randomness: a hash of any numbers, a seeded generator, value noise in [-1, 1].
export function hash(...n) {
  let h = 2166136261;
  for (const v of n) {
    const x = Math.floor(v * 1000003) | 0;
    h ^= x; h = Math.imul(h, 16777619);
    h ^= h >>> 13; h = Math.imul(h, 0x5bd1e995); h ^= h >>> 15;
  }
  return (h >>> 0) / 4294967296;
}
export function rng(seed) {
  let s = Math.floor(seed * 2654435761) >>> 0 || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}
export function noise(x, seed = 0) {
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return lerp(hash(i, seed) * 2 - 1, hash(i + 1, seed) * 2 - 1, u);
}
export function noise2(x, y, seed = 0) {
  const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const a = hash(i, j, seed), b = hash(i + 1, j, seed), c = hash(i, j + 1, seed), d = hash(i + 1, j + 1, seed);
  return lerp(lerp(a, b, u), lerp(c, d, u), v) * 2 - 1;
}

// ---------------------------------------------------------------- colour
export function hexRgb(h) {
  const v = parseInt(h.slice(1), 16);
  return [v >> 16 & 255, v >> 8 & 255, v & 255];
}
export const toHex = c => '#' + c.map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
export function rgba(h, a) {
  const [r, g, b] = hexRgb(h);
  return `rgba(${r},${g},${b},${clamp(a)})`;
}
export function mix(a, b, p) {
  const A = hexRgb(a), B = hexRgb(b);
  return toHex(A.map((v, i) => lerp(v, B[i], clamp(p))));
}

// ---------------------------------------------------------------- the boil
// A hand-drawn line is redrawn about twelve times a second, each time a little differently, in a
// short cycle of versions (three or four) that isn't a plain 1-2-3: that's what keeps it looking
// drawn, not noisy. `boil(t)` is the drawing number; `variant(t)` is which of the cycle's versions.
export const BOIL_FPS = 12;
const CYCLE = [0, 1, 2, 1, 0, 2, 0, 1, 2, 0, 2, 1];
export const boil = t => Math.floor(t * BOIL_FPS + 1e-6);
export const variant = t => CYCLE[((boil(t) % CYCLE.length) + CYCLE.length) % CYCLE.length];

// ---------------------------------------------------------------- the record
// B = beats.json: { beats: [{t, bar, beat, down}], bars, sections }, A = audio.json.
export const REC = { beats: [], downs: [], A: null, S: null, bpm: 139.2, beatS: .431 };

export async function loadRecord(S, audioUrl) {
  REC.S = S;
  REC.beats = S.beats.beats;
  REC.downs = REC.beats.filter(b => b.down);
  REC.beatS = S.beats.beat_seconds;
  REC.bpm = S.beats.bpm;
  REC.A = await fetch(audioUrl).then(r => r.json());
  REC.hitT = {};
  for (const [k, v] of Object.entries(REC.A.hits)) REC.hitT[k] = v.map(e => e.t);
  setLyrics(S.lyrics);
}
export function lastIndex(list, t) {
  let lo = 0, hi = list.length - 1, ans = -1;
  while (lo <= hi) {
    const m = (lo + hi) >> 1;
    if (list[m] <= t) { ans = m; lo = m + 1; } else hi = m - 1;
  }
  return ans;
}
const bt = () => REC.beats;
// The beat at or before t: its index, and how far through it we are (0..1).
export function beatIdx(t) { return lastIndex(bt().map ? REC._bts || (REC._bts = bt().map(b => b.t)) : [], t); }
export function beatPos(t) {
  const L = REC._bts || (REC._bts = bt().map(b => b.t));
  let i = lastIndex(L, t);
  if (i < 0) return (t - L[0]) / REC.beatS;
  if (i >= L.length - 1) return i + (t - L[i]) / REC.beatS;
  return i + (t - L[i]) / (L[i + 1] - L[i]);
}
export const beatPhase = t => { const b = beatPos(t); return b - Math.floor(b); };
// A pulse that peaks on each beat and dies away: 1 on the beat, near 0 by the next.
export const beatPulse = (t, decay = .16) => { const L = REC._bts || (REC._bts = bt().map(b => b.t)); const i = lastIndex(L, t); return i < 0 ? 0 : Math.exp(-(t - L[i]) / decay); };
// The same but only on downbeats (the "oom").
export const downPulse = (t, decay = .2) => { const D = REC._dts || (REC._dts = REC.downs.map(b => b.t)); const i = lastIndex(D, t); return i < 0 ? 0 : Math.exp(-(t - D[i]) / decay); };
// +1 on the oom's beat, -1 on the pah's, blending smoothly: a lean, left then right.
export const sway = t => Math.cos(beatPos(t) * Math.PI * (bt()[0] && bt()[0].beat === 1 ? 1 : 1) + (bt()[0] && bt()[0].beat === 1 ? 0 : Math.PI));
// The nth beat number in the whole song (for choosing, say, which of two poses).
export const beatNo = t => Math.floor(beatPos(t));
// A percussion or orchestra hit that decays: 1 at the event, 1/e after `decay`.
export function hit(kind, t, decay = .14) {
  const L = REC.hitT[kind];
  if (!L) return 0;
  const i = lastIndex(L, t);
  return i < 0 ? 0 : Math.exp(-(t - L[i]) / decay);
}
export function lastHit(kind, t) { const L = REC.hitT[kind] || []; const i = lastIndex(L, t); return i < 0 ? -1e9 : L[i]; }
// Loudness of a stem (or the mix) at t, 0..1 from its dB.
export function loud(stem, t, floor = -55, top = -15) {
  const c = REC.A.db[stem];
  const f = t * REC.A.fps, i = Math.floor(f);
  const v = c[clamp(i, 0, c.length - 1)] * (1 - (f - i)) + c[clamp(i + 1, 0, c.length - 1)] * (f - i);
  return clamp((v - floor) / (top - floor));
}

// ---------------------------------------------------------------- the words
// Every word lands VLEAD before its measured onset. Episode 2's was chosen by ear from three
// versions of one chorus (Qing, 2026-09-28: "between a and b [...] maybe 80-90"), and animated
// words finish arriving by then. Episode 3 starts from the same lead until its own is chosen.
export const VLEAD = .085;
export const LY = { lines: [] };
export function setLyrics(lines) { LY.lines = lines; }
export function line(section, startsWith, nth = 0) {
  const s = startsWith.toLowerCase();
  const hits = LY.lines.filter(l => l.section === section && l.text.toLowerCase().startsWith(s));
  if (!hits[nth]) throw new Error(`no line "${startsWith}" in ${section}`);
  return hits[nth];
}
export const lineIndex = l => LY.lines.indexOf(l);
export const clean = s => s.replace(/[()]/g, '');
export const caps = s => clean(s).toUpperCase().replace(/’/g, "'");
// A line's words, each with v: the moment it has fully landed.
export function words(section, starts, nth = 0) {
  const l = line(section, starts, nth);
  const li = lineIndex(l);
  return l.words.map((w, wi) => ({ ...w, v: w.s - VLEAD, li, wi, str: clean(w.w) }));
}
