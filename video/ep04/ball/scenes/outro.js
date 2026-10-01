// Outro, solo: night in the crew's office. Clawd writes the report alone at the desk.
//  "It loses sets without the net;"  The report: FOUND, the gym loses sets without the net. The red
//     flag check stands beside him as evidence.
//  "Who sees the logs? Not tested yet."  He looks up at the filing cabinet marked LOGS, locked, an
//     eye at its keyhole blinking. He writes NOT TESTED YET and stamps it; then, glass in hand, he
//     goes over to the cabinet as the iris closes. The end... not tested yet.
import { W, H, TAU, clamp, lerp, now, when, wordsOf, hash, easeOut } from '../kit.js';
import { INK, CREAM, TEAL, CORAL, OCHRE, ROSE, PLUM, GOLD, GREEN, RED, WHITE, WOOD, WOOD_SH, GREY, SLATE } from '../palette.js';
import { shot, irisJoin } from '../shots.js';
import { office } from '../places.js';
import { clawd } from '../clawd.js';
import { check } from '../crew.js';
import { magnifier } from '../props.js';
import { shape, rrect, ellipse, stroke, dot, pieEye, glove } from '../ink.js';
import { label, word, DISPLAY, PATTER, SCRIPT, fitSize, textW } from '../type.js';
import { at, ramp, pop, ease, kick, place, cam } from '../common.js';
import { iris } from '../film.js';
import { OF, OC } from './bridge.js';

export function register() {
  const O1 = 'It loses sets', O2 = 'Who sees the logs';
  const t0 = at(O1, 'It') - .12;
  const tLoses = at(O1, 'loses'), tSets = at(O1, 'sets'), tNet = at(O1, 'net');
  const tWho = at(O2, 'Who'), tSees = at(O2, 'sees'), tLogs = at(O2, 'logs'), tNot = at(O2, 'Not'), tTested = at(O2, 'tested'), tYet = at(O2, 'yet'), oEnd = wordsOf(O2).at(-1).e;
  const END = 182.61;
  shot(t0, END, (g, t) => {
    const c = cam([[t0, OC(470, 1.45, 1500)], [tNet + .4, OC(500, 1.4, 1500)], [tWho - .2, OC(640, 1.08)], [tNot, OC(580, 1.25, 1500)], [oEnd + .3, OC(560, 1.25, 1500)], [oEnd + 1.6, OC(700, 1.08)], [END, OC(800, 1.25)]], t);
    g.save(); place(g, office(true), c);
    // the lamp's warm pool
    g.save(); g.globalCompositeOperation = 'lighter'; const lp = g.createRadialGradient(470, OF - 360, 20, 470, OF - 360, 520); lp.addColorStop(0, 'rgba(255,220,150,.42)'); lp.addColorStop(1, 'rgba(255,220,150,0)'); g.fillStyle = lp; g.fillRect(-200, 400, 1500, 1500); g.restore();
    // the LOGS cabinet at right, the eye at its keyhole
    const cx = 930;
    shape(g, rrect(cx - 130, OF - 560, 260, 560, 10), { fill: SLATE, shade: '#2c3434', shadeOff: [-10, -10], w: 8, seed: 13001 });
    for (let i = 0; i < 3; i++) { shape(g, rrect(cx - 110, OF - 540 + i * 180, 220, 160, 8), { fill: '#56625f', w: 5, seed: 13002 + i }); shape(g, rrect(cx - 40, OF - 480 + i * 180, 80, 20, 6), { fill: GREY, w: 4, seed: 13005 + i }); }
    shape(g, rrect(cx - 80, OF - 520, 160, 50, 6), { fill: CREAM, w: 4, seed: 13010 }); label(g, 'LOGS', cx, OF - 494, 40, { font: DISPLAY });
    shape(g, ellipse(cx, OF - 380, 26, 26), { fill: GOLD, w: 4, seed: 13011 });
    // the padlock
    shape(g, rrect(cx + 60, OF - 420, 60, 52, 8), { fill: GOLD, w: 4, seed: 13012 }); g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.arc(cx + 90, OF - 420, 20, Math.PI, 0); g.stroke();
    const eye = t > tSees - .2 && t < tTested;
    if (eye) { g.fillStyle = INK; g.beginPath(); g.ellipse(cx, OF - 380, 14, 18, 0, 0, TAU); g.fill(); pieEye(g, cx, OF - 380, 7, 10, { white: 1.6, lx: -.6, blink: Math.sin(t * 3) > .9 ? 1 : 0, lw: 2, seed: 13013 }); }
    if (t > tWho && t < tNot) label(g, '?', cx + 10, OF - 660 - Math.sin(t * 4) * 10, 120, { font: DISPLAY, col: ROSE, ow: .12 });
    // the desk, lamp, report
    shape(g, rrect(170, OF - 300, 620, 40, 8), { fill: '#5a3420', w: 7, seed: 13020 });
    for (const x of [200, 760]) shape(g, rrect(x - 16, OF - 262, 32, 262, 6), { fill: '#4a2a18', w: 6, seed: 13021 + x });
    stroke(g, [[260, OF - 300], [260, OF - 470], [340, OF - 540]], { w: 10, seed: 13023, taper: false });
    shape(g, [[300, OF - 560], [400, OF - 600], [430, OF - 500], [360, OF - 480]], { fill: TEAL, w: 6, seed: 13024 });
    // the report, big, as he writes it
    const rx = 480, ry = OF - 330;
    g.save(); g.translate(rx, ry); g.rotate(-.05);
    shape(g, rrect(-170, -230, 340, 340, 6), { fill: '#fbf6e8', w: 6, seed: 13030 });
    label(g, 'REPORT', 0, -200, 34, { font: DISPLAY, col: PLUM });
    const wr = (txt, y, ta, size, col, font = SCRIPT) => { const p = clamp((t - ta) / .6); if (p <= 0) return; g.save(); g.beginPath(); g.rect(-160, y - 30, 320 * p, 60); g.clip(); label(g, txt, -150, y, size, { font, col, align: 'left' }); g.restore(); };
    wr('FOUND:', -150, tLoses - .2, 26, RED, PATTER);
    wr('loses sets without', -116, tLoses, 30, INK);
    wr('the net', -82, tNet - .2, 30, INK);
    wr('NOT TESTED YET:', -40, tWho - .2, 26, PLUM, PATTER);
    wr('who sees the logs?', -6, tSees, 30, INK);
    if (t > tTested) { const p = pop(t, tTested, .3); g.save(); g.translate(10, 58); g.rotate(-.12); g.scale(p * .85, p * .85); shape(g, rrect(-150, -36, 300, 72, 8), { fill: null, w: 8, line: RED, seed: 13031 }); label(g, 'NOT TESTED YET', 0, 3, 38, { font: DISPLAY, col: RED }); g.restore(); }
    g.restore();
    // the rubber stamp comes down on "tested"
    const sd = t < tTested - .35 ? -1 : t < tTested ? (t - tTested + .35) / .35 : Math.max(0, 1 - (t - tTested) / .5);
    if (sd >= 0) {
      const sx2 = rx + 10, sy2 = lerp(ry - 420, ry + 40, sd < 1 ? sd * sd : 1);
      shape(g, rrect(sx2 - 60, sy2 - 30, 120, 34, 6), { fill: RED, w: 5, seed: 13050 });
      shape(g, rrect(sx2 - 40, sy2 - 74, 80, 46, 8), { fill: WOOD, w: 5, seed: 13051 });
      shape(g, ellipse(sx2, sy2 - 96, 30, 26), { fill: WOOD, w: 5, seed: 13052 });
      glove(g, sx2, sy2 - 120, -Math.PI / 2, 26, 'grip', { seed: 13053 });
      stroke(g, [[sx2, sy2 - 150], [sx2 - 60, sy2 - 360]], { w: 14, seed: 13054, taper: false });
    }
    // the evidence: the red-flag check on the desk
    check(g, 700, OF - 300, .8, { t, card: (g, x, y, cw, ch, s) => label(g, 'OFFLINE?', x, y + 2 * s, 18 * s, { font: PATTER }), flag: 1, flagCol: RED, wave: true });
    // Clawd: writing, then looking up, then off to the cabinet with his glass
    const goes = ease(t, oEnd + .4, 2.2);
    const looking = t > tWho - .2;
    clawd(g, lerp(470, 760, goes), OF + 30, .75, { t, dance: .25, walk: goes > 0 && goes < 1 ? t * 3 : null,
      L: looking ? { to: [.4, -.2], pose: 'grip' } : { to: [.35, -.45 + Math.sin(t * 14) * .03], pose: 'grip' },
      R: { to: [.3, -.2], pose: 'grip' }, hold: { R: (g, x, y, a, s) => magnifier(g, x, y, -.6, s * .8), L: looking ? null : (g, x, y) => stroke(g, [[x, y], [x + 30, y - 50]], { w: 8, color: OCHRE, seed: 13040 }) },
      eyes: { expr: looking ? 'open' : 'open', lx: looking ? .8 : 0, ly: looking ? -.3 : .6 }, sing: true, hat: 'boater' });
    g.restore();
    // the closing iris on the cabinet, and the title card's last word
    const close = clamp((t - (END - 2.6)) / 1.6);
    if (close > 0) {
      iris(g, lerp(540, 760, close), 1150, lerp(1400, 170, Math.pow(close, .8)));
      if (close >= 1) { const p = pop(t, END - 1.0, .4); g.save(); g.translate(540, 760); g.scale(p, p); label(g, 'THE END?', 0, 0, 110, { font: DISPLAY, col: CREAM, ow: .15 }); g.restore(); }
    }
  }, { id: 'outro' });
}
