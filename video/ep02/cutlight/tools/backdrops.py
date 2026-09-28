"""Prepare the generated backdrops for the film: save each as a WebP in cast/, and measure what
the scenes need from them, into cast/backdrops.json (all in the image's own pixels):

  - a sign board's rectangle, found by flooding out from a point on it (to letter it);
  - an occluder: the part of a picture that stands in front of people (the wedding table), found
    by flooding the tablecloth from a point on it, saved as its own cut-out;
  - the sun: the centre of the brightest blob in the sky.

    python backdrops.py <cast sheets dir> <out dir>

Needs numpy, scipy and Pillow.
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage as ndi


def flood(a, seed, tol):
    """The connected region round seed (x, y as fractions) within tol of the seed's colour."""
    h, w, _ = a.shape
    x, y = int(seed[0] * w), int(seed[1] * h)
    ref = np.median(a[max(0, y - 3):y + 4, max(0, x - 3):x + 4].reshape(-1, 3), axis=0)
    near = np.sqrt(((a - ref) ** 2).sum(-1)) < tol
    lab, _ = ndi.label(near)
    return lab == lab[y, x]


def box(m):
    ys, xs = np.nonzero(m)
    return [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]


def main():
    src, out = Path(sys.argv[1]), Path(sys.argv[2])
    out.mkdir(parents=True, exist_ok=True)
    info = {}
    jobs = {
        'bg-bakery': ('j12/bakery-front.png', {'sign': ((.5, .125), 34)}),
        'bg-school': ('j13/school-front.png', {'sign': ((.5, .378), 30)}),
        'bg-wedding': ('j19/wedding-reception-2.png', {'table': (((.5, .86), (.5, .65), (.25, .66), (.75, .66), (.12, .72), (.88, .72)), 40)}),
        'bg-square': ('j15/town-square.png', {'sun': True}),
        'bg-clinic': ('j18/clinic-room.png', {'screen': ((.5, .26), 30)}),
    }
    for name, (path, want) in jobs.items():
        p = src / path
        if not p.exists():
            print('missing', p)
            continue
        im = Image.open(p).convert('RGB')
        a = np.asarray(im).astype(np.float32)
        h, w, _ = a.shape
        im.save(out / f'{name}.webp', 'WEBP', quality=88, method=6)
        d = {'w': w, 'h': h}
        for k, v in want.items():
            if k in ('sign', 'screen'):
                m = ndi.binary_fill_holes(flood(a, v[0], v[1]))
                d[k] = box(m)
            elif k == 'table':
                # The cloth's skirt and its top, each flooded from points on it, joined across
                # the ink line between them; what stands on the top fills in as holes.
                m = np.zeros((h, w), bool)
                for sd in v[0]:
                    m |= flood(a, sd, v[1])
                m = ndi.binary_closing(m, iterations=4)
                m = ndi.binary_fill_holes(m)
                m = ndi.binary_opening(m, iterations=2)
                lab, n = ndi.label(m)
                m = lab == lab[int(v[0][0][1] * h), int(v[0][0][0] * w)]
                # Everything below the table's top edge is table (its skirt), all the way down.
                tops = np.where(m.any(0), m.argmax(0), h)
                m = np.arange(h)[:, None] >= tops[None, :]
                alpha = np.clip(ndi.gaussian_filter(m.astype(np.float32), 1.2) * 1.4 - .2, 0, 1)
                x0, y0, x1, y1 = box(m)
                rgba = np.dstack([a, alpha * 255]).astype(np.uint8)[y0:y1 + 1, x0:x1 + 1]
                Image.fromarray(rgba, 'RGBA').save(out / f'{name}-table.webp', 'WEBP', quality=90, method=6)
                # The table's far edge, as a curve: its top in each tenth of the width.
                edge = []
                for i in range(11):
                    x = min(w - 1, int(i / 10 * (w - 1)))
                    col = np.nonzero(m[:, x])[0]
                    edge.append([x, int(col.min()) if len(col) else h])
                d['table'] = {'box': [x0, y0, x1, y1], 'edge': edge}
            elif k == 'sun':
                lum = a @ np.array([.2126, .7152, .0722])
                sky = lum[: int(h * .6)]
                thr = np.percentile(sky, 99.7)
                m = sky >= thr
                lab, n = ndi.label(m)
                sizes = ndi.sum(np.ones_like(lab), lab, index=np.arange(1, n + 1))
                big = int(np.argmax(sizes)) + 1
                ys, xs = np.nonzero(lab == big)
                d['sun'] = [int(xs.mean()), int(ys.mean()), int(max(np.ptp(xs), np.ptp(ys)) / 2)]
        info[name] = d
        print(name, d)
    (out / 'backdrops.json').write_text(json.dumps(info, indent=1))


if __name__ == '__main__':
    main()
