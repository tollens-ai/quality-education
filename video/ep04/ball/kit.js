// The kit for "Press, Stress & Guess", episode 4's film: maths, noise, colour, the drawing clock,
// and the record (beats, the piano's stabs, the sung words). Everything is in the 1080×1920
// master's pixels and the song's seconds.

export const W = 1080, H = 1920, TAU = Math.PI * 2;

export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, p) => a + (b - a) * p;
export const inv = (a, b, x) => clamp((x - a) / (b - a));
export const smooth = p => { p = clamp(p); return p * p * (3 - 2 * p); };
export const easeOut = (p, k = 3) => 1 - Math.pow(1 - clamp(p), k);
export const easeIn = (p, k = 3) => Math.pow(clamp(p), k);
export const easeInOut = p => { p = clamp(p); return p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
export const backOut = (p, s = 1.9) => { p = clamp(p) - 1; return 1 + p * p * ((s + 1) * p + s); };
export const elastic = p => { p = clamp(p); return p === 0 || p === 1 ? p : Math.pow(2, -8 * p) * Math.sin((p * 9 - .75) * (TAU / 3)) + 1; };
export const bell = (x, w) => Math.exp(-(x * x) / (w * w));
// 0 → 1 → 0 over [a, b], with ramps of r seconds.
export const window_ = (t, a, b, r = .25) => Math.min(smooth((t - a) / r), smooth((b - t) / r));

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

// ---------------------------------------------------------------- colour
export function hexRgb(h) { const v = parseInt(h.slice(1), 16); return [v >> 16 & 255, v >> 8 & 255, v & 255]; }
export const toHex = c => '#' + c.map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
export function rgba(h, a) { const [r, g, b] = hexRgb(h); return `rgba(${r},${g},${b},${clamp(a)})`; }
export function mix(a, b, p) { const A = hexRgb(a), B = hexRgb(b); return toHex(A.map((v, i) => lerp(v, B[i], clamp(p)))); }

// ---------------------------------------------------------------- the drawing clock
// Drawings change twelve times a second (on twos at 24 fps, the old cartoon rate); the camera and
// the joins move on every frame. `now` is the drawing's time; `boil` picks which of three inkings of
// a drawing is up, so a held pose still breathes the way hand-inked cels do.
export const DRAW_FPS = 12;
export const twos = t => Math.round(t * DRAW_FPS) / DRAW_FPS;
let NOW = 0, BOIL = 0, MONO = 0;
export function setNow(t) { NOW = t; BOIL = Math.floor(t * DRAW_FPS / 2) % 3; }
export const now = () => NOW;
export const boil = () => BOIL;
// How far the colour has drained out (the a cappella breakdown is drawn in ink and cream alone).
export function setMono(m) { MONO = m; }
export const mono = () => MONO;

// ---------------------------------------------------------------- the record
// Filled by loadRecord: beat times, downbeats, the piano's stab events, loudness curves, the words.
export const REC = { beats: [], downs: [], stabs: [], fps: 30, loud: [], voice: [], stab: [], words: [], lines: [] };

export async function loadRecord(S, audioUrl) {
  const b = S.beats;
  REC.beats = (b.beats || []).map(x => typeof x === 'number' ? x : x.t);
  if (!REC.beats.length) { const bs = (b.bar_seconds || 2.4) / 4; for (let t = b.bars?.[0]?.t || 0; t < (b.duration || 200); t += bs) REC.beats.push(t); }
  REC.downs = (b.downbeats || b.bars || []).map(x => typeof x === 'number' ? x : x.t);
  REC.sections = b.sections || [];
  REC.duration = b.duration;
  try {
    const a = await fetch(audioUrl).then(r => r.json());
    REC.fps = a.fps || 30;
    const db = a.db || {};
    const norm = (arr, lo, hi) => (arr || []).map(v => clamp((v - lo) / (hi - lo)));
    REC.loud = a.mix || norm(db.mix, -50, -12);
    REC.voice = norm(db.lead || db.vocals, -45, -14);
    REC.stab = a.piano_onset || [];
    REC.stabs = (a.stabs || []).map(x => typeof x === 'number' ? x : x.t);
    REC.stops = a.stops || [];
  } catch (e) { console.error('no audio.json', e.message); }
  // The sung words, flattened, each knowing its line and its index in it.
  // backing echoes (sung under the lead's held notes) are kept apart from the lead's lines
  REC.echo = S.lyrics.filter(l => l.back);
  REC.lines = S.lyrics.filter(l => !l.back);
  REC.words = [];
  REC.lines.forEach((l, li) => l.words.forEach((w, wi) => REC.words.push({ ...w, li, wi, line: l })));
}

const curve = (arr, t) => { if (!arr.length) return 0; const i = t * REC.fps, k = Math.floor(i); const a = arr[clamp(k, 0, arr.length - 1)], b = arr[clamp(k + 1, 0, arr.length - 1)]; return lerp(a, b, i - k); };
export const loud = t => curve(REC.loud, t);
export const voice = t => curve(REC.voice, t);

// Index of the last beat at or before t (binary search).
function lastIdx(arr, t) { let lo = 0, hi = arr.length - 1, r = -1; while (lo <= hi) { const m = (lo + hi) >> 1; if (arr[m] <= t) { r = m; lo = m + 1; } else hi = m - 1; } return r; }
// Fractional beat count at t, following the measured beats rather than a grid.
export function beatPos(t) {
  const B = REC.beats; if (B.length < 2) return t * 2;
  const i = lastIdx(B, t);
  if (i < 0) return (t - B[0]) / (B[1] - B[0]);
  if (i >= B.length - 1) return B.length - 1 + (t - B[B.length - 1]) / (B[B.length - 1] - B[B.length - 2]);
  return i + (t - B[i]) / (B[i + 1] - B[i]);
}
export const sinceBeat = t => { const i = lastIdx(REC.beats, t); return i < 0 ? 9 : t - REC.beats[i]; };
export const beatAt = k => REC.beats[clamp(Math.round(k), 0, REC.beats.length - 1)];
// The nearest beat time to t.
export function nearBeat(t) { const i = lastIdx(REC.beats, t); const a = REC.beats[Math.max(0, i)], b = REC.beats[Math.min(REC.beats.length - 1, i + 1)]; return (t - a < b - t) ? a : b; }
// A kick of 1 on each beat decaying over d seconds.
export const beatHit = (t, d = .16) => Math.exp(-sinceBeat(t) / d);
// A kick on each piano stab, when stabs were measured; falls back to beats.
export function stabHit(t, d = .14) {
  const A = REC.stabs; if (!A.length) return beatHit(t, d);
  const i = lastIdx(A, t); return i < 0 ? 0 : Math.exp(-(t - A[i]) / d);
}
// The bounce: 0 at each beat, 1 halfway, for a squash-and-stretch cycle on the beat.
export const bounce = t => { const p = beatPos(t) % 1; return Math.sin(Math.PI * p); };
// Alternates -1/+1 every beat, eased: the side-to-side sway of a rubber-hose walk.
export const sway = t => Math.sin(Math.PI * beatPos(t));

// The sung words of a line: pass the line's first few words to find it; nth picks among repeats.
export function lineOf(start, nth = 0) {
  let k = 0;
  for (const l of REC.lines) if (l.text.startsWith(start)) { if (k === nth) return l; k++; }
  console.error('no line', start, nth); return null;
}
export const wordsOf = (start, nth = 0) => lineOf(start, nth)?.words || [];
// Time of the word containing `w` in a line (first match); the lead is the lettering's.
export function when(start, w, nth = 0) {
  const ws = wordsOf(start, nth);
  const x = ws.find(v => v.w.toLowerCase().replace(/[^a-z0-9'-]/g, '').startsWith(w.toLowerCase()));
  if (!x) { console.error('no word', w, 'in', start); return ws[0]?.s ?? 0; }
  return x.s;
}
