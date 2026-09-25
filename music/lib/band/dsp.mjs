// Signal processing shared by the band instruments: an oversampler for nonlinearities,
// band-limited oscillators, a modulatable filter, bus compression, a small room and a
// true-peak limiter. Everything runs offline over whole Float32Arrays.
import { biquad as bq } from '../audio.mjs';

// ---- 4x oversampling -----------------------------------------------------------------------
// Polyphase windowed-sinc (Kaiser) up- and down-sampler. The whole chain delays by exactly
// TAPS_HALF / 4 base samples, which `oversample4` removes, so timing is untouched.

function besselI0(x) {
  let sum = 1, term = 1;
  for (let k = 1; k < 50; k++) {
    term *= (x / (2 * k)) ** 2;
    sum += term;
    if (term < 1e-12 * sum) break;
  }
  return sum;
}

const OS = 4;
const TAPS = 4 * 24 + 1; // odd, so the delay is a whole number of base samples
const TAPS_HALF = (TAPS - 1) / 2; // 48 at 4x = 12 base samples per filter
const FIR = (() => {
  const beta = 9;
  const fc = 0.45 / OS; // pass to 0.9 x base Nyquist (21.6 kHz at 48 kHz)
  const h = new Float64Array(TAPS);
  let sum = 0;
  for (let n = 0; n < TAPS; n++) {
    const m = n - TAPS_HALF;
    const sinc = m === 0 ? 2 * fc : Math.sin(2 * Math.PI * fc * m) / (Math.PI * m);
    const w = besselI0(beta * Math.sqrt(1 - (m / TAPS_HALF) ** 2)) / besselI0(beta);
    h[n] = sinc * w;
    sum += h[n];
  }
  for (let n = 0; n < TAPS; n++) h[n] /= sum;
  return h;
})();

// Apply `fn` (a stateful per-sample function, called at 4x rate in order) to `input`.
export function oversample4(input, fn) {
  const n = input.length;
  const out = new Float32Array(n);
  const K = Math.ceil(TAPS / OS);
  const xr = new Float64Array(2 * K); // base-rate history, doubled to avoid wrap checks
  const wr = new Float64Array(2 * TAPS); // 4x-rate history
  let xi = 0, wi = 0;
  const delay = TAPS_HALF * 2 / OS; // up + down filter delay, in base samples (24)
  for (let m = 0; m < n + delay; m++) {
    const x = m < n ? input[m] : 0;
    xi = (xi + 1) % K;
    xr[xi] = xr[xi + K] = x;
    for (let p = 0; p < OS; p++) {
      // Upsampled sample 4m+p = 4 * sum_k h[p + 4k] x[m - k].
      let y = 0;
      for (let k = 0, j = p; j < TAPS; k++, j += OS) y += FIR[j] * xr[xi - k + K];
      const v = fn(OS * y);
      wi = (wi + 1) % TAPS;
      wr[wi] = wr[wi + TAPS] = v;
      if (p === 0) {
        // Decimate on phase 0: out[m] = sum_j h[j] w[4m - j].
        let z = 0;
        for (let j = 0; j < TAPS; j++) z += FIR[j] * wr[wi - j + TAPS];
        const o = m - delay;
        if (o >= 0) out[o] = z;
      }
    }
  }
  return out;
}

// ---- Band-limited oscillators ---------------------------------------------------------------
// PolyBLEP residual for a discontinuity at phase 0 (Välimäki & Huovilainen).
export function polyBlep(t, dt) {
  if (t < dt) {
    t /= dt;
    return t + t - t * t - 1;
  }
  if (t > 1 - dt) {
    t = (t - 1) / dt;
    return t * t + t + t + 1;
  }
  return 0;
}

export const blepSaw = (phase, dt) => 2 * phase - 1 - polyBlep(phase, dt);
export function blepSquare(phase, dt) {
  let s = phase < 0.5 ? 1 : -1;
  s += polyBlep(phase, dt);
  s -= polyBlep((phase + 0.5) % 1, dt);
  return s;
}

// ---- Topology-preserving state-variable filter (Zavalishin); safe to modulate per sample ----
export function svf(sr) {
  let ic1 = 0, ic2 = 0, g = 0, k = 1, a1 = 0, a2 = 0, a3 = 0;
  const set = (f, q) => {
    g = Math.tan((Math.PI * Math.min(f, 0.45 * sr)) / sr);
    k = 1 / q;
    a1 = 1 / (1 + g * (g + k));
    a2 = g * a1;
    a3 = g * a2;
  };
  set(1000, 0.707);
  return {
    set,
    // Returns [low, band, high].
    run(x) {
      const v3 = x - ic2;
      const v1 = a1 * ic1 + a2 * v3;
      const v2 = ic2 + a2 * ic1 + a3 * v3;
      ic1 = 2 * v1 - ic1;
      ic2 = 2 * v2 - ic2;
      return [v2, v1, x - k * v1 - v2];
    },
  };
}

// DC blocker (one pole at ~10 Hz).
export function dcBlock(sr, f = 10) {
  const r = Math.exp((-2 * Math.PI * f) / sr);
  let x1 = 0, y1 = 0;
  return (x) => {
    const y = x - x1 + r * y1;
    x1 = x;
    y1 = y;
    return y;
  };
}

// ---- Compressor ---------------------------------------------------------------------------
// Feed-forward, stereo-linked peak detector with a soft knee, smoothed in dB.
// Processes `channels` in place (or returns the gain curve when apply = false).
export function compress(channels, sr, { threshold = -18, ratio = 4, attack = 10, release = 120,
  knee = 6, makeup = 0, mix = 1, apply = true } = {}) {
  const n = channels[0].length;
  const aA = Math.exp(-1 / ((attack / 1000) * sr));
  const aR = Math.exp(-1 / ((release / 1000) * sr));
  const gains = new Float32Array(n);
  let env = 0, maxGr = 0, grSum = 0, grCount = 0;
  for (let i = 0; i < n; i++) {
    let peak = 0;
    for (const ch of channels) peak = Math.max(peak, Math.abs(ch[i]));
    const lvl = 20 * Math.log10(peak + 1e-9);
    const over = lvl - threshold;
    let gr = 0; // dB of gain reduction wanted
    if (over > knee / 2) gr = over * (1 - 1 / ratio);
    else if (over > -knee / 2) gr = ((over + knee / 2) ** 2 / (2 * knee)) * (1 - 1 / ratio);
    env = gr > env ? aA * env + (1 - aA) * gr : aR * env + (1 - aR) * gr;
    gains[i] = 10 ** ((makeup - env) / 20);
    maxGr = Math.max(maxGr, env);
    if (peak > 1e-4) {
      grSum += env;
      grCount++;
    }
  }
  if (apply) {
    for (const ch of channels) {
      for (let i = 0; i < n; i++) ch[i] = mix * ch[i] * gains[i] + (1 - mix) * ch[i];
    }
  }
  return { gains, maxGr, meanGr: grCount ? grSum / grCount : 0 };
}

// ---- Small room ---------------------------------------------------------------------------
// Eight-line feedback delay network with a Householder matrix and damped lines.
// Mono send in, stereo out.
export function room(send, sr, { rt60 = 0.6, damp = 6000, predelay = 0.008, size = 1 } = {}) {
  const n = send.length;
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const lens = [1117, 1291, 1447, 1613, 1789, 1951, 2111, 2293].map((d) => Math.round(d * size * sr / 48000));
  const lines = lens.map((d) => ({ buf: new Float32Array(d), i: 0, d, lp: 0 }));
  const gain = lens.map((d) => 10 ** ((-3 * d) / (sr * rt60)));
  const dampA = Math.exp((-2 * Math.PI * damp) / sr);
  const pre = Math.round(predelay * sr);
  const outs = new Float64Array(8);
  for (let i = 0; i < n; i++) {
    const x = i >= pre ? send[i - pre] : 0;
    let sum = 0;
    for (let k = 0; k < 8; k++) {
      const ln = lines[k];
      let y = ln.buf[ln.i];
      ln.lp = (1 - dampA) * y + dampA * ln.lp;
      y = ln.lp * gain[k];
      outs[k] = y;
      sum += y;
    }
    const h = (2 / 8) * sum;
    let l = 0, r = 0;
    for (let k = 0; k < 8; k++) {
      const ln = lines[k];
      ln.buf[ln.i] = outs[k] - h + x * 0.35;
      ln.i = (ln.i + 1) % ln.d;
      if (k % 2) r += outs[k] * (k & 2 ? -1 : 1);
      else l += outs[k] * (k & 4 ? -1 : 1);
    }
    L[i] = l * 0.5;
    R[i] = r * 0.5;
  }
  return [L, R];
}

// ---- Stereo and dynamic EQ -------------------------------------------------------------------
// Keep the low end mono: high-pass the side channel (24 dB/oct) at `f`. In place.
export function monoLows([L, R], sr, f = 120) {
  const hp = [bq('hp', f, 0.7071, sr), bq('hp', f, 0.7071, sr)];
  for (let i = 0; i < L.length; i++) {
    const m = 0.5 * (L[i] + R[i]);
    const s = hp[1](hp[0](0.5 * (L[i] - R[i])));
    L[i] = m + s;
    R[i] = m - s;
  }
}

// Duck one frequency band by a gain curve (0–1 = how far to go towards `depthDb`): the band is
// split out with a high-pass and a low-pass and part of it subtracted. A dynamic EQ. In place.
export function duckBand(ch, sr, amount, { lo = 1000, hi = 4000, depthDb = -3 } = {}) {
  const h = bq('hp', lo, 0.7071, sr);
  const l = bq('lp', hi, 0.7071, sr);
  const k = 1 - 10 ** (depthDb / 20);
  for (let i = 0; i < ch.length; i++) ch[i] -= k * amount[i] * l(h(ch[i]));
}

// ---- Loudness (ITU-R BS.1770) -----------------------------------------------------------------
// K-weighted, gated integrated loudness in LUFS over samples [from, to). The coefficients are
// the standard's 48 kHz ones. Used to set mix levels by target; the Python check re-measures.
export function loudness(channels, sr, from = 0, to = channels[0].length) {
  if (sr !== 48000) throw new Error('loudness: 48 kHz only');
  const block = Math.round(0.4 * sr);
  const hop = Math.round(0.1 * sr);
  const z = channels.map((ch) => {
    let [x1, x2, y1, y2, u1, u2, v1, v2] = [0, 0, 0, 0, 0, 0, 0, 0];
    const out = new Float64Array(to - from);
    for (let i = from; i < to; i++) {
      const x = ch[i];
      const y = 1.53512485958697 * x - 2.69169618940638 * x1 + 1.19839281085285 * x2 + 1.69065929318241 * y1 - 0.73248077421585 * y2;
      x2 = x1; x1 = x; y2 = y1; y1 = y;
      const v = y - 2 * u1 + u2 + 1.99004745483398 * v1 - 0.99007225036621 * v2;
      u2 = u1; u1 = y; v2 = v1; v1 = v;
      out[i - from] = v * v;
    }
    return out;
  });
  const blocks = [];
  for (let s = 0; s + block <= to - from; s += hop) {
    let e = 0;
    for (const zc of z) for (let i = s; i < s + block; i++) e += zc[i];
    blocks.push(e / block);
  }
  const lk = (e) => -0.691 + 10 * Math.log10(e);
  const mean = (bs) => bs.reduce((a, b) => a + b, 0) / bs.length;
  const abs = blocks.filter((e) => lk(e) > -70);
  if (!abs.length) return -Infinity;
  const rel = lk(mean(abs)) - 10;
  return lk(mean(abs.filter((e) => lk(e) > rel)));
}

// ---- True-peak limiter ----------------------------------------------------------------------
// Detects peaks on the 4x-oversampled signal, looks ahead `lookahead` ms and releases smoothly.
export function limit(channels, sr, { ceiling = -1, lookahead = 2, release = 80 } = {}) {
  const n = channels[0].length;
  const ceil = 10 ** (ceiling / 20);
  const peak = new Float32Array(n);
  for (const ch of channels) {
    const up = truePeakEnvelope(ch);
    for (let i = 0; i < n; i++) peak[i] = Math.max(peak[i], up[i], Math.abs(ch[i]));
  }
  const W = Math.max(1, Math.round((lookahead / 1000) * sr));
  const target = new Float32Array(n);
  for (let i = 0; i < n; i++) target[i] = Math.min(1, ceil / (peak[i] + 1e-12));
  // Running minimum over the next W samples, then a W-long moving average: the gain is fully
  // down by the time the peak arrives, with no step.
  const minAhead = new Float32Array(n);
  const dq = [];
  for (let i = n - 1; i >= 0; i--) {
    while (dq.length && target[dq[dq.length - 1]] >= target[i]) dq.pop();
    dq.push(i);
    while (dq[0] > i + W) dq.shift();
    minAhead[i] = target[dq[0]];
  }
  const aR = Math.exp(-1 / ((release / 1000) * sr));
  const g = new Float32Array(n);
  let held = 1;
  for (let i = 0; i < n; i++) {
    held = minAhead[i] < held ? minAhead[i] : aR * held + (1 - aR) * minAhead[i];
    g[i] = held;
  }
  let acc = W; // moving sum of the last W gains, starting from unity
  const sm = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    acc += g[i] - (i >= W ? g[i - W] : 1);
    sm[i] = acc / W;
  }
  let minGain = 1;
  for (const ch of channels) for (let i = 0; i < n; i++) ch[i] *= sm[i];
  for (let i = 0; i < n; i++) minGain = Math.min(minGain, sm[i]);
  return { maxGr: -20 * Math.log10(minGain) };
}

function truePeakEnvelope(ch) {
  const n = ch.length;
  const env = new Float32Array(n + OS);
  let q = 0;
  // Reuse the upsampler: record |v| per 4x sample, fold back to base samples.
  oversample4(ch, (v) => {
    const base = Math.floor(q / OS) - TAPS_HALF / OS; // upsampler delay only
    if (base >= 0 && base < n) env[base] = Math.max(env[base], Math.abs(v));
    q++;
    return 0;
  });
  return env.subarray(0, n);
}
