// The world, painted: night sky, sea, the pier and its bandstand, the Ferris wheel, bulbs and
// beams, the lighthouse, the town. Gouache washes and brushwork, flat light, ink where a thing is
// built rather than weather. All drawn in master coordinates as functions of time.
import { W, H, C, TAU, clamp, lerp, smooth, inv, rnd, rrange, noise1, noise2, fbm1, rr, circle, ellipse, line, poly, star, glow, bulb, vgrad, rgrad, lgrad, rgba, mix, mixHex, shade, INK } from './kit.js';
import { pen, nopen, tone } from './cast.js';

// A band of wash with wandering edges from y0 to y1 (a brushed stroke across the paper).
export function washBand(g, y0, y1, col, a, seed = 0, x0 = -40, x1 = W + 40) {
  g.save(); g.ink = null;
  g.fillStyle = rgba(col, a);
  g.beginPath();
  const n = 24;
  for (let i = 0; i <= n; i++) { const x = lerp(x0, x1, i / n); const y = y0 + noise1(i * .7 + seed, seed + 3) * (y1 - y0) * .35; i ? g.lineTo(x, y) : g.moveTo(x, y); }
  for (let i = n; i >= 0; i--) { const x = lerp(x0, x1, i / n); const y = y1 + noise1(i * .6 + seed + 9, seed + 5) * (y1 - y0) * .35; g.lineTo(x, y); }
  g.closePath(); g.fill();
  g.restore();
}

// A twinkling star drawn the picture-book way: four points, a dab in the middle.
export function twinkle(g, x, y, r, col = '#fff4dc', a = 1) {
  g.save(); g.ink = null; g.globalAlpha *= a;
  g.fillStyle = col;
  star(g, x, y, r, r * .28, 4, 0); g.fill();
  g.restore();
}

// ---------------------------------------------------------------- sky
// o: { horizon, top, mid, low, glowCol, stars 0..1, moon: {x,y,r}, clouds, dawn 0..1 }
export function nightSky(g, t, o = {}) {
  const hz = o.horizon ?? 1100;
  const d = o.dawn || 0;
  const top = mixHex(o.top || '#141545', '#3b4a9a', d), mid = mixHex(o.mid || '#23206a', '#8a66b8', d);
  const low = mixHex(o.low || '#4a2a82', '#ff9d7a', d), edge = mixHex(o.glowCol || '#b4457e', '#ffd39a', d);
  g.save(); g.ink = null;
  g.fillStyle = vgrad(g, 0, hz, [[0, top], [.5, mid], [.82, low], [1, edge]]);
  g.fillRect(0, 0, W, hz + 2);
  // The wash was laid on in long strokes: a few show, lighter and darker.
  for (let i = 0; i < 8; i++) {
    const y = hz * (.06 + i * .12) + noise1(i * 3.1, 17) * 20;
    washBand(g, y, y + 40 + 40 * rnd(i, 17), i % 2 ? '#ffffff' : '#000018', i % 2 ? .035 : .06, i * 7.3);
  }
  // A faint Milky Way: a few thin washes along a diagonal, and a drift of tiny stars in it.
  const sa = (o.stars ?? 1) * (1 - d);
  if (sa > 0) {
    g.save(); g.translate(540, hz * .38); g.rotate(-.5);
    g.globalCompositeOperation = 'screen';
    for (let k = 0; k < 3; k++) washBand(g, -60 + k * 30, 20 + k * 25, ['#8f82ff', '#c9a8ff', '#ffc0e0'][k], .07 * sa, 40 + k * 11, -900, 900);
    g.restore();
    const n = o.nStars || 300;
    for (let i = 0; i < n; i++) {
      const x = rnd(i, 1) * W, y = Math.pow(rnd(i, 2), 1.35) * hz * .92;
      const big = rnd(i, 4) > .955;
      const tw = rnd(i + INK.boil * 131, 3) > .15 ? 1 : .45;
      const a = sa * tw * (1 - y / hz * .55);
      if (a < .05) continue;
      if (big) twinkle(g, x, y, 7 + 5 * rnd(i, 6) * tw, rnd(i, 5) > .7 ? '#ffe8c8' : '#f4f2ff', a);
      else { g.fillStyle = rgba(rnd(i, 5) > .8 ? '#ffe2c4' : '#eceeff', a * .85); g.fillRect(x, y, 2.2 + rnd(i, 6) * 1.6, 2.2 + rnd(i, 7) * 1.6); }
    }
  }
  if (o.moon) moon(g, t, o.moon.x, o.moon.y, o.moon.r, 1 - d * .7);
  if (o.clouds !== false) clouds(g, t, hz, o.cloudCol || '#3c2c7c', o.cloudLit || '#c65a9c', o.clouds ?? .7, d);
  // The town's glow along the horizon: a warm wash with a soft top edge.
  washBand(g, hz - 150, hz + 4, edge, .22, 5);
  washBand(g, hz - 70, hz + 4, edge, .3, 8);
  g.restore();
}

export function moon(g, t, x, y, r, a = 1) {
  glow(g, x, y, r * 4.5, '#c9c0ff', .45 * a);
  g.save(); g.ink = null;
  g.globalAlpha *= a;
  g.fillStyle = '#fbf0d6'; circle(g, x, y, r); g.fill();
  tone(g, () => circle(g, x, y, r), '#fbf0d6', '#e6d2ac', r * .22, r * .18);
  g.fillStyle = 'rgba(200,172,130,.35)';
  [[.3, -.2, .22], [-.25, .25, .16], [.1, .4, .1], [-.35, -.3, .09]].forEach(([dx, dy, rr2]) => { circle(g, x + dx * r, y + dy * r, rr2 * r); g.fill(); });
  g.restore();
}

function clouds(g, t, hz, col, lit, amt, dawn) {
  if (amt <= 0) return;
  g.save(); g.ink = null;
  for (let i = 0; i < 6; i++) {
    const y = hz * (.52 + .38 * rnd(i, 21));
    const x = ((rnd(i, 22) * 1.6 - .3) * W + t * (6 + 5 * rnd(i, 23))) % (W * 1.6) - W * .3;
    const w = 360 + 380 * rnd(i, 24), h = 46 + 50 * rnd(i, 25);
    const shape = () => {
      g.beginPath();
      g.moveTo(x - w / 2, y + h * .4);
      const bumps = 5;
      for (let k = 0; k < bumps; k++) {
        const cx = x - w / 2 + (k + .5) * w / bumps, rr2 = h * (.7 + .5 * rnd(i * 9 + k, 27));
        g.quadraticCurveTo(cx - w / bumps * .5, y - rr2 * 1.2, cx, y - rr2 * 1.1);
        g.quadraticCurveTo(cx + w / bumps * .5, y - rr2 * 1.2, x - w / 2 + (k + 1) * w / bumps, y + h * .1);
      }
      g.quadraticCurveTo(x + w / 2 + h * .4, y + h * .45, x + w / 2 - h * .3, y + h * .5);
      g.lineTo(x - w / 2 + h * .3, y + h * .5);
      g.closePath();
    };
    const a = amt * (.5 + .3 * rnd(i, 26));
    g.fillStyle = rgba(mixHex(col, '#b98ac9', dawn), a); shape(); g.fill();
    // Lit from below by the town: a lighter lip along the underside.
    g.save(); shape(); g.clip();
    g.fillStyle = rgba(mixHex(lit, '#ffc9a8', dawn), a * .7);
    g.fillRect(x - w, y + h * .12, w * 2, h);
    g.restore();
  }
  g.restore();
}

// ---------------------------------------------------------------- sea
// Reflections: [{x, col, w, a}] — each light makes a trembling column of dabs on the water.
export function sea(g, t, hz, o = {}) {
  const d = o.dawn || 0;
  g.save(); g.ink = null;
  g.fillStyle = vgrad(g, hz, H, [[0, mixHex('#3a2a78', '#c77a8f', d)], [.12, mixHex('#1c2266', '#6f6fb0', d)], [1, mixHex('#0b0d33', '#28305f', d)]]);
  g.fillRect(0, hz, W, H - hz);
  // Waves: dry-brush dashes, small at the horizon and broader toward us, drifting.
  for (let i = 0; i < 70; i++) {
    const k = Math.pow(rnd(i, 31), 1.5);
    const y = hz + 6 + k * (H - hz);
    const x = (rnd(i, 32) * W + t * 10 * (1 + k)) % (W + 240) - 120;
    const w = 26 + 170 * k * (.4 + rnd(i, 33));
    const a = (.1 + .16 * k) * (.6 + .4 * (rnd(i + INK.boil * 7, 35) > .3 ? 1 : .4));
    g.strokeStyle = rgba(mixHex('#7f8cff', '#ffe0c0', d), a);
    g.lineWidth = 2 + 4 * k; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + w * .5, y - 2 - 3 * k, x + w, y); g.stroke();
  }
  for (const r of (o.reflections || [])) reflection(g, t, r.x, hz, r.col, r.w || 16, r.a ?? .6, r.len);
  g.restore();
}
export function reflection(g, t, x, hz, col, w, a = .6, len = H) {
  g.save(); g.ink = null;
  const n = 34;
  for (let i = 0; i < n; i++) {
    const k = i / n;
    const y = hz + 4 + Math.pow(k, 1.25) * (len - hz);
    if (y > H) break;
    const wob = noise2(x * .01 + i * .3, t * 1.6 + i * .2, 5) * (6 + 30 * k);
    const ww = w * (1 + k * 2.2) * (.45 + rnd(i + (x | 0), 34));
    const aa = a * (1 - k) * (.55 + .45 * Math.abs(noise2(i * .7, t * 3 + x * .01, 6)));
    g.strokeStyle = rgba(col, aa); g.lineWidth = 3 + 6 * k; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x + wob - ww / 2, y); g.lineTo(x + wob + ww / 2, y + 1); g.stroke();
  }
  g.restore();
}

// ---------------------------------------------------------------- bulbs on a sagging wire
export function bulbString(g, t, x1, y1, x2, y2, sag, n, o = {}) {
  g.strokeStyle = o.wire || rgba(INK.col, .85); g.lineWidth = o.wireW || 2.2;
  g.beginPath(); for (let i = 0; i <= 24; i++) { const p = i / 24; const x = lerp(x1, x2, p), y = lerp(y1, y2, p) + Math.sin(p * Math.PI) * sag; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  const cols = o.cols || [C.bulb];
  for (let i = 0; i < n; i++) {
    const p = (i + .5) / n;
    const x = lerp(x1, x2, p), y = lerp(y1, y2, p) + Math.sin(p * Math.PI) * sag + (o.r || 5) * 1.4;
    let on = o.on ?? 1;
    if (o.chase) on *= .45 + .55 * (Math.sin((i * .9 - t * o.chase) * 1.3) > .2 ? 1 : 0);
    if (o.flicker) on *= 1 - o.flicker * (rnd(i + Math.floor(t * 20), 41) > .8 ? 1 : 0);
    bulb(g, x, y, o.r || 5, cols[i % cols.length], on);
  }
}

// ---------------------------------------------------------------- the pier deck (perspective)
export function pierDeck(g, t, o = {}) {
  const vx = o.vx ?? 540, farY = o.farY ?? 1200, nearY = H + 40;
  const near = o.near ?? 900, far = o.far ?? 260;
  g.save(); g.ink = null;
  g.fillStyle = vgrad(g, farY, nearY, [[0, o.farCol || '#5a3a5c'], [1, o.nearCol || '#2a1a30']]);
  poly(g, [[vx - far, farY], [vx + far, farY], [vx + near, nearY], [vx - near, nearY]]); g.fill();
  g.strokeStyle = rgba(INK.col, .5); g.lineWidth = 2.2;
  for (let i = 1; i < 26; i++) {
    const p = Math.pow(i / 26, 2.2);
    const y = lerp(farY, nearY, p), hw = lerp(far, near, p);
    line(g, vx - hw, y, vx + hw, y); g.stroke();
  }
  g.strokeStyle = rgba(INK.col, .25); g.lineWidth = 1.6;
  for (let i = -6; i <= 6; i++) { line(g, vx + i / 6 * far, farY, vx + i / 6 * near, nearY); g.stroke(); }
  if (o.light) for (const L of o.light) { g.fillStyle = rgba(L.col || C.amber, (L.a ?? .25) * .8); ellipse(g, L.x, L.y, L.r, L.r * .3); g.fill(); }
  g.restore();
}

// Railing posts with lamps along both sides of the deck.
export function lampPost(g, t, x, y, h, o = {}) {
  const k = h / 300;
  g.save(); pen(g, 10 * k, .8);
  g.fillStyle = '#231833';
  rr(g, x - 7 * k, y - h, 14 * k, h, 5 * k); g.fill();
  rr(g, x - 16 * k, y - 18 * k, 32 * k, 18 * k, 4 * k); g.fill();
  g.strokeStyle = '#231833'; g.lineWidth = 6 * k;
  for (const s of [-1, 1]) {
    g.beginPath(); g.moveTo(x, y - h * .86); g.quadraticCurveTo(x + s * 40 * k, y - h * .95, x + s * 46 * k, y - h * .82); g.stroke();
    const gx = x + s * 46 * k, gy = y - h * .82 + 16 * k;
    glow(g, gx, gy, 110 * k, C.amber, .7 * (o.on ?? 1));
    g.fillStyle = mix('#5a4030', '#fff1c4', .3 + .7 * (o.on ?? 1));
    circle(g, gx, gy, 16 * k); g.fill();
  }
  g.fillStyle = C.gold; circle(g, x, y - h - 6 * k, 7 * k); g.fill();
  g.restore();
}

// ---------------------------------------------------------------- the bandstand
// A Victorian bandstand: platform, slim columns, scalloped valance, a candy-striped ogee roof with
// bulbs. Returns the stage floor line so the band can stand on it.
export function bandstand(g, t, cx, baseY, w, o = {}) {
  const k = w / 800;
  const floorY = baseY - 70 * k;
  const roofY = baseY - 470 * k;
  const on = o.on ?? 1;
  g.save();
  const ink = Math.max(1.2, 3.2 * k);
  // Back wall: deep plum, a little lit where the band stands.
  g.ink = null;
  g.fillStyle = '#1f1238';
  rr(g, cx - w * .44, roofY, w * .88, floorY - roofY, 10 * k); g.fill();
  if (o.inner) glow(g, cx, floorY - 120 * k, w * .5, o.inner, .6 * on);
  // Platform.
  g.ink = INK.col; g.inkW = ink;
  g.fillStyle = '#efe3cc';
  rr(g, cx - w * .52, floorY, w * 1.04, 22 * k, 6 * k); g.fill();
  g.fillStyle = '#2c1d3a';
  g.fillRect(cx - w * .5, floorY + 22 * k, w, baseY - floorY - 22 * k);
  g.ink = null;
  g.strokeStyle = 'rgba(244,234,216,.3)'; g.lineWidth = 2.5 * k;
  for (let i = 0; i < 16; i++) { const x0 = cx - w * .5 + i * w / 16; line(g, x0, floorY + 24 * k, x0 + w / 32, baseY); g.stroke(); line(g, x0 + w / 16, floorY + 24 * k, x0 + w / 32, baseY); g.stroke(); }
  if (o.floorLight) { g.fillStyle = rgba(o.floorLight, .22 * on); ellipse(g, cx, floorY + 4 * k, w * .42, w * .05); g.fill(); }
  g.restore();
  o.band?.(floorY);
  g.save();
  g.ink = INK.col; g.inkW = ink;
  // Columns (in front of the band at the edges only).
  const cols = [-.46, -.3, .3, .46];
  for (const c of cols) {
    const x = cx + c * w;
    const colP = () => rr(g, x - 8 * k, roofY + 30 * k, 16 * k, floorY - roofY - 30 * k, 5 * k);
    colP(); g.fillStyle = '#f3eadb'; g.fill();
    g.ink = null; tone(g, colP, '#f3eadb', '#bdb09a', -5 * k, 0); g.ink = INK.col;
    g.fillStyle = '#efe4d0'; rr(g, x - 14 * k, floorY - 14 * k, 28 * k, 14 * k, 3 * k); g.fill();
    g.strokeStyle = '#efe4d0'; g.lineWidth = 3 * k;
    g.beginPath(); g.moveTo(x, roofY + 90 * k); g.quadraticCurveTo(x - 30 * k, roofY + 60 * k, x - 50 * k, roofY + 38 * k); g.stroke();
    g.beginPath(); g.moveTo(x, roofY + 90 * k); g.quadraticCurveTo(x + 30 * k, roofY + 60 * k, x + 50 * k, roofY + 38 * k); g.stroke();
  }
  // Valance: a scalloped trim below the roof.
  g.fillStyle = '#f3e8d4';
  const vy = roofY + 26 * k;
  g.beginPath(); g.moveTo(cx - w * .56, roofY); g.lineTo(cx + w * .56, roofY); g.lineTo(cx + w * .56, vy);
  const sc = 22;
  for (let i = sc; i >= 0; i--) { const x = cx - w * .56 + i * w * 1.12 / sc; g.quadraticCurveTo(x + w * 1.12 / sc / 2, vy + 22 * k, x, vy); }
  g.closePath(); g.fill();
  // Roof: a Victorian ogee in candy stripes, flaring at the eaves, with a finial.
  const rh = 300 * k, ew = w * .6;
  const dome = () => {
    g.beginPath();
    g.moveTo(cx - ew, roofY);
    g.bezierCurveTo(cx - ew * .78, roofY - rh * .08, cx - ew * .5, roofY - rh * .18, cx - ew * .42, roofY - rh * .42);
    g.bezierCurveTo(cx - ew * .36, roofY - rh * .66, cx - ew * .18, roofY - rh * .76, cx - ew * .07, roofY - rh * .9);
    g.lineTo(cx, roofY - rh);
    g.lineTo(cx + ew * .07, roofY - rh * .9);
    g.bezierCurveTo(cx + ew * .18, roofY - rh * .76, cx + ew * .36, roofY - rh * .66, cx + ew * .42, roofY - rh * .42);
    g.bezierCurveTo(cx + ew * .5, roofY - rh * .18, cx + ew * .78, roofY - rh * .08, cx + ew, roofY);
    g.closePath();
  };
  g.ink = null;
  dome(); g.fillStyle = '#d8414f'; g.fill();
  g.save(); dome(); g.clip();
  for (let i = -7; i <= 7; i++) {
    if (i % 2) continue;
    g.fillStyle = '#fbf1e2';
    g.beginPath();
    g.moveTo(cx + (i - .5) * ew / 7, roofY);
    g.quadraticCurveTo(cx + (i - .5) * ew / 7 * .45, roofY - rh * .5, cx, roofY - rh);
    g.quadraticCurveTo(cx + (i + .5) * ew / 7 * .45, roofY - rh * .5, cx + (i + .5) * ew / 7, roofY);
    g.closePath(); g.fill();
  }
  // The shaded half of the dome, laid over the stripes as a thin dark wash.
  g.fillStyle = 'rgba(60,10,40,.28)';
  g.beginPath(); g.moveTo(cx + ew * .1, roofY - rh); g.quadraticCurveTo(cx + ew * .5, roofY - rh * .4, cx + ew * 1.05, roofY + 4); g.lineTo(cx + ew * 1.2, roofY + 10); g.lineTo(cx + ew * 1.2, roofY - rh * 1.2); g.closePath(); g.fill();
  if (o.roofLight) glow(g, cx + o.roofLight.dx * ew, roofY - rh * .4, ew * .8, o.roofLight.col, .5);
  g.restore();
  g.ink = INK.col; g.inkW = ink;
  dome(); g.inkLine(INK.col, ink);
  // Finial.
  g.fillStyle = C.gold;
  circle(g, cx, roofY - rh - 8 * k, 11 * k); g.fill();
  g.fillRect(cx - 2.5 * k, roofY - rh - 56 * k, 5 * k, 50 * k);
  star(g, cx, roofY - rh - 62 * k, 13 * k, 5 * k, 4, 0); g.fill();
  glow(g, cx, roofY - rh - 62 * k, 60 * k, C.gold, .7 * on);
  g.ink = null;
  // Bulbs along the eaves and up both edges of the roof.
  const nb = 24;
  for (let i = 0; i <= nb; i++) {
    const x = cx - ew + i * ew * 2 / nb;
    const ch = o.chase ? (Math.sin(i * .8 - t * o.chase) > 0 ? 1 : .35) : 1;
    bulb(g, x, roofY + 2 * k, 5.5 * k, i % 2 ? C.bulb : '#ffe9c2', on * ch);
  }
  const edge = p => {
    const b = (p0, p1, p2, p3, q) => (1 - q) ** 3 * p0 + 3 * (1 - q) ** 2 * q * p1 + 3 * (1 - q) * q * q * p2 + q ** 3 * p3;
    if (p < .5) { const q = p / .5; return [b(ew, ew * .78, ew * .5, ew * .42, q), b(0, -rh * .08, -rh * .18, -rh * .42, q)]; }
    const q = (p - .5) / .5; return [b(ew * .42, ew * .36, ew * .18, ew * .07, q), b(-rh * .42, -rh * .66, -rh * .76, -rh * .9, q)];
  };
  for (const s of [-1, 1]) for (let i = 1; i < 11; i++) {
    const [ex, ey] = edge(i / 11);
    bulb(g, cx + s * ex, roofY + ey, 4.6 * k, C.bulb, on * (o.chase ? (Math.sin(i * 1.1 - t * o.chase * 1.2) > 0 ? 1 : .4) : 1));
  }
  g.restore();
  return { floorY, roofY, rh };
}

// ---------------------------------------------------------------- Ferris wheel
export function ferrisWheel(g, t, cx, cy, R, o = {}) {
  const on = o.on ?? 1;
  const rot = o.rot ?? t * .06;
  const n = 18;
  const fr = o.frame || '#e6dcf2';
  g.save(); g.ink = null;
  // Legs: a painted A-frame.
  g.strokeStyle = fr; g.lineWidth = R * .024; g.lineCap = 'round';
  for (const s of [-1, 1]) { line(g, cx, cy, cx + s * R * .62, cy + R * 1.35); g.stroke(); line(g, cx, cy, cx + s * R * .4, cy + R * 1.35); g.stroke(); }
  g.lineWidth = R * .012;
  for (let i = 1; i < 6; i++) { const y = cy + R * 1.35 * i / 6; const hw = R * .62 * i / 6; line(g, cx - hw, y, cx + hw, y); g.stroke(); }
  // Rims and spokes, drawn with the pen in the frame's colour.
  g.strokeStyle = rgba(fr, .92);
  g.lineWidth = R * .018; circle(g, cx, cy, R); g.stroke();
  g.lineWidth = R * .01; circle(g, cx, cy, R * .92); g.stroke();
  g.lineWidth = R * .007;
  for (let i = 0; i < n; i++) {
    const a = rot + i / n * TAU, a2 = rot + (i + .5) / n * TAU;
    line(g, cx, cy, cx + Math.cos(a) * R, cy + Math.sin(a) * R); g.stroke();
    line(g, cx + Math.cos(a) * R * .92, cy + Math.sin(a) * R * .92, cx + Math.cos(a2) * R, cy + Math.sin(a2) * R); g.stroke();
  }
  g.fillStyle = '#f4eeff'; circle(g, cx, cy, R * .07); g.fill();
  glow(g, cx, cy, R * .3, C.pink, .5 * on);
  // Bulbs on the rim, chasing in colours.
  const nb = 60, cols = o.cols || [C.pink, C.bulb, C.cyan, C.bulb];
  for (let i = 0; i < nb; i++) {
    const a = rot + i / nb * TAU;
    const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
    const wave = .5 + .5 * Math.sin(i / nb * TAU * 3 - t * (o.chase ?? 3));
    const col = cols[Math.floor((i + t * 2) / 6) % cols.length];
    bulb(g, x, y, Math.max(1.6, R * .012), col, on * (.35 + .65 * wave));
  }
  // Gondolas hang level: little painted cabins with an ink line and a lit window.
  const gcols = ['#ff5a7a', '#ffd166', '#48c6e8', '#b06bff', '#7ce29a', '#ff9f43'];
  g.ink = INK.col; g.inkW = Math.max(1, R * .006);
  for (let i = 0; i < n; i++) {
    const a = rot + i / n * TAU;
    const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
    const sw = Math.sin(t * 1.3 + i) * .06;
    g.save(); g.translate(x, y); g.rotate(sw);
    g.strokeStyle = fr; g.lineWidth = R * .006; line(g, 0, 0, 0, R * .06); g.stroke();
    const gw = R * .09, gh = R * .075;
    g.fillStyle = gcols[i % gcols.length];
    rr(g, -gw / 2, R * .06, gw, gh, gw * .3); g.fill();
    g.ink = null;
    g.fillStyle = mix('#5a4a50', '#fff0c8', on); rr(g, -gw * .36, R * .06 + gh * .18, gw * .72, gh * .38, gw * .12); g.fill();
    g.ink = INK.col;
    g.restore();
  }
  g.restore();
}

// ---------------------------------------------------------------- lighthouse
export function lighthouse(g, t, x, y, h, o = {}) {
  const k = h / 400;
  const beamA = o.beamA ?? (t * .9);
  const on = o.on ?? 1;
  const lx = x, ly = y - h * .9;
  g.save();
  // Beam: a flat, translucent wedge of lamplight, brighter when it faces us.
  if (on > 0 && (o.beamLen ?? 1400) > 0) {
    const len = o.beamLen || 1400;
    const facing = Math.max(0, Math.cos(beamA));
    g.ink = null;
    for (const dir of [1, -1]) {
      const sx = dir * Math.sin(beamA) * len;
      const spread = 90 * k * Math.abs(Math.sin(beamA)) + 20;
      g.fillStyle = rgba('#fff3c4', .16 * on);
      poly(g, [[lx, ly - 8 * k], [lx + sx, ly - spread], [lx + sx, ly + spread], [lx, ly + 8 * k]]); g.fill();
      g.fillStyle = rgba('#fff3c4', .12 * on);
      poly(g, [[lx, ly - 4 * k], [lx + sx * .6, ly - spread * .45], [lx + sx * .6, ly + spread * .45], [lx, ly + 4 * k]]); g.fill();
    }
    glow(g, lx, ly, 120 * k * (1 + facing * 1.6), '#fff3c4', .7 * on);
  }
  // Tower: tapered, striped, drawn in ink.
  const bw = 60 * k, tw = 36 * k;
  const tower = () => poly(g, [[x - bw, y], [x + bw, y], [x + tw, y - h * .82], [x - tw, y - h * .82]]);
  g.ink = null;
  g.save(); tower(); g.clip();
  for (let i = 0; i < 6; i++) {
    g.fillStyle = i % 2 ? '#f3efe6' : '#d6403d';
    g.fillRect(x - bw - 4, y - h * .82 * (i + 1) / 6, bw * 2 + 8, h * .82 / 6 + 1);
  }
  g.fillStyle = 'rgba(30,10,40,.32)';
  poly(g, [[x + bw * .2, y], [x + bw + 4, y], [x + tw + 4, y - h * .82], [x + tw * .1, y - h * .82]]); g.fill();
  g.restore();
  g.ink = INK.col; g.inkW = Math.max(1.2, 3 * k);
  tower(); g.inkLine(INK.col, g.inkW);
  g.fillStyle = '#2a2238'; rr(g, x - tw * 1.35, y - h * .84, tw * 2.7, 10 * k, 3 * k); g.fill();
  g.fillStyle = mix('#5a4a40', '#fff3c4', .2 + .8 * on); rr(g, x - tw * .8, y - h * .95, tw * 1.6, h * .11, 4 * k); g.fill();
  g.fillStyle = '#2a2238'; g.beginPath(); g.moveTo(x - tw, y - h * .95); g.lineTo(x, y - h * 1.04); g.lineTo(x + tw, y - h * .95); g.closePath(); g.fill();
  g.restore();
}

// ---------------------------------------------------------------- stage beams through haze
// Painted beams: long translucent wedges, flat, with a few dry streaks along them.
// sources: [{x, y, a (angle, 0 = straight down), col, len, w}]
export function beams(g, t, sources, strength = 1) {
  g.save(); g.ink = null;
  g.globalCompositeOperation = 'screen';
  for (const s of sources) {
    const len = s.len || 1500, w = s.w || .16;
    const ex = s.x + Math.sin(s.a) * len, ey = s.y + Math.cos(s.a) * len;
    const px = Math.cos(s.a) * len * w, py = -Math.sin(s.a) * len * w;
    const I = strength * (s.i ?? 1);
    g.fillStyle = rgba(s.col, .16 * I);
    poly(g, [[s.x - px * .04, s.y - py * .04], [s.x + px * .04, s.y + py * .04], [ex + px, ey + py], [ex - px, ey - py]]); g.fill();
    g.fillStyle = rgba(s.col, .12 * I);
    poly(g, [[s.x, s.y], [ex + px * .45, ey + py * .45], [ex - px * .45, ey - py * .45]]); g.fill();
    glow(g, s.x, s.y, 60, s.col, .8 * I);
  }
  g.restore();
}

// Haze: drifting soft light over a region, as loose washes.
export function haze(g, t, x, y, w, h, col, a = .25) {
  g.save(); g.ink = null;
  g.globalCompositeOperation = 'screen';
  for (let i = 0; i < 5; i++) {
    const cx = x + w * (rnd(i, 51) + .08 * Math.sin(t * .3 + i)), cy = y + h * rnd(i, 52);
    const r = Math.max(w, h) * (.2 + .15 * rnd(i, 53));
    glow(g, cx, cy, r, col, a * 1.2);
  }
  g.restore();
}

// ---------------------------------------------------------------- town on the far shore
export function town(g, t, hz, o = {}) {
  const on = o.on ?? 1;
  g.save(); g.ink = null;
  g.fillStyle = o.col || '#1d1447';
  g.beginPath(); g.moveTo(0, hz);
  for (let x = 0; x <= W; x += 18) {
    const h2 = 40 + 38 * (fbm1(x * .004 + 3, 8) + .6);
    const roof = (Math.floor(x / 54) % 3 === 0) ? 10 : 0;
    g.lineTo(x, hz - h2 - roof);
  }
  g.lineTo(W, hz); g.closePath(); g.fill();
  for (let i = 0; i < 80; i++) {
    const x = rnd(i, 61) * W, y = hz - 8 - rnd(i, 62) * 60;
    if (y < hz - 40 - 38 * (fbm1(x * .004 + 3, 8) + .6)) continue;
    const col = rnd(i, 63) > .7 ? '#ffd9a0' : rnd(i, 64) > .5 ? '#ffb070' : '#fff0c0';
    const a = on * (.6 + .4 * rnd(i, 65)) * (rnd(i + Math.floor(t * .5), 66) > .03 ? 1 : .3);
    g.fillStyle = rgba(col, a); g.fillRect(x - 2, y - 2, 4, 4);
  }
  glow(g, W * .3, hz - 20, 260, '#ffb070', .25 * on);
  glow(g, W * .75, hz - 20, 220, '#ff9ad0', .2 * on);
  g.restore();
}
