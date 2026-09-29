// The page everything is drawn on: warm cream, a little lighter in the middle. It's the ground the
// drawings sit on, laid down first, never over them.
import { W, H, hash, noise2 } from './kit.js';
import { PAPER } from './palette.js';

let TILE = null;
function paperTile() {
  if (TILE) return TILE;
  const N = 256;
  const c = document.createElement('canvas');
  c.width = c.height = N;
  const x = c.getContext('2d');
  const id = x.createImageData(N, N);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    // Faint fibres: two soft noises, wrapped so the tile repeats. The range is small on purpose.
    const a = noise2(i / 40, j / 40, 3) * .5 + noise2(i / 9, j / 9, 8) * .3 + (hash(i, j, 2) - .5) * .35;
    const v = 245 + a * 5;
    const k = (j * N + i) * 4;
    id.data[k] = v; id.data[k + 1] = v * .97; id.data[k + 2] = v * .91; id.data[k + 3] = 255;
  }
  x.putImageData(id, 0, 0);
  TILE = c;
  return c;
}

// Fill the frame with paper. `tint` mixes a colour in (a wash of a mood: night, a warm room).
export function paper(g, o = {}) {
  const { base = PAPER, vignette = .1 } = o;
  g.save();
  g.fillStyle = base;
  g.fillRect(0, 0, W, H);
  try {
    g.globalAlpha = .55;
    g.fillStyle = g.createPattern(paperTile(), 'repeat');
    g.fillRect(0, 0, W, H);
  } catch (e) { /* tile unavailable */ }
  g.globalAlpha = 1;
  if (vignette) {
    const gr = g.createRadialGradient(W / 2, H * .46, H * .25, W / 2, H * .5, H * .78);
    gr.addColorStop(0, 'rgba(255,250,235,0)');
    gr.addColorStop(1, `rgba(120,90,50,${vignette})`);
    g.fillStyle = gr;
    g.fillRect(0, 0, W, H);
  }
  g.restore();
}
