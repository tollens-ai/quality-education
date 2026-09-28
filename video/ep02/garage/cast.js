// The cast: Clawd (the singer, after the Claude Code mascot), the Bots (Molty, Grok, Blossom,
// Muse) and the people. Every character is drawn at a position with a pose object, in ink and
// gouache: flat paint, a darker tone on the side away from the light, a brush outline that boils.
import { C, TAU, clamp, lerp, smooth, rr, circle, ellipse, heart, star, glow, rgba, mix, shade, rnd, noise1, vgrad, rgrad, lgrad, line, INK, svgPath } from './kit.js';

// Put the pen down for a character drawn at unit size u: an outline weight that suits its size.
export function pen(g, u, k = 1) { g.ink = INK.col; g.inkW = clamp(u * .13 * k, 1.5, 8); }
export function nopen(g) { g.ink = null; }

// A cel-style tone: inside the current clip, paint `col` everywhere, then the lit shape again in
// `base`, shifted toward the light, so a crescent of shade is left on the far side.
export function tone(g, pathFn, base, col, dx, dy) {
  g.save();
  g.drop = null; g.border = null; g.reg = null;
  pathFn(); g.clip();
  const ink = g.ink; g.ink = null;
  g.fillStyle = col; g.fillRect(-4000, -4000, 8000, 8000);
  g.translate(dx, dy); pathFn(); g.fillStyle = base; g.fill();
  g.ink = ink;
  g.restore();
}

// Marks loaded from local SVGs at init (logos stay out of the repo); fallbacks are drawn if absent.
export const MARKS = {};

// The groove every character dances to, set once per frame from the song clock: beat phase and
// how hard to move. Each character's own x gives it a slightly different timing, like a crowd.
export const GROOVE = { bp: 0, amp: 1 };
function groove(x, o) {
  if (o.still || !GROOVE.amp) return { bob: 0, sq: 0 };
  const ph = GROOVE.bp + ((x * 0.0007) % .12);
  const f = ph - Math.floor(ph);
  const a = GROOVE.amp * (o.groove ?? 1);
  return { bob: Math.pow(Math.sin(f * Math.PI), 2) * a, sq: Math.pow(1 - f, 4) * a };
}
export async function loadMarks(base) {
  const get = async f => { try { const r = await fetch(`${base}/${f}`); return r.ok ? await r.text() : null; } catch { return null; } };
  const paths = (svg, attr = 'd') => svg ? [...svg.matchAll(/<path\b[^>]*?\sd=(["'])(.*?)\1[^>]*>/gs)].map(m => ({ d: m[2], tag: m[0] })) : [];
  const grok = paths(await get('grok.svg')).filter(p => /#FCFCFC/i.test(p.tag) && !/mask=/.test(p.tag));
  if (grok.length) MARKS.grok = { vb: 512, paths: grok.map(p => new Path2D(p.d)) };
  const blossom = paths(await get('openai-blossom.svg'));
  if (blossom.length) MARKS.blossom = { vb: 320, paths: blossom.map(p => new Path2D(p.d)) };
  const claw = paths(await get('openclaw.svg'));
  if (claw.length >= 3) MARKS.molty = { vb: 120, body: new Path2D(claw[0].d), clawL: new Path2D(claw[1].d), clawR: new Path2D(claw[2].d), d: [claw[0].d, claw[1].d, claw[2].d] };
  const muse = paths(await get('muse-logo.svg'));
  if (muse.length) MARKS.muse = { vb: 100, paths: muse.map(p => new Path2D(p.d)) };
}

// ---------------------------------------------------------------- shadows
// A painted shadow on the ground: a flat, soft-edged wash, never a gradient.
export function contactShadow(g, x, y, w, a = .45) {
  g.save();
  g.drop = null; g.border = null; g.reg = null;
  const ink = g.ink; g.ink = null;
  g.fillStyle = `rgba(20,10,30,${a * .55})`;
  ellipse(g, x, y, w * .52, w * .1); g.fill();
  g.ink = ink;
  g.restore();
}

// ---------------------------------------------------------------- CLAWD
// o: { s: body width px, eyes, look: [lx, ly], mouth 0..1, squash, lean, armL, armR (radians,
//      0 = straight out, negative = up), ext (arm stretch), legs (beat phase for stepping),
//      rim: hex, rimSide: -1|1, blush, hat, glasses, glowEyes, hold: fn(g, u) at right arm tip,
//      holdL: fn at left arm tip, alpha, dark (0..1 silhouette toward night), heart 0..1 }
const CL = { body: '#dd7a58', tone: '#b25a3f', lit: '#f1a07c', eye: '#2b1f3c' };
export function clawd(g, x, y, o = {}) {
  const s = o.s || 300, u = s / 6;
  const gr = groove(x, o);
  const sq = (o.squash || 0) + gr.sq * .06;
  const sx = 1 + sq * .45, sy = 1 - sq;
  const dark = o.dark || 0;
  const body = dark ? mix(CL.body, '#1c1230', dark * .9) : CL.body;
  const toneC = dark ? mix(CL.tone, '#140c24', dark * .9) : CL.tone;
  g.save();
  g.translate(x, y - gr.bob * u * .35);
  if (o.alpha !== undefined) g.globalAlpha *= o.alpha;
  if (o.shadow !== false) contactShadow(g, 0, 0, s * 1.15 * sx, o.shadowA ?? .4);
  g.rotate(o.lean || 0);
  pen(g, u);
  if (dark > .6) g.ink = mix(INK.col, '#0a0614', dark);
  // Legs: four stubs that step with the beat.
  const legY = -u;
  [-2.25, -1.25, 1.25, 2.25].forEach((lx, i) => {
    const ph = o.legs === undefined ? 0 : Math.max(0, Math.sin((o.legs + (i % 2) * .5) * TAU));
    const lift = ph * u * .35;
    g.fillStyle = toneC;
    rr(g, lx * u * sx - u * .25, legY - lift - u * .1, u * .5, u * (1.1 - ph * .15), u * .14); g.fill();
  });
  const bw = 6 * u * sx, bh = 4 * u * sy, bx = -bw / 2, by = legY - bh;
  const drawArm = (side, ang, ext = 1, hold) => {
    g.save();
    g.translate(side * bw / 2, by + bh * .625);
    g.rotate(side * (ang || 0));
    const path = () => rr(g, side > 0 ? -u * .2 : -u * (ext + .05), -u * .5, u * (ext + .25), u, u * .26);
    path(); g.fillStyle = body; g.fill();
    if (!dark) { const ink = g.ink; g.ink = null; tone(g, path, body, toneC, 0, -u * .3); g.ink = ink; }
    if (hold) { g.translate(side * u * (ext + .05), 0); g.rotate(-side * (ang || 0)); hold(g, u); }
    g.restore();
  };
  drawArm(-1, o.armL ?? 0, o.extL ?? o.ext ?? 1, o.holdL);
  // Body: flat paint, a crescent of darker tone along the bottom and the side away from the light,
  // one painted highlight, and the outline over it all.
  const r = u * .46;
  const bodyPath = () => rr(g, bx, by, bw, bh, r);
  bodyPath(); g.fillStyle = body;
  const ink = g.ink; g.ink = null; g.fill();
  const lightSide = -(o.rimSide || 1) * (o.rim ? 1 : -1) || -1;
  tone(g, bodyPath, body, toneC, lightSide * u * .45, -u * .5);
  if (!dark) {
    // The painted highlight: a short fat dash of lighter orange up on the lit shoulder.
    g.fillStyle = rgba(CL.lit, .9);
    g.save(); g.translate(bx + bw * (lightSide < 0 ? .2 : .8), by + u * .62); g.rotate(-.08 * lightSide);
    rr(g, -u * .55, -u * .13, u * 1.1, u * .26, u * .13); g.fill();
    g.restore();
    circle(g, bx + bw * (lightSide < 0 ? .34 : .66), by + u * .6, u * .12); g.fill();
  }
  g.ink = ink;
  bodyPath(); g.inkLine(g.ink || INK.col, g.inkW);
  // Face (none when we see Clawd from behind).
  const lookX = (o.look?.[0] || 0) * u * .45, lookY = (o.look?.[1] || 0) * u * .3;
  const ex = 1.75 * u * sx, ey = by + 1.5 * u * sy + lookY;
  const eyes = o.back ? 'none' : (o.eyes || 'open');
  const eyeCol = o.glowEyes ? '#fff1cf' : CL.eye;
  if (o.glowEyes) { glow(g, -ex + lookX, ey, u * 1.8, C.gold, .7 * o.glowEyes); glow(g, ex + lookX, ey, u * 1.8, C.gold, .7 * o.glowEyes); }
  g.save(); g.ink = null;
  for (const side of [-1, 1]) {
    const cx = side * ex + lookX;
    g.fillStyle = eyeCol; g.strokeStyle = eyeCol; g.lineCap = 'round'; g.lineJoin = 'round';
    if (eyes === 'happy') {
      g.lineWidth = u * .3;
      g.beginPath(); g.moveTo(cx - u * .4, ey + u * .2); g.quadraticCurveTo(cx, ey - u * .6, cx + u * .4, ey + u * .2); g.stroke();
    } else if (eyes === 'closed') {
      g.lineWidth = u * .26;
      g.beginPath(); g.moveTo(cx - u * .38, ey - u * .05); g.quadraticCurveTo(cx, ey + u * .4, cx + u * .38, ey - u * .05); g.stroke();
    } else if (eyes === 'squeeze') {
      g.lineWidth = u * .26;
      g.beginPath(); g.moveTo(cx - side * u * .36, ey - u * .36); g.lineTo(cx + side * u * .2, ey); g.lineTo(cx - side * u * .36, ey + u * .36); g.stroke();
    } else if (eyes === 'star') {
      g.fillStyle = '#ffd35a'; g.ink = CL.eye; g.inkW = Math.max(1.2, u * .07);
      star(g, cx, ey, u * .66, u * .28, 5); g.fill(); g.ink = null;
    } else if (eyes === 'heart') {
      g.fillStyle = C.pink; heart(g, cx, ey + u * .1, u * 1.1); g.fill();
    } else if (eyes === 'spiral') {
      g.lineWidth = u * .14;
      g.beginPath();
      for (let k = 0; k < 40; k++) { const a = k / 40 * TAU * 2.2 + (o.t || 0) * 9 * side; const rr2 = u * .05 + k / 40 * u * .5; const px = cx + Math.cos(a) * rr2, py = ey + Math.sin(a) * rr2; k ? g.lineTo(px, py) : g.moveTo(px, py); }
      g.stroke();
    } else if (eyes === 'none') {
    } else {
      let w = u * .52, h = u * 1.02;
      if (eyes === 'wide') { w = u * .64; h = u * 1.3; }
      if (eyes === 'worried') { h = u * .92; }
      h *= 1 - (o.blink || 0) * .88;
      rr(g, cx - w / 2, ey - h / 2, w, h, w * .46); g.fill();
      if (!o.glowEyes && (o.blink || 0) < .5) { g.fillStyle = '#fff6ea'; circle(g, cx - w * .12, ey - h * .22, w * .16); g.fill(); }
      if (eyes === 'worried') {
        g.strokeStyle = CL.eye; g.lineWidth = u * .16;
        line(g, cx - side * u * .45, ey - u * .95, cx + side * u * .2, ey - u * .75); g.stroke();
      }
    }
  }
  // Blush: a dab of pink wash.
  if (o.blush && !o.back) {
    g.fillStyle = rgba('#ff5b7a', .32 * o.blush);
    for (const side of [-1, 1]) { ellipse(g, side * (ex + u * .55) + lookX, ey + u * .75, u * .46, u * .24); g.fill(); }
  }
  // Mouth: opens with the vocal.
  const m = o.back ? 0 : clamp(o.mouth || 0);
  const my = ey + u * 1.25;
  if (m > .04) {
    const mw = u * (.55 + m * .35), mh = u * (.18 + m * .95);
    g.fillStyle = '#4a1712';
    g.ink = CL.eye; g.inkW = Math.max(1, u * .06);
    rr(g, lookX - mw / 2, my - mh * .35, mw, mh, Math.min(mw, mh) * .48); g.fill();
    g.ink = null;
    if (m > .35) {
      g.save(); rr(g, lookX - mw / 2, my - mh * .35, mw, mh, Math.min(mw, mh) * .48); g.clip();
      g.fillStyle = '#e8566a'; ellipse(g, lookX, my + mh * .62, mw * .42, mh * .32); g.fill();
      g.restore();
    }
  } else if (o.smile && !o.back) {
    g.strokeStyle = CL.eye; g.lineWidth = u * .17; g.lineCap = 'round';
    g.beginPath(); g.moveTo(lookX - u * .35, my - u * .05); g.quadraticCurveTo(lookX, my + u * .3 * o.smile, lookX + u * .35, my - u * .05); g.stroke();
  } else if (o.frown && !o.back) {
    g.strokeStyle = CL.eye; g.lineWidth = u * .16; g.lineCap = 'round';
    g.beginPath(); g.moveTo(lookX - u * .3, my + u * .12); g.quadraticCurveTo(lookX, my - u * .12, lookX + u * .3, my + u * .12); g.stroke();
  }
  g.restore();
  // Heart glowing inside (the break).
  if (o.heart) {
    glow(g, 0, by + bh * .72, u * 3 * o.heart, C.pink, .8 * o.heart);
    g.fillStyle = rgba('#ff6f9f', o.heart); heart(g, 0, by + bh * .74, u * 1.1 * (1 + .06 * Math.sin((o.t || 0) * 9))); g.fill();
  }
  // Costume: whatever the character wears over the body (see band.js).
  if (o.dress) { g.save(); g.drop = null; g.border = null; o.dress(g, u, { bx, by, bw, bh, bodyPath, ex, ey, lookX, sx, sy, back: !!o.back }); g.restore(); }
  drawArm(1, o.armR ?? 0, o.extR ?? o.ext ?? 1, o.hold);
  if (o.dressTop) { g.save(); g.drop = null; g.border = null; o.dressTop(g, u, { bx, by, bw, bh, bodyPath, ex, ey, lookX, sx, sy, back: !!o.back }); g.restore(); }
  // Hats and glasses.
  if (o.hat === 'party') partyHat(g, u * 1.2, by + u * .15, u, -.25);
  if (o.hat === 'guard') guardCap(g, 0, by + u * .2, u);
  if (o.hat === 'sun') sunHat(g, 0, by + u * .25, u);
  if (o.glasses) sunglasses(g, lookX, ey, u, ex);
  if (o.sweat) { g.ink = null; g.fillStyle = rgba('#bfe8ff', .95 * o.sweat); const sx0 = bw / 2 - u * .6, sy0 = by + u * .5 + (1 - o.sweat) * u; g.beginPath(); g.moveTo(sx0, sy0 - u * .45); g.quadraticCurveTo(sx0 + u * .3, sy0 + u * .05, sx0, sy0 + u * .15); g.quadraticCurveTo(sx0 - u * .3, sy0 + u * .05, sx0, sy0 - u * .45); g.fill(); }
  if (dark) { g.save(); g.ink = null; g.globalCompositeOperation = 'multiply'; g.restore(); }
  g.restore();
}

function partyHat(g, x, y, u, rot) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.beginPath(); g.moveTo(-u * .9, 0); g.lineTo(0, -u * 2.4); g.lineTo(u * .9, 0); g.closePath();
  g.fillStyle = C.cyan; g.fill();
  g.save(); g.clip();
  g.fillStyle = C.pink;
  for (let i = -3; i < 4; i++) { g.beginPath(); g.moveTo(-u * 2 + i * u * .8, 0); g.lineTo(-u * 1.6 + i * u * .8, 0); g.lineTo(-u * .4 + i * u * .8 + u, -u * 2.6); g.lineTo(-u * .8 + i * u * .8 + u, -u * 2.6); g.fill(); }
  g.restore();
  g.fillStyle = C.gold; circle(g, 0, -u * 2.4, u * .32); g.fill();
  g.restore();
}
function guardCap(g, x, y, u) {
  g.save(); g.translate(x, y);
  g.fillStyle = '#1f2a55'; rr(g, -u * 1.9, -u * 1.25, u * 3.8, u * 1.25, u * .5); g.fill();
  g.fillStyle = '#141b3c'; rr(g, -u * 2.3, -u * .15, u * 4.6, u * .38, u * .18); g.fill();
  g.fillStyle = C.gold; star(g, 0, -u * .65, u * .38, u * .17, 5); g.fill();
  g.restore();
}
function sunHat(g, x, y, u) {
  g.save(); g.translate(x, y);
  g.fillStyle = '#f7e3a6'; ellipse(g, 0, 0, u * 3.6, u * .55); g.fill();
  g.fillStyle = '#f3d98c'; rr(g, -u * 1.7, -u * 1.5, u * 3.4, u * 1.55, u * .8); g.fill();
  g.fillStyle = C.coral; g.fillRect(-u * 1.7, -u * .55, u * 3.4, u * .38);
  g.restore();
}
function sunglasses(g, x, y, u, ex) {
  g.fillStyle = '#16121e';
  for (const s of [-1, 1]) { rr(g, x + s * ex - u * .6, y - u * .45, u * 1.2, u * .85, u * .3); g.fill(); }
  g.fillRect(x - ex + u * .5, y - u * .3, ex * 2 - u, u * .16);
  g.fillStyle = 'rgba(255,255,255,.35)';
  for (const s of [-1, 1]) { rr(g, x + s * ex - u * .4, y - u * .32, u * .35, u * .18, u * .08); g.fill(); }
}

// A mini Clawd (the subagents): same silhouette, simplified.
export function miniClawd(g, x, y, s, o = {}) {
  clawd(g, x, y, { s, shadowA: .3, ...o });
}

// ---------------------------------------------------------------- props held and played
export function mic(g, u, o = {}) {
  g.save();
  g.rotate(o.rot ?? -.6);
  pen(g, u, .7);
  g.fillStyle = '#2e2b42'; rr(g, -u * .18, -u * .2, u * .36, u * 1.8, u * .15); g.fill();
  g.fillStyle = '#b8b4c8'; circle(g, 0, -u * .45, u * .48); g.fill();
  nopen(g);
  g.save(); circle(g, 0, -u * .45, u * .48); g.clip();
  g.fillStyle = '#8d88a2'; circle(g, u * .16, -u * .3, u * .48); g.fill();
  g.strokeStyle = 'rgba(40,34,60,.55)'; g.lineWidth = u * .05;
  for (let i = -2; i <= 2; i++) { line(g, -u * .45, -u * .45 + i * u * .16, u * .45, -u * .45 + i * u * .16); g.stroke(); }
  g.restore();
  g.restore();
}
export function micStand(g, x, y, h, u) {
  g.strokeStyle = '#2a2840'; g.lineWidth = u * .22; g.lineCap = 'round';
  line(g, x, y, x, y - h); g.stroke();
  line(g, x - u * 1.1, y, x + u * 1.1, y); g.stroke();
}

// ---------------------------------------------------------------- MOLTY (OpenClaw)
// OpenClaw's open-source lobster, redrawn by hand from its own SVG shapes.
const MOLTY_FALLBACK = ['M60 10 C30 10 15 35 15 55 C15 75 30 95 45 100 L45 110 L55 110 L55 100 C55 100 60 102 65 100 L65 110 L75 110 L75 100 C90 95 105 75 105 55 C105 35 90 10 60 10Z', 'M20 45 C5 40 0 50 5 60 C10 70 20 65 25 55 C28 48 25 45 20 45Z', 'M100 45 C115 40 120 50 115 60 C110 70 100 65 95 55 C92 48 95 45 100 45Z'];
export function molty(g, x, y, o = {}) {
  const s = o.s || 260, k = s / 120;
  const gr = groove(x, o);
  const D = MARKS.molty?.d || MOLTY_FALLBACK;
  const red = '#e8453c', redT = '#a52629', redL = '#ff8a78';
  g.save(); g.translate(x, y);
  if (o.shadow !== false) contactShadow(g, 0, 0, s * .9, .38);
  g.translate(0, -gr.bob * s * .05);
  g.rotate((o.lean || 0) + Math.sin(GROOVE.bp * Math.PI) * .04 * GROOVE.amp);
  const sq = (o.squash || 0) + gr.sq * .07;
  g.scale(k * (1 + sq * .35), k * (1 - sq));
  g.translate(-60, -110);
  g.ink = INK.col; g.inkW = clamp(s * .022, 1.4, 7);
  // Antennae, springy: an ink line under a red one.
  const wob = o.t !== undefined ? Math.sin(o.t * 11) * 2.2 * (o.bounce ?? 1) : 0;
  g.lineCap = 'round';
  for (const [col, w] of [[INK.col, 5.6], [red, 3]]) {
    g.strokeStyle = col; g.lineWidth = w;
    g.beginPath(); g.moveTo(45, 15); g.quadraticCurveTo(35 + wob, 3, 28 + wob * 1.5, 7 - wob * .5); g.stroke();
    g.beginPath(); g.moveTo(75, 15); g.quadraticCurveTo(85 - wob, 3, 92 - wob * 1.5, 7 - wob * .5); g.stroke();
  }
  const claw = (side, ang, d) => {
    g.save();
    const px = side < 0 ? 24 : 96, py = 52;
    g.translate(px, py); g.rotate(ang || 0); g.translate(-px, -py);
    g.fillStyle = red; svgPath(g, d); g.fill();
    tone(g, () => svgPath(g, d), red, redT, -side * 2, -4);
    svgPath(g, d); g.inkLine(g.ink, g.inkW);
    g.restore();
  };
  claw(-1, o.clawL, D[1]);
  g.fillStyle = red; svgPath(g, D[0]); g.fill();
  tone(g, () => svgPath(g, D[0]), red, redT, -7, -7);
  // A painted highlight on the dome, and the outline over all.
  const ink = g.ink; g.ink = null;
  g.fillStyle = rgba(redL, .85); g.save(); g.translate(42, 24); g.rotate(-.6); rr(g, -9, -3, 18, 6, 3); g.fill(); g.restore();
  g.ink = ink;
  svgPath(g, D[0]); g.inkLine(g.ink, g.inkW);
  claw(1, o.clawR, D[2]);
  // Eyes: black with cyan lights, as in OpenClaw's own mark.
  g.ink = null;
  const lx = (o.look?.[0] || 0) * 2, ly = (o.look?.[1] || 0) * 2;
  if (o.eyes === 'happy') {
    g.strokeStyle = '#050810'; g.lineWidth = 3.6;
    for (const ex of [45, 75]) { g.beginPath(); g.moveTo(ex - 6, 37); g.quadraticCurveTo(ex, 27, ex + 6, 37); g.stroke(); }
  } else {
    const bl = 1 - (o.blink || 0) * .85;
    for (const ex of [45, 75]) {
      g.fillStyle = '#050810'; g.beginPath(); g.ellipse(ex + lx, 35 + ly, 6.4, 6.4 * bl, 0, 0, TAU); g.fill();
      if (bl > .4) { g.fillStyle = '#00e5cc'; circle(g, ex + 1 + lx * 1.4, 34 + ly, 2.6); g.fill(); g.fillStyle = '#fff'; circle(g, ex - 1.8 + lx, 32.6 + ly, 1.2); g.fill(); }
    }
  }
  if (o.mouth > .05) { g.fillStyle = '#4b0d10'; g.beginPath(); g.ellipse(60, 52, 5 + o.mouth * 3, 1.5 + o.mouth * 7, 0, 0, TAU); g.fill(); }
  else { g.strokeStyle = '#4b0d10'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(55, 50); g.quadraticCurveTo(60, 54, 65, 50); g.stroke(); }
  g.restore();
}

// ---------------------------------------------------------------- the marks, exactly as provided
// Corporate marks are never redrawn or restyled (their owners forbid alteration). They appear only
// as badges, like printed stickers on the drawings: the mark's own artwork in its own colours,
// uniformly scaled, drawn exactly (the hand-drawn wobble is off).
export function grokBadge(g, x, y, s) {
  g.save(); g.plain = true; g.ink = null; g.tex = 0; g.edge = 0;
  g.translate(x - s / 2, y - s / 2);
  const k = s / 512; g.scale(k, k);
  g.fillStyle = '#050505'; rr(g, 0, 0, 512, 512, 118); g.fill();
  g.fillStyle = '#FCFCFC';
  if (MARKS.grok) MARKS.grok.paths.forEach(p => g.fill(p));
  g.restore();
}
export function blossomBadge(g, x, y, s) {
  g.save(); g.plain = true; g.ink = null; g.tex = 0; g.edge = 0;
  g.fillStyle = '#ffffff'; circle(g, x, y, s * .62); g.fill();
  g.translate(x - s / 2, y - s / 2);
  const k = s / 320; g.scale(k, k);
  g.fillStyle = '#000000';
  if (MARKS.blossom) MARKS.blossom.paths.forEach(p => g.fill(p));
  g.restore();
}
export function museBadge(g, x, y, s) {
  if (!MARKS.muse) return;
  g.save(); g.plain = true; g.ink = null; g.tex = 0; g.edge = 0;
  g.translate(x - s / 2, y - s / 2);
  const k = s / 100; g.scale(k, k);
  g.fillStyle = lgrad(g, 0, 0, 100, 100, [[0, '#0082FB'], [1, '#0040DC']]);
  MARKS.muse.paths.forEach(p => g.fill(p));
  g.restore();
}

// ---------------------------------------------------------------- GROK'S BOT (drummer)
// Its own robot: a black dome, white LED eyes, an antenna. It wears Grok's mark as a badge.
export function grok(g, x, y, o = {}) {
  const s = o.s || 240, u = s / 10;
  const gr = groove(x, o);
  const bodyC = '#2a2a33', bodyT = '#17171e', lit = '#5b5b70';
  g.save(); g.translate(x, y);
  if (o.shadow !== false) contactShadow(g, 0, 0, s * .95, .4);
  g.translate(0, -gr.bob * s * .04);
  g.rotate(o.lean || 0);
  const sq = (o.squash || 0) + gr.sq * .06;
  g.scale(1 + sq * .35, 1 - sq);
  pen(g, u * 1.1); g.ink = '#07060c';
  // Legs.
  g.fillStyle = bodyT;
  rr(g, -u * 2.8, -u * 1.7, u * 1.6, u * 1.7, u * .6); g.fill();
  rr(g, u * 1.2, -u * 1.7, u * 1.6, u * 1.7, u * .6); g.fill();
  // Antenna.
  g.strokeStyle = '#07060c'; g.lineWidth = u * .42; line(g, 0, -u * 11, 0, -u * 12.6); g.stroke();
  glow(g, 0, -u * 12.8, u * 1.8, '#dfe9ff', .6); g.fillStyle = '#eef4ff'; circle(g, 0, -u * 12.8, u * .6); g.fill();
  // Body: a round-shouldered dome, flat black with a darker side and a painted lit edge.
  const bx = -u * 4.8, by = -u * 11.2, bw = u * 9.6, bh = u * 9.6;
  const body = () => { g.beginPath(); g.moveTo(bx, by + bh); g.lineTo(bx, by + bh * .42); g.bezierCurveTo(bx, by - bh * .06, bx + bw, by - bh * .06, bx + bw, by + bh * .42); g.lineTo(bx + bw, by + bh - u); g.quadraticCurveTo(bx + bw, by + bh, bx + bw - u, by + bh); g.lineTo(bx + u, by + bh); g.quadraticCurveTo(bx, by + bh, bx, by + bh - u); g.closePath(); };
  body(); g.fillStyle = bodyC; const ink = g.ink; g.ink = null; g.fill();
  tone(g, body, bodyC, bodyT, -u * .9, -u * .6);
  g.save(); body(); g.clip();
  g.fillStyle = rgba(lit, .8); g.save(); g.translate(bx + bw * .28, by + bh * .12); g.rotate(-.5); rr(g, -u * 1.3, -u * .22, u * 2.6, u * .44, u * .22); g.fill(); g.restore();
  if (o.rim) { g.fillStyle = rgba(o.rim, .45); g.fillRect(bx + bw - u * .75, by - u, u * .75, bh + u * 2); }
  g.restore();
  g.ink = ink; body(); g.inkLine(g.ink, g.inkW);
  // Face: a dark visor with two white LED eyes.
  g.fillStyle = '#08080d'; rr(g, -u * 3.4, by + u * 1.6, u * 6.8, u * 3, u * 1.4); g.fill();
  g.ink = null;
  const bl = 1 - (o.blink || 0) * .85, lx = (o.look?.[0] || 0) * u * .5;
  g.fillStyle = '#eef4ff';
  if (o.eyes === 'happy') { g.strokeStyle = '#eef4ff'; g.lineWidth = u * .5; g.lineCap = 'round'; for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * u * 1.4 - u * .55 + lx, by + u * 3.4); g.quadraticCurveTo(sd * u * 1.4 + lx, by + u * 2.4, sd * u * 1.4 + u * .55 + lx, by + u * 3.4); g.stroke(); } }
  else for (const sd of [-1, 1]) { rr(g, sd * u * 1.4 - u * .45 + lx, by + u * 3.1 - u * .8 * bl, u * .9, u * 1.6 * bl, u * .4); g.fill(); }
  glow(g, 0, by + u * 3.1, u * 3.4, '#dfe9ff', .3);
  // Grok's mark, as a badge on its chest.
  grokBadge(g, 0, by + bh * .7, u * 3.2);
  // Arms with sticks.
  g.ink = ink;
  const stick = (side, ang) => {
    g.save(); g.translate(side * u * 4.8, -u * 5.2); g.rotate(ang);
    g.fillStyle = bodyC; rr(g, -u * .55, -u * .55, u * 3.2, u * 1.1, u * .55); g.fill();
    if (o.sticks !== false) { g.strokeStyle = '#e8c890'; g.lineWidth = u * .5; g.lineCap = 'round'; line(g, u * 2.6, 0, u * 7.6, -u * .6); g.stroke(); }
    g.restore();
  };
  if (o.arms !== false) { stick(-1, Math.PI + (o.armL || 0)); stick(1, o.armR || 0); }
  g.restore();
}

// ---------------------------------------------------------------- THE OPENAI BOT (bass)
// Its own robot: a pearl-white round body and head with a soft face. It wears the OpenAI mark as a
// badge on its chest, exactly as provided.
export function blossom(g, x, y, o = {}) {
  const s = o.s || 240, u = s / 10;
  const gr = groove(x, o);
  const pearl = '#f4f1ea', pearlT = '#cdc8d6', pearlE = '#dedae6';
  g.save(); g.translate(x, y);
  if (o.shadow !== false) contactShadow(g, 0, 0, s * .8, .38);
  g.translate(0, -gr.bob * s * .04);
  g.rotate((o.lean || 0) + Math.sin(GROOVE.bp * Math.PI + 1) * .035 * GROOVE.amp);
  const sq = (o.squash || 0) + gr.sq * .06;
  g.scale(1 + sq * .35, 1 - sq);
  pen(g, u * 1.1);
  // Feet and body.
  g.fillStyle = pearlT; rr(g, -u * 2.5, -u * 1.3, u * 1.5, u * 1.3, u * .6); g.fill(); rr(g, u * 1, -u * 1.3, u * 1.5, u * 1.3, u * .6); g.fill();
  const bodyP = () => rr(g, -u * 3.3, -u * 6.4, u * 6.6, u * 5.4, u * 2.4);
  bodyP(); g.fillStyle = pearl; g.fill();
  tone(g, bodyP, pearl, pearlT, -u * .7, -u * .6);
  blossomBadge(g, 0, -u * 3.7, u * 2.6);
  // Head: a round pearl dome with ear discs.
  const hy = -u * 9.6, hr = u * 3.9;
  for (const sd of [-1, 1]) { g.fillStyle = pearlE; circle(g, sd * hr * .98, hy + u * .3, u * .9); g.fill(); }
  const headP = () => circle(g, 0, hy, hr);
  headP(); g.fillStyle = pearl; g.fill();
  tone(g, headP, pearl, pearlT, -u * .8, -u * .7);
  const ink = g.ink; g.ink = null;
  g.fillStyle = '#ffffff'; g.save(); g.translate(-hr * .45, hy - hr * .55); g.rotate(-.7); rr(g, -u * .8, -u * .2, u * 1.6, u * .4, u * .2); g.fill(); g.restore();
  // Face.
  const bl = 1 - (o.blink || 0) * .85, lx = (o.look?.[0] || 0) * u * .5;
  g.fillStyle = '#1e1a2a';
  if (o.eyes === 'happy') {
    g.strokeStyle = '#1e1a2a'; g.lineWidth = u * .44; g.lineCap = 'round';
    for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * u * 1.3 - u * .5 + lx, hy + u * .1); g.quadraticCurveTo(sd * u * 1.3 + lx, hy - u * .8, sd * u * 1.3 + u * .5 + lx, hy + u * .1); g.stroke(); }
  } else {
    for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(sd * u * 1.3 + lx, hy - u * .2, u * .5, u * .7 * bl, 0, 0, TAU); g.fill(); if (bl > .5) { g.fillStyle = '#fff'; circle(g, sd * u * 1.3 - u * .15 + lx, hy - u * .45, u * .16); g.fill(); g.fillStyle = '#1e1a2a'; } }
  }
  if (o.mouth > .05) { g.fillStyle = '#3a1418'; g.beginPath(); g.ellipse(lx, hy + u * 1.3, u * .55, u * (.2 + o.mouth * .6), 0, 0, TAU); g.fill(); }
  else { g.strokeStyle = '#1e1a2a'; g.lineWidth = u * .3; g.lineCap = 'round'; g.beginPath(); g.moveTo(lx - u * .55, hy + u * 1.05); g.quadraticCurveTo(lx, hy + u * 1.55, lx + u * .55, hy + u * 1.05); g.stroke(); }
  g.fillStyle = 'rgba(255,120,140,.32)'; ellipse(g, -u * 2.3, hy + u * .8, u * .7, u * .4); g.fill(); ellipse(g, u * 2.3, hy + u * .8, u * .7, u * .4); g.fill();
  g.ink = ink;
  g.restore();
}

// ---------------------------------------------------------------- JOLLY, Muse's mascot (keys)
// A fuzzy beige bean with a peach face, dot eyes and pink cheeks, in headphones. The fur is drawn
// as tufts of the pen around his edge.
export function muse(g, x, y, o = {}) {
  const s = o.s || 260, u = s / 10;
  const gr = groove(x, o);
  const fur = '#e6cfae', furT = '#c3a27c', furInk = '#7a5a3e';
  g.save(); g.translate(x, y);
  if (o.shadow !== false) contactShadow(g, 0, 0, s * .95, .36);
  g.translate(0, -gr.bob * s * .03);
  g.rotate((o.lean || 0) + Math.sin(GROOVE.bp * Math.PI / 2) * .04 * GROOVE.amp);
  const sq = (o.squash || 0) + gr.sq * .05;
  g.scale(1 + sq * .35, 1 - sq);
  const top = -u * 13.5;
  const body = () => {
    g.beginPath();
    g.moveTo(-u * 5, 0);
    g.bezierCurveTo(-u * 5.6, -u * 6, -u * 5.4, top + u * 1.5, 0, top);
    g.bezierCurveTo(u * 5.4, top + u * 1.5, u * 5.6, -u * 6, u * 5, 0);
    g.closePath();
  };
  pen(g, u * 1.1); g.ink = '#4a3526';
  body(); g.fillStyle = fur; const ink = g.ink; g.ink = null; g.fill();
  tone(g, body, fur, furT, -u * .9, -u * .5);
  // Fur: tufts of short pen strokes all round the edge and a few across the body, swaying a touch.
  const sway = Math.sin((o.t || 0) * 3) * .08;
  const rx = u * 5.15, ry = u * 13.1;
  g.lineCap = 'round';
  for (let i = 0; i < 70; i++) {
    const a = Math.PI * (i / 69) + (rnd(i, 71) - .5) * .03;
    const bxp = Math.cos(a) * rx * .98, byp = -Math.sin(a) * ry * .99;
    let nx = Math.cos(a) / rx, ny = -Math.sin(a) / ry; const nl = Math.hypot(nx, ny); nx /= nl; ny /= nl;
    const ang = Math.atan2(ny, nx) + (rnd(i, 72) - .5) * .8 + sway + .3;
    const len = u * (.5 + .5 * rnd(i, 73));
    g.strokeStyle = i % 3 ? furInk : furT; g.lineWidth = u * (.16 + .08 * rnd(i, 75));
    g.beginPath(); g.moveTo(bxp - nx * u * .35, byp - ny * u * .35); g.quadraticCurveTo(bxp + Math.cos(ang) * len * .5, byp + Math.sin(ang) * len * .5 - u * .1, bxp + Math.cos(ang) * len, byp + Math.sin(ang) * len); g.stroke();
  }
  g.save(); body(); g.clip();
  for (let i = 0; i < 40; i++) {
    const px = (rnd(i, 81) - .5) * u * 9, py = top + u * 2 + rnd(i, 82) * (-top - u * 3);
    g.strokeStyle = rgba(furInk, .45); g.lineWidth = u * .13;
    g.beginPath(); g.moveTo(px, py); g.quadraticCurveTo(px + u * .2, py + u * .25, px + (rnd(i, 83) - .5) * u * .5, py + u * .6); g.stroke();
  }
  g.restore();
  g.ink = ink;
  // Face.
  const fy = top + u * 5.4;
  g.fillStyle = '#fbe4d3'; rr(g, -u * 2.9, fy - u * 2.1, u * 5.8, u * 4.4, u * 2.1); g.fill();
  g.ink = null;
  g.fillStyle = 'rgba(255,120,130,.38)';
  ellipse(g, -u * 1.9, fy + u * 1.1, u * .9, u * .55); g.fill(); ellipse(g, u * 1.9, fy + u * 1.1, u * .9, u * .55); g.fill();
  g.fillStyle = '#1b1414';
  const bl = 1 - (o.blink || 0) * .85;
  if (o.eyes === 'happy') {
    g.strokeStyle = '#1b1414'; g.lineWidth = u * .32; g.lineCap = 'round';
    for (const s2 of [-1, 1]) { g.beginPath(); g.moveTo(s2 * u * 1.4 - u * .4, fy + u * .1); g.quadraticCurveTo(s2 * u * 1.4, fy - u * .55, s2 * u * 1.4 + u * .4, fy + u * .1); g.stroke(); }
  } else {
    for (const s2 of [-1, 1]) { g.beginPath(); g.ellipse(s2 * u * 1.4 + (o.look?.[0] || 0) * u * .3, fy, u * .38, u * .46 * bl, 0, 0, TAU); g.fill(); g.fillStyle = '#fff'; circle(g, s2 * u * 1.4 - u * .1, fy - u * .15, u * .11); g.fill(); g.fillStyle = '#1b1414'; }
  }
  if (o.mouth > .05) { g.fillStyle = '#6b2b2b'; g.beginPath(); g.ellipse(0, fy + u * 1.1, u * .5, u * (.2 + o.mouth * .6), 0, 0, TAU); g.fill(); }
  else { g.strokeStyle = '#1b1414'; g.lineWidth = u * .22; g.lineCap = 'round'; g.beginPath(); g.moveTo(-u * .45, fy + u * .95); g.quadraticCurveTo(0, fy + u * 1.35, u * .45, fy + u * .95); g.stroke(); }
  // Headphones.
  if (o.phones !== false) {
    g.ink = ink;
    g.strokeStyle = INK.col; g.lineWidth = u * 1.35; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-u * 4.9, fy - u * .4); g.bezierCurveTo(-u * 4.8, top - u * 1.1, u * 4.8, top - u * 1.1, u * 4.9, fy - u * .4); g.stroke();
    g.strokeStyle = '#34343f'; g.lineWidth = u * .9;
    g.beginPath(); g.moveTo(-u * 4.9, fy - u * .4); g.bezierCurveTo(-u * 4.8, top - u * 1.1, u * 4.8, top - u * 1.1, u * 4.9, fy - u * .4); g.stroke();
    for (const s2 of [-1, 1]) {
      const cup = () => rr(g, s2 * u * 5.1 - u * 1.1, fy - u * 2, u * 2.2, u * 3.8, u * 1);
      cup(); g.fillStyle = '#34343f'; g.fill();
      tone(g, cup, '#34343f', '#1e1e26', -s2 * u * .4, -u * .3);
      cup(); g.inkLine(g.ink, g.inkW);
    }
    museBadge(g, u * 5.1, fy - u * .1, u * 1.5);
  }
  g.restore();
}

// ---------------------------------------------------------------- people
// A chunky, friendly person, waist up or full, drawn like a picture-book character: a big round
// head, brows that act, a nose, clothes with a collar and a shaded side.
// o: { s: head size, skin, hair, hairStyle, top, pose: {armL, armR}, eyes, brow, mouth, glasses,
//      extra: fn, full: bool, torso: fn, hand: fn, look, lean, bob, shadow, frown,
//      below: how far (in tenths of s) the body carries on below the waist, for someone cut off by
//      the frame or by something in front, gripL/gripR: fn(g, u) drawn upright in that hand,
//      under the fingers, for whatever it holds }
// hairStyle: short, long, bun, curly, grey, beanie, bob, afro, bald, cap, pony.
export const SKINS = ['#f6d0b1', '#e8b48f', '#c98d67', '#a86b4a', '#7c4a32', '#5b3526'];
export function person(g, x, y, o = {}) {
  const s = o.s || 120, u = s / 10;
  const gr = groove(x, o);
  g.save(); g.translate(x, y);
  if (o.shadow) contactShadow(g, 0, 0, s * 1.6, .35);
  g.rotate((o.lean || 0) + Math.sin((GROOVE.bp + x * .001) * Math.PI) * .045 * GROOVE.amp * (o.groove ?? 1));
  const bob = (o.bob || 0) + gr.bob * 1.1;
  g.translate(0, -bob * u);
  const skin = o.skin || SKINS[1], top = o.top || '#4a7bff', hair = o.hair || '#2a1c18';
  const skinT = shade(skin, -.16), topT = shade(top, -.24);
  pen(g, u * 1.05);
  const small = s < 60;
  if (small) g.inkW = Math.max(1.2, g.inkW * .8);
  // Body (torso): a rounded trapezoid with a shaded side and a collar.
  const th = o.full ? u * 11 : u * 9;
  const by = o.full ? -u * 6 : 0;
  const bot = by + u * .5 + (o.below || 0) * u;
  const torso = () => { g.beginPath(); g.moveTo(-u * 6, bot); g.lineTo(-u * 6, by + u * .5); g.lineTo(-u * 5.2, by - th + u * 2.4); g.quadraticCurveTo(-u * 5, by - th, -u * 2.5, by - th); g.lineTo(u * 2.5, by - th); g.quadraticCurveTo(u * 5, by - th, u * 5.2, by - th + u * 2.4); g.lineTo(u * 6, by + u * .5); g.lineTo(u * 6, bot); g.closePath(); };
  if (o.full) {
    g.fillStyle = o.legs || '#2b3350';
    rr(g, -u * 4, by - u * .5, u * 3.4, u * 6.5, u * 1.2); g.fill(); rr(g, u * .6, by - u * .5, u * 3.4, u * 6.5, u * 1.2); g.fill();
    g.fillStyle = '#1b1b24'; rr(g, -u * 4.6, -u * 1.3, u * 4.2, u * 1.5, u * .7); g.fill(); rr(g, u * .4, -u * 1.3, u * 4.2, u * 1.5, u * .7); g.fill();
  }
  // Long hair falls behind the shoulders.
  const hy0 = by - th - u * 3.6, hr0 = u * 4.3;
  // Anything worn behind the head (a veil), drawn before the body.
  if (o.behindHead) o.behindHead(g, u, hy0, hr0);
  if (o.hairStyle === 'long') { g.fillStyle = hair; rr(g, -hr0 * 1.1, hy0 - hr0 * .7, hr0 * 2.2, hr0 * 2.25, hr0 * .9); g.fill(); }
  if (o.hairStyle === 'bob') { g.fillStyle = hair; rr(g, -hr0 * 1.16, hy0 - hr0 * .8, hr0 * 2.32, hr0 * 1.62, hr0 * .55); g.fill(); }
  if (o.hairStyle === 'afro') { g.fillStyle = hair; circle(g, 0, hy0 - hr0 * .22, hr0 * 1.2); g.fill(); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; circle(g, Math.cos(a) * hr0 * 1.16, hy0 - hr0 * .22 + Math.sin(a) * hr0 * 1.16, hr0 * .3); g.fill(); } }
  if (o.hairStyle === 'pony') { g.fillStyle = hair; ellipse(g, hr0 * 1.02, hy0 + hr0 * .35, hr0 * .34, hr0 * .78, -.35); g.fill(); }
  const arm = (side, ang, len = 1) => {
    g.save(); g.translate(side * u * 4.6, by - th + u * 2.6); g.rotate(side * (ang ?? .25));
    g.fillStyle = side > 0 ? topT : top; rr(g, -u * 1.45, -u * .4, u * 2.9, u * 7.2 * len, u * 1.45); g.fill();
    const grip = side > 0 ? o.gripR : o.gripL;
    if (grip) { g.save(); g.translate(0, u * 7.1 * len); g.rotate(-side * (ang ?? .25)); grip(g, u); g.restore(); }
    g.fillStyle = skin; circle(g, 0, u * 7.1 * len, u * 1.5); g.fill();
    if (o.hand && side === (o.handSide || 1)) { g.translate(0, u * 7 * len); o.hand(g, u); }
    g.restore();
  };
  torso(); g.fillStyle = top; g.fill();
  const ink = g.ink; g.ink = null;
  tone(g, torso, top, topT, -u * 1.4, 0);
  if (o.torso) o.torso(g, u, by, th);
  g.ink = ink;
  torso(); g.inkLine(g.ink, g.inkW);
  arm(-1, o.armL, o.armLenL); arm(1, o.armR, o.armLenR);
  // Collar: a round neckline.
  g.fillStyle = shade(top, -.35); g.ink = null;
  g.beginPath(); g.ellipse(0, by - th + u * .1, u * 1.9, u * 1.1, 0, 0, Math.PI); g.fill();
  g.ink = ink;
  // Neck and head.
  const hy = by - th - u * 3.6;
  const hr = u * 4.3;
  g.fillStyle = skinT; rr(g, -u * 1.3, hy + u * 2, u * 2.6, u * 2.6, u); g.fill();
  // Hair behind.
  g.fillStyle = hair;
  if (o.hairStyle === 'curly') { g.beginPath(); for (let i = 0; i <= 12; i++) { const a = -Math.PI * .02 - i / 12 * Math.PI * 1.04; const r2 = hr * (1.12 + .1 * Math.sin(i * 2.3)); i ? g.lineTo(Math.cos(a) * r2, hy + Math.sin(a) * r2 * .95 + hr * .2) : g.moveTo(Math.cos(a) * r2, hy + Math.sin(a) * r2 * .95 + hr * .2); } g.lineTo(-hr * 1.1, hy + hr * .9); g.lineTo(hr * 1.1, hy + hr * .9); g.closePath(); g.fill(); }
  // Ears.
  g.fillStyle = skin; circle(g, -hr * .98, hy + u * .5, u * .95); g.fill(); circle(g, hr * .98, hy + u * .5, u * .95); g.fill();
  // Head: a soft round face, a little wider at the cheeks.
  const head = () => { g.beginPath(); g.ellipse(0, hy + u * .15, hr * 1.02, hr * .98, 0, 0, TAU); };
  head(); g.fillStyle = skin; g.ink = null; g.fill();
  tone(g, head, skin, skinT, -u * 1.1, -u * .6);
  g.ink = ink; head(); g.inkLine(g.ink, g.inkW);
  // Hair on top.
  g.fillStyle = hair;
  const hs = o.hairStyle || 'short';
  const hairLines = (pts) => { if (small) return; g.save(); g.ink = null; g.strokeStyle = rgba(shade(hair, hair === '#e9e6ef' ? -.3 : .35), .8); g.lineWidth = u * .22; g.lineCap = 'round'; for (const [a, b2, c2, d2] of pts) { g.beginPath(); g.moveTo(a, hy + b2); g.quadraticCurveTo((a + c2) / 2, hy + Math.min(b2, d2) - u * .6, c2, hy + d2); g.stroke(); } g.restore(); };
  if (hs === 'short') { g.beginPath(); g.moveTo(-hr * 1.04, hy + u * .4); g.bezierCurveTo(-hr * 1.15, hy - hr * 1.05, hr * 1.1, hy - hr * 1.15, hr * 1.04, hy - u * .2); g.quadraticCurveTo(hr * .4, hy - hr * .55, -hr * .3, hy - hr * .5); g.quadraticCurveTo(-hr * .75, hy - hr * .35, -hr * 1.04, hy + u * .4); g.closePath(); g.fill(); hairLines([[-hr * .6, -hr * .55, hr * .2, -hr * .8], [hr * .1, -hr * .75, hr * .8, -hr * .5]]); }
  if (hs === 'long') { g.beginPath(); g.ellipse(0, hy - hr * .3, hr * 1.08, hr * .8, 0, Math.PI, TAU); g.fill(); hairLines([[-hr * .7, -hr * .45, 0, -hr * .95], [0, -hr * .95, hr * .7, -hr * .45]]); }
  if (hs === 'bun') { g.beginPath(); g.ellipse(0, hy - hr * .36, hr * 1.04, hr * .72, 0, Math.PI, TAU); g.fill(); circle(g, 0, hy - hr * 1.14, hr * .5); g.fill(); hairLines([[-hr * .6, -hr * .5, hr * .6, -hr * .5]]); }
  if (hs === 'curly') { for (let i = 0; i < 9; i++) { const a = -Math.PI * .12 - i / 8 * Math.PI * .76; circle(g, Math.cos(a) * hr * .82, hy - hr * .18 + Math.sin(a) * hr * .76, hr * .4); g.fill(); } }
  if (hs === 'grey') { g.fillStyle = '#ecebf2'; for (let i = 0; i < 8; i++) { const a = -Math.PI * .06 - i / 7 * Math.PI * .88; circle(g, Math.cos(a) * hr * .93, hy - hr * .08 + Math.sin(a) * hr * .84, hr * .38); g.fill(); } }
  if (hs === 'bob') { g.beginPath(); g.ellipse(0, hy - hr * .28, hr * 1.1, hr * .84, 0, Math.PI, TAU); g.fill(); rr(g, -hr * .98, hy - hr * .78, hr * 1.96, hr * .46, hr * .2); g.fill(); hairLines([[-hr * .5, -hr * .8, hr * .1, -hr * .98]]); }
  if (hs === 'afro') { g.beginPath(); g.ellipse(0, hy - hr * .42, hr * 1.02, hr * .66, 0, Math.PI, TAU); g.fill(); }
  if (hs === 'pony') { g.beginPath(); g.ellipse(0, hy - hr * .32, hr * 1.06, hr * .78, 0, Math.PI, TAU); g.fill(); hairLines([[-hr * .75, -hr * .4, hr * .2, -hr * .95], [-hr * .2, -hr * .7, hr * .8, -hr * .45]]); }
  if (hs === 'bald' && !small) { g.save(); g.ink = null; g.fillStyle = 'rgba(255,255,255,.28)'; ellipse(g, -hr * .35, hy - hr * .62, hr * .3, hr * .14, -.4); g.fill(); g.restore(); }
  if (hs === 'cap') { g.fillStyle = o.hatColor || '#e05a47'; g.beginPath(); g.ellipse(0, hy - hr * .34, hr * 1.06, hr * .84, 0, Math.PI, TAU); g.closePath(); g.fill(); g.fillStyle = shade(o.hatColor || '#e05a47', -.25); ellipse(g, 0, hy - hr * .36, hr * 1.3, hr * .2); g.fill(); g.fillStyle = shade(o.hatColor || '#e05a47', .3); circle(g, 0, hy - hr * 1.14, hr * .11); g.fill(); }
  if (hs === 'beanie') { g.fillStyle = o.hatColor || '#e05a47'; g.beginPath(); g.ellipse(0, hy - hr * .3, hr * 1.08, hr * .98, 0, Math.PI, TAU); g.closePath(); g.fill(); rr(g, -hr * 1.1, hy - hr * .45, hr * 2.2, hr * .42, hr * .16); g.fill(); circle(g, 0, hy - hr * 1.28, hr * .24); g.fill(); }
  // Face.
  g.ink = null;
  const fx = (o.look?.[0] || 0) * u * .8, fyy = (o.look?.[1] || 0) * u * .4;
  const ey = hy + u * .4 + fyy;
  const ic = '#22160f';
  g.fillStyle = ic; g.strokeStyle = ic; g.lineCap = 'round';
  const e = o.eyes || 'open';
  for (const side of [-1, 1]) {
    const cx = side * u * 1.55 + fx;
    if (e === 'happy') { g.lineWidth = u * .44; g.beginPath(); g.moveTo(cx - u * .62, ey + u * .2); g.quadraticCurveTo(cx, ey - u * .72, cx + u * .62, ey + u * .2); g.stroke(); }
    else if (e === 'closed') { g.lineWidth = u * .4; g.beginPath(); g.moveTo(cx - u * .6, ey - u * .1); g.quadraticCurveTo(cx, ey + u * .45, cx + u * .6, ey - u * .1); g.stroke(); }
    else if (e === 'star') { g.fillStyle = '#ffd35a'; star(g, cx, ey, u * .95, u * .4, 5); g.fill(); g.fillStyle = ic; }
    else if (e === 'wide') { g.fillStyle = '#fffaf0'; circle(g, cx, ey, u * .9); g.fill(); g.fillStyle = ic; circle(g, cx + fx * .1, ey, u * .48); g.fill(); }
    else { const bl = 1 - (o.blink || 0) * .85; g.beginPath(); g.ellipse(cx, ey, u * .5, u * .64 * bl, 0, 0, TAU); g.fill(); if (bl > .5 && !small) { g.fillStyle = '#fff'; circle(g, cx - u * .15, ey - u * .22, u * .15); g.fill(); g.fillStyle = ic; } }
    // Brows: they do most of the acting.
    if (!small && !o.noBrows) {
      const br = o.brow || (e === 'wide' ? 'up' : o.frown ? 'worry' : 'calm');
      const lift = br === 'up' ? -u * .55 : br === 'down' ? u * .1 : 0;
      const tilt = br === 'worry' ? -side * u * .35 : br === 'down' ? side * u * .3 : 0;
      g.lineWidth = u * .34;
      g.beginPath(); g.moveTo(cx - u * .6, ey - u * 1.3 + lift + tilt); g.quadraticCurveTo(cx, ey - u * 1.55 + lift, cx + u * .6, ey - u * 1.3 + lift - tilt); g.stroke();
    }
  }
  if (!small) { g.lineWidth = u * .28; g.beginPath(); g.moveTo(fx - u * .15, ey + u * .75); g.quadraticCurveTo(fx + u * .3, ey + u * 1.05, fx - u * .1, ey + u * 1.25); g.stroke(); }
  if (o.glasses === 'round') { g.ink = null; g.strokeStyle = '#2a2230'; g.lineWidth = u * .36; circle(g, -u * 1.55 + fx, ey, u * 1.25); g.stroke(); circle(g, u * 1.55 + fx, ey, u * 1.25); g.stroke(); line(g, -u * .3 + fx, ey, u * .3 + fx, ey); g.stroke(); }
  if (o.glasses === 'dark') { g.fillStyle = '#15131c'; rr(g, -u * 3.1 + fx, ey - u * 1, u * 2.7, u * 1.9, u * .7); g.fill(); rr(g, u * .4 + fx, ey - u * 1, u * 2.7, u * 1.9, u * .7); g.fill(); g.fillRect(-u * .6 + fx, ey - u * .6, u * 1.2, u * .4); }
  // Cheeks.
  g.fillStyle = 'rgba(255,110,120,.3)'; ellipse(g, -u * 2.6 + fx, ey + u * 1.4, u * .95, u * .52); g.fill(); ellipse(g, u * 2.6 + fx, ey + u * 1.4, u * .95, u * .52); g.fill();
  // Mouth.
  const my = hy + u * 2.3 + fyy, m = o.mouth ?? 0;
  if (m > .05) { g.fillStyle = '#5a1f1f'; g.beginPath(); g.ellipse(fx, my, u * (.8 + m * .3), u * (.3 + m * 1.1), 0, 0, TAU); g.fill(); if (m > .4) { g.fillStyle = '#e8566a'; g.beginPath(); g.ellipse(fx, my + u * (.2 + m * .6), u * .5, u * .3, 0, 0, TAU); g.fill(); } }
  else { g.strokeStyle = ic; g.lineWidth = u * .34; g.beginPath(); g.moveTo(fx - u * .8, my - u * .1); g.quadraticCurveTo(fx, my + u * (o.frown ? -.5 : .6), fx + u * .8, my - u * .1); g.stroke(); }
  g.ink = ink;
  if (o.extra) o.extra(g, u, hy, hr);
  g.restore();
}
