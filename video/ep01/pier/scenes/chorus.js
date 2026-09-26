// The chorus, three times over. The same questions each time; what answers them changes.
// Chorus 1: nobody is there but a seagull. Chorus 2: the pier is full of the people from verse 2,
// each pulling a different way. Final chorus (in final.js): the brief answers every question.
import { W, H, C, TAU, clamp, lerp, inv, smooth, easeOut, easeIn, easeOutBack, spring, bump, rnd, rr, circle, ellipse, line, poly, star, heart, glow, bulb, text, vgrad, rgrad, lgrad, rgba, mix, mixHex, shade, firework, confetti, streamers } from '../kit.js';
import { nightSky, sea, reflection, lighthouse, ferrisWheel, beams, haze, town, moon } from '../world.js';
import { clawd, muse, molty, grok, blossom, person } from '../cast.js';
import { hand, guideDog } from '../props.js';
import { band, blinkAt } from '../band.js';
import { pierWide, seagull, fireworks } from './pier.js';
import { hookSign, backingScript, wordTimes, bandMedium, clawdClose } from './stage.js';

const onset = (lineT0, i) => wordTimes(lineT0)[i]?.s ?? lineT0;

// ---------------------------------------------------------------- the hook lines
export function hookWide(g, t, c, o) {
  pierWide(g, t, c.K, { seagull: o.seagull, crowd: o.crowd, energy: 1, back: 0, fw0: o.ignite !== undefined ? o.ignite + .6 : o.line - .2, dawn: o.dawn || 0, ignite: o.ignite });
  hookSign(g, t, o.line, o.word, 540, 330, .95);
  backingScript(g, t, o.line, 540, 820, 58);
}

export function hookBand(g, t, c, o) {
  bandMedium(g, t, c.K, { back: o.back ?? 0, crowd: o.crowd, people: o.people, dawn: o.dawn || 0 });
  hookSign(g, t, o.line, o.word, 540, 470, .8);
  backingScript(g, t, o.line, 540, 800, 62);
}

export function hookClose(g, t, c, o) {
  clawdClose(g, t, c.K, { crowd: o.crowd, dawn: o.dawn || 0 });
  hookSign(g, t, o.line, o.word, 540, 380, .85);
  backingScript(g, t, o.line, 540, 740, 62);
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
  g.fillStyle = vgrad(g, y, H, [[0, '#3a2342'], [1, '#12091c']]);
  g.fillRect(0, y + 60, W, H - y);
  g.fillStyle = '#1a1024';
  g.fillRect(0, y, W, 12);
  for (let x = 20; x < W; x += 54) g.fillRect(x, y, 8, 64);
  for (let i = 0; i < 11; i++) { const x = 50 + i * 100; bulb(g, x, y - 6, 6, i % 2 ? C.bulb : '#ffe2b8', (o.on ?? 1) * (.6 + .4 * (Math.sin(i - t * 4) > 0 ? 1 : 0))); }
}

// ---------------------------------------------------------------- FAST / STURDY / CHEAP
const CORNERS = [
  { key: 'FAST', x: 540, y: 480, col: C.cyan, icon: 'bolt' },
  { key: 'STURDY', x: 215, y: 1080, col: '#9fb4ff', icon: 'anchor' },
  { key: 'CHEAP', x: 865, y: 1080, col: C.gold, icon: 'coin' },
];
function icon(g, kind, x, y, s, col) {
  g.fillStyle = col; g.strokeStyle = col; g.lineCap = 'round'; g.lineJoin = 'round';
  if (kind === 'bolt') { poly(g, [[x + s * .15, y - s * .6], [x - s * .35, y + s * .08], [x - s * .02, y + s * .08], [x - s * .15, y + s * .6], [x + s * .35, y - s * .1], [x + s * .02, y - s * .1]]); g.fill(); }
  if (kind === 'anchor') { g.lineWidth = s * .12; circle(g, x, y - s * .45, s * .12); g.stroke(); line(g, x, y - s * .33, x, y + s * .5); g.stroke(); line(g, x - s * .25, y - s * .15, x + s * .25, y - s * .15); g.stroke(); g.beginPath(); g.arc(x, y + s * .05, s * .45, Math.PI * .15, Math.PI * .85); g.stroke(); }
  if (kind === 'coin') { g.lineWidth = s * .08; circle(g, x, y, s * .45); g.stroke(); g.font = `800 ${s * .55}px Bricolage`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('£', x, y + s * .03); }
  if (kind === 'fire') { g.beginPath(); g.moveTo(x, y - s * .55); g.quadraticCurveTo(x + s * .45, y, x, y + s * .45); g.quadraticCurveTo(x - s * .45, y, x, y - s * .55); g.fill(); }
  if (kind === 'tower') { poly(g, [[x - s * .2, y + s * .5], [x + s * .2, y + s * .5], [x + s * .12, y - s * .35], [x - s * .12, y - s * .35]]); g.fill(); g.fillRect(x - s * .18, y - s * .5, s * .36, s * .12); }
}
function cornerSign(g, t, k, appear, focus) {
  const s = 118 * spring(appear, 3, 6) * (1 + .16 * focus);
  if (s <= 1) return;
  const dim = .45 + .55 * Math.max(focus, appear > 0 ? .35 : 0);
  g.save(); g.translate(k.x, k.y);
  glow(g, 0, 0, s * 2.6, k.col, .35 * dim);
  g.fillStyle = vgrad(g, -s, s, [[0, '#2a1a4a'], [1, '#120a24']]);
  circle(g, 0, 0, s); g.fill();
  const nb = 22;
  for (let i = 0; i < nb; i++) { const a = i / nb * TAU + t * .5; bulb(g, Math.cos(a) * s * .92, Math.sin(a) * s * .92, s * .045, i % 2 ? k.col : C.bulb, dim * (.5 + .5 * (Math.sin(i * 1.2 - t * 6) > 0 ? 1 : 0))); }
  g.globalAlpha = .4 + .6 * dim;
  icon(g, k.icon, 0, -s * .2, s * .75, mix(k.col, '#ffffff', .3));
  g.font = `800 ${s * .3}px Bricolage`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = '#fff8ee'; g.fillText(k.key, 0, s * .5);
  g.restore();
}
function edge(g, t, a, b, on) {
  if (on <= 0) return;
  const n = 14;
  for (let i = 1; i < n; i++) {
    const p = i / n;
    if (p > on) break;
    bulb(g, lerp(a.x, b.x, p), lerp(a.y, b.y, p), 4.5, C.bulb, .35 + .65 * (Math.sin(i - t * 6) > 0 ? 1 : .3));
  }
}

// variant: 1 (Clawd alone, pulled every way), 2 (the people each pull their own way)
export function triangleShot(g, t, c, o) {
  const L = o.line;
  const tF = onset(L, 0), tS = onset(L, 4), tC = onset(L, 6);
  const hz = seaNight(g, t, { hz: 1250, moonX: 150 });
  ferrisWheel(g, t, 1000, 700, 420, { rot: t * .05, on: .6 });
  g.fillStyle = rgba('#0a0620', .45); g.fillRect(0, 0, W, H);
  const appear = [inv(tF, tF + .45, t), inv(tS, tS + .45, t), inv(tC, tC + .45, t)];
  const cur = t < tS ? 0 : t < tC ? 1 : 2;
  const settle = inv(L + 2.5, L + 2.7, t);
  let focus = CORNERS.map((k, i) => appear[i] > 0 ? (i === cur ? 1 - settle : 0) : 0);
  if (o.variant === 3 && t > tC) focus = [1, 0, 1];
  if (o.variant === 3 && t > tS && t < tC) focus = [1, .2, 0];
  // Edges light as corners join.
  edge(g, t, CORNERS[0], CORNERS[1], appear[1] * 1.2);
  edge(g, t, CORNERS[1], CORNERS[2], appear[2] * 1.2);
  edge(g, t, CORNERS[2], CORNERS[0], appear[2] * 1.2);
  CORNERS.forEach((k, i) => cornerSign(g, t, k, appear[i], focus[i]));
  // Where the pull goes: toward the corner being sung, then back to the middle.
  const mid = { x: 540, y: 880 };
  const tgt = i => ({ x: lerp(mid.x, CORNERS[i].x, .62), y: lerp(mid.y, CORNERS[i].y, .62) });
  let px = mid.x, py = mid.y;
  const seg = (ta, a, b) => { const p = spring(inv(ta, ta + .5, t), 2.2, 5); return { x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p) }; };
  let pos = mid;
  if (o.variant === 3) {
    // Your answer: fast and cheap. Sturdy tugs, but it isn't needed; the puck settles on the
    // edge between the two that matter.
    const fastCheap = { x: lerp(CORNERS[0].x, CORNERS[2].x, .5) - 40, y: lerp(CORNERS[0].y, CORNERS[2].y, .5) + 20 };
    if (t > tF) pos = seg(tF, mid, tgt(0));
    if (t > tS) { const w = bump(t, tS, tS + .6); pos = { x: tgt(0).x - 60 * w, y: tgt(0).y + 40 * w }; }
    if (t > tC) pos = seg(tC, tgt(0), fastCheap);
    px = pos.x; py = pos.y;
    if (t > tC + .3) {
      const p = easeOutBack(inv(tC + .3, tC + .7, t), 2);
      g.save(); g.translate(px + 150, py - 120); g.scale(p, p);
      g.fillStyle = '#2fbf6f'; circle(g, 0, 0, 44); g.fill();
      g.strokeStyle = '#fff'; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(-18, 2); g.lineTo(-4, 16); g.lineTo(20, -14); g.stroke();
      g.restore();
    }
    if (t > tS) { const p = inv(tS, tS + .3, t); g.save(); g.translate(CORNERS[1].x + 90, CORNERS[1].y - 90); g.globalAlpha = p; g.strokeStyle = '#ff6a7a'; g.lineWidth = 12; g.lineCap = 'round'; line(g, -22, -22, 22, 22); g.stroke(); line(g, 22, -22, -22, 22); g.stroke(); g.restore(); }
  } else {
    if (t > tF) pos = seg(tF, mid, tgt(0));
    if (t > tS) pos = seg(tS, tgt(0), tgt(1));
    if (t > tC) pos = seg(tC, tgt(1), tgt(2));
    if (t > L + 2.5) pos = seg(L + 2.5, tgt(2), mid);
    px = pos.x; py = pos.y;
  }
  if (o.variant === 2) {
    // Each person stands by what they'd pick.
    const folks = [
      { x: 540, y: 700, o: { skin: '#e8b48f', hairStyle: 'short', hair: '#1b1b24', top: '#1a1a22', eyes: 'happy', glasses: 'round' }, i: 0 },
      { x: 215, y: 1300, o: { skin: '#c98d67', hairStyle: 'bun', hair: '#2a1c18', top: '#f2efe6', eyes: 'happy' }, i: 1 },
      { x: 865, y: 1300, o: { skin: '#f6d0b1', hairStyle: 'beanie', hatColor: '#3a8f6a', top: '#e0495d', eyes: 'happy' }, i: 2 },
    ];
    for (const f of folks) if (appear[f.i] > 0) person(g, f.x + (f.i === 0 ? 0 : 0), f.y, { s: 90 * spring(appear[f.i], 3, 6), ...f.o, armR: -2.4 + Math.sin(t * 8) * .2, mouth: .5 });
  }
  // The puck and Clawd, leaning into the pull.
  const lean = (px - mid.x) / 800;
  g.save(); g.globalCompositeOperation = 'lighter';
  g.fillStyle = rgrad(g, px, py + 10, 0, 130, [[0, rgba(C.violet, .6)], [1, rgba(C.violet, 0)]]);
  g.scale(1, .3); circle(g, px, (py + 10) / .3, 130); g.fill();
  g.restore();
  g.fillStyle = vgrad(g, py - 10, py + 30, [[0, '#d9ccff'], [1, '#6a55b0']]); ellipse(g, px, py + 8, 110, 26); g.fill();
  const shrug = t > L + 2.55 && o.variant !== 3;
  const pleased = o.variant === 3 && t > tC;
  clawd(g, px, py, { s: 200, lean: lean * .6, eyes: pleased ? 'happy' : shrug ? 'worried' : 'wide', look: [lean * 2, -.4], armL: pleased ? -1.3 : shrug ? -.9 : -.3 + lean, armR: pleased ? -1.3 : shrug ? -.9 : -.3 - lean, rim: C.cyan, mouth: clamp(c.K.vocal(t)), squash: shrug ? .06 : 0, blush: pleased ? 1 : 0 });
  railing(g, t, 1600);
}

// ---------------------------------------------------------------- WOW FOR A WEEK / BUILT TO KEEP
export function wowKeepShot(g, t, c, o) {
  const L = o.line;
  const tWow = onset(L, 0), tWeek = onset(L, 3), tKeep = onset(L, 7), tBuilt = onset(L, 5);
  const hz = seaNight(g, t, { hz: 1260, moon: false, refl: [{ x: 860, col: '#fff3c4', w: 26, a: .45 }, { x: 250, col: C.pink, w: 40, a: .4 * clamp(1 - (t - tWow) / 2.5) }] });
  // Final chorus: the only wow wanted is a flame for a new best, and nothing needs to stand for a
  // century, so the lighthouse can sleep.
  if (o.variant === 3) {
    const rise = inv(tWow - .5, tWow, t);
    if (rise < 1) { const y = lerp(hz, 520, easeOut(rise)); glow(g, 330, y, 30, C.gold, .8); }
    flameBurst(g, t, tWow, 330, 520);
    lighthouse(g, t, 830, hz + 40, 900, { beamA: 0, on: .08, beamLen: 0 });
    g.fillStyle = '#140c24';
    g.beginPath(); g.moveTo(640, hz + 60); g.quadraticCurveTo(700, hz - 40, 800, hz - 10); g.quadraticCurveTo(900, hz - 60, 1000, hz); g.quadraticCurveTo(1060, hz + 20, 1080, hz + 60); g.closePath(); g.fill();
    if (t > tKeep - .2) { const zp = inv(tKeep - .2, tKeep + .6, t); for (let k = 0; k < 3; k++) { g.save(); g.globalAlpha = zp * (1 - zp * .5); g.fillStyle = '#e8e0ff'; g.font = `800 ${46 + k * 12}px Bricolage`; g.fillText('z', 900 + k * 40, 380 - k * 50 - zp * 40); g.restore(); } }
    railing(g, t, 1560);
    clawd(g, 540, 1560, { s: 220, look: [t > tBuilt ? 1 : -1, -.6], eyes: 'happy', armL: t < tWeek ? -1.3 : -.2, armR: -.2, rim: C.coral, mouth: clamp(c.K.vocal(t)), blush: 1 });
    return;
  }
  // Left: the firework, gorgeous and brief.
  if (t > tWow - .6) {
    // The shell rises first.
    const rise = inv(tWow - .6, tWow, t);
    if (rise < 1) { const y = lerp(hz, 420, easeOut(rise)); glow(g, 260, y, 30, C.gold, .8); g.strokeStyle = rgba(C.gold, .5); g.lineWidth = 3; line(g, 260, y, 260, y + 90); g.stroke(); }
    firework(g, t, tWow, 260, 420, { color: C.pink, color2: C.gold, n: 110, speed: 520, life: 2.6, r: 360, seed: 11 });
    firework(g, t, tWow + .18, 180, 330, { color: C.cyan, color2: '#ffffff', n: 70, speed: 380, life: 2.3, seed: 12 });
    firework(g, t, tWow + .32, 360, 300, { color: C.gold, color2: C.coral, n: 70, speed: 400, life: 2.2, seed: 13 });
    // Smoke hanging after, "a week" later.
    const smoke = inv(tWeek - .2, tWeek + 1.2, t);
    if (smoke > 0) for (let i = 0; i < 8; i++) { g.fillStyle = rgba('#8a7fae', .12 * smoke); circle(g, 180 + i * 30 + Math.sin(t + i) * 10, 360 + Math.sin(i * 2) * 60 - smoke * 40, 70 + i * 6); g.fill(); }
    // The word, written in sparks.
    const wp = inv(tWow, tWow + .5, t), wf = 1 - inv(tWeek + .3, tWeek + 1, t);
    if (wp > 0 && wf > 0) {
      g.save(); g.globalAlpha = wf;
      g.font = `italic 800 170px Bricolage`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.shadowColor = C.pink; g.shadowBlur = 40 * g.getTransform().a;
      g.fillStyle = mix(C.gold, '#ffffff', .4);
      g.save(); g.beginPath(); g.rect(0, 0, 60 + wp * 480, H); g.clip();
      g.fillText('WOW', 270, 700);
      g.restore();
      g.restore();
    }
  }
  // Right: the lighthouse, steady for a hundred years.
  const beamOn = smooth(inv(tBuilt - .1, tKeep + .1, t));
  lighthouse(g, t, 830, hz + 40, 900, { beamA: t * .7 + .6, on: .25 + .75 * beamOn, beamLen: 1300 });
  // Rocks at its foot.
  g.fillStyle = '#140c24';
  g.beginPath(); g.moveTo(640, hz + 60); g.quadraticCurveTo(700, hz - 40, 800, hz - 10); g.quadraticCurveTo(900, hz - 60, 1000, hz); g.quadraticCurveTo(1060, hz + 20, 1080, hz + 60); g.closePath(); g.fill();
  if (beamOn > 0) {
    g.save(); g.globalAlpha = beamOn;
    g.font = `800 110px Bricolage`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = vgrad(g, 1340, 1420, [[0, '#f4efe6'], [1, '#b9b0a0']]);
    g.shadowColor = 'rgba(255,243,196,.7)'; g.shadowBlur = 24 * g.getTransform().a;
    g.fillText('KEEP', 830, 1380);
    g.restore();
  }
  railing(g, t, 1560);
  // Clawd on the rail, looking from one to the other.
  const lookR = t > tBuilt ? 1 : -1;
  clawd(g, 540, 1560, { s: 220, look: [lookR, -.6], eyes: t < tWeek ? 'star' : 'open', armL: t < tWeek ? -1.2 : -.2, armR: t > tKeep ? -1.1 : -.2, rim: t > tBuilt ? '#fff3c4' : C.pink, rimSide: lookR, mouth: clamp(c.K.vocal(t)) });
  if (o.variant === 2) {
    person(g, 170, 1720, { s: 110, skin: '#e8b48f', hairStyle: 'short', hair: '#1b1b24', top: '#1a1a22', glasses: 'round', eyes: 'star', armL: -2.6, armR: -2.6, mouth: .7, look: [-.3, -1] });
    person(g, 900, 1720, { s: 110, skin: '#c98d67', hairStyle: 'bun', top: '#f2efe6', eyes: 'happy', armR: -2.2, look: [.3, -1] });
  }
}

// A firework that bursts into the shape of a flame: the one bit of wow the brief asked for.
function flameBurst(g, t, t0, x, y) {
  const tau = t - t0;
  if (tau < 0 || tau > 2.6) return;
  const fade = 1 - smooth(inv(1.6, 2.6, tau));
  const grow = easeOut(clamp(tau / .45));
  if (tau < .3) glow(g, x, y, 380 * (1 + tau * 2), C.gold, (1 - tau / .3) * .8);
  // The burst blooms into a great 🔥 made of light, flickering, sparks flying off its edges.
  const sc = easeOutBack(clamp(tau / .5), 1.6);
  const flick = 1 + .04 * Math.sin(t * 23) + .03 * Math.sin(t * 37);
  glow(g, x, y, 380 * sc, '#ff8a3a', .55 * fade);
  glow(g, x, y + 40, 220 * sc, '#ffd060', .6 * fade);
  g.save();
  g.globalAlpha = fade;
  g.translate(x, y + 150 * sc); g.scale(sc * flick, sc / flick); g.rotate(Math.sin(t * 5) * .04);
  g.font = '420px Bricolage'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  // Colour emoji take their opacity from fillStyle, so it must be opaque.
  g.fillStyle = '#ffffff';
  g.fillText('🔥', 0, 0);
  g.restore();
  for (let i = 0; i < 40; i++) {
    const a = rnd(i, 111) * TAU, sp = 180 + 260 * rnd(i, 112);
    const life = (tau * 1.4 + rnd(i, 113)) % 1;
    const px = x + Math.cos(a) * sp * life * sc, py = y - 40 + Math.sin(a) * sp * life * .8 - life * 120;
    glow(g, px, py, 14, i % 2 ? '#ffd060' : '#ff6a2a', .8 * (1 - life) * fade);
  }
}

// ---------------------------------------------------------------- SHIP IT NOW / POLISH IT SLOW
export function shipShot(g, t, c, o) {
  const L = o.line;
  const tShip = onset(L, 0), tNow = onset(L, 2);
  const hz = seaNight(g, t, { hz: 1000, moonX: 540, moonY: 800 });
  // The boat launches and speeds off toward the moon, a glowing wake behind.
  const go = easeIn(inv(tNow - .1, tNow + 1.2, t));
  const bx = lerp(560, 540, go), by = lerp(1480, hz + 30, Math.pow(go, .6));
  const s = lerp(1, .12, Math.pow(go, .5));
  if (go > 0) {
    g.save(); g.globalCompositeOperation = 'lighter';
    g.strokeStyle = rgba('#cfe8ff', .5); g.lineWidth = 10 * s + 2;
    for (const side of [-1, 1]) { g.beginPath(); g.moveTo(bx, by + 10); g.quadraticCurveTo(bx + side * 80, (by + 1700) / 2, bx + side * 300, 1800); g.stroke(); }
    g.restore();
  }
  // Speed lines.
  if (go > .02 && go < .9) for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; g.strokeStyle = rgba('#ffffff', .25); g.lineWidth = 3; line(g, bx + Math.cos(a) * 200 * s + Math.cos(a) * 60, by - 100 * s + Math.sin(a) * 140 * s, bx + Math.cos(a) * 420 * s, by - 100 * s + Math.sin(a) * 300 * s); g.stroke(); }
  paperBoat(g, bx, by, 520 * s, Math.sin(t * 6) * .04, o.flag || 'v1');
  // The pier's end, and whoever pushed it off.
  g.fillStyle = vgrad(g, 1640, H, [[0, '#4a2f4f'], [1, '#150b1c']]);
  poly(g, [[0, 1700], [W, 1640], [W, H], [0, H]]); g.fill();
  const pusher = o.pusher || 'clawd';
  if (pusher === 'clawd') clawd(g, 330, 1740, { s: 230, armR: t > tNow ? -.2 : .1, armL: -.3, eyes: t > tNow ? 'happy' : 'open', look: [.6, -.6], rim: C.cyan });
  else if (pusher === 'hand') { const pp = easeOut(inv(tNow - .5, tNow, t)); hand(g, lerp(640, 600, pp), lerp(1800, 1580, pp) + (t > tNow ? (t - tNow) * 200 : 0), 260, -.1, 'open', { sleeveCol: '#5b6cff' }); clawd(g, 880, 1760, { s: 200, eyes: 'happy', armR: -1.3, armL: -1.3, rim: C.cyan, blush: 1 }); }
  else person(g, 330, 1800, { s: 120, ...o.pusherO, armR: -1.4, eyes: 'happy', mouth: .6 });
}
function paperBoat(g, x, y, s, rot, flag) {
  g.save(); g.translate(x, y); g.rotate(rot);
  glow(g, 0, -s * .15, s * .9, '#fff3dc', .25);
  g.fillStyle = '#e8e2d4'; poly(g, [[-s * .5, -s * .12], [s * .5, -s * .12], [s * .34, s * .1], [-s * .34, s * .1]]); g.fill();
  g.fillStyle = '#fbf7ef'; poly(g, [[-s * .3, -s * .12], [0, -s * .6], [s * .3, -s * .12]]); g.fill();
  g.fillStyle = '#d8d0c0'; poly(g, [[0, -s * .6], [s * .3, -s * .12], [s * .08, -s * .12]]); g.fill();
  g.strokeStyle = '#3a2e52'; g.lineWidth = s * .012; line(g, 0, -s * .6, 0, -s * .92); g.stroke();
  g.fillStyle = C.pink; poly(g, [[0, -s * .92], [s * .26, -s * .84], [0, -s * .76]]); g.fill();
  g.fillStyle = '#fff'; g.font = `800 ${s * .07}px Bricolage`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(flag, s * .09, -s * .84);
  g.restore();
}

export function polishShot(g, t, c, o) {
  const L = o.line;
  // Warm lamplight, slow and careful: a ship in a bottle, polished to a shine.
  g.fillStyle = vgrad(g, 0, H, [[0, '#1a0f2a'], [.6, '#3a2038'], [1, '#150b18']]);
  g.fillRect(0, 0, W, H);
  glow(g, 540, 800, 900, C.amber, .35);
  // A lamp overhead.
  g.strokeStyle = '#2a1a24'; g.lineWidth = 4; line(g, 540, 0, 540, 150); g.stroke();
  g.fillStyle = '#3a2230'; poly(g, [[440, 210], [640, 210], [590, 140], [490, 140]]); g.fill();
  glow(g, 540, 230, 300, C.amber, .7);
  // The polisher sits behind the table, looking down at the work.
  const who = o.who || 'muse';
  if (who === 'muse') muse(g, 540, 1250, { s: 290, t, eyes: 'happy', look: [0, 1], rim: C.amber });
  else person(g, 540, 1250, { s: 170, ...o.whoO, eyes: 'happy', look: [0, 1], armR: -.9, armL: -.9 });
  // Table.
  g.fillStyle = vgrad(g, 1240, H, [[0, '#7a4a30'], [.05, '#6a3f2a'], [1, '#2a160e']]); g.fillRect(0, 1240, W, H - 1240);
  g.fillStyle = 'rgba(255,200,140,.18)'; g.fillRect(0, 1240, W, 6);
  // The bottle, lying on the table in the lamplight, in front of them.
  const bx = 520, by = 1460;
  g.save(); g.translate(bx, by); g.rotate(-.08);
  g.fillStyle = rgba('#bfe8e0', .18); rr(g, -330, -150, 560, 300, 150); g.fill();
  rr(g, 230, -60, 120, 120, 40); g.fill();
  g.fillStyle = '#8a5a3a'; rr(g, 330, -48, 50, 96, 12); g.fill();
  // Ship inside.
  g.fillStyle = '#5a2f22'; poly(g, [[-230, 60], [110, 60], [70, 110], [-190, 110]]); g.fill();
  g.fillStyle = '#fbf3e4'; poly(g, [[-120, 50], [-120, -110], [-10, 50]]); g.fill(); poly(g, [[-20, 50], [-20, -90], [70, 50]]); g.fill();
  g.fillStyle = C.pink; poly(g, [[-120, -110], [-80, -100], [-120, -90]]); g.fill();
  g.strokeStyle = rgba('#ffffff', .5); g.lineWidth = 8; g.beginPath(); g.arc(-80, -40, 150, Math.PI * 1.1, Math.PI * 1.4); g.stroke();
  g.restore();
  // Glints travel along the glass as it's polished.
  const pol = inv(L + 1, L + 2.8, t);
  for (let i = 0; i < 5; i++) { const p = (t * .4 + i * .2) % 1; const gx = 250 + p * 480, gy = by - 110 + Math.sin(p * Math.PI) * -40; glow(g, gx, gy, 40, '#ffffff', .8 * Math.sin(p * Math.PI) * (.4 + pol)); star(g, gx, gy, 16, 5, 4, 0); g.fillStyle = rgba('#ffffff', .8 * Math.sin(p * Math.PI)); g.fill(); }
  // The cloth, slow careful circles.
  const wipe = Math.sin(t * 2.2);
  g.fillStyle = '#e0495d';
  g.save(); g.translate(520 + wipe * 170, by - 150 + Math.cos(t * 2.2) * 18); g.rotate(wipe * .2);
  rr(g, -80, -40, 160, 80, 20); g.fill();
  g.fillStyle = 'rgba(255,255,255,.3)'; rr(g, -60, -30, 70, 20, 8); g.fill();
  g.restore();
}

// ---------------------------------------------------------------- DOES WHAT THEY NEED / STEALS THE SHOW
export function needShot(g, t, c, o) {
  // Chorus 1: the only one here is a seagull, and a cone of chips is all it needs.
  const hz = seaNight(g, t, { hz: 1000, moonX: 860, moonY: 600 });
  railing(g, t, 1200);
  const L = o.line;
  const give = easeOutBack(inv(L + .05, L + .45, t), 1.6);
  seagull(g, t, 700, 1200, 3.4);
  // Clawd holds out a paper cone of chips.
  const cone = (g2, u) => {
    g2.save(); g2.rotate(.3);
    for (let i = 0; i < 7; i++) { g2.fillStyle = '#ffd36b'; rr(g2, u * (.2 + i * .25), -u * (1.6 + (i % 3) * .3), u * .28, u * 1.4, u * .1); g2.fill(); }
    g2.fillStyle = '#f4efe6'; poly(g2, [[0, -u * .6], [u * 2.2, -u * .9], [u * 1.1, u * 1.6]]); g2.fill();
    g2.fillStyle = '#3a6ad8'; g2.fillRect(u * .5, -u * .55, u * 1.3, u * .2);
    g2.restore();
  };
  clawd(g, 330, 1560, { s: 320, armR: lerp(.3, -.5, give), extR: lerp(1, 2.2, give), hold: cone, eyes: 'happy', look: [1, -.3], rim: C.cyan, blush: .8 });
  // Hearts from a happy gull.
  if (t > L + .5) for (let i = 0; i < 3; i++) { const p = inv(L + .5 + i * .15, L + 1.3 + i * .15, t); if (p <= 0 || p >= 1) continue; g.fillStyle = rgba(C.pink, 1 - p); heart(g, 790 + i * 40, 940 - p * 140, 44); g.fill(); }
}

// Chorus 2: for someone who can't see the screen, what they need is a phone that talks.
export function needShot2(g, t, c, o) {
  const L = o.line;
  seaNight(g, t, { hz: 900, moonX: 180, moonY: 560 });
  railing(g, t, 1120);
  const tNeed = onset(L, 3);
  // Guide dog.
  guideDog(g, 730, 1480, 330, t);
  g.strokeStyle = '#f4f1ea'; g.lineWidth = 12; line(g, 170, 1680, 300, 1000); g.stroke();
  g.strokeStyle = '#e0304a'; line(g, 170, 1680, 190, 1580); g.stroke();
  person(g, 400, 1700, { s: 180, ...(o.personO || {}), armR: -2.9, armLenR: .8, eyes: 'open', mouth: t > tNeed + .2 ? .2 : 0, extra: (g2, u, hy, hr) => { g2.fillStyle = '#fff'; circle(g2, hr * 1.02, hy + u * .6, u * .8); g2.fill(); } });
  const cx = 520, cy = 1000;
  for (let k = 0; k < 4; k++) { const p = ((t * .9) + k * .25) % 1; g.strokeStyle = rgba(C.cyan, (1 - p) * .8); g.lineWidth = 7; g.beginPath(); g.arc(cx - 60, cy + 50, 40 + p * 260, -1.1, .3); g.stroke(); }
  const sp = inv(L, L + .3, t);
  g.save(); g.globalAlpha = sp;
  g.fillStyle = rgba('#e8fbff', .96); rr(g, cx - 20, cy - 150, 460, 150, 40); g.fill();
  g.fillStyle = '#123'; g.font = '700 42px Bricolage'; g.textAlign = 'left'; g.textBaseline = 'middle';
  g.fillText('Bus in 2 minutes'.slice(0, Math.floor((t - L) * 26)), cx + 20, cy - 98);
  g.fillStyle = C.cyan; for (let k = 0; k < 18; k++) { const h2 = 8 + Math.abs(Math.sin(t * 20 + k * .9)) * 30; rr(g, cx + 20 + k * 22, cy - 50 - h2 / 2, 12, h2, 4); g.fill(); }
  g.restore();
}

export function showShot(g, t, c, o) {
  // …or the whole pier goes off.
  const K = c.K;
  pierWide(g, t, K, { seagull: t < o.boom + .25 ? { x: 610, y: 1560, s: 1.6 } : null, energy: 1.2, fw0: o.boom, fwEvery: 1, crowd: o.crowd, dawn: o.dawn || 0 });
  const bt = t - o.boom;
  if (bt > 0) {
    for (let i = 0; i < 6; i++) firework(g, t, o.boom + i * .12, 150 + (i * 173) % 800, 250 + (i * 97) % 400, { color: [C.pink, C.cyan, C.gold, C.violet, C.lime, C.coral][i], color2: '#ffffff', n: 90, speed: 480, life: 2.4, seed: 50 + i });
    confetti(g, t, o.boom, 540, 1000, { n: 160, spread: 2.6, speed: 1800, seed: 61, life: 3.2, size: 18 });
    streamers(g, t, o.boom + .05, 540, 1050, { n: 12, spread: 2.2, speed: 1900, seed: 62, life: 3 });
    // The gull bolts with a chip.
    if (bt < 1.6 && !o.crowd) { const p = bt / 1.6; g.save(); g.translate(lerp(610, 1200, p), lerp(1500, 600, easeOut(p))); g.rotate(-.5); g.fillStyle = '#f3f1f6'; ellipse(g, 0, 0, 40, 18); g.fill(); const fl = Math.sin(t * 30) * 30; g.beginPath(); g.moveTo(-10, 0); g.lineTo(-40, -40 - fl); g.lineTo(20, -6); g.fill(); g.fillStyle = '#ffd36b'; g.fillRect(42, -4, 30, 8); g.restore(); }
  }
}
