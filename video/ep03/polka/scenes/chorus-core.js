// A chorus, whichever one it is: the show ring (by day, by night or at golden hour), the sing-along board
// across the top with its bouncing ball and Bruce running after it, the audience along the foot, the
// pigeon on the far post, and, between them, the line's gag. The three choruses are the same six lines and
// the same six gags told again (chorus 2 with the tables turned, chorus 3 all at once), so what changes
// is passed in: the mood of the ring, the gags, the casting and how the board looks.
import { W, H, clamp, beatPos, words, loud } from '../kit.js';
import { shot } from '../shots.js';
import { line } from '../pencil.js';
import { dachshund } from '../chars.js';
import { dogFront } from '../people.js';
import { groove, pop } from '../common.js';
import { sing } from '../lyrics.js';
import { BOARD, WORDS, ballPath, ballAt, drawBall, signBoard, wordsY } from '../board.js';
import { ringBackdrop } from '../ring.js';
import { crowdRow, pigeon } from '../world.js';
import { confetti } from '../ringcast.js';
import { GRAPHITE, C } from '../palette.js';

export const CHORUS_STARTS = ['Good in a dozen', 'Fast, but it', 'Ship it by', 'Save on the', 'Polish one part', 'Which of the'];

// Register one chorus as a single shot from t0 to t1.
//   id, section ('Chorus 1'), t0, t1
//   mood       'day' | 'night' | 'gold'
//   gags       six functions (g, t, ws, cx): the ring's action for each line
//   sunMood    six functions t -> mood of the sun (or moon) for each line
//   board      { fill, edge } the sign's colours;  ink: the lyric's colour;  crash: t of the confetti burst (or null)
//   pigeonAt   [x, y]      audience: { n, s, seed }
//   backdrop   (t, lineIndex) -> extra options for ringBackdrop (a collapse: { ropeDown, bunt })
//   scene      (g, t, cx) draws the whole world under the board instead of the standard ring, gag and audience
export function registerChorus(o) {
  const { id, section, t0, t1, mood = 'day', gags, sunMood = [], board = {}, ink = GRAPHITE, crash = null, pigeonAt = [1012, 1010], audience = { n: 7, s: .85, seed: 3 }, markInk = GRAPHITE, extra = null, scene = null, backdrop = null } = o;
  const lines = CHORUS_STARTS.map(s => words(section, s));
  const path = ballPath(lines);
  shot(t0, t1, (g, t) => {
    const gr = groove(t, mood === 'day' ? 1.1 : 1.3);
    const vox = loud('vocals', t);
    const idx = Math.max(0, lines.findIndex((ws, i) => t < (lines[i + 1] ? lines[i + 1][0].v - .45 : 1e9)));
    const ws = lines[idx];
    const cx = { t, gr, vox, li: idx, mood, lines, idx };
    window.__markInk = markInk;
    if (scene) scene(g, t, cx);      // a chorus that builds its own world (chorus 3's three rings)
    else {
      ringBackdrop(g, t, { mood, sunMood: (sunMood[idx] || (() => 'happy'))(t), look: [-.3, .8], ...(backdrop ? backdrop(t, idx) : {}) });
      if (extra && extra.before) extra.before(g, t, cx);
      gags[idx](g, t, ws, cx);
      if (extra && extra.after) extra.after(g, t, cx);
      pigeon(g, t, pigeonAt[0], pigeonAt[1], .62, { flip: -1, state: (cx.pigeon && cx.pigeon(t)) || 'perch', look: -1 });
      crowdRow(g, t, dogFront, 1845, { ...audience, sing: 1, x0: 90, x1: 990 });
    }
    // The board (dropping in if this chorus has a crash), its lyric, the ball and Bruce on his ledge.
    const bd = crash != null ? pop(t, crash, .5) : 1;
    g.save(); g.translate(0, -(1 - bd) * 760);
    signBoard(g, t, board);
    sing(g, t, ws, { ...WORDS, y: wordsY(ws), tailCol: null, col: ink, seed: 30 + idx, w: .1, dance: 8, out: { t0: ws[ws.length - 1].e + .22, dur: .24 } });
    const ledge = BOARD.y + BOARD.h + 66;
    line(g, [[BOARD.x + 20, ledge + 6], [BOARD.x + BOARD.w - 20, ledge + 6]], { w: 8, col: '#8b5f2a', seed: 860, t, spline: false, passes: 1 });
    const bb = ballAt(path, t);
    if (bb && !bb.gone) drawBall(g, t, bb.x, bb.y, 32, { sq: bb.sq || 0, stretch: bb.stretch || 0, spin: t * 4 });
    const lag = ballAt(path, t - .3), lag2 = ballAt(path, t - .55);
    const bx = lag ? clamp(lag.x, BOARD.x + 120, BOARD.x + BOARD.w - 120) : BOARD.x + 200;
    const bx2 = lag2 ? clamp(lag2.x, BOARD.x + 120, BOARD.x + BOARD.w - 120) : bx;
    const moving = Math.abs(bx - bx2) > 3 ? 1 : 0;
    dachshund(g, { x: bx, y: ledge, s: .46, flip: bx >= bx2 ? 1 : -1, t, seed: 2, walk: moving ? (t * 3.2) % 1 : 0, tail: beatPos(t), ear: gr.lean * 30, eyes: 'happy', mouth: .5, tongue: true, bob: gr.bp * 8 });
    g.restore();
    if (crash != null) confetti(g, t, crash, 1.9, { seed: 6 });
  }, { id });
}
