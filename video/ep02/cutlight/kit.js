// The kit for "Cut Light": maths, noise, colour, the record's measurements (audio.json) and the
// sung words. Everything is in the 1080×1920 master's pixels and the song's seconds.

export const W = 1080, H = 1920, TAU = Math.PI * 2;

export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, p) => a + (b - a) * p;
export const inv = (a, b, x) => clamp((x - a) / (b - a));
export const smooth = p => { p = clamp(p); return p * p * (3 - 2 * p); };
export const smoother = p => { p = clamp(p); return p * p * p * (p * (p * 6 - 15) + 10); };
export const easeOut = (p, k = 3) => 1 - Math.pow(1 - clamp(p), k);
export const easeIn = (p, k = 3) => Math.pow(clamp(p), k);
export const easeInOut = p => { p = clamp(p); return p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
export const expoOut = p => { p = clamp(p); return p === 1 ? 1 : 1 - Math.pow(2, -10 * p); };
export const backOut = (p, s = 1.7) => { p = clamp(p) - 1; return 1 + p * p * ((s + 1) * p + s); };
export const pulse = (x, w) => Math.exp(-(x * x) / (w * w));

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
export const fbm = (x, y, seed = 0, oct = 4) => {
  let s = 0, a = .5, f = 1;
  for (let i = 0; i < oct; i++) { s += a * noise2(x * f, y * f, seed + i * 17); f *= 2; a *= .5; }
  return s;
};

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
// Multiply a colour by a light colour (both hex), times k: how a lit surface reads.
export function lit(base, light, k = 1) {
  const A = hexRgb(base), L = hexRgb(light);
  return toHex(A.map((v, i) => v * L[i] / 255 * k));
}
export function add(a, b, k = 1) {
  const A = hexRgb(a), B = hexRgb(b);
  return toHex(A.map((v, i) => v + B[i] * k));
}

// ---------------------------------------------------------------- the record
// A = audio.json: { fps, env: {mix, vocal, drums, bass, guitar}, kick, snare, cymbal,
// events: {kick, snare, crash, guitar: [[t, midi, s]], riff: [[t, midi, s]]} }.
export const A = { data: null, ev: {}, riff: [] };
export const SONG = { S: null, bar: 1.7626, beat: 1.7626 / 4, t0: 2.345 };

export async function loadAudio(url) {
  A.data = await fetch(url).then(r => r.json());
  const ev = A.data.events;
  A.ev = { kick: ev.kick, snare: ev.snare, crash: ev.crash, guitar: ev.guitar.map(g => g[0]), riff: (ev.riff || []).map(r => r[0]) };
  A.riff = ev.riff || [];
  return A.data;
}
export function setSong(S) {
  SONG.S = S; SONG.bar = S.bar; SONG.beat = S.beat; SONG.t0 = S.beats.bars[0].t;
}
function sample(arr, t) {
  if (!arr) return 0;
  const f = t * A.data.fps, i = Math.floor(f);
  if (i < 0) return arr[0] || 0;
  if (i >= arr.length - 1) return arr[arr.length - 1] || 0;
  return lerp(arr[i], arr[i + 1], f - i);
}
export const env = (name, t) => sample(A.data?.env[name], t);
export const band = (name, t) => sample(A.data?.[name], t);
export function lastIndex(list, t) {
  let lo = 0, hi = list.length - 1, ans = -1;
  while (lo <= hi) {
    const m = (lo + hi) >> 1;
    if (list[m] <= t) { ans = m; lo = m + 1; } else hi = m - 1;
  }
  return ans;
}
export function last(kind, t) {
  const L = A.ev[kind];
  if (!L) return -1e9;
  const i = lastIndex(L, t);
  return i < 0 ? -1e9 : L[i];
}
export function next(kind, t) {
  const L = A.ev[kind];
  if (!L) return 1e9;
  const i = lastIndex(L, t);
  return i + 1 < L.length ? L[i + 1] : 1e9;
}
// A hit that decays: 1 at the event, 1/e after `decay` seconds.
export const hit = (kind, t, decay = .12) => Math.exp(-Math.max(0, t - last(kind, t)) / decay);
export function eventsIn(kind, a, b) {
  const L = A.ev[kind] || [];
  const out = [];
  for (let i = Math.max(0, lastIndex(L, a)); i < L.length && L[i] < b; i++) if (L[i] >= a) out.push(L[i]);
  return out;
}
// Beats and bars, phased to bar 1 (2.345 s).
export const beatPos = t => (t - SONG.t0) / SONG.beat;
export const barPos = t => (t - SONG.t0) / SONG.bar;
export const beatPhase = t => { const b = beatPos(t); return b - Math.floor(b); };

// ---------------------------------------------------------------- the words
// Every word lands 85 ms before its measured onset. Qing chose it by ear from three versions of
// chorus 1 (2026-09-28: "between a and b [...] maybe 80-90"), and animated words finish arriving
// by then.
export const VLEAD = .085;
export const LY = { lines: [] };
export function setLyrics(lines) { LY.lines = lines; }
export function line(section, startsWith, nth = 0) {
  const s = startsWith.toLowerCase();
  const hits = LY.lines.filter(l => l.section === section && l.text.toLowerCase().replace(/[()]/g, '').startsWith(s));
  if (!hits[nth]) throw new Error(`no line "${startsWith}" in ${section}`);
  return hits[nth];
}
export const lineIndex = l => LY.lines.indexOf(l);
// A line's words, each with v: the moment it has fully landed.
export function words(section, starts, nth = 0) {
  const l = line(section, starts, nth);
  const li = lineIndex(l);
  return l.words.map((w, wi) => ({ ...w, v: w.s - VLEAD, li, wi, back: !!l.back, str: clean(w.w) }));
}
export const clean = s => s.replace(/[()]/g, '');
export const caps = s => clean(s).toUpperCase().replace(/’/g, "'");
