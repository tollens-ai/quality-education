// The chorus, three times over. The same questions each time; what answers them changes.
// Chorus 1: nobody is there but a seagull. Chorus 2: the pier is full of the people from verse 2,
// each pulling a different way. Final chorus (in final.js): the brief answers every question.
// The trade-offs are lettered onto the things that act them out.
import { W, H, C, TAU, clamp, lerp, inv, smooth, easeOut, easeIn, easeOutBack, spring, bump, rnd, rr, circle, ellipse, line, poly, star, heart, glow, bulb, text, vgrad, rgrad, lgrad, rgba, mix, mixHex, shade, firework, confetti, streamers, INK } from '../kit.js';
import { nightSky, sea, reflection, lighthouse, ferrisWheel, beams, haze, town, moon, washBand } from '../world.js';
import { clawd, muse, molty, grok, blossom, person, pen, nopen, tone } from '../cast.js';
import { hand, guideDog, flame } from '../props.js';
import { band, blinkAt } from '../band.js';
import { pierWide, seagull, fireworks } from './pier.js';
import { hookSign, backingScript, wordTimes, bandMedium, clawdClose, bulbWord } from './stage.js';
import { sing, lineNear, STYLE } from '../lyrics.js';
import { letter, measure, skeleton } from '../hand.js';

const onset = (lineT0, i) => wordTimes(lineT0)[i]?.s ?? lineT0;
const GOLD = STYLE.hot, PINK = STYLE.pink;

// ---------------------------------------------------------------- the hook lines
export function hookWide(g, t, c, o) {
  pierWide(g, t, c.K, { seagull: o.seagull, crowd: o.crowd, energy: 1, back: 0, fw0: o.ignite !== undefined ? o.ignite + .6 : o.line - .2, dawn: o.dawn || 0, ignite: o.ignite });
  hookSign(g, t, o.line, o.word, 540, 330, .95);
  backingScript(g, t, o.line, 540, 820, 60);
}

export function hookBand(g, t, c, o) {
  bandMedium(g, t, c.K, { back: o.back ?? 0, crowd: o.crowd, people: o.people, dawn: o.dawn || 0 });
  hookSign(g, t, o.line, o.word, 540, 470, .8);
  backingScript(g, t, o.line, 540, 800, 64);
}

export function hookClose(g, t, c, o) {
  clawdClose(g, t, c.K, { crowd: o.crowd, dawn: o.dawn || 0 });
  hookSign(g, t, o.line, o.word, 540, 380, .85);
  backingScript(g, t, o.line, 540, 740, 64);
}

// ---------------------------------------------------------------- night backdrop over the water
function seaNight(g, t, o = {}) {
  const hz = o.hz ?? 1180;
  nightSky(g, t, { horizon: hz, moon: o.moon === false ? null : { x: o.moonX ?? 880, y: o.moonY ?? 260, r: 50 }, dawn: o.dawn || 0 });
  town(g, t, hz, { on: 1 - (o.dawn || 0) * .6 });
  sea(g, t, hz, { dawn: o.dawn || 0, reflections: o.refl || [{ x: o.moonX ?? 880, col: C.moon, w: 30, a: .5 }] });
  return hz;
}
// The pier's railing along the bottom of a shot, with bulbs.
function railing(g, t, y, o = {}) {
  g.save();
  g.ink = null;
  g.fillStyle = vgrad(g, y, H, [[0, '#3a2342'], [1, '#150a1f']]);
  g.fillRect(0, y + 60, W, H - y);
  pen(g, 8, .7);
  g.fillStyle = '#231632'; g.fillRect(0, y, W, 13);
  for (let x = 20; x < W; x += 54) { rr(g, x, y, 9, 64, 3); g.fill(); }
  g.restore();
  for (let i = 0; i < 11; i++) { const x = 50 + i * 100; bulb(g, x, y - 6, 6, i % 2 ? C.bulb : '#ffe2b8', (o.on ?? 1) * (.6 + .4 * (Math.sin(i - t * 4) > 0 ? 1 : 0))); }
}

// ---------------------------------------------------------------- FAST / STURDY / CHEAP
const CORNERS = [
  { key: 'FAST', x: 540, y: 400, col: '#4fd6f2', icon: 'bolt' },
  { key: 'STURDY', x: 215, y: 1110, col: '#a9b8ff', icon: 'anchor' },
  { key: 'CHEAP', x: 865, y: 1110, col: GOLD, icon: 'coin' },
];
function icon(g, kind, x, y, s, col) {
  g.save(); g.ink = null;
  g.fillStyle = col; g.strokeStyle = col; g.lineCap = 'round'; g.lineJoin = 'round';
  if (kind === 'bolt') { pen(g, s / 8, .7); poly(g, [[x + s * .15, y - s * .6], [x - s * .35, y + s * .08], [x - s * .02, y + s * .08], [x - s * .15, y + s * .6], [x + s * .35, y - s * .1], [x + s * .02, y - s * .1]]); g.fill(); }
  if (kind === 'anchor') { g.lineWidth = s * .13; circle(g, x, y - s * .45, s * .12); g.stroke(); line(g, x, y - s * .33, x, y + s * .5); g.stroke(); line(g, x - s * .25, y - s * .15, x + s * .25, y - s * .15); g.stroke(); g.beginPath(); g.arc(x, y + s * .05, s * .45, Math.PI * .15, Math.PI * .85); g.stroke(); }
  if (kind === 'coin') { pen(g, s / 8, .7); circle(g, x, y, s * .45); g.fill(); nopen(g); g.fillStyle = '#6a4a10'; g.font = `800 ${s * .55}px Mono`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('£', x, y + s * .04); }
  g.restore();
}
// A round fairground sign with an icon, and its word on a ribbon below, lettered as it's sung.
function cornerSign(g, t, k, appear, focus, wordP, word) {
  const s = 108 * spring(appear, 3, 6) * (1 + .14 * focus);
  if (s <= 1) return;
  const dim = .45 + .55 * Math.max(focus, appear > 0 ? .35 : 0);
  g.save(); g.translate(k.x, k.y);
  glow(g, 0, 0, s * 2.2, k.col, .45 * dim);
  pen(g, s / 12, .9);
  const disc = () => circle(g, 0, 0, s);
  disc(); g.fillStyle = '#2a1a4a'; g.fill();
  nopen(g); tone(g, disc, '#2a1a4a', '#1a1030', -s * .1, -s * .1);
  g.restore();
  const nb = 20;
  for (let i = 0; i < nb; i++) { const a = i / nb * TAU + t * .5; bulb(g, k.x + Math.cos(a) * s * .88, k.y + Math.sin(a) * s * .88, s * .05, i % 2 ? k.col : C.bulb, dim * (.5 + .5 * (Math.sin(i * 1.2 - t * 6) > 0 ? 1 : 0))); }
  g.save(); g.globalAlpha = .45 + .55 * dim;
  icon(g, k.icon, k.x, k.y, s * .9, mix(k.col, '#ffffff', .25));
  g.restore();
  // The ribbon, and the sung word on it.
  const rw = s * 2.3, ry = k.y + s * 1.05;
  g.save(); pen(g, 9, .8);
  g.fillStyle = shade(k.col, -.35);
  poly(g, [[k.x - rw / 2 - 30, ry - 6], [k.x - rw / 2 + 4, ry - 6], [k.x - rw / 2 + 4, ry + 70], [k.x - rw / 2 - 30, ry + 70], [k.x - rw / 2 - 14, ry + 32]]); g.fill();
  poly(g, [[k.x + rw / 2 + 30, ry - 6], [k.x + rw / 2 - 4, ry - 6], [k.x + rw / 2 - 4, ry + 70], [k.x + rw / 2 + 30, ry + 70], [k.x + rw / 2 + 14, ry + 32]]); g.fill();
  g.fillStyle = mix(k.col, '#ffffff', .55); rr(g, k.x - rw / 2, ry - 18, rw, 82, 6); g.fill();
  g.restore();
  if (wordP > 0) letter(g, word, k.x, ry + 48, 58, { align: 'center', col: '#2b1f3c', w: .17, shade: null, progress: wordP, seed: k.x | 0 });
}
function edge(g, t, a, b, on) {
  if (on <= 0) return;
  const n = 14;
  for (let i = 1; i < n; i++) {
    const p = i / n;
    if (p > on) break;
    bulb(g, lerp(a.x, b.x, p), lerp(a.y, b.y, p), 4.6, C.bulb, .35 + .65 * (Math.sin(i - t * 6) > 0 ? 1 : .3));
  }
}

// variant: 1 (Clawd alone, pulled every way), 2 (the people each pull their own way), 3 (your answer)
export function triangleShot(g, t, c, o) {
  const L = o.line;
  const ws = wordTimes(L);
  const tF = ws[0].s, tS = ws[4].s, tC = ws[6].s;
  seaNight(g, t, { hz: 1250, moonX: 150 });
  ferrisWheel(g, t, 1060, 820, 330, { rot: t * .05, on: .5 });
  g.save(); g.ink = null; g.fillStyle = rgba('#0c0826', .45); g.fillRect(0, 0, W, H); g.restore();
  const appear = [inv(tF - .1, tF + .35, t), inv(tS - .1, tS + .35, t), inv(tC - .1, tC + .35, t)];
  const cur = t < tS ? 0 : t < tC ? 1 : 2;
  const settle = inv(L + 2.5, L + 2.7, t);
  let focus = CORNERS.map((k, i) => appear[i] > 0 ? (i === cur ? 1 - settle : 0) : 0);
  if (o.variant === 3 && t > tC) focus = [1, 0, 1];
  if (o.variant === 3 && t > tS && t < tC) focus = [1, .2, 0];
  edge(g, t, CORNERS[0], CORNERS[1], appear[1] * 1.2);
  edge(g, t, CORNERS[1], CORNERS[2], appear[2] * 1.2);
  edge(g, t, CORNERS[2], CORNERS[0], appear[2] * 1.2);
  const wp = i => clamp((t - ws[i].s) / .22);
  cornerSign(g, t, CORNERS[0], appear[0], focus[0], wp(0), 'FAST');
  cornerSign(g, t, CORNERS[1], appear[1], focus[1], wp(4), 'STURDY,');
  cornerSign(g, t, CORNERS[2], appear[2], focus[2], wp(6), 'CHEAP?');
  // The little words run along the triangle, so the line reads round it.
  if (t >= ws[1].s) letter(g, 'TO RUN,', 815, 430, 60, { align: 'center', col: '#fff3de', w: .16, shade: STYLE.paint.shade, progress: clamp((t - ws[1].s) / .3), seed: 5 });
  const edgeWord = (i, x, y, seed) => {
    if (t < ws[i].s) return;
    letter(g, 'OR', x, y, 64, { align: 'center', col: '#fff3de', w: .16, shade: STYLE.paint.shade, progress: clamp((t - ws[i].s) / .15), seed });
  };
  edgeWord(3, 300, 800, 8);
  edgeWord(5, 540, 1180, 9);
  // Where the pull goes: toward the corner being sung, then back to the middle.
  const mid = { x: 540, y: 900 };
  const tgt = i => ({ x: lerp(mid.x, CORNERS[i].x, .55), y: lerp(mid.y, CORNERS[i].y, .55) });
  const seg = (ta, a, b) => { const p = spring(inv(ta, ta + .5, t), 2.2, 5); return { x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p) }; };
  let pos = mid;
  if (o.variant === 3) {
    const fastCheap = { x: lerp(CORNERS[0].x, CORNERS[2].x, .5) - 40, y: lerp(CORNERS[0].y, CORNERS[2].y, .5) + 20 };
    if (t > tF) pos = seg(tF, mid, tgt(0));
    if (t > tS) { const w = bump(t, tS, tS + .6); pos = { x: tgt(0).x - 60 * w, y: tgt(0).y + 40 * w }; }
    if (t > tC) pos = seg(tC, tgt(0), fastCheap);
    if (t > tC + .3) {
      const p = easeOutBack(inv(tC + .3, tC + .7, t), 2);
      g.save(); g.translate(pos.x + 150, pos.y - 120); g.scale(p, p);
      pen(g, 8, .8); g.fillStyle = '#2fbf6f'; circle(g, 0, 0, 44); g.fill(); nopen(g);
      g.strokeStyle = '#fff'; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(-18, 2); g.lineTo(-4, 16); g.lineTo(20, -14); g.stroke();
      g.restore();
    }
    if (t > tS) { const p = inv(tS, tS + .3, t); g.save(); g.translate(CORNERS[1].x + 90, CORNERS[1].y - 90); g.globalAlpha = p; g.strokeStyle = '#ff6a7a'; g.lineWidth = 14; g.lineCap = 'round'; line(g, -24, -24, 24, 24); g.stroke(); line(g, 24, -24, -24, 24); g.stroke(); g.restore(); }
  } else {
    if (t > tF) pos = seg(tF, mid, tgt(0));
    if (t > tS) pos = seg(tS, tgt(0), tgt(1));
    if (t > tC) pos = seg(tC, tgt(1), tgt(2));
    if (t > L + 2.5) pos = seg(L + 2.5, tgt(2), mid);
  }
  const px = pos.x, py = pos.y;
  const deferred = [];
  if (o.variant === 2) {
    // At the railing, each of them cheers for their own corner.
    const folks = [
      { x: 540, arm: -2.9, o: { skin: '#e8b48f', hairStyle: 'short', hair: '#1b1b24', top: '#2a2a36', glasses: 'round' }, i: 0 },
      { x: 190, arm: -2.5, o: { skin: '#c98d67', hairStyle: 'bun', hair: '#2a1c18', top: '#f2efe6' }, i: 1 },
      { x: 890, arm: -2.5, o: { skin: '#f6d0b1', hairStyle: 'beanie', hatColor: '#3a8f6a', top: '#e0495d' }, i: 2 },
    ];
    deferred.push(() => { for (const f of folks) if (appear[f.i] > 0) { const pp = spring(appear[f.i], 3, 6); person(g, f.x, 1790 - 60 * pp, { s: 96, ...f.o, eyes: 'happy', brow: 'up', armR: f.arm + Math.sin(t * 8 + f.x) * .2, armL: f.i === 0 ? -f.arm : .3, mouth: .5 }); } });
  }
  const lean = (px - mid.x) / 800;
  g.save(); pen(g, 8, .8);
  g.fillStyle = rgba(C.violet, .35); g.ink = null; ellipse(g, px, py + 12, 150, 34); g.fill();
  pen(g, 8, .8); g.fillStyle = '#c9bdf2'; ellipse(g, px, py + 8, 110, 26); g.fill();
  g.restore();
  const shrug = t > L + 2.55 && o.variant !== 3;
  const pleased = o.variant === 3 && t > tC;
  clawd(g, px, py, { s: 190, lean: lean * .6, eyes: pleased ? 'happy' : shrug ? 'worried' : 'wide', look: [lean * 2, -.4], armL: pleased ? -1.3 : shrug ? -.9 : -.3 + lean, armR: pleased ? -1.3 : shrug ? -.9 : -.3 - lean, mouth: clamp(c.K.vocal(t)), squash: shrug ? .06 : 0, blush: pleased ? 1 : 0 });
  railing(g, t, 1600);
  deferred.forEach(f => f());
}

// ---------------------------------------------------------------- WOW FOR A WEEK / BUILT TO KEEP
// WOW written in the sky in sparks, fading with the smoke; KEEP set by the lighthouse.
function sparkWord(g, t, t0, str, x, y, size, fade) {
  if (t < t0) return;
  const p = clamp((t - t0) / .45);
  g.save(); g.globalAlpha *= fade;
  letter(g, str, x, y, size, { align: 'center', col: '#ffe6a0', w: .13, shade: { col: 'rgba(255,90,160,.55)', dx: .03, dy: .04 }, progress: easeOut(p), seed: 17 });
  const sk = skeleton(str, x, y, size, { align: 'center', w: .13, step: size * .1, seed: 17 });
  for (let k = 0; k < sk.pts.length; k++) {
    if (k / sk.pts.length > p) break;
    const [sx, sy] = sk.pts[k];
    const tw = rnd(k + INK.boil * 71, 5) > .5;
    if (tw) { g.fillStyle = rgba('#fff8e0', .9); star(g, sx, sy, size * .05, size * .014, 4, 0); g.fill(); }
  }
  g.restore();
}

export function wowKeepShot(g, t, c, o) {
  const L = o.line;
  const ws = wordTimes(L);
  const tWow = ws[0].s, tWeek = ws[3].s, tBuilt = ws[5].s, tKeep = ws[7].s;
  const hz = seaNight(g, t, { hz: 1260, moon: false, refl: [{ x: 860, col: '#fff3c4', w: 26, a: .45 }, { x: 250, col: C.pink, w: 40, a: .4 * clamp(1 - (t - tWow) / 2.5) }] });
  const rocks = () => { g.save(); pen(g, 9, .8); g.fillStyle = '#1c1030'; g.beginPath(); g.moveTo(680, hz + 60); g.quadraticCurveTo(740, hz - 40, 840, hz - 10); g.quadraticCurveTo(940, hz - 60, 1040, hz); g.quadraticCurveTo(1080, hz + 20, 1100, hz + 60); g.closePath(); g.fill(); g.restore(); };
  const keepWords = (lit) => {
    sing(g, t, L, { from: 4, rows: [{ text: 'or built to', x: 330, y: 1130, size: 66 }, { text: 'keep?', x: 340, y: 1300, size: 170 }], emph: { keep: { col: lit ? '#fff3c4' : '#c9c0e0' } } });
  };
  if (o.variant === 3) {
    // Final chorus: the only wow wanted is a flame for a new best, and nothing needs to stand for
    // a century, so the lighthouse can sleep.
    const rise = inv(tWow - .5, tWow, t);
    if (rise < 1) glow(g, 330, lerp(hz, 520, easeOut(rise)), 30, C.gold, .9);
    if (t > tWow) flame(g, 330, 640, 330 * easeOutBack(clamp((t - tWow) / .45), 1.6), t);
    lighthouse(g, t, 870, hz + 40, 900, { beamA: 0, on: .08, beamLen: 0 });
    rocks();
    if (t > tKeep - .2) { const zp = inv(tKeep - .2, tKeep + .6, t); for (let k = 0; k < 3; k++) letter(g, 'Z', 900 + k * 40, 380 - k * 50 - zp * 40, 46 + k * 12, { col: '#e8e0ff', w: .14, alpha: zp * (1 - zp * .5), seed: k }); }
    railing(g, t, 1600);
    clawd(g, 540, 1600, { s: 210, look: [t > tBuilt ? 1 : -1, -.6], eyes: 'happy', armL: t < tWeek ? -1.3 : -.2, armR: -.2, mouth: clamp(c.K.vocal(t)), blush: 1 });
    sing(g, t, L, { rows: [{ text: 'wow', x: 330, y: 830, size: 150 }, { text: 'for a week,', x: 330, y: 930, size: 62 }], emph: { wow: { col: '#ffb24a' } } });
    keepWords(false);
    return;
  }
  if (t > tWow - .6) {
    const rise = inv(tWow - .6, tWow, t);
    if (rise < 1) { const y = lerp(hz, 420, easeOut(rise)); glow(g, 260, y, 30, C.gold, .9); g.save(); g.strokeStyle = rgba(C.gold, .6); g.lineWidth = 3; line(g, 260, y, 260, y + 90); g.stroke(); g.restore(); }
    firework(g, t, tWow, 300, 440, { color: C.pink, color2: C.gold, n: 110, speed: 520, life: 2.6, r: 360, seed: 11 });
    firework(g, t, tWow + .18, 180, 330, { color: C.cyan, color2: '#ffffff', n: 70, speed: 380, life: 2.3, seed: 12 });
    firework(g, t, tWow + .32, 360, 300, { color: C.gold, color2: C.coral, n: 70, speed: 400, life: 2.2, seed: 13 });
    const smoke = inv(tWeek - .2, tWeek + 1.2, t);
    if (smoke > 0) for (let i = 0; i < 7; i++) glow(g, 180 + i * 30 + Math.sin(t + i) * 10, 360 + Math.sin(i * 2) * 60 - smoke * 40, 90 + i * 8, '#8a7fae', .35 * smoke);
  }
  const beamOn = smooth(inv(tBuilt - .1, tKeep + .1, t));
  lighthouse(g, t, 870, hz + 40, 900, { beamA: t * .7 + .6, on: .25 + .75 * beamOn, beamLen: 1300 });
  rocks();
  railing(g, t, 1600);
  const lookR = t > tBuilt ? 1 : -1;
  clawd(g, 540, 1600, { s: 210, look: [lookR, -.6], eyes: t < tWeek ? 'star' : 'open', armL: t < tWeek ? -1.2 : -.2, armR: t > tKeep ? -1.1 : -.2, mouth: clamp(c.K.vocal(t)) });
  if (o.variant === 2) {
    person(g, 150, 1760, { s: 105, skin: '#e8b48f', hairStyle: 'short', hair: '#1b1b24', top: '#1a1a22', glasses: 'round', eyes: 'star', armL: -2.6, armR: -2.6, mouth: .7, look: [-.3, -1] });
    person(g, 930, 1760, { s: 105, skin: '#c98d67', hairStyle: 'bun', top: '#f2efe6', eyes: 'happy', armR: -2.2, look: [.3, -1] });
  }
  // WOW in sparks, and FOR A WEEK fading as the smoke drifts off.
  const fadeWeek = 1 - smooth(inv(tBuilt + .2, tKeep + .6, t)) * .65;
  sparkWord(g, t, tWow, 'WOW', 330, 700, 220, fadeWeek);
  sing(g, t, L, { from: 1, rows: [{ text: 'for a week,', x: 330, y: 830, size: 66, alpha: fadeWeek }] });
  keepWords(beamOn > .5);
}

// ---------------------------------------------------------------- SHIP IT NOW / POLISH IT SLOW
export function shipShot(g, t, c, o) {
  const L = o.line;
  const ws = wordTimes(L);
  const tShip = ws[0].s, tNow = ws[2].s;
  const hz = seaNight(g, t, { hz: 1000, moonX: 540, moonY: 800 });
  const go = easeIn(inv(tNow - .1, tNow + 1.2, t));
  const bx = lerp(560, 540, go), by = lerp(1520, hz + 30, Math.pow(go, .6));
  const s = lerp(1, .12, Math.pow(go, .5));
  // The wake: two lines of foam opening out behind the boat, on the water only.
  if (go > .04) {
    g.save(); g.ink = null;
    g.beginPath(); g.rect(0, hz, W, 1640 - hz); g.clip();
    g.strokeStyle = rgba('#e6f4ff', .55 * clamp(go * 4)); g.lineWidth = 8 * s + 2; g.lineCap = 'round';
    const len = lerp(80, 700, Math.pow(go, .5));
    for (const side of [-1, 1]) { g.beginPath(); g.moveTo(bx + side * 20 * s, by + 12 * s); g.quadraticCurveTo(bx + side * len * .25, by + len * .5, bx + side * len * .55, by + len); g.stroke(); }
    g.restore();
  }
  if (go > .02 && go < .9) { g.save(); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; g.strokeStyle = rgba('#ffffff', .35); g.lineWidth = 3; line(g, bx + Math.cos(a) * 200 * s + Math.cos(a) * 60, by - 100 * s + Math.sin(a) * 140 * s, bx + Math.cos(a) * 420 * s, by - 100 * s + Math.sin(a) * 300 * s); g.stroke(); } g.restore(); }
  paperBoat(g, bx, by, 700 * s, Math.sin(t * 6) * .04, o.flag || 'v1', t, ws);
  g.save(); g.ink = null;
  g.fillStyle = vgrad(g, 1640, H, [[0, '#4a2f4f'], [1, '#170b1e']]);
  poly(g, [[0, 1700], [W, 1640], [W, H], [0, H]]); g.fill();
  g.restore();
  const pusher = o.pusher || 'clawd';
  if (pusher === 'clawd') clawd(g, 330, 1760, { s: 220, armR: t > tNow ? -.2 : .1, armL: -.3, eyes: t > tNow ? 'happy' : 'open', look: [.6, -.6] });
  else if (pusher === 'hand') { const pp = easeOut(inv(tNow - .5, tNow, t)); hand(g, lerp(640, 600, pp), lerp(1800, 1580, pp) + (t > tNow ? (t - tNow) * 200 : 0), 250, -.1, 'open', { sleeveCol: '#5b6cff' }); clawd(g, 880, 1780, { s: 190, eyes: 'happy', armR: -1.3, armL: -1.3, blush: 1 }); }
  else person(g, 330, 1820, { s: 115, ...o.pusherO, armR: -1.4, eyes: 'happy', mouth: .6 });
  // NOW slams in over the sea as the boat takes off.
  sing(g, t, L, { from: 2, rows: [{ text: 'now,', y: 470, size: 230 }], emph: { now: { col: GOLD } }, speed: 3 });
  // In the final chorus there's no one polishing: the whole line plays out here.
  if (o.whole) sing(g, t, L, { from: 3, rows: [{ text: 'or polish it', y: 620, size: 70 }, { text: 'slow?', y: 760, size: 110 }], emph: { 'slow': { speed: .3 } } });
}
// A paper boat; SHIP IT is written on its sail as it's sung.
function paperBoat(g, x, y, s, rot, flag, t, ws) {
  g.save(); g.translate(x, y); g.rotate(rot);
  glow(g, 0, -s * .15, s * .8, '#fff3dc', .3);
  pen(g, Math.max(1.4, s / 70), .8);
  g.fillStyle = '#e6dfd0'; poly(g, [[-s * .5, -s * .12], [s * .5, -s * .12], [s * .34, s * .1], [-s * .34, s * .1]]); g.fill();
  g.fillStyle = '#fbf7ef'; poly(g, [[-s * .3, -s * .12], [0, -s * .6], [s * .3, -s * .12]]); g.fill();
  g.fillStyle = '#d8d0c0'; poly(g, [[0, -s * .6], [s * .3, -s * .12], [s * .08, -s * .12]]); g.fill();
  g.strokeStyle = '#3a2e52'; g.lineWidth = s * .012; line(g, 0, -s * .6, 0, -s * .92); g.stroke();
  g.fillStyle = C.pink; poly(g, [[0, -s * .92], [s * .26, -s * .84], [0, -s * .76]]); g.fill();
  g.restore();
  g.save(); g.translate(x, y); g.rotate(rot);
  if (s > 60) letter(g, flag, s * .09, -s * .8, s * .07, { align: 'center', col: '#fff', w: .15, seed: 3 });
  // The sail's lettering, in ink, as if written on the paper before it was folded.
  if (ws && t >= ws[0].s && s > 40) {
    letter(g, 'SHIP', -s * .075, -s * .33, s * .11, { align: 'center', col: '#2b1f3c', w: .17, progress: clamp((t - ws[0].s) / .2), seed: 41 });
    if (t >= ws[1].s) letter(g, 'IT', -s * .04, -s * .185, s * .11, { align: 'center', col: '#2b1f3c', w: .16, progress: clamp((t - ws[1].s) / .15), seed: 42 });
  }
  g.restore();
}

export function polishShot(g, t, c, o) {
  const L = o.line;
  const ws = wordTimes(L);
  g.save(); g.ink = null;
  g.fillStyle = vgrad(g, 0, H, [[0, '#1f122e'], [.6, '#3e2338'], [1, '#170b18']]);
  g.fillRect(0, 0, W, H);
  g.restore();
  glow(g, 540, 800, 850, C.amber, .45);
  g.save();
  g.strokeStyle = '#2a1a24'; g.lineWidth = 5; line(g, 540, 0, 540, 150); g.stroke();
  pen(g, 9, .8); g.fillStyle = '#4a2a38'; poly(g, [[440, 210], [640, 210], [590, 140], [490, 140]]); g.fill();
  g.restore();
  glow(g, 540, 240, 260, C.amber, .9);
  const who = o.who || 'muse';
  if (who === 'muse') muse(g, 540, 1250, { s: 290, t, eyes: 'happy', look: [0, 1] });
  else person(g, 540, 1250, { s: 165, ...o.whoO, eyes: 'happy', look: [0, 1], armR: -.9, armL: -.9 });
  g.save(); g.ink = null;
  g.fillStyle = '#6e4430'; g.fillRect(0, 1240, W, H - 1240);
  g.fillStyle = '#8a5a3c'; g.fillRect(0, 1240, W, 16);
  g.strokeStyle = 'rgba(40,20,10,.4)'; g.lineWidth = 3; for (let i = 0; i < 6; i++) { line(g, 0, 1300 + i * 110 + (i % 2) * 20, W, 1310 + i * 110); g.stroke(); }
  g.restore();
  const bx = 520, by = 1460;
  g.save(); g.translate(bx, by); g.rotate(-.08);
  pen(g, 8, .8);
  g.fillStyle = rgba('#cfeee6', .32); rr(g, -330, -150, 560, 300, 150); g.fill();
  rr(g, 230, -60, 120, 120, 40); g.fill();
  g.fillStyle = '#8a5a3a'; rr(g, 330, -48, 50, 96, 12); g.fill();
  g.fillStyle = '#6a3a26'; poly(g, [[-230, 60], [110, 60], [70, 110], [-190, 110]]); g.fill();
  g.fillStyle = '#fbf3e4'; poly(g, [[-120, 50], [-120, -110], [-10, 50]]); g.fill(); poly(g, [[-20, 50], [-20, -90], [70, 50]]); g.fill();
  g.fillStyle = C.pink; poly(g, [[-120, -110], [-80, -100], [-120, -90]]); g.fill();
  nopen(g);
  g.strokeStyle = rgba('#ffffff', .6); g.lineWidth = 9; g.beginPath(); g.arc(-80, -40, 150, Math.PI * 1.1, Math.PI * 1.4); g.stroke();
  g.restore();
  const pol = inv(L + 1, L + 2.8, t);
  for (let i = 0; i < 5; i++) { const p = (t * .4 + i * .2) % 1; const gx = 250 + p * 480, gy = by - 110 + Math.sin(p * Math.PI) * -40; g.save(); g.ink = null; g.fillStyle = rgba('#ffffff', .9 * Math.sin(p * Math.PI) * (.4 + pol)); star(g, gx, gy, 18, 4, 4, 0); g.fill(); g.restore(); }
  const wipe = Math.sin(t * 2.2);
  g.save(); g.translate(520 + wipe * 170, by - 150 + Math.cos(t * 2.2) * 18); g.rotate(wipe * .2);
  pen(g, 8, .8); g.fillStyle = '#e0495d'; rr(g, -80, -40, 160, 80, 20); g.fill();
  g.restore();
  // SLOW is lettered slowly, the way the polishing goes.
  sing(g, t, L, { from: 3, rows: [{ text: 'or polish it', y: 470, size: 84 }, { text: 'slow?', y: 660, size: 170 }], emph: { slow: { speed: .28, col: '#ffe0a8' } } });
}

// ---------------------------------------------------------------- DOES WHAT THEY NEED / STEALS THE SHOW
// A headline on a strip of newspaper, like the paper the chips come wrapped in.
function headline(g, t, L, x, y) {
  const ws = L.lead;
  if (t < ws[0].s - .05) return;
  const p = easeOutBack(inv(ws[0].s - .05, ws[0].s + .2, t), 1.4);
  g.save(); g.translate(x, y); g.rotate(-.03); g.scale(1, p);
  pen(g, 9, .8);
  g.fillStyle = '#efe9dc'; poly(g, [[-500, -150], [496, -162], [504, 120], [-508, 132]]); g.fill();
  nopen(g);
  g.fillStyle = 'rgba(40,34,50,.2)'; for (let i = 0; i < 9; i++) g.fillRect(-470 + (i % 3) * 320, 64 + Math.floor(i / 3) * 16, 290, 6);
  g.fillStyle = '#2b1f3c'; g.fillRect(-470, -128, 940, 5);
  g.restore();
  g.save(); g.translate(x, y); g.rotate(-.03);
  sing(g, t, L, { rows: [{ text: 'Does what they', x: 0, y: -52, size: 70 }, { text: 'need,', x: 0, y: 46, size: 92 }], style: 'ink', o: { shade: null }, maxW: 900 });
  g.restore();
}

export function needShot(g, t, c, o) {
  const hz = seaNight(g, t, { hz: 1000, moonX: 860, moonY: 600 });
  railing(g, t, 1260);
  const L = o.line;
  const give = easeOutBack(inv(L + .05, L + .45, t), 1.6);
  seagull(g, t, 700, 1260, 3.4);
  const cone = (g2, u) => {
    g2.save(); g2.rotate(.3);
    pen(g2, u, .6);
    for (let i = 0; i < 7; i++) { g2.fillStyle = '#ffd36b'; rr(g2, u * (.2 + i * .25), -u * (1.6 + (i % 3) * .3), u * .28, u * 1.4, u * .1); g2.fill(); }
    g2.fillStyle = '#efe9dc'; poly(g2, [[0, -u * .6], [u * 2.2, -u * .9], [u * 1.1, u * 1.6]]); g2.fill();
    nopen(g2); g2.fillStyle = 'rgba(40,34,50,.3)'; for (let i = 0; i < 4; i++) g2.fillRect(u * .5, -u * .4 + i * u * .25, u * 1.1, u * .08);
    g2.restore();
  };
  clawd(g, 330, 1620, { s: 310, armR: lerp(.3, -.5, give), extR: lerp(1, 2.2, give), hold: cone, eyes: 'happy', look: [1, -.3], blush: .8 });
  if (t > L + .5) for (let i = 0; i < 3; i++) { const p = inv(L + .5 + i * .15, L + 1.3 + i * .15, t); if (p <= 0 || p >= 1) continue; g.save(); g.globalAlpha = 1 - p; pen(g, 5, .6); g.fillStyle = C.pink; heart(g, 790 + i * 40, 1000 - p * 140, 44); g.fill(); g.restore(); }
  headline(g, t, lineNear(L), 540, 400);
}

// Chorus 2: for someone who can't see the screen, what they need is a phone that talks.
export function needShot2(g, t, c, o) {
  const L = o.line;
  seaNight(g, t, { hz: 900, moonX: 180, moonY: 560 });
  railing(g, t, 1180);
  const tNeed = onset(L, 3);
  guideDog(g, 730, 1530, 320, t);
  g.save(); g.strokeStyle = '#f4f1ea'; g.lineWidth = 12; line(g, 170, 1720, 300, 1060); g.stroke(); g.strokeStyle = '#e0304a'; line(g, 170, 1720, 190, 1620); g.stroke(); g.restore();
  person(g, 400, 1740, { s: 175, ...(o.personO || {}), armR: -2.9, armLenR: .8, eyes: 'open', mouth: t > tNeed + .2 ? .2 : 0, extra: (g2, u, hy, hr) => { g2.fillStyle = '#fff'; circle(g2, hr * 1.02, hy + u * .6, u * .8); g2.fill(); } });
  const cx = 540, cy = 1060;
  g.save(); g.ink = null;
  for (let k = 0; k < 4; k++) { const p = ((t * .9) + k * .25) % 1; g.strokeStyle = rgba(C.cyan, (1 - p) * .8); g.lineWidth = 7; g.beginPath(); g.arc(cx - 60, cy + 50, 40 + p * 260, -1.1, .3); g.stroke(); }
  g.restore();
  const sp = inv(L, L + .3, t);
  g.save(); g.globalAlpha = sp;
  pen(g, 8, .8); g.fillStyle = rgba('#e8fbff', .97); rr(g, cx - 20, cy - 150, 460, 150, 40); g.fill(); nopen(g);
  g.fillStyle = '#123'; g.font = '700 42px Bricolage'; g.textAlign = 'left'; g.textBaseline = 'middle';
  g.fillText('Bus in 2 minutes'.slice(0, Math.floor((t - L) * 26)), cx + 20, cy - 98);
  g.fillStyle = C.cyan; for (let k = 0; k < 18; k++) { const h2 = 8 + Math.abs(Math.sin(t * 20 + k * .9)) * 30; rr(g, cx + 20 + k * 22, cy - 50 - h2 / 2, 12, h2, 4); g.fill(); }
  g.restore();
  headline(g, t, lineNear(L), 540, 400);
}

export function showShot(g, t, c, o) {
  const K = c.K;
  pierWide(g, t, K, { seagull: t < o.boom + .25 ? { x: 610, y: 1560, s: 1.6 } : null, energy: 1.2, fw0: o.boom, fwEvery: 1, crowd: o.crowd, dawn: o.dawn || 0 });
  const bt = t - o.boom;
  if (bt > 0) {
    for (let i = 0; i < 6; i++) firework(g, t, o.boom + i * .12, 150 + (i * 173) % 800, 250 + (i * 97) % 400, { color: [C.pink, C.cyan, C.gold, C.violet, C.lime, C.coral][i], color2: '#ffffff', n: 90, speed: 480, life: 2.4, seed: 50 + i });
    confetti(g, t, o.boom, 540, 1000, { n: 160, spread: 2.6, speed: 1800, seed: 61, life: 3.2, size: 18 });
    streamers(g, t, o.boom + .05, 540, 1050, { n: 12, spread: 2.2, speed: 1900, seed: 62, life: 3 });
    if (bt < 1.6 && !o.crowd) { const p = bt / 1.6; g.save(); g.translate(lerp(610, 1200, p), lerp(1500, 600, easeOut(p))); g.rotate(-.5); pen(g, 5, .6); g.fillStyle = '#f3f1f6'; ellipse(g, 0, 0, 40, 18); g.fill(); const fl = Math.sin(t * 30) * 30; g.beginPath(); g.moveTo(-10, 0); g.lineTo(-40, -40 - fl); g.lineTo(20, -6); g.fill(); g.fillStyle = '#ffd36b'; g.fillRect(42, -4, 30, 8); g.restore(); }
  }
  // OR STEALS THE small; SHOW? in bulbs, the biggest thing on the pier.
  const L = lineNear(o.line);
  sing(g, t, L, { from: 4, rows: [{ text: 'or steals the', y: 1170, size: 76 }] });
  const tShow = L.lead[7].s;
  if (t >= tShow - .02) {
    const lit = t < tShow + .05 ? 1 : t < tShow + .09 ? .3 : 1;
    bulbWord(g, 'SHOW?', 540, 1470, 230 * easeOutBack(clamp((t - tShow) / .25), 1.6), { t, on: lit, face: '#ff4a6e', w: .21, chase: 6, seed: 55 });
  }
}
