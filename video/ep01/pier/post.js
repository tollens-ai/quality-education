// Finishing passes applied to the whole frame: bloom, colour grade, vignette and film grain.
// They work in device pixels, so previews at any width look like the master.
import { rgba } from './kit.js';

let bloomA, bloomB, grains = [];
function buffers(cw, ch) {
  if (!bloomA || bloomA.width !== Math.round(cw / 4)) {
    bloomA = document.createElement('canvas'); bloomA.width = Math.round(cw / 4); bloomA.height = Math.round(ch / 4);
    bloomB = document.createElement('canvas'); bloomB.width = Math.round(cw / 12); bloomB.height = Math.round(ch / 12);
  }
  if (!grains.length) {
    for (let k = 0; k < 6; k++) {
      const c = document.createElement('canvas'); c.width = c.height = 256;
      const x = c.getContext('2d'); const id = x.createImageData(256, 256);
      let s = 1234567 + k * 7919;
      for (let i = 0; i < id.data.length; i += 4) {
        s = (s * 1103515245 + 12345) & 0x7fffffff;
        const v = 128 + ((s >> 8) % 128 - 64) * 1.6;
        id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255;
      }
      x.putImageData(id, 0, 0);
      grains.push(c);
    }
  }
}

// o: { bloom: 0..1, bloomWide: 0..1, vignette: 0..1, grain: 0..1, tint: [hex, alpha, mode], frame }
export function finish(g, o = {}) {
  const cv = g.canvas, cw = cv.width, ch = cv.height;
  buffers(cw, ch);
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  const bl = o.bloom ?? .5;
  if (bl > 0) {
    const a = bloomA.getContext('2d'), b = bloomB.getContext('2d');
    a.globalCompositeOperation = 'copy';
    // Crush the darks first so only lights bloom; the shadows stay deep.
    a.filter = `brightness(${o.bloomGain ?? .75}) contrast(${o.bloomThreshold ?? 2.6}) saturate(1.25) blur(${Math.max(1, cw / 540 * 3)}px)`;
    a.drawImage(cv, 0, 0, bloomA.width, bloomA.height);
    a.filter = 'none';
    b.globalCompositeOperation = 'copy';
    b.filter = `blur(${Math.max(1, cw / 540 * 2.5)}px)`;
    b.drawImage(bloomA, 0, 0, bloomB.width, bloomB.height);
    b.filter = 'none';
    g.globalCompositeOperation = 'screen';
    g.globalAlpha = .55 * bl;
    g.drawImage(bloomA, 0, 0, cw, ch);
    g.globalAlpha = .6 * (o.bloomWide ?? bl);
    g.drawImage(bloomB, 0, 0, cw, ch);
  }
  if (o.tint) {
    const [col, a, mode] = o.tint;
    g.globalCompositeOperation = mode || 'soft-light';
    g.globalAlpha = a;
    g.fillStyle = col; g.fillRect(0, 0, cw, ch);
  }
  const vg = o.vignette ?? .5;
  if (vg > 0) {
    g.globalCompositeOperation = 'source-over';
    g.globalAlpha = 1;
    const r = g.createRadialGradient(cw / 2, ch * .46, Math.min(cw, ch) * .35, cw / 2, ch * .46, Math.hypot(cw, ch) * .62);
    r.addColorStop(0, 'rgba(4,2,16,0)');
    r.addColorStop(1, rgba('#04020f', .75 * vg));
    g.fillStyle = r; g.fillRect(0, 0, cw, ch);
  }
  const gr = o.grain ?? .5;
  if (gr > 0) {
    const f = o.frame || 0;
    const tile = grains[f % grains.length];
    const p = g.createPattern(tile, 'repeat');
    const k = cw / 1080 * 1.6;
    p.setTransform(new DOMMatrix([k, 0, 0, k, (f * 37) % 256, (f * 91) % 256]));
    g.globalCompositeOperation = 'overlay';
    g.globalAlpha = .07 * gr;
    g.fillStyle = p; g.fillRect(0, 0, cw, ch);
  }
  g.restore();
}

// Full-frame fades and flashes, drawn in master coordinates.
export function fill(g, col, a) {
  if (a <= 0) return;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = Math.min(1, a); g.fillStyle = col; g.fillRect(0, 0, g.canvas.width, g.canvas.height);
  g.restore();
}
