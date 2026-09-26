// The people it's for, cut from paper like Matisse's figures: one silhouette, a pose, and one
// thing that says who they are. Feet at y = 0, about 420 tall at scale 1.
import { PAL, TAU, cut, paint, shape, at, clamp01, lerp } from './paper.js';
import { clawd } from './cast.js';

const limb = (len, w0, w1) => [[-w0 / 2, 0], [w0 / 2, 0], [w1 / 2, len], [0, len + w1 * 0.4], [-w1 / 2, len]];

// A figure. pose: { armL, armR (radians from hanging down; + swings forward/out), legSpread,
// lean, hat: 'mortar' | 'bun' | 'phones' | null }
export function figure(g, x, y, s, col, pose = {}, key = 'fig') {
  const lift = pose.lift ?? 1.4;
  at(g, x, y, pose.lean || 0, s, () => {
    const sp = pose.legSpread ?? 0.12;
    for (const side of [-1, 1]) {
      at(g, side * 26, -175, -side * sp, 1, () => paint(g, cut(`${key}-leg${side}`, () => limb(178, 44, 30), { amp: 1.4 }), col, { lift, seed: 3 + side }));
    }
    paint(g, cut(`${key}-torso`, () => shape.smooth([[-62, -300], [62, -300], [54, -230], [48, -160], [-48, -160], [-54, -230]], 5), { amp: 1.6 }), col, { lift, seed: 5 });
    for (const side of [-1, 1]) {
      const a = side < 0 ? (pose.armL ?? 0.15) : (pose.armR ?? 0.15);
      at(g, side * 56, -292, -side * a, 1, () => paint(g, cut(`${key}-arm${side}`, () => limb(150, 30, 22), { amp: 1.2 }), col, { lift: lift + 0.2, seed: 7 + side }));
    }
    paint(g, cut(`${key}-neck`, () => shape.rect(26, 30, -13, -325), { amp: 0.8 }), col, { lift, seed: 9 });
    paint(g, cut(`${key}-head`, () => shape.ellipse(40, 46, 36, 0, -362), { amp: 1.4 }), col, { lift, seed: 11 });
    if (pose.hat === 'mortar') {
      paint(g, cut('mortar', () => [[-70, -408], [0, -432], [70, -408], [0, -386]], { amp: 1 }), PAL.black === col ? PAL.cream : PAL.black, { lift: lift + 0.3, seed: 12 });
      paint(g, cut('tassel', () => [[40, -412], [48, -412], [52, -350], [44, -346]], { amp: 0.5 }), PAL.yellow, { lift: lift + 0.4, seed: 13 });
    }
    if (pose.hat === 'bun') paint(g, cut(`${key}-bun`, () => shape.ellipse(24, 22, 24, 22, -402), { amp: 1 }), col, { lift, seed: 14 });
    if (pose.hat === 'phones') {
      g.save(); g.strokeStyle = pose.accent || PAL.yellow; g.lineWidth = 10; g.lineCap = 'round';
      g.beginPath(); g.arc(0, -365, 52, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); g.restore();
      for (const side of [-1, 1]) paint(g, cut(`cup${side}`, () => shape.ellipse(16, 24, 20, side * 46, -358)), pose.accent || PAL.yellow, { lift: lift + 0.3, seed: 15 });
    }
  });
}

// Where a figure's hand is (arm pivot + rotated arm), in the figure's frame at scale s.
export function hand(side, a, s = 1, x = 0, y = 0) {
  const L = 160;
  return [x + s * (side * 56 + side * Math.sin(a) * L), y + s * (-292 + Math.cos(a) * L)];
}

// A chat bot: a speech bubble with eyes, cut from one sheet.
export function chatBot(g, x, y, s, col, t = 0) {
  at(g, x, y, Math.sin(t * 5) * 0.05, s, () => {
    paint(g, cut('bubble', () => [shape.smooth([[-120, -100], [120, -100], [140, -80], [140, 60], [120, 80], [-40, 80], [-90, 130], [-70, 80], [-120, 80], [-140, 60], [-140, -80]], 4),
      shape.ellipse(14, 20, 20, -45, -20), shape.ellipse(14, 20, 20, 45, -20)]), col, { lift: 1.6, seed: 21 });
  });
}

// A little robot: a rounded box head with an antenna, on a small body.
export function robot(g, x, y, s, col, key = 'bot') {
  at(g, x, y, 0, s, () => {
    paint(g, cut(`${key}-legs`, () => [[-40, -90], [40, -90], [40, 0], [18, 0], [18, -50], [-18, -50], [-18, 0], [-40, 0]], { amp: 1 }), col, { lift: 1.4, seed: 31 });
    paint(g, cut(`${key}-body`, () => shape.smooth([[-60, -200], [60, -200], [66, -100], [-66, -100]], 4)), col, { lift: 1.4, seed: 32 });
    paint(g, cut(`${key}-head`, () => [shape.smooth([[-58, -310], [58, -310], [64, -222], [-64, -222]], 5), shape.rect(18, 26, -34, -280), shape.rect(18, 26, 16, -280)]), col, { lift: 1.5, seed: 33 });
    paint(g, cut(`${key}-ant`, () => [[-4, -310], [4, -310], [4, -350], [-4, -350]], { amp: 0.5 }), col, { lift: 1.5, seed: 34 });
    paint(g, cut(`${key}-bulb`, () => shape.ellipse(13, 13, 16, 0, -358)), PAL.red, { lift: 1.6, seed: 35 });
  });
}

// ---------- each person's value, as a plate ----------
export const VALUE = {
  wow: { col: PAL.pink, make: () => shape.star(7, 96, 50) },
  last: { col: PAL.green, make: () => shape.smooth([[0, -100], [52, -42], [56, 32], [20, 96], [-20, 96], [-56, 32], [-52, -42]], 6) },
  laugh: { col: PAL.yellow, make: () => shape.star(14, 92, 70), dark: true },
  pass: { col: PAL.red, make: () => [[-90, 0], [-60, -30], [-25, 5], [65, -85], [95, -55], [-25, 65]] },
  sweet: { col: PAL.pink, make: () => shape.smooth([[0, -40], [40, -90], [95, -60], [85, 10], [0, 90], [-85, 10], [-95, -60], [-40, -90]], 5) },
  speak: { col: PAL.teal, make: () => [shape.ellipse(90, 90, 48), shape.ellipse(62, 62, 40)] },
  'no leak': { col: PAL.blue, make: () => shape.smooth([[0, -100], [85, -70], [80, 20], [0, 105], [-80, 20], [-85, -70]], 5) },
  neat: { col: PAL.yellow, make: () => [[-90, -90], [90, -90], [90, 90], [-90, 90]], dark: true },
};

export function valuePlate(g, v, lift = 2.6) {
  const V = VALUE[v];
  paint(g, cut(`val-${v}`, V.make), V.col, { lift, seed: v.length * 5 });
  if (v === 'neat') {   // tidy drawers: three labelled boxes
    for (let i = 0; i < 3; i++) {
      g.save(); g.strokeStyle = PAL.black; g.lineWidth = 5; g.strokeRect(-70, -72 + i * 50, 140, 40);
      g.fillStyle = PAL.black; g.fillRect(-18, -56 + i * 50, 36, 8); g.restore();
    }
  }
}
