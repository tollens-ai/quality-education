// The bridge: "An oracle is something that can help me figure out what's wrong! (oh yeah) / Cos
// if I know your rules then I can run and run them all day long! / And even only heuristics I'd
// be better off than having none! / So I can keep on checking till they pass before I say it's
// done!" The music turns tight and tom-heavy, with stabs, so the picture cuts on every hit; then
// it says, plainly, what an oracle is, in the film's one metaphor: a light. A lamp swings in and
// shows what's wrong. Rules run like a clock that never stops. Even a torch beats the dark. And
// every brief is checked, and passes, before anyone stamps it done.
import { C, W, H, TAU, clamp, lerp, easeOut, easeIn, backOut, env, hit, last, next, eventsIn, noise, rgba, hash, A, lastIndex, mix } from '../kit.js';
import { fill, layer, put, strobe, impact, cone, burst, floor } from '../world.js';
import { pane, crack } from '../glass.js';
import { shot, overlay, camera } from '../shots.js';
import { words, sing, rows, echo, STYLE } from '../lyric.js';
import { text, kickback } from '../type.js';
import { P, ink, gpen, focusLines } from '../pen.js';
import { clawd } from '../clawd.js';
import { regex, nullBass, cron, singer } from '../playing.js';
import { moth, tick } from '../bugs.js';
import { BRIEFS, deco } from '../places.js';

const live = (tt, w) => kickback(tt, w.v, 7, .07);

// A pendant lamp, swinging in from above on its cord: the oracle.
function pendant(g, x, y, on, t, sw = 0) {
  g.save(); g.translate(x, 0); g.rotate(sw);
  gpen(g, [[0, -40], [0, y]], 6, { col: C.ink3, taper: [0, 0], wobble: .2, t });
  ink(g, P().poly([[-90, y], [90, y], [150, y + 120], [-150, y + 120]]), { fill: C.ink2, line: 6, seed: 3, t, rim: { dx: 6, dy: 0, col: C.bone } });
  g.fillStyle = on > .5 ? C.bone : C.ink3; g.fillRect(-110, y + 112, 220, 16);
  if (on > 0) cone(g, 0, y + 120, 0, .9, 1700, C.bone, .1 * on, 3);
  g.restore();
}

// A great clock, gears showing through it, its hands running round and round.
function clockface(g, x, y, r, t, speed) {
  // Gears behind.
  for (const [gx, gy, gr, n, dir] of [[x - r * .45, y - r * .3, r * .5, 12, 1], [x + r * .5, y + r * .25, r * .42, 10, -1], [x, y + r * .55, r * .3, 8, 1]]) {
    g.save(); g.translate(gx, gy); g.rotate(dir * t * speed * .8);
    const pts = [];
    for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * TAU, rr = i % 2 ? gr : gr * .84; pts.push([Math.cos(a) * rr, Math.sin(a) * rr]); }
    ink(g, P().poly(pts), { fill: mix(C.steel2, C.ink, .3), line: 5, seed: n, t });
    g.fillStyle = C.ink; g.beginPath(); g.arc(0, 0, gr * .25, 0, TAU); g.fill();
    g.restore();
  }
  // The dial: a ring with numerals, open in the middle so the gears show.
  g.save();
  g.strokeStyle = C.bone; g.lineWidth = r * .16; g.beginPath(); g.arc(x, y, r * .9, 0, TAU); g.stroke();
  g.strokeStyle = C.ink; g.lineWidth = 6; g.beginPath(); g.arc(x, y, r * .98, 0, TAU); g.stroke(); g.beginPath(); g.arc(x, y, r * .82, 0, TAU); g.stroke();
  const nums = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
  nums.forEach((nm, i) => {
    const a = i / 12 * TAU - Math.PI / 2;
    g.save(); g.translate(x + Math.cos(a) * r * .9, y + Math.sin(a) * r * .9); g.rotate(a + Math.PI / 2);
    text(g, nm, 0, r * .045, r * .1, 'semi', { align: 'center', fill: C.ink, ctx: deco, noAudit: true });
    g.restore();
  });
  // Hands: the hour hand does a day a second.
  const ha = t * speed - Math.PI / 2, ma = t * speed * 12 - Math.PI / 2;
  gpen(g, [[x, y], [x + Math.cos(ha) * r * .5, y + Math.sin(ha) * r * .5]], r * .07, { col: C.red, taper: [0, .5], boil: false });
  gpen(g, [[x, y], [x + Math.cos(ma) * r * .78, y + Math.sin(ma) * r * .78]], r * .04, { col: C.bone, taper: [0, .6], boil: false });
  g.fillStyle = C.red; g.beginPath(); g.arc(x, y, r * .06, 0, TAU); g.fill();
  g.restore();
}

export function register(S) {
  const B1 = words('Bridge', 'An oracle'), B2 = words('Bridge', 'Cos if'), B3 = words('Bridge', 'And even'), B4 = words('Bridge', 'So I can');
  const Y = [0, 1, 2, 3].map(i => words('Bridge', 'oh yeah', i));
  const t0 = 99.6;   // when chorus 2's hook shot ends, just after its "prove!"
  const c1 = B1[0].v - .1, c2 = B2[0].v - .1, c3 = B3[0].v - .1, c4 = B4[0].v - .1, c5 = Y[3][1].v + .1;

  // ---------------------------------------------------------------- the stabs: a cut on every hit
  const kinds = ['drum', 'pick', 'eye', 'cymbal', 'bass'];
  shot(t0, c1, (g, t, S, sh) => {
    const hits = [...eventsIn('kick', t0, c1), ...eventsIn('snare', t0, c1)].sort((a, b) => a - b).filter((h, j, L) => !j || h - L[j - 1] > .06);
    let i = 0; for (const h of hits) if (h <= t) i++;
    const since = t - (hits[i - 1] ?? t0);
    fill(g, i % 2 ? C.ink : C.red3);
    g.save();
    const z = 1 + .07 * Math.exp(-since / .09);
    g.translate(540, 960); g.scale(z, z); g.rotate((hash(i) - .5) * .16); g.translate(-540, -960);
    closeup(g, kinds[i % kinds.length], t, i, since);
    g.restore();
    if (since < .034) impact(g);
  });

  // ---------------------------------------------------------------- "An oracle is something..."
  shot(c1, c2, (g, t, S, sh) => {
    fill(g, C.ink);
    const on = clamp((t - (B1[1].v - .05)) / .08);
    const swing = Math.sin((t - c1) * 3.1) * .05 * (1 - clamp((t - c1) / 2));
    g.save();
    camera(g, t, sh, { z: 1.0 }, { z: 1.05 });
    // The glass below the lamp: dark, until the light shows what's wrong on the other side.
    g.fillStyle = C.ink2; g.fillRect(0, 1060, W, 860);
    if (on > 0) {
      g.save(); g.globalAlpha = on;
      g.beginPath(); g.ellipse(540, 1400, 430, 330, 0, 0, TAU); g.fillStyle = '#3b4148'; g.fill();
      g.clip();
      moth(g, 540 + noise(t, 3) * 60, 1380 + noise(t, 4) * 40, 330, t, 5);
      g.restore();
    }
    pane(g, 0, 1060, W, 860, { a: .05, n: 2, seed: 6 });
    pendant(g, 540, 820, on, t, swing);
    g.restore();
    text(g, 'オラクル', 540, 330, 70, 'jp', { align: 'center', fill: C.red, ctx: deco, alpha: clamp((t - (B1[1].v - .1)) / .1) });
    rows(g, t, B1, { y: 90, face: 'black', rows: [
      { w: [0], size: 110, style: STYLE.bone, dy: 110 },
      { w: [1], size: 300, style: STYLE.bone, dy: 390 },
      { w: [2, 3, 4, 5], size: 110, style: STYLE.bone, dy: 130 },
      { w: [6, 7, 8, 9], size: 110, style: STYLE.bone, dy: 115 },
      { w: [10, 11], size: 200, style: STYLE.red, dy: 190 },
    ] }, { enter: 'slam', lead: .1, live });
  });

  // ---------------------------------------------------------------- "...run and run them all day long!"
  shot(c2, c3, (g, t, S, sh) => {
    fill(g, C.ink);
    const run = clamp((t - (B2[9].v - .05)) / .1);
    g.save();
    camera(g, t, sh, { z: 1.0 }, { z: 1.06 });
    clockface(g, 540, 1260, 460, t, lerp(.6, 9, run));
    // A row of rules, blinking through, each ticked as it runs.
    for (let i = 0; i < 6; i++) {
      const x = 120 + i * 168, y = 1830;
      const lit = (Math.floor(t * 8) % 6) === i && run > 0;
      ink(g, P().rect(x - 60, y - 60, 120, 90), { fill: lit ? C.bone : C.ink2, line: 4, seed: 30 + i, t });
      if (run > 0) tick(g, x, y - 18, 52, 1, lit ? C.red : C.glass, t);
    }
    g.restore();
    rows(g, t, B2, { y: 60, face: 'black', rows: [
      { w: [0, 1, 2, 3, 4, 5], size: 118, style: STYLE.bone, dy: 118 },
      { w: [6, 7, 8], size: 118, style: STYLE.bone, dy: 118 },
      { w: [9, 10, 11], size: 190, style: STYLE.red, dy: 180 },
      { w: [12, 13, 14, 15], size: 150, style: STYLE.bone, dy: 150 },
    ] }, { enter: 'slam', lead: .1, live, stress: [15] });
  });

  // ---------------------------------------------------------------- "And even only heuristics..."
  // Half the frame dark: no oracle. Half lit by a torch: a rough one, but you can see by it.
  shot(c3, c4, (g, t, S, sh) => {
    fill(g, C.ink);
    const on = clamp((t - (B3[3].v - .05)) / .1);
    g.save();
    camera(g, t, sh, { z: 1.0 }, { z: 1.05 });
    g.fillStyle = C.ink2; g.fillRect(540, 760, 540, 1160);
    if (on > 0) {
      g.save(); g.globalAlpha = on;
      g.beginPath(); g.moveTo(1040, 1850); g.lineTo(620, 900); g.lineTo(1080, 820); g.closePath();
      g.fillStyle = '#434a52'; g.fill(); g.clip();
      moth(g, 850, 1120 + noise(t, 7) * 30, 220, t, 9);
      moth(g, 760, 1450, 140, t, 11);
      g.restore();
      // The hand with the torch.
      g.save(); g.translate(1010, 1800); g.rotate(-.42);
      ink(g, P().rect(-38, -150, 76, 190), { fill: C.steel2, line: 5, seed: 40, t });
      g.fillStyle = C.bone; g.fillRect(-42, -170, 84, 26);
      ink(g, P().S([[-60, 10], [60, 10], [70, 120], [-70, 120]], true), { fill: '#d9a882', line: 5, seed: 41, t });
      g.restore();
    }
    g.fillStyle = C.steel2; g.fillRect(531, 760, 18, 1160);
    text(g, 'NONE', 270, 1400, 130, 'black', { align: 'center', fill: C.ink3, ctx: deco, alpha: clamp((t - (B3[10].v - .1)) / .1) });
    g.restore();
    rows(g, t, B3, { y: 60, face: 'black', rows: [
      { w: [0, 1, 2], size: 130, style: STYLE.bone, dy: 130 },
      { w: [3], size: 210, style: STYLE.bone, dy: 205 },
      { w: [4, 5, 6, 7], size: 130, style: STYLE.bone, dy: 135 },
      { w: [8, 9, 10], size: 130, style: STYLE.bone, dy: 130 },
    ] }, { enter: 'slam', lead: .1, live, stress: [10] });
  });

  // ---------------------------------------------------------------- "...till they pass before I say it's done!"
  shot(c4, c5, (g, t, S, sh) => {
    fill(g, C.ink);
    g.save();
    camera(g, t, sh, { z: 1.0, y: 1000 }, { z: 1.1, y: 1060 }, { hand: 1.5 });
    const pass = B4[8].v, done = B4[13].v;
    const sweep = ((t - c4) * 900) % 1600 - 200;
    g.fillStyle = rgba(C.bone, .12); g.fillRect(sweep, 780, 60, 880);
    BRIEFS.forEach((b, i) => {
      const y = 820 + i * 205;
      const scan = clamp((t - (B4[4].v + i * .25)) / .2);
      const ok = t > pass + i * .09;
      ink(g, P().rect(60, y, 960, 170), { fill: C.ink2, line: 5, seed: 50 + i, t });
      text(g, `${b.n}/4`, 90, y + 110, 70, 'black', { fill: C.bone, ctx: deco });
      text(g, `${b.app}`, 230, y + 80, 44, 'mono', { fill: C.bone, ctx: deco });
      text(g, `by ${b.name}`, 230, y + 135, 40, 'mono', { fill: C.bone3, ctx: deco });
      ink(g, P().rect(860, y + 25, 120, 120), { fill: C.ink, line: 5, seed: 60 + i, t });
      if (scan > 0 && !ok) { g.fillStyle = rgba(C.bone, .3); g.fillRect(60, y, 960 * scan, 170); }
      if (ok) tick(g, 920, y + 85, 100, (t - (pass + i * .09)) / .12, C.glass, t);
      else if (scan > .9) { gpen(g, [[885, y + 50], [955, y + 120]], 12, { col: C.red, t }); gpen(g, [[955, y + 50], [885, y + 120]], 12, { col: C.red, t }); }
    });
    // Only then: DONE.
    const d = clamp((t - (done - .1)) / .1);
    if (d > 0) {
      g.save(); g.translate(540, 1300); g.rotate(-.12); g.scale(lerp(1.6, 1, d), lerp(1.6, 1, d));
      g.strokeStyle = C.red; g.lineWidth = 16; g.strokeRect(-330, -120, 660, 220);
      text(g, 'DONE', 0, 75, 200, 'black', { align: 'center', fill: C.red, ctx: deco });
      g.restore();
    }
    g.restore();
    rows(g, t, B4, { y: 60, face: 'black', rows: [
      { w: [0, 1, 2, 3, 4, 5], size: 118, style: STYLE.bone, dy: 118 },
      { w: [6, 7, 8], size: 200, style: STYLE.bone, dy: 195 },
      { w: [9, 10, 11, 12, 13], size: 130, style: STYLE.bone, dy: 150 },
    ] }, { enter: 'slam', lead: .1, live, stress: [8, 13] });
  });

  // The "oh yeah"s: the reflections, answering.
  Y.forEach(yw => overlay(yw[0].v - .14, yw[0].v + .9, (g, t) => echo(g, t, yw, 1020, 760, 100, { align: 'right', style: { fill: C.glass, shadow: { dx: 0, dy: 6, col: C.ink } } })));
}

// Close-ups for the bridge's hits, drawn big with a heavy pen, each readable in a glance.
function closeup(g, kind, t, i, since) {
  const hitp = Math.exp(-since / .07), W8 = 12;
  if (kind === 'drum') {
    ink(g, P().poly([[-100, 1000], [1180, 1000], [1180, 2000], [-100, 2000]]), { fill: rgba(C.glass2, .6), line: W8, seed: 1, t });
    ink(g, P().ell(540, 1000, 700, 260), { fill: mix(C.bone2, C.bone, hitp), line: W8, seed: 2, t });
    g.strokeStyle = C.steel2; g.lineWidth = 30; g.beginPath(); g.ellipse(540, 1000, 700, 260, 0, 0, TAU); g.stroke();
    focusLines(g, 520, 960, 120, 800, 26, { col: C.ink, w: 14, t, seed: i });
    const tip = [520, 960 - (1 - hitp) * 160];
    gpen(g, [[1180, 140], tip], 70, { col: C.bone2, taper: [0, .25], t, seed: 3 });
    gpen(g, [[1180, 140], tip], 18, { col: C.bone3, taper: [0, .5], t, seed: 4 });
    ink(g, P().poly([[940, 330], [1180, 200], [1180, 520], [990, 560]]), { fill: C.clawd, line: W8, seed: 5, t, shade: { dx: 20, dy: -20, col: C.clawd2 } });
    g.fillStyle = C.red; g.fillRect(1100, 250, 90, 300);
  } else if (kind === 'pick') {
    g.fillStyle = C.bone; g.fillRect(-50, -50, 1180, 2020);
    g.fillStyle = C.red; g.beginPath(); g.moveTo(-50, 400); g.lineTo(1130, 1500); g.lineTo(1130, 1650); g.lineTo(-50, 550); g.fill();
    for (let k = 0; k < 6; k++) {
      const off = k * 70 - 175, w = (k === 2 || k === 3) ? 4 + hitp * 10 : 4;
      gpen(g, [[-60, 1200 + off - 700], [1140, 900 + off + 300]], w + 4, { col: C.steel2, taper: [0, 0], wobble: hitp * 3, t, seed: 10 + k });
    }
    const py = 830 + (1 - hitp) * -260;
    ink(g, P().poly([[470, py - 90], [610, py - 60], [520, py + 90]]), { fill: C.red, line: W8, seed: 6, t });
    ink(g, P().poly([[560, py - 120], [980, py - 420], [1100, py - 250], [640, py + 10]]), { fill: C.clawd, line: W8, seed: 7, t, shade: { dx: 0, dy: -24, col: C.clawd2 } });
    for (let k = 0; k < 5; k++) gpen(g, [[430 - k * 40, py - 300 + k * 30], [470 - k * 40, py - 60 + k * 30]], 10, { col: C.ink, taper: [.1, .8], t, seed: 20 + k });
  } else if (kind === 'eye') {
    g.fillStyle = C.clawd; g.fillRect(-50, -50, 1180, 2020);
    g.fillStyle = C.clawd2; g.fillRect(-50, 1500, 1180, 500);
    const open = lerp(.35, 1, 1 - hitp * .7);
    const ex = 380, ew = 330, eh = 660 * open, ey = 960 - eh / 2;
    g.fillStyle = C.red2; g.beginPath(); g.moveTo(80, ey - 90); g.lineTo(960, ey - 260); g.lineTo(980, ey - 140); g.lineTo(90, ey + 10); g.fill();
    g.fillStyle = C.ink; g.fillRect(ex, ey, ew, eh);
    g.beginPath(); g.moveTo(ex + ew, ey + 30); g.lineTo(ex + ew + 420, ey - 200); g.lineTo(ex + ew, ey + 130); g.fill();
    g.fillStyle = C.bone; g.fillRect(ex + 50, ey + eh * .12, 110, 110);
    gpen(g, [[ex - 20, ey - 20], [ex + ew + 20, ey - 20]], 18, { col: C.ink, taper: [.1, .1], t, seed: 30 });
  } else if (kind === 'cymbal') {
    g.save(); g.translate(540, 900); g.rotate(-.25 + Math.sin(t * 60) * .04 * hitp);
    ink(g, P().ell(0, 0, 640, 150), { fill: mix('#b7a36a', C.bone, hitp * .6), line: W8, seed: 40, t });
    g.strokeStyle = rgba(C.ink, .4); g.lineWidth = 6;
    for (let r = 1; r <= 5; r++) { g.beginPath(); g.ellipse(0, 0, 640 * r / 6, 150 * r / 6, 0, 0, TAU); g.stroke(); }
    g.fillStyle = C.ink2; g.beginPath(); g.ellipse(0, -4, 70, 24, 0, 0, TAU); g.fill();
    g.restore();
    for (let r = 0; r < 4; r++) { g.strokeStyle = rgba(C.bone, .5 * hitp * (1 - r / 4)); g.lineWidth = 8; g.beginPath(); g.ellipse(540, 900, 700 + r * 60, 200 + r * 30, -.25, 0, TAU); g.stroke(); }
    gpen(g, [[-60, 1500], [300, 980 - (1 - hitp) * 120]], 60, { col: C.bone2, taper: [0, .3], t, seed: 41 });
  } else {
    g.fillStyle = C.ink; g.fillRect(-50, -50, 1180, 2020);
    for (let k = 0; k < 5; k++) {
      const x = 200 + k * 170, wob = k === 2 ? hitp * 22 : 0;
      const pts = []; for (let y = -60; y <= 1980; y += 60) pts.push([x + Math.sin(y * .03 + t * 90) * wob, y]);
      gpen(g, pts, 14 + k * 3, { col: C.steel, taper: [0, 0], wobble: .5, t, seed: 50 + k });
    }
    ink(g, P().poly([[540, 1000 + hitp * 40], [900, 700], [1100, 900], [700, 1200]]), { fill: C.clawd, line: W8, seed: 8, t, shade: { dx: 0, dy: -24, col: C.clawd2 } });
    g.fillStyle = C.bone; g.fillRect(880, 640, 260, 60);
  }
}
