// Vocal post-processing: high-pass, gentle de-esser, small-room reverb, peak normalise.

export function highpass(x, fc, sr = 48000) {
  // 2nd-order Butterworth (RBJ)
  const w0 = (2 * Math.PI * fc) / sr, al = Math.sin(w0) / Math.SQRT2, c = Math.cos(w0), a0 = 1 + al;
  const b0 = (1 + c) / 2 / a0, b1 = -(1 + c) / a0, b2 = b0, a1 = (-2 * c) / a0, a2 = (1 - al) / a0;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const y = b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = y; x[i] = y;
  }
  return x;
}

// Split at ~5 kHz (complementary one-pole), compress the top band 3:1 above a threshold set
// relative to the line's loud-vowel level.
export function deess(x, { sr = 48000, fc = 5000, ratio = 3, rel = 0.35 } = {}) {
  const a = Math.exp((-2 * Math.PI * fc) / sr);
  const hi = new Float32Array(x.length);
  let lp = 0;
  for (let i = 0; i < x.length; i++) { lp = (1 - a) * x[i] + a * lp; hi[i] = x[i] - lp; }
  // reference level: 95th percentile of the full-band envelope
  const env = envelope(x, sr, 0.005, 0.08), henv = envelope(hi, sr, 0.001, 0.06);
  const sorted = Float32Array.from(env).sort();
  const ref = sorted[Math.floor(sorted.length * 0.95)] || 1e-9;
  const thr = ref * rel;
  for (let i = 0; i < x.length; i++) {
    if (henv[i] > thr) {
      const g = (thr / henv[i]) ** (1 - 1 / ratio);
      x[i] = x[i] - hi[i] * (1 - g);
    }
  }
  return x;
}

function envelope(x, sr, att, rel) {
  const ga = Math.exp(-1 / (att * sr)), gr = Math.exp(-1 / (rel * sr));
  const e = new Float32Array(x.length);
  let v = 0;
  for (let i = 0; i < x.length; i++) {
    const a = Math.abs(x[i]);
    v = a > v ? ga * v + (1 - ga) * a : gr * v + (1 - gr) * a;
    e[i] = v;
  }
  return e;
}

// Freeverb-style mono room: 8 damped combs + 4 all-passes, short pre-delay.
export function reverb(x, { sr = 48000, wet = 0.12, room = 0.72, damp = 0.35, predelay = 0.012 } = {}) {
  if (wet <= 0) return x;
  const sc = sr / 44100;
  const combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617].map((l) => ({ buf: new Float32Array(Math.round(l * sc)), i: 0, f: 0 }));
  const aps = [556, 441, 341, 225].map((l) => ({ buf: new Float32Array(Math.round(l * sc)), i: 0 }));
  const pd = Math.round(predelay * sr);
  const out = new Float32Array(x.length);
  for (let n = 0; n < x.length; n++) {
    const inp = (n >= pd ? x[n - pd] : 0) * 0.015;
    let acc = 0;
    for (const c of combs) {
      const y = c.buf[c.i];
      c.f = y * (1 - damp) + c.f * damp;
      c.buf[c.i] = inp + c.f * room;
      c.i = (c.i + 1) % c.buf.length;
      acc += y;
    }
    for (const a of aps) {
      const b = a.buf[a.i];
      const y = -acc + b;
      a.buf[a.i] = acc + b * 0.5;
      a.i = (a.i + 1) % a.buf.length;
      acc = y;
    }
    out[n] = acc;
  }
  // wet level is set relative to the dry signal's RMS
  const rms = (a) => Math.sqrt(a.reduce((s, v) => s + v * v, 0) / a.length) || 1e-9;
  const g = (wet * rms(x)) / rms(out);
  for (let n = 0; n < x.length; n++) out[n] = x[n] + g * out[n];
  return out;
}

export function normalise(x, peakDb = -1) {
  let p = 0;
  for (const v of x) p = Math.max(p, Math.abs(v));
  const g = p > 0 ? 10 ** (peakDb / 20) / p : 1;
  for (let i = 0; i < x.length; i++) x[i] *= g;
  return x;
}

export function removeDC(x) {
  let m = 0;
  for (const v of x) m += v;
  m /= x.length;
  for (let i = 0; i < x.length; i++) x[i] -= m;
  return x;
}
