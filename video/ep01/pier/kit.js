// Drawing kit for "Good for Who?": maths, easing, seeded randomness, colour, shapes, glows,
// deterministic particles and the song clock. Everything here is a pure function of its
// arguments, so any frame can be drawn on its own.

export const W = 1080, H = 1920;
export const TAU = Math.PI * 2;

// ---------- numbers and easing ----------
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, p) => a + (b - a) * p;
export const inv = (a, b, x) => clamp((x - a) / (b - a));
export const smooth = p => { p = clamp(p); return p * p * (3 - 2 * p); };
export const smoother = p => { p = clamp(p); return p * p * p * (p * (p * 6 - 15) + 10); };
export const easeOut = p => 1 - Math.pow(1 - clamp(p), 3);
export const easeIn = p => Math.pow(clamp(p), 3);
export const easeInOut = p => { p = clamp(p); return p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
export const easeOutQuint = p => 1 - Math.pow(1 - clamp(p), 5);
export function easeOutBack(p, s = 1.70158) { p = clamp(p); if (p === 0) return 0; p -= 1; return p * p * ((s + 1) * p + s) + 1; }
export function easeOutElastic(p) {
  p = clamp(p);
  if (p === 0 || p === 1) return p;
  return Math.pow(2, -10 * p) * Math.sin((p * 10 - .75) * (TAU / 3)) + 1;
}
// A damped spring settling from 0 to 1: overshoot and wobble for arrivals.
export function spring(p, freq = 4.5, damp = 5) {
  if (p <= 0) return 0;
  return 1 - Math.exp(-damp * p) * Math.cos(freq * TAU * p * 0.5);
}
// 0 → 1 → 0 bump over [a, b].
export const bump = (t, a, b) => { const p = inv(a, b, t); return Math.sin(p * Math.PI); };
// Fade in over [a, a+fi] and out over [b-fo, b].
export const window01 = (t, a, b, fi = .2, fo = .2) => Math.min(smooth((t - a) / fi), smooth((b - t) / fo));

// ---------- seeded randomness and noise ----------
export function hash(n) {
  n = Math.imul(n ^ 61, 0x27d4eb2d) ^ (n >>> 15);
  n = Math.imul(n ^ (n >>> 13), 0x85ebca6b);
  n ^= n >>> 16;
  return (n >>> 0) / 4294967296;
}
export const rnd = (i, salt = 0) => hash((i | 0) * 7919 + salt * 104729 + 17);
export const rrange = (i, salt, a, b) => a + (b - a) * rnd(i, salt);
export function noise1(x, seed = 0) {
  const i = Math.floor(x), f = x - i;
  const a = rnd(i, seed), b = rnd(i + 1, seed);
  return lerp(a, b, f * f * (3 - 2 * f)) * 2 - 1;
}
export function noise2(x, y, seed = 0) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const h = (a, b) => rnd(a * 3761 + b * 1597, seed);
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  return lerp(lerp(h(ix, iy), h(ix + 1, iy), ux), lerp(h(ix, iy + 1), h(ix + 1, iy + 1), ux), uy) * 2 - 1;
}
export const fbm1 = (x, seed = 0) => noise1(x, seed) * .6 + noise1(x * 2.1, seed + 1) * .3 + noise1(x * 4.3, seed + 2) * .1;

// ---------- colour ----------
const cache = new Map();
export function rgb(hex) {
  if (cache.has(hex)) return cache.get(hex);
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const v = [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  cache.set(hex, v);
  return v;
}
export const rgba = (hex, a = 1) => { const [r, g, b] = rgb(hex); return `rgba(${r},${g},${b},${a})`; };
export function mix(h1, h2, p, a = 1) {
  const x = rgb(h1), y = rgb(h2);
  return `rgba(${Math.round(lerp(x[0], y[0], p))},${Math.round(lerp(x[1], y[1], p))},${Math.round(lerp(x[2], y[2], p))},${a})`;
}
export function mixHex(h1, h2, p) {
  const x = rgb(h1), y = rgb(h2);
  const c = i => Math.round(lerp(x[i], y[i], clamp(p))).toString(16).padStart(2, '0');
  return `#${c(0)}${c(1)}${c(2)}`;
}
export const shade = (hex, p) => p >= 0 ? mixHex(hex, '#ffffff', p) : mixHex(hex, '#000000', -p);

// The film's palette. Night first, then the summer day.
export const C = {
  ink: '#0a0a24', night0: '#07081f', night1: '#121448', night2: '#2a1d6b', dusk: '#6b2f86', rose: '#c2477f',
  haze: '#8f7fe0', moon: '#fff3d4', bulb: '#ffd98a', bulbHot: '#fff4d8', amber: '#ffab4a', coral: '#ff7a59',
  pink: '#ff4fa3', cyan: '#48e3ff', lime: '#c8ff5a', violet: '#9b6bff', gold: '#ffc94a',
  clawd: '#dd7a58', clawdLit: '#f4a27f', clawdDark: '#a95438', eye: '#23140f',
  cream: '#fff6e8', paper: '#fbf3e4', sea: '#0d1650', wood: '#3a2744', woodLit: '#8a5c63',
  sky: '#7fd4f6', sand: '#f2d7a2', surf: '#e9fbff', sunset: '#ff8f5e',
};

// ---------- shapes ----------
export function rr(g, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2));
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}
export function ellipse(g, x, y, rx, ry, rot = 0) { g.beginPath(); g.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot, 0, TAU); }
export function circle(g, x, y, r) { g.beginPath(); g.arc(x, y, Math.max(0, r), 0, TAU); }
export function star(g, x, y, r1, r2, n = 5, rot = -Math.PI / 2) {
  g.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 ? r2 : r1, a = rot + i * Math.PI / n;
    i ? g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r) : g.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  g.closePath();
}
export function heart(g, x, y, s) {
  g.beginPath();
  g.moveTo(x, y + s * .35);
  g.bezierCurveTo(x - s * .1, y + s * .25, x - s * .55, y + s * .05, x - s * .5, y - s * .25);
  g.bezierCurveTo(x - s * .45, y - s * .55, x - s * .05, y - s * .55, x, y - s * .25);
  g.bezierCurveTo(x + s * .05, y - s * .55, x + s * .45, y - s * .55, x + s * .5, y - s * .25);
  g.bezierCurveTo(x + s * .55, y + s * .05, x + s * .1, y + s * .25, x, y + s * .35);
  g.closePath();
}
// Replay an SVG path (absolute M, L, C, Q, Z) through g, so it can be drawn by hand like anything else.
export function svgPath(g, d) {
  const t = d.match(/[MLCQZ]|-?\d*\.?\d+/g); let i = 0;
  const n = () => +t[i++];
  g.beginPath();
  while (i < t.length) {
    const c = t[i++];
    if (c === 'M') g.moveTo(n(), n());
    else if (c === 'L') g.lineTo(n(), n());
    else if (c === 'C') g.bezierCurveTo(n(), n(), n(), n(), n(), n());
    else if (c === 'Q') g.quadraticCurveTo(n(), n(), n(), n());
    else if (c === 'Z') g.closePath();
  }
}
export function poly(g, pts) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); }
export function line(g, x1, y1, x2, y2) { g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); }

// A vertical gradient fill for the current path's bounding box.
export function vgrad(g, y0, y1, stops) {
  const gr = g.createLinearGradient(0, y0, 0, y1);
  stops.forEach(([o, c]) => gr.addColorStop(o, c));
  return gr;
}
export function lgrad(g, x0, y0, x1, y1, stops) {
  const gr = g.createLinearGradient(x0, y0, x1, y1);
  stops.forEach(([o, c]) => gr.addColorStop(o, c));
  return gr;
}
export function rgrad(g, x, y, r0, r1, stops, x1 = x, y1 = y) {
  const gr = g.createRadialGradient(x, y, r0, x1, y1, r1);
  stops.forEach(([o, c]) => gr.addColorStop(o, c));
  return gr;
}

// ---------- light ----------
// Hand-drawn state, set once per frame by main.js: which of the three boil drawings this is.
export const INK = { col: '#2b1f3c', boil: 0, amp: 2.2, on: true, res: 1 };

// Painted light: a halo laid on as thin washes with wandering edges, screened so it lifts the
// dark without ever burning out. (The look has no additive glow and no bloom.)
export function glow(g, x, y, r, hex, a = 1) {
  if (a <= 0.004 || r <= 0) return;
  const raw = g.raw || g;
  const [cr, cg, cb] = rgb(hex);
  const k = Math.sqrt(Math.abs(raw.getTransform().a * raw.getTransform().d)) || 1;
  raw.save();
  raw.globalCompositeOperation = 'screen';
  if (r * k < 16) {
    raw.fillStyle = `rgba(${cr},${cg},${cb},${Math.min(1, a) * .3})`;
    raw.beginPath(); raw.arc(x, y, r * .6, 0, TAU); raw.fill();
    raw.restore();
    return;
  }
  for (let j = 0; j < 3; j++) {
    const rr = r * (.3 + j * .24);
    raw.fillStyle = `rgba(${cr},${cg},${cb},${Math.min(1, a) * (.2 - j * .05)})`;
    raw.beginPath();
    const n = 30;
    for (let i = 0; i <= n; i++) {
      const ang = i / n * TAU;
      const q = rr * (1 + .1 * noise2(Math.cos(ang) * 1.6 + x * .013 + j * 3.1, Math.sin(ang) * 1.6 + y * .013 + INK.boil * .9, 31));
      const px = x + Math.cos(ang) * q, py = y + Math.sin(ang) * q;
      i ? raw.lineTo(px, py) : raw.moveTo(px, py);
    }
    raw.fill();
  }
  raw.restore();
}
// A light bulb: a painted dab, cream when lit, dull when off, with a small halo. `on` 0..1.
export function bulb(g, x, y, r, hex = C.bulb, on = 1) {
  if (on > 0.02) glow(g, x, y, r * 4.4, hex, .8 * on);
  g.fillStyle = on > .5 ? mix(hex, '#fffaf0', .55 * on) : mix('#3a2a36', hex, on * 1.5);
  circle(g, x, y, r); g.fill();
}

// ---------- text ----------
export function text(g, s, x, y, o = {}) {
  g.save();
  g.font = `${o.style || ''} ${o.weight || 800} ${o.size || 64}px ${o.font || 'Bricolage'}`;
  if (o.stretch) g.fontStretch = o.stretch;
  g.textAlign = o.align || 'center';
  g.textBaseline = o.base || 'alphabetic';
  if (o.ls !== undefined) g.letterSpacing = `${o.ls}px`;
  if (o.shadow) { g.fillStyle = o.shadow; g.fillText(s, x + (o.sx ?? 0), y + (o.sy ?? 6)); }
  if (o.stroke) { g.lineJoin = 'round'; g.lineWidth = o.lw || 8; g.strokeStyle = o.stroke; g.strokeText(s, x, y); }
  g.fillStyle = o.color || '#fff';
  g.globalAlpha *= o.alpha ?? 1;
  g.fillText(s, x, y);
  g.restore();
}
export function measure(g, s, o = {}) {
  g.save();
  g.font = `${o.style || ''} ${o.weight || 800} ${o.size || 64}px ${o.font || 'Bricolage'}`;
  if (o.ls !== undefined) g.letterSpacing = `${o.ls}px`;
  const w = g.measureText(s).width;
  g.restore();
  return w;
}

// ---------- transforms ----------
export function at(g, x, y, s = 1, r = 0, fn) {
  g.save(); g.translate(x, y); if (r) g.rotate(r); if (s !== 1) g.scale(s, s); fn(); g.restore();
}

// ---------- deterministic particles ----------
// Position after tau seconds under gravity gy with linear drag k (closed form, no state).
export function ballistic(x0, y0, vx, vy, gy, k, tau) {
  if (k < 1e-4) return [x0 + vx * tau, y0 + vy * tau + .5 * gy * tau * tau];
  const e = 1 - Math.exp(-k * tau);
  return [x0 + vx / k * e, y0 + (vy - gy / k) / k * e + gy / k * tau];
}

// Confetti burst: n pieces from (x, y) at time t0, fanned around angle `dir` with spread.
export function confetti(g, t, t0, x, y, o = {}) {
  const tau = t - t0;
  if (tau < 0) return;
  const n = o.n || 60, seed = o.seed || 1, colors = o.colors || [C.pink, C.cyan, C.gold, C.lime, '#ffffff', C.coral, C.violet];
  const life = o.life || 3.2;
  for (let i = 0; i < n; i++) {
    const tt = tau - rnd(i, seed + 9) * (o.stagger || 0.08);
    if (tt < 0 || tt > life) continue;
    const a = (o.dir ?? -Math.PI / 2) + (rnd(i, seed) - .5) * (o.spread ?? 1.2);
    const sp = (o.speed || 1500) * (.45 + .75 * rnd(i, seed + 1));
    let [px, py] = ballistic(x, y, Math.cos(a) * sp, Math.sin(a) * sp, o.gravity ?? 900, o.drag ?? 2.4, tt);
    px += Math.sin(tt * (3 + 4 * rnd(i, seed + 2)) + i) * 26 * clamp(tt * 2);
    const rot = rnd(i, seed + 3) * TAU + tt * (4 + 9 * rnd(i, seed + 4)) * (rnd(i, seed + 5) > .5 ? 1 : -1);
    const flip = Math.cos(tt * (6 + 8 * rnd(i, seed + 6)) + i);
    const s = (o.size || 16) * (.6 + .8 * rnd(i, seed + 7));
    const fade = 1 - smooth((tt - life + .6) / .6);
    g.save();
    g.translate(px, py); g.rotate(rot); g.scale(1, flip);
    g.globalAlpha *= fade;
    g.fillStyle = colors[Math.floor(rnd(i, seed + 8) * colors.length)];
    if (i % 5 === 0) { circle(g, 0, 0, s * .45); g.fill(); }
    else if (i % 7 === 1) { g.fillRect(-s * .12, -s * 1.1, s * .24, s * 2.2); }
    else g.fillRect(-s * .5, -s * .3, s, s * .6);
    g.restore();
  }
}

// Streamers: curly paper ribbons shot from (x, y), each a trail of points along its path.
export function streamers(g, t, t0, x, y, o = {}) {
  const tau = t - t0;
  if (tau < 0) return;
  const n = o.n || 8, seed = o.seed || 7, life = o.life || 3;
  const colors = o.colors || [C.pink, C.cyan, C.gold, C.lime, C.violet];
  for (let i = 0; i < n; i++) {
    const a = (o.dir ?? -Math.PI / 2) + (rnd(i, seed) - .5) * (o.spread ?? 1);
    const sp = (o.speed || 1600) * (.6 + .5 * rnd(i, seed + 1));
    const fade = 1 - smooth((tau - life + .6) / .6);
    if (fade <= 0) continue;
    g.strokeStyle = colors[i % colors.length];
    g.lineWidth = (o.w || 9) * (.7 + .5 * rnd(i, seed + 2)); g.lineCap = 'round'; g.lineJoin = 'round';
    g.globalAlpha = fade;
    g.beginPath();
    const segs = 22;
    for (let j = 0; j <= segs; j++) {
      const tt = Math.max(0, tau - j * .022);
      let [px, py] = ballistic(x, y, Math.cos(a) * sp, Math.sin(a) * sp, o.gravity ?? 700, o.drag ?? 2.2, tt);
      const curl = Math.sin(tt * 14 + j * .8 + i) * 18 * clamp(tt * 3);
      px += Math.cos(a + Math.PI / 2) * curl; py += Math.sin(a + Math.PI / 2) * curl;
      j ? g.lineTo(px, py) : g.moveTo(px, py);
    }
    g.stroke();
    g.globalAlpha = 1;
  }
}

// Firework: a shell bursting at (x, y) at t0, sparks with short trails.
export function firework(g, t, t0, x, y, o = {}) {
  const tau = t - t0;
  const life = o.life || 2.2;
  if (tau < 0 || tau > life) return;
  const n = o.n || 70, seed = o.seed || 3, hue = o.color || C.pink, hue2 = o.color2 || '#ffffff';
  const sp0 = o.speed || 520;
  // Flash at the burst.
  if (tau < .25) glow(g, x, y, (o.r || 260) * (1 + tau * 3), hue, (1 - tau / .25) * .8);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + rnd(i, seed) * .15;
    const sp = sp0 * (.8 + .4 * rnd(i, seed + 1));
    const k = 1.8, gy = 160;
    const fade = 1 - smooth((tau - life * .45) / (life * .55));
    const twinkle = tau > life * .5 ? (Math.sin(tau * 40 + i * 7) > 0 ? 1 : .35) : 1;
    const col = i % 3 === 0 ? hue2 : hue;
    let [px, py] = ballistic(x, y, Math.cos(a) * sp, Math.sin(a) * sp, gy, k, tau);
    const [qx, qy] = ballistic(x, y, Math.cos(a) * sp, Math.sin(a) * sp, gy, k, Math.max(0, tau - .12));
    g.strokeStyle = rgba(col, .55 * fade);
    g.lineWidth = o.w || 3.2; g.lineCap = 'round';
    line(g, qx, qy, px, py); g.stroke();
    glow(g, px, py, 16, col, .55 * fade * twinkle);
    g.fillStyle = rgba('#ffffff', fade * twinkle);
    circle(g, px, py, (o.w || 3.2) * .6); g.fill();
  }
}

// ---------- the song clock ----------
// Built once from beats.json + audio.json: beat phase, pulses and envelopes at any time.
export function makeClock(beats, audio) {
  const bars = beats.bars.map(b => b.t);
  const barLen = beats.bar_seconds;
  // Beat times: four per measured bar; extrapolate past the ends.
  const beatTimes = [];
  for (let i = -4; i < bars.length + 4; i++) {
    const a = i < 0 ? bars[0] + i * barLen : i >= bars.length ? bars[bars.length - 1] + (i - bars.length + 1) * barLen : bars[i];
    const b = i + 1 < 0 ? bars[0] + (i + 1) * barLen : i + 1 >= bars.length ? bars[bars.length - 1] + (i - bars.length + 2) * barLen : bars[i + 1];
    for (let k = 0; k < 4; k++) beatTimes.push(a + (b - a) * k / 4);
  }
  const find = (arr, t) => { let lo = 0, hi = arr.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (arr[m] <= t) lo = m; else hi = m - 1; } return lo; };
  const env = (k, t) => {
    const a = audio[k]; if (!a) return 0;
    const f = t * audio.fps, i = Math.floor(f), p = f - i;
    return lerp(a[clamp(i, 0, a.length - 1)] || 0, a[clamp(i + 1, 0, a.length - 1)] || 0, p);
  };
  // Smoothed envelope (average over +-w seconds).
  const envS = (k, t, w = .05) => (env(k, t - w) + env(k, t) + env(k, t + w)) / 3;
  return {
    barLen, beat: barLen / 4,
    // Fractional beat index (integer part counts beats from the first measured bar).
    beatPos(t) { const i = find(beatTimes, t); const a = beatTimes[i], b = beatTimes[i + 1] ?? a + barLen / 4; return i - 16 + (t - a) / (b - a); },
    barPos(t) { return this.beatPos(t) / 4; },
    // 1 at each beat, decaying with time constant `d` seconds.
    pulse(t, d = .12) { const i = find(beatTimes, t); return Math.exp(-(t - beatTimes[i]) / d); },
    barPulse(t, d = .2) { const i = find(bars, t); return t < bars[0] ? 0 : Math.exp(-(t - bars[i]) / d); },
    // Seconds since the last beat / bar.
    sinceBeat(t) { return t - beatTimes[find(beatTimes, t)]; },
    beatAt(n) { return beatTimes[n + 16]; },
    barAt(n) { return bars[clamp(n, 0, bars.length - 1)]; },
    bars,
    env, envS,
    kick: t => env('low', t),
    vocal: t => envS('vocal', t, .03),
    mix: t => envS('mix', t, .08),
  };
}
