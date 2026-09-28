"""Prepare the generated places for the film: save each as a WebP in the cast folder, and write
into its backdrops.json what the scenes need from it, as fractions of the picture:

  - a screen, a board or a sign: its rectangle, found by flooding out from a point on it;
  - a table: the line of its top edge, the median of the flood's top across the middle;
  - the sun: the centre and radius of the brightest blob in the sky;
  - and the few things set by eye (a card terminal, a clock, a counter's top edge, a door).

    python backdrops.py <places dir> <cast dir>

The places dir holds counter.png, front.png, clinic.png, school.png, wedding.png and square.png.
Writes a check image beside each, the measured boxes drawn in magenta. Needs numpy, scipy and
Pillow.
"""
import json
import sys

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

# name: (file, flood seeds {feature: (x, y, colour tolerance)}, features set by eye)
PLACES = {
    'bg-counter': ('counter.png', {}, {'terminal': [.797, .497, .865, .524], 'clock': [.518, .1226, .06], 'counterTop': .537}),
    'bg-front': ('front.png', {}, {'sign': [.123, .149, .885, .231], 'door': [.8, .6], 'pave': .62}),
    'bg-clinic': ('clinic.png', {'screen': (.5, .14, 30)}, {}),
    'bg-school': ('school.png', {'sign': (.5, .395, 22)}, {}),
    'bg-wedding': ('wedding.png', {'board': (.11, .4, 26), 'table': (.62, .83, 30)}, {}),
    'bg-square': ('square.png', {}, {}),
}


def flood(a, fx, fy, tol):
    h, w, _ = a.shape
    x, y = int(fx * w), int(fy * h)
    ref = np.median(a[max(0, y - 3):y + 4, max(0, x - 3):x + 4].reshape(-1, 3), axis=0)
    near = np.sqrt(((a - ref) ** 2).sum(-1)) < tol
    lab, _ = ndi.label(near)
    return ndi.binary_fill_holes(lab == lab[y, x])


def measure(im, seeds):
    a = np.asarray(im).astype(np.float32)
    h, w, _ = a.shape
    d = {}
    for feat, (fx, fy, tol) in seeds.items():
        m = flood(a, fx, fy, tol)
        ys, xs = np.nonzero(m)
        if feat == 'table':
            tops = np.where(m.any(0), m.argmax(0), h)
            d['tableTop'] = round(float(np.median(tops[int(w * .2):int(w * .8)])) / h, 4)
        else:
            d[feat] = [round(float(xs.min()) / w, 4), round(float(ys.min()) / h, 4), round(float(xs.max()) / w, 4), round(float(ys.max()) / h, 4)]
    return d


def sun(im):
    a = np.asarray(im).astype(np.float32)
    h, w, _ = a.shape
    lum = (a @ np.array([.2126, .7152, .0722]))[: h // 2]
    lab, n = ndi.label(lum >= np.percentile(lum, 99.8))
    sizes = ndi.sum(np.ones_like(lab), lab, index=np.arange(1, n + 1))
    ys, xs = np.nonzero(lab == int(np.argmax(sizes)) + 1)
    return [round(float(xs.mean()) / w, 4), round(float(ys.mean()) / h, 4), round(float(max(np.ptp(xs), np.ptp(ys))) / 2 / h, 4)]


def main(src, out):
    bk = {}
    for name, (fn, seeds, byEye) in PLACES.items():
        im = Image.open(f'{src}/{fn}').convert('RGB')
        feat = {**byEye, **measure(im, seeds)}
        if name == 'bg-square':
            feat['sun'] = sun(im)
        im.save(f'{out}/{name}.webp', 'WEBP', quality=88, method=6)
        bk[name] = {'w': im.width, 'h': im.height, 'feat': feat}
        ck = im.copy()
        dr = ImageDraw.Draw(ck)
        for r in feat.values():
            if isinstance(r, list) and len(r) == 4:
                dr.rectangle([r[0] * im.width, r[1] * im.height, r[2] * im.width, r[3] * im.height], outline=(255, 0, 255), width=5)
        ck.thumbnail((330, 600))
        ck.save(f'{src}/check-{name}.png')
        print(name, im.size, feat)
    with open(f'{out}/backdrops.json', 'w') as f:
        json.dump(bk, f, indent=1)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
