// The world: night sky, sea, the pier and its bandstand, the Ferris wheel, bulbs and beams,
// the lighthouse, the town. All drawn in master coordinates as functions of time.
import { W, H, C, TAU, clamp, lerp, smooth, inv, rnd, rrange, noise1, noise2, fbm1, rr, circle, ellipse, line, poly, star, glow, bulb, vgrad, rgrad, lgrad, rgba, mix, mixHex, shade } from './kit.js';

// ---------------------------------------------------------------- sky
// o: { horizon, top, mid, low, glowCol, stars 0..1, moon: {x,y,r}, clouds, dawn 0..1 }
export function nightSky(g, t, o = {}) {
  const hz = o.horizon ?? 1100;
  const d = o.dawn || 0;
  const top = mixHex(o.top || C.night0, '#2b3a8f', d), mid = mixHex(o.mid || C.night1, '#8a5fb8', d);
  const low = mixHex(o.low || '#3d2275', '#ff9d7a', d), edge = mixHex(o.glowCol || '#b4457e', '#ffd39a', d);
  g.fillStyle = vgrad(g, 0, hz, [[0, top], [.5, mid], [.82, low], [1, edge]]);
  g.fillRect(0, 0, W, hz + 2);
  // A faint band of Milky Way.
  if ((o.stars ?? 1) > 0) {
    const sa = (o.stars ?? 1) * (1 - d);
    g.save();
    g.globalAlpha = .22 * sa;
    g.translate(540, hz * .38); g.rotate(-.5);
    g.fillStyle = rgrad(g, 0, 0, 0, 700, [[0, 'rgba(170,160,255,.55)'], [.5, 'rgba(120,110,230,.18)'], [1, 'rgba(90,80,200,0)']]);
    g.scale(1, .22); circle(g, 0, 0, 900); g.fill();
    g.restore();
    const n = o.nStars || 420;
    for (let i = 0; i < n; i++) {
      const x = rnd(i, 1) * W, y = Math.pow(rnd(i, 2), 1.35) * hz * .92;
      const tw = .55 + .45 * Math.sin(t * (1.5 + rnd(i, 3) * 3) + i);
      const big = rnd(i, 4) > .965;
      const a = sa * tw * (1 - y / hz * .6) * (big ? 1 : .75);
      if (a < .03) continue;
      g.fillStyle = rgba(rnd(i, 5) > .8 ? '#ffe2c4' : '#e8ecff', a);
      circle(g, x, y, big ? 2.6 : 1 + rnd(i, 6) * 1.1); g.fill();
      if (big) { glow(g, x, y, 22, '#cfd8ff', .35 * a); g.strokeStyle = rgba('#ffffff', .35 * a); g.lineWidth = 1; line(g, x - 9, y, x + 9, y); g.stroke(); line(g, x, y - 9, x, y + 9); g.stroke(); }
    }
  }
  if (o.moon) moon(g, t, o.moon.x, o.moon.y, o.moon.r, 1 - d * .7);
  if (o.clouds !== false) clouds(g, t, hz, o.cloudCol || '#3a2a78', o.cloudLit || '#c0569a', o.clouds ?? .7, d);
  // Town glow along the horizon.
  g.fillStyle = vgrad(g, hz - 180, hz, [[0, rgba(edge, 0)], [1, rgba(edge, .55)]]);
  g.fillRect(0, hz - 180, W, 180);
}

export function moon(g, t, x, y, r, a = 1) {
  glow(g, x, y, r * 7, '#bfb6ff', .35 * a);
  glow(g, x, y, r * 2.6, C.moon, .5 * a);
  g.save();
  g.globalAlpha *= a;
  g.fillStyle = rgrad(g, x - r * .3, y - r * .3, 0, r * 1.2, [[0, '#fffaf0'], [.7, '#fff0d0'], [1, '#f1d9ae']]);
  circle(g, x, y, r); g.fill();
  g.fillStyle = 'rgba(214,190,150,.35)';
  [[.3, -.2, .22], [-.25, .25, .16], [.1, .4, .1], [-.35, -.3, .09]].forEach(([dx, dy, rr2]) => { circle(g, x + dx * r, y + dy * r, rr2 * r); g.fill(); });
  g.restore();
}

function clouds(g, t, hz, col, lit, amt, dawn) {
  if (amt <= 0) return;
  for (let i = 0; i < 7; i++) {
    const y = hz * (.55 + .38 * rnd(i, 21));
    const x = ((rnd(i, 22) * 1.6 - .3) * W + t * (6 + 5 * rnd(i, 23))) % (W * 1.6) - W * .3;
    const w = 380 + 420 * rnd(i, 24), h = 50 + 60 * rnd(i, 25);
    g.save(); g.globalAlpha = amt * (.45 + .3 * rnd(i, 26));
    for (let k = 0; k < 6; k++) {
      const cx = x + (k - 2.5) * w * .16, cy = y + Math.sin(k * 1.7 + i) * h * .25;
      const rrr = h * (.8 + .5 * rnd(i * 9 + k, 27));
      g.fillStyle = rgrad(g, cx, cy + rrr * .5, 0, rrr * 1.4, [[0, rgba(mixHex(lit, '#ffc9a8', dawn), .55)], [.55, rgba(mixHex(col, '#b98ac9', dawn), .5)], [1, rgba(col, 0)]]);
      circle(g, cx, cy, rrr * 1.4); g.fill();
    }
    g.restore();
  }
}

// ---------------------------------------------------------------- sea
// Reflections: [{x, col, w, a}] — each light makes a trembling column on the water.
export function sea(g, t, hz, o = {}) {
  const d = o.dawn || 0;
  g.fillStyle = vgrad(g, hz, H, [[0, mixHex('#2a1f6b', '#c77a8f', d)], [.12, mixHex('#141a5a', '#6f6fb0', d)], [1, mixHex('#050722', '#28305f', d)]]);
  g.fillRect(0, hz, W, H - hz);
  // Horizontal glints.
  for (let i = 0; i < 90; i++) {
    const y = hz + Math.pow(rnd(i, 31), 1.6) * (H - hz);
    const k = (y - hz) / (H - hz);
    const x = (rnd(i, 32) * W + t * 12 * (1 + k)) % (W + 200) - 100;
    const w = 20 + 140 * k * rnd(i, 33);
    const a = (.05 + .12 * k) * (.5 + .5 * Math.sin(t * 2 + i));
    g.fillStyle = rgba(mixHex('#6f7cff', '#ffe0c0', d), a);
    g.fillRect(x, y, w, 1.5 + 2 * k);
  }
  for (const r of (o.reflections || [])) reflection(g, t, r.x, hz, r.col, r.w || 16, r.a ?? .6, r.len);
}
export function reflection(g, t, x, hz, col, w, a = .6, len = H) {
  const n = 46;
  for (let i = 0; i < n; i++) {
    const k = i / n;
    const y = hz + 4 + Math.pow(k, 1.25) * (len - hz);
    if (y > H) break;
    const wob = noise2(x * .01 + i * .3, t * 1.6 + i * .2, 5) * (6 + 30 * k);
    const ww = w * (1 + k * 2.2) * (.5 + rnd(i + x | 0, 34));
    const aa = a * (1 - k) * (.5 + .5 * Math.abs(noise2(i * .7, t * 3 + x * .01, 6)));
    g.fillStyle = rgba(col, aa);
    g.fillRect(x + wob - ww / 2, y, ww, 2 + 5 * k);
  }
}

// ---------------------------------------------------------------- bulbs on a sagging wire
export function bulbString(g, t, x1, y1, x2, y2, sag, n, o = {}) {
  const pts = [];
  for (let i = 0; i <= 30; i++) { const p = i / 30; pts.push([lerp(x1, x2, p), lerp(y1, y2, p) + Math.sin(p * Math.PI) * sag]); }
  g.strokeStyle = o.wire || 'rgba(20,12,30,.8)'; g.lineWidth = o.wireW || 2;
  g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke();
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
// A wooden deck receding from the bottom of the frame to (vx, vy). o: { near: half width at
// the bottom, far: half width at the end, farY, light }
export function pierDeck(g, t, o = {}) {
  const vx = o.vx ?? 540, farY = o.farY ?? 1200, nearY = H + 40;
  const near = o.near ?? 900, far = o.far ?? 260;
  g.fillStyle = vgrad(g, farY, nearY, [[0, o.farCol || '#4a2f4f'], [1, o.nearCol || '#1d1224']]);
  poly(g, [[vx - far, farY], [vx + far, farY], [vx + near, nearY], [vx - near, nearY]]); g.fill();
  // Planks: lines across, spacing growing toward the viewer.
  g.strokeStyle = 'rgba(10,5,15,.5)'; g.lineWidth = 2;
  for (let i = 1; i < 26; i++) {
    const p = Math.pow(i / 26, 2.2);
    const y = lerp(farY, nearY, p), hw = lerp(far, near, p);
    line(g, vx - hw, y, vx + hw, y); g.stroke();
  }
  // Seams along the length.
  g.strokeStyle = 'rgba(10,5,15,.25)'; g.lineWidth = 1.5;
  for (let i = -6; i <= 6; i++) { line(g, vx + i / 6 * far, farY, vx + i / 6 * near, nearY); g.stroke(); }
  // Warm light pooling on the boards.
  if (o.light) for (const L of o.light) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = rgrad(g, L.x, L.y, 0, L.r, [[0, rgba(L.col || C.amber, L.a ?? .25)], [1, rgba(L.col || C.amber, 0)]]); g.scale(1, .35); circle(g, L.x, L.y / .35, L.r); g.fill(); g.restore(); }
}

// Railing posts with lamps along both sides of the deck.
export function lampPost(g, t, x, y, h, o = {}) {
  const k = h / 300;
  g.fillStyle = '#1a1226';
  rr(g, x - 7 * k, y - h, 14 * k, h, 5 * k); g.fill();
  rr(g, x - 16 * k, y - 18 * k, 32 * k, 18 * k, 4 * k); g.fill();
  // Scroll arms and a pair of globes.
  g.strokeStyle = '#1a1226'; g.lineWidth = 6 * k;
  for (const s of [-1, 1]) {
    g.beginPath(); g.moveTo(x, y - h * .86); g.quadraticCurveTo(x + s * 40 * k, y - h * .95, x + s * 46 * k, y - h * .82); g.stroke();
    const gx = x + s * 46 * k, gy = y - h * .82 + 16 * k;
    glow(g, gx, gy, 120 * k, C.amber, .5 * (o.on ?? 1));
    g.fillStyle = rgrad(g, gx - 5 * k, gy - 5 * k, 0, 22 * k, [[0, '#fffbe8'], [.6, '#ffd98a'], [1, '#f0a050']]);
    g.globalAlpha = .4 + .6 * (o.on ?? 1);
    circle(g, gx, gy, 16 * k); g.fill();
    g.globalAlpha = 1;
  }
  g.fillStyle = C.gold; circle(g, x, y - h - 6 * k, 7 * k); g.fill();
}

// ---------------------------------------------------------------- the bandstand
// A Victorian bandstand: platform, slim columns, scalloped valance, a sea-green dome with bulbs.
// Returns the stage floor line so the band can stand on it.
export function bandstand(g, t, cx, baseY, w, o = {}) {
  const k = w / 800;
  const floorY = baseY - 70 * k;
  const roofY = baseY - 470 * k;
  const on = o.on ?? 1;
  // Back wall / inside darkness.
  g.fillStyle = vgrad(g, roofY, floorY, [[0, '#120b25'], [1, '#2a1740']]);
  rr(g, cx - w * .44, roofY, w * .88, floorY - roofY, 10); g.fill();
  if (o.inner) { g.fillStyle = rgrad(g, cx, floorY - 120 * k, 0, w * .5, [[0, rgba(o.inner, .55 * on)], [1, rgba(o.inner, 0)]]); g.fillRect(cx - w * .44, roofY, w * .88, floorY - roofY); }
  // Platform.
  g.fillStyle = vgrad(g, floorY, baseY, [[0, '#f4ead8'], [1, '#b8a88f']]);
  rr(g, cx - w * .52, floorY, w * 1.04, 22 * k, 6 * k); g.fill();
  g.fillStyle = vgrad(g, floorY + 22 * k, baseY, [[0, '#2c1d38'], [1, '#170f22']]);
  g.fillRect(cx - w * .5, floorY + 22 * k, w, baseY - floorY - 22 * k);
  // Lattice on the plinth.
  g.strokeStyle = 'rgba(244,234,216,.35)'; g.lineWidth = 2.5 * k;
  for (let i = 0; i < 16; i++) { const x0 = cx - w * .5 + i * w / 16; line(g, x0, floorY + 24 * k, x0 + w / 32, baseY); g.stroke(); line(g, x0 + w / 16, floorY + 24 * k, x0 + w / 32, baseY); g.stroke(); }
  // Floor glow where the band stands.
  if (o.floorLight) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = rgrad(g, cx, floorY, 0, w * .5, [[0, rgba(o.floorLight, .35 * on)], [1, rgba(o.floorLight, 0)]]); g.scale(1, .18); circle(g, cx, floorY / .18, w * .5); g.fill(); g.restore(); }
  o.band?.(floorY);
  // Columns (in front of the band at the edges only).
  const cols = [-.46, -.3, .3, .46];
  for (const c of cols) {
    const x = cx + c * w;
    g.fillStyle = lgrad(g, x - 9 * k, 0, x + 9 * k, 0, [[0, '#b9ad9a'], [.4, '#fff8ea'], [1, '#9c8f7c']]);
    rr(g, x - 8 * k, roofY + 30 * k, 16 * k, floorY - roofY - 30 * k, 5 * k); g.fill();
    g.fillStyle = '#efe4d0'; rr(g, x - 14 * k, floorY - 14 * k, 28 * k, 14 * k, 3 * k); g.fill();
    // Iron brackets.
    g.strokeStyle = '#efe4d0'; g.lineWidth = 3 * k;
    g.beginPath(); g.moveTo(x, roofY + 90 * k); g.quadraticCurveTo(x - 30 * k, roofY + 60 * k, x - 50 * k, roofY + 38 * k); g.stroke();
    g.beginPath(); g.moveTo(x, roofY + 90 * k); g.quadraticCurveTo(x + 30 * k, roofY + 60 * k, x + 50 * k, roofY + 38 * k); g.stroke();
  }
  // Valance: a scalloped trim below the roof.
  g.fillStyle = '#f4ead8';
  const vy = roofY + 26 * k;
  g.beginPath(); g.moveTo(cx - w * .56, roofY); g.lineTo(cx + w * .56, roofY); g.lineTo(cx + w * .56, vy);
  const sc = 22;
  for (let i = sc; i >= 0; i--) { const x = cx - w * .56 + i * w * 1.12 / sc; g.quadraticCurveTo(x + w * 1.12 / sc / 2, vy + 22 * k, x, vy); }
  g.closePath(); g.fill();
  // Roof: a Victorian ogee in candy stripes, flaring at the eaves, with a lantern and finial.
  const rh = 300 * k, ew = w * .6;
  // The outline: up the left side (concave flare, convex shoulder, neck), down the right.
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
  dome();
  g.fillStyle = lgrad(g, cx - ew, 0, cx + ew, 0, [[0, '#7d1f35'], [.4, '#e0495d'], [.6, '#f26a74'], [1, '#6e1a2f']]);
  g.fill();
  g.save(); dome(); g.clip();
  // Cream stripes following the curve toward the top.
  for (let i = -7; i <= 7; i++) {
    if (i % 2) continue;
    g.fillStyle = lgrad(g, cx - ew, 0, cx + ew, 0, [[0, '#b9a58f'], [.45, '#fff5e6'], [1, '#a8927a']]);
    g.beginPath();
    g.moveTo(cx + (i - .5) * ew / 7, roofY);
    g.quadraticCurveTo(cx + (i - .5) * ew / 7 * .45, roofY - rh * .5, cx, roofY - rh);
    g.quadraticCurveTo(cx + (i + .5) * ew / 7 * .45, roofY - rh * .5, cx + (i + .5) * ew / 7, roofY);
    g.closePath(); g.fill();
  }
  g.fillStyle = vgrad(g, roofY - rh, roofY, [[0, 'rgba(255,255,255,.18)'], [.6, 'rgba(0,0,0,0)'], [1, 'rgba(20,0,20,.3)']]);
  g.fillRect(cx - w, roofY - rh, w * 2, rh);
  if (o.roofLight) { g.fillStyle = rgrad(g, cx + o.roofLight.dx * ew, roofY - rh * .4, 0, ew, [[0, rgba(o.roofLight.col, .45)], [1, rgba(o.roofLight.col, 0)]]); g.fillRect(cx - w, roofY - rh, w * 2, rh); }
  g.restore();
  // Finial.
  g.fillStyle = C.gold;
  circle(g, cx, roofY - rh - 8 * k, 11 * k); g.fill();
  g.fillRect(cx - 2.5 * k, roofY - rh - 56 * k, 5 * k, 50 * k);
  star(g, cx, roofY - rh - 62 * k, 13 * k, 5 * k, 4, 0); g.fill();
  glow(g, cx, roofY - rh - 62 * k, 70 * k, C.gold, .7 * on);
  // Bulbs along the eaves and up both edges of the roof.
  const nb = 24;
  for (let i = 0; i <= nb; i++) {
    const x = cx - ew + i * ew * 2 / nb;
    const ch = o.chase ? (Math.sin(i * .8 - t * o.chase) > 0 ? 1 : .35) : 1;
    bulb(g, x, roofY + 2 * k, 5.5 * k, i % 2 ? C.bulb : '#ffe9c2', on * ch);
  }
  const edge = p => {
    // Sample the roof edge (right side) at parameter p in [0, 1] from eave to neck.
    const b = (p0, p1, p2, p3, q) => (1 - q) ** 3 * p0 + 3 * (1 - q) ** 2 * q * p1 + 3 * (1 - q) * q * q * p2 + q ** 3 * p3;
    if (p < .5) { const q = p / .5; return [b(ew, ew * .78, ew * .5, ew * .42, q), b(0, -rh * .08, -rh * .18, -rh * .42, q)]; }
    const q = (p - .5) / .5; return [b(ew * .42, ew * .36, ew * .18, ew * .07, q), b(-rh * .42, -rh * .66, -rh * .76, -rh * .9, q)];
  };
  for (const s of [-1, 1]) for (let i = 1; i < 11; i++) {
    const [ex, ey] = edge(i / 11);
    bulb(g, cx + s * ex, roofY + ey, 4.6 * k, C.bulb, on * (o.chase ? (Math.sin(i * 1.1 - t * o.chase * 1.2) > 0 ? 1 : .4) : 1));
  }
  return { floorY, roofY, rh };
}

// ---------------------------------------------------------------- Ferris wheel
export function ferrisWheel(g, t, cx, cy, R, o = {}) {
  const on = o.on ?? 1;
  const rot = o.rot ?? t * .06;
  const n = 18;
  // Legs.
  g.strokeStyle = o.frame || '#d9cdea'; g.lineWidth = R * .022; g.lineCap = 'round';
  for (const s of [-1, 1]) { line(g, cx, cy, cx + s * R * .62, cy + R * 1.35); g.stroke(); line(g, cx, cy, cx + s * R * .4, cy + R * 1.35); g.stroke(); }
  g.lineWidth = R * .012;
  for (let i = 1; i < 6; i++) { const y = cy + R * 1.35 * i / 6; const hw = R * .62 * i / 6; line(g, cx - hw, y, cx + hw, y); g.stroke(); }
  // Rims and spokes.
  g.strokeStyle = rgba(o.frame || '#e8dcf5', .9);
  g.lineWidth = R * .016; circle(g, cx, cy, R); g.stroke();
  g.lineWidth = R * .01; circle(g, cx, cy, R * .92); g.stroke();
  g.lineWidth = R * .006;
  for (let i = 0; i < n; i++) {
    const a = rot + i / n * TAU, a2 = rot + (i + .5) / n * TAU;
    line(g, cx, cy, cx + Math.cos(a) * R, cy + Math.sin(a) * R); g.stroke();
    line(g, cx + Math.cos(a) * R * .92, cy + Math.sin(a) * R * .92, cx + Math.cos(a2) * R, cy + Math.sin(a2) * R); g.stroke();
  }
  // Hub.
  g.fillStyle = '#efe6ff'; circle(g, cx, cy, R * .07); g.fill();
  glow(g, cx, cy, R * .25, C.pink, .5 * on);
  // Bulbs on the rim, chasing in colours.
  const nb = 72, cols = o.cols || [C.pink, C.bulb, C.cyan, C.bulb];
  for (let i = 0; i < nb; i++) {
    const a = rot + i / nb * TAU;
    const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
    const wave = .5 + .5 * Math.sin(i / nb * TAU * 3 - t * (o.chase ?? 3));
    const col = cols[Math.floor((i + t * 2) / 6) % cols.length];
    bulb(g, x, y, R * .011, col, on * (.35 + .65 * wave));
  }
  for (let i = 0; i < n; i++) {
    const a = rot + i / n * TAU;
    bulb(g, cx + Math.cos(a) * R * .5, cy + Math.sin(a) * R * .5, R * .008, C.bulb, on * .8);
  }
  // Gondolas hang level.
  const gcols = ['#ff5a7a', '#ffd166', '#48e3ff', '#b06bff', '#7cf29a', '#ff9f43'];
  for (let i = 0; i < n; i++) {
    const a = rot + i / n * TAU;
    const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
    const sw = Math.sin(t * 1.3 + i) * .06;
    g.save(); g.translate(x, y); g.rotate(sw);
    g.strokeStyle = '#d9cdea'; g.lineWidth = R * .006; line(g, 0, 0, 0, R * .06); g.stroke();
    const gw = R * .09, gh = R * .075;
    g.fillStyle = gcols[i % gcols.length];
    rr(g, -gw / 2, R * .06, gw, gh, gw * .3); g.fill();
    g.fillStyle = 'rgba(255,240,200,.85)'; rr(g, -gw * .36, R * .06 + gh * .18, gw * .72, gh * .38, gw * .12); g.fill();
    glow(g, 0, R * .06 + gh * .35, gw * .9, C.bulb, .35 * on);
    g.restore();
  }
}

// ---------------------------------------------------------------- lighthouse
export function lighthouse(g, t, x, y, h, o = {}) {
  const k = h / 400;
  const beamA = o.beamA ?? (t * .9);
  const on = o.on ?? 1;
  // Beam (behind the tower top), sweeping; bright when facing us.
  const lx = x, ly = y - h * .9;
  if (on > 0) {
    const facing = Math.cos(beamA);
    const len = o.beamLen || 1400;
    for (const dir of [1, -1]) {
      const a = beamA * 0 + (dir > 0 ? Math.PI : 0);
      const sx = dir * Math.sin(beamA) * len;
      g.save(); g.globalCompositeOperation = 'lighter';
      const grd = lgrad(g, lx, ly, lx + sx, ly + 30, [[0, rgba('#fff3c4', .45 * on)], [1, rgba('#fff3c4', 0)]]);
      g.fillStyle = grd;
      poly(g, [[lx, ly - 8 * k], [lx + sx, ly - 90 * k * Math.abs(Math.sin(beamA)) - 20], [lx + sx, ly + 90 * k * Math.abs(Math.sin(beamA)) + 20], [lx, ly + 8 * k]]);
      g.fill();
      g.restore();
    }
    glow(g, lx, ly, 140 * k * (1 + Math.max(0, facing) * 2), '#fff3c4', .6 * on);
  }
  // Tower: tapered, striped.
  const bw = 60 * k, tw = 36 * k;
  g.save();
  poly(g, [[x - bw, y], [x + bw, y], [x + tw, y - h * .82], [x - tw, y - h * .82]]);
  g.clip();
  for (let i = 0; i < 6; i++) {
    g.fillStyle = i % 2 ? '#f3efe6' : '#d8423f';
    g.fillRect(x - bw, y - h * .82 * (i + 1) / 6, bw * 2, h * .82 / 6 + 1);
  }
  g.fillStyle = lgrad(g, x - bw, 0, x + bw, 0, [[0, 'rgba(10,5,30,.55)'], [.45, 'rgba(10,5,30,0)'], [1, 'rgba(10,5,30,.7)']]);
  g.fillRect(x - bw, y - h, bw * 2, h);
  g.restore();
  g.fillStyle = '#2a2238'; rr(g, x - tw * 1.35, y - h * .84, tw * 2.7, 10 * k, 3 * k); g.fill();
  g.fillStyle = rgba('#fff3c4', .9 * on + .1); rr(g, x - tw * .8, y - h * .95, tw * 1.6, h * .11, 4 * k); g.fill();
  g.fillStyle = '#2a2238'; g.beginPath(); g.moveTo(x - tw, y - h * .95); g.lineTo(x, y - h * 1.04); g.lineTo(x + tw, y - h * .95); g.closePath(); g.fill();
}

// ---------------------------------------------------------------- stage beams through haze
// sources: [{x, y, a (angle, 0 = straight down), col, len, w}]
export function beams(g, t, sources, strength = 1) {
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const s of sources) {
    const len = s.len || 1500, w = s.w || .16;
    const ex = s.x + Math.sin(s.a) * len, ey = s.y + Math.cos(s.a) * len;
    const px = Math.cos(s.a) * len * w, py = -Math.sin(s.a) * len * w;
    const gr = lgrad(g, s.x, s.y, ex, ey, [[0, rgba(s.col, .38 * strength * (s.i ?? 1))], [.6, rgba(s.col, .1 * strength * (s.i ?? 1))], [1, rgba(s.col, 0)]]);
    g.fillStyle = gr;
    poly(g, [[s.x - px * .04, s.y - py * .04], [s.x + px * .04, s.y + py * .04], [ex + px, ey + py], [ex - px, ey - py]]);
    g.fill();
    glow(g, s.x, s.y, 60, s.col, .7 * strength * (s.i ?? 1));
  }
  g.restore();
}

// Haze: drifting soft light over a region.
export function haze(g, t, x, y, w, h, col, a = .25) {
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 6; i++) {
    const cx = x + w * (rnd(i, 51) + .08 * Math.sin(t * .3 + i)), cy = y + h * rnd(i, 52);
    const r = Math.max(w, h) * (.25 + .2 * rnd(i, 53));
    g.fillStyle = rgrad(g, cx, cy, 0, r, [[0, rgba(col, a * .5)], [1, rgba(col, 0)]]);
    g.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  g.restore();
}

// ---------------------------------------------------------------- town on the far shore
export function town(g, t, hz, o = {}) {
  const on = o.on ?? 1;
  g.fillStyle = o.col || '#1a1240';
  g.beginPath(); g.moveTo(0, hz);
  for (let x = 0; x <= W; x += 20) g.lineTo(x, hz - 40 - 38 * (fbm1(x * .004 + 3, 8) + .6));
  g.lineTo(W, hz); g.closePath(); g.fill();
  for (let i = 0; i < 90; i++) {
    const x = rnd(i, 61) * W, y = hz - 8 - rnd(i, 62) * 60;
    if (y < hz - 40 - 38 * (fbm1(x * .004 + 3, 8) + .6)) continue;
    const col = rnd(i, 63) > .7 ? '#ffd9a0' : rnd(i, 64) > .5 ? '#ffb070' : '#fff0c0';
    const a = on * (.5 + .5 * rnd(i, 65)) * (rnd(i + Math.floor(t * .5), 66) > .03 ? 1 : .3);
    glow(g, x, y, 10, col, .5 * a);
    g.fillStyle = rgba(col, a); g.fillRect(x - 1.5, y - 1.5, 3, 3);
  }
}
