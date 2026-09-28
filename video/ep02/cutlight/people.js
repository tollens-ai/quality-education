// People, on the far side of the mirror, in a low morning sun behind them. They're drawn as a
// cinematographer shoots people against the light: one clean silhouette each, the colour of
// their clothes just showing in the shade, and a line of sunlight along the edges that face it
// (the scene adds the rim; see post.rimmed). A silhouette is all pose and proportion, so the
// anatomy is built with care: seven and a half heads, tapered limbs, the weight on one leg.
//
// person(g, x, y, h, spec, pose, t): feet at (x, y), h px tall. Faces: 'front', 'left', 'right'.
//   spec: { skin, hair: { style, col }, top: { kind, col }, legs: { kind, col }, build, sex,
//           age ('old' | 'child'), bag, veil, glasses, apron, seed }
//   pose: { face, arms: 'down' | 'phone' | 'phoneFar' | 'cross' | 'pockets' | 'watch' | 'up'
//           | 'hips' | 'hold' | 'point' | 'wave' | 'cheer', head: tilt, weight: -1..1 (hip shift), step: 0..1 }
import { clamp, lerp, hash, mix, rgba, noise } from './kit.js';

export const SKIN = ['#f3d2b8', '#e8b894', '#c98f68', '#a06a47', '#6e4530', '#4b2f22'];
export const HAIRC = { black: '#1d1716', brown: '#4a2f22', auburn: '#7a3a22', blonde: '#d8b36a', grey: '#a8a4a0', white: '#e8e4de', red: '#a8482a' };

// How dark things read against the light: their own colour, pushed into the shade's violet.
export const SHADE = { col: '#241a2e', k: .72 };
// Against the light, colours sink into the shade; in the sun (SHADE.lit), they're themselves.
export const dim = col => SHADE.lit ? col : mix(col, SHADE.col, SHADE.k);

// A smooth closed shape through pts (Catmull-Rom as Béziers).
function smoothPath(g, pts, t = .2) {
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    if (i === 0) g.moveTo(p1[0], p1[1]);
    g.bezierCurveTo(p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t, p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t, p2[0], p2[1]);
  }
  g.closePath();
}
function fillShape(g, pts, col, t) { g.beginPath(); smoothPath(g, pts, t); g.fillStyle = col; g.fill(); }
// A limb through joints, with a width at each joint: the outline goes down one side and back up
// the other, so a thigh swells, a knee narrows, a calf swells again.
function limbPath(pts, ws) {
  const L = [], R = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    const nx = -dy / l, ny = dx / l, w = ws[i] / 2;
    L.push([pts[i][0] + nx * w, pts[i][1] + ny * w]);
    R.push([pts[i][0] - nx * w, pts[i][1] - ny * w]);
  }
  // Round the far end.
  const e = pts[pts.length - 1], p = pts[pts.length - 2], dx = e[0] - p[0], dy = e[1] - p[1], l = Math.hypot(dx, dy) || 1;
  const tip = [e[0] + dx / l * ws[ws.length - 1] * .45, e[1] + dy / l * ws[ws.length - 1] * .45];
  return [...L, tip, ...R.reverse()];
}
// Where an elbow or knee goes, between a root and an end, bending to one side.
function knee(a, c, l1, l2, side) {
  const dx = c[0] - a[0], dy = c[1] - a[1], d = Math.min(Math.hypot(dx, dy), l1 + l2 - .001);
  const cosA = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1);
  const ang = Math.atan2(dy, dx) + side * Math.acos(cosA);
  return [a[0] + Math.cos(ang) * l1, a[1] + Math.sin(ang) * l1];
}

export function person(g, x, y, h, spec, pose = {}, t = 0) {
  const s = h / 100, f = spec.sex === 'f', old = spec.age === 'old', child = spec.age === 'child';
  const b = spec.build ?? 1;
  const face = pose.face || 'front', side = face === 'left' ? -1 : face === 'right' ? 1 : 0;
  const P = (u, v) => [x + u * s, y - v * s];
  const seed = spec.seed || 1;
  const breathe = Math.sin(t * 2.1 + seed) * .35, sway = noise(t * .5, seed) * .8;
  const wgt = (pose.weight ?? (hash(seed, 3) - .5) * 1.2) + sway * .2;
  const stoop = old ? 1 : 0;
  // Proportions, in hundredths of the height.
  const headH = child ? 17 : 14, headW = headH * (side ? .84 : .76);
  const topY = 100, chinY = 100 - headH, neckY = chinY - 1.5;
  const shY = 82 - stoop * 3 + breathe * .2, waistY = 61, hipY = 50.5, crotchY = 46, kneeY = 27.5, ankY = 4;
  const shW = (f ? 11 : 12.6) * b * (side ? .55 : 1), waW = (f ? 7.2 : 8.8) * b * (side ? .7 : 1), hiW = (f ? 10.5 : 9.5) * b * (side ? .72 : 1);
  const lean = side * stoop * 4;
  const hipShift = wgt * 1.6 * (side ? .3 : 1), shTilt = -wgt * 1.1;
  const top = spec.top || {}, legs = spec.legs || {};
  const cloth = dim(top.col || '#5a6f94'), trous = dim(legs.col || '#39405a'), skin = dim(spec.skin || SKIN[1]), hairC = dim(spec.hair?.col || HAIRC.brown);
  g.save();
  if (spec.veil) {
    // A veil: sheer, from the crown to past the waist behind her; the sun shines through it.
    const vs = Math.sin(t * 1.1 + seed) * 3;
    const crown = P(lean, 99);
    g.fillStyle = rgba(mix(spec.veil, '#fff6e0', .5), .42);
    g.beginPath(); smoothPath(g, [[crown[0] - 4 * s, crown[1]], [crown[0] + 4 * s, crown[1]], [crown[0] + (15 + vs) * s, crown[1] + 58 * s], [crown[0] + (2 + vs) * s, crown[1] + 64 * s], [crown[0] - (14 - vs) * s, crown[1] + 60 * s]], .2); g.fill();
  }
  // Legs: the weight leg straight, the other easy, bent a little at the knee.
  const legW = (f ? 7.4 : 8.2) * b;
  const stride = (pose.step || 0) * 9;
  const legRoot = [side ? -1.2 : -hiW * .45, side ? 1.2 : hiW * .45];
  const drawLeg = (i) => {
    const r0 = legRoot[i];
    const onWeight = (i === 0 ? wgt < 0 : wgt >= 0);
    const hip = P(r0 * .9 + hipShift, crotchY + 3);
    const footX = r0 * (side ? 1 : 1.05) + (side ? (i ? 1 : -1) * stride : 0) + (onWeight ? 0 : (side ? 0 : r0 * .35));
    const foot = P(footX + hipShift * .4 + lean * .2, ankY);
    const kn = knee(hip, foot, (crotchY + 3 - kneeY) * s, (kneeY - ankY) * s, (side || (i ? 1 : -1)) * (onWeight ? .04 : .18) * (side ? -1 : 1));
    const skirt = legs.kind === 'skirt' || top.kind === 'dress';
    const col = skirt ? skin : trous;
    const ws = [legW * s, legW * .66 * s, legW * .7 * s * (skirt ? .9 : 1), legW * .42 * s];
    const calf = [lerp(kn[0], foot[0], .35), lerp(kn[1], foot[1], .35)];
    fillShape(g, limbPath([hip, kn, calf, foot], ws), col, .18);
    // The shoe, pointing the way the body faces.
    const dirX = side || (i ? .35 : -.35);
    fillShape(g, [[foot[0] - 2.2 * s, foot[1] - 1.5 * s], [foot[0] + (1.8 + dirX * 3.2) * s, foot[1] - 2 * s], [foot[0] + (2.2 + dirX * 4.2) * s, foot[1] + 3.6 * s], [foot[0] - 2.4 * s, foot[1] + 4 * s]], dim(spec.shoes || '#221c1a'), .25);
  };
  // Far leg first.
  drawLeg(side > 0 ? 0 : 1); drawLeg(side > 0 ? 1 : 0);
  // The skirt or coat below the waist, then the torso.
  const coatHem = top.kind === 'coat' ? 26 : top.kind === 'dress' ? 30 : top.kind === 'gown' ? .5 : top.kind === 'apron' ? 34 : null;
  if (coatHem !== null) {
    const fl = top.kind === 'gown' ? 2.2 : top.kind === 'dress' ? 1.35 : 1.14;
    const hem = [];
    for (let i = 0; i <= 6; i++) { const u = i / 6 * 2 - 1; hem.push(P((u * hiW * fl + hipShift) * (side ? .9 : 1) + lean * .3, coatHem - (1 - u * u) * .8 + (top.kind === 'gown' ? Math.sin(t * 1.3 + i) * .3 : 0))); }
    fillShape(g, [P(-waW + hipShift * .6 + lean, waistY), ...hem.reverse(), P(waW + hipShift * .6 + lean, waistY)], cloth, .14);
  }
  const skirtK = legs.kind === 'skirt' && coatHem === null;
  if (skirtK) fillShape(g, [P(-waW + hipShift * .6, waistY), P(-hiW * 1.35 + hipShift, 30), P(hiW * 1.35 + hipShift, 30), P(waW + hipShift * .6, waistY)], trous, .14);
  // Torso: shoulders, chest, waist, hips; the shoulders tilt against the hips.
  const torso = side
    ? [P(-shW + lean, shY), P(-shW * 1.05 + lean, shY - 8), P(-waW * .95 + lean * .6, waistY), P(-hiW * .95 + hipShift, hipY), P(-hiW * .7 + hipShift, crotchY),
      P(hiW * .75 + hipShift, crotchY), P(hiW + hipShift, hipY), P(waW + lean * .6, waistY), P((f ? shW * 1.35 : shW * 1.15) + lean, shY - 9), P(shW + lean, shY), P(lean, shY + 1.6)]
    : [P(-shW + lean, shY - 1.2 + shTilt), P(-shW * .96, shY - 7), P(-waW + hipShift * .6, waistY), P(-hiW + hipShift, hipY), P(-hiW * .55 + hipShift, crotchY),
      P(hiW * .55 + hipShift, crotchY), P(hiW + hipShift, hipY), P(waW + hipShift * .6, waistY), P(shW * .96, shY - 7), P(shW + lean, shY - 1.2 - shTilt), P(shW * .55, shY + 1.4), P(2.4, shY + 3.2), P(-2.4, shY + 3.2), P(-shW * .55, shY + 1.4)];
  fillShape(g, torso, cloth, .16);
  // The apron's bib, a lighter shape on the front (you can see it's an apron against the sun).
  if (top.kind === 'apron' && !side) fillShape(g, [P(-5, 74), P(5, 74), P(hiW * .8, 36), P(-hiW * .8, 36)], dim(top.col2 || '#efe8da'), .1);
  if (spec.bag) {
    const bp = P((side ? -side * 5 : -shW * .95) + lean, 57);
    fillShape(g, [[bp[0] - 4.5 * s, bp[1] - 5 * s], [bp[0] + 4.5 * s, bp[1] - 5 * s], [bp[0] + 5.2 * s, bp[1] + 5.5 * s], [bp[0] - 5.2 * s, bp[1] + 5.5 * s]], dim(spec.bag), .2);
    g.strokeStyle = dim(spec.bag); g.lineWidth = 1.2 * s; g.beginPath(); g.moveTo(bp[0], bp[1] - 5 * s); g.lineTo(...P(-shW * .6 + lean, shY)); g.stroke();
  }
  // Arms: shoulder, elbow, wrist, hand, placed by pose.
  const armW = (f ? 4.3 : 5.1) * b;
  const ua = 15.5 * s, fa = 13.5 * s;
  const shL = P(-shW + 1.6 + lean, shY - 1.6 + shTilt), shR = P(shW - 1.6 + lean, shY - 1.6 - shTilt);
  const arm = (sh, wrist, bend, col = cloth) => {
    const el = knee(sh, wrist, ua, fa, bend);
    fillShape(g, limbPath([sh, el, wrist], [armW * s, armW * .8 * s, armW * .62 * s]), col, .2);
    // The hand: a small mitten past the wrist.
    const dx = wrist[0] - el[0], dy = wrist[1] - el[1], l = Math.hypot(dx, dy) || 1;
    const hp = [wrist[0] + dx / l * 2.6 * s, wrist[1] + dy / l * 2.6 * s];
    g.fillStyle = mix(skin, col, .45); g.beginPath(); g.ellipse(hp[0] - dx / l * .8 * s, hp[1] - dy / l * .8 * s, 2.2 * s, 3.1 * s, Math.atan2(dy, dx) - Math.PI / 2, 0, Math.PI * 2); g.fill();
    return { el, hand: hp };
  };
  const arms = pose.arms || 'down';
  let phone = null;
  const A = (u, v) => P(u + lean, v);
  const fl = side ? (side > 0 ? [shL, shR] : [shR, shL]) : [shL, shR];   // [far, near] for side views
  const bendL = 1, bendR = -1;
  if (arms === 'down') { arm(shL, A(-shW - 1.2 + hipShift * .3, 44 + breathe * .2), bendL); arm(shR, A(shW + 1.2 + hipShift * .3, 44), bendR); }
  else if (arms === 'pockets') { arm(shL, A(-hiW * .75 + hipShift, 49), -bendL); arm(shR, A(hiW * .75 + hipShift, 49), -bendR); }
  else if (arms === 'hips') { arm(shL, A(-waW - .5 + hipShift * .6, 57), -bendL); arm(shR, A(waW + .5 + hipShift * .6, 57), -bendR); }
  else if (arms === 'cross') {
    arm(fl[0], A(side ? side * 4 : 3.5, 66), side ? -side : -1);
    arm(fl[1], A(side ? side * 5.5 : -4, 64.5), side ? -side : 1);
  } else if (arms === 'phone' || arms === 'phoneFar') {
    const far = arms === 'phoneFar';
    const dir = side || 1;
    phone = A(dir * (far ? 17 : 8), far ? 79 : 71);
    arm(dir > 0 ? shL : shR, A(-dir * (shW + 1.2), 44), dir > 0 ? bendL : bendR);
    arm(dir > 0 ? shR : shL, phone, dir > 0 ? (far ? 1 : -1) : (far ? -1 : 1));
  } else if (arms === 'watch') {
    arm(shL, A(-shW - 1, 44), bendL);
    arm(shR, A(1.5, 66), -1);
  } else if (arms === 'up') {
    arm(shL, A(-shW - 6 + Math.sin(t * 7 + seed) * 1.5, 104), -1);
    arm(shR, A(shW + 6 + Math.sin(t * 7.6 + seed) * 1.5, 104), 1);
  } else if (arms === 'point') {
    arm(shL, A(-shW - 1, 44), bendL);
    arm(shR, A(shW + 24, 80), -1);
  } else if (arms === 'hold') {
    arm(shL, A(-4 + hipShift * .5, 57), 1); arm(shR, A(4 + hipShift * .5, 57), -1);
  } else if (arms === 'wave') {
    // One hand high and waving from the elbow, the other easy at the side.
    arm(shL, A(-shW - 1.2 + hipShift * .3, 44), bendL);
    arm(shR, A(shW + 9 + Math.sin(t * 9 + seed) * 4, 104 + Math.cos(t * 9 + seed) * 1.5), 1);
  } else if (arms === 'cheer') {
    // Both arms flung up in a V, bouncing on the beat.
    const bn = Math.abs(Math.sin(t * Math.PI * 2 * 136 / 60 / 2 + seed)) * 3;
    arm(shL, A(-shW - 10 - bn * .5, 102 + bn), -1);
    arm(shR, A(shW + 10 + bn * .5, 102 + bn), 1);
  }
  // Neck, head, hair.
  const look = pose.look === 'phone' ? 1 : 0;
  const hc = P(lean * 1.4 + side * 1.2 + (pose.head || 0) * 2.5 + look * (side || 0) * 1.5, chinY + headH / 2 - look * 1.6);
  fillShape(g, limbPath([P(lean, shY - 2), [hc[0], hc[1] + headH * .25 * s]], [4.6 * s * b, 3.9 * s]), skin, .2);
  const hw = headW / 2 * s, hh = headH / 2 * s;
  const rot = (pose.head || 0) * .16 + look * .22 * (side || 1);
  g.save(); g.translate(hc[0], hc[1]); g.rotate(rot);
  const hs = spec.hair?.style || 'short';
  // Hair behind: long hair, a bob, a veil.
  if (hs === 'long') fillShape(g, [[-hw * 1.15, -hh * .5], [0, -hh * 1.1], [hw * 1.15, -hh * .5], [hw * 1.2 + (side < 0 ? 3 * s : 0), hh * 1.9], [-hw * 1.2 - (side > 0 ? 3 * s : 0), hh * 1.9]], hairC, .2);
  if (hs === 'bob') fillShape(g, [[-hw * 1.18, -hh * .4], [0, -hh * 1.12], [hw * 1.18, -hh * .4], [hw * 1.15, hh * .95], [-hw * 1.15, hh * .95]], hairC, .2);
  // The head: an egg, the jaw a little narrower; in profile, a nose and chin.
  const headPts = side
    ? [[-hw, -hh * .1], [-hw * .7, -hh * .92], [hw * .3, -hh * 1.02], [hw * .95, -hh * .45], [hw * 1.02, -hh * .02], [hw * 1.22 * 1, hh * .12], [hw * .98, hh * .3], [hw * .98, hh * .52], [hw * .7, hh * .86], [hw * .1, hh * 1.02], [-hw * .5, hh * .75]].map(([u, v]) => [u * side, v])
    : [[-hw, -hh * .15], [-hw * .72, -hh * .88], [0, -hh * 1.02], [hw * .72, -hh * .88], [hw, -hh * .15], [hw * .82, hh * .55], [0, hh * 1.02], [-hw * .82, hh * .55]];
  fillShape(g, headPts, skin, .18);
  if (SHADE.lit && hh > 7) {
    // In the sun, a face: two eyes and a mouth, happy when they're happy.
    const ex = side ? side * hw * .45 : hw * .36, ey = -hh * .02;
    g.fillStyle = '#231a18';
    const eyes = side ? [ex] : [-ex, ex];
    for (const e of eyes) { g.beginPath(); g.ellipse(e, ey, hw * .09, hh * .1 * (pose.joy ? .6 : 1), 0, 0, Math.PI * 2); g.fill(); }
    g.strokeStyle = '#231a18'; g.lineWidth = Math.max(1, hw * .09); g.lineCap = 'round';
    const mx = side ? side * hw * .4 : 0, my = hh * .5;
    g.beginPath();
    if (pose.joy) { g.arc(mx, my - hh * .12, hw * .3, .25, Math.PI - .25); }
    else { g.moveTo(mx - hw * .2, my); g.lineTo(mx + hw * .2, my); }
    g.stroke();
    if (pose.joy) { g.fillStyle = 'rgba(230,110,110,.35)'; for (const e of eyes) { g.beginPath(); g.ellipse(e * 1.25, hh * .3, hw * .16, hh * .08, 0, 0, Math.PI * 2); g.fill(); } }
  }
  if (spec.glasses) { g.strokeStyle = SHADE.lit ? '#3a3230' : mix(skin, '#ffffff', .25); g.lineWidth = .8 * s; for (const e of side ? [side * hw * .55] : [-hw * .42, hw * .42]) { g.beginPath(); g.arc(e, -hh * .02, hw * .26, 0, Math.PI * 2); g.stroke(); } }
  // Hair on top.
  const cap = side
    ? [[-hw * 1.05, hh * .25], [-hw * 1.02, -hh * .6], [-hw * .3, -hh * 1.12], [hw * .6, -hh * 1.02], [hw * 1.02, -hh * .45], [hw * .5, -hh * .55], [-hw * .1, -hh * .3], [-hw * .5, hh * .1]].map(([u, v]) => [u * side, v])
    : [[-hw * 1.05, -hh * .05], [-hw * .95, -hh * .78], [0, -hh * 1.15], [hw * .95, -hh * .78], [hw * 1.05, -hh * .05], [hw * .75, -hh * .5], [0, -hh * .62], [-hw * .75, -hh * .5]];
  if (hs !== 'bald') fillShape(g, cap, hairC, .2);
  if (hs === 'bun') { g.fillStyle = hairC; g.beginPath(); g.ellipse(side ? -side * hw * .55 : 0, -hh * 1.12, hw * .45, hh * .32, 0, 0, Math.PI * 2); g.fill(); }
  if (hs === 'curly') for (let i = 0; i < 8; i++) { const a = Math.PI * (1.02 + i / 7 * .96); g.fillStyle = hairC; g.beginPath(); g.arc(Math.cos(a) * hw * .95, Math.sin(a) * hh * .98 - hh * .05, hw * .36, 0, Math.PI * 2); g.fill(); }
  if (hs === 'cap') { fillShape(g, [[-hw * 1.08, -hh * .3], [-hw * .95, -hh * 1.02], [hw * .95, -hh * 1.02], [hw * 1.08, -hh * .3], [hw * 1.08 + (side || 1) * hw * .9, -hh * .22]], dim(spec.hair.hat || '#3b5a8a'), .15); }
  g.restore();
  if (phone) {
    // A phone: the screen lit, the only light on this side of them.
    g.save(); g.translate(phone[0], phone[1] - 2.5 * s); g.rotate(-.25 * (side || 1));
    g.fillStyle = '#0d0e11'; g.fillRect(-2.1 * s, -3.4 * s, 4.2 * s, 6.8 * s);
    g.fillStyle = pose.screen || '#dcefff'; g.fillRect(-1.7 * s, -3 * s, 3.4 * s, 6 * s);
    g.restore();
  }
  g.restore();
  return { head: hc, phone, top: P(0, 100) };
}

// A stranger from a seed: varied build, colours, hair, pose.
const TOPS = ['#c0492f', '#2f5d8a', '#e3b04b', '#3f7a5a', '#8a4f7d', '#d9d2c3', '#48505e', '#a05a2c', '#6d8fb3', '#b8b24a', '#7a2f3a', '#2a2e38'];
const LEGS = ['#2e3446', '#3d3a36', '#5a5f6e', '#20242c', '#6b5a48', '#394c6b'];
export function stranger(seed) {
  const r = k => hash(seed, k);
  const sex = r(1) < .5 ? 'f' : 'm';
  const styles = sex === 'f' ? ['long', 'bob', 'bun', 'curly', 'short'] : ['short', 'short', 'curly', 'bald', 'cap'];
  return {
    sex, seed, build: .9 + r(3) * .28,
    skin: SKIN[Math.floor(r(4) * SKIN.length)],
    hair: { style: styles[Math.floor(r(2) * styles.length)], col: Object.values(HAIRC)[Math.floor(r(5) * 6)], hat: TOPS[Math.floor(r(11) * TOPS.length)] },
    top: { kind: r(6) < .4 ? 'coat' : 'shirt', col: TOPS[Math.floor(r(7) * TOPS.length)] },
    legs: { kind: sex === 'f' && r(10) < .3 ? 'skirt' : 'trousers', col: LEGS[Math.floor(r(12) * LEGS.length)] },
    bag: r(13) < .3 ? TOPS[Math.floor(r(14) * TOPS.length)] : null,
    height: .9 + r(15) * .16,
  };
}
