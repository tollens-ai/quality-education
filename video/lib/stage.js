// Shared stage for code-rendered episodes: loads the song's score and lyrics, and draws one
// frame of a scene as a pure function of song time. Scenes export `draw(g, t, S)` and may export
// `lyricSlot(t, S)` to say where the kinetic lyrics go in the shot.
//
// Coordinates are always the 1080×1920 master; the canvas may be smaller (scale is applied here).

export const W = 1080, H = 1920;

export async function loadSong(base) {
  const [beats, lyrics] = await Promise.all([
    fetch(`${base}/beats.json`).then(r => r.json()),
    fetch(`${base}/lyrics.json`).then(r => r.json()),
  ]);
  return makeSong(beats, lyrics);
}

export function makeSong(beats, lyrics) {
  const bar = beats.bar_seconds, beat = bar / 4, t0 = beats.bars[0].t;
  return {
    beats, lyrics, bar, beat, duration: beats.duration,
    // Section containing t, with local progress 0..1.
    section(t) {
      const s = beats.sections;
      let cur = s[0];
      for (const x of s) if (t >= x.start - 0.35) cur = x;
      return { ...cur, p: clamp01((t - cur.start) / (cur.end - cur.start)) };
    },
    // Fractional beat and bar counts, phased to the first bar.
    beatPos: t => (t - t0) / beat,
    barPos: t => (t - t0) / bar,
    // The lyric line being sung at t (or the last one within `hold` seconds).
    lineAt(t, hold = 1.2) {
      let best = null;
      for (const l of lyrics) if (l.start !== null && l.start <= t + 0.05 && t < l.end + hold) best = l;
      return best;
    },
    // Seconds since the most recent beat (for pulses).
    sinceBeat: t => ((((t - t0) % beat) + beat) % beat),
  };
}

// Easing and small helpers used by every scene.
export const clamp01 = x => Math.max(0, Math.min(1, x));
export const lerp = (a, b, p) => a + (b - a) * p;
export const smooth = p => { p = clamp01(p); return p * p * (3 - 2 * p); };
export const easeOut = p => 1 - Math.pow(1 - clamp01(p), 3);
export const easeIn = p => Math.pow(clamp01(p), 3);
export const between = (t, a, b) => clamp01((t - a) / (b - a));

// Camera keyframes: [[t, {x, y, zoom, rot}], ...] → the camera at t, smoothstepped between keys.
export function cameraAt(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [ta, a] = keys[i], [tb, b] = keys[i + 1];
    if (t < tb) {
      const p = (b.ease || smooth)((t - ta) / (tb - ta));
      return { x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p), zoom: lerp(a.zoom, b.zoom, p), rot: lerp(a.rot || 0, b.rot || 0, p) };
    }
  }
  return keys[keys.length - 1][1];
}

// Put world coordinates under the camera: (cam.x, cam.y) lands at the screen centre.
export function applyCamera(g, cam) {
  g.translate(W / 2, H / 2);
  g.rotate(cam.rot || 0);
  g.scale(cam.zoom, cam.zoom);
  g.translate(-cam.x, -cam.y);
}

// Kinetic lyrics: words pop in on their sung onset inside the scene's slot.
// slot = {x, y, w, size, align: 'left'|'center', color, accent, style: 'big'|'sub'}
export function drawLyrics(g, t, S, slot, font) {
  const line = S.lineAt(t);
  if (!line || !slot) return;
  const size = slot.size || 72;
  g.save();
  g.textBaseline = 'alphabetic';
  g.font = `${slot.weight || 800} ${size}px ${font}`;
  // Word-wrap the sung words into the slot width.
  const words = line.words;
  const rows = [[]];
  let wRow = 0;
  const space = g.measureText(' ').width;
  for (const w of words) {
    const ww = g.measureText(w.w).width;
    if (wRow + ww > slot.w && rows[rows.length - 1].length) { rows.push([]); wRow = 0; }
    rows[rows.length - 1].push({ ...w, ww });
    wRow += ww + space;
  }
  const sungEnds = words.filter(w => !w.backing && w.e !== null).map(w => w.e);
  const backingOn = sungEnds.length ? Math.max(...sungEnds) : line.start;
  const lh = size * 1.08;
  rows.forEach((row, ri) => {
    const rowW = row.reduce((a, w) => a + w.ww, 0) + space * (row.length - 1);
    let x = slot.align === 'center' ? slot.x - rowW / 2 : slot.x;
    const y = slot.y + ri * lh;
    for (const w of row) {
      const on = w.s === null ? backingOn : w.s;
      const p = easeOut((t - on) / 0.12);
      if (p > 0) {
        const current = w.s !== null && t >= w.s && t < (w.e ?? w.s) + 0.08;
        g.globalAlpha = p;
        g.fillStyle = w.backing ? (slot.backing || '#888') : current ? (slot.accent || slot.color) : slot.color;
        const lift = (1 - p) * size * 0.35;
        g.fillText(w.w, x, y + lift);
      }
      x += w.ww + space;
    }
  });
  g.restore();
}

// The two corner marks Qing asked for, very small, in the video's font.
export function drawCornerMarks(g, font, color) {
  g.save();
  g.font = `600 26px ${font}`;
  g.fillStyle = color;
  g.globalAlpha = 0.75;
  g.textBaseline = 'top';
  g.textAlign = 'left';
  g.fillText('@yanqingcheng', 36, 40);
  g.textAlign = 'right';
  g.fillText('∴ tollens', W - 160, 40);
  g.restore();
}

// Draw one frame: the scene, then its lyrics, then the corner marks.
export function frame(g, canvasW, t, S, scene) {
  const k = canvasW / W;
  g.setTransform(k, 0, 0, k, 0, 0);
  g.clearRect(0, 0, W, H);
  g.save();
  scene.draw(g, t, S);
  g.restore();
  const font = scene.font || 'system-ui, sans-serif';
  if (scene.lyricSlot) drawLyrics(g, t, S, scene.lyricSlot(t, S), font);
  if (scene.drawMarks) scene.drawMarks(g); else drawCornerMarks(g, font, scene.markColor || '#222');
  if (scene.debug) {
    const sec = S.section(t);
    g.save(); g.font = '24px monospace'; g.fillStyle = '#c00';
    g.fillText(`${t.toFixed(2)}s  ${sec.name}  bar ${Math.floor(S.barPos(t)) + 1}`, 36, H - 40);
    g.restore();
  }
}
