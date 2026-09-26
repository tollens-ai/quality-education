// Clawd & the Bots: instruments, and the whole band performing to the record.
// Every move is driven by the song clock: beats for bounce, the kick for punches, the vocal
// envelope for Clawd's mouth, the backing-vocal times for the bots' mouths.
import { C, TAU, clamp, lerp, smooth, rr, circle, ellipse, line, glow, rgba, vgrad, lgrad, rgrad, shade, star } from './kit.js';
import { clawd, molty, grok, blossom, muse, mic, micStand, contactShadow, grokBadge } from './cast.js';

export function guitar(g, x, y, s, rot, col = '#ff4fa3') {
  g.save(); g.translate(x, y); g.rotate(rot);
  const u = s / 10;
  // Neck and head.
  g.fillStyle = '#5a3a28'; rr(g, u * 2, -u * .45, u * 8, u * .9, u * .3); g.fill();
  g.fillStyle = '#2a1a14'; rr(g, u * 9.6, -u * .8, u * 1.8, u * 1.6, u * .4); g.fill();
  g.strokeStyle = 'rgba(255,240,220,.6)'; g.lineWidth = u * .08;
  for (let i = 0; i < 4; i++) { line(g, -u * 1.5, -u * .3 + i * u * .2, u * 9.8, -u * .3 + i * u * .2); g.stroke(); }
  // Body: a pointy pop-punk offset shape.
  g.fillStyle = lgrad(g, -u * 4, -u * 3, u * 2, u * 3, [[0, shade(col, .25)], [.5, col], [1, shade(col, -.35)]]);
  g.beginPath();
  g.moveTo(u * 2.2, -u * 1.2);
  g.bezierCurveTo(u * .5, -u * 3.6, -u * 3.8, -u * 3.2, -u * 4.2, -u * .6);
  g.bezierCurveTo(-u * 4.6, u * 2.4, -u * 1, u * 3.6, u * 1.6, u * 2);
  g.bezierCurveTo(u * 1.2, u * 1, u * 1.6, u * .2, u * 2.2, -u * 1.2);
  g.fill();
  g.fillStyle = '#fff6e8'; rr(g, -u * 2.6, -u * .9, u * 1.6, u * 1.8, u * .3); g.fill();
  g.fillStyle = '#1a1420'; circle(g, -u * .4, 0, u * .5); g.fill();
  g.restore();
}

export function bass(g, x, y, s, rot, col = '#48e3ff') {
  g.save(); g.translate(x, y); g.rotate(rot);
  const u = s / 10;
  g.fillStyle = '#3a2618'; rr(g, u * 2, -u * .5, u * 10, u * 1, u * .3); g.fill();
  g.fillStyle = '#1c1210'; rr(g, u * 11.6, -u * .9, u * 1.6, u * 1.8, u * .4); g.fill();
  g.fillStyle = lgrad(g, -u * 4, -u * 3, u * 2, u * 3, [[0, shade(col, .25)], [.5, col], [1, shade(col, -.4)]]);
  g.beginPath();
  g.moveTo(u * 2.4, -u * 1.4);
  g.bezierCurveTo(u * .6, -u * 3.2, -u * 3.2, -u * 3.6, -u * 4.4, -u * 1.2);
  g.bezierCurveTo(-u * 5.2, u * 1.4, -u * 2.6, u * 3.8, u * .4, u * 2.4);
  g.bezierCurveTo(u * 1.6, u * 1.8, u * 1.4, u * .4, u * 2.4, -u * 1.4);
  g.fill();
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = u * .1;
  for (let i = 0; i < 4; i++) { line(g, -u * 2.5, -u * .3 + i * u * .2, u * 11.8, -u * .3 + i * u * .2); g.stroke(); }
  g.restore();
}

// A little drum kit; returns hit points so sticks can aim.
export function drums(g, x, y, s, hit = 0, cymbal = 0, logo) {
  const u = s / 10;
  // Cymbals.
  for (const [cx2, cy2, w2, ph] of [[-4.8, -9.2, 3.2, cymbal], [5, -8.6, 2.8, cymbal * .7]]) {
    g.save(); g.translate(x + cx2 * u, y + cy2 * u); g.rotate(.12 * Math.sin(ph * 8) * ph);
    g.strokeStyle = '#6c6a78'; g.lineWidth = u * .18; line(g, 0, 0, 0, u * 8); g.stroke();
    g.fillStyle = lgrad(g, -w2 * u, 0, w2 * u, 0, [[0, '#b58a2e'], [.5, '#ffe08a'], [1, '#9a7020']]);
    ellipse(g, 0, 0, w2 * u, u * .45); g.fill();
    if (ph > .05) glow(g, 0, 0, w2 * u * 1.4, C.gold, .35 * ph);
    g.restore();
  }
  // Toms.
  for (const [tx, ty, tw, th] of [[-2.2, -7, 1.8, 1.4], [2.2, -7.2, 1.8, 1.4]]) {
    g.fillStyle = '#e0495d'; rr(g, x + (tx - tw) * u, y + ty * u, tw * 2 * u, th * u * 1.3, u * .3); g.fill();
    g.fillStyle = '#f4ecde'; ellipse(g, x + tx * u, y + ty * u, tw * u, u * .45); g.fill();
  }
  // Kick drum with the drummer's mark.
  const kr = u * 4.2 * (1 + hit * .04);
  g.fillStyle = vgrad(g, y - kr * 2, y, [[0, '#f26a74'], [1, '#8f1f35']]);
  circle(g, x, y - kr, kr); g.fill();
  g.fillStyle = '#fbf3e4'; circle(g, x, y - kr, kr * .84); g.fill();
  g.strokeStyle = '#8f1f35'; g.lineWidth = u * .3; circle(g, x, y - kr, kr * .84); g.stroke();
  if (logo) logo(g, x, y - kr, kr * .62);
  if (hit > .05) glow(g, x, y - kr, kr * 1.3, C.pink, .25 * hit);
}

export function keyboard(g, x, y, w, press = []) {
  const h = w * .2;
  g.fillStyle = '#2a2838'; rr(g, x - w / 2, y - h, w, h, h * .2); g.fill();
  g.strokeStyle = '#1a1826'; g.lineWidth = w * .02; line(g, x - w * .4, y, x - w * .45, y + w * .45); g.stroke(); line(g, x + w * .4, y, x + w * .45, y + w * .45); g.stroke();
  const n = 14;
  for (let i = 0; i < n; i++) {
    const kx = x - w * .45 + i * w * .9 / n;
    const down = press.includes(i);
    g.fillStyle = down ? '#ffd98a' : '#fbf6ee';
    rr(g, kx + 1, y - h * .62, w * .9 / n - 2, h * .5, 2); g.fill();
    if (down) glow(g, kx + w * .03, y - h * .4, w * .08, C.gold, .5);
  }
  g.fillStyle = '#3b6bff'; rr(g, x - w * .45, y - h * .9, w * .2, h * .18, 3); g.fill();
}

// Timing helpers the band uses: is a backing vocal ("ooh", "ahh", "and me") sounding at t?
export function backingAt(lyrics, t) {
  for (const l of lyrics) {
    if (l.start === null) continue;
    const back = l.words.filter(w => w.backing);
    if (!back.length) continue;
    const leadEnd = Math.max(...l.words.filter(w => !w.backing && w.e !== null).map(w => w.e));
    if (t >= leadEnd - .1 && t <= l.end + .15) return clamp((t - leadEnd) / .15) * clamp((l.end + .15 - t) / .15);
  }
  return 0;
}

// The band on a floor line. pos: positions per member {x, y, s} (any omitted member isn't drawn).
// k: shared state from the clock: { beat, pulse, kick, vocal, back, t, energy }.
export function band(g, t, K, pos, o = {}) {
  const e = o.energy ?? 1;
  const bp = K.beatPos(t), ph = bp - Math.floor(bp);
  const bounce = Math.pow(1 - ph, 3) * e;
  const kick = K.kick(t) * e;
  const voc = clamp(K.vocal(t) * 1.2);
  const back = o.back ?? 0;
  const rim = o.rim || C.cyan, rim2 = o.rim2 || C.pink;
  const eighth = Math.floor(bp * 2);
  if (pos.grok) {
    const p = pos.grok;
    const hitL = Math.pow(1 - ((bp) % 1), 4), hitR = Math.pow(1 - ((bp + .5) % 1), 4);
    // Grok's mark on the kick drum, like a band's name.
    drums(g, p.x, p.y, p.s * 1.25, kick, hitR * e, (g2, x, y, r) => grokBadge(g2, x, y, r * 1.35));
    grok(g, p.x, p.y - p.s * .55, { s: p.s, rim: rim2, squash: -bounce * .05 + kick * .06, armL: -.6 + hitL * .9 * e, armR: -.3 - hitR * .9 * e, shadow: false });
  }
  if (pos.muse) {
    const p = pos.muse;
    muse(g, p.x, p.y, { s: p.s, rim, t, squash: bounce * .04, lean: Math.sin(bp * Math.PI / 2) * .04 * e, mouth: back * .9, eyes: back > .3 ? 'happy' : undefined, blink: blinkAt(t, 3) });
    keyboard(g, p.x, p.y - p.s * .38, p.s * 1.25, e > .2 ? [eighth % 7, (eighth * 3) % 14] : []);
  }
  if (pos.molty) {
    const p = pos.molty;
    const strum = Math.sin(bp * Math.PI * 2) * .5 + .5;
    molty(g, p.x, p.y, { s: p.s, rim, t, squash: bounce * .07 - kick * .03, lean: -.05 + Math.sin(bp * Math.PI / 2) * .06 * e, clawL: -.2, clawR: .5 - strum * .6 * e, mouth: back, eyes: back > .3 ? 'happy' : undefined, blink: blinkAt(t, 5) });
    guitar(g, p.x - p.s * .05, p.y - p.s * .38, p.s * .62, -.42, C.pink);
  }
  if (pos.blossom) {
    const p = pos.blossom;
    blossom(g, p.x, p.y, { s: p.s, rim: rim2, squash: bounce * .06, lean: Math.sin(bp * Math.PI / 2 + 1) * .05 * e, mouth: back, eyes: back > .3 ? 'happy' : undefined, spin: Math.sin(t * .8) * .08, blink: blinkAt(t, 7) });
    bass(g, p.x + p.s * .02, p.y - p.s * .28, p.s * .55, -.35, C.cyan);
  }
  if (pos.clawd) {
    const p = pos.clawd;
    const singing = voc > .15;
    const held = o.held ?? false;
    if (p.stand !== false) micStand(g, p.x + p.s * .05, p.y, p.s * .62, p.s / 16);
    clawd(g, p.x, p.y, {
      s: p.s, rim, rimSide: 1, t,
      squash: bounce * .06 + (o.jump ? -.1 : 0),
      eyes: o.eyes || (held ? 'closed' : singing ? 'open' : 'happy'),
      mouth: o.mouth ?? voc,
      armR: o.armR ?? -1.15, armL: o.armL ?? (-.4 - bounce * .3),
      hold: p.stand !== false ? (g2, u) => mic(g2, u, { rot: -1.1 }) : undefined,
      legs: bp, blink: blinkAt(t, 1),
    });
  }
}

// A natural blink every few seconds, different per character.
export function blinkAt(t, seed) {
  const period = 2.6 + (seed % 5) * .7;
  const ph = ((t + seed * 1.37) % period) / period;
  return ph < .04 ? Math.sin(ph / .04 * Math.PI) : 0;
}
