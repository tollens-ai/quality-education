// The Void: where Clawd works before it knows who anything is for. A dark painted stage, one
// spotlight laid on as a thin wash, dust turning in the beam.
import { W, H, C, TAU, clamp, lerp, smooth, rnd, rr, circle, ellipse, poly, glow, vgrad, rgba, mix, mixHex, INK } from '../kit.js';
import { washBand } from '../world.js';

// o: { floorY, spot: {x, w, a}, tint (hex), glowA, dust, dark 0..1 (lights going out) }
export function voidStage(g, t, o = {}) {
  const fy = o.floorY ?? 1500, tint = o.tint || '#3a2a8a';
  const lit = 1 - (o.dark || 0);
  g.save(); g.ink = null;
  g.fillStyle = vgrad(g, 0, fy, [[0, '#0b0a1f'], [.7, mixHex('#100e2a', tint, .22 * lit)], [1, mixHex('#15133a', tint, .36 * lit)]]);
  g.fillRect(0, 0, W, fy + 1);
  for (let i = 0; i < 5; i++) washBand(g, fy * (.15 + i * .17), fy * (.15 + i * .17) + 60, i % 2 ? '#ffffff' : '#000000', (i % 2 ? .025 : .06) * (.4 + .6 * lit), i * 5.1);
  g.fillStyle = vgrad(g, fy, H, [[0, mixHex('#1c1838', tint, .25 * lit)], [.3, '#0e0c1e'], [1, '#07060f']]);
  g.fillRect(0, fy, W, H - fy);
  // The painted glow behind whatever's on stage.
  glow(g, o.glowX ?? 540, fy - 380, 1000, tint, (o.glowA ?? .35) * lit * 1.3);
  // The floor's far edge: a line of light brushed along the boards.
  washBand(g, fy - 3, fy + 5, mixHex(tint, '#ffffff', .45), .35 * lit, 3);
  g.restore();
  if (o.spot && lit > 0) spotlight(g, t, o.spot.x, fy, o.spot.w || 420, o.spot.a ?? 1, o.spot.col || '#fff1d8', o.dust ?? 1);
}

export function spotlight(g, t, x, fy, w, a = 1, col = '#fff1d8', dust = 1) {
  if (a <= 0) return;
  g.save(); g.ink = null;
  g.globalCompositeOperation = 'screen';
  // Two thin washes, the inner one narrower, so the beam has a brushed core.
  g.fillStyle = rgba(col, .09 * a);
  poly(g, [[x - w * .12, -100], [x + w * .12, -100], [x + w * .5, fy], [x - w * .5, fy]]); g.fill();
  g.fillStyle = rgba(col, .07 * a);
  poly(g, [[x - w * .06, -100], [x + w * .06, -100], [x + w * .3, fy], [x - w * .3, fy]]); g.fill();
  // The pool on the floor.
  g.fillStyle = rgba(col, .22 * a); ellipse(g, x, fy, w * .56, w * .1); g.fill();
  g.fillStyle = rgba(col, .16 * a); ellipse(g, x, fy, w * .36, w * .06); g.fill();
  g.restore();
  if (dust > 0) {
    g.save(); g.ink = null;
    for (let i = 0; i < 50; i++) {
      const py = ((rnd(i, 11) * fy + t * (8 + 14 * rnd(i, 12))) % fy);
      const spread = lerp(w * .12, w * .5, py / fy);
      const px = x + (rnd(i, 13) - .5) * 2 * spread * .9 + Math.sin(t * .7 + i) * 8;
      const tw = .5 + .5 * Math.sin(t * 2 + i * 3);
      g.fillStyle = rgba(col, .45 * a * dust * tw);
      g.fillRect(px, py, 2 + 2 * rnd(i, 14), 2 + 2 * rnd(i, 14));
    }
    g.restore();
  }
}

// The stage floor is painted, not glossy: whatever stands on it just casts its shadow.
export function reflected(g, fy, fn) { fn(); }
