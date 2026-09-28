// Pre-chorus: back in the garage with the door shut. Complaints come in under it; nothing tells
// the band how they'd know for themselves.
import { C, TAU, clamp, lerp, smooth, easeOut, easeOutBack, rr, circle, poly, line, rnd, INK, rgba, mix, shade } from '../kit.js';
import { garage, note, bareBulb } from '../world.js';
import { play, member, mic } from '../band.js';
import { cut, marker, doodle, field, sunburst, speedLines } from '../zine.js';
import { sing, lineNear } from '../lyrics.js';
import { letter } from '../hand.js';

// Notes shooting in under the door from t0, one every `gap` seconds, sliding to rest on the floor.
function notesIn(g, t, t0, n, gap, o = {}) {
  for (let i = 0; i < n; i++) {
    const a = t0 + i * gap;
    const p = easeOut(clamp((t - a) / .35));
    if (p <= 0) continue;
    const ex = 120 + rnd(i, 3 + (o.seed || 0)) * 840, ey = 1440 + rnd(i, 4 + (o.seed || 0)) * 330;
    const x = lerp(540 + (rnd(i, 5) - .5) * 500, ex, p), y = lerp(1330, ey, p);
    const kind = i % 3;
    note(g, x, y, 170, 120, (rnd(i, 6) - .5) * .9 * p, null, { col: [C.cream, C.yellow, C.bubble][kind] });
    // A scrawled cross, or an angry face: what the notes say, without new words.
    g.save(); g.translate(x, y); g.rotate((rnd(i, 6) - .5) * .9 * p);
    if (kind === 0) doodle(g, 'x', 0, 0, 34, { col: C.red, w: 9 });
    else if (kind === 1) { letter(g, 'BROKEN', 0, 14, 36, { col: C.red, w: .2, align: 'center', seed: i }); }
    else { doodle(g, 'bolt', -30, 0, 30, { fill: C.red, w: 3 }); doodle(g, 'x', 30, 0, 22, { col: C.ink, w: 7 }); }
    g.restore();
  }
}

// 28.5–32.3: "You can tell me it's broken, but how will I know for myself?"
export function brokenNotes(g, t, c, o = {}) {
  const L1 = o.line ?? 28.60;
  garage(g, t, { night: o.night ?? 1, lights: o.lights ?? .4, door: o.door ?? 0, behind: o.behind });
  g.save(); g.drop = null; g.ink = null; g.fillStyle = rgba(C.night, .35); g.beginPath(); g.rect(-120, -120, 1320, 2160); g.fill(); g.restore();
  bareBulb(g, t, 540, 280, 160, { cone: .8, coneW: 420, coneH: 1500 });
  notesIn(g, t, L1 + .02, 14, .2, { seed: o.seed || 0 });
  // The lead, sat on the floor among the notes, holding one up.
  const up = t > L1 + 1.4;
  const look = up ? [0, -.2] : [.3, .6];
  member(g, 540, 1720, 'lead', { s: 330, t, eyes: up ? 'worried' : 'open', look, mouth: clamp(c.K.vocal(t) * 1.3), legs: 0, armR: -1.2, armL: -.3,
    hold: (g2, u) => { g2.save(); g2.rotate(.2); note(g2, u * .6, -u * 1.2, u * 3, u * 2.1, .1, null, { col: C.cream }); doodle(g2, 'x', u * .6, -u * 1.2, u * .6, { col: C.red, w: 8 }); g2.restore(); } });
  notesIn(g, t, L1 + .4, 6, .33, { seed: 9 + (o.seed || 0) });
  sing(g, t, L1, {
    rows: [{ text: 'You can tell me', y: 480, size: 96, rot: -.02 }, { text: "it's broken,", y: 620, size: 110, rot: .02, ci: 1 },
      { text: 'but how will I know', y: 790, size: 88, rot: -.01, ci: 2 }, { text: 'for myself?', y: 930, size: 104, rot: .015, ci: 3, maxW: 640 }],
    paper: { cols: [C.cream, C.cream, C.yellow, C.yellow] }, maxW: 760, speed: 1.3,
    emph: { broken: { col: C.red }, know: { col: C.blue }, myself: { col: C.blue } },
  });
  // The band's echo, from behind the amps.
  echo(g, t, lineNear(o.echo ?? 31.8, true), 'FOR MYSELF?', 540, 1140, 76);
}

// The rest of the band, heads over the bottom of the frame, singing a backing line.
export function echo(g, t, L, text, x, y, size, o = {}) {
  if (!L) return;
  const p = easeOutBack(clamp((t - L.start + .08) / .18), 2) * (1 - smooth((t - L.end - .5) / .2));
  if (p <= .01) return;
  const raw = g.raw || g;
  raw.save(); raw.translate(x, y); raw.scale(p, p); raw.translate(-x, -y);
  cut(g, () => rr(g, x - 330, y - size * 1.05, 660, size * 1.5, size * .75), o.bubble || C.pink, { drop: 10 });
  raw.restore();
  sing(g, t, L, { back: true, rows: [{ text, x, y: y + size * .1, size, rot: o.rot ?? -.03 }], style: 'marker', o: { col: o.col || C.cream, shade: { col: C.ink, dx: .05, dy: .06 } }, speed: 1.5 });
}

// 32.3–35.2: "So baby now I'm hoping, that you can give me something else": the lead with his
// ear to the door, hoping. The band's echoes follow on their own.
export function hoping(g, t, c, o = {}) {
  const L2 = o.line ?? 32.30;
  garage(g, t, { night: o.night ?? 1, lights: o.lights ?? .5, door: o.door ?? 0, behind: o.behind });
  g.save(); g.drop = null; g.ink = null; g.fillStyle = rgba(C.night, .3); g.beginPath(); g.rect(-120, -120, 1320, 2160); g.fill(); g.restore();
  // A line of warm light under the door: somebody is out there.
  g.save(); g.drop = null; g.ink = null; g.fillStyle = rgba(C.lemon, .55 + .1 * Math.sin(t * 3)); g.beginPath(); g.rect(180, 1318 - (o.gap || 0), 720, 14 + (o.gap || 0)); g.fill(); g.restore();
  const lean = .12 + Math.sin(t * 2) * .02;
  member(g, 620, 1800, 'lead', { s: 470, t, eyes: 'closed', look: [-1, -.2], lean: -lean, mouth: clamp(c.K.vocal(t) * 1.3), legs: 0, armL: -1.5, armR: .1, blush: 1 });
  // Hearts drifting up.
  for (let k = 0; k < 5; k++) {
    const p = ((t - L2) * .45 + k / 5) % 1;
    if (t < L2) continue;
    g.save(); g.globalAlpha *= Math.sin(p * Math.PI);
    doodle(g, 'heart', 420 + Math.sin(k * 2 + t) * 60 + k * 60, 1300 - p * 380, 26 + k * 4, { fill: C.pink, w: 3 });
    g.restore();
  }
  // An echo sung across the cut stays up here too.
  if (o.echo !== undefined) echo(g, t, lineNear(o.echo, true), 'FOR MYSELF?', 540, 1140, 76);
  sing(g, t, L2, {
    rows: [{ text: "So baby now I'm hoping", y: 480, size: 88, rot: -.02 }, { text: 'that you can give me', y: 630, size: 88, rot: .015, ci: 1 },
      { text: 'something else', y: 800, size: 118, rot: -.02, ci: 2 }],
    paper: { cols: [C.cream, C.cream, C.bubble] }, maxW: 780, speed: 1.3,
    emph: { baby: { col: C.pink }, hoping: { col: C.pink }, else: { col: C.pink } },
  });
}

// 35.2–38.9: the echoes, "(something else) (something else)": the other four in a row, close
// harmony, a spotlight each.
export function harmony(g, t, c, o = {}) {
  sunburst(g, 540, 1300, 2200, 16, o.c1 || C.violet, shade(o.c1 || C.violet, .1), t * .1);
  const K = c.K;
  const who = ['elder', 'builder', 'soft', 'bad'];
  const lines = o.lines || [lineNear(35.2, true), lineNear(36.5, true)];
  const singing = lines.some(L => L && t >= L.start - .05 && t <= L.end + .1);
  who.forEach((m, k) => {
    const x = 170 + k * 247, y = 1580 + (k % 2) * 30;
    member(g, x, y, m, { s: 230, t, eyes: singing ? 'closed' : 'happy', mouth: singing ? .7 + .2 * Math.sin(t * 9 + k) : 0, look: [0, -.3], legs: K.beatPos(t), lean: Math.sin(K.beatPos(t) * Math.PI / 2 + k) * .06 });
  });
  const rows = [];
  lines.forEach((L, i) => {
    if (!L) return;
    sing(g, t, L, { back: true, rows: [{ text: 'something else', y: 560 + i * 260, size: 120, rot: i ? .03 : -.03 }], style: 'sticker', o: { shade: { col: i ? C.teal : C.pink, dx: .06, dy: .07 } }, maxW: 900 });
  });
}
