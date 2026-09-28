"""Cut the people out of a generated sheet: find its background, split it into figures, and save
each as a transparent WebP trimmed to the figure, with its feet (or its cut edge) at the bottom.

    python cutout.py <sheet.png> <out dir> <name,name,...> [--thresh 26] [--enclosed 16]
                     [--bottom 0] [--min 0.004]

(--enclosed is off by default: clothes are often the background's own cream.) [--skip i,j]

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
    opts = {'thresh': 26.0, 'enclosed': 0.0, 'bottom': 0, 'min': .004}
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
    edge_px = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    bgc = np.median(edge_px, axis=0)
    despill = 'magenta' if (bgc[0] > 200 and bgc[2] > 200 and bgc[1] < 90) else None
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
        if n2 and opts['enclosed'] > 0:
            sizes = ndi.sum(np.ones_like(lab2), lab2, index=np.arange(1, n2 + 1))
            big = np.arange(1, n2 + 1)[sizes > h * w * .0006]
            back |= np.isin(lab2, big)
        if despill == 'magenta':
            # Magenta is never in a figure: anything near it, enclosed or not, is background.
            back |= np.sqrt(((a - np.array([255., 0., 255.])) ** 2).sum(-1)) < 110
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
    # Figures that touch on the sheet come out as one: split a piece wider than --maxw (a fraction
    # of the median figure width) at its thinnest column, until none is.
    # Also split while there are fewer pieces than names: the widest first.
    maxw = opts.get('maxw', 1.45)
    changed = True
    while changed and comps:
        changed = False
        widths = sorted(c[1] - c[0] for c in comps)
        med = widths[len(widths) // 2]
        need = len(comps) < len(names)
        widest = max(range(len(comps)), key=lambda k: comps[k][1] - comps[k][0])
        for i, (x0, x1, y0, y1, m) in enumerate(comps):
            if (x1 - x0 > med * maxw and len(comps) > 1) or (need and i == widest):
                cols = m[:, x0:x1 + 1].sum(0).astype(float)
                lo, hi = int(len(cols) * .25), int(len(cols) * .75)
                cut = x0 + lo + int(np.argmin(cols[lo:hi]))
                halves = []
                for c0, c1 in ((x0, cut), (cut + 1, x1)):
                    mm = np.zeros_like(m); mm[:, c0:c1 + 1] = m[:, c0:c1 + 1]
                    halves.append(mm)
                # A piece of one figure that the straight cut left on the wrong side (a raised
                # fist over the neighbour) goes back across: each half keeps its biggest piece.
                for hi in (0, 1):
                    lab4, n4 = ndi.label(ndi.binary_dilation(halves[hi], iterations=2) & halves[hi] | halves[hi])
                    if n4 > 1:
                        sizes = ndi.sum(np.ones_like(lab4), lab4, index=np.arange(1, n4 + 1))
                        keep = int(np.argmax(sizes)) + 1
                        stray = (lab4 > 0) & (lab4 != keep)
                        halves[hi] = halves[hi] & ~stray
                        halves[1 - hi] = halves[1 - hi] | stray
                parts = []
                for mm in halves:
                    ys, xs = np.nonzero(mm)
                    if len(xs):
                        parts.append((xs.min(), xs.max(), ys.min(), ys.max(), mm))
                comps[i:i + 1] = parts
                changed = True
                break
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
        rgb = a[Y0:Y1, X0:X1].copy()
        al = alpha[Y0:Y1, X0:X1]
        if despill:
            # A chroma background bleeds into the anti-aliased edge: in a thin band round the
            # figure only, take out the background's colour (its excess over the other channel).
            inner = ndi.binary_erosion(al > .5, iterations=4)
            band = (al > 0) & ~inner
            if despill == 'magenta':
                ex = np.clip((rgb[..., 0] + rgb[..., 2]) / 2 - rgb[..., 1], 0, None)
                rgb[..., 0] = np.where(band, rgb[..., 0] - ex, rgb[..., 0])
                rgb[..., 2] = np.where(band, rgb[..., 2] - ex, rgb[..., 2])
            rgb = np.clip(rgb, 0, 255)
        rgba = np.dstack([rgb, al * 255]).astype(np.uint8)
        Image.fromarray(rgba, 'RGBA').save(out / f'{name}.webp', 'WEBP', quality=90, method=6)
        top = head_top(alpha[Y0:Y1, X0:X1] > .5)
        index[name] = {'w': int(X1 - X0), 'h': int(Y1 - Y0), 'head': round(top, 4)}
        print(f'{name}: {X1 - X0}x{Y1 - Y0} head {top:.3f}')
    idx.write_text(json.dumps(index, indent=1, sort_keys=True))


if __name__ == '__main__':
    main()
