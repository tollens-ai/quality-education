"""Find the blank things a cut-out holds up (a phone's screen, a card, a board, a sheet of paper)
so the scenes can draw on them: the largest near-even light patch inside the figure, as its
corners, fractions of the image. Adds 'blank' to the figure's entry in index.json.

    python blanks.py <cast dir> <figure,figure,...> [ymax 1.0] [evenness 7]

ymax limits the search to the top part of the figure (a board held above a white skirt);
evenness is the most local variation a blank may have (raise it for ruled paper).

Needs numpy, scipy and Pillow.
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage as ndi


def blank_of(path, ymax=1.0, vmax=7.0):
    im = Image.open(path).convert('RGBA')
    a = np.asarray(im).astype(np.float32)
    rgb, al = a[..., :3], a[..., 3]
    h, w = al.shape
    inside = al > 200
    lum = rgb @ np.array([.2126, .7152, .0722])
    # Light, even and unsaturated: a blank surface, not skin or a white dress's folds.
    sat = rgb.max(-1) - rgb.min(-1)
    light = inside & (lum > 170) & (sat < 40)
    # Evenness: little local variation.
    var = ndi.generic_filter(lum, np.std, size=5)
    flat = light & (var < vmax)
    flat[int(h * ymax):] = False
    flat = ndi.binary_opening(flat, iterations=2)
    lab, n = ndi.label(flat)
    if not n:
        return None
    best, score = None, 0
    for k in range(1, n + 1):
        m = lab == k
        area = m.sum()
        if area < h * w * .004:
            continue
        ys, xs = np.nonzero(m)
        bw, bh = np.ptp(xs) + 1, np.ptp(ys) + 1
        fill = area / (bw * bh)          # how rectangular it is
        if fill < .72:
            continue
        s = area * fill
        if s > score:
            best, score = m, s
    if best is None:
        return None
    best = ndi.binary_fill_holes(best)
    ys, xs = np.nonzero(best)
    c = {}
    for name, key in [('tl', xs + ys), ('tr', -xs + ys), ('bl', xs - ys), ('br', -xs - ys)]:
        i = np.argmin(key)
        c[name] = [round(float(xs[i]) / w, 4), round(float(ys[i]) / h, 4)]
    return {'box': [round(float(xs.min()) / w, 4), round(float(ys.min()) / h, 4), round(float(xs.max()) / w, 4), round(float(ys.max()) / h, 4)], 'corners': c}


def main():
    d, names = Path(sys.argv[1]), sys.argv[2].split(',')
    ymax = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0
    vmax = float(sys.argv[4]) if len(sys.argv) > 4 else 7.0
    idx_p = d / 'index.json'
    idx = json.loads(idx_p.read_text())
    for n in names:
        b = blank_of(d / f'{n}.webp', ymax, vmax)
        if b:
            idx[n]['blank'] = b
        print(n, b)
    idx_p.write_text(json.dumps(idx, indent=1, sort_keys=True))


if __name__ == '__main__':
    main()
