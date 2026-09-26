// The Void: where Clawd works before it knows who anything is for. A dark studio with a glossy
// floor, one spotlight, dust in the beam. Things built here glow on their own and reflect.
import { W, H, C, TAU, clamp, lerp, smooth, rnd, rr, circle, ellipse, poly, glow, vgrad, rgrad, lgrad, rgba, mix, mixHex } from '../kit.js';

// o: { floorY, spot: {x, w, a}, tint (hex), glowA, dust, dark 0..1 (lights going out) }
export function voidStage(g, t, o = {}) {
  const fy = o.floorY ?? 1500, tint = o.tint || '#3a2a8a';
  const lit = 1 - (o.dark || 0);
  g.fillStyle = vgrad(g, 0, fy, [[0, '#04040f'], [.7, mixHex('#07071c', tint, .18 * lit)], [1, mixHex('#0b0b26', tint, .3 * lit)]]);
  g.fillRect(0, 0, W, fy + 1);
  g.fillStyle = vgrad(g, fy, H, [[0, mixHex('#12122e', tint, .25 * lit)], [.25, '#08081a'], [1, '#020208']]);
  g.fillRect(0, fy, W, H - fy);
  // Back glow behind the subject.
  glow(g, o.glowX ?? 540, fy - 380, 1100, tint, (o.glowA ?? .35) * lit);
  // Far-off lights, out of focus: the dark isn't empty, just unexplained.
  if ((o.bokeh ?? 1) > 0) {
    g.save(); g.globalCompositeOperation = 'lighter';
    const cols = [C.pink, C.violet, C.cyan, C.amber, mixHex(tint, '#ff6ad5', .5)];
    for (let i = 0; i < 16; i++) {
      const x = (rnd(i, 51) * 1.2 - .1) * W + Math.sin(t * .2 + i) * 18, y = rnd(i, 52) * (fy - 200) + 60 + Math.cos(t * .17 + i) * 12;
      const r = 40 + 90 * rnd(i, 53);
      const a = (.07 + .09 * rnd(i, 54)) * (.75 + .25 * Math.sin(t * .8 + i * 2)) * lit * (o.bokeh ?? 1);
      const col = cols[i % cols.length];
      g.fillStyle = rgrad(g, x, y, r * .55, r, [[0, rgba(col, a * .8)], [.88, rgba(col, a)], [1, rgba(col, 0)]]);
      circle(g, x, y, r); g.fill();
    }
    g.restore();
  }
  // The floor's far edge catches a little light.
  g.fillStyle = lgrad(g, 0, 0, W, 0, [[0, rgba(tint, 0)], [.5, rgba(mixHex(tint, '#ffffff', .4), .35 * lit)], [1, rgba(tint, 0)]]);
  g.fillRect(0, fy - 1, W, 2);
  if (o.spot && lit > 0) spotlight(g, t, o.spot.x, fy, o.spot.w || 420, o.spot.a ?? 1, o.spot.col || '#fff1d8', o.dust ?? 1);
}

export function spotlight(g, t, x, fy, w, a = 1, col = '#fff1d8', dust = 1) {
  if (a <= 0) return;
  g.save(); g.globalCompositeOperation = 'lighter';
  g.fillStyle = lgrad(g, 0, -100, 0, fy, [[0, rgba(col, .02 * a)], [1, rgba(col, .13 * a)]]);
  poly(g, [[x - w * .12, -100], [x + w * .12, -100], [x + w * .5, fy], [x - w * .5, fy]]); g.fill();
  g.fillStyle = rgrad(g, x, fy, 0, w * .62, [[0, rgba(col, .34 * a)], [1, rgba(col, 0)]]);
  g.scale(1, .2); circle(g, x, fy / .2, w * .62); g.fill();
  g.restore();
  if (dust > 0) {
    for (let i = 0; i < 70; i++) {
      const py = ((rnd(i, 11) * fy + t * (8 + 14 * rnd(i, 12))) % fy);
      const spread = lerp(w * .12, w * .5, py / fy);
      const px = x + (rnd(i, 13) - .5) * 2 * spread * .9 + Math.sin(t * .7 + i) * 8;
      const tw = .5 + .5 * Math.sin(t * 2 + i * 3);
      g.fillStyle = rgba(col, .35 * a * dust * tw);
      circle(g, px, py, 1 + 1.6 * rnd(i, 14)); g.fill();
    }
  }
}

// Draw something and its reflection in the glossy floor at fy.
export function reflected(g, fy, fn, a = .28, fade = 380) {
  g.save();
  g.beginPath(); g.rect(0, fy, W, H - fy); g.clip();
  g.translate(0, fy * 2); g.scale(1, -1);
  g.globalAlpha *= a;
  fn();
  g.restore();
  g.fillStyle = vgrad(g, fy, fy + fade, [[0, 'rgba(6,6,20,0)'], [1, 'rgba(4,4,14,.92)']]);
  g.fillRect(0, fy, W, fade);
  fn();
}
