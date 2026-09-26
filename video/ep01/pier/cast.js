// The cast: Clawd (the singer, after the Claude Code mascot), the Bots (Molty, Grok, Blossom,
// Muse) and the people. Every character is drawn at a position with a pose object, as a soft
// vinyl toy: gradient body, a rim of the scene's light, a glossy highlight, a contact shadow.
import { C, TAU, clamp, lerp, smooth, rr, circle, ellipse, heart, star, glow, rgba, mix, shade, rnd, noise1, vgrad, rgrad, lgrad, line } from './kit.js';

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
  if (claw.length >= 3) MARKS.molty = { vb: 120, body: new Path2D(claw[0].d), clawL: new Path2D(claw[1].d), clawR: new Path2D(claw[2].d) };
  const muse = paths(await get('muse-logo.svg'));
  if (muse.length) MARKS.muse = { vb: 100, paths: muse.map(p => new Path2D(p.d)) };
}

// ---------------------------------------------------------------- shadows and rims
export function contactShadow(g, x, y, w, a = .45) {
  g.save();
  g.fillStyle = rgrad(g, x, y, 0, w * .55, [[0, `rgba(0,0,8,${a})`], [1, 'rgba(0,0,8,0)']]);
  g.scale(1, .22); circle(g, x, y / .22, w * .55); g.fill();
  g.restore();
}

// ---------------------------------------------------------------- CLAWD
// o: { s: body width px, eyes, look: [lx, ly], mouth 0..1, squash, lean, armL, armR (radians,
//      0 = straight out, negative = up), ext (arm stretch), legs (beat phase for stepping),
//      rim: hex, rimSide: -1|1, blush, hat, glasses, glowEyes, hold: fn(g, u) at right arm tip,
//      holdL: fn at left arm tip, alpha, dark (0..1 silhouette toward night), heart 0..1 }
export function clawd(g, x, y, o = {}) {
  const s = o.s || 300, u = s / 6;
  const gr = groove(x, o);
  const sq = (o.squash || 0) + gr.sq * .06;
  const sx = 1 + sq * .45, sy = 1 - sq;
  g.save();
  g.translate(x, y - gr.bob * u * .35);
  if (o.alpha !== undefined) g.globalAlpha *= o.alpha;
  if (o.shadow !== false) contactShadow(g, 0, 0, s * 1.15 * sx, o.shadowA ?? .4);
  g.rotate(o.lean || 0);
  // Legs: four stubs that step with the beat.
  const legY = -u;
  const legs = [-2.25, -1.25, 1.25, 2.25];
  legs.forEach((lx, i) => {
    const ph = o.legs === undefined ? 0 : Math.max(0, Math.sin((o.legs + (i % 2) * .5) * TAU));
    const lift = ph * u * .35;
    g.fillStyle = vgrad(g, legY - lift, 0, [[0, C.clawdDark], [1, shade(C.clawdDark, -.25)]]);
    rr(g, lx * u * sx - u * .25, legY - lift, u * .5, u * (1 - ph * .15), u * .12); g.fill();
    if (o.dark) { g.fillStyle = rgba('#140c30', o.dark * .9); g.fill(); }
  });
  // Body frame (after squash): x in [-3u, 3u]*sx, y in [-u - 4u*sy, -u].
  const bw = 6 * u * sx, bh = 4 * u * sy, bx = -bw / 2, by = legY - bh;
  // Arms (behind the body edge): squares pivoting at the body side, mid-height.
  const armY = by + bh * .5 + bh * .125 - bh * .125;
  const drawArm = (side, ang, ext = 1, hold) => {
    g.save();
    g.translate(side * bw / 2, by + bh * .625);
    g.rotate(side * (ang || 0));
    g.fillStyle = vgrad(g, -u * .5, u * .5, [[0, C.clawdLit], [.5, C.clawd], [1, C.clawdDark]]);
    rr(g, side > 0 ? -u * .2 : -u * (ext + .05), -u * .5, u * (ext + .25), u, u * .22); g.fill();
    if (o.dark) { g.fillStyle = rgba('#140c30', o.dark * .9); g.fill(); }
    if (o.rim && !o.dark) { g.strokeStyle = rgba(o.rim, .5); g.lineWidth = u * .08; g.stroke(); }
    if (hold) { g.translate(side * u * (ext + .05), 0); g.rotate(-side * (ang || 0)); hold(g, u); }
    g.restore();
  };
  drawArm(-1, o.armL ?? 0, o.extL ?? o.ext ?? 1, o.holdL);
  // Body with soft-vinyl shading: lit top, rounded sides, a gloss spot, occluded base.
  const r = u * .42;
  rr(g, bx, by, bw, bh, r);
  g.fillStyle = vgrad(g, by, by + bh, [[0, '#f7ad88'], [.2, '#eb8f68'], [.62, C.clawd], [1, '#b85f40']]);
  g.fill();
  g.save(); g.clip();
  g.fillStyle = lgrad(g, bx, 0, bx + bw, 0, [[0, 'rgba(110,35,15,.32)'], [.16, 'rgba(110,35,15,0)'], [.84, 'rgba(110,35,15,0)'], [1, 'rgba(110,35,15,.36)']]);
  g.fillRect(bx, by, bw, bh);
  g.fillStyle = rgrad(g, bx + bw * .27, by + bh * .2, 0, bw * .36, [[0, 'rgba(255,248,238,.5)'], [.5, 'rgba(255,248,238,.12)'], [1, 'rgba(255,248,238,0)']]);
  g.fillRect(bx, by, bw, bh);
  g.fillStyle = vgrad(g, by + bh * .72, by + bh, [[0, 'rgba(70,18,8,0)'], [1, 'rgba(70,18,8,.3)']]);
  g.fillRect(bx, by, bw, bh);
  // A thin bevel catching light along the top edge.
  g.strokeStyle = 'rgba(255,236,220,.45)'; g.lineWidth = u * .14;
  g.beginPath(); g.moveTo(bx + r, by + u * .16); g.lineTo(bx + bw - r, by + u * .16); g.stroke();
  if (o.dark) { g.fillStyle = rgba('#140c30', o.dark * .85); g.fillRect(bx, by, bw, bh); }
  // Rim light: a crisp band down one side fading along the top (gone when the lights are out).
  if (o.rim && (o.dark || 0) < .6) {
    g.globalAlpha *= 1 - (o.dark || 0) / .6;
    const side = o.rimSide || 1;
    g.lineWidth = u * .5;
    g.strokeStyle = lgrad(g, side * bw / 2, 0, -side * bw / 2, 0, [[0, rgba(o.rim, .95)], [.25, rgba(o.rim, .25)], [.5, rgba(o.rim, 0)]]);
    rr(g, bx, by, bw, bh, r); g.stroke();
    g.fillStyle = lgrad(g, side * bw / 2, 0, side * (bw / 2 - u * 1.4), 0, [[0, rgba(o.rim, .35)], [1, rgba(o.rim, 0)]]);
    g.fillRect(bx, by, bw, bh);
  }
  g.restore();
  // Face (none when we see Clawd from behind).
  const lookX = (o.look?.[0] || 0) * u * .45, lookY = (o.look?.[1] || 0) * u * .3;
  const ex = 1.75 * u * sx, ey = by + 1.5 * u * sy + lookY;
  const eyes = o.back ? 'none' : (o.eyes || 'open');
  const eyeCol = o.glowEyes ? mix(C.cream, '#ffe6b0', .5) : C.eye;
  if (o.glowEyes) { glow(g, -ex + lookX, ey, u * 1.6, C.gold, .6 * o.glowEyes); glow(g, ex + lookX, ey, u * 1.6, C.gold, .6 * o.glowEyes); }
  for (const side of [-1, 1]) {
    const cx = side * ex + lookX;
    g.fillStyle = eyeCol; g.strokeStyle = eyeCol; g.lineCap = 'round'; g.lineJoin = 'round';
    if (eyes === 'happy') {
      g.lineWidth = u * .28;
      g.beginPath(); g.moveTo(cx - u * .38, ey + u * .2); g.quadraticCurveTo(cx, ey - u * .55, cx + u * .38, ey + u * .2); g.stroke();
    } else if (eyes === 'closed') {
      g.lineWidth = u * .24;
      g.beginPath(); g.moveTo(cx - u * .36, ey - u * .05); g.quadraticCurveTo(cx, ey + u * .38, cx + u * .36, ey - u * .05); g.stroke();
    } else if (eyes === 'squeeze') {
      g.lineWidth = u * .24;
      g.beginPath(); g.moveTo(cx - side * u * .35, ey - u * .35); g.lineTo(cx + side * u * .2, ey); g.lineTo(cx - side * u * .35, ey + u * .35); g.stroke();
    } else if (eyes === 'star') {
      g.fillStyle = C.gold; star(g, cx, ey, u * .62, u * .26, 5); g.fill();
      glow(g, cx, ey, u * 1.2, C.gold, .5);
    } else if (eyes === 'heart') {
      g.fillStyle = C.pink; heart(g, cx, ey + u * .1, u * 1.1); g.fill();
    } else if (eyes === 'spiral') {
      g.lineWidth = u * .13;
      g.beginPath();
      for (let k = 0; k < 40; k++) { const a = k / 40 * TAU * 2.2 + (o.t || 0) * 9 * side; const rr2 = u * .05 + k / 40 * u * .5; const px = cx + Math.cos(a) * rr2, py = ey + Math.sin(a) * rr2; k ? g.lineTo(px, py) : g.moveTo(px, py); }
      g.stroke();
    } else if (eyes === 'none') {
    } else {
      let w = u * .5, h = u;
      if (eyes === 'wide') { w = u * .62; h = u * 1.3; }
      if (eyes === 'worried') { h = u * .9; }
      const blink = o.blink || 0;
      h *= 1 - blink * .88;
      rr(g, cx - w / 2, ey - h / 2, w, h, w * .45); g.fill();
      if (!o.glowEyes && blink < .5) {
        g.fillStyle = 'rgba(255,255,255,.85)';
        circle(g, cx - w * .14, ey - h * .22, w * .17); g.fill();
      }
      if (eyes === 'worried') {
        g.strokeStyle = C.eye; g.lineWidth = u * .16;
        line(g, cx - side * u * .45, ey - u * .95, cx + side * u * .2, ey - u * .75); g.stroke();
      }
    }
  }
  // Blush.
  if (o.blush && !o.back) {
    g.fillStyle = rgba('#ff5b7a', .35 * o.blush);
    for (const side of [-1, 1]) { ellipse(g, side * (ex + u * .55) + lookX, ey + u * .75, u * .45, u * .22); g.fill(); }
  }
  // Mouth: opens with the vocal.
  const m = o.back ? 0 : clamp(o.mouth || 0);
  const my = ey + u * 1.25;
  if (m > .04) {
    const mw = u * (.55 + m * .35), mh = u * (.18 + m * .95);
    g.fillStyle = '#4a1712';
    rr(g, lookX - mw / 2, my - mh * .35, mw, mh, Math.min(mw, mh) * .48); g.fill();
    if (m > .35) {
      g.save(); rr(g, lookX - mw / 2, my - mh * .35, mw, mh, Math.min(mw, mh) * .48); g.clip();
      g.fillStyle = '#e8566a'; ellipse(g, lookX, my + mh * .62, mw * .42, mh * .32); g.fill();
      g.restore();
    }
  } else if (o.smile && !o.back) {
    g.strokeStyle = C.eye; g.lineWidth = u * .16; g.lineCap = 'round';
    g.beginPath(); g.moveTo(lookX - u * .35, my - u * .05); g.quadraticCurveTo(lookX, my + u * .3 * o.smile, lookX + u * .35, my - u * .05); g.stroke();
  } else if (o.frown && !o.back) {
    g.strokeStyle = C.eye; g.lineWidth = u * .15; g.lineCap = 'round';
    g.beginPath(); g.moveTo(lookX - u * .3, my + u * .12); g.quadraticCurveTo(lookX, my - u * .12, lookX + u * .3, my + u * .12); g.stroke();
  }
  // Heart glowing inside (the break).
  if (o.heart) {
    glow(g, 0, by + bh * .72, u * 3 * o.heart, C.pink, .7 * o.heart);
    g.fillStyle = rgba('#ff6f9f', o.heart); heart(g, 0, by + bh * .74, u * 1.1 * (1 + .06 * Math.sin((o.t || 0) * 9))); g.fill();
  }
  drawArm(1, o.armR ?? 0, o.extR ?? o.ext ?? 1, o.hold);
  // Hats and glasses.
  if (o.hat === 'party') partyHat(g, u * 1.2, by + u * .15, u, -.25);
  if (o.hat === 'guard') guardCap(g, 0, by + u * .2, u);
  if (o.hat === 'sun') sunHat(g, 0, by + u * .25, u);
  if (o.glasses) sunglasses(g, lookX, ey, u, ex);
  if (o.sweat) { g.fillStyle = rgba('#bfe8ff', .9 * o.sweat); const sx0 = bw / 2 - u * .6, sy0 = by + u * .5 + (1 - o.sweat) * u; g.beginPath(); g.moveTo(sx0, sy0 - u * .45); g.quadraticCurveTo(sx0 + u * .3, sy0 + u * .05, sx0, sy0 + u * .15); g.quadraticCurveTo(sx0 - u * .3, sy0 + u * .05, sx0, sy0 - u * .45); g.fill(); }
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
  g.fillStyle = '#26243a'; rr(g, -u * .18, -u * .2, u * .36, u * 1.8, u * .15); g.fill();
  g.fillStyle = rgrad(g, -u * .15, -u * .55, 0, u * .6, [[0, '#f4f4ff'], [.5, '#9a9ab8'], [1, '#4c4a66']]);
  circle(g, 0, -u * .45, u * .48); g.fill();
  g.strokeStyle = 'rgba(40,40,60,.5)'; g.lineWidth = u * .05;
  for (let i = -2; i <= 2; i++) { line(g, -u * .4, -u * .45 + i * u * .16, u * .4, -u * .45 + i * u * .16); g.stroke(); }
  g.restore();
}
export function micStand(g, x, y, h, u) {
  g.strokeStyle = '#2a2840'; g.lineWidth = u * .22; g.lineCap = 'round';
  line(g, x, y, x, y - h); g.stroke();
  line(g, x - u * 1.1, y, x + u * 1.1, y); g.stroke();
}

// ---------------------------------------------------------------- MOLTY (OpenClaw)
export function molty(g, x, y, o = {}) {
  const s = o.s || 260, k = s / 120;
  const gr = groove(x, o);
  g.save(); g.translate(x, y);
  if (o.shadow !== false) contactShadow(g, 0, 0, s * .9, .38);
  g.translate(0, -gr.bob * s * .05);
  g.rotate((o.lean || 0) + Math.sin(GROOVE.bp * Math.PI) * .04 * GROOVE.amp);
  const sq = (o.squash || 0) + gr.sq * .07;
  g.scale(k * (1 + sq * .35), k * (1 - sq));
  g.translate(-60, -110);
  const grad = lgrad(g, 20, 10, 100, 110, [[0, '#ff5a52'], [.55, '#e0302f'], [1, '#8f1a1d']]);
  // Antennae, springy.
  const wob = o.t !== undefined ? Math.sin(o.t * 11) * 2.2 * (o.bounce ?? 1) : 0;
  g.strokeStyle = '#ff5a52'; g.lineWidth = 3; g.lineCap = 'round';
  g.beginPath(); g.moveTo(45, 15); g.quadraticCurveTo(35 + wob, 3, 28 + wob * 1.5, 7 - wob * .5); g.stroke();
  g.beginPath(); g.moveTo(75, 15); g.quadraticCurveTo(85 - wob, 3, 92 - wob * 1.5, 7 - wob * .5); g.stroke();
  // Claws pivot at the shoulders.
  const claw = (side, ang, path) => {
    g.save();
    const px = side < 0 ? 24 : 96, py = 52;
    g.translate(px, py); g.rotate(ang || 0); g.translate(-px, -py);
    g.fillStyle = grad;
    if (path) g.fill(path);
    else { g.beginPath(); g.ellipse(px + side * 10, py, 13, 11, 0, 0, TAU); g.fill(); }
    g.restore();
  };
  claw(-1, o.clawL, MARKS.molty?.clawL);
  g.fillStyle = grad;
  if (MARKS.molty) g.fill(MARKS.molty.body);
  else { g.beginPath(); g.ellipse(60, 58, 45, 46, 0, 0, TAU); g.fill(); g.fillRect(45, 95, 10, 15); g.fillRect(65, 95, 10, 15); }
  // Gloss and rim.
  g.save();
  if (MARKS.molty) g.clip(MARKS.molty.body);
  g.fillStyle = rgrad(g, 42, 30, 0, 38, [[0, 'rgba(255,220,210,.45)'], [1, 'rgba(255,220,210,0)']]);
  g.fillRect(0, 0, 120, 120);
  if (o.rim) { g.fillStyle = lgrad(g, 105, 0, 80, 0, [[0, rgba(o.rim, .6)], [1, rgba(o.rim, 0)]]); g.fillRect(0, 0, 120, 120); }
  g.restore();
  claw(1, o.clawR, MARKS.molty?.clawR);
  // Eyes.
  const lx = (o.look?.[0] || 0) * 2, ly = (o.look?.[1] || 0) * 2;
  if (o.eyes === 'happy') {
    g.strokeStyle = '#050810'; g.lineWidth = 3.4;
    for (const ex of [45, 75]) { g.beginPath(); g.moveTo(ex - 6, 37); g.quadraticCurveTo(ex, 27, ex + 6, 37); g.stroke(); }
  } else {
    const bl = 1 - (o.blink || 0) * .85;
    for (const ex of [45, 75]) {
      g.fillStyle = '#050810'; g.beginPath(); g.ellipse(ex + lx, 35 + ly, 6.4, 6.4 * bl, 0, 0, TAU); g.fill();
      if (bl > .4) { g.fillStyle = '#00e5cc'; circle(g, ex + 1 + lx * 1.4, 34 + ly, 2.6); g.fill(); g.fillStyle = '#fff'; circle(g, ex - 1.8 + lx, 32.6 + ly, 1.2); g.fill(); }
    }
  }
  if (o.mouth > .05) { g.fillStyle = '#4b0d10'; g.beginPath(); g.ellipse(60, 52, 5 + o.mouth * 3, 1.5 + o.mouth * 7, 0, 0, TAU); g.fill(); }
  else { g.strokeStyle = '#4b0d10'; g.lineWidth = 2; g.beginPath(); g.moveTo(55, 50); g.quadraticCurveTo(60, 54, 65, 50); g.stroke(); }
  g.restore();
}

// ---------------------------------------------------------------- the marks, exactly as provided
// Corporate marks are never redrawn or restyled (their owners forbid alteration). They appear only
// as badges: the mark's own artwork in its own colours, uniformly scaled, next to a character.
export function grokBadge(g, x, y, s) {
  g.save(); g.translate(x - s / 2, y - s / 2);
  const k = s / 512; g.scale(k, k);
  g.fillStyle = '#050505'; rr(g, 0, 0, 512, 512, 118); g.fill();
  g.fillStyle = '#FCFCFC';
  if (MARKS.grok) MARKS.grok.paths.forEach(p => g.fill(p));
  g.restore();
}
export function blossomBadge(g, x, y, s) {
  g.save();
  g.fillStyle = '#ffffff'; circle(g, x, y, s * .62); g.fill();
  g.translate(x - s / 2, y - s / 2);
  const k = s / 320; g.scale(k, k);
  g.fillStyle = '#000000';
  if (MARKS.blossom) MARKS.blossom.paths.forEach(p => g.fill(p));
  g.restore();
}
export function museBadge(g, x, y, s) {
  if (!MARKS.muse) return;
  g.save(); g.translate(x - s / 2, y - s / 2);
  const k = s / 100; g.scale(k, k);
  g.fillStyle = lgrad(g, 0, 0, 100, 100, [[0, '#0082FB'], [1, '#0040DC']]);
  MARKS.muse.paths.forEach(p => g.fill(p));
  g.restore();
}

// ---------------------------------------------------------------- GROK'S BOT (drummer)
// Its own robot: a glossy black body, white LED eyes, an antenna. It wears Grok's mark as a badge.
export function grok(g, x, y, o = {}) {
  const s = o.s || 240, u = s / 10;
  const gr = groove(x, o);
  g.save(); g.translate(x, y);
  if (o.shadow !== false) contactShadow(g, 0, 0, s * .95, .4);
  g.translate(0, -gr.bob * s * .04);
  g.rotate(o.lean || 0);
  const sq = (o.squash || 0) + gr.sq * .06;
  g.scale(1 + sq * .35, 1 - sq);
  // Legs.
  g.fillStyle = '#16161c';
  rr(g, -u * 2.8, -u * 1.7, u * 1.6, u * 1.7, u * .6); g.fill();
  rr(g, u * 1.2, -u * 1.7, u * 1.6, u * 1.7, u * .6); g.fill();
  // Antenna.
  g.strokeStyle = '#2a2a34'; g.lineWidth = u * .35; line(g, 0, -u * 11, 0, -u * 12.6); g.stroke();
  glow(g, 0, -u * 12.8, u * 1.6, '#dfe9ff', .5); g.fillStyle = '#eef4ff'; circle(g, 0, -u * 12.8, u * .55); g.fill();
  // Body: a round-shouldered dome.
  const bx = -u * 4.8, by = -u * 11.2, bw = u * 9.6, bh = u * 9.6;
  const body = () => { g.beginPath(); g.moveTo(bx, by + bh); g.lineTo(bx, by + bh * .42); g.bezierCurveTo(bx, by - bh * .06, bx + bw, by - bh * .06, bx + bw, by + bh * .42); g.lineTo(bx + bw, by + bh - u); g.quadraticCurveTo(bx + bw, by + bh, bx + bw - u, by + bh); g.lineTo(bx + u, by + bh); g.quadraticCurveTo(bx, by + bh, bx, by + bh - u); g.closePath(); };
  body();
  g.fillStyle = vgrad(g, by, by + bh, [[0, '#4a4a58'], [.4, '#1e1e26'], [1, '#0a0a0e']]); g.fill();
  g.save(); body(); g.clip();
  g.fillStyle = rgrad(g, bx + bw * .3, by + bh * .15, 0, bw * .55, [[0, 'rgba(255,255,255,.25)'], [1, 'rgba(255,255,255,0)']]); g.fillRect(bx, by, bw, bh);
  if (o.rim) { g.fillStyle = lgrad(g, bx + bw, 0, bx + bw * .78, 0, [[0, rgba(o.rim, .7)], [1, rgba(o.rim, 0)]]); g.fillRect(bx, by, bw, bh); }
  g.restore();
  // Face: a dark visor with two white LED eyes.
  g.fillStyle = '#050508'; rr(g, -u * 3.4, by + u * 1.6, u * 6.8, u * 3, u * 1.4); g.fill();
  const bl = 1 - (o.blink || 0) * .85, lx = (o.look?.[0] || 0) * u * .5;
  g.fillStyle = '#eef4ff';
  if (o.eyes === 'happy') { g.strokeStyle = '#eef4ff'; g.lineWidth = u * .45; g.lineCap = 'round'; for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * u * 1.4 - u * .55 + lx, by + u * 3.4); g.quadraticCurveTo(sd * u * 1.4 + lx, by + u * 2.4, sd * u * 1.4 + u * .55 + lx, by + u * 3.4); g.stroke(); } }
  else for (const sd of [-1, 1]) { rr(g, sd * u * 1.4 - u * .45 + lx, by + u * 3.1 - u * .8 * bl, u * .9, u * 1.6 * bl, u * .4); g.fill(); }
  glow(g, 0, by + u * 3.1, u * 3, '#dfe9ff', .25);
  // Grok's mark, as a badge on its chest.
  grokBadge(g, 0, by + bh * .7, u * 3.2);
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = u * .12; rr(g, -u * 1.6, by + bh * .7 - u * 1.6, u * 3.2, u * 3.2, u * .74); g.stroke();
  // Arms with sticks.
  const stick = (side, ang) => {
    g.save(); g.translate(side * u * 4.8, -u * 5.2); g.rotate(ang);
    g.fillStyle = '#1e1e26'; rr(g, -u * .55, -u * .55, u * 3.2, u * 1.1, u * .55); g.fill();
    if (o.sticks !== false) { g.strokeStyle = '#e8c890'; g.lineWidth = u * .45; g.lineCap = 'round'; line(g, u * 2.6, 0, u * 7.6, -u * .6); g.stroke(); }
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
  g.save(); g.translate(x, y);
  if (o.shadow !== false) contactShadow(g, 0, 0, s * .8, .38);
  g.translate(0, -gr.bob * s * .04);
  g.rotate((o.lean || 0) + Math.sin(GROOVE.bp * Math.PI + 1) * .035 * GROOVE.amp);
  const sq = (o.squash || 0) + gr.sq * .06;
  g.scale(1 + sq * .35, 1 - sq);
  const pearl = (y0, y1) => vgrad(g, y0, y1, [[0, '#ffffff'], [.6, '#e9ebf3'], [1, '#b9bdcc']]);
  // Feet and body.
  g.fillStyle = '#c9ccd8'; rr(g, -u * 2.5, -u * 1.3, u * 1.5, u * 1.3, u * .6); g.fill(); rr(g, u * 1, -u * 1.3, u * 1.5, u * 1.3, u * .6); g.fill();
  g.fillStyle = pearl(-u * 6.4, 0); rr(g, -u * 3.3, -u * 6.4, u * 6.6, u * 5.4, u * 2.4); g.fill();
  // The OpenAI mark on its chest.
  blossomBadge(g, 0, -u * 3.7, u * 2.6);
  g.strokeStyle = 'rgba(40,40,60,.25)'; g.lineWidth = u * .1; circle(g, 0, -u * 3.7, u * 1.62); g.stroke();
  // Head: a round pearl dome with ear discs.
  const hy = -u * 9.6, hr = u * 3.9;
  for (const sd of [-1, 1]) { g.fillStyle = '#d6d9e4'; circle(g, sd * hr * .98, hy + u * .3, u * .9); g.fill(); }
  g.fillStyle = rgrad(g, -hr * .35, hy - hr * .35, 0, hr * 1.3, [[0, '#ffffff'], [.7, '#eef0f6'], [1, '#c9ccda']], 0, hy);
  circle(g, 0, hy, hr); g.fill();
  if (o.rim) { g.save(); circle(g, 0, hy, hr); g.clip(); g.fillStyle = lgrad(g, hr, 0, hr * .5, 0, [[0, rgba(o.rim, .55)], [1, rgba(o.rim, 0)]]); g.fillRect(-hr, hy - hr, hr * 2, hr * 2); g.restore(); }
  // Face.
  const bl = 1 - (o.blink || 0) * .85, lx = (o.look?.[0] || 0) * u * .5;
  g.fillStyle = '#1a1a24';
  if (o.eyes === 'happy') {
    g.strokeStyle = '#1a1a24'; g.lineWidth = u * .42; g.lineCap = 'round';
    for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * u * 1.3 - u * .5 + lx, hy + u * .1); g.quadraticCurveTo(sd * u * 1.3 + lx, hy - u * .8, sd * u * 1.3 + u * .5 + lx, hy + u * .1); g.stroke(); }
  } else {
    for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(sd * u * 1.3 + lx, hy - u * .2, u * .5, u * .7 * bl, 0, 0, TAU); g.fill(); if (bl > .5) { g.fillStyle = '#fff'; circle(g, sd * u * 1.3 - u * .15 + lx, hy - u * .45, u * .16); g.fill(); g.fillStyle = '#1a1a24'; } }
  }
  if (o.mouth > .05) { g.fillStyle = '#3a1418'; g.beginPath(); g.ellipse(lx, hy + u * 1.3, u * .55, u * (.2 + o.mouth * .6), 0, 0, TAU); g.fill(); }
  else { g.strokeStyle = '#1a1a24'; g.lineWidth = u * .3; g.lineCap = 'round'; g.beginPath(); g.moveTo(lx - u * .55, hy + u * 1.05); g.quadraticCurveTo(lx, hy + u * 1.55, lx + u * .55, hy + u * 1.05); g.stroke(); }
  g.fillStyle = 'rgba(255,120,140,.35)'; ellipse(g, -u * 2.3, hy + u * .8, u * .7, u * .4); g.fill(); ellipse(g, u * 2.3, hy + u * .8, u * .7, u * .4); g.fill();
  g.restore();
}


// ---------------------------------------------------------------- MUSE (fuzzy, in headphones)
export function muse(g, x, y, o = {}) {
  const s = o.s || 260, u = s / 10;
  const gr = groove(x, o);
  g.save(); g.translate(x, y);
  if (o.shadow !== false) contactShadow(g, 0, 0, s * .95, .36);
  g.translate(0, -gr.bob * s * .03);
  g.rotate((o.lean || 0) + Math.sin(GROOVE.bp * Math.PI / 2) * .04 * GROOVE.amp);
  const sq = (o.squash || 0) + gr.sq * .05;
  g.scale(1 + sq * .35, 1 - sq);
  const top = -u * 13.5;
  // Fuzzy body: an arched bean with fur along the edge.
  const body = () => {
    g.beginPath();
    g.moveTo(-u * 5, 0);
    g.bezierCurveTo(-u * 5.6, -u * 6, -u * 5.4, top + u * 1.5, 0, top);
    g.bezierCurveTo(u * 5.4, top + u * 1.5, u * 5.6, -u * 6, u * 5, 0);
    g.closePath();
  };
  body();
  g.fillStyle = rgrad(g, -u * 1.8, top + u * 3.5, 0, u * 13, [[0, '#f3e1c9'], [.5, '#dcc0a0'], [1, '#a88866']]);
  g.fill();
  // Fur: short strands over the whole silhouette, lit from the upper left, swaying a touch.
  g.lineCap = 'round';
  const sway = Math.sin((o.t || 0) * 3) * .08;
  const rx = u * 5.15, ry = u * 13.1;
  for (let i = 0; i < 260; i++) {
    const a = Math.PI * (i / 259) + (rnd(i, 71) - .5) * .02;
    const bxp = Math.cos(a) * rx * .97, byp = -Math.sin(a) * ry * .985;
    let nx = Math.cos(a) / rx, ny = -Math.sin(a) / ry; const nl = Math.hypot(nx, ny); nx /= nl; ny /= nl;
    const ang = Math.atan2(ny, nx) + (rnd(i, 72) - .5) * .9 + sway + .35;
    const len = u * (.45 + .45 * rnd(i, 73));
    const light = clamp(.55 - Math.cos(a) * .35 + Math.sin(a) * .25 + (rnd(i, 74) - .5) * .3);
    g.strokeStyle = mix('#9d7b5a', '#f7e9d6', light);
    g.lineWidth = u * (.22 + .12 * rnd(i, 75));
    line(g, bxp - nx * u * .25, byp - ny * u * .25, bxp + Math.cos(ang) * len, byp + Math.sin(ang) * len); g.stroke();
  }
  // Soft inner texture.
  g.save(); body(); g.clip();
  for (let i = 0; i < 180; i++) {
    const px = (rnd(i, 81) - .5) * u * 10, py = top + rnd(i, 82) * -top;
    const light = clamp(.6 - px / (u * 12) - (py - top) / (-top) * .4);
    g.strokeStyle = mix('#a78562', '#fff2e2', light); g.globalAlpha = .35;
    g.lineWidth = u * .16;
    line(g, px, py, px + (rnd(i, 83) - .5) * u * .4, py + u * .5); g.stroke();
  }
  g.globalAlpha = 1;
  g.restore();
  if (o.rim) { g.save(); body(); g.clip(); g.fillStyle = lgrad(g, u * 5.5, 0, u * 3, 0, [[0, rgba(o.rim, .55)], [1, rgba(o.rim, 0)]]); g.fillRect(-u * 6, top, u * 12, -top); g.restore(); }
  // Face.
  const fy = top + u * 5.4;
  g.fillStyle = rgrad(g, -u * .8, fy - u * 1.2, 0, u * 3.8, [[0, '#fff3e8'], [1, '#f5d6c0']]);
  rr(g, -u * 2.9, fy - u * 2.1, u * 5.8, u * 4.4, u * 2.1); g.fill();
  g.fillStyle = 'rgba(255,120,130,.35)';
  ellipse(g, -u * 1.9, fy + u * 1.1, u * .9, u * .55); g.fill(); ellipse(g, u * 1.9, fy + u * 1.1, u * .9, u * .55); g.fill();
  g.fillStyle = '#1b1414';
  const bl = 1 - (o.blink || 0) * .85;
  if (o.eyes === 'happy') {
    g.strokeStyle = '#1b1414'; g.lineWidth = u * .3; g.lineCap = 'round';
    for (const s2 of [-1, 1]) { g.beginPath(); g.moveTo(s2 * u * 1.4 - u * .4, fy + u * .1); g.quadraticCurveTo(s2 * u * 1.4, fy - u * .55, s2 * u * 1.4 + u * .4, fy + u * .1); g.stroke(); }
  } else {
    for (const s2 of [-1, 1]) { g.beginPath(); g.ellipse(s2 * u * 1.4 + (o.look?.[0] || 0) * u * .3, fy, u * .36, u * .44 * bl, 0, 0, TAU); g.fill(); g.fillStyle = '#fff'; circle(g, s2 * u * 1.4 - u * .1, fy - u * .15, u * .1); g.fill(); g.fillStyle = '#1b1414'; }
  }
  if (o.mouth > .05) { g.fillStyle = '#6b2b2b'; g.beginPath(); g.ellipse(0, fy + u * 1.1, u * .5, u * (.2 + o.mouth * .6), 0, 0, TAU); g.fill(); }
  else { g.strokeStyle = '#1b1414'; g.lineWidth = u * .2; g.lineCap = 'round'; g.beginPath(); g.moveTo(-u * .45, fy + u * .95); g.quadraticCurveTo(0, fy + u * 1.35, u * .45, fy + u * .95); g.stroke(); }
  // Headphones.
  if (o.phones !== false) {
    g.strokeStyle = '#2b2b35'; g.lineWidth = u * 1.1; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-u * 4.9, fy - u * .4); g.bezierCurveTo(-u * 4.8, top - u * 1.1, u * 4.8, top - u * 1.1, u * 4.9, fy - u * .4); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = u * .25;
    g.beginPath(); g.moveTo(-u * 4.2, fy - u * 2.2); g.bezierCurveTo(-u * 3.8, top - u * .4, u * 1.5, top - u * .9, u * 3.2, top + u * .3); g.stroke();
    for (const s2 of [-1, 1]) {
      g.fillStyle = vgrad(g, fy - u * 2, fy + u * 2, [[0, '#3a3a46'], [1, '#121218']]);
      rr(g, s2 * u * 5.1 - u * 1.1, fy - u * 2, u * 2.2, u * 3.8, u * 1); g.fill();
    }
    museBadge(g, u * 5.1, fy - u * .1, u * 1.5);
  }
  g.restore();
}

// ---------------------------------------------------------------- people
// A chunky, friendly person, waist up or full. o: { s: head size, skin, hair, hairStyle, top,
//  pose: {armL, armR}, eyes, mouth, glasses, extra: fn, full: bool }
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
  // Body (torso): a rounded trapezoid.
  const th = o.full ? u * 11 : u * 9;
  const by = o.full ? -u * 6 : 0;
  g.fillStyle = vgrad(g, by - th, by, [[0, shade(top, .12)], [1, shade(top, -.18)]]);
  g.beginPath();
  g.moveTo(-u * 6, by); g.lineTo(-u * 5.2, by - th + u * 2.4);
  g.quadraticCurveTo(-u * 5, by - th, -u * 2.5, by - th); g.lineTo(u * 2.5, by - th);
  g.quadraticCurveTo(u * 5, by - th, u * 5.2, by - th + u * 2.4); g.lineTo(u * 6, by); g.closePath(); g.fill();
  if (o.full) {
    g.fillStyle = o.legs || '#2b3350';
    rr(g, -u * 4, by - u * .5, u * 3.4, u * 6.5, u * 1.2); g.fill(); rr(g, u * .6, by - u * .5, u * 3.4, u * 6.5, u * 1.2); g.fill();
    g.fillStyle = '#1b1b24'; rr(g, -u * 4.4, -u * 1.2, u * 4, u * 1.4, u * .7); g.fill(); rr(g, u * .4, -u * 1.2, u * 4, u * 1.4, u * .7); g.fill();
  }
  if (o.torso) o.torso(g, u, by, th);
  // Arms.
  const arm = (side, ang, len = 1) => {
    g.save(); g.translate(side * u * 4.6, by - th + u * 2.6); g.rotate(side * (ang ?? .25));
    g.fillStyle = shade(top, -.08); rr(g, -u * 1.4, -u * .4, u * 2.8, u * 7.2 * len, u * 1.4); g.fill();
    g.fillStyle = skin; circle(g, 0, u * 7 * len, u * 1.45); g.fill();
    if (o.hand && side === (o.handSide || 1)) { g.translate(0, u * 7 * len); o.hand(g, u); }
    g.restore();
  };
  arm(-1, o.armL, o.armLenL); arm(1, o.armR, o.armLenR);
  // Neck and head.
  const hy = by - th - u * 3.6;
  g.fillStyle = shade(skin, -.12); rr(g, -u * 1.3, hy + u * 2, u * 2.6, u * 2.4, u); g.fill();
  const hr = u * 4.3;
  // Hair behind.
  if (o.hairStyle === 'long' || o.hairStyle === 'bun' || o.hairStyle === 'curly') {
    g.fillStyle = hair;
    if (o.hairStyle === 'long') { rr(g, -hr * 1.08, hy - hr * .7, hr * 2.16, hr * 2.2, hr * .9); g.fill(); }
    if (o.hairStyle === 'curly') { for (let i = 0; i < 11; i++) { const a = -Math.PI * .05 - i / 10 * Math.PI * 1.1; circle(g, Math.cos(a) * hr * 1.02, hy + Math.sin(a) * hr * 1.02, hr * .42); g.fill(); } }
  }
  g.fillStyle = rgrad(g, -hr * .35, hy - hr * .4, 0, hr * 1.25, [[0, shade(skin, .1)], [1, shade(skin, -.1)]]);
  circle(g, 0, hy, hr); g.fill();
  // Ears.
  g.fillStyle = shade(skin, -.06); circle(g, -hr * .98, hy + u * .5, u * .9); g.fill(); circle(g, hr * .98, hy + u * .5, u * .9); g.fill();
  // Hair on top.
  g.fillStyle = hair;
  const hs = o.hairStyle || 'short';
  if (hs === 'short') { g.beginPath(); g.ellipse(0, hy - hr * .38, hr * 1.03, hr * .72, 0, Math.PI, TAU); g.fill(); rr(g, -hr * 1.03, hy - hr * .5, hr * .5, hr * .6, hr * .2); g.fill(); }
  if (hs === 'long') { g.beginPath(); g.ellipse(0, hy - hr * .35, hr * 1.06, hr * .78, 0, Math.PI, TAU); g.fill(); }
  if (hs === 'bun') { g.beginPath(); g.ellipse(0, hy - hr * .38, hr * 1.02, hr * .7, 0, Math.PI, TAU); g.fill(); circle(g, 0, hy - hr * 1.12, hr * .48); g.fill(); }
  if (hs === 'curly') { for (let i = 0; i < 9; i++) { const a = -Math.PI * .15 - i / 8 * Math.PI * .7; circle(g, Math.cos(a) * hr * .8, hy - hr * .2 + Math.sin(a) * hr * .75, hr * .38); g.fill(); } }
  if (hs === 'grey') { g.fillStyle = '#e9e6ef'; for (let i = 0; i < 8; i++) { const a = -Math.PI * .08 - i / 7 * Math.PI * .84; circle(g, Math.cos(a) * hr * .92, hy - hr * .1 + Math.sin(a) * hr * .82, hr * .36); g.fill(); } }
  if (hs === 'beanie') { g.fillStyle = o.hatColor || '#e05a47'; g.beginPath(); g.ellipse(0, hy - hr * .3, hr * 1.06, hr * .95, 0, Math.PI, TAU); g.fill(); rr(g, -hr * 1.08, hy - hr * .42, hr * 2.16, hr * .38, hr * .15); g.fill(); circle(g, 0, hy - hr * 1.25, hr * .22); g.fill(); }
  if (hs === 'bald') { }
  // Face.
  const fx = (o.look?.[0] || 0) * u * .8;
  const ey = hy + u * .3;
  g.fillStyle = '#22160f'; g.strokeStyle = '#22160f'; g.lineCap = 'round';
  const e = o.eyes || 'open';
  for (const side of [-1, 1]) {
    const cx = side * u * 1.55 + fx;
    if (e === 'happy') { g.lineWidth = u * .42; g.beginPath(); g.moveTo(cx - u * .6, ey + u * .2); g.quadraticCurveTo(cx, ey - u * .7, cx + u * .6, ey + u * .2); g.stroke(); }
    else if (e === 'closed') { g.lineWidth = u * .38; line(g, cx - u * .55, ey, cx + u * .55, ey); g.stroke(); }
    else if (e === 'star') { g.fillStyle = C.gold; star(g, cx, ey, u * .9, u * .38, 5); g.fill(); g.fillStyle = '#22160f'; }
    else if (e === 'wide') { g.fillStyle = '#fff'; circle(g, cx, ey, u * .85); g.fill(); g.fillStyle = '#22160f'; circle(g, cx, ey, u * .45); g.fill(); }
    else { const bl = 1 - (o.blink || 0) * .85; g.beginPath(); g.ellipse(cx, ey, u * .48, u * .62 * bl, 0, 0, TAU); g.fill(); }
  }
  if (o.glasses === 'round') { g.strokeStyle = '#2a2230'; g.lineWidth = u * .35; circle(g, -u * 1.55 + fx, ey, u * 1.25); g.stroke(); circle(g, u * 1.55 + fx, ey, u * 1.25); g.stroke(); line(g, -u * .3 + fx, ey, u * .3 + fx, ey); g.stroke(); }
  if (o.glasses === 'dark') { g.fillStyle = '#15131c'; rr(g, -u * 3.1 + fx, ey - u * 1, u * 2.7, u * 1.9, u * .7); g.fill(); rr(g, u * .4 + fx, ey - u * 1, u * 2.7, u * 1.9, u * .7); g.fill(); g.fillRect(-u * .6 + fx, ey - u * .6, u * 1.2, u * .4); }
  // Cheeks.
  g.fillStyle = 'rgba(255,110,120,.28)'; ellipse(g, -u * 2.5 + fx, ey + u * 1.3, u * .9, u * .5); g.fill(); ellipse(g, u * 2.5 + fx, ey + u * 1.3, u * .9, u * .5); g.fill();
  // Mouth.
  const my = hy + u * 2.1, m = o.mouth ?? 0;
  if (m > .05) { g.fillStyle = '#5a1f1f'; g.beginPath(); g.ellipse(fx, my, u * (.8 + m * .3), u * (.3 + m * 1.1), 0, 0, TAU); g.fill(); }
  else { g.strokeStyle = '#22160f'; g.lineWidth = u * .34; g.beginPath(); g.moveTo(fx - u * .8, my - u * .1); g.quadraticCurveTo(fx, my + u * (o.frown ? -.5 : .6), fx + u * .8, my - u * .1); g.stroke(); }
  if (o.extra) o.extra(g, u, hy, hr);
  g.restore();
}
