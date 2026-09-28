// The band's gear, inked like the band: REGEX's pointed white guitar, NULL's long black bass,
// CLAWD's microphone on a ribboned stand, and CRON's clear acrylic kit (drums made of glass, in a
// film about glass). Each piece can flash where it's struck.
import { C, TAU, clamp, lerp, rgba, hash, mix, easeOut } from './kit.js';
import { P, ink, gpen, glint } from './pen.js';
import { text } from './type.js';

// ---------------------------------------------------------------- guitar
// Origin at the bridge; the neck runs up and to the left along -x before rotation `rot`.
// s: body length in px. o.strum 0..1 flashes the strings; o.hl highlight colour.
export function guitar(g, x, y, s, o = {}) {
  const k = s / 300, lw = Math.max(2, 3.2 * k), t = o.t ?? 0;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -.45); g.scale(k, k);
  // Neck and headstock.
  const neckL = 460;
  ink(g, P().poly([[-40, -17], [-40 - neckL, -13], [-40 - neckL, 13], [-40, 17]]), { fill: C.ink3, line: lw / k, seed: 41, t });
  for (let i = 1; i <= 14; i++) {
    const fx = -40 - neckL * (1 - Math.pow(.94, i * 1.5));
    g.fillStyle = C.steel2; g.fillRect(fx - 1.5, -15, 3, 30);
    if ([3, 5, 7, 9, 12].includes(i)) { g.fillStyle = C.bone2; g.beginPath(); g.arc(fx + 12, 0, 4, 0, TAU); g.fill(); }
  }
  ink(g, P().poly([[-40 - neckL, -14], [-40 - neckL - 110, -40], [-40 - neckL - 150, -26], [-40 - neckL - 20, 15]]), { fill: C.bone, line: lw / k, seed: 42, t, shade: { dx: 0, dy: -6, col: C.bone2 } });
  for (let i = 0; i < 6; i++) { g.fillStyle = C.steel; g.fillRect(-40 - neckL - 30 - i * 19, -30 + i * 2.5, 7, 7); }
  // The body: a white arrowhead with a hooked horn, red stripes, a black guard.
  const body = P().poly([[-60, -38], [40, -80], [150, -150], [120, -60], [190, -20], [120, 40], [160, 120], [40, 80], [-60, 38]]);
  ink(g, body, { fill: C.bone, line: lw * 1.3 / k, seed: 43, t, corner: .7, shade: { dx: -8, dy: -10, col: C.bone2 },
    rim: o.rim ? { dx: 6, dy: -4, col: o.rim } : null });
  g.save(); body.trace(g); g.clip();
  g.fillStyle = C.red;
  g.beginPath(); g.moveTo(10, -120); g.lineTo(40, -120); g.lineTo(140, 150); g.lineTo(110, 150); g.fill();
  g.beginPath(); g.moveTo(55, -120); g.lineTo(68, -120); g.lineTo(168, 150); g.lineTo(155, 150); g.fill();
  g.restore();
  ink(g, P().poly([[-30, -30], [60, -46], [80, 30], [-30, 30]]), { fill: C.ink, line: lw / k, seed: 44, t });
  // Pickups and bridge.
  for (const px of [-12, 38]) { g.fillStyle = C.ink2; g.fillRect(px, -24, 26, 48); g.fillStyle = C.steel; for (let i = 0; i < 6; i++) g.fillRect(px + 9, -21 + i * 8, 8, 3); }
  g.fillStyle = C.steel; g.fillRect(84, -22, 14, 44);
  // Strings: flash on a strum.
  const sc = o.strum ? mix(C.steel, C.bone, clamp(o.strum)) : C.steel;
  for (let i = 0; i < 6; i++) {
    const sy = -12.5 + i * 5;
    g.strokeStyle = sc; g.lineWidth = o.strum ? 1.6 + o.strum * 1.4 : 1.4;
    g.beginPath(); g.moveTo(92, sy); g.lineTo(-40 - neckL, sy * .8); g.stroke();
  }
  g.restore();
}
// Where the fretting hand and the picking hand go, in the parent's coordinates.
export function guitarHands(x, y, s, rot = -.45, fret = .5) {
  const k = s / 300, c = Math.cos(rot), sn = Math.sin(rot);
  const at = (lx, ly) => [x + (lx * c - ly * sn) * k, y + (lx * sn + ly * c) * k];
  return { fret: at(-40 - 460 * lerp(.15, .8, fret), 0), pick: at(30, 0) };
}

// ---------------------------------------------------------------- bass
export function bass(g, x, y, s, o = {}) {
  const k = s / 300, lw = Math.max(2, 3.2 * k), t = o.t ?? 0;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -.5); g.scale(k, k);
  const neckL = 600;
  ink(g, P().poly([[-50, -20], [-50 - neckL, -16], [-50 - neckL, 16], [-50, 20]]), { fill: C.ink3, line: lw / k, seed: 51, t });
  for (let i = 1; i <= 16; i++) { const fx = -50 - neckL * (1 - Math.pow(.95, i * 1.4)); g.fillStyle = C.steel2; g.fillRect(fx - 1.5, -18, 3, 36); }
  ink(g, P().poly([[-50 - neckL, -17], [-50 - neckL - 150, -30], [-50 - neckL - 160, 20], [-50 - neckL, 17]]), { fill: C.ink, line: lw / k, seed: 52, t });
  for (let i = 0; i < 5; i++) { g.fillStyle = C.steel; g.fillRect(-50 - neckL - 30 - i * 24, -28, 8, 8); }
  const body = P().S([[-70, -50], [30, -110], [120, -150], [140, -90], [210, -30], [200, 60], [130, 130], [20, 100], [-70, 50]]);
  ink(g, body, { fill: C.ink2, line: lw * 1.3 / k, seed: 53, t, shade: { dx: -8, dy: -10, col: C.ink }, rim: { dx: 7, dy: -5, col: o.rim || C.bone } });
  // A bone binding just inside the edge.
  g.save(); g.strokeStyle = C.bone3; g.lineWidth = 4; body.map((px, py) => [px * .93 + 8, py * .93]).trace(g); g.stroke(); g.restore();
  g.fillStyle = C.ink; g.fillRect(-10, -26, 36, 52); g.fillRect(50, -26, 36, 52);
  g.fillStyle = C.steel; g.fillRect(104, -24, 16, 48);
  const sc = o.pluck ? mix(C.steel, C.bone, clamp(o.pluck)) : C.steel;
  for (let i = 0; i < 5; i++) {
    const sy = -14 + i * 7;
    g.strokeStyle = sc; g.lineWidth = 2 + (o.pluck ? o.pluck : 0);
    g.beginPath(); g.moveTo(112, sy); g.lineTo(-50 - neckL, sy * .85); g.stroke();
  }
  g.restore();
}

// ---------------------------------------------------------------- mic
export function micStand(g, x, y, h, o = {}) {
  const t = o.t ?? 0;
  gpen(g, [[x, y], [x, y - h]], 9, { col: C.ink3, taper: [0, 0], t, seed: 61 });
  gpen(g, [[x, y], [x, y - h]], 4, { col: C.steel2, taper: [0, 0], t, seed: 62, wobble: 0 });
  // Tripod feet.
  for (const d of [-1, 1]) gpen(g, [[x, y - 10], [x + d * 70, y]], 7, { col: C.ink3, taper: [0, .2], t, seed: 63 + d });
  // A red ribbon tied under the clip, streaming.
  const rx = x, ry = y - h + 40;
  const flow = o.flow ?? 0;
  ink(g, P().S([[rx, ry], [rx + 40 + flow * 20, ry + 40], [rx + 20 + flow * 30, ry + 130], [rx + 55 + flow * 40, ry + 220], [rx + 30 + flow * 20, ry + 230], [rx + 5, ry + 120], [rx + 15, ry + 50]], true), { fill: C.red, line: 3, t, seed: 64 });
}
export function mic(g, x, y, s, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot);
  ink(g, P().poly([[-8 * s, 0], [8 * s, 0], [5 * s, 55 * s], [-5 * s, 55 * s]]), { fill: C.ink2, line: 3, seed: 71 });
  ink(g, P().ell(0, -10 * s, 14 * s, 17 * s), { fill: C.steel, line: 3, seed: 72, shade: { dx: -4 * s, dy: -4 * s, col: C.steel2 } });
  for (let i = -2; i <= 2; i++) gpen(g, [[i * 5 * s, -24 * s], [i * 5 * s, 4 * s]], 1.5, { col: C.steel2, taper: [0, 0], wobble: 0 });
  g.restore();
}

// ---------------------------------------------------------------- drums
// CRON's kit from the front: a clear acrylic kick with the band's name on its head, snare, two
// racks, a floor tom, hi-hat and crashes. o.hit: {kick, snare, tom1, tom2, floor, hat, crash, ride}
// as 0..1 flashes.
export function kit(g, x, y, s, o = {}) {
  const k = s / 600, t = o.t ?? 0, H = o.hit || {};
  const lw = Math.max(2, 3.4 * k);
  g.save(); g.translate(x, y); g.scale(k, k);
  const drum = (cx, cy, rx, ry, depth, flash, name) => {
    // A clear shell: dark glass with bone edges, the far rim seen through it.
    const shell = P().poly([[cx - rx, cy], [cx + rx, cy], [cx + rx, cy + depth], [cx - rx, cy + depth]]);
    ink(g, shell, { fill: rgba(C.glass2, .45), line: lw / k, seed: 80 + cx, t });
    g.strokeStyle = rgba(C.bone, .45); g.lineWidth = 3;
    g.beginPath(); g.ellipse(cx, cy + depth, rx, ry, 0, 0, Math.PI); g.stroke();
    ink(g, P().ell(cx, cy, rx, ry), { fill: flash ? mix(C.bone2, C.bone, flash) : C.bone2, line: lw / k, seed: 90 + cx, t });
    if (flash > .05) { g.fillStyle = rgba(C.bone, flash * .9); g.beginPath(); g.ellipse(cx, cy, rx * 1.15, ry * 1.15, 0, 0, TAU); g.fill(); }
    glint(g, cx - rx * .4, cy + depth * .5, depth * .8, { col: rgba(C.bone, .5) });
  };
  const cymbal = (cx, cy, r, tilt, flash) => {
    g.save(); g.translate(cx, cy); g.rotate(tilt + (flash ? Math.sin(t * 40) * .06 * flash : 0));
    gpen(g, [[0, 0], [0, 260]], 6, { col: C.steel2, taper: [0, 0], wobble: 0 });
    ink(g, P().ell(0, 0, r, r * .18), { fill: flash ? mix('#b7a36a', C.bone, flash) : '#b7a36a', line: lw / k, seed: 100 + cx, t });
    g.fillStyle = C.ink2; g.beginPath(); g.ellipse(0, -2, r * .12, r * .05, 0, 0, TAU); g.fill();
    g.restore();
  };
  cymbal(-330, -250, 190, -.2, H.crash || 0);
  cymbal(330, -290, 170, .22, H.ride || H.crash2 || 0);
  cymbal(-420, -30, 110, -.08, H.hat || 0);
  drum(-150, -130, 120, 34, 120, H.tom1 || 0);
  drum(150, -130, 120, 34, 120, H.tom2 || 0);
  drum(330, 40, 150, 40, 220, H.floor || 0);
  drum(-300, 50, 130, 34, 90, H.snare || 0);
  // The kick, facing us, with the band's name on the head.
  const kf = H.kick || 0;
  ink(g, P().ell(0, 120, 250, 250), { fill: rgba(C.glass2, .55), line: lw * 1.3 / k, seed: 110, t });
  ink(g, P().ell(0, 120, 225, 225), { fill: kf ? mix(C.ink2, C.red3, kf) : C.ink2, line: lw / k, seed: 111, t });
  if (kf > .05) { g.fillStyle = rgba(C.red, kf * .6); g.beginPath(); g.arc(0, 120, 250 * (1 + kf * .08), 0, TAU); g.fill(); }
  text(g, 'Looking', 0, 105, 92, 'goth', { align: 'center', fill: C.bone, noAudit: true, ctx: { deco: true } });
  text(g, 'Glass', 0, 195, 92, 'goth', { align: 'center', fill: C.red, noAudit: true, ctx: { deco: true } });
  glint(g, -140, 20, 90, { col: rgba(C.bone, .5) });
  g.restore();
}
