// Klatt-style cascade/parallel formant synthesiser, driven by 1 kHz control tracks.
//
// Source: band-limited glottal-flow-derivative (additive harmonics, -6 dB/oct plus a
//   loudness-dependent tilt corner), per-cycle jitter and shimmer, pitch-synchronous aspiration.
// Cascade: nasal pole/zero pair -> F1..F11 resonators -> nasal-murmur place zero.
// Parallel: frication/burst noise through a fixed band-pass bank with per-phoneme gains.

import { FR } from './score.mjs';
import { BANK_F, BANK_BW } from './phonemes.mjs';
import { rng, gaussian } from './util.mjs';

export function synthesise(T, f0, opts = {}) {
  const sr = opts.sr ?? 48000;
  const len = Math.floor(((T.N - 2) / FR) * sr);
  const out = new Float32Array(len);
  const R = rng((opts.seed ?? 1) * 104729 + 3);
  const tract = opts.tract ?? 1; // vocal-tract length scale (formants multiply by this)
  // F4..F11: speaker constants. The poles above F5 stand in for the vocal tract's higher
  // resonances; without them the all-pole cascade rolls off far too steeply above ~3 kHz.
  const Fhi = [4150, 4950, 6000, 7200, 8400, 9600, 10800, 12000].map((x) => x * tract);
  const Bhi = [250, 350, 500, 650, 800, 1000, 1200, 1400];
  const NR = 3 + Fhi.length;
  const jitter = opts.jitter ?? 0.004, shimmer = opts.shimmer ?? 0.03;
  const bright = opts.brightness ?? 1;
  const h1boost = opts.h1 ?? 0.6; // breathy/soft: stronger fundamental
  const slope = opts.slope ?? 1; // source roll-off exponent: 1 = -6 dB/oct
  const tiltLo = opts.tiltLo ?? 1400, tiltHi = opts.tiltHi ?? 3600;
  const T_ = 1 / sr, spf = sr / FR;
  const TWO_PI = 2 * Math.PI;

  // resonator state: [y1, y2] per resonator; 7 cascade, nasal pole, nasal zero, place zero
  const ry1 = new Float64Array(NR), ry2 = new Float64Array(NR);
  let np1 = 0, np2 = 0, nz1 = 0, nz2 = 0, pz1 = 0, pz2 = 0;
  const resC = (F, B) => {
    const r = Math.exp(-Math.PI * B * T_);
    const C = -r * r, Bc = 2 * r * Math.cos(TWO_PI * F * T_);
    return [1 - Bc - C, Bc, C];
  };
  const [npA, npB, npC] = resC(280 * tract, 100);

  // parallel bank: constant-0dB-peak band-pass biquads (RBJ)
  const bank = BANK_F.map((f, i) => {
    const w0 = TWO_PI * f / sr, Q = f / BANK_BW[i], al = Math.sin(w0) / (2 * Q);
    const a0 = 1 + al;
    return { b0: al / a0, b2: -al / a0, a1: (-2 * Math.cos(w0)) / a0, a2: (1 - al) / a0, x1: 0, x2: 0, y1: 0, y2: 0 };
  });

  // Higher-pole correction: the truncated all-pole cascade rolls off far faster than a real
  // vocal tract (whose resonances continue above Nyquist). Klatt used a fixed correction
  // filter; here, RBJ high shelves tuned against the reference vocal's long-term spectrum.
  const hpc = (opts.hpc ?? [[2000, 5], [5000, 6]]).map(([fc, dbg]) => {
    const A = 10 ** (dbg / 40), w0 = TWO_PI * fc / sr, cw = Math.cos(w0), al = Math.sin(w0) / Math.SQRT2;
    const sA = 2 * Math.sqrt(A) * al, a0 = (A + 1) - (A - 1) * cw + sA;
    return {
      b0: (A * ((A + 1) + (A - 1) * cw + sA)) / a0, b1: (-2 * A * ((A - 1) + (A + 1) * cw)) / a0,
      b2: (A * ((A + 1) + (A - 1) * cw - sA)) / a0, a1: (2 * ((A - 1) - (A + 1) * cw)) / a0,
      a2: ((A + 1) - (A - 1) * cw - sA) / a0, x1: 0, x2: 0, y1: 0, y2: 0,
    };
  });

  // harmonic amplitudes, refreshed every block
  const MAXK = 400;
  const amps = new Float64Array(MAXK + 1);
  let K = 1;
  let phase = 0, jit = 1, shim = 1;
  // Closed-tract low-pass: during stop closures and nasal murmurs the sound radiates through
  // the cheeks or nose, so almost nothing above ~500 Hz survives. Two one-pole stages, mixed
  // in by the LPF track.
  const lpA = Math.exp((-2 * Math.PI * (opts.closureLp ?? 450)) / sr);
  let lp1 = 0, lp2 = 0;
  const lerp = (a, f, u) => a[f] + (a[f + 1] - a[f]) * u;

  for (let n = 0; n < len; n++) {
    const fp = n / spf, f = Math.min(T.N - 2, Math.floor(fp)), u = fp - f;
    const F0 = lerp(f0, f, u) * jit;
    const AV = lerp(T.AV, f, u), AH = lerp(T.AH, f, u), AF = lerp(T.AF, f, u);
    if ((n & 15) === 0) {
      const tilt = lerp(T.TILT, f, u);
      const Fa = (tiltLo + tiltHi * tilt) * bright;
      const nyq = 0.42 * sr;
      K = Math.min(MAXK, Math.floor(nyq / F0));
      for (let k = 1; k <= K; k++) {
        const fk = k * F0;
        let a = k ** -slope / Math.sqrt(1 + (fk / Fa) ** 2);
        if (fk > 0.34 * sr) a *= 0.5 + 0.5 * Math.cos((Math.PI * (fk - 0.34 * sr)) / (0.08 * sr));
        amps[k] = a;
      }
      amps[1] *= 1 + h1boost;
    }
    // glottal source
    phase += F0 * T_;
    if (phase >= 1) {
      phase -= 1;
      jit = 1 + jitter * gaussian(R);
      shim = 1 + shimmer * gaussian(R);
    }
    let src = 0;
    if (AV > 1e-4) {
      const th = TWO_PI * phase, s1 = Math.sin(th), c2 = 2 * Math.cos(th);
      let sp = 0, sc = s1, acc = amps[1] * s1;
      for (let k = 2; k <= K; k++) {
        const sn = c2 * sc - sp;
        acc += amps[k] * sn;
        sp = sc; sc = sn;
      }
      src = -acc * AV * shim;
    }
    // aspiration, pitch-synchronous when voiced (strongest in the open phase before closure)
    const open = phase > 0.45 ? Math.sin((Math.PI * (phase - 0.45)) / 0.55) : 0;
    const vmod = Math.min(1, AV * 2.5);
    const asp = AH > 1e-5 ? AH * gaussian(R) * (1 - vmod + vmod * (0.3 + 0.9 * open)) * 1.2 : 0;
    let x = src + asp;

    // nasal pole/zero (cancel when NAS = 0)
    const nas = lerp(T.NAS, f, u);
    {
      const y = npA * x + npB * np1 + npC * np2; np2 = np1; np1 = y; x = y;
      const [a, b, c] = resC((280 + 200 * nas) * tract, 100);
      const yz = (x - b * nz1 - c * nz2) / a; nz2 = nz1; nz1 = x; x = yz;
    }
    // cascade formants
    const Fs = [lerp(T.F1, f, u), lerp(T.F2, f, u), lerp(T.F3, f, u)];
    const Bs = [lerp(T.B1, f, u) + lerp(T.B1X, f, u), lerp(T.B2, f, u), lerp(T.B3, f, u)];
    for (let r = 0; r < NR; r++) {
      const F = r < 3 ? Fs[r] * tract : Fhi[r - 3], B = r < 3 ? Bs[r] : Bhi[r - 3];
      const e = Math.exp(-Math.PI * B * T_);
      const C = -e * e, Bc = 2 * e * Math.cos(TWO_PI * F * T_), A = 1 - Bc - C;
      const y = A * x + Bc * ry1[r] + C * ry2[r];
      ry2[r] = ry1[r]; ry1[r] = y; x = y;
    }
    // nasal murmur place antiresonance
    const mur = lerp(T.MUR, f, u);
    {
      const [a, b, c] = resC(lerp(T.FZ, f, u) * tract, 200);
      const yz = (x - b * pz1 - c * pz2) / a; pz2 = pz1; pz1 = x;
      x = x + mur * 0.85 * (yz - x);
    }
    for (const q of hpc) {
      const y = q.b0 * x + q.b1 * q.x1 + q.b2 * q.x2 - q.a1 * q.y1 - q.a2 * q.y2;
      q.x2 = q.x1; q.x1 = x; q.y2 = q.y1; q.y1 = y; x = y;
    }
    {
      lp1 = (1 - lpA) * x + lpA * lp1; lp2 = (1 - lpA) * lp1 + lpA * lp2;
      const w = lerp(T.LPF, f, u);
      if (w > 0) x = x + w * (lp2 * 1.6 - x);
    }
    // parallel frication/burst branch
    let par = 0;
    if (AF > 1e-5) {
      const voicedMod = AV > 0.05 ? 0.6 + 0.6 * open : 1;
      const nz = gaussian(R) * AF * voicedMod;
      par = lerp(T.G[0], f, u) * nz; // bypass (flat) path
      for (let i = 0; i < bank.length; i++) {
        const q = bank[i];
        const y = q.b0 * nz + q.b2 * q.x2 - q.a1 * q.y1 - q.a2 * q.y2;
        q.x2 = q.x1; q.x1 = nz; q.y2 = q.y1; q.y1 = y;
        par += (i & 1 ? -1 : 1) * lerp(T.G[i + 1], f, u) * y;
      }
    } else {
      for (const q of bank) { q.x2 = q.x1; q.x1 = 0; const y = -q.a1 * q.y1 - q.a2 * q.y2; q.y2 = q.y1; q.y1 = y; }
    }
    out[n] = x + par * (opts.fricGain ?? 4);
  }
  return out;
}
