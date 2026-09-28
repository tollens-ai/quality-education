// The people ASYNC built apps for, and the people in their lives. Each is episode 1's
// picture-book person() in a fixed costume; who(g, name, x, y, o) draws one, and o overrides the
// pose (arms, eyes, mouth, brows, grips).
import { C, rr, circle, ellipse, poly, line, INK, rgba, shade } from './kit.js';
import { person, SKINS } from './cast.js';

// An apron over the torso.
const apron = col => (g, u, by, th) => {
  g.save(); g.drop = null; g.ink = INK.col; g.inkW = Math.max(1.4, u * .22);
  g.fillStyle = col; rr(g, -u * 3.2, by - th + u * 2.6, u * 6.4, th, u * 1); g.fill();
  g.ink = null; g.strokeStyle = INK.col; g.lineWidth = u * .3;
  line(g, -u * 2.4, by - th + u * 2.8, -u * 1.6, by - th + u * .4); g.stroke(); line(g, u * 2.4, by - th + u * 2.8, u * 1.6, by - th + u * .4); g.stroke();
  g.fillStyle = shade(col, -.12); rr(g, -u * 1.6, by - th + u * 5, u * 3.2, u * 2, u * .5); g.fill();
  g.restore();
};
// A white coat with a stethoscope.
const coat = (g, u, by, th) => {
  g.save(); g.drop = null; g.ink = INK.col; g.inkW = Math.max(1.4, u * .22);
  g.fillStyle = C.cream;
  poly(g, [[-u * 6, by + u * 3], [-u * 5.2, by - th + u * 2.4], [-u * 1.2, by - th], [-u * .4, by + u * 3]]); g.fill();
  poly(g, [[u * 6, by + u * 3], [u * 5.2, by - th + u * 2.4], [u * 1.2, by - th], [u * .4, by + u * 3]]); g.fill();
  g.ink = null; g.strokeStyle = '#3b3f55'; g.lineWidth = u * .35;
  g.beginPath(); g.moveTo(-u * 1.2, by - th + u * .4); g.quadraticCurveTo(-u * 2.4, by - th + u * 5, 0, by - th + u * 5.6); g.stroke();
  g.fillStyle = '#9aa0b8'; circle(g, 0, by - th + u * 5.8, u * .7); g.fill();
  g.restore();
};
// A cardigan, open over a blouse, with pearls.
const cardi = (g, u, by, th) => {
  g.save(); g.drop = null; g.ink = null;
  g.fillStyle = C.cream; poly(g, [[-u * 1.6, by - th + u * .4], [u * 1.6, by - th + u * .4], [u * 1.1, by + u], [-u * 1.1, by + u]]); g.fill();
  g.fillStyle = C.cream;
  for (let i = 0; i < 7; i++) { const a = Math.PI * (.2 + i / 6 * .6); circle(g, Math.cos(a) * u * 1.9, by - th + u * .2 + Math.sin(a) * u * 1.4, u * .32); g.fill(); }
  g.restore();
};
// A suit jacket and tie.
const suit = (tie) => (g, u, by, th) => {
  g.save(); g.drop = null; g.ink = null;
  g.fillStyle = C.cream; poly(g, [[-u * 1.8, by - th + u * .3], [u * 1.8, by - th + u * .3], [0, by - th + u * 4]]); g.fill();
  g.fillStyle = tie; poly(g, [[-u * .5, by - th + u * .6], [u * .5, by - th + u * .6], [u * .7, by - th + u * 4.2], [0, by - th + u * 5], [-u * .7, by - th + u * 4.2]]); g.fill();
  g.restore();
};
// A veil, behind the head.
const veil = (g, u, hy, hr) => {
  g.save(); g.drop = null; g.ink = null; g.globalAlpha *= .85; g.fillStyle = '#f7f3ff';
  poly(g, [[-hr * .5, hy - hr * 1.1], [hr * .5, hy - hr * 1.1], [hr * 1.7, hy + hr * 3.4], [-hr * 1.7, hy + hr * 3.4]]); g.fill();
  g.globalAlpha /= .85;
  g.restore();
};

// A ring of flowers for the bride's hair, worn on top.
const flowers = (g, u, hy, hr) => {
  g.save(); g.drop = null; g.ink = INK.col; g.inkW = 2.2;
  for (let i = -2; i <= 2; i++) { g.fillStyle = i % 2 ? C.bubble : C.cream; circle(g, i * hr * .34, hy - hr * .92 + Math.abs(i) * hr * .08, hr * .19); g.fill(); }
  g.restore();
};

export const CAST = {
  // Rosa runs the bakery; her checkout went down at eight.
  rosa: { skin: SKINS[3], hairStyle: 'curly', hair: '#24160f', top: C.orange, torso: apron(C.cream) },
  // Gran, Dr Obi's patient, who couldn't book.
  gran: { skin: SKINS[0], hairStyle: 'grey', glasses: 'round', top: '#f59bbd', torso: cardi, legs: '#6b5a7a' },
  // Dr Obi, who runs the clinic.
  obi: { skin: SKINS[5], hairStyle: 'short', hair: '#1a1210', top: '#5a7bd6', torso: coat },
  // Two parents at the school.
  mo: { skin: SKINS[4], hairStyle: 'cap', hatColor: C.teal, top: C.yellow },
  kim: { skin: SKINS[1], hairStyle: 'bob', hair: '#1b1414', top: C.lilac },
  // Jess, the bride; Dave and Sue, his angry ex.
  jess: { skin: SKINS[2], hairStyle: 'bun', hair: '#3a2418', top: '#fbf6ff', behindHead: veil, extra: flowers, legs: '#fbf6ff' },
  dave: { skin: SKINS[1], hairStyle: 'bald', top: '#5f6488', torso: suit(C.pink) },
  sue: { skin: SKINS[0], hairStyle: 'long', hair: '#b8322a', top: C.red },
};

export function who(g, name, x, y, o = {}) {
  const base = CAST[name];
  const extra = base.extra || o.extra ? (g2, u, hy, hr) => { if (base.extra) base.extra(g2, u, hy, hr); if (o.extra) o.extra(g2, u, hy, hr); } : undefined;
  person(g, x, y, { ...base, ...o, extra });
}
