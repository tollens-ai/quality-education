// STUB. The world builder replaces this file: the tower, every flat and its resident, the lift,
// the basement, the older basements, the lobby, your landing, and the atmosphere. Keep the exports.
import { W, H } from '../../lib/stage.js';
import * as P from './plan.js';

export function drawWorld(g, t, S, st, cam) {
  // sky
  g.fillStyle = P.PAL.sky0; g.fillRect(-4000, -8000, 9000, 16000);
  // tower
  g.fillStyle = P.PAL.tower; g.fillRect(0, P.ROOF_Y, 1080, -P.ROOF_Y);
  for (let k = 1; k <= P.FLOORS; k++) for (const side of ['L', 'R']) {
    const r = P.flatRect(k, side), id = `${k}${side}`, f = st.flats[id];
    g.fillStyle = f && f.gold > 0.05 ? P.PAL.gold : P.PAL.lamp;
    g.globalAlpha = 0.25 + 0.5 * (f ? f.lit : 1); g.fillRect(r.x, r.y, r.w, r.h); g.globalAlpha = 1;
    g.fillStyle = '#000'; g.font = '28px sans-serif'; g.fillText(P.RESIDENTS[id]?.who || id, r.x + 12, r.y + 40);
  }
  g.fillStyle = P.PAL.concrete; g.fillRect(0, 0, 1080, P.BASE.floor);
  // shaft and car
  g.fillStyle = '#10152e'; g.fillRect(P.SHAFT.x0, P.ROOF_Y, P.SHAFT.x1 - P.SHAFT.x0, P.BASE.floor - P.ROOF_Y);
  const c = P.carRect(st.lift.y); g.strokeStyle = '#9ad'; g.lineWidth = 6; g.strokeRect(c.x, c.y, c.w, c.h);
  // quota tube
  const tb = P.TUBE, h = tb.y0 - tb.y1; g.fillStyle = '#223'; g.fillRect(tb.x, tb.y1, tb.w, h);
  g.fillStyle = P.PAL.token; g.fillRect(tb.x, tb.y0 - h * st.quota, tb.w, h * st.quota);
}
export function drawLiftCar() {}
export function drawAtmosphere(g, t, S, st, cam) {}
