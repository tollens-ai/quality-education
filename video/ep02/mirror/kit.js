// Shared kit for "The Mirror", episode 2's video: palette, maths, noise, easing, and access to
// the record's measurements (audio.json from tools/analyse.py) and word timings.
//
// Coordinates are the 1080×1920 master; stage.js scales the canvas.

export const W = 1080, H = 1920, TAU = Math.PI * 2;

// Black, bone and blood red, with Clawd's orange the only warm colour, and a cold tint for glass.
export const C = {
  ink: '#0b0a0e', ink2: '#17141d', ink3: '#26222e',
  bone: '#eee8dc', bone2: '#cbc2b2', bone3: '#9d9486',
  red: '#e0102f', red2: '#9c0a21', red3: '#5a0613',
  clawd: '#d97757', clawd2: '#a9523a', clawd3: '#f2a07e',
  steel: '#8e96a0', steel2: '#5b626c',
  glass: '#9fd8e6', glass2: '#4f7d89', glass3: '#1b2e34',
  skin: '#e9c3a4', skin2: '#c08f72', skinD: '#8a5b45', skinD2: '#5f3b2c',
};

export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, p) => a + (b - a) * p;
export const inv = (a, b, x) => clamp((x - a) / (b - a));
export const smooth = p => { p = clamp(p); return p * p * (3 - 2 * p); };
export const easeOut = (p, k = 3) => 1 - Math.pow(1 - clamp(p), k);
export const easeIn = (p, k = 3) => Math.pow(clamp(p), k);
export const easeInOut = p => { p = clamp(p); return p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
export const backOut = (p, s = 1.7) => { p = clamp(p) - 1; return 1 + p * p * ((s + 1) * p + s); };
export const elastic = p => { p = clamp(p); return p === 0 || p === 1 ? p : Math.pow(2, -10 * p) * Math.sin((p * 10 - .75) * TAU / 3) + 1; };

// Deterministic randomness: a hash of any numbers, and a seeded generator.
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
// Smooth 1-D value noise in [-1, 1].
export function noise(x, seed = 0) {
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return lerp(hash(i, seed) * 2 - 1, hash(i + 1, seed) * 2 - 1, u);
}

// Drawings change on twos, as cel animation does: 12 drawings a second.
export const twos = t => Math.floor(t * 12) / 12;

export function hexRgb(h) {
  const v = parseInt(h.slice(1), 16);
  return [v >> 16 & 255, v >> 8 & 255, v & 255];
}
export function rgba(h, a) {
  const [r, g, b] = hexRgb(h);
  return `rgba(${r},${g},${b},${a})`;
}
export function mix(a, b, p) {
  const A = hexRgb(a), B = hexRgb(b);
  const c = A.map((v, i) => Math.round(lerp(v, B[i], clamp(p))));
  return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
}

// ---------------------------------------------------------------- the record
// A = audio.json: { fps, env: {mix, vocal, drums, bass, guitar}, kick, snare, cymbal,
// events: {kick: [t], snare: [t], crash: [t], guitar: [[t, midi|null, strength]]} }.
export const A = { data: null };

export async function loadAudio(url) {
  A.data = await fetch(url).then(r => r.json());
  const ev = A.data.events;
  A.ev = { kick: ev.kick, snare: ev.snare, crash: ev.crash, guitar: ev.guitar.map(g => g[0]), riff: (ev.riff || []).map(r => r[0]) };
  A.riff = ev.riff || [];
  return A.data;
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

// Binary search in a sorted list: index of the last value <= t (or -1).
export function lastIndex(list, t) {
  let lo = 0, hi = list.length - 1, ans = -1;
  while (lo <= hi) {
    const m = (lo + hi) >> 1;
    if (list[m] <= t) { ans = m; lo = m + 1; } else hi = m - 1;
  }
  return ans;
}
export function last(kind, t) {
  const L = A.ev?.[kind];
  if (!L) return -1e9;
  const i = lastIndex(L, t);
  return i < 0 ? -1e9 : L[i];
}
export function next(kind, t) {
  const L = A.ev?.[kind];
  if (!L) return 1e9;
  const i = lastIndex(L, t);
  return i + 1 < L.length ? L[i + 1] : 1e9;
}
// A hit that decays: 1 at the event, falling to 1/e after `decay` seconds.
export const hit = (kind, t, decay = .12) => Math.exp(-(t - last(kind, t)) / decay);
export function eventsIn(kind, a, b) {
  const L = A.ev?.[kind] || [];
  const out = [];
  for (let i = Math.max(0, lastIndex(L, a)); i < L.length && L[i] < b; i++) if (L[i] >= a) out.push(L[i]);
  return out;
}

// ---------------------------------------------------------------- the words
// Lyric lines from lyrics.json, found by section and by their first words.
export const LY = { lines: [] };
export function setLyrics(lines) { LY.lines = lines; }
export function line(section, startsWith, nth = 0) {
  const s = startsWith.toLowerCase();
  const hits = LY.lines.filter(l => l.section === section && l.text.toLowerCase().replace(/[()]/g, '').startsWith(s));
  if (!hits[nth]) throw new Error(`no line "${startsWith}" in ${section}`);
  return hits[nth];
}
export const lineIndex = l => LY.lines.indexOf(l);
