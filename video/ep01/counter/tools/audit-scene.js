// The scene the audit drives: it draws the film exactly as the renderer does, then publishes what
// every word recorded about itself this frame. Nothing else, so the audit sees the real cut.
import { frame } from '../../../lib/stage.js';
import { startRecord, endRecord, RECORD } from '../words.js';
import * as scene from '../main.js';

export function init(S) { startRecord(); }

export function draw(g, t, S) {
  startRecord();                 // per frame: endRecord() turns recording off again
  const k = g.canvas.width / 1080;
  g.setTransform(k, 0, 0, k, 0, 0);
  g.clearRect(0, 0, 1080, 1920);
  scene.draw(g, t, S);
  scene.drawMarks(g);
  endRecord();
  window.__audit = RECORD.map(r => ({ ...r, t: +t.toFixed(2) }));
}

export const lyricSlot = () => null;
