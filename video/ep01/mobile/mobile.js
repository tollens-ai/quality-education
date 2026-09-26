// The mobile: the lesson as a Calder mobile.
//
//   the top bar:  WHO (a person plate) ─────┴───── WHAT (a disc)
//                                                     │
//   one bar per trade-off, hanging below WHAT:   fast ─┴─ (sturdy ─┴─ cheap)
//                                                 wow ─┴─ keep
//                                                 now ─┴─ slow
//                                                need ─┴─ show
//
// Each bar tilts toward whichever side weighs more, so a trade-off is literally a balance, and
// the weights change with who hangs at the other end. The top bar weighs who against what: with
// a blank "who", all the weight is on "what" and the mobile hangs lopsided.
//
// Frames are rendered out of order (parallel segments), so the swing is simulated once over the
// scene and sampled by time.
import { PAL, TAU, paint, clamp01, settle, easeOut, lerp, hash } from './paper.js';
import { letters } from './cast.js';

// spec: { x, y, t0, t1, armL, armR, who: plate, what: plate, rows: [{ half, gap, L: plate,
// R: plate | { half, gap, L: plate, R: plate } }], breeze }
// plate: { key, on, draw(g, t), mass(t), label, labelOn, labelColor, labelSize, labelAt, hang, r }
export function makeMobile(spec) {
  const dt = 1 / 240, fps = 60;
  const bars = [];                       // every bar: { kind, row, masses() → [mL, mR, lenL, lenR] }
  const m = (p, t) => (!p || t < p.on) ? 0 : p.mass(t) * clamp01((t - p.on) / 0.3);
  const rowMass = (r, t) => r.R && r.R.L ? m(r.L, t) + m(r.R.L, t) + m(r.R.R, t) : m(r.L, t) + m(r.R, t);
  const stackMass = t => m(spec.what, t) + spec.rows.reduce((a, r) => a + rowMass(r, t), 0);
  spec.stackRef = spec.stackRef ?? 2.2;
  // The top bar weighs who against what. "What" counts as stackRef once it's all hung, so a real
  // person balances it and a blank "who" can't.
  const full = Math.max(1e-6, stackMass(spec.t1));
  bars.push({ target: t => {
    const w = m(spec.who, t), s = (spec.stackRef ?? full) * stackMass(t) / full;
    if (w + s === 0) return 0;
    return Math.atan(1.2 * (s - w) / (w + s));
  }, w: 1.9 });
  spec.rows.forEach((r, i) => {
    const sub = r.R && r.R.L;
    bars.push({ target: t => {
      const a = m(r.L, t), b = sub ? (m(r.R.L, t) + m(r.R.R, t)) / 2 : m(r.R, t);
      if (a === 0 || b === 0) return 0;
      return Math.atan(0.7 * (b - a) / (a + b));
    }, w: 2.3 + i * 0.15 });
    if (sub) bars.push({ target: t => {
      const a = m(r.R.L, t), b = m(r.R.R, t);
      if (a === 0 || b === 0) return 0;
      return Math.atan(0.7 * (b - a) / (a + b));
    }, w: 2.8 });
  });
  const n = bars.length, th = new Float32Array(n), om = new Float32Array(n), samples = [];
  const steps = Math.ceil((spec.t1 - spec.t0) / dt) + 1, every = Math.round(1 / (dt * fps));
  for (let s = 0; s < steps; s++) {
    const t = spec.t0 + s * dt;
    bars.forEach((b, i) => {
      let tg = Math.max(-0.3, Math.min(0.3, b.target(t)));
      if (spec.breeze) tg += spec.breeze(t, i);
      const w = b.w, z = 0.12;
      om[i] += (w * w * (tg - th[i]) - 2 * z * w * om[i]) * dt;
      th[i] += om[i] * dt;
    });
    if (s % every === 0) samples.push(Float32Array.from(th));
  }
  return { spec, samples, fps };
}

function thetaAt(M, t) {
  const f = (t - M.spec.t0) * M.fps, i = Math.max(0, Math.min(M.samples.length - 2, Math.floor(f))), u = clamp01(f - i);
  const A = M.samples[i], B = M.samples[i + 1];
  return A.map((a, k) => a + (B[k] - a) * u);
}

export function drawMobile(g, M, t, { alpha = 1 } = {}) {
  const { spec } = M, th = thetaAt(M, t), k = g.getTransform().a;
  const wire = (x0, y0, x1, y1, w = 2.2, cx = null, cy = null) => {
    g.save(); g.strokeStyle = PAL.black; g.lineWidth = w; g.lineCap = 'round';
    g.shadowColor = 'rgba(55,38,20,0.16)'; g.shadowBlur = 9 * k; g.shadowOffsetX = 26 * k; g.shadowOffsetY = 34 * k;
    g.beginPath(); g.moveTo(x0, y0);
    if (cx !== null) g.quadraticCurveTo(cx, cy, x1, y1); else g.lineTo(x1, y1);
    g.stroke(); g.restore();
  };
  const loop = (x, y) => { g.save(); g.strokeStyle = PAL.black; g.lineWidth = 2.2; g.beginPath(); g.arc(x, y - 5, 6, 0, TAU); g.stroke(); g.restore(); };
  const grow = on => easeOut(clamp01((t - on) / 0.5));
  const places = {};

  // Hang a plate from (x, y); returns nothing. The plate swings a little with the bar above.
  const hangPlate = (p, x, y, swing, i) => {
    if (!p || t < p.on) return;
    const gp = clamp01((t - p.on) / 0.45);
    const hang = (p.hang ?? 70) * (spec.plateScale || 1) * lerp(0.3, 1, settle(gp));
    const sway = Math.sin(t * 1.3 + i * 1.7) * 0.03 + swing * 0.5;
    const px = x + Math.sin(sway) * hang, py = y + Math.cos(sway) * hang;
    wire(x, y, px, py - (p.top ?? 0), 1.8);
    const yaw = Math.sin(t * 0.41 + hash(i + 9) * TAU) * 0.4 + (p.spin ? p.spin(t) : 0);
    g.save(); g.translate(px, py); g.rotate(-sway * 0.5);
    const s = lerp(0.5, 1, settle(gp)) * (spec.plateScale || 1);
    g.scale(Math.max(0.04, Math.abs(Math.cos(yaw))) * s, s);
    g.globalAlpha *= clamp01(gp * 3);
    p.draw(g, t);
    const label = p.labelFn ? p.labelFn(t) : p.label, lon = p.labelOnFn ? p.labelOnFn(t) : (p.labelOn ?? p.on);
    if (label && t >= lon && Math.cos(yaw) > 0) {
      const lp = clamp01((t - lon) / 0.16), sz = p.labelSize || 44;
      g.font = `800 ${sz}px Bricolage`;
      const lw = g.measureText(label).width, [lx, ly] = p.labelAt || [0, 0];
      g.save(); g.globalAlpha *= clamp01(lp * 3); g.translate(lx, ly);
      const ls = lerp(1.2, 1, settle(lp)); g.scale(ls, ls);
      letters(g, label, -lw / 2, sz * 0.35, sz, (p.labelColorFn ? p.labelColorFn(t) : p.labelColor) || PAL.white, 0.35, i * 11);
      g.restore();
    }
    g.restore();
    places[p.key] = [px, py];
  };

  // A bar pivoting at (x, y) with arms a (left) and b (right), tilted by angle; grows in.
  const bar = (x, y, a, b, ang, gp, yawSeed) => {
    const yaw = Math.sin(t * 0.19 + yawSeed) * 0.28, fx = Math.cos(yaw);
    const c = Math.cos(ang), s = Math.sin(ang);
    const L = [x - a * c * fx * gp, y - a * s * gp], R = [x + b * c * fx * gp, y + b * s * gp];
    if (gp > 0) { wire(L[0], L[1], R[0], R[1], 4.6, x, y + 16 * gp); loop(x, y); }
    return { L, R };
  };

  g.save(); g.globalAlpha *= alpha;
  const top = spec.who.on;
  if (t >= top) {
    const gp = grow(spec.what.on);
    wire(spec.x, spec.y - 700, spec.x, spec.y, 2);
    const { L, R } = bar(spec.x, spec.y, spec.armL, spec.armR, th[0], gp, 1);
    hangPlate(spec.who, gp > 0 ? L[0] : spec.x, gp > 0 ? L[1] : spec.y, th[0], 0);
    // WHAT, and the trade-offs below it
    if (t >= spec.what.on) {
      hangPlate(spec.what, R[0], R[1], th[0], 1);
      let [x, y] = places[spec.what.key] || R;
      y += (spec.what.r ?? 70) * (spec.plateScale || 1);
      let bi = 1;
      spec.rows.forEach((r, i) => {
        const first = Math.min(r.L.on, (r.R.L || r.R).on);
        if (t < first) { bi += r.R.L ? 2 : 1; return; }
        const gp2 = grow(first - 0.1);
        const ny = y + r.gap;
        wire(x, y, x, ny, 1.8);
        const { L, R } = bar(x, ny, r.half, r.half, th[bi], gp2, 3 + i);
        hangPlate(r.L, gp2 > 0 ? L[0] : x, gp2 > 0 ? L[1] : ny, th[bi], 10 + i * 3);
        if (r.R.L) {
          const sgp = grow(Math.max(r.R.L.on, r.R.R.on) - 0.15);
          const sx = gp2 > 0 ? R[0] : x, sy = (gp2 > 0 ? R[1] : ny) + r.R.gap;
          if (t >= r.R.L.on) {
            wire(gp2 > 0 ? R[0] : x, gp2 > 0 ? R[1] : ny, sx, sy, 1.8);
            const s2 = bar(sx, sy, r.R.half, r.R.half, th[bi + 1], sgp, 7 + i);
            hangPlate(r.R.L, sgp > 0 ? s2.L[0] : sx, sgp > 0 ? s2.L[1] : sy, th[bi + 1], 11 + i * 3);
            hangPlate(r.R.R, s2.R[0], s2.R[1], th[bi + 1], 12 + i * 3);
          }
          bi += 2;
        } else {
          hangPlate(r.R, R[0], R[1], th[bi], 11 + i * 3);
          bi += 1;
        }
        y = ny;
      });
    }
  }
  g.restore();
  return places;
}
