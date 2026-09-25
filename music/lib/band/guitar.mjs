// Distorted rhythm guitar: extended Karplus–Strong strings (Jaffe & Smith) into an amp chain.
//
// String: a delay line whose loop holds a one-pole low-pass (brightness and palm mute), a
// first-order all-pass for exact tuning, and a loss gain set from the wanted decay time. A pluck
// injects one period of shaped noise: low-passed by pick hardness, combed by pick position.
// Palm mute closes the loop low-pass and shortens the decay, so the note thuds and dies.
//
// Amp: pre-EQ (tighten the lows, push the mids), two tanh gain stages at 4x oversampling,
// then a cabinet (high-pass, low-mid bump, mud cut, 24 dB/oct low-pass near 5 kHz).
import { biquad, filterInPlace, mtof } from '../audio.mjs';
import { dcBlock, oversample4 } from './dsp.mjs';

const MAXLEN = 4096;

class StringVoice {
  constructor(sr, midi) {
    this.sr = sr;
    this.buf = new Float64Array(MAXLEN);
    this.w = 0;
    this.f0 = mtof(midi);
    this.midi = midi;
    this.ap1 = 0; // all-pass state (x[n-1], y[n-1])
    this.apy = 0;
    this.lp = 0;
    this.exc = null; // pending excitation
    this.ei = 0;
    this.contact = 0; // samples of pick-contact damping left
    this.fade = -1; // samples of fade-out left (-1: not fading)
    this.fadeLen = 1;
    this.dead = false;
  }

  // mute 0 = open, 1 = fully palm-muted; t60 in seconds; damp = fretting hand lifts.
  setLoop(mute, t60) {
    const w = (2 * Math.PI * this.f0) / this.sr;
    const a = 0.12 + 0.8 * mute; // loop low-pass pole
    const pLp = Math.atan2(a * Math.sin(w), 1 - a * Math.cos(w)) / w; // phase delay, samples
    const magLp = (1 - a) / Math.hypot(1 - a * Math.cos(w), a * Math.sin(w));
    const period = this.sr / this.f0;
    let M = Math.floor(period - pLp - 0.2);
    let d = period - pLp - M; // left for the all-pass, in [0.2, 1.2)
    this.M = Math.min(M, MAXLEN - 2);
    this.c = (1 - d) / (1 + d);
    this.a = a;
    this.g = Math.min(0.99995, 10 ** (-3 / (this.f0 * t60)) / magLp);
  }

  pluck(exc, contactSamples) {
    this.exc = exc;
    this.ei = 0;
    this.contact = contactSamples;
  }

  tick() {
    const { buf } = this;
    let x = buf[(this.w - this.M + MAXLEN) & (MAXLEN - 1)];
    // All-pass fractional delay.
    const y = this.c * x + this.ap1 - this.c * this.apy;
    this.ap1 = x;
    this.apy = y;
    // Loop low-pass and loss.
    this.lp = (1 - this.a) * y + this.a * this.lp;
    let v = this.lp * this.g;
    if (this.contact > 0) {
      v *= 0.9985; // the pick briefly touches the vibrating string
      this.contact--;
    }
    let input = v;
    if (this.exc) {
      input += this.exc[this.ei++];
      if (this.ei >= this.exc.length) this.exc = null;
    }
    buf[this.w] = input;
    this.w = (this.w + 1) & (MAXLEN - 1);
    let out = x;
    if (this.fade >= 0) {
      out *= this.fade / this.fadeLen;
      if (this.fade > 0) this.fade--;
      else this.dead = true;
    }
    return out;
  }
}

// One period of pluck noise: pick hardness low-pass, pick-position comb, zero mean.
function excitation(f0, sr, rand, { amp, bright, pickPos }) {
  const n = Math.round(sr / f0);
  const e = new Float64Array(n);
  const a = Math.exp((-2 * Math.PI * bright) / sr);
  let lp = 0;
  for (let k = 0; k < n; k++) {
    lp = (1 - a) * (rand() * 2 - 1) + a * lp;
    e[k] = lp;
  }
  const P = Math.max(1, Math.round(pickPos * n));
  const out = new Float64Array(n);
  let mean = 0;
  for (let k = 0; k < n; k++) {
    out[k] = e[k] - (k >= P ? e[k - P] : 0);
    mean += out[k];
  }
  mean /= n;
  let peak = 1e-9;
  for (let k = 0; k < n; k++) peak = Math.max(peak, Math.abs(out[k] - mean));
  for (let k = 0; k < n; k++) out[k] = ((out[k] - mean) / peak) * amp;
  return out;
}

// Render the clean (DI) signal for one guitar.
// actions: [{ i, slot, type: 'pluck', midi, amp, mute, rand } | { i, slot, type: 'damp' }],
// sorted by i. Each slot is one string; a new pitch on a slot fades the old vibration out.
export function renderStrings(actions, total, sr) {
  const out = new Float32Array(total);
  const slots = new Map(); // slot -> current voice
  let voices = [];
  let ai = 0;
  for (let i = 0; i < total; i++) {
    while (ai < actions.length && actions[ai].i <= i) {
      const act = actions[ai++];
      const cur = slots.get(act.slot);
      if (act.type === 'damp') {
        if (cur) {
          // The fretting hand releases: heavy loop damping, then gone.
          cur.setLoop(1, 0.05);
          cur.fade = cur.fadeLen = Math.round(0.03 * sr);
          slots.delete(act.slot);
        }
        continue;
      }
      const { midi, amp, mute, rand } = act;
      const t60 = 0.18 + (1 - mute) ** 2 * 3.5;
      let v = cur;
      if (!v || v.midi !== midi) {
        if (cur) cur.fade = cur.fadeLen = Math.round(0.004 * sr);
        v = new StringVoice(sr, midi);
        voices.push(v);
        slots.set(act.slot, v);
      }
      v.setLoop(mute, t60);
      const bright = (1200 + 5500 * amp) * (1 - 0.6 * mute);
      v.pluck(excitation(v.f0, sr, rand, { amp, bright, pickPos: 0.1 + 0.08 * rand() }), Math.round(sr / v.f0));
    }
    let s = 0;
    for (const v of voices) s += v.tick();
    out[i] = s;
    if ((i & 1023) === 0) voices = voices.filter((v) => !v.dead);
  }
  return out;
}

// Lead: one string whose pitch can bend and wobble. The loop reads the delay line through
// 4-point cubic interpolation, so the length can move every sample without the all-pass's
// transients. notes: [{ i, len, from, to, amp, rand }] in MIDI; `from` ≠ `to` is a bend up.
export function renderLead(notes, total, sr, { bendTime = 0.09, vibrato = 0.35, vibRate = 5.6,
  vibDelay = 0.22, t60 = 5 } = {}) {
  const out = new Float32Array(total);
  const buf = new Float64Array(MAXLEN);
  const a = 0.08; // bright loop: sustain for a lead
  let w = 0, lp = 0;
  notes.forEach((nt, j) => {
    const next = notes[j + 1];
    const stop = Math.min(total, next ? next.i : nt.i + nt.len + Math.round(0.03 * sr));
    const exc = excitation(mtof(nt.from), sr, nt.rand, { amp: nt.amp, bright: 6000, pickPos: 0.15 });
    // A new pick: the old note is damped over 4 ms, then the string starts again.
    for (let k = 0; k < buf.length; k++) buf[k] *= 0.02;
    for (let i = nt.i, k = 0; i < stop; i++, k++) {
      const t = k / sr;
      const bend = nt.from + (nt.to - nt.from) * (t >= bendTime ? 1 : 0.5 - 0.5 * Math.cos((Math.PI * t) / bendTime));
      const vib = t > vibDelay ? vibrato * Math.min(1, (t - vibDelay) / 0.25) * Math.sin(2 * Math.PI * vibRate * (t - vibDelay)) : 0;
      const f = mtof(bend + vib);
      const wv = (2 * Math.PI * f) / sr;
      const pLp = Math.atan2(a * Math.sin(wv), 1 - a * Math.cos(wv)) / wv;
      const mag = (1 - a) / Math.hypot(1 - a * Math.cos(wv), a * Math.sin(wv));
      const g = Math.min(0.99995, 10 ** (-3 / (f * t60)) / mag);
      const D = sr / f - pLp;
      const pos = w - D;
      const i0 = Math.floor(pos);
      const x = pos - i0;
      const y = (o) => buf[(i0 + o + MAXLEN) & (MAXLEN - 1)];
      const [ym1, y0, y1, y2] = [y(-1), y(0), y(1), y(2)];
      const c1 = 0.5 * (y1 - ym1);
      const c2 = ym1 - 2.5 * y0 + 2 * y1 - 0.5 * y2;
      const c3 = 0.5 * (y2 - ym1) + 1.5 * (y0 - y1);
      const s = ((c3 * x + c2) * x + c1) * x + y0;
      lp = (1 - a) * s + a * lp;
      buf[w] = g * lp + (k < exc.length ? exc[k] : 0);
      w = (w + 1) & (MAXLEN - 1);
      const release = i >= nt.i + nt.len ? Math.max(0, 1 - (i - nt.i - nt.len) / (0.03 * sr)) : 1;
      const repick = next ? Math.min(1, (stop - i) / (0.004 * sr)) : 1; // damp before the next pick
      out[i] = s * release * repick * Math.min(1, k / 96);
    }
  });
  return out;
}

// Amp and cabinet. `tone` lets the two guitars differ like two rigs would.
export function amp(di, sr, { drive = 14, mid = 800, midGain = 7, cabLp = 5000, bias = 0.12 } = {}) {
  const x = Float32Array.from(di);
  filterInPlace(x,
    biquad('hp', 100, 0.7, sr), // tighten before the gain, as an overdrive pedal does
    biquad('peak', mid, 0.8, sr, midGain),
    biquad('lp', 6500, 0.7, sr),
  );
  const osr = sr * 4;
  const inter = biquad('hp', 60, 0.7, osr);
  const inter2 = biquad('lp', 9000, 0.7, osr);
  const t0 = Math.tanh(bias);
  const shaped = oversample4(x, (v) => {
    // Two gain stages; the bias adds even harmonics, as an asymmetric tube stage would.
    let y = Math.tanh(drive * v + bias) - t0;
    y = inter2(inter(y));
    return Math.tanh(3 * y) * 0.8;
  });
  return filterInPlace(shaped,
    dcBlock(sr),
    biquad('hp', 85, 0.7, sr),
    biquad('peak', 115, 1.2, sr, 2.5), // cabinet thump
    biquad('peak', 420, 1, sr, -3.5), // mud
    biquad('lp', cabLp, 0.7, sr),
    biquad('lp', cabLp * 1.1, 0.9, sr), // 24 dB/oct speaker roll-off
    biquad('highshelf', 7000, 0.7, sr, -8),
  );
}
