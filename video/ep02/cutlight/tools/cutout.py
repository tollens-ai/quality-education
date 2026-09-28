"""Cut the people out of a generated sheet: find its background, split it into figures, and save
each as a transparent WebP trimmed to the figure, with its feet (or its cut edge) at the bottom.

    python cutout.py <sheet.png> <out dir> <name,name,...> [--thresh 26] [--enclosed 16]
                     [--bottom 0] [--min 0.004] [--skip i,j]

Names go left to right; '-' skips a figure. A sheet with a transparent background uses its own
alpha, cleaned: the fringe tightened and stray specks dropped. Otherwise the background is found
by flooding in from the border over pixels close to the border's colour (--thresh), plus big
enclosed gaps very close to it (--enclosed). --bottom crops pixels off the foot of the sheet
(for labels). Figures under --min of the sheet's area are dropped. index.json in the out dir
records each figure's size and where the top of its head is (a fraction down from the top), for
scaling a figure by its height rather than its raised arms. Needs numpy, scipy and Pillow.
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage as ndi


def head_top(m):
    """The first row, from the top, where the figure is one solid central mass: the crown of the
    head, not a raised hand. Returns a fraction of the height."""
    h, w = m.shape
    cols = np.nonzero(m.any(0))[0]
    cx = (cols.min() + cols.max()) / 2 if len(cols) else w / 2
    span = (cols.max() - cols.min() + 1) if len(cols) else w
    for y in range(h):
        row = m[y]
        if not row.any():
            continue
        lab, n = ndi.label(row)
        for k in range(1, n + 1):
            xs = np.nonzero(lab == k)[0]
            mid = (xs.min() + xs.max()) / 2
            if xs.max() - xs.min() > span * .09 and abs(mid - cx) < span * .22:
                return y / h
    return 0.0


def main():
    args = sys.argv[1:]
    opts = {'thresh': 26.0, 'enclosed': 16.0, 'bottom': 0, 'min': .004}
    pos = []
    i = 0
    while i < len(args):
        if args[i].startswith('--'):
            opts[args[i][2:]] = float(args[i + 1])
            i += 2
        else:
            pos.append(args[i])
            i += 1
    sheet, out, names = pos[0], Path(pos[1]), pos[2].split(',')
    out.mkdir(parents=True, exist_ok=True)
    src = Image.open(sheet)
    if opts['bottom']:
        src = src.crop((0, 0, src.width, src.height - int(opts['bottom'])))
    im = src.convert('RGB')
    a = np.asarray(im).astype(np.float32)
    h, w, _ = a.shape
    given = None
    if 'A' in src.getbands():
        al = np.asarray(src.getchannel('A')).astype(np.float32) / 255
        if (al < .5).mean() > .05:
            given = al
    if given is not None:
        # The model's own matte, tightened: its soft outer fringe carries stray colour.
        fg = given > .6
        fg = ndi.binary_opening(fg, iterations=2)
    else:
        border = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
        bg = np.median(border, axis=0)
        dist = np.sqrt(((a - bg) ** 2).sum(-1))
        near = dist < opts['thresh']
        lab, n = ndi.label(near)
        edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
        back = np.isin(lab, list(edge))
        close = dist < opts['enclosed']
        lab2, n2 = ndi.label(close & ~back)
        if n2:
            sizes = ndi.sum(np.ones_like(lab2), lab2, index=np.arange(1, n2 + 1))
            big = np.arange(1, n2 + 1)[sizes > h * w * .0006]
            back |= np.isin(lab2, big)
        fg = ndi.binary_opening(~back, iterations=1)
    # Figures: the foreground's pieces, joined across small gaps; specks that stay apart dropped.
    joined = ndi.binary_dilation(fg, iterations=5)
    lab3, n3 = ndi.label(joined)
    comps = []
    for k in range(1, n3 + 1):
        m = (lab3 == k) & fg
        if m.sum() < h * w * opts['min']:
            continue
        # Within a figure, keep only pieces of some size (drop flecks of fringe).
        l4, n4 = ndi.label(m)
        if n4 > 1:
            sizes = ndi.sum(np.ones_like(l4), l4, index=np.arange(1, n4 + 1))
            keep = np.arange(1, n4 + 1)[sizes > max(60, sizes.max() * .002)]
            m = np.isin(l4, keep)
        ys, xs = np.nonzero(m)
        comps.append((xs.min(), xs.max(), ys.min(), ys.max(), m))
    comps.sort(key=lambda c: c[0])
    idx = out / 'index.json'
    index = json.loads(idx.read_text()) if idx.exists() else {}
    for j, (x0, x1, y0, y1, m) in enumerate(comps):
        name = names[j] if j < len(names) else f'{names[-1]}-{j}'
        if name == '-':
            continue
        if given is not None:
            alpha = np.clip((given - .35) / .5, 0, 1) * ndi.binary_dilation(m, iterations=1)
        else:
            alpha = ndi.gaussian_filter(m.astype(np.float32), .7)
            alpha = np.clip((alpha - .15) / .7, 0, 1)
        pad = 2
        X0, X1, Y0, Y1 = max(0, x0 - pad), min(w, x1 + pad + 1), max(0, y0 - pad), min(h, y1 + 1)
        rgba = np.dstack([a[Y0:Y1, X0:X1], alpha[Y0:Y1, X0:X1] * 255]).astype(np.uint8)
        Image.fromarray(rgba, 'RGBA').save(out / f'{name}.webp', 'WEBP', quality=90, method=6)
        top = head_top(alpha[Y0:Y1, X0:X1] > .5)
        index[name] = {'w': int(X1 - X0), 'h': int(Y1 - Y0), 'head': round(top, 4)}
        print(f'{name}: {X1 - X0}x{Y1 - Y0} head {top:.3f}')
    idx.write_text(json.dumps(index, indent=1, sort_keys=True))


if __name__ == '__main__':
    main()
