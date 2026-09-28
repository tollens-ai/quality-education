// Windows in the glass onto the people the band built for: boxes on screen, as a reference camera
// sees them, each lit from the far side (box.js panes) with a view of one person in their place,
// aimed at what they hold up. The pre-choruses and choruses use them.
import { W, H, clamp } from './kit.js';
import { wallRect } from './box.js';
import { sky, backdrop } from './world.js';
import { story, aim } from './story.js';

const D = 2200;
// How much bigger each held thing's paper piece is, so what's on it reads.
export const HOLDK = { 'rosa-terminal': 2.1, 'gran-phone': 2.2, 'parent-phone': 2.3, 'jess-board': 1.35, 'jess-note': 1.5, 'rosa-card': 2.6, 'gran-card': 2.3, 'parent-card': 2.3, 'jess-card': 2.3 };
// The four, each holding something up: [brief, state, figure, scene options].
export const HOLD = {
  broken: [['bakery', 'show', 'rosa-terminal', { screen: 'down' }], ['clinic', 'show', 'gran-phone', { screen: 'tiny' }],
    ['school', 'show', 'parent-phone', { screen: 'leak' }], ['wedding', 'show', 'jess-board', { chart: 'bad' }]],
  fixed: [['bakery', 'show', 'rosa-terminal', { screen: 'ok' }], ['clinic', 'show', 'gran-phone', { screen: 'booked' }],
    ['school', 'show', 'parent-phone', { screen: 'lock' }], ['wedding', 'note', 'jess-note', {}]],
  cards: [['bakery', 'card', 'rosa-card', { text: [' '] }], ['clinic', 'card', 'gran-card', { text: [' '] }],
    ['school', 'card', 'parent-card', { text: [' '] }], ['wedding', 'card', 'jess-card', { text: [' '] }]],
};
// What each writes on their card, when they can.
export const KNOW = [['50 people', 'at 8am!'], ['BIG', 'buttons'], ['only MY', 'messages'], ['Dave + Sue', 'APART!']];
export const withText = (list, p) => list.map(([b, s, f, o], i) => [b, s, f, { ...o, text: KNOW[i], textP: p }]);

// The panes for a set of windows at time t, seen by camera c: boxes are cR's screen boxes; items
// what each shows (the entries of HOLD, optionally with o.textP a function of t and i); on(i) and
// off(i) the moments each lights and goes out (off may return undefined: stays lit).
export function windowPanes(c, cR, t, boxes, items, o = {}) {
  const rects = o.rects || boxes.map(b => wallRect(cR, b));
  return items.map(([brief, state, fig, so], i) => {
    if (!boxes[i]) return null;
    // A card held above the head sits high in its window, so the face shows under it.
    const fit = aim(brief, fig, boxes[i], o.k ?? .36, { dy: fig === 'rosa-card' ? -.2 : o.dy ?? .06 });
    const tp = typeof o.textP === 'function' ? { textP: o.textP(t, i) } : {};
    const view = L => { sky(L, c, t, { sun: [0, 420, -6000] }); backdrop(L, c, cR, D, L2 => story(L2, t, brief, state, [0, 0, W, H], { ...so, ...tp, fit, hold: HOLDK[fig] })); };
    return { rect: rects[i], view, t0: o.on ? o.on(i) : -1e9, t1: o.off ? o.off(i) : undefined, ghost: o.ghost ?? .14, dim: .03, seed: (o.seed || 0) + i, light: o.light ?? .28, shape: o.shape, floor: o.floor };
  }).filter(Boolean);
}
// A whole scene in a window (not aimed at a held thing): each place's subject, and how much wider
// than the window its picture is.
const SUBJECT = { bakery: [.44, .4, 1.5], clinic: [.5, .42, 1.45], school: [.5, .6, 1.25], wedding: [.46, .6, 1.35] };
export function sceneFit(brief, box, k = 1) {
  const [u, v, m] = SUBJECT[brief], [x0, y0, x1, y1] = box;
  return { u, v, x: (x0 + x1) / 2, y: (y0 + y1) / 2, w: Math.max(x1 - x0, (y1 - y0) * .6) * m * k };
}
export function scenePane(c, cR, t, box, brief, state, so = {}, o = {}) {
  const fit = so.fit || sceneFit(brief, box, o.k ?? 1);
  const view = L => { sky(L, c, t, { sun: [0, 420, -6000] }); backdrop(L, c, cR, D, L2 => story(L2, t, brief, state, [0, 0, W, H], { ...so, fit })); };
  return { rect: o.rect || wallRect(cR, box), view, t0: o.t0 ?? -1e9, t1: o.t1, ghost: o.ghost ?? .12, dim: .03, seed: o.seed || 0, light: o.light ?? .3, shape: o.shape, floor: o.floor };
}

// Screen boxes: n windows in a row between x0 and x1, from y0 to y1, gap apart.
export function row(n, x0, x1, y0, y1, gap = 20) {
  const w = (x1 - x0 - gap * (n - 1)) / n;
  return Array.from({ length: n }, (_, i) => [x0 + i * (w + gap), y0, x0 + i * (w + gap) + w, y1]);
}
// And two by two.
export const grid = (x0, x1, y0, y1, gap = 22) => { const mx = (x0 + x1) / 2, my = (y0 + y1) / 2; return [[x0, y0, mx - gap / 2, my - gap / 2], [mx + gap / 2, y0, x1, my - gap / 2], [x0, my + gap / 2, mx - gap / 2, y1], [mx + gap / 2, my + gap / 2, x1, y1]]; };
