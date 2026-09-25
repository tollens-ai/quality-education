// STUB. The cast builder replaces this file with the real characters and props. Keep every
// export and signature; add options freely. All coordinates are world units; (x, y) is the point
// on the ground between the feet (or the object's bottom centre), s is a scale (1 = standard size).
import * as P from './plan.js';

// Clawd, the Claude Code crab. pose: { look: -1..1, mood: 'happy'|'proud'|'sad'|'hope'|'surprise'|'determined',
// mouth: 0..1 (open, for singing), armL, armR (radians), hop: 0..1, squash, flip, holding: 'ticket'|'note'|null,
// salute: 0..1, lit: 0..1 (gold glow on it) }. Standard size: about 120 wide, 90 tall.
export function clawd(g, x, y, s = 1, pose = {}) {
  g.save(); g.translate(x, y); g.scale(s * (pose.flip ? -1 : 1), s);
  g.fillStyle = P.PAL.clawd; g.fillRect(-60, -80, 120, 60);
  g.fillStyle = '#111'; g.fillRect(-32, -66, 10, 20); g.fillRect(22, -66, 10, 20);
  g.fillStyle = P.PAL.clawd; for (const lx of [-48, -24, 12, 36]) g.fillRect(lx, -20, 12, 20);
  g.restore();
}
// A mini subagent Clawd (a quarter size), with its own pose.
export function miniClawd(g, x, y, s = 1, pose = {}) { clawd(g, x, y, 0.35 * s, pose); }
// Your hand: chalky fingers, a hair tie. pose: { reach: 0..1, holding: 'phone'|'pen'|'ticket'|'note'|null,
// point, sweat: 0..1, rot }. It emerges from `from` (a direction), e.g. out of the letterbox.
export function hand(g, x, y, s = 1, pose = {}) {
  g.save(); g.fillStyle = '#F2D2B6'; g.beginPath(); g.arc(x, y, 34 * s, 0, 7); g.fill(); g.restore();
}
// The ticket. fill: { for, good, dont, cost, you } each 0..1 (written), flicker: 0..1 (the vague
// "good" cycling through meanings), glow: 0..1. Standard size 300×380, drawn centred on (x, y).
export function ticket(g, x, y, s = 1, fill = {}, opts = {}) {
  g.save(); g.fillStyle = P.PAL.paper; g.fillRect(x - 150 * s, y - 190 * s, 300 * s, 380 * s);
  g.fillStyle = P.PAL.ink; g.font = `${30 * s}px sans-serif`; g.fillText('make it good', x - 120 * s, y - 120 * s);
  g.restore();
}
export function token(g, x, y, s = 1, opts = {}) { g.fillStyle = P.PAL.token; g.beginPath(); g.arc(x, y, 14 * s, 0, 7); g.fill(); }
// Misfit builds: which in 'confetti'|'vault'|'pods'|'clock'; opts { powered, fire: 0..1, p (install 0..1) }.
export function build(g, which, x, y, s = 1, opts = {}) { g.fillStyle = '#888'; g.fillRect(x - 40 * s, y - 80 * s, 80 * s, 80 * s); }
// Bots. id in 'molty'|'jolly'|'hermes'|'courier'; pose { wave: 0..1, lit: 0..1, hop }.
export function bot(g, id, x, y, s = 1, pose = {}) { g.fillStyle = '#c55'; g.fillRect(x - 40 * s, y - 90 * s, 80 * s, 90 * s); }
// A directory-board name plate with an exact official mark (S.img.openai / grok) or text.
export function plate(g, S, id, x, y, w, h, opts = {}) { g.fillStyle = '#ddd'; g.fillRect(x, y, w, h); }
// A small note (paper), with text in your handwriting or Clawd's pixel font.
export function note(g, x, y, s = 1, text = '', opts = {}) { g.fillStyle = P.PAL.paper; g.fillRect(x - 70 * s, y - 50 * s, 140 * s, 100 * s); }
// The PB flame.
export function flame(g, x, y, s = 1, t = 0) { g.fillStyle = P.PAL.gold; g.beginPath(); g.arc(x, y, 30 * s, 0, 7); g.fill(); }
