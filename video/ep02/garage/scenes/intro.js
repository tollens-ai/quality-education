// Intro: the dedication in the dark, then the band slams in, one instrument a bar, and the title.
import { C, TAU, clamp, lerp, smooth, easeOut, easeOutBack, rr, circle, poly, rnd, INK, rgba, mix, shade } from '../kit.js';
import { garage, amp, bareBulb } from '../world.js';
import { play, member, mic, guitar, drumKit, keytar } from '../band.js';
import { field, cut, sunburst, doodleField, speedLines, tape, doodle, checker, tornRect, nameTag } from '../zine.js';
import { sing, lineNear } from '../lyrics.js';
import { letter, measure } from '../hand.js';
import { bandInGarage } from './chorus.js';

// 0–2.3 s: the lead at the mic, the room dark but for one bulb. The dedication is spoken, so it's
// scrawled on a torn note stuck to the mic stand, not sung big.
export function dedication(g, t, c) {
  garage(g, t, { night: 1, lights: 0 });
  // Darkness everywhere but the bulb's cone.
  g.save(); g.drop = null; g.ink = null; g.fillStyle = rgba(C.night, .72); g.beginPath(); g.rect(-120, -120, 1320, 2160); g.fill(); g.restore();
  const [bx, by] = bareBulb(g, t, 860, -40, 330, { cone: 1, coneW: 560, coneH: 1900 });
  play(g, t, c.K, 'lead', 560, 1640, { s: 520, energy: .15, noInst: true, mouth: clamp(c.K.vocal(t) * 1.3), eyes: 'closed', pose: { armR: -1.3, ext: 1.1, hold: (g2, u) => mic(g2, u, { rot: -.25 }) } });
  sing(g, t, lineNear(.1, true), {
    rows: [{ text: "This one's for", y: 520, size: 80, rot: -.03, x: 500 }, { text: 'everyone we ever', y: 640, size: 80, rot: .01, x: 500 },
      { text: 'built an app for', y: 760, size: 80, rot: -.02, x: 500 }],
    style: 'night', maxW: 900,
    emph: { everyone: { col: C.yellow } },
  });
}

// 2.3 s: the lights come on and the band is already playing.
export function slamIn(g, t, c) {
  const on = smooth((t - 2.3) / .12);
  garage(g, t, { night: 1, lights: on });
  bandInGarage(g, t, c, {});
  // The dedication's last words stay up a moment after the band comes in, then go.
  sing(g, t, lineNear(.1, true), {
    rows: [{ text: "This one's for", y: 520, size: 80, rot: -.03, x: 500 }, { text: 'everyone we ever', y: 640, size: 80, rot: .01, x: 500 },
      { text: 'built an app for', y: 760, size: 80, rot: -.02, x: 500 }],
    style: 'night', maxW: 900, hold: .45, emph: { everyone: { col: C.yellow } },
  });
}

// A close-up on one player, on a flat colour field with speed lines on the beat.
export function closeUp(g, t, c, who, o = {}) {
  const K = c.K;
  const bp = K.beatPos(t), hit = Math.pow(1 - (bp % 1), 3);
  sunburst(g, o.cx ?? 540, o.cy ?? 1000, 2200, 18, o.c1 || C.pink, o.c2 || shade(o.c1 || C.pink, .12), t * .12 * (o.spin ?? 1));
  speedLines(g, o.cx ?? 540, o.cy ?? 1000, 560 + hit * 40, 1300, 28, 7, rgba(C.ink, .9), 5);
  if (who === 'bad') {
    play(g, t, K, 'bad', 540, 1500, { s: 520, energy: 1.2 });
  } else {
    play(g, t, K, who, 540, 1560, { s: 560, energy: 1.1, eyes: o.eyes, pose: o.pose });
  }
  if (o.tag) {
    // The name tag slaps on a beat after the cut.
    const p = easeOutBack(clamp((t - c.t0 - .2) / .16), 2.2);
    if (p > 0) nameTag(g, o.tx ?? 540, o.ty ?? 400, o.tag, o.tr ?? -.08, p * 1.25);
  }
}

// The title card: HOW WILL I KNOW, a ransom note stamped letter by letter on the beat, over the
// band playing the garage.
export function titleCard(g, t, c) {
  garage(g, t, { night: 1, lights: 1 });
  bandInGarage(g, t, c, {});
  // A dark band behind the title so the chips read.
  const t0 = c.t0;
  const words = ['HOW', 'WILL', 'I', 'KNOW?'];
  const size = 112;
  const cols = [C.yellow, C.pink, C.cream, C.mint, C.lilac, C.orange, C.sky];
  let k = 0;
  const beat = c.K.beat || .441;
  words.forEach((wd, wi) => {
    const rowY = [500, 500, 700, 700][wi];
    // Letters sit .3 of the size apart, and words a whole size apart.
    const wordW = w => [...w].reduce((a, ch) => a + measure(ch, size, .2) + size * .3, -size * .3);
    const [a, b] = wi < 2 ? ['HOW', 'WILL'] : ['I', 'KNOW?'];
    const rowW = wordW(a) + size + wordW(b);
    let x = 540 - rowW / 2 + (wi % 2 ? wordW(a) + size : 0) - size * .15;
    for (const ch of wd) {
      const at = t0 + .12 + k * beat / 2;
      const p = clamp((t - at) / .12);
      const cw = measure(ch, size, .2);
      if (p > 0) {
        const raw = g.raw || g;
        const pop = easeOutBack(p, 2.6);
        raw.save(); raw.translate(x + cw / 2 + size * .15, rowY - size * .5);
        raw.rotate((rnd(k, 7) - .5) * .22); raw.scale(pop, pop);
        const col = cols[k % cols.length];
        cut(g, () => rr(g, -cw / 2 - size * .18, -size * .66, cw + size * .36, size * 1.32, 8), col, { drop: 12, inkW: 3 });
        letter(g, ch, 0, size * .5, size, { col: C.ink, w: .2, align: 'center', seed: 20 + k });
        raw.restore();
      }
      x += cw + size * .3;
      k++;
    }
  });
  // The band's name and the series, taped underneath.
  const pb = clamp((t - (t0 + .12 + k * beat / 2)) / .15);
  if (pb > 0) {
    const raw = g.raw || g;
    raw.save(); raw.translate(540, 880); raw.rotate(-.02); raw.scale(lerp(.7, 1, easeOutBack(pb, 2)), lerp(.7, 1, easeOutBack(pb, 2)));
    cut(g, () => tornRect(g, -330, -44, 660, 88, 5), C.ink, { drop: 8, ink: false });
    letter(g, 'SOFTWARE QUALITY THEORY 101 · EP 2', 0, 18, 38, { col: C.cream, w: .17, align: 'center', seed: 31 });
    tape(g, -320, -40, 90, -.4); tape(g, 320, -40, 90, .4);
    raw.restore();
  }
}
