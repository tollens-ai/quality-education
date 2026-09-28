// The story, in pictures: the four briefs, each in the states the song takes it through (built,
// broken, what perfect means, the oracle, shown, carded, loved), composed from the paper cut-outs
// and the painted places to fill any box: a pane lit in the mirror, a window cut in it, a
// porthole, a cell. People stand in each place's own coordinates (fractions of its picture), so
// they keep to its floor however the box crops it. What only code can say is drawn over the
// picture in the same hand: the terminal's screen, the clock's hands, the booking site, the
// leaked messages, the seating chart, the notes and cards.
import { W, H, clamp, lerp, hash, rgba, mix, easeOut, easeInOut, beatPos } from './kit.js';
import { figure, BACK, CAST } from './paper.js';

export const INKC = '#16121a';

// ---------------------------------------------------------------- placing things
// Draw backdrop `name` so that the window `win` (fractions of its picture) covers `box`. Returns
// where its fractions fall on screen, how long a fraction of its height is, and a way to draw a
// band of it again over whatever stands in front (a counter, a table).
// Or, with fit = { u, v, x, y, w }: the picture's point (u, v) at (x, y), the picture w wide.
export function bg(L, name, box, win = [0, 0, 1, 1], fit = null) {
  const b = BACK[name];
  if (!b) return null;
  const [x0, y0, x1, y1] = box;
  const [u0, v0, u1, v1] = win;
  let k, ox, oy;
  if (fit) { k = fit.w / b.w; ox = fit.x - fit.u * b.w * k; oy = fit.y - fit.v * b.h * k; }
  else {
    k = Math.max((x1 - x0) / ((u1 - u0) * b.w), (y1 - y0) / ((v1 - v0) * b.h));
    ox = (x0 + x1) / 2 - (u0 + u1) / 2 * b.w * k; oy = (y0 + y1) / 2 - (v0 + v1) / 2 * b.h * k;
  }
  L.drawImage(b.img, ox, oy, b.w * k, b.h * k);
  return {
    b, k,
    at: (fu, fv) => [ox + fu * b.w * k, oy + fv * b.h * k],
    len: f => f * b.h * k,
    again: (fv0, fv1 = 1, fu0 = 0, fu1 = 1) => {
      L.save(); L.beginPath(); L.rect(ox + fu0 * b.w * k, oy + fv0 * b.h * k, (fu1 - fu0) * b.w * k, (fv1 - fv0) * b.h * k); L.clip();
      L.drawImage(b.img, ox, oy, b.w * k, b.h * k); L.restore();
    },
    rect: r => { const [a0, a1] = [ox + r[0] * b.w * k, oy + r[1] * b.h * k]; return [a0, a1, ox + r[2] * b.w * k, oy + r[3] * b.h * k]; },
  };
}
// A person standing in a place: feet at the picture's (fu, fv), fh of its height tall.
export function stand(L, m, name, fu, fv, fh, o = {}) {
  const [x, y] = m.at(fu, fv);
  return figure(L, name, x, y, m.len(fh), o);
}
// Draw on what a figure holds up (its measured blank), moving with the card.
// Where a figure standing in a place (feet at fu, fv, fh of its height tall) holds its blank: the
// blank's centre and size as fractions of the place's picture, for aiming a view at it.
export function blankAt(place, name, fu, fv, fh) {
  const b = BACK[place], f = CAST[name], bl = f?.blank?.box;
  if (!b || !bl) return null;
  const kp = fh * b.h / (f.h * (1 - (f.head || 0)));
  const cx = fu * b.w + ((bl[0] + bl[2]) / 2 - .5) * f.w * kp, cy = fv * b.h - (1 - (bl[1] + bl[3]) / 2) * f.h * kp;
  return { u: cx / b.w, v: cy / b.h, w: (bl[2] - bl[0]) * f.w * kp / b.w, h: (bl[3] - bl[1]) * f.h * kp / b.h };
}
// Where each brief's person stands when they hold something up to us (place, fu, fv, fh), as the
// scenes below place them; and a view aimed at what they hold: a fit putting the held thing's
// centre at the box's centre (dy of its height lower), k of the box's width across, but never
// enlarging the cut-out past `up` times its own pixels, nor leaving the box uncovered.
export const HOLDS = { bakery: ['bg-counter', .42, .87, .62], clinic: ['bg-clinic', .5, 1.0, .48], school: ['bg-school', .6, 1.0, .5], wedding: ['bg-wedding', .5, 1.02, .62] };
export function aim(brief, fig, box, k = .3, o = {}) {
  const [place, fu0, fv0, fh0] = HOLDS[brief];
  const fu = o.fu ?? fu0, fv = o.fv ?? fv0, fh = o.fh ?? fh0;
  const bl = blankAt(place, fig, fu, fv, fh), b = BACK[place], f = CAST[fig];
  if (!bl) return null;
  const [x0, y0, x1, y1] = box;
  let w = k * (x1 - x0) / bl.w;
  w = Math.min(w, (o.up ?? 1.6) * f.h * (1 - (f.head || 0)) / (fh * b.h / b.w));
  w = Math.max(w, (x1 - x0) * 1.08, (y1 - y0) * 1.08 * b.w / b.h);
  return { u: bl.u, v: bl.v, x: (x0 + x1) / 2, y: (y0 + y1) / 2 + (o.dy ?? 0) * (y1 - y0), w };
}
// With hold = { k, body }, what they hold is its own bigger piece of paper, pushed up to the glass
// in front of their hands (a phone, a card, the terminal, Jess's sheet or board), so what's on it
// reads; HOLD_AT nudges each pose's piece clear of the face.
const HOLD_AT = { 'gran-phone': [-.16, .12], 'parent-phone': [-.12, .16], 'rosa-terminal': [0, .06], 'rosa-card': [0, -.05], 'gran-card': [.05, .1], 'parent-card': [0, .12], 'jess-card': [-.05, .14], 'jess-note': [0, .1], 'jess-board': [0, .08] };
export const onBlank = (name, draw, hold = null) => (g, X, Y, w, h) => {
  const b = CAST[name]?.blank?.box;
  if (!b) return;
  let x = X + b[0] * w, y = Y + b[1] * h, bw = (b[2] - b[0]) * w, bh = (b[3] - b[1]) * h;
  if (hold?.k > 1) {
    const [dx, dy] = HOLD_AT[name] || [0, 0], k = hold.k;
    const cx = x + bw / 2 + dx * bw * k, cy = y + bh / 2 + dy * bh * k;
    bw *= k; bh *= k; x = cx - bw / 2; y = cy - bh / 2;
    [x, y, bw, bh] = heldBody(g, hold.body, x, y, bw, bh);
  }
  draw(g, x, y, bw, bh);
};
// The held piece's body, drawn; returns the rect its face (screen, card) fills.
function heldBody(g, body, x, y, w, h) {
  g.save();
  g.fillStyle = 'rgba(20,14,22,.28)'; rr(g, x + w * .05, y + h * .06, w, h, Math.min(w, h) * .08); g.fill();
  if (body === 'phone') {
    const bz = w * .1;
    g.fillStyle = '#1b1c22'; rr(g, x - bz, y - bz * 1.6, w + bz * 2, h + bz * 3.2, w * .2); g.fill(); ink(g, Math.max(2, w * .03)); g.stroke();
    g.restore(); return [x, y, w, h];
  }
  if (body === 'terminal') {
    const bz = w * .09;
    g.fillStyle = '#2b2d33'; rr(g, x - bz, y - bz, w + bz * 2, h * 2.4, w * .12); g.fill(); ink(g, Math.max(2, w * .03)); g.stroke();
    for (let r = 0; r < 3; r++) for (let q = 0; q < 3; q++) { g.fillStyle = r === 2 && q === 2 ? '#3aa56b' : r === 2 && q === 0 ? '#c4221c' : '#8b8f99'; rr(g, x + w * (.08 + q * .31), y + h * (1.18 + r * .38), w * .22, h * .26, h * .06); g.fill(); }
    g.restore(); return [x, y, w, h];
  }
  // Paper: a card, a sheet, a board.
  g.fillStyle = body === 'sheet' ? '#fdfcf6' : '#fbf6ea'; rr(g, x, y, w, h, Math.min(w, h) * .04); g.fill();
  if (body === 'sheet') { g.strokeStyle = 'rgba(80,120,190,.35)'; g.lineWidth = Math.max(1, h * .006); for (let i = 1; i < 12; i++) { g.beginPath(); g.moveTo(x + w * .06, y + h * i / 12); g.lineTo(x + w * .94, y + h * i / 12); g.stroke(); } }
  ink(g, Math.max(2, Math.min(w, h) * .025)); rr(g, x, y, w, h, Math.min(w, h) * .04); g.stroke();
  g.restore();
  return [x + w * .04, y + h * .06, w * .92, h * .88];
}
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
const ink = (g, w) => { g.strokeStyle = INKC; g.lineWidth = w; g.lineJoin = 'round'; g.lineCap = 'round'; };

// ---------------------------------------------------------------- what code draws
// The card terminal's screen. state: 'idle' | 'ok' | 'down' | 'load' (with o.load 0..1+).
export function terminalUI(g, x, y, w, h, state, t, o = {}) {
  g.save();
  rr(g, x, y, w, h, Math.min(w, h) * .12); g.clip();
  const bgc = { idle: '#cfd6cc', ok: '#1f3b2c', down: '#c4221c', load: '#1f3b2c' }[state] || '#cfd6cc';
  g.fillStyle = bgc; g.fillRect(x, y, w, h);
  const s = Math.min(w, h);
  if (state === 'ok' || state === 'load') {
    g.strokeStyle = '#8fff5a'; g.lineWidth = s * .12; g.lineCap = 'round'; g.lineJoin = 'round';
    const cx = x + w * (state === 'load' ? .3 : .5), cy = y + h * .5;
    g.beginPath(); g.moveTo(cx - s * .22, cy); g.lineTo(cx - s * .05, cy + s * .18); g.lineTo(cx + s * .26, cy - s * .2); g.stroke();
    if (state === 'load') {
      const lv = clamp(o.load ?? 1, 0, 2);
      g.fillStyle = 'rgba(143,255,90,.25)'; g.fillRect(x + w * .55, y + h * .18, w * .32, h * .64);
      g.fillStyle = '#8fff5a'; g.fillRect(x + w * .55, y + h * (.82 - .64 * lv / 2), w * .32, h * .64 * lv / 2);
    }
  } else if (state === 'down') {
    const bl = Math.floor(t * 4) % 2 ? .75 : 1;
    g.globalAlpha = bl;
    g.strokeStyle = '#fff'; g.lineWidth = s * .13; g.lineCap = 'round';
    const cx = x + w / 2, cy = y + h / 2, r = s * .24;
    g.beginPath(); g.moveTo(cx - r, cy - r); g.lineTo(cx + r, cy + r); g.moveTo(cx + r, cy - r); g.lineTo(cx - r, cy + r); g.stroke();
  }
  g.restore();
}
// A clock's hands at hh:mm; o.snap (0..1) is the jolt as it lands on the hour.
export function clockHands(g, cx, cy, r, hh, mm, o = {}) {
  const jolt = (o.snap || 0) * .06 * Math.sin((o.snap || 0) * 20);
  const ha = ((hh % 12) + mm / 60) / 12 * Math.PI * 2, ma = mm / 60 * Math.PI * 2 + jolt;
  g.save(); g.lineCap = 'round';
  for (const [a, len, w] of [[ha, .52, .09], [ma, .8, .06]]) {
    g.strokeStyle = INKC; g.lineWidth = r * w;
    g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.sin(a) * r * len, cy - Math.cos(a) * r * len); g.stroke();
  }
  g.fillStyle = '#c4221c'; g.beginPath(); g.arc(cx, cy, r * .08, 0, Math.PI * 2); g.fill();
  g.restore();
}
// The clinic's booking site. It looks cute (a pink heart, a pastel calendar) and it's tiny: a
// month of small pale slots with pale numbers. state: 'idle'; 'down', where Gran's thumb, bigger
// than any slot, presses and lands on the wrong one, and up comes "oops! try again"; 'big', the
// fixed site, a few big clear times; 'booked'.
export function bookingUI(g, t, state, x, y, w, h) {
  g.save();
  g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.fillStyle = '#ffe9ef'; g.fillRect(x, y, w, h);
  const hb = h * .2;
  g.fillStyle = '#ffb6c9'; g.fillRect(x, y, w, hb);
  const hx = x + hb * .62, hy = y + hb * .52, hs = hb * .34;
  g.fillStyle = '#e8456f'; g.beginPath();
  g.moveTo(hx, hy + hs); g.bezierCurveTo(hx - hs * 2, hy - hs * .3, hx - hs * .7, hy - hs * 1.8, hx, hy - hs * .6); g.bezierCurveTo(hx + hs * .7, hy - hs * 1.8, hx + hs * 2, hy - hs * .3, hx, hy + hs); g.fill();
  g.fillStyle = '#9c2346'; g.font = `${Math.round(Math.min(hb * .48, w * .1))}px Hand`; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText('Book a visit', x + hb * 1.25, y + hb * .54);
  const cx = x + w / 2, cy = y + hb + (h - hb) / 2;
  if (state === 'big') {
    // Fixed: three big times, dark on light, easy to read and hard to miss.
    ['MON 9:00', 'TUE 11:30', 'WED 2:15'].forEach((s, i) => {
      const bw = w * .82, bh = (h - hb) * .24, by = y + hb + (h - hb) * (.08 + i * .3);
      g.fillStyle = i === 1 ? '#9c2346' : '#c8385f'; rr(g, x + (w - bw) / 2, by, bw, bh, bh * .3); g.fill();
      ink(g, Math.max(1.5, bh * .04)); g.stroke();
      g.fillStyle = '#fff'; g.font = `800 ${Math.round(Math.min(bh * .5, bw * .13))}px Mono`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(s, cx, by + bh * .54);
    });
    g.restore(); return;
  }
  // The calendar: small pale slots, pale numbers, pretty and hard to hit or read.
  const gx = x + w * .06, gy = y + hb + h * .05, gw = w * .88, gh = (h - hb) * .72;
  const cols = 7, rows = 5, cw = gw / cols, ch = gh / rows;
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
    g.fillStyle = (r * 7 + k) % 5 === 2 ? '#ffb1c6' : '#ffcfdc';
    rr(g, gx + k * cw + cw * .16, gy + r * ch + ch * .2, cw * .68, ch * .6, ch * .22); g.fill();
    g.strokeStyle = 'rgba(214,110,140,.5)'; g.lineWidth = Math.max(.8, cw * .03); g.stroke();
    g.fillStyle = '#dd8ea5'; g.font = `600 ${Math.max(4, Math.round(ch * .26))}px Mono`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(String(1 + r * 7 + k), gx + k * cw + cw / 2, gy + r * ch + ch * .52);
  }
  if (state === 'down') {
    // Her thumb, bigger than a slot, pressing a new place every beat or so, and the slot it
    // lands on isn't the one she meant.
    const tries = [[2, 1], [4, 2], [1, 3], [5, 1], [3, 3]];
    const n = Math.floor(t * 1.7) % tries.length, ph = (t * 1.7) % 1;
    const [tc, tr] = tries[n];
    g.fillStyle = '#e8456f'; rr(g, gx + (tc + 1) * cw + cw * .16, gy + tr * ch + ch * .2, cw * .68, ch * .6, ch * .22); g.fill();
    const sx = gx + (tc + .75) * cw, sy = gy + (tr + .55) * ch, k2 = 1 + .08 * Math.sin(ph * Math.PI);
    g.fillStyle = 'rgba(214,160,132,.85)'; g.beginPath(); g.ellipse(sx, sy, cw * .95 * k2, ch * 1.15 * k2, -.35, 0, Math.PI * 2); g.fill();
    ink(g, Math.max(1.2, cw * .05)); g.stroke();
    g.fillStyle = 'rgba(255,236,226,.9)'; g.beginPath(); g.ellipse(sx + cw * .12, sy - ch * .5, cw * .38, ch * .34, -.35, 0, Math.PI * 2); g.fill();
    const bw = w * .7, bh = (h - hb) * .13, by = y + h - bh - (h - hb) * .05;
    g.fillStyle = '#9c2346'; rr(g, x + (w - bw) / 2, by, bw, bh, bh * .45); g.fill();
    g.fillStyle = '#ffe9ef'; g.font = `700 ${Math.max(5, Math.round(Math.min(bh * .52, bw * .1)))}px Mono`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('oops! try again', cx, by + bh * .54);
  } else if (state === 'booked') {
    const bw = w * .56, bh = (h - hb) * .52;
    g.fillStyle = '#3aa56b'; rr(g, cx - bw / 2, cy - bh / 2, bw, bh, bh * .18); g.fill();
    ink(g, Math.max(2, bh * .025)); g.stroke();
    g.fillStyle = '#fff'; g.font = `900 ${Math.round(bh * .42)}px Stencil`; g.textAlign = 'center'; g.fillText('BOOKED', cx - bw * .08, cy + bh * .04);
    g.strokeStyle = '#fff'; g.lineWidth = bh * .09; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(cx + bw * .25, cy); g.lineTo(cx + bw * .31, cy + bh * .15); g.lineTo(cx + bw * .41, cy - bh * .2); g.stroke();
  }
  g.restore();
}
// A chat message: a bubble with a tail, in the machine's type.
export function bubble(g, text, x, y, px, o = {}) {
  g.save();
  g.font = `600 ${px}px Mono`;
  const tw = g.measureText(text).width, bw = tw + px * 1.3, bh = px * 2;
  g.globalAlpha *= o.alpha ?? 1;
  g.fillStyle = o.fill || '#ffffff'; rr(g, x, y, bw, bh, bh * .45); g.fill();
  ink(g, Math.max(2, px * .1)); g.stroke();
  g.beginPath(); g.moveTo(x + bw * .22, y + bh - 1); g.lineTo(x + bw * .16, y + bh + px * .6); g.lineTo(x + bw * .32, y + bh - 1); g.closePath(); g.fillStyle = o.fill || '#ffffff'; g.fill();
  g.fillStyle = '#1f1c24'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(text, x + px * .65, y + bh / 2 + px * .04);
  if (o.lock) padlock(g, x + bw - px * .3, y - px * .5, px * 1.7, o.lock);
  g.restore();
  return [bw, bh];
}
// A padlock, snapping shut as k goes to 1.
export function padlock(g, x, y, s, k = 1) {
  g.save();
  g.fillStyle = '#a57bff'; ink(g, s * .12);
  rr(g, x - s * .5, y, s, s * .8, s * .14); g.fill(); g.stroke();
  g.beginPath(); g.arc(x, y - s * (.05 + .25 * (1 - clamp(k))), s * .32, Math.PI, 0); g.strokeStyle = '#a57bff'; g.lineWidth = s * .16; g.stroke();
  g.restore();
}
// The seating plan: a round table with names round it. mode 'bad' sits DAVE by SUE (the pair
// circled in red); 'good' puts them at opposite tables.
export function seatingChart(g, x, y, w, h, mode, t) {
  g.save();
  g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.fillStyle = '#fbf8f0'; g.fillRect(x, y, w, h);
  const s = Math.min(w, h);
  // Apart, the two tables sit side by side on a wide board and one above the other on a tall one.
  const wide = w > h;
  const tables = mode === 'good'
    ? [{ cx: x + w * (wide ? .27 : .5), cy: y + h * (wide ? .58 : .4), names: ['DAVE', 'Ann', 'Raj', 'Mo'] }, { cx: x + w * (wide ? .73 : .5), cy: y + h * (wide ? .58 : .77), names: ['SUE', 'Kit', 'Jo', 'Bea'] }]
    : [{ cx: x + w * .5, cy: y + h * .56, names: ['DAVE', 'SUE', 'Ann', 'Raj', 'Mo', 'Kit'] }];
  g.fillStyle = '#1f1c24'; g.font = `700 ${Math.round(s * .1)}px Mono`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(mode === 'good' ? 'TABLES 2 + 7' : 'TABLE 4', x + w / 2, y + h * .12);
  for (const tb of tables) {
    const R = s * (mode === 'good' ? (wide ? .13 : .1) : .2);
    g.fillStyle = '#e9e2d0'; g.beginPath(); g.arc(tb.cx, tb.cy, R, 0, Math.PI * 2); g.fill(); ink(g, s * .015); g.stroke();
    tb.names.forEach((n, i) => {
      const a = -Math.PI / 2 + i / tb.names.length * Math.PI * 2, px = tb.cx + Math.cos(a) * R * 1.55, py = tb.cy + Math.sin(a) * R * 1.35;
      const hot = mode === 'bad' && (n === 'DAVE' || n === 'SUE');
      g.fillStyle = hot ? '#c4221c' : '#1f1c24'; g.font = `${hot ? 800 : 600} ${Math.round(s * (hot ? .085 : .07))}px Mono`;
      g.fillText(n, px, py);
    });
    if (mode === 'bad') {
      // The pair circled, the circle drawn as a red pen would.
      const a0 = -Math.PI / 2, a1 = -Math.PI / 2 + Math.PI * 2 / 6;
      const mx = tb.cx + Math.cos((a0 + a1) / 2) * R * 1.5, my = tb.cy + Math.sin((a0 + a1) / 2) * R * 1.3;
      g.strokeStyle = '#c4221c'; g.lineWidth = s * .02; g.beginPath(); g.ellipse(mx, my, s * .28, s * .12, .5, 0, Math.PI * 2); g.stroke();
    }
  }
  g.restore();
}
// Words written on a card or a sheet in the person's own hand, fitted to it.
export function cardText(g, x, y, w, h, lines, col = '#1f1c24', o = {}) {
  g.save();
  g.textAlign = 'center'; g.textBaseline = 'middle';
  const n = lines.length, lh = h / n;
  // o.p: how much has been written so far, 0..1 of the letters.
  const total = lines.reduce((a, ln) => a + (Array.isArray(ln) ? ln[0] : ln).length, 0);
  let left = o.p === undefined ? 1e9 : Math.floor(clamp(o.p) * total + .001);
  lines.forEach((ln, i) => {
    let [text, c] = Array.isArray(ln) ? ln : [ln, col];
    const full = text;
    text = text.slice(0, Math.max(0, left)); left -= full.length;
    let px = Math.round(lh * (o.k ?? .74));
    g.font = `${px}px Hand`;
    const mw = g.measureText(full).width;
    if (mw > w * .9) { px = Math.floor(px * w * .9 / mw); g.font = `${px}px Hand`; }
    // Written from the left of where the whole line will sit, so it doesn't shift as it's written.
    g.textAlign = 'left';
    g.fillStyle = c; g.fillText(text, x + w / 2 - g.measureText(full).width / 2, y + lh * (i + .55));
  });
  g.restore();
}
// A vein popping at a temple, manga's shorthand for fury.
export function angerVein(g, x, y, s, t) {
  const k = s * (1 + .12 * Math.abs(Math.sin(t * 7)));
  g.save(); g.translate(x, y); g.strokeStyle = '#d9241f'; g.lineWidth = k * .22; g.lineCap = 'round';
  for (let i = 0; i < 4; i++) { g.save(); g.rotate(i * Math.PI / 2 + .3); g.beginPath(); g.moveTo(k * .25, -k * .9); g.quadraticCurveTo(k * .3, -k * .3, k * .9, -k * .25); g.stroke(); g.restore(); }
  g.restore();
}

// ---------------------------------------------------------------- the places' features
// Where each painted place's screen, clock, board and so on are (fractions of its picture, filled
// in from tools/backdrops.py's measures in backdrops.json when present, else these).
export const FEAT = {
  'bg-counter': { terminal: [.797, .497, .865, .524], clock: [.518, .1226, .06], counterTop: .537 },
  'bg-front': { sign: [.123, .149, .885, .231], door: [.8, .6], pave: .62 },
  'bg-clinic': { screen: [.1775, .0849, .8215, .2895] },
  'bg-school': { sign: [.3511, .3786, .6521, .4157] },
  'bg-wedding': { board: [.0359, .3008, .2173, .4533], tableTop: .7191 },
  'bg-square': { sun: [.6055, .3621, .0105] },
};
const F = name => ({ ...FEAT[name], ...(BACK[name]?.feat || {}) });
// A name painted on a blank sign board, fitted to it; font has '#' where the size goes.
export function signText(g, m, rect, text, col, font) {
  const [x0, y0, x1, y1] = m.rect(rect);
  let px = (y1 - y0) * .7;
  g.save(); g.font = font.replace('#', Math.round(px));
  const w = g.measureText(text).width;
  if (w > (x1 - x0) * .86) { px *= (x1 - x0) * .86 / w; g.font = font.replace('#', Math.round(px)); }
  g.textAlign = 'center'; g.textBaseline = 'middle';
  ink(g, px * .1); g.strokeText(text, (x0 + x1) / 2, (y0 + y1) / 2);
  g.fillStyle = col; g.fillText(text, (x0 + x1) / 2, (y0 + y1) / 2);
  g.restore();
}

// Timing within a beat: 0..1 from a to b.
const tw = (t, a, b) => clamp((t - a) / Math.max(.01, b - a));

// ---------------------------------------------------------------- the four places
// o.times: the moments the scene keys to (seconds), by name; o.text: what a card says.
export function bakery(L, t, state, box, o = {}) {
  const T = o.times || {};
  if (state === 'down' && T.queue !== undefined && t >= T.queue - .35) {
    // The line runs on to the queue: the view slides along from the counter to the street.
    const p = easeInOut(tw(t, T.queue - .35, T.queue + .2)), wd = box[2] - box[0];
    L.save(); L.translate(-p * wd, 0); bakeryCounter(L, t, 'down', box, o); L.restore();
    L.save(); L.translate((1 - p) * wd, 0); bakeryFront(L, t, 'down', box, o); L.restore();
    return;
  }
  if (state === 'load' || state === 'queue') return bakeryFront(L, t, state, box, o);
  return bakeryCounter(L, t, state, box, o);
}
function bakeryCounter(L, t, state, box, o) {
  const T = o.times || {};
  const m = bg(L, 'bg-counter', box, o.win || [0, .02, 1, .92], o.fit);
  if (!m) return;
  const f = F('bg-counter');
  const down = state === 'down' && t >= (T.down ?? -1);
  const pose = { built: 'rosa-thumbs', down: down ? 'rosa-despair' : 'rosa-proud', perfect: 'rosa-loaf', love: 'rosa-cheer', show: 'rosa-terminal', card: 'rosa-card' }[state] || 'rosa-proud';
  const text = o.text;
  // Behind her counter, from the hips up (the loaf she hands across is handed to us).
  stand(L, m, pose, o.fu ?? .42, .87, .62, {
    t, seed: 11, pop: state === 'down' ? T.down : o.pop, bounce: state === 'love' ? .7 : 0,
    draw: pose === 'rosa-terminal' ? onBlank(pose, (g, x, y, w, h) => terminalUI(g, x, y, w, h, o.screen || 'down', t), o.hold && { k: o.hold, body: 'terminal' })
      : pose === 'rosa-card' && text ? onBlank(pose, (g, x, y, w, h) => cardText(g, x, y, w, h, text, undefined, { p: o.textP }), o.hold && { k: o.hold, body: 'card' }) : null,
  });
  // The counter in front of her.
  m.again(f.counterTop);
  // The terminal on the counter, and the clock.
  if (pose !== 'rosa-terminal') {
    const [tx0, ty0, tx1, ty1] = m.rect(f.terminal);
    // Drawn a little bigger than the painted screen, so it reads from across the shop.
    const tk = o.termK ?? 1.25, tcx = (tx0 + tx1) / 2, tcy = (ty0 + ty1) / 2, tw2 = (tx1 - tx0) * tk, th2 = (ty1 - ty0) * tk;
    terminalUI(L, tcx - tw2 / 2, tcy - th2 / 2, tw2, th2, state === 'down' ? (down ? 'down' : 'ok') : state === 'built' || state === 'perfect' || state === 'love' ? 'ok' : 'idle', t);
  }
  const [ccx, ccy] = m.at(f.clock[0], f.clock[1]), cr = m.len(f.clock[2]);
  const eight = state === 'down' && t >= (T.eight ?? 1e9);
  clockHands(L, ccx, ccy, cr, eight ? 8 : 7, eight ? 0 : 59, { snap: eight ? 1 - tw(t, T.eight, T.eight + .5) : 0 });
}
const QUEUE = ['q-builder', 'q-nurse', 'q-office', 'q-student', 'q-flatcap', 'q-jogger', 'q-driver', 'q-teen', 'q-shopper', 'q-raincoat'];
function bakeryFront(L, t, state, box, o) {
  const T = o.times || {};
  const m = bg(L, 'bg-front', box, o.win || [0, .12, 1, 1], o.fitFront || o.fit);
  if (!m) return;
  const f = F('bg-front');
  signText(L, m, f.sign, "Rosa's", '#f0d27a', '#px Hand');
  // The queue from the door down the pavement towards us, the far ones first.
  const n = QUEUE.length;
  const spots = QUEUE.map((q, i) => { const k = i / (n - 1); return { q, fu: lerp(.78, .08, k), fv: lerp(f.pave + .08, 1.0, k * k), fh: lerp(.26, .5, k * k), i }; });
  for (const s of spots) {
    if (state === 'load') {
      // The load test: a simulated customer beside every real one, in REGEX's cyan, marching in
      // from the side from T.load (if given), the far ones first.
      const p = T.load === undefined ? 1 : easeOut(tw(t, T.load + (n - 1 - s.i) * .045, T.load + .42 + (n - 1 - s.i) * .045));
      if (p > 0) stand(L, m, s.q, s.fu + .07 + (1 - p) * .6, s.fv - .012, s.fh * .98, { t, seed: 40 + s.i, wash: ['#39e2ff', .7], halo: ['#39e2ff', .5, 10], edge: '#b8f6ff', shadow: false, bounce: .6, beatOff: s.i * .13, alpha: .9 * p });
    }
    stand(L, m, s.q, s.fu, s.fv, s.fh, { t, seed: 20 + s.i, sway: 1.4, bounce: state === 'load' ? .4 : 0, beatOff: s.i * .07 });
  }
}

export function clinic(L, t, state, box, o = {}) {
  const T = o.times || {};
  const m = bg(L, 'bg-clinic', box, o.win || [0, .05, 1, 1], o.fit);
  if (!m) return;
  const f = F('bg-clinic');
  const stuck = state === 'down' && t >= (T.stuck ?? 1e9), shake = state === 'down' && t >= (T.shake ?? 1e9);
  const site = state === 'booked' || state === 'love' ? 'booked' : state === 'down' ? (stuck ? 'down' : 'idle') : 'idle';
  const [sx0, sy0, sx1, sy1] = m.rect(f.screen);
  bookingUI(L, t, site, sx0, sy0, sx1 - sx0, sy1 - sy0);
  const pose = { built: 'gran-happy', down: shake ? 'gran-shake' : stuck ? 'gran-squint' : 'gran-happy', booked: 'gran-happy', love: 'gran-cheer', show: 'gran-phone', card: 'gran-card', stand: 'gran-stand' }[state] || 'gran-happy';
  stand(L, m, pose, o.fu ?? .5, o.fv ?? 1.0, o.fh ?? .48, {
    t, seed: 12, pop: state === 'down' ? (shake ? T.shake : stuck ? T.stuck : undefined) : o.pop, bounce: state === 'love' ? .7 : 0,
    draw: pose === 'gran-phone' ? onBlank(pose, (g, x, y, w, h) => phoneScreen(g, x, y, w, h, o.screen || 'tiny', t), o.hold && { k: o.hold, body: 'phone' })
      : pose === 'gran-card' && o.text ? onBlank(pose, (g, x, y, w, h) => cardText(g, x, y, w, h, o.text, undefined, { p: o.textP }), o.hold && { k: o.hold, body: 'card' }) : null,
  });
}
// What a phone held up to us shows.
export function phoneScreen(g, x, y, w, h, kind, t) {
  g.save(); rr(g, x, y, w, h, w * .1); g.clip();
  if (kind === 'tiny' || kind === 'big') {
    // The booking site on her phone: the tiny one her thumb can't hit, or the fixed one.
    bookingUI(g, t, kind === 'tiny' ? 'down' : 'big', x, y, w, h);
  } else if (kind === 'booked') {
    g.fillStyle = '#3aa56b'; g.fillRect(x, y, w, h);
    g.strokeStyle = '#fff'; g.lineWidth = w * .12; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(x + w * .28, y + h * .5); g.lineTo(x + w * .44, y + h * .62); g.lineTo(x + w * .74, y + h * .38); g.stroke();
  } else if (kind === 'leak') {
    g.fillStyle = '#eef3f6'; g.fillRect(x, y, w, h);
    g.fillStyle = '#ffffff'; rr(g, x + w * .08, y + h * .3, w * .84, h * .22, w * .08); g.fill(); ink(g, Math.max(1.5, w * .02)); g.stroke();
    g.fillStyle = '#c4221c'; g.font = `700 ${Math.round(w * .12)}px Mono`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('NOT YOURS', x + w / 2, y + h * .41);
  } else if (kind === 'lock') {
    g.fillStyle = '#eef3f6'; g.fillRect(x, y, w, h); padlock(g, x + w / 2, y + h * .42, w * .42, 1);
  } else if (kind === 'app') {
    // The school's new feedback app: its name on a green bar, and the families' messages.
    g.fillStyle = '#f4f1e8'; g.fillRect(x, y, w, h);
    g.fillStyle = '#2f7d5d'; g.fillRect(x, y, w, h * .22);
    g.fillStyle = '#fff'; g.font = `900 ${Math.round(w * .17)}px Stencil`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('PARKSIDE', x + w / 2, y + h * .12);
    ['#ffffff', '#e2f5d6', '#ffe6e6', '#e3ecff'].forEach((c, i) => {
      const by = y + h * (.3 + i * .17), bx = x + w * (i % 2 ? .3 : .08);
      g.fillStyle = c; rr(g, bx, by, w * .62, h * .12, h * .05); g.fill(); ink(g, Math.max(1, w * .015)); g.stroke();
      g.fillStyle = 'rgba(40,36,44,.55)'; g.fillRect(bx + w * .07, by + h * .05, w * .4, h * .022);
    });
  } else if (kind === 'x') {
    g.fillStyle = '#c4221c'; g.fillRect(x, y, w, h);
    g.strokeStyle = '#fff'; g.lineWidth = w * .12; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x + w * .3, y + h * .38); g.lineTo(x + w * .7, y + h * .62); g.moveTo(x + w * .7, y + h * .38); g.lineTo(x + w * .3, y + h * .62); g.stroke();
  }
  g.restore();
}

// Each family's own message, with who sent it, so when it lands over someone else you can see
// whose it is.
export const PRIVATE = ['Amy: rash contagious??', "Rob: can't pay the trip", 'Sam: late AGAIN, sorry', "Noor: Jamie's dad left"];
const GATE = [['mum-red', .12, .5], ['dad-cap', .37, .5], ['parent-read', .6, .5], ['mum-scarf', .84, .5]];
export function school(L, t, state, box, o = {}) {
  const T = o.times || {};
  const m = bg(L, 'bg-school', box, o.win || [0, .12, 1, 1], o.fit);
  if (!m) return;
  const f = F('bg-school');
  signText(L, m, f.sign, 'PARKSIDE PRIMARY', '#f5e7b8', '900 #px Stencil');
  const leak = state === 'down' && t >= (T.leak ?? 1e9);
  const pos = [];
  GATE.forEach(([n, fu, fh], i) => {
    let name = n;
    if (leak) name = { 'mum-red': 'mum-red', 'dad-cap': 'dad-cap', 'parent-read': 'parent-shock', 'mum-scarf': 'mum-scarf' }[n];
    // Before the leak, the dad in the middle shows us the new app on his phone.
    if (state === 'down' && !leak && T.app !== undefined && n === 'parent-read') name = 'parent-phone';
    if (state === 'love' && n === 'parent-read') name = 'parent-cheer';
    if (state === 'show' && n === 'parent-read') name = 'parent-phone';
    if (state === 'card' && n === 'parent-read') name = 'parent-card';
    const r = stand(L, m, name, fu, 1.0, fh, {
      t, seed: 60 + i, sway: .8, pop: leak && n === 'parent-read' ? T.leak : undefined, bounce: state === 'love' ? .6 : 0, beatOff: i * .1,
      draw: name === 'parent-phone' ? onBlank(name, (g, x, y, w, h) => phoneScreen(g, x, y, w, h, state === 'down' ? 'app' : (o.screen || 'leak'), t), o.hold && { k: o.hold, body: 'phone' })
        : name === 'parent-card' && o.text ? onBlank(name, (g, x, y, w, h) => cardText(g, x, y, w, h, o.text, undefined, { p: o.textP }), o.hold && { k: o.hold, body: 'card' }) : null,
    });
    pos.push(r);
  });
  // Once it's fixed and they love it, no one's messages are showing.
  if (state === 'show' || state === 'card' || state === 'love') return;
  // The messages: each over its owner, at two heights so they don't collide; then, as the leak
  // happens, each flies to someone else's head; locked, each stays home with a padlock.
  const px = Math.round(o.px ?? m.len(.015));
  L.save(); L.font = `600 ${px}px Mono`;
  const bw = PRIVATE.map(s => L.measureText(s).width + px * 1.3);
  L.restore();
  const [bx0, , bx1] = o.clip || box;
  const homeOf = i => {
    const r = pos[i];
    if (!r) return [0, 0];
    if (o.only !== undefined) return [clamp(r.crown[0] - bw[i] / 2, bx0 + px * .5, bx1 - bw[i] - px * .5), r.crown[1] - px * 2.4];
    // Two rows of two (Amy and Sam above, Rob and Noor below), set to the left and right edges so
    // they never overlap.
    const top = Math.min(...pos.filter(Boolean).map(q => q.crown[1]));
    return [i < 2 ? bx0 + px * .5 : bx1 - bw[i] - px * .5, top - px * (i % 2 ? 2.4 : 5.2)];
  };
  pos.forEach((r, i) => {
    if (!r || (o.only !== undefined && i !== o.only)) return;
    const home = homeOf(i);
    let at = home;
    if (leak) {
      // Each flies across to someone else's side: whose it is stays on it.
      const j = [2, 3, 0, 1][i], to = homeOf(j), tx = j < 2 ? bx0 + px * .5 : bx1 - bw[i] - px * .5;
      const p = easeInOut(tw(t, T.leak + i * .1, T.leak + .5 + i * .1));
      at = [lerp(home[0], tx, p), lerp(home[1], to[1], p) - Math.sin(p * Math.PI) * px * 4];
    }
    bubble(L, PRIVATE[i], at[0], at[1] + Math.sin(t * 1.6 + i) * px * .12, px, { fill: ['#ffffff', '#e2f5d6', '#ffe6e6', '#e3ecff'][i], lock: state === 'locked' ? tw(t, (T.lock ?? 0) + i * .15, (T.lock ?? 0) + i * .15 + .2) : 0 });
  });
}

export function wedding(L, t, state, box, o = {}) {
  const T = o.times || {};
  const m = bg(L, 'bg-wedding', box, o.win || [0, .12, 1, 1], o.fit);
  if (!m) return;
  const f = F('bg-wedding');
  const [bx0, by0, bx1, by1] = m.rect(f.board);
  seatingChart(L, bx0, by0, bx1 - bx0, by1 - by0, state === 'perfect' || state === 'love' ? 'good' : 'bad', t);
  if (state === 'down' || state === 'built') {
    const ex = state === 'down' && t >= (T.ex ?? 1e9);
    stand(L, m, 'dave-wave', .45, f.tableTop + .2, .42, { t, seed: 14, sway: .7 });
    const sue = stand(L, m, ex ? 'sue-point' : 'sue-cross', .72, f.tableTop + .2, .41, { t, seed: 15, sway: .5, pop: ex ? T.ex : undefined });
    m.again(f.tableTop);
    if (ex && sue) angerVein(L, sue.box[0] + (sue.box[2] - sue.box[0]) * .62, sue.box[1] + m.len(.035), m.len(.02), t);
    // Their place cards, side by side on the cloth.
    for (const [fu, name] of [[.45, 'DAVE'], [.7, 'SUE']]) {
      const [cx, cy] = m.at(fu, f.tableTop + .07), cw = m.len(.07), chh = m.len(.03);
      L.save(); L.fillStyle = '#fffdf6'; L.fillRect(cx - cw / 2, cy - chh / 2, cw, chh); ink(L, Math.max(1.5, chh * .06)); L.strokeRect(cx - cw / 2, cy - chh / 2, cw, chh);
      L.fillStyle = '#5a3a2a'; L.font = `${Math.round(chh * .62)}px Hand`; L.textAlign = 'center'; L.textBaseline = 'middle'; L.fillText(name, cx, cy + chh * .04); L.restore();
    }
    if (state === 'down') stand(L, m, t >= (T.ex ?? 1e9) - .4 ? 'jess-aghast' : 'jess-bouquet', .14, 1.0, .5, { t, seed: 13, sway: .6 });
    return;
  }
  if (state === 'perfect') {
    stand(L, m, 'dave-laugh', .3, f.tableTop + .2, .4, { t, seed: 14 });
    stand(L, m, 'jess-bouquet', .62, 1.0, .5, { t, seed: 13 });
    m.again(f.tableTop);
    return;
  }
  const pose = { note: 'jess-note', show: 'jess-board', card: 'jess-card', love: 'jess-cheer', deadpan: 'jess-deadpan' }[state] || 'jess-bouquet';
  stand(L, m, pose, o.fu ?? .5, 1.02, o.fh ?? .62, {
    t, seed: 13, sway: .5, bounce: state === 'love' ? .7 : 0,
    draw: pose === 'jess-note' ? onBlank(pose, (g, x, y, w, h) => cardText(g, x, y, w, h, [['Dave + Sue:', '#1f1c24'], ['NOT the same', '#c4221c'], ['table!!', '#c4221c']], '#1f1c24', { k: .7, p: o.textP }), o.hold && { k: o.hold, body: 'sheet' })
      : pose === 'jess-board' ? onBlank(pose, (g, x, y, w, h) => seatingChart(g, x, y, w, h, o.chart || 'bad', t), o.hold && { k: o.hold, body: 'board' })
        : pose === 'jess-card' && o.text ? onBlank(pose, (g, x, y, w, h) => cardText(g, x, y, w, h, o.text, undefined, { p: o.textP }), o.hold && { k: o.hold, body: 'card' }) : null,
  });
}

// One call for any of them.
export const STORY = { bakery, clinic, school, wedding };
export function story(L, t, brief, state, box, o = {}) { return STORY[brief]?.(L, t, state, box, o); }
